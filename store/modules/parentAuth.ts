import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 简单哈希函数（本地应用安全性足够）
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

interface ParentAuthState {
  passwordHash: string | null;
  isPasswordSet: boolean;
  setPassword: (password: string) => void;
  verifyPassword: (password: string) => boolean;
  clearPassword: () => void;
}

export const useParentAuthStore = create<ParentAuthState>()(
  persist(
    (set, get) => ({
      passwordHash: null,
      isPasswordSet: false,

      setPassword: (password: string) => {
        const hash = simpleHash(password);
        set({ passwordHash: hash, isPasswordSet: true });
      },

      verifyPassword: (password: string) => {
        const { passwordHash } = get();
        if (!passwordHash) return false;
        return simpleHash(password) === passwordHash;
      },

      clearPassword: () => {
        set({ passwordHash: null, isPasswordSet: false });
      },
    }),
    {
      name: 'eggfocus-parent-auth',
    }
  )
);
