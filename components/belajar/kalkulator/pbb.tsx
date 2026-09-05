'use client';

import { useState } from 'react';
import { formatRupiah, formatInputRupiah, parseInputNumber } from '@/lib/utils';
import { AiCalculatorChecker } from './ai-calculator-checker';

export function KalkulatorPBB() {
  const [njopBumi, setNjopBumi] = useState('');
  const [njopBangunan, setNjopBangunan] = useState('');
  const [njoptkp, setNjoptkp] = useState('12000000');
  const [persenNjkp, setPersenNjkp] = useState<20 | 40>(20);
  const [result, setResult] = useState<{
    njopTotal: number;
    njopKenaPajak: number;
    njkp: number;
    pbb: number;
  } | null>(null);

  const TARIF_PBB = 0.005; // 0.5%

  const handleHitung = () => {
    const bumi = parseInputNumber(njopBumi);
    const bangunan = parseInputNumber(njopBangunan);
    const tkp = parseInputNumber(njoptkp);

    const njopTotal = bumi + bangunan;
    const njopKenaPajak = Math.max(0, njopTotal - tkp);
    const njkp = njopKenaPajak * (persenNjkp / 100);
    const pbb = njkp * TARIF_PBB;

    setResult({ njopTotal, njopKenaPajak, njkp, pbb });
  };

  return (
    <div className="space-y-4 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
            NJOP Bumi (Rp)
          </label>
          <input
            id="pbbNjopBumi"
            type="text"
            value={njopBumi}
            onChange={(e) => setNjopBumi(formatInputRupiah(e.target.value))}
            placeholder="Contoh: Rp 500.000.000"
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
          />
          
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
            NJOP Bangunan (Rp)
          </label>
          <input
            id="pbbNjopBangunan"
            type="text"
            value={njopBangunan}
            onChange={(e) => setNjopBangunan(formatInputRupiah(e.target.value))}
            placeholder="Contoh: Rp 300.000.000"
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
          />
          
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
          NJOPTKP (Rp)
        </label>
        <input
          id="pbbNjoptkp"
          type="text"
          value={njoptkp}
          onChange={(e) => setNjoptkp(formatInputRupiah(e.target.value))}
          className="w-full px-3 py-2 rounded-lg text-sm border"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          NJOPTKP default Rp12.000.000 (bervariasi per daerah)
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
          Persentase NJKP
        </label>
        <div className="flex gap-2">
          {([20, 40] as const).map((p) => (
            <button
              key={p}
              id={`pbbNjkp${p}`}
              onClick={() => setPersenNjkp(p)}
              className="flex-1 py-2 rounded-lg text-sm transition-default"
              style={
                persenNjkp === p
                  ? { background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.4)' }
                  : { background: 'var(--bg-base)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {p}%
            </button>
          ))}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          20% jika NJOP &lt; Rp1M · 40% jika NJOP ≥ Rp1M
        </p>
      </div>

      <div className="flex gap-3">
        <button
          id="pbbHitungBtn"
          onClick={handleHitung}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all"
          style={{ background: 'linear-gradient(135deg, var(--primary), #1d4ed8)' }}
        >
          Hitung PBB
        </button>
        <button
          id="pbbResetBtn"
          onClick={() => {
            setNjopBumi('');
            setNjopBangunan('');
            setResult(null);
          }}
          className="px-4 py-2.5 rounded-lg text-sm border"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          Reset
        </button>
      </div>

      {result && (
        <>
          <div className="rounded-xl p-4 space-y-3 animate-fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
              Step-by-step PBB
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>1. NJOP Total (Tanah + Bangunan)</span>
                <span style={{ color: 'var(--text-body)' }}>{formatRupiah(result.njopTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>2. Dikurangi NJOPTKP</span>
                <span style={{ color: 'var(--text-muted)' }}>({formatRupiah(parseInputNumber(njoptkp) || 0)})</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>3. NJOP Kena Pajak</span>
                <span className="text-amber-400">{formatRupiah(result.njopKenaPajak)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>4. NJKP ({persenNjkp}%)</span>
                <span style={{ color: 'var(--text-body)' }}>{formatRupiah(result.njkp)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-heading)' }}>PBB Terutang (0,5% × NJKP)</span>
                <span className="text-green-400">{formatRupiah(result.pbb)}</span>
              </div>
            </div>
          </div>

          <AiCalculatorChecker
            namaKalkulator="Kalkulator PBB (Pajak Bumi dan Bangunan)"
            inputData={{
              'NJOP Bumi': formatRupiah(parseInputNumber(njopBumi)),
              'NJOP Bangunan': formatRupiah(parseInputNumber(njopBangunan)),
              'NJOP Total': formatRupiah(result.njopTotal),
              'NJOPTKP': formatRupiah(parseInputNumber(njoptkp) || 0),
              'Persentase NJKP': `${persenNjkp}%`,
            }}
            hasilData={{
              'NJOP Kena Pajak': formatRupiah(result.njopKenaPajak),
              'NJKP': formatRupiah(result.njkp),
              'PBB Terutang': formatRupiah(result.pbb),
            }}
            rumus={`PBB = 0,5% × ${persenNjkp}% × (NJOP Total - NJOPTKP) = ${formatRupiah(result.pbb)}`}
          />
        </>
      )}
    </div>
  );
}