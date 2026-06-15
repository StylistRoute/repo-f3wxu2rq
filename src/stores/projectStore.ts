import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Project, TestCase, TestReport } from '../types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  testCases: TestCase[];
  testReports: TestReport[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  addTestCase: (testCase: Omit<TestCase, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTestCase: (id: string, data: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  addTestReport: (report: Omit<TestReport, 'id' | 'createdAt'>) => void;
  deleteTestReport: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [
    {
      id: 'demo-project-1',
      name: '电商平台',
      description: '电商平台前端自动化测试项目',
      url: 'https://demo-shop.example.com',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z',
    },
  ],
  currentProject: null,
  testCases: [
    {
      id: 'demo-tc-1',
      projectId: 'demo-project-1',
      name: '用户登录测试',
      description: '验证用户可以正常登录系统',
      steps: [
        { id: 's1', order: 1, action: 'navigate', value: '/login', description: '打开登录页面' },
        { id: 's2', order: 2, action: 'input', selector: '#username', value: 'testuser', description: '输入用户名' },
        { id: 's3', order: 3, action: 'input', selector: '#password', value: '123456', description: '输入密码' },
        { id: 's4', order: 4, action: 'click', selector: '#login-btn', description: '点击登录按钮' },
      ],
      priority: 'high',
      status: 'ready',
      createdAt: '2024-01-16T08:00:00Z',
      updatedAt: '2024-01-16T08:00:00Z',
    },
  ],
  testReports: [],

  addProject: (projectData) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...projectData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      testCases: state.testCases.filter((tc) => tc.projectId !== id),
      testReports: state.testReports.filter((tr) => tr.projectId !== id),
    })),

  setCurrentProject: (project) => set({ currentProject: project }),

  addTestCase: (testCaseData) =>
    set((state) => ({
      testCases: [
        ...state.testCases,
        {
          ...testCaseData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateTestCase: (id, data) =>
    set((state) => ({
      testCases: state.testCases.map((tc) =>
        tc.id === id ? { ...tc, ...data, updatedAt: new Date().toISOString() } : tc
      ),
    })),

  deleteTestCase: (id) =>
    set((state) => ({
      testCases: state.testCases.filter((tc) => tc.id !== id),
    })),

  addTestReport: (reportData) =>
    set((state) => ({
      testReports: [
        ...state.testReports,
        {
          ...reportData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  deleteTestReport: (id) =>
    set((state) => ({
      testReports: state.testReports.filter((tr) => tr.id !== id),
    })),
}));
