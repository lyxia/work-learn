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

interface PasswordModalState {
  isOpen: boolean;
  title: string;
  mode: 'verify' | 'set' | 'change';
  resolver?: (result: string | null) => void;
}

interface PasswordModalOptions {
  title?: string;
  mode: 'verify' | 'set' | 'change';
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
  coinRecordModal: {
    isOpen: boolean;
  };
  confirmModal: ConfirmModalState;
  passwordModal: PasswordModalState;
  openSettlementModal: () => void;
  closeSettlementModal: () => void;
  openRestModal: () => void;
  closeRestModal: () => void;
  openVaultModal: () => void;
  closeVaultModal: () => void;
  openCoinRecordModal: () => void;
  closeCoinRecordModal: () => void;
  closeAllModals: () => void;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  confirmConfirmModal: () => void;
  cancelConfirmModal: () => void;
  openPasswordModal: (options: PasswordModalOptions) => Promise<string | null>;
  confirmPasswordModal: (password: string) => void;
  cancelPasswordModal: () => void;
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

const initialPasswordModal: PasswordModalState = {
  isOpen: false,
  title: '',
  mode: 'verify',
  resolver: undefined,
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
  coinRecordModal: {
    isOpen: false,
  },
  confirmModal: initialConfirmModal,
  passwordModal: initialPasswordModal,
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
  openCoinRecordModal: () => {
    set({
      coinRecordModal: { isOpen: true },
    });
  },
  closeCoinRecordModal: () => {
    set({
      coinRecordModal: { isOpen: false },
    });
  },
  closeAllModals: () => {
    set({
      settlementModal: { isOpen: false },
      restModal: { isOpen: false },
      vaultModal: { isOpen: false },
      coinRecordModal: { isOpen: false },
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
  openPasswordModal: (options: PasswordModalOptions) => {
    const { passwordModal } = get();
    // 如果已有密码弹窗打开，先关闭它
    if (passwordModal.isOpen) {
      passwordModal.resolver?.(null);
    }

    const title = options.title ?? (
      options.mode === 'verify' ? '请输入家长密码' :
      options.mode === 'set' ? '设置家长密码' : '修改家长密码'
    );

    return new Promise<string | null>((resolve) => {
      set({
        passwordModal: {
          isOpen: true,
          title,
          mode: options.mode,
          resolver: resolve,
        },
      });
    });
  },
  confirmPasswordModal: (password: string) => {
    const { passwordModal } = get();
    passwordModal.resolver?.(password);
    set({ passwordModal: { ...initialPasswordModal } });
  },
  cancelPasswordModal: () => {
    const { passwordModal } = get();
    passwordModal.resolver?.(null);
    set({ passwordModal: { ...initialPasswordModal } });
  },
}));

