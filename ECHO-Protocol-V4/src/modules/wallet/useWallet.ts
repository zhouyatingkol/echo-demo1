/**
 * useWallet Hook - Simplified wallet operations
 */

import { useCallback } from 'react';
import { useWalletContext } from './WalletProvider';
import { ethers } from 'ethers';

export const useWallet = () => {
  const context = useWalletContext();

  const getSigner = useCallback(async () => {
    if (!context.isConnected) {
      throw new Error('Wallet not connected');
    }

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(ethereum);
    return provider.getSigner();
  }, [context.isConnected]);

  const getProvider = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('MetaMask not found');
    }
    return new ethers.BrowserProvider(ethereum);
  }, []);

  const signMessage = useCallback(async (message: string) => {
    const signer = await getSigner();
    return signer.signMessage(message);
  }, [getSigner]);

  return {
    ...context,
    getSigner,
    getProvider,
    signMessage,
  };
};