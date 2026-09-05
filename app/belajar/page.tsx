'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, Clock, ChevronRight, GraduationCap, Settings, LogOut, DownloadCloud } from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/badge';
import { SkeletonCard } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/navigation/app-header';

type ModuleCard = {
  id: string;
  slug: string;
  code: string;
  title: string;
  category: string | null;
  difficulty: string | null;
  estimatedMinutes: number | null;
  status: string | null;
  progressPersen: number;
};

const KATEGORI_COLORS: Record<string, string> = {
  'PPh': 'from-blue-600/80 to-indigo-600/60',
  'PPN': 'from-cyan-600/80 to-sky-600/60',
  'PBB': 'from-emerald-600/80 to-teal-600/60',
  'BPHTB': 'from-violet-600/80 to-purple-600/60',
  'Administrasi': 'from-amber-600/80 to-orange-600/60',
  'default': 'from-slate-700 to-slate-800',
};

export default function BelajarPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; fullName: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['modules-belajar'],
    queryFn: async () => {
      const res = await fetch('/api/modules?status=tayang');
      return res.json() as Promise<{ modules: ModuleCard[] }>;
    },
  });

  const modules = data?.modules ?? [];

  // Group by category
  const grouped = modules.reduce<Record<string, ModuleCard[]>>((acc, m) => {
    const cat = m.category ?? 'Lainnya';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Berhasil keluar');
    router.push('/login');
  };

  return (
    <div className="min-h-dvh bg-[#070b13] text-slate-100 selection:bg-blue-600 pb-36 sm:pb-24">
      {/* Sticky header */}
      <AppHeader />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800/40">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[200px] sm:h-[300px] rounded-full opacity-15 blur-3xl bg-blue-500"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14 text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <span>📚</span>
            <span>Kurikulum Resmi Brevet Pajak AB 2026</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ruang Belajar Perpajakan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Kuasai konsep, peraturan UU HPP terbaru, perhitungan angka interaktif, dan simulasi kasus ujian DJP.
          </p>
        </div>
      </div>

      {/* Module grid */}
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* ── Featured Banner: DJP Selection Exam ── */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 p-4 sm:p-7 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Paket Ujian Baru • Standar Kemenkeu RI</span>
              </div>
              <h2 className="text-base sm:text-2xl font-bold text-white tracking-tight">
                Simulasi Seleksi Masuk Pegawai DJP (100 Soal Master)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Persiapkan diri menghadapi seleksi CPNS DJP, PPPK Teknis Pajak, dan Fungsional dengan 100 soal kurasi: 50 TKB CAT, 25 Esai Studi Kasus dengan AI Evaluator, dan 25 Simulasi Wawancara AI (STAR & TTS).
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">⏱️ 120 Menit</span>
                <span>•</span>
                <span className="flex items-center gap-1">📊 Passing Grade: 75</span>
                <span>•</span>
                <span className="flex items-center gap-1">🤖 AI Grading Real-time</span>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href="/ujian-djp"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
              >
                <span>Mulai Ujian DJP</span>
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-16 sm:py-24 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
            <h2 className="text-base sm:text-lg font-semibold mb-1 text-white">
              Belum ada modul tersedia
            </h2>
            <p className="text-xs sm:text-sm mb-5 text-slate-400">
              Import modul Brevet AB di halaman Admin → Impor Modul.
            </p>
            <Link
              href="/admin/import"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all"
            >
              Impor Modul Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {Object.entries(grouped).map(([kategori, items]) => (
              <section key={kategori}>
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3.5 sm:mb-5">
                  <h2 className="text-base sm:text-xl font-bold text-white">
                    {kategori}
                  </h2>
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-xs text-slate-400 shrink-0">
                    {items.length} modul
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                  {items.map((m) => {
                    const gradientKey = Object.keys(KATEGORI_COLORS).find((k) =>
                      m.category?.includes(k)
                    ) ?? 'default';
                    const gradient = KATEGORI_COLORS[gradientKey];
                    const percent = (m as any).progressPercent ?? m.progressPersen ?? 0;

                    return (
                      <Link
                        key={m.id}
                        id={`moduleCard-${m.slug}`}
                        href={`/belajar/${m.slug}`}
                        className="group flex flex-col h-full bg-[#111827] border border-slate-800 rounded-xl sm:rounded-2xl hover:border-slate-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
                      >
                        {/* Card header top line */}
                        <div className={`h-1.5 bg-gradient-to-r ${gradient} shrink-0`} />

                        <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3 sm:space-y-4">
                          {/* Top Info */}
                          <div className="space-y-2">
                            {/* Code + difficulty */}
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                              >
                                {m.code}
                              </span>
                              {m.difficulty && <DifficultyBadge difficulty={m.difficulty} />}
                            </div>

                            {/* Title */}
                            <h3
                              className="font-semibold text-xs sm:text-sm leading-snug group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.25rem] text-slate-100"
                            >
                              {m.title}
                            </h3>

                            {/* Meta */}
                            {m.estimatedMinutes && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                <Clock size={11} />
                                <span>{m.estimatedMinutes} menit belajar</span>
                              </div>
                            )}
                          </div>

                          {/* Bottom Progress & CTA */}
                          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] text-slate-400">
                                <span>Progres</span>
                                <span className={percent === 100 ? 'text-emerald-400 font-semibold' : ''}>
                                  {percent}%
                                </span>
                              </div>
                              <div
                                className="w-full h-1 rounded-full overflow-hidden bg-slate-800"
                              >
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${percent}%`,
                                    background:
                                      percent === 100
                                        ? '#10B981'
                                        : 'linear-gradient(90deg, #3B82F6, #38BDF8)',
                                  }}
                                />
                              </div>
                            </div>

                            {/* CTA */}
                            <div className="flex items-center justify-between pt-0.5">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: percent === 100 ? '#10B981' : '#3B82F6' }}
                              >
                                {percent === 100
                                  ? '✅ Selesai'
                                  : percent > 0
                                  ? 'Lanjutkan'
                                  : 'Mulai Belajar'}
                              </span>
                              <ChevronRight
                                size={14}
                                className="group-hover:translate-x-1 transition-transform text-slate-400"
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
