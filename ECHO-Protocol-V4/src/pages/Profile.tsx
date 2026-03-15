/**
 * Profile Page - User profile management
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useWallet } from '@/modules/wallet/useWallet';
import { useToastHelpers } from '@/components/ui/Toast';
import { formatAddress } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Link as LinkIcon, 
  Twitter,
  Edit2,
  Save,
  Copy,
  Check
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { address, isConnected } = useWallet();
  const { success, error } = useToastHelpers();
  
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    displayName: 'MusicLover',
    bio: '热爱音乐，支持原创。在这里发现了很多优秀的音乐作品！',
    email: '',
    website: '',
    twitter: '@musiclover',
  });

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      success('已复制', '钱包地址已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('保存成功', '个人资料已更新');
      setIsEditing(false);
    } catch (err) {
      error('保存失败', '请重试');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">请先连接钱包</h2>
        <p className="text-muted-foreground">连接钱包后即可查看和编辑个人资料</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">个人资料</h1>
        <p className="text-muted-foreground">管理你的个人信息和偏好设置</p>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-accent-500" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-dark-900 bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {isEditing ? (
              <Button
                size="sm"
                className="absolute bottom-0 left-28 gap-2"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4" />
                {isSaving ? '保存中...' : '保存'}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-0 left-28 gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </Button>
            )}
          </div>

          {/* Wallet Address */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground">钱包地址</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="px-3 py-1.5 bg-muted rounded-lg text-sm font-mono">
                {address ? formatAddress(address, 10, 8) : ''}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <Input
              label="显示名称"
              value={profile.displayName}
              onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
              disabled={!isEditing}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Textarea
              label="个人简介"
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              disabled={!isEditing}
              rows={4}
              placeholder="介绍一下你自己..."
            />

            <Input
              label="邮箱"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              placeholder="your@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="网站"
              value={profile.website}
              onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
              disabled={!isEditing}
              placeholder="https://your-website.com"
              leftIcon={<LinkIcon className="w-4 h-4" />}
            />

            <Input
              label="Twitter"
              value={profile.twitter}
              onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
              disabled={!isEditing}
              placeholder="@username"
              leftIcon={<Twitter className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">3</div>
          <div className="text-sm text-muted-foreground">持有授权</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">0</div>
          <div className="text-sm text-muted-foreground">上传作品</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">0.63</div>
          <div className="text-sm text-muted-foreground">总支出 (ETH)</div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;