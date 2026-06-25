import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useUiStore } from '@/store/uiStore';
import { queryClient } from '@/lib/queryClient';

interface SlaPolicy { id: string; name: string; priority: string; firstResponseMinutes: number; resolutionMinutes: number }

export default function SlaPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const addToast = useUiStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', priority: 'MEDIUM', firstResponseMinutes: 60, resolutionMinutes: 480 });

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['sla-policies', orgId],
    queryFn: async () => {
      const { data } = await api.get<{ data: SlaPolicy[] }>(`/orgs/${orgId}/sla-policies`);
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post(`/orgs/${orgId}/sla-policies`, form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sla-policies', orgId] });
      setOpen(false);
      addToast({ type: 'success', message: 'SLA policy created' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/orgs/${orgId}/sla-policies/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sla-policies', orgId] });
      addToast({ type: 'success', message: 'SLA policy deleted' });
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">SLA Policies</h2>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add Policy</Button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Name</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Priority</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">First Response</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Resolution</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">{p.priority.toLowerCase()}</td>
                <td className="px-4 py-3 text-gray-600">{p.firstResponseMinutes}m</td>
                <td className="px-4 py-3 text-gray-600">{p.resolutionMinutes}m</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteMutation.mutate(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!policies.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No SLA policies</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add SLA Policy">
        <div className="space-y-4">
          <Input label="Policy name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' }]}
          />
          <Input label="First response (minutes)" type="number" value={form.firstResponseMinutes} onChange={(e) => setForm({ ...form, firstResponseMinutes: parseInt(e.target.value) })} />
          <Input label="Resolution (minutes)" type="number" value={form.resolutionMinutes} onChange={(e) => setForm({ ...form, resolutionMinutes: parseInt(e.target.value) })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
