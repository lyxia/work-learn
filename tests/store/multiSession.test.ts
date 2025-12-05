import { describe, it, expect, beforeEach } from 'vitest';
import { useMultiSessionStore } from '../../store/modules/multiSession';
import { useSettingsStore } from '../../store/modules/settings';
import { useTimerStore } from '../../store/modules/timer';
import { useSessionRewardsStore } from '../../store/modules/sessionRewards';
import { useUIStore } from '../../store/modules/ui';

describe('MultiSession Store', () => {
  beforeEach(() => {
    // 重置所有相关 store
    useSettingsStore.setState({
      settings: {
        taskOptions: [10, 20, 30, 40],
        restDuration: 300,
        timerOverride: 1, // 1分钟
      },
      isOpen: false,
      timerOptions: [],
    });
    useSettingsStore.getState().updateSettings({
      taskOptions: [10, 20, 30, 40],
      restDuration: 300,
      timerOverride: 1,
    });

    useTimerStore.setState({
      isOpen: false,
      isActive: false,
      timeLeft: 0,
      totalTime: 0,
    });

    useSessionRewardsStore.setState({
      baseCoins: 0,
      bonusCoins: 0,
    });

    useUIStore.setState({
      settlementModal: { isOpen: false },
      restModal: { isOpen: false },
      vaultModal: { isOpen: false },
    });

    useMultiSessionStore.setState({
      taskName: '',
      totalRounds: 0,
      currentRound: 0,
      completedRounds: 0,
      totalFocusedSeconds: 0,
      isActive: false,
    });
  });

  describe('初始状态', () => {
    it('应该有默认值', () => {
      const state = useMultiSessionStore.getState();
      expect(state.taskName).toBe('');
      expect(state.totalRounds).toBe(0);
      expect(state.currentRound).toBe(0);
      expect(state.completedRounds).toBe(0);
      expect(state.totalFocusedSeconds).toBe(0);
      expect(state.isActive).toBe(false);
    });
  });

  describe('createSession', () => {
    it('应该创建多轮学习会话', () => {
      const { createSession } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1); // 总时长10分钟，每轮1分钟
      const state = useMultiSessionStore.getState();
      expect(state.taskName).toBe('数学作业');
      expect(state.totalRounds).toBe(10);
      expect(state.currentRound).toBe(1);
      expect(state.completedRounds).toBe(0);
      expect(state.totalFocusedSeconds).toBe(0);
      expect(state.isActive).toBe(true);
    });

    it('应该计算正确的总轮数', () => {
      const { createSession } = useMultiSessionStore.getState();
      createSession('英语阅读', 20, 2); // 总时长20分钟，每轮2分钟
      expect(useMultiSessionStore.getState().totalRounds).toBe(10);
    });

    it('不整除时应该向上取整计算轮数', () => {
      const { createSession } = useMultiSessionStore.getState();
      createSession('数学作业', 3, 2); // 总时长3分钟，每轮2分钟
      const state = useMultiSessionStore.getState();
      expect(state.totalRounds).toBe(2); // Math.ceil(3/2) = 2
      expect(state.roundDuration).toBe(2);
      expect(state.lastRoundDuration).toBe(1); // 3 % 2 = 1
    });

    it('整除时最后一轮时长应该等于标准时长', () => {
      const { createSession } = useMultiSessionStore.getState();
      createSession('英语阅读', 6, 2); // 总时长6分钟，每轮2分钟
      const state = useMultiSessionStore.getState();
      expect(state.totalRounds).toBe(3);
      expect(state.roundDuration).toBe(2);
      expect(state.lastRoundDuration).toBe(2); // 6 % 2 = 0，使用 roundDuration
    });

    it('应该启动第1轮计时器', () => {
      const { createSession } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      const timerState = useTimerStore.getState();
      expect(timerState.isOpen).toBe(true);
      expect(timerState.isActive).toBe(true);
      expect(timerState.timeLeft).toBe(59); // 1分钟 = 60秒，启动时减1避免多读1秒
    });

    it('应该重置 sessionRewards', () => {
      // 先设置一些旧值
      useSessionRewardsStore.setState({ baseCoins: 100, bonusCoins: 50 });
      const { createSession } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      const rewardsState = useSessionRewardsStore.getState();
      expect(rewardsState.baseCoins).toBe(0);
      expect(rewardsState.bonusCoins).toBe(0);
    });
  });

  describe('startNextRound', () => {
    it('应该开始下一轮', () => {
      const { createSession, startNextRound } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      startNextRound();
      expect(useMultiSessionStore.getState().currentRound).toBe(2);
    });

    it('应该启动新的计时器', () => {
      const { createSession, startNextRound } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      useTimerStore.getState().stopTimer();
      startNextRound();
      const timerState = useTimerStore.getState();
      expect(timerState.isActive).toBe(true);
      expect(timerState.timeLeft).toBe(59); // 1分钟 = 60秒，启动时减1避免多读1秒
    });

    it('如果是最后一轮，不应该继续', () => {
      const { createSession, startNextRound } = useMultiSessionStore.getState();
      createSession('数学作业', 2, 1); // 总共2轮
      useMultiSessionStore.setState({ currentRound: 2 });
      startNextRound();
      expect(useMultiSessionStore.getState().currentRound).toBe(2);
    });

    it('不整除时最后一轮应该使用正确的时长', () => {
      const { createSession, startNextRound } = useMultiSessionStore.getState();
      createSession('数学作业', 3, 2); // 总时长3分钟，每轮2分钟，共2轮
      // 第一轮应该是2分钟 = 120秒，启动时减1
      expect(useTimerStore.getState().timeLeft).toBe(119);
      // 开始第二轮（最后一轮）
      startNextRound();
      // 最后一轮应该是1分钟 = 60秒，启动时减1
      expect(useTimerStore.getState().timeLeft).toBe(59);
    });
  });

  describe('addFocusedSecond', () => {
    it('应该累加专注秒数', () => {
      const { createSession, addFocusedSecond } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      addFocusedSecond();
      expect(useMultiSessionStore.getState().totalFocusedSeconds).toBe(1);
      addFocusedSecond();
      expect(useMultiSessionStore.getState().totalFocusedSeconds).toBe(2);
    });

    it('应该在多轮之间持续累加', () => {
      const { createSession, addFocusedSecond } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      // 模拟第一轮专注60秒
      for (let i = 0; i < 60; i++) {
        addFocusedSecond();
      }
      expect(useMultiSessionStore.getState().totalFocusedSeconds).toBe(60);
      // 模拟第二轮专注30秒
      for (let i = 0; i < 30; i++) {
        addFocusedSecond();
      }
      expect(useMultiSessionStore.getState().totalFocusedSeconds).toBe(90);
    });
  });

  describe('completeCurrentRound', () => {
    it('应该更新完成轮数', () => {
      const { createSession, completeCurrentRound } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      completeCurrentRound();
      const state = useMultiSessionStore.getState();
      expect(state.completedRounds).toBe(1);
    });

    it('如果不是最后一轮，应该打开休息弹窗', () => {
      const { createSession, completeCurrentRound } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      completeCurrentRound();
      expect(useUIStore.getState().restModal.isOpen).toBe(true);
      expect(useUIStore.getState().settlementModal.isOpen).toBe(false);
    });

    it('如果是最后一轮，应该打开结算弹窗并计算随机奖励', () => {
      const { createSession, completeCurrentRound, addFocusedSecond } = useMultiSessionStore.getState();
      createSession('数学作业', 2, 1); // 总共2轮
      // 模拟专注了120秒（2分钟）
      for (let i = 0; i < 120; i++) {
        addFocusedSecond();
      }
      useMultiSessionStore.setState({ currentRound: 2 });
      completeCurrentRound();
      expect(useUIStore.getState().settlementModal.isOpen).toBe(true);
      // bonusCoins 应该被计算（随机值）
      expect(useSessionRewardsStore.getState().bonusCoins).toBeGreaterThanOrEqual(1);
    });
  });

  describe('finishEarly', () => {
    it('应该打开结算弹窗', () => {
      const { createSession, finishEarly, addFocusedSecond } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      // 模拟专注了30秒
      for (let i = 0; i < 30; i++) {
        addFocusedSecond();
      }
      finishEarly();
      expect(useUIStore.getState().settlementModal.isOpen).toBe(true);
    });

    it('应该计算随机奖励', () => {
      const { createSession, finishEarly, addFocusedSecond } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      // 模拟专注了60秒（1分钟）
      for (let i = 0; i < 60; i++) {
        addFocusedSecond();
      }
      // 先计算 baseCoins
      useSessionRewardsStore.getState().calculateRewardsFromCurrentState();
      finishEarly();
      const rewardsState = useSessionRewardsStore.getState();
      // bonusCoins 应该被计算（随机值）
      expect(rewardsState.bonusCoins).toBeGreaterThanOrEqual(1);
    });
  });

  describe('cancel', () => {
    it('应该取消计时器并重置状态', () => {
      const { createSession, cancel } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      cancel();
      expect(useTimerStore.getState().isOpen).toBe(false);
      expect(useMultiSessionStore.getState().isActive).toBe(false);
    });
  });

  describe('reset', () => {
    it('应该重置所有状态', () => {
      const { createSession, reset, addFocusedSecond } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      addFocusedSecond();
      addFocusedSecond();
      reset();
      const state = useMultiSessionStore.getState();
      expect(state.taskName).toBe('');
      expect(state.totalRounds).toBe(0);
      expect(state.currentRound).toBe(0);
      expect(state.completedRounds).toBe(0);
      expect(state.totalFocusedSeconds).toBe(0);
      expect(state.isActive).toBe(false);
    });

    it('应该关闭所有弹窗', () => {
      const { createSession, reset } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      useUIStore.getState().openSettlementModal();
      reset();
      expect(useUIStore.getState().settlementModal.isOpen).toBe(false);
    });
  });
});

