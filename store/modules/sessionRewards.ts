import { create } from 'zustand';

interface SessionRewardsState {
  baseCoins: number;
  bonusCoins: number;
  calculateRewards: (duration: number) => void;
  resetSession: () => void;
}

export const useSessionRewardsStore = create<SessionRewardsState>((set) => ({
  baseCoins: 0,
  bonusCoins: 0,
  calculateRewards: (duration: number) => {
    // duration: 每轮时长（分钟）
    // 基础奖励：每分钟5金币
    const baseReward = Math.ceil(duration * 5);
    // 随机奖励：0 到 duration/2 之间的随机整数
    const randomBonus = Math.floor(Math.random() * (duration / 2)) + 1;
    
    set({
      baseCoins: baseReward > 0 ? baseReward : 1,
      bonusCoins: randomBonus > 0 ? randomBonus : 0,
    });
  },
  resetSession: () => {
    set({
      baseCoins: 0,
      bonusCoins: 0,
    });
  },
}));

