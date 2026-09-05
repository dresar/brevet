'use client';

import React from 'react';
import { Flame, Calendar, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ActivityDay {
  date: string;
  count: number;
  active: boolean;
}

interface StudyStreakTrackerProps {
  streakDays?: number;
  isActiveToday?: boolean;
  activityHistory?: ActivityDay[];
}

export function StudyStreakTracker({
  streakDays = 0,
  isActiveToday = false,
  activityHistory = [],
}: StudyStreakTrackerProps) {
  // Format dates for display
  const formatDateLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 14) return 'Luar biasa! Konsistensi Anda mendekati standar aparatur DJP teladan! 🔥';
    if (streak >= 7) return 'Hebat! Anda telah belajar konsisten selama seminggu penuh! 🚀';
    if (streak >= 3) return 'Bagus sekali! Pertahankan ritme belajar harian Anda! ⚡';
    if (streak >= 1) return 'Langkah awal yang baik! Selesaikan 1 sub-bab lagi hari ini! ✨';
    return 'Mulai streak belajar Anda hari ini dengan membaca modul atau mencoba kuis! 📖';
  };

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Top Banner with Streak Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              streakDays > 0
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-orange-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            <Flame size={26} className={streakDays > 0 ? 'fill-white' : ''} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">Study Streak Tracker</h3>
              {isActiveToday ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  Aktif Hari Ini
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                  <AlertCircle size={11} />
                  Belum Belajar
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{getStreakMessage(streakDays)}</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30">
          <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{streakDays}</span>
          <span className="text-xs font-bold text-amber-300">Hari Beruntun</span>
        </div>
      </div>

      {/* 30-Day Activity Dot Grid */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Calendar size={13} className="text-blue-400" />
            Aktivitas 30 Hari Terakhir
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-800" /> Tidak aktif
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shadow-sm shadow-amber-500/50" /> Aktif
            </span>
          </div>
        </div>

        {/* 30-Day Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/60">
          {activityHistory.map((day, idx) => (
            <div
              key={day.date || idx}
              className="group relative flex flex-col items-center justify-center p-1.5"
            >
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border transition-all flex items-center justify-center text-[10px] font-mono font-bold ${
                  day.active
                    ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                    : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                {idx + 1}
              </div>

              {/* Tooltip */}
              <div className="absolute -top-9 z-20 hidden group-hover:flex flex-col items-center bg-slate-950 text-white text-[10px] px-2 py-1 rounded-md border border-slate-700 shadow-xl whitespace-nowrap pointer-events-none">
                <span>{formatDateLabel(day.date)}</span>
                <span className="text-[9px] text-amber-300 font-semibold">
                  {day.count > 0 ? `${day.count} aktivitas` : 'Tidak ada aktivitas'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
