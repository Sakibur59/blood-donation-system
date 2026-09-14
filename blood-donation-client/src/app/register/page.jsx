'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GiBloodDrop } from 'react-icons/gi';
import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, 
  FaCalendarAlt, FaEye, FaEyeSlash, FaUserMd
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bloodGroup: '',
    age: '',
    address: '',
    role: 'donor'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();
  const { register } = useAuth();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (result.success) {
      // Upload profile image if selected
      if (profileImage) {
        const { uploadProfileImage } = useAuth();
        await uploadProfileImage(profileImage);
      }
      router.push(`/${result.user.role}/dashboard`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 border border-red-100"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <GiBloodDrop className="w-20 h-20 text-red-600 blood-drop-animation" />
              <GiBloodDrop className="w-10 h-10 text-red-400 absolute -top-2 -right-2 blood-drop-animation-delayed opacity-50" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join the community of life-savers</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center overflow-hidden cursor-pointer border-4 border-red-200 hover:border-red-400 transition-colors"
                onClick={() => document.getElementById('profileImageInput').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <FaUser className="w-10 h-10 text-red-400 mx-auto" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                  </div>
                )}
              </div>
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="absolute bottom-0 right-0 bg-red-600 rounded-full p-1.5 border-2 border-white">
                <FaCamera className="w-3 h-3 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Click to upload profile photo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Age</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="Enter your age"
                  min="16"
                  max="65"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="select-field"
              >
                <option value="donor">🩸 Donor</option>
                <option value="hospital">🏥 Hospital</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Address</label>
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-4 text-gray-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field pl-12 min-h-[80px]"
                placeholder="Enter your address"
                rows="2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-12 pr-12"
                  placeholder="Create password"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-12 pr-12"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}