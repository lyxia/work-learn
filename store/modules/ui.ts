import { create } from 'zustand';

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
  openSettlementModal: () => void;
  closeSettlementModal: () => void;
  openRestModal: () => void;
  closeRestModal: () => void;
  openVaultModal: () => void;
  closeVaultModal: () => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  settlementModal: {
    isOpen: false,
  },
  restModal: {
    isOpen: false,
  },
  vaultModal: {
    isOpen: false,
  },
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
}));

