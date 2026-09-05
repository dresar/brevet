'use client';

import { useState, useEffect, useCallback, use, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  ChevronUp,
  MessageCircle,
  Settings2,
  X,
  GraduationCap,
  CheckCircle2,
  Trophy,
  Images,
  Volume2,
  Square,
  WifiOff,
  DownloadCloud,
  Wand2,
  Calculator,
  Headphones,
} from 'lucide-react';
import { useOffline } from '@/lib/use-offline';
import { SectionRenderer } from '@/components/belajar/section-renderer';
import { TtsButton } from '@/components/belajar/tts-button';
import { AIChatWidget } from '@/components/belajar/ai-chat-widget';
import { FloatingToolsHub } from '@/components/belajar/floating-tools-hub';
import { QuickSearchModal } from '@/components/belajar/quick-search-modal';
import { QuickGlossaryModal } from '@/components/belajar/quick-glossary-modal';
import { QuickCalculatorModal } from '@/components/belajar/quick-calculator-modal';
import { MediaLibraryModal } from '@/components/belajar/media-library-modal';
import { GlosariumModal } from '@/components/belajar/GlosariumModal';
import { downloadModuleAudio, checkIsAudioDownloaded, getCachedAudioUrl } from '@/lib/offline-manager';
import { readFullModulePlaylist, stopSpeech } from '@/lib/chrome-speech';
import { DifficultyBadge } from '@/components/ui/badge';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { cn, cleanTitle } from '@/lib/utils';
import { toast } from 'sonner';
import type { Modul } from '@/lib/module-types';
import KuisAkhir from '@/components/belajar/kuis-akhir';


interface ModuleData {
  modul: {
    id: string;
    slug: string;
    title: string;
    code: string;
    category: string | null;
    difficulty: string | null;
    estimatedMinutes: number | null;
  };
  content: Modul;
  progress: {
    completionMap: Record<string, boolean>;
    totalBagian: number;
    completedBagian: number;
    persen: number;
  };
}

