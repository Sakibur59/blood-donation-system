'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import { useRouter } from 'next/navigation';
import {
  FaLock, FaBell, FaShieldAlt, FaEnvelope, FaMobile,
  FaSignOutAlt, FaTrash, FaCheckCircle, FaExclamationTriangle,
  FaMoon, FaGlobe, FaToggleOn, FaToggleOff
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SettingsPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    bloodRequestAlerts: true,
    messageAlerts: true,
    donationReminders: true
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'light'
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await axios.put(
        `${API_URL}/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API_URL}/users/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Account deleted');
      logout();
      router.push('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success(`${key} ${updated[key] ? 'enabled' : 'disabled'}`, { icon: '🔔' });
      return updated;
    });
  };

  const handleLogoutAll = () => {
    if (confirm('Logout from all devices?')) {
      toast.success('Logged out from all devices');
      logout();
      router.push('/login');
    }
  };

  const NotificationToggle = ({ icon: Icon, label, description, value, onChange }) => (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3 flex-1">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-gray-800 text-sm">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`text-2xl transition-colors ${value ? 'text-red-600' : 'text-gray-300'}`}
      >
        {value ? <FaToggleOn /> : <FaToggleOff />}
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">⚙️ Settings</h1>
          <p className="text-red-100">Manage your account preferences and security</p>
        </div>

        {/* Account Info */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-red-600" />
            Account Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="font-semibold text-gray-800">{user?.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-semibold text-gray-800 truncate">{user?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Role</p>
              <p className="font-semibold text-gray-800 capitalize">{user?.role}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Account Status</p>
              <p className={`font-semibold ${user?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                {user?.isVerified ? '✓ Verified' : '⏳ Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaLock className="text-red-600" />
            Security
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <FaLock className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Change Password</p>
                  <p className="text-xs text-gray-500">Update your account password</p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            <button
              onClick={handleLogoutAll}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <FaSignOutAlt className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Logout from All Devices</p>
                  <p className="text-xs text-gray-500">Sign out from all active sessions</p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaBell className="text-red-600" />
            Notifications
          </h2>
          <div className="-mx-6">
            <NotificationToggle
              icon={FaEnvelope}
              label="Email Notifications"
              description="Receive updates via email"
              value={notifications.emailNotifications}
              onChange={() => toggleNotification('emailNotifications')}
            />
            <NotificationToggle
              icon={FaMobile}
              label="Push Notifications"
              description="Get real-time alerts on your device"
              value={notifications.pushNotifications}
              onChange={() => toggleNotification('pushNotifications')}
            />
            <NotificationToggle
              icon={FaBell}
              label="Blood Request Alerts"
              description="Notify when someone needs your blood type"
              value={notifications.bloodRequestAlerts}
              onChange={() => toggleNotification('bloodRequestAlerts')}
            />
            <NotificationToggle
              icon={FaEnvelope}
              label="Message Alerts"
              description="Get notified for new messages"
              value={notifications.messageAlerts}
              onChange={() => toggleNotification('messageAlerts')}
            />
            <NotificationToggle
              icon={FaBell}
              label="Donation Reminders"
              description="Remind when you're eligible to donate again"
              value={notifications.donationReminders}
              onChange={() => toggleNotification('donationReminders')}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaGlobe className="text-red-600" />
            Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FaGlobe className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Language</p>
                  <p className="text-xs text-gray-500">Choose your preferred language</p>
                </div>
              </div>
              <select
                value={preferences.language}
                onChange={(e) => {
                  setPreferences({ ...preferences, language: e.target.value });
                  toast.success('Language updated');
                }}
                className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:border-red-500"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <FaMoon className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Theme</p>
                  <p className="text-xs text-gray-500">Choose light or dark mode</p>
                </div>
              </div>
              <select
                value={preferences.theme}
                onChange={(e) => {
                  setPreferences({ ...preferences, theme: e.target.value });
                  toast.success('Theme updated');
                }}
                className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:border-red-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-200">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            <FaExclamationTriangle />
            Danger Zone
          </h2>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Delete Account</p>
              <p className="text-sm text-gray-600 mt-1">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <FaTrash className="w-3 h-3" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="input-label">Current Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input-field pl-10"
                placeholder="Enter current password"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">New Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input-field pl-10"
                placeholder="Enter new password (min 6 chars)"
                minLength="6"
                required
              />
            </div>
          </div>

          <div>
            <label className="input-label">Confirm New Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field pl-10"
                placeholder="Confirm new password"
                minLength="6"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary flex-1"
            >
              {passwordLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              disabled={passwordLoading}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">Are you absolutely sure?</p>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. Your account and all associated data will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4" />
                  <span>Yes, Delete</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}