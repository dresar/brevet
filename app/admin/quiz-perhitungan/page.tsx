'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GraduationCap, BookOpen, Sparkles, Calculator, Save, Loader2, FileSpreadsheet, Percent, AlertCircle } from 'lucide-react';
import type { Modul, KuisSoal } from '@/lib/module-types';

import { QuizModuleSelector } from '@/components/admin/quiz/QuizModuleSelector';
import { QuizBankTab } from '@/components/admin/quiz/QuizBankTab';
import { QuizClaudeImportTab } from '@/components/admin/quiz/QuizClaudeImportTab';
import { QuizEditModal } from '@/components/admin/quiz/QuizEditModal';

export default function QuizPerhitunganPage() {
  const qc = useQueryClient();
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [questions, setQuestions] = useState<KuisSoal[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<KuisSoal | null>(null);
  const [activeTab, setActiveTab] = useState<'bank' | 'claude'>('bank');

  // Fetch modules simple list
  const { data: modulesData, isLoading: loadingModules } = useQuery({
    queryKey: ['admin-quiz-modules'],
    queryFn: async () => {
      const res = await fetch('/api/modules?simple=true');
      if (!res.ok) throw new Error('Gagal mengambil daftar modul');
      return res.json() as Promise<{ modules: Array<{ id: string; title: string; code: string }> }>;
    },
  });

  // Fetch selected module details (specifically calculation quiz)
  const { data: moduleDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['admin-quiz-perhitungan-module-detail', selectedModuleId],
    queryFn: async () => {
      if (!selectedModuleId) return null;
      const res = await fetch(`/api/modules/${selectedModuleId}/quiz-perhitungan`);
      if (!res.ok) throw new Error('Gagal mengambil detail kuis perhitungan');
      return res.json() as Promise<{
        moduleId: string;
        moduleTitle: string;
        moduleSlug: string;
        soal: KuisSoal[];
      }>;
    },
    enabled: !!selectedModuleId,
  });

  // Update questions list when module detail loads
  useEffect(() => {
    if (moduleDetail?.soal) {
      setQuestions(moduleDetail.soal);
    } else {
      setQuestions([]);
    }
  }, [moduleDetail]);

  // Mutation to save questions into DB
  const saveMutation = useMutation({
    mutationFn: async (updatedQuestions: KuisSoal[]) => {
      if (!selectedModuleId) return;

      const res = await fetch(`/api/modules/${selectedModuleId}/quiz-perhitungan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soal: updatedQuestions, mode: 'replace' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kuis perhitungan');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Kuis perhitungan berhasil disimpan ke database!');
      qc.invalidateQueries({ queryKey: ['admin-quiz-perhitungan-module-detail', selectedModuleId] });
      qc.invalidateQueries({ queryKey: ['modules-belajar'] });
    },
    onError: (err: any) => {
      toast.error('Gagal menyimpan kuis perhitungan: ' + err.message);
    },
  });

  // Generate Claude prompt string for calculations
  const getClaudePrompt = () => {
    if (!moduleDetail?.moduleTitle) return '';
    
    // Find matching module from modulesData if available to provide code
    const matchingModule = modulesData?.modules?.find(m => m.id === selectedModuleId);
    const code = matchingModule?.code || 'BRVT-AB-HITUNG';
    const title = moduleDetail.moduleTitle;

    return `Kamu adalah AI Spesialis Perhitungan Pajak Indonesia (Brevet A/B), Konsultan Pajak Senior, dan Pembuat Soal Ujian Perhitungan Perpajakan tingkat lanjut.
Tugasmu adalah menyusun kuis khusus latihan perhitungan perpajakan Brevet AB yang terdiri dari minimal 20 sampai 30 soal perhitungan studi kasus konkret dalam format JSON valid.

Materi Modul Pembelajaran Sebagai Konteks:
Judul: ${title}
Kode: ${code}

============================================================
🚨 KETENTUAN UTAMA PEMBUATAN SOAL PERHITUNGAN (WAJIB DIPATUHI) 🚨
============================================================
1. SOAL HARUS 100% HITUNG-HITUNGAN / KASUS ANGKA:
   - Setiap soal harus menyajikan studi kasus numerik perpajakan konkret (misalnya: perhitungan PPh 21 karyawan dengan status PTKP tertentu, perhitungan PPh Pasal 21 TER, perhitungan DPP dan PPN tarif 12% sesuai UU HPP 2026, PPh Natura PMK 66/2023, penghitungan BPHTB waris/hibah wasiat, penghitungan PPh Badan dengan fasilitas Pasal 31E, dsb.).
   - Jangan membuat soal teori murni. Fokus 100% pada hitungan matematis perpajakan.

2. PENULISAN RUMUS WAJIB MENGGUNAKAN LATEX ($$ ... $$):
   - Setiap rumus matematika wajib ditulis dalam blok LaTeX display math agar terbaca dengan rapi oleh LaTeX parser sistem.
   - Contoh penulisan LaTeX:
     - Untuk PPN: $$ \\text{PPN} = 12\\% \\times \\text{DPP} $$
     - Untuk PPh 21 TER: $$ \\text{PPh 21 TER} = \\text{Penghasilan Bruto} \\times \\text{Tarif TER} $$
     - Untuk PPh Pasal 17: $$ \\text{PPh Terutang} = \\text{Tarif} \\times \\text{PKP} $$
     - Gunakan penulisan LaTeX formal yang bersih dan berjarak rapi.

3. KUNCI JAWABAN & JAWABAN DETIL LANGKAH DEMI LANGKAH:
   - Tulis kunci jawaban beserta pembahasan yang sangat rinci.
   - Pembahasan wajib merinci langkah-langkah kalkulasi angka dari awal sampai akhir secara runtut, menyebutkan pasal UU yang mendasari tarif pajak tersebut (misalnya menyebutkan PP 58/2023 untuk TER, UU HPP untuk tarif PPN 12%, dsb.), serta memberikan tips cara menyelesaikannya dengan mudah.
   - Pastikan rujukan hukum perpajakan yang digunakan adalah yang aktif per tahun 2026 di Indonesia (seperti tarif PPN 12%).
   - Hanya batasi pada cakupan pajak Brevet AB saja (tidak ada pajak asing atau di luar Brevet AB).

4. STRUKTUR JSON:
   - Output harus berupa objek JSON valid dengan properti array "soal".
   - Tipe soal dapat berupa "pilihan_ganda" (4 opsi A, B, C, D) atau "esai".
   - Format struktur JSON wajib mengikuti:
{
  "soal": [
     {
        "id": "q-calc-1",
        "pertanyaan": "...",
        "tipe": "pilihan_ganda",
        "pilihan": ["A. ...", "B. ...", "C. ...", "D. ..."],
        "jawaban": "A",
        "pembahasan": "..."
     }
  ]
}

Mulai respons langsung dari '{' dan diakhiri dengan '}'. Jangan ada karakter tambahan di luar JSON tersebut!`;
  };

  // Import JSON handler
  const handleImportJson = (jsonString: string, mode: 'replace' | 'append' = 'replace') => {
    try {
      const parsed = JSON.parse(jsonString);
      const importedSoal = parsed.soal || parsed;
      if (!Array.isArray(importedSoal)) {
        toast.error('Format JSON tidak valid. Objek harus mempunyai properti array "soal".');
        return;
      }

      if (!selectedModuleId) {
        toast.error('Silakan pilih modul terlebih dahulu.');
        return;
      }

      let nextQuestions: KuisSoal[] = [];
      if (mode === 'append') {
        nextQuestions = [...questions, ...importedSoal];
      } else {
        nextQuestions = importedSoal;
      }

      setQuestions(nextQuestions);
      setActiveTab('bank');

      toast.loading('Menyimpan ke database...', { id: 'save-quiz-perhitungan' });
      fetch(`/api/modules/${selectedModuleId}/quiz-perhitungan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soal: importedSoal, mode }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Gagal menyimpan ke database');
          toast.success(data.message || `Berhasil mengimpor ${importedSoal.length} soal kuis perhitungan ke database!`, { id: 'save-quiz-perhitungan' });
          qc.invalidateQueries({ queryKey: ['admin-quiz-perhitungan-module-detail', selectedModuleId] });
          qc.invalidateQueries({ queryKey: ['modules-belajar'] });
        })
        .catch((err) => {
          toast.error('Gagal simpan ke database: ' + err.message, { id: 'save-quiz-perhitungan' });
        });
    } catch (err: any) {
      toast.error('Gagal parse JSON: ' + err.message);
    }
  };

  // Manual Question handlers
  const handleAddManual = () => {
    const newQ: KuisSoal = {
      id: `q-calc-manual-${Date.now()}`,
      pertanyaan: 'Sebuah perusahaan membeli barang dengan Harga Jual Rp 10.000.000. Berapakah PPN terutang dengan tarif 12%?',
      tipe: 'pilihan_ganda',
      pilihan: [
        'A. Rp 1.200.000',
        'B. Rp 1.100.000',
        'C. Rp 1.000.000',
        'D. Rp 1.500.000'
      ],
      jawaban: 'A',
      pembahasan: 'Rumus PPN:\n$$ \\text{PPN} = 12\\% \\times \\text{DPP} $$\n\nKalkulasi:\n$$ \\text{PPN} = 12\\% \\times \\text{Rp 10.000.000} = \\text{Rp 1.200.000} $$',
    };
    setQuestions([newQ, ...questions]);
    setEditingQuestion(newQ);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.success('Soal perhitungan berhasil dihapus.');
  };

  const handleBulkDelete = (ids: string[]) => {
    setQuestions((prev) => prev.filter((q) => !ids.includes(q.id)));
    toast.success(`${ids.length} soal perhitungan berhasil dihapus.`);
  };

  const handleSaveQuestionEdit = (updated: KuisSoal) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setEditingQuestion(null);
    toast.success('Perubahan soal perhitungan disimpan sementara.');
  };

  const pgCount = questions.filter((q) => q.tipe === 'pilihan_ganda').length;
  const essayCount = questions.filter((q) => q.tipe === 'esai').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-200 pb-12">
      {/* Top Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-white">
            <Calculator className="text-blue-500 shrink-0" size={28} />
            Manajemen Kuis Perhitungan Pajak Brevet AB
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan latihan soal hitung-hitungan studi kasus angka lengkap dengan visualisasi LaTeX rumus matematika perpajakan.
          </p>
        </div>
      </div>

      {/* Module Selector */}
      <QuizModuleSelector
        modules={modulesData?.modules}
        selectedModuleId={selectedModuleId}
        onSelectModule={setSelectedModuleId}
        isLoading={loadingModules}
      />

      {/* Custom Stats Bar */}
      {selectedModuleId && (
        <div className="bg-[#0F172A] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                <span>Kuis Perhitungan Aktif</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {moduleDetail?.moduleTitle || 'Modul Belum Dipilih'}
              </h2>
            </div>

            <button
              onClick={() => saveMutation.mutate(questions)}
              disabled={saveMutation.isPending || questions.length === 0}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20 transition-all text-sm shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>Simpan ke Database</span>
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Total Soal Perhitungan</span>
                <span className="text-2xl font-black text-white mt-0.5 block">{questions.length}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileSpreadsheet size={20} />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Pilihan Ganda</span>
                <span className="text-2xl font-black text-emerald-400 mt-0.5 block">{pgCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                <Percent size={18} />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Esai (Uraian Hitungan)</span>
                <span className="text-2xl font-black text-purple-400 mt-0.5 block">{essayCount}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                Ess
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="shrink-0 text-sky-400" size={16} />
            <span>
              <strong>LaTeX Info:</strong> Gunakan notasi $$ ... $$ di pertanyaan maupun pembahasan untuk merender rumus perhitungan matematika perpajakan secara visual dan premium.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      {selectedModuleId && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 bg-[#0F172A] border border-slate-800 p-1.5 rounded-2xl shadow-lg max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'bank'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen size={16} />
              <span>Bank Soal Hitungan ({questions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('claude')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'claude'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles size={16} />
              <span>AI External (Claude)</span>
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === 'bank' && (
            <QuizBankTab
              questions={questions}
              onEdit={setEditingQuestion}
              onDelete={handleDeleteQuestion}
              onAddManual={handleAddManual}
              onBulkDelete={handleBulkDelete}
            />
          )}

          {activeTab === 'claude' && (
            <QuizClaudeImportTab
              promptText={getClaudePrompt()}
              onImportJson={handleImportJson}
              selectedModuleId={selectedModuleId}
            />
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingQuestion && (
        <QuizEditModal
          question={editingQuestion}
          onSave={handleSaveQuestionEdit}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
}
