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
  FaHandHoldingHeart, FaTrophy, FaCalendarCheck, FaCalendarPlus
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

  // 📅 Appointment State
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [apptData, setApptData] = useState({ bloodBankId: '', date: '', timeSlot: '10:00 AM' });
  const [bookingAppt, setBookingAppt] = useState(false);

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

  // 📅 Appointment Functions
  const openApptModal = async () => {
    setIsApptModalOpen(true);
    try {
      const res = await axios.get(`${API_URL}/blood-banks`, { headers: { Authorization: `Bearer ${token}` } });
      setBloodBanks(res.data || []);
    } catch (error) {
      toast.error('Failed to load blood banks');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      setBookingAppt(true);
      await axios.post(`${API_URL}/appointments`, apptData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Appointment booked successfully! Blood bank will confirm.');
      setIsApptModalOpen(false);
      setApptData({ bloodBankId: '', date: '', timeSlot: '10:00 AM' });
    } catch (error) {
      toast.error('Failed to book appointment');
    } finally {
      setBookingAppt(false);
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <GiBlood className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex-1">
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
          {/* 📅 Appointment Button */}
          <button onClick={openApptModal} className="relative z-10 bg-white text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105 whitespace-nowrap">
            <FaCalendarPlus /> Book Appointment
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.totalDonations || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <GiBlood className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Blood Group</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {user?.bloodGroup || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <FaHeart className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Lives Saved</p>
                <p className="text-3xl font-bold text-green-600">
                  {(stats.totalDonations || 0) * 3}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FaTrophy className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <p className={`text-lg font-bold ${
                  canDonate() ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {canDonate() ? '✅ Eligible' : '⏳ Wait'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FaCalendarCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Blood Requests */}
        <div className="card dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              🩸 Pending Blood Requests
            </h2>
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
              {requests.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FaCheckCircle className="w-16 h-16 text-green-300 dark:text-green-900 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">All caught up!</p>
                <p className="text-sm text-gray-400">No pending blood requests</p>
              </div>
            ) : (
              requests.map((request) => (
                <div 
                  key={request._id} 
                  className="border dark:border-gray-700 rounded-xl p-4 hover:border-red-300 dark:hover:border-red-500 hover:shadow-md transition-all dark:bg-gray-900"
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {request.patientName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          request.urgency === 'emergency' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                          request.urgency === 'urgent' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                        }`}>
                          {request.urgency || 'normal'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                          request.status === 'fulfilled' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <span className="text-gray-500 dark:text-gray-500">Blood:</span>
                          <span className="font-bold text-red-600 ml-1">
                            {request.bloodGroup}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-500">Quantity:</span>
                          <span className="font-medium ml-1">
                            {request.quantity} unit
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-500">Hospital:</span>
                          <span className="font-medium ml-1">
                            {request.hospital || request.hospitalInfo?.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-500">Contact:</span>
                          <span className="font-medium ml-1">
                            {request.contact}
                          </span>
                        </div>
                      </div>
                      {request.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
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
            className="card hover:border-red-300 dark:hover:border-red-500 dark:bg-gray-800 dark:border-gray-700 text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FaHandHoldingHeart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Donate Blood</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Record a new donation</p>
          </Link>

          <Link 
            href="/donor/my-donations"
            className="card hover:border-red-300 dark:hover:border-red-500 dark:bg-gray-800 dark:border-gray-700 text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FaClock className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">My Donations</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">View donation history</p>
          </Link>

          <Link 
            href="/donor/blood-banks"
            className="card hover:border-red-300 dark:hover:border-red-500 dark:bg-gray-800 dark:border-gray-700 text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FaHospital className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Blood Banks</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Find nearby blood banks</p>
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
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900">
            <p className="font-semibold text-gray-800 dark:text-white mb-3">
              Patient: {selectedRequest?.patientName}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
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

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
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
              className="btn-outline flex-1 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* 📅 Appointment Modal */}
      <Modal isOpen={isApptModalOpen} onClose={() => setIsApptModalOpen(false)} title="Book Blood Bank Appointment">
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div>
            <label className="input-label dark:text-gray-300">Select Blood Bank</label>
            <select required value={apptData.bloodBankId} onChange={e => setApptData({...apptData, bloodBankId: e.target.value})} className="select-field dark:bg-gray-800 dark:border-gray-600 dark:text-white">
              <option value="">Choose a blood bank</option>
              {bloodBanks.map(b => <option key={b._id} value={b._id}>{b.name} - {b.address}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label dark:text-gray-300">Date</label>
            <input type="date" required value={apptData.date} onChange={e => setApptData({...apptData, date: e.target.value})} className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="input-label dark:text-gray-300">Time Slot</label>
            <select value={apptData.timeSlot} onChange={e => setApptData({...apptData, timeSlot: e.target.value})} className="select-field dark:bg-gray-800 dark:border-gray-600 dark:text-white">
              <option>10:00 AM</option>
              <option>12:00 PM</option>
              <option>02:00 PM</option>
              <option>04:00 PM</option>
            </select>
          </div>
          <button type="submit" disabled={bookingAppt} className="btn-primary w-full">{bookingAppt ? 'Booking...' : 'Confirm Appointment'}</button>
        </form>
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