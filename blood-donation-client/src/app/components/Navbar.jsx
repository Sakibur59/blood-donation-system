'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { GiBloodDrop } from 'react-icons/gi';
import { 
  FaHome, FaInfoCircle, FaPhone, FaBlog, FaUser, 
  FaSignOutAlt, FaBars, FaTimes, FaChevronDown,
  FaHeart, FaHospital, FaUserMd, FaCog, FaTint
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

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
              <GiBloodDrop className="w-10 h-10 text-red-600 blood-drop-animation" />
              <GiBloodDrop className="w-6 h-6 text-red-400 absolute -top-1 -right-1 blood-drop-animation-delayed opacity-50" />
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
              <div className="relative profile-dropdown">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center space-x-3 bg-red-50 hover:bg-red-100 rounded-full px-3 py-2 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
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
                          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors duration-200 text-gray-700"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FaUser className="w-4 h-4 text-red-600" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors duration-200 text-gray-700"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FaCog className="w-4 h-4 text-red-600" />
                          <span className="font-medium">Profile Settings</span>
                        </Link>
                        <div className="border-t my-2"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors duration-200"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
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
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
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
                    href={getDashboardLink()}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors duration-200 text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors duration-200 text-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaCog className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Profile Settings</span>
                  </Link>
                  <div className="border-t my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors duration-200"
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