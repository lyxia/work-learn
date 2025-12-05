import { create } from 'zustand';
import { useMultiSessionStore } from './multiSession';

interface SessionRewardsState {
  baseCoins: number;
  bonusCoins: number;
  calculateRewards: (duration: number) => void;
  calculateBonusCoins: (duration?: number) => void;
  calculateRewardsFromCurrentState: () => void;
  getTotalDuration: () => number;
  resetSession: () => void;
}

export const useSessionRewardsStore = create<SessionRewardsState>((set, get) => ({
  baseCoins: 0,
  bonusCoins: 0,

  // 根据时长计算基础金币（实时调用，只更新 baseCoins）
  calculateRewards: (duration: number) => {
    // duration: 时长（分钟）
    // 基础奖励：每分钟5金币
    const baseReward = Math.ceil(duration * 5);
    set({ baseCoins: baseReward > 0 ? baseReward : 1 });
  },

  // 计算随机奖励（只在最后结算时调用）
  calculateBonusCoins: (duration?: number) => {
    const d = duration ?? get().getTotalDuration();
    const randomBonus = Math.floor(Math.random() * (d / 2)) + 1;
    set({ bonusCoins: randomBonus > 0 ? randomBonus : 0 });
  },

  // 从当前状态计算累计时长（分钟）
  getTotalDuration: () => {
    const { totalFocusedSeconds } = useMultiSessionStore.getState();
    return totalFocusedSeconds / 60;
  },

  // 从当前会话状态自动计算奖励
  calculateRewardsFromCurrentState: () => {
    const totalDuration = get().getTotalDuration();

    if (totalDuration > 0) {
      get().calculateRewards(totalDuration);
    }
  },

  resetSession: () => {
    set({
      baseCoins: 0,
      bonusCoins: 0,
    });
  },
}));
