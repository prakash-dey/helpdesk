import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createTicket } from './api';
import { useUiStore } from '@/store/uiStore';

const schema = z.object({
  subject: z.string().min(1, 'Subject required').max(255),
  description: z.string().min(1, 'Description required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  channel: z.enum(['WEB', 'EMAIL', 'API']),
});
type FormData = z.infer<typeof schema>;

export default function CreateTicketPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const addToast = useUiStore((s) => s.addToast);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'MEDIUM', channel: 'WEB' },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => createTicket(orgId!, data),
    onSuccess: (ticket) => {
      addToast({ type: 'success', message: 'Ticket created successfully' });
      navigate(`/orgs/${orgId}/tickets/${ticket.id}`);
    },
  });

  return (
    <div className="p-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />Back to tickets
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Ticket</h1>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="card p-6 space-y-4">
        <Input label="Subject" placeholder="Brief description of the issue" error={errors.subject?.message} {...register('subject')} />
        <Textarea label="Description" placeholder="Provide more details..." rows={6} error={errors.description?.message} {...register('description')} />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            error={errors.priority?.message}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ]}
            {...register('priority')}
          />
          <Select
            label="Channel"
            error={errors.channel?.message}
            options={[
              { value: 'WEB', label: 'Web' },
              { value: 'EMAIL', label: 'Email' },
              { value: 'API', label: 'API' },
            ]}
            {...register('channel')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Create Ticket</Button>
        </div>
      </form>
    </div>
  );
}
