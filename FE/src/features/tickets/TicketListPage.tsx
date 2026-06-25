import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { useAppSelector } from "@/store/hooks";
import { useTickets } from "./tickets.queries";
import { TicketPriorityBadge } from "./components/TicketPriorityBadge";
import { TicketStatusBadge } from "./components/TicketStatusBadge";

export function TicketListPage() {
  const orgId = useAppSelector((state) => state.auth.user?.orgId);
  const { data, isLoading, isError } = useTickets(orgId, { limit: 25 });
  const navigate = useNavigate();
  const handleClick = () => {
    if (orgId) {
      navigate(`/orgs/${orgId}/tickets/new`);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Tickets</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track customer issues and agent activity.
          </p>
        </div>

        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={handleClick}>
          New ticket
        </Button>
      </div>

      <Card className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <TicketSkeleton />
            <TicketSkeleton />
            <TicketSkeleton />
          </div>
        ) : null}

        {isError ? (
          <div className="p-5">
            <p className="font-medium text-red-700">Could not load tickets.</p>
            <p className="mt-1 text-sm text-slate-600">
              Please check the backend and your access.
            </p>
          </div>
        ) : null}

        {!isLoading && !isError && data?.data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium text-slate-950">No tickets yet</p>
            <p className="mt-1 text-sm text-slate-600">
              New customer requests will appear here.
            </p>
          </div>
        ) : null}

        {!isLoading && !isError && data && data.data.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.data.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/orgs/${orgId}/tickets/${ticket.id}`}
                className="block p-5 transition-colors hover:bg-slate-50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <TicketStatusBadge status={ticket.status} />
                      <TicketPriorityBadge priority={ticket.priority} />
                      <span className="text-xs font-medium text-slate-400">
                        {ticket.channel}
                      </span>
                    </div>

                    <h2 className="mt-3 truncate font-semibold text-slate-950">
                      {ticket.subject}
                    </h2>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="shrink-0 text-left text-sm lg:w-56 lg:text-right">
                    <p className="font-medium text-slate-950">
                      {ticket.requester.name}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {ticket.assignee
                        ? `Assigned to ${ticket.assignee.name}`
                        : "Unassigned"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div className="rounded-md border border-slate-100 p-4">
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded bg-slate-100" />
        <div className="h-6 w-16 rounded bg-slate-100" />
      </div>
      <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-full rounded bg-slate-100" />
    </div>
  );
}
