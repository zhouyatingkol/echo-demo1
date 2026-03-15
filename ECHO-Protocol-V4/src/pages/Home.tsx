/**
 * Home Page - Landing page with hero, stats, and featured assets
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AssetCard } from '@/components/shared/AssetCard';
import { 
  Music, 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight,
  Disc,
  Users,
  Headphones
} from 'lucide-react';

// Mock data for featured assets
const featuredAssets = [
  {
    id: '1',
    tokenId: '1',
    title: 'Neon Dreams',
    artist: 'CyberWave',
    description: 'Electronic ambient track with synth wave vibes',
    coverImage: '',
    audioUrl: '',
    duration: 245,
    genre: 'Electronic',
    mood: 'Energetic',
    bpm: 128,
    createdAt: Date.now() / 1000 - 86400 * 7,
    price: '0.05',
    currency: 'ETH',
    owner: '0x1234...5678',
    creator: '0xabcd...efgh',
    totalLicenses: 12,
    isVerified: true,
  },
  {
    id: '2',
    tokenId: '2',
    title: 'Midnight Jazz',
    artist: 'SmoothOperator',
    description: 'Relaxing jazz track for late night sessions',
    coverImage: '',
    audioUrl: '',
    duration: 312,
    genre: 'Jazz',
    mood: 'Relaxed',
    bpm: 90,
    createdAt: Date.now() / 1000 - 86400 * 3,
    price: '0.08',
    currency: 'ETH',
    owner: '0x5678...9012',
    creator: '0xijkl...mnop',
    totalLicenses: 8,
    isVerified: true,
  },
  {
    id: '3',
    tokenId: '3',
    title: 'Epic Orchestra',
    artist: 'SymphonyX',
    description: 'Grand orchestral composition for cinematic moments',
    coverImage: '',
    audioUrl: '',
    duration: 425,
    genre: 'Classical',
    mood: 'Dramatic',
    bpm: 110,
    createdAt: Date.now() / 1000 - 86400 * 1,
    price: '0.15',
    currency: 'ETH',
    owner: '0x9012...3456',
    creator: '0xqrst...uvwx',
    totalLicenses: 25,
    isVerified: true,
  },
  {
    id: '4',
    tokenId: '4',
    title: 'Urban Beats',
    artist: 'StreetFlow',
    description: 'Hip-hop beats with modern trap influences',
    coverImage: '',
    audioUrl: '',
    duration: 198,
    genre: 'Hip-Hop',
    mood: 'Confident',
    bpm: 140,
    createdAt: Date.now() / 1000 - 86400 * 5,
    price: '0.03',
    currency: 'ETH',
    owner: '0x3456...7890',
    creator: '0xyzab...cdef',
    totalLicenses: 45,
    isVerified: false,
  },
];

const stats = [
  { icon: Disc, label: '音乐作品', value: '12.5K+' },
  { icon: Users, label: '创作者', value: '2.3K+' },
  { icon: Headphones, label: '授权销售', value: '45K+' },
  { icon: Shield, label: '安全交易', value: '99.9%' },
];

const features = [
  {
    icon: Shield,
    title: '区块链确权',
    description: '每件音乐作品都是独一无二的ECHO资产，确保原创性和所有权清晰可追溯',
  },
  {
    icon: Zap,
    title: '灵活授权',
    description: '支持买断、按次、限时等多种授权模式，满足不同使用场景需求',
  },
  {
    icon: Globe,
    title: '全球流通',
    description: '去中心化市场让音乐作品可以在全球范围内自由交易和流通',
  },
  {
    icon: Music,
    title: '创作激励',
    description: '创作者直接获得收益，智能合约自动分配版税，无需中间商',
  },
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-950/30 dark:via-dark-950 dark:to-accent-950/30 -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
              ECHO Protocol V4 正式上线
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              发现、创作、交易
              <br />
              <span className="gradient-text">链上音乐资产</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              ECHO Protocol 是去中心化的音乐资产协议，让创作者能够铸造、交易和授权音乐资产，
              为数字音乐产业带来前所未有的透明度和流动性。
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/marketplace">
                <Button size="lg" className="gap-2">
                  浏览市场
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/creator/upload">
                <Button size="lg" variant="secondary" className="gap-2">
                  上传作品
                  <Music className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6">
                <stat.icon className="w-8 h-8 mx-auto text-primary-500 mb-3" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Assets */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">热门音乐</h2>
              <p className="text-muted-foreground">发现最新上架的优质音乐作品</p>
            </div>
            <Link to="/marketplace">
              <Button variant="ghost" className="gap-2">
                查看全部
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">为什么选择 ECHO?</h2>
            <p className="text-muted-foreground mt-2">为音乐创作者和使用者打造的下一代基础设施</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Creator CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4">成为创作者</h2>
                <p className="text-muted-foreground mb-6">
                  上传你的音乐作品，铸造为 ECHO 资产，通过智能合约自动获得版税收入。
                  无需中间商，直接与全球听众连接。
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    '100% 所有权保留',
                    '自动版税分配',
                    '多种授权模式',
                    '全球即时结算',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-primary-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/creator/upload">
                  <Button size="lg" className="gap-2">
                    开始创作
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="hidden md:block bg-gradient-to-br from-primary-500 to-accent-500 p-12 flex items-center justify-center">
                <div className="text-center text-white">
                  <Disc className="w-24 h-24 mx-auto mb-4 opacity-80" />
                  <div className="text-5xl font-bold mb-2">95%</div>
                  <div className="text-lg opacity-80">创作者收益占比</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;