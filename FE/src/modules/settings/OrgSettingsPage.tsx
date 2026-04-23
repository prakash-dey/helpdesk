import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUiStore } from '@/store/uiStore';

interface OrgData { id: string; name: string; domain?: string; planTier: string }

export default function OrgSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const addToast = useUiStore((s) => s.addToast);

  const { data: org } = useQuery({
    queryKey: ['org', orgId],
    queryFn: async () => {
      const { data } = await api.get<{ data: OrgData }>(`/orgs/${orgId}`);
      return data.data;
    },
  });

  const { register, handleSubmit, reset } = useForm<{ name: string; domain: string }>();
  useEffect(() => { if (org) reset({ name: org.name, domain: org.domain ?? '' }); }, [org, reset]);

  const mutation = useMutation({
    mutationFn: (data: { name: string; domain: string }) => api.patch(`/orgs/${orgId}`, data),
    onSuccess: () => addToast({ type: 'success', message: 'Organization updated' }),
  });

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h2>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 max-w-md">
          <Input label="Organization name" {...register('name')} />
          <Input label="Domain" placeholder="acme.com" {...register('domain')} />
          <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
        </form>
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Plan</h2>
        <p className="text-sm text-gray-500 capitalize">{org?.planTier ?? '—'}</p>
      </div>
    </div>
  );
}
