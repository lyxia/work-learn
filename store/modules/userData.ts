import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserDataState {
  coins: number;
  isMuted: boolean;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => void;
  setCoins: (amount: number) => void;
  toggleMute: () => void;
}

export const useUserDataStore = create<UserDataState>()(
  persist(
    (set) => ({
      coins: 0,
      isMuted: false,
      addCoins: (amount: number) => {
        set((state) => ({
          coins: Math.max(0, state.coins + amount),
        }));
      },
      deductCoins: (amount: number) => {
        set((state) => ({
          coins: Math.max(0, state.coins - amount),
        }));
      },
      setCoins: (amount: number) => {
        set({
          coins: Math.max(0, amount),
        });
      },
      toggleMute: () => {
        set((state) => ({
          isMuted: !state.isMuted,
        }));
      },
    }),
    {
      name: 'eggfocus-userdata',
    }
  )
);

