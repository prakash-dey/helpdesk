import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';

export function LoginPage() {
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

        <form className="space-y-4">
          <Input id="email" label="Email" type="email" placeholder="agent@example.com" />
          <Input id="password" label="Password" type="password" placeholder="••••••••" />

          <Button type="submit" className="w-full">
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}