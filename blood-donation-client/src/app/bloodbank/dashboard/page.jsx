'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import RoleGuard from '../../components/RoleGuard';
import { FaHospital, FaTint, FaSave, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function BloodBankContent() {
  const { user, token } = useAuth();
  const [bankId, setBankId] = useState('');
  const [bankName, setBankName] = useState('');
  const [stock, setStock] = useState({
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const res = await axios.get(`${API_URL}/blood-banks`, { headers: { Authorization: `Bearer ${token}` } });
        
        // ✅ ইমেইল দিয়ে ম্যাচ করা হচ্ছে
        const myBank = res.data.find(b => b.email === user.email);
        
        if (myBank) {
          setBankId(myBank._id);
          setBankName(myBank.name);
          setStock(myBank.bloodGroups || stock);
        } else {
          toast.error('Blood Bank profile not found. Please contact Admin.');
        }
      } catch (error) {
        toast.error('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };
    fetchBankData();
  }, [user, token]);

  const handleStockChange = (group, value) => {
    setStock(prev => ({ ...prev, [group]: Math.max(0, parseInt(value) || 0) }));
  };

  const handleSave = async () => {
    if (!bankId) return toast.error('Blood Bank not registered yet');
    
    setSaving(true);
    try {
      await axios.put(`${API_URL}/bloodbank/update-stock`, 
        { bloodBankId: bankId, bloodGroups: stock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Inventory updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  const totalUnits = Object.values(stock).reduce((a, b) => a + b, 0);
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <FaHospital className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 mb-2">
            <FaHospital /> {bankName || 'Blood Bank Portal'}
          </h1>
          <p className="text-green-100">Manage your live blood inventory here</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="relative z-10 bg-white text-green-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          {saving ? <div className="animate-spin h-5 w-5 border-b-2 border-green-700 rounded-full"></div> : <FaSave />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-green-50 dark:bg-gray-800 border-green-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Total Stock</p>
          <p className="text-3xl font-bold text-green-600">{totalUnits} Units</p>
        </div>
        <div className="card bg-blue-50 dark:bg-gray-800 border-blue-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Available Types</p>
          <p className="text-3xl font-bold text-blue-600">{Object.values(stock).filter(v => v > 0).length} / 8</p>
        </div>
        <div className="card bg-yellow-50 dark:bg-gray-800 border-yellow-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <p className="text-lg font-bold text-yellow-600 flex items-center gap-2">
            <FaCheckCircle /> Active
          </p>
        </div>
      </div>

      {/* Stock Grid */}
      <div className="card dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
          <FaTint className="text-red-500" /> Blood Inventory
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bloodGroups.map(group => {
            const count = stock[group] || 0;
            const isLow = count > 0 && count < 5;
            const isEmpty = count === 0;
            
            return (
              <div key={group} className={`border-2 rounded-xl p-4 text-center transition-all ${
                isEmpty ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : 
                isLow ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10' : 
                'border-green-200 bg-green-50 dark:bg-green-900/10'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-gray-800 dark:text-white text-xl">{group}</p>
                  {isEmpty ? <FaExclamationTriangle className="text-red-500" /> : 
                   isLow ? <FaExclamationTriangle className="text-yellow-500" /> : 
                   <FaCheckCircle className="text-green-500" />}
                </div>
                <input 
                  type="number" 
                  value={count} 
                  onChange={(e) => handleStockChange(group, e.target.value)}
                  className="w-full text-center text-2xl font-bold py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Units Available</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function BloodBankDashboard() {
  return (
    <RoleGuard allowedRole="bloodbank">
      <DashboardLayout>
        <BloodBankContent />
      </DashboardLayout>
    </RoleGuard>
  );
}