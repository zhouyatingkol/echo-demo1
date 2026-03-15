/**
 * useLicenseNFT Hook - LicenseNFTV3 contract interactions
 */

import { useCallback, useState } from 'react';
import { ethers, Contract } from 'ethers';
import { useWallet } from '@/modules/wallet/useWallet';
import { getContractConfig, LICENSE_TYPE_MAP, SCENE_TYPE_MAP, LICENSE_BASE_PRICES } from './contract-config';
import type { LicenseScene, LicenseTerms, LicenseConfig, ApiResponse } from '@/types';
import { parseErrorMessage } from '@/lib/utils';

export const useLicenseNFT = () => {
  const { isConnected, chainId, address, getSigner, getProvider } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback(async () => {
    if (!isConnected || !chainId) {
      throw new Error('Wallet not connected');
    }

    const config = getContractConfig(chainId);
    const signer = await getSigner();
    
    return new Contract(
      config.addresses.LicenseNFTV3,
      config.abis.LicenseNFTV3,
      signer
    );
  }, [isConnected, chainId, getSigner]);

  const getContractReadOnly = useCallback(async () => {
    const provider = await getProvider();
    const config = getContractConfig(chainId || 11155111);
    
    return new Contract(
      config.addresses.LicenseNFTV3,
      config.abis.LicenseNFTV3,
      provider
    );
  }, [chainId, getProvider]);

  // Calculate license price
  const calculatePrice = useCallback((config: LicenseConfig): string => {
    const basePrice = LICENSE_BASE_PRICES[config.type][config.scene];
    let multiplier = 1;

    switch (config.type) {
      case 'timed':
        // Price per day for timed licenses
        multiplier = config.duration || 30;
        break;
      case 'per_use':
        // Price per use
        multiplier = config.usageCount || 1;
        break;
      case 'perpetual':
      default:
        multiplier = 1;
    }

    const total = parseFloat(basePrice) * multiplier;
    return total.toString();
  }, []);

  // Get license terms
  const getLicenseTerms = useCallback(async (licenseId: string): Promise<ApiResponse<LicenseTerms>> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContractReadOnly();
      const terms = await contract.getLicenseTerms(licenseId);
      const owner = await contract.ownerOf(licenseId);

      const license: LicenseTerms = {
        licenseId,
        assetId: '', // Would need to get from event or separate mapping
        type: LICENSE_TYPE_MAP[terms.licenseType as keyof typeof LICENSE_TYPE_MAP],
        scene: SCENE_TYPE_MAP[terms.scene as keyof typeof SCENE_TYPE_MAP],
        price: '', // Would need to get from purchase event
        startTime: terms.startTime > 0 ? Number(terms.startTime) : undefined,
        endTime: terms.endTime > 0 ? Number(terms.endTime) : undefined,
        usageLimit: terms.usageLimit > 0 ? Number(terms.usageLimit) : undefined,
        usageCount: Number(terms.usageCount),
        isActive: terms.isActive,
        owner,
      };

      return { success: true, data: license };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [getContractReadOnly]);

  // Check if user has valid license
  const hasValidLicense = useCallback(async (
    user: string, 
    assetId: string, 
    scene: LicenseScene
  ): Promise<ApiResponse<boolean>> => {
    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContractReadOnly();
      const sceneIndex: number = Object.keys(SCENE_TYPE_MAP).findIndex(
        // @ts-ignore - Type comparison for enum mapping
        key => SCENE_TYPE_MAP[key as keyof typeof SCENE_TYPE_MAP] === scene
      );
      
      // @ts-ignore - Type conversion for contract call
      const hasLicense = await contract.hasValidLicense(user, assetId, sceneIndex);
      return { success: true, data: hasLicense };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [getContractReadOnly]);

  // Get user licenses
  const getUserLicenses = useCallback(async (user?: string): Promise<ApiResponse<LicenseTerms[]>> => {
    const targetUser = user || address;
    if (!targetUser) {
      return { success: false, error: 'No user address provided' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContractReadOnly();
      const licenseIds = await contract.getUserLicenses(targetUser);

      const licenses = await Promise.all(
        licenseIds.map(async (id: ethers.BigNumberish) => {
          const result = await getLicenseTerms(id.toString());
          return result.data;
        })
      );

      return {
        success: true,
        data: licenses.filter((l): l is LicenseTerms => l !== undefined),
      };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [address, getContractReadOnly, getLicenseTerms]);

  // Purchase license
  const purchaseLicense = useCallback(async (
    assetId: string,
    config: LicenseConfig
  ): Promise<ApiResponse<{ licenseId: string; txHash: string }>> => {
    if (!isConnected) {
      return { success: false, error: '请先连接钱包' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      const price = calculatePrice(config);
      const priceWei = ethers.parseEther(price);

      // Generate fingerprint (simplified)
      const fingerprint = ethers.keccak256(
        ethers.toUtf8Bytes(`${assetId}-${address}-${Date.now()}`)
      );

      const typeIndex: number = Object.keys(LICENSE_TYPE_MAP).findIndex(
        // @ts-ignore - Type comparison for enum mapping
        key => LICENSE_TYPE_MAP[key as keyof typeof LICENSE_TYPE_MAP] === config.type
      );
      const sceneIndex: number = Object.keys(SCENE_TYPE_MAP).findIndex(
        // @ts-ignore - Type comparison for enum mapping
        key => SCENE_TYPE_MAP[key as keyof typeof SCENE_TYPE_MAP] === config.scene
      );

      // @ts-ignore - Type conversion for contract call
      const tx = await contract.mintLicense(
        assetId,
        typeIndex,
        sceneIndex,
        config.duration || 0,
        config.usageCount || 0,
        fingerprint,
        { value: priceWei }
      );

      const receipt = await tx.wait();

      // Parse licenseId from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'LicenseMinted';
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
  }, [isConnected, address, getContract, calculatePrice]);

  // Record license usage
  const recordUsage = useCallback(async (licenseId: string): Promise<ApiResponse<void>> => {
    if (!isConnected) {
      return { success: false, error: '请先连接钱包' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = await getContract();
      const tx = await contract.recordUsage(licenseId);
      await tx.wait();

      return { success: true };
    } catch (err) {
      const msg = parseErrorMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, getContract]);

  return {
    isLoading,
    error,
    calculatePrice,
    getLicenseTerms,
    hasValidLicense,
    getUserLicenses,
    purchaseLicense,
    recordUsage,
  };
};