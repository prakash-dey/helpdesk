import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/axios';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useUiStore } from '@/store/uiStore';

const schema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});
type FormData = z.infer<typeof schema>;

export default function KbEditorPage() {
  const { orgId, articleId } = useParams<{ orgId: string; articleId?: string }>();
  const navigate = useNavigate();
  const addToast = useUiStore((s) => s.addToast);
  const isEdit = !!articleId && articleId !== 'new';

  const { data: existing } = useQuery({
    queryKey: ['kb-article-edit', orgId, articleId],
    queryFn: async () => {
      const { data } = await api.get<{ data: FormData & { id: string } }>(`/orgs/${orgId}/kb/articles/${articleId}`);
      return data.data;
    },
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'DRAFT' },
  });

  useEffect(() => {
    if (existing) reset({ title: existing.title, body: existing.body, status: existing.status as FormData['status'] });
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEdit) {
        await api.patch(`/orgs/${orgId}/kb/articles/${articleId}`, data);
      } else {
        await api.post(`/orgs/${orgId}/kb/articles`, data);
      }
    },
    onSuccess: () => {
      addToast({ type: 'success', message: isEdit ? 'Article updated' : 'Article created' });
      navigate(`/orgs/${orgId}/kb`);
    },
  });

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />{isEdit ? 'Back' : 'Knowledge Base'}
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Article' : 'New Article'}</h1>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="card p-6 space-y-4">
        <Input label="Title" error={errors.title?.message} {...register('title')} />
        <Textarea label="Content" rows={16} error={errors.body?.message} {...register('body')} />
        <Select
          label="Status"
          options={[
            { value: 'DRAFT', label: 'Draft' },
            { value: 'PUBLISHED', label: 'Published' },
            { value: 'ARCHIVED', label: 'Archived' },
          ]}
          {...register('status')}
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>{isEdit ? 'Save Changes' : 'Create Article'}</Button>
        </div>
      </form>
    </div>
  );
}