export default function BelajarSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const isOffline = useOffline();
  const qc = useQueryClient();

  // ── States ──
  const [activeBagianId, setActiveBagianId] = useState<string | null>(null);
  const [isReadingFullModule, setIsReadingFullModule] = useState(false);
  const [currentReadingTitle, setCurrentReadingTitle] = useState<string>('');
  const fullModuleCancelRef = useRef<(() => void) | null>(null);

  const handleToggleReadFullModule = () => {
    if (isReadingFullModule) {
      fullModuleCancelRef.current?.();
      fullModuleCancelRef.current = null;
      stopSpeech();
      setIsReadingFullModule(false);
      toast.info('Pembacaan modul dihentikan.');
      return;
    }

    if (!data?.content?.modul?.bagian) return;
    const allParagraphs: string[] = [];
    const sectionIndexMap: { pIdx: number; sectionId: string }[] = [];

    data.content.modul.bagian.forEach((b: any) => {
      allParagraphs.push(b.judul);
      sectionIndexMap.push({ pIdx: allParagraphs.length - 1, sectionId: b.id });
      b.paragraf.forEach((p: string) => {
        allParagraphs.push(p);
      });
    });

    setIsReadingFullModule(true);
    toast.success('Membacakan seluruh modul sekaligus (Suara Pria Indonesia)...');

    fullModuleCancelRef.current = readFullModulePlaylist(
      allParagraphs,
      (idx) => {
        const found = sectionIndexMap.find((m) => m.pIdx === idx);
        if (found) {
          scrollToSection(found.sectionId);
          const sec = data.content.modul.bagian.find((b: any) => b.id === found.sectionId);
          if (sec) {
            setCurrentReadingTitle(cleanTitle(sec.judul));
          }
        }
      },
      () => {
        setIsReadingFullModule(false);
        setCurrentReadingTitle('');
        fullModuleCancelRef.current = null;
        toast.success('Selesai membaca seluruh modul!');
      }
    );
  };
  const [showToc, setShowToc] = useState(true);
  const [fontLarge, setFontLarge] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPlayingFullAudio, setIsPlayingFullAudio] = useState(false);
  const [isAudioCached, setIsAudioCached] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // New tool modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false);
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [tiktokModalOpen, setTiktokModalOpen] = useState(false);
  const [initialAiQuestion, setInitialAiQuestion] = useState<string | undefined>(undefined);
  const [initialAiInputText, setInitialAiInputText] = useState<string | undefined>(undefined);
  const [showFinalQuiz, setShowFinalQuiz] = useState(false);
  const [highestScore, setHighestScore] = useState<number | null>(null);

  const handleOpenQuiz = () => {
    setShowFinalQuiz(true);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('quiz', '1');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleCloseQuiz = () => {
    setShowFinalQuiz(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('quiz');
      window.history.pushState({}, '', url.toString());
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('quiz') === '1') {
        setShowFinalQuiz(true);
      }
    }
  }, []);


  const handleAskAI = (question: string) => {
    setInitialAiQuestion(question);
    setInitialAiInputText(undefined);
    setChatOpen(true);
  };

  const handleAskAITyping = (prefixText: string) => {
    setInitialAiQuestion(undefined);
    setInitialAiInputText(prefixText);
    setChatOpen(true);
  };

  // Fetch module data
  const { data, isLoading, error } = useQuery<ModuleData>({
    queryKey: ['belajar', slug],
    queryFn: async () => {
      const res = await fetch(`/api/belajar/${slug}`);
      if (!res.ok) throw new Error('Modul tidak ditemukan');
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.modul?.id) {
      fetch(`/api/belajar/quiz-attempts?moduleId=${data.modul.id}`)
        .then((res) => res.json())
        .then((dbData) => {
          if (dbData.highestScore !== null) {
            setHighestScore(dbData.highestScore);
          } else {
            const saved = localStorage.getItem(`brevet_quiz_score_${slug}`);
            if (saved) setHighestScore(Number(saved));
          }
        })
        .catch(() => {
          const saved = localStorage.getItem(`brevet_quiz_score_${slug}`);
          if (saved) setHighestScore(Number(saved));
        });
    } else {
      const saved = localStorage.getItem(`brevet_quiz_score_${slug}`);
      if (saved) setHighestScore(Number(saved));
    }
  }, [data, slug]);

  const progressMutation = useMutation({
    mutationFn: async ({
      moduleId,
      sectionId,
      completed,
    }: {
      moduleId: string;
      sectionId: string;
      completed: boolean;
    }) => {
      // If offline, skip the API call to avoid failure. We'll rely on onSuccess/onMutate cache update.
      if (isOffline) {
        return { offlineFallback: true, moduleId, sectionId, completed };
      }
      
      const res = await fetch('/api/belajar/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, sectionId, completed }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan progres');
      return res.json();
    },
    onSuccess: (_, variables) => {
      qc.setQueryData<ModuleData>(['belajar', slug], (old) => {
        if (!old) return old;
        const newMap = {
          ...old.progress.completionMap,
          [variables.sectionId]: variables.completed,
        };
        const totalBagian = old.content?.modul?.bagian?.length ?? 0;
        const completedBagian = Object.values(newMap).filter(Boolean).length;
        const persen = totalBagian > 0 ? Math.round((completedBagian / totalBagian) * 100) : 0;

        return {
          ...old,
          progress: {
            completionMap: newMap,
            totalBagian,
            completedBagian,
            persen,
          },
        };
      });
      qc.invalidateQueries({ queryKey: ['modules-belajar'] });
    },
    onError: () => {
      toast.error('Gagal menyimpan progres. Coba lagi.');
    },
  });

  // Scroll tracking for active section & scroll-top button
  useEffect(() => {
    if (data?.content?.modul?.url_audio) {
      checkIsAudioDownloaded(data.content.modul.url_audio).then(setIsAudioCached);
    }
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      if (!data?.content?.modul?.bagian) return;
      const sections = data.content.modul.bagian;
      let current = sections[0]?.id ?? null;

      for (const bagian of sections) {
        const el = document.getElementById(`section-${bagian.id}`);
        if (el && el.getBoundingClientRect().top <= 120) {
          current = bagian.id;
        }
      }
      setActiveBagianId(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data]);

  const handleToggleComplete = useCallback(
    (sectionId: string, completed: boolean) => {
      if (!data) return;
      progressMutation.mutate({ moduleId: data.modul.id, sectionId, completed });
      if (completed) {
        if (isOffline) {
          toast.success('Disimpan lokal (Mode Offline)', { icon: '📴' });
        } else {
          toast.success('✅ Bagian ditandai selesai!');
        }
      }
    },
    [data, progressMutation, isOffline]
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="min-h-dvh" style={{ background: 'var(--bg-base)' }}>
        <div className="sticky top-0 h-14 border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
          <Skeleton className="h-8 w-64" />
          <SkeletonText lines={5} />
          <SkeletonText lines={4} />
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error || !data) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <BookOpen size={48} className="mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
          Modul Tidak Ditemukan
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Modul ini belum tersedia atau belum ditayangkan.
        </p>
        <Link
          href="/belajar"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--primary)' }}
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>
      </div>
    );
  }

  const { modul, content, progress } = data;
  const bagianList = content?.modul?.bagian ?? [];
  const isAllComplete = progress.persen === 100;

  // Build active bagian judul for chat context
  const activeBagian = bagianList.find((b) => b.id === activeBagianId);

  let pCount = 0;
  const totalParagraphs = bagianList.reduce((acc, bagian) => acc + (bagian.paragraf?.length || 0), 0);

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg-base)' }}>
      {/* ── Floating Back Button ── */}
      <Link
        href="/belajar"
        className="fixed top-2.5 left-2.5 sm:top-3 sm:left-4 z-[60] p-2.5 rounded-full bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-xl transition-all hover:scale-105 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
        aria-label="Kembali ke daftar modul"
      >
        <ArrowLeft size={18} />
      </Link>

      {/* ── Scrollable top header ── */}
      <header
        className="relative z-20 flex items-center gap-3 pr-4 py-3 border-b pl-14 sm:pl-16"
        style={{
          background: 'rgba(15,23,42,0.92)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Progress bar + title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}
            >
              {modul.code}
            </span>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-heading)' }}>
              {cleanTitle(modul.title)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)', maxWidth: '200px' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress.persen}%`,
                  background:
                    isAllComplete
                      ? 'var(--success)'
                      : 'linear-gradient(90deg, var(--primary), var(--accent))',
                }}
              />
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {progress.completedBagian}/{progress.totalBagian} selesai
            </span>
          </div>
        </div>

        {/* Toggle TOC button (desktop only) */}
        <button
          id="toggleTocBtn"
          onClick={() => setShowToc((t) => !t)}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-default hover:bg-slate-800 border"
          style={{
            background: showToc ? 'var(--primary-subtle)' : 'var(--bg-base)',
            color: showToc ? 'var(--primary)' : 'var(--text-muted)',
            borderColor: showToc ? 'rgba(59,130,246,0.3)' : 'var(--border)',
          }}
          title={showToc ? 'Sembunyikan Daftar Isi' : 'Tampilkan Daftar Isi'}
        >
          <BookOpen size={14} />
          <span>Daftar Isi</span>
        </button>

        {/* Media Library Button */}
        <button
          id="headerMediaBtn"
          onClick={() => setMediaModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-default hover:bg-slate-800 border shrink-0"
          style={{
            background: 'var(--bg-base)',
            color: 'var(--text-body)',
            borderColor: 'var(--border)',
          }}
          title="Buka Media Library (Upload & Salin Link)"
        >
          <Images size={14} className="text-blue-400" />
          <span className="hidden sm:inline">Media</span>
        </button>

        {/* Settings button */}
        <button
          id="readingSettingsBtn"
          onClick={() => setSettingsOpen((o) => !o)}
          className="p-2 rounded-xl transition-default hover:bg-slate-800"
          style={{ color: 'var(--text-muted)' }}
        >
          <Settings2 size={18} />
        </button>
      </header>

      {/* ── Reading Settings Dropdown ── */}
      {settingsOpen && (
        <div
          className="fixed top-16 right-4 z-30 p-4 rounded-xl space-y-3 animate-fade-in"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', width: '220px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>Tampilan</span>
            <button onClick={() => setSettingsOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={14} /></button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-body)' }}>Font Besar</span>
            <button
              id="fontSizeToggle"
              onClick={() => setFontLarge((f) => !f)}
              className="px-3 py-1 rounded-lg text-xs transition-default"
              style={fontLarge
                ? { background: 'var(--primary-subtle)', color: 'var(--primary)' }
                : { background: 'var(--bg-base)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {fontLarge ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-8 pb-24 flex gap-8">
        {/* ── Table of Contents (sticky, desktop, scrollable) ── */}
        {showToc && (
          <aside className="hidden lg:block w-72 shrink-0 animate-fade-in sticky top-20 max-h-[calc(100vh-6rem)]">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-3 px-2 shrink-0">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Daftar Isi
                </p>
                <button
                  onClick={() => setShowToc(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-default"
                >
                  <X size={13} />
                  <span>Sembunyikan</span>
                </button>
              </div>

              {/* Scrollable Section List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1.5 custom-scrollbar">
                {bagianList.map((bagian, i) => {
                  const done = progress.completionMap[bagian.id] === true;
                  const isActive = activeBagianId === bagian.id;
                  return (
                    <button
                      key={bagian.id}
                      id={`toc-${bagian.id}`}
                      onClick={() => scrollToSection(bagian.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center gap-2.5',
                      )}
                      style={isActive
                        ? { background: 'var(--primary-subtle)', color: 'var(--primary)', borderLeft: '3px solid var(--primary)' }
                        : { color: done ? 'var(--text-muted)' : 'var(--text-body)', borderLeft: '3px solid transparent' }
                      }
                    >
                      {done
                        ? <CheckCircle2 size={13} className="text-green-400 shrink-0" />
                        : <span className="w-[13px] shrink-0 text-xs text-center font-mono" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                      }
                      <span className={cn('leading-snug font-medium', done && 'line-through opacity-60')}>
                        {cleanTitle(bagian.judul)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Progress summary */}
              <div
                className="mt-3 px-3 py-2.5 rounded-xl space-y-1.5 shrink-0"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>Progres</span>
                  <span className={isAllComplete ? 'text-green-400 font-bold' : ''}>{progress.persen}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress.persen}%`,
                      background: isAllComplete ? 'var(--success)' : 'linear-gradient(90deg, var(--primary), var(--accent))',
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">
          {/* Module intro */}
          <div className="mb-10 pb-8 border-b space-y-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-3">
                {modul.difficulty && <DifficultyBadge difficulty={modul.difficulty} />}
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-heading)', lineHeight: '1.2' }}>
                  {cleanTitle(content.modul.judul)}
                </h1>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {/* Download Button */}
                {content.modul.url_audio && (
                  <button
                    onClick={async () => {
                      setIsDownloading(true);
                      const success = await downloadModuleAudio(content.modul.url_audio!);
                      if (success) {
                        setIsAudioCached(true);
                        toast.success('Tersimpan offline');
                      } else {
                        toast.error('Gagal mengunduh');
                      }
                      setIsDownloading(false);
                    }}
                    disabled={isDownloading || isAudioCached}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm border",
                      isAudioCached
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700"
                    )}
                  >
                    {isDownloading ? (
                      <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : isAudioCached ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <DownloadCloud size={15} />
                    )}
                    <span className="hidden sm:inline">{isDownloading ? 'Proses...' : isAudioCached ? 'Tersimpan' : 'Unduh'}</span>
                  </button>
                )}

                {/* TikTok Studio Link */}
                <Link
                  href="/admin/tiktok-prompts"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm border hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #db2777, #9333ea, #2563eb)',
                    color: '#fff',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    boxShadow: '0 2px 10px rgba(236, 72, 153, 0.3)',
                    textDecoration: 'none',
                  }}
                  title="Buka Studio Prompt TikTok AI 100 Slide (Halaman Penuh)"
                >
                  <Wand2 size={15} className="animate-pulse text-pink-300" />
                  <span className="hidden sm:inline font-bold">Studio Prompt TikTok</span>
                </Link>

                {/* Kamus Glosarium Link */}
                <Link
                  href={`/belajar/${slug}/glosarium`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border hover:scale-105 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                  title="Buka Kamus Istilah Glosarium Perpajakan"
                >
                  <BookOpen size={15} />
                  <span>Kamus Glosarium</span>
                </Link>

                {/* Ujian Akhir Link at the top */}
                {content.modul.kuis_akhir?.soal && content.modul.kuis_akhir.soal.length > 0 && (
                  <Link
                    href={`/belajar/${slug}/ujian`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border hover:scale-105 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white"
                  >
                    <Trophy size={15} />
                    <span>Ujian Akhir {highestScore !== null && `(${highestScore}/100)`}</span>
                  </Link>
                )}

                {/* Latihan Perhitungan Link at the top */}
                {content.modul.kuis_perhitungan?.soal && content.modul.kuis_perhitungan.soal.length > 0 && (
                  <Link
                    href={`/belajar/${slug}/perhitungan`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border hover:scale-105 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                  >
                    <Calculator size={15} />
                    <span>Latihan Hitung</span>
                  </Link>
                )}

                {/* Play All Button */}
                <button
                  disabled={isOffline && !isAudioCached}
                  onClick={async () => {
                    if (isPlayingFullAudio) {
                      audioRef.current?.pause();
                      setIsPlayingFullAudio(false);
                    } else {
                      if (content.modul.url_audio) {
                        if (!audioRef.current) {
                          // Try loading from cache if offline
                          let audioUrl = content.modul.url_audio;
                          if (isOffline && isAudioCached) {
                            const cachedUrl = await getCachedAudioUrl(content.modul.url_audio);
                            if (cachedUrl) audioUrl = cachedUrl;
                          }
                          
                          const audio = new Audio(audioUrl);
                          audio.onended = () => setIsPlayingFullAudio(false);
                          audioRef.current = audio;
                        }
                        audioRef.current.play();
                        setIsPlayingFullAudio(true);
                      } else {
                        toast.error('Audio belum tersedia');
                      }
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm",
                    (isOffline && !isAudioCached)
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : isPlayingFullAudio 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30" 
                        : "bg-primary text-white hover:bg-blue-600"
                  )}
                >
                  {isPlayingFullAudio ? (
                    <>
                      <Square size={15} fill="currentColor" />
                      Stop
                    </>
                  ) : (
                    <>
                      {(isOffline && !isAudioCached) ? <WifiOff size={15} /> : <Volume2 size={15} />}
                      Audio
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {content.modul.ringkasan && (
              <div className="mt-2">
                <div className="text-base leading-relaxed text-justify" style={{ color: 'var(--text-muted)' }}>
                  {content.modul.ringkasan}
                </div>
                <div className="mt-2.5 flex justify-end">
                  <TtsButton text={content.modul.ringkasan} />
                </div>
              </div>
            )}

            {/* Tujuan belajar */}
            {content.modul.tujuan_belajar && content.modul.tujuan_belajar.length > 0 && (
              <div
                className="rounded-xl p-4 mt-4"
                style={{ background: 'var(--primary-subtle)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--primary)' }}>
                  🎯 Setelah mempelajari ini, kamu akan bisa:
                </p>
                <ul className="space-y-1">
                  {content.modul.tujuan_belajar.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#93c5fd' }}>
                      <span className="mt-0.5">▸</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 flex justify-end">
                  <TtsButton text={`Setelah mempelajari ini, kamu akan bisa: ${content.modul.tujuan_belajar.join('. ')}`} />
                </div>
              </div>
            )}
          </div>

          {/* Sections */}
          <div className="space-y-16">
            {bagianList.map((bagian) => {
              return (
                <SectionRenderer
                  key={bagian.id}
                  bagian={bagian}
                  isCompleted={progress.completionMap[bagian.id] === true}
                  onToggleComplete={handleToggleComplete}
                  fontSizeLarge={fontLarge}
                  moduleSlug={modul.slug}
                  onImageUpdated={() => qc.invalidateQueries({ queryKey: ['belajar', slug] })}
                  onAskAI={handleAskAI}
                  onAskAITyping={handleAskAITyping}
                />
              );
            })}
          </div>

          {/* Completion badge */}
          {isAllComplete && (
            <div
              className="mt-16 rounded-2xl p-8 text-center animate-fade-in bg-slate-900 border border-slate-800"
              style={{ border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <Trophy size={40} className="mx-auto mb-3 text-yellow-400" />
              <h2 className="text-2xl font-bold text-green-400 mb-2">Modul Selesai! 🎉</h2>
              <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-xl mx-auto mb-6">
                Kamu telah menyelesaikan semua bagian dari modul {modul.title}. Sekarang kamu bisa menguji kemampuanmu dengan kuis akhir modul!
              </p>
              
              {((content.modul.kuis_akhir?.soal && content.modul.kuis_akhir.soal.length > 0) || (content.modul.kuis_perhitungan?.soal && content.modul.kuis_perhitungan.soal.length > 0)) ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {content.modul.kuis_akhir?.soal && content.modul.kuis_akhir.soal.length > 0 && (
                    <Link
                      href={`/belajar/${slug}/ujian`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold rounded-xl text-sm shadow-lg transition hover:scale-105"
                    >
                      <GraduationCap size={16} />
                      Mulai Kuis Akhir ({content.modul.kuis_akhir.soal.length} Soal)
                    </Link>
                  )}
                  
                  {content.modul.kuis_perhitungan?.soal && content.modul.kuis_perhitungan.soal.length > 0 && (
                    <Link
                      href={`/belajar/${slug}/perhitungan`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-lg transition hover:scale-105"
                    >
                      <Calculator size={16} />
                      Mulai Latihan Hitung ({content.modul.kuis_perhitungan.soal.length} Soal)
                    </Link>
                  )}

                  <Link
                    href="/belajar"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition"
                  >
                    Pilih Modul Lain
                  </Link>
                </div>
              ) : (
                <Link
                  href="/belajar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--success)' }}
                >
                  <GraduationCap size={16} />
                  Pilih Modul Lain
                </Link>
              )}
            </div>
          )}

          {showFinalQuiz && content.modul.kuis_akhir?.soal && data?.modul && (
            <KuisAkhir
              soal={content.modul.kuis_akhir.soal}
              moduleTitle={modul.title}
              moduleSlug={slug}
              moduleId={data.modul.id}
              onClose={() => {
                handleCloseQuiz();
                fetch(`/api/belajar/quiz-attempts?moduleId=${data.modul.id}`)
                  .then((res) => res.json())
                  .then((dbData) => {
                    if (dbData.highestScore !== null) {
                      setHighestScore(dbData.highestScore);
                    }
                  }).catch(() => {
                    const saved = localStorage.getItem(`brevet_quiz_score_${slug}`);
                    if (saved) setHighestScore(Number(saved));
                  });
              }}
            />
          )}
        </main>
      </div>

      {/* ── Floating Full Module Audio Player Bar ── */}
      {isReadingFullModule && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] w-[92%] max-w-lg p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-blue-500/60 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center shrink-0 animate-pulse">
              <Headphones size={16} className="text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">Membacakan Modul (Suara Pria):</p>
              <p className="text-xs font-semibold text-white truncate">{currentReadingTitle || cleanTitle(modul.title)}</p>
            </div>
          </div>
          <button
            onClick={handleToggleReadFullModule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition shrink-0"
            title="Hentikan Pembacaan Modul"
          >
            <Square size={12} className="fill-current" />
            <span>Stop</span>
          </button>
        </div>
      )}

      {/* ── Multi-Tool Floating Action Hub ── */}
      <FloatingToolsHub
        onOpenChat={() => {
          if (isOffline) {
            toast.error('AI tidak tersedia saat offline');
            return;
          }
          setInitialAiQuestion(undefined);
          setChatOpen(true);
        }}
        onToggleToc={() => setShowToc((t) => !t)}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenCalculator={() => setCalcModalOpen(true)}
        onOpenGlossary={() => setGlossaryModalOpen(true)}
        onOpenMedia={() => setMediaModalOpen(true)}
        onToggleSettings={() => setSettingsOpen((s) => !s)}
        showToc={showToc}
      />

      {/* ── AI Chat Widget ── */}
      {chatOpen && (
        <AIChatWidget
          moduleSlug={modul.slug}
          judulBagian={activeBagian ? cleanTitle(activeBagian.judul) : undefined}
          initialQuestion={initialAiQuestion}
          initialInputText={initialAiInputText}
          onClose={() => {
            setChatOpen(false);
            setInitialAiQuestion(undefined);
            setInitialAiInputText(undefined);
          }}
        />
      )}

      {/* ── Quick Modals ── */}
      <QuickSearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        bagianList={bagianList}
        onSelectSection={(sectionId) => scrollToSection(sectionId)}
      />

      <GlosariumModal
        isOpen={glossaryModalOpen}
        onClose={() => setGlossaryModalOpen(false)}
        moduleSlug={slug}
        moduleTitle={modul.title}
        fallbackGlosarium={content.modul.glosarium ?? []}
      />

      <QuickCalculatorModal
        open={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
      />
      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
      />
    </div>
  );
}
