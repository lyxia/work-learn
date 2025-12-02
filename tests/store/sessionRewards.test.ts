import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSessionRewardsStore } from '../../store/modules/sessionRewards';

describe('SessionRewards Store', () => {
  beforeEach(() => {
    useSessionRewardsStore.setState({
      baseCoins: 0,
      bonusCoins: 0,
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

    it('应该计算随机奖励', () => {
      const { calculateRewards } = useSessionRewardsStore.getState();
      calculateRewards(10); // 10分钟
      const bonusCoins = useSessionRewardsStore.getState().bonusCoins;
      // 随机奖励应该在 1 到 5 之间（10/2 = 5）
      expect(bonusCoins).toBeGreaterThanOrEqual(1);
      expect(bonusCoins).toBeLessThanOrEqual(5);
    });

    it('应该同时设置基础金币和随机奖励', () => {
      const { calculateRewards } = useSessionRewardsStore.getState();
      calculateRewards(5);
      const state = useSessionRewardsStore.getState();
      expect(state.baseCoins).toBeGreaterThan(0);
      expect(state.bonusCoins).toBeGreaterThanOrEqual(0);
    });

    it('应该覆盖之前的奖励', () => {
      const { calculateRewards } = useSessionRewardsStore.getState();
      calculateRewards(5);
      const firstBase = useSessionRewardsStore.getState().baseCoins;
      calculateRewards(10);
      const secondBase = useSessionRewardsStore.getState().baseCoins;
      expect(secondBase).not.toBe(firstBase);
      expect(secondBase).toBe(50);
    });
  });

  describe('resetSession', () => {
    it('应该重置所有奖励', () => {
      const { calculateRewards, resetSession } = useSessionRewardsStore.getState();
      calculateRewards(10);
      resetSession();
      const state = useSessionRewardsStore.getState();
      expect(state.baseCoins).toBe(0);
      expect(state.bonusCoins).toBe(0);
    });
  });
});

describe('SessionRewards Store 集成测试 (SessionRewards + Timer)', () => {
  beforeEach(() => {
    useSessionRewardsStore.setState({
      baseCoins: 0,
      bonusCoins: 0,
    });
  });

  it('应该基于 Timer 的时长计算奖励', () => {
    // 模拟 Timer 完成一轮（1分钟 = 60秒）
    const durationMinutes = 1;
    useSessionRewardsStore.getState().calculateRewards(durationMinutes);
    
    const state = useSessionRewardsStore.getState();
    expect(state.baseCoins).toBe(5); // 1分钟 * 5 = 5金币
    expect(state.bonusCoins).toBeGreaterThanOrEqual(1);
  });

  it('应该基于多轮总时长计算总奖励', () => {
    // 模拟完成多轮：3轮，每轮1分钟
    const rounds = 3;
    const durationPerRound = 1; // 分钟
    
    let totalBase = 0;
    let totalBonus = 0;
    
    for (let i = 0; i < rounds; i++) {
      useSessionRewardsStore.getState().calculateRewards(durationPerRound);
      const state = useSessionRewardsStore.getState();
      totalBase += state.baseCoins;
      totalBonus += state.bonusCoins;
      // 重置以便下一轮计算
      useSessionRewardsStore.getState().resetSession();
    }
    
    // 总基础金币应该是 3 * 5 = 15
    expect(totalBase).toBe(15);
    expect(totalBonus).toBeGreaterThanOrEqual(3);
  });
});

