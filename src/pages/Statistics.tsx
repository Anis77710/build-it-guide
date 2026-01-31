import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIPOStore } from '@/store/useIPOStore';
import { TrendingUp, CheckCircle2, XCircle, Activity, Target } from 'lucide-react';

const COLORS = ['hsl(152, 60%, 42%)', 'hsl(0, 72%, 51%)', 'hsl(38, 92%, 50%)'];

export default function Statistics() {
  const { totalChecksPerformed, totalAllotted, totalNotAllotted, successRate, batchHistory } = useIPOStore();

  // Generate statistics data
  const pieData = [
    { name: 'Allotted', value: totalAllotted },
    { name: 'Not Allotted', value: totalNotAllotted },
  ];

  // Mock weekly trend data
  const trendData = [
    { name: 'Week 1', allotted: 45, notAllotted: 155 },
    { name: 'Week 2', allotted: 38, notAllotted: 112 },
    { name: 'Week 3', allotted: 52, notAllotted: 148 },
    { name: 'Week 4', allotted: 65, notAllotted: 185 },
  ];

  // Company performance data
  const companyData = batchHistory.slice(0, 5).map(batch => ({
    name: batch.companyName.length > 15 ? batch.companyName.slice(0, 15) + '...' : batch.companyName,
    allotted: batch.allottedCount,
    notAllotted: batch.notAllottedCount,
    rate: batch.totalBoids > 0 ? Math.round((batch.allottedCount / batch.totalBoids) * 100) : 0,
  }));

  return (
    <div className="animate-fade-in space-y-6 p-6 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Statistics</h1>
        <p className="text-muted-foreground">
          Analyze your IPO checking performance and trends
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 p-3">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Checks</p>
                <p className="text-2xl font-bold">{totalChecksPerformed.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-success/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Allotted</p>
                <p className="text-2xl font-bold">{totalAllotted.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-destructive/10 p-3">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Not Allotted</p>
                <p className="text-2xl font-bold">{totalNotAllotted.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-info/10 p-3">
                <Target className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Allotment Distribution</CardTitle>
            <CardDescription>Overall breakdown of allotment results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trends</CardTitle>
            <CardDescription>Allotment trends over the past weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="allotted" 
                    name="Allotted"
                    stroke="hsl(152, 60%, 42%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(152, 60%, 42%)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="notAllotted" 
                    name="Not Allotted"
                    stroke="hsl(0, 72%, 51%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(0, 72%, 51%)' }}
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Performance */}
      {companyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance by IPO</CardTitle>
            <CardDescription>Allotment results for recent IPOs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="allotted" name="Allotted" fill="hsl(152, 60%, 42%)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="notAllotted" name="Not Allotted" fill="hsl(0, 72%, 51%)" radius={[0, 4, 4, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
