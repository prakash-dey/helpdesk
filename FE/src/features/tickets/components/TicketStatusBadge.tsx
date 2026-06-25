import { Badge } from '@/shared/components/ui/Badge';
import type { TicketStatus } from '../tickets.types';

const statusVariant: Record<TicketStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  NEW: 'info',
  OPEN: 'info',
  PENDING: 'warning',
  ON_HOLD: 'warning',
  SOLVED: 'success',
  CLOSED: 'default',
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={statusVariant[status]}>{status.replace('_', ' ')}</Badge>;
}