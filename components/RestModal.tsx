import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Pizza, IceCream, Candy, Coins } from 'lucide-react';
import eatImage from '../assets/eat.png';
import { soundEngine } from '../utils/audio';
import { useUIStore } from '../store';

interface RestModalProps {
  isOpen: boolean;
  taskName?: string;
  completedRounds?: number;
  totalRounds?: number;
  accumulatedCoins?: number;
  duration: number; // Duration in seconds
  onComplete: () => void;
}

const RestModal: React.FC<RestModalProps> = ({
  isOpen,
  taskName,
  completedRounds = 0,
  totalRounds = 0,
  accumulatedCoins = 0,
  duration,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<number | null>(null);
  const hasPlayedSoundRef = useRef(false);
  const openConfirm = useUIStore((state) => state.openConfirm);
  const isConfirmOpen = useUIStore((state) => state.confirmModal.isOpen);
  const confirmOpenRef = useRef(isConfirmOpen);

  useEffect(() => {
    confirmOpenRef.current = isConfirmOpen;
  }, [isConfirmOpen]);

  const startInterval = useCallback(() => {
    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          return 0;
        }
        const next = prev - 1;
        console.log('[RestModal] tick', { prev, next, intervalId });
        return next;
      });
    }, 1000);

    console.log('[RestModal] startInterval', { intervalId });
    intervalRef.current = intervalId;
  }, []);

  // 监听计时结束，清除 interval 并播放音效
  useEffect(() => {
    if (timeLeft === 0 && intervalRef.current !== null) {
      console.log('[RestModal] timeLeft reached 0, clearing interval', {
        intervalRef: intervalRef.current,
      });
      clearInterval(intervalRef.current);
      intervalRef.current = null;

      if (!hasPlayedSoundRef.current) {
        hasPlayedSoundRef.current = true;
        console.log('[RestModal] playing rest complete sound');
        soundEngine.playRestComplete();
      }
    }
  }, [timeLeft]);

  useEffect(() => {
    console.log('[RestModal] isOpen effect triggered', {
      isOpen,
      duration,
      intervalRef: intervalRef.current,
      confirmOpenRef: confirmOpenRef.current,
    });

    // Clean up any existing interval first
    if (intervalRef.current !== null) {
      console.log('[RestModal] clearing existing interval in isOpen effect', {
        intervalRef: intervalRef.current,
      });
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isOpen) {
      console.log('[RestModal] modal opened, resetting timer', { duration });
      setTimeLeft(duration); // Reset timer with custom duration
      hasPlayedSoundRef.current = false; // Reset sound flag when modal opens
      if (!confirmOpenRef.current) {
        console.log('[RestModal] confirm not open, starting interval');
        startInterval();
      } else {
        console.log('[RestModal] confirm is open, NOT starting interval');
      }
    } else {
      console.log('[RestModal] modal closed');
      // Reset sound flag when modal closes
      hasPlayedSoundRef.current = false;
    }

    // Cleanup function
    return () => {
      console.log('[RestModal] isOpen effect cleanup', { intervalRef: intervalRef.current });
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      hasPlayedSoundRef.current = false;
    };
  }, [isOpen, duration, startInterval]);

  useEffect(() => {
    console.log('[RestModal] isConfirmOpen effect triggered', {
      isOpen,
      isConfirmOpen,
      timeLeft,
      intervalRef: intervalRef.current,
    });

    if (!isOpen) {
      console.log('[RestModal] isConfirmOpen effect: modal not open, returning');
      return;
    }

    if (isConfirmOpen) {
      console.log('[RestModal] confirm opened, pausing timer');
      if (intervalRef.current !== null) {
        console.log('[RestModal] clearing interval due to confirm open', {
          intervalRef: intervalRef.current,
        });
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current === null && timeLeft > 0) {
      console.log('[RestModal] confirm closed and no interval running, restarting', { timeLeft });
      startInterval();
    } else {
      console.log('[RestModal] isConfirmOpen effect: no action needed', {
        intervalRef: intervalRef.current,
        timeLeft,
      });
    }
  }, [isOpen, isConfirmOpen, timeLeft, startInterval]);

  const handleSkip = async () => {
    if (timeLeft > 0) {
      const confirmed = await openConfirm({
        title: '继续挑战？',
        message: '真的不休息了吗？蛋仔建议休息一下再出发哦！🍩',
        confirmLabel: '继续工作',
        cancelLabel: '再休息会儿',
      });

      if (!confirmed) {
        return;
      }
    }

    onComplete();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isFinished = timeLeft === 0;

  // Show round info if multi-session is active
  const showRoundInfo = totalRounds > 0 && completedRounds > 0;
  const progressText = showRoundInfo ? `已完成${completedRounds}轮/共${totalRounds}轮` : '';

  // Background floating icons
  const icons = [
    { Icon: Pizza, color: '#F87171', x: '10%', y: '20%', delay: 0 },
    { Icon: IceCream, color: '#F472B6', x: '80%', y: '15%', delay: 1 },
    { Icon: Coffee, color: '#FBBF24', x: '15%', y: '70%', delay: 0.5 },
    { Icon: Candy, color: '#60A5FA', x: '85%', y: '80%', delay: 1.5 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-gradient-to-b from-[#FFF1F2] to-[#FFE4E6] overflow-hidden"
        >
          {/* --- Floating Background Elements --- */}
          {icons.map((item, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{ left: item.x, top: item.y, color: item.color }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: item.delay,
                ease: 'easeInOut',
              }}
            >
              <item.Icon size={48} opacity={0.4} />
            </motion.div>
          ))}

          {/* --- Header --- */}
          <div className="mt-16 z-10 text-center">
            {/* Task Name & Progress */}
            {taskName && (
              <div className="mb-4">
                <h3 className="text-xl font-bold text-[#BE185D] font-display">{taskName}</h3>
                {showRoundInfo && (
                  <p className="text-[#DB2777] font-medium text-sm mt-1">{progressText}</p>
                )}
              </div>
            )}

            {/* Accumulated Coins */}
            {accumulatedCoins > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <Coins size={24} className="text-[#FCD34D]" fill="#FCD34D" />
                <span className="text-2xl font-black text-[#BE185D] font-display">
                  已赚 {accumulatedCoins} 金币
                </span>
              </motion.div>
            )}

            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-black text-[#BE185D] font-display tracking-wider mb-2"
            >
              {isFinished ? '电量充满啦！' : '美食派对时间！'}
            </motion.h2>
            <p className="text-[#DB2777] font-medium">
              {isFinished ? '准备好开始新的挑战了吗？' : '休息一下，补充能量 ⚡️'}
            </p>
          </div>

          {/* --- Main Character Scene --- */}
          <div className="flex-1 w-full max-w-md relative flex items-center justify-center z-10">
            <div className="w-64 h-64 md:w-80 md:h-80 relative">
              <motion.img
                src={eatImage}
                alt="美食派对"
                className="w-full h-full object-contain drop-shadow-xl"
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              />

              {/* Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl rounded-bl-none shadow-lg border-2 border-[#FBCFE8]"
              >
                <span className="text-sm font-bold text-[#BE185D]">
                  {isFinished ? '出发！' : '真好吃~ 😋'}
                </span>
              </motion.div>
            </div>
          </div>

          {/* --- Timer & Controls --- */}
          <div className="w-full max-w-md px-8 mb-12 z-10 flex flex-col items-center gap-6">
            {/* Countdown Display */}
            {!isFinished && (
              <div className="bg-white/60 backdrop-blur-sm px-8 py-4 rounded-full border-4 border-[#FBCFE8]">
                <span className="text-4xl font-black text-[#BE185D] font-mono tracking-widest">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                void handleSkip();
              }}
              className={`
                w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all
                ${isFinished
                  ? 'bg-[#F472B6] text-white shadow-[#BE185D]/30 border-b-4 border-[#BE185D]'
                  : 'bg-white text-gray-500 shadow-gray-200 border-b-4 border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {isFinished ? '休息结束，继续加油！' : '不想休息了'}
            </motion.button>

            {/* Tip */}
            {!isFinished && (
              <p className="text-xs text-[#FDA4AF] font-medium">倒计时结束前点击需二次确认</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestModal;
