import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionRewardsStore } from '../../store/modules/sessionRewards';
import { useMultiSessionStore } from '../../store/modules/multiSession';

describe('SessionRewards Store', () => {
  beforeEach(() => {
    useSessionRewardsStore.setState({
      baseCoins: 0,
      bonusCoins: 0,
    });
    useMultiSessionStore.setState({
      totalFocusedSeconds: 0,
    });
  });

  describe('初始状态', () => {
    it('应该有默认值', () => {
      const state = useSessionRewardsStore.getState();
      expect(state.baseCoins).toBe(0);
      expect(state.bonusCoins).toBe(0);
    });
  });

  describe('calculateRewards', () => {
    it('应该计算基础金币（每分钟5金币）', () => {
      const { calculateRewards } = useSessionRewardsStore.getState();
      calculateRewards(1); // 1分钟
      expect(useSessionRewardsStore.getState().baseCoins).toBe(5);
    });

    it('应该正确计算不同时长的基础金币', () => {
      const { calculateRewards } = useSessionRewardsStore.getState();
      calculateRewards(2); // 2分钟
      expect(useSessionRewardsStore.getState().baseCoins).toBe(10);
      calculateRewards(5); // 5分钟
      expect(useSessionRewardsStore.getState().baseCoins).toBe(25);
    });

    it('如果时长为0，基础金币应该至少为1', () => {
      const { calculateRewards } = useSessionRewardsStore.getState();
      calculateRewards(0);
      expect(useSessionRewardsStore.getState().baseCoins).toBe(1);
    });

    it('不应该影响 bonusCoins', () => {
      const { calculateRewards } = useSessionRewardsStore.getState();
      useSessionRewardsStore.setState({ bonusCoins: 10 });
      calculateRewards(5);
      // bonusCoins 应该保持不变
      expect(useSessionRewardsStore.getState().bonusCoins).toBe(10);
    });

    it('应该覆盖之前的基础金币', () => {
      const { calculateRewards } = useSessionRewardsStore.getState();
      calculateRewards(5);
      expect(useSessionRewardsStore.getState().baseCoins).toBe(25);
      calculateRewards(10);
      expect(useSessionRewardsStore.getState().baseCoins).toBe(50);
    });
  });

  describe('calculateBonusCoins', () => {
    it('应该计算随机奖励', () => {
      useMultiSessionStore.setState({ totalFocusedSeconds: 600 }); // 10分钟
      const { calculateBonusCoins } = useSessionRewardsStore.getState();
      calculateBonusCoins();
      const bonusCoins = useSessionRewardsStore.getState().bonusCoins;
      // 随机奖励应该在 1 到 5 之间（10/2 = 5）
      expect(bonusCoins).toBeGreaterThanOrEqual(1);
      expect(bonusCoins).toBeLessThanOrEqual(5);
    });

    it('应该接受可选的 duration 参数', () => {
      const { calculateBonusCoins } = useSessionRewardsStore.getState();
      calculateBonusCoins(10); // 10分钟
      const bonusCoins = useSessionRewardsStore.getState().bonusCoins;
      expect(bonusCoins).toBeGreaterThanOrEqual(1);
      expect(bonusCoins).toBeLessThanOrEqual(5);
    });

    it('不应该影响 baseCoins', () => {
      useMultiSessionStore.setState({ totalFocusedSeconds: 300 }); // 5分钟
      useSessionRewardsStore.setState({ baseCoins: 25 });
      const { calculateBonusCoins } = useSessionRewardsStore.getState();
      calculateBonusCoins();
      // baseCoins 应该保持不变
      expect(useSessionRewardsStore.getState().baseCoins).toBe(25);
    });
  });

  describe('resetSession', () => {
    it('应该重置所有奖励', () => {
      useSessionRewardsStore.setState({ baseCoins: 50, bonusCoins: 10 });
      const { resetSession } = useSessionRewardsStore.getState();
      resetSession();
      const state = useSessionRewardsStore.getState();
      expect(state.baseCoins).toBe(0);
      expect(state.bonusCoins).toBe(0);
    });
  });
});

