'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { GiBlood } from 'react-icons/gi';
import { 
  FaHome, FaInfoCircle, FaPhone, FaUser, 
  FaSignOutAlt, FaBars, FaTimes, FaChevronDown,
  FaHeart, FaHospital, FaCog, FaTint, FaBell,
  FaCheck, FaTrash, FaComment, FaCheckCircle,
  FaTrophy, FaEnvelopeOpen
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    setNotifications, 
    setUnreadCount 
  } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    setIsNotifOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isNotifOpen && notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (isDropdownOpen && !e.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen, isDropdownOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsDropdownOpen(false);
    setIsOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/about', label: 'About', icon: FaInfoCircle },
    { href: '/donors', label: 'Find Donors', icon: FaTint },
    { href: '/contact', label: 'Contact', icon: FaPhone },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  const isActiveLink = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // 🔔 Handle notification click
  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read && token) {
        await axios.put(
          `${API_URL}/notifications/${notif._id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotifications(prev =>
          prev.map(n => n._id === notif._id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      if (notif.link) {
        router.push(notif.link);
        setIsNotifOpen(false);
      }
    } catch (error) {
      console.error('Notification click error:', error);
    }
  };

  const markAllAsRead = async (e) => {
    e.stopPropagation();
    if (!token || unreadCount === 0) return;

    try {
      await axios.put(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const deleted = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      message: { Icon: FaComment, color: 'bg-blue-100 text-blue-600' },
      blood_request: { Icon: FaHeart, color: 'bg-red-100 text-red-600' },
      request_fulfilled: { Icon: FaCheckCircle, color: 'bg-green-100 text-green-600' },
      donation: { Icon: GiBlood, color: 'bg-red-100 text-red-600' },
      system: { Icon: FaTrophy, color: 'bg-yellow-100 text-yellow-600' },
    };
    return icons[type] || icons.system;
  };

  const formatTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <GiBlood className="w-10 h-10 text-red-600 blood-drop-animation" />
              <GiBlood className="w-6 h-6 text-red-400 absolute -top-1 -right-1 blood-drop-animation-delayed opacity-50" />
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-extrabold gradient-text">BloodLink</span>
              <span className="block text-xs text-gray-500 -mt-1">Save Lives</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 transition-colors duration-200 font-medium group ${
                    active ? 'text-red-600' : 'text-gray-700 hover:text-red-600'
                  }`}
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {user ? (
              <div className="flex items-center space-x-2">
                {/* 🔔 Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNotifOpen(!isNotifOpen);
                      setIsDropdownOpen(false);
                    }}
                    className="relative p-2.5 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Notifications"
                  >
                    <FaBell className="w-5 h-5 text-gray-700" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="p-3 border-b bg-gradient-to-r from-red-50 to-pink-50 flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                              <p className="text-xs text-red-600">{unreadCount} unread</p>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                              <FaCheck className="w-3 h-3" />
                              Mark all read
                            </button>
                          )}
                        </div>

                        {/* List */}
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="text-center py-12">
                              <FaEnvelopeOpen className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm font-medium">No notifications</p>
                              <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((notif) => {
                              const { Icon, color } = getNotificationIcon(notif.type);
                              return (
                                <div
                                  key={notif._id}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 group relative ${
                                    !notif.read ? 'bg-red-50/30' : ''
                                  }`}
                                >
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-sm">
                                      {notif.title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                      {notif.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                      {formatTime(notif.createdAt)}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    {!notif.read && (
                                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                    )}
                                    <button
                                      onClick={(e) => deleteNotification(notif._id, e)}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition-all"
                                      aria-label="Delete"
                                    >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <Link
                            href="/notifications"
                            onClick={() => setIsNotifOpen(false)}
                            className="block p-3 text-center text-red-600 hover:bg-red-50 text-sm font-medium border-t"
                          >
                            View all notifications →
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                      setIsNotifOpen(false);
                    }}
                    className="flex items-center space-x-3 bg-red-50 hover:bg-red-100 rounded-full px-3 py-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-gray-700 max-w-[100px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <FaChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
                      >
                        <div className="p-4 border-b bg-gradient-to-r from-red-50 to-pink-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white font-bold">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'hospital' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="p-2">
                          <Link
                            href={getDashboardLink()}
                            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-gray-700"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FaUser className="w-4 h-4 text-red-600" />
                            <span className="font-medium">Dashboard</span>
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-gray-700"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FaCog className="w-4 h-4 text-red-600" />
                            <span className="font-medium">Profile Settings</span>
                          </Link>
                          <div className="border-t my-2"></div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="btn-outline text-sm py-2 px-4">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Notification Bell */}
            {user && (
              <Link
                href="/notifications"
                className="relative p-2 hover:bg-red-50 rounded-full transition-colors"
              >
                <FaBell className="w-5 h-5 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <FaTimes className="w-6 h-6 text-red-600" />
              ) : (
                <FaBars className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white border-t overflow-hidden shadow-lg"
          >
            <div className="container-custom py-4 space-y-1">
              {user && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl mb-3">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
              )}

              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      active 
                        ? 'bg-red-50 text-red-600' 
                        : 'hover:bg-red-50 text-gray-700'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5 text-red-600" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}

              {user ? (
                <>
                  <Link
                    href="/notifications"
                    className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <FaBell className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-600 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaCog className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Profile Settings</span>
                  </Link>
                  <div className="border-t my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-3 border-t">
                  <Link
                    href="/login"
                    className="btn-outline w-full text-center py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary w-full text-center py-3"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}