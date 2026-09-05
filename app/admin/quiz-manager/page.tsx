'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GraduationCap, BookOpen, Sparkles, FileText } from 'lucide-react';
import type { Modul, KuisSoal } from '@/lib/module-types';

import { QuizModuleSelector } from '@/components/admin/quiz/QuizModuleSelector';
import { QuizStatsBar } from '@/components/admin/quiz/QuizStatsBar';
import { QuizBankTab } from '@/components/admin/quiz/QuizBankTab';
import { QuizAiGeneratorTab, type BatchItem } from '@/components/admin/quiz/QuizAiGeneratorTab';
import { QuizClaudeImportTab } from '@/components/admin/quiz/QuizClaudeImportTab';
import { QuizEditModal } from '@/components/admin/quiz/QuizEditModal';

export default function QuizManagerPage() {
  const qc = useQueryClient();
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [questions, setQuestions] = useState<KuisSoal[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<KuisSoal | null>(null);
  const [activeTab, setActiveTab] = useState<'bank' | 'generator' | 'claude'>('bank');

  // AI Batch Generator state
  const [generationProgress, setGenerationProgress] = useState<{
    running: boolean;
    currentBatch: number;
    batches: BatchItem[];
  }>({
    running: false,
    currentBatch: -1,
    batches: [
      { status: 'idle', type: 'pilihan_ganda', index: 0 },
      { status: 'idle', type: 'pilihan_ganda', index: 1 },
      { status: 'idle', type: 'pilihan_ganda', index: 2 },
      { status: 'idle', type: 'pilihan_ganda', index: 3 },
      { status: 'idle', type: 'esai', index: 0 },
    ],
  });

  // Fetch modules simple list
  const { data: modulesData, isLoading: loadingModules } = useQuery({
    queryKey: ['admin-quiz-modules'],
    queryFn: async () => {
      const res = await fetch('/api/modules?simple=true');
      if (!res.ok) throw new Error('Gagal mengambil daftar modul');
      return res.json() as Promise<{ modules: Array<{ id: string; title: string; code: string }> }>;
    },
  });

  // Fetch selected module details
  const { data: moduleDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['admin-quiz-module-detail', selectedModuleId],
    queryFn: async () => {
      if (!selectedModuleId) return null;
      const res = await fetch(`/api/modules/${selectedModuleId}`);
      if (!res.ok) throw new Error('Gagal mengambil detail modul');
      return res.json() as Promise<{
        module: {
          id: string;
          code: string;
          slug: string;
          title: string;
          contentJson: Modul;
        };
      }>;
    },
    enabled: !!selectedModuleId,
  });

  // Update questions list when module detail loads
  useEffect(() => {
    if (moduleDetail?.module?.contentJson?.modul?.kuis_akhir?.soal) {
      setQuestions(moduleDetail.module.contentJson.modul.kuis_akhir.soal);
    } else {
      setQuestions([]);
    }
  }, [moduleDetail]);

  // Mutation to save questions into DB
  const saveMutation = useMutation({
    mutationFn: async (updatedQuestions: KuisSoal[]) => {
      if (!selectedModuleId) return;

      const res = await fetch(`/api/modules/${selectedModuleId}/quiz`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soal: updatedQuestions, mode: 'replace' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kuis ke database');
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Kuis akhir berhasil disimpan ke database!');
      qc.invalidateQueries({ queryKey: ['admin-quiz-module-detail', selectedModuleId] });
      qc.invalidateQueries({ queryKey: ['modules-belajar'] });
    },
    onError: (err: any) => {
      toast.error('Gagal menyimpan: ' + err.message);
    },
  });

  // Handle AI Batch generation process
  const handleGenerateAll = async () => {
    if (!selectedModuleId) {
      toast.error('Silakan pilih modul terlebih dahulu!');
      return;
    }

    setGenerationProgress({
      running: true,
      currentBatch: 0,
      batches: [
        { status: 'loading', type: 'pilihan_ganda', index: 0 },
        { status: 'idle', type: 'pilihan_ganda', index: 1 },
        { status: 'idle', type: 'pilihan_ganda', index: 2 },
        { status: 'idle', type: 'pilihan_ganda', index: 3 },
        { status: 'idle', type: 'esai', index: 0 },
      ],
    });

    let accumulatedQuestions: KuisSoal[] = [];

    for (let i = 0; i < 5; i++) {
      setGenerationProgress((prev) => {
        const nextBatches = [...prev.batches];
        nextBatches[i].status = 'loading';
        return {
          running: true,
          currentBatch: i,
          batches: nextBatches,
        };
      });

      try {
        const res = await fetch('/api/admin/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: selectedModuleId,
            type: i < 4 ? 'pilihan_ganda' : 'esai',
            batchIndex: i < 4 ? i : 0,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || 'Terjadi kesalahan saat generate AI.');
        }

        accumulatedQuestions = [...accumulatedQuestions, ...data.questions];

        setGenerationProgress((prev) => {
          const nextBatches = [...prev.batches];
          nextBatches[i].status = 'success';
          return {
            ...prev,
            batches: nextBatches,
          };
        });
      } catch (err: any) {
        setGenerationProgress((prev) => {
          const nextBatches = [...prev.batches];
          nextBatches[i].status = 'failed';
          nextBatches[i].error = err.message;
          return {
            running: false,
            currentBatch: i,
            batches: nextBatches,
          };
        });
        toast.error(`Gagal memproses Batch ${i + 1}: ` + err.message);
        return;
      }
    }

    setGenerationProgress((prev) => ({ ...prev, running: false }));
    setQuestions(accumulatedQuestions);
    setActiveTab('bank');
    toast.success('🎉 Berhasil men-generate 100 soal AI! Jangan lupa simpan ke database.');
  };

  // Generate Claude prompt string
  const getClaudePrompt = () => {
    if (!moduleDetail?.module) return '';
    const mod = moduleDetail.module;
    const content = mod.contentJson as Modul;
    const partsText = content.modul.bagian
      .map((b) => {
        return `### Bagian: ${b.judul}\n${b.paragraf.join('\n')}\n${b.poin_penting?.join('\n') || ''}`;
      })
      .join('\n\n');

    return `Kamu adalah AI Spesialis Brevet Pajak Indonesia, Konsultan Pajak Senior, dan Pembuat Soal Sertifikasi Profesional tingkat lanjut.
Tugasmu adalah melakukan riset mendalam terhadap materi modul yang diberikan di bawah ini, lalu menyusun kuis kelulusan berkualifikasi tinggi yang terdiri dari TEPAT 100 soal (80 pilihan ganda dan 20 essay) dalam format JSON valid.

Materi Modul Pembelajaran:
Judul: ${mod.title}
Kode: ${mod.code}
Materi Referensi Modul:
${partsText}

============================================================
🚨 KETENTUAN UTAMA PEMBUATAN SOAL (WAJIB DIPATUHI) 🚨
============================================================
1. JUMLAH SOAL: Wajib ada tepat 100 soal perpajakan yang menantang dan mendalam.
   - 80 Soal Pilihan Ganda (tipe: "pilihan_ganda", nomor 1 sampai 80)
   - 20 Soal Essay/Esai (tipe: "esai", nomor 81 sampai 100)

2. MATERI HITUNG-HITUNGAN REAL-TIME UJIAN PERUSAHAAN (BREVET AB):
   - Wajib sertakan minimal 30% soal hitung-hitungan konkret dan studi kasus angka perpajakan (baik di pilihan ganda maupun essay).
   - Terapkan skenario yang sering diujikan dalam ujian masuk/seleksi staf pajak perusahaan multinasional, Kantor Akuntan Publik (KAP), maupun ujian resmi Brevet A/B Mandiri Tax Center.
   - Aturan & Tarif Perpajakan Indonesia Wajib Berlaku Aktif di 2026:
     - Tarif PPN terbaru: 12% (Pasal 7 UU HPP No. 7/2021). Dilarang keras menulis tarif 11%!
     - PPh Pasal 21 TER (Tarif Efektif Rata-rata sesuai PP 58/2023 & PMK 168/2023 Kategori A, B, C).
     - PPh Orang Pribadi tarif Pasal 17 UU HPP (5 bracket: 5%, 15%, 25%, 30%, 35%).
     - PTKP terbaru (Rp 54.000.000,- per tahun untuk wajib pajak sendiri, ditambah Rp 4.500.000,- status kawin/tanggungan).
     - Tarif PPh Badan: 22%.
     - Tarif PPh Pasal 22, Pasal 23, PPh Final Pasal 4 ayat (2), dan BPHTB/PBB.
     - Kebijakan Pajak Natura sesuai PMK 66/2023.

3. KUNCI JAWABAN & PEMBAHASAN DETIL (HASIL RISET INTERNET):
   - Untuk Pilihan Ganda: Pembahasan WAJIB ditulis panjang dan sangat jelas. Sertakan rumus hitungan matematis langkah demi langkah (kalkulasi angka) dan rujukan dasar hukum perpajakan resmi Indonesia hasil riset internet (seperti menyebutkan Pasal UU HPP, PMK TER PPh 21, dsb.). Jelaskan secara logis kenapa opsi lain salah.
   - Untuk Essay: Kolom "jawaban" diisi dengan KUNCI JAWABAN REFERENSI YANG SANGAT PANJANG, LENGKAP, DETAIL, RUMUS JELAS, DAN RUNTUTAN LOGIKA HUKUM (corporate exam grading style).

4. FLEKSIBILITAS SOAL DI LUAR MODUL:
   - Gunakan materi modul di atas sebagai referensi dan konteks utama tema kuis. Namun, Anda diperbolehkan dan sangat disarankan untuk memperluas pertanyaan di luar batasan sempit teks modul untuk mencakup teori perpajakan umum, asas perpajakan fundamental, UU perpajakan Indonesia, serta soal perhitungan praktis lainnya agar kuis benar-benar komprehensif menguji pemahaman Brevet A/B tingkat korporasi secara menyeluruh.

5. ATURAN OUTPUT JSON BERSIH & LENGKAP:
   - Output WAJIB berupa satu objek JSON valid yang bisa langsung di-parse oleh sistem. Hasilkan seluruh 100 soal lengkap (80 PG, 20 Essay) secara utuh tanpa terpotong atau terputus di tengah jalan!
   - DILARANG menggunakan komentar (seperti // atau /* */) di dalam JSON karena merusak parse.
   - DILARANG menggunakan format markdown codeblock (\`\`\`json ... \`\`\`), kalimat pengantar ("Berikut kuisnya..."), atau catatan kaki. Mulai respons Anda langsung dari karakter '{' dan diakhiri dengan karakter '}'.
   - DILARANG menggunakan kutip ganda (") mentah di dalam nilai string. Gunakan single quote (') atau gunakan escape \\" jika terpaksa menggunakan kutip ganda di dalam teks.
   - Format struktur JSON wajib mengikuti:
{
  "soal": [
     {
        "id": "q-1",
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

      // Call dedicated quiz API endpoint with mode (replace / append)
      toast.loading('Menyimpan ke database...', { id: 'save-quiz' });
      fetch(`/api/modules/${selectedModuleId}/quiz`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soal: importedSoal, mode }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Gagal menyimpan ke database');
          toast.success(data.message || `Berhasil mengimpor ${importedSoal.length} soal ke database!`, { id: 'save-quiz' });
          qc.invalidateQueries({ queryKey: ['admin-quiz-module-detail', selectedModuleId] });
          qc.invalidateQueries({ queryKey: ['modules-belajar'] });
        })
        .catch((err) => {
          toast.error('Gagal simpan ke database: ' + err.message, { id: 'save-quiz' });
        });
    } catch (err: any) {
      toast.error('Gagal parse JSON: ' + err.message);
    }
  };

  // Manual Question handlers
  const handleAddManual = () => {
    const newQ: KuisSoal = {
      id: `q-manual-${Date.now()}`,
      pertanyaan: 'Tuliskan pertanyaan kuis di sini...',
      tipe: 'pilihan_ganda',
      pilihan: ['A. Pilihan A', 'B. Pilihan B', 'C. Pilihan C', 'D. Pilihan D'],
      jawaban: 'A',
      pembahasan: 'Penjelasan mengapa jawaban ini benar.',
    };
    setQuestions([newQ, ...questions]);
    setEditingQuestion(newQ);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.success('Soal berhasil dihapus.');
  };

  const handleBulkDelete = (ids: string[]) => {
    setQuestions((prev) => prev.filter((q) => !ids.includes(q.id)));
    toast.success(`${ids.length} soal berhasil dihapus.`);
  };

  const handleSaveQuestionEdit = (updated: KuisSoal) => {
    setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    setEditingQuestion(null);
    toast.success('Perubahan soal disimpan sementara.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-200 pb-12">
      {/* Top Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-white">
            <GraduationCap className="text-blue-500 shrink-0" size={28} />
            Manajemen Kuis Akhir Brevet AB
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan 100 soal kuis kelulusan modul (80 Pilihan Ganda & 20 Essay) dengan integrasi AI Batch & Claude Prompt.
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

      {/* Stats Bar & Save Action */}
      {selectedModuleId && (
        <QuizStatsBar
          questions={questions}
          onSave={() => saveMutation.mutate(questions)}
          isSaving={saveMutation.isPending}
          moduleTitle={moduleDetail?.module?.title}
          moduleCode={moduleDetail?.module?.code}
        />
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
              <span>Bank Soal ({questions.length})</span>
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
