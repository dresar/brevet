'use client';

import { useState, use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Search, Sparkles, GraduationCap } from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/badge';
import { SkeletonText } from '@/components/ui/skeleton';

export default function StudentGlosariumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Module info
  const { data: moduleData, isLoading: isModuleLoading } = useQuery({
    queryKey: ['belajar-module-info', slug],
    queryFn: async () => {
      const res = await fetch(`/api/belajar/${slug}`);
      if (!res.ok) throw new Error('Gagal memuat modul');
      return res.json();
    },
  });

  // 2. Fetch Glossary terms from DB
  const { data: glossaryData, isLoading: isGlossaryLoading } = useQuery({
    queryKey: ['student-glossary-page', slug],
    queryFn: async () => {
      const res = await fetch(`/api/admin/glossary?moduleSlug=${slug}`);
      if (!res.ok) return { glossary: [] };
      return res.json();
    },
  });

  const modul = moduleData?.modul;
  const content = moduleData?.content;
  const fallbackTerms = content?.modul?.glosarium || [];

  const dbTerms = glossaryData?.glossary || [];
  const rawList = dbTerms.length > 0
    ? dbTerms
    : fallbackTerms.map((g: any, idx: number) => ({
        id: `fallback-${idx}`,
        kata: g.kata,
        definisi: g.definisi,
        penjelasanSederhana: g.penjelasan_sederhana,
        contoh: g.contoh,
      }));

  const filteredList = rawList.filter((item: any) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.kata.toLowerCase().includes(q) ||
      item.definisi.toLowerCase().includes(q) ||
      (item.penjelasanSederhana && item.penjelasanSederhana.toLowerCase().includes(q))
    );
  });

  const isLoading = isModuleLoading || isGlossaryLoading;

  return (
    <div className="min-h-dvh bg-[#070b13] text-slate-100 font-sans pb-16">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#0d1424]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/belajar/${slug}`}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800 shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                {modul?.code || 'BRVT'}
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                Glosarium Istilah Pajak
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              Modul: {modul?.title || slug}
            </p>
          </div>
        </div>

        <Link
          href={`/belajar/${slug}`}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <GraduationCap size={15} />
          <span className="hidden sm:inline">Kembali ke Ruang Belajar</span>
        </Link>
      </header>

      {/* Hero Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden space-y-3">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <BookOpen size={16} />
            <span>Kamus Istilah Perpajakan</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            Glosarium {modul?.title || 'Modul Brevet AB'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Pelajari definisi resmi, penjelasan sederhana, dan contoh penerapan istilah perpajakan dalam modul ini untuk mempermudah pemahaman Anda.
          </p>

          <div className="pt-2">
            <div className="relative max-w-xl">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari istilah, kata kunci, atau penjelasan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl sm:rounded-2xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Glossary Items List Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
        <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
          <span>Menampilkan <strong className="text-white">{filteredList.length}</strong> dari <strong className="text-white">{rawList.length}</strong> Istilah</span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-cyan-400 hover:underline"
            >
              Reset Pencarian
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-800/80 rounded w-full" />
                <div className="h-3 bg-slate-800/80 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <BookOpen size={40} className="mx-auto mb-3 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-300">Tidak ada istilah glosarium ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Coba gunakan kata kunci lain untuk mencari istilah perpajakan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 space-y-3 transition-all duration-200 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      {item.kata}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Formal Definition */}
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {item.definisi}
                  </p>

                  {/* Simple Explanation */}
                  {(item.penjelasanSederhana || item.penjelasan_sederhana) && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-cyan-300/90 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      <span className="font-semibold text-cyan-400">💡 Bahasa Sederhana:</span>{' '}
                      {item.penjelasanSederhana || item.penjelasan_sederhana}
                    </div>
                  )}

                  {/* Example */}
                  {item.contoh && (
                    <div className="text-xs text-slate-400 italic pt-1 line-clamp-2 sm:line-clamp-none">
                      <span className="font-semibold not-italic text-slate-300">Contoh:</span> {item.contoh}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
