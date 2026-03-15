/**
 * AudioPlayer Component - Music playback controls
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn, formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Repeat,
  Shuffle
} from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  artist?: string;
  coverImage?: string;
  className?: string;
  onEnded?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  artist,
  coverImage,
  className,
  onEnded,
  onNext,
  onPrevious,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  // Update source when it changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = src;
      audio.load();
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleLoop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  };

  return (
    <div className={cn('bg-dark-900 rounded-xl p-4', className)}>
      <audio ref={audioRef} src={src} />

      <div className="flex items-center gap-4">
        {/* Cover Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 flex-shrink-0">
          {coverImage ? (
            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{title || '未知曲目'}</h4>
          <p className="text-sm text-dark-300 truncate">{artist || '未知艺术家'}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-dark-300 hover:text-white hidden sm:flex"
            onClick={() => setIsShuffling(!isShuffling)}
          >
            <Shuffle className={cn('w-4 h-4', isShuffling && 'text-primary-500')} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-dark-300 hover:text-white"
            onClick={onPrevious}
            disabled={!onPrevious}
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            variant="primary"
            size="lg"
            className="rounded-full w-12 h-12 flex items-center justify-center"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-dark-300 hover:text-white"
            onClick={onNext}
            disabled={!onNext}
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-dark-300 hover:text-white hidden sm:flex"
            onClick={toggleLoop}
          >
            <Repeat className={cn('w-4 h-4', isLooping && 'text-primary-500')} />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-xs text-dark-400 w-10 text-right">
          {formatDuration(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 bg-dark-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500"
        />

        <span className="text-xs text-dark-400 w-10">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-dark-300 hover:text-white"
          onClick={toggleMute}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-dark-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-dark-300"
        />
      </div>
    </div>
  );
};