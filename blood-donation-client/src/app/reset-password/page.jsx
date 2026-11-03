'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { GiBlood } from 'react-icons/gi';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword: password
      });
      if (res.data.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="btn-primary">Request New Link</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <FaCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Password Reset Successful!</h3>
        <p className="text-gray-500 mb-6">Redirecting to login page...</p>
        <Link href="/login" className="btn-primary">Go to Login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="input-label">New Password</label>
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field pl-12 pr-12"
            placeholder="Min 6 characters"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <div>
        <label className="input-label">Confirm New Password</label>
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field pl-12"
            placeholder="Confirm password"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? (
          <span className="flex items-center justify-center gap-2"><div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>Resetting...</span>
        ) : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 py-20 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
        <div className="text-center mb-8">
          <GiBlood className="w-16 h-16 text-red-600 blood-drop-animation mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-800">Reset Password</h2>
          <p className="text-gray-500 mt-2 text-sm">Enter your new password below.</p>
        </div>
        <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}