import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { acceptInvite, getMe } from './api';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  password: z.string().min(8, 'Min 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { setAccessToken, setUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => acceptInvite({ token, ...data }),
    onSuccess: async ({ accessToken }) => {
      setAccessToken(accessToken);
      const user = await getMe();
      setUser(user);
      navigate(`/orgs/${user.orgId}/dashboard`);
    },
  });

  if (!token) return <p className="text-red-600 text-sm">Invalid or missing invitation token.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Accept invitation</h1>
      <p className="text-sm text-gray-500 mb-8">Set up your account to get started</p>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <Input label="Your name" error={errors.name?.message} {...register('name')} />
        <Input label="Set a password" type="password" error={errors.password?.message} {...register('password')} />
        {mutation.isError && <p className="text-sm text-red-600">Failed to accept invitation</p>}
        <Button type="submit" className="w-full" loading={mutation.isPending}>Join workspace</Button>
      </form>
    </div>
  );
}
