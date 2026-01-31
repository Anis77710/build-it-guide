import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Copy,
  ArrowRight,
  Settings2,
  Play
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIPOStore } from '@/store/useIPOStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function NewCheck() {
  const navigate = useNavigate();
  const { 
    companies, 
    selectedCompany, 
    selectCompany,
    validBoids,
    invalidBoids,
    duplicateCount,
    setBoids,
    config,
    setConfig,
    setCurrentBatch
  } = useIPOStore();

  const [pasteContent, setPasteContent] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // File drop handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    
    if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split(/[\r\n]+/).filter(Boolean);
        processBoids(lines);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
        
        // Extract first column values
        const boids = jsonData
          .flat()
          .map(cell => String(cell || '').trim())
          .filter(Boolean);
        
        processBoids(boids);
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const processBoids = (lines: string[]) => {
    setBoids(lines);
    toast.success(`Loaded ${lines.length} entries from file`);
  };

  const handlePasteSubmit = () => {
    const lines = pasteContent.split(/[\r\n]+/).filter(Boolean);
    processBoids(lines);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const startCheck = () => {
    if (!selectedCompany) {
      toast.error('Please select an IPO company');
      return;
    }
    if (validBoids.length === 0) {
      toast.error('Please add at least one valid BOID');
      return;
    }

    // Create a new batch
    const newBatch = {
      id: `batch-${Date.now()}`,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      totalBoids: validBoids.length,
      checkedCount: 0,
      allottedCount: 0,
      notAllottedCount: 0,
      errorCount: 0,
      status: 'processing' as const,
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      results: [],
    };

    setCurrentBatch(newBatch);
    navigate('/processing');
  };

  const canProceed = {
    1: !!selectedCompany,
    2: validBoids.length > 0,
    3: true,
  };

  return (
    <div className="animate-fade-in space-y-6 p-6 pt-16 lg:p-8 lg:pt-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">New IPO Check</h1>
        <p className="text-muted-foreground">
          Check multiple BOID numbers against IPO results in bulk
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all',
                currentStep === step
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : currentStep > step
                  ? 'bg-success text-success-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {currentStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
            </button>
            {step < 3 && (
              <div 
                className={cn(
                  'mx-2 h-1 w-8 rounded-full sm:w-16',
                  currentStep > step ? 'bg-success' : 'bg-muted'
                )} 
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="mx-auto max-w-3xl">
        {/* Step 1: Select IPO */}
        {currentStep === 1 && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                  1
                </span>
                Select IPO Company
              </CardTitle>
              <CardDescription>
                Choose the IPO whose results you want to check
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={selectedCompany?.id || ''} 
                onValueChange={(value) => {
                  const company = companies.find(c => c.id === value);
                  selectCompany(company || null);
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select an IPO company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{company.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {company.scripCode} • {company.issueManager}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCompany && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h4 className="font-semibold">{selectedCompany.name}</h4>
                  <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    <p><span className="text-muted-foreground">Scrip Code:</span> {selectedCompany.scripCode}</p>
                    <p><span className="text-muted-foreground">Issue Manager:</span> {selectedCompany.issueManager}</p>
                    <p><span className="text-muted-foreground">Closing Date:</span> {selectedCompany.closingDate}</p>
                    <p>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <span className="badge-allotted">Active</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)} 
                  disabled={!canProceed[1]}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Upload BOIDs */}
        {currentStep === 2 && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                  2
                </span>
                Upload BOID List
              </CardTitle>
              <CardDescription>
                Upload a file or paste BOID numbers directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="paste">
                    <Copy className="mr-2 h-4 w-4" />
                    Paste BOIDs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div
                    {...getRootProps()}
                    className={cn(
                      'dropzone',
                      isDragActive && 'dropzone-active'
                    )}
                  >
                    <input {...getInputProps()} />
                    <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    {isDragActive ? (
                      <p className="text-lg font-medium text-primary">Drop your file here...</p>
                    ) : (
                      <>
                        <p className="text-lg font-medium">Drag & drop your file here</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          or click to browse
                        </p>
                      </>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground">
                      Supports CSV, Excel (.xlsx, .xls), and TXT files (max 5MB)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="paste" className="mt-4 space-y-3">
                  <Textarea
                    placeholder="Paste BOID numbers here (one per line)&#10;Example:&#10;1301234567890123&#10;1301234567890124&#10;1301234567890125"
                    className="min-h-[200px] font-mono text-sm"
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                  />
                  <Button onClick={handlePasteSubmit} variant="secondary" className="w-full">
                    Process BOIDs
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Validation Summary */}
              {(validBoids.length > 0 || invalidBoids.length > 0) && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h4 className="mb-3 font-semibold">Validation Summary</h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="font-medium">{validBoids.length}</span>
                      <span className="text-muted-foreground">Valid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="font-medium">{invalidBoids.length}</span>
                      <span className="text-muted-foreground">Invalid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <span className="font-medium">{duplicateCount}</span>
                      <span className="text-muted-foreground">Duplicates</span>
                    </div>
                  </div>
                  
                  {invalidBoids.length > 0 && (
                    <div className="mt-3 rounded bg-destructive/10 p-2">
                      <p className="text-xs text-destructive">
                        Invalid BOIDs: {invalidBoids.slice(0, 3).join(', ')}
                        {invalidBoids.length > 3 && ` and ${invalidBoids.length - 3} more`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)} 
                  disabled={!canProceed[2]}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 3 && (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                  3
                </span>
                Configuration
              </CardTitle>
              <CardDescription>
                Customize your check settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="font-semibold">Check Summary</h4>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  <p><span className="text-muted-foreground">IPO:</span> {selectedCompany?.name}</p>
                  <p><span className="text-muted-foreground">BOIDs to check:</span> {validBoids.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Retry Setting */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable retry on failure</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically retry failed checks
                    </p>
                  </div>
                  <Switch
                    checked={config.retryOnFailure}
                    onCheckedChange={(checked) => setConfig({ retryOnFailure: checked })}
                  />
                </div>

                {/* Auto Export */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-export results</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically download Excel on completion
                    </p>
                  </div>
                  <Switch
                    checked={config.autoExport}
                    onCheckedChange={(checked) => setConfig({ autoExport: checked })}
                  />
                </div>

                {/* Delay Setting */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Delay between checks</Label>
                    <span className="text-sm font-medium">{config.delaySeconds} seconds</span>
                  </div>
                  <Slider
                    value={[config.delaySeconds]}
                    onValueChange={([value]) => setConfig({ delaySeconds: value })}
                    min={2}
                    max={10}
                    step={1}
                  />
                </div>

                {/* CAPTCHA Service */}
                <div className="space-y-2">
                  <Label>CAPTCHA solving service</Label>
                  <Select 
                    value={config.captchaService}
                    onValueChange={(value: any) => setConfig({ captchaService: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2captcha">2Captcha API</SelectItem>
                      <SelectItem value="anticaptcha">Anti-Captcha</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={startCheck} size="lg" className="shadow-glow">
                  <Play className="mr-2 h-5 w-5" />
                  Start Checking ({validBoids.length} BOIDs)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
