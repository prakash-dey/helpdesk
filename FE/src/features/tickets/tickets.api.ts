import { apiClient } from '@/shared/api/apiClient';
import type { CreateTicketPayload, CursorPage, Ticket, TicketListParams } from './tickets.types';

export async function listTickets(orgId: string, params: TicketListParams = {}) {
  const { data } = await apiClient.get<CursorPage<Ticket>>(
    `/orgs/${orgId}/tickets`,
    { params },
  );

  return data;
}

type ApiResponse<T> = {
  data: T;
};

export async function createTicket(
  orgId: string,
  payload: CreateTicketPayload,
) {
  const { data } = await apiClient.post<ApiResponse<Ticket>>(
    `/orgs/${orgId}/tickets`,
    payload,
  );

  return data.data;
}


export async function getTicket(orgId: string, ticketId: string) {
  const { data } = await apiClient.get<ApiResponse<Ticket>>(
    `/orgs/${orgId}/tickets/${ticketId}`,
  );

  return data.data;
}