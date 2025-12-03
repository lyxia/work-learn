import { create } from 'zustand';
import { useTimerStore } from './timer';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pauseFocusTimer?: boolean;
  showCancel?: boolean;
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolver?: (result: boolean) => void;
  shouldResumeFocusTimer: boolean;
  showCancelButton: boolean;
}

interface UIState {
  settlementModal: {
    isOpen: boolean;
  };
  restModal: {
    isOpen: boolean;
  };
  vaultModal: {
    isOpen: boolean;
  };
  confirmModal: ConfirmModalState;
  openSettlementModal: () => void;
  closeSettlementModal: () => void;
  openRestModal: () => void;
  closeRestModal: () => void;
  openVaultModal: () => void;
  closeVaultModal: () => void;
  closeAllModals: () => void;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmConfirmModal: () => void;
  cancelConfirmModal: () => void;
}

const initialConfirmModal: ConfirmModalState = {
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: '确定',
  cancelLabel: '取消',
  resolver: undefined,
  shouldResumeFocusTimer: false,
  showCancelButton: true,
};

export const useUIStore = create<UIState>((set, get) => ({
  settlementModal: {
    isOpen: false,
  },
  restModal: {
    isOpen: false,
  },
  vaultModal: {
    isOpen: false,
  },
  confirmModal: initialConfirmModal,
  openSettlementModal: () => {
    set({
      settlementModal: { isOpen: true },
    });
  },
  closeSettlementModal: () => {
    set({
      settlementModal: { isOpen: false },
    });
  },
  openRestModal: () => {
    set({
      restModal: { isOpen: true },
    });
  },
  closeRestModal: () => {
    set({
      restModal: { isOpen: false },
    });
  },
  openVaultModal: () => {
    set({
      vaultModal: { isOpen: true },
    });
  },
  closeVaultModal: () => {
    set({
      vaultModal: { isOpen: false },
    });
  },
  closeAllModals: () => {
    set({
      settlementModal: { isOpen: false },
      restModal: { isOpen: false },
      vaultModal: { isOpen: false },
    });
  },
  openConfirm: (options: ConfirmOptions) => {
    const { confirmModal } = get();
    if (confirmModal.isOpen) {
      if (confirmModal.shouldResumeFocusTimer) {
        useTimerStore.getState().resumeTimer();
      }
      confirmModal.resolver?.(false);
    }

    const timerStore = useTimerStore.getState();
    let shouldResumeFocusTimer = false;
    if (options.pauseFocusTimer !== false && timerStore.isActive) {
      timerStore.pauseTimer();
      shouldResumeFocusTimer = true;
    }

    return new Promise<boolean>((resolve) => {
      set({
        confirmModal: {
          isOpen: true,
          title: options.title ?? '提示',
          message: options.message,
          confirmLabel: options.confirmLabel ?? '确定',
          cancelLabel: options.cancelLabel ?? '取消',
          resolver: resolve,
          shouldResumeFocusTimer,
          showCancelButton: options.showCancel ?? true,
        },
      });
    });
  },
  confirmConfirmModal: () => {
    const { confirmModal } = get();
    confirmModal.resolver?.(true);
    if (confirmModal.shouldResumeFocusTimer) {
      useTimerStore.getState().resumeTimer();
    }
    set({ confirmModal: { ...initialConfirmModal } });
  },
  cancelConfirmModal: () => {
    const { confirmModal } = get();
    confirmModal.resolver?.(false);
    if (confirmModal.shouldResumeFocusTimer) {
      useTimerStore.getState().resumeTimer();
    }
    set({ confirmModal: { ...initialConfirmModal } });
  },
}));

