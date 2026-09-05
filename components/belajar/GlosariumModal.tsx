'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, X, Sparkles, Filter } from 'lucide-react';

interface GlosariumModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleSlug: string;
  moduleTitle: string;
  fallbackGlosarium?: {
    kata: string;
    definisi: string;
    penjelasan_sederhana?: string;
    contoh?: string;
  }[];
}

export function GlosariumModal({
  isOpen,
  onClose,
  moduleSlug,
  moduleTitle,
  fallbackGlosarium = [],
}: GlosariumModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch glossary from DB API
  const { data, isLoading } = useQuery({
    queryKey: ['student-glossary', moduleSlug],
    queryFn: async () => {
      const res = await fetch(`/api/admin/glossary?moduleSlug=${moduleSlug}`);
      if (!res.ok) return { glossary: [] };
      return res.json();
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  // Combine DB terms with fallback JSON terms if needed
  const dbTerms = data?.glossary || [];
  const rawList = dbTerms.length > 0
    ? dbTerms
    : fallbackGlosarium.map((g, idx) => ({
        id: `fallback-${idx}`,
        kata: g.kata,
        definisi: g.definisi,
        penjelasanSederhana: g.penjelasan_sederhana,
        contoh: g.contoh,
      }));

  // Filter list
  const filteredList = rawList.filter((item: any) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.kata.toLowerCase().includes(q) ||
      item.definisi.toLowerCase().includes(q) ||
      (item.penjelasanSederhana && item.penjelasanSederhana.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Glosarium Istilah Pajak
              </h2>
              <p className="text-xs text-slate-400">
                Kamus istilah modul: <span className="text-cyan-400 font-semibold">{moduleTitle}</span> ({rawList.length} Istilah)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup Glosarium"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari istilah, kata kunci, atau definisi pajak..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>
        </div>

        {/* Terms List Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>Memuat glosarium istilah...</span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <p className="font-semibold text-slate-300">Istilah tidak ditemukan</p>
              <p className="mt-1 text-slate-500">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="bg-slate-950/60 border border-slate-800 hover:border-cyan-500/30 rounded-2xl p-4 space-y-2.5 transition"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-cyan-400">{item.kata}</h3>
                    <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                  </div>

                  {/* Formal Definition */}
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {item.definisi}
                  </p>

                  {/* Simple Explanation */}
                  {(item.penjelasanSederhana || item.penjelasan_sederhana) && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-cyan-300/90 leading-relaxed">
                      <span className="font-semibold text-cyan-400">💡 Bahasa Sederhana:</span>{' '}
                      {item.penjelasanSederhana || item.penjelasan_sederhana}
                    </div>
                  )}

                  {/* Example */}
                  {item.contoh && (
                    <div className="text-[11px] text-slate-400 italic">
                      <span className="font-semibold not-italic text-slate-300">Contoh:</span> {item.contoh}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Menampilkan {filteredList.length} dari {rawList.length} istilah glosarium</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
