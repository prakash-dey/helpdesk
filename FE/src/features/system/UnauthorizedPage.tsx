import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <Card className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          401
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          You are not signed in
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Please sign in before accessing your support workspace.
        </p>

        <div className="mt-6">
          <Link
            to="/auth/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}