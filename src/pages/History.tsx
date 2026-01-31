import { Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Clock, 
  ArrowRight, 
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIPOStore } from '@/store/useIPOStore';
import { cn } from '@/lib/utils';

export default function History() {
  const { batchHistory } = useIPOStore();

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'badge-allotted',
      processing: 'badge-pending',
      failed: 'badge-not-allotted',
      paused: 'badge-pending',
      cancelled: 'badge-error',
      queued: 'badge-pending',
    };
    return styles[status as keyof typeof styles] || 'badge-error';
  };

  return (
    <div className="animate-fade-in space-y-6 p-6 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">History</h1>
          <p className="text-muted-foreground">
            View all your past IPO check batches
          </p>
        </div>
        <Button asChild>
          <Link to="/check">New Check</Link>
        </Button>
      </div>

      {/* History List */}
      {batchHistory.length > 0 ? (
        <div className="space-y-4">
          {batchHistory.map((batch) => {
            const successRate = batch.totalBoids > 0 
              ? Math.round((batch.allottedCount / batch.totalBoids) * 100) 
              : 0;

            return (
              <Card key={batch.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{batch.companyName}</h3>
                        <span className={getStatusBadge(batch.status)}>
                          {batch.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Clock className="mr-1 inline-block h-3 w-3" />
                        {format(new Date(batch.createdAt), 'PPP p')} •{' '}
                        {formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">{batch.totalBoids}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-success">{batch.allottedCount}</p>
                          <p className="text-xs text-muted-foreground">Allotted</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-destructive">{batch.notAllottedCount}</p>
                          <p className="text-xs text-muted-foreground">Not Allot.</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-info">{successRate}%</p>
                          <p className="text-xs text-muted-foreground">Rate</p>
                        </div>
                      </div>

                      <Button variant="outline" asChild>
                        <Link to={`/results/${batch.id}`}>
                          View <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileSpreadsheet className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold">No History Yet</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              You haven't performed any IPO checks yet. Start your first check to see your history here.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/check">Start Your First Check</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
