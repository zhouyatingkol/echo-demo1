/**
 * Upload Page - Upload new music assets
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useToastHelpers } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { 
  Upload as UploadIcon, 
  Image, 
  Check,
  AlertCircle,
  FileAudio
} from 'lucide-react';

const genreOptions = [
  { value: '', label: '选择类型' },
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
  { value: '', label: '选择情绪' },
  { value: 'Energetic', label: 'Energetic' },
  { value: 'Relaxed', label: 'Relaxed' },
  { value: 'Dramatic', label: 'Dramatic' },
  { value: 'Confident', label: 'Confident' },
  { value: 'Calm', label: 'Calm' },
  { value: 'Mysterious', label: 'Mysterious' },
  { value: 'Happy', label: 'Happy' },
  { value: 'Sad', label: 'Sad' },
];

interface FormData {
  title: string;
  artist: string;
  description: string;
  genre: string;
  mood: string;
  bpm: string;
  price: string;
  audioFile: File | null;
  coverFile: File | null;
}

export const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastHelpers();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    artist: '',
    description: '',
    genre: '',
    mood: '',
    bpm: '',
    price: '',
    audioFile: null,
    coverFile: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = '请输入作品标题';
    if (!formData.artist.trim()) newErrors.artist = '请输入艺术家名称';
    if (!formData.description.trim()) newErrors.description = '请输入作品描述';
    if (!formData.genre) newErrors.genre = '请选择音乐类型';
    if (!formData.mood) newErrors.mood = '请选择情绪氛围';
    if (!formData.bpm || parseInt(formData.bpm) < 1) newErrors.bpm = '请输入有效的 BPM';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = '请输入有效的价格';
    if (!formData.audioFile) newErrors.audioFile = '请上传音频文件';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      error('表单验证失败', '请检查所有必填项');
      return;
    }
    setShowConfirm(true);
  };

  const confirmUpload = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);

    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      success('上传成功', '您的作品已提交审核');
      navigate('/creator/assets');
    } catch (err) {
      error('上传失败', '请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (type: 'audio' | 'cover', file: File | null) => {
    if (type === 'audio') {
      if (file && !file.type.startsWith('audio/')) {
        setErrors(prev => ({ ...prev, audioFile: '请上传有效的音频文件' }));
        return;
      }
      setFormData(prev => ({ ...prev, audioFile: file }));
      setErrors(prev => ({ ...prev, audioFile: undefined }));
    } else {
      if (file && !file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, coverFile: '请上传有效的图片文件' }));
        return;
      }
      setFormData(prev => ({ ...prev, coverFile: file }));
      setErrors(prev => ({ ...prev, coverFile: undefined }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">上传作品</h1>
        <p className="text-muted-foreground">分享你的音乐创作，铸造为 ECHO 资产</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              音频文件 <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => audioInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                errors.audioFile 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
                  : 'border-border hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10'
              )}
            >
              {formData.audioFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{formData.audioFile.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <FileAudio className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="font-medium">点击上传音频文件</div>
                  <div className="text-sm text-muted-foreground mt-1">支持 MP3, WAV, FLAC 格式，最大 50MB</div>
                </>
              )}
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleFileChange('audio', e.target.files?.[0] || null)}
              />
            </div>
            {errors.audioFile && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />{errors.audioFile}
              </p>
            )}
          </div>

          {/* Cover Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">封面图片</label>
            <div
              onClick={() => coverInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
                errors.coverFile 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
                  : 'border-border hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10'
              )}
            >
              {formData.coverFile ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={URL.createObjectURL(formData.coverFile)}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ) : (
                <>
                  <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm">点击上传封面</div>
                </>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange('cover', e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="作品标题"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              error={errors.title}
              placeholder="给你的作品起个名字"
            />
            <Input
              label="艺术家"
              required
              value={formData.artist}
              onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
              error={errors.artist}
              placeholder="艺术家名称"
            />
          </div>

          <Textarea
            label="作品描述"
            required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            error={errors.description}
            placeholder="描述你的音乐作品..."
            rows={4}
          />

          {/* Genre & Mood */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="音乐类型"
              required
              value={formData.genre}
              options={genreOptions}
              onChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}
              error={errors.genre}
            />
            <Select
              label="情绪氛围"
              required
              value={formData.mood}
              options={moodOptions}
              onChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}
              error={errors.mood}
            />
          </div>

          {/* BPM & Price */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="BPM"
              type="number"
              required
              value={formData.bpm}
              onChange={(e) => setFormData(prev => ({ ...prev, bpm: e.target.value }))}
              error={errors.bpm}
              placeholder="例如: 128"
            />
            <Input
              label="底价 (ETH)"
              type="number"
              step="0.001"
              required
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              error={errors.price}
              placeholder="例如: 0.05"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border">
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  上传中...
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  上传作品
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmUpload}
        title="确认上传"
        description={`你将以 ${formData.price} ETH 的底价上传 "${formData.title}" 到 ECHO Protocol。上传后作品将进入审核流程。`}
        confirmText="确认上传"
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Upload;