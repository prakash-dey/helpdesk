import { api } from '@/lib/axios';

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { email: string; password: string; name: string; orgName?: string }
export interface AcceptInvitePayload { token: string; name: string; password: string }

export async function login(payload: LoginPayload) {
  const { data } = await api.post<{ data: { accessToken: string } }>('/auth/login', payload);
  return data.data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<{ data: { accessToken: string } }>('/auth/register', payload);
  return data.data;
}

export async function acceptInvite(payload: AcceptInvitePayload) {
  const { data } = await api.post<{ data: { accessToken: string } }>('/auth/accept-invite', payload);
  return data.data;
}

export async function getMe() {
  const { data } = await api.get<{ data: { id: string; email: string; name: string; role: string; orgId?: string } }>('/auth/me');
  return data.data;
}
