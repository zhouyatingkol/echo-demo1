/**
 * AssetDetail Page - Music asset details and audio player
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import type { MusicAsset } from '@/types';
import { 
  formatDuration, 
  formatPrice, 
  formatAddress, 
  formatDate,
  formatRelativeTime,
  cn 
} from '@/lib/utils';
import { 
  Clock, 
  User, 
  Heart, 
  Share2, 
  Shield,
  Calendar,
  Activity,
  ShoppingCart,
  ArrowLeft
} from 'lucide-react';

// Mock asset data
const mockAsset: MusicAsset = {
  id: '1',
  tokenId: '1',
  title: 'Neon Dreams',
  artist: 'CyberWave',
  description: 'Electronic ambient track with synth wave vibes. Perfect for gaming videos, tech reviews, and futuristic content. Features layered synthesizers, driving basslines, and atmospheric pads that create an immersive sonic experience.',
  coverImage: '',
  audioUrl: 'https://example.com/audio.mp3',
  duration: 245,
  genre: 'Electronic',
  mood: 'Energetic',
  bpm: 128,
  createdAt: Date.now() / 1000 - 86400 * 7,
  price: '0.05',
  currency: 'ETH',
  owner: '0x1234567890123456789012345678901234567890',
  creator: '0xabcd567890123456789012345678901234567890',
  totalLicenses: 12,
  isVerified: true,
};

// Mock license history
const licenseHistory = [
  { type: 'Commercial', buyer: '0x1111...2222', price: '0.05', date: Date.now() / 1000 - 86400 * 2 },
  { type: 'Streaming', buyer: '0x3333...4444', price: '0.1', date: Date.now() / 1000 - 86400 * 3 },
  { type: 'Personal', buyer: '0x5555...6666', price: '0.01', date: Date.now() / 1000 - 86400 * 5 },
];

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [asset] = useState<MusicAsset>(mockAsset);

  // In real app, fetch asset by id
  console.log('Asset ID:', id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Link to="/marketplace">
        <Button variant="ghost" className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回市场
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Media */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <AudioPlayer
            src={asset.audioUrl}
            title={asset.title}
            artist={asset.artist}
            coverImage={asset.coverImage}
          />

          {/* Description */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">作品描述</h3>
            <p className="text-muted-foreground leading-relaxed">{asset.description}</p>
          </Card>

          {/* License History */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">授权记录</h3>
            <div className="space-y-3">
              {licenseHistory.map((license, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium">{license.type} License</div>
                      <div className="text-sm text-muted-foreground">
                        {formatAddress(license.buyer)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(license.price)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatRelativeTime(license.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Asset Info Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{asset.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground">by</span>
                  <span className="font-medium">{asset.artist}</span>
                  {asset.isVerified && (
                    <Shield className="w-4 h-4 text-primary-500 fill-primary-500" />
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Heart 
                    className={cn('w-5 h-5', isLiked && 'fill-red-500 text-red-500')} 
                  />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm">
                {asset.genre}
              </span>
              <span className="px-3 py-1 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm">
                {asset.mood}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>时长: {formatDuration(asset.duration)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4" />
                <span>BPM: {asset.bpm}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>发布: {formatDate(asset.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>创作者: {formatAddress(asset.creator)}</span>
              </div>
            </div>
          </Card>

          {/* Price Card */}
          <Card className="p-6 bg-gradient-to-br from-primary-500 to-accent-500 text-white">
            <div className="text-sm opacity-80 mb-1">当前底价</div>
            <div className="text-3xl font-bold mb-4">{formatPrice(asset.price)}</div>
            
            <Link to={`/license/${asset.tokenId}`}>
              <Button 
                size="lg" 
                className="w-full gap-2 bg-white text-primary-600 hover:bg-white/90"
              >
                <ShoppingCart className="w-5 h-5" />
                购买授权
              </Button>
            </Link>

            <div className="mt-4 pt-4 border-t border-white/20 text-sm opacity-80">
              <div className="flex justify-between">
                <span>已授权次数</span>
                <span>{asset.totalLicenses}</span>
              </div>
            </div>
          </Card>

          {/* Creator Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">关于创作者</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                {asset.artist.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{asset.artist}</div>
                <div className="text-sm text-muted-foreground">
                  {formatAddress(asset.creator)}
                </div>
              </div>
            </div>

            <Button variant="secondary" className="w-full mt-4">
              查看创作者主页
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;