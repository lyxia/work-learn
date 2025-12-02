import { create } from 'zustand';
import { useSettingsStore } from './settings';
import { useTimerStore } from './timer';
import { useSessionRewardsStore } from './sessionRewards';
import { useUIStore } from './ui';

interface MultiSessionState {
  taskName: string;
  totalRounds: number;
  currentRound: number;
  completedRounds: number;
  accumulatedCoins: number;
  isActive: boolean;
  createSession: (taskName: string, totalDuration: number, roundDuration: number) => void;
  startNextRound: () => void;
  completeCurrentRound: (roundCoins: number) => void;
  updateAccumulatedCoins: (timePassed: number, totalTime: number) => void;
  finishEarly: () => void;
  cancel: () => void;
  reset: () => void;
}

export const useMultiSessionStore = create<MultiSessionState>((set, get) => ({
  taskName: '',
  totalRounds: 0,
  currentRound: 0,
  completedRounds: 0,
  accumulatedCoins: 0,
  isActive: false,
  createSession: (taskName: string, totalDuration: number, roundDuration: number) => {
    const totalRounds = Math.floor(totalDuration / roundDuration);
    set({
      taskName,
      totalRounds,
      currentRound: 1,
      completedRounds: 0,
      accumulatedCoins: 0,
      isActive: true,
    });
    // 开始第1轮
    const timerStore = useTimerStore.getState();
    timerStore.startTimer(roundDuration * 60); // 转换为秒
  },
  startNextRound: () => {
    const { currentRound, totalRounds } = get();
    if (currentRound < totalRounds) {
      const roundDuration = useSettingsStore.getState().settings.timerOverride;
      if (roundDuration > 0) {
        set({ currentRound: currentRound + 1 });
        const timerStore = useTimerStore.getState();
        timerStore.startTimer(roundDuration * 60);
      }
    }
  },
  completeCurrentRound: (roundCoins: number) => {
    const { currentRound, totalRounds, accumulatedCoins } = get();
    const newAccumulatedCoins = accumulatedCoins + roundCoins;
    const newCompletedRounds = get().completedRounds + 1;
    
    set({
      accumulatedCoins: newAccumulatedCoins,
      completedRounds: newCompletedRounds,
    });

    // 判断是否是最后一轮
    if (currentRound === totalRounds) {
      // 最后一轮：计算总奖励并打开结算弹窗
      const roundDuration = useSettingsStore.getState().settings.timerOverride || 1;
      const totalDuration = totalRounds * roundDuration;
      const sessionRewardsStore = useSessionRewardsStore.getState();
      sessionRewardsStore.calculateRewards(totalDuration);
      
      const uiStore = useUIStore.getState();
      uiStore.openSettlementModal();
    } else {
      // 不是最后一轮：进入休息页面
      const uiStore = useUIStore.getState();
      uiStore.openRestModal();
    }
  },
  updateAccumulatedCoins: (timePassed: number, totalTime: number) => {
    // timePassed: 已过去的时间（秒）
    // totalTime: 当前轮次总时间（秒）
    // 实时显示累计金币：Math.floor((timePassed / 60) * 5)
    const currentRoundCoins = Math.floor((timePassed / 60) * 5);
    const { completedRounds } = get();
    // 累计金币 = 已完成轮次的金币 + 当前轮次实时金币
    const roundDuration = useSettingsStore.getState().settings.timerOverride || 1;
    const completedRoundsCoins = completedRounds * Math.ceil(roundDuration * 5);
    set({
      accumulatedCoins: completedRoundsCoins + currentRoundCoins,
    });
  },
  finishEarly: () => {
    // 提前完成：使用当前 accumulatedCoins 打开结算弹窗
    const { accumulatedCoins, completedRounds } = get();
    const roundDuration = useSettingsStore.getState().settings.timerOverride || 1;
    const totalDuration = completedRounds * roundDuration;
    
    if (totalDuration > 0) {
      const sessionRewardsStore = useSessionRewardsStore.getState();
      sessionRewardsStore.calculateRewards(totalDuration);
    }
    
    const uiStore = useUIStore.getState();
    uiStore.openSettlementModal();
  },
  cancel: () => {
    // 中途放弃：不给金币，立即结束会话
    const timerStore = useTimerStore.getState();
    timerStore.cancelTimer();
    get().reset();
  },
  reset: () => {
    set({
      taskName: '',
      totalRounds: 0,
      currentRound: 0,
      completedRounds: 0,
      accumulatedCoins: 0,
      isActive: false,
    });
    // 重置相关模块
    const timerStore = useTimerStore.getState();
    timerStore.cancelTimer();
    const sessionRewardsStore = useSessionRewardsStore.getState();
    sessionRewardsStore.resetSession();
    const uiStore = useUIStore.getState();
    uiStore.closeAllModals();
  },
}));

