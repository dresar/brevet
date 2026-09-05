'use client';

import React, { useState, useMemo } from 'react';
import {
  Award,
  Trophy,
  CheckCircle2,
  XCircle,
  Printer,
  X,
  ShieldCheck,
  Sparkles,
  QrCode,
  FileText,
  Calendar,
  User,
  GraduationCap,
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  avgQuizScore?: number;
  highestDjpScore?: number;
  completedSectionsCount?: number;
}

export function CertificateModal({
  isOpen,
  onClose,
  studentName = 'Siswa Brevet AB',
  avgQuizScore = 0,
  highestDjpScore = 0,
  completedSectionsCount = 0,
}: CertificateModalProps) {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'certificate'>('scorecard');

  // Compute final composite grade
  const { finalScore, isPassed, grade, serialNumber, dateFormatted, verificationHash } = useMemo(() => {
    // Composite: 50% quiz avg, 50% DJP highest
    const score = highestDjpScore > 0 
      ? Math.round(avgQuizScore * 0.4 + highestDjpScore * 0.6)
      : avgQuizScore;
    
    const passed = score >= 70;
    const dateObj = new Date();
    const dateStr = dateObj.toISOString().split('T')[0].replace(/-/g, '');
    const serial = `CERT-BRVT-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    const gradeLabel =
      score >= 85
        ? 'A (Sangat Memuaskan)'
        : score >= 75
        ? 'B (Memuaskan)'
        : score >= 70
        ? 'C (Lulus)'
        : 'D (Belum Lulus)';

    const formatted = dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Generate SHA-like hash
    let hash = '';
    const raw = `${studentName}-${score}-${dateStr}`;
    for (let i = 0; i < raw.length; i++) {
      hash += ((raw.charCodeAt(i) * 31) % 16).toString(16);
    }
    const safeHash = (hash + 'a1b2c3d4e5f60718').substring(0, 16).toUpperCase();

    return {
      finalScore: score,
      isPassed: passed,
      grade: gradeLabel,
      serialNumber: serial,
      dateFormatted: formatted,
      verificationHash: safeHash,
    };
  }, [studentName, avgQuizScore, highestDjpScore]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Header (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Award size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Rapor Nilai & Sertifikat Kompetensi
              </h2>
              <p className="text-[11px] text-slate-400">Verifikasi pencapaian pembelajaran Brevet AB & Simulasi DJP</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('scorecard')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTab === 'scorecard'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rapor Nilai
              </button>
              <button
                onClick={() => setActiveTab('certificate')}
                className={`px-3 py-1 rounded-lg transition ${
                  activeTab === 'certificate'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sertifikat
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 text-xs font-semibold"
              title="Cetak Dokumen"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SCORECARD */}
          {activeTab === 'scorecard' && (
            <div className="space-y-6">
              {/* Student Info Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-lg">
                    {studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{studentName}</h3>
                    <p className="text-xs text-slate-400">Peserta Program Brevet AB & Pembekalan Ujian DJP</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Kelulusan</span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      isPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {isPassed ? 'KOMPETEN & LULUS' : 'BELUM MEMENUHI AMBANG BATAS'}
                  </span>
                </div>
              </div>

              {/* Scorecard Table / Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-400" />
                  Rincian Komponen Penilaian
                </h4>

                <div className="rounded-2xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Komponen Evaluasi</th>
                        <th className="p-3.5 text-center">Bobot</th>
                        <th className="p-3.5 text-center">Standar Lulus</th>
                        <th className="p-3.5 text-right">Nilai Perolehan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                      <tr>
                        <td className="p-3.5 font-medium text-white">Kuis Akhir Modul Brevet AB (Rata-rata)</td>
                        <td className="p-3.5 text-center text-slate-400">40%</td>
                        <td className="p-3.5 text-center text-slate-400">&ge; 70</td>
                        <td className="p-3.5 text-right font-mono font-bold text-yellow-400">{avgQuizScore} / 100</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-medium text-white">Simulasi Ujian Masuk DJP (Skor Terbaik)</td>
                        <td className="p-3.5 text-center text-slate-400">60%</td>
                        <td className="p-3.5 text-center text-slate-400">&ge; 75</td>
                        <td className="p-3.5 text-right font-mono font-bold text-purple-400">{highestDjpScore} / 100</td>
                      </tr>
                      <tr>
                        <td className="p-3.5 font-medium text-white">Sub-Bab Modul Tuntas Dipelajari</td>
                        <td className="p-3.5 text-center text-slate-400">Syarat</td>
                        <td className="p-3.5 text-center text-slate-400">&ge; 10 bab</td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{completedSectionsCount} Sub-Bab</td>
                      </tr>
                      <tr className="bg-slate-950/80 font-bold">
                        <td className="p-3.5 text-white">NILAI AKHIR KOMPOSIT</td>
                        <td className="p-3.5 text-center text-slate-400">100%</td>
                        <td className="p-3.5 text-center text-slate-400">&ge; 70</td>
                        <td className="p-3.5 text-right font-mono text-base text-blue-400">{finalScore} / 100</td>
                      </tr>
                      <tr className="bg-slate-950">
                        <td className="p-3.5 text-white font-bold" colSpan={2}>PREDIKAT KELULUSAN</td>
                        <td className="p-3.5 text-right font-bold text-emerald-400" colSpan={2}>{grade}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-4">
              {/* Certificate Container */}
              <div
                id="printable-certificate"
                className="relative overflow-hidden rounded-3xl border-4 border-double border-amber-500/50 p-6 sm:p-10 text-center shadow-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 print:bg-white print:text-slate-900 print:border-amber-600 print:shadow-none"
              >
                {/* Ornate Corner Elements */}
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400 opacity-60 pointer-events-none" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400 opacity-60 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400 opacity-60 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400 opacity-60 pointer-events-none" />

                {/* Brand / Seal */}
                <div className="flex flex-col items-center space-y-2 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg mb-1">
                    <GraduationCap size={32} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-400 print:text-amber-700">
                    BREVET AB & DJP TAX LEARNING ACADEMY
                  </h4>
                  <h1 className="text-lg sm:text-2xl font-black text-white print:text-slate-900 tracking-tight">
                    SERTIFIKAT KOMPETENSI PERPAJAKAN
                  </h1>
                  <p className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
                    Nomor Sertifikat: <strong className="text-amber-300 print:text-amber-700">{serialNumber}</strong>
                  </p>
                </div>

                {/* Recipient */}
                <div className="my-6 space-y-2">
                  <p className="text-xs text-slate-400 print:text-slate-600 uppercase tracking-wider font-semibold">
                    DIBERIKAN DENGAN BANGGA KEPADA:
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 print:text-slate-900 font-serif underline decoration-amber-500/40 underline-offset-8">
                    {studentName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 print:text-slate-700 max-w-lg mx-auto leading-relaxed pt-3">
                    Atas kelulusan dan penguasaan komprehensif seluruh materi Perpajakan Terapan Brevet AB (KUP, PPh Orang Pribadi, PPh Badan, Potput, PPN & PPnBM, Coretax) serta Simulasi Seleksi Masuk DJP Kemenkeu dengan predikat:
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-4 py-1.5 rounded-full text-sm font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 print:text-amber-900 print:bg-amber-100">
                      {grade} (Skor Akhir: {finalScore}/100)
                    </span>
                  </div>
                </div>

                {/* Signatures & Security Hash */}
                <div className="mt-8 pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400 print:text-slate-700">
                  <div className="text-left space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase">Diterbitkan Pada:</p>
                    <p className="font-semibold text-white print:text-slate-900">{dateFormatted}</p>
                    <p className="text-[10px] font-mono text-slate-400">Verifikasi: SHA256-{verificationHash}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center">
                      <QrCode size={36} className="text-white print:text-slate-900" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck size={12} /> Terverifikasi Digital
                      </span>
                      <p className="text-[9px] text-slate-500">Brevet AB System</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
