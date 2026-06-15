export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Specification {
  id: string;
  projectId: string;
  title: string;
  content: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestData {
  id: string;
  projectId: string;
  name: string;
  description: string;
  data: Record<string, string>[];
  createdAt: string;
  updatedAt: string;
}

export interface TestStep {
  id: string;
  order: number;
  action: string;
  selector?: string;
  value?: string;
  description: string;
  screenshot?: string;
}

export interface MacroAction {
  id: string;
  type: 'click' | 'input' | 'navigate' | 'scroll' | 'wait' | 'assert';
  selector?: string;
  value?: string;
  x?: number;
  y?: number;
  timestamp: number;
  description: string;
}

export interface Macro {
  id: string;
  testCaseId: string;
  name: string;
  actions: MacroAction[];
  createdAt: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  steps: TestStep[];
  macroId?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'ready' | 'running' | 'passed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface TestReport {
  id: string;
  projectId: string;
  name: string;
  testCaseIds: string[];
  results: TestResult[];
  summary: ReportSummary;
  createdAt: string;
}

export interface TestResult {
  testCaseId: string;
  testCaseName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots: string[];
  steps: StepResult[];
}

export interface StepResult {
  stepId: string;
  description: string;
  status: 'passed' | 'failed' | 'skipped';
  error?: string;
  screenshot?: string;
}

export interface ReportSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  passRate: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  action?: MacroAction;
}
