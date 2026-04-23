import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useUiStore } from '@/store/uiStore';
import { queryClient } from '@/lib/queryClient';

interface Member { userId: string; roles: string[]; user: { email: string; name: string } }

export default function MembersPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const addToast = useUiStore((s) => s.addToast);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('AGENT');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', orgId],
    queryFn: async () => {
      const { data } = await api.get<{ data: Member[] }>(`/orgs/${orgId}/members`);
      return data.data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => api.post(`/orgs/${orgId}/invitations`, { email, rolesToGrant: [role] }),
    onSuccess: () => {
      setInviteOpen(false); setEmail(''); setRole('AGENT');
      addToast({ type: 'success', message: `Invitation sent to ${email}` });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/orgs/${orgId}/members/${userId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members', orgId] });
      addToast({ type: 'success', message: 'Member removed' });
    },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Members ({members.length})</h2>
        <Button size="sm" onClick={() => setInviteOpen(true)}><Plus className="h-4 w-4" />Invite Member</Button>
      </div>

      <div className="card divide-y divide-gray-100">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar name={m.user.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
                <p className="text-xs text-gray-400">{m.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {m.roles.map((r) => <Badge key={r} variant="info">{r.toLowerCase().replace('_', ' ')}</Badge>)}
              <button onClick={() => removeMutation.mutate(m.userId)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Member">
        <div className="space-y-4">
          <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'AGENT', label: 'Agent' },
              { value: 'TEAM_LEAD', label: 'Team Lead' },
              { value: 'VIEWER', label: 'Viewer' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={() => inviteMutation.mutate()} loading={inviteMutation.isPending} disabled={!email}>Send Invitation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
