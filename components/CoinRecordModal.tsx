import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, TrendingUp, TrendingDown, Clock, CheckCircle, FileText, ChevronDown, Trash2 } from 'lucide-react';
import { useCoinRecordStore, useParentAuthStore, useUIStore, useUserDataStore } from '../store';
import { CoinRecord, IncomeDetail, ExpenseDetail } from '../types';

type TabType = 'pending' | 'income' | 'expense';

interface CoinRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CoinRecordModal: React.FC<CoinRecordModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // 直接订阅records状态，确保数据变化时组件会重新渲染
  const records = useCoinRecordStore((state) => state.records);
  const confirmRecord = useCoinRecordStore((state) => state.confirmRecord);
  const deleteRecord = useCoinRecordStore((state) => state.deleteRecord);

  const { isPasswordSet, verifyPassword } = useParentAuthStore();
  const { openPasswordModal, openConfirm } = useUIStore();
  const { addCoins } = useUserDataStore();

  // 基于records计算各类型的记录
  const pendingRecords = useMemo(
    () => records.filter((r) => r.type === 'income' && r.status === 'pending'),
    [records]
  );
  const incomeRecords = useMemo(
    () => records.filter((r) => r.type === 'income' && r.status === 'confirmed'),
    [records]
  );
  const expenseRecords = useMemo(
    () => records.filter((r) => r.type === 'expense'),
    [records]
  );

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: '待确认', count: pendingRecords.length },
    { key: 'income', label: '收入', count: incomeRecords.length },
    { key: 'expense', label: '支出', count: expenseRecords.length },
  ];

  const currentRecords = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return pendingRecords;
      case 'income':
        return incomeRecords;
      case 'expense':
        return expenseRecords;
      default:
        return [];
    }
  }, [activeTab, pendingRecords, incomeRecords, expenseRecords]);

  // 按日期分组
  const groupedRecords = useMemo(() => {
    const grouped: Map<string, CoinRecord[]> = new Map();
    currentRecords.forEach((record) => {
      const date = new Date(record.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(record);
    });
    return Array.from(grouped.entries());
  }, [currentRecords]);

  // 弹窗打开或Tab切换时，默认展开最近一天
  useEffect(() => {
    if (isOpen && groupedRecords.length > 0) {
      setExpandedDate(groupedRecords[0][0]);
    }
  }, [isOpen, activeTab, groupedRecords.length]);

  const handleToggleDate = (date: string) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  const handleConfirmRecord = async (record: CoinRecord) => {
    if (!isPasswordSet) {
      // 如果没有设置密码，直接确认
      confirmRecord(record.id);
      addCoins(record.amount);
      return;
    }

    // 验证密码
    const password = await openPasswordModal({ mode: 'verify' });
    if (password && verifyPassword(password)) {
      confirmRecord(record.id);
      addCoins(record.amount);
    }
  };

  const handleDeleteRecord = async (record: CoinRecord) => {
    const detail = record.detail as IncomeDetail;
    const confirmed = await openConfirm({
      title: '无效专注',
      message: `确定将「${detail.taskName}」标记为无效专注吗？该记录将被删除，不会获得金币。`,
      confirmLabel: '确定删除',
      cancelLabel: '取消',
    });

    if (confirmed) {
      deleteRecord(record.id);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const renderRecordItem = (record: CoinRecord) => {
    const isIncome = record.type === 'income';
    const isPending = record.status === 'pending';

    if (isIncome) {
      const detail = record.detail as IncomeDetail;
      return (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-2xl p-4 border-2 ${
            isPending ? 'border-orange-300' : 'border-green-200'
          } shadow-sm`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isPending ? 'bg-orange-100' : 'bg-green-100'
                }`}
              >
                {isPending ? (
                  <Clock size={18} className="text-orange-500" />
                ) : (
                  <TrendingUp size={18} className="text-green-500" />
                )}
              </div>
              <span className="font-bold text-gray-700">{detail.taskName}</span>
            </div>
            <span
              className={`text-lg font-black ${
                isPending ? 'text-orange-500' : 'text-green-500'
              }`}
            >
              +{record.amount}
            </span>
          </div>

          <div className="text-sm text-gray-500 space-y-1 ml-10">
            <div className="flex items-center gap-2">
              <span>专注时长：{formatDuration(detail.focusDuration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>
                {formatTime(detail.startTime)} ~ {formatTime(detail.endTime)}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              基础 {detail.baseCoins} + 奖励 {detail.bonusCoins}
            </div>
          </div>

          {isPending && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleDeleteRecord(record)}
                className="flex-1 py-2 rounded-xl bg-white border-2 border-gray-300 border-b-4 text-gray-500 font-bold active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-1"
              >
                <Trash2 size={16} />
                无效专注
              </button>
              <button
                onClick={() => handleConfirmRecord(record)}
                className="flex-[2] py-2 rounded-xl bg-gradient-to-b from-[#4ADE80] to-[#22C55E] border-b-4 border-[#15803D] text-white font-bold active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                确认入账
              </button>
            </div>
          )}
        </motion.div>
      );
    } else {
      // 支出记录
      const detail = record.detail as ExpenseDetail;
      return (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-4 border-2 border-red-200 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown size={18} className="text-red-500" />
              </div>
              <div>
                <span className="font-bold text-gray-700">{detail.remark}</span>
                <div className="text-xs text-gray-400">{formatTime(record.createdAt)}</div>
              </div>
            </div>
            <span className="text-lg font-black text-red-500">-{record.amount}</span>
          </div>
        </motion.div>
      );
    }
  };

  const renderEmptyState = () => {
    const messages: Record<TabType, { icon: React.ReactNode; text: string }> = {
      pending: {
        icon: <Clock size={48} className="text-orange-300" />,
        text: '暂无待确认的记录',
      },
      income: {
        icon: <TrendingUp size={48} className="text-green-300" />,
        text: '暂无收入记录',
      },
      expense: {
        icon: <TrendingDown size={48} className="text-red-300" />,
        text: '暂无支出记录',
      },
    };

    const { icon, text } = messages[activeTab];

    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        {icon}
        <p className="mt-4 font-bold">{text}</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative bg-[#FFFBEB] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-[#FCD34D] flex flex-col max-h-[80vh]"
          >
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#FCD34D 3px, transparent 3px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Header */}
            <div className="relative z-10 bg-[#FCD34D] px-6 py-5 flex justify-between items-center border-b-4 border-[#B45309]">
              <div className="flex items-center gap-2 text-[#78350F]">
                <div className="bg-white/30 p-2 rounded-xl">
                  <FileText size={28} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black font-display tracking-wide text-white drop-shadow-md">
                  收支记录
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white rounded-full border-2 border-[#B45309] flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform"
              >
                <X size={24} className="text-[#B45309]" strokeWidth={3} />
              </button>
            </div>

            {/* Tabs */}
            <div className="relative z-10 flex bg-white/50 border-b-2 border-[#FDE68A]">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 px-4 font-bold text-sm relative transition-colors ${
                    activeTab === tab.key
                      ? 'text-[#B45309]'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                        activeTab === tab.key
                          ? tab.key === 'pending'
                            ? 'bg-orange-100 text-orange-600'
                            : tab.key === 'income'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-[#FCD34D] rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {groupedRecords.length === 0 ? (
                renderEmptyState()
              ) : (
                groupedRecords.map(([date, dateRecords]) => {
                  const isExpanded = expandedDate === date;
                  return (
                    <div key={date} className="bg-white/50 rounded-2xl overflow-hidden">
                      {/* 日期头部 - 可点击展开/折叠 */}
                      <button
                        onClick={() => handleToggleDate(date)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/80 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                          <Coins size={14} className="text-[#FCD34D]" />
                          {date}
                          <span className="text-xs text-gray-400 font-normal">
                            ({dateRecords.length}条)
                          </span>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={18} className="text-gray-400" />
                        </motion.div>
                      </button>

                      {/* 记录列表 - 动画展开/折叠 */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-3">
                              {dateRecords.map((record) => renderRecordItem(record))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoinRecordModal;
