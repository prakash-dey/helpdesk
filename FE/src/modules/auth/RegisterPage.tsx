import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { register as registerUser, getMe } from './api';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  orgName: z.string().min(1, 'Organization name required'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async ({ accessToken }) => {
      setAccessToken(accessToken);
      const user = await getMe();
      setUser(user);
      navigate(`/orgs/${user.orgId}/dashboard`);
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
      <p className="text-sm text-gray-500 mb-8">Start supporting your customers today</p>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <Input label="Your name" error={errors.name?.message} {...register('name')} />
        <Input label="Work email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <Input label="Organization name" placeholder="Acme Inc." error={errors.orgName?.message} {...register('orgName')} />

        {mutation.isError && (
          <p className="text-sm text-red-600">
            {(mutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Registration failed'}
          </p>
        )}

        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
