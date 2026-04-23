import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useUiStore } from '@/store/uiStore';
import { queryClient } from '@/lib/queryClient';

const EVENTS = ['ticket.created', 'ticket.status_changed', 'ticket.assigned', 'comment.added'];

interface Webhook { id: string; url: string; events: string[]; active: boolean; secret: string }

export default function WebhooksPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const addToast = useUiStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks', orgId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Webhook[] }>(`/orgs/${orgId}/webhooks`);
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post(`/orgs/${orgId}/webhooks`, { url, events: selectedEvents }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['webhooks', orgId] });
      setOpen(false); setUrl(''); setSelectedEvents([]);
      addToast({ type: 'success', message: 'Webhook created' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/orgs/${orgId}/webhooks/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['webhooks', orgId] });
      addToast({ type: 'success', message: 'Webhook deleted' });
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Webhooks</h2>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add Webhook</Button>
      </div>

      <div className="space-y-3">
        {webhooks.map((wh) => (
          <div key={wh.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {wh.active ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-gray-400" />}
                <div>
                  <p className="text-sm font-medium text-gray-900 font-mono">{wh.url}</p>
                  <p className="text-xs text-gray-400">{wh.events.join(', ')}</p>
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(wh.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {!webhooks.length && <p className="text-sm text-gray-400 text-center py-8">No webhooks configured</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Webhook">
        <div className="space-y-4">
          <Input label="Endpoint URL" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
          <div>
            <label className="label">Events</label>
            <div className="space-y-2">
              {EVENTS.map((ev) => (
                <label key={ev} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedEvents.includes(ev)}
                    onChange={(e) => setSelectedEvents(e.target.checked ? [...selectedEvents, ev] : selectedEvents.filter((x) => x !== ev))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-mono text-gray-700">{ev}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!url || !selectedEvents.length}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
