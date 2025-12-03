import { create } from 'zustand';
import { useTimerStore } from './timer';
import { useMultiSessionStore } from './multiSession';
import { useSettingsStore } from './settings';

interface SessionRewardsState {
  baseCoins: number;
  bonusCoins: number;
  calculateRewards: (duration: number) => void;
  calculateRewardsFromCurrentState: () => void;
  getTotalDuration: () => number;
  resetSession: () => void;
}

export const useSessionRewardsStore = create<SessionRewardsState>((set, get) => ({
  baseCoins: 0,
  bonusCoins: 0,

  // 根据时长计算奖励（纯计算，供内部或测试使用）
  calculateRewards: (duration: number) => {
    // duration: 时长（分钟）
    // 基础奖励：每分钟5金币
    const baseReward = Math.ceil(duration * 5);
    // 随机奖励：1 到 duration/2 之间的随机整数
    const randomBonus = Math.floor(Math.random() * (duration / 2)) + 1;

    set({
      baseCoins: baseReward > 0 ? baseReward : 1,
      bonusCoins: randomBonus > 0 ? randomBonus : 0,
    });
  },

  // 从当前状态计算累计时长（分钟）
  getTotalDuration: () => {
    const timerState = useTimerStore.getState();
    const sessionState = useMultiSessionStore.getState();
    const settingsState = useSettingsStore.getState();

    const { completedRounds, roundDuration } = sessionState;
    const effectiveRoundDuration = roundDuration || settingsState.settings.timerOverride || 1;

    // 已完成轮次的时长（分钟）
    let totalDuration = completedRounds * effectiveRoundDuration;

    // 加上当前轮次已经过去的时间（转换为分钟）
    const currentRoundTimePassed = timerState.totalTime - timerState.timeLeft;
    const currentRoundMinutes = currentRoundTimePassed / 60;
    totalDuration += currentRoundMinutes;

    return totalDuration;
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
