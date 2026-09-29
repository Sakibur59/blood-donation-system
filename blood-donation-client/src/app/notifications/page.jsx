'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import DashboardLayout from '../components/DashboardLayout';
import {
  FaBell, FaCheck, FaTrash, FaComment, FaHeart,
  FaCheckCircle, FaTrophy, FaEnvelopeOpen
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function NotificationsPage() {
  const { token } = useAuth();
  const { notifications: socketNotifications, setNotifications, setUnreadCount } = useSocket();
  const router = useRouter();
  const [notifications, setLocalNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sync with socket notifications
  useEffect(() => {
    if (socketNotifications?.length > 0) {
      setLocalNotifications(socketNotifications);
    }
  }, [socketNotifications]);

  const fetchNotifications = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      setLocalNotifications(res.data.notifications || []);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const storedToken = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      setLocalNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${storedToken}` } }
      );

      setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all');
    }
  };

  const deleteOne = async (id) => {
    try {
      const storedToken = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      const deleted = notifications.find(n => n._id === id);
      setLocalNotifications(prev => prev.filter(n => n._id !== id));
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const clearAll = async () => {
    if (!confirm('Delete all notifications?')) return;
    try {
      const storedToken = localStorage.getItem('token');
      await axios.delete(`${API_URL}/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });

      setLocalNotifications([]);
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear');
    }
  };

  const handleClick = (notif) => {
    if (!notif.read) markAsRead(notif._id);
    if (notif.link) router.push(notif.link);
  };

  const getIcon = (type) => {
    const icons = {
      message: { Icon: FaComment, color: 'bg-blue-100 text-blue-600' },
      blood_request: { Icon: FaHeart, color: 'bg-red-100 text-red-600' },
      request_fulfilled: { Icon: FaCheckCircle, color: 'bg-green-100 text-green-600' },
      donation: { Icon: GiBlood, color: 'bg-red-100 text-red-600' },
      system: { Icon: FaTrophy, color: 'bg-yellow-100 text-yellow-600' }
    };
    return icons[type] || icons.system;
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FaBell /> Notifications
            </h1>
            <p className="text-red-100 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-white/20 backdrop-blur hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <FaCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="bg-white/20 backdrop-blur hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <FaTrash className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="card">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === tab.id ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <FaEnvelopeOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              No notifications
            </h3>
            <p className="text-gray-500 text-sm">
              {filter === 'unread' 
                ? 'All notifications are read' 
                : filter === 'read'
                  ? 'No read notifications yet'
                  : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => {
              const { Icon, color } = getIcon(notif.type);
              return (
                <div
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={`card cursor-pointer hover:border-red-300 transition-colors flex gap-4 group ${
                    !notif.read ? 'border-l-4 border-l-red-600 bg-red-50/30' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {notif.title}
                          {!notif.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notif._id);
                            }}
                            className="p-1.5 hover:bg-green-100 rounded text-gray-400 hover:text-green-600"
                            title="Mark as read"
                          >
                            <FaCheck className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOne(notif._id);
                          }}
                          className="p-1.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}