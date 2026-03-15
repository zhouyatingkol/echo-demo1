/**
 * Creator Dashboard Page - Stats and overview
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  Music, 
  DollarSign, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';

const stats = [
  { 
    label: '总收益', 
    value: '2.45 ETH', 
    change: '+12.5%', 
    trend: 'up',
    icon: DollarSign 
  },
  { 
    label: '作品数量', 
    value: '12', 
    change: '+2', 
    trend: 'up',
    icon: Music 
  },
  { 
    label: '授权销售', 
    value: '156', 
    change: '+8.3%', 
    trend: 'up',
    icon: Users 
  },
  { 
    label: '本月收益', 
    value: '0.32 ETH', 
    change: '-5.2%', 
    trend: 'down',
    icon: TrendingUp 
  },
];

const recentActivity = [
  { type: 'sale', title: 'Neon Dreams', amount: '0.05 ETH', time: '2小时前' },
  { type: 'sale', title: 'Midnight Jazz', amount: '0.08 ETH', time: '5小时前' },
  { type: 'upload', title: 'New Track', amount: null, time: '1天前' },
  { type: 'sale', title: 'Epic Orchestra', amount: '0.15 ETH', time: '2天前' },
];

export const CreatorDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">创作者中心</h1>
          <p className="text-muted-foreground">管理你的音乐资产和收益</p>
        </div>
        <Link to="/creator/upload">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            上传作品
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <div className={
                  'flex items-center gap-1 text-sm mt-2 ' +
                  (stat.trend === 'up' ? 'text-green-600' : 'text-red-600')
                }>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">最近活动</h3>
            <Button variant="ghost" size="sm">查看全部</Button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={
                    'w-10 h-10 rounded-full flex items-center justify-center ' +
                    (activity.type === 'sale' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600')
                  }>
                    {activity.type === 'sale' ? (
                      <DollarSign className="w-5 h-5" />
                    ) : (
                      <Music className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.type === 'sale' ? '授权销售' : '上传作品'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <div className="font-medium text-green-600">+{activity.amount}</div>
                  )}
                  <div className="text-sm text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="font-semibold mb-6">快捷操作</h3>
          
          <div className="space-y-3">
            <Link to="/creator/upload">
              <Button variant="secondary" className="w-full justify-start gap-2">
                <Plus className="w-4 h-4" />
                上传新作品
              </Button>
            </Link>
            
            <Link to="/creator/assets">
              <Button variant="secondary" className="w-full justify-start gap-2">
                <Music className="w-4 h-4" />
                管理作品
              </Button>
            </Link>
            
            <Link to="/creator/revenue">
              <Button variant="secondary" className="w-full justify-start gap-2">
                <DollarSign className="w-4 h-4" />
                查看收益
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium mb-3">创作者提示</h4>
            <p className="text-sm text-muted-foreground">
              定期上传新作品可以提高曝光率，建议使用高质量的封面图片和详细的描述。
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreatorDashboard;