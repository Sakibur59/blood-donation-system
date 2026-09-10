'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { GiBloodDrop } from 'react-icons/gi';
import { 
  FaHome, FaInfoCircle, FaPhone, FaBlog, FaUser, 
  FaSignOutAlt, FaBars, FaTimes, FaChevronDown,
  FaHeart, FaHospital, FaUserMd, FaCog
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: FaHome },
    { href: '/about', label: 'About', icon: FaInfoCircle },
    { href: '/contact', label: 'Contact', icon: FaPhone },
    { href: '/blog', label: 'Blog', icon: FaBlog },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <GiBloodDrop className="w-10 h-10 text-red-600 blood-drop-animation" />
              <GiBloodDrop className="w-6 h-6 text-red-400 absolute -top-1 -right-1 blood-drop-animation-delayed opacity-50" />
            </div>
            <div>
              <span className="text-2xl font-extrabold gradient-text">BloodLink</span>
              <span className="block text-xs text-gray-500 -mt-1">Save Lives</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors duration-200 font-medium group"
              >
                <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{link.label}</span>
              </Link>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 bg-red-50 hover:bg-red-100 rounded-full px-4 py-2 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
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
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
                    >
                      <div className="p-4 border-b">
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <div className="p-2">
                        <Link
                          href={getDashboardLink()}
                          className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FaUser className="w-4 h-4 text-red-600" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FaCog className="w-4 h-4 text-red-600" />
                          <span>Profile Settings</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors duration-200"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="btn-outline text-sm">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            {isOpen ? <FaTimes className="w-6 h-6 text-red-600" /> : <FaBars className="w-6 h-6 text-gray-700" />}
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
            className="lg:hidden bg-white/95 backdrop-blur-md border-t overflow-hidden"
          >
            <div className="container-custom py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-700">{link.label}</span>
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaUser className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-gray-700">Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors duration-200"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link
                    href="/login"
                    className="btn-primary w-full text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="btn-outline w-full text-center"
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