describe('MultiSession Store 集成测试', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: {
        taskOptions: [10, 20, 30, 40],
        restDuration: 300,
        timerOverride: 1,
      },
      isOpen: false,
      timerOptions: [],
    });
    useSettingsStore.getState().updateSettings({
      taskOptions: [10, 20, 30, 40],
      restDuration: 300,
      timerOverride: 1,
    });

    useTimerStore.setState({
      isOpen: false,
      isActive: false,
      timeLeft: 0,
      totalTime: 0,
    });

    useSessionRewardsStore.setState({
      baseCoins: 0,
      bonusCoins: 0,
    });

    useUIStore.setState({
      settlementModal: { isOpen: false },
      restModal: { isOpen: false },
      vaultModal: { isOpen: false },
    });

    useMultiSessionStore.setState({
      taskName: '',
      totalRounds: 0,
      currentRound: 0,
      completedRounds: 0,
      totalFocusedSeconds: 0,
      isActive: false,
    });
  });

  it('应该完整执行多轮学习流程', () => {
    const { createSession, completeCurrentRound, startNextRound, addFocusedSecond } = useMultiSessionStore.getState();
    const { calculateRewardsFromCurrentState } = useSessionRewardsStore.getState();

    // 1. 创建会话
    createSession('数学作业', 3, 1); // 3轮，每轮1分钟
    expect(useMultiSessionStore.getState().isActive).toBe(true);
    expect(useMultiSessionStore.getState().currentRound).toBe(1);
    expect(useTimerStore.getState().isActive).toBe(true);

    // 模拟第1轮专注60秒
    for (let i = 0; i < 60; i++) {
      addFocusedSecond();
      calculateRewardsFromCurrentState();
    }
    expect(useSessionRewardsStore.getState().baseCoins).toBe(5); // 1分钟 * 5 = 5

    // 2. 完成第1轮
    completeCurrentRound();
    expect(useMultiSessionStore.getState().completedRounds).toBe(1);
    expect(useUIStore.getState().restModal.isOpen).toBe(true);

    // 3. 开始第2轮
    useUIStore.getState().closeRestModal();
    startNextRound();
    expect(useMultiSessionStore.getState().currentRound).toBe(2);

    // 模拟第2轮专注60秒
    for (let i = 0; i < 60; i++) {
      addFocusedSecond();
      calculateRewardsFromCurrentState();
    }
    expect(useSessionRewardsStore.getState().baseCoins).toBe(10); // 2分钟 * 5 = 10

    // 4. 完成第2轮
    completeCurrentRound();
    expect(useMultiSessionStore.getState().completedRounds).toBe(2);
    expect(useUIStore.getState().restModal.isOpen).toBe(true);

    // 5. 开始第3轮（最后一轮）
    useUIStore.getState().closeRestModal();
    startNextRound();
    expect(useMultiSessionStore.getState().currentRound).toBe(3);

    // 模拟第3轮专注60秒
    for (let i = 0; i < 60; i++) {
      addFocusedSecond();
      calculateRewardsFromCurrentState();
    }
    expect(useSessionRewardsStore.getState().baseCoins).toBe(15); // 3分钟 * 5 = 15

    // 6. 完成第3轮
    completeCurrentRound();
    expect(useMultiSessionStore.getState().completedRounds).toBe(3);
    expect(useUIStore.getState().settlementModal.isOpen).toBe(true);
    expect(useSessionRewardsStore.getState().baseCoins).toBe(15);
    expect(useSessionRewardsStore.getState().bonusCoins).toBeGreaterThanOrEqual(1);
  });
});
