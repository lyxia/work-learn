import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, Volume2, VolumeX, Coins, Clock, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';

import EggCharacter from './components/EggCharacter';
import TimerModal from './components/TimerModal';
import RestModal from './components/RestModal';
import SettlementModal from './components/SettlementModal';
import VaultModal from './components/VaultModal';
import SettingsModal from './components/SettingsModal';
import { soundEngine } from './utils/audio';
import { AppSettings, TimerOption } from './types';
import teacherImage from './assets/teacher.png';

// Default Settings
const DEFAULT_SETTINGS: AppSettings = {
  taskOptions: [10, 20, 30, 40],
  restDuration: 300, // 5 minutes
  timerOverride: 0 // 0 means disabled
};

const App: React.FC = () => {
  // --- State ---
  // Settings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Data
  const [taskName, setTaskName] = useState('');
  const [selectedTimeId, setSelectedTimeId] = useState<string>(''); // Will init after settings load
  const [coins, setCoins] = useState(850);
  const [isMuted, setIsMuted] = useState(false);
  
  // Timer State
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  
  // Modal States
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  
  // Session Rewards
  const [sessionBaseCoins, setSessionBaseCoins] = useState(0);
  const [sessionBonusCoins, setSessionBonusCoins] = useState(0);

  // Accumulated coins in current session (visual only until finish)
  const [sessionCoins, setSessionCoins] = useState(0);

  const timerRef = useRef<number | null>(null);

  // --- Effects ---

  // Load Coins & Settings
  useEffect(() => {
    const savedCoins = localStorage.getItem('eggfocus_coins');
    if (savedCoins) setCoins(parseInt(savedCoins, 10));

    const savedSettings = localStorage.getItem('eggfocus_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  // Save Settings
  useEffect(() => {
    localStorage.setItem('eggfocus_coins', coins.toString());
    localStorage.setItem('eggfocus_settings', JSON.stringify(settings));
  }, [coins, settings]);

  // Set default selected time when settings change if not set or invalid
  useEffect(() => {
    if (settings.taskOptions.length > 0) {
      const defaultId = `${settings.taskOptions[0]}m`;
      if (!selectedTimeId || !settings.taskOptions.find(t => `${t}m` === selectedTimeId)) {
        setSelectedTimeId(defaultId);
      }
    }
  }, [settings.taskOptions, selectedTimeId]);

  // Generate Dynamic Timer Options from Settings
  const timerOptions: TimerOption[] = settings.taskOptions.map((min, index) => ({
    id: `${min}m`,
    minutes: min,
    label: `${min}分钟${min >= 40 ? '(含休息)' : ''}`, // Add suffix for longer tasks roughly
    color: index % 2 === 0 ? 'blue' : 'pink'
  }));

  // --- Handlers ---

  const handleSelectTime = (id: string) => {
    soundEngine.playSelect();
    setSelectedTimeId(id);
  };

  const handleStart = async () => {
    const option = timerOptions.find(opt => opt.id === selectedTimeId);
    if (!option) return;

    soundEngine.playStart();
    
    // Determine Duration: Use Override if set (> 0), otherwise use selected option
    const durationMinutes = settings.timerOverride > 0 ? settings.timerOverride : option.minutes;
    const durationSeconds = Math.floor(durationMinutes * 60);

    setTotalTime(durationSeconds);
    setTimeLeft(durationSeconds);
    setSessionCoins(0);
    setTimerOpen(true);
    setTimerActive(true);
  };

  const handleTimerFinish = () => {
    setTimerActive(false);
    setTimerOpen(false);
    soundEngine.playSuccess();
    
    // Final Reward Logic
    // Reward is calculated based on the *intended* duration (selected option), 
    // unless in test mode where we might want small rewards. 
    // Let's stick to the selected option to prevent exploiting test mode for massive coins,
    // or if in test mode, maybe give 1 coin?
    // For simplicity: Base reward on the actual duration run.
    
    const runMinutes = totalTime / 60;
    const baseReward = Math.ceil(runMinutes * 5); // 5 coins per minute
    const randomBonus = Math.floor(Math.random() * (runMinutes / 2)) + 1; 
    
    setSessionBaseCoins(baseReward > 0 ? baseReward : 1);
    setSessionBonusCoins(randomBonus > 0 ? randomBonus : 0);

    // Open Settlement "Surprise Box"
    setSettlementOpen(true);
  };

  const handleSettlementClose = () => {
    // Add coins to wallet
    setCoins(prev => prev + sessionBaseCoins + sessionBonusCoins);
    setSettlementOpen(false);
    
    // Start Rest Mode
    setTimeout(() => {
        soundEngine.playRestStart();
        setRestOpen(true);
    }, 500);
  };
  
  const handleVaultOpen = () => {
    soundEngine.playSelect();
    setVaultOpen(true);
  };
  
  const handleRedeem = (cost: number) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setVaultOpen(false);
      soundEngine.playSuccess();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
    soundEngine.playSuccess();
  };

  const handleSettingsReset = () => {
    if(window.confirm("确定恢复默认设置吗？")) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        
        // Calculate accrued coins visually
        const timePassed = totalTime - (timeLeft - 1);
        const accrued = Math.floor((timePassed / 60) * 5);
        if (accrued !== sessionCoins) {
           setSessionCoins(accrued);
        }

      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      handleTimerFinish();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, timeLeft, totalTime, sessionCoins]);

  const toggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if(!muted) soundEngine.playClick();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans text-gray-700 selection:bg-yellow-200">
      
      {/* --- Header Bar --- */}
      <header className="fixed top-0 left-0 right-0 p-4 z-40 flex justify-between items-start pointer-events-none">
        
        {/* Left: Logo & Settings */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-[#38BDF8] text-white px-4 py-2 rounded-full border-b-4 border-[#0284C7] shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform cursor-pointer">
             <span className="text-2xl">🏝️</span>
             <span className="font-display font-bold text-lg tracking-wider hidden md:inline">蛋仔专注岛</span>
          </div>
          
          <button 
             onClick={() => { soundEngine.playClick(); setSettingsOpen(true); }}
             className="w-10 h-10 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
             aria-label="Settings"
          >
             <Settings size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Right: Tools */}
        <div className="flex gap-2">
           {/* Mute Button */}
           <button 
             onClick={toggleMute}
             className="pointer-events-auto w-10 h-10 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
           >
             {isMuted ? <VolumeX size={18} className="text-gray-400"/> : <Volume2 size={18} className="text-[#38BDF8]"/>}
           </button>

           {/* Coin Display */}
           <button 
             onClick={handleVaultOpen}
             className="pointer-events-auto bg-gray-800 text-[#FCD34D] px-4 py-2 rounded-full border-b-4 border-black shadow-lg flex items-center gap-2 font-display font-bold text-lg hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all"
           >
             <Coins fill="#FCD34D" stroke="#B45309" strokeWidth={2} />
             <span>{coins}</span>
           </button>
        </div>
      </header>

      {/* --- Main Content Container --- */}
      <main className="w-full max-w-2xl px-4 relative z-0 mt-16 pb-20">
        
        {/* Input Section */}
        <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="bg-white p-2 rounded-[2rem] border-4 border-[#38BDF8] shadow-[0_8px_0_rgba(56,189,248,0.3)] mb-8"
        >
          <div className="relative">
             <input
               type="text"
               value={taskName}
               onChange={(e) => setTaskName(e.target.value)}
               placeholder="今天要做什么挑战呢？（例如：写数学作业）"
               className="w-full text-lg md:text-xl p-4 md:p-6 rounded-[1.5rem] border-2 border-dashed border-gray-300 focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/20 outline-none text-center font-bold text-gray-600 placeholder-gray-300 transition-all"
             />
             {taskName && (
               <motion.button 
                 initial={{ scale: 0 }} animate={{ scale: 1 }}
                 onClick={() => setTaskName('')}
                 className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors"
               >
                 <X size={20} />
               </motion.button>
             )}
          </div>
        </motion.div>

        {/* Duration Section */}
        <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.1 }}
           className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4 ml-2">
            <Clock className="text-gray-600" size={24} />
            <h2 className="text-xl font-bold text-gray-700">预计需要多久？</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {timerOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectTime(option.id)}
                className={`
                  relative h-16 rounded-2xl font-bold text-white text-md md:text-lg
                  transition-all duration-200 flex items-center justify-center text-center leading-tight
                  shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px]
                  ${selectedTimeId === option.id 
                    ? 'ring-4 ring-white ring-offset-2 ring-offset-[#FEF9C3] scale-105 z-10' 
                    : 'hover:brightness-110'
                  }
                  ${option.color === 'blue' 
                    ? 'bg-gradient-to-b from-[#38BDF8] to-[#0284C7]' 
                    : 'bg-gradient-to-b from-[#F472B6] to-[#DB2777]'
                  }
                `}
              >
                {option.label}
                {selectedTimeId === option.id && (
                   <motion.div 
                     layoutId="check"
                     className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full shadow-sm border-2 border-white"
                   >
                     <Zap size={14} fill="white" />
                   </motion.div>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Character & Speech Bubble */}
        <motion.div 
          className="flex items-end justify-center mb-0 mt-10 relative h-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute left-8 md:left-4 top-0 z-30">
            <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white px-4 py-3 rounded-2xl rounded-br-none border-2 border-gray-200 shadow-md max-w-[200px]"
            >
               <p className="text-sm font-bold text-gray-600 leading-tight">
                 选好时间，我们去赚金币啦！
               </p>
            </motion.div>
          </div>
          <div className="z-10 cursor-pointer" onClick={() => soundEngine.playClick()}>
             <motion.img
               src={teacherImage}
               alt="老师形象"
               className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-xl"
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               whileHover={{ scale: 1.05 }}
               transition={{ duration: 0.3 }}
             />
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
           initial={{ y: 50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ delay: 0.3 }}
           className="flex justify-center"
        >
          <button
            onClick={handleStart}
            className="group relative w-full md:w-auto px-8 py-5 bg-gradient-to-b from-[#FCD34D] to-[#F59E0B] rounded-full border-b-[8px] border-[#B45309] shadow-xl active:border-b-0 active:translate-y-[8px] active:shadow-none transition-all duration-100"
          >
             <div className="flex items-center justify-center gap-4 text-white drop-shadow-md">
                <Settings size={32} className="animate-spin-slow text-[#B45309]/50" />
                <span className="text-2xl md:text-3xl font-black font-display tracking-wide text-shadow">
                  启动金币生产线！
                </span>
                <Settings size={24} className="animate-spin-slow text-[#B45309]/50" style={{ animationDirection: 'reverse' }}/>
             </div>
             {/* Shine effect */}
             <div className="absolute top-2 left-10 right-10 h-1/2 bg-white/20 rounded-full blur-sm" />
          </button>
        </motion.div>

      </main>

      {/* Focus Timer Modal (Page 2) */}
      <TimerModal 
        isOpen={timerOpen}
        timeLeft={timeLeft}
        totalTime={totalTime}
        taskName={taskName}
        accumulatedCoins={sessionCoins}
        onCancel={() => {
          setTimerOpen(false);
          setTimerActive(false);
          soundEngine.playClick();
        }}
      />

      {/* Settlement Surprise Box (Page 4) */}
      <SettlementModal
        isOpen={settlementOpen}
        baseCoins={sessionBaseCoins}
        bonusCoins={sessionBonusCoins}
        duration={Math.ceil(totalTime / 60)}
        onClose={handleSettlementClose}
      />

      {/* Rest Break Modal (Page 3) */}
      <RestModal
        isOpen={restOpen}
        duration={settings.restDuration}
        onComplete={() => {
          setRestOpen(false);
          soundEngine.playClick();
        }}
      />
      
      {/* Vault / Redemption Modal (Page 5) */}
      <VaultModal
        isOpen={vaultOpen}
        totalCoins={coins}
        onClose={() => setVaultOpen(false)}
        onRedeem={handleRedeem}
      />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen}
        settings={settings}
        onSave={handleSettingsSave}
        onReset={handleSettingsReset}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};

export default App;