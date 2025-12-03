import { create } from 'zustand';

interface TimerState {
  isOpen: boolean;
  isActive: boolean;
  wasActiveBeforePause: boolean;
  timeLeft: number;
  totalTime: number;
  getProgress: () => number;
  getMinutesLeft: () => number;
  getSecondsLeft: () => number;
  startTimer: (duration: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  cancelTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isOpen: false,
  isActive: false,
  wasActiveBeforePause: false,
  timeLeft: 0,
  totalTime: 0,
  getProgress: () => {
    const { timeLeft, totalTime } = get();
    if (totalTime === 0) return 0;
    return ((totalTime - timeLeft) / totalTime) * 100;
  },
  getMinutesLeft: () => {
    return Math.floor(get().timeLeft / 60);
  },
  getSecondsLeft: () => {
    return get().timeLeft % 60;
  },
  startTimer: (duration: number) => {
    set({
      isOpen: true,
      isActive: true,
      wasActiveBeforePause: false,
      timeLeft: duration - 1, // 减1，避免多读1秒
      totalTime: duration,
    });
  },
  tickTimer: () => {
    const { timeLeft, isActive } = get();
    if (isActive && timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    }
  },
  stopTimer: () => {
    set({
      isActive: false,
      wasActiveBeforePause: false,
    });
  },
  cancelTimer: () => {
    set({
      isOpen: false,
      isActive: false,
      wasActiveBeforePause: false,
      timeLeft: 0,
      totalTime: 0,
    });
  },
  pauseTimer: () => {
    const { isActive } = get();
    if (!isActive) {
      set({ wasActiveBeforePause: false });
      return;
    }

    set({
      isActive: false,
      wasActiveBeforePause: true,
    });
  },
  resumeTimer: () => {
    const { wasActiveBeforePause, timeLeft } = get();
    set({
      isActive: wasActiveBeforePause && timeLeft > 0,
      wasActiveBeforePause: false,
    });
  },
}));

