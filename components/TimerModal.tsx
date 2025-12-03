import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';
import EggCharacter from './EggCharacter';
import { soundEngine } from '../utils/audio';

interface TimerModalProps {
  isOpen: boolean;
  timeLeft: number;
  totalTime: number;
  taskName: string;
  currentRound: number;
  totalRounds: number;
  accumulatedCoins: number;
  onCancel: () => void | Promise<void>;
  onFinishEarly?: () => void | Promise<void>;
}

const TimerModal: React.FC<TimerModalProps> = ({
  isOpen,
  timeLeft,
  totalTime,
  taskName,
  currentRound,
  totalRounds,
  accumulatedCoins,
  onCancel,
  onFinishEarly,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  // Progress goes from 0 to 1 (0% done to 100% done)
  const progress = totalTime > 0 ? (totalTime - timeLeft + 1) / totalTime : 0;

  // Internal state for the factory animation loop
  const [productionTick, setProductionTick] = useState(0);

  // Check for mobile device to adjust animation height
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Use ref to track latest timeLeft for tick sound
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setProductionTick((t) => t + 1);
      }, 2000); // New coin every 2 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Play tick sound every second when timer is running
  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      // Play tick immediately when timer starts
      soundEngine.playTick();
      
      // Then play tick every second, but only if timeLeft > 0
      const tickInterval = setInterval(() => {
        if (timeLeftRef.current > 0) {
          soundEngine.playTick();
        }
      }, 1000);

      return () => clearInterval(tickInterval);
    }
  }, [isOpen]);

  // Show round info if multi-session is active
  const showRoundInfo = totalRounds > 0 && currentRound > 0;
  const roundText = showRoundInfo ? `第${currentRound}轮/共${totalRounds}轮` : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center bg-[#FEF9C3] overflow-hidden"
        >
          {/* --- TOP: Task Name & Round Info --- */}
          {taskName && (
            <div className="mt-8 mb-4 flex flex-col items-center">
              <div className="text-gray-600 font-bold mb-1 text-lg">{taskName}</div>
              {showRoundInfo && (
                <div className="text-gray-500 font-medium text-sm">{roundText}</div>
              )}
            </div>
          )}

          {/* --- TOP: Coin Storage --- */}
          <div className="mb-8 flex flex-col items-center">
            <div className="text-gray-400 font-bold mb-2 text-sm tracking-widest uppercase">本次产出</div>
            <motion.div
              key={accumulatedCoins}
              initial={{ scale: 1.2, color: '#FCD34D' }}
              animate={{ scale: 1, color: '#4B5563' }}
              className="flex items-center gap-3 text-4xl font-black font-display text-gray-700 bg-white/50 px-8 py-3 rounded-full border-2 border-white shadow-sm"
            >
              <Coins size={36} className="text-[#FCD34D] drop-shadow-sm" fill="#FCD34D" />
              <span>+{accumulatedCoins}</span>
            </motion.div>
          </div>

          {/* --- CENTER: The Coin Factory --- */}
          <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center relative">
            {/* The Giant Ring */}
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              {/* 1. Progress SVG Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 z-20 pointer-events-none">
                <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                <motion.circle
                  key={currentRound}
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="300%"
                  strokeDashoffset={300 * (1 - progress) + '%'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </svg>

              {/* 2. Factory Scene (Inside the hole) */}
              <div className="absolute inset-4 rounded-full bg-white shadow-inner overflow-hidden border-4 border-gray-100 flex flex-col items-center justify-end z-10">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10" />

                {/* Countdown Text (Floating in background) */}
                <div className="absolute top-8 w-full text-center z-0">
                  <div className="text-5xl font-black text-gray-200 font-display select-none">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </div>
                </div>

                {/* --- 3D Production Line --- */}
                <div className="relative w-full h-48 perspective-container z-10 flex items-end justify-center pb-4">
                  {/* The Stamper Machine */}
                  <div className="absolute top-12 md:top-0 left-1/2 -translate-x-1/2 w-16 h-full flex flex-col items-center">
                    <motion.div
                      className="w-4 h-24 bg-gray-400 rounded-b-lg origin-top"
                      animate={{ height: isMobile ? [30, 60, 30] : [60, 100, 60] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {/* Piston Head */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-8 bg-gray-600 rounded-lg shadow-lg border-b-4 border-gray-700" />
                    </motion.div>
                  </div>

                  {/* The Conveyor Belt */}
                  <div className="relative w-full h-16 bg-gray-700 transform rotate-x-12 origin-bottom overflow-hidden border-t-4 border-gray-600 flex items-center shadow-2xl">
                    {/* Moving belt texture */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:40px_100%] animate-conveyor" />

                    {/* Coins on the belt */}
                    <AnimatePresence>
                      <motion.div
                        key={productionTick}
                        className="absolute left-1/2 top-1/2 w-10 h-10 -mt-5 -ml-5"
                        initial={{ x: -150, opacity: 0 }}
                        animate={{
                          x: [0, 80],
                          opacity: [0, 1, 1, 0],
                        }}
                        transition={{ duration: 2, times: [0, 0.4, 0.8, 1], ease: 'linear' }}
                      >
                        {/* The Coin */}
                        <div className="w-full h-full rounded-full bg-[#FCD34D] border-2 border-[#B45309] shadow-[0_4px_0_#B45309] flex items-center justify-center">
                          <span className="text-[#B45309] font-bold text-xs">¥</span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* The Egg Worker */}
                  <div className="absolute left-4 bottom-8 w-20 h-20 z-20">
                    <EggCharacter state="worker" />
                  </div>

                  {/* Flying Coins to Counter Animation */}
                  <AnimatePresence>
                    <motion.div
                      key={`fly-${productionTick}`}
                      className="absolute right-10 bottom-16 w-8 h-8 pointer-events-none z-50"
                      initial={{ y: 0, scale: 1, opacity: 1 }}
                      animate={{ y: -300, scale: 0.5, opacity: 0 }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 1 }}
                    >
                      <div className="w-full h-full rounded-full bg-[#FCD34D] border border-[#B45309] flex items-center justify-center">
                        <span className="text-[#B45309] font-bold text-[10px]">$</span>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Motivational Slogan */}
            <div className="mt-8 text-center px-6">
              <p className="text-gray-500 font-medium animate-pulse">机器运转中... 每一秒都在创造价值！</p>
            </div>
          </div>

          {/* --- BOTTOM: Controls --- */}
          <div className="mb-8 w-full flex justify-center gap-4">
            {onFinishEarly && (
              <button
                onClick={() => {
                  void onFinishEarly();
                }}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-200/50 transition-colors"
              >
                提前完成
              </button>
            )}
            <button
              onClick={() => {
                void onCancel();
              }}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-200/50 transition-colors"
            >
              放弃挑战
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimerModal;
