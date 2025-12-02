import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, TimerOption } from '../../types';

interface SettingsState {
  settings: AppSettings;
  isOpen: boolean;
  timerOptions: TimerOption[];
  updateSettings: (settings: AppSettings) => void;
  resetSettings: () => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  taskOptions: [10, 20, 30, 40],
  restDuration: 180, // 5 minutes
  timerOverride: 10, // 默认每轮1分钟
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isOpen: false,
      timerOptions: [],
      updateSettings: (newSettings: AppSettings) => {
        set({ settings: newSettings });
        // 重新计算 timerOptions
        const timerOptions: TimerOption[] = newSettings.taskOptions.map((min, index) => ({
          id: `${min}m`,
          minutes: min,
          label: `${min}分钟`,
          color: (index % 2 === 0 ? 'blue' : 'pink') as 'blue' | 'pink',
        }));
        set({ timerOptions });
      },
      resetSettings: () => {
        set({ settings: DEFAULT_SETTINGS });
        // 重新计算 timerOptions
        const timerOptions: TimerOption[] = DEFAULT_SETTINGS.taskOptions.map((min, index) => ({
          id: `${min}m`,
          minutes: min,
          label: `${min}分钟`,
          color: (index % 2 === 0 ? 'blue' : 'pink') as 'blue' | 'pink',
        }));
        set({ timerOptions });
      },
      openSettings: () => {
        set({ isOpen: true });
      },
      closeSettings: () => {
        set({ isOpen: false });
      },
    }),
    {
      name: 'eggfocus-settings',
      partialize: (state) => ({
        settings: state.settings,
        // isOpen 不持久化
      }),
      onRehydrateStorage: () => (state) => {
        // 数据恢复后，初始化 timerOptions
        if (state) {
          const timerOptions: TimerOption[] = state.settings.taskOptions.map((min, index) => ({
            id: `${min}m`,
            minutes: min,
            label: `${min}分钟`,
            color: (index % 2 === 0 ? 'blue' : 'pink') as 'blue' | 'pink',
          }));
          state.timerOptions = timerOptions;
        }
      },
    }
  )
);

