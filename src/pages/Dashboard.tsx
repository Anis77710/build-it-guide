import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp,
  ArrowRight,
  FileSpreadsheet,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIPOStore } from '@/store/useIPOStore';
import { formatDistanceToNow } from 'date-fns';

function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: { 
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}) {
  const variantStyles = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info',
  };

  return (
    <Card className="stats-card group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className="flex items-center gap-1 text-xs font-medium text-success">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className={`rounded-xl bg-secondary p-3 ${variantStyles[variant]} transition-transform group-hover:scale-110`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentBatchRow({ batch }: { batch: any }) {
  const statusStyles = {
    completed: 'badge-allotted',
    processing: 'badge-pending',
    failed: 'badge-not-allotted',
    paused: 'badge-pending',
    cancelled: 'badge-error',
    queued: 'badge-pending',
  };

  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-muted/30">
      <td className="py-3 pl-4">
        <div>
          <p className="font-medium">{batch.companyName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true })}
          </p>
        </div>
      </td>
      <td className="py-3 text-center">
        <span className="font-semibold">{batch.totalBoids}</span>
      </td>
      <td className="py-3 text-center">
        <span className="font-semibold text-success">{batch.allottedCount}</span>
      </td>
      <td className="py-3 text-center">
        <span className={statusStyles[batch.status as keyof typeof statusStyles]}>
          {batch.status}
        </span>
      </td>
      <td className="py-3 pr-4 text-right">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/results/${batch.id}`}>
            View <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const { 
    totalChecksPerformed, 
    totalAllotted, 
    successRate, 
    batchHistory 
  } = useIPOStore();

  const lastCheck = batchHistory[0];

  return (
    <div className="animate-fade-in space-y-6 p-6 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your IPO checking activity.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/check">
            <Activity className="mr-2 h-5 w-5" />
            Start New Check
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Checks"
          value={totalChecksPerformed.toLocaleString()}
          subtitle="All-time BOIDs checked"
          icon={FileSpreadsheet}
          trend="+12% this week"
        />
        <StatsCard
          title="Allotted"
          value={totalAllotted.toLocaleString()}
          subtitle="Successful allotments"
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          title="Success Rate"
          value={`${successRate}%`}
          subtitle="Average allotment rate"
          icon={TrendingUp}
          variant="info"
        />
        <StatsCard
          title="Last Check"
          value={lastCheck ? formatDistanceToNow(new Date(lastCheck.createdAt), { addSuffix: true }) : 'N/A'}
          subtitle={lastCheck?.companyName || 'No checks yet'}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Quick Actions + Recent History */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/check">
                <Activity className="mr-3 h-4 w-4" />
                Start New Check
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/history">
                <Clock className="mr-3 h-4 w-4" />
                View History
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/statistics">
                <TrendingUp className="mr-3 h-4 w-4" />
                View Statistics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Checks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Checks</CardTitle>
              <CardDescription>Your latest batch checking history</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/history">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {batchHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 pl-4 text-left font-medium">IPO Company</th>
                      <th className="py-3 text-center font-medium">BOIDs</th>
                      <th className="py-3 text-center font-medium">Allotted</th>
                      <th className="py-3 text-center font-medium">Status</th>
                      <th className="py-3 pr-4 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchHistory.slice(0, 5).map((batch) => (
                      <RecentBatchRow key={batch.id} batch={batch} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium">No checks yet</p>
                <p className="text-sm text-muted-foreground">
                  Start your first IPO check to see results here
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/check">Start Checking</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
