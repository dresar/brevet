'use client';

import React from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  BookOpen,
  Target,
  TrendingUp,
  Percent,
  Sparkles,
} from 'lucide-react';

interface PerformanceMetricsProps {
  stats: {
    totalModules?: number;
    totalSections?: number;
    totalCompletedSections?: number;
    totalQuizTaken?: number;
    avgQuizScore?: number;
    quizPassRate?: number;
    quizPassedCount?: number;
    totalDjpExams?: number;
    highestDjpScore?: number;
    djpPassRate?: number;
    djpPassedCount?: number;
  };
}

export function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
  const totalSections = stats?.totalSections || 50;
  const completedSections = stats?.totalCompletedSections || 0;
  const curriculumProgress = totalSections > 0
    ? Math.min(100, Math.round((completedSections / totalSections) * 100))
    : 0;

  const avgScore = stats?.avgQuizScore || 0;
  const quizPassRate = stats?.quizPassRate || 0;
  const highestDjp = stats?.highestDjpScore || 0;

  // Milestone Stages
  const milestones = [
    { title: 'Pemula Brevet AB', minSections: 5, achieved: completedSections >= 5 },
    { title: 'Menengah Perpajakan', minSections: 15, achieved: completedSections >= 15 },
    { title: 'Mahir Rekonsiliasi Fiskal', minSections: 30, achieved: completedSections >= 30 },
    { title: 'Siap Seleksi Aparatur DJP', minSections: 45, achieved: completedSections >= 45 },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Sub-Bab Selesai & Curriculum % */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Progres Kurikulum</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">{curriculumProgress}%</span>
              <span className="text-[11px] text-slate-400">selesai</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {completedSections} dari {totalSections} sub-bab tuntas
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${curriculumProgress}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Rata-Rata Nilai Kuis */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg relative overflow-hidden group hover:border-yellow-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Rata-Rata Kuis</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
              <Trophy size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-yellow-400 font-mono">{avgScore}</span>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dari {stats?.totalQuizTaken || 0} kuis modul diambil
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-yellow-500 transition-all duration-500"
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Quiz Pass Rate */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pass Rate Kuis</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Target size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">{quizPassRate}%</span>
              <span className="text-[11px] text-slate-400">kelulusan</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats?.quizPassedCount || 0} kuis lulus (skor &ge; 70)
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${quizPassRate}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Top Skor DJP */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Top Skor Ujian DJP</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">{highestDjp}</span>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {stats?.totalDjpExams || 0} kali simulasi dikerjakan
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-500"
              style={{ width: `${highestDjp}%` }}
            />
          </div>
        </div>
      </div>

      {/* Learning Milestone Progress Bars */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            <h3 className="text-sm font-bold text-white">Milestone Jenjang Belajar Perpajakan</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{completedSections} sub-bab terselesaikan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {milestones.map((m, idx) => (
            <div
              key={m.title}
              className={`p-3.5 rounded-2xl border transition-all ${
                m.achieved
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-white shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  Level {idx + 1}
                </span>
                {m.achieved ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Tercapai
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.max(0, m.minSections - completedSections)} lagi
                  </span>
                )}
              </div>
              <p className="text-xs font-bold truncate text-white">{m.title}</p>
              <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    m.achieved ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  style={{
                    width: `${Math.min(100, (completedSections / m.minSections) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
