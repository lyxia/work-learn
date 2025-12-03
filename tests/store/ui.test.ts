import { beforeEach, describe, expect, it } from 'vitest';
import { useUIStore } from '../../store/modules/ui';
import { useTimerStore } from '../../store/modules/timer';

const resetUIState = () => {
  useUIStore.setState((state) => ({
    ...state,
    settlementModal: { isOpen: false },
    restModal: { isOpen: false },
    vaultModal: { isOpen: false },
    confirmModal: {
      isOpen: false,
      title: '',
      message: '',
      confirmLabel: '确定',
      cancelLabel: '取消',
      resolver: undefined,
      shouldResumeFocusTimer: false,
      showCancelButton: true,
    },
  }));
};

const resetTimerState = () => {
  useTimerStore.setState({
    isOpen: false,
    isActive: false,
    wasActiveBeforePause: false,
    timeLeft: 0,
    totalTime: 0,
  });
};

describe('UI Store', () => {
  beforeEach(() => {
    resetUIState();
    resetTimerState();
  });

  describe('初始状态', () => {
    it('所有弹窗应该默认关闭', () => {
      const state = useUIStore.getState();
      expect(state.settlementModal.isOpen).toBe(false);
      expect(state.restModal.isOpen).toBe(false);
      expect(state.vaultModal.isOpen).toBe(false);
      expect(state.confirmModal.isOpen).toBe(false);
    });
  });

  describe('settlementModal', () => {
    it('应该打开结算弹窗', () => {
      const { openSettlementModal } = useUIStore.getState();
      openSettlementModal();
      expect(useUIStore.getState().settlementModal.isOpen).toBe(true);
    });

    it('应该关闭结算弹窗', () => {
      const { openSettlementModal, closeSettlementModal } = useUIStore.getState();
      openSettlementModal();
      closeSettlementModal();
      expect(useUIStore.getState().settlementModal.isOpen).toBe(false);
    });
  });

  describe('restModal', () => {
    it('应该打开休息弹窗', () => {
      const { openRestModal } = useUIStore.getState();
      openRestModal();
      expect(useUIStore.getState().restModal.isOpen).toBe(true);
    });

    it('应该关闭休息弹窗', () => {
      const { openRestModal, closeRestModal } = useUIStore.getState();
      openRestModal();
      closeRestModal();
      expect(useUIStore.getState().restModal.isOpen).toBe(false);
    });
  });

  describe('vaultModal', () => {
    it('应该打开金库弹窗', () => {
      const { openVaultModal } = useUIStore.getState();
      openVaultModal();
      expect(useUIStore.getState().vaultModal.isOpen).toBe(true);
    });

    it('应该关闭金库弹窗', () => {
      const { openVaultModal, closeVaultModal } = useUIStore.getState();
      openVaultModal();
      closeVaultModal();
      expect(useUIStore.getState().vaultModal.isOpen).toBe(false);
    });
  });

  describe('confirmModal', () => {
    it('openConfirm 应展示确认弹窗并在确认后解析为 true', async () => {
      const { openConfirm, confirmConfirmModal } = useUIStore.getState();
      const confirmPromise = openConfirm({ message: '测试确认' });

      expect(useUIStore.getState().confirmModal.isOpen).toBe(true);

      confirmConfirmModal();

      await expect(confirmPromise).resolves.toBe(true);
      expect(useUIStore.getState().confirmModal.isOpen).toBe(false);
    });

    it('openConfirm 在取消后应该解析为 false', async () => {
      const { openConfirm, cancelConfirmModal } = useUIStore.getState();
      const confirmPromise = openConfirm({ message: '测试取消', title: '提示' });

      expect(useUIStore.getState().confirmModal.isOpen).toBe(true);

      cancelConfirmModal();

      await expect(confirmPromise).resolves.toBe(false);
      expect(useUIStore.getState().confirmModal.isOpen).toBe(false);
    });

    it('重复 openConfirm 应该关闭先前的 Promise', async () => {
      const { openConfirm, cancelConfirmModal } = useUIStore.getState();
      const firstPromise = openConfirm({ message: '第一次' });
      const secondPromise = openConfirm({ message: '第二次' });

      await expect(firstPromise).resolves.toBe(false);

      cancelConfirmModal();

      await expect(secondPromise).resolves.toBe(false);
    });

    it('打开确认弹窗时应暂停计时器并在关闭后恢复', async () => {
      const timerStore = useTimerStore.getState();
      timerStore.startTimer(10);

      expect(useTimerStore.getState().isActive).toBe(true);

      const { openConfirm, confirmConfirmModal } = useUIStore.getState();
      const confirmPromise = openConfirm({ message: '暂停测试' });

      expect(useTimerStore.getState().isActive).toBe(false);

      confirmConfirmModal();
      await confirmPromise;

      expect(useTimerStore.getState().isActive).toBe(true);
    });
  });

  describe('closeAllModals', () => {
    it('应该关闭所有弹窗', () => {
      const { openSettlementModal, openRestModal, openVaultModal, closeAllModals } = useUIStore.getState();
      openSettlementModal();
      openRestModal();
      openVaultModal();

      expect(useUIStore.getState().settlementModal.isOpen).toBe(true);
      expect(useUIStore.getState().restModal.isOpen).toBe(true);
      expect(useUIStore.getState().vaultModal.isOpen).toBe(true);

      closeAllModals();

      expect(useUIStore.getState().settlementModal.isOpen).toBe(false);
      expect(useUIStore.getState().restModal.isOpen).toBe(false);
      expect(useUIStore.getState().vaultModal.isOpen).toBe(false);
    });

    it('应该只关闭已打开的弹窗', () => {
      const { openSettlementModal, closeAllModals } = useUIStore.getState();
      openSettlementModal();
      closeAllModals();

      expect(useUIStore.getState().settlementModal.isOpen).toBe(false);
      expect(useUIStore.getState().restModal.isOpen).toBe(false);
      expect(useUIStore.getState().vaultModal.isOpen).toBe(false);
    });
  });

  describe('多个弹窗交互', () => {
    it('应该可以同时打开多个弹窗', () => {
      const { openSettlementModal, openRestModal, openVaultModal } = useUIStore.getState();
      openSettlementModal();
      openRestModal();
      openVaultModal();

      const state = useUIStore.getState();
      expect(state.settlementModal.isOpen).toBe(true);
      expect(state.restModal.isOpen).toBe(true);
      expect(state.vaultModal.isOpen).toBe(true);
    });

    it('关闭一个弹窗不应该影响其他弹窗', () => {
      const { openSettlementModal, openRestModal, closeSettlementModal } = useUIStore.getState();
      openSettlementModal();
      openRestModal();
      closeSettlementModal();

      expect(useUIStore.getState().settlementModal.isOpen).toBe(false);
      expect(useUIStore.getState().restModal.isOpen).toBe(true);
    });
  });
});

