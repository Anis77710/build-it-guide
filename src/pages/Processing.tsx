import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pause, 
  Play, 
  StopCircle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useIPOStore, BOIDResult } from '@/store/useIPOStore';
import { cn } from '@/lib/utils';

// Simulated BOID check - in production this would call the backend API
function simulateCheck(boid: string): Promise<BOIDResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const random = Math.random();
      const status = random < 0.25 
        ? 'allotted' 
        : random < 0.98 
        ? 'not_allotted' 
        : 'error';
      
      resolve({
        id: `result-${Date.now()}`,
        boid,
        status,
        sharesAllocated: status === 'allotted' ? 10 : undefined,
        dpid: boid.slice(0, 8),
        applicantName: status === 'allotted' ? 'Sample Name' : undefined,
        errorMessage: status === 'error' ? 'Connection timeout' : undefined,
        checkedAt: new Date().toISOString(),
      });
    }, 500 + Math.random() * 1000);
  });
}

export default function Processing() {
  const navigate = useNavigate();
  const { 
    currentBatch, 
    validBoids, 
    config,
    updateBatchProgress, 
    addResult,
    addToBatchHistory,
    clearCurrentCheck
  } = useIPOStore();

  const [isPaused, setIsPaused] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('Calculating...');
  const isPausedRef = useRef(isPaused);
  const isCancellingRef = useRef(isCancelling);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isCancellingRef.current = isCancelling;
  }, [isCancelling]);

  useEffect(() => {
    if (!currentBatch || validBoids.length === 0) {
      navigate('/check');
      return;
    }

    const processNextBoid = async () => {
      if (currentIndex >= validBoids.length) {
        // Complete
        updateBatchProgress({
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
        return;
      }

      if (isPausedRef.current || isCancellingRef.current) return;

      const boid = validBoids[currentIndex];
      const result = await simulateCheck(boid);
      
      if (!isCancellingRef.current) {
        addResult(result);
        setCurrentIndex(prev => prev + 1);

        // Calculate ETA
        const avgTimePerBoid = 1.5; // seconds
        const remaining = validBoids.length - (currentIndex + 1);
        const seconds = remaining * avgTimePerBoid * (config.delaySeconds / 3);
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        setEstimatedTimeRemaining(minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`);

        // Add delay before next check
        if (currentIndex + 1 < validBoids.length && !isPausedRef.current && !isCancellingRef.current) {
          setTimeout(processNextBoid, config.delaySeconds * 300);
        }
      }
    };

    if (currentIndex === 0 && !isPaused) {
      processNextBoid();
    }
  }, [currentIndex, isPaused]);

  // Resume processing
  useEffect(() => {
    if (!isPaused && currentIndex > 0 && currentIndex < validBoids.length && currentBatch?.status === 'processing') {
      const timer = setTimeout(() => {
        if (!isPausedRef.current && !isCancellingRef.current) {
          const processNextBoid = async () => {
            const boid = validBoids[currentIndex];
            const result = await simulateCheck(boid);
            
            if (!isCancellingRef.current) {
              addResult(result);
              setCurrentIndex(prev => prev + 1);
            }
          };
          processNextBoid();
        }
      }, config.delaySeconds * 300);
      return () => clearTimeout(timer);
    }
  }, [isPaused]);

  const handlePause = () => {
    setIsPaused(true);
    updateBatchProgress({ status: 'paused' });
  };

  const handleResume = () => {
    setIsPaused(false);
    updateBatchProgress({ status: 'processing' });
  };

  const handleCancel = () => {
    setIsCancelling(true);
    updateBatchProgress({ 
      status: 'cancelled',
      completedAt: new Date().toISOString(),
    });
    if (currentBatch) {
      addToBatchHistory(currentBatch);
    }
    clearCurrentCheck();
    navigate('/');
  };

  const handleViewResults = () => {
    if (currentBatch) {
      addToBatchHistory(currentBatch);
      navigate(`/results/${currentBatch.id}`);
    }
  };

  if (!currentBatch) return null;

  const progress = (currentBatch.checkedCount / currentBatch.totalBoids) * 100;
  const isComplete = currentBatch.status === 'completed';

  return (
    <div className="animate-fade-in space-y-6 p-6 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {isComplete ? 'Check Complete' : 'Processing'}
          </h1>
          <p className="text-muted-foreground">
            Checking: <span className="font-medium">{currentBatch.companyName}</span>
          </p>
        </div>
        
        {!isComplete && (
          <div className="flex gap-2">
            {isPaused ? (
              <Button onClick={handleResume} variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
            <Button onClick={handleCancel} variant="destructive">
              <StopCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
        
        {isComplete && (
          <Button onClick={handleViewResults} size="lg" className="shadow-glow">
            View Full Results
          </Button>
        )}
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <span className={cn(
              'text-sm font-medium',
              isPaused && 'animate-pulse-soft text-warning'
            )}>
              {isPaused ? 'Paused' : isComplete ? 'Completed' : 'Processing...'}
            </span>
            <span className="text-sm text-muted-foreground">
              {currentBatch.checkedCount} / {currentBatch.totalBoids}
            </span>
          </div>
          
          <div className="progress-track mb-2">
            <div 
              className={cn(
                'progress-fill',
                isPaused && 'opacity-50'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{Math.round(progress)}% complete</span>
            {!isComplete && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ETA: {estimatedTimeRemaining}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="stats-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-success/20 p-3">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentBatch.allottedCount}</p>
              <p className="text-sm text-muted-foreground">Allotted</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-destructive/20 p-3">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentBatch.notAllottedCount}</p>
              <p className="text-sm text-muted-foreground">Not Allotted</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-warning/20 p-3">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {currentBatch.totalBoids - currentBatch.checkedCount}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-muted p-3">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{currentBatch.errorCount}</p>
              <p className="text-sm text-muted-foreground">Errors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Results</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="custom-scrollbar max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 pl-4 text-left font-medium">#</th>
                  <th className="py-3 text-left font-medium">BOID</th>
                  <th className="py-3 text-left font-medium">Status</th>
                  <th className="py-3 text-left font-medium">Shares</th>
                  <th className="py-3 pr-4 text-left font-medium">DPID</th>
                </tr>
              </thead>
              <tbody>
                {currentBatch.results.slice().reverse().slice(0, 50).map((result, idx) => (
                  <tr 
                    key={result.id} 
                    className={cn(
                      'border-b border-border/50 transition-colors',
                      idx === 0 && 'animate-fade-in bg-primary/5'
                    )}
                  >
                    <td className="py-3 pl-4 text-sm text-muted-foreground">
                      {currentBatch.results.length - idx}
                    </td>
                    <td className="py-3 font-mono text-sm">{result.boid}</td>
                    <td className="py-3">
                      <span className={cn(
                        result.status === 'allotted' && 'badge-allotted',
                        result.status === 'not_allotted' && 'badge-not-allotted',
                        result.status === 'error' && 'badge-error',
                        result.status === 'pending' && 'badge-pending',
                      )}>
                        {result.status === 'not_allotted' ? 'Not Allotted' : 
                         result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {result.sharesAllocated ? `${result.sharesAllocated} units` : '-'}
                    </td>
                    <td className="py-3 pr-4 font-mono text-sm text-muted-foreground">
                      {result.dpid || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
