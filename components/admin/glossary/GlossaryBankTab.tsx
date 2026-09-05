'use client';

import { useState } from 'react';
import { Search, Filter, Edit3, Trash2, BookOpen, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GlossaryItem } from './GlossaryEditModal';

interface GlossaryBankTabProps {
  items: GlossaryItem[];
  selectedModuleSlug: string;
  onSelectModuleSlug: (slug: string) => void;
  modules: { id: string; code: string; title: string; slug: string }[];
  onEdit: (item: GlossaryItem) => void;
  onDelete: (id: string) => void;
}

export function GlossaryBankTab({
  items,
  selectedModuleSlug,
  onSelectModuleSlug,
  modules,
  onEdit,
  onDelete,
}: GlossaryBankTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter items
  const filtered = items.filter((item) => {
    const matchesModule = !selectedModuleSlug || item.moduleSlug === selectedModuleSlug;
    const matchesSearch =
      !searchTerm ||
      item.kata.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definisi.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModule && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari istilah, kata kunci, atau definisi glosarium..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Module Filter */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={selectedModuleSlug}
            onChange={(e) => {
              onSelectModuleSlug(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">Semua Modul ({items.length} Istilah)</option>
            {modules.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.code} - {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Terms */}
      {currentItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/60">
          <BookOpen size={40} className="mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">Tidak ada istilah glosarium ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau pilih modul lain. Anda juga bisa mengimpor batch dari AI External.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((item) => {
            const modInfo = modules.find((m) => m.slug === item.moduleSlug);

            return (
              <div
                key={item.id}
                className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between space-y-3 shadow-lg"
              >
                <div className="space-y-2">
                  {/* Badge Module Code + Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                      {modInfo?.code || item.moduleSlug}
                    </span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                        title="Edit Istilah"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => item.id && onDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                        title="Hapus Istilah"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Term Name */}
                  <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {item.kata}
                  </h4>

                  {/* Formal Definition */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {item.definisi}
                  </p>

                  {/* Simple Explanation */}
                  {item.penjelasanSederhana && (
                    <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] text-cyan-300/90 leading-relaxed">
                      <span className="font-semibold text-cyan-400">💡 Bahasa Sederhana:</span>{' '}
                      {item.penjelasanSederhana}
                    </div>
                  )}

                  {/* Example */}
                  {item.contoh && (
                    <div className="text-[11px] text-slate-400 italic">
                      <span className="font-semibold not-italic text-slate-300">Contoh:</span> {item.contoh}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} istilah
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-medium text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
