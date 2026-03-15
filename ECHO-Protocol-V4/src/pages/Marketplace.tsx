/**
 * Marketplace Page - Browse and filter music assets
 */

import React, { useState, useMemo } from 'react';
import { AssetCard } from '@/components/shared/AssetCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { MusicAsset, AssetFilters } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';

// Mock data for marketplace
const mockAssets: MusicAsset[] = [
  {
    id: '1', tokenId: '1', title: 'Neon Dreams', artist: 'CyberWave',
    description: 'Electronic ambient track', coverImage: '', audioUrl: '',
    duration: 245, genre: 'Electronic', mood: 'Energetic', bpm: 128,
    createdAt: Date.now() / 1000 - 86400 * 7,
    price: '0.05', currency: 'ETH', owner: '0x1234...5678',
    creator: '0xabcd...efgh', totalLicenses: 12, isVerified: true,
  },
  {
    id: '2', tokenId: '2', title: 'Midnight Jazz', artist: 'SmoothOperator',
    description: 'Relaxing jazz track', coverImage: '', audioUrl: '',
    duration: 312, genre: 'Jazz', mood: 'Relaxed', bpm: 90,
    createdAt: Date.now() / 1000 - 86400 * 3,
    price: '0.08', currency: 'ETH', owner: '0x5678...9012',
    creator: '0xijkl...mnop', totalLicenses: 8, isVerified: true,
  },
  {
    id: '3', tokenId: '3', title: 'Epic Orchestra', artist: 'SymphonyX',
    description: 'Grand orchestral composition', coverImage: '', audioUrl: '',
    duration: 425, genre: 'Classical', mood: 'Dramatic', bpm: 110,
    createdAt: Date.now() / 1000 - 86400 * 1,
    price: '0.15', currency: 'ETH', owner: '0x9012...3456',
    creator: '0xqrst...uvwx', totalLicenses: 25, isVerified: true,
  },
  {
    id: '4', tokenId: '4', title: 'Urban Beats', artist: 'StreetFlow',
    description: 'Hip-hop beats', coverImage: '', audioUrl: '',
    duration: 198, genre: 'Hip-Hop', mood: 'Confident', bpm: 140,
    createdAt: Date.now() / 1000 - 86400 * 5,
    price: '0.03', currency: 'ETH', owner: '0x3456...7890',
    creator: '0xyzab...cdef', totalLicenses: 45, isVerified: false,
  },
  {
    id: '5', tokenId: '5', title: 'Lo-Fi Study', artist: 'ChillVibes',
    description: 'Calm lo-fi beats', coverImage: '', audioUrl: '',
    duration: 180, genre: 'Lo-Fi', mood: 'Calm', bpm: 80,
    createdAt: Date.now() / 1000 - 86400 * 2,
    price: '0.02', currency: 'ETH', owner: '0x7890...1234',
    creator: '0xghij...klmn', totalLicenses: 67, isVerified: true,
  },
  {
    id: '6', tokenId: '6', title: 'Rock Anthem', artist: 'PowerChord',
    description: 'High energy rock track', coverImage: '', audioUrl: '',
    duration: 240, genre: 'Rock', mood: 'Energetic', bpm: 135,
    createdAt: Date.now() / 1000 - 86400 * 4,
    price: '0.06', currency: 'ETH', owner: '0x2468...1357',
    creator: '0xopqr...stuv', totalLicenses: 23, isVerified: false,
  },
  {
    id: '7', tokenId: '7', title: 'Ambient Space', artist: 'CosmicSound',
    description: 'Space ambient music', coverImage: '', audioUrl: '',
    duration: 600, genre: 'Ambient', mood: 'Mysterious', bpm: 60,
    createdAt: Date.now() / 1000 - 86400 * 6,
    price: '0.04', currency: 'ETH', owner: '0x1357...2468',
    creator: '0xwxyz...abcd', totalLicenses: 15, isVerified: true,
  },
  {
    id: '8', tokenId: '8', title: 'Pop Hit', artist: 'StarMaker',
    description: 'Catchy pop song', coverImage: '', audioUrl: '',
    duration: 210, genre: 'Pop', mood: 'Happy', bpm: 120,
    createdAt: Date.now() / 1000 - 86400,
    price: '0.1', currency: 'ETH', owner: '0x1111...2222',
    creator: '0x3333...4444', totalLicenses: 89, isVerified: true,
  },
];

const genreOptions = [
  { value: '', label: '全部类型' },
  { value: 'Electronic', label: 'Electronic' },
  { value: 'Jazz', label: 'Jazz' },
  { value: 'Classical', label: 'Classical' },
  { value: 'Hip-Hop', label: 'Hip-Hop' },
  { value: 'Lo-Fi', label: 'Lo-Fi' },
  { value: 'Rock', label: 'Rock' },
  { value: 'Ambient', label: 'Ambient' },
  { value: 'Pop', label: 'Pop' },
];

const moodOptions = [
  { value: '', label: '全部情绪' },
  { value: 'Energetic', label: 'Energetic' },
  { value: 'Relaxed', label: 'Relaxed' },
  { value: 'Dramatic', label: 'Dramatic' },
  { value: 'Confident', label: 'Confident' },
  { value: 'Calm', label: 'Calm' },
  { value: 'Mysterious', label: 'Mysterious' },
  { value: 'Happy', label: 'Happy' },
];

const sortOptions = [
  { value: 'newest', label: '最新上架' },
  { value: 'price_asc', label: '价格: 低到高' },
  { value: 'price_desc', label: '价格: 高到低' },
  { value: 'popular', label: '最受欢迎' },
];

export const Marketplace: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AssetFilters>({
    genre: '',
    mood: '',
    sortBy: 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = [...mockAssets];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        asset =>
          asset.title.toLowerCase().includes(query) ||
          asset.artist.toLowerCase().includes(query) ||
          asset.description.toLowerCase().includes(query)
      );
    }

    // Genre filter
    if (filters.genre) {
      result = result.filter(asset => asset.genre === filters.genre);
    }

    // Mood filter
    if (filters.mood) {
      result = result.filter(asset => asset.mood === filters.mood);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'popular':
        result.sort((a, b) => b.totalLicenses - a.totalLicenses);
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return result;
  }, [searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const hasActiveFilters = filters.genre || filters.mood || searchQuery;

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ genre: '', mood: '', sortBy: 'newest' });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">音乐市场</h1>
        <p className="text-muted-foreground">探索和发现优质音乐 ECHO 资产</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="搜索音乐、艺术家..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={filters.sortBy}
            options={sortOptions}
            onChange={(value) => setFilters(prev => ({ ...prev, sortBy: value as any }))}
          />

          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            筛选
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2">
              <X className="w-4 h-4" />
              清除
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="音乐类型"
              value={filters.genre}
              options={genreOptions}
              onChange={(value) => {
                setFilters(prev => ({ ...prev, genre: value }));
                setCurrentPage(1);
              }}
            />
            <Select
              label="情绪氛围"
              value={filters.mood}
              options={moodOptions}
              onChange={(value) => {
                setFilters(prev => ({ ...prev, mood: value }));
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted-foreground">
          共 {filteredAssets.length} 个结果
        </span>
      </div>

      {/* Asset Grid */}
      {paginatedAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedAssets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">未找到结果</h3>
          <p className="text-muted-foreground">请尝试调整搜索条件</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;