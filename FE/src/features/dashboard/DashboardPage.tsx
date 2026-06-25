import { Badge } from '@/shared/components/ui/Badge';
import { Card } from '@/shared/components/ui/Card';
import { useAppSelector } from '@/store/hooks';
import { useDashboardStats } from './dashboard.queries';

function formatDuration(ms: number | null) {
  if (ms === null) return 'No data';

  const hours = Math.round(ms / 1000 / 60 / 60);

  if (hours < 1) return '< 1h';

  return `${hours}h`;
}

export function DashboardPage() {
  const orgId = useAppSelector((state) => state.auth.user?.orgId);
  const { ticketStats, slaStats, csatStats, isLoading, isError } =
    useDashboardStats(orgId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader />
        <Card>
          <p className="font-medium text-red-700">Could not load dashboard.</p>
          <p className="mt-1 text-sm text-slate-600">
            Please check that the backend is running and your account has access.
          </p>
        </Card>
      </div>
    );
  }

  const totalTickets = ticketStats.data?.total ?? 0;
  const openTickets =
    (ticketStats.data?.byStatus.NEW ?? 0) +
    (ticketStats.data?.byStatus.OPEN ?? 0) +
    (ticketStats.data?.byStatus.PENDING ?? 0) +
    (ticketStats.data?.byStatus.ON_HOLD ?? 0);

  const urgentTickets = ticketStats.data?.byPriority.URGENT ?? 0;
  const breached = slaStats.data?.breached ?? 0;
  const breachRate = slaStats.data?.rate ?? 0;
  const averageCsat = csatStats.data?.average ?? null;

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-slate-500">Total tickets</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {totalTickets}
          </p>
          <Badge variant="info" className="mt-4">
            {openTickets} active
          </Badge>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">SLA risk</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{breached}</p>
          <Badge
            variant={breachRate > 0 ? 'warning' : 'success'}
            className="mt-4"
          >
            {breachRate}% breach rate
          </Badge>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">Average CSAT</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {averageCsat ?? 'No data'}
          </p>
          <Badge variant={averageCsat && averageCsat >= 4 ? 'success' : 'default'} className="mt-4">
            {csatStats.data?.count ?? 0} responses
          </Badge>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold text-slate-950">Ticket priority</h2>
          <div className="mt-4 space-y-3">
            <MetricRow label="Urgent" value={urgentTickets} />
            <MetricRow label="High" value={ticketStats.data?.byPriority.HIGH ?? 0} />
            <MetricRow label="Medium" value={ticketStats.data?.byPriority.MEDIUM ?? 0} />
            <MetricRow label="Low" value={ticketStats.data?.byPriority.LOW ?? 0} />
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-950">Resolution health</h2>
          <div className="mt-4 space-y-3">
            <MetricRow
              label="Average resolution"
              value={formatDuration(ticketStats.data?.avgResolutionMs ?? null)}
            />
            <MetricRow label="Solved" value={ticketStats.data?.byStatus.SOLVED ?? 0} />
            <MetricRow label="Closed" value={ticketStats.data?.byStatus.CLOSED ?? 0} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        A quick view of support activity across your workspace.
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <div className="h-4 w-28 rounded bg-slate-200" />
      <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
      <div className="mt-5 h-6 w-24 rounded bg-slate-100" />
    </Card>
  );
}

function MetricRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}