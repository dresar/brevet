'use client';

import { BookOpen, Layers, Sparkles, RefreshCw, PlusCircle } from 'lucide-react';

interface GlossaryStatsBarProps {
  totalTerms: number;
  totalModules: number;
  selectedModuleTitle: string;
  onSyncFromModules: () => void;
  onAddManual: () => void;
  isSyncing: boolean;
}

export function GlossaryStatsBar({
  totalTerms,
  totalModules,
  selectedModuleTitle,
  onSyncFromModules,
  onAddManual,
  isSyncing,
}: GlossaryStatsBarProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Title + Metrics */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Master Glosarium Pajak</h2>
              <p className="text-xs text-slate-400">
                Filter: <span className="text-cyan-400 font-semibold">{selectedModuleTitle}</span>
              </p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Metric 1 */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Istilah</div>
              <div className="text-lg font-bold text-slate-100">{totalTerms} Istilah</div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800/80 text-blue-400">
              <Layers size={16} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Modul Tercover</div>
              <div className="text-lg font-bold text-slate-100">{totalModules} Modul</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={onSyncFromModules}
            disabled={isSyncing}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Ekstraksi...' : 'Ekstrak Dari Modul'}</span>
          </button>

          <button
            onClick={onAddManual}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition hover:scale-105 active:scale-95"
          >
            <PlusCircle size={15} />
            <span>Tambah Istilah</span>
          </button>
        </div>
      </div>
    </div>
  );
}
