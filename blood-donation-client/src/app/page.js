'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { 
  FaHeart, FaUsers, FaHospital, FaAmbulance, FaChartLine, 
  FaHandHoldingHeart, FaShieldAlt, FaClock, FaAward,
  FaQuoteLeft, FaArrowRight, FaSearch, FaTrophy
} from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDonors: 1524,
    totalRequests: 342,
    pendingRequests: 67,
    livesSaved: 1275
  });
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    // Fetch Stats & Leaderboard
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch Stats
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/statistics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalDonors: data.totalDonors || 1524,
            totalRequests: data.totalRequests || 342,
            pendingRequests: data.pendingRequests || 67,
            livesSaved: data.completedDonations || 1275
          });
        }

        // Fetch Leaderboard
        const leadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/donors/leaderboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (leadRes.ok) {
          const leadData = await leadRes.json();
          setLeaderboard(leadData.donors || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const features = [
    {
      icon: <GiBlood className="w-8 h-8" />,
      title: 'Find Donors',
      description: 'Connect with blood donors in your area instantly',
      color: 'red'
    },
    {
      icon: <FaHandHoldingHeart className="w-8 h-8" />,
      title: 'Donate Blood',
      description: 'Save lives by donating blood at nearby centers',
      color: 'pink'
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: 'Safe & Secure',
      description: 'Verified donors and hospitals for your safety',
      color: 'blue'
    },
    {
      icon: <FaClock className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Emergency blood requests handled round the clock',
      color: 'green'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Register',
      description: 'Create your account and complete your profile',
      icon: <FaUsers className="w-8 h-8" />
    },
    {
      step: '02',
      title: 'Find Requests',
      description: 'Browse blood donation requests in your area',
      icon: <FaSearch className="w-8 h-8" />
    },
    {
      step: '03',
      title: 'Donate',
      description: 'Respond to requests and save lives',
      icon: <FaHeart className="w-8 h-8" />
    },
    {
      step: '04',
      title: 'Track Impact',
      description: 'Monitor your donation history and impact',
      icon: <FaChartLine className="w-8 h-8" />
    }
  ];

  const testimonials = [
    {
      quote: "BloodLink made it so easy to find donors during an emergency. The platform saved my father's life.",
      name: "Sarah Ahmed",
      role: "Family Member",
      image: "https://ui-avatars.com/api/?name=Sarah+Ahmed&background=dc2626&color=fff&size=60"
    },
    {
      quote: "I've been donating blood for years, but BloodLink made the process more meaningful and connected.",
      name: "Md. Rahman",
      role: "Regular Donor",
      image: "https://ui-avatars.com/api/?name=Md.+Rahman&background=dc2626&color=fff&size=60"
    },
    {
      quote: "As a hospital, we rely on BloodLink for urgent blood requests. It's been a game-changer for us.",
      name: "Dr. Nusrat Jahan",
      role: "Hospital Administrator",
      image: "https://ui-avatars.com/api/?name=Dr.+Nusrat+Jahan&background=dc2626&color=fff&size=60"
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { staggerChildren: 0.1 },
    viewport: { once: true }
  };

  return (
    <div className="pt-20 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-red-200 dark:bg-red-900/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-200 dark:bg-pink-900/20 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        
        <div className="container-custom relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-full text-red-700 dark:text-red-400 text-sm font-semibold mb-6">
                <GiBlood className="w-4 h-4 animate-pulse" />
                <span>Every Drop Counts</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="text-gray-800 dark:text-white">Donate Blood,</span>
                <br />
                <span className="gradient-text">Save Lives</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                Connect with donors, request blood, and make a difference in someone's life. 
                Join thousands of heroes saving lives every day.
              </p>
              <div className="flex flex-wrap gap-4">
                {!user ? (
                  <>
                    <Link href="/register" className="btn-primary text-lg px-8 py-3">
                      Get Started
                      <FaArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/about" className="btn-outline text-lg px-8 py-3 dark:border-gray-600 dark:text-gray-300">
                      Learn More
                    </Link>
                  </>
                ) : (
                  <Link href={`/${user.role}/dashboard`} className="btn-primary text-lg px-8 py-3">
                    Go to Dashboard
                    <FaArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-3xl font-bold text-red-600">{stats.totalDonors}+</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Donors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600">{stats.livesSaved}+</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lives Saved</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Requests</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">24/7</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Support</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50 dark:border-gray-700">
                  <div className="flex justify-center mb-6">
                    <GiBlood className="w-24 h-24 text-red-600 blood-drop-animation" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <FaHeart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">Emergency Response</p>
                        <p className="text-sm text-gray-500">Average response time: 15 mins</p>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <FaUsers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">Verified Donors</p>
                        <p className="text-sm text-gray-500">100% verified profiles</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <FaHospital className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">Blood Banks</p>
                        <p className="text-sm text-gray-500">50+ registered blood banks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 🏆 NEW: Leaderboard Section */}
      <section className="py-20 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 rounded-full text-sm font-semibold mb-4">
              <FaTrophy /> Hall of Fame
            </span>
            <h2 className="section-title text-gray-900 dark:text-white">Our Top <span className="gradient-text">Heroes</span></h2>
            <p className="section-subtitle dark:text-gray-400">
              Celebrating the selfless individuals who donate the most
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {leaderboard.length === 0 ? (
              <p className="text-center col-span-3 text-gray-500">Loading leaderboard...</p>
            ) : (
              leaderboard.slice(0, 6).map((donor, index) => (
                <motion.div
                  key={donor._id}
                  {...fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  className="card relative overflow-hidden bg-gray-50 dark:bg-gray-900 border-none flex items-center gap-4"
                >
                  <div className="absolute top-2 right-3 text-4xl font-black text-gray-200 dark:text-gray-700 opacity-50">
                    #{index + 1}
                  </div>
                  <img
                    src={donor.profileImage || `https://ui-avatars.com/api/?name=${donor.name}&background=dc2626&color=fff&size=100`}
                    alt={donor.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                  <div className="relative z-10">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{donor.name}</h3>
                    <p className="text-sm text-red-600 font-bold mb-1">{donor.bloodGroup} Donor</p>
                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 ${donor.badge.color}`}>
                      {donor.badge.icon} {donor.badge.level} • {donor.donationCount} donations
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold mb-4">
              Why BloodLink
            </span>
            <h2 className="section-title text-gray-900 dark:text-white">Why Choose <span className="gradient-text">BloodLink?</span></h2>
            <p className="section-subtitle dark:text-gray-400">
              Making blood donation easier, faster, and more accessible for everyone
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="card bg-gray-50 dark:bg-gray-900 border-none group hover:bg-red-50/50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 text-${feature.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="section-title text-gray-900 dark:text-white">How It <span className="gradient-text">Works</span></h2>
            <p className="section-subtitle dark:text-gray-400">
              Four simple steps to start saving lives today
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <div className="text-white text-3xl font-bold">{item.step}</div>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[40%] h-0.5 bg-red-300 dark:bg-red-800"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div {...fadeInUp}>
              <div className="text-5xl font-bold mb-2">{stats.totalDonors}+</div>
              <p className="text-red-100">Active Donors</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <div className="text-5xl font-bold mb-2">{stats.livesSaved}+</div>
              <p className="text-red-100">Lives Saved</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <div className="text-5xl font-bold mb-2">50+</div>
              <p className="text-red-100">Blood Banks</p>
            </motion.div>
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <p className="text-red-100">Emergency Support</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="section-title text-gray-900 dark:text-white">What People <span className="gradient-text">Say</span></h2>
            <p className="section-subtitle dark:text-gray-400">
              Real stories from real people who made a difference
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="card bg-gray-50 dark:bg-gray-900 border-none"
              >
                <FaQuoteLeft className="w-8 h-8 text-red-200 dark:text-red-900 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900">
        <div className="container-custom text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Make a <span className="text-red-200">Difference?</span>
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Join thousands of donors saving lives every day. Your donation can save up to 3 lives.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {!user ? (
                <>
                  <Link href="/register" className="btn-white text-lg px-8 py-3">
                    Start Donating Now
                  </Link>
                  <Link href="/about" className="btn-outline text-white border-white hover:bg-white hover:text-red-600 text-lg px-8 py-3">
                    Learn More
                  </Link>
                </>
              ) : (
                <Link href={`/${user.role}/dashboard`} className="btn-white text-lg px-8 py-3">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}