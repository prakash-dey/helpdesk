import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Avatar } from '@/components/ui/Avatar';
import { useUiStore } from '@/store/uiStore';
import { queryClient } from '@/lib/queryClient';

interface Team { id: string; name: string; members: { userId: string; user: { name: string; email: string } }[] }

export default function TeamsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const addToast = useUiStore((s) => s.addToast);
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState('');

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams', orgId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Team[] }>(`/orgs/${orgId}/teams`);
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: () => api.post(`/orgs/${orgId}/teams`, { name: teamName }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams', orgId] });
      setOpen(false); setTeamName('');
      addToast({ type: 'success', message: 'Team created' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (teamId: string) => api.delete(`/orgs/${orgId}/teams/${teamId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams', orgId] });
      addToast({ type: 'success', message: 'Team deleted' });
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Teams ({teams.length})</h2>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Create Team</Button>
      </div>

      <div className="space-y-3">
        {teams.map((team) => (
          <div key={team.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{team.name}</h3>
              <button onClick={() => deleteMutation.mutate(team.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {team.members.map((m) => (
                <div key={m.userId} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2 py-1">
                  <Avatar name={m.user.name} size="sm" />
                  <span className="text-xs text-gray-600">{m.user.name}</span>
                </div>
              ))}
              {!team.members.length && <p className="text-sm text-gray-400">No members yet</p>}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Team">
        <div className="space-y-4">
          <Input label="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!teamName.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
