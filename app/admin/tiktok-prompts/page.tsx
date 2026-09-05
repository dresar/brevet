'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Wand2,
  BookOpen,
  ArrowRight,
  Layers,
  FileText,
  CheckCircle2,
  FolderOpen,
  Trash2,
  RefreshCw,
  Clock,
  Copy,
  BarChart3,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cleanTitle, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SavedHistoryItem {
  id: string;
  moduleSlug: string;
  date: string;
  data: {
    module_title: string;
    total_batches: number;
    total_slides: number;
    batches: Array<{ batch_number: number; batch_title: string }>;
  };
}

export default function AdminTikTokPromptsPage() {
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('');
  const [selectedModuleTitle, setSelectedModuleTitle] = useState<string>('');
  const [targetTab, setTargetTab] = useState<'super_prompt' | 'json_importer'>('json_importer');
  const [savedMap, setSavedMap] = useState<Record<string, SavedHistoryItem[]>>({});
  const [copiedHistoryMap, setCopiedHistoryMap] = useState<Record<string, Record<string, string>>>({});

  // Fetch all modules for the selector list
  const { data: modulesData, isLoading } = useQuery({
    queryKey: ['admin-modules-list'],
    queryFn: async () => {
      const res = await fetch('/api/modules?simple=true');
      return res.json() as Promise<{ modules: Array<{ id: string; title: string; code: string; slug: string }> }>;
    },
  });

  const modules = modulesData?.modules ?? [];

  // Load copied histories from localStorage
  useEffect(() => {
    if (modules.length === 0) return;
    const map: Record<string, Record<string, string>> = {};
    modules.forEach((m) => {
      try {
        const raw = localStorage.getItem(`tiktok_copied_history_${m.slug}`);
        if (raw) map[m.slug] = JSON.parse(raw);
      } catch {}
    });
    setCopiedHistoryMap(map);
  }, [modules]);

  // Sync saved prompt histories from PostgreSQL DB & LocalStorage fallback
  const loadSavedHistories = async () => {
    const newMap: Record<string, SavedHistoryItem[]> = {};

    try {
      const res = await fetch('/api/ai/tiktok-prompts/db');
      if (res.ok) {
        const json = await res.json();
        if (json.prompts && Array.isArray(json.prompts)) {
          json.prompts.forEach((row: any) => {
            newMap[row.moduleSlug] = [
              {
                id: row.id,
                moduleSlug: row.moduleSlug,
                date: new Date(row.updatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
                data: row.promptsJson,
              },
            ];
          });
          setSavedMap(newMap);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to read from DB, using localStorage fallback:', e);
    }

    if (typeof window === 'undefined') return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tiktok_prompts_history_')) {
          const slug = key.replace('tiktok_prompts_history_', '');
          const val = localStorage.getItem(key);
          if (val) {
            newMap[slug] = JSON.parse(val);
          }
        }
      }
      setSavedMap(newMap);
    } catch (e) {
      console.error('Failed to read saved prompt histories:', e);
    }
  };

  useEffect(() => {
    loadSavedHistories();
  }, []);

  const router = useRouter();

  const handleSelectModule = (slug: string, title: string, tab: 'super_prompt' | 'json_importer' = 'json_importer') => {
    router.push(`/admin/tiktok-prompts/${slug}?tab=${tab}`);
  };

  const handleDeleteSavedPrompt = async (slug: string, idToDelete?: string) => {
    try {
      localStorage.removeItem(`tiktok_prompts_history_${slug}`);
      await fetch(`/api/ai/tiktok-prompts/db?slug=${slug}`, { method: 'DELETE' });
      await loadSavedHistories();
      toast.success('Hasil prompt tersimpan berhasil dihapus dari database');
    } catch (e) {
      toast.error('Gagal menghapus hasil prompt');
    }
  };

  const totalSavedSuites = Object.keys(savedMap).length;

  const handleResetAllPromptHistories = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Apakah Anda yakin ingin menghapus SELURUH hasil impor prompt TikTok untuk SEMUA modul dari database? Anda akan mulai murni dari awal.')) {
      return;
    }
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tiktok_prompts_history_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      await fetch('/api/ai/tiktok-prompts/db?slug=all', { method: 'DELETE' });
      setSavedMap({});
      toast.success('Semua data hasil impor prompt TikTok berhasil direset & dihapus dari database!');
    } catch (e) {
      toast.error('Gagal mereset data riwayat');
    }
  };

  // Stats from copied history
  const getTotalCopiedBatches = (slug: string) => {
    const hist = copiedHistoryMap[slug];
    if (!hist) return 0;
    return Object.keys(hist).filter((k) => k.startsWith('batch-')).length;
  };

  const getCompletionPercent = (slug: string) => {
    const saved = savedMap[slug];
    if (!saved || saved.length === 0) return 0;
    const totalBatches = saved[0].data.batches?.length || 0;
    const copied = getTotalCopiedBatches(slug);
    return totalBatches > 0 ? Math.round((copied / totalBatches) * 100) : 0;
  };

  // Summary stats
  const totalBatchesImported = Object.values(savedMap).reduce((acc, items) => {
    return acc + (items[0]?.data.batches?.length || 0);
  }, 0);
  const totalBatchesCopied = Object.keys(copiedHistoryMap).reduce((acc, slug) => {
    return acc + getTotalCopiedBatches(slug);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1529] via-blue-950/30 to-[#0c1529] border border-cyan-500/25 shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Wand2 size={28} className="animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-1">
                Studio Prompt TikTok — Brevet AB
              </div>
              <h1 className="text-xl sm:text-lg sm:text-2xl font-bold text-white">
                TikTok Visual Content AI Generator
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Generate, impor, dan kelola 100 slide visual TikTok per modul perpajakan menggunakan Claude / ChatGPT AI.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {totalSavedSuites > 0 && (
              <button
                onClick={handleResetAllPromptHistories}
                className="py-2 px-3 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-1.5 active:scale-95"
                title="Reset & Hapus Semua Hasil Impor dari Awal"
              >
                <Trash2 size={14} />
                <span className="hidden sm:block">Reset Semua</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        {totalSavedSuites > 0 && (
          <div className="relative grid grid-cols-3 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
            {[
              { label: 'Modul Tersimpan', val: totalSavedSuites, icon: <BookOpen size={14} />, color: 'text-cyan-400' },
              { label: 'Batch Terimpor', val: `${totalBatchesImported} / ${totalSavedSuites * 10}`, icon: <Layers size={14} />, color: 'text-purple-400' },
              { label: 'Batch Disalin', val: totalBatchesCopied, icon: <Copy size={14} />, color: 'text-emerald-400' },
              { label: 'Slide Tersedia', val: totalBatchesImported * 10, icon: <BarChart3 size={14} />, color: 'text-pink-400' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide mb-1 ${s.color}`}>
                  {s.icon} {s.label}
                </div>
                <div className="text-lg font-black text-white">{s.val}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: Saved Prompts Collection (If Any) */}
      {totalSavedSuites > 0 && (
        <div className="bg-[#0F172A] border border-emerald-500/25 rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">Hasil Impor Tersimpan ({totalSavedSuites} Modul)</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Klik untuk buka studio atau lanjutkan proses per batch</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Siap Copas per Batch & Slide
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(savedMap).map(([slug, items]) => {
              if (!items || items.length === 0) return null;
              const latest = items[0];
              const batchCount = latest.data.batches?.length || 0;
              const slideCount = latest.data.total_slides || batchCount * 10;
              const matchedModul = modules.find((m) => m.slug === slug);
              const title = matchedModul?.title || latest.data.module_title;
              const copiedBatches = getTotalCopiedBatches(slug);
              const completionPct = getCompletionPercent(slug);

              return (
                <div
                  key={slug}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400/60 transition-all space-y-3 shadow-xl relative group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        {matchedModul?.code || 'TERSIMPAN'}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} className="text-slate-500" />
                        {latest.date}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2">
                      {cleanTitle(title)}
                    </h3>

                    <div className="flex items-center gap-3 text-xs pt-0.5">
                      <span className="font-bold text-cyan-300">{batchCount}/10 Batch</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300">{slideCount} Slide</span>
                      {copiedBatches > 0 && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <CheckCircle2 size={11} /> {copiedBatches} disalin
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Progress salin batch</span>
                      <span className={completionPct === 100 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{completionPct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          completionPct === 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : completionPct > 50
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                            : 'bg-gradient-to-r from-pink-500 to-purple-500'
                        )}
                        style={{ width: `${Math.max(3, completionPct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSelectModule(slug, title, 'json_importer')}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <FolderOpen size={13} />
                      <span>Buka Studio</span>
                      <ArrowRight size={12} />
                    </button>

                    <button
                      onClick={() => handleDeleteSavedPrompt(slug, latest.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Hapus Hasil Prompt Tersimpan Ini"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: All Modules Selector Grid */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <BookOpen size={16} className="text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Semua Modul Brevet AB ({modules.length} Modul)</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Pilih modul untuk generate atau lanjutkan prompt TikTok</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <Layers size={13} className="text-pink-400" />
            1 Modul = 10 Batch (100 Slide)
          </span>
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto" />
              <span>Memuat daftar modul Brevet AB...</span>
            </div>
          ) : modules.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-950/50 rounded-2xl border border-slate-800">
              Tidak ada modul perpajakan yang ditemukan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m) => {
                const savedItems = savedMap[m.slug];
                const hasSaved = savedItems && savedItems.length > 0;
                const latestSaved = hasSaved ? savedItems[0] : null;
                const batchCount = latestSaved?.data.batches?.length || 0;
                const copiedBatches = getTotalCopiedBatches(m.slug);
                const allBatchesCopied = hasSaved && copiedBatches >= batchCount && batchCount > 0;
                const completionPct = getCompletionPercent(m.slug);

                return (
                  <div
                    key={m.id}
                    className={cn(
                      'p-4 rounded-2xl bg-slate-950/80 border transition-all flex flex-col justify-between group space-y-3 shadow-lg',
                      allBatchesCopied
                        ? 'border-emerald-500/50 hover:border-emerald-400'
                        : hasSaved
                        ? 'border-cyan-500/30 hover:border-cyan-400/60'
                        : 'border-slate-800 hover:border-slate-700'
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0',
                            allBatchesCopied
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                              : hasSaved
                              ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                              : 'text-slate-400 bg-slate-800/50 border-slate-700'
                          )}
                        >
                          {m.code}
                        </span>

                        {allBatchesCopied ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                            <CheckCircle2 size={11} />
                            Selesai 100%
                          </span>
                        ) : hasSaved ? (
                          <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 shrink-0">
                            <CheckCircle2 size={11} />
                            {batchCount} Batch
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                            <FileText size={11} />
                            100 Slide
                          </span>
                        )}
                      </div>

                      <h3 className={cn(
                        'text-sm font-bold leading-snug transition-colors line-clamp-2',
                        allBatchesCopied ? 'text-emerald-300 group-hover:text-emerald-200' : 'text-white group-hover:text-cyan-300'
                      )}>
                        {cleanTitle(m.title)}
                      </h3>

                      {/* Progress info */}
                      {hasSaved && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-500">
                            <span>{copiedBatches} dari {batchCount} batch disalin</span>
                            <span className={completionPct === 100 ? 'text-emerald-400' : ''}>{completionPct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                completionPct === 100
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                              )}
                              style={{ width: `${Math.max(2, completionPct)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {hasSaved ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleSelectModule(m.slug, m.title, 'json_importer')}
                          className={cn(
                            'w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 border active:scale-95',
                            allBatchesCopied
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20 border-emerald-400/30'
                              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/20 border-cyan-400/30'
                          )}
                        >
                          <FolderOpen size={14} />
                          <span>Buka Studio ({batchCount} Batch)</span>
                          <ArrowRight size={14} />
                        </button>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                          <button
                            onClick={() => handleSelectModule(m.slug, m.title, 'super_prompt')}
                            className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
                          >
                            <RefreshCw size={10} />
                            <span>Buat Prompt Ulang</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSavedPrompt(m.slug)}
                            className="hover:text-red-400 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 size={10} />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectModule(m.slug, m.title, 'super_prompt')}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-lg shadow-pink-600/20 transition-all flex items-center justify-center gap-2 border border-pink-400/30 active:scale-95"
                      >
                        <Zap size={14} />
                        <span>Generate Super Prompt (100 Slide)</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
