'use client';

import { useState, useEffect } from 'react';
import { X, Save, BookOpen, AlertCircle } from 'lucide-react';

export interface GlossaryItem {
  id?: string;
  moduleId?: string | null;
  moduleSlug: string;
  kata: string;
  definisi: string;
  penjelasanSederhana?: string | null;
  contoh?: string | null;
}

interface GlossaryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: GlossaryItem) => void;
  initialItem?: GlossaryItem | null;
  modules: { id: string; code: string; title: string; slug: string }[];
  defaultModuleSlug: string;
  isSaving: boolean;
}

export function GlossaryEditModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  modules,
  defaultModuleSlug,
  isSaving,
}: GlossaryEditModalProps) {
  const [formData, setFormData] = useState<GlossaryItem>({
    moduleSlug: defaultModuleSlug || modules[0]?.slug || '',
    kata: '',
    definisi: '',
    penjelasanSederhana: '',
    contoh: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setFormData({
        id: initialItem.id,
        moduleId: initialItem.moduleId,
        moduleSlug: initialItem.moduleSlug || defaultModuleSlug || modules[0]?.slug || '',
        kata: initialItem.kata || '',
        definisi: initialItem.definisi || '',
        penjelasanSederhana: initialItem.penjelasanSederhana || '',
        contoh: initialItem.contoh || '',
      });
    } else {
      setFormData({
        moduleSlug: defaultModuleSlug || modules[0]?.slug || '',
        kata: '',
        definisi: '',
        penjelasanSederhana: '',
        contoh: '',
      });
    }
    setError('');
  }, [initialItem, defaultModuleSlug, modules, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kata.trim() || !formData.definisi.trim()) {
      setError('Kata istilah dan definisi wajib diisi!');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative space-y-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <BookOpen size={18} />
            </div>
            <h3 className="text-base font-bold text-white">
              {initialItem?.id ? 'Edit Istilah Glosarium' : 'Tambah Istilah Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Module */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Pilih Modul</label>
            <select
              value={formData.moduleSlug}
              onChange={(e) => setFormData({ ...formData, moduleSlug: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.code} - {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Kata Istilah */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Istilah / Istilah Istimewa *</label>
            <input
              type="text"
              placeholder="Contoh: Tax Avoidance, Subjek Pajak, TER"
              value={formData.kata}
              onChange={(e) => setFormData({ ...formData, kata: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-semibold"
              required
            />
          </div>

          {/* Definisi Formal */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Definisi Resmi / Formal *</label>
            <textarea
              rows={3}
              placeholder="Tuliskan definisi resmi sesuai UU / PMK perpajakan..."
              value={formData.definisi}
              onChange={(e) => setFormData({ ...formData, definisi: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
              required
            />
          </div>

          {/* Penjelasan Sederhana */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Penjelasan Sederhana (Mudah Dipahami)</label>
            <textarea
              rows={2}
              placeholder="Penjelasan dengan kalimat santai untuk pemula..."
              value={formData.penjelasanSederhana || ''}
              onChange={(e) => setFormData({ ...formData, penjelasanSederhana: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Contoh Penerapan */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Contoh Kasus / Penerapan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Misal karyawan berpenghasilan Rp10 juta/bulan..."
              value={formData.contoh || ''}
              onChange={(e) => setFormData({ ...formData, contoh: e.target.value })}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <Save size={15} />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Istilah'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
