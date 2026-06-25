import { useEffect } from 'react';
import { decodeJwt } from '@/shared/lib/jwt';
import { logout, setAccessToken, setSessionRestoring, setUser } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { refreshSession } from './auth.api';

export function useSessionRestore() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function restoreSession() {
      dispatch(setSessionRestoring(true));

      try {
        const result = await refreshSession();
        const claims = decodeJwt(result.accessToken);

        dispatch(setAccessToken(result.accessToken));
        dispatch(
          setUser({
            id: claims.sub,
            email: claims.email,
            role: claims.role,
            orgId: claims.orgId,
          }),
        );
      } catch {
        dispatch(logout());
      } finally {
        dispatch(setSessionRestoring(false));
      }
    }

    restoreSession();
  }, [dispatch]);
}