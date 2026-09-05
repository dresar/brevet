'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Wand2,
  RefreshCw,
  Bot,
  Zap,
  Upload,
  FileCode,
  Sliders,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Trash2,
  History,
  Plus,
  X,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface TikTokSlideItem {
  slide_number: number;
  slide_title: string;
  legal_verification?: string;
  key_point: string;
  visual_prompt_en: string;
  visual_prompt_id?: string;
  creator_notes?: string;
}

export interface TikTokBatchItem {
  batch_number: number;
  batch_title: string;
  visual_style: string;
  master_batch_prompt: string;
  tiktok_caption: string;
  slides: TikTokSlideItem[];
}

export interface MasterBatchPromptJson {
  module_title: string;
  total_batches: number;
  total_slides: number;
  global_visual_config: {
    primary_theme?: string;
    accent_color?: string;
    accent_color_1?: string;
    accent_color_2?: string;
    mascot_character?: string;
    visual_style_type?: string;
    aspect_ratio?: string;
    readability?: string;
    forbidden_styles?: string;
  };
  batches: TikTokBatchItem[];
}

interface TikTokPromptStudioProps {
  moduleSlug: string;
  moduleTitle: string;
  initialTab?: 'super_prompt' | 'json_importer';
  onBack?: () => void;
}

export function TikTokPromptStudio({
  moduleSlug,
  moduleTitle,
  initialTab = 'super_prompt',
  onBack,
}: TikTokPromptStudioProps) {
  const [activeTab, setActiveTab] = useState<'super_prompt' | 'json_importer'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [superPromptClaude, setSuperPromptClaude] = useState<string>('');

  // JSON Importer & Parser States
  const [rawJsonInput, setRawJsonInput] = useState<string>('');
  const [parsedJsonData, setParsedJsonData] = useState<MasterBatchPromptJson | null>(null);
  const [savedHistories, setSavedHistories] = useState<Array<{ id: string; moduleSlug: string; date: string; data: MasterBatchPromptJson }>>([]);
  const [selectedBatchNum, setSelectedBatchNum] = useState<number>(1);
  const [selectedSlideIdx, setSelectedSlideIdx] = useState<number>(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Custom Visual Style Override
  const [customStyleOverride, setCustomStyleOverride] = useState<'navy_matte' | 'cyberpunk' | 'editorial' | 'minimalist'>('navy_matte');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedHistory, setCopiedHistory] = useState<Record<string, string>>({});
  const [targetBatchForPrompt, setTargetBatchForPrompt] = useState<number>(0);

  // Load copied history from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`tiktok_copied_history_${moduleSlug}`);
      if (raw) setCopiedHistory(JSON.parse(raw));
    } catch {}
  }, [moduleSlug]);

  // Load saved histories from Database & LocalStorage fallback
  useEffect(() => {
    async function loadFromDb() {
      try {
        const res = await fetch(`/api/ai/tiktok-prompts/db?slug=${moduleSlug}`);
        if (res.ok) {
          const json = await res.json();
          if (json.found && json.prompt?.promptsJson) {
            const dbData = json.prompt.promptsJson as MasterBatchPromptJson;
            const dbItem = {
              id: json.prompt.id,
              moduleSlug,
              date: new Date(json.prompt.updatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
              data: dbData,
            };
            setSavedHistories([dbItem]);
            setParsedJsonData(dbData);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load from DB, fallback to localStorage:', e);
      }

      // LocalStorage fallback
      try {
        const stored = localStorage.getItem(`tiktok_prompts_history_${moduleSlug}`);
        if (stored) {
          const parsedHist = JSON.parse(stored);
          setSavedHistories(parsedHist);
          if (parsedHist.length > 0 && !parsedJsonData) {
            setParsedJsonData(parsedHist[0].data);
          }
        }
      } catch (e) {
        console.error('Failed to load saved tiktok prompts history:', e);
      }
    }

    loadFromDb();
  }, [moduleSlug]);

  // Save history helper (Saves to both Database and LocalStorage)
  const saveToHistory = (newData: MasterBatchPromptJson) => {
    try {
      const newItem = {
        id: `hist_${Date.now()}`,
        moduleSlug,
        date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        data: newData,
      };
      setSavedHistories((prevHistories) => {
        const updated = [newItem, ...prevHistories.filter((h) => h.data.module_title !== newData.module_title)];
        localStorage.setItem(`tiktok_prompts_history_${moduleSlug}`, JSON.stringify(updated));
        return updated;
      });

      // Async save to PostgreSQL DB
      fetch('/api/ai/tiktok-prompts/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleSlug,
          moduleTitle,
          promptsJson: newData,
        }),
      }).catch((e) => console.error('Error saving to DB:', e));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  const handleDeleteHistory = async (idToDelete: string) => {
    const updated = savedHistories.filter((h) => h.id !== idToDelete);
    setSavedHistories(updated);
    localStorage.setItem(`tiktok_prompts_history_${moduleSlug}`, JSON.stringify(updated));
    if (parsedJsonData && savedHistories.find((h) => h.id === idToDelete)?.data.module_title === parsedJsonData.module_title) {
      setParsedJsonData(updated.length > 0 ? updated[0].data : null);
    }

    try {
      await fetch(`/api/ai/tiktok-prompts/db?slug=${moduleSlug}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete from DB:', e);
    }

    toast.success('Hasil impor berhasil dihapus dari database');
  };

  const handleGenerateSuperPrompt = async (targetBatchNum: number = targetBatchForPrompt) => {
    setIsLoading(true);
    setTargetBatchForPrompt(targetBatchNum);
    try {
      const res = await fetch('/api/ai/tiktok-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_slug: moduleSlug,
          action: 'get_super_prompt',
          target_batch: targetBatchNum,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghasilkan prompt');
      }

      if (json.super_prompt_claude) {
        setSuperPromptClaude(json.super_prompt_claude);
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat membuat prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate super prompt instantly on mount or moduleSlug change (< 0.1s)
  useEffect(() => {
    if (moduleSlug) {
      handleGenerateSuperPrompt(0);
    }
  }, [moduleSlug]);

  const handleParseJsonInput = (overrideText?: string) => {
    const textToParse = overrideText !== undefined ? overrideText : rawJsonInput;
    if (!textToParse.trim()) {
      toast.error('Silakan tempelkan (paste) teks JSON dari Claude / AI terlebih dahulu');
      return;
    }

    try {
      let text = textToParse.trim();
      if (text.startsWith('```json')) text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      else if (text.startsWith('```')) text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');

      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.slice(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(text) as MasterBatchPromptJson;

      // Handle single top-level slides array if AI didn't wrap inside batches
      if ((parsed as any).slides && !parsed.batches) {
        const slides = (parsed as any).slides;
        const firstSlideNum = slides[0]?.slide_number || 1;
        const inferredBatchNum = Math.floor((firstSlideNum - 1) / 10) + 1;
        parsed.batches = [
          {
            batch_number: inferredBatchNum,
            batch_title: (parsed as any).batch_title || `Batch ${inferredBatchNum} (Slide ${(inferredBatchNum - 1) * 10 + 1}-${inferredBatchNum * 10})`,
            visual_style: (parsed as any).visual_style || 'Modern Tax Education Editorial',
            master_batch_prompt: (parsed as any).master_batch_prompt || '',
            tiktok_caption: (parsed as any).tiktok_caption || '',
            slides: slides,
          },
        ];
      }

      if (!parsed.batches || !Array.isArray(parsed.batches)) {
        throw new Error('Format JSON tidak memiliki properti "batches" atau "slides"');
      }

      // Intelligent Batch Number Auto-Correction based on slide numbers
      parsed.batches.forEach((batch) => {
        if (batch.slides && batch.slides.length > 0) {
          const firstSlideNum = batch.slides[0]?.slide_number || 1;
          const calculatedBatchNum = Math.floor((firstSlideNum - 1) / 10) + 1;
          
          // Auto-fix batch_number if ChatGPT returned batch_number: 1 for Slide 11-20
          batch.batch_number = calculatedBatchNum;
          if (!batch.batch_title || batch.batch_title.startsWith('Batch 1:')) {
            batch.batch_title = `Batch ${calculatedBatchNum} (Slide ${(calculatedBatchNum - 1) * 10 + 1}-${calculatedBatchNum * 10})`;
          }
        }
      });

      setParsedJsonData((prevData) => {
        const existingBatches = prevData?.batches || savedHistories[0]?.data?.batches || [];
        const batchMap = new Map<number, TikTokBatchItem>();
        existingBatches.forEach((b) => batchMap.set(b.batch_number, b));
        parsed.batches.forEach((b) => batchMap.set(b.batch_number, b));

        const mergedBatches = Array.from(batchMap.values()).sort((a, b) => a.batch_number - b.batch_number);

        const mergedData: MasterBatchPromptJson = {
          ...parsed,
          module_title: prevData?.module_title || savedHistories[0]?.data?.module_title || parsed.module_title,
          total_batches: Math.max(10, mergedBatches.length),
          total_slides: mergedBatches.reduce((acc, b) => acc + (b.slides?.length || 0), 0),
          batches: mergedBatches,
        };

        // Save complete merged data (with all batches) to LocalStorage & History
        saveToHistory(mergedData);

        return mergedData;
      });

      const newlyAddedBatchNum = parsed.batches[0]?.batch_number || 1;
      setSelectedBatchNum(newlyAddedBatchNum);
      setSelectedSlideIdx(0);
      setRawJsonInput('');
      setIsImportModalOpen(false);

      const slideRangeStart = (newlyAddedBatchNum - 1) * 10 + 1;
      const slideRangeEnd = newlyAddedBatchNum * 10;
      toast.success(`Berhasil mengurai & menggabungkan Batch ${newlyAddedBatchNum} (Slide ${slideRangeStart}-${slideRangeEnd})! Total: ${(parsedJsonData?.batches?.length || 0) + 1} Batch tersimpan.`);
    } catch (err: any) {
      toast.error(`Gagal mengurai JSON: ${err.message || 'Format tidak valid'}`);
    }
  };

  const copyToClipboard = (text: string, fieldId: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success(`${label} berhasil disalin!`);

    // Persist copied timestamp in localStorage
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const updatedHistory = { ...copiedHistory, [fieldId]: now };
    setCopiedHistory(updatedHistory);
    try {
      localStorage.setItem(`tiktok_copied_history_${moduleSlug}`, JSON.stringify(updatedHistory));
    } catch {}

    setTimeout(() => setCopiedField(null), 3000);
  };

  const isCopied = (fieldId: string) => !!copiedHistory[fieldId];
  const getCopiedTime = (fieldId: string) => copiedHistory[fieldId] || null;

  const activeBatch = parsedJsonData?.batches?.find((b) => b.batch_number === selectedBatchNum);
  const activeSlide = activeBatch?.slides?.[selectedSlideIdx];

  const applyStyleOverride = (basePrompt: string) => {
    let cleanPrompt = basePrompt.replace(/\bslide\s*\d+(\/\d+)?\b/gi, '').trim();
    let suffix = ' Single 4:5 vertical image ONLY (1080x1350 px) for this individual slide (do NOT render grid poster or multiple slides in one image canvas), Modern Tax Education Editorial design style, 4:5 aspect ratio (1080x1350 px), solid flat deep navy background (#0F172A), top-right corner MUST be kept completely clean empty navy space (strictly reserved for manual logo placement, do NOT draw any logo badge or text in top-right corner), rich infographic layout with frosted dark bento cards, thin 1px gold/slate borders, formula breakdown boxes, high-contrast crisp white typography (#FFFFFF), subtle gold accent lines (#F59E0B), selective realistic matte 3D tax elements (UU KUP/HPP book, official tax document with charts, gold clip pens, tax folder, calculator, magnifying glass, desk calendar, or compliance shield on dark mahogany desk), generous negative space, asymmetric editorial layout, 8K photographic render. NO gold dominance, NO tacky glossy reflections, NO technology HUD/circuits, NO cartoon characters, NO crowded 3D objects, STRICT NO SLIDE NUMBERS, STRICTLY NO METADATA WORDS LIKE "JUDUL MODUL UTUH", NO DRAWN LOGO CIRCLES IN TOP-RIGHT CORNER.';
    if (customStyleOverride === 'cyberpunk') {
      suffix = ' Single 4:5 vertical image ONLY (1080x1350 px) for this individual slide, Modern Tax Education Editorial style, 4:5 aspect ratio, solid deep navy background, top-right corner is kept completely clean empty navy space, dark bento cards with thin gold borders, bold white typography, subtle gold/orange accent badge, realistic matte 3D legal document, generous whitespace, 8K render.';
    } else if (customStyleOverride === 'editorial') {
      suffix = ' Single 4:5 vertical image ONLY (1080x1350 px) for this individual slide, Swiss Modern Tax Editorial style, 4:5 aspect ratio, top-right corner kept clean empty reserved space, crisp white typography grid, dark bento container cards, deep navy background, subtle gold accent highlights, selective 3D tax props, generous negative space, 8K.';
    } else if (customStyleOverride === 'minimalist') {
      suffix = ' Single 4:5 vertical image ONLY (1080x1350 px) for this individual slide, ultra-clean Modern Tax Editorial, 4:5 aspect ratio, top-right corner kept clean empty navy space, high-contrast white text, minimal gold accent, subtle matte 3D document and bento data boxes, generous negative space, 8K.';
    }
    return `${cleanPrompt}${suffix}`;
  };

  const formatSingleSlidePrompt = (slide: TikTokSlideItem, batch: TikTokBatchItem) => {
    const cfg = parsedJsonData?.global_visual_config;

    const visualElements = "Top-Right Clean Empty Reserved Space, Bento Grid Container Cards, Formula / Data Tables / Step Pipelines, Selective Realistic Matte 3D Tax Objects (UU KUP/HPP Books, Tax Documents with Charts, Gold Clip Pens, Calculators, Magnifying Glass, Desk Calendar, Security Shield), Crisp White Bold Typography, Subtle Gold Accents";
    const primaryTheme = cfg?.primary_theme || "Deep Navy Solid/Matte (#0F172A / #0B132B)";
    const accent1 = cfg?.accent_color_1 || cfg?.accent_color || "DJP Gold Accent (#F59E0B)";
    const accent2 = cfg?.accent_color_2 || "Warm Orange Accent (#F97316)";
    const aspectRatio = cfg?.aspect_ratio || "4:5 Vertical Ratio (1080x1350 px)";
    const readability = cfg?.readability || "Teks putih tebal sangat besar langsung terbaca 1 detik di layar smartphone";
    const forbidden = cfg?.forbidden_styles || "NO gold dominance, NO tacky glossy reflections, NO technology HUD/circuits, NO cartoon characters, NO crowded 3D objects, NO drawn logo badges in top-right corner, NO metadata text 'JUDUL MODUL UTUH', NO plain empty text slides";

    let output = `=========================================\n`;
    output += `🎨 PROMPT SLIDE ${slide.slide_number}: ${slide.slide_title.toUpperCase()}\n`;
    output += `Batch : ${batch.batch_title}\n`;
    output += `=========================================\n\n`;

    output += `🚨 ATURAN GENERATE GAMBAR AI (1 PROMPT = 1 SLIDE 4:5 / 1080x1350 PX):\n`;
    output += `• Salin prompt 'Prompt English' di bawah ini untuk membuat 1 GAMBAR VERTIKAL TERPISAH (rasio 4:5) khusus Slide ${slide.slide_number}.\n`;
    output += `• DILARANG MENGGABUNGKAN MULTIPLE SLIDE DALAM SATU CANVAS GAMBAR!\n\n`;

    output += `🏷️ ATURAN POJOK KANAN ATAS (AREA KOSONG LOGO):\n`;
    output += `• Pojok kanan atas WAJIB dibiarkan KOSONG POLOS BERSIH dengan background deep navy (khusus reserved untuk pasang logo manual nanti, DILARANG menggambar lingkaran/badge/teks di pojok kanan atas).\n\n`;

    output += `🚫 ATURAN TEKS GAMBAR (HANYA TEKS MATERI ASLI):\n`;
    output += `• DILARANG KERAS MENULISKAN FRASA KETERANGAN METADATA SEPERTI 'JUDUL MODUL UTUH', 'SLIDE 1', 'HOOK UTAMA', ATAU LABEL STRUCTURAL LAINNYA KE DALAM GAMBAR!\n`;
    output += `• Teks yang digambar HANYA BOLEH Teks Judul Materi Asli (contoh: 'KETENTUAN UMUM PERPAJAKAN (KUP)').\n\n`;

    output += `📐 GLOBAL VISUAL RULES (MODERN TAX EDUCATION EDITORIAL - WAJIB DIPATUHI):\n`;
    output += `• Aspek Rasio       : ${aspectRatio}\n`;
    output += `• Warna Utama       : ${primaryTheme}\n`;
    output += `• Warna Teks Utama  : Putih Bersih High-Contrast (#FFFFFF) — Sangat Besar, Tebal, Langsung Terbaca 1 Detik di HP\n`;
    output += `• Aksen Warna       : ${accent1} / ${accent2} — HANYA untuk highlight kata penting / garis pembatas kecil (DILARANG DOMINASI EMAS)\n`;
    output += `• Elemen Visual     : ${visualElements}\n`;
    output += `• Keterbacaan Teks  : ${readability}\n`;
    output += `• HAPUS ANGKA SLIDE : DILARANG KERAS MENULIS 'SLIDE 1/100' ATAU ANGKA COUNTER PADA GAMBAR!\n`;
    output += `• ATURAN TEKS GAMBAR: MAKSIMAL 20-25 KARAKTER TOTAL! FONT WAJIB BESAR & CLEAR!\n`;
    output += `• Tata Letak        : MODERN TAX EDUCATION EDITORIAL (Top-Right Clean Reserved Space, Bento Cards, Asymmetric Grid, Selective Matte 3D)\n`;
    output += `• Dilarang          : ${forbidden}\n`;
    output += `• Style Override    : ${customStyleOverride}\n\n`;

    if (slide.legal_verification) output += `📜 Verifikasi Hukum : ${slide.legal_verification}\n`;
    output += `💡 Poin Inti        : ${slide.key_point}\n\n`;

    output += `🇬🇧 PROMPT VISUAL ENGLISH (DALL-E 3 / MIDJOURNEY / FLUX):\n`;
    output += `${applyStyleOverride(slide.visual_prompt_en)}\n\n`;

    if (slide.visual_prompt_id) {
      output += `🇮🇩 PROMPT VISUAL INDONESIA:\n`;
      output += `${slide.visual_prompt_id}\n\n`;
    }

    if (slide.creator_notes) {
      output += `🎬 CATATAN KREATOR & VO:\n`;
      output += `${slide.creator_notes}\n`;
    }

    return output;
  };

  const formatFullBatchPrompt = (batch: TikTokBatchItem) => {
    const cfg = parsedJsonData?.global_visual_config;

    const visualElements = "Selective Realistic Matte 3D Tax Objects (UU HPP Books, Tax Documents, Calculators), Crisp White Bold Typography, Subtle Gold/Orange Accents (#F59E0B / #F97316)";
    const primaryTheme = cfg?.primary_theme || "Deep Navy Solid/Matte (#0F172A / #0B132B)";
    const accent1 = cfg?.accent_color_1 || cfg?.accent_color || "DJP Gold Accent (#F59E0B)";
    const accent2 = cfg?.accent_color_2 || "Warm Orange Accent (#F97316)";
    const aspectRatio = cfg?.aspect_ratio || "4:5 Vertical Ratio (1080x1350 px)";
    const readability = cfg?.readability || "Teks putih tebal sangat besar langsung terbaca 1 detik di layar smartphone";
    const forbidden = cfg?.forbidden_styles || "NO gold dominance, NO tacky glossy reflections, NO technology HUD/circuits, NO cartoon characters, NO crowded 3D objects, NO promotional poster look";

    let output = `=========================================\n`;
    output += `🎨 MASTER BATCH PROMPT (${batch.batch_title.toUpperCase()})\n`;
    output += `=========================================\n\n`;

    output += `🚨 IMPORTANT AI IMAGE GENERATOR DIRECTIVE (MIDJOURNEY / DALL-E 3 / FLUX):\n`;
    output += `• Dokumen ini berisi prompt untuk 10 SLIDE GAMBAR VERTIKAL TERPISAH (1 Gambar = 1 Slide 4:5 / 1080x1350 px).\n`;
    output += `• DILARANG MENGGABUNGKAN 10 SLIDE DALAM SATU CANVAS GAMBAR ATAU POSTER GRID!\n`;
    output += `• Untuk membuat gambar per slide, gunakan prompt 'Prompt English' dari masing-masing slide secara INDIVIDUAL.\n\n`;

    output += `📐 GLOBAL VISUAL RULES (MODERN TAX EDUCATION EDITORIAL - WAJIB DIPATUHI DI ALL ${batch.slides.length} SLIDES):\n`;
    output += `• Aspek Rasio       : ${aspectRatio}\n`;
    output += `• Warna Utama       : ${primaryTheme}\n`;
    output += `• Warna Teks Utama  : Putih Bersih High-Contrast (#FFFFFF) — Sangat Besar, Tebal, Langsung Terbaca 1 Detik di HP\n`;
    output += `• Aksen Warna       : ${accent1} / ${accent2} — HANYA untuk highlight kata penting / garis pembatas kecil (DILARANG DOMINASI EMAS)\n`;
    output += `• Elemen Visual     : ${visualElements}\n`;
    output += `• Keterbacaan Teks  : ${readability}\n`;
    output += `• HAPUS ANGKAN SLIDE: DILARANG KERAS MENULIS 'SLIDE 1/100' ATAU ANGKA COUNTER PADA GAMBAR!\n`;
    output += `• ATURAN TEKS GAMBAR: MAKSIMAL 20-25 KARAKTER TOTAL! FONT WAJIB BESAR & CLEAR!\n`;
    output += `• Tata Letak        : MODERN TAX EDUCATION EDITORIAL (Asymmetric Grid, Generous Whitespace, Selective Subtle Matte 3D)\n`;
    output += `• Dilarang          : ${forbidden}\n`;
    output += `• Gaya Render       : Modern Tax Education Editorial, Matte Studio Lighting, 8K Resolution Photographic Render\n`;
    output += `• Style Override    : ${customStyleOverride}\n\n`;

    output += `📋 MASTER BATCH DIRECTIVES (KONTEKS VISUAL KESELURUHAN BATCH):\n`;
    output += `${applyStyleOverride(batch.master_batch_prompt)}\n\n`;

    output += `=========================================\n`;
    output += `🖼️  10 CAROUSEL SLIDE PROMPTS (${batch.slides.map(s => `SLIDE ${s.slide_number}`).join(', ')}):\n`;
    output += `=========================================\n\n`;

    batch.slides.forEach((s, idx) => {
      output += `--- [SLIDE ${s.slide_number}: ${s.slide_title}] ---\n`;
      if (s.legal_verification) output += `📜 Verifikasi Hukum : ${s.legal_verification}\n`;
      output += `💡 Poin Inti        : ${s.key_point}\n`;
      output += `🇬🇧 Prompt English   : ${applyStyleOverride(s.visual_prompt_en)}\n`;
      if (s.visual_prompt_id) output += `🇮🇩 Prompt Indonesia : ${s.visual_prompt_id}\n`;
      if (s.creator_notes) output += `🎬 Catatan Kreator  : ${s.creator_notes}\n`;
      output += idx < batch.slides.length - 1 ? `\n` : ``;
    });

    return output;
  };

  const handleResetThisModulePrompts = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Apakah Anda yakin ingin mereset & menghapus seluruh data hasil impor untuk modul ini? Anda bisa mulai impor dari awal.')) {
      return;
    }
    try {
      localStorage.removeItem(`tiktok_prompts_history_${moduleSlug}`);
      setSavedHistories([]);
      setParsedJsonData(null);
      setSelectedBatchNum(1);
      setSelectedSlideIdx(0);

      await fetch(`/api/ai/tiktok-prompts/db?slug=${moduleSlug}`, { method: 'DELETE' });

      toast.success('Data hasil impor untuk modul ini berhasil direset & dihapus dari database!');
    } catch (e) {
      toast.error('Gagal mereset data modul ini');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Studio Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Kembali ke Pilihan Modul"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Wand2 size={24} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              Studio Visual 100 Slide (10 Batch)
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{moduleTitle}</h2>
          </div>
        </div>

        {/* Tab Buttons & Reset Button */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {parsedJsonData && (
            <button
              onClick={handleResetThisModulePrompts}
              className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-1.5 active:scale-95"
              title="Reset Semua Hasil Impor Modul Ini"
            >
              <Trash2 size={14} />
              <span>Reset Data Modul Ini</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('super_prompt')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                activeTab === 'super_prompt'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Zap size={14} />
              <span>1. Master Super Prompt</span>
            </button>

            <button
              onClick={() => setActiveTab('json_importer')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                activeTab === 'json_importer'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Upload size={14} />
              <span>2. Impor & Parser JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View (Full Width Page Inline) */}
      {activeTab === 'super_prompt' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/50 to-slate-900 border border-blue-500/30 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Bot size={20} />
              <span>PETUNJUK MASTER SUPER PROMPT (ULTRA-MODERN 2026 INFOGRAFIS)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Super Prompt di bawah memuat <strong className="text-cyan-300">100% data materi modul utuh (tanpa pemotongan)</strong>. Anda dapat memilih untuk generate <strong className="text-cyan-300">Seluruh 10 Batch (100 Slide)</strong> sekaligus atau <strong className="text-pink-300">Fokus per-Batch (10 Slide/Batch)</strong> agar AI tidak memperingkas teks dan tidak terpotong token limit. Salin teks ke Claude / ChatGPT!
            </p>

            {/* Batch Focus Selector Buttons */}
            <div className="pt-2 space-y-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-400" />
                Pilih Mode / Fokus Generasi Super Prompt:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                <button
                  disabled={isLoading}
                  onClick={() => handleGenerateSuperPrompt(0)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5',
                    targetBatchForPrompt === 0
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <Zap size={13} />
                  <span>🔥 Master Full 10 Batch (100 Slide)</span>
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bNum) => (
                  <button
                    key={bNum}
                    disabled={isLoading}
                    onClick={() => handleGenerateSuperPrompt(bNum)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border',
                      targetBatchForPrompt === bNum
                        ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    )}
                  >
                    Batch {bNum} (10 Slide Utuh)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!superPromptClaude || isLoading ? (
            <div className="p-10 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-5">
              <Wand2 size={40} className="mx-auto text-cyan-400 animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-white">
                  {targetBatchForPrompt === 0
                    ? 'Menyiapkan Master Super Prompt Full 10-Batch...'
                    : `Menyiapkan Super Prompt Khusus Batch ${targetBatchForPrompt} (10 Slide Utuh)...`}
                </h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
                  Aturan keras: TANPA karakter kartun raksasa, teks serba besar mudah dibaca lansia & anak muda, gaya visual ultra-modern 2026.
                </p>
              </div>
              <button
                disabled={isLoading}
                onClick={() => handleGenerateSuperPrompt(targetBatchForPrompt)}
                className="py-3.5 px-7 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-2 border border-cyan-400/30 mx-auto"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Menyusun Prompt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate Prompt {targetBatchForPrompt === 0 ? 'Full 10-Batch' : `Batch ${targetBatchForPrompt}`}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FileText size={16} className="text-cyan-400" />
                  {targetBatchForPrompt === 0
                    ? 'Master Super Prompt Claude / ChatGPT Full 10-Batch (Siap Copas):'
                    : `Super Prompt Claude / ChatGPT Khusus Batch ${targetBatchForPrompt} (Slide ${(targetBatchForPrompt - 1) * 10 + 1}-${targetBatchForPrompt * 10}) (Siap Copas):`}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      superPromptClaude,
                      'super-prompt-claude',
                      targetBatchForPrompt === 0
                        ? 'Master Super Prompt 10-Batch'
                        : `Super Prompt Batch ${targetBatchForPrompt}`
                    )
                  }
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg flex items-center gap-2 border border-cyan-400/30 active:scale-95"
                >
                  {copiedField === 'super-prompt-claude' ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedField === 'super-prompt-claude' ? 'Tersalin!' : 'Salin Super Prompt'}</span>
                </button>
              </div>

              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2 shadow-2xl">
                <pre className="text-xs font-mono text-cyan-200 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  {superPromptClaude}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: JSON IMPORTER & BATCH PARSER */}
      {activeTab === 'json_importer' && (
        <div className="space-y-6">
          {/* Saved Histories Manager Bar */}
          {savedHistories.length > 0 && (
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <History size={16} />
                  Simpanan Database Modul Ini:
                </span>
                <span className="text-[10px] text-slate-400">Pilih untuk membuka kembali / Hapus</span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {savedHistories.map((h) => {
                  const isActive = parsedJsonData?.module_title === h.data.module_title;
                  return (
                    <div
                      key={h.id}
                      className={cn(
                        'p-3 rounded-2xl border text-xs flex items-center gap-3 shrink-0 transition-all',
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      )}
                    >
                      <button
                        onClick={() => {
                          setParsedJsonData(h.data);
                          setSelectedBatchNum(h.data.batches?.[0]?.batch_number || 1);
                          setSelectedSlideIdx(0);
                        }}
                        className="text-left space-y-0.5"
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="text-pink-400 font-bold">[{h.data.batches?.length || 0} dari 10 Batch Terimpor ({h.data.total_slides || (h.data.batches?.length || 0) * 10} Slide)]</span>
                          <span className="truncate max-w-[200px]">{h.data.module_title || 'Hasil Impor'}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">{h.date}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteHistory(h.id)}
                        className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors border border-red-500/20"
                        title="Hapus Hasil Impor Ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Module Batch Completion Progress Dashboard Header */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  Status Kelengkapan Modul 10 Batch (100 Slide)
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {parsedJsonData?.batches?.length || 0} dari 10 Batch Terimpor ({ (parsedJsonData?.batches?.length || 0) * 10 } / 100 Slide)
                </h3>
              </div>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="py-3 px-5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 transition-all shadow-lg flex items-center gap-2 border border-pink-400/30 active:scale-95"
              >
                <Upload size={16} />
                <span>+ Tempel (Paste) JSON Batch Baru</span>
              </button>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, ((parsedJsonData?.batches?.length || 0) / 10) * 100))}%` }}
              />
            </div>
          </div>

          {!parsedJsonData ? (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <FileCode size={18} className="text-pink-400" />
                  Tempelkan (Paste) Teks JSON Balasan dari Claude / ChatGPT:
                </span>
              </div>

              <textarea
                rows={10}
                value={rawJsonInput}
                onChange={(e) => setRawJsonInput(e.target.value)}
                placeholder="Paste teks JSON murni (~30.000+ karakter) balasan dari Claude/ChatGPT untuk Batch 1 atau Batch mana saja di sini..."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 custom-scrollbar"
              />

              <button
                onClick={() => handleParseJsonInput()}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 transition-all shadow-xl shadow-pink-600/20 flex items-center justify-center gap-2 border border-pink-400/30"
              >
                <Sparkles size={18} />
                <span>Urai & Tampilkan Batch (100 Slide Interactive Navigator)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Global Style Override Toolbar */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Sliders size={16} className="text-cyan-400" />
                  <span className="font-bold">Override Aesthetic Theme Gambar:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'navy_matte', label: 'DJP Navy & Gold' },
                    { id: 'cyberpunk', label: 'Cyberpunk HUD' },
                    { id: 'editorial', label: 'Swiss Editorial' },
                    { id: 'minimalist', label: 'Minimalist Vector' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setCustomStyleOverride(st.id as any)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border',
                        customStyleOverride === st.id
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="py-1.5 px-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Upload size={13} />
                  <span>Paste JSON Baru</span>
                </button>
              </div>

              {/* 10 Batch Navigator Bar (Batch 1 - 10) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Layers size={16} className="text-pink-400" />
                    Pilih Batch Paket TikTok (Batch 1 s/d 10):
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bNum) => {
                    const isImported = parsedJsonData?.batches?.some((b) => b.batch_number === bNum);
                    const isSelected = selectedBatchNum === bNum;
                    const slideStart = (bNum - 1) * 10 + 1;
                    const slideEnd = bNum * 10;

                    return (
                      <button
                        key={bNum}
                        onClick={() => {
                          setSelectedBatchNum(bNum);
                          setSelectedSlideIdx(0);
                        }}
                        className={cn(
                          'px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex flex-col items-center gap-0.5',
                          isSelected
                            ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-xl shadow-pink-500/10 scale-105'
                            : isImported && isCopied(`batch-${bNum}`)
                            ? 'bg-emerald-900/40 border-emerald-500/60 text-emerald-300 hover:border-emerald-400'
                            : isImported
                            ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          {isImported && isCopied(`batch-${bNum}`) ? (
                            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                          ) : isImported ? (
                            <CheckCircle2 size={13} className="text-emerald-400/60 shrink-0" />
                          ) : (
                            <Plus size={13} className="text-slate-500 shrink-0" />
                          )}
                          <span>Batch {bNum} ({slideStart}-{slideEnd})</span>
                        </div>
                        {isImported && isCopied(`batch-${bNum}`) && (
                          <span className="text-[9px] text-emerald-400/70 font-normal">✓ disalin {getCopiedTime(`batch-${bNum}`)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Batch Card OR Unimported Batch Action State */}
              {activeBatch ? (
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">


                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                        Batch {activeBatch.batch_number} (Slide {(activeBatch.batch_number - 1) * 10 + 1}-{activeBatch.batch_number * 10})
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">{activeBatch.batch_title}</h3>
                    </div>

                    <button
                      onClick={() =>
                        copyToClipboard(
                          formatFullBatchPrompt(activeBatch),
                          `batch-${activeBatch.batch_number}`,
                          `Semua Prompt Slide Batch ${activeBatch.batch_number} (10 Slide Lengkap)`
                        )
                      }
                      className={cn(
                        'py-3 px-5 rounded-2xl text-xs font-bold text-white shadow-xl flex items-center gap-2 border transition-all active:scale-95',
                        isCopied(`batch-${activeBatch.batch_number}`) && copiedField !== `batch-${activeBatch.batch_number}`
                          ? 'bg-emerald-700/80 border-emerald-400/50 hover:bg-emerald-600/80'
                          : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-pink-600/20 border-pink-400/30'
                      )}
                    >
                      {copiedField === `batch-${activeBatch.batch_number}` ? (
                        <Check size={16} />
                      ) : isCopied(`batch-${activeBatch.batch_number}`) ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                      <span>
                        {copiedField === `batch-${activeBatch.batch_number}`
                          ? 'Tersalin!'
                          : isCopied(`batch-${activeBatch.batch_number}`)
                          ? `✓ Sudah Disalin (${getCopiedTime(`batch-${activeBatch.batch_number}`)}) — Salin Ulang`
                          : `Salin Semua Prompt Batch ${activeBatch.batch_number} (10 Slide Lengkap)`}
                      </span>
                    </button>
                  </div>

                  {/* TikTok Caption Box */}
                  {activeBatch.tiktok_caption && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                        <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                          <FileText size={14} />
                          Caption & Hashtags TikTok Batch Ini
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              activeBatch.tiktok_caption,
                              `cap-${activeBatch.batch_number}`,
                              `Caption Batch ${activeBatch.batch_number}`
                            )
                          }
                          className={cn(
                            'flex items-center gap-1 font-semibold transition-colors',
                            copiedField === `cap-${activeBatch.batch_number}`
                              ? 'text-emerald-400'
                              : isCopied(`cap-${activeBatch.batch_number}`)
                              ? 'text-emerald-500/70 hover:text-emerald-400'
                              : 'text-pink-400 hover:text-pink-300'
                          )}
                        >
                          {copiedField === `cap-${activeBatch.batch_number}` ? (
                            <><Check size={12} /> Tersalin!</>
                          ) : isCopied(`cap-${activeBatch.batch_number}`) ? (
                            <><CheckCircle2 size={12} /> ✓ Salin Ulang Caption ({getCopiedTime(`cap-${activeBatch.batch_number}`)})</>  
                          ) : (
                            'Salin Caption'
                          )}
                        </button>
                      </div>
                      <p className="text-slate-200 whitespace-pre-line leading-relaxed">{activeBatch.tiktok_caption}</p>
                    </div>
                  )}

                  {/* Slide Tabs Navigator */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">
                        Slide Individual ({selectedSlideIdx + 1} / {activeBatch.slides?.length || 10}):
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={selectedSlideIdx === 0}
                          onClick={() => setSelectedSlideIdx((prev) => Math.max(0, prev - 1))}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          disabled={selectedSlideIdx === (activeBatch.slides?.length || 1) - 1}
                          onClick={() =>
                            setSelectedSlideIdx((prev) => Math.min((activeBatch.slides?.length || 1) - 1, prev + 1))
                          }
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {activeBatch.slides?.map((s, idx) => (
                        <button
                          key={s.slide_number}
                          onClick={() => setSelectedSlideIdx(idx)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                            selectedSlideIdx === idx
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          )}
                        >
                          Slide {s.slide_number}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Individual Slide Card */}
                  {activeSlide && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-white">{activeSlide.slide_title}</h4>
                        {activeSlide.legal_verification && (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            {activeSlide.legal_verification}
                          </span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 text-xs text-slate-300">
                        <span className="font-bold text-cyan-400 block mb-1">Poin Pembelajaran:</span>
                        <p className="leading-relaxed">{activeSlide.key_point}</p>
                      </div>

                      {/* Individual Prompt Box */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-pink-300">
                            Prompt English (DALL-E 3 / Midjourney):
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                formatSingleSlidePrompt(activeSlide, activeBatch),
                                `slide-${activeSlide.slide_number}`,
                                `Prompt Slide ${activeSlide.slide_number} (Lengkap Aturan Utama)`
                              )
                            }
                            className={cn(
                              'flex items-center gap-1.5 text-xs font-semibold transition-colors',
                              copiedField === `slide-${activeSlide.slide_number}`
                                ? 'text-emerald-400'
                                : isCopied(`slide-${activeSlide.slide_number}`)
                                ? 'text-emerald-500/70 hover:text-emerald-400'
                                : 'text-pink-400 hover:text-pink-300'
                            )}
                          >
                            {copiedField === `slide-${activeSlide.slide_number}` ? (
                              <><Check size={14} /> Tersalin!</>
                            ) : isCopied(`slide-${activeSlide.slide_number}`) ? (
                              <><CheckCircle2 size={14} /> ✓ Disalin ({getCopiedTime(`slide-${activeSlide.slide_number}`)}) — Salin Ulang</>
                            ) : (
                              <><Copy size={14} /> Salin Prompt Slide {activeSlide.slide_number} (Lengkap Aturan Utama)</>
                            )}
                          </button>
                        </div>
                        <p className="text-xs font-mono text-slate-200 select-all leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                          {applyStyleOverride(activeSlide.visual_prompt_en)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Unimported Batch Action State */
                <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-6 shadow-2xl">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 max-w-xl mx-auto space-y-2">
                    <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm">
                      <AlertCircle size={20} />
                      <span>Batch {selectedBatchNum} (Slide {(selectedBatchNum - 1) * 10 + 1} s/d {selectedBatchNum * 10}) Belum Diimpor</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Anda belum mengimpor hasil balasan JSON untuk Batch {selectedBatchNum}. Ikuti 2 langkah mudah di bawah ini untuk mengimpor dan menggabungkannya ke dalam studio!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {/* Step 1 */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                        Langkah 1
                      </span>
                      <h4 className="text-sm font-bold text-white">Salin Super Prompt Batch {selectedBatchNum}</h4>
                      <p className="text-xs text-slate-400">
                        Ambil instruksi lengkap untuk dikirimkan ke Claude / ChatGPT agar AI membuatkan JSON Batch {selectedBatchNum} (Slide {(selectedBatchNum - 1) * 10 + 1}-{selectedBatchNum * 10}).
                      </p>
                      <button
                        onClick={() => {
                          handleGenerateSuperPrompt(selectedBatchNum);
                          setActiveTab('super_prompt');
                        }}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Zap size={14} />
                        <span>Buka Super Prompt Batch {selectedBatchNum}</span>
                      </button>
                    </div>

                    {/* Step 2 */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded-full border border-pink-500/20">
                        Langkah 2
                      </span>
                      <h4 className="text-sm font-bold text-white">Tempel (Paste) Balasan JSON</h4>
                      <p className="text-xs text-slate-400">
                        Setelah AI selesai membalas dalam bentuk JSON, tempelkan teks balasan tersebut ke dalam sistem di sini.
                      </p>
                      <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Upload size={14} />
                        <span>Tempel JSON Batch {selectedBatchNum}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* JSON Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Upload size={20} className="text-pink-400" />
                  <span>Impor & Gabungkan Balasan JSON Batch Baru</span>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles size={14} />
                  Sistem Otomatis Merge & Mendeteksi Nomor Batch
                </p>
                <p className="text-slate-300">
                  Tempelkan teks JSON balasan dari Claude/ChatGPT untuk Batch berapa saja (misal: Batch 2, 3, 4...). Sistem akan otomatis membaca `batch_number` dan menggabungkannya tanpa menghapus batch yang sudah diimpor sebelumnya!
                </p>
              </div>

              <textarea
                rows={10}
                value={rawJsonInput}
                onChange={(e) => setRawJsonInput(e.target.value)}
                placeholder="Paste teks JSON murni balasan dari Claude/ChatGPT di sini (Contoh: JSON untuk Batch 2 Slide 11-20)..."
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500/50 custom-scrollbar"
              />

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleParseJsonInput()}
                  className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 transition-all shadow-lg flex items-center gap-2 border border-pink-400/30"
                >
                  <Sparkles size={16} />
                  <span>Urai & Gabungkan Batch</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
