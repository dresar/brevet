'use client';

import { WifiOff } from 'lucide-react';
import { useOffline } from '@/lib/use-offline';

export function OfflineBadge() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-rose-500/50 shadow-xl rounded-full text-rose-400 text-xs font-medium pointer-events-none animate-in slide-in-from-bottom-5">
      <WifiOff size={14} />
      <span>Mode Offline</span>
    </div>
  );
}
