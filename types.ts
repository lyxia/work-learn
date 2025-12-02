export interface TimerOption {
  id: string;
  minutes: number;
  label: string;
  color: 'blue' | 'pink';
}

export interface TaskState {
  name: string;
  duration: number;
  isRunning: boolean;
  timeLeft: number;
  coinsEarned: number;
}

export interface AppSettings {
  taskOptions: number[];
  restDuration: number; // in seconds
  timerOverride: number; // in minutes. 0 means use selected option.
}