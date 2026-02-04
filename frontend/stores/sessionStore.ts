import { create } from 'zustand';
import { getOrCreateSessionId } from '@/lib/session';

interface SessionState {
  sessionId: string;
  isInitialized: boolean;
  initializeSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: '',
  isInitialized: false,
  initializeSession: async () => {
    try {
      const sessionId = await getOrCreateSessionId();
      set({ sessionId, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize session:', error);
      set({ isInitialized: true }); // 에러가 나도 초기화 완료로 표시
    }
  },
}));
