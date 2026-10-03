'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import Link from 'next/link';
import {
  FaSearch, FaCheckCircle, FaTimes, FaPlus,
  FaCalendarAlt, FaExclamationTriangle,
  FaTrash, FaFilter, FaClipboardList
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function MyRequestsContent() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  // ✅ Cancel modal state
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    requestId: null,
    patientName: '',
    bloodGroup: '',
    quantity: 0,
  });
  const [cancelling, setCancelling] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchRequests();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchRequests();
    socket.on('requestFulfilled', handleUpdate);
    socket.on('requestUpdated', handleUpdate);

    return () => {
      socket.off('requestFulfilled', handleUpdate);
      socket.off('requestUpdated', handleUpdate);
    };
  }, [socket]);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter, bloodGroupFilter, urgencyFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/hospital/my-requests`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setRequests(res.data.requests || []);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.hospital?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) filtered = filtered.filter(r => r.status === statusFilter);
    if (bloodGroupFilter) filtered = filtered.filter(r => r.bloodGroup === bloodGroupFilter);
    if (urgencyFilter) filtered = filtered.filter(r => r.urgency === urgencyFilter);

    setFilteredRequests(filtered);
  };

  // ✅ Open cancel modal
  const openCancelModal = (request) => {
    setCancelModal({
      isOpen: true,
      requestId: request._id,
      patientName: request.patientName,
      bloodGroup: request.bloodGroup,
      quantity: request.quantity,
    });
  };

  // ✅ Close cancel modal
  const closeCancelModal = () => {
    if (cancelling) return;
    setCancelModal({
      isOpen: false,
      requestId: null,
      patientName: '',
      bloodGroup: '',
      quantity: 0,
    });
  };

  // ✅ Confirm cancellation
  const handleCancelConfirm = async () => {
    if (!cancelModal.requestId) return;

    try {
      setCancelling(true);
      const storedToken = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/hospital/request/${cancelModal.requestId}`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      toast.success('Request cancelled successfully');
      closeCancelModal();
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setBloodGroupFilter('');
    setUrgencyFilter('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      fulfilled: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      emergency: 'bg-red-100 text-red-800 border-red-200',
      urgent: 'bg-orange-100 text-orange-800 border-orange-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return badges[urgency] || badges.normal;
  };

  const hasActiveFilters = searchTerm || statusFilter || bloodGroupFilter || urgencyFilter;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ═══ Header ═══ */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <FaClipboardList className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-1">
                📋 My Blood Requests
              </h1>
              <p className="text-blue-100">
                Manage and track all your blood requests
              </p>
            </div>
            <Link
              href="/hospital/request"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <FaPlus className="w-4 h-4" />
              New Request
            </Link>
          </div>
        </div>

        {/* ═══ Filters ═══ */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-blue-600 w-4 h-4" />
            <h2 className="font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient/hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field"
            >
              <option value="">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="fulfilled">✅ Fulfilled</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="select-field"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="select-field"
            >
              <option value="">All Urgency</option>
              <option value="normal">🟢 Normal</option>
              <option value="urgent">🟠 Urgent</option>
              <option value="emergency">🔴 Emergency</option>
            </select>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold text-blue-600">{filteredRequests.length}</span> of{' '}
                <span className="font-bold">{requests.length}</span> requests
              </p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <FaTimes className="w-3 h-3" />
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* ═══ Requests List ═══ */}
        {loading ? (
          <div className="card text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {requests.length === 0 ? 'No requests yet' : 'No requests match filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {requests.length === 0
                ? 'Create your first blood request to get started'
                : 'Try adjusting your filters'}
            </p>
            {requests.length === 0 && (
              <Link href="/hospital/request" className="btn-secondary inline-flex">
                <FaPlus className="w-4 h-4" />
                Create Request
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredRequests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="flex-1 min-w-[250px]">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                          {request.bloodGroup}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 text-lg">
                            {request.patientName}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                            {request.status}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyBadge(request.urgency)}`}>
                            {request.urgency}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-gray-50 rounded-xl p-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Blood Group</p>
                          <p className="font-bold text-red-600">{request.bloodGroup}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Quantity</p>
                          <p className="font-medium">{request.quantity} unit</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Contact</p>
                          <p className="font-medium">{request.contact}</p>
                        </div>
                        {request.donor ? (
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Donor</p>
                            <p className="font-medium text-green-600 flex items-center gap-1">
                              <FaCheckCircle className="w-3 h-3" />
                              {request.donor.name}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Status</p>
                            <p className="font-medium text-gray-400">Awaiting donor</p>
                          </div>
                        )}
                      </div>

                      {request.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            📝 <strong>Note:</strong> {request.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-2">
                      {request.status === 'pending' && (
                        <button
                          onClick={() => openCancelModal(request)}
                          className="px-4 py-2 text-red-600 border-2 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                        >
                          <FaTimes className="w-3 h-3" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ✅ CANCEL CONFIRMATION MODAL — সুন্দর মডাল         */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={closeCancelModal}
        title="Cancel Blood Request"
      >
        <div className="space-y-5">
          {/* Warning icon + animation */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <FaExclamationTriangle className="w-10 h-10 text-red-600" />
              </div>
              <div className="absolute inset-0 rounded-full bg-red-200 animate-ping opacity-20"></div>
            </motion.div>
          </div>

          {/* Message */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Cancel this request?
            </h3>
            <p className="text-gray-600 mb-4">
              You are about to cancel the blood request for{' '}
              <span className="font-bold text-gray-800">
                {cancelModal.patientName}
              </span>
              .
            </p>

            {/* Request details */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Blood Group</p>
                  <p className="font-bold text-red-600 text-lg">{cancelModal.bloodGroup}</p>
                </div>
                <div className="w-px h-8 bg-red-200"></div>
                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="font-bold text-gray-800 text-lg">{cancelModal.quantity} unit</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-red-600 font-medium bg-red-50 rounded-lg p-3">
              <FaExclamationTriangle className="w-4 h-4" />
              <span>This action cannot be undone</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancelConfirm}
              disabled={cancelling}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4" />
                  <span>Yes, Cancel Request</span>
                </>
              )}
            </button>

            <button
              onClick={closeCancelModal}
              disabled={cancelling}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              Keep Request
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default function MyRequestsPage() {
  return (
    <RoleGuard allowedRole="hospital">
      <MyRequestsContent />
    </RoleGuard>
  );
}