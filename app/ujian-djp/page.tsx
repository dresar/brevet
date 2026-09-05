'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  BookOpen,
  FileText,
  UserCheck,
  Scale,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Play,
  Zap,
} from 'lucide-react';
import { DJPCbtExam } from '@/components/djp/djp-cbt-exam';
import type { ExamMode } from '@/lib/djp-types';
import { AppHeader } from '@/components/navigation/app-header';

export default function UjianDjpPage() {
  const [activeCbtMode, setActiveCbtMode] = useState<ExamMode | null>(null);

  if (activeCbtMode) {
    return <DJPCbtExam initialMode={activeCbtMode} onClose={() => setActiveCbtMode(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 selection:bg-blue-600 pb-36 sm:pb-24">
      {/* ── Sticky Header ── */}
      <AppHeader />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-6 pb-8 sm:pt-12 sm:pb-14 px-4 sm:px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] sm:w-[700px] h-[250px] sm:h-[350px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-900/90 border border-slate-700 text-slate-300">
            <Sparkles size={13} className="text-yellow-400" />
            <span>100 Bank Soal Standar Seleksi Pegawai DJP</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
            Simulasi Ujian Masuk Pegawai <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
              Direktorat Jenderal Pajak
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Tryout seleksi komprehensif: <strong>50 TKB CAT</strong>, <strong>25 Esai Kasus Pajak</strong> dengan AI Evaluator, dan <strong>25 Wawancara Integritas</strong> dengan Interactive AI Coach & Audio TTS.
          </p>
        </div>
      </section>

      {/* ── 4 Exam Mode Cards ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-white">Pilih Mode Latihan & Simulasi Ujian</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pilih paket komprehensif atau fokus pada tahapan seleksi yang ingin Anda latih.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Mode 1: All 100 Master */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border border-blue-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 shadow-2xl flex flex-col justify-between group hover:border-blue-400 transition-all">
            <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
              🔥 Rekomendasi Utama
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Award size={26} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  Tryout Akbar 100 Soal Master Seleksi DJP
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Simulasi lengkap seluruh tahapan: 50 TKB CAT + 25 Esai Analisis Kasus + 25 Skenario Wawancara AI.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1">
                  <Clock size={12} className="text-yellow-400" /> 120 Menit
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1">
                  <FileText size={12} className="text-blue-400" /> 100 Soal
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1">
                  <TrendingUp size={12} className="text-emerald-400" /> Passing Grade: 75
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveCbtMode('all-100')}
              className="mt-6 w-full py-3 rounded-2xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]"
            >
              <span>Mulai Tryout 100 Soal</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mode 2: TKB 50 CAT */}
          <div className="rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 hover:border-slate-700 shadow-xl flex flex-col justify-between group transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <FileText size={26} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Mode TKB CAT Pilihan Ganda (50 Soal)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Latihan khusus Tes Kompetensi Bidang Perpajakan: UU KUP, PPh 21 TER, PPh Badan, PPN 11-12%, Coretax, & Nilai Kemenkeu.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1">
                  <Clock size={12} className="text-yellow-400" /> 60 Menit
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                  50 Soal CAT CBT
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveCbtMode('tkb-50')}
              className="mt-6 w-full py-3 rounded-2xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]"
            >
              <span>Mulai Mode TKB CAT</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mode 3: Esai 25 Kasus */}
          <div className="rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 hover:border-slate-700 shadow-xl flex flex-col justify-between group transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Scale size={26} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  Mode Esai Studi Kasus Pajak (25 Soal)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Analisis kasus riil: Rekonsiliasi fiskal, Transfer Pricing, Tax Avoidance vs Evasion, Natura PMK 66/2023 dengan AI Evaluator.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1">
                  <Clock size={12} className="text-yellow-400" /> 45 Menit
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                  25 Kasus + AI Scoring
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveCbtMode('esai-25')}
              className="mt-6 w-full py-3 rounded-2xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]"
            >
              <span>Mulai Mode Esai Kasus</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mode 4: Wawancara 25 Skenario */}
          <div className="rounded-3xl p-6 sm:p-7 border border-slate-800 bg-slate-900/80 hover:border-slate-700 shadow-xl flex flex-col justify-between group transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <UserCheck size={26} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                  Mode Simulasi Wawancara AI (25 Skenario)
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Latihan wawancara tatap muka virtual: Uji integritas, anti-gratifikasi, metode STAR, audio TTS, & feedback panelis AI.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1">
                  <Clock size={12} className="text-yellow-400" /> 45 Menit
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                  25 Skenario STAR & Voice TTS
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveCbtMode('wawancara-25')}
              className="mt-6 w-full py-3 rounded-2xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02]"
            >
              <span>Mulai Simulasi Wawancara</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Key Topics Grid ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <BookOpen size={18} />
            <span>Kisi-Kisi & Landasan Regulasi Resmi yang Diujikan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">🏛️ KUP & UU HPP No. 7/2021</strong>
              <p className="text-slate-400">Integrasi NIK-NPWP, Surat Ketetapan, Keberatan, Banding, & Sanksi Bunga KMK.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">💼 PPh 21 TER (PMK 168/2023)</strong>
              <p className="text-slate-400">Skema TER Bulanan A/B/C, TER Harian, Tenaga Ahli Bukan Pegawai, & Masa Desember.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">🏢 PPh Badan & Potput</strong>
              <p className="text-slate-400">Fasilitas 31E, Rekonsiliasi Fiskal, Natura PMK 66/2023, PPh 22/23/26, & PP 55/2022.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">🧾 PPN & PPnBM (11%-12%)</strong>
              <p className="text-slate-400">Faktur Pajak e-Faktur 4.0, Pengkreditan Pajak Masukan, & KMS Bangun Sendiri.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">💻 Coretax System & PSIAP</strong>
              <p className="text-slate-400">Taxpayer Account Management (TAM), CRM Kepatuhan, SKB Online, & e-Bupot.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <strong className="text-white block mb-1">⚖️ Nilai Kemenkeu & Kode Etik</strong>
              <p className="text-slate-400">PMK 190/2018, PP 94/2021 Disiplin PNS, Anti-Gratifikasi, & Metode STAR Wawancara.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
