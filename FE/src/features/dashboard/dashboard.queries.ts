import { useQuery } from '@tanstack/react-query';
import { getCsatStats, getSlaStats, getTicketStats } from './dashboard.api';

export function useDashboardStats(orgId?: string) {
  const ticketStats = useQuery({
    queryKey: ['dashboard', orgId, 'ticket-stats'],
    queryFn: () => getTicketStats(orgId!),
    enabled: Boolean(orgId),
  });

  const slaStats = useQuery({
    queryKey: ['dashboard', orgId, 'sla-stats'],
    queryFn: () => getSlaStats(orgId!),
    enabled: Boolean(orgId),
  });

  const csatStats = useQuery({
    queryKey: ['dashboard', orgId, 'csat-stats'],
    queryFn: () => getCsatStats(orgId!),
    enabled: Boolean(orgId),
  });

  return {
    ticketStats,
    slaStats,
    csatStats,
    isLoading:
      ticketStats.isLoading || slaStats.isLoading || csatStats.isLoading,
    isError: ticketStats.isError || slaStats.isError || csatStats.isError,
  };
}