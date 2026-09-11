'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { 
  FaHeart, FaUsers, FaHospital, FaAmbulance, FaChartLine, 
  FaHandHoldingHeart, FaShieldAlt, FaClock, FaAward,
  FaQuoteLeft, FaArrowRight
} from 'react-icons/fa';
import { GiBloodDrop } from 'react-icons/gi';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDonors: 1524,
    totalRequests: 342,
    pendingRequests: 67,
    livesSaved: 1275
  });

  useEffect(() => {
    // Fetch real stats from API
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/statistics', {
          headers: { Authorization: `Bearer ${token}` }
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
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const features = [
    {
      icon: <GiBloodDrop className="w-8 h-8" />,
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
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-red-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>
        
        <div className="container-custom relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full text-red-700 text-sm font-semibold mb-6">
                <GiBloodDrop className="w-4 h-4 animate-pulse" />
                <span>Every Drop Counts</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                <span className="text-gray-800">Donate Blood,</span>
                <br />
                <span className="gradient-text">Save Lives</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
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
                    <Link href="/about" className="btn-outline text-lg px-8 py-3">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-red-600">{stats.totalDonors}+</p>
                  <p className="text-sm text-gray-500">Active Donors</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600">{stats.livesSaved}+</p>
                  <p className="text-sm text-gray-500">Lives Saved</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                  <p className="text-sm text-gray-500">Pending Requests</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">24/7</p>
                  <p className="text-sm text-gray-500">Emergency Support</p>
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
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
                  <div className="flex justify-center mb-6">
                    <GiBloodDrop className="w-24 h-24 text-red-600 blood-drop-animation" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-2xl p-4 flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <FaHeart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Emergency Response</p>
                        <p className="text-sm text-gray-500">Average response time: 15 mins</p>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4 flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <FaUsers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Verified Donors</p>
                        <p className="text-sm text-gray-500">100% verified profiles</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4 flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <FaHospital className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Blood Banks</p>
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

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              Why BloodLink
            </span>
            <h2 className="section-title">Why Choose <span className="gradient-text">BloodLink?</span></h2>
            <p className="section-subtitle">
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
                className="card group hover:bg-red-50/50 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-100 text-${feature.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-blood">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
            <p className="section-subtitle">
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
                    <div className="hidden lg:block absolute top-12 left-[60%] w-[40%] h-0.5 bg-red-300"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-20 bg-gradient-primary text-white">
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
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="section-title">What People <span className="gradient-text">Say</span></h2>
            <p className="section-subtitle">
              Real stories from real people who made a difference
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <FaQuoteLeft className="w-8 h-8 text-red-200 mb-4" />
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
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