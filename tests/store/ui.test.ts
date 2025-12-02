import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../../store/modules/ui';

describe('UI Store', () => {
  beforeEach(() => {
    useUIStore.setState({
      settlementModal: { isOpen: false },
      restModal: { isOpen: false },
      vaultModal: { isOpen: false },
    });
  });

  describe('初始状态', () => {
    it('所有弹窗应该默认关闭', () => {
      const state = useUIStore.getState();
      expect(state.settlementModal.isOpen).toBe(false);
      expect(state.restModal.isOpen).toBe(false);
      expect(state.vaultModal.isOpen).toBe(false);
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

