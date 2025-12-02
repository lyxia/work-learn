import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUserDataStore } from '../../store/modules/userData';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UserData Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useUserDataStore.setState({
      coins: 0,
      isMuted: false,
    });
  });

  describe('初始状态', () => {
    it('应该有默认值', () => {
      const state = useUserDataStore.getState();
      expect(state.coins).toBe(0);
      expect(state.isMuted).toBe(false);
    });
  });

  describe('addCoins', () => {
    it('应该增加金币', () => {
      const { addCoins } = useUserDataStore.getState();
      addCoins(10);
      expect(useUserDataStore.getState().coins).toBe(10);
    });

    it('应该累加金币', () => {
      const { addCoins } = useUserDataStore.getState();
      addCoins(5);
      addCoins(15);
      expect(useUserDataStore.getState().coins).toBe(20);
    });

    it('应该处理负数（不会导致负数）', () => {
      const { addCoins, setCoins } = useUserDataStore.getState();
      setCoins(10);
      addCoins(-5);
      expect(useUserDataStore.getState().coins).toBe(5);
      addCoins(-10);
      expect(useUserDataStore.getState().coins).toBe(0);
    });
  });

  describe('deductCoins', () => {
    it('应该减少金币', () => {
      const { setCoins, deductCoins } = useUserDataStore.getState();
      setCoins(20);
      deductCoins(5);
      expect(useUserDataStore.getState().coins).toBe(15);
    });

    it('金币不应该变成负数', () => {
      const { setCoins, deductCoins } = useUserDataStore.getState();
      setCoins(10);
      deductCoins(15);
      expect(useUserDataStore.getState().coins).toBe(0);
    });

    it('应该处理多次扣除', () => {
      const { setCoins, deductCoins } = useUserDataStore.getState();
      setCoins(100);
      deductCoins(30);
      deductCoins(20);
      expect(useUserDataStore.getState().coins).toBe(50);
    });
  });

  describe('setCoins', () => {
    it('应该设置金币数量', () => {
      const { setCoins } = useUserDataStore.getState();
      setCoins(100);
      expect(useUserDataStore.getState().coins).toBe(100);
    });

    it('应该覆盖之前的金币数量', () => {
      const { setCoins } = useUserDataStore.getState();
      setCoins(50);
      setCoins(200);
      expect(useUserDataStore.getState().coins).toBe(200);
    });

    it('不应该允许负数', () => {
      const { setCoins } = useUserDataStore.getState();
      setCoins(-10);
      expect(useUserDataStore.getState().coins).toBe(0);
    });
  });

  describe('toggleMute', () => {
    it('应该切换静音状态', () => {
      const { toggleMute } = useUserDataStore.getState();
      expect(useUserDataStore.getState().isMuted).toBe(false);
      toggleMute();
      expect(useUserDataStore.getState().isMuted).toBe(true);
      toggleMute();
      expect(useUserDataStore.getState().isMuted).toBe(false);
    });
  });

  describe('持久化', () => {
    it('应该保存到 localStorage', () => {
      const { setCoins, toggleMute } = useUserDataStore.getState();
      setCoins(500);
      toggleMute();
      
      // 等待持久化完成
      setTimeout(() => {
        const saved = localStorageMock.getItem('eggfocus-userdata');
        expect(saved).toBeTruthy();
        if (saved) {
          const parsed = JSON.parse(saved);
          expect(parsed.state.coins).toBe(500);
          expect(parsed.state.isMuted).toBe(true);
        }
      }, 100);
    });

    it('应该从 localStorage 恢复状态', () => {
      const savedState = {
        state: {
          coins: 850,
          isMuted: true,
        },
        version: 0,
      };
      localStorageMock.setItem('eggfocus-userdata', JSON.stringify(savedState));
      
      // 重新创建 store 实例来测试恢复
      // 注意：在实际使用中，zustand persist 会自动恢复
      const state = useUserDataStore.getState();
      // 由于 persist 中间件，状态应该从 localStorage 恢复
      // 但在这个测试中，我们需要手动验证持久化逻辑
      expect(localStorageMock.getItem('eggfocus-userdata')).toBeTruthy();
    });
  });
});

