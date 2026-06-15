import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { TestData } from '../types';

interface TestDataState {
  testDataSets: TestData[];
  addTestData: (data: Omit<TestData, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTestData: (id: string, data: Partial<TestData>) => void;
  deleteTestData: (id: string) => void;
}

export const useTestDataStore = create<TestDataState>((set) => ({
  testDataSets: [
    {
      id: 'demo-data-1',
      projectId: 'demo-project-1',
      name: '登录测试数据',
      description: '用于登录功能测试的用户数据',
      data: [
        { username: 'admin', password: 'admin123', expected: '登录成功' },
        { username: 'user1', password: 'wrong', expected: '密码错误' },
        { username: '', password: '123456', expected: '用户名不能为空' },
      ],
      createdAt: '2024-01-16T09:00:00Z',
      updatedAt: '2024-01-16T09:00:00Z',
    },
  ],

  addTestData: (dataItem) =>
    set((state) => ({
      testDataSets: [
        ...state.testDataSets,
        {
          ...dataItem,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateTestData: (id, data) =>
    set((state) => ({
      testDataSets: state.testDataSets.map((d) =>
        d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
      ),
    })),

  deleteTestData: (id) =>
    set((state) => ({
      testDataSets: state.testDataSets.filter((d) => d.id !== id),
    })),
}));
