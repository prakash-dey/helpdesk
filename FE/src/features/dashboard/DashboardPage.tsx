import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          A quick view of support activity across your workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-slate-500">Open tickets</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">24</p>
          <Badge variant="info" className="mt-4">Active queue</Badge>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">Solved today</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">8</p>
          <Badge variant="success" className="mt-4">Healthy</Badge>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">SLA risks</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">3</p>
          <Badge variant="warning" className="mt-4">Needs attention</Badge>
        </Card>
      </div>
    </div>
  );
}