import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Coins, Play, Lightbulb, X } from 'lucide-react';
import islandImage from '../assets/yunduo.png';
import bigCloudImage from '../assets/bigcloud.png';
import smallCloudImage from '../assets/smallcloud.png';
import capsuleImage from '../assets/niudanji.png';
import { soundEngine } from '../utils/audio';

interface TimerOption {
  id: string;
  duration: number;
  label: string;
  color: string;
}

interface HomePageProps {
  taskName: string;
  selectedTimeId: string;
  timerOptions: TimerOption[];
  coins: number;
  onTaskNameChange: (name: string) => void;
  onTimeSelect: (id: string) => void;
  onStart: () => void;
  onSettingsOpen: () => void;
  onVaultOpen: () => void;
}

// 金币胶囊组件
const CoinCapsule: React.FC<{ coins: number; onClick: () => void; floating?: boolean }> = ({
  coins,
  onClick,
  floating = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 pr-5
        ${floating ? 'h-14' : 'h-20'}
        bg-white/60 backdrop-blur-sm
        border-2 border-white
        rounded-full
        shadow-lg
        hover:bg-white/80 hover:scale-105
        active:scale-95
        transition-all
        ${floating ? 'absolute top-4 right-4 z-20' : ''}
      `}
    >
      <img
        src={capsuleImage}
        alt="金币胶囊"
        className={`${floating ? 'w-10 h-10' : 'w-14 h-14'} object-contain`}
      />
      <span className="font-bold text-lg text-text-main">{coins}</span>
    </button>
  );
};

// 场景组件 - 使用岛屿图片和云朵背景
const SceneArea: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* 左侧小云朵 - 截断效果 */}
      <img
        src={smallCloudImage}
        alt=""
        className="absolute left-0 top-[20%] w-24 md:w-32 -translate-x-1/3 opacity-90"
      />

      {/* 右侧小云朵 - 截断效果 */}
      <img
        src={smallCloudImage}
        alt=""
        className="absolute right-0 top-[35%] w-20 md:w-28 translate-x-1/3 opacity-80"
      />

      {/* 底部大云层 */}
      <img
        src={bigCloudImage}
        alt=""
        className="absolute bottom-0 left-0 right-0 w-full object-cover"
      />

      {/* 漂浮岛图片 */}
      <motion.img
        src={islandImage}
        alt="蛋仔专注岛"
        className="relative z-10 w-[65%] max-w-[280px] md:w-[70%] md:max-w-[500px] object-contain drop-shadow-xl"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

// 时间选择气泡组件
const TimeBubble: React.FC<{
  option: TimerOption;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ option, isSelected, onSelect }) => {
  // 从 label 中提取数字和单位
  const match = option.label.match(/(\d+)\s*(分钟|小时)/);
  const number = match ? match[1] : option.label;
  const unit = match ? match[2] : '';

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        w-[68px] h-[68px] md:w-[72px] md:h-[72px]
        rounded-full
        flex flex-col items-center justify-center
        transition-all duration-200
        font-bold
        text-text-main
        border-[3px]
        ${isSelected
          ? 'bg-primary scale-105 border-[#8D6E63] shadow-lg'
          : 'bg-white/60 hover:bg-white/80 border-panel'
        }
      `}
    >
      <span className="text-xl leading-none">{number}</span>
      <span className="text-xs opacity-80">{unit || '分钟'}</span>
    </motion.button>
  );
};

// 巨型行动按钮
const ActionButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98, y: 4 }}
      className="
        w-full
        h-[56px] md:h-[88px]
        rounded-[28px] md:rounded-[44px]
        bg-gradient-to-b from-primary to-[#FFCA28]
        shadow-[inset_0_4px_0_rgba(255,255,255,0.4),0_6px_0_#8D6E63,0_10px_20px_rgba(141,110,99,0.3)]
        active:shadow-[inset_0_4px_0_rgba(255,255,255,0.4),0_2px_0_#8D6E63]
        active:translate-y-[4px]
        transition-all duration-100
        relative
        overflow-hidden
      "
    >
      {/* 顶部高光 */}
      <div className="absolute top-2 left-8 right-8 h-1/3 bg-white/20 rounded-full blur-sm" />

      <div className="relative z-10 flex items-center justify-center gap-3">
        <Play className="w-6 h-6 md:w-7 md:h-7 text-text-main fill-text-main" />
        <span className="text-xl md:text-2xl font-black text-text-main font-display">
          启动金币生产线！
        </span>
      </div>
    </motion.button>
  );
};

const HomePage: React.FC<HomePageProps> = ({
  taskName,
  selectedTimeId,
  timerOptions,
  coins,
  onTaskNameChange,
  onTimeSelect,
  onStart,
  onSettingsOpen,
  onVaultOpen,
}) => {
  return (
    <div className="min-h-screen bg-canvas">
      {/* ========== 桌面端布局 (>=768px) ========== */}
      <div className="hidden md:flex min-h-screen">
        {/* 左侧场景区 */}
        <div className="flex-[1.2] relative">
          {/* 设置按钮 */}
          <div className="absolute top-6 left-6 z-20">
            <button
              onClick={() => {
                soundEngine.playClick();
                onSettingsOpen();
              }}
              className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white active:scale-95 transition-all"
            >
              <Settings size={20} className="text-text-secondary" />
            </button>
          </div>

          <SceneArea />
        </div>

        {/* 右侧控制台 */}
        <div className="flex-[0.8] bg-panel p-8 flex flex-col rounded-l-[32px] relative">
          {/* 金币胶囊 - 绝对定位在右上角 */}
          <div className="absolute top-6 right-8">
            <CoinCapsule coins={coins} onClick={onVaultOpen} />
          </div>

          {/* 专注设置卡片 - 垂直居中 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full"
          >
            <div className="bg-white/60 backdrop-blur-[10px] p-8 rounded-[32px] shadow-xl mb-6">
              {/* 标题 */}
              <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                准备专注做哪件事？
              </h2>

              {/* 任务输入框 */}
              <div className="relative mb-6">
                <input
                  type="text"
                  value={taskName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTaskNameChange(e.target.value)}
                  placeholder="例如：写数学作业"
                  className="
                    w-full h-[60px]
                    bg-white
                    rounded-[24px]
                    px-6
                    text-lg
                    text-text-main
                    placeholder-text-secondary/50
                    border-2 border-transparent
                    focus:border-primary
                    focus:ring-4 focus:ring-primary/20
                    outline-none
                    transition-all
                  "
                />
                {taskName && (
                  <button
                    onClick={() => onTaskNameChange('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 text-text-secondary hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* 时间选择 */}
              <div className="flex justify-center gap-4 flex-wrap">
                {timerOptions.map((option: TimerOption) => (
                  <TimeBubble
                    key={option.id}
                    option={option}
                    isSelected={selectedTimeId === option.id}
                    onSelect={() => onTimeSelect(option.id)}
                  />
                ))}
              </div>
            </div>

            {/* 行动按钮 */}
            <ActionButton onClick={onStart} />
          </motion.div>
        </div>
      </div>

      {/* ========== 移动端布局 (<768px) ========== */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* 顶部导航 */}
        <div className="absolute top-0 left-0 p-4 z-20">
          {/* 设置按钮 */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onSettingsOpen();
            }}
            className="w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white active:scale-95 transition-all"
          >
            <Settings size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* 上部场景区 - 占据剩余空间，z-0 放在底部面板后面 */}
        <div className="flex-1 relative min-h-0 z-0">
          <SceneArea />
          {/* 金币胶囊悬浮 */}
          <CoinCapsule coins={coins} onClick={onVaultOpen} floating />
        </div>

        {/* 底部操作面板 (Bottom Sheet) - 内容自适应，z-10 在场景区前面 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="
            flex-shrink-0
            bg-panel
            rounded-t-[32px]
            -mt-6
            p-6
            pb-[calc(24px+env(safe-area-inset-bottom))]
            shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
            relative z-10
          "
        >
          {/* 白色毛玻璃卡片 - 包裹输入框和时间选择 */}
          <div className="bg-white/60 backdrop-blur-[10px] rounded-[24px] p-5 mb-4 shadow-lg">
            {/* 任务输入框 */}
            <div className="relative mb-5">
              <Lightbulb className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                value={taskName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTaskNameChange(e.target.value)}
                placeholder="准备专注做哪件事？"
                className="
                  w-full h-[52px]
                  bg-white
                  rounded-[16px]
                  pl-12 pr-10
                  text-base
                  text-text-main
                  placeholder-text-secondary/50
                  border-2 border-transparent
                  focus:border-primary
                  focus:ring-4 focus:ring-primary/20
                  outline-none
                  transition-all
                "
              />
              {taskName && (
                <button
                  onClick={() => onTaskNameChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-200 text-text-secondary hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* 时间选择 - 横向排列 */}
            <div className="flex justify-between gap-2">
              {timerOptions.map((option: TimerOption) => (
                <TimeBubble
                  key={option.id}
                  option={option}
                  isSelected={selectedTimeId === option.id}
                  onSelect={() => onTimeSelect(option.id)}
                />
              ))}
            </div>
          </div>

          {/* 行动按钮 */}
          <ActionButton onClick={onStart} />
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
