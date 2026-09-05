'use client';

import { useState } from 'react';
import { formatRupiah, formatInputRupiah, parseInputNumber } from '@/lib/utils';
import { AiCalculatorChecker } from './ai-calculator-checker';

const TARIF_OPTIONS = [
  { label: '12% (Tarif Umum UU HPP 2026)', value: 0.12 },
  { label: '0% (BKP/JKP Ekspor)', value: 0 },
  { label: '11% (Tarif Lama, sebelum 2025)', value: 0.11 },
];

export function KalkulatorPPN() {
  const [dpp, setDpp] = useState('');
  const [tarif, setTarif] = useState(0.12);
  const [result, setResult] = useState<{ ppn: number; total: number } | null>(null);

  const handleHitung = () => {
    const dppNum = parseInputNumber(dpp);
    if (isNaN(dppNum) || dppNum <= 0) return;
    const ppn = dppNum * tarif;
    setResult({ ppn, total: dppNum + ppn });
  };

  return (
    <div className="space-y-4 ">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
          DPP (Dasar Pengenaan Pajak)
        </label>
        <input
          id="ppnDpp"
          type="text"
          value={dpp}
          onChange={(e) => setDpp(formatInputRupiah(e.target.value))}
          placeholder="Contoh: Rp 1.000.000.000"
          className="w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm border"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
        />
        
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
          Tarif PPN
        </label>
        <select
          id="ppnTarif"
          value={tarif}
          onChange={(e) => setTarif(parseFloat(e.target.value))}
          className="w-full px-3 py-2.5 rounded-lg text-xs sm:text-sm border appearance-none"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
        >
          {TARIF_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          id="ppnHitungBtn"
          onClick={handleHitung}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all"
          style={{ background: 'linear-gradient(135deg, var(--primary), #1d4ed8)' }}
        >
          Hitung PPN
        </button>
        <button
          id="ppnResetBtn"
          onClick={() => { setDpp(''); setResult(null); }}
          className="px-4 py-2.5 rounded-lg text-sm border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          Reset
        </button>
      </div>

      {result && (
        <>
          <div className="rounded-xl p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 animate-fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Hasil Perhitungan</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>DPP</span>
                <span style={{ color: 'var(--text-body)' }}>{formatRupiah(parseInputNumber(dpp))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>PPN ({(tarif * 100)}%)</span>
                <span className="text-amber-400">{formatRupiah(result.ppn)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-heading)' }}>Total</span>
                <span className="text-green-400">{formatRupiah(result.total)}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              💡 <strong>Rumus:</strong> PPN = DPP × Tarif = {formatRupiah(parseInputNumber(dpp))} × {(tarif * 100)}% = {formatRupiah(result.ppn)}
            </div>
          </div>

          <AiCalculatorChecker
            namaKalkulator="Kalkulator PPN (Pajak Pertambahan Nilai)"
            inputData={{
              'DPP (Dasar Pengenaan Pajak)': formatRupiah(parseInputNumber(dpp)),
              'Tarif PPN': `${tarif * 100}%`,
            }}
            hasilData={{
              'PPN Terutang': formatRupiah(result.ppn),
              'Total Pembayaran': formatRupiah(result.total),
            }}
            rumus={`PPN = DPP × Tarif = ${formatRupiah(parseInputNumber(dpp))} × ${tarif * 100}%`}
          />
        </>
      )}
    </div>
  );
}