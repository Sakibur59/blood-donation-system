'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import ChatWidget from '../../components/ChatWidget';
import { GiBlood } from 'react-icons/gi';
import { FaHistory, FaCheckCircle, FaCalendarAlt, FaHospital } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function MyDonationsContent() {
  const { token } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await axios.get(`${API_URL}/donor/my-donations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonations(res.data.donations || []);
    } catch (error) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">📜 My Donations</h1>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            {donations.length} total
          </span>
        </div>

        {donations.length === 0 ? (
          <div className="card text-center py-16">
            <GiBlood className="w-20 h-20 text-red-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No donations yet</h3>
            <p className="text-gray-500 mb-4">Start donating blood to save lives</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {donations.map((donation) => (
              <div key={donation._id} className="card hover:border-red-300">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <GiBlood className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {donation.bloodGroup} Blood Donation
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FaHospital className="w-3.5 h-3.5" />
                          {donation.bloodBankName}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="w-3.5 h-3.5" />
                          {new Date(donation.donationDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          Quantity: {donation.quantity} unit
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <FaCheckCircle className="w-3 h-3" />
                    {donation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ChatWidget />
    </DashboardLayout>
  );
}

export default function MyDonationsPage() {
  return (
    <RoleGuard allowedRole="donor">
      <MyDonationsContent />
    </RoleGuard>
  );
}