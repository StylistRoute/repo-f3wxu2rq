import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage, Macro, MacroAction } from '../types';

interface ChatState {
  messages: ChatMessage[];
  isRecording: boolean;
  currentMacro: MacroAction[];
  macros: Macro[];
  isPlaying: boolean;
  browserUrl: string;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  startRecording: () => void;
  stopRecording: (testCaseId: string, name: string) => void;
  addMacroAction: (action: Omit<MacroAction, 'id' | 'timestamp'>) => void;
  playMacro: (macroId: string) => void;
  stopPlaying: () => void;
  deleteMacro: (id: string) => void;
  setBrowserUrl: (url: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'system',
      content: '欢迎使用 AI UI 测试工具！请用大白话告诉我你想测试什么，比如："打开登录页面，输入用户名admin，密码123456，点击登录按钮"',
      timestamp: new Date().toISOString(),
    },
  ],
  isRecording: false,
  currentMacro: [],
  macros: [
    {
      id: 'demo-macro-1',
      testCaseId: 'demo-tc-1',
      name: '登录流程宏',
      actions: [
        { id: 'ma1', type: 'navigate', value: 'https://demo-shop.example.com/login', timestamp: 0, description: '打开登录页面' },
        { id: 'ma2', type: 'input', selector: '#username', value: 'admin', timestamp: 1000, description: '输入用户名' },
        { id: 'ma3', type: 'input', selector: '#password', value: 'admin123', timestamp: 2000, description: '输入密码' },
        { id: 'ma4', type: 'click', selector: '#login-btn', timestamp: 3000, description: '点击登录按钮' },
      ],
      createdAt: '2024-01-17T08:00:00Z',
    },
  ],
  isPlaying: false,
  browserUrl: 'about:blank',

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  clearMessages: () =>
    set({
      messages: [
        {
          id: 'welcome',
          role: 'system',
          content: '对话已清空。请告诉我你想测试什么。',
          timestamp: new Date().toISOString(),
        },
      ],
    }),

  startRecording: () =>
    set({ isRecording: true, currentMacro: [] }),

  stopRecording: (testCaseId, name) => {
    const actions = get().currentMacro;
    if (actions.length > 0) {
      set((state) => ({
        isRecording: false,
        macros: [
          ...state.macros,
          {
            id: uuidv4(),
            testCaseId,
            name,
            actions,
            createdAt: new Date().toISOString(),
          },
        ],
        currentMacro: [],
      }));
    } else {
      set({ isRecording: false, currentMacro: [] });
    }
  },

  addMacroAction: (action) =>
    set((state) => ({
      currentMacro: [
        ...state.currentMacro,
        {
          ...action,
          id: uuidv4(),
          timestamp: Date.now(),
        },
      ],
    })),

  playMacro: (_macroId) => {
    set({ isPlaying: true });
    // Simulate macro playback
    setTimeout(() => {
      set({ isPlaying: false });
    }, 3000);
  },

  stopPlaying: () => set({ isPlaying: false }),

  deleteMacro: (id) =>
    set((state) => ({
      macros: state.macros.filter((m) => m.id !== id),
    })),

  setBrowserUrl: (url) => set({ browserUrl: url }),
}));
