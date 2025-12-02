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
      accumulatedCoins: 0,
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
      expect(state.accumulatedCoins).toBe(0);
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
      expect(state.accumulatedCoins).toBe(0);
      expect(state.isActive).toBe(true);
    });

    it('应该计算正确的总轮数', () => {
      const { createSession } = useMultiSessionStore.getState();
      createSession('英语阅读', 20, 2); // 总时长20分钟，每轮2分钟
      expect(useMultiSessionStore.getState().totalRounds).toBe(10);
    });

    it('应该启动第1轮计时器', () => {
      const { createSession } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      const timerState = useTimerStore.getState();
      expect(timerState.isOpen).toBe(true);
      expect(timerState.isActive).toBe(true);
      expect(timerState.timeLeft).toBe(59); // 1分钟 = 60秒，启动时减1避免多读1秒
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
  });

  describe('completeCurrentRound', () => {
    it('应该更新累计金币和完成轮数', () => {
      const { createSession, completeCurrentRound } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      completeCurrentRound(5); // 当前轮获得5金币
      const state = useMultiSessionStore.getState();
      expect(state.accumulatedCoins).toBe(5);
      expect(state.completedRounds).toBe(1);
    });

    it('如果不是最后一轮，应该打开休息弹窗', () => {
      const { createSession, completeCurrentRound } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      completeCurrentRound(5);
      expect(useUIStore.getState().restModal.isOpen).toBe(true);
      expect(useUIStore.getState().settlementModal.isOpen).toBe(false);
    });

    it('如果是最后一轮，应该打开结算弹窗', () => {
      const { createSession, completeCurrentRound } = useMultiSessionStore.getState();
      createSession('数学作业', 2, 1); // 总共2轮
      useMultiSessionStore.setState({ currentRound: 2 });
      completeCurrentRound(5);
      expect(useUIStore.getState().settlementModal.isOpen).toBe(true);
    });

    it('最后一轮应该计算总奖励', () => {
      const { createSession, completeCurrentRound } = useMultiSessionStore.getState();
      createSession('数学作业', 2, 1); // 总共2轮，每轮1分钟
      useMultiSessionStore.setState({ currentRound: 2 });
      completeCurrentRound(5);
      const rewardsState = useSessionRewardsStore.getState();
      // 总时长2分钟，基础奖励应该是10金币
      expect(rewardsState.baseCoins).toBe(10);
    });
  });

  describe('updateAccumulatedCoins', () => {
    it('应该实时更新累计金币', () => {
      const { createSession, updateAccumulatedCoins } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      // 模拟已过去30秒（0.5分钟）
      updateAccumulatedCoins(30, 60);
      // 当前轮次金币：Math.floor(0.5 * 5) = 2
      expect(useMultiSessionStore.getState().accumulatedCoins).toBe(2);
    });

    it('应该累加已完成轮次的金币', () => {
      const { createSession, updateAccumulatedCoins } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      useMultiSessionStore.setState({ completedRounds: 2 });
      // 已完成2轮，每轮5金币 = 10金币
      // 当前轮次已过去30秒 = 2金币
      updateAccumulatedCoins(30, 60);
      expect(useMultiSessionStore.getState().accumulatedCoins).toBe(12);
    });
  });

  describe('finishEarly', () => {
    it('应该打开结算弹窗', () => {
      const { createSession, finishEarly } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      useMultiSessionStore.setState({ completedRounds: 3, accumulatedCoins: 15 });
      finishEarly();
      expect(useUIStore.getState().settlementModal.isOpen).toBe(true);
    });

    it('应该计算已完成轮次的总奖励', () => {
      const { createSession, finishEarly } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      useMultiSessionStore.setState({ completedRounds: 3 });
      finishEarly();
      const rewardsState = useSessionRewardsStore.getState();
      // 已完成3轮，每轮1分钟，总时长3分钟，基础奖励15金币
      expect(rewardsState.baseCoins).toBe(15);
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
      const { createSession, reset } = useMultiSessionStore.getState();
      createSession('数学作业', 10, 1);
      useMultiSessionStore.setState({ accumulatedCoins: 50 });
      reset();
      const state = useMultiSessionStore.getState();
      expect(state.taskName).toBe('');
      expect(state.totalRounds).toBe(0);
      expect(state.currentRound).toBe(0);
      expect(state.completedRounds).toBe(0);
      expect(state.accumulatedCoins).toBe(0);
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
      accumulatedCoins: 0,
      isActive: false,
    });
  });

  it('应该完整执行多轮学习流程', () => {
    // 1. 创建会话
    useMultiSessionStore.getState().createSession('数学作业', 3, 1); // 3轮，每轮1分钟
    expect(useMultiSessionStore.getState().isActive).toBe(true);
    expect(useMultiSessionStore.getState().currentRound).toBe(1);
    expect(useTimerStore.getState().isActive).toBe(true);

    // 2. 完成第1轮
    useMultiSessionStore.getState().completeCurrentRound(5);
    expect(useMultiSessionStore.getState().completedRounds).toBe(1);
    expect(useUIStore.getState().restModal.isOpen).toBe(true);

    // 3. 开始第2轮
    useUIStore.getState().closeRestModal();
    useMultiSessionStore.getState().startNextRound();
    expect(useMultiSessionStore.getState().currentRound).toBe(2);

    // 4. 完成第2轮
    useMultiSessionStore.getState().completeCurrentRound(5);
    expect(useMultiSessionStore.getState().completedRounds).toBe(2);
    expect(useUIStore.getState().restModal.isOpen).toBe(true);

    // 5. 开始第3轮（最后一轮）
    useUIStore.getState().closeRestModal();
    useMultiSessionStore.getState().startNextRound();
    expect(useMultiSessionStore.getState().currentRound).toBe(3);

    // 6. 完成第3轮
    useMultiSessionStore.getState().completeCurrentRound(5);
    expect(useMultiSessionStore.getState().completedRounds).toBe(3);
    expect(useUIStore.getState().settlementModal.isOpen).toBe(true);
    expect(useSessionRewardsStore.getState().baseCoins).toBe(15); // 3分钟 * 5 = 15
  });
});

