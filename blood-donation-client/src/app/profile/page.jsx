'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { GiBlood } from 'react-icons/gi';
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaCalendarAlt, FaCamera, FaSave, FaEdit,
  FaTimes, FaCheck, FaTint, FaShieldAlt, FaHeart
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProfilePage() {
  const { user, token, uploadProfileImage, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    totalDonations: 0,
    livesSaved: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    age: '',
    address: ''
  });
  const fileInputRef = useRef(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bloodGroup: user.bloodGroup || '',
        age: user.age || '',
        address: user.address || ''
      });

      if (user.role === 'donor' && token) {
        fetchStats();
      }
    }
  }, [user, token]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/donor/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats({
        totalDonations: res.data.totalDonations || 0,
        livesSaved: (res.data.totalDonations || 0) * 3
      });
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      await uploadProfileImage(file);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.put(
        `${API_URL}/users/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bloodGroup: user.bloodGroup || '',
      age: user.age || '',
      address: user.address || ''
    });
    setIsEditing(false);
  };

  const getRoleBadge = () => {
    const badges = {
      admin: { color: 'bg-purple-100 text-purple-700', icon: '👑', label: 'Admin' },
      donor: { color: 'bg-red-100 text-red-700', icon: '🩸', label: 'Donor' },
      hospital: { color: 'bg-blue-100 text-blue-700', icon: '🏥', label: 'Hospital' }
    };
    return badges[user?.role] || badges.donor;
  };

  const roleBadge = getRoleBadge();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <GiBlood className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center overflow-hidden">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  ) : user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-red-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 p-2.5 bg-white text-red-600 rounded-full shadow-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <FaCamera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
              <p className="text-red-100 mb-3">{user?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleBadge.color}`}>
                  {roleBadge.icon} {roleBadge.label}
                </span>
                {user?.bloodGroup && (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-medium">
                    🩸 {user.bloodGroup}
                  </span>
                )}
                {user?.isVerified && (
                  <span className="px-3 py-1 bg-green-500/30 backdrop-blur rounded-full text-xs font-medium flex items-center gap-1">
                    <FaCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <FaEdit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats (Only Donor) */}
        {user?.role === 'donor' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Donations</p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.totalDonations}
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
                  <p className="text-sm text-gray-500 mb-1">Lives Saved</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.livesSaved}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FaHeart className="w-6 h-6 text-green-600" />
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
                  <FaTint className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaUser className="text-red-600" />
              Personal Information
            </h2>
            {isEditing && (
              <span className="text-sm text-red-600 font-medium">
                Editing mode
              </span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Full Name</label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="input-field pl-10 bg-gray-50"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="input-label">Phone Number</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Age</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="input-field pl-10"
                      min="16"
                      max="65"
                      placeholder="Enter age"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label">Address</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-10"
                    rows="3"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 md:flex-none md:px-8"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="btn-outline flex-1 md:flex-none md:px-8"
                >
                  <FaTimes className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <InfoItem icon={FaUser} label="Full Name" value={user?.name} />
              <InfoItem icon={FaEnvelope} label="Email Address" value={user?.email} />
              <InfoItem
                icon={FaPhone}
                label="Phone Number"
                value={user?.phone || 'Not provided'}
              />
              <InfoItem
                icon={FaTint}
                label="Blood Group"
                value={user?.bloodGroup || 'Not provided'}
              />
              <InfoItem
                icon={FaCalendarAlt}
                label="Age"
                value={user?.age ? `${user.age} years` : 'Not provided'}
              />
              <InfoItem
                icon={FaShieldAlt}
                label="Account Status"
                value={user?.isVerified ? 'Verified' : 'Pending Verification'}
              />
              <div className="md:col-span-2">
                <InfoItem
                  icon={FaMapMarkerAlt}
                  label="Address"
                  value={user?.address || 'Not provided'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-red-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}