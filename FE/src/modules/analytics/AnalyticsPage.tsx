import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/axios';
import { Spinner } from '@/components/ui/Spinner';

interface TicketStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  avgResolutionMs: number | null;
}

interface CsatStats {
  count: number;
  average: number | null;
  distribution: Record<number, number>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

export default function AnalyticsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [range, setRange] = useState('30');

  const from = new Date(Date.now() - parseInt(range) * 24 * 60 * 60 * 1000).toISOString();
  const to = new Date().toISOString();

  const { data: ticketStats, isLoading: loadingTickets } = useQuery({
    queryKey: ['analytics-tickets', orgId, range],
    queryFn: async () => {
      const { data } = await api.get<{ data: TicketStats }>(`/orgs/${orgId}/analytics/tickets`, { params: { from, to } });
      return data.data;
    },
  });

  const { data: csatStats } = useQuery({
    queryKey: ['analytics-csat', orgId, range],
    queryFn: async () => {
      const { data } = await api.get<{ data: CsatStats }>(`/orgs/${orgId}/analytics/csat`, { params: { from, to } });
      return data.data;
    },
  });

  const statusData = Object.entries(ticketStats?.byStatus ?? {}).map(([name, value]) => ({ name: name.toLowerCase().replace('_', ' '), value }));
  const csatData = Object.entries(csatStats?.distribution ?? {}).map(([score, count]) => ({ name: `${score} star`, value: count }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="input w-36">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {loadingTickets ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Tickets', value: ticketStats?.total ?? 0 },
              { label: 'Open', value: ticketStats?.byStatus?.OPEN ?? 0 },
              { label: 'Solved', value: (ticketStats?.byStatus?.SOLVED ?? 0) + (ticketStats?.byStatus?.CLOSED ?? 0) },
              { label: 'CSAT Score', value: csatStats?.average ? `${csatStats.average}/5` : '—' },
            ].map((stat) => (
              <div key={stat.label} className="card p-5 text-center">
                <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Tickets by Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {csatData.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">CSAT Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={csatData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {csatData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
