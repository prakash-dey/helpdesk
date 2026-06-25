import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { useAppSelector } from '@/store/hooks';
import { TicketPriorityBadge } from './components/TicketPriorityBadge';
import { TicketStatusBadge } from './components/TicketStatusBadge';
import { useTicket } from './tickets.queries';

export function TicketDetailPage() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const orgId = useAppSelector((state) => state.auth.user?.orgId);

  const { data: ticket, isLoading, isError } = useTicket(orgId, ticketId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <BackButton />
        <Card>
          <div className="h-6 w-2/3 rounded bg-slate-200" />
          <div className="mt-4 h-4 w-full rounded bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
        </Card>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="space-y-6">
        <BackButton />
        <Card>
          <p className="font-medium text-red-700">Could not load ticket.</p>
          <p className="mt-1 text-sm text-slate-600">
            The ticket may not exist or you may not have access.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => navigate(`/orgs/${orgId}/tickets`)}
      >
        Back to tickets
      </Button>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <span className="text-xs font-medium text-slate-400">
              {ticket.channel}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-950">
            {ticket.subject}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Requested by {ticket.requester.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="font-semibold text-slate-950">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {ticket.description}
          </p>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-950">Details</h2>

          <div className="mt-4 space-y-3">
            <DetailRow label="Assignee" value={ticket.assignee?.name ?? 'Unassigned'} />
            <DetailRow label="Team" value={ticket.team?.name ?? 'No team'} />
            <DetailRow label="Created" value={new Date(ticket.createdAt).toLocaleString()} />
            <DetailRow label="Updated" value={new Date(ticket.updatedAt).toLocaleString()} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function BackButton() {
  const navigate = useNavigate();
  const orgId = useAppSelector((state) => state.auth.user?.orgId);

  return (
    <Button
      variant="ghost"
      size="sm"
      leftIcon={<ArrowLeft className="h-4 w-4" />}
      onClick={() => navigate(`/orgs/${orgId}/tickets`)}
    >
      Back to tickets
    </Button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-950">
        {value}
      </span>
    </div>
  );
}