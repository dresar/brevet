'use client';

import { Sparkles, Loader2, CheckCircle2, AlertTriangle, Play, RefreshCw, Zap } from 'lucide-react';
import type { KuisSoal } from '@/lib/module-types';

export interface BatchItem {
  status: 'idle' | 'loading' | 'success' | 'failed';
  type: 'pilihan_ganda' | 'esai';
  index: number;
  error?: string;
  count?: number;
}

interface QuizAiGeneratorTabProps {
  onGenerateAll: () => void;
  isRunning: boolean;
  batches: BatchItem[];
  generatedCount: number;
  selectedModuleId: string;
}

export function QuizAiGeneratorTab({
  onGenerateAll,
  isRunning,
  batches,
  generatedCount,
  selectedModuleId,
}: QuizAiGeneratorTabProps) {
  const completedBatches = batches.filter((b) => b.status === 'success').length;
  const progressPercent = Math.round((completedBatches / batches.length) * 100);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Generator AI 100 Soal Otomatis
                <span className="text-xs font-mono bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-normal">
                  5-Batch Sequence
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sistem akan secara bertahap men-generate 80 Soal Pilihan Ganda dan 20 Essay berdasarkan materi modul resmi.
              </p>
            </div>
          </div>

          <button
            onClick={onGenerateAll}
            disabled={isRunning || !selectedModuleId}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm shrink-0"
          >
            {isRunning ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} className="fill-current" />}
            <span>{isRunning ? 'Sedang Men-generate...' : 'Mulai Generate 100 Soal AI'}</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        {(isRunning || completedBatches > 0) && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>Progres Batch: {completedBatches} dari 5 Selesai</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Batch Cards Grid */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white px-1 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" /> Status Antrean Batch
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch, i) => (
            <div
              key={i}
              className={`bg-[#0F172A] border rounded-2xl p-4 space-y-3 transition-all ${
                batch.status === 'loading'
                  ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10'
                  : batch.status === 'success'
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : batch.status === 'failed'
                  ? 'border-red-500/40 bg-red-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Batch #{i + 1}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    batch.type === 'pilihan_ganda'
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-purple-500/10 text-purple-400'
                  }`}
                >
                  {batch.type === 'pilihan_ganda' ? '20 Soal PG' : '20 Soal Essay'}
                </span>
              </div>

              <div>
                <h5 className="font-semibold text-sm text-white">
                  {batch.type === 'pilihan_ganda'
                    ? `Pilihan Ganda (Bagian ${batch.index + 1})`
                    : 'Evaluasi Essay Kompleks'}
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  {batch.type === 'pilihan_ganda'
                    ? `Generate 20 soal Pilihan Ganda (Soal ${batch.index * 20 + 1}-${(batch.index + 1) * 20})`
                    : 'Generate 20 soal Essay studi kasus & kunci lengkap'}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {batch.status === 'idle' && (
                  <span className="text-slate-500 font-medium">Menunggu Antrean...</span>
                )}
                {batch.status === 'loading' && (
                  <span className="text-blue-400 font-semibold flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="animate-spin" size={14} /> Memproses AI...
                  </span>
                )}
                {batch.status === 'success' && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> 20 Soal Terbuat
                  </span>
                )}
                {batch.status === 'failed' && (
                  <span className="text-red-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {batch.error || 'Gagal'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
