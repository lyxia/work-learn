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
  roundDuration: number; // 标准每轮时长（分钟）
  lastRoundDuration: number; // 最后一轮时长（分钟），可能与标准时长不同
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
  roundDuration: 0,
  lastRoundDuration: 0,
  createSession: (taskName: string, totalDuration: number, roundDuration: number) => {
    // 使用秒作为基准单位进行计算，避免浮点数精度问题
    const totalDurationSeconds = Math.round(totalDuration * 60);
    const roundDurationSeconds = Math.round(roundDuration * 60);

    // 使用 Math.ceil 向上取整，确保不整除时也能完成所有时间
    const totalRounds = Math.ceil(totalDurationSeconds / roundDurationSeconds);
    // 计算最后一轮的时长（秒）
    const remainderSeconds = totalDurationSeconds % roundDurationSeconds;
    const lastRoundDurationSeconds = remainderSeconds > 0 ? remainderSeconds : roundDurationSeconds;

    // 转回分钟存储（保持接口兼容）
    const lastRoundDuration = lastRoundDurationSeconds / 60;

    set({
      taskName,
      totalRounds,
      currentRound: 1,
      completedRounds: 0,
      accumulatedCoins: 0,
      isActive: true,
      roundDuration,
      lastRoundDuration,
    });
    // 开始第1轮（第一轮始终使用标准时长，除非只有一轮）
    const timerStore = useTimerStore.getState();
    const firstRoundDurationSeconds = totalRounds === 1 ? lastRoundDurationSeconds : roundDurationSeconds;
    timerStore.startTimer(firstRoundDurationSeconds); // 直接使用秒
  },
  startNextRound: () => {
    const { currentRound, totalRounds, roundDuration, lastRoundDuration } = get();
    if (currentRound < totalRounds) {
      const nextRound = currentRound + 1;
      // 判断下一轮是否是最后一轮，如果是则使用 lastRoundDuration
      const nextRoundDuration = nextRound === totalRounds ? lastRoundDuration : roundDuration;
      set({ currentRound: nextRound });
      const timerStore = useTimerStore.getState();
      // 使用 Math.round 确保整数秒，避免浮点数精度问题
      timerStore.startTimer(Math.round(nextRoundDuration * 60));
    }
  },
  completeCurrentRound: (roundCoins: number) => {
    const { currentRound, totalRounds, accumulatedCoins, roundDuration, lastRoundDuration } = get();
    const newAccumulatedCoins = accumulatedCoins + roundCoins;
    const newCompletedRounds = get().completedRounds + 1;

    set({
      accumulatedCoins: newAccumulatedCoins,
      completedRounds: newCompletedRounds,
    });

    // 判断是否是最后一轮
    if (currentRound === totalRounds) {
      // 最后一轮：计算总奖励并打开结算弹窗
      // 总时长 = (总轮数-1) * 标准轮时长 + 最后一轮时长
      const totalDuration = (totalRounds - 1) * roundDuration + lastRoundDuration;
      useSessionRewardsStore.getState().calculateRewards(totalDuration);
      useUIStore.getState().openSettlementModal();
    } else {
      // 不是最后一轮：进入休息页面
      useUIStore.getState().openRestModal();
    }
  },
  updateAccumulatedCoins: (timePassed: number, totalTime: number) => {
    // timePassed: 已过去的时间（秒）
    // totalTime: 当前轮次总时间（秒）
    // 实时显示累计金币：Math.floor((timePassed / 60) * 5)
    const currentRoundCoins = Math.floor((timePassed / 60) * 5);
    const { completedRounds, roundDuration } = get();
    // 累计金币 = 已完成轮次的金币 + 当前轮次实时金币
    const effectiveRoundDuration = roundDuration || useSettingsStore.getState().settings.timerOverride || 1;
    const completedRoundsCoins = completedRounds * Math.ceil(effectiveRoundDuration * 5);
    set({
      accumulatedCoins: completedRoundsCoins + currentRoundCoins,
    });
  },
  finishEarly: () => {
    // 提前完成：停止计时器，计算奖励并打开结算弹窗
    const timerStore = useTimerStore.getState();
    timerStore.stopTimer();
    useSessionRewardsStore.getState().calculateRewardsFromCurrentState();
    useUIStore.getState().openSettlementModal();
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
      roundDuration: 0,
      lastRoundDuration: 0,
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