describe('getTotalDuration', () => {
  beforeEach(() => {
    useSessionRewardsStore.setState({ baseCoins: 0, bonusCoins: 0 });
    useMultiSessionStore.setState({
      totalFocusedSeconds: 0,
    });
  });

  it('应该从 totalFocusedSeconds 计算时长（分钟）', () => {
    useMultiSessionStore.setState({ totalFocusedSeconds: 180 }); // 3分钟
    const totalDuration = useSessionRewardsStore.getState().getTotalDuration();
    expect(totalDuration).toBe(3);
  });

  it('应该正确处理小数分钟', () => {
    useMultiSessionStore.setState({ totalFocusedSeconds: 90 }); // 1.5分钟
    const totalDuration = useSessionRewardsStore.getState().getTotalDuration();
    expect(totalDuration).toBe(1.5);
  });

  it('totalFocusedSeconds 为 0 时应该返回 0', () => {
    useMultiSessionStore.setState({ totalFocusedSeconds: 0 });
    const totalDuration = useSessionRewardsStore.getState().getTotalDuration();
    expect(totalDuration).toBe(0);
  });
});

describe('calculateRewardsFromCurrentState', () => {
  beforeEach(() => {
    useSessionRewardsStore.setState({ baseCoins: 0, bonusCoins: 0 });
    useMultiSessionStore.setState({
      totalFocusedSeconds: 0,
    });
  });

  it('应该从当前状态计算奖励', () => {
    useMultiSessionStore.setState({ totalFocusedSeconds: 150 }); // 2.5分钟
    useSessionRewardsStore.getState().calculateRewardsFromCurrentState();
    const state = useSessionRewardsStore.getState();
    // 总时长 2.5 分钟，基础金币 = ceil(2.5 * 5) = 13
    expect(state.baseCoins).toBe(13);
  });

  it('第一轮部分完成时应该正确计算金币', () => {
    useMultiSessionStore.setState({ totalFocusedSeconds: 30 }); // 0.5分钟
    useSessionRewardsStore.getState().calculateRewardsFromCurrentState();
    const state = useSessionRewardsStore.getState();
    // 总时长 0.5 分钟，基础金币 = ceil(0.5 * 5) = 3
    expect(state.baseCoins).toBe(3);
  });

  it('totalDuration 为 0 时不应该计算奖励', () => {
    useMultiSessionStore.setState({ totalFocusedSeconds: 0 });
    useSessionRewardsStore.getState().calculateRewardsFromCurrentState();
    const state = useSessionRewardsStore.getState();
    // totalDuration = 0，不计算奖励，保持默认值
    expect(state.baseCoins).toBe(0);
  });

  it('不应该影响 bonusCoins', () => {
    useMultiSessionStore.setState({ totalFocusedSeconds: 60 });
    useSessionRewardsStore.setState({ bonusCoins: 5 });
    useSessionRewardsStore.getState().calculateRewardsFromCurrentState();
    // bonusCoins 应该保持不变
    expect(useSessionRewardsStore.getState().bonusCoins).toBe(5);
  });
});

describe('SessionRewards Store 集成测试', () => {
  beforeEach(() => {
    useSessionRewardsStore.setState({
      baseCoins: 0,
      bonusCoins: 0,
    });
    useMultiSessionStore.setState({
      totalFocusedSeconds: 0,
    });
  });

  it('应该模拟完整的专注流程', () => {
    const { calculateRewardsFromCurrentState, calculateBonusCoins } = useSessionRewardsStore.getState();
    const { addFocusedSecond } = useMultiSessionStore.getState();

    // 模拟专注 60 秒（1分钟）
    for (let i = 0; i < 60; i++) {
      addFocusedSecond();
      calculateRewardsFromCurrentState();
    }

    // baseCoins 应该是 5（1分钟 * 5）
    expect(useSessionRewardsStore.getState().baseCoins).toBe(5);
    // bonusCoins 应该还是 0
    expect(useSessionRewardsStore.getState().bonusCoins).toBe(0);

    // 结算时计算随机奖励
    calculateBonusCoins();
    expect(useSessionRewardsStore.getState().bonusCoins).toBeGreaterThanOrEqual(1);
  });

  it('应该在多轮之间累加金币', () => {
    const { calculateRewardsFromCurrentState } = useSessionRewardsStore.getState();
    const { addFocusedSecond } = useMultiSessionStore.getState();

    // 模拟第1轮 60 秒
    for (let i = 0; i < 60; i++) {
      addFocusedSecond();
      calculateRewardsFromCurrentState();
    }
    expect(useSessionRewardsStore.getState().baseCoins).toBe(5);

    // 模拟第2轮 60 秒
    for (let i = 0; i < 60; i++) {
      addFocusedSecond();
      calculateRewardsFromCurrentState();
    }
    expect(useSessionRewardsStore.getState().baseCoins).toBe(10);

    // 模拟第3轮 60 秒
    for (let i = 0; i < 60; i++) {
      addFocusedSecond();
      calculateRewardsFromCurrentState();
    }
    expect(useSessionRewardsStore.getState().baseCoins).toBe(15);
  });
});
