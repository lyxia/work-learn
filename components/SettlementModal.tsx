import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Clock, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

interface SettlementModalProps {
  isOpen: boolean;
  baseCoins: number;
  bonusCoins: number;
  duration: number; // in minutes
  onClose: () => void;
}

const SettlementModal: React.FC<SettlementModalProps> = ({ 
  isOpen, baseCoins, bonusCoins, duration, onClose 
}) => {
  const [stage, setStage] = useState<'closed' | 'opening' | 'revealed'>('closed');
  const totalCoins = baseCoins + bonusCoins;

  useEffect(() => {
    if (isOpen) {
      setStage('closed');
    }
  }, [isOpen]);

  const handleOpenChest = () => {
    if (stage !== 'closed') return;
    
    setStage('opening');
    soundEngine.playChestOpen();

    // Trigger confetti after a slight delay matching animation
    setTimeout(() => {
      setStage('revealed');
      fireConfetti();
    }, 800);
  };

  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FCD34D', '#FDBA74', '#F472B6']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FCD34D', '#FDBA74', '#F472B6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          {/* --- Sunburst Background Effect (Only when revealed) --- */}
          <AnimatePresence>
            {stage === 'revealed' && (
              <motion.div
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: 1, scale: 1.5 }}
                 className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
              >
                 <div className="w-[200vw] h-[200vw] animate-spin-slow opacity-30"
                      style={{
                        background: 'repeating-conic-gradient(#FCD34D 0deg 10deg, transparent 10deg 20deg)'
                      }}
                 />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full max-w-md p-6 flex flex-col items-center z-10">
            
            {/* --- Header Text --- */}
            <div className="h-20 mb-4 flex items-end justify-center">
               <AnimatePresence mode="wait">
                 {stage === 'revealed' ? (
                   <motion.div
                     initial={{ scale: 0, y: 50 }}
                     animate={{ scale: 1, y: 0 }}
                     className="text-center"
                   >
                     <h2 className="text-4xl font-black text-white font-display drop-shadow-[0_4px_0_#B45309] stroke-black text-shadow-lg">
                       大丰收！
                     </h2>
                   </motion.div>
                 ) : (
                   <motion.h2 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="text-2xl font-bold text-white tracking-wide animate-pulse"
                   >
                     点击开启惊喜宝箱
                   </motion.h2>
                 )}
               </AnimatePresence>
            </div>

            {/* --- The Chest --- */}
            <motion.div
              className="relative w-64 h-64 cursor-pointer"
              onClick={handleOpenChest}
              whileHover={stage === 'closed' ? { scale: 1.05, rotate: [0, -2, 2, 0] } : {}}
              whileTap={stage === 'closed' ? { scale: 0.95 } : {}}
              animate={stage === 'opening' ? { 
                scale: [1, 1.1, 0.9, 1.2], 
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.8 } 
              } : {}}
            >
               <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                 
                 {/* Chest Base */}
                 <path d="M20 90 L180 90 L170 160 Q100 180 30 160 Z" fill="#B45309" stroke="#78350F" strokeWidth="4" />
                 <path d="M20 90 L180 90 L170 120 L30 120 Z" fill="#D97706" /> {/* Highlight */}
                 
                 {/* Vertical Bands */}
                 <rect x="50" y="90" width="20" height="75" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
                 <rect x="130" y="90" width="20" height="75" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />

                 {/* Chest Lid (Top) - Animated */}
                 <motion.g
                   style={{ originY: "90px" }}
                   initial={{ rotate: 0 }}
                   animate={stage === 'revealed' ? { rotate: -20, y: -40, opacity: 0 } : {}} // Simplified open animation: fly off or hinge
                 >
                    {/* Hinge logic visually simplified by moving a separate group for 'open' state if complex 3D needed, 
                        but for 2D, we can just pop the lid up or rotate it. 
                        Let's do a "pop open" effect where lid rotates up. */}
                 </motion.g>
                 
                 {/* Closed Lid */}
                 {stage !== 'revealed' && (
                    <motion.g
                       animate={stage === 'opening' ? { y: [-2, 2, -2] } : {}}
                    >
                       <path d="M15 90 Q100 40 185 90" fill="#D97706" stroke="#78350F" strokeWidth="4" />
                       <path d="M15 90 Q100 40 185 90" fill="url(#lidGradient)" opacity="0.5" />
                       <defs>
                          <linearGradient id="lidGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#FEF3C7" />
                             <stop offset="100%" stopColor="#D97706" />
                          </linearGradient>
                       </defs>
                       {/* Bands on Lid */}
                       <path d="M45 82 Q100 45 155 82" fill="none" stroke="#FCD34D" strokeWidth="20" strokeDasharray="20 60" strokeDashoffset="10" />
                       <path d="M45 82 Q100 45 155 82" fill="none" stroke="#B45309" strokeWidth="2" strokeDasharray="20 60" strokeDashoffset="10" />
                    </motion.g>
                 )}

                 {/* Open Lid (Back) */}
                 {stage === 'revealed' && (
                    <motion.path 
                       initial={{ scaleY: 0, opacity: 0 }}
                       animate={{ scaleY: 1, opacity: 1 }}
                       d="M20 90 L180 90 L160 30 Q100 10 40 30 Z" 
                       fill="#92400E" stroke="#78350F" strokeWidth="4" 
                    />
                 )}
                 
                 {/* Treasure (Inside) - Only visible when open */}
                 {stage === 'revealed' && (
                   <motion.g
                     initial={{ y: 20, opacity: 0 }}
                     animate={{ y: -20, opacity: 1 }}
                     transition={{ type: "spring", bounce: 0.5 }}
                   >
                      {/* Coins Piling */}
                      <circle cx="80" cy="80" r="15" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
                      <circle cx="120" cy="85" r="15" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
                      <circle cx="100" cy="70" r="15" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
                      
                      {/* Sparkles */}
                      <Star x="60" y="40" size={24} fill="white" className="animate-pulse text-yellow-200" />
                      <Star x="140" y="50" size={16} fill="white" className="animate-pulse text-yellow-200 delay-100" />
                   </motion.g>
                 )}

                 {/* Lock */}
                 {stage !== 'revealed' && (
                    <circle cx="100" cy="90" r="12" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
                 )}
               </svg>
            </motion.div>

            {/* --- Reward Details --- */}
            <AnimatePresence>
              {stage === 'revealed' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-6 border-2 border-white/30 shadow-xl flex flex-col items-center gap-4"
                >
                   {/* Main Coin Count */}
                   <div className="flex items-center gap-3">
                      <Coins size={48} className="text-[#FCD34D] drop-shadow-md" fill="#FCD34D" />
                      <div className="flex flex-col">
                         <span className="text-5xl font-black text-[#FCD34D] font-display drop-shadow-sm">
                           +{totalCoins}
                         </span>
                         {bonusCoins > 0 && (
                           <span className="text-xs font-bold text-white bg-[#F472B6] px-2 py-0.5 rounded-full self-start animate-bounce">
                             包含随机惊喜 +{bonusCoins}!
                           </span>
                         )}
                      </div>
                   </div>

                   {/* Duration Stat */}
                   <div className="flex items-center gap-2 text-white/80 font-medium bg-black/20 px-4 py-1 rounded-full">
                      <Clock size={16} />
                      <span>专注时长: {Number.isInteger(duration) ? duration : duration.toFixed(1)} 分钟</span>
                   </div>

                   {/* Action Button */}
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={onClose}
                     className="w-full mt-2 py-3 bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] rounded-xl font-bold text-white text-lg shadow-lg border-b-4 border-[#B45309] active:border-b-0 active:translate-y-[4px]"
                   >
                     放入背包 🎒
                   </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettlementModal;