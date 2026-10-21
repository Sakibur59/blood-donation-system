'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { GiBlood } from 'react-icons/gi';
import { 
  FaHome, FaInfoCircle, FaPhone, FaUser, 
  FaSignOutAlt, FaBars, FaTimes, FaChevronDown,
  FaHeart, FaHospital, FaCog, FaTint, FaBell,
  FaCheck, FaTrash, FaComment, FaCheckCircle,
  FaTrophy, FaEnvelopeOpen, FaMoon, FaSun, FaGlobe
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function Navbar() {
  const { user, token, logout } = useAuth();
  const { notifications, unreadCount, setNotifications, setUnreadCount } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  
  // Theme & Language
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState('en'); // en = English, bn = Bangla

  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    setIsNotifOpen(false);
  }, [pathname]);

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
    { href: '/', label: lang === 'en' ? 'Home' : 'হোম', icon: FaHome },
    { href: '/about', label: lang === 'en' ? 'About' : 'সম্পর্কে', icon: FaInfoCircle },
    { href: '/donors', label: lang === 'en' ? 'Find Donors' : 'ডোনার খুঁজুন', icon: FaTint },
    { href: '/contact', label: lang === 'en' ? 'Contact' : 'যোগাযোগ', icon: FaPhone },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  const isActiveLink = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read && token) {
        await axios.put(`${API_URL}/notifications/${notif._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      if (notif.link) {
        router.push(notif.link);
        setIsNotifOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async (e) => {
    e.stopPropagation();
    if (!token || unreadCount === 0) return;
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed');
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
      const deleted = notifications.find(n => n._id === id);
      if (deleted && !deleted.read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed');
    }
  };

  const formatTime = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative">
              <GiBlood className="w-10 h-10 text-red-600 blood-drop-animation" />
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-extrabold gradient-text dark:text-red-500">BloodLink</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 -mt-1">Save Lives</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.href);
              return (
                <Link key={link.href} href={link.href} className={`flex items-center space-x-2 font-medium ${
                  active ? 'text-red-600' : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
                }`}>
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Theme & Lang Toggle */}
            {mounted && (
              <div className="flex items-center space-x-1 border-x border-gray-200 dark:border-gray-700 px-2">
                <button
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300"
                >
                  {resolvedTheme === 'dark' ? <FaSun className="w-4 h-4 text-yellow-400" /> : <FaMoon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1"
                >
                  <FaGlobe className="w-3 h-3" /> {lang === 'en' ? 'EN' : 'বাং'}
                </button>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-2">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }}
                    className="relative p-2.5 hover:bg-red-50 dark:hover:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300"
                  >
                    <FaBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between">
                          <h3 className="font-bold text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-red-600 hover:underline">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="text-center py-6 text-sm text-gray-500">No notifications</p>
                          ) : (
                            notifications.slice(0, 10).map((notif) => (
                              <div key={notif._id} onClick={() => handleNotificationClick(notif)}
                                className={`p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex gap-3 ${!notif.read ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">{notif.title}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{notif.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                                </div>
                                <button onClick={(e) => deleteNotification(notif._id, e)} className="text-gray-400 hover:text-red-600"><FaTrash className="w-3 h-3"/></button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button onClick={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
                    className="flex items-center space-x-2 bg-red-50 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center overflow-hidden">
                      {user.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-sm">{user.name?.charAt(0)}</span>}
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                    <FaChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b dark:border-gray-700">
                          <p className="font-semibold text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link href={getDashboardLink()} onClick={() => setIsDropdownOpen(false)} className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                            <FaUser className="text-red-600" /> <span>Dashboard</span>
                          </Link>
                          <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm mt-1">
                            <FaSignOutAlt /> <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="btn-outline text-sm py-2 px-4 dark:border-gray-600 dark:text-gray-300">Sign In</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            {mounted && (
              <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2">
                {resolvedTheme === 'dark' ? <FaSun /> : <FaMoon />}
              </button>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="lg:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 overflow-hidden">
            <div className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <link.icon className="text-red-600" /> <span>{link.label}</span>
                </Link>
              ))}
              {user ? (
                <>
                  <Link href={getDashboardLink()} onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <FaUser className="text-red-600" /> <span>Dashboard</span>
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <FaSignOutAlt /> <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 mt-4 pt-4 border-t dark:border-gray-800">
                  <Link href="/login" className="btn-outline w-full text-center py-2">Sign In</Link>
                  <Link href="/register" className="btn-primary w-full text-center py-2">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}