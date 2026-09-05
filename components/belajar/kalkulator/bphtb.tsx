'use client';

import { useState } from 'react';
import { formatRupiah, formatInputRupiah, parseInputNumber } from '@/lib/utils';
import { AiCalculatorChecker } from './ai-calculator-checker';

const TARIF_BPHTB = 0.05; // 5%

export function KalkulatorBPHTB() {
  const [npop, setNpop] = useState('');
  const [npoptkp, setNpoptkp] = useState('60000000');
  const [isWarisHibah, setIsWarisHibah] = useState(false);
  const [result, setResult] = useState<{ npopkp: number; bphtbNormal: number; bphtbAkhir: number } | null>(null);

  const handleHitung = () => {
    const n = parseInputNumber(npop);
    const t = parseInputNumber(npoptkp);
    const npopkp = Math.max(0, n - t);
    const bphtbNormal = npopkp * TARIF_BPHTB;
    const bphtbAkhir = isWarisHibah ? bphtbNormal * 0.5 : bphtbNormal;
    setResult({ npopkp, bphtbNormal, bphtbAkhir });
  };

  return (
    <div className="space-y-4 ">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
          NPOP (Nilai Perolehan Objek Pajak, Rp)
        </label>
        <input
          id="bphtbNpop"
          type="text"
          value={npop}
          onChange={(e) => setNpop(formatInputRupiah(e.target.value))}
          placeholder="Contoh: Rp 500.000.000"
          className="w-full px-3 py-2.5 rounded-lg text-sm border"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
        />
        
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
          NPOPTKP (Rp)
        </label>
        <input
          id="bphtbNpoptkp"
          type="text"
          value={npoptkp}
          onChange={(e) => setNpoptkp(formatInputRupiah(e.target.value))}
          className="w-full px-3 py-2.5 rounded-lg text-sm border"
          style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          NPOPTKP bervariasi per kab/kota, umumnya Rp60-80 juta untuk perolehan jual beli, waris/hibah lebih tinggi.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
          Jenis Perolehan
        </label>
        <div className="flex gap-2">
          {[
            { label: 'Jual Beli / Hibah Biasa', value: false },
            { label: 'Waris / Hibah Wasiat', value: true },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              id={`bphtbJenis-${opt.value}`}
              onClick={() => setIsWarisHibah(opt.value)}
              className="flex-1 py-2 rounded-lg text-xs transition-default"
              style={
                isWarisHibah === opt.value
                  ? { background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.4)' }
                  : { background: 'var(--bg-base)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        {isWarisHibah && (
          <p className="text-xs mt-1 text-amber-400">
            ⚠️ Waris/Hibah Wasiat = 50% dari BPHTB terutang normal.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          id="bphtbHitungBtn"
          onClick={handleHitung}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md hover:brightness-110 transition-all"
          style={{ background: 'linear-gradient(135deg, var(--primary), #1d4ed8)' }}
        >
          Hitung BPHTB
        </button>
        <button
          id="bphtbResetBtn"
          onClick={() => {
            setNpop('');
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
              Step-by-step BPHTB
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>1. NPOP</span>
                <span style={{ color: 'var(--text-body)' }}>{formatRupiah(parseInputNumber(npop) || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>2. Dikurangi NPOPTKP</span>
                <span style={{ color: 'var(--text-muted)' }}>({formatRupiah(parseInputNumber(npoptkp) || 0)})</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>3. NPOPKP</span>
                <span className="text-amber-400">{formatRupiah(result.npopkp)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>4. BPHTB (5%)</span>
                <span style={{ color: 'var(--text-body)' }}>{formatRupiah(result.bphtbNormal)}</span>
              </div>
              {isWarisHibah && (
                <div className="flex justify-between text-green-400">
                  <span>5. Potongan Waris/Hibah Wasiat (50%)</span>
                  <span>- {formatRupiah(result.bphtbNormal * 0.5)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-2" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-heading)' }}>BPHTB Terutang</span>
                <span className="text-green-400">{formatRupiah(result.bphtbAkhir)}</span>
              </div>
            </div>
          </div>

          <AiCalculatorChecker
            namaKalkulator="Kalkulator BPHTB (Bea Perolehan Hak atas Tanah dan Bangunan)"
            inputData={{
              'NPOP (Nilai Perolehan Objek Pajak)': formatRupiah(parseInputNumber(npop) || 0),
              'NPOPTKP': formatRupiah(parseInputNumber(npoptkp) || 0),
              'Jenis Perolehan': isWarisHibah ? 'Waris / Hibah Wasiat (Potongan 50%)' : 'Jual Beli / Hibah Biasa',
            }}
            hasilData={{
              'NPOPKP (NPOP Kena Pajak)': formatRupiah(result.npopkp),
              'BPHTB Normal (5%)': formatRupiah(result.bphtbNormal),
              'BPHTB Terutang Akhir': formatRupiah(result.bphtbAkhir),
            }}
            rumus="BPHTB = (NPOP - NPOPTKP) × 5%"
          />
        </>
      )}
    </div>
  );
}