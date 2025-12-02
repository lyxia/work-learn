import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, RotateCcw, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onClose: () => void;
  onReset: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, settings, onSave, onClose, onReset 
}) => {
  const [timerOverride, setTimerOverride] = useState<string>('');
  const [restDuration, setRestDuration] = useState<string>('');
  const [taskOptionsStr, setTaskOptionsStr] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTimerOverride(settings.timerOverride.toString());
      setRestDuration(settings.restDuration.toString());
      setTaskOptionsStr(settings.taskOptions.join(', '));
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    // Parse values
    const newOverride = parseFloat(timerOverride);
    const newRest = parseInt(restDuration, 10);
    
    // Parse CSV string to number array
    const newOptions = taskOptionsStr
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);

    onSave({
      timerOverride: isNaN(newOverride) ? 0 : newOverride,
      restDuration: isNaN(newRest) ? 300 : newRest,
      taskOptions: newOptions.length > 0 ? newOptions : [10, 20, 30, 40]
    });
    onClose();
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
            className="relative bg-[#FFFBEB] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-[#FCD34D]"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#FCD34D 3px, transparent 3px)', backgroundSize: '24px 24px' }} 
            />

            {/* Header */}
            <div className="relative z-10 bg-[#FCD34D] px-6 py-5 flex justify-between items-center border-b-4 border-[#B45309]">
              <div className="flex items-center gap-2 text-[#78350F]">
                 <div className="bg-white/30 p-2 rounded-xl">
                   <Settings size={28} strokeWidth={2.5} />
                 </div>
                 <h2 className="text-2xl font-black font-display tracking-wide text-white drop-shadow-md text-stroke-brown">
                   开发者设置
                 </h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white rounded-full border-2 border-[#B45309] flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform"
              >
                <X size={24} className="text-[#B45309]" strokeWidth={3} />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {/* Field 1: Timer Override */}
              <div className="bg-white p-4 rounded-3xl border-4 border-[#E5E7EB] focus-within:border-[#38BDF8] transition-colors shadow-sm">
                <label className="block text-[#78350F] font-black mb-2 text-lg">
                  每个时段时长 (分钟)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    value={timerOverride}
                    onChange={(e) => setTimerOverride(e.target.value)}
                    className="flex-1 bg-gray-50 p-3 rounded-xl border-2 border-gray-200 outline-none text-xl font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-[#38BDF8]/20"
                  />
                  <span className="text-gray-400 font-bold whitespace-nowrap">分钟</span>
                </div>
                <div className="mt-2 text-xs font-bold text-[#F59E0B] bg-[#FFFBEB] inline-block px-2 py-1 rounded-lg">
                   ⚠️ 设为 0.1 可开启 6秒极速测试
                </div>
              </div>

              {/* Field 2: Rest Duration */}
              <div className="bg-white p-4 rounded-3xl border-4 border-[#E5E7EB] focus-within:border-[#F472B6] transition-colors shadow-sm">
                <label className="block text-[#78350F] font-black mb-2 text-lg">
                  休息时长 (秒)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={restDuration}
                    onChange={(e) => setRestDuration(e.target.value)}
                    className="flex-1 bg-gray-50 p-3 rounded-xl border-2 border-gray-200 outline-none text-xl font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-[#F472B6]/20"
                  />
                  <span className="text-gray-400 font-bold whitespace-nowrap">秒</span>
                </div>
              </div>

              {/* Field 3: Task Options */}
              <div className="bg-white p-4 rounded-3xl border-4 border-[#E5E7EB] focus-within:border-[#FCD34D] transition-colors shadow-sm">
                <label className="block text-[#78350F] font-black mb-2 text-lg">
                  时间档位预设
                </label>
                <input
                  type="text"
                  value={taskOptionsStr}
                  onChange={(e) => setTaskOptionsStr(e.target.value)}
                  className="w-full bg-gray-50 p-3 rounded-xl border-2 border-gray-200 outline-none text-xl font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-[#FCD34D]/20 mb-1"
                />
                <p className="text-xs text-gray-400 font-bold">
                  用逗号分隔，例如: 10, 20, 30
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="relative z-10 px-6 py-5 bg-white/50 border-t-2 border-[#FDE68A] flex gap-4">
              <button
                onClick={onReset}
                className="flex-1 py-3 px-4 rounded-2xl bg-white border-2 border-gray-300 border-b-4 text-gray-500 font-black shadow-sm active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} strokeWidth={3} />
                默认
              </button>
              <button
                onClick={handleSave}
                className="flex-[2] py-3 px-4 rounded-2xl bg-gradient-to-b from-[#4ADE80] to-[#22C55E] border-b-4 border-[#15803D] text-white font-black shadow-lg active:border-b-0 active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 text-lg"
              >
                <Check size={24} strokeWidth={4} />
                保存设置
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;