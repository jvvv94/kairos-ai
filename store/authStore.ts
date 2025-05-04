import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  nickname?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  tokenExpiry: number | null;
  setAuth: (user: User, token: string, expiresIn: number) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tokenExpiry: null,
      setAuth: (user, token, expiresIn) => {
        const expiryTime = Date.now() + expiresIn * 1000;
        set({ user, token, tokenExpiry: expiryTime });
      },
      clearAuth: () => set({ user: null, token: null, tokenExpiry: null }),
      isAuthenticated: function() {
        const state = get();
        return Boolean(state.token && state.tokenExpiry && state.tokenExpiry > Date.now());
      },
      refreshToken: async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error('토큰 갱신 실패');
          }

          const data = await response.json();
          const expiryTime = Date.now() + data.expiresIn * 1000;
          set({ token: data.token, tokenExpiry: expiryTime });
        } catch (error) {
          console.error('토큰 갱신 실패:', error);
          get().clearAuth();
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 