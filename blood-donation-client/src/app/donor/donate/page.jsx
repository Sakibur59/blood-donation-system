'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import ChatWidget from '../../components/ChatWidget';
import { GiBlood } from 'react-icons/gi';
import { FaHospital, FaHandHoldingHeart, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function DonateContent() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bloodBankId: '',
    bloodGroup: user?.bloodGroup || '',
    quantity: 1,
    notes: ''
  });

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  const fetchBloodBanks = async () => {
    try {
      const res = await axios.get(`${API_URL}/donor/blood-banks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBloodBanks(res.data.bloodBanks || []);
    } catch (error) {
      toast.error('Failed to load blood banks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bloodBankId) {
      toast.error('Please select a blood bank');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/donor/donate`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Donation recorded! Thank you for saving lives ❤️');
      setTimeout(() => router.push('/donor/dashboard'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record donation');
    } finally {
      setSubmitting(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <GiBlood className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">🩸 Donate Blood</h1>
            <p className="text-red-100">Record your blood donation and save a life</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="input-label">Blood Bank *</label>
            <select
              required
              value={formData.bloodBankId}
              onChange={(e) => setFormData({ ...formData, bloodBankId: e.target.value })}
              className="select-field"
            >
              <option value="">Select blood bank</option>
              {bloodBanks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.name} - {bank.address}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Blood Group *</label>
              <select
                required
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="select-field"
              >
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
                max="2"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Any additional information..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <FaHandHoldingHeart className="w-5 h-5" />
                <span>Confirm Donation</span>
              </>
            )}
          </button>
        </form>
      </div>
      <ChatWidget />
    </DashboardLayout>
  );
}

export default function DonatePage() {
  return (
    <RoleGuard allowedRole="donor">
      <DonateContent />
    </RoleGuard>
  );
}