/**
 * ECHO Protocol V4 - Type Definitions
 */

// Wallet Types
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  balance: string;
  error: string | null;
}

export interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

// Asset Types
export interface MusicAsset {
  id: string;
  tokenId: string;
  title: string;
  artist: string;
  description: string;
  coverImage: string;
  audioUrl: string;
  duration: number;
  genre: string;
  mood: string;
  bpm: number;
  createdAt: number;
  price: string;
  currency: string;
  owner: string;
  creator: string;
  totalLicenses: number;
  isVerified: boolean;
}

export interface AssetFilters {
  genre?: string;
  mood?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

// License Types
export type LicenseType = 'perpetual' | 'per_use' | 'timed';
export type LicenseScene = 'personal' | 'commercial' | 'streaming' | 'film' | 'gaming';

export interface LicenseConfig {
  type: LicenseType;
  scene: LicenseScene;
  duration?: number; // days for timed license
  usageCount?: number; // for per_use license
}

export interface LicenseTerms {
  licenseId: string;
  assetId: string;
  type: LicenseType;
  scene: LicenseScene;
  price: string;
  startTime?: number;
  endTime?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  owner: string;
}

// Contract Types
export interface ContractConfig {
  addresses: {
    ECHOAssetV2V3: string;
    LicenseNFTV3: string;
    ECHOFusionV2: string;
  };
  abis: {
    ECHOAssetV2V3: any[];
    LicenseNFTV3: any[];
    ECHOFusionV2: any[];
  };
  whitelistedAddresses: string[];
}

// UI Types
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ToastType {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Creator Types
export interface CreatorStats {
  totalAssets: number;
  totalLicenses: number;
  totalRevenue: string;
  monthlyRevenue: string;
}

export interface RevenueRecord {
  id: string;
  assetId: string;
  assetTitle: string;
  licenseType: LicenseType;
  amount: string;
  timestamp: number;
  buyer: string;
}

// User Types
export interface UserProfile {
  address: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  isCreator: boolean;
  joinedAt: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}