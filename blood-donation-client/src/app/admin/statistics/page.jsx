'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import {
  FaUsers, FaHospital, FaDatabase, FaClipboardList,
  FaChartLine, FaHeart, FaTint, FaCheckCircle,
  FaClock, FaArrowUp, FaCrown, FaCalendarAlt
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function AdminStatisticsContent() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    users: { total: 0, donors: 0, hospitals: 0 },
    bloodBanks: 0,
    requests: { total: 0, pending: 0, fulfilled: 0 },
    donations: 0,
    bloodGroupDistribution: [],
    monthlyDonations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setStats(res.data.statistics || stats);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <GiBlood className="w-12 h-12 text-purple-600 blood-drop-animation mx-auto mb-4" />
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const bloodGroupColors = {
    'A+': 'bg-red-500', 'A-': 'bg-red-600',
    'B+': 'bg-blue-500', 'B-': 'bg-blue-600',
    'AB+': 'bg-purple-500', 'AB-': 'bg-purple-600',
    'O+': 'bg-green-500', 'O-': 'bg-green-600',
  };

  const maxDistribution = Math.max(
    ...stats.bloodGroupDistribution.map(d => d.count),
    1
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <FaChartLine className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-1">
              📊 Platform Statistics
            </h1>
            <p className="text-purple-100">
              Complete analytics and insights of BloodLink
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewCard
            icon={FaUsers}
            label="Total Users"
            value={stats.users.total}
            subtext={`${stats.users.donors} donors • ${stats.users.hospitals} hospitals`}
            color="purple"
            delay={0}
          />
          <OverviewCard
            icon={FaDatabase}
            label="Blood Banks"
            value={stats.bloodBanks}
            subtext="Registered centers"
            color="green"
            delay={0.05}
          />
          <OverviewCard
            icon={GiBlood}
            label="Total Donations"
            value={stats.donations}
            subtext={`${stats.donations * 3} lives saved`}
            color="red"
            delay={0.1}
          />
          <OverviewCard
            icon={FaClipboardList}
            label="Total Requests"
            value={stats.requests.total}
            subtext={`${stats.requests.pending} pending`}
            color="indigo"
            delay={0.15}
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* User Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <FaUsers className="text-purple-600" />
              User Distribution
            </h2>
            <div className="space-y-4">
              <UserStatRow
                icon={GiBlood}
                label="Donors"
                value={stats.users.donors}
                total={stats.users.total}
                color="bg-red-500"
                textColor="text-red-600"
              />
              <UserStatRow
                icon={FaHospital}
                label="Hospitals"
                value={stats.users.hospitals}
                total={stats.users.total}
                color="bg-blue-500"
                textColor="text-blue-600"
              />
              <UserStatRow
                icon={FaCrown}
                label="Admins"
                value={stats.users.total - stats.users.donors - stats.users.hospitals}
                total={stats.users.total}
                color="bg-purple-500"
                textColor="text-purple-600"
              />
            </div>
          </motion.div>

          {/* Request Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <FaClipboardList className="text-indigo-600" />
              Request Status
            </h2>
            <div className="space-y-4">
              <StatusRow
                icon={FaCheckCircle}
                label="Fulfilled"
                value={stats.requests.fulfilled}
                color="text-green-600 bg-green-100"
                delay={0}
              />
              <StatusRow
                icon={FaClock}
                label="Pending"
                value={stats.requests.pending}
                color="text-yellow-600 bg-yellow-100"
                delay={0.1}
              />
              <StatusRow
                icon={FaClipboardList}
                label="Total Requests"
                value={stats.requests.total}
                color="text-indigo-600 bg-indigo-100"
                delay={0.2}
              />
            </div>
          </motion.div>
        </div>

        {/* Blood Group Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <FaTint className="text-red-600" />
            Blood Group Distribution (Donors)
          </h2>
          {stats.bloodGroupDistribution.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {stats.bloodGroupDistribution
                .sort((a, b) => b.count - a.count)
                .map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-12 h-12 rounded-xl ${bloodGroupColors[item._id] || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {item._id}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {item._id} Blood Type
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          {item.count} donors
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.count / maxDistribution) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + index * 0.05 }}
                          className={`h-full rounded-full ${bloodGroupColors[item._id] || 'bg-gray-500'}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </motion.div>

        {/* Monthly Donations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <FaCalendarAlt className="text-purple-600" />
            Monthly Donations (Last 12 Months)
          </h2>
          {stats.monthlyDonations.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data available</p>
          ) : (
            <div className="flex items-end justify-around gap-2 h-48">
              {stats.monthlyDonations
                .slice()
                .reverse()
                .map((item, index) => {
                  const maxCount = Math.max(...stats.monthlyDonations.map(m => m.count), 1);
                  const height = (item.count / maxCount) * 100;
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                  return (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.6, delay: 0.55 + index * 0.03 }}
                      className="flex-1 flex flex-col items-center justify-end gap-1 min-w-[30px]"
                    >
                      <span className="text-xs font-bold text-purple-600">
                        {item.count}
                      </span>
                      <div className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg" style={{ height: '100%', minHeight: '4px' }}></div>
                      <span className="text-xs text-gray-500 font-medium">
                        {monthNames[item._id.month - 1]}
                      </span>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function OverviewCard({ icon: Icon, label, value, subtext, color, delay = 0 }) {
  const colors = {
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  };
  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card hover:border-purple-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
        <FaArrowUp className="w-4 h-4 text-green-500" />
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${c.text} mb-1`}>{value}</p>
      <p className="text-xs text-gray-400">{subtext}</p>
    </motion.div>
  );
}

function UserStatRow({ icon: Icon, label, value, total, color, textColor }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Icon className={`w-4 h-4 ${textColor}`} />
          {label}
        </span>
        <span className="text-sm font-bold text-gray-800">
          {value} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-xl font-bold text-gray-800">{value}</span>
    </motion.div>
  );
}

export default function AdminStatisticsPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminStatisticsContent />
    </RoleGuard>
  );
}