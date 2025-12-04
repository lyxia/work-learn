import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings, Volume2, VolumeX, Coins, Clock, Zap, X } from 'lucide-react';
import confetti from 'canvas-confetti';

import TimerModal from './components/TimerModal';
import RestModal from './components/RestModal';
import SettlementModal from './components/SettlementModal';
import VaultModal from './components/VaultModal';
import SettingsModal from './components/SettingsModal';
import ConfirmModal from './components/ConfirmModal';
import PasswordInputModal from './components/PasswordInputModal';
import CoinRecordModal from './components/CoinRecordModal';
import Footer from './components/Footer';
import { soundEngine } from './utils/audio';
import {
  useUserDataStore,
  useSettingsStore,
  useUIStore,
  useTaskStore,
  useTimerStore,
  useSessionRewardsStore,
  useMultiSessionStore,
  useCoinRecordStore,
} from './store';

const App: React.FC = () => {
  // --- Store Hooks ---
  const coins = useUserDataStore((state) => state.coins);
  const isMuted = useUserDataStore((state) => state.isMuted);
  const addCoins = useUserDataStore((state) => state.addCoins);
  const toggleMute = useUserDataStore((state) => state.toggleMute);

  const settings = useSettingsStore((state) => state.settings);
  const timerOptions = useSettingsStore((state) => state.timerOptions);
  const isSettingsOpen = useSettingsStore((state) => state.isOpen);
  const openSettings = useSettingsStore((state) => state.openSettings);
  const closeSettings = useSettingsStore((state) => state.closeSettings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);

  const taskName = useTaskStore((state) => state.name);
  const selectedTimeId = useTaskStore((state) => state.selectedTimeId);
  const setTaskName = useTaskStore((state) => state.setTaskName);
  const setSelectedTimeId = useTaskStore((state) => state.setSelectedTimeId);
  const getSelectedTimerOption = useTaskStore((state) => state.getSelectedTimerOption);

  const timerIsOpen = useTimerStore((state) => state.isOpen);
  const timerIsActive = useTimerStore((state) => state.isActive);
  const timeLeft = useTimerStore((state) => state.timeLeft);
  const totalTime = useTimerStore((state) => state.totalTime);
  const getProgress = useTimerStore((state) => state.getProgress);
  const getMinutesLeft = useTimerStore((state) => state.getMinutesLeft);
  const getSecondsLeft = useTimerStore((state) => state.getSecondsLeft);
  const tickTimer = useTimerStore((state) => state.tickTimer);
  const cancelTimer = useTimerStore((state) => state.cancelTimer);

  const settlementModalOpen = useUIStore((state) => state.settlementModal.isOpen);
  const restModalOpen = useUIStore((state) => state.restModal.isOpen);
  const vaultModalOpen = useUIStore((state) => state.vaultModal.isOpen);
  const confirmModalState = useUIStore((state) => state.confirmModal);
  const passwordModalState = useUIStore((state) => state.passwordModal);
  const coinRecordModalOpen = useUIStore((state) => state.coinRecordModal.isOpen);
  const openSettlementModal = useUIStore((state) => state.openSettlementModal);
  const closeSettlementModal = useUIStore((state) => state.closeSettlementModal);
  const openRestModal = useUIStore((state) => state.openRestModal);
  const closeRestModal = useUIStore((state) => state.closeRestModal);
  const openVaultModal = useUIStore((state) => state.openVaultModal);
  const closeVaultModal = useUIStore((state) => state.closeVaultModal);
  const closeCoinRecordModal = useUIStore((state) => state.closeCoinRecordModal);
  const openConfirm = useUIStore((state) => state.openConfirm);
  const confirmConfirmModal = useUIStore((state) => state.confirmConfirmModal);
  const cancelConfirmModal = useUIStore((state) => state.cancelConfirmModal);
  const confirmPasswordModal = useUIStore((state) => state.confirmPasswordModal);
  const cancelPasswordModal = useUIStore((state) => state.cancelPasswordModal);

  const baseCoins = useSessionRewardsStore((state) => state.baseCoins);
  const bonusCoins = useSessionRewardsStore((state) => state.bonusCoins);

  // Select individual properties to avoid creating new object references
  const multiSessionTaskName = useMultiSessionStore((state) => state.taskName);
  const multiSessionTotalRounds = useMultiSessionStore((state) => state.totalRounds);
  const multiSessionCurrentRound = useMultiSessionStore((state) => state.currentRound);
  const multiSessionCompletedRounds = useMultiSessionStore((state) => state.completedRounds);
  const multiSessionAccumulatedCoins = useMultiSessionStore((state) => state.accumulatedCoins);
  const multiSessionIsActive = useMultiSessionStore((state) => state.isActive);
  const createSession = useMultiSessionStore((state) => state.createSession);
  const startNextRound = useMultiSessionStore((state) => state.startNextRound);
  const completeCurrentRound = useMultiSessionStore((state) => state.completeCurrentRound);
  const updateAccumulatedCoins = useMultiSessionStore((state) => state.updateAccumulatedCoins);
  const finishEarly = useMultiSessionStore((state) => state.finishEarly);
  const cancelSession = useMultiSessionStore((state) => state.cancel);
  const resetSession = useMultiSessionStore((state) => state.reset);
  const sessionStartTime = useMultiSessionStore((state) => state.sessionStartTime);

  const addPendingIncome = useCoinRecordStore((state) => state.addPendingIncome);

  const timerRef = useRef<number | null>(null);

  // --- Effects ---

  // Set default selected time when settings change if not set or invalid
  useEffect(() => {
    if (timerOptions.length > 0) {
      const defaultId = timerOptions[0].id;
      if (!selectedTimeId || !timerOptions.find((opt) => opt.id === selectedTimeId)) {
        setSelectedTimeId(defaultId);
      }
    }
  }, [timerOptions, selectedTimeId, setSelectedTimeId]);

  useEffect(() => {
    soundEngine.setMuted(isMuted);
  }, [isMuted]);

  // Timer Tick Logic - use useCallback to stabilize the tick function
  const handleTimerTick = useCallback(() => {
    tickTimer();
    const timerState = useTimerStore.getState();
    const currentTimeLeft = timerState.timeLeft;
    const currentTotalTime = timerState.totalTime;
    const timePassed = currentTotalTime - currentTimeLeft;
    
        // Update accumulated coins if multi-session is active
        if (useMultiSessionStore.getState().isActive) {
          updateAccumulatedCoins(timePassed, currentTotalTime);
        }

    // Play tick sound if timer is still running
    if (currentTimeLeft > 0) {
      soundEngine.playTick();
    }

    // Check if timer finished
    if (currentTimeLeft === 0) {
      // Timer finished - complete current round
      const settingsState = useSettingsStore.getState();
      const roundDuration = settingsState.settings.timerOverride > 0 ? settingsState.settings.timerOverride : 1;
      const roundCoins = Math.ceil(roundDuration * 5);
      completeCurrentRound(roundCoins);
      soundEngine.playSuccess();
    }
  }, [tickTimer, updateAccumulatedCoins, completeCurrentRound]);

  useEffect(() => {
    if (!timerIsActive || timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(handleTimerTick, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerIsActive, timeLeft, handleTimerTick, multiSessionIsActive]);

  // --- Handlers ---

  const handleSelectTime = (id: string) => {
    soundEngine.playSelect();
    setSelectedTimeId(id);
  };

  const handleStart = async () => {
    // 验证任务名称必填
    if (!taskName || taskName.trim() === '') {
      await openConfirm({
        title: '需要任务名称',
        message: '请先输入任务名称！',
        confirmLabel: '好的',
        showCancel: false,
        pauseFocusTimer: false,
      });
      return;
    }

    const selectedOption = getSelectedTimerOption();
    if (!selectedOption) {
      await openConfirm({
        title: '请选择时长',
        message: '请选择预计时长！',
        confirmLabel: '马上去选',
        showCancel: false,
        pauseFocusTimer: false,
      });
      return;
    }

    soundEngine.playStart();

    // 总时长 = 用户选择的总时长
    const totalDuration = selectedOption.minutes;
    // 每轮时长 = timerOverride（如果设置了）否则使用总时长
    const roundDuration = settings.timerOverride > 0 ? settings.timerOverride : selectedOption.minutes;

    // Create multi-session
    createSession(taskName.trim(), totalDuration, roundDuration);
  };

  const handleSettlementClose = () => {
    // 创建待确认收入记录（不再直接入账）
    const totalDuration = multiSessionCompletedRounds * (settings.timerOverride || 1);
    addPendingIncome(
      {
        taskName: multiSessionTaskName,
        startTime: sessionStartTime,
        endTime: Date.now(),
        focusDuration: totalDuration,
        baseCoins,
        bonusCoins,
      },
      baseCoins + bonusCoins
    );

    closeSettlementModal();

    // Reset session
    resetSession();
  };

  const handleVaultOpen = () => {
    soundEngine.playSelect();
    openVaultModal();
  };

  const handleRedeem = (cost: number) => {
    if (coins >= cost) {
      useUserDataStore.getState().deductCoins(cost);
      closeVaultModal();
      soundEngine.playSuccess();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleSettingsSave = (newSettings: typeof settings) => {
    updateSettings(newSettings);
    soundEngine.playSuccess();
  };

  const handleSettingsReset = async () => {
    const confirmed = await openConfirm({
      title: '恢复默认设置',
      message: '确定恢复默认设置吗？',
      confirmLabel: '恢复',
      cancelLabel: '取消',
    });

    if (confirmed) {
      resetSettings();
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    soundEngine.setMuted(nextMuted);
    toggleMute();
    if (!nextMuted) {
      soundEngine.playClick();
    }
  };

  const handleTimerCancel = async () => {
    const confirmed = await openConfirm({
      title: '放弃挑战',
      message: '确定要放弃吗？蛋仔工厂将停止生产金币哦！🥺',
      confirmLabel: '放弃挑战',
      cancelLabel: '继续坚持',
    });

    if (!confirmed) {
      return;
    }

    cancelSession();
    soundEngine.playClick();
  };

  const handleRestComplete = () => {
    closeRestModal();
    soundEngine.playClick();
    // Start next round
    startNextRound();
  };

  const handleFinishEarly = async () => {
    const confirmed = await openConfirm({
      title: '提前完成',
      message: '确定要提前完成吗？',
      confirmLabel: '提前完成',
      cancelLabel: '继续生产',
    });

    if (!confirmed) {
      return;
    }

    finishEarly();
    soundEngine.playSuccess();
  };

  return (
    // 修改: 确保容器占满全屏，使用 flex-col 布局，移除 items-center justify-center 以支持自然流
    <div className="min-h-screen flex flex-col font-sans text-gray-700 selection:bg-yellow-200 overflow-x-hidden">
      {/* --- 全局静音按钮 (金库弹窗打开时隐藏，避免遮挡退出按钮) --- */}
      {!vaultModalOpen && (
        <button
          onClick={handleMuteToggle}
          className="fixed top-4 right-4 z-[100] w-10 h-10 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center shadow-md active:scale-95 transition-transform"
          aria-label={isMuted ? '取消静音' : '静音'}
        >
          {isMuted ? <VolumeX size={18} className="text-gray-400" /> : <Volume2 size={18} className="text-[#38BDF8]" />}
        </button>
      )}

      {/* --- Header Bar --- */}
      <header className="fixed top-0 left-0 right-0 p-4 z-40 flex justify-between items-start pointer-events-none">
        {/* Left: Logo & Settings */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-[#38BDF8] text-white px-4 py-2 rounded-full border-b-4 border-[#0284C7] shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform cursor-pointer">
            <span className="text-2xl">🏝️</span>
            <span className="font-display font-bold text-lg tracking-wider hidden md:inline">蛋仔专注岛</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              openSettings();
            }}
            className="w-10 h-10 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
            aria-label="Settings"
          >
            <Settings size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Right: Coin Display (留出静音按钮的空间) */}
        <div className="flex gap-2 mr-12">
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
      {/* 修改: 
          - 增加 mt-20 (移动端避开 Header) / md:mt-16
          - 调整底部留白: pb-10 (移动端) / md:pb-80 (桌面端)
          - 增加 flex-grow 让它撑开高度
          - mx-auto 居中
      */}
      <main className="w-full max-w-2xl px-4 relative z-0 mt-20 md:mt-16 pb-10 md:pb-80 mx-auto flex-grow flex flex-col justify-center">
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
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

      </main>

      {/* Footer with Character and Start Button */}
      <Footer
        onStart={() => {
          void handleStart();
        }}
      />

      {/* Focus Timer Modal */}
      <TimerModal
        isOpen={timerIsOpen}
        timeLeft={timeLeft}
        totalTime={totalTime}
        taskName={multiSessionIsActive ? multiSessionTaskName : taskName}
        currentRound={multiSessionIsActive ? multiSessionCurrentRound : 0}
        totalRounds={multiSessionIsActive ? multiSessionTotalRounds : 0}
        accumulatedCoins={multiSessionIsActive ? multiSessionAccumulatedCoins : 0}
        onCancel={handleTimerCancel}
        onFinishEarly={handleFinishEarly}
      />

      {/* Settlement Surprise Box */}
      <SettlementModal
        isOpen={settlementModalOpen}
        baseCoins={baseCoins}
        bonusCoins={bonusCoins}
        duration={multiSessionIsActive ? multiSessionCompletedRounds * (settings.timerOverride || 1) : Math.ceil(totalTime / 60)}
        onClose={handleSettlementClose}
      />

      {/* Rest Break Modal */}
      <RestModal
        isOpen={restModalOpen}
        taskName={multiSessionTaskName}
        completedRounds={multiSessionCompletedRounds}
        totalRounds={multiSessionTotalRounds}
        accumulatedCoins={multiSessionAccumulatedCoins}
        duration={settings.restDuration}
        onComplete={handleRestComplete}
      />

      {/* Vault / Redemption Modal */}
      <VaultModal isOpen={vaultModalOpen} totalCoins={coins} onClose={closeVaultModal} onRedeem={handleRedeem} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onSave={handleSettingsSave}
        onReset={handleSettingsReset}
        onClose={closeSettings}
      />

      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmLabel={confirmModalState.confirmLabel}
        cancelLabel={confirmModalState.cancelLabel}
        showCancel={confirmModalState.showCancelButton}
        onConfirm={confirmConfirmModal}
        onCancel={cancelConfirmModal}
      />

      {/* Password Input Modal */}
      <PasswordInputModal
        isOpen={passwordModalState.isOpen}
        title={passwordModalState.title}
        mode={passwordModalState.mode}
        verifyFn={passwordModalState.verifyFn}
        onConfirm={confirmPasswordModal}
        onCancel={cancelPasswordModal}
      />

      {/* Coin Record Modal */}
      <CoinRecordModal
        isOpen={coinRecordModalOpen}
        onClose={closeCoinRecordModal}
      />
    </div>
  );
};

export default App;
