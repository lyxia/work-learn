import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, X, Lock, Unlock, Calendar } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import moneyImage from '../assets/money.png';
import { useUIStore } from '../store';

interface VaultModalProps {
  isOpen: boolean;
  totalCoins: number;
  onClose: () => void;
  onRedeem: (cost: number) => void;
}

const VaultModal: React.FC<VaultModalProps> = ({ isOpen, totalCoins, onClose, onRedeem }) => {
  const REDEMPTION_COST = 1000;
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6; // Sunday(0) or Saturday(6)
  
  // Progress Calculation
  const progress = Math.min(totalCoins / REDEMPTION_COST, 1);
  const coinsNeeded = Math.max(0, REDEMPTION_COST - totalCoins);
  const canRedeem = totalCoins >= REDEMPTION_COST;

   const openConfirm = useUIStore((state) => state.openConfirm);

   const handleRedeemClick = async () => {
      if (!canRedeem) return;

      if (!isWeekend) {
         const confirmed = await openConfirm({
            title: '工作日提醒',
            message: '虽然金币够了，但今天是工作日哦！确定要现在兑换吗？（通常周末才兑换游戏时间哦）',
            confirmLabel: '坚持兑换',
            cancelLabel: '等到周末',
         });
         if (!confirmed) {
            return;
         }
      } else {
         const confirmed = await openConfirm({
            title: '兑换确认',
            message: '确定要消耗1000蛋币兑换30分钟自由娱乐时间吗？需家长确认哦！',
            confirmLabel: '确认兑换',
            cancelLabel: '再想想',
         });
         if (!confirmed) {
            return;
         }
      }

      soundEngine.playCash();
      onRedeem(REDEMPTION_COST);
   };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[80] bg-[#FFFBEB] flex flex-col"
        >
          {/* --- Header --- */}
          <div className="flex justify-between items-center p-6 bg-[#FCD34D] shadow-md z-10">
             <div className="flex items-center gap-2">
                <div className="bg-white p-2 rounded-full shadow-sm">
                   <Coins className="text-[#B45309]" size={24} />
                </div>
                <h2 className="text-2xl font-black text-[#78350F] font-display">我的小金库</h2>
             </div>
             <button onClick={onClose} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors">
                <X className="text-[#78350F]" size={24} />
             </button>
          </div>

          {/* --- Content Scrollable --- */}
          <div className="flex-1 overflow-y-auto pb-20">
             
             {/* 1. Visual Scene: Swimming in Money */}
             <div className="bg-[#FCD34D] pb-12 pt-6 rounded-b-[3rem] shadow-lg relative overflow-hidden mb-8">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" 
                     style={{ backgroundImage: 'radial-gradient(#FFF 2px, transparent 2px)', backgroundSize: '20px 20px' }} 
                />
                
                <div className="flex flex-col items-center justify-center relative z-10">
                   
                   {/* 
                      --- IMAGE REPLACEMENT AREA --- 
                      请将下方的 src 替换为您上传的图片的实际路径或 URL
                   */}
                   <div className="w-full max-w-sm px-4 relative mb-2 flex items-center justify-center">
                      {/* Glow effect */}
                      <motion.div
                        className="absolute w-48 h-48 bg-yellow-300 rounded-full blur-[60px] opacity-60"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      <motion.img 
                        src={moneyImage}
                        alt="Rich Egg in Vault"
                        className="relative z-10 h-full object-contain drop-shadow-2xl"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                   </div>
                   
                   {/* Total Balance Big Display */}
                   <motion.div 
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="bg-white/90 backdrop-blur px-8 py-3 rounded-2xl shadow-xl border-b-4 border-[#B45309] flex flex-col items-center relative z-20"
                   >
                      <span className="text-xs font-bold text-[#92400E] uppercase tracking-widest mb-1">当前余额</span>
                      <div className="text-6xl font-black text-[#B45309] font-mono tracking-tighter flex items-center gap-2">
                         <Coins size={40} fill="#F59E0B" className="text-[#B45309]" />
                         {totalCoins}
                      </div>
                   </motion.div>
                </div>
             </div>

             {/* 2. Progress & Redemption Goal */}
             <div className="px-6 max-w-lg mx-auto">
                <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-gray-100 mb-6">
                   <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                     <Lock size={20} className={canRedeem ? "text-green-500" : "text-gray-400"} />
                     兑换目标：30分钟自由时间
                   </h3>
                   
                   {/* Progress Bar Container */}
                   <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner mb-2">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`absolute top-0 left-0 h-full rounded-full flex items-center justify-end pr-3 transition-colors duration-300
                            ${canRedeem ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-yellow-300 to-yellow-500'}
                        `}
                      >
                         {progress > 0.2 && (
                             <span className="text-xs font-bold text-white drop-shadow-md">
                                {Math.floor(progress * 100)}%
                             </span>
                         )}
                      </motion.div>
                   </div>
                   
                   <div className="flex justify-between text-sm font-bold text-gray-400 mb-6">
                      <span>0</span>
                      <span className={canRedeem ? "text-green-600" : "text-gray-400"}>1000 蛋币</span>
                   </div>

                   {/* Main Action Button */}
                   <button
                                 onClick={() => {
                                    void handleRedeemClick();
                                 }}
                      disabled={!canRedeem}
                      className={`
                        w-full py-4 rounded-2xl font-black text-xl shadow-lg transition-all border-b-4 flex flex-col items-center justify-center gap-1
                        ${!canRedeem 
                           ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
                           : (isWeekend 
                               ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white border-[#047857] hover:brightness-110 active:translate-y-[4px] active:border-b-0' 
                               : 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white border-[#B45309] hover:brightness-110 active:translate-y-[4px] active:border-b-0'
                             )
                        }
                      `}
                   >
                      <div className="flex items-center gap-2">
                        {canRedeem ? <Unlock size={24} /> : <Lock size={24} />}
                        <span>
                           {canRedeem 
                              ? (isWeekend ? "立即兑换奖励！" : "金币已攒够 (建议周末兑换)") 
                              : "金币不足，继续加油！"
                           }
                        </span>
                      </div>
                      {!canRedeem && (
                        <span className="text-xs font-normal opacity-70">
                           还差 {coinsNeeded} 蛋币
                        </span>
                      )}
                   </button>
                </div>

                {/* 3. Rules Card */}
                <div className="bg-[#FEF2F2] rounded-2xl p-6 border-2 border-[#FECACA] relative">
                   <div className="absolute -top-3 left-6 bg-[#EF4444] text-white px-3 py-1 rounded-full text-xs font-bold">
                      家长必读规则
                   </div>
                   <ul className="space-y-3 mt-2 text-sm text-[#991B1B] font-medium">
                      <li className="flex items-start gap-2">
                         <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                         <span>汇率：1000 蛋币 = 30分钟 自由娱乐时间（如看电视、玩游戏）。</span>
                      </li>
                      <li className="flex items-start gap-2">
                         <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                         <span className="flex items-center gap-1">
                            <Calendar size={14} /> 
                            建议兑换时间：仅限周六、周日。
                         </span>
                      </li>
                      <li className="flex items-start gap-2">
                         <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                         <span>兑换时请将手机交给家长确认扣除金币。</span>
                      </li>
                   </ul>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VaultModal;