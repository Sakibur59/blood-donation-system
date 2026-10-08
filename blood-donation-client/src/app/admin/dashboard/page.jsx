'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaUsers, FaHospital, FaTint, FaClipboardList,
  FaHeart, FaChartLine, FaDatabase, FaCrown,
  FaCheckCircle, FaClock, FaArrowUp, FaArrowRight,
  FaUserMd, FaUserCheck, FaExclamationTriangle,
  FaHourglassHalf, FaDonate
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function AdminDashboardContent() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalHospitals: 0,
    totalBloodBanks: 0,
    totalRequests: 0,
    pendingRequests: 0,
    fulfilledRequests: 0,
    totalDonations: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => fetchData();
    socket.on('newBloodRequest', handleUpdate);
    socket.on('newDonation', handleUpdate);
    socket.on('requestFulfilled', handleUpdate);
    socket.on('requestUpdated', handleUpdate);

    return () => {
      socket.off('newBloodRequest', handleUpdate);
      socket.off('newDonation', handleUpdate);
      socket.off('requestFulfilled', handleUpdate);
      socket.off('requestUpdated', handleUpdate);
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      const s = res.data.statistics;
      setStats({
        totalUsers: s.users.total,
        totalDonors: s.users.donors,
        totalHospitals: s.users.hospitals,
        totalBloodBanks: s.bloodBanks,
        totalRequests: s.requests.total,
        pendingRequests: s.requests.pending,
        fulfilledRequests: s.requests.fulfilled,
        totalDonations: s.donations,
      });

      setRecentActivities(s.recentActivities || []);
    } catch (error) {
      console.error('Fetch error:', error);
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
            <p className="mt-4 text-gray-500">Loading admin dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ═══ Welcome Banner ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <FaCrown className="w-64 h-64" />
          </div>
          <div className="absolute bottom-0 left-0 opacity-5 pointer-events-none">
            <GiBlood className="w-40 h-40" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/20 backdrop-blur flex items-center justify-center">
                <FaCrown className="w-6 h-6 text-yellow-300" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Admin Control Center
              </h1>
            </div>
            <p className="text-purple-100">
              Welcome, {user?.name}. Manage the entire BloodLink platform from here.
            </p>
          </div>
        </motion.div>

        {/* ═══ Primary Stats ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FaUsers}
            label="Total Users"
            value={stats.totalUsers}
            color="purple"
            delay={0.05}
          />
          <StatCard
            icon={FaHeart}
            label="Total Donors"
            value={stats.totalDonors}
            color="red"
            delay={0.1}
          />
          <StatCard
            icon={FaHospital}
            label="Hospitals"
            value={stats.totalHospitals}
            color="blue"
            delay={0.15}
          />
          <StatCard
            icon={FaDatabase}
            label="Blood Banks"
            value={stats.totalBloodBanks}
            color="green"
            delay={0.2}
          />
        </div>

        {/* ═══ Secondary Stats ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat
            icon={FaClipboardList}
            label="Total Requests"
            value={stats.totalRequests}
            iconColor="text-indigo-500"
            delay={0.25}
          />
          <MiniStat
            icon={FaHourglassHalf}
            label="Pending"
            value={stats.pendingRequests}
            iconColor="text-yellow-500"
            delay={0.3}
          />
          <MiniStat
            icon={FaCheckCircle}
            label="Fulfilled"
            value={stats.fulfilledRequests}
            iconColor="text-green-500"
            delay={0.35}
          />
          <MiniStat
            icon={GiBlood}
            label="Total Donations"
            value={stats.totalDonations}
            iconColor="text-red-500"
            delay={0.4}
          />
        </div>

        {/* ═══ Quick Actions ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              ⚡ Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickAction
              href="/admin/users"
              icon={FaUsers}
              label="Manage Users"
              color="purple"
            />
            <QuickAction
              href="/admin/blood-banks"
              icon={FaDatabase}
              label="Blood Banks"
              color="green"
            />
            <QuickAction
              href="/admin/requests"
              icon={FaClipboardList}
              label="All Requests"
              color="yellow"
            />
            <QuickAction
              href="/admin/statistics"
              icon={FaChartLine}
              label="Statistics"
              color="blue"
            />
          </div>
        </motion.div>

        {/* ═══ Recent Activity ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📊 Recent Activity
            </h2>
            <Link
              href="/admin/donations"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
            >
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <FaClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No recent activity</p>
                <p className="text-sm text-gray-400">Activity will appear here</p>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-purple-500"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <GiBlood className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {activity.donorName || 'Anonymous'} donated {activity.bloodGroup}
                    </p>
                    <p className="text-xs text-gray-500">
                      To {activity.bloodBankName} • {new Date(activity.donationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <FaArrowUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

// ═══════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  const colors = {
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      value: 'text-purple-600',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      value: 'text-red-600',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      value: 'text-blue-600',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      value: 'text-green-600',
    },
  };
  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card hover:border-purple-200 group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${c.value}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
    </motion.div>
  );
}

function MiniStat({ icon: Icon, label, value, iconColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </motion.div>
  );
}

function QuickAction({ href, icon: Icon, label, color }) {
  const colors = {
    purple: { bg: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-600' },
    green: { bg: 'bg-green-50 hover:bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50 hover:bg-yellow-100', text: 'text-yellow-600' },
    blue: { bg: 'bg-blue-50 hover:bg-blue-100', text: 'text-blue-600' },
  };
  const c = colors[color];

  return (
    <Link
      href={href}
      className={`flex flex-col items-center p-4 rounded-xl ${c.bg} transition-colors text-center group`}
    >
      <Icon className={`w-8 h-8 ${c.text} mb-2 group-hover:scale-110 transition-transform`} />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminDashboardContent />
    </RoleGuard>
  );
}