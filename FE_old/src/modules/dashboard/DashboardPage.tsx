import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Ticket, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { api } from '@/lib/axios';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { queryClient } from '@/lib/queryClient';

interface DashboardStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  avgResolutionMs: number | null;
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const user = useAuthStore((s) => s.user);
  const socket = useSocket();

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'tickets', orgId],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardStats }>(`/orgs/${orgId}/analytics/tickets`);
      return data.data;
    },
  });

  // Live updates: invalidate when new ticket arrives
  React.useEffect(() => {
    if (!socket) return;
    const handler = () => { void queryClient.invalidateQueries({ queryKey: ['analytics'] }); };
    socket.on('ticket.created', handler);
    socket.on('ticket.status_changed', handler);
    return () => { socket.off('ticket.created', handler); socket.off('ticket.status_changed', handler); };
  }, [socket]);

  const formatDuration = (ms: number | null) => {
    if (!ms) return '—';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <Link to={`/orgs/${orgId}/tickets/new`}>
          <Button>
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Ticket className="h-6 w-6 text-primary-600" />} label="Total Tickets" value={data?.total ?? 0} color="bg-primary-50" />
            <StatCard icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />} label="Open" value={data?.byStatus?.OPEN ?? 0} color="bg-yellow-50" />
            <StatCard icon={<CheckCircle className="h-6 w-6 text-green-600" />} label="Solved" value={(data?.byStatus?.SOLVED ?? 0) + (data?.byStatus?.CLOSED ?? 0)} color="bg-green-50" />
            <StatCard icon={<Clock className="h-6 w-6 text-blue-600" />} label="Avg. Resolution" value={formatDuration(data?.avgResolutionMs ?? null)} color="bg-blue-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
              {Object.entries(data?.byStatus ?? {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 capitalize">{status.toLowerCase().replace('_', ' ')}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Tickets by Priority</h3>
              {Object.entries(data?.byPriority ?? {}).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600 capitalize">{priority.toLowerCase()}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
