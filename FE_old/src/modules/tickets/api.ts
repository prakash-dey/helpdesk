import { api } from '@/lib/axios';
import type { Ticket, Comment } from './types';

interface TicketPage {
  data: Ticket[];
  meta: { nextCursor: string | null; hasMore: boolean; limit: number };
}

export async function listTickets(orgId: string, params?: Record<string, string>) {
  const { data } = await api.get<TicketPage>(`/orgs/${orgId}/tickets`, { params });
  return data;
}

export async function getTicket(orgId: string, ticketId: string) {
  const { data } = await api.get<{ data: Ticket }>(`/orgs/${orgId}/tickets/${ticketId}`);
  return data.data;
}

export async function createTicket(orgId: string, payload: { subject: string; description: string; priority: string; channel: string }) {
  const { data } = await api.post<{ data: Ticket }>(`/orgs/${orgId}/tickets`, payload);
  return data.data;
}

export async function updateTicketStatus(orgId: string, ticketId: string, status: string) {
  const { data } = await api.patch<{ data: Ticket }>(`/orgs/${orgId}/tickets/${ticketId}/status`, { status });
  return data.data;
}

export async function assignTicket(orgId: string, ticketId: string, payload: { assigneeId?: string | null; teamId?: string | null }) {
  const { data } = await api.patch<{ data: Ticket }>(`/orgs/${orgId}/tickets/${ticketId}/assign`, payload);
  return data.data;
}

export async function listComments(orgId: string, ticketId: string) {
  const { data } = await api.get<{ data: Comment[] }>(`/orgs/${orgId}/tickets/${ticketId}/comments`);
  return data.data;
}

export async function createComment(orgId: string, ticketId: string, body: string, isInternal: boolean) {
  const { data } = await api.post<{ data: Comment }>(`/orgs/${orgId}/tickets/${ticketId}/comments`, { body, isInternal });
  return data.data;
}
