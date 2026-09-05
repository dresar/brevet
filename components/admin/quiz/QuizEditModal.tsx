'use client';

import { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2 } from 'lucide-react';
import type { KuisSoal } from '@/lib/module-types';

interface QuizEditModalProps {
  question: KuisSoal;
  onSave: (updated: KuisSoal) => void;
  onClose: () => void;
}

export function QuizEditModal({ question, onSave, onClose }: QuizEditModalProps) {
  const [formData, setFormData] = useState<KuisSoal>(structuredClone(question));

  useEffect(() => {
    setFormData(structuredClone(question));
  }, [question]);

  const handleOptionChange = (idx: number, val: string) => {
    if (!formData.pilihan) return;
    const newOptions = [...formData.pilihan];
    newOptions[idx] = val;
    setFormData({ ...formData, pilihan: newOptions });
  };

  const handleAddOption = () => {
    const options = formData.pilihan || [];
    const prefix = String.fromCharCode(65 + options.length); // A, B, C, D...
    setFormData({
      ...formData,
      pilihan: [...options, `${prefix}. Pilihan Baru`],
    });
  };

  const handleRemoveOption = (idx: number) => {
    if (!formData.pilihan || formData.pilihan.length <= 2) return;
    const newOptions = formData.pilihan.filter((_, i) => i !== idx);
    setFormData({ ...formData, pilihan: newOptions });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-lg text-white">Edit Pertanyaan</h3>
            <p className="text-xs text-slate-400">ID: {formData.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tipe Soal</label>
            <select
              value={formData.tipe}
              onChange={(e) => {
                const tipe = e.target.value as 'pilihan_ganda' | 'esai';
                setFormData({
                  ...formData,
                  tipe,
                  pilihan:
                    tipe === 'pilihan_ganda'
                      ? formData.pilihan || ['A. Pilihan A', 'B. Pilihan B', 'C. Pilihan C', 'D. Pilihan D']
                      : null,
                });
              }}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="pilihan_ganda">Pilihan Ganda (Multiple Choice)</option>
              <option value="esai">Essay (Jawaban Deskriptif / Hitungan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Pertanyaan Soal</label>
            <textarea
              value={formData.pertanyaan}
              onChange={(e) => setFormData({ ...formData, pertanyaan: e.target.value })}
              rows={4}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              placeholder="Tuliskan pertanyaan kuis di sini..."
            />
          </div>

          {/* Options for Multiple Choice */}
          {formData.tipe === 'pilihan_ganda' && (
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">Pilihan Jawaban</label>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                >
                  <Plus size={14} /> Opsi Baru
                </button>
              </div>

              <div className="space-y-2">
                {(formData.pilihan || []).map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                      className="flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500 font-mono"
                    />
                    {formData.pilihan && formData.pilihan.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(oIdx)}
                        className="p-2 text-slate-500 hover:text-red-400 rounded-lg transition shrink-0"
                        title="Hapus Opsi"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer Key */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Kunci Jawaban {formData.tipe === 'pilihan_ganda' ? '(Contoh: A)' : '(Kunci Jawaban Lengkap & Rumus Hitungan)'}
            </label>
            {formData.tipe === 'pilihan_ganda' ? (
              <input
                type="text"
                value={formData.jawaban}
                onChange={(e) => setFormData({ ...formData, jawaban: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm font-semibold uppercase focus:outline-none focus:border-blue-500"
                placeholder="Contoh: A"
              />
            ) : (
              <textarea
                value={formData.jawaban}
                onChange={(e) => setFormData({ ...formData, jawaban: e.target.value })}
                rows={4}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                placeholder="Tuliskan kunci jawaban referensi lengkap dan cara hitung..."
              />
            )}
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Pembahasan / Dasar Hukum Resmi</label>
            <textarea
              value={formData.pembahasan || ''}
              onChange={(e) => setFormData({ ...formData, pembahasan: e.target.value })}
              rows={3}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500 leading-relaxed"
              placeholder="Jelaskan alasan jawaban benar dan sertakan dasar hukum (misal PMK TER, Pasal UU HPP)..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition shadow-lg shadow-blue-600/20"
          >
            <Check size={16} /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
