'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { GiBlood } from 'react-icons/gi';
import { 
  FaHome, FaUser, FaEnvelope, FaBell, FaCog, 
  FaSignOutAlt, FaBars, FaTimes, FaCamera,
  FaUsers, FaHospital, FaTint, FaHeart,
  FaClipboardList, FaChartLine, FaDatabase,
  FaHandHoldingHeart, FaPlus, FaHistory,
  FaCommentDots
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const { user, logout, uploadProfileImage } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
    setShowProfileMenu(false);
  }, [pathname]);

  // Profile menu click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showProfileMenu && !e.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadProfileImage(file);
    }
  };

  // Role-based navigation
  const getNavItems = () => {
    const common = [
      { href: `/${user?.role}/dashboard`, icon: FaHome, label: 'Dashboard' },
      { href: '/messages', icon: FaEnvelope, label: 'Messages' },
      { href: '/profile', icon: FaUser, label: 'Profile' },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          { href: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
          { href: '/admin/users', icon: FaUsers, label: 'Manage Users' },
          { href: '/admin/blood-banks', icon: FaHospital, label: 'Blood Banks' },
          { href: '/admin/requests', icon: FaClipboardList, label: 'All Requests' },
          { href: '/admin/donations', icon: FaHistory, label: 'Donations' },
          { href: '/admin/statistics', icon: FaChartLine, label: 'Statistics' },
          { href: '/messages', icon: FaEnvelope, label: 'Messages' },
          { href: '/profile', icon: FaUser, label: 'Profile' },
          { href: '/settings', icon: FaCog, label: 'Settings' },
        ];

      case 'donor':
        return [
          { href: '/donor/dashboard', icon: FaHome, label: 'Dashboard' },
          { href: '/donor/donate', icon: FaHandHoldingHeart, label: 'Donate Blood' },
          { href: '/donor/my-donations', icon: FaHistory, label: 'My Donations' },
          { href: '/donor/requests', icon: FaClipboardList, label: 'Blood Requests' },
          { href: '/donor/blood-banks', icon: FaHospital, label: 'Blood Banks' },
          { href: '/messages', icon: FaEnvelope, label: 'Messages' },
          { href: '/profile', icon: FaUser, label: 'Profile' },
          { href: '/settings', icon: FaCog, label: 'Settings' },
        ];

      case 'hospital':
        return [
          { href: '/hospital/dashboard', icon: FaHome, label: 'Dashboard' },
          { href: '/hospital/request', icon: FaPlus, label: 'New Request' },
          { href: '/hospital/my-requests', icon: FaClipboardList, label: 'My Requests' },
          { href: '/hospital/donors', icon: FaUsers, label: 'Find Donors' },
          { href: '/hospital/blood-banks', icon: FaHospital, label: 'Blood Banks' },
          { href: '/messages', icon: FaEnvelope, label: 'Messages' },
          { href: '/profile', icon: FaUser, label: 'Profile' },
          { href: '/settings', icon: FaCog, label: 'Settings' },
        ];

      default:
        return common;
    }
  };

  // Role-based theme
  const getRoleTheme = () => {
    switch (user?.role) {
      case 'admin':
        return {
          gradient: 'from-purple-600 to-indigo-700',
          lightBg: 'bg-purple-50',
          textColor: 'text-purple-600',
          badgeColor: 'bg-purple-100 text-purple-700',
          avatarGradient: 'from-purple-500 to-indigo-600',
          icon: '👑'
        };
      case 'donor':
        return {
          gradient: 'from-red-600 to-red-700',
          lightBg: 'bg-red-50',
          textColor: 'text-red-600',
          badgeColor: 'bg-red-100 text-red-700',
          avatarGradient: 'from-red-500 to-red-600',
          icon: '🩸'
        };
      case 'hospital':
        return {
          gradient: 'from-blue-600 to-cyan-700',
          lightBg: 'bg-blue-50',
          textColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-700',
          avatarGradient: 'from-blue-500 to-cyan-600',
          icon: '🏥'
        };
      default:
        return {
          gradient: 'from-gray-600 to-gray-700',
          lightBg: 'bg-gray-50',
          textColor: 'text-gray-600',
          badgeColor: 'bg-gray-100 text-gray-700',
          avatarGradient: 'from-gray-500 to-gray-600',
          icon: '👤'
        };
    }
  };

  const navItems = getNavItems();
  const theme = getRoleTheme();

  const isActiveLink = (href) => {
    if (href === `/${user?.role}/dashboard`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-white shadow-lg 
        flex flex-col transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center p-6 border-b">
          <Link href="/" className="flex items-center space-x-2">
            {/* ✅ GiBlood ব্যবহার */}
            <GiBlood className="w-8 h-8 text-red-600 blood-drop-animation" />
            <span className="text-2xl font-extrabold gradient-text">BloodLink</span>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className={`p-4 border-b ${theme.lightBg}`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div 
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.avatarGradient} flex items-center justify-center overflow-hidden cursor-pointer shadow-md`}
                onClick={() => fileInputRef.current?.click()}
              >
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
              >
                <FaCamera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user?.name}</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${theme.badgeColor}`}>
                {theme.icon} {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${active 
                    ? `${theme.lightBg} ${theme.textColor} font-semibold shadow-sm` 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? theme.textColor : ''}`} />
                <span>{item.label}</span>
                {active && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full ${theme.textColor.replace('text-', 'bg-')}`}></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors w-full group"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {user?.role} Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full relative transition-colors">
              <FaBell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>
            
            <div className="relative profile-menu-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${theme.avatarGradient} flex items-center justify-center overflow-hidden`}>
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-white text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border overflow-hidden z-50"
                  >
                    <div className="p-3 border-b bg-gray-50">
                      <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FaUser className="w-4 h-4" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FaCog className="w-4 h-4" />
                      <span className="text-sm">Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-red-50 text-red-600 border-t"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pb-24">
          
          {children}
        </main>
      </div>
    </div>
  );
}