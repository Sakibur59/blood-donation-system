'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import {
  FaSearch, FaUser, FaUsers, FaHospital, FaCrown,
  FaEdit, FaTrash, FaCheckCircle, FaTimesCircle,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaFilter,
  FaExclamationTriangle, FaCheck, FaUserShield,
  FaTint, FaIdCard, FaCalendarAlt
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function AdminUsersContent() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    userRole: '',
  });
  const [deleting, setDeleting] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState({
    isOpen: false,
    user: null,
  });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    bloodGroup: '',
    age: '',
    hospitalName: '',
    registrationNumber: '',
    isVerified: false,
    isActive: true,
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setUsers(res.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
      );
    }

    if (roleFilter) filtered = filtered.filter(u => u.role === roleFilter);
    if (statusFilter === 'verified') filtered = filtered.filter(u => u.isVerified);
    if (statusFilter === 'unverified') filtered = filtered.filter(u => !u.isVerified);
    if (statusFilter === 'active') filtered = filtered.filter(u => u.isActive !== false);
    if (statusFilter === 'inactive') filtered = filtered.filter(u => u.isActive === false);

    setFilteredUsers(filtered);
  };

  // ═══ Delete ═══
  const openDeleteModal = (user) => {
    setDeleteModal({
      isOpen: true,
      userId: user._id,
      userName: user.name,
      userRole: user.role,
    });
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ isOpen: false, userId: null, userName: '', userRole: '' });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.userId) return;

    try {
      setDeleting(true);
      const storedToken = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/users/${deleteModal.userId}`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      toast.success('User deleted successfully');
      closeDeleteModal();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  // ═══ Edit ═══
  const openEditModal = (user) => {
    setEditModal({ isOpen: true, user });
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'donor',
      bloodGroup: user.bloodGroup || '',
      age: user.age || '',
      hospitalName: user.hospitalName || '',
      registrationNumber: user.registrationNumber || '',
      isVerified: user.isVerified || false,
      isActive: user.isActive !== false,
    });
  };

  const closeEditModal = () => {
    if (editing) return;
    setEditModal({ isOpen: false, user: null });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.user) return;

    try {
      setEditing(true);
      const storedToken = localStorage.getItem('token');
      const res = await axios.put(
        `${API_URL}/admin/users/${editModal.user._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      toast.success('User updated successfully');
      closeEditModal();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    } finally {
      setEditing(false);
    }
  };

  // ═══ Toggle Verify ═══
  const handleToggleVerify = async (userId, currentStatus) => {
    try {
      const storedToken = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/users/${userId}`,
        { isVerified: !currentStatus },
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );
      toast.success(currentStatus ? 'Unverified' : 'Verified');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchTerm || roleFilter || statusFilter;

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-700 border-purple-200',
      donor: 'bg-red-100 text-red-700 border-red-200',
      hospital: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return badges[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRoleIcon = (role) => {
    if (role === 'admin') return <FaCrown className="w-3 h-3" />;
    if (role === 'hospital') return <FaHospital className="w-3 h-3" />;
    return <FaUser className="w-3 h-3" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <FaUsers className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-1">
              👥 Manage Users
            </h1>
            <p className="text-purple-100">
              View, edit and manage all registered users
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
              <FaUsers className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Donors</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.role === 'donor').length}
                </p>
              </div>
              <GiBlood className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Hospitals</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.role === 'hospital').length}
                </p>
              </div>
              <FaHospital className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.isVerified).length}
                </p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-purple-600 w-4 h-4" />
            <h2 className="font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="select-field"
            >
              <option value="">All Roles</option>
              <option value="donor">🩸 Donors</option>
              <option value="hospital">🏥 Hospitals</option>
              <option value="admin">👑 Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-field"
            >
              <option value="">All Status</option>
              <option value="verified">✅ Verified</option>
              <option value="unverified">⏳ Unverified</option>
              <option value="active">🟢 Active</option>
              <option value="inactive">🔴 Inactive</option>
            </select>
          </div>
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-purple-600">{filteredUsers.length}</span> of{' '}
                <span className="font-bold">{users.length}</span> users
              </p>
              <button
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Users List */}
        {loading ? (
          <div className="card text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="card text-center py-16">
            <FaUsers className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="card hover:border-purple-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden ${
                        user.role === 'admin' ? 'bg-purple-100' :
                        user.role === 'hospital' ? 'bg-blue-100' :
                        'bg-red-100'
                      }`}>
                        {user.profileImage ? (
                          <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : user.role === 'hospital' ? (
                          <FaHospital className="w-6 h-6 text-blue-600" />
                        ) : user.role === 'admin' ? (
                          <FaCrown className="w-6 h-6 text-purple-600" />
                        ) : (
                          <span className="font-bold text-red-600 text-lg">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {user.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                          <FaCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-800">{user.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getRoleBadge(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role}
                        </span>
                        {user.isActive === false && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaEnvelope className="w-3 h-3 text-gray-400" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <FaPhone className="w-3 h-3 text-gray-400" />
                            {user.phone}
                          </span>
                        )}
                        {user.bloodGroup && (
                          <span className="flex items-center gap-1 font-semibold text-red-600">
                            <FaTint className="w-3 h-3" />
                            {user.bloodGroup}
                          </span>
                        )}
                        {user.hospitalName && (
                          <span className="flex items-center gap-1">
                            <FaHospital className="w-3 h-3 text-gray-400" />
                            {user.hospitalName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleVerify(user._id, user.isVerified)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isVerified
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-600'
                        }`}
                        title={user.isVerified ? 'Unverify' : 'Verify'}
                      >
                        {user.isVerified ? <FaCheckCircle className="w-4 h-4" /> : <FaTimesCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <FaTrash className="w-4 h-4" />
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

      {/* ═══════════ DELETE MODAL ═══════════ */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Delete User"
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
              Delete this user?
            </h3>
            <p className="text-gray-600 mb-4">
              You are about to permanently delete{' '}
              <span className="font-bold text-gray-800">{deleteModal.userName}</span>
              {' '}(<span className="capitalize">{deleteModal.userRole}</span>).
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

      {/* ═══════════ EDIT MODAL ═══════════ */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        title="Edit User"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="input-label">Phone</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="input-label">Role</label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="select-field"
              >
                <option value="donor">🩸 Donor</option>
                <option value="hospital">🏥 Hospital</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            {editForm.role === 'donor' && (
              <>
                <div>
                  <label className="input-label">Blood Group</label>
                  <select
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Select</option>
                    {bloodGroups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Age</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="input-field"
                    min="16"
                    max="65"
                  />
                </div>
              </>
            )}

            {editForm.role === 'hospital' && (
              <>
                <div>
                  <label className="input-label">Hospital Name</label>
                  <input
                    type="text"
                    value={editForm.hospitalName}
                    onChange={(e) => setEditForm({ ...editForm, hospitalName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Registration No.</label>
                  <input
                    type="text"
                    value={editForm.registrationNumber}
                    onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                    className="input-field"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="input-label">Address</label>
            <textarea
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="input-field"
              rows="2"
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.isVerified}
                onChange={(e) => setEditForm({ ...editForm, isVerified: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={editing}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {editing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaCheck className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={closeEditModal}
              disabled={editing}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminUsersContent />
    </RoleGuard>
  );
}