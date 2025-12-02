import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Pizza, IceCream, Candy } from 'lucide-react';
import eatImage from '../assets/eat.png';

interface RestModalProps {
  isOpen: boolean;
  duration: number; // Duration in seconds
  onComplete: () => void;
}

const RestModal: React.FC<RestModalProps> = ({ isOpen, duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(duration); // Reset timer with custom duration
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, duration]);

  const handleSkip = () => {
    if (timeLeft > 0) {
      if (window.confirm("真的不休息了吗？蛋仔建议休息一下再出发哦！🍩")) {
        onComplete();
      }
    } else {
      onComplete();
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isFinished = timeLeft === 0;

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
                 rotate: [0, 10, -10, 0]
               }}
               transition={{ 
                 duration: 4, 
                 repeat: Infinity, 
                 delay: item.delay,
                 ease: "easeInOut"
               }}
             >
                <item.Icon size={48} opacity={0.4} />
             </motion.div>
          ))}

          {/* --- Header --- */}
          <div className="mt-16 z-10 text-center">
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-black text-[#BE185D] font-display tracking-wider mb-2"
            >
              {isFinished ? "电量充满啦！" : "美食派对时间！"}
            </motion.h2>
            <p className="text-[#DB2777] font-medium">
              {isFinished ? "准备好开始新的挑战了吗？" : "休息一下，补充能量 ⚡️"}
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
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
                
                {/* Speech Bubble */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl rounded-bl-none shadow-lg border-2 border-[#FBCFE8]"
                >
                   <span className="text-sm font-bold text-[#BE185D]">
                     {isFinished ? "出发！" : "真好吃~ 😋"}
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
               onClick={handleSkip}
               className={`
                 w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all
                 ${isFinished 
                    ? 'bg-[#F472B6] text-white shadow-[#BE185D]/30 border-b-4 border-[#BE185D]' 
                    : 'bg-white text-gray-500 shadow-gray-200 border-b-4 border-gray-300 hover:bg-gray-50'
                 }
               `}
             >
               {isFinished ? "休息结束，继续加油！" : "不想休息了"}
             </motion.button>

             {/* Tip */}
             {!isFinished && (
               <p className="text-xs text-[#FDA4AF] font-medium">
                 倒计时结束前点击需二次确认
               </p>
             )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestModal;