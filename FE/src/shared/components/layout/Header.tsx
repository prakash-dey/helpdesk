import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { logout as logoutAction } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { logoutRequest } from '@/features/auth/auth.api';

export function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  async function handleLogout() {
    try {
      await logoutRequest();
    } finally {
      dispatch(logoutAction());
      navigate('/auth/login',{ replace: true });
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Workspace</p>
        <p className="text-sm font-semibold text-slate-950">Acme Support</p>
      </div>

      <Button variant="secondary" size="sm" onClick={handleLogout}>
        Sign out
      </Button>
    </header>
  );
}