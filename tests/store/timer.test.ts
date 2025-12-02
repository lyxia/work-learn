import { describe, it, expect, beforeEach } from 'vitest';
import { useTimerStore } from '../../store/modules/timer';

describe('Timer Store', () => {
  beforeEach(() => {
    useTimerStore.setState({
      isOpen: false,
      isActive: false,
      timeLeft: 0,
      totalTime: 0,
    });
  });

  describe('初始状态', () => {
    it('应该有默认值', () => {
      const state = useTimerStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.isActive).toBe(false);
      expect(state.timeLeft).toBe(0);
      expect(state.totalTime).toBe(0);
    });
  });

  describe('startTimer', () => {
    it('应该启动计时器', () => {
      const { startTimer } = useTimerStore.getState();
      startTimer(60); // 60秒
      const state = useTimerStore.getState();
      expect(state.isOpen).toBe(true);
      expect(state.isActive).toBe(true);
      expect(state.timeLeft).toBe(59); // 减1，避免多读1秒
      expect(state.totalTime).toBe(60);
    });

    it('应该设置正确的时间', () => {
      const { startTimer } = useTimerStore.getState();
      startTimer(300); // 5分钟
      const state = useTimerStore.getState();
      expect(state.timeLeft).toBe(299); // 减1，避免多读1秒
      expect(state.totalTime).toBe(300);
    });
  });

  describe('tickTimer', () => {
    it('应该减少剩余时间', () => {
      const { startTimer, tickTimer } = useTimerStore.getState();
      startTimer(60);
      tickTimer();
      expect(useTimerStore.getState().timeLeft).toBe(58); // 启动时是59，tick一次后是58
    });

    it('应该多次减少时间', () => {
      const { startTimer, tickTimer } = useTimerStore.getState();
      startTimer(60);
      tickTimer();
      tickTimer();
      tickTimer();
      expect(useTimerStore.getState().timeLeft).toBe(56); // 启动时是59，tick三次后是56
    });

    it('如果计时器未激活，不应该减少时间', () => {
      const { startTimer, stopTimer, tickTimer } = useTimerStore.getState();
      startTimer(60);
      stopTimer();
      tickTimer();
      expect(useTimerStore.getState().timeLeft).toBe(59); // 启动时是59，停止后不会减少
    });

    it('如果时间为0，不应该继续减少', () => {
      const { startTimer, tickTimer } = useTimerStore.getState();
      startTimer(1);
      expect(useTimerStore.getState().timeLeft).toBe(0); // 启动时就是0（1-1=0）
      tickTimer();
      expect(useTimerStore.getState().timeLeft).toBe(0);
      tickTimer();
      expect(useTimerStore.getState().timeLeft).toBe(0);
    });
  });

  describe('stopTimer', () => {
    it('应该停止计时器', () => {
      const { startTimer, stopTimer } = useTimerStore.getState();
      startTimer(60);
      stopTimer();
      expect(useTimerStore.getState().isActive).toBe(false);
      expect(useTimerStore.getState().isOpen).toBe(true);
      expect(useTimerStore.getState().timeLeft).toBe(59); // 启动时是59
    });
  });

  describe('cancelTimer', () => {
    it('应该取消计时器并重置所有状态', () => {
      const { startTimer, cancelTimer } = useTimerStore.getState();
      startTimer(60);
      cancelTimer();
      const state = useTimerStore.getState();
      expect(state.isOpen).toBe(false);
      expect(state.isActive).toBe(false);
      expect(state.timeLeft).toBe(0);
      expect(state.totalTime).toBe(0);
    });
  });

  describe('getProgress (computed)', () => {
    it('应该计算进度百分比', () => {
      const { startTimer, tickTimer, getProgress } = useTimerStore.getState();
      startTimer(100);
      expect(getProgress()).toBe(1); // (100 - 99) / 100 = 1%
      tickTimer();
      expect(getProgress()).toBe(2); // (100 - 98) / 100 = 2%
      // 减少50秒
      for (let i = 0; i < 50; i++) {
        tickTimer();
      }
      expect(getProgress()).toBe(52); // (100 - 48) / 100 = 52%
    });

    it('如果总时间为0，进度应该为0', () => {
      const { getProgress } = useTimerStore.getState();
      expect(getProgress()).toBe(0);
    });

    it('进度不应该超过100%', () => {
      const { startTimer, tickTimer, getProgress } = useTimerStore.getState();
      startTimer(10);
      // 减少超过总时间
      for (let i = 0; i < 20; i++) {
        tickTimer();
      }
      const progress = getProgress();
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  describe('getMinutesLeft (computed)', () => {
    it('应该计算剩余分钟数', () => {
      const { startTimer, getMinutesLeft } = useTimerStore.getState();
      startTimer(125); // 2分5秒，启动后是124秒（2分4秒）
      expect(getMinutesLeft()).toBe(2);
    });

    it('应该正确计算分钟数', () => {
      const { startTimer, getMinutesLeft } = useTimerStore.getState();
      startTimer(60); // 1分钟，启动后是59秒
      expect(getMinutesLeft()).toBe(0); // 59秒 = 0分钟
      startTimer(59); // 59秒，启动后是58秒
      expect(getMinutesLeft()).toBe(0);
    });
  });

  describe('getSecondsLeft (computed)', () => {
    it('应该计算剩余秒数', () => {
      const { startTimer, getSecondsLeft } = useTimerStore.getState();
      startTimer(125); // 2分5秒，启动后是124秒（2分4秒）
      expect(getSecondsLeft()).toBe(4);
    });

    it('应该正确计算秒数', () => {
      const { startTimer, getSecondsLeft } = useTimerStore.getState();
      startTimer(65); // 1分5秒，启动后是64秒（1分4秒）
      expect(getSecondsLeft()).toBe(4);
      startTimer(10); // 10秒，启动后是9秒
      expect(getSecondsLeft()).toBe(9);
    });
  });
});

