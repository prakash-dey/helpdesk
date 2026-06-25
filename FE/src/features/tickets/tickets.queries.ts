import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTicket, getTicket, listTickets } from './tickets.api';
import type { CreateTicketPayload, TicketListParams } from './tickets.types';

export function useTickets(orgId?: string, params: TicketListParams = {}) {
  return useQuery({
    queryKey: ['tickets', orgId, params],
    queryFn: () => listTickets(orgId!, params),
    enabled: Boolean(orgId),
  });
}

export function useCreateTicket(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => createTicket(orgId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', orgId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', orgId] });
    },
  });
}
export function useTicket(orgId?: string, ticketId?: string) {
  return useQuery({
    queryKey: ['tickets', orgId, ticketId],
    queryFn: () => getTicket(orgId!, ticketId!),
    enabled: Boolean(orgId && ticketId),
  });
}