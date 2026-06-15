import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Specification } from '../types';

interface SpecState {
  specifications: Specification[];
  addSpecification: (spec: Omit<Specification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSpecification: (id: string, data: Partial<Specification>) => void;
  deleteSpecification: (id: string) => void;
}

export const useSpecStore = create<SpecState>((set) => ({
  specifications: [
    {
      id: 'demo-spec-1',
      projectId: 'demo-project-1',
      title: '用户登录功能说明',
      content: '## 用户登录\n\n### 功能描述\n用户通过输入用户名和密码登录系统。\n\n### 输入\n- 用户名：字符串，必填\n- 密码：字符串，必填\n\n### 预期结果\n- 登录成功后跳转到首页\n- 登录失败显示错误提示',
      version: '1.0',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
    },
  ],

  addSpecification: (specData) =>
    set((state) => ({
      specifications: [
        ...state.specifications,
        {
          ...specData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateSpecification: (id, data) =>
    set((state) => ({
      specifications: state.specifications.map((s) =>
        s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
      ),
    })),

  deleteSpecification: (id) =>
    set((state) => ({
      specifications: state.specifications.filter((s) => s.id !== id),
    })),
}));
