/**
 * AssetCard Component - Display music asset preview
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MusicAsset } from '@/types';
import { formatDuration, formatPrice, formatAddress, cn } from '@/lib/utils';
import { Play, Pause, Clock, User, Tag, Verified } from 'lucide-react';

interface AssetCardProps {
  asset: MusicAsset;
  isPlaying?: boolean;
  onPlay?: () => void;
  showPrice?: boolean;
  className?: string;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  isPlaying = false,
  onPlay,
  showPrice = true,
  className,
}) => {
  return (
    <Card 
      hover 
      className={cn('group overflow-hidden', className)}
    >
      <Link to={`/asset/${asset.tokenId}`}>
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30">
          {asset.coverImage ? (
            <img
              src={asset.coverImage}
              alt={asset.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <Button
              size="lg"
              variant="secondary"
              className={cn(
                'rounded-full w-14 h-14 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100',
                isPlaying && 'opacity-100 scale-100 bg-primary-600 text-white hover:bg-primary-700'
              )}
              onClick={(e) => {
                e.preventDefault();
                onPlay?.();
              }}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
            <Clock className="w-3 h-3" />
            {formatDuration(asset.duration)}
          </div>

          {/* Verified badge */}
          {asset.isVerified && (
            <div className="absolute top-2 left-2">
              <Verified className="w-5 h-5 text-primary-500 fill-primary-500" />
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <CardContent className="p-4">
        <Link to={`/asset/${asset.tokenId}`}>
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary-600 transition-colors">
            {asset.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
          <User className="w-3 h-3" />
          <span>{asset.artist || formatAddress(asset.creator)}</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
            <Tag className="w-3 h-3" />
            {asset.genre}
          </span>
          <span className="text-xs text-muted-foreground">
            {asset.mood}
          </span>        </div>

        {showPrice && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(asset.price)}
            </span>
            <Link to={`/license/${asset.tokenId}`}>
              <Button size="sm" variant="secondary">
                购买授权
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};