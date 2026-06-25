import { apiClient } from '@/shared/api/apiClient';
import type { CsatStats, SlaStats, TicketStats } from './dashboard.types';

type ApiResponse<T> = {
  data: T;
};

export async function getTicketStats(orgId: string) {
  const { data } = await apiClient.get<ApiResponse<TicketStats>>(
    `/orgs/${orgId}/analytics/tickets`,
  );

  return data.data;
}

export async function getSlaStats(orgId: string) {
  const { data } = await apiClient.get<ApiResponse<SlaStats>>(
    `/orgs/${orgId}/analytics/sla`,
  );

  return data.data;
}

export async function getCsatStats(orgId: string) {
  const { data } = await apiClient.get<ApiResponse<CsatStats>>(
    `/orgs/${orgId}/analytics/csat`,
  );

  return data.data;
}