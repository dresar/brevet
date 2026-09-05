'use client';

import { useState } from 'react';
import { Calculator, Sparkles, Copy, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { KalkulatorPPN } from '@/components/belajar/kalkulator/ppn';
import { KalkulatorPPh21TER } from '@/components/belajar/kalkulator/pph21-ter';
import { KalkulatorPBB } from '@/components/belajar/kalkulator/pbb';
import { KalkulatorBPHTB } from '@/components/belajar/kalkulator/bphtb';
import { KalkulatorPPhOP } from '@/components/belajar/kalkulator/pph-op';
import { KalkulatorPPhBadan } from '@/components/belajar/kalkulator/pph-badan';
import { AppHeader } from '@/components/navigation/app-header';

type CalcKey = 'ppn' | 'pph21' | 'pph-op' | 'pph-badan' | 'pbb' | 'bphtb' | 'claude';

const CALC_TABS: { key: CalcKey; label: string; emoji: string; desc: string; color: string }[] = [
  { key: 'ppn', label: 'PPN', emoji: '🛒', desc: 'Tarif 12% UU HPP', color: 'from-blue-600 to-sky-600' },
  { key: 'pph21', label: 'PPh 21 TER', emoji: '👤', desc: 'Tarif Efektif Rata-Rata PP 58/2023', color: 'from-indigo-600 to-purple-600' },
  { key: 'pph-op', label: 'PPh OP', emoji: '📊', desc: 'Pasal 17 Progresif 5%–35%', color: 'from-violet-600 to-fuchsia-600' },
  { key: 'pph-badan', label: 'PPh Badan', emoji: '🏢', desc: 'Tarif 22% + Fasilitas Pasal 31E', color: 'from-emerald-600 to-teal-600' },
  { key: 'pbb', label: 'PBB', emoji: '🏠', desc: 'Pajak Bumi dan Bangunan', color: 'from-amber-600 to-orange-600' },
  { key: 'bphtb', label: 'BPHTB', emoji: '📝', desc: 'Bea Perolehan Hak atas Tanah & Bangunan', color: 'from-rose-600 to-pink-600' },
  { key: 'claude', label: 'Prompt AI', emoji: '🤖', desc: 'Generate Soal Kasus via Claude AI', color: 'from-slate-600 to-slate-700' },
];

const CLAUDE_PROMPTS: { title: string; prompt: string }[] = [
  {
    title: '📊 100 Soal Simulasi Kalkulator PPN (12%)',
    prompt: `Kamu adalah Konsultan Pajak Senior dan Ahli Brevet AB. Buatkan 20 soal latihan simulasi perhitungan PPN yang beragam dan realistis, mencakup berbagai kasus nyata dunia usaha Indonesia tahun 2026. Setiap soal harus:
- Menyajikan skenario bisnis konkret dengan angka nyata (nilai transaksi, jenis barang/jasa, kondisi khusus)
- Menyertakan pertanyaan yang jelas (berapa PPN terutang? Berapa total harga?)
- Menggunakan tarif PPN yang benar per UU HPP 2021: 12% untuk umum, 0% untuk ekspor
- Menyertakan pembahasan lengkap step-by-step dengan rumus LaTeX: $$ \\text{PPN} = \\text{Tarif} \\times \\text{DPP} $$
- Menyebutkan pasal hukum yang relevan (UU PPN, UU HPP)
- Beragam: mulai dari kasus sederhana hingga kasus kompleks (penyerahan, impor, ekspor, PKP non-PKP)

Format output: JSON valid dengan struktur:
{
  "soal": [
    {
      "id": "q-ppn-1",
      "pertanyaan": "...",
      "tipe": "pilihan_ganda",
      "pilihan": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "jawaban": "A",
      "pembahasan": "..."
    }
  ]
}

Mulai langsung dari '{'.`,
  },
  {
    title: '👤 100 Soal Hitung PPh 21 (TER + Tarif Umum)',
    prompt: `Kamu adalah Konsultan Pajak Senior dan Ahli Perhitungan PPh 21 Brevet AB. Buatkan 20 soal latihan simulasi perhitungan PPh 21 karyawan yang beragam dan realistis untuk tahun pajak 2026, mencakup:
- Perhitungan PPh 21 metode TER (Tarif Efektif Rata-Rata sesuai PP 58/2023 — wajib sejak Januari 2024)
- Berbagai kategori TER: A (TK/0), B (K/0, K/1), C (K/2, K/3)
- Metode gross, gross-up, dan net
- Tunjangan hari raya dan bonus
- Kasus karyawan pindah keluar dan masuk di tengah tahun
- Pemberhentian karyawan dan penghitungan PPh 21 akhir tahun

Setiap soal harus menyertakan:
- Data lengkap karyawan (status PTKP, penghasilan bruto, tunjangan, iuran)
- Rumus LaTeX: $$ \\text{PPh 21} = \\text{Penghasilan Bruto} \\times \\text{Tarif TER} $$
- Pembahasan step-by-step yang sangat rinci (hitung TER, kalikan, bandingkan dengan tarif umum Desember)
- Referensi PP 58/2023, PMK terkait PTKP

Format output JSON dengan properti "soal". Mulai langsung dari '{'.`,
  },
  {
    title: '🏢 100 Soal Hitung PPh Badan (Pasal 17 + 31E)',
    prompt: `Kamu adalah Konsultan Pajak Senior dan Ahli PPh Badan Brevet AB. Buatkan 20 soal latihan simulasi perhitungan PPh Badan yang beragam dan realistis untuk tahun pajak 2026, mencakup:
- Perhitungan PPh Badan tarif umum 22% (Pasal 17 ayat 2a UU PPh)
- Perhitungan PKP dengan fasilitas pengurangan tarif 50% (Pasal 31E) untuk peredaran bruto ≤ Rp 50 miliar
- Menghitung proporsi PKP yang mendapat fasilitas: (Rp 4,8 miliar / Peredaran Bruto) × PKP
- Kredit pajak PPh 23 dan PPh 25 angsuran
- Koreksi fiskal positif dan negatif (biaya non-deduktible)
- Kompensasi kerugian fiskal antar tahun pajak

Rumus LaTeX wajib: $$ \\text{PKP Fasilitas} = \\frac{\\text{Rp 4.800.000.000}}{\\text{Peredaran Bruto}} \\times \\text{PKP} $$

Format output JSON dengan properti "soal". Setiap soal harus menyertakan pembahasan angka step-by-step sangat rinci. Mulai langsung dari '{'.`,
  },
  {
    title: '🏠 100 Soal Hitung PBB & BPHTB',
    prompt: `Kamu adalah Konsultan Pajak Senior dan Ahli PBB-BPHTB Brevet AB. Buatkan 20 soal latihan simulasi perhitungan PBB dan BPHTB yang beragam dan realistis untuk tahun 2026, mencakup:
- Perhitungan PBB: NJOP, NJOPTKP, NJKP, tarif 0,5% (PBB-P2), PBB kehutanan/perkebunan
- Perhitungan BPHTB: jual beli, hibah, waris, lelang
- BPHTB waris = 50% × Tarif × (NJOP - NPOPTKP Waris Rp 300 juta per kabupaten/kota)
- BPHTB jual beli = 5% × (NJOP atau Harga Transaksi — mana lebih tinggi - NPOPTKP)
- Kasus properti komersial dengan BPHTB minimal
- Kredit pajak BPHTB terhadap PPh Final Pasal 4(2)

Rumus LaTeX wajib: $$ \\text{BPHTB} = 5\\% \\times (\\text{NPOP} - \\text{NPOPTKP}) $$

Format output JSON dengan properti "soal". Setiap soal harus menyertakan pembahasan sangat rinci. Mulai langsung dari '{'.`,
  },
];

export default function KalkulatorToolsPage() {
  const [activeTab, setActiveTab] = useState<CalcKey>('ppn');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2500);
  };

  return (
    <div className="min-h-dvh bg-[#070b13] text-slate-200 pb-20 sm:pb-12">
      {/* Header */}
      <AppHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0c1529] to-[#0a0f1e] p-4 sm:p-7">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles size={14} className="animate-pulse" />
              6 Kalkulator Pajak Interaktif
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white mb-1.5">
              Simulasi Perhitungan Pajak Brevet AB
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
              Latihan perhitungan pajak secara interaktif: masukkan angka, hitung otomatis, dan dapatkan verifikasi AI dengan referensi hukum perpajakan terkini 2026. Juga tersedia prompt Claude AI untuk generate ratusan soal kasus hitungan.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 sm:gap-2">
          {CALC_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                activeTab === tab.key
                  ? `bg-gradient-to-br ${tab.color} border-transparent text-white shadow-lg scale-[1.03]`
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <span className="text-lg leading-none">{tab.emoji}</span>
              <span className="text-[10px] sm:text-xs font-bold leading-tight">{tab.label}</span>
              {activeTab === tab.key && (
                <span className="hidden sm:block text-[9px] opacity-80 leading-tight">{tab.desc}</span>
              )}
            </button>
          ))}
        </div>

        {/* Active Calculator */}
        {activeTab !== 'claude' && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
            {/* Calculator Header */}
            <div className={`p-4 bg-gradient-to-r ${CALC_TABS.find(t => t.key === activeTab)?.color} opacity-90`}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{CALC_TABS.find(t => t.key === activeTab)?.emoji}</span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Kalkulator {CALC_TABS.find(t => t.key === activeTab)?.label}
                  </h3>
                  <p className="text-[11px] text-white/70">{CALC_TABS.find(t => t.key === activeTab)?.desc}</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {activeTab === 'ppn' && <KalkulatorPPN />}
              {activeTab === 'pph21' && <KalkulatorPPh21TER />}
              {activeTab === 'pph-op' && <KalkulatorPPhOP />}
              {activeTab === 'pph-badan' && <KalkulatorPPhBadan />}
              {activeTab === 'pbb' && <KalkulatorPBB />}
              {activeTab === 'bphtb' && <KalkulatorBPHTB />}
            </div>
          </div>
        )}

        {/* Claude AI Prompt Tab */}
        {activeTab === 'claude' && (
          <div className="space-y-5">
            <div className="bg-[#0F172A] border border-purple-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                  <Sparkles className="text-purple-400" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Prompt AI External (Claude)</h3>
                  <p className="text-[11px] text-slate-400">
                    Salin prompt di bawah dan kirim ke Claude AI untuk generate 20–100 soal latihan hitung-hitungan pajak Brevet AB siap impor
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap text-[10px]">
                <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full font-semibold">✓ Format JSON siap impor</span>
                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full font-semibold">✓ LaTeX Math ($$ ... $$)</span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-semibold">✓ Pembahasan super detail</span>
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-semibold">✓ Referensi Hukum 2026</span>
              </div>
            </div>

            <div className="space-y-4">
              {CLAUDE_PROMPTS.map((p, idx) => (
                <div key={idx} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white">{p.title}</h4>
                    <button
                      onClick={() => handleCopy(p.prompt, idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        copiedIdx === idx
                          ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-purple-500/50 hover:text-purple-300'
                      }`}
                    >
                      {copiedIdx === idx ? (
                        <><CheckCircle2 size={13} /> Tersalin!</>
                      ) : (
                        <><Copy size={13} /> Salin Prompt</>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-[11px] text-slate-400 leading-relaxed overflow-auto max-h-48 whitespace-pre-wrap font-mono">
                    {p.prompt}
                  </pre>
                  <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between gap-3 text-[11px]">
                    <span className="text-slate-500">Setelah generate, impor JSON di halaman <strong className="text-slate-300">Kuis Hitungan Pajak</strong> admin panel</span>
                    <Link
                      href="/admin/quiz-perhitungan"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold shrink-0 transition"
                    >
                      Buka Admin Panel <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
