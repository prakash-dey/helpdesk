import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export function ProtectedRoute() {
  const { accessToken, user, isSessionRestoring } = useAppSelector(
    (state) => state.auth,
  );

  if (isSessionRestoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-600">
        Restoring session...
      </div>
    );
  }

  if (!accessToken || !user) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}