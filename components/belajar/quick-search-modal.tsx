'use client';

import { useState } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { cleanTitle } from '@/lib/utils';
import type { Bagian } from '@/lib/module-types';

interface QuickSearchModalProps {
  open: boolean;
  onClose: () => void;
  bagianList: Bagian[];
  onSelectSection: (sectionId: string) => void;
}

export function QuickSearchModal({
  open,
  onClose,
  bagianList,
  onSelectSection,
}: QuickSearchModalProps) {
  const [query, setQuery] = useState('');

  if (!open) return null;

  const results = query.trim()
    ? bagianList.filter((b) => {
        const q = query.toLowerCase();
        const judulMatch = b.judul.toLowerCase().includes(q);
        const paragrafMatch = b.paragraf.some((p) => p.toLowerCase().includes(q));
        const poinMatch = b.poin_penting?.some((p) => p.toLowerCase().includes(q));
        return judulMatch || paragrafMatch || poinMatch;
      })
    : bagianList;

  return (
    <Modal open={open} onClose={onClose} size="lg" title="🔍 Cari Materi Modul">
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik kata kunci (contoh: PPN, NPWP, sanksi, denda)..."
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

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {results.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              Tidak ada bagian yang cocok dengan kata kunci &quot;{query}&quot;.
            </div>
          ) : (
            results.map((bagian, index) => (
              <button
                key={bagian.id}
                onClick={() => {
                  onSelectSection(bagian.id);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Bagian {index + 1}
                    </span>
                    <h5 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {cleanTitle(bagian.judul)}
                    </h5>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {bagian.paragraf[0]}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 shrink-0 ml-2" />
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
