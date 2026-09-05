'use client';

import { useMemo } from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Printer,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  BarChart3,
  TrendingUp,
  FileText,
  UserCheck,
} from 'lucide-react';
import type { DJPSoal, DJPSoalPG, DJPSoalEsai, DJPSoalWawancara, EssayAIAnalysis, InterviewAIAnalysis, ExamMode } from '@/lib/djp-types';

interface DJPScorecardProps {
  soalList: DJPSoal[];
  answers: Record<string, string>;
  essayAnalysis: Record<string, EssayAIAnalysis>;
  interviewAnalysis: Record<string, InterviewAIAnalysis>;
  mode: ExamMode;
  onRetake: () => void;
  onReviewQuestion: (index: number) => void;
}

export function DJPScorecard({
  soalList,
  answers,
  essayAnalysis,
  interviewAnalysis,
  mode,
  onRetake,
  onReviewQuestion,
}: DJPScorecardProps) {
  // ── Calculation ──
  const stats = useMemo(() => {
    let pgTotal = 0;
    let pgCorrect = 0;

    let essayTotal = 0;
    let essayScoreSum = 0;

    let interviewTotal = 0;
    let interviewScoreSum = 0;

    const categoryStats: Record<string, { total: number; correctOrPoints: number; maxPoints: number }> = {};

    soalList.forEach((s) => {
      const cat = s.kategori || 'Umum';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, correctOrPoints: 0, maxPoints: 0 };
      }
      categoryStats[cat].total += 1;

      if (s.tipe === 'pilihan_ganda') {
        pgTotal += 1;
        categoryStats[cat].maxPoints += 100;
        const userAns = answers[s.id];
        const isCorrect = userAns && userAns.trim().toUpperCase() === s.jawabanKunci.trim().toUpperCase();
        if (isCorrect) {
          pgCorrect += 1;
          categoryStats[cat].correctOrPoints += 100;
        }
      } else if (s.tipe === 'esai_kasus') {
        essayTotal += 1;
        categoryStats[cat].maxPoints += 100;
        const analysis = essayAnalysis[s.id];
        const score = analysis ? analysis.skor : (answers[s.id] && answers[s.id].length > 20 ? 70 : 0);
        essayScoreSum += score;
        categoryStats[cat].correctOrPoints += score;
      } else if (s.tipe === 'wawancara') {
        interviewTotal += 1;
        categoryStats[cat].maxPoints += 100;
        const analysis = interviewAnalysis[s.id];
        const score = analysis ? analysis.skor : (answers[s.id] && answers[s.id].length > 20 ? 75 : 0);
        interviewScoreSum += score;
        categoryStats[cat].correctOrPoints += score;
      }
    });

    const pgScore = pgTotal > 0 ? Math.round((pgCorrect / pgTotal) * 100) : 0;
    const essayScore = essayTotal > 0 ? Math.round(essayScoreSum / essayTotal) : 0;
    const interviewScore = interviewTotal > 0 ? Math.round(interviewScoreSum / interviewTotal) : 0;

    let finalWeightedScore = 0;
    if (mode === 'all-100') {
      finalWeightedScore = Math.round(pgScore * 0.4 + essayScore * 0.3 + interviewScore * 0.3);
    } else if (mode === 'tkb-50') {
      finalWeightedScore = pgScore;
    } else if (mode === 'esai-25') {
      finalWeightedScore = essayScore;
    } else if (mode === 'wawancara-25') {
      finalWeightedScore = interviewScore;
    }

    const isPassed = finalWeightedScore >= 75;

    return {
      pgTotal,
      pgCorrect,
      pgScore,
      essayTotal,
      essayScore,
      interviewTotal,
      interviewScore,
      finalWeightedScore,
      isPassed,
      categoryStats,
    };
  }, [soalList, answers, essayAnalysis, interviewAnalysis, mode]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in print:p-0">
      {/* ── Header Badge & Result Summary ── */}
      <div
        className="relative overflow-hidden rounded-3xl border border-slate-800 p-6 sm:p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.95))',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: stats.isPassed ? '#10b981' : '#f59e0b' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ background: '#3b82f6' }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo / Medal Icon */}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl ${
              stats.isPassed
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white'
                : 'bg-gradient-to-tr from-amber-600 to-orange-400 text-white'
            }`}
          >
            {stats.isPassed ? <Trophy size={40} /> : <Award size={40} />}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 border border-slate-700 bg-slate-800/80 text-slate-300">
            <ShieldCheck size={14} className="text-blue-400" />
            Laporan Hasil Evaluasi Seleksi Masuk DJP & Kemenkeu RI
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {stats.isPassed ? (
              <span className="text-emerald-400">MEMENUHI SYARAT (LULUS REKOMENDASI UTAMA) 🎉</span>
            ) : (
              <span className="text-amber-400">BELUM MEMENUHI PASSING GRADE (PERLU LATIHAN LANJUTAN) 📚</span>
            )}
          </h2>

          <p className="text-sm text-slate-400 max-w-2xl mx-auto mb-6">
            {stats.isPassed
              ? 'Selamat! Hasil akumulasi kompetensi teknis fiskal, analisis studi kasus, dan wawancara integritas Anda memenuhi standar kelulusan pegawai Direktorat Jenderal Pajak Kementerian Keuangan.'
              : 'Skor akhir Anda masih di bawah ambang batas kelulusan (Passing Grade 75). Silakan pelajari pembahasan mendalam pada setiap nomor dan coba kembali simulasi ujian ini.'}
          </p>

          {/* Big Score Display */}
          <div className="flex items-baseline gap-2 bg-slate-900/90 border border-slate-800 px-8 py-4 rounded-2xl shadow-inner mb-6">
            <span className="text-slate-400 text-sm font-medium">SKOR AKHIR:</span>
            <span className={`text-5xl font-black ${stats.isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stats.finalWeightedScore}
            </span>
            <span className="text-slate-500 text-lg font-bold">/ 100</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              onClick={onRetake}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md transition-all hover:scale-105"
            >
              <RotateCcw size={16} />
              Ulangi Ujian
            </button>
            <button
              onClick={() => onReviewQuestion(0)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            >
              <BookOpen size={16} />
              Review Pembahasan 100 Soal
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
            >
              <Printer size={16} />
              Cetak / Simpan PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Sub-Scores Section Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TKB CAT Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <FileText size={18} />
              <span>TKB CAT Pilihan Ganda</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
              Bobot 40%
            </span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats.pgScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Benar {stats.pgCorrect} dari {stats.pgTotal} soal CAT.
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${stats.pgScore}%` }}
            />
          </div>
        </div>

        {/* Esai Studi Kasus Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <BarChart3 size={18} />
              <span>Esai Studi Kasus Pajak</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono">
              Bobot 30%
            </span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats.essayScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Rata-rata evaluasi AI Penguji atas {stats.essayTotal} studi kasus.
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full transition-all duration-500"
              style={{ width: `${stats.essayScore}%` }}
            />
          </div>
        </div>

        {/* Wawancara Card */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <UserCheck size={18} />
              <span>Simulasi Wawancara AI</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
              Bobot 30%
            </span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {stats.interviewScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Skor integritas, STAR, & nilai Kemenkeu ({stats.interviewTotal} sesi).
          </p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${stats.interviewScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Competency Breakdown Matrix ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-400" />
          Matriks Kesiapan Kompetensi Seleksi DJP (DJP Readiness Radar)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(stats.categoryStats).map(([catName, val]) => {
            const pct = val.maxPoints > 0 ? Math.round((val.correctOrPoints / val.maxPoints) * 100) : 0;
            const isGood = pct >= 75;
            return (
              <div
                key={catName}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-200">{catName}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      isGood ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isGood ? 'bg-emerald-400' : 'bg-amber-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Quick Question Navigator Review ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-400" />
              Daftar Soal & Kunci Jawaban Lengkap (1–{soalList.length})
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Klik pada nomor soal untuk melihat soal, jawaban Anda, dan pembahasan pasal perundang-undangan lengkap.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-20 gap-2">
          {soalList.map((s, idx) => {
            let statusColor = 'bg-slate-800 text-slate-300 hover:border-slate-600';
            if (s.tipe === 'pilihan_ganda') {
              const userAns = answers[s.id];
              const isCorrect = userAns && userAns.trim().toUpperCase() === s.jawabanKunci.trim().toUpperCase();
              statusColor = isCorrect
                ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-800'
                : 'bg-red-900/60 text-red-300 border-red-700/60 hover:bg-red-800';
            } else if (s.tipe === 'esai_kasus') {
              const analysis = essayAnalysis[s.id];
              statusColor = analysis && analysis.skor >= 75
                ? 'bg-purple-900/60 text-purple-300 border-purple-700/60 hover:bg-purple-800'
                : 'bg-amber-900/60 text-amber-300 border-amber-700/60 hover:bg-amber-800';
            } else if (s.tipe === 'wawancara') {
              const analysis = interviewAnalysis[s.id];
              statusColor = analysis && analysis.skor >= 80
                ? 'bg-teal-900/60 text-teal-300 border-teal-700/60 hover:bg-teal-800'
                : 'bg-blue-900/60 text-blue-300 border-blue-700/60 hover:bg-blue-800';
            }

            return (
              <button
                key={s.id}
                onClick={() => onReviewQuestion(idx)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center ${statusColor}`}
                title={`Soal #${idx + 1} (${s.tipe})`}
              >
                <span>{idx + 1}</span>
                <span className="text-[9px] opacity-70">
                  {s.tipe === 'pilihan_ganda' ? 'PG' : s.tipe === 'esai_kasus' ? 'Esai' : 'Wwn'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
