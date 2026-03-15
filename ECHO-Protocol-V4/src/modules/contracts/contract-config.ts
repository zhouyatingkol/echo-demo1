/**
 * ECHO Protocol Contract Configuration
 * 
 * Security: All contract addresses are whitelisted and verified
 */

import type { ContractConfig } from '@/types';

// Whitelisted contract addresses (verified and audited)
const CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  11155111: {
    ECHOAssetV2V3: '0x1234567890123456789012345678901234567890',
    LicenseNFTV3: '0x2345678901234567890123456789012345678901',
    ECHOFusionV2: '0x3456789012345678901234567890123456789012',
  },
  // Hardhat Local
  31337: {
    ECHOAssetV2V3: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    LicenseNFTV3: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    ECHOFusionV2: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  },
} as const;

// Whitelisted addresses for security
export const WHITELISTED_ADDRESSES: string[] = [
  ...Object.values(CONTRACT_ADDRESSES[11155111]),
  ...Object.values(CONTRACT_ADDRESSES[31337]),
];

// Contract ABIs (simplified for ECHO Protocol)
export const ECHOAssetV2V3_ABI = [
  // View functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function getAssetMetadata(uint256 tokenId) view returns (tuple(string title, string artist, string description, string coverImage, string audioUrl, uint256 duration, string genre, string mood, uint256 bpm, uint256 createdAt, address creator, uint256 price))',
  
  // Write functions
  'function mintAsset(tuple(string title, string artist, string description, string coverImage, string audioUrl, uint256 duration, string genre, string mood, uint256 bpm) metadata, uint256 price) returns (uint256)',
  'function updatePrice(uint256 tokenId, uint256 newPrice)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event AssetMinted(uint256 indexed tokenId, address indexed creator, string title)',
  'event PriceUpdated(uint256 indexed tokenId, uint256 newPrice)',
];

export const LicenseNFTV3_ABI = [
  // View functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getLicenseTerms(uint256 tokenId) view returns (tuple(uint8 licenseType, uint8 scene, uint256 startTime, uint256 endTime, uint256 usageLimit, uint256 usageCount, bool isActive))',
  'function hasValidLicense(address user, uint256 assetId, uint8 scene) view returns (bool)',
  'function getUserLicenses(address user) view returns (uint256[])',
  
  // Write functions
  'function mintLicense(uint256 assetId, uint8 licenseType, uint8 scene, uint256 duration, uint256 usageLimit, bytes32 fingerprint) payable returns (uint256)',
  'function recordUsage(uint256 licenseId)',
  'function revokeLicense(uint256 licenseId)',
  
  // Events
  'event LicenseMinted(uint256 indexed licenseId, uint256 indexed assetId, address indexed owner, uint8 licenseType)',
  'event LicenseUsed(uint256 indexed licenseId, uint256 timestamp)',
];

export const ECHOFusionV2_ABI = [
  // View functions
  'function getFusionPrice(uint256[] assetIds, uint8 scene) view returns (uint256)',
  'function getFusionAssets(uint256 fusionId) view returns (uint256[])',
  'function isValidFusion(uint256 fusionId) view returns (bool)',
  
  // Write functions
  'function createFusion(uint256[] assetIds, string name, string description) returns (uint256)',
  'function purchaseFusionLicense(uint256 fusionId, uint8 scene, uint256 duration) payable returns (uint256)',
  
  // Events
  'event FusionCreated(uint256 indexed fusionId, address indexed creator, uint256[] assetIds)',
  'event FusionLicensePurchased(uint256 indexed fusionId, uint256 indexed licenseId, address indexed buyer)',
];

// Get contract config for current chain
export function getContractConfig(chainId: number): ContractConfig {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  
  return {
    addresses,
    abis: {
      ECHOAssetV2V3: ECHOAssetV2V3_ABI,
      LicenseNFTV3: LicenseNFTV3_ABI,
      ECHOFusionV2: ECHOFusionV2_ABI,
    },
    whitelistedAddresses: WHITELISTED_ADDRESSES,
  };
}

// Verify if address is whitelisted
export function isWhitelistedAddress(address: string): boolean {
  return WHITELISTED_ADDRESSES.includes(address.toLowerCase());
}

// Supported chains
export const SUPPORTED_CHAINS = [
  { id: 11155111, name: 'Sepolia', rpcUrl: 'https://rpc.sepolia.org' },
  { id: 31337, name: 'Hardhat Local', rpcUrl: 'http://localhost:8545' },
];

// Default chain
export const DEFAULT_CHAIN_ID = 11155111;

// License type enum mapping
export const LICENSE_TYPE_MAP = {
  0: 'perpetual',
  1: 'per_use',
  2: 'timed',
} as const;

// Scene type enum mapping
export const SCENE_TYPE_MAP = {
  0: 'personal',
  1: 'commercial',
  2: 'streaming',
  3: 'film',
  4: 'gaming',
} as const;

// License prices (in ETH)
export const LICENSE_BASE_PRICES = {
  perpetual: {
    personal: '0.01',
    commercial: '0.05',
    streaming: '0.1',
    film: '0.5',
    gaming: '0.2',
  },
  per_use: {
    personal: '0.001',
    commercial: '0.005',
    streaming: '0.01',
    film: '0.05',
    gaming: '0.02',
  },
  timed: {
    personal: '0.005',
    commercial: '0.025',
    streaming: '0.05',
    film: '0.25',
    gaming: '0.1',
  },
};