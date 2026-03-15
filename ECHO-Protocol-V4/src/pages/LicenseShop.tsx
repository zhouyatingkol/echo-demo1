/**
 * LicenseShop Page - Purchase licenses with three modes
 */

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useToastHelpers } from '@/components/ui/Toast';
import type { LicenseType, LicenseScene } from '@/types';
import { LICENSE_BASE_PRICES } from '@/modules/contracts/contract-config';
import { formatPrice, cn } from '@/lib/utils';
import { 
  Check, 
  ShoppingCart, 
  Infinity, 
  Clock, 
  Hash,
  ArrowLeft,
  Shield,
  Music
} from 'lucide-react';

const licenseTypes: { type: LicenseType; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    type: 'perpetual', 
    label: '买断授权', 
    icon: <Infinity className="w-5 h-5" />,
    description: '永久使用，一次购买终身有效'
  },
  { 
    type: 'timed', 
    label: '限时授权', 
    icon: <Clock className="w-5 h-5" />,
    description: '按天计费，灵活选择使用期限'
  },
  { 
    type: 'per_use', 
    label: '按次授权', 
    icon: <Hash className="w-5 h-5" />,
    description: '按使用次数付费，适合特定项目'
  },
];

const sceneOptions = [
  { value: 'personal', label: '个人使用', description: '个人视频、博客等非商业用途' },
  { value: 'commercial', label: '商业用途', description: '广告、产品展示等商业内容' },
  { value: 'streaming', label: '直播/流媒体', description: '直播平台背景音乐、播客' },
  { value: 'film', label: '影视制作', description: '电影、电视剧、纪录片等' },
  { value: 'gaming', label: '游戏开发', description: '游戏背景音乐、音效' },
];

// Mock asset data
const mockAsset = {
  id: '1',
  tokenId: '1',
  title: 'Neon Dreams',
  artist: 'CyberWave',
  coverImage: '',
  price: '0.05',
};

export const LicenseShop: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToastHelpers();
  
  const [selectedType, setSelectedType] = useState<LicenseType>('perpetual');
  const [selectedScene, setSelectedScene] = useState<LicenseScene>('personal');
  const [duration, setDuration] = useState(30);
  const [usageCount, setUsageCount] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Calculate price
  const calculatedPrice = useMemo(() => {
    const basePrice = LICENSE_BASE_PRICES[selectedType][selectedScene];
    
    switch (selectedType) {
      case 'timed':
        return (parseFloat(basePrice) * duration).toString();
      case 'per_use':
        return (parseFloat(basePrice) * usageCount).toString();
      case 'perpetual':
      default:
        return basePrice;
    }
  }, [selectedType, selectedScene, duration, usageCount]);

  const handlePurchase = async () => {
    setIsConfirmOpen(false);
    setIsPurchasing(true);

    try {
      // Simulate purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      success('购买成功', 'License ECHO 已发放到您的钱包');
    } catch (err) {
      error('购买失败', '请检查余额并重试');
    } finally {
      setIsPurchasing(false);
    }
  };

  const getLicenseDetails = () => {
    switch (selectedType) {
      case 'timed':
        return `${duration} 天使用期限`;
      case 'per_use':
        return `${usageCount} 次使用额度`;
      case 'perpetual':
        return '永久使用权限';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link to={`/asset/${id}`}>
        <Button variant="ghost" className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回作品详情
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* License Type Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">选择授权类型</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {licenseTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    selectedType === type.type
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-border hover:border-primary-200 dark:hover:border-primary-800'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                    selectedType === type.type
                      ? 'bg-primary-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {type.icon}
                  </div>
                  <div className="font-medium mb-1">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Scene Selection */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">选择使用场景</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {sceneOptions.map((scene) => (
                <button
                  key={scene.value}
                  onClick={() => setSelectedScene(scene.value as LicenseScene)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    selectedScene === scene.value
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                      : 'border-border hover:border-accent-200 dark:hover:border-accent-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      selectedScene === scene.value
                        ? 'border-accent-500 bg-accent-500'
                        : 'border-muted'
                    )}>
                      {selectedScene === scene.value && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="font-medium">{scene.label}</div>
                      <div className="text-sm text-muted-foreground">{scene.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Additional Options */}
          {selectedType === 'timed' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">使用期限</h2>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  className="w-32"
                />
                <span className="text-muted-foreground">天</span>
              </div>
              <input
                type="range"
                min={1}
                max={365}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full mt-4 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </Card>
          )}

          {selectedType === 'per_use' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">使用次数</h2>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={usageCount}
                  onChange={(e) => setUsageCount(parseInt(e.target.value) || 1)}
                  className="w-32"
                />
                <span className="text-muted-foreground">次</span>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Asset Preview */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="font-semibold">{mockAsset.title}</div>
                <div className="text-sm text-muted-foreground">{mockAsset.artist}</div>
              </div>
            </div>
          </Card>

          {/* Price Summary */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">订单摘要</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">授权类型</span>
                <span>{licenseTypes.find(t => t.type === selectedType)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">使用场景</span>
                <span>{sceneOptions.find(s => s.value === selectedScene)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">授权详情</span>
                <span>{getLicenseDetails()}</span>
              </div>
            </div>

            <div className="border-t border-border my-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">总价</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(calculatedPrice)}
                </span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={() => setIsConfirmOpen(true)}
              disabled={isPurchasing}
            >
              <ShoppingCart className="w-5 h-5" />
              确认购买
            </Button>

            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              交易由智能合约保障，资金直接进入创作者钱包
            </div>
          </Card>

          {/* License Benefits */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">授权权益</h3>
            <ul className="space-y-2 text-sm">
              {[
                '区块链确权证书',
                '商用授权保障',
                '全球范围有效',
                '可追溯使用记录',
                'ECHO 形式永久保存',
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handlePurchase}
        title="确认购买授权"
        description={`您将以 ${formatPrice(calculatedPrice)} 的价格购买 ${mockAsset.title} 的 ${licenseTypes.find(t => t.type === selectedType)?.label}，使用场景为 ${sceneOptions.find(s => s.value === selectedScene)?.label}。`}
        confirmText="确认支付"
        isLoading={isPurchasing}
      />
    </div>
  );
};

export default LicenseShop;