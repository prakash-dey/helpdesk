import { Badge } from '@/shared/components/ui/Badge';
import type { TicketPriority } from '../tickets.types';

const priorityVariant: Record<TicketPriority, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'danger',
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge variant={priorityVariant[priority]}>{priority}</Badge>;
}