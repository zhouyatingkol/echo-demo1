/**
 * User MyAssets Page - User's purchased licenses
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { LicenseTerms } from '@/types';
import { formatPrice, formatDate, formatAddress, cn } from '@/lib/utils';
import { 
  Search, 
  Play,
  Clock,
  Hash,
  Infinity,
  ExternalLink
} from 'lucide-react';

interface UserLicense extends LicenseTerms {
  assetTitle: string;
  coverImage: string;
}

const mockLicenses: UserLicense[] = [
  {
    licenseId: '101',
    assetId: '1',
    type: 'perpetual',
    scene: 'commercial',
    price: '0.05',
    isActive: true,
    owner: '0x1234...5678',
    usageCount: 5,
    assetTitle: 'Neon Dreams',
    coverImage: '',
  },
  {
    licenseId: '102',
    assetId: '2',
    type: 'timed',
    scene: 'streaming',
    price: '0.1',
    startTime: Date.now() / 1000 - 86400 * 10,
    endTime: Date.now() / 1000 + 86400 * 20,
    isActive: true,
    owner: '0x1234...5678',
    usageCount: 0,
    assetTitle: 'Midnight Jazz',
    coverImage: '',
  },
  {
    licenseId: '103',
    assetId: '3',
    type: 'per_use',
    scene: 'film',
    price: '0.5',
    usageLimit: 3,
    isActive: true,
    owner: '0x1234...5678',
    usageCount: 1,
    assetTitle: 'Epic Orchestra',
    coverImage: '',
  },
];

const typeOptions = [
  { value: 'all', label: '全部类型' },
  { value: 'perpetual', label: '买断' },
  { value: 'timed', label: '限时' },
  { value: 'per_use', label: '按次' },
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '有效' },
  { value: 'expired', label: '已过期' },
];

const getLicenseIcon = (type: string) => {
  switch (type) {
    case 'perpetual':
      return <Infinity className="w-4 h-4" />;
    case 'timed':
      return <Clock className="w-4 h-4" />;
    case 'per_use':
      return <Hash className="w-4 h-4" />;
    default:
      return null;
  }
};

const getLicenseLabel = (type: string) => {
  switch (type) {
    case 'perpetual':
      return '买断';
    case 'timed':
      return '限时';
    case 'per_use':
      return '按次';
    default:
      return type;
  }
};

const getSceneLabel = (scene: string) => {
  const labels: Record<string, string> = {
    personal: '个人',
    commercial: '商业',
    streaming: '流媒体',
    film: '影视',
    gaming: '游戏',
  };
  return labels[scene] || scene;
};

export const UserMyAssets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLicenses = mockLicenses.filter(license => {
    const matchesSearch = license.assetTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || license.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && license.isActive) ||
                         (statusFilter === 'expired' && !license.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const isExpiringSoon = (license: LicenseTerms) => {
    if (license.type !== 'timed' || !license.endTime) return false;
    const daysUntilExpiry = (license.endTime - Date.now() / 1000) / 86400;
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">我的资产</h1>
        <p className="text-muted-foreground">管理你购买的音乐授权</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{mockLicenses.length}</div>
          <div className="text-sm text-muted-foreground">持有授权</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{mockLicenses.filter(l => l.isActive).length}</div>
          <div className="text-sm text-muted-foreground">有效授权</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">
            {mockLicenses.filter(l => isExpiringSoon(l)).length}
          </div>
          <div className="text-sm text-muted-foreground">即将过期</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索授权..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={typeFilter}
              options={typeOptions}
              onChange={setTypeFilter}
            />
            <Select
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />
          </div>
        </div>
      </Card>

      {/* Licenses List */}
      <div className="space-y-4">
        {filteredLicenses.map((license) => (
          <Card key={license.licenseId} className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Cover */}
              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/asset/${license.assetId}`}>
                      <h3 className="text-lg font-semibold hover:text-primary-600 transition-colors">
                        {license.assetTitle}
                      </h3>
                    </Link>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs">
                        {getLicenseIcon(license.type)}
                        {getLicenseLabel(license.type)}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-xs">
                        {getSceneLabel(license.scene)}
                      </span>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs',
                        license.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      )}>
                        {license.isActive ? '有效' : '已过期'}
                      </span>
                      {isExpiringSoon(license) && (
                        <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs">
                          即将过期
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold">{formatPrice(license.price)}</div>
                    <div className="text-sm text-muted-foreground">购买价格</div>
                  </div>
                </div>

                {/* License Details */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">授权ID</div>
                      <div className="font-medium">#{license.licenseId}</div>
                    </div>
                    
                    {license.endTime && (
                      <div>
                        <div className="text-muted-foreground">到期时间</div>
                        <div className={cn(
                          'font-medium',
                          isExpiringSoon(license) && 'text-yellow-600'
                        )}>
                          {formatDate(license.endTime)}
                        </div>
                      </div>
                    )}
                    
                    {license.usageLimit && (
                      <div>
                        <div className="text-muted-foreground">使用次数</div>
                        <div className="font-medium">
                          {license.usageCount} / {license.usageLimit}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-muted-foreground">持有者</div>
                      <div className="font-medium">{formatAddress(license.owner)}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Play className="w-4 h-4" />
                    试听
                  </Button>
                  
                  <Link to={`/asset/${license.assetId}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      查看详情
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredLicenses.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">未找到授权</h3>
          <p className="text-muted-foreground">
            <Link to="/marketplace" className="text-primary-600 hover:underline">
              去市场购买
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default UserMyAssets;