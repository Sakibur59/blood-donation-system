'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { GiBlood } from 'react-icons/gi';
import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, 
  FaCalendarAlt, FaEye, FaEyeSlash, FaUserMd, 
  FaHospital, FaCamera, FaCheckCircle, FaIdCard,
  FaGlobe, FaBriefcaseMedical
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Register() {
  const [step, setStep] = useState('role'); // 'role' or 'form'
  const [formData, setFormData] = useState({
    // Common
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    role: 'donor',
    
    // Donor specific
    bloodGroup: '',
    age: '',
    
    // Hospital specific
    hospitalName: '',
    registrationNumber: '',
    contactPerson: '',
    hospitalType: 'general',
    website: '',
    emergencyHotline: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const router = useRouter();
  const { register, uploadProfileImage } = useAuth();
  const fileInputRef = useRef(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const hospitalTypes = [
    { value: 'general', label: '🏥 General Hospital' },
    { value: 'specialized', label: '🔬 Specialized Hospital' },
    { value: 'clinic', label: '🩺 Clinic' },
    { value: 'blood_bank', label: '🩸 Blood Bank' },
    { value: 'diagnostic', label: '🔍 Diagnostic Center' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
    setStep('form');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.role === 'donor' && !formData.bloodGroup) {
      toast.error('Please select your blood group');
      return;
    }
    if (formData.role === 'hospital' && !formData.hospitalName) {
      toast.error('Please enter hospital name');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      
      // For hospital, use hospitalName as name if name is empty
      if (formData.role === 'hospital' && !userData.name) {
        userData.name = formData.hospitalName;
      }

      const result = await register(userData);

      if (result.success) {
        // Upload profile image if provided
        if (profileImage) {
          await uploadProfileImage(profileImage);
        }
        toast.success('Account created successfully! Welcome to BloodLink 🩸');
        router.push(`/${result.user.role}/dashboard`);
      }
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============ STEP 1: Role Selection ============
  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl w-full"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <GiBlood className="w-20 h-20 text-red-600 blood-drop-animation" />
                <GiBlood className="w-10 h-10 text-red-400 absolute -top-2 -right-2 blood-drop-animation-delayed opacity-50" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
              Join <span className="gradient-text">BloodLink</span>
            </h1>
            <p className="text-gray-500 text-lg">Choose how you want to use the platform</p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Donor Card */}
            <motion.button
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('donor')}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-red-500 transition-all text-left group"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <GiBlood className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                I'm a Donor 🩸
              </h3>
              <p className="text-gray-600 mb-5">
                Donate blood and help save lives. Get notified when your blood type is needed nearby.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  Donate blood to blood banks
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  Respond to emergency requests
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  Track your donation history
                </li>
              </ul>
              <div className="mt-6 pt-5 border-t flex items-center justify-between">
                <span className="text-red-600 font-semibold">Continue as Donor</span>
                <span className="text-red-600 text-xl group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </motion.button>

            {/* Hospital Card */}
            <motion.button
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('hospital')}
              className="bg-white rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-blue-500 transition-all text-left group"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FaHospital className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                I'm a Hospital 🏥
              </h3>
              <p className="text-gray-600 mb-5">
                Request blood for your patients and connect with verified donors in your area.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  Create blood requests
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  Find donors instantly
                </li>
                <li className="flex items-center gap-2">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  Manage patient blood needs
                </li>
              </ul>
              <div className="mt-6 pt-5 border-t flex items-center justify-between">
                <span className="text-blue-600 font-semibold">Continue as Hospital</span>
                <span className="text-blue-600 text-xl group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </motion.button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============ STEP 2: Registration Form ============
  const isDonor = formData.role === 'donor';
  const isHospital = formData.role === 'hospital';

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
          <button
            onClick={() => setStep('role')}
            className="mb-4 text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 mx-auto"
          >
            ← Change role
          </button>
          
          <div className="flex justify-center mb-4">
            {isDonor ? (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <GiBlood className="w-10 h-10 text-white" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <FaHospital className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-800">
            {isDonor ? 'Donor Registration' : 'Hospital Registration'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isDonor 
              ? 'Create your donor account to start saving lives' 
              : 'Register your hospital to request blood'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div 
                className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden cursor-pointer border-4 transition-colors ${
                  isDonor ? 'bg-red-100 border-red-200 hover:border-red-400' : 'bg-blue-100 border-blue-200 hover:border-blue-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : isHospital ? (
                  <div className="text-center">
                    <FaHospital className="w-10 h-10 text-blue-400 mx-auto" />
                    <span className="text-xs text-gray-500">Logo</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <FaUser className="w-10 h-10 text-red-400 mx-auto" />
                    <span className="text-xs text-gray-500">Photo</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div className={`absolute bottom-0 right-0 rounded-full p-1.5 border-2 border-white ${
                isDonor ? 'bg-red-600' : 'bg-blue-600'
              }`}>
                <FaCamera className="w-3 h-3 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isHospital ? 'Upload hospital logo (optional)' : 'Upload profile photo (optional)'}
            </p>
          </div>

          {/* ============ DONOR FIELDS ============ */}
          {isDonor && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Full Name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
                  <label className="input-label">Email Address *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Phone Number *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="+880 1XXX-XXXXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Blood Group *</label>
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
                  <label className="input-label">Age *</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="16-65"
                      min="16"
                      max="65"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label">Address *</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-3 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-12 min-h-[80px]"
                    placeholder="Your area, city"
                    rows="2"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* ============ HOSPITAL FIELDS ============ */}
          {isHospital && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Hospital Name *</label>
                  <div className="relative">
                    <FaHospital className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="hospitalName"
                      value={formData.hospitalName}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="e.g., City Hospital"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Email Address *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="hospital@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Hospital Type *</label>
                  <select
                    name="hospitalType"
                    value={formData.hospitalType}
                    onChange={handleChange}
                    className="select-field"
                    required
                  >
                    {hospitalTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Registration Number *</label>
                  <div className="relative">
                    <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="Hospital license/reg no."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Contact Person *</label>
                  <div className="relative">
                    <FaUserMd className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="Admin/Manager name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Main Phone *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="+880 1XXX-XXXXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Emergency Hotline</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="emergencyHotline"
                      value={formData.emergencyHotline}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="Emergency contact"
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Website (Optional)</label>
                  <div className="relative">
                    <FaGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="input-field pl-12"
                      placeholder="https://hospital.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="input-label">Full Address *</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-3 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-field pl-12 min-h-[80px]"
                    placeholder="Street, area, city, postal code"
                    rows="2"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* ============ PASSWORD FIELDS (COMMON) ============ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Password *</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-12 pr-12"
                  placeholder="Min 6 characters"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirm Password *</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-lg rounded-lg font-semibold transition-all ${
              isDonor 
                ? 'btn-primary' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            } disabled:opacity-50`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                {isDonor ? <GiBlood /> : <FaHospital />}
                Create {isDonor ? 'Donor' : 'Hospital'} Account
              </span>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-red-600 hover:text-red-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}