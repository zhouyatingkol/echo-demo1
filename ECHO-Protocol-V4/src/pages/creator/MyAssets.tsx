/**
 * MyAssets Page - Creator's asset management
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { MusicAsset } from '@/types';
import { formatPrice, formatDuration, formatDate, cn } from '@/lib/utils';
import { 
  Search, 
  Edit2, 
  BarChart3, 
  ExternalLink,
  Plus
} from 'lucide-react';

// Mock creator assets
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
    id: '2', tokenId: '2', title: 'Midnight Jazz', artist: 'CyberWave',
    description: 'Relaxing jazz track', coverImage: '', audioUrl: '',
    duration: 312, genre: 'Jazz', mood: 'Relaxed', bpm: 90,
    createdAt: Date.now() / 1000 - 86400 * 14,
    price: '0.08', currency: 'ETH', owner: '0x1234...5678',
    creator: '0xabcd...efgh', totalLicenses: 8, isVerified: true,
  },
  {
    id: '3', tokenId: '5', title: 'Lo-Fi Study', artist: 'CyberWave',
    description: 'Calm lo-fi beats', coverImage: '', audioUrl: '',
    duration: 180, genre: 'Lo-Fi', mood: 'Calm', bpm: 80,
    createdAt: Date.now() / 1000 - 86400 * 21,
    price: '0.02', currency: 'ETH', owner: '0x1234...5678',
    creator: '0xabcd...efgh', totalLicenses: 67, isVerified: true,
  },
];

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'verified', label: '已验证' },
  { value: 'pending', label: '审核中' },
];

const sortOptions = [
  { value: 'newest', label: '最新上传' },
  { value: 'oldest', label: '最早上传' },
  { value: 'price_high', label: '价格: 高到低' },
  { value: 'price_low', label: '价格: 低到高' },
  { value: 'popular', label: '最受欢迎' },
];

export const MyAssets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && asset.isVerified) ||
                         (statusFilter === 'pending' && !asset.isVerified);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">我的作品</h1>
          <p className="text-muted-foreground">管理你上传的音乐资产</p>
        </div>
        <Link to="/creator/upload">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            上传新作品
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索作品..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />
            <Select
              value={sortBy}
              options={sortOptions}
              onChange={setSortBy}
            />
          </div>
        </div>
      </Card>

      {/* Assets List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-sm">作品</th>
                <th className="text-left py-3 px-4 font-medium text-sm">类型</th>
                <th className="text-left py-3 px-4 font-medium text-sm">价格</th>
                <th className="text-left py-3 px-4 font-medium text-sm">授权</th>
                <th className="text-left py-3 px-4 font-medium text-sm">上传时间</th>
                <th className="text-left py-3 px-4 font-medium text-sm">状态</th>
                <th className="text-left py-3 px-4 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-muted/30">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">{asset.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(asset.duration)} · {asset.mood}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs">
                      {asset.genre}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium">{formatPrice(asset.price)}</td>
                  <td className="py-4 px-4">{asset.totalLicenses}</td>
                  <td className="py-4 px-4 text-muted-foreground">{formatDate(asset.createdAt)}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs',
                      asset.isVerified
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    )}>
                      {asset.isVerified ? '已验证' : '审核中'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/asset/${asset.tokenId}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">未找到作品</h3>
            <p className="text-muted-foreground">尝试调整搜索条件</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyAssets;