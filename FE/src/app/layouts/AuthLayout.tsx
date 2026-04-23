import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Headphones } from 'lucide-react';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);

  if (isAuthenticated && user?.orgId) {
    return <Navigate to={`/orgs/${user.orgId}/dashboard`} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-lg">
              <Headphones className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SupportDesk Pro</span>
          </div>
        </div>
        <div className="card p-8 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
