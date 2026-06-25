import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

/**
 * Called once at app startup. If the user has a persisted session (user + token
 * in localStorage) but the access token might be stale, we proactively call
 * /auth/refresh so the app never hits an unexpected 401 on the first render.
 *
 * If there is no persisted session at all, this is a no-op.
 * If the refresh token cookie has expired (>24 hrs), we clear the store so the
 * user is sent to login cleanly.
 */
export function useSessionRestore() {
  const { user, accessToken, setAccessToken, setRestoring, logout } = useAuthStore();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    // No persisted session — nothing to restore.
    if (!user && !accessToken) return;

    const restore = async () => {
      setRestoring(true);
      try {
        const { data } = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true },
        );
        setAccessToken(data.data.accessToken);
      } catch {
        // Refresh token cookie has expired — force a clean logout.
        logout();
      } finally {
        setRestoring(false);
      }
    };

    restore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
