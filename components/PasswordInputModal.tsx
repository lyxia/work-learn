import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, KeyRound } from 'lucide-react';
import { useUIStore } from '../store';

interface PasswordInputModalProps {
  isOpen: boolean;
  title: string;
  mode: 'verify' | 'set' | 'change';
  verifyFn?: (password: string) => boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

const PasswordInputModal: React.FC<PasswordInputModalProps> = ({
  isOpen,
  title,
  mode,
  verifyFn,
  onConfirm,
  onCancel,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const [verifyError, setVerifyError] = useState(false);
  const [confirmDigits, setConfirmDigits] = useState<string[]>(['', '', '', '']);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 重置状态
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setConfirmDigits(['', '', '', '']);
      setError(false);
      setVerifyError(false);
      setIsConfirmStep(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleDigitChange = (index: number, value: string, isConfirm: boolean = false) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = isConfirm ? [...confirmDigits] : [...digits];
    newDigits[index] = value.slice(-1);

    if (isConfirm) {
      setConfirmDigits(newDigits);
    } else {
      setDigits(newDigits);
    }
    setError(false);
    setVerifyError(false);

    // 自动跳到下一个输入框
    if (value && index < 3) {
      const refs = isConfirm ? confirmInputRefs : inputRefs;
      refs.current[index + 1]?.focus();
    }

    // 检查是否输入完成
    if (newDigits.every((d) => d !== '')) {
      const password = newDigits.join('');

      if (mode === 'verify') {
        // 验证模式：如果提供了验证函数，先验证
        if (verifyFn) {
          if (verifyFn(password)) {
            onConfirm(password);
          } else {
            // 验证失败：显示错误，触发震动，清空输入
            setVerifyError(true);
            setDigits(['', '', '', '']);
            setTimeout(() => {
              inputRefs.current[0]?.focus();
            }, 100);
          }
        } else {
          // 没有验证函数，直接提交
          onConfirm(password);
        }
      } else if (mode === 'set' || mode === 'change') {
        if (!isConfirm) {
          // 设置/修改模式第一步：进入确认步骤
          setIsConfirmStep(true);
          setTimeout(() => {
            confirmInputRefs.current[0]?.focus();
          }, 100);
        } else {
          // 确认步骤：检查两次输入是否一致
          const firstPassword = digits.join('');
          if (password === firstPassword) {
            onConfirm(password);
          } else {
            setError(true);
            setConfirmDigits(['', '', '', '']);
            setTimeout(() => {
              confirmInputRefs.current[0]?.focus();
            }, 100);
          }
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent, isConfirm: boolean = false) => {
    if (e.key === 'Backspace') {
      const currentDigits = isConfirm ? confirmDigits : digits;
      const refs = isConfirm ? confirmInputRefs : inputRefs;

      if (currentDigits[index] === '' && index > 0) {
        refs.current[index - 1]?.focus();
      }
    }
  };

  const renderDigitInputs = (isConfirm: boolean = false) => {
    const currentDigits = isConfirm ? confirmDigits : digits;
    const refs = isConfirm ? confirmInputRefs : inputRefs;
    // 判断是否显示错误状态：确认步骤的错误 或 验证模式的错误
    const showError = (error && isConfirm) || (verifyError && !isConfirm && mode === 'verify');

    return (
      <div className="flex justify-center gap-3">
        {currentDigits.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => { refs.current[index] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value, isConfirm)}
            onKeyDown={(e) => handleKeyDown(index, e, isConfirm)}
            animate={showError ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-14 h-16 text-center text-3xl font-bold rounded-2xl border-4 outline-none transition-all
              ${showError
                ? 'border-red-400 bg-red-50'
                : digit
                ? 'border-[#FCD34D] bg-[#FFFBEB]'
                : 'border-gray-200 bg-white'
              }
              focus:border-[#FCD34D] focus:ring-4 focus:ring-[#FCD34D]/20`}
          />
        ))}
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
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative bg-[#FFFBEB] w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-[#FCD34D]"
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
                  {mode === 'verify' ? (
                    <Lock size={28} strokeWidth={2.5} />
                  ) : (
                    <KeyRound size={28} strokeWidth={2.5} />
                  )}
                </div>
                <h2 className="text-xl font-black font-display tracking-wide text-white drop-shadow-md">
                  {title}
                </h2>
              </div>
              <button
                onClick={onCancel}
                className="w-10 h-10 bg-white rounded-full border-2 border-[#B45309] flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform"
              >
                <X size={24} className="text-[#B45309]" strokeWidth={3} />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 space-y-6">
              {!isConfirmStep ? (
                <>
                  <p className="text-center text-gray-600 font-bold">
                    {mode === 'verify' ? '请输入4位数字密码' : '请设置4位数字密码'}
                  </p>
                  {renderDigitInputs(false)}
                  {verifyError && mode === 'verify' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-red-500 font-bold text-sm"
                    >
                      密码错误，请重新输入
                    </motion.p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-center text-gray-600 font-bold">
                    请再次输入密码确认
                  </p>
                  {renderDigitInputs(true)}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-red-500 font-bold text-sm"
                    >
                      两次密码不一致，请重新输入
                    </motion.p>
                  )}
                </>
              )}

              {/* Cancel Button */}
              <button
                onClick={onCancel}
                className="w-full py-3 rounded-2xl bg-white border-2 border-gray-300 border-b-4 text-gray-500 font-bold active:border-b-2 active:translate-y-[2px] transition-all"
              >
                取消
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordInputModal;
