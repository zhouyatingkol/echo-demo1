/**
 * useECHOFusion Hook - ECHOFusionV2 contract interactions
 */

import { useCallback, useState } from 'react';
import { ethers, Contract } from 'ethers';
import { useWallet } from '@/modules/wallet/useWallet';
import { getContractConfig } from './contract-config';
import type { LicenseScene, ApiResponse } from '@/types';
import { parseErrorMessage } from '@/lib/utils';

export interface FusionAsset {
  id: string;
  name: string;
  description: string;
  creator: string;
  assetIds: string[];
  totalPrice: string;
  createdAt: number;
}

export const useECHOFusion = () => {
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
      config.addresses.ECHOFusionV2,
      config.abis.ECHOFusionV2,
      signer
    );
  }, [isConnected, chainId, getSigner]);

  const getContractReadOnly = useCallback(async () => {
    const provider = await getProvider();
    const config = getContractConfig(chainId || 11155111);
    
    return new Contract(
      config.addresses.ECHOFusionV2,
      config.abis.ECHOFusionV2,
      provider
    );
  }, [chainId, getProvider]);

  // Get fusion price
  const getFusionPrice = useCallback(async (
    assetIds: string[], 
    scene: LicenseScene
  ): Promise<ApiResponse<string>> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContractReadOnly();
      const sceneIndex = ['personal', 'commercial', 'streaming', 'film', 'gaming'].indexOf(scene);
      
      const price = await contract.getFusionPrice(assetIds, sceneIndex);
      return { success: true, data: ethers.formatEther(price) };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [getContractReadOnly]);

  // Get fusion details
  const getFusion = useCallback(async (fusionId: string): Promise<ApiResponse<FusionAsset>> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContractReadOnly();
      const assetIds = await contract.getFusionAssets(fusionId);
      const isValid = await contract.isValidFusion(fusionId);

      if (!isValid) {
        return { success: false, error: 'Fusion not found' };
      }

      // Note: In a real implementation, you'd have more fusion metadata
      const fusion: FusionAsset = {
        id: fusionId,
        name: `Fusion #${fusionId}`,
        description: '',
        creator: '', // Would need to store creator in contract
        assetIds: assetIds.map((id: ethers.BigNumberish) => id.toString()),
        totalPrice: '0',
        createdAt: 0,
      };

      return { success: true, data: fusion };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [getContractReadOnly]);

  // Create fusion
  const createFusion = useCallback(async (
    assetIds: string[],
    name: string,
    description: string
  ): Promise<ApiResponse<{ fusionId: string; txHash: string }>> => {
    if (!isConnected) {
      return { success: false, error: '请先连接钱包' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      const tx = await contract.createFusion(assetIds, name, description);
      const receipt = await tx.wait();

      // Parse fusionId from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'FusionCreated';
        } catch {
          return false;
        }
      });

      const fusionId = event ?
        contract.interface.parseLog(event)?.args?.fusionId?.toString() :
        '0';

      return {
        success: true,
        data: { fusionId, txHash: receipt.hash },
      };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getContract]);

  // Purchase fusion license
  const purchaseFusionLicense = useCallback(async (
    fusionId: string,
    scene: LicenseScene,
    duration: number
  ): Promise<ApiResponse<{ licenseId: string; txHash: string }>> => {
    if (!isConnected) {
      return { success: false, error: '请先连接钱包' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      const sceneIndex = ['personal', 'commercial', 'streaming', 'film', 'gaming'].indexOf(scene);
      
      // Get price first
      const fusion = await getFusion(fusionId);
      if (!fusion.success) {
        return { success: false, error: fusion.error };
      }

      const priceResult = await getFusionPrice(fusion.data!.assetIds, scene);
      if (!priceResult.success) {
        return { success: false, error: priceResult.error };
      }

      const priceWei = ethers.parseEther(priceResult.data!);

      const tx = await contract.purchaseFusionLicense(fusionId, sceneIndex, duration, {
        value: priceWei,
      });
      const receipt = await tx.wait();

      // Parse licenseId from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'FusionLicensePurchased';
        } catch {
          return false;
        }
      });

      const licenseId = event ?
        contract.interface.parseLog(event)?.args?.licenseId?.toString() :
        '0';

      return {
        success: true,
        data: { licenseId, txHash: receipt.hash },
      };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getContract, getFusion, getFusionPrice]);

  return {
    isLoading,
    error,
    getFusionPrice,
    getFusion,
    createFusion,
    purchaseFusionLicense,
  };
};