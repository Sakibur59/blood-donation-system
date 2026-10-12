'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import {
  FaSearch, FaHistory, FaCheckCircle, FaTint,
  FaFilter, FaUser, FaHospital, FaCalendarAlt,
  FaHeart, FaAward
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function AdminDonationsContent() {
  const { token } = useAuth();
  const { socket } = useSocket();
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchDonations();
    socket.on('newDonation', handleUpdate);
    return () => socket.off('newDonation', handleUpdate);
  }, [socket]);

  useEffect(() => {
    filterDonations();
  }, [donations, searchTerm, bloodGroupFilter]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/donations`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setDonations(res.data.donations || []);
    } catch (error) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = [...donations];
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.bloodBankName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (bloodGroupFilter) filtered = filtered.filter(d => d.bloodGroup === bloodGroupFilter);
    setFilteredDonations(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setBloodGroupFilter('');
  };

  const hasFilters = searchTerm || bloodGroupFilter;

  const totalUnits = donations.reduce((sum, d) => sum + (d.quantity || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <GiBlood className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-1">
              🩸 All Donations
            </h1>
            <p className="text-red-100">
              Complete history of blood donations on the platform
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Donations</p>
                <p className="text-2xl font-bold text-red-600">{donations.length}</p>
              </div>
              <GiBlood className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Units</p>
                <p className="text-2xl font-bold text-blue-600">{totalUnits}</p>
              </div>
              <FaTint className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Lives Saved</p>
                <p className="text-2xl font-bold text-green-600">{totalUnits * 3}</p>
              </div>
              <FaHeart className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  {donations.filter(d => {
                    const date = new Date(d.donationDate);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <FaAward className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-red-600 w-4 h-4" />
            <h2 className="font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search donor or blood bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="select-field"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          {hasFilters && (
            <div className="mt-3 pt-3 border-t flex justify-between items-center">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-red-600">{filteredDonations.length}</span> results
              </p>
              <button onClick={clearFilters} className="text-red-600 hover:text-red-700 text-sm font-medium">
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Donations List */}
        {loading ? (
          <div className="card text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="card text-center py-16">
            <GiBlood className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No donations yet</h3>
            <p className="text-gray-500">Donations will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredDonations.map((donation, index) => (
                <motion.div
                  key={donation._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="card hover:border-red-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Blood Group */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                      {donation.bloodGroup}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-800">
                          {donation.donorName || 'Anonymous'}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                          <FaCheckCircle className="w-3 h-3" />
                          {donation.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaHospital className="w-3 h-3 text-gray-400" />
                          {donation.bloodBankName}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaTint className="w-3 h-3 text-red-400" />
                          {donation.quantity} unit
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                          {new Date(donation.donationDate).toLocaleDateString()}
                        </span>
                      </div>
                      {donation.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">📝 {donation.notes}</p>
                      )}
                    </div>

                    {/* Lives Badge */}
                    <div className="text-center flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <FaHeart className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {donation.quantity * 3} lives
                      </p>
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

export default function AdminDonationsPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminDonationsContent />
    </RoleGuard>
  );
}