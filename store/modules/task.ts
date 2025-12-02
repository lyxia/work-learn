import { create } from 'zustand';
import { TimerOption } from '../../types';
import { useSettingsStore } from './settings';

interface TaskState {
  name: string;
  selectedTimeId: string;
  getSelectedTimerOption: () => TimerOption | undefined;
  setTaskName: (name: string) => void;
  setSelectedTimeId: (id: string) => void;
  resetTask: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  name: '',
  selectedTimeId: '',
  getSelectedTimerOption: () => {
    const timerOptions = useSettingsStore.getState().timerOptions;
    return timerOptions.find((opt) => opt.id === get().selectedTimeId);
  },
  setTaskName: (name: string) => {
    set({ name });
  },
  setSelectedTimeId: (id: string) => {
    set({ selectedTimeId: id });
  },
  resetTask: () => {
    set({
      name: '',
      selectedTimeId: '',
    });
  },
}));

