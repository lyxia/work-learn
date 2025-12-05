import { create } from 'zustand';
import { useTimerStore } from './timer';
import { useSessionRewardsStore } from './sessionRewards';
import { useUIStore } from './ui';

interface MultiSessionState {
  taskName: string;
  totalRounds: number;
  currentRound: number;
  completedRounds: number;
  totalFocusedSeconds: number; // 累计专注秒数
  isActive: boolean;
  roundDuration: number; // 标准每轮时长（分钟）
  lastRoundDuration: number; // 最后一轮时长（分钟），可能与标准时长不同
  sessionStartTime: number; // 会话开始时间戳
  createSession: (taskName: string, totalDuration: number, roundDuration: number) => void;
  startNextRound: () => void;
  completeCurrentRound: () => void;
  addFocusedSecond: () => void;
  finishEarly: () => void;
  cancel: () => void;
  reset: () => void;
}

export const useMultiSessionStore = create<MultiSessionState>((set, get) => ({
  taskName: '',
  totalRounds: 0,
  currentRound: 0,
  completedRounds: 0,
  totalFocusedSeconds: 0,
  isActive: false,
  roundDuration: 0,
  lastRoundDuration: 0,
  sessionStartTime: 0,
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

    // 重置 sessionRewards，确保干净状态
    useSessionRewardsStore.getState().resetSession();

    set({
      taskName,
      totalRounds,
      currentRound: 1,
      completedRounds: 0,
      totalFocusedSeconds: 0,
      isActive: true,
      roundDuration,
      lastRoundDuration,
      sessionStartTime: Date.now(),
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
  completeCurrentRound: () => {
    const { currentRound, totalRounds } = get();
    const newCompletedRounds = get().completedRounds + 1;

    set({ completedRounds: newCompletedRounds });

    // 判断是否是最后一轮
    if (currentRound === totalRounds) {
      // 最后一轮：计算随机奖励并打开结算弹窗（baseCoins 已通过 tick 实时更新）
      useSessionRewardsStore.getState().calculateBonusCoins();
      useUIStore.getState().openSettlementModal();
    } else {
      // 不是最后一轮：进入休息页面（baseCoins 已通过 tick 实时更新）
      useUIStore.getState().openRestModal();
    }
  },
  addFocusedSecond: () => {
    set((state) => ({ totalFocusedSeconds: state.totalFocusedSeconds + 1 }));
  },
  finishEarly: () => {
    // 提前完成：停止计时器，计算奖励并打开结算弹窗
    const timerStore = useTimerStore.getState();
    timerStore.stopTimer();
    // 计算最终奖励（baseCoins 已实时更新，这里只需计算随机奖励）
    useSessionRewardsStore.getState().calculateBonusCoins();
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
      totalFocusedSeconds: 0,
      isActive: false,
      roundDuration: 0,
      lastRoundDuration: 0,
      sessionStartTime: 0,
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

