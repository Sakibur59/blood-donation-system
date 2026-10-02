'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import {
  FaPlus, FaPaperPlane, FaUser, FaTint,
  FaPhone, FaExclamationTriangle, FaClipboardList,
  FaHeartbeat, FaShieldAlt, FaInfoCircle, FaCheckCircle,
  FaLightbulb, FaArrowRight
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function NewRequestContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    quantity: 1,
    hospital: user?.name || '',
    contact: user?.phone || '',
    urgency: 'normal',
    notes: '',
  });

  const bloodGroups = [
    { group: 'A+', color: 'from-red-500 to-red-600' },
    { group: 'A-', color: 'from-red-500 to-red-700' },
    { group: 'B+', color: 'from-blue-500 to-blue-600' },
    { group: 'B-', color: 'from-blue-500 to-blue-700' },
    { group: 'AB+', color: 'from-purple-500 to-purple-600' },
    { group: 'AB-', color: 'from-purple-500 to-purple-700' },
    { group: 'O+', color: 'from-red-600 to-red-700' },
    { group: 'O-', color: 'from-red-700 to-red-800' },
  ];

  const urgencyOptions = [
    { 
      value: 'normal', 
      label: 'Normal', 
      desc: 'Within 24-48 hours',
      color: 'bg-green-50 border-green-300 text-green-700',
      activeColor: 'bg-green-600 border-green-600 text-white',
      icon: '🟢'
    },
    { 
      value: 'urgent', 
      label: 'Urgent', 
      desc: 'Within few hours',
      color: 'bg-orange-50 border-orange-300 text-orange-700',
      activeColor: 'bg-orange-600 border-orange-600 text-white',
      icon: '🟠'
    },
    { 
      value: 'emergency', 
      label: 'Emergency', 
      desc: 'Immediate attention',
      color: 'bg-red-50 border-red-300 text-red-700',
      activeColor: 'bg-red-600 border-red-600 text-white',
      icon: '🔴'
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bloodGroup) {
      toast.error('Please select a blood group');
      return;
    }

    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');

      const res = await axios.post(
        `${API_URL}/hospital/request`,
        formData,
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      toast.success(res.data.message || 'Request created successfully!', {
        duration: 4000,
        icon: '🩸'
      });
      setTimeout(() => router.push('/hospital/my-requests'), 1200);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ═══ Hero Header ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 text-white"
        >
          {/* Decorative Blood Drops */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <GiBlood className="w-64 h-64" />
          </div>
          <div className="absolute bottom-0 left-0 opacity-5 pointer-events-none">
            <GiBlood className="w-40 h-40" />
          </div>
          <div className="absolute top-8 left-8 w-24 h-24 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
              >
                <GiBlood className="w-8 h-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  New Blood Request
                </h1>
                <p className="text-red-100 text-sm mt-1">
                  Create a request and save a life 🩸
                </p>
              </div>
            </div>

            {/* Info Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 text-xs">
                <FaShieldAlt className="w-3 h-3" />
                <span>Instant Notifications</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 text-xs">
                <FaHeartbeat className="w-3 h-3" />
                <span>Verified Donors</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 text-xs">
                <FaLightbulb className="w-3 h-3" />
                <span>Real-time Matching</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ Form ═══ */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* ─── Section 1: Patient Information ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Patient Information</h2>
                  <p className="text-xs text-gray-500">Tell us about the patient</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none"
                    placeholder="Enter patient's full name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none"
                      placeholder="+880 1XXX-XXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hospital Name
                  </label>
                  <div className="relative">
                    <FaClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.hospital}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none"
                      placeholder="Hospital name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Section 2: Blood Requirements ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FaTint className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Blood Requirements</h2>
                  <p className="text-xs text-gray-500">Select blood group and quantity</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Blood Group Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {bloodGroups.map(({ group, color }) => (
                    <motion.button
                      key={group}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, bloodGroup: group })}
                      className={`relative py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                        formData.bloodGroup === group
                          ? `bg-gradient-to-br ${color} text-white border-transparent shadow-lg scale-105`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      {group}
                      {formData.bloodGroup === group && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                        >
                          <FaCheckCircle className="w-3 h-3 text-green-500" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity (Units) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                    className="w-12 h-12 rounded-xl bg-red-50 text-red-600 font-bold text-xl hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) })}
                      className="w-full text-center py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none font-bold text-2xl text-red-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, quantity: Math.min(10, formData.quantity + 1) })}
                    className="w-12 h-12 rounded-xl bg-red-50 text-red-600 font-bold text-xl hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <FaInfoCircle className="w-3 h-3" />
                  Usually 1-2 units per patient
                </p>
              </div>
            </div>
          </div>

          {/* ─── Section 3: Urgency Level ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FaExclamationTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Urgency Level</h2>
                  <p className="text-xs text-gray-500">How urgent is this request?</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {urgencyOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, urgency: option.value })}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      formData.urgency === option.value
                        ? `${option.activeColor} shadow-lg scale-[1.02]`
                        : `${option.color} hover:shadow-md`
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{option.icon}</span>
                      {formData.urgency === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <FaCheckCircle className="w-5 h-5" />
                        </motion.div>
                      )}
                    </div>
                    <p className="font-bold text-sm">{option.label}</p>
                    <p className={`text-xs mt-1 ${
                      formData.urgency === option.value ? 'opacity-90' : 'opacity-75'
                    }`}>
                      {option.desc}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Section 4: Additional Notes ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FaLightbulb className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">Additional Notes</h2>
                  <p className="text-xs text-gray-500">Optional information for donors</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all outline-none resize-none"
                rows="4"
                placeholder="Any special requirements, patient condition, or additional information..."
              />
            </div>
          </div>

          {/* ─── Info Banner ─── */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FaInfoCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 text-sm mb-1">
                  What happens next?
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• All matching donors will be notified instantly</li>
                  <li>• Blood banks with available stock will also be alerted</li>
                  <li>• You'll receive notification when someone responds</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ─── Action Buttons ─── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold hover:shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Request...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-5 h-5" />
                  <span>Create Blood Request</span>
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            <Link
              href="/hospital/dashboard"
              className="py-4 px-8 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all text-center flex items-center justify-center gap-2"
            >
              Cancel
            </Link>
          </div>
        </motion.form>
      </div>
    </DashboardLayout>
  );
}

export default function NewRequestPage() {
  return (
    <RoleGuard allowedRole="hospital">
      <NewRequestContent />
    </RoleGuard>
  );
}