import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { listTickets } from './api';
import { StatusBadge } from './components/StatusBadge';
import { PriorityBadge } from './components/PriorityBadge';
import { SlaTimer } from './components/SlaTimer';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useSocket } from '@/hooks/useSocket';
import { queryClient } from '@/lib/queryClient';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' }, { value: 'OPEN', label: 'Open' },
  { value: 'PENDING', label: 'Pending' }, { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'SOLVED', label: 'Solved' }, { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
];

export default function TicketListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const socket = useSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', orgId, filters],
    queryFn: () => listTickets(orgId!, filters),
  });

  React.useEffect(() => {
    if (!socket) return;
    const handler = () => { void queryClient.invalidateQueries({ queryKey: ['tickets', orgId] }); };
    socket.on('ticket.created', handler);
    socket.on('ticket.status_changed', handler);
    return () => { socket.off('ticket.created', handler); socket.off('ticket.status_changed', handler); };
  }, [socket, orgId]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        <Link to={`/orgs/${orgId}/tickets/new`}>
          <Button><Plus className="h-4 w-4" />New Ticket</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select
          options={STATUS_OPTIONS}
          value={filters.status ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="w-40"
        />
        <Select
          options={PRIORITY_OPTIONS}
          value={filters.priority ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Requester</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Assignee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((ticket) => (
                <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/orgs/${orgId}/tickets/${ticket.id}`} className="block">
                      <p className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-1">{ticket.subject}</p>
                      <SlaTimer breachAt={ticket.slaBreachAt} />
                    </Link>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar name={ticket.requester.name} size="sm" />
                      <span className="text-gray-600 text-xs">{ticket.requester.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {ticket.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={ticket.assignee.name} size="sm" />
                        <span className="text-gray-600 text-xs">{ticket.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
              {!data?.data.length && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No tickets found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
