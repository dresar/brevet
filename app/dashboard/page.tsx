'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  Trophy,
  Award,
  CheckCircle2,
  Clock,
  LogOut,
  Sparkles,
  ArrowRight,
  TrendingUp,
  User,
  Calculator,
  ShieldCheck,
  ChevronRight,
  Flame,
  FileText,
  Printer,
  History,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { CompetencyRadarChart } from '@/components/dashboard/competency-radar-chart';
import { StudyStreakTracker } from '@/components/dashboard/study-streak-tracker';
import { PerformanceMetrics } from '@/components/dashboard/performance-metrics';
import { CertificateModal } from '@/components/dashboard/certificate-modal';
import { initOfflineSync } from '@/lib/offline-sync-queue';
import { AppHeader } from '@/components/navigation/app-header';

export default function UserDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    // Initialize offline sync queue listener
    const cleanupSync = initOfflineSync();

    fetch('/api/user/stats')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((json) => {
        if (json.ok) setData(json);
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => setLoading(false));

    return () => {
      cleanupSync();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Berhasil keluar akun.');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Gagal keluar.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center mx-auto animate-spin">
            <GraduationCap size={24} className="text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-slate-400">Memuat Dashboard Belajar Anda...</p>
        </div>
      </div>
    );
  }

  const user = data?.user;
  const stats = data?.stats;
  const recentQuiz = data?.recentQuiz || [];
  const recentDjp = data?.recentDjp || [];

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 pb-48 md:pb-24">
      {/* Top Navigation */}
      <AppHeader />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Welcome & Certificate CTA Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-500/30 text-blue-300">
              <Sparkles size={13} />
              Portal Belajar Siswa Brevet AB
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Selamat Datang, {user?.fullName || 'Sobat Pajak'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pantau peta kompetensi materi perpajakan, study streak harian, serta klaim sertifikat kelulusan simulasi seleksi DJP Kemenkeu Anda.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-3">
            <Link
              href="/belajar"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-600/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <BookOpen size={18} />
              <span>🚀 Mulai Belajar</span>
            </Link>

            <button
              onClick={() => setShowCertModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Award size={18} className="fill-slate-950" />
              <span>📜 Rapor & Sertifikat</span>
            </button>
          </div>
        </div>

        {/* 1. Performance Gauges & Milestone Bars */}
        <PerformanceMetrics stats={stats} />

        {/* 2. Visual Analytics Grid: Radar Chart & Streak Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Chart (7 cols on lg) */}
          <div className="lg:col-span-7">
            <CompetencyRadarChart
              categoryProficiency={stats?.categoryProficiency}
              avgQuizScore={stats?.avgQuizScore}
            />
          </div>

          {/* Study Streak & Activity Heatmap (5 cols on lg) */}
          <div className="lg:col-span-5">
            <StudyStreakTracker
              streakDays={stats?.streakDays}
              isActiveToday={stats?.isActiveToday}
              activityHistory={stats?.activityHistory}
            />
          </div>
        </div>

        {/* 3. Quick Actions Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/belajar"
            className="p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all group flex items-center justify-between shadow-lg"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">Modul Pembelajaran</h3>
              <p className="text-xs text-slate-400">Akses seluruh 17 modul Brevet AB & audio materi</p>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-blue-400 transition" />
          </Link>

          <Link
            href="/ujian-djp"
            className="p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all group flex items-center justify-between shadow-lg"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition">Simulasi Ujian Masuk DJP</h3>
              <p className="text-xs text-slate-400">CAT TKB, Studi Kasus Esai, & Wawancara</p>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-purple-400 transition" />
          </Link>

          <Link
            href="/tools/kalkulator"
            className="p-5 rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group flex items-center justify-between shadow-lg"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">Kalkulator Pajak Resmi</h3>
              <p className="text-xs text-slate-400">Hitung PPh 21 TER, PPN 11-12%, PBB & BPHTB</p>
            </div>
            <ChevronRight size={18} className="text-slate-500 group-hover:text-emerald-400 transition" />
          </Link>
        </div>

        {/* 4. Recent DJP Exam Simulations History */}
        {recentDjp.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History size={16} className="text-purple-400" />
                Riwayat Simulasi Ujian DJP Terbaru
              </h3>
              <Link href="/ujian-djp" className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-semibold">
                Ambil Ujian Baru <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recentDjp.map((d: any) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-purple-300">
                      {d.mode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.finalScore >= 75 || d.isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {d.finalScore >= 75 || d.isPassed ? 'LULUS' : 'BELUM LULUS'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-slate-400">Skor Akhir</span>
                    <span className="text-lg font-black font-mono text-purple-400">{d.finalScore}/100</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {new Date(d.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Competency Certificate & Scorecard Modal */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        studentName={user?.fullName || user?.email || 'Siswa Brevet AB'}
        avgQuizScore={stats?.avgQuizScore || 0}
        highestDjpScore={stats?.highestDjpScore || 0}
        completedSectionsCount={stats?.totalCompletedSections || 0}
      />
    </div>
  );
}
