'use client';

import { useState } from 'react';
import { formatRupiah, formatInputRupiah, parseInputNumber } from '@/lib/utils';
import { AiCalculatorChecker } from './ai-calculator-checker';

// PPh Badan Tarif 2024-2026
// - Tarif umum: 22% (Pasal 17 ayat (2a) UU PPh)
// - Fasilitas Pasal 31E: tarif 50% dikurangi untuk peredaran bruto ≤ Rp 50M (yang kena: hanya porsi Rp4,8M pertama dari PKP)
// - PKP Fasilitas = (Rp 4.800.000.000 / Peredaran Bruto) × PKP
const TARIF_UMUM = 0.22;
const FASILITAS_BATAS_PEREDARAN = 50_000_000_000;
const FASILITAS_BATAS_PKP = 4_800_000_000;

export function KalkulatorPPhBadan() {
  const [peredaran, setPeredaran] = useState('');
  const [pkp, setPkp] = useState('');
  const [useFasilitas31E, setUseFasilitas31E] = useState(true);

  interface PPHBadanResult {
    peredaranNum: number;
    pkpNum: number;
    pkpFasilitas: number;
    pkpNonFasilitas: number;
    pphFasilitas: number;
    pphNonFasilitas: number;
    totalPph: number;
    tarif31EEffektif: string;
  }

  const [result, setResult] = useState<PPHBadanResult | null>(null);

  const handleHitung = () => {
    const peredaranNum = parseInputNumber(peredaran);
    const pkpNum = parseFloat(pkp.replace(/[^0-9]/g, '')) || 0;
    if (peredaranNum <= 0 || pkpNum <= 0) return;

    const eligibleFasilitas = useFasilitas31E && peredaranNum <= FASILITAS_BATAS_PEREDARAN;

    if (eligibleFasilitas) {
      // Proporsi PKP yang mendapat fasilitas (porsi Rp 4,8M dari peredaran)
      const rasio = Math.min(FASILITAS_BATAS_PKP / peredaranNum, 1);
      const pkpFasilitas = Math.round(rasio * pkpNum);
      const pkpNonFasilitas = pkpNum - pkpFasilitas;

      // Fasilitas: tarif 50% × 22% = 11%
      const pphFasilitas = pkpFasilitas * (TARIF_UMUM * 0.5);
      const pphNonFasilitas = pkpNonFasilitas * TARIF_UMUM;
      const totalPph = pphFasilitas + pphNonFasilitas;

      // Effective rate of fasilitas portion
      const tarifEffektif = ((totalPph / pkpNum) * 100).toFixed(2);

      setResult({
        peredaranNum,
        pkpNum,
        pkpFasilitas,
        pkpNonFasilitas,
        pphFasilitas,
        pphNonFasilitas,
        totalPph,
        tarif31EEffektif: `${tarifEffektif}%`,
      });
    } else {
      // Tarif flat 22% tanpa fasilitas
      const totalPph = pkpNum * TARIF_UMUM;
      setResult({
        peredaranNum,
        pkpNum,
        pkpFasilitas: 0,
        pkpNonFasilitas: pkpNum,
        pphFasilitas: 0,
        pphNonFasilitas: totalPph,
        totalPph,
        tarif31EEffektif: '22%',
      });
    }
  };

  const peredaranNum = parseFloat(peredaran.replace(/[^0-9]/g, '')) || 0;
  const isEligible = useFasilitas31E && peredaranNum > 0 && peredaranNum <= FASILITAS_BATAS_PEREDARAN;

  return (
    <div className="space-y-4 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            Peredaran Bruto Setahun (Rp)
          </label>
          <input
            type="text"
            value={peredaran}
            onChange={(e) => setPeredaran(formatInputRupiah(e.target.value))}
            placeholder="Contoh: Rp 4.800.000.000"
            className="w-full px-3 py-2.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
          {peredaran && (
            <p className="text-xs mt-1 font-mono">
              <span className={isEligible ? 'text-emerald-400' : 'text-amber-400'}>
                {isEligible ? '✅ Memenuhi Syarat Fasilitas Pasal 31E' : '⚠️ Tidak Memenuhi Syarat (> Rp 50M)'}
              </span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            PKP (Penghasilan Kena Pajak) Setahun (Rp)
          </label>
          <input
            type="text"
            value={pkp}
            onChange={(e) => setPkp(formatInputRupiah(e.target.value))}
            placeholder="Contoh: 800000000"
            className="w-full px-3 py-2.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="fasilitas31e"
          type="checkbox"
          checked={useFasilitas31E}
          onChange={(e) => setUseFasilitas31E(e.target.checked)}
          className="w-4 h-4 accent-emerald-500"
        />
        <label htmlFor="fasilitas31e" className="text-xs text-slate-300 cursor-pointer">
          Gunakan Fasilitas Pengurangan Tarif 50% (Pasal 31E) — Peredaran Bruto ≤ Rp 50 Miliar
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleHitung}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-md transition-all"
        >
          Hitung PPh Badan
        </button>
        <button
          onClick={() => { setPeredaran(''); setPkp(''); setResult(null); }}
          className="px-4 py-2.5 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-white transition"
        >
          Reset
        </button>
      </div>

      {result && (
        <>
          <div className="rounded-xl p-4 space-y-3 animate-fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
              Hasil Perhitungan PPh Badan
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Peredaran Bruto</span>
                <span style={{ color: 'var(--text-body)' }}>{formatRupiah(result.peredaranNum)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Penghasilan Kena Pajak (PKP)</span>
                <span style={{ color: 'var(--text-body)' }}>{formatRupiah(result.pkpNum)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Skema Fasilitas</span>
                <span className="text-amber-400 font-semibold">{result.tarif31EEffektif}</span>
              </div>

              {result.pkpFasilitas > 0 && result.pkpNonFasilitas > 0 && (
                <div className="rounded-lg p-2.5 space-y-1 text-xs" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between">
                    <span>PKP Fasilitas (11%):</span>
                    <span>{formatRupiah(result.pkpFasilitas)} → {formatRupiah(result.pphFasilitas)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PKP Non-Fasilitas (22%):</span>
                    <span>{formatRupiah(result.pkpNonFasilitas)} → {formatRupiah(result.pphNonFasilitas)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between font-bold border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-heading)' }}>Total PPh Badan Terutang</span>
                <span className="text-green-400">{formatRupiah(result.totalPph)}</span>
              </div>
            </div>
          </div>

          <AiCalculatorChecker
            namaKalkulator="Kalkulator PPh Badan (Pasal 31E & Umum)"
            inputData={{
              'Peredaran Bruto': formatRupiah(result.peredaranNum),
              'Penghasilan Kena Pajak (PKP)': formatRupiah(result.pkpNum),
              'Skema': result.tarif31EEffektif,
            }}
            hasilData={{
              'PKP Fasilitas (11%)': formatRupiah(result.pkpFasilitas),
              'PKP Non-Fasilitas (22%)': formatRupiah(result.pkpNonFasilitas),
              'Total PPh Terutang': formatRupiah(result.totalPph),
            }}
            rumus={`PPh Badan Terutang = ${formatRupiah(result.totalPph)}`}
          />
        </>
      )}
    </div>
  );
}