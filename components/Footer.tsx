import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import teacherImage from '../assets/teacher.png';
import { soundEngine } from '../utils/audio';

interface FooterProps {
  onStart: () => void;
}

const Footer: React.FC<FooterProps> = ({ onStart }) => {
  return (
    // 修改: 
    // 1. 移除 'fixed' 和 'bottom-0' (移动端)
    // 2. 保留 'md:fixed' 和 'md:bottom-20' (桌面端)
    // 3. 移动端增加 'mt-8' 保持间距
    <footer className="w-full mt-auto md:fixed md:bottom-20 md:left-0 md:right-0 z-30 pointer-events-none">
      {/* 修改: 增加安全区域 padding (pb-[env(...)]) */}
      <div className="max-w-2xl mx-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:py-6 relative">
        {/* Character & Speech Bubble */}
        <motion.div
          className="flex items-end justify-center mb-2 md:mb-4 relative pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute -left-32 bottom-20 md:-left-36 md:bottom-28 z-30 w-32 md:w-40">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white px-3 py-2 md:px-4 md:py-3 rounded-2xl rounded-br-none border-2 border-gray-200 shadow-md"
              >
                <p className="text-xs md:text-sm font-bold text-gray-600 leading-tight">选好时间，我们去赚金币啦！</p>
              </motion.div>
            </div>
            <div className="z-10 cursor-pointer" onClick={() => soundEngine.playClick()}>
              <motion.img
                src={teacherImage}
                alt="老师形象"
                // 修改: 移动端稍微调小图片尺寸
                className="w-28 h-28 md:w-40 md:h-40 object-contain drop-shadow-xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center pointer-events-auto"
        >
          <button
            onClick={onStart}
            className="group relative w-full md:w-auto px-6 py-4 md:px-8 md:py-5 bg-gradient-to-b from-[#FCD34D] to-[#F59E0B] rounded-full border-b-[6px] md:border-b-[8px] border-[#B45309] shadow-xl active:border-b-0 active:translate-y-[6px] md:active:translate-y-[8px] active:shadow-none transition-all duration-100"
          >
            <div className="flex items-center justify-center gap-3 md:gap-4 text-white drop-shadow-md">
              <Settings size={24} className="animate-spin-slow text-[#B45309]/50 md:w-8 md:h-8" />
              <span className="text-xl md:text-3xl font-black font-display tracking-wide text-shadow">
                启动金币生产线！
              </span>
              <Settings size={20} className="animate-spin-slow text-[#B45309]/50 md:w-6 md:h-6" style={{ animationDirection: 'reverse' }} />
            </div>
            {/* Shine effect */}
            <div className="absolute top-2 left-10 right-10 h-1/2 bg-white/20 rounded-full blur-sm" />
          </button>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

