import { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import { login } from './auth.api';
import { decodeJwt } from '@/shared/lib/jwt';
import { useAppDispatch } from '@/store/hooks';
import { setAccessToken, setUser } from '@/store/authSlice';

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      const claims = decodeJwt(result.accessToken);
    //   console.log({claims})

      dispatch(setAccessToken(result.accessToken));
      dispatch(
        setUser({
          id: claims.sub,
          email: claims.email,
          role: claims.role,
          orgId: claims.orgId,
        }),
      );

      if (claims.orgId) {
        navigate(`/orgs/${claims.orgId}/dashboard`);
      } else {
        navigate('/unauthorized');
      }
    } catch {
      setError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <Card className="w-full max-w-md space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            SupportDesk Pro
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Sign in to your workspace
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage tickets, teams, and customer conversations.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="agent@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Password"
            value={password}
            error={error}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  );
}