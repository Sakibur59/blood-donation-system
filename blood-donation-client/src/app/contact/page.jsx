'use client';

import { useState } from 'react';
import { GiBlood } from 'react-icons/gi';
import { 
  FaPhone, FaEnvelope, FaMapMarkerAlt, 
  FaUser, FaPaperPlane, FaClock,
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin,
  FaCheckCircle, FaHeadset, FaAmbulance
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon. ❤️');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Phone',
      value: '+880 1234-567890',
      href: 'tel:+8801234567890',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      value: 'support@bloodlink.com',
      href: 'mailto:support@bloodlink.com',
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Address',
      value: 'Dhaka, Bangladesh',
      href: '#',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: FaClock,
      title: 'Working Hours',
      value: '24/7 Available',
      href: '#',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', color: 'hover:bg-blue-600', label: 'Facebook' },
    { icon: FaTwitter, href: 'https://twitter.com', color: 'hover:bg-sky-500', label: 'Twitter' },
    { icon: FaInstagram, href: 'https://instagram.com', color: 'hover:bg-pink-600', label: 'Instagram' },
    { icon: FaLinkedin, href: 'https://linkedin.com', color: 'hover:bg-blue-700', label: 'LinkedIn' },
  ];

  const faqs = [
    {
      q: 'How quickly can I find a blood donor?',
      a: 'Most requests are fulfilled within 15-30 minutes. Emergency cases are prioritized.'
    },
    {
      q: 'Is BloodLink free to use?',
      a: 'Yes! BloodLink is completely free for all users. Blood donation should never be monetized.'
    },
    {
      q: 'How do I verify my hospital account?',
      a: 'Contact our support team with your hospital registration documents for verification.'
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <GiBlood className="w-96 h-96" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <FaHeadset className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Have questions? We're here to help 24/7. Reach out to us anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-6 bg-yellow-50 border-y-2 border-yellow-200">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <FaAmbulance className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-800">Emergency Blood Needed?</p>
                <p className="text-sm text-gray-600">Call our 24/7 hotline</p>
              </div>
            </div>
            <a
              href="tel:16263"
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              📞 Call 16263
            </a>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.a
                  key={index}
                  href={info.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card text-center group cursor-pointer hover:border-red-300"
                >
                  <div className={`w-16 h-16 rounded-full ${info.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{info.title}</h3>
                  <p className="text-gray-600 text-sm">{info.value}</p>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
                Send Message
              </span>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Let's Start a <span className="gradient-text">Conversation</span>
              </h2>
              <p className="text-gray-600 mb-8">
                Whether you need help finding a donor, want to partner with us, or have 
                any questions, our team is ready to assist you.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Quick Response</h3>
                    <p className="text-sm text-gray-600">
                      We typically respond within 1-2 hours during business hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FaHeadset className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">24/7 Support</h3>
                    <p className="text-sm text-gray-600">
                      Our emergency hotline is available round the clock.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FaUser className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Dedicated Team</h3>
                    <p className="text-sm text-gray-600">
                      Our support team is trained to handle all your queries.
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-8 border-t">
                <p className="text-sm font-semibold text-gray-700 mb-3">Follow us:</p>
                <div className="flex space-x-3">
                  {socialLinks.map((social, i) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={i}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className={`w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:text-white transition-all duration-300 ${social.color} hover:scale-110`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit} className="card">
                <div className="space-y-4">
                  <div>
                    <label className="input-label">Your Name *</label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Email *</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input-field pl-10"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="input-label">Phone</label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="input-field pl-10"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="What is this about?"
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className="input-field"
                      rows="5"
                      placeholder="Tell us how we can help you..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="section-title">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:border-red-300"
              >
                <h3 className="font-bold text-gray-800 mb-2 flex items-start gap-2">
                  <span className="text-red-600">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-gray-600 text-sm pl-6">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}