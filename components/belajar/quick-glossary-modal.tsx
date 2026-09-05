'use client';

import { useState } from 'react';
import { Search, X, BookMarked } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import type { GlosariumItem } from '@/lib/module-types';

interface QuickGlossaryModalProps {
  open: boolean;
  onClose: () => void;
  glosarium: GlosariumItem[];
}

export function QuickGlossaryModal({
  open,
  onClose,
  glosarium,
}: QuickGlossaryModalProps) {
  const [query, setQuery] = useState('');

  if (!open) return null;

  const items = glosarium ?? [];
  const filtered = query.trim()
    ? items.filter(
        (g) =>
          g.kata.toLowerCase().includes(query.toLowerCase()) ||
          g.definisi.toLowerCase().includes(query.toLowerCase()) ||
          (g.penjelasan_sederhana && g.penjelasan_sederhana.toLowerCase().includes(query.toLowerCase()))
      )
    : items;

  return (
    <Modal open={open} onClose={onClose} size="lg" title="📖 Glosarium Istilah Perpajakan">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari istilah (contoh: NPWP, PKP, DPP, SKP)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Glossary items */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Istilah &quot;{query}&quot; tidak ditemukan di glosarium modul ini.
            </div>
          ) : (
            filtered.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                    <BookMarked size={14} />
                    {item.kata}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.definisi}</p>
                {item.penjelasan_sederhana && (
                  <p className="text-[11px] text-emerald-400/90 italic bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/40 mt-1">
                    💡 Bahasa Sederhana: {item.penjelasan_sederhana}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
