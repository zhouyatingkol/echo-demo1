/**
 * useECHOAsset Hook - ECHOAssetV2V3 contract interactions
 */

import { useCallback, useState } from 'react';
import { ethers, Contract } from 'ethers';
import { useWallet } from '@/modules/wallet/useWallet';
import { getContractConfig } from './contract-config';
import type { MusicAsset, ApiResponse } from '@/types';
import { parseErrorMessage } from '@/lib/utils';

export const useECHOAsset = () => {
  const { isConnected, chainId, getSigner, getProvider } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback(async () => {
    if (!isConnected || !chainId) {
      throw new Error('Wallet not connected');
    }

    const config = getContractConfig(chainId);
    const signer = await getSigner();
    
    return new Contract(
      config.addresses.ECHOAssetV2V3,
      config.abis.ECHOAssetV2V3,
      signer
    );
  }, [isConnected, chainId, getSigner]);

  const getContractReadOnly = useCallback(async () => {
    const provider = await getProvider();
    const config = getContractConfig(chainId || 11155111);
    
    return new Contract(
      config.addresses.ECHOAssetV2V3,
      config.abis.ECHOAssetV2V3,
      provider
    );
  }, [chainId, getProvider]);

  // Get asset by token ID
  const getAsset = useCallback(async (tokenId: string): Promise<ApiResponse<MusicAsset>> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContractReadOnly();
      const metadata = await contract.getAssetMetadata(tokenId);
      
      const asset: MusicAsset = {
        id: tokenId,
        tokenId,
        title: metadata.title,
        artist: metadata.artist,
        description: metadata.description,
        coverImage: metadata.coverImage,
        audioUrl: metadata.audioUrl,
        duration: Number(metadata.duration),
        genre: metadata.genre,
        mood: metadata.mood,
        bpm: Number(metadata.bpm),
        createdAt: Number(metadata.createdAt),
        price: ethers.formatEther(metadata.price),
        currency: 'ETH',
        owner: await contract.ownerOf(tokenId),
        creator: metadata.creator,
        totalLicenses: 0, // Would need separate query
        isVerified: true,
      };

      return { success: true, data: asset };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [getContractReadOnly]);

  // Get multiple assets
  const getAssets = useCallback(async (tokenIds: string[]): Promise<ApiResponse<MusicAsset[]>> => {
    setIsLoading(true);
    setError(null);

    try {
      const assets = await Promise.all(
        tokenIds.map(async (id) => {
          const result = await getAsset(id);
          return result.data;
        })
      );

      return { 
        success: true, 
        data: assets.filter((a): a is MusicAsset => a !== undefined) 
      };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [getAsset]);

  // Mint new asset
  const mintAsset = useCallback(async (
    metadata: Omit<MusicAsset, 'id' | 'tokenId' | 'createdAt' | 'owner' | 'price' | 'currency' | 'totalLicenses' | 'isVerified' | 'creator'>,
    price: string
  ): Promise<ApiResponse<{ tokenId: string; txHash: string }>> => {
    if (!isConnected) {
      return { success: false, error: '请先连接钱包' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      const priceWei = ethers.parseEther(price);

      const tx = await contract.mintAsset(
        {
          title: metadata.title,
          artist: metadata.artist,
          description: metadata.description,
          coverImage: metadata.coverImage,
          audioUrl: metadata.audioUrl,
          duration: metadata.duration,
          genre: metadata.genre,
          mood: metadata.mood,
          bpm: metadata.bpm,
        },
        priceWei
      );

      const receipt = await tx.wait();
      
      // Parse tokenId from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'AssetMinted';
        } catch {
          return false;
        }
      });

      const tokenId = event ? 
        contract.interface.parseLog(event)?.args?.tokenId?.toString() : 
        '0';

      return { 
        success: true, 
        data: { tokenId, txHash: receipt.hash } 
      };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getContract]);

  // Update asset price
  const updatePrice = useCallback(async (
    tokenId: string, 
    newPrice: string
  ): Promise<ApiResponse<{ txHash: string }>> => {
    if (!isConnected) {
      return { success: false, error: '请先连接钱包' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      const priceWei = ethers.parseEther(newPrice);

      const tx = await contract.updatePrice(tokenId, priceWei);
      const receipt = await tx.wait();

      return { success: true, data: { txHash: receipt.hash } };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getContract]);

  // Get owner assets
  const getOwnerAssets = useCallback(async (owner: string): Promise<ApiResponse<MusicAsset[]>> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContractReadOnly();
      const balance = await contract.balanceOf(owner);
      
      const tokenIds: string[] = [];
      for (let i = 0; i < balance; i++) {
        try {
          // Note: This is a simplified approach. In production, 
          // you'd want to use a subgraph or indexer
          const tokenId = await contract.tokenOfOwnerByIndex(owner, i);
          tokenIds.push(tokenId.toString());
        } catch {
          break;
        }
      }

      return getAssets(tokenIds);
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [getContractReadOnly, getAssets]);

  return {
    isLoading,
    error,
    getAsset,
    getAssets,
    mintAsset,
    updatePrice,
    getOwnerAssets,
  };
};