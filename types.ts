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

// 金币记录类型
export type CoinRecordType = 'income' | 'expense';
export type CoinRecordStatus = 'pending' | 'confirmed';

// 收入记录详情
export interface IncomeDetail {
  taskName: string;        // 计划名称
  startTime: number;       // 开始时间 (timestamp)
  endTime: number;         // 结束时间 (timestamp)
  focusDuration: number;   // 专注时间 (分钟)
  baseCoins: number;       // 基础金币
  bonusCoins: number;      // 奖励金币
}

// 支出记录详情
export interface ExpenseDetail {
  remark: string;          // 备注
}

// 金币记录
export interface CoinRecord {
  id: string;
  type: CoinRecordType;
  status: CoinRecordStatus;
  amount: number;
  createdAt: number;
  confirmedAt?: number;
  detail: IncomeDetail | ExpenseDetail;
}

// 按日期分组的记录
export interface DailyRecords {
  date: string;            // 日期字符串 'YYYY-MM-DD'
  records: CoinRecord[];
}