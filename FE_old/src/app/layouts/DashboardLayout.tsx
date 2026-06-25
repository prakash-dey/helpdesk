import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ToastContainer } from '@/components/ui/Toast';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function DashboardLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const isRestoring = useAuthStore((s) => s.isRestoring);

  // Wait for silent refresh to complete before deciding to redirect.
  if (isRestoring) return <FullPageSpinner />;

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
