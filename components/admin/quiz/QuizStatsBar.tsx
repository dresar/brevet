'use client';

import { Save, Loader2, AlertTriangle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import type { KuisSoal } from '@/lib/module-types';

interface QuizStatsBarProps {
  questions: KuisSoal[];
  onSave: () => void;
  isSaving: boolean;
  moduleTitle?: string;
  moduleCode?: string;
}

export function QuizStatsBar({
  questions,
  onSave,
  isSaving,
  moduleTitle,
  moduleCode,
}: QuizStatsBarProps) {
  const total = questions.length;
  const pgCount = questions.filter((q) => q.tipe === 'pilihan_ganda').length;
  const essayCount = questions.filter((q) => q.tipe === 'esai').length;

  const isIdealComposition = total === 100 && pgCount === 80 && essayCount === 20;

  return (
    <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <span>Standard Brevet AB</span>
            {moduleCode && <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">{moduleCode}</span>}
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            {moduleTitle || 'Modul Belum Dipilih'}
          </h2>
        </div>

        <button
          onClick={onSave}
          disabled={isSaving || questions.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20 transition-all text-sm shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span>Simpan ke Database</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Total Soal</span>
            <span className="text-2xl font-black text-white mt-0.5 block">{total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileSpreadsheet size={20} />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Pilihan Ganda (Target 80)</span>
            <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{pgCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
            80 PG
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Essay (Target 20)</span>
            <span className="text-2xl font-black text-purple-400 mt-0.5 block">{essayCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
            20 ESS
          </div>
        </div>
      </div>

      {/* Composition Alert */}
      {total > 0 && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
            isIdealComposition
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          {isIdealComposition ? (
            <>
              <CheckCircle2 className="shrink-0 text-emerald-400" size={16} />
              <span>
                <strong>Komposisi Sempurna:</strong> Kuis ini memenuhi standar 100 soal (80 Pilihan Ganda + 20 Essay).
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="shrink-0 text-amber-400" size={16} />
              <span>
                <strong>Perhatian Komposisi:</strong> Standar kuis kelulusan Brevet AB adalah 100 Soal (80 PG + 20 Essay). Saat ini: {pgCount} PG, {essayCount} Essay.
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
