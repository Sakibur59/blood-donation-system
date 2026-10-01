'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import Link from 'next/link';
import {
  FaPlus, FaClipboardList, FaCheckCircle, FaClock,
  FaTint, FaHospital, FaPaperPlane, FaTimes,
  FaUserMd, FaChartLine, FaArrowRight, FaUsers
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function HospitalDashboardContent() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    fulfilledRequests: 0,
    cancelledRequests: 0,
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    quantity: 1,
    hospital: user?.name || '',
    contact: user?.phone || '',
    urgency: 'normal',
    notes: '',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchData();
    };

    socket.on('requestFulfilled', handleUpdate);
    socket.on('requestUpdated', handleUpdate);

    return () => {
      socket.off('requestFulfilled', handleUpdate);
      socket.off('requestUpdated', handleUpdate);
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');

      const res = await axios.get(`${API_URL}/hospital/my-requests`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      const reqs = res.data.requests || [];
      setRequests(reqs);

      setStats({
        totalRequests: reqs.length,
        pendingRequests: reqs.filter(r => r.status === 'pending').length,
        fulfilledRequests: reqs.filter(r => r.status === 'fulfilled').length,
        cancelledRequests: reqs.filter(r => r.status === 'cancelled').length,
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formData.bloodGroup) {
      toast.error('Please select a blood group');
      return;
    }

    try {
      setSubmitting(true);
      const storedToken = localStorage.getItem('token');

      const res = await axios.post(
        `${API_URL}/hospital/request`,
        formData,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      toast.success(res.data.message || 'Blood request created successfully!');
      setIsModalOpen(false);
      setFormData({
        patientName: '',
        bloodGroup: '',
        quantity: 1,
        hospital: user?.name || '',
        contact: user?.phone || '',
        urgency: 'normal',
        notes: '',
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      const storedToken = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/hospital/request/${id}`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      toast.success('Request cancelled');
      fetchData();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <GiBlood className="w-12 h-12 text-blue-600 blood-drop-animation mx-auto mb-4" />
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <FaHospital className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              🏥 {user?.name}
            </h1>
            <p className="text-blue-100 mb-5">
              Manage blood requests for your patients and connect with donors
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <FaPlus />
                <span>New Blood Request</span>
              </button>
              <Link
                href="/hospital/donors"
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                <FaUsers />
                <span>Find Donors</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalRequests}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FaClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Fulfilled</p>
                <p className="text-3xl font-bold text-green-600">{stats.fulfilledRequests}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cancelled</p>
                <p className="text-3xl font-bold text-red-600">{stats.cancelledRequests}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FaTimes className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaClipboardList className="text-blue-600" />
              Recent Blood Requests
            </h2>
            <Link
              href="/hospital/my-requests"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FaTint className="w-16 h-16 text-blue-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No requests yet</p>
                <p className="text-sm text-gray-400 mb-4">Create your first blood request</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-secondary"
                >
                  <FaPlus className="w-4 h-4" />
                  Create Request
                </button>
              </div>
            ) : (
              requests.slice(0, 5).map((request) => (
                <div
                  key={request._id}
                  className="border rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-gray-800">
                          {request.patientName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          request.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                          request.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {request.urgency}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Blood:</span>
                          <span className="font-bold text-red-600 ml-1">{request.bloodGroup}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <span className="font-medium ml-1">{request.quantity} unit</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <span className="font-medium ml-1">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {request.donor && (
                          <div>
                            <span className="text-gray-500">Donor:</span>
                            <span className="font-medium ml-1 text-green-600">
                              {request.donor.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleCancelRequest(request._id)}
                        className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/hospital/request"
            className="card hover:border-blue-300 text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FaPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">New Request</h3>
            <p className="text-sm text-gray-500">Create a blood request</p>
          </Link>

          <Link
            href="/hospital/my-requests"
            className="card hover:border-blue-300 text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FaClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">My Requests</h3>
            <p className="text-sm text-gray-500">View all requests</p>
          </Link>

          <Link
            href="/hospital/donors"
            className="card hover:border-blue-300 text-center group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Find Donors</h3>
            <p className="text-sm text-gray-500">Search for donors</p>
          </Link>
        </div>
      </div>

      {/* Create Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Blood Request"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="input-label">Patient Name *</label>
            <input
              type="text"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="input-field"
              placeholder="Enter patient name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Blood Group *</label>
              <select
                required
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="select-field"
              >
                <option value="">Select</option>
                {bloodGroups.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Quantity (Units) *</label>
              <input
                type="number"
                required
                min="1"
                max="10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Contact Number *</label>
            <input
              type="tel"
              required
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="input-field"
              placeholder="Enter contact number"
            />
          </div>

          <div>
            <label className="input-label">Urgency Level</label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              className="select-field"
            >
              <option value="normal">🟢 Normal</option>
              <option value="urgent">🟠 Urgent</option>
              <option value="emergency">🔴 Emergency</option>
            </select>
          </div>

          <div>
            <label className="input-label">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Any additional information"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4" />
                  <span>Create Request</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default function HospitalDashboard() {
  return (
    <RoleGuard allowedRole="hospital">
      <HospitalDashboardContent />
    </RoleGuard>
  );
}