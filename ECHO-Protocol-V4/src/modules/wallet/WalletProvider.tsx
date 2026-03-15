/**
 * Wallet Provider - Manages wallet connection and state
 */

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import type { WalletContextType, WalletState } from '@/types';
import { parseErrorMessage } from '@/lib/utils';

const DEFAULT_STATE: WalletState = {
  address: null,
  isConnected: false,
  isConnecting: false,
  chainId: null,
  balance: '0',
  error: null,
};

const WalletContext = createContext<WalletContextType | null>(null);

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [state, setState] = useState<WalletState>(DEFAULT_STATE);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined') return;
      
      const ethereum = (window as any).ethereum;
      if (!ethereum) return;

      try {
        // Check if already connected
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(ethereum);
          const network = await provider.getNetwork();
          const balance = await provider.getBalance(accounts[0]);
          
          setState({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
            chainId: Number(network.chainId),
            balance: ethers.formatEther(balance),
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        setState(DEFAULT_STATE);
      } else {
        // Account changed
        const provider = new ethers.BrowserProvider(ethereum);
        const networkInfo = await provider.getNetwork();
        const balance = await provider.getBalance(accounts[0]);
        
        setState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
          chainId: Number(networkInfo.chainId),
          balance: ethers.formatEther(balance),
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16),
      }));
      // Reload the page as recommended by MetaMask
      window.location.reload();
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) {
      setState(prev => ({
        ...prev,
        error: '请先安装 MetaMask 或其他钱包插件',
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(ethereum);
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);

      setState({
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: parseErrorMessage(error),
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        // Add chain logic here if needed
        console.error('Chain not added to wallet:', error);
      }
      throw error;
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!state.address || !state.isConnected) return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const balance = await provider.getBalance(state.address);
      
      setState(prev => ({
        ...prev,
        balance: ethers.formatEther(balance),
      }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [state.address, state.isConnected]);

  const value: WalletContextType = {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};