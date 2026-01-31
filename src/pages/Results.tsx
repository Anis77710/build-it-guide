import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { 
  Download, 
  FileSpreadsheet, 
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIPOStore, BOIDResult } from '@/store/useIPOStore';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

const COLORS = ['hsl(152, 60%, 42%)', 'hsl(0, 72%, 51%)', 'hsl(210, 15%, 60%)'];

export default function Results() {
  const { batchId } = useParams();
  const { currentBatch, batchHistory } = useIPOStore();
  
  // Find the batch - either current or from history
  const batch = currentBatch?.id === batchId 
    ? currentBatch 
    : batchHistory.find(b => b.id === batchId);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Generate mock results if batch exists but has no results (for demo)
  const results = useMemo(() => {
    if (!batch) return [];
    if (batch.results.length > 0) return batch.results;
    
    // Generate mock data for history items
    const mockResults: BOIDResult[] = [];
    for (let i = 0; i < batch.totalBoids; i++) {
      const random = Math.random();
      const status = i < batch.allottedCount 
        ? 'allotted' 
        : i < batch.allottedCount + batch.notAllottedCount 
        ? 'not_allotted' 
        : 'error';
      
      mockResults.push({
        id: `result-${i}`,
        boid: `130${String(1234567890123 + i).slice(0, 13)}`,
        status,
        sharesAllocated: status === 'allotted' ? 10 : undefined,
        dpid: `1300${String(i).padStart(4, '0')}`,
        applicantName: status === 'allotted' ? `Applicant ${i + 1}` : undefined,
        checkedAt: batch.createdAt,
      });
    }
    return mockResults;
  }, [batch]);

  const filteredResults = useMemo(() => {
    if (statusFilter === 'all') return results;
    return results.filter(r => r.status === statusFilter);
  }, [results, statusFilter]);

  const columns: ColumnDef<BOIDResult>[] = [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
      size: 50,
    },
    {
      accessorKey: 'boid',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4 h-8"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          BOID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('boid')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span className={cn(
            status === 'allotted' && 'badge-allotted',
            status === 'not_allotted' && 'badge-not-allotted',
            status === 'error' && 'badge-error',
          )}>
            {status === 'not_allotted' ? 'Not Allotted' : 
             status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'sharesAllocated',
      header: 'Shares',
      cell: ({ row }) => {
        const shares = row.getValue('sharesAllocated') as number | undefined;
        return shares ? `${shares} units` : '-';
      },
    },
    {
      accessorKey: 'dpid',
      header: 'DPID',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">
          {row.getValue('dpid') || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'applicantName',
      header: 'Applicant Name',
      cell: ({ row }) => row.getValue('applicantName') || '-',
    },
  ];

  const table = useReactTable({
    data: filteredResults,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const exportToExcel = () => {
    const data = filteredResults.map((r, idx) => ({
      'S.N.': idx + 1,
      'BOID': r.boid,
      'Status': r.status === 'not_allotted' ? 'Not Allotted' : 
               r.status.charAt(0).toUpperCase() + r.status.slice(1),
      'Shares': r.sharesAllocated || '',
      'DPID': r.dpid || '',
      'Applicant Name': r.applicantName || '',
      'Checked At': r.checkedAt || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, `IPO_Results_${batch?.companyName?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const headers = ['S.N.', 'BOID', 'Status', 'Shares', 'DPID', 'Applicant Name', 'Checked At'];
    const rows = filteredResults.map((r, idx) => [
      idx + 1,
      r.boid,
      r.status === 'not_allotted' ? 'Not Allotted' : 
        r.status.charAt(0).toUpperCase() + r.status.slice(1),
      r.sharesAllocated || '',
      r.dpid || '',
      r.applicantName || '',
      r.checkedAt || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `IPO_Results_${batch?.companyName?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!batch) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-warning" />
            <h2 className="text-xl font-semibold">Batch Not Found</h2>
            <p className="mt-2 text-muted-foreground">
              The requested batch could not be found.
            </p>
            <Button asChild className="mt-4">
              <Link to="/">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = [
    { name: 'Allotted', value: batch.allottedCount },
    { name: 'Not Allotted', value: batch.notAllottedCount },
    { name: 'Errors', value: batch.errorCount },
  ].filter(d => d.value > 0);

  const allottedPercentage = batch.totalBoids > 0 
    ? Math.round((batch.allottedCount / batch.totalBoids) * 100) 
    : 0;

  return (
    <div className="animate-fade-in space-y-6 p-6 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link 
            to="/history" 
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to History
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Results</h1>
          <p className="text-muted-foreground">{batch.companyName}</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Checked</span>
                <span className="font-semibold">{batch.totalBoids}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check Date</span>
                <span className="font-semibold">
                  {new Date(batch.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={cn(
                  batch.status === 'completed' && 'badge-allotted',
                  batch.status === 'failed' && 'badge-not-allotted',
                  batch.status === 'cancelled' && 'badge-error',
                )}>
                  {batch.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-4">
          <CheckCircle2 className="mb-2 h-8 w-8 text-success" />
          <p className="text-2xl font-bold">{batch.allottedCount}</p>
          <p className="text-xs text-muted-foreground">Allotted ({allottedPercentage}%)</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-4">
          <XCircle className="mb-2 h-8 w-8 text-destructive" />
          <p className="text-2xl font-bold">{batch.notAllottedCount}</p>
          <p className="text-xs text-muted-foreground">Not Allotted</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-4">
          <AlertTriangle className="mb-2 h-8 w-8 text-warning" />
          <p className="text-2xl font-bold">{batch.errorCount}</p>
          <p className="text-xs text-muted-foreground">Errors</p>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {chartData.map((_, index) => (
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

      {/* Results Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Detailed Results</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search BOID..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="allotted">Allotted</SelectItem>
                  <SelectItem value="not_allotted">Not Allotted</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredResults.length
              )}{' '}
              of {filteredResults.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
