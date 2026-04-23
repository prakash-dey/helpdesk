import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  orgId?: string;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  /** True while a silent token-refresh is in progress on app startup */
  isRestoring: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  setRestoring: (value: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isRestoring: false,
      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setRestoring: (value) => set({ isRestoring: value }),
      logout: () => set({ accessToken: null, user: null, isRestoring: false }),
      isAuthenticated: () => get().accessToken !== null,
    }),
    {
      name: 'auth',
      // Persist both user and token — token enables instant session restore on reload.
      // The 401-refresh interceptor in axios.ts handles expired tokens transparently.
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
);
