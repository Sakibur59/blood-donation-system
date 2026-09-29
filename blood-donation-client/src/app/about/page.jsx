'use client';

import Link from 'next/link';
import { GiBlood } from 'react-icons/gi';
import { 
  FaHeart, FaUsers, FaHospital, FaAward, 
  FaShieldAlt, FaHandHoldingHeart, FaTint,
  FaArrowRight, FaCheckCircle, FaBullseye,
  FaEye, FaRocket
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const stats = [
    { value: '10,000+', label: 'Active Donors', icon: FaUsers },
    { value: '30,000+', label: 'Lives Saved', icon: FaHeart },
    { value: '500+', label: 'Blood Banks', icon: FaHospital },
    { value: '24/7', label: 'Support', icon: FaShieldAlt },
  ];

  const features = [
    {
      icon: FaHandHoldingHeart,
      title: 'Easy Donation',
      description: 'Simple and quick process to register as a donor and donate blood whenever needed.',
    },
    {
      icon: FaShieldAlt,
      title: 'Safe & Secure',
      description: 'Your data is protected with enterprise-grade security. All donors are verified.',
    },
    {
      icon: FaTint,
      title: 'Real-time Matching',
      description: 'Instantly connect with compatible donors and recipients in your area.',
    },
    {
      icon: FaHospital,
      title: 'Verified Hospitals',
      description: 'Partnered with top hospitals and blood banks for quality assurance.',
    },
    {
      icon: FaBullseye,
      title: 'Smart Notifications',
      description: 'Get alerted when your blood type is urgently needed nearby.',
    },
    {
      icon: FaAward,
      title: 'Recognition',
      description: 'Earn badges and certificates for your life-saving contributions.',
    },
  ];

  const values = [
    {
      icon: FaHeart,
      title: 'Compassion',
      description: 'Every drop counts. We believe in the power of human kindness.',
    },
    {
      icon: FaShieldAlt,
      title: 'Trust',
      description: 'Building a safe and reliable platform for donors and recipients.',
    },
    {
      icon: FaRocket,
      title: 'Innovation',
      description: 'Leveraging technology to save more lives faster.',
    },
    {
      icon: FaUsers,
      title: 'Community',
      description: 'United by a mission to ensure no life is lost due to blood shortage.',
    },
  ];

  const team = [
    {
      name: 'Dr. Sarah Ahmed',
      role: 'Founder & CEO',
      image: 'https://ui-avatars.com/api/?name=Sarah+Ahmed&background=dc2626&color=fff&size=200',
    },
    {
      name: 'Md. Rahman Khan',
      role: 'CTO',
      image: 'https://ui-avatars.com/api/?name=Rahman+Khan&background=dc2626&color=fff&size=200',
    },
    {
      name: 'Dr. Nusrat Jahan',
      role: 'Medical Director',
      image: 'https://ui-avatars.com/api/?name=Nusrat+Jahan&background=dc2626&color=fff&size=200',
    },
    {
      name: 'Fardin Islam',
      role: 'Head of Operations',
      image: 'https://ui-avatars.com/api/?name=Fardin+Islam&background=dc2626&color=fff&size=200',
    },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-red-50 via-white to-pink-50 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-red-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-20"></div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <GiBlood className="w-20 h-20 text-red-600 blood-drop-animation" />
                <GiBlood className="w-10 h-10 text-red-400 absolute -top-2 -right-2 blood-drop-animation-delayed opacity-50" />
              </div>
            </div>
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              About BloodLink
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6">
              Connecting <span className="gradient-text">Lives</span>,<br />
              One Drop at a Time
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              BloodLink is a modern blood donation platform dedicated to bridging the gap between 
              blood donors and those in need. Every donation has the power to save up to 3 lives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-red-100 text-sm">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <FaBullseye className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Our Mission</h2>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                To create a world where no life is lost due to blood shortage. We strive to build 
                a seamless, technology-driven ecosystem that connects blood donors with recipients 
                instantly and efficiently.
              </p>
              <ul className="space-y-3">
                {[
                  'Ensure blood availability within minutes, not hours',
                  'Build the largest verified donor network',
                  'Reduce blood wastage through smart inventory',
                  'Make blood donation a habit, not a burden',
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-red-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <FaEye className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">Our Vision</h2>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  A world where every patient has immediate access to safe blood, and every 
                  eligible person becomes a regular blood donor. We envision a future where 
                  blood shortage is a thing of the past.
                </p>
                <div className="mt-8 p-4 bg-red-50 rounded-xl">
                  <p className="text-red-700 italic font-medium">
                    "The gift of blood is the gift of life. There is no substitute for human blood."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              What We Offer
            </span>
            <h2 className="section-title">
              Features That <span className="gradient-text">Save Lives</span>
            </h2>
            <p className="section-subtitle">
              Everything you need for seamless blood donation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card group hover:bg-white"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                    <Icon className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              Our Values
            </span>
            <h2 className="section-title">
              What <span className="gradient-text">Drives Us</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-2xl border-2 border-red-100 hover:border-red-300 transition-colors"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              Our Team
            </span>
            <h2 className="section-title">
              Meet the <span className="gradient-text">Heroes</span> Behind BloodLink
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center card group"
              >
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
                <p className="text-sm text-red-600 font-medium">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Join Our <span className="text-red-200">Mission</span>
            </h2>
            <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
              Be part of the movement that saves thousands of lives every day.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 bg-white text-red-600 hover:bg-red-50 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>Become a Donor</span>
              <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}