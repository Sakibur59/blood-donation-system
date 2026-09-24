'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import ChatWidget from '../../components/ChatWidget';
import { GiBlood } from 'react-icons/gi';
import { FaClipboardList, FaSearch, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function RequestsContent() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, filterGroup, requests]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/donor/pending-requests`, {
        headers: { Authorization: `Bearer ${token}` }
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
    if (filterGroup) {
      filtered = filtered.filter(r => r.bloodGroup === filterGroup);
    }
    setFilteredRequests(filtered);
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
          <h1 className="text-2xl font-bold text-gray-800">📋 Blood Requests</h1>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            {filteredRequests.length} requests
          </span>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="select-field"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="card text-center py-16">
            <FaCheckCircle className="w-20 h-20 text-green-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No pending requests
            </h3>
            <p className="text-gray-500">Check back later for new requests</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredRequests.map((request) => (
              <div key={request._id} className="card hover:border-red-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <GiBlood className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {request.patientName}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    request.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                    request.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {request.urgency || 'normal'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Blood Group</span>
                    <span className="font-bold text-red-600">{request.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity</span>
                    <span className="font-medium">{request.quantity} unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hospital</span>
                    <span className="font-medium text-right">
                      {request.hospital || request.hospitalInfo?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contact</span>
                    <span className="font-medium">{request.contact}</span>
                  </div>
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

export default function RequestsPage() {
  return (
    <RoleGuard allowedRole="donor">
      <RequestsContent />
    </RoleGuard>
  );
}