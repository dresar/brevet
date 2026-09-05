'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { KalkulatorPPN } from './kalkulator/ppn';
import { KalkulatorPPh21TER } from './kalkulator/pph21-ter';
import { KalkulatorPBB } from './kalkulator/pbb';
import { KalkulatorBPHTB } from './kalkulator/bphtb';
import { KalkulatorPPhOP } from './kalkulator/pph-op';
import { KalkulatorPPhBadan } from './kalkulator/pph-badan';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface QuickCalculatorModalProps {
  open: boolean;
  onClose: () => void;
}

type CalcType = 'ppn' | 'pph21' | 'pph-op' | 'pph-badan' | 'pbb' | 'bphtb';

const TABS: { key: CalcType; label: string }[] = [
  { key: 'ppn', label: '🛒 PPN' },
  { key: 'pph21', label: '👤 PPh 21 TER' },
  { key: 'pph-op', label: '📊 PPh OP' },
  { key: 'pph-badan', label: '🏢 PPh Badan' },
  { key: 'pbb', label: '🏠 PBB' },
  { key: 'bphtb', label: '📝 BPHTB' },
];

export function QuickCalculatorModal({
  open,
  onClose,
}: QuickCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<CalcType>('ppn');

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} size="xl" title="🧮 Kalkulator Simulasi Perpajakan">
      <div className="space-y-4">
        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[70px] text-[11px] sm:text-xs py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selected Calculator Content */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800">
          {activeTab === 'ppn' && <KalkulatorPPN />}
          {activeTab === 'pph21' && <KalkulatorPPh21TER />}
          {activeTab === 'pph-op' && <KalkulatorPPhOP />}
          {activeTab === 'pph-badan' && <KalkulatorPPhBadan />}
          {activeTab === 'pbb' && <KalkulatorPBB />}
          {activeTab === 'bphtb' && <KalkulatorBPHTB />}
        </div>

        {/* Link to Full Page */}
        <Link
          href="/tools/kalkulator"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/10 transition"
        >
          <ExternalLink size={13} />
          Buka Kalkulator Interaktif Penuh (6 Kalkulator + Prompt AI Claude)
        </Link>
      </div>
    </Modal>
  );
}
