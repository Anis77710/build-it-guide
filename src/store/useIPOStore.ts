import { create } from 'zustand';

export interface IPOCompany {
  id: string;
  name: string;
  scripCode: string;
  issueManager: string;
  closingDate: string;
  isActive: boolean;
}

export interface BOIDResult {
  id: string;
  boid: string;
  status: 'allotted' | 'not_allotted' | 'pending' | 'error';
  sharesAllocated?: number;
  dpid?: string;
  applicantName?: string;
  errorMessage?: string;
  checkedAt?: string;
}

export interface CheckBatch {
  id: string;
  companyId: string;
  companyName: string;
  totalBoids: number;
  checkedCount: number;
  allottedCount: number;
  notAllottedCount: number;
  errorCount: number;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'cancelled' | 'failed';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  results: BOIDResult[];
}

export interface CheckConfig {
  retryOnFailure: boolean;
  maxRetries: number;
  delaySeconds: number;
  captchaService: '2captcha' | 'anticaptcha' | 'manual';
  autoExport: boolean;
}

interface IPOState {
  // Companies
  companies: IPOCompany[];
  selectedCompany: IPOCompany | null;
  
  // Current check session
  boids: string[];
  validBoids: string[];
  invalidBoids: string[];
  duplicateCount: number;
  config: CheckConfig;
  
  // Batches and results
  currentBatch: CheckBatch | null;
  batchHistory: CheckBatch[];
  
  // Stats
  totalChecksPerformed: number;
  totalAllotted: number;
  totalNotAllotted: number;
  successRate: number;
  
  // Actions
  setCompanies: (companies: IPOCompany[]) => void;
  selectCompany: (company: IPOCompany | null) => void;
  setBoids: (boids: string[]) => void;
  setConfig: (config: Partial<CheckConfig>) => void;
  setCurrentBatch: (batch: CheckBatch | null) => void;
  updateBatchProgress: (updates: Partial<CheckBatch>) => void;
  addResult: (result: BOIDResult) => void;
  addToBatchHistory: (batch: CheckBatch) => void;
  clearCurrentCheck: () => void;
}

// Mock data for demo
const mockCompanies: IPOCompany[] = [
  {
    id: 'abc-hydro-2026',
    name: 'ABC Hydropower Limited',
    scripCode: 'ABCHYDRO',
    issueManager: 'NIBL Ace Capital',
    closingDate: '2026-01-25',
    isActive: true,
  },
  {
    id: 'xyz-finance-2026',
    name: 'XYZ Finance Company',
    scripCode: 'XYZFIN',
    issueManager: 'Sunrise Capital',
    closingDate: '2026-01-28',
    isActive: true,
  },
  {
    id: 'nepal-infra-2026',
    name: 'Nepal Infrastructure Development',
    scripCode: 'NEPINFRA',
    issueManager: 'Global IME Capital',
    closingDate: '2026-01-30',
    isActive: true,
  },
];

const mockBatchHistory: CheckBatch[] = [
  {
    id: 'batch-001',
    companyId: 'abc-hydro-2026',
    companyName: 'ABC Hydropower Limited',
    totalBoids: 250,
    checkedCount: 250,
    allottedCount: 62,
    notAllottedCount: 185,
    errorCount: 3,
    status: 'completed',
    startedAt: '2026-01-30T10:15:00Z',
    completedAt: '2026-01-30T10:45:00Z',
    createdAt: '2026-01-30T10:15:00Z',
    results: [],
  },
  {
    id: 'batch-002',
    companyId: 'xyz-finance-2026',
    companyName: 'XYZ Finance Company',
    totalBoids: 150,
    checkedCount: 150,
    allottedCount: 38,
    notAllottedCount: 110,
    errorCount: 2,
    status: 'completed',
    startedAt: '2026-01-29T14:00:00Z',
    completedAt: '2026-01-29T14:25:00Z',
    createdAt: '2026-01-29T14:00:00Z',
    results: [],
  },
];

export const useIPOStore = create<IPOState>((set, get) => ({
  // Initial state
  companies: mockCompanies,
  selectedCompany: null,
  boids: [],
  validBoids: [],
  invalidBoids: [],
  duplicateCount: 0,
  config: {
    retryOnFailure: true,
    maxRetries: 3,
    delaySeconds: 3,
    captchaService: '2captcha',
    autoExport: false,
  },
  currentBatch: null,
  batchHistory: mockBatchHistory,
  totalChecksPerformed: 400,
  totalAllotted: 100,
  totalNotAllotted: 295,
  successRate: 25,

  // Actions
  setCompanies: (companies) => set({ companies }),
  
  selectCompany: (company) => set({ selectedCompany: company }),
  
  setBoids: (rawBoids) => {
    const seen = new Set<string>();
    const validBoids: string[] = [];
    const invalidBoids: string[] = [];
    let duplicateCount = 0;

    rawBoids.forEach((boid) => {
      const trimmed = boid.trim();
      if (!trimmed) return;
      
      // Check if valid (16 digits)
      const isValid = /^\d{16}$/.test(trimmed);
      
      if (seen.has(trimmed)) {
        duplicateCount++;
        return;
      }
      seen.add(trimmed);
      
      if (isValid) {
        validBoids.push(trimmed);
      } else {
        invalidBoids.push(trimmed);
      }
    });

    set({ boids: rawBoids, validBoids, invalidBoids, duplicateCount });
  },
  
  setConfig: (configUpdates) => set((state) => ({
    config: { ...state.config, ...configUpdates },
  })),
  
  setCurrentBatch: (batch) => set({ currentBatch: batch }),
  
  updateBatchProgress: (updates) => set((state) => ({
    currentBatch: state.currentBatch 
      ? { ...state.currentBatch, ...updates }
      : null,
  })),
  
  addResult: (result) => set((state) => {
    if (!state.currentBatch) return state;
    
    const updatedResults = [...state.currentBatch.results, result];
    const allottedCount = updatedResults.filter(r => r.status === 'allotted').length;
    const notAllottedCount = updatedResults.filter(r => r.status === 'not_allotted').length;
    const errorCount = updatedResults.filter(r => r.status === 'error').length;
    
    return {
      currentBatch: {
        ...state.currentBatch,
        results: updatedResults,
        checkedCount: updatedResults.length,
        allottedCount,
        notAllottedCount,
        errorCount,
      },
    };
  }),
  
  addToBatchHistory: (batch) => set((state) => ({
    batchHistory: [batch, ...state.batchHistory],
    totalChecksPerformed: state.totalChecksPerformed + batch.totalBoids,
    totalAllotted: state.totalAllotted + batch.allottedCount,
    totalNotAllotted: state.totalNotAllotted + batch.notAllottedCount,
    successRate: Math.round(
      ((state.totalAllotted + batch.allottedCount) / 
       (state.totalChecksPerformed + batch.totalBoids)) * 100
    ),
  })),
  
  clearCurrentCheck: () => set({
    selectedCompany: null,
    boids: [],
    validBoids: [],
    invalidBoids: [],
    duplicateCount: 0,
    currentBatch: null,
  }),
}));
