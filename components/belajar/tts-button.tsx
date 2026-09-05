'use client';

import { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { speakText, stopSpeech } from '@/lib/chrome-speech';

interface TtsButtonProps {
  text: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function TtsButton({ 
  text, 
  autoPlay,
  onEnded,
  disabled,
  className,
  size = 'md',
}: TtsButtonProps) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    if (autoPlay && !playing && supported) {
      handleToggle();
    }
  }, [autoPlay, supported]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleToggle = () => {
    if (playing) {
      stopSpeech();
      setPlaying(false);
      return;
    }

    const ok = speakText(text, {
      onStart: () => setPlaying(true),
      onEnd: () => {
        setPlaying(false);
        onEnded?.();
      },
      onError: () => setPlaying(false),
    });

    if (!ok) setPlaying(false);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      title={disabled ? 'Audio tidak aktif' : playing ? 'Hentikan Suara' : 'Dengarkan Suara (Chrome Pria Indonesia)'}
      aria-label={playing ? 'Hentikan Suara' : 'Dengarkan Suara'}
      className={cn(
        'flex items-center justify-center rounded-xl transition-all shadow-sm border shrink-0',
        size === 'sm' ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9',
        disabled 
          ? 'bg-slate-800/60 border-slate-700/50 text-slate-500 cursor-not-allowed opacity-50'
          : playing
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30 animate-pulse ring-1 ring-rose-500/40'
            : 'bg-slate-800/80 hover:bg-slate-700/90 border-slate-700/80 text-blue-300 hover:text-blue-200 hover:scale-105 active:scale-95',
        className
      )}
    >
      {playing ? (
        <Square size={size === 'sm' ? 12 : 14} className="fill-current text-rose-400" />
      ) : (
        <Volume2 size={size === 'sm' ? 14 : 16} />
      )}
    </button>
  );
}
