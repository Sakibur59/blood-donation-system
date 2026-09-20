'use client';

import Link from 'next/link';
import { GiBlood } from 'react-icons/gi';
import { 
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, 
  FaGithub, FaYoutube, FaEnvelope, FaPhone, 
  FaMapMarkerAlt, FaHeart, FaArrowRight,
  FaTint, FaHospital, FaUsers, FaHandHoldingHeart
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Find Donors', href: '/donors' },
    { label: 'Blood Banks', href: '/blood-banks' },
    { label: 'Contact', href: '/contact' },
  ];

  const resources = [
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Donation Guide', href: '/guide' },
    { label: 'Eligibility', href: '/eligibility' },
    { label: 'Privacy Policy', href: '/privacy' },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', color: 'hover:bg-blue-600', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com', color: 'hover:bg-sky-500', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com', color: 'hover:bg-pink-600', label: 'Instagram' },
    { icon: FaLinkedin, href: 'https://linkedin.com', color: 'hover:bg-blue-700', label: 'LinkedIn' },
    { icon: FaGithub, href: 'https://github.com', color: 'hover:bg-gray-700', label: 'GitHub' },
    { icon: FaYoutube, href: 'https://youtube.com', color: 'hover:bg-red-600', label: 'YouTube' },
  ];

  const contactInfo = [
    { icon: FaPhone, label: '+880 1234-567890', href: 'tel:+8801234567890' },
    { icon: FaEnvelope, label: 'support@bloodlink.com', href: 'mailto:support@bloodlink.com' },
    { icon: FaMapMarkerAlt, label: 'Dhaka, Bangladesh', href: '#' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      {/* Decorative Blood Drops */}
      <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
        <GiBlood className="w-96 h-96" />
      </div>
      <div className="absolute bottom-0 left-0 opacity-5 pointer-events-none">
        <GiBlood className="w-64 h-64" />
      </div>

      {/* Top CTA Section */}
      <div className="relative border-b border-gray-800">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaHandHoldingHeart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Ready to Save a Life?</h3>
                <p className="text-gray-400">Join our community of blood donors today</p>
              </div>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-red-500/50 hover:scale-105"
            >
              <span>Become a Donor</span>
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <GiBlood className="w-10 h-10 text-red-500 blood-drop-animation" />
              </div>
              <div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                  BloodLink
                </span>
                <span className="block text-xs text-gray-500 -mt-1">Save Lives</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connecting blood donors with those in need. Every drop counts, every donation saves lives. 
              Join us in our mission to ensure no life is lost due to blood shortage.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 pt-2">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 ${social.color} hover:scale-110`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center space-x-2">
              <span className="w-1 h-6 bg-red-600 rounded-full"></span>
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-0 group-hover:w-3 h-0.5 bg-red-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center space-x-2">
              <span className="w-1 h-6 bg-red-600 rounded-full"></span>
              <span>Resources</span>
            </h4>
            <ul className="space-y-3">
              {resources.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200 text-sm flex items-center group"
                  >
                    <span className="w-0 group-hover:w-3 h-0.5 bg-red-500 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-5 flex items-center space-x-2">
              <span className="w-1 h-6 bg-red-600 rounded-full"></span>
              <span>Get in Touch</span>
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <li key={index}>
                    <a
                      href={info.href}
                      className="flex items-start space-x-3 text-gray-400 hover:text-red-500 transition-colors duration-200 text-sm group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-red-600 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="pt-2">{info.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Emergency Box */}
            <div className="mt-6 p-4 bg-red-600/10 border border-red-600/30 rounded-xl">
              <div className="flex items-center space-x-2 mb-1">
                <FaTint className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-red-500">Emergency?</span>
              </div>
              <p className="text-xs text-gray-400">
                Call our 24/7 hotline: <span className="text-white font-bold">16263</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <FaUsers className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold text-white">10,000+</span>
            </div>
            <p className="text-xs text-gray-500">Active Donors</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <FaHeart className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold text-white">30,000+</span>
            </div>
            <p className="text-xs text-gray-500">Lives Saved</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <FaHospital className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold text-white">500+</span>
            </div>
            <p className="text-xs text-gray-500">Blood Banks</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 relative z-10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center md:text-left">
              © {currentYear} <span className="text-white font-semibold">BloodLink</span>. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 flex items-center space-x-1 text-center md:text-right">
              <span>Made with</span>
              <FaHeart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>for saving lives</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}