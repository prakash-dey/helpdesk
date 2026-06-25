import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { TicketStatus } from '../types';

const statusConfig: Record<TicketStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }> = {
  NEW: { label: 'New', variant: 'info' },
  OPEN: { label: 'Open', variant: 'warning' },
  PENDING: { label: 'Pending', variant: 'purple' },
  ON_HOLD: { label: 'On Hold', variant: 'default' },
  SOLVED: { label: 'Solved', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'default' },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
