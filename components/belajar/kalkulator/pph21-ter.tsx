'use client';

import { useState } from 'react';
import { formatRupiah, formatInputRupiah, parseInputNumber } from '@/lib/utils';
import { AiCalculatorChecker } from './ai-calculator-checker';

// TER categories by PTKP status (PP 58/2023)
// Category A: TK/0, TK/1, K/0
// Category B: TK/2, TK/3, K/1, K/2, K/I/0
// Category C: K/3, K/I/1, K/I/2, K/I/3

const PTKP_STATUS = [
  { label: 'TK/0 — Tidak Kawin, tanpa tanggungan', ptkp: 54000000, kategori: 'A' },
  { label: 'TK/1 — Tidak Kawin, 1 tanggungan', ptkp: 58500000, kategori: 'A' },
  { label: 'TK/2 — Tidak Kawin, 2 tanggungan', ptkp: 63000000, kategori: 'B' },
  { label: 'TK/3 — Tidak Kawin, 3 tanggungan', ptkp: 67500000, kategori: 'B' },
  { label: 'K/0 — Kawin, tanpa tanggungan', ptkp: 58500000, kategori: 'A' },
  { label: 'K/1 — Kawin, 1 tanggungan', ptkp: 63000000, kategori: 'B' },
  { label: 'K/2 — Kawin, 2 tanggungan', ptkp: 67500000, kategori: 'B' },
  { label: 'K/3 — Kawin, 3 tanggungan', ptkp: 72000000, kategori: 'C' },
];

// TER A rates (monthly gross income brackets)
const TER_A = [
  { min: 0, max: 5400000, tarif: 0.00 },
  { min: 5400000, max: 5650000, tarif: 0.0025 },
  { min: 5650000, max: 5950000, tarif: 0.005 },
  { min: 5950000, max: 6300000, tarif: 0.0075 },
  { min: 6300000, max: 6750000, tarif: 0.01 },
  { min: 6750000, max: 7500000, tarif: 0.0125 },
  { min: 7500000, max: 8550000, tarif: 0.015 },
  { min: 8550000, max: 9650000, tarif: 0.0175 },
  { min: 9650000, max: 10050000, tarif: 0.02 },
  { min: 10050000, max: 10350000, tarif: 0.0225 },
  { min: 10350000, max: 10700000, tarif: 0.025 },
  { min: 10700000, max: 11050000, tarif: 0.0275 },
  { min: 11050000, max: 11600000, tarif: 0.03 },
  { min: 11600000, max: 12500000, tarif: 0.035 },
  { min: 12500000, max: 20008000, tarif: 0.04 },
  { min: 20008000, max: Infinity, tarif: 0.05 },
];

// TER B rates
const TER_B = [
  { min: 0, max: 6200000, tarif: 0.00 },
  { min: 6200000, max: 6500000, tarif: 0.0025 },
  { min: 6500000, max: 6850000, tarif: 0.005 },
  { min: 6850000, max: 7300000, tarif: 0.0075 },
  { min: 7300000, max: 9200000, tarif: 0.01 },
  { min: 9200000, max: 10750000, tarif: 0.015 },
  { min: 10750000, max: 11250000, tarif: 0.02 },
  { min: 11250000, max: 11600000, tarif: 0.025 },
  { min: 11600000, max: 12600000, tarif: 0.03 },
  { min: 12600000, max: 13600000, tarif: 0.035 },
  { min: 13600000, max: 20008000, tarif: 0.04 },
  { min: 20008000, max: Infinity, tarif: 0.05 },
];

// TER C rates
const TER_C = [
  { min: 0, max: 6600000, tarif: 0.00 },
  { min: 6600000, max: 6950000, tarif: 0.0025 },
  { min: 6950000, max: 7350000, tarif: 0.005 },
  { min: 7350000, max: 7800000, tarif: 0.0075 },
  { min: 7800000, max: 8850000, tarif: 0.01 },
  { min: 8850000, max: 9800000, tarif: 0.015 },
  { min: 9800000, max: 10950000, tarif: 0.02 },
  { min: 10950000, max: 11200000, tarif: 0.025 },
  { min: 11200000, max: 12050000, tarif: 0.03 },
  { min: 12050000, max: 12950000, tarif: 0.035 },
  { min: 12950000, max: 20008000, tarif: 0.04 },
  { min: 20008000, max: Infinity, tarif: 0.05 },
];

function getTER(kategori: string, gajiBulanan: number): number {
  const table = kategori === 'A' ? TER_A : kategori === 'B' ? TER_B : TER_C;
  const bracket = table.find((t) => gajiBulanan >= t.min && gajiBulanan < t.max);
  return bracket?.tarif ?? 0;
}

// Pasal 17 progressive rates (UU HPP)
const TARIF_PASAL17 = [
  { min: 0, max: 60000000, tarif: 0.05 },
  { min: 60000000, max: 250000000, tarif: 0.15 },
  { min: 250000000, max: 500000000, tarif: 0.25 },
  { min: 500000000, max: 5000000000, tarif: 0.30 },
  { min: 5000000000, max: Infinity, tarif: 0.35 },
];

function hitungProgresif(penghasilanKenapajakSetahun: number): { lapisan: Array<{ label: string; pajak: number }>; total: number } {
  let sisa = penghasilanKenapajakSetahun;
  let total = 0;
  const lapisan: Array<{ label: string; pajak: number }> = [];

  for (const bracket of TARIF_PASAL17) {
    if (sisa <= 0) break;
    const kena = Math.min(sisa, bracket.max - bracket.min);
    const pajak = kena * bracket.tarif;
    if (kena > 0) {
      lapisan.push({ label: `${(bracket.tarif * 100)}% × ${formatRupiah(kena)}`, pajak });
    }
    total += pajak;
    sisa -= kena;
  }
  return { lapisan, total };
}

export function KalkulatorPPh21TER() {
  const [mode, setMode] = useState<'ter' | 'desember'>('ter');
  const [gaji, setGaji] = useState('');
  const [ptkpIdx, setPtkpIdx] = useState(0);
  // Desember mode
  const [penghasilanNeto, setPenghasilanNeto] = useState('');
  const [result, setResult] = useState<null | { ter: number; pph: number; kategori: string }>(null);
  const [desResult, setDesResult] = useState<null | ReturnType<typeof hitungProgresif>>(null);

  const selectedPtkp = PTKP_STATUS[ptkpIdx];

  const handleHitungTER = () => {
    const g = parseInputNumber(gaji);
    if (isNaN(g) || g <= 0) return;
    const ter = getTER(selectedPtkp.kategori, g);
    const pph = g * ter;
    setResult({ ter, pph, kategori: selectedPtkp.kategori });
  };

  const handleHitungDesember = () => {
    const neto = parseInputNumber(penghasilanNeto);
    if (isNaN(neto) || neto <= 0) return;
    const pkp = Math.max(0, neto - selectedPtkp.ptkp);
    setDesResult(hitungProgresif(pkp));
  };

  return (
    <div className="space-y-4 ">
      <div className="flex rounded-xl p-1 bg-slate-900 border border-slate-800">
        <button
          onClick={() => { setMode('ter'); setResult(null); setDesResult(null); }}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
            mode === 'ter' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          PPh 21 Bulanan (TER)
        </button>
        <button
          onClick={() => { setMode('desember'); setResult(null); setDesResult(null); }}
          className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
            mode === 'desember' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          PPh 21 Tahunan (Desember / Pasal 17)
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
          Status PTKP
        </label>
        <select
          id="pph21PtkpSelect"
          value={ptkpIdx}
          onChange={(e) => setPtkpIdx(parseInt(e.target.value))}
          className="w-full px-3 py-2.5 rounded-lg text-sm border appearance-none"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
        >
          {PTKP_STATUS.map((p, i) => (
            <option key={p.label} value={i}>
              {p.label} — {formatRupiah(p.ptkp)}
            </option>
          ))}
        </select>
      </div>

      {mode === 'ter' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
              Gaji / Penghasilan Bruto Sebulan
            </label>
            <input
              id="pph21Gaji"
              type="text"
              value={gaji}
              onChange={(e) => setGaji(formatInputRupiah(e.target.value))}
              placeholder="Contoh: 8000000"
              className="w-full px-3 py-2.5 rounded-lg text-sm border"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
            />
          </div>

          <div className="flex gap-3">
            <button id="pph21HitungBtn" onClick={handleHitungTER} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md hover:brightness-110 transition" style={{ background: 'linear-gradient(135deg, var(--primary), #1d4ed8)' }}>
              Hitung PPh 21 TER
            </button>
            <button id="pph21ResetBtn" onClick={() => { setGaji(''); setResult(null); }} className="px-4 py-2.5 rounded-lg text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Reset
            </button>
          </div>

          {result && (
            <>
              <div className="rounded-xl p-4 space-y-2 animate-fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Hasil TER Bulanan</p>
                <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>Kategori TER</span><span className="text-blue-400 font-bold">TER {result.kategori}</span></div>
                <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>TER</span><span className="text-amber-400">{(result.ter * 100).toFixed(2)}%</span></div>
                <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>Penghasilan Bruto</span><span style={{ color: 'var(--text-body)' }}>{formatRupiah(parseInputNumber(gaji))}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-heading)' }}>PPh 21 Dipotong</span>
                  <span className="text-green-400">{formatRupiah(result.pph)}</span>
                </div>
                <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>💡 Rumus: PPh 21 = {(result.ter * 100).toFixed(2)}% × {formatRupiah(parseInputNumber(gaji))} = {formatRupiah(result.pph)}</p>
              </div>

              <AiCalculatorChecker
                namaKalkulator="Kalkulator PPh 21 TER (Tarif Efektif Rata-Rata PP 58/2023)"
                inputData={{
                  'Status PTKP': PTKP_STATUS[ptkpIdx].label,
                  'Kategori TER': `TER ${result.kategori}`,
                  'Gaji / Bruto Bulanan': formatRupiah(parseInputNumber(gaji)),
                }}
                hasilData={{
                  'Tarif TER': `${(result.ter * 100).toFixed(2)}%`,
                  'PPh 21 Dipotong Bulanan': formatRupiah(result.pph),
                }}
                rumus={`PPh 21 = ${(result.ter * 100).toFixed(2)}% × ${formatRupiah(parseInputNumber(gaji))}`}
              />
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
              Penghasilan Neto Setahun
            </label>
            <input
              id="pph21NeToSetahun"
              type="text"
              value={penghasilanNeto}
              onChange={(e) => setPenghasilanNeto(formatInputRupiah(e.target.value))}
              placeholder="Contoh: Rp 120.000.000"
              className="w-full px-3 py-2.5 rounded-lg text-sm border"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
            />
          </div>

          <div className="flex gap-3">
            <button id="pph21DesHitungBtn" onClick={handleHitungDesember} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md hover:brightness-110 transition" style={{ background: 'linear-gradient(135deg, var(--primary), #1d4ed8)' }}>
              Hitung PPh 21 Desember
            </button>
            <button id="pph21DesResetBtn" onClick={() => { setPenghasilanNeto(''); setDesResult(null); }} className="px-4 py-2.5 rounded-lg text-sm border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Reset
            </button>
          </div>

          {desResult && (
            <>
              <div className="rounded-xl p-4 space-y-2 animate-fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Perhitungan Progresif Pasal 17</p>
                <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>Penghasilan Neto</span><span style={{ color: 'var(--text-body)' }}>{formatRupiah(parseInputNumber(penghasilanNeto))}</span></div>
                <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-muted)' }}>PTKP ({PTKP_STATUS[ptkpIdx].label.split(' ')[0]})</span><span style={{ color: 'var(--text-body)' }}>{formatRupiah(selectedPtkp.ptkp)}</span></div>
                <div className="flex justify-between text-sm font-medium border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>PKP (Penghasilan Kena Pajak)</span>
                  <span className="text-amber-400">{formatRupiah(Math.max(0, parseInputNumber(penghasilanNeto) - selectedPtkp.ptkp))}</span>
                </div>
                <div className="space-y-1">
                  {desResult.lapisan.map((l, i) => (
                    <div key={i} className="flex justify-between text-xs"><span style={{ color: 'var(--text-muted)' }}>{l.label}</span><span style={{ color: 'var(--text-body)' }}>{formatRupiah(l.pajak)}</span></div>
                  ))}
                </div>
                <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--text-heading)' }}>Total PPh 21 Setahun</span>
                  <span className="text-green-400">{formatRupiah(desResult.total)}</span>
                </div>
              </div>

              <AiCalculatorChecker
                namaKalkulator="Kalkulator PPh 21 Tahunan (Tarif Progresif Pasal 17 UU HPP)"
                inputData={{
                  'Status PTKP': PTKP_STATUS[ptkpIdx].label,
                  'Penghasilan Neto Setahun': formatRupiah(parseInputNumber(penghasilanNeto)),
                  'Nilai PTKP': formatRupiah(selectedPtkp.ptkp),
                  'PKP (Penghasilan Kena Pajak)': formatRupiah(Math.max(0, parseInputNumber(penghasilanNeto) - selectedPtkp.ptkp)),
                }}
                hasilData={{
                  'PPh 21 Terutang Setahun': formatRupiah(desResult.total),
                }}
                rumus="PPh 21 Setahun = Lapisan Tarif Progresif Pasal 17 UU HPP atas PKP"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}