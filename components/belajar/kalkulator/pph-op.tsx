'use client';

import { useState } from 'react';
import { formatRupiah, formatInputRupiah, parseInputNumber } from '@/lib/utils';
import { AiCalculatorChecker } from './ai-calculator-checker';

// PPh Pasal 17 Progressive Tax Brackets (2024-2026, UU HPP)
const BRACKETS = [
  { max: 60_000_000, rate: 0.05, label: '5%' },
  { max: 250_000_000, rate: 0.15, label: '15%' },
  { max: 500_000_000, rate: 0.25, label: '25%' },
  { max: 5_000_000_000, rate: 0.30, label: '30%' },
  { max: Infinity, rate: 0.35, label: '35%' },
];

// PTKP 2024-2026 Values
const PTKP_OPTIONS = [
  { label: 'TK/0 — Tidak Kawin, 0 Tanggungan (Rp 54.000.000)', value: 54_000_000 },
  { label: 'K/0 — Kawin, 0 Tanggungan (Rp 58.500.000)', value: 58_500_000 },
  { label: 'K/1 — Kawin, 1 Tanggungan (Rp 63.000.000)', value: 63_000_000 },
  { label: 'K/2 — Kawin, 2 Tanggungan (Rp 67.500.000)', value: 67_500_000 },
  { label: 'K/3 — Kawin, 3 Tanggungan (Rp 72.000.000)', value: 72_000_000 },
];

interface BracketDetail {
  bracket: string;
  rate: string;
  taxableAmount: number;
  tax: number;
}

function hitungPPhProgresif(pkp: number): { brackets: BracketDetail[]; total: number } {
  const details: BracketDetail[] = [];
  let remaining = pkp;
  let prevMax = 0;
  let total = 0;

  for (const b of BRACKETS) {
    if (remaining <= 0) break;
    const layerMax = b.max === Infinity ? Infinity : b.max - prevMax;
    const taxableInLayer = Math.min(remaining, layerMax);
    const tax = taxableInLayer * b.rate;
    details.push({
      bracket: b.max === Infinity ? `> Rp ${(prevMax / 1_000_000).toFixed(0)} juta` : `Rp ${(prevMax / 1_000_000).toFixed(0)} juta — Rp ${(b.max / 1_000_000).toFixed(0)} juta`,
      rate: b.label,
      taxableAmount: taxableInLayer,
      tax,
    });
    total += tax;
    remaining -= taxableInLayer;
    prevMax = b.max;
  }

  return { brackets: details, total };
}

export function KalkulatorPPhOP() {
  const [penghasilanBruto, setPenghasilanBruto] = useState('');
  const [biayaJabatan, setBiayaJabatan] = useState(true);
  const [ptkp, setPtkp] = useState(54_000_000);
  const [iuranPensiun, setIuranPensiun] = useState('');

  interface PPhOPResult {
    bruto: number;
    potonganBiayaJabatan: number;
    iuranPensiunNum: number;
    nettoSetahun: number;
    pkp: number;
    pph: { brackets: BracketDetail[]; total: number };
    pphBulanan: number;
  }

  const [result, setResult] = useState<PPhOPResult | null>(null);

  const handleHitung = () => {
    const bruto = parseInputNumber(penghasilanBruto);
    if (bruto <= 0) return;

    const brutoSetahun = bruto * 12;
    // Biaya jabatan: 5% dari penghasilan bruto setahun, max Rp 6.000.000
    const potonganBiayaJabatan = biayaJabatan ? Math.min(brutoSetahun * 0.05, 6_000_000) : 0;
    const iuranPensiunNum = parseInputNumber(iuranPensiun);

    const nettoSetahun = brutoSetahun - potonganBiayaJabatan - iuranPensiunNum;
    const pkp = Math.max(0, nettoSetahun - ptkp);
    // Round down to nearest 1000
    const pkpRounded = Math.floor(pkp / 1000) * 1000;

    const pph = hitungPPhProgresif(pkpRounded);
    const pphBulanan = Math.round(pph.total / 12);

    setResult({
      bruto: brutoSetahun,
      potonganBiayaJabatan,
      iuranPensiunNum,
      nettoSetahun,
      pkp: pkpRounded,
      pph,
      pphBulanan,
    });
  };

  return (
    <div className="space-y-4 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            Penghasilan Bruto / Bulan (Rp)
          </label>
          <input
            type="text"
            value={penghasilanBruto}
            onChange={(e) => setPenghasilanBruto(formatInputRupiah(e.target.value))}
            placeholder="Contoh: Rp 15.000.000"
            className="w-full px-3 py-2.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
          {penghasilanBruto && (
            <p className="text-xs mt-1 text-blue-400 font-mono">{formatRupiah(parseInputNumber(penghasilanBruto) * 12)} / tahun</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            PTKP (Status Kawin &amp; Tanggungan)
          </label>
          <select
            value={ptkp}
            onChange={(e) => setPtkp(parseFloat(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
          >
            {PTKP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
            Iuran Pensiun Setahun (Rp)
          </label>
          <input
            type="text"
            value={iuranPensiun}
            onChange={(e) => setIuranPensiun(formatInputRupiah(e.target.value))}
            placeholder="Contoh: 1800000"
            className="w-full px-3 py-2.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 pt-4">
          <input
            id="biayaJabatan"
            type="checkbox"
            checked={biayaJabatan}
            onChange={(e) => setBiayaJabatan(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          <label htmlFor="biayaJabatan" className="text-xs text-slate-300 cursor-pointer">
            Kurangkan Biaya Jabatan (5%, maks Rp 500rb/bln)
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleHitung}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md transition-all"
        >
          Hitung PPh OP Pasal 17
        </button>
        <button
          onClick={() => { setPenghasilanBruto(''); setResult(null); }}
          className="px-4 py-2.5 rounded-lg text-sm border border-slate-700 text-slate-400 hover:text-white transition"
        >
          Reset
        </button>
      </div>

      {result && (
        <>
          <div className="rounded-xl p-4 space-y-3 animate-fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
              Hasil Perhitungan PPh OP (UU HPP 2021)
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Penghasilan Bruto Setahun</span>
                <span style={{ color: 'var(--text-body)' }}>{formatRupiah(result.bruto * 12)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Penghasilan Netto Setahun</span>
                <span style={{ color: 'var(--text-body)' }}>{formatRupiah(result.nettoSetahun)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>PTKP</span>
                <span style={{ color: 'var(--text-muted)' }}>({formatRupiah(ptkp)})</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>PKP (Penghasilan Kena Pajak)</span>
                <span className="text-amber-400 font-semibold">{formatRupiah(result.pkp)}</span>
              </div>

              {result.pph.brackets.length > 0 && (
                <div className="rounded-lg p-2.5 space-y-1 text-xs" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="font-semibold text-slate-400 mb-1">Rincian Lapisan Tarif Pasal 17:</p>
                  {result.pph.brackets.map((b, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>Lapisan {b.bracket} ({b.rate} × {formatRupiah(b.taxableAmount)}):</span>
                      <span className="text-amber-300 font-mono">{formatRupiah(b.tax)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between font-bold border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-heading)' }}>Total PPh OP Terutang Setahun</span>
                <span className="text-green-400">{formatRupiah(result.pph.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>PPh OP Terutang per Bulan:</span>
                <span className="text-blue-300 font-semibold">{formatRupiah(result.pphBulanan)}</span>
              </div>
            </div>
          </div>

          <AiCalculatorChecker
            namaKalkulator="Kalkulator PPh Orang Pribadi (Pasal 17 UU HPP)"
            inputData={{
              'Penghasilan Bruto Sebulan': formatRupiah(result.bruto),
              'Penghasilan Netto Setahun': formatRupiah(result.nettoSetahun),
              'PTKP': formatRupiah(ptkp),
            }}
            hasilData={{
              'PKP (Penghasilan Kena Pajak)': formatRupiah(result.pkp),
              'Total PPh OP Terutang Setahun': formatRupiah(result.pph.total),
              'PPh Terutang per Bulan': formatRupiah(result.pphBulanan),
            }}
            rumus={`PKP = Netto Setahun - PTKP; PPh = Progresif Pasal 17 = ${formatRupiah(result.pph.total)}`}
          />
        </>
      )}
    </div>
  );
}