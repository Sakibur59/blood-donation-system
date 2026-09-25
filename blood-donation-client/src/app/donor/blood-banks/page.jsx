'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import ChatWidget from '../../components/ChatWidget';
import { FaHospital, FaPhone, FaClock, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function BloodBanksContent() {
  const { token } = useAuth();
  const [bloodBanks, setBloodBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredBanks(
        bloodBanks.filter(bank =>
          bank.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.address?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredBanks(bloodBanks);
    }
  }, [searchTerm, bloodBanks]);

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-800">🏥 Blood Banks</h1>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            {filteredBanks.length} banks
          </span>
        </div>

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

        {filteredBanks.length === 0 ? (
          <div className="card text-center py-16">
            <FaHospital className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No blood banks found
            </h3>
            <p className="text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredBanks.map((bank) => (
              <div key={bank._id} className="card hover:border-red-300">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FaHospital className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{bank.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt className="w-3 h-3" />
                      {bank.address}
                    </p>
                  </div>
                </div>

                {/* Blood Stock */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Blood Stock:</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {bloodGroups.map(group => (
                      <div 
                        key={group} 
                        className={`text-center p-1.5 rounded text-xs font-medium ${
                          (bank.bloodGroups?.[group] || 0) > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <div className="font-bold">{group}</div>
                        <div className="text-[10px]">
                          {bank.bloodGroups?.[group] || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 pt-3 border-t text-sm">
                  <p className="flex items-center gap-2 text-gray-600">
                    <FaPhone className="w-3 h-3 text-gray-400" />
                    {bank.contact}
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <FaClock className="w-3 h-3 text-gray-400" />
                    {bank.workingHours}
                  </p>
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

export default function BloodBanksPage() {
  return (
    <RoleGuard allowedRole="donor">
      <BloodBanksContent />
    </RoleGuard>
  );
}