'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      if (res.data.success) {
        setSent(true);
        toast.success('Reset link sent! Check your email.');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 py-20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
        
        <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-red-600 mb-6">
          <FaArrowLeft className="mr-2" /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <GiBlood className="w-16 h-16 text-red-600 blood-drop-animation mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-500 mt-2 text-sm">
            {sent ? "We've sent a reset link to your email." : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2"><div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>Sending...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><FaPaperPlane /> Send Reset Link</span>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <button onClick={() => setSent(false)} className="btn-outline w-full py-3">Try another email</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}