'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { GiBlood } from 'react-icons/gi';

export default function RoleGuard({ allowedRole, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
        return;
      }
      if (user.role !== allowedRole) {
        router.replace(`/${user.role}/dashboard`);
        return;
      }
    }
  }, [user, loading, allowedRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <GiBlood className="w-16 h-16 text-red-600 blood-drop-animation mx-auto mb-4" />
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== allowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view this page</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}