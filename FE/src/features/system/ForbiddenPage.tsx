import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/ui/Card';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <Card className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
          403
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          Access restricted
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your account does not have permission to view this area.
        </p>

        <div className="mt-6">
          <Link
            to="/auth/login"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}