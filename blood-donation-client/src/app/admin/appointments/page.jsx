'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import RoleGuard from '../../components/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import { FaCalendarCheck, FaUser, FaHospital, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function AdminAppointmentsContent() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data.appointments || []);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/admin/appointments/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
            <FaCalendarCheck /> Appointments
          </h1>
          <p className="text-purple-100">Manage donor appointments for blood banks</p>
        </div>

        {loading ? (
          <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-purple-600 mx-auto rounded-full"></div></div>
        ) : appointments.length === 0 ? (
          <div className="card text-center py-10 text-gray-500">No appointments booked yet.</div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appt) => (
              <div key={appt._id} className="card dark:bg-gray-800 dark:border-gray-700 flex flex-wrap justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appt.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {appt.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Booked: {new Date(appt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div className="flex items-start gap-2">
                      <FaUser className="text-red-500 mt-1" />
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{appt.donor?.name || 'Unknown Donor'}</p>
                        <p className="text-sm text-gray-500">{appt.donor?.bloodGroup} • {appt.donor?.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaHospital className="text-blue-500 mt-1" />
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{appt.bank?.name || 'Unknown Bank'}</p>
                        <p className="text-sm text-gray-500">{appt.bank?.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg inline-flex">
                    <FaClock /> {new Date(appt.date).toLocaleDateString()} at {appt.timeSlot}
                  </div>
                </div>

                {appt.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateStatus(appt._id, 'approved')} className="btn-primary text-sm px-4 py-2 flex items-center gap-1">
                      <FaCheck /> Approve
                    </button>
                    <button onClick={() => updateStatus(appt._id, 'cancelled')} className="btn-outline text-sm px-4 py-2 text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-1">
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AdminAppointmentsPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminAppointmentsContent />
    </RoleGuard>
  );
}