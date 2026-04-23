import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/axios';

export function useAuth() {
  const { user, setUser, accessToken, logout } = useAuthStore();

  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<{ data: typeof user }>('/auth/me');
      if (data.data) setUser(data.data!);
      return data.data;
    },
    enabled: !!accessToken && !user,
    retry: false,
  });

  return {
    user,
    isAuthenticated: !!accessToken,
    isAdmin: user?.role === 'ADMIN',
    isAgent: ['ADMIN', 'TEAM_LEAD', 'AGENT'].includes(user?.role ?? ''),
    isCustomer: user?.role === 'CUSTOMER',
    logout,
  };
}
