'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import ChatWidget from '../../components/ChatWidget';
import Modal from '../../components/Modal';
import { GiBlood } from 'react-icons/gi';
import { 
  FaHeart, FaClock, FaCheckCircle, FaHospital, 
  FaHandHoldingHeart, FaTrophy, FaCalendarCheck, FaTint
} from 'react-icons/fa';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function DonorDashboardContent() {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    totalDonations: 0,
    lastDonation: null,
    nextEligibleDate: null,
    bloodGroups: {}
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchData();
    }
  }, [user, token]);

  // Real-time new blood request notification
  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = (request) => {
      toast.success(`🩸 New ${request.bloodGroup} blood request!`, {
        duration: 6000,
        icon: '🩸',
      });
      fetchData();
    };

    const handleRequestUpdate = () => {
      fetchData();
    };

    socket.on('newBloodRequest', handleNewRequest);
    socket.on('requestFulfilled', handleRequestUpdate);
    socket.on('requestUpdated', handleRequestUpdate);

    return () => {
      socket.off('newBloodRequest', handleNewRequest);
      socket.off('requestFulfilled', handleRequestUpdate);
      socket.off('requestUpdated', handleRequestUpdate);
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // ✅ Donor-specific endpoints use করুন
      const [statsRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/donor/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/donor/pending-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsRes.data);
      setRequests(requestsRes.data.requests || []);
    } catch (error) {
      console.error('Fetch error:', error);
      
      // Error message handle
      if (error.response?.status === 403) {
        toast.error('Access denied. Please login again.');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login.');
      } else {
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillRequest = async (requestId) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      
      await axios.put(
        `${API_URL}/hospital/request/${requestId}/fulfill`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Blood request fulfilled! You saved a life ❤️', {
        duration: 5000,
        icon: '🎉',
      });
      
      setIsModalOpen(false);
      setSelectedRequest(null);
      fetchData();
    } catch (error) {
      console.error('Fulfill error:', error);
      toast.error(error.response?.data?.error || 'Failed to fulfill request');
    } finally {
      setProcessing(false);
    }
  };

  const canDonate = () => {
    if (!stats.lastDonation) return true;
    const nextDate = new Date(stats.lastDonation);
    nextDate.setDate(nextDate.getDate() + 90);
    return nextDate <= new Date();
  };

  const getNextEligibleDate = () => {
    if (!stats.lastDonation) return null;
    const nextDate = new Date(stats.lastDonation);
    nextDate.setDate(nextDate.getDate() + 90);
    return nextDate;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <GiBlood className="w-12 h-12 text-red-600 blood-drop-animation mx-auto mb-4" />
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <GiBlood className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.name}! 🩸
            </h1>
            <p className="text-red-100">
              {canDonate() 
                ? "You're eligible to donate blood. Save a life today!" 
                : `Next eligible date: ${getNextEligibleDate()?.toLocaleDateString() || 'N/A'}`
              }
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.totalDonations || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <GiBlood className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {user?.bloodGroup || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FaHeart className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Lives Saved</p>
                <p className="text-3xl font-bold text-green-600">
                  {(stats.totalDonations || 0) * 3}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FaTrophy className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className={`text-lg font-bold ${
                  canDonate() ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {canDonate() ? '✅ Eligible' : '⏳ Wait'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FaCalendarCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Blood Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              🩸 Pending Blood Requests
            </h2>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {requests.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FaCheckCircle className="w-16 h-16 text-green-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">All caught up!</p>
                <p className="text-sm text-gray-400">No pending blood requests</p>
              </div>
            ) : (
              requests.map((request) => (
                <div 
                  key={request._id} 
                  className="border rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800">
                          {request.patientName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          request.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                          request.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {request.urgency || 'normal'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Blood:</span>
                          <span className="font-bold text-red-600 ml-1">
                            {request.bloodGroup}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <span className="font-medium ml-1">
                            {request.quantity} unit
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Hospital:</span>
                          <span className="font-medium ml-1">
                            {request.hospital || request.hospitalInfo?.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Contact:</span>
                          <span className="font-medium ml-1">
                            {request.contact}
                          </span>
                        </div>
                      </div>
                      {request.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">
                          📝 {request.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsModalOpen(true);
                      }}
                      disabled={!canDonate()}
                      className="btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {canDonate() ? 'Help Now' : 'Not Eligible'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/donor/donate"
            className="card hover:border-red-300 text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FaHandHoldingHeart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Donate Blood</h3>
            <p className="text-sm text-gray-500">Record a new donation</p>
          </Link>

          <Link 
            href="/donor/my-donations"
            className="card hover:border-red-300 text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FaClock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">My Donations</h3>
            <p className="text-sm text-gray-500">View donation history</p>
          </Link>

          <Link 
            href="/donor/blood-banks"
            className="card hover:border-red-300 text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FaHospital className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Blood Banks</h3>
            <p className="text-sm text-gray-500">Find nearby blood banks</p>
          </Link>
        </div>
      </div>

      {/* Fulfill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        title="Confirm Donation"
      >
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="font-semibold text-gray-800 mb-3">
              Patient: {selectedRequest?.patientName}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                Blood: 
                <span className="font-bold text-red-600 ml-1">
                  {selectedRequest?.bloodGroup}
                </span>
              </p>
              <p>
                Quantity: 
                <span className="font-semibold ml-1">
                  {selectedRequest?.quantity} unit
                </span>
              </p>
              <p>
                Hospital: 
                <span className="font-medium ml-1">
                  {selectedRequest?.hospital || selectedRequest?.hospitalInfo?.name}
                </span>
              </p>
              <p>
                Contact: 
                <span className="font-medium ml-1">
                  {selectedRequest?.contact}
                </span>
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center">
            Are you sure you want to fulfill this request?
          </p>

          <div className="flex space-x-3">
            <button
              onClick={() => handleFulfillRequest(selectedRequest?._id)}
              disabled={processing}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FaHandHoldingHeart className="w-4 h-4" />
                  <span>Confirm Donation</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedRequest(null);
              }}
              disabled={processing}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* 💬 Floating Chat */}
      <ChatWidget />
    </DashboardLayout>
  );
}

export default function DonorDashboard() {
  return (
    <RoleGuard allowedRole="donor">
      <DonorDashboardContent />
    </RoleGuard>
  );
}