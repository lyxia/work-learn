import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CoinRecord, IncomeDetail, ExpenseDetail, DailyRecords } from '../../types';

interface CoinRecordState {
  records: CoinRecord[];

  // 添加收入记录（待确认状态）
  addPendingIncome: (detail: IncomeDetail, amount: number) => string;

  // 添加支出记录（直接确认状态）
  addExpense: (detail: ExpenseDetail, amount: number) => void;

  // 确认收入记录
  confirmRecord: (id: string) => void;

  // 删除记录
  deleteRecord: (id: string) => void;

  // 获取按日期分组的记录
  getRecordsByDate: () => DailyRecords[];

  // 获取待确认记录
  getPendingRecords: () => CoinRecord[];

  // 获取已确认的收入记录
  getIncomeRecords: () => CoinRecord[];

  // 获取支出记录
  getExpenseRecords: () => CoinRecord[];

  // 获取待确认金币总数
  getPendingCoinsTotal: () => number;
}

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useCoinRecordStore = create<CoinRecordState>()(
  persist(
    (set, get) => ({
      records: [],

      addPendingIncome: (detail: IncomeDetail, amount: number) => {
        const id = generateId();
        const record: CoinRecord = {
          id,
          type: 'income',
          status: 'pending',
          amount,
          createdAt: Date.now(),
          detail,
        };
        set((state) => ({
          records: [record, ...state.records],
        }));
        return id;
      },

      addExpense: (detail: ExpenseDetail, amount: number) => {
        const record: CoinRecord = {
          id: generateId(),
          type: 'expense',
          status: 'confirmed',
          amount,
          createdAt: Date.now(),
          confirmedAt: Date.now(),
          detail,
        };
        set((state) => ({
          records: [record, ...state.records],
        }));
      },

      confirmRecord: (id: string) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id
              ? { ...r, status: 'confirmed' as const, confirmedAt: Date.now() }
              : r
          ),
        }));
      },

      deleteRecord: (id: string) => {
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      },

      getRecordsByDate: () => {
        const { records } = get();
        const grouped: Map<string, CoinRecord[]> = new Map();

        records.forEach((record) => {
          const date = new Date(record.createdAt).toISOString().split('T')[0];
          if (!grouped.has(date)) {
            grouped.set(date, []);
          }
          grouped.get(date)!.push(record);
        });

        return Array.from(grouped.entries())
          .map(([date, records]) => ({ date, records }))
          .sort((a, b) => b.date.localeCompare(a.date));
      },

      getPendingRecords: () => {
        return get().records.filter(
          (r) => r.type === 'income' && r.status === 'pending'
        );
      },

      getIncomeRecords: () => {
        return get().records.filter(
          (r) => r.type === 'income' && r.status === 'confirmed'
        );
      },

      getExpenseRecords: () => {
        return get().records.filter((r) => r.type === 'expense');
      },

      getPendingCoinsTotal: () => {
        return get()
          .records.filter((r) => r.type === 'income' && r.status === 'pending')
          .reduce((sum, r) => sum + r.amount, 0);
      },
    }),
    {
      name: 'eggfocus-coin-records',
    }
  )
);
