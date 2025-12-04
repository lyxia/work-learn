import React, { useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';

import HomePage from './components/HomePage';
import TimerModal from './components/TimerModal';
import RestModal from './components/RestModal';
import SettlementModal from './components/SettlementModal';
import VaultModal from './components/VaultModal';
import SettingsModal from './components/SettingsModal';
import ConfirmModal from './components/ConfirmModal';
import PasswordInputModal from './components/PasswordInputModal';
import CoinRecordModal from './components/CoinRecordModal';
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
    // HomePage 已实现响应式布局，此处仅作为容器
    <div className="min-h-screen font-sans text-text-main selection:bg-yellow-200 overflow-x-hidden">
      {/* --- HomePage Component --- */}
      <HomePage
        taskName={taskName}
        selectedTimeId={selectedTimeId}
        timerOptions={timerOptions}
        coins={coins}
        onTaskNameChange={setTaskName}
        onTimeSelect={handleSelectTime}
        onStart={() => void handleStart()}
        onSettingsOpen={openSettings}
        onVaultOpen={handleVaultOpen}
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
        isMuted={isMuted}
        onToggleMute={toggleMute}
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
