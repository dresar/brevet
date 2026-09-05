'use client';

import { BookOpen, Loader2 } from 'lucide-react';

interface ModuleItem {
  id: string;
  title: string;
  code: string;
}

interface QuizModuleSelectorProps {
  modules?: ModuleItem[];
  selectedModuleId: string;
  onSelectModule: (id: string) => void;
  isLoading: boolean;
}

export function QuizModuleSelector({
  modules = [],
  selectedModuleId,
  onSelectModule,
  isLoading,
}: QuizModuleSelectorProps) {
  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white text-base">Pilih Modul Pembelajaran</h3>
          <p className="text-xs text-slate-400">Pilih modul yang ingin diatur kuis akhirnya (100 soal)</p>
        </div>
      </div>

      <div className="w-full md:w-80">
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl">
            <Loader2 className="animate-spin text-blue-500" size={16} />
            <span>Memuat daftar modul...</span>
          </div>
        ) : (
          <select
            value={selectedModuleId}
            onChange={(e) => onSelectModule(e.target.value)}
            className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">-- Silakan Pilih Modul --</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.code}] {m.title}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
