'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import {
  FaSearch, FaHospital, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaClock, FaEdit, FaTrash,
  FaPlus, FaFilter, FaExclamationTriangle,
  FaCheck, FaDatabase, FaTint, FaSave
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function AdminBloodBanksContent() {
  const { token } = useAuth();
  const [bloodBanks, setBloodBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Create/Edit modal
  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit'
    bankId: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
    email: '',
    workingHours: '9:00 AM - 6:00 PM',
    bloodGroups: {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
    },
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    bankId: null,
    bankName: '',
  });
  const [deleting, setDeleting] = useState(false);

  const bloodGroupList = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    filterBanks();
  }, [bloodBanks, searchTerm]);

  const fetchBloodBanks = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/blood-banks`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setBloodBanks(res.data.bloodBanks || []);
    } catch (error) {
      toast.error('Failed to load blood banks');
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
    setFilteredBanks(filtered);
  };

  // ═══ Create ═══
  const openCreateModal = () => {
    setFormModal({ isOpen: true, mode: 'create', bankId: null });
    setFormData({
      name: '',
      address: '',
      contact: '',
      email: '',
      workingHours: '9:00 AM - 6:00 PM',
      bloodGroups: {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
        'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
      },
    });
  };

  // ═══ Edit ═══
  const openEditModal = (bank) => {
    setFormModal({ isOpen: true, mode: 'edit', bankId: bank._id });
    setFormData({
      name: bank.name || '',
      address: bank.address || '',
      contact: bank.contact || '',
      email: bank.email || '',
      workingHours: bank.workingHours || '9:00 AM - 6:00 PM',
      bloodGroups: bank.bloodGroups || {
        'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
        'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
      },
    });
  };

  const closeFormModal = () => {
    if (submitting) return;
    setFormModal({ isOpen: false, mode: 'create', bankId: null });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const storedToken = localStorage.getItem('token');

      if (formModal.mode === 'create') {
        await axios.post(
          `${API_URL}/admin/blood-banks`,
          formData,
          { headers: { Authorization: `Bearer ${storedToken}` } }
        );
        toast.success('Blood bank created successfully');
      } else {
        await axios.put(
          `${API_URL}/admin/blood-banks/${formModal.bankId}`,
          formData,
          { headers: { Authorization: `Bearer ${storedToken}` } }
        );
        toast.success('Blood bank updated successfully');
      }

      closeFormModal();
      fetchBloodBanks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save blood bank');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBloodGroupChange = (group, value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setFormData(prev => ({
      ...prev,
      bloodGroups: {
        ...prev.bloodGroups,
        [group]: numValue,
      },
    }));
  };

  // ═══ Delete ═══
  const openDeleteModal = (bank) => {
    setDeleteModal({
      isOpen: true,
      bankId: bank._id,
      bankName: bank.name,
    });
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ isOpen: false, bankId: null, bankName: '' });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.bankId) return;

    try {
      setDeleting(true);
      const storedToken = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/blood-banks/${deleteModal.bankId}`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      toast.success('Blood bank deleted');
      closeDeleteModal();
      fetchBloodBanks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const getTotalStock = (bank) => {
    if (!bank.bloodGroups) return 0;
    return Object.values(bank.bloodGroups).reduce((a, b) => a + b, 0);
  };

  const getStockStatus = (bank) => {
    const total = getTotalStock(bank);
    if (total === 0) return { label: 'Empty', color: 'bg-red-100 text-red-700' };
    if (total < 20) return { label: 'Low', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Available', color: 'bg-green-100 text-green-700' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <FaDatabase className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-1">
                🏦 Blood Banks Management
              </h1>
              <p className="text-green-100">
                Manage all registered blood banks and inventory
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-white text-green-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg"
            >
              <FaPlus className="w-4 h-4" />
              Add Blood Bank
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Banks</p>
                <p className="text-2xl font-bold text-green-600">{bloodBanks.length}</p>
              </div>
              <FaDatabase className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {bloodBanks.reduce((sum, b) => sum + getTotalStock(b), 0)}
                </p>
              </div>
              <GiBlood className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Available</p>
                <p className="text-2xl font-bold text-blue-600">
                  {bloodBanks.filter(b => getTotalStock(b) >= 20).length}
                </p>
              </div>
              <FaCheck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bloodBanks.filter(b => getTotalStock(b) > 0 && getTotalStock(b) < 20).length}
                </p>
              </div>
              <FaExclamationTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search blood banks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Blood Banks List */}
        {loading ? (
          <div className="card text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : filteredBanks.length === 0 ? (
          <div className="card text-center py-16">
            <FaDatabase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {bloodBanks.length === 0 ? 'No blood banks' : 'No matches'}
            </h3>
            <p className="text-gray-500 mb-4">
              {bloodBanks.length === 0
                ? 'Create your first blood bank'
                : 'Try a different search'}
            </p>
            {bloodBanks.length === 0 && (
              <button onClick={openCreateModal} className="btn-secondary">
                <FaPlus className="w-4 h-4" />
                Add Blood Bank
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredBanks.map((bank, index) => {
                const status = getStockStatus(bank);
                return (
                  <motion.div
                    key={bank._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className="card hover:border-green-300 transition-colors"
                  >
                    <div className="flex flex-wrap justify-between gap-4">
                      <div className="flex-1 min-w-[250px]">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <FaHospital className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-gray-800 text-lg">
                                {bank.name}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                              <FaMapMarkerAlt className="w-3 h-3 text-green-500" />
                              {bank.address}
                            </p>
                          </div>
                        </div>

                        {/* Blood Stock */}
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 mb-3">
                          {bloodGroupList.map(group => {
                            const count = bank.bloodGroups?.[group] || 0;
                            return (
                              <div
                                key={group}
                                className={`text-center p-2 rounded-lg text-xs font-medium ${
                                  count === 0
                                    ? 'bg-gray-100 text-gray-400'
                                    : count < 5
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-green-100 text-green-700'
                                }`}
                              >
                                <div className="font-bold">{group}</div>
                                <div className="text-[10px] mt-0.5">{count}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                          {bank.contact && (
                            <span className="flex items-center gap-1">
                              <FaPhone className="w-3 h-3 text-gray-400" />
                              {bank.contact}
                            </span>
                          )}
                          {bank.email && (
                            <span className="flex items-center gap-1">
                              <FaEnvelope className="w-3 h-3 text-gray-400" />
                              {bank.email}
                            </span>
                          )}
                          {bank.workingHours && (
                            <span className="flex items-center gap-1">
                              <FaClock className="w-3 h-3 text-gray-400" />
                              {bank.workingHours}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => openEditModal(bank)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(bank)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ═══════════ CREATE/EDIT MODAL ═══════════ */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={closeFormModal}
        title={formModal.mode === 'create' ? 'Add Blood Bank' : 'Edit Blood Bank'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="input-label">Blood Bank Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., City Blood Bank"
              required
            />
          </div>

          <div>
            <label className="input-label">Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              placeholder="Full address"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Contact *</label>
              <input
                type="tel"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="input-field"
                placeholder="+880..."
                required
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="bank@email.com"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Working Hours</label>
            <input
              type="text"
              value={formData.workingHours}
              onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
              className="input-field"
              placeholder="9:00 AM - 6:00 PM"
            />
          </div>

          {/* Blood Groups Stock */}
          <div>
            <label className="input-label mb-2">Blood Stock (Units)</label>
            <div className="grid grid-cols-4 gap-2">
              {bloodGroupList.map(group => (
                <div key={group}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1 text-center">
                    {group}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bloodGroups[group] || 0}
                    onChange={(e) => handleBloodGroupChange(group, e.target.value)}
                    className="w-full px-2 py-1.5 text-center border-2 border-gray-200 rounded-lg focus:border-green-500 outline-none text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  <span>{formModal.mode === 'create' ? 'Create' : 'Update'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={closeFormModal}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ═══════════ DELETE MODAL ═══════════ */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete Blood Bank"
      >
        <div className="space-y-5">
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

          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Delete this blood bank?
            </h3>
            <p className="text-gray-600 mb-4">
              You are about to delete{' '}
              <span className="font-bold text-gray-800">{deleteModal.bankName}</span>.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 flex items-center justify-center gap-2">
                <FaExclamationTriangle className="w-4 h-4" />
                This action cannot be undone
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4" />
                  <span>Yes, Delete</span>
                </>
              )}
            </button>
            <button
              onClick={closeDeleteModal}
              disabled={deleting}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default function AdminBloodBanksPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminBloodBanksContent />
    </RoleGuard>
  );
}