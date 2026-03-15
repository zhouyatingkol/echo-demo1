/**
 * Revenue Page - Creator revenue management
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { formatPrice, formatDate, formatAddress, cn } from '@/lib/utils';
import { 
  TrendingUp,
  DollarSign, 
  Download,
  ArrowUpRight,
  Wallet
} from 'lucide-react';

// Mock revenue data
const revenueStats = {
  totalRevenue: '2.45',
  monthlyRevenue: '0.32',
  pendingRevenue: '0.08',
  totalSales: 156,
  growthRate: '+12.5%',
};

const monthlyData = [
  { month: '1月', revenue: 0.18 },
  { month: '2月', revenue: 0.22 },
  { month: '3月', revenue: 0.15 },
  { month: '4月', revenue: 0.28 },
  { month: '5月', revenue: 0.32 },
  { month: '6月', revenue: 0.25 },
];

const recentRevenue = [
  { id: '1', assetTitle: 'Neon Dreams', type: 'Commercial', amount: '0.05', buyer: '0x1234...5678', date: Date.now() / 1000 - 3600 * 2 },
  { id: '2', assetTitle: 'Midnight Jazz', type: 'Streaming', amount: '0.1', buyer: '0xabcd...efgh', date: Date.now() / 1000 - 3600 * 5 },
  { id: '3', assetTitle: 'Lo-Fi Study', type: 'Personal', amount: '0.01', buyer: '0x9012...3456', date: Date.now() / 1000 - 3600 * 8 },
  { id: '4', assetTitle: 'Neon Dreams', type: 'Film', amount: '0.5', buyer: '0x2468...1357', date: Date.now() / 1000 - 86400 },
  { id: '5', assetTitle: 'Epic Orchestra', type: 'Gaming', amount: '0.2', buyer: '0x1357...2468', date: Date.now() / 1000 - 86400 * 2 },
];

const timeRangeOptions = [
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' },
  { value: '90d', label: '最近90天' },
  { value: '1y', label: '最近1年' },
  { value: 'all', label: '全部' },
];

export const Revenue: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">收益管理</h1>
          <p className="text-muted-foreground">查看和管理你的创作收益</p>
        </div>
        <Button variant="secondary" className="gap-2">
          <Download className="w-4 h-4" />
          导出报表
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总收益</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(revenueStats.totalRevenue)}</p>
              <div className="flex items-center gap-1 text-sm mt-2 text-green-600">
                <ArrowUpRight className="w-4 h-4" />
                {revenueStats.growthRate}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">本月收益</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(revenueStats.monthlyRevenue)}</p>
              <div className="flex items-center gap-1 text-sm mt-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                +8.3%
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">待结算</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(revenueStats.pendingRevenue)}</p>
              <div className="flex items-center gap-1 text-sm mt-2 text-muted-foreground">
                预计24小时内到账
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总销售</p>
              <p className="text-2xl font-bold mt-1">{revenueStats.totalSales}</p>
              <div className="flex items-center gap-1 text-sm mt-2 text-green-600">
                <TrendingUp className="w-4 h-4" />
                +15
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">收益趋势</h3>
            <Select
              value={timeRange}
              options={timeRangeOptions}
              onChange={setTimeRange}
            />
          </div>

          {/* Simple bar chart */}
          <div className="flex items-end gap-4 h-48">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative">
                  <div
                    className="w-full bg-primary-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(data.revenue / maxRevenue) * 160}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{data.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold mb-6">收益来源</h3>
          
          <div className="space-y-4">
            {[
              { label: '买断授权', value: '45%', amount: '1.10 ETH', color: 'bg-primary-500' },
              { label: '限时授权', value: '30%', amount: '0.74 ETH', color: 'bg-accent-500' },
              { label: '按次授权', value: '25%', amount: '0.61 ETH', color: 'bg-green-500' },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-sm font-medium">{item.amount}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', item.color)} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-6 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold">最近收益</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-sm">作品</th>
                <th className="text-left py-3 px-4 font-medium text-sm">授权类型</th>
                <th className="text-left py-3 px-4 font-medium text-sm">收益</th>
                <th className="text-left py-3 px-4 font-medium text-sm">买家</th>
                <th className="text-left py-3 px-4 font-medium text-sm">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentRevenue.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="py-4 px-4 font-medium">{item.assetTitle}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-green-600">+{formatPrice(item.amount)}</td>
                  <td className="py-4 px-4 text-muted-foreground">{formatAddress(item.buyer)}</td>
                  <td className="py-4 px-4 text-muted-foreground">{formatDate(item.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Revenue;