'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import {
  FaSearch, FaClipboardList, FaCheckCircle, FaClock,
  FaTimes, FaFilter, FaHospital, FaUser, FaTint,
  FaCalendarAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function AdminRequestsContent() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchRequests();
    socket.on('newBloodRequest', handleUpdate);
    socket.on('requestFulfilled', handleUpdate);
    socket.on('requestUpdated', handleUpdate);
    return () => {
      socket.off('newBloodRequest', handleUpdate);
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
      const res = await axios.get(`${API_URL}/admin/requests`, {
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

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setBloodGroupFilter('');
    setUrgencyFilter('');
  };

  const getStatusBadge = (status) => {
    return {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      fulfilled: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    }[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgencyBadge = (urgency) => {
    return {
      emergency: 'bg-red-100 text-red-800 border-red-200',
      urgent: 'bg-orange-100 text-orange-800 border-orange-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
    }[urgency] || 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const hasFilters = searchTerm || statusFilter || bloodGroupFilter || urgencyFilter;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <FaClipboardList className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-1">
              📋 All Blood Requests
            </h1>
            <p className="text-purple-100">
              Monitor all blood requests across the platform
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-indigo-600">{requests.length}</p>
              </div>
              <FaClipboardList className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <FaClock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Fulfilled</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'fulfilled').length}
                </p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Emergency</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.urgency === 'emergency').length}
                </p>
              </div>
              <FaExclamationTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-purple-600 w-4 h-4" />
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
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field">
              <option value="">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="fulfilled">✅ Fulfilled</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
            <select value={bloodGroupFilter} onChange={(e) => setBloodGroupFilter(e.target.value)} className="select-field">
              <option value="">All Blood Groups</option>
              {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} className="select-field">
              <option value="">All Urgency</option>
              <option value="normal">🟢 Normal</option>
              <option value="urgent">🟠 Urgent</option>
              <option value="emergency">🔴 Emergency</option>
            </select>
          </div>
          {hasFilters && (
            <div className="mt-3 pt-3 border-t flex justify-between items-center">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-purple-600">{filteredRequests.length}</span> results
              </p>
              <button onClick={clearFilters} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="card text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="card text-center py-16">
            <FaClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No requests found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence>
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="card hover:border-purple-300 transition-colors"
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="flex-1 min-w-[280px]">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                          {request.bloodGroup}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{request.patientName}</h3>
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

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-gray-50 rounded-xl p-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Blood</p>
                          <p className="font-bold text-red-600">{request.bloodGroup}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Quantity</p>
                          <p className="font-medium">{request.quantity} unit</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Hospital</p>
                          <p className="font-medium truncate">{request.hospital || request.hospitalInfo?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            {request.donor ? 'Donor' : 'Contact'}
                          </p>
                          <p className={`font-medium truncate ${request.donor ? 'text-green-600' : ''}`}>
                            {request.donor ? request.donor.name : request.contact}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AdminRequestsPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminRequestsContent />
    </RoleGuard>
  );
}