import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from '../../store/modules/settings';
import { AppSettings } from '../../types';

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

describe('Settings Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useSettingsStore.setState({
      settings: {
        taskOptions: [10, 20, 30, 40],
        restDuration: 300,
        timerOverride: 0,
      },
      isOpen: false,
      timerOptions: [],
    });
    // 重新初始化 timerOptions
    useSettingsStore.getState().updateSettings({
      taskOptions: [10, 20, 30, 40],
      restDuration: 300,
      timerOverride: 0,
    });
  });

  describe('初始状态', () => {
    it('应该有默认设置', () => {
      const state = useSettingsStore.getState();
      expect(state.settings.taskOptions).toEqual([10, 20, 30, 40]);
      expect(state.settings.restDuration).toBe(300);
      expect(state.settings.timerOverride).toBe(0);
      expect(state.isOpen).toBe(false);
    });

    it('应该生成 timerOptions', () => {
      const state = useSettingsStore.getState();
      expect(state.timerOptions.length).toBe(4);
      expect(state.timerOptions[0].id).toBe('10m');
      expect(state.timerOptions[0].minutes).toBe(10);
      expect(state.timerOptions[1].color).toBe('pink');
      expect(state.timerOptions[2].color).toBe('blue');
    });
  });

  describe('updateSettings', () => {
    it('应该更新设置', () => {
      const { updateSettings } = useSettingsStore.getState();
      const newSettings: AppSettings = {
        taskOptions: [15, 25, 35],
        restDuration: 600,
        timerOverride: 5,
      };
      updateSettings(newSettings);
      const state = useSettingsStore.getState();
      expect(state.settings).toEqual(newSettings);
    });

    it('应该重新计算 timerOptions', () => {
      const { updateSettings } = useSettingsStore.getState();
      const newSettings: AppSettings = {
        taskOptions: [5, 15, 25],
        restDuration: 300,
        timerOverride: 0,
      };
      updateSettings(newSettings);
      const state = useSettingsStore.getState();
      expect(state.timerOptions.length).toBe(3);
      expect(state.timerOptions[0].minutes).toBe(5);
      expect(state.timerOptions[1].minutes).toBe(15);
      expect(state.timerOptions[2].minutes).toBe(25);
    });

    it('应该为 >= 40 分钟的任务添加标签', () => {
      const { updateSettings } = useSettingsStore.getState();
      const newSettings: AppSettings = {
        taskOptions: [10, 40, 50],
        restDuration: 300,
        timerOverride: 0,
      };
      updateSettings(newSettings);
      const state = useSettingsStore.getState();
      expect(state.timerOptions[0].label).toBe('10分钟');
      expect(state.timerOptions[1].label).toBe('40分钟(含休息)');
      expect(state.timerOptions[2].label).toBe('50分钟(含休息)');
    });
  });

  describe('resetSettings', () => {
    it('应该重置为默认设置', () => {
      const { updateSettings, resetSettings } = useSettingsStore.getState();
      updateSettings({
        taskOptions: [5, 10],
        restDuration: 600,
        timerOverride: 5,
      });
      resetSettings();
      const state = useSettingsStore.getState();
      expect(state.settings.taskOptions).toEqual([10, 20, 30, 40]);
      expect(state.settings.restDuration).toBe(300);
      expect(state.settings.timerOverride).toBe(0);
    });

    it('应该重新计算 timerOptions', () => {
      const { updateSettings, resetSettings } = useSettingsStore.getState();
      updateSettings({
        taskOptions: [5],
        restDuration: 300,
        timerOverride: 0,
      });
      resetSettings();
      const state = useSettingsStore.getState();
      expect(state.timerOptions.length).toBe(4);
    });
  });

  describe('openSettings / closeSettings', () => {
    it('应该打开设置弹窗', () => {
      const { openSettings } = useSettingsStore.getState();
      openSettings();
      expect(useSettingsStore.getState().isOpen).toBe(true);
    });

    it('应该关闭设置弹窗', () => {
      const { openSettings, closeSettings } = useSettingsStore.getState();
      openSettings();
      closeSettings();
      expect(useSettingsStore.getState().isOpen).toBe(false);
    });
  });

  describe('持久化', () => {
    it('应该只持久化 settings，不持久化 isOpen', () => {
      const { updateSettings, openSettings } = useSettingsStore.getState();
      updateSettings({
        taskOptions: [15, 25],
        restDuration: 600,
        timerOverride: 5,
      });
      openSettings();
      
      setTimeout(() => {
        const saved = localStorageMock.getItem('eggfocus-settings');
        expect(saved).toBeTruthy();
        if (saved) {
          const parsed = JSON.parse(saved);
          expect(parsed.state.settings).toBeDefined();
          expect(parsed.state.settings.taskOptions).toEqual([15, 25]);
          // isOpen 不应该被持久化
          expect(parsed.state.isOpen).toBeUndefined();
        }
      }, 100);
    });
  });
});

