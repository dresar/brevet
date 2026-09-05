'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import type { KuisSoal } from '@/lib/module-types';

interface QuizBankTabProps {
  questions: KuisSoal[];
  onEdit: (question: KuisSoal) => void;
  onDelete: (id: string) => void;
  onAddManual: () => void;
  onBulkDelete?: (ids: string[]) => void;
}

const ITEMS_PER_PAGE = 10;

export function QuizBankTab({
  questions,
  onEdit,
  onDelete,
  onAddManual,
  onBulkDelete,
}: QuizBankTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pilihan_ganda' | 'esai'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.jawaban.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.pembahasan && q.pembahasan.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'all' || q.tipe === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [questions, searchTerm, typeFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedQuestions.map((q) => q.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} soal terpilih?`)) {
      if (onBulkDelete) {
        onBulkDelete(selectedIds);
      } else {
        selectedIds.forEach((id) => onDelete(id));
      }
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari pertanyaan, materi, atau hukum..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Type Filter Buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1">
            <button
              onClick={() => {
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({questions.length})
            </button>
            <button
              onClick={() => {
                setTypeFilter('pilihan_ganda');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'pilihan_ganda'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PG ({questions.filter((q) => q.tipe === 'pilihan_ganda').length})
            </button>
            <button
              onClick={() => {
                setTypeFilter('esai');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                typeFilter === 'esai'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Essay ({questions.filter((q) => q.tipe === 'esai').length})
            </button>
          </div>

          {/* Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={handleExecuteBulkDelete}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition"
            >
              <Trash2 size={14} /> Hapus ({selectedIds.length})
            </button>
          )}

          {/* Add Question Button */}
          <button
            onClick={onAddManual}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus size={16} /> Tambah Soal Manual
          </button>
        </div>
      </div>

      {/* Main List Area */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <HelpCircle size={48} className="mx-auto text-slate-600" />
          <p className="text-base font-semibold text-slate-400">Tidak ada soal ditemukan</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm
              ? `Pencarian "${searchTerm}" tidak cocok dengan soal manapun.`
              : 'Belum ada soal pada modul ini. Gunakan tab AI Generator atau Claude Prompt untuk membuat 100 soal.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Sub Header info */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <span>
              Menampilkan {paginatedQuestions.length} dari {filteredQuestions.length} soal (Halaman {currentPage} dari {totalPages})
            </span>
            <button
              onClick={handleSelectAllOnPage}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition font-medium"
            >
              {paginatedQuestions.every((q) => selectedIds.includes(q.id)) ? (
                <CheckSquare size={14} className="text-blue-400" />
              ) : (
                <Square size={14} />
              )}
              Select All di Halaman Ini
            </button>
          </div>

          {/* Question Cards */}
          {paginatedQuestions.map((q, idx) => {
            const actualIndex = questions.findIndex((orig) => orig.id === q.id) + 1;
            const isSelected = selectedIds.includes(q.id);

            return (
              <div
                key={q.id || idx}
                className={`bg-[#0F172A] border rounded-2xl p-5 space-y-3 transition-all relative ${
                  isSelected
                    ? 'border-blue-500/60 bg-blue-950/20'
                    : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Card Top Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSelect(q.id)}
                      className="text-slate-500 hover:text-blue-400 transition"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-blue-400" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                    <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                      Soal #{actualIndex > 0 ? actualIndex : idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        q.tipe === 'pilihan_ganda'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {q.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(q)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                      title="Edit Soal"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                      title="Hapus Soal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <p className="text-sm font-semibold text-white leading-relaxed">{q.pertanyaan}</p>

                {/* Multiple Choice Options Grid */}
                {q.tipe === 'pilihan_ganda' && q.pilihan && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.pilihan.map((opt, oIdx) => {
                      const isCorrect = opt.startsWith(q.jawaban) || opt.startsWith(`${q.jawaban}.`);
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl text-xs font-mono border transition ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Key & Explanation Footer */}
                <div className="bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-start gap-2 text-slate-300">
                    <span className="font-bold text-slate-400 shrink-0">Kunci Jawaban:</span>
                    <span className="font-mono text-emerald-400 font-bold">{q.jawaban}</span>
                  </div>
                  {q.pembahasan && (
                    <div className="text-slate-400 leading-relaxed border-t border-slate-800/80 pt-1.5 mt-1.5">
                      <span className="font-bold text-slate-300 block mb-0.5">Pembahasan Resmi:</span>
                      {q.pembahasan}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 bg-[#0F172A] border border-slate-800 p-4 rounded-2xl">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition"
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition"
              >
                Berikutnya <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
