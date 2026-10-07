'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import {
  FaHospital, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaClock, FaSearch, FaTint, FaCheckCircle,
  FaTimes, FaFilter, FaSpinner, FaPaperPlane,
  FaExclamationTriangle, FaBoxOpen
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function HospitalBloodBanksContent() {
  const { user, token } = useAuth();
  const [bloodBanks, setBloodBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    filterBanks();
  }, [searchTerm, selectedBloodGroup, showAvailableOnly, bloodBanks]);

  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/blood-banks`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setBloodBanks(res.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load blood banks');
      setBloodBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBanks = () => {
    let filtered = [...bloodBanks];

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBloodGroup) {
      filtered = filtered.filter(b => 
        b.bloodGroups && (b.bloodGroups[selectedBloodGroup] || 0) > 0
      );
    }

    if (showAvailableOnly) {
      filtered = filtered.filter(b => 
        b.bloodGroups && Object.values(b.bloodGroups).some(v => v > 0)
      );
    }

    setFilteredBanks(filtered);
  };

  const getStockStatus = (bank) => {
    if (!bank.bloodGroups) return { label: 'Unknown', color: 'gray' };
    
    const total = Object.values(bank.bloodGroups).reduce((a, b) => a + b, 0);
    if (total === 0) return { label: 'Empty', color: 'red' };
    if (total < 20) return { label: 'Low', color: 'yellow' };
    return { label: 'Available', color: 'green' };
  };

  const handleContact = (bank) => {
    setSelectedBank(bank);
    setIsModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBloodGroup('');
    setShowAvailableOnly(false);
  };

  const getStockColor = (count) => {
    if (count === 0) return 'bg-gray-100 text-gray-400';
    if (count < 5) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <FaHospital className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
              🏦 Blood Banks
            </h1>
            <p className="text-blue-100">
              Find nearby blood banks with available stock for your patients
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search blood bank by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="select-field"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(g => (
                <option key={g} value={g}>Has {g}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium mr-2">Filter:</span>
            <button
              onClick={() => {
                setSelectedBloodGroup('');
                setShowAvailableOnly(false);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedBloodGroup && !showAvailableOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
              }`}
            >
              All Banks
            </button>
            <button
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                showAvailableOnly
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
              }`}
            >
              <FaCheckCircle className="w-3 h-3" />
              Has Stock
            </button>
            {(searchTerm || selectedBloodGroup || showAvailableOnly) && (
              <button
                onClick={clearFilters}
                className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <FaTimes className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-blue-600">{filteredBanks.length}</span> blood banks found
            </p>
            <button
              onClick={fetchBloodBanks}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              {loading ? <FaSpinner className="animate-spin" /> : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Blood Banks Grid */}
        {loading ? (
          <div className="card text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredBanks.length === 0 ? (
          <div className="card text-center py-16">
            <FaBoxOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {bloodBanks.length === 0 ? 'No blood banks registered' : 'No blood banks match filters'}
            </h3>
            <p className="text-gray-500 mb-4">
              {bloodBanks.length === 0 
                ? 'Blood banks will appear here once registered' 
                : 'Try different filters'}
            </p>
            {bloodBanks.length > 0 && (
              <button onClick={clearFilters} className="btn-secondary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredBanks.map((bank, index) => {
              const status = getStockStatus(bank);
              const statusColors = {
                green: 'bg-green-100 text-green-700',
                yellow: 'bg-yellow-100 text-yellow-700',
                red: 'bg-red-100 text-red-700',
                gray: 'bg-gray-100 text-gray-700',
              };
              
              return (
                <motion.div
                  key={bank._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="card hover:border-blue-300 group"
                >
                  {/* Bank Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <FaHospital className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg truncate">
                          {bank.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <FaMapMarkerAlt className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{bank.address || 'Location not set'}</span>
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status.color]} flex-shrink-0`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Blood Stock Grid */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Blood Stock
                      </p>
                      <p className="text-xs text-gray-400">Units available</p>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {bloodGroups.map(group => {
                        const count = bank.bloodGroups?.[group] || 0;
                        return (
                          <div
                            key={group}
                            className={`text-center p-2 rounded-lg text-xs font-medium transition-all ${getStockColor(count)} ${
                              selectedBloodGroup === group ? 'ring-2 ring-blue-500' : ''
                            }`}
                          >
                            <div className="font-bold">{group}</div>
                            <div className="text-[11px] mt-0.5">{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 py-3 border-t border-b">
                    {bank.contact && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaPhone className="w-3.5 h-3.5 text-blue-500" />
                        <span>{bank.contact}</span>
                      </div>
                    )}
                    {bank.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaEnvelope className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate">{bank.email}</span>
                      </div>
                    )}
                    {bank.workingHours && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaClock className="w-3.5 h-3.5 text-blue-500" />
                        <span>{bank.workingHours}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {bank.contact && (
                      <a
                        href={`tel:${bank.contact}`}
                        className="flex-1 py-2 bg-blue-100 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <FaPhone className="w-3 h-3" />
                        Call
                      </a>
                    )}
                    <button
                      onClick={() => handleContact(bank)}
                      className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <FaPaperPlane className="w-3 h-3" />
                      Contact
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBank(null);
        }}
        title="Contact Blood Bank"
      >
        {selectedBank && (
          <div className="space-y-4">
            {/* Bank Info */}
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <FaHospital className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {selectedBank.name}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  {selectedBank.address}
                </p>
              </div>
            </div>

            {/* Stock Summary */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-600 mb-2">Available Stock</p>
              <div className="flex flex-wrap gap-1.5">
                {bloodGroups.map(group => {
                  const count = selectedBank.bloodGroups?.[group] || 0;
                  return (
                    <span
                      key={group}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        count > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {group}: {count}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Contact Options */}
            <div className="space-y-3">
              {selectedBank.contact && (
                <a
                  href={`tel:${selectedBank.contact}`}
                  className="flex items-center space-x-3 p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-300 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <FaPhone className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Call</p>
                    <p className="font-semibold text-gray-800">{selectedBank.contact}</p>
                  </div>
                </a>
              )}

              {selectedBank.email && (
                <a
                  href={`mailto:${selectedBank.email}`}
                  className="flex items-center space-x-3 p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-300 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <FaEnvelope className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800 break-all">{selectedBank.email}</p>
                  </div>
                </a>
              )}
            </div>

            {/* Info */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 flex items-start gap-2">
                <FaExclamationTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>
                  Contact the blood bank directly for emergency blood. Mention your hospital name and patient details.
                </span>
              </p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default function HospitalBloodBanks() {
  return (
    <RoleGuard allowedRole="hospital">
      <HospitalBloodBanksContent />
    </RoleGuard>
  );
}