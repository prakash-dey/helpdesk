import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '@/lib/axios';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';

interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  diff?: Record<string, unknown>;
  createdAt: string;
  actor?: { id: string; name: string; email: string };
}

export default function AuditLogPage() {
  const { orgId } = useParams<{ orgId: string }>();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-log', orgId],
    queryFn: async () => {
      const { data } = await api.get<{ data: AuditLog[] }>(`/orgs/${orgId}/analytics/audit-log`);
      return data.data;
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Actor</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Entity</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Time</th>
          </tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  {log.actor ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={log.actor.name} size="sm" />
                      <span className="text-gray-700">{log.actor.name}</span>
                    </div>
                  ) : <span className="text-gray-400">System</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{log.action}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-500">{log.entityType}</span>
                  <span className="text-gray-300 mx-1">·</span>
                  <span className="font-mono text-xs text-gray-400">{log.entityId.slice(0, 8)}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                </td>
              </tr>
            ))}
            {!logs.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No audit log entries</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
