/**
 * ConnectButton - Wallet connection button
 */

import React from 'react';
import { useWallet } from './useWallet';
import { Button } from '@/components/ui/Button';
import { formatAddress, cn } from '@/lib/utils';
import { Wallet, Loader2, LogOut } from 'lucide-react';

interface ConnectButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  className,
  size = 'md',
  variant = 'primary',
}) => {
  const { address, isConnected, isConnecting, connect, disconnect, balance } = useWallet();

  if (isConnected && address) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-sm font-medium text-foreground">
            {formatAddress(address)}
          </span>
          <span className="text-xs text-muted-foreground">
            {parseFloat(balance).toFixed(4)} ETH
          </span>
        </div>
        <Button
          variant="secondary"
          size={size}
          onClick={disconnect}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">断开连接</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={connect}
      disabled={isConnecting}
      className={cn('gap-2', className)}
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>连接中...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          <span>连接钱包</span>
        </>
      )}
    </Button>
  );
};