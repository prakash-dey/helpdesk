import { apiClient } from '@/shared/api/apiClient';

type LoginPayload = {
  email: string;
  password: string;
};

type AuthResponse = {
  data: {
    accessToken: string;
  };
};

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data.data;
}

export async function refreshSession() {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh');
  return data.data;
}

export async function logoutRequest() {
  await apiClient.post('/auth/logout');
}