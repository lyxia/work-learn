import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  showCancel: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  showCancel,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            className="relative w-full max-w-sm rounded-[2rem] border-4 border-[#F87171] bg-[#FEF2F2] shadow-2xl"
          >
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#F87171 2px, transparent 2px)', backgroundSize: '20px 20px' }}
            />

            <div className="relative z-10 px-6 pt-6 pb-4 border-b-4 border-[#B91C1C] bg-[#F87171] text-white rounded-t-[2rem] flex items-start gap-3">
              <div className="bg-white/20 text-white rounded-2xl p-2 shadow-sm">
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black font-display tracking-wide drop-shadow-sm">{title || '提示'}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/90">{message}</p>
              </div>
              {showCancel && (
                <button
                  onClick={onCancel}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="关闭提示"
                >
                  <X size={22} strokeWidth={2.5} />
                </button>
              )}
            </div>

            <div className="relative z-10 p-6 bg-white rounded-b-[2rem] flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="w-full rounded-2xl bg-gradient-to-b from-[#EF4444] to-[#B91C1C] border-b-4 border-[#7F1D1D] py-3 text-lg font-black text-white shadow-lg transition-all active:translate-y-[4px] active:border-b-0"
              >
                {confirmLabel || '确定'}
              </button>
              {showCancel && (
                <button
                  onClick={onCancel}
                  className="w-full rounded-2xl bg-white border-2 border-gray-200 border-b-4 py-3 text-sm font-bold text-gray-500 shadow-sm transition-all hover:bg-gray-50 active:border-b-2 active:translate-y-[2px]"
                >
                  {cancelLabel || '取消'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
