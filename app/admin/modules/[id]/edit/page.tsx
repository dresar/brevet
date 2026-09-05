'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit3,
  Save,
  CheckCircle2,
  AlertTriangle,
  Wand2,
  FileCode,
  Eye,
  BookOpen,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  Link as LinkIcon,
  Image as ImageIcon,
  Calculator,
  PanelLeft,
  Grid3x3,
  Tag,
  AlertOctagon,
  Eraser,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RichContentRenderer } from '@/components/belajar/rich-content-renderer';
import { autoFixModuleJson, validateModuleJson } from '@/lib/json-utils';
import type { Modul, Bagian } from '@/lib/module-types';

export default function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Dasar');
  const [difficulty, setDifficulty] = useState('pemula');
  const [status, setStatus] = useState('tayang');
  const [jsonText, setJsonText] = useState('');
  const [saving, setSaving] = useState(false);

  // Live Modul Object State for Visual Editor
  const [modulState, setModulState] = useState<Modul | null>(null);

  // Modal State for Interactive Tool Insertion
  const [toolModalState, setToolModalState] = useState<{
    open: boolean;
    sectionIdx: number;
    pIdx: number;
    type: 'box' | 'alert' | 'table' | 'math' | 'badge' | 'link' | 'img';
    titleInput: string;
    contentInput: string;
    urlInput: string;
  } | null>(null);

  // Fetch module detail
  const { data, isLoading, error } = useQuery({
    queryKey: ['module', id],
    queryFn: async () => {
      const res = await fetch(`/api/modules/${id}`);
      if (!res.ok) throw new Error('Modul tidak ditemukan');
      return res.json() as Promise<{
        module: {
          id: string;
          code: string;
          slug: string;
          title: string;
          category: string | null;
          difficulty: string | null;
          status: string | null;
          contentJson: Modul;
        };
      }>;
    },
  });

  useEffect(() => {
    if (data?.module) {
      const m = data.module;
      setCode(m.code || '');
      setTitle(m.title || '');
      setCategory(m.category || 'Dasar');
      setDifficulty(m.difficulty || 'pemula');
      setStatus(m.status || 'tayang');
      if (m.contentJson) {
        setModulState(m.contentJson);
        setJsonText(JSON.stringify(m.contentJson, null, 2));
      }
    }
  }, [data]);

  // Sync tab switching
  const handleTabSwitch = (tab: 'visual' | 'code') => {
    if (tab === 'code') {
      if (modulState) {
        setJsonText(JSON.stringify(modulState, null, 2));
      }
      setActiveTab('code');
    } else {
      try {
        const parsed = JSON.parse(jsonText);
        setModulState(parsed as Modul);
        setActiveTab('visual');
      } catch (err) {
        toast.error(`Perbaiki kesalahan sintaks JSON terlebih dahulu sebelum membuka Visual Editor: ${String(err)}`);
      }
    }
  };

  // Helper functions for Visual Editor
  const updateModulField = (updater: (prev: Modul) => Modul) => {
    setModulState((prev) => {
      if (!prev) return prev;
      const updated = updater(structuredClone(prev));
      setJsonText(JSON.stringify(updated, null, 2));
      return updated;
    });
  };

  // Section manipulation
  const handleAddSection = () => {
    updateModulField((prev) => {
      const bagianList = prev.modul?.bagian ?? [];
      const nextIndex = bagianList.length + 1;
      const newId = `bag-${String(nextIndex).padStart(2, '0')}`;

      const newBagian: Bagian = {
        id: newId,
        judul: `Judul Bagian ${nextIndex}`,
        paragraf: ['Tulis materi paragraf baru di sini...'],
        poin_penting: ['💡 Poin penting pertama...'],
        analogi: 'Bayangkan situasi ini sebagai...',
        contoh_kasus: {
          judul: 'Kasus Contoh',
          cerita: 'Cerita kasus contoh dengan angka konkret...',
          poin: ['Langkah penyelesaian 1...'],
        },
        diagram_mermaid: [],
        penjelasan_diagram: '',
        prompt_gambar: [],
        kalkulator: null,
        mini_kuis: [],
        kesalahan_umum: [],
        istilah: [],
      };

      prev.modul.bagian.push(newBagian);
      return prev;
    });
    toast.success('✨ Bagian baru berhasil ditambahkan!');
  };

  const handleRemoveSection = (index: number) => {
    updateModulField((prev) => {
      prev.modul.bagian.splice(index, 1);
      return prev;
    });
    toast.success('🗑️ Bagian berhasil dihapus.');
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    updateModulField((prev) => {
      const list = prev.modul.bagian;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < list.length) {
        const temp = list[index];
        list[index] = list[targetIndex];
        list[targetIndex] = temp;
      }
      return prev;
    });
  };

  // Paragraph manipulation
  const handleAddParagraph = (sectionIdx: number) => {
    updateModulField((prev) => {
      prev.modul.bagian[sectionIdx].paragraf.push('Tulis paragraf materi baru di sini...');
      return prev;
    });
    toast.success('Paragraf baru ditambahkan.');
  };

  const handleRemoveParagraph = (sectionIdx: number, pIdx: number) => {
    updateModulField((prev) => {
      prev.modul.bagian[sectionIdx].paragraf.splice(pIdx, 1);
      return prev;
    });
    toast.success('🗑️ Paragraf berhasil dihapus.');
  };

  // Remove only hyperlinks (<a>) from paragraph, keeping the link text
  const handleRemoveLinks = (sectionIdx: number, pIdx: number) => {
    updateModulField((prev) => {
      const currentP = prev.modul.bagian[sectionIdx].paragraf[pIdx] || '';
      const cleaned = currentP.replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1').trim();
      prev.modul.bagian[sectionIdx].paragraf[pIdx] = cleaned || 'Teks paragraf...';
      return prev;
    });
    toast.success('🔗 Semua hyperlink berhasil dihapus dari paragraf!');
  };

  // Remove only images (<img>) from paragraph
  const handleRemoveImages = (sectionIdx: number, pIdx: number) => {
    updateModulField((prev) => {
      const currentP = prev.modul.bagian[sectionIdx].paragraf[pIdx] || '';
      const cleaned = currentP.replace(/<img[^>]*>/gi, '').trim();
      prev.modul.bagian[sectionIdx].paragraf[pIdx] = cleaned || 'Teks paragraf...';
      return prev;
    });
    toast.success('🖼️ Semua gambar berhasil dihapus dari paragraf!');
  };

  // Remove only tables (<table>) from paragraph
  const handleRemoveTables = (sectionIdx: number, pIdx: number) => {
    updateModulField((prev) => {
      const currentP = prev.modul.bagian[sectionIdx].paragraf[pIdx] || '';
      const cleaned = currentP.replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '').trim();
      prev.modul.bagian[sectionIdx].paragraf[pIdx] = cleaned || 'Teks paragraf...';
      return prev;
    });
    toast.success('🗒️ Semua tabel berhasil dihapus dari paragraf!');
  };

  // Clean / Remove Inserted HTML Views & Special Tools from paragraph
  const handleClearHtmlSnippet = (sectionIdx: number, pIdx: number) => {
    updateModulField((prev) => {
      const currentP = prev.modul.bagian[sectionIdx].paragraf[pIdx] || '';
      // Remove HTML tags and LaTeX math blocks while preserving inner text
      const cleaned = currentP
        .replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1')
        .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '')
        .replace(/\$\$[\s\S]*?\$\$/g, '')
        .replace(/<img[^>]*>/gi, '')
        .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
        .replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1')
        .trim();

      prev.modul.bagian[sectionIdx].paragraf[pIdx] = cleaned || 'Teks paragraf...';
      return prev;
    });
    toast.success('🧹 Elemen HTML Views / Tool berhasil dihapus dari paragraf!');
  };

  // Open Tool Configuration Modal
  const openToolModal = (
    sectionIdx: number,
    pIdx: number,
    type: 'box' | 'alert' | 'table' | 'math' | 'badge' | 'link' | 'img'
  ) => {
    let defaultTitle = '';
    let defaultContent = '';
    let defaultUrl = '';

    if (type === 'box') {
      defaultTitle = 'Catatan Penting DJP';
      defaultContent = 'Tulis penjelasan detail catatan di sini...';
    } else if (type === 'alert') {
      defaultTitle = 'Peringatan Risiko & Sanksi Denda';
      defaultContent = 'Keterlambatan pelaporan akan dikenakan sanksi denda administrasi...';
    } else if (type === 'table') {
      defaultTitle = 'Kategori | Tarif | Keterangan';
      defaultContent = 'Penghasilan OP | 5% - 35% | UU HPP\nOmset UMKM | 0.5% | PPh Final PP 55';
    } else if (type === 'math') {
      defaultContent = '\\text{PPN Terutang} = 12\\% \\times \\text{DPP}';
    } else if (type === 'badge') {
      defaultTitle = 'Coretax 2026';
    } else if (type === 'link') {
      defaultTitle = 'Situs Resmi DJP Pajak.go.id';
      defaultUrl = 'https://pajak.go.id';
    } else if (type === 'img') {
      defaultTitle = 'Ilustrasi Simulasi Coretax';
      defaultUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c';
    }

    setToolModalState({
      open: true,
      sectionIdx,
      pIdx,
      type,
      titleInput: defaultTitle,
      contentInput: defaultContent,
      urlInput: defaultUrl,
    });
  };

  // Apply tool insertion from modal
  const handleApplyToolInsert = () => {
    if (!toolModalState) return;
    const { sectionIdx, pIdx, type, titleInput, contentInput, urlInput } = toolModalState;

    updateModulField((prev) => {
      const currentP = prev.modul.bagian[sectionIdx].paragraf[pIdx] || '';
      let snippet = '';

      if (type === 'box') {
        snippet = `\n<div class="p-4 my-3 rounded-xl border border-sky-500/30 bg-sky-950/40 text-sky-200 shadow-lg">💡 <strong>${titleInput || 'Catatan'}:</strong> ${contentInput}</div>\n`;
      } else if (type === 'alert') {
        snippet = `\n<div class="p-4 my-3 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-200 shadow-lg">⚠️ <strong>${titleInput || 'Peringatan'}:</strong> ${contentInput}</div>\n`;
      } else if (type === 'table') {
        const headers = (titleInput || 'Kolom 1 | Kolom 2 | Kolom 3').split('|').map((h) => h.trim());
        const rows = contentInput.split('\n').filter(Boolean).map((r) => r.split('|').map((c) => c.trim()));

        const ths = headers.map((h) => `<th class="p-2.5 text-left border-b border-slate-700 font-semibold text-sky-300">${h}</th>`).join('');
        const trs = rows.map((r) => {
          const tds = r.map((c) => `<td class="p-2.5 text-slate-200 font-medium">${c}</td>`).join('');
          return `<tr class="border-b border-slate-800/60">${tds}</tr>`;
        }).join('');

        snippet = `\n<table class="w-full text-sm border-collapse my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950"><thead><tr class="bg-slate-800">${ths}</tr></thead><tbody>${trs}</tbody></table>\n`;
      } else if (type === 'math') {
        snippet = `\n$$${contentInput || '\\text{Rumus} = 0'}$$\n`;
      } else if (type === 'badge') {
        snippet = ` <span class="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">${titleInput || 'Badge'}</span> `;
      } else if (type === 'link') {
        snippet = ` <a href="${urlInput || 'https://pajak.go.id'}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline font-medium">${titleInput || urlInput}</a> `;
      } else if (type === 'img') {
        snippet = `\n<img src="${urlInput || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c'}" alt="${titleInput}" class="rounded-xl border border-slate-800 my-3 max-w-full shadow-xl" />\n`;
      }

      prev.modul.bagian[sectionIdx].paragraf[pIdx] = currentP + snippet;
      return prev;
    });

    toast.success(`✨ Tool (${type.toUpperCase()}) berhasil disisipkan!`);
    setToolModalState(null);
  };

  // Key points manipulation
  const handleAddKeyPoint = (sectionIdx: number) => {
    updateModulField((prev) => {
      if (!prev.modul.bagian[sectionIdx].poin_penting) {
        prev.modul.bagian[sectionIdx].poin_penting = [];
      }
      prev.modul.bagian[sectionIdx].poin_penting.push('💡 Poin penting baru...');
      return prev;
    });
  };

  const handleRemoveKeyPoint = (sectionIdx: number, kIdx: number) => {
    updateModulField((prev) => {
      prev.modul.bagian[sectionIdx].poin_penting?.splice(kIdx, 1);
      return prev;
    });
  };

  // Auto-fix JSON
  const handleAutoFix = () => {
    if (!jsonText.trim()) return;
    const result = autoFixModuleJson(jsonText);
    if (result) {
      setJsonText(result.fixed);
      try {
        const parsed = JSON.parse(result.fixed);
        setModulState(parsed as Modul);
      } catch {
        // ignore
      }
      toast.success(`🛠️ JSON Berhasil Diperbaiki Otomatis!\nFixes: ${result.fixes.join(' | ')}`);
    } else {
      toast.info('JSON sudah valid atau tidak membutuhkan perbaikan otomatis.');
    }
  };

  // Format JSON
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setModulState(parsed as Modul);
      toast.success('✨ Kode JSON berhasil diformat rapi!');
    } catch {
      toast.error('Kode JSON memiliki kesalahan sintaks. Perbaiki terlebih dahulu.');
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      let contentJsonToSave = modulState;
      if (activeTab === 'code') {
        try {
          contentJsonToSave = JSON.parse(jsonText);
        } catch (err) {
          toast.error(`Kesalahan sintaks JSON: ${String(err)}`);
          setSaving(false);
          return;
        }
      }

      if (!contentJsonToSave) {
        toast.error('Konten modul tidak boleh kosong.');
        setSaving(false);
        return;
      }

      // Update module header title/code inside contentJson wrapper
      if (contentJsonToSave.modul) {
        contentJsonToSave.modul.kode = code;
        contentJsonToSave.modul.judul = title;
        contentJsonToSave.modul.kategori = category;
        contentJsonToSave.modul.tingkat_kesulitan = difficulty as any;
      }

      const res = await fetch(`/api/modules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          title,
          category,
          difficulty,
          status,
          contentJson: contentJsonToSave,
        }),
      });

      if (!res.ok) {
        toast.error('Gagal menyimpan perubahan modul.');
        return;
      }

      toast.success(`✅ Modul ${code} berhasil diperbarui di Database & File Lokal!`);
      qc.invalidateQueries({ queryKey: ['modules'] });
      qc.invalidateQueries({ queryKey: ['module', id] });
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  // Realtime JSON validation
  const validation = jsonText ? validateModuleJson(jsonText) : null;
  const currentSlug = data?.module?.slug;

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data?.module) {
    return (
      <div className="p-12 text-center space-y-4 max-w-xl mx-auto">
        <AlertTriangle size={48} className="text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Modul Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400">Modul yang Anda cari tidak ditemukan atau telah dihapus.</p>
        <Link href="/admin/import" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
          <ArrowLeft size={16} />
          <span>Kembali ke Rak Modul</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/admin/import" className="hover:text-blue-400 transition-colors flex items-center gap-1 font-semibold">
              <ArrowLeft size={14} />
              <span>Rak Modul</span>
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-mono">{code || id}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Edit3 size={24} className="text-blue-400 shrink-0" />
            <span>Studio Edit Modul: {title || code}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {currentSlug && (
            <a
              href={`/belajar/${currentSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700 shadow-sm"
            >
              <Eye size={16} className="text-cyan-400" />
              <span>Pratinjau Halaman Belajar</span>
            </a>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            loading={saving}
            className="shadow-xl shadow-blue-900/40 text-sm font-bold px-5 py-2.5"
          >
            <Save size={16} />
            <span>Simpan Perubahan Modul</span>
          </Button>
        </div>
      </div>

      {/* Mode Selector Tabs (Visual vs Code) */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <button
            type="button"
            onClick={() => handleTabSwitch('visual')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'visual'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PanelLeft size={16} />
            <span>Visual Course Studio (WYSIWYG Editor)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('code')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'code'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCode size={16} />
            <span>Raw JSON Code Editor</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 text-xs font-semibold">
          {validation?.ok ? (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>{modulState?.modul?.bagian?.length ?? 0} Bagian Modul</span>
            </span>
          ) : (
            <span className="text-rose-400 flex items-center gap-1.5">
              <AlertTriangle size={16} />
              <span>Cek Sintaks JSON</span>
            </span>
          )}
        </div>
      </div>

      {/* Metadata Card */}
      <div className="card p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
          <BookOpen size={18} className="text-blue-400" />
          <span>Pengaturan Metadata Modul</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Kode Modul</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 font-mono font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 md:col-span-2">
            <label className="block text-slate-400 mb-1 font-semibold">Judul Modul</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
            >
              <option value="Dasar">Dasar</option>
              <option value="PPh">PPh</option>
              <option value="PPN">PPN</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Status Modul</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
            >
              <option value="tayang">🟢 Tayang (Publik)</option>
              <option value="draft">🟡 Draft (Disembunyikan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TAB 1: VISUAL COURSE STUDIO (WYSIWYG EDITOR) ── */}
      {activeTab === 'visual' && modulState && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Layers size={22} className="text-blue-400" />
              <span>Daftar Bagian Pembelajaran ({modulState.modul?.bagian?.length ?? 0} Bagian)</span>
            </h2>
            <button
              type="button"
              onClick={handleAddSection}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40"
            >
              <Plus size={18} />
              <span>Tambah Bagian Baru</span>
            </button>
          </div>

          {/* Render Sections */}
          {modulState.modul?.bagian?.map((bag, secIdx) => (
            <div
              key={bag.id || secIdx}
              className="card p-6 space-y-6 border-2 border-slate-800 hover:border-slate-700 transition-all bg-slate-900/90 rounded-2xl shadow-xl"
            >
              {/* Section Header Toolbar */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold text-sm">
                    {bag.id || `bag-${secIdx + 1}`}
                  </span>
                  <input
                    type="text"
                    value={bag.judul}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateModulField((prev) => {
                        prev.modul.bagian[secIdx].judul = val;
                        return prev;
                      });
                    }}
                    placeholder="Judul Bagian..."
                    className="flex-1 text-lg sm:text-xl font-bold bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveSection(secIdx, 'up')}
                    disabled={secIdx === 0}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-all"
                    title="Geser Ke Atas"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSection(secIdx, 'down')}
                    disabled={secIdx === (modulState.modul.bagian.length - 1)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-all"
                    title="Geser Ke Bawah"
                  >
                    <ArrowDown size={16} />
                  </button>

                  {/* PROMINENT DELETE SECTION BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(secIdx)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    title="Hapus Bagian Ini"
                  >
                    <Trash2 size={16} />
                    <span>Hapus Bagian</span>
                  </button>
                </div>
              </div>

              {/* Section Paragraphs & Snippet Toolbar */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-2">
                  <span className="text-slate-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <BookOpen size={16} className="text-cyan-400" />
                    <span>Isi Paragraf Materi Pembelajaran</span>
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">🎨 Toolbar Tools HTML Views (Klik Untuk Sisip / Edit)</span>
                </div>

                {bag.paragraf?.map((pText, pIdx) => (
                  <div key={pIdx} className="rounded-xl border border-slate-700/60 bg-slate-950 shadow-inner overflow-hidden">

                    {/* ── Professional Toolbar (CKEditor-style) ── */}
                    <div className="flex items-center bg-[#13181f] border-b border-slate-700/40 px-1.5 py-0 min-h-[34px] overflow-x-auto">

                      {/* P# label */}
                      <span className="text-slate-600 font-mono text-[10px] font-bold px-2 shrink-0 select-none border-r border-slate-700/50 mr-1.5 pr-2.5 py-2">
                        P{pIdx + 1}
                      </span>

                      {/* ── INSERT GROUP ── */}
                      <div className="flex items-center shrink-0">
                        {([
                          { type: 'box' as const,   icon: <Sparkles size={12} />,     label: 'Box',    title: 'Sisipkan Box Catatan' },
                          { type: 'alert' as const,  icon: <AlertOctagon size={12} />, label: 'Alert',  title: 'Sisipkan Alert Peringatan' },
                          { type: 'table' as const,  icon: <Grid3x3 size={12} />,      label: 'Tabel',  title: 'Sisipkan Tabel' },
                          { type: 'math' as const,   icon: <Calculator size={12} />,   label: 'Math',   title: 'Sisipkan Rumus LaTeX' },
                          { type: 'badge' as const,  icon: <Tag size={12} />,          label: 'Badge',  title: 'Sisipkan Badge' },
                          { type: 'link' as const,   icon: <LinkIcon size={12} />,     label: 'Link',   title: 'Sisipkan Hyperlink' },
                          { type: 'img' as const,    icon: <ImageIcon size={12} />,    label: 'Gambar', title: 'Sisipkan Gambar CDN' },
                        ]).map((tool) => (
                          <button
                            key={tool.type}
                            type="button"
                            onClick={() => openToolModal(secIdx, pIdx, tool.type)}
                            className="flex items-center gap-1 px-2 py-2 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 text-[11px] font-medium transition-colors whitespace-nowrap"
                            title={tool.title}
                          >
                            {tool.icon}
                            <span>{tool.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Divider */}
                      <span className="w-px h-4 bg-slate-700/60 mx-1.5 shrink-0" />

                      {/* ── DELETE ELEMENT GROUP (icon-only with ×) ── */}
                      <div className="flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveLinks(secIdx, pIdx)}
                          className="flex items-center gap-px px-1.5 py-2 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus semua hyperlink"
                        >
                          <LinkIcon size={11} /><X size={7} strokeWidth={3.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImages(secIdx, pIdx)}
                          className="flex items-center gap-px px-1.5 py-2 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus semua gambar"
                        >
                          <ImageIcon size={11} /><X size={7} strokeWidth={3.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTables(secIdx, pIdx)}
                          className="flex items-center gap-px px-1.5 py-2 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus semua tabel"
                        >
                          <Grid3x3 size={11} /><X size={7} strokeWidth={3.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearHtmlSnippet(secIdx, pIdx)}
                          className="flex items-center gap-1 px-2 py-2 rounded text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 text-[11px] font-medium transition-colors"
                          title="Hapus semua elemen HTML sekaligus"
                        >
                          <Eraser size={11} />
                          <span>Bersihkan</span>
                        </button>
                      </div>

                      {/* Push hapus-paragraf to the far right */}
                      <div className="flex-1 min-w-2" />

                      {/* Divider */}
                      <span className="w-px h-4 bg-slate-700/60 mx-1 shrink-0" />

                      {/* ── DELETE PARAGRAPH ── */}
                      <button
                        type="button"
                        onClick={() => handleRemoveParagraph(secIdx, pIdx)}
                        className="flex items-center gap-1 px-2 py-2 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 text-[11px] font-medium transition-colors shrink-0"
                        title="Hapus seluruh paragraf ini"
                      >
                        <Trash2 size={12} />
                        <span className="text-[10px]">Hapus Paragraf</span>
                      </button>
                    </div>
                    {/* ── End Toolbar ── */}

                    {/* Textarea & Preview */}
                    <div className="p-3.5 space-y-3">
                      <textarea
                        value={pText}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateModulField((prev) => {
                            prev.modul.bagian[secIdx].paragraf[pIdx] = val;
                            return prev;
                          });
                        }}
                        rows={4}
                        className="w-full text-sm font-sans p-3 rounded-lg border bg-slate-900 border-slate-700/60 text-slate-100 focus:outline-none focus:border-blue-500/70 leading-relaxed min-h-[90px] resize-y"
                        placeholder="Tulis teks penjelasan materi atau gunakan toolbar di atas untuk menyisipkan elemen..."
                      />

                      {/* Live Preview */}
                      <div className="rounded-lg border border-slate-800/60 bg-slate-950/60 p-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-800/50">
                          <Eye size={11} className="text-slate-500" />
                          <span>Live Preview</span>
                        </div>
                        <RichContentRenderer content={pText} fontSizeLarge={false} />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => handleAddParagraph(secIdx)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center gap-2 transition-all border border-slate-700 shadow-sm"
                >
                  <Plus size={16} />
                  <span>Tambah Paragraf Baru</span>
                </button>
              </div>

              {/* Poin Penting Section */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <span>💡 Poin Penting Bagian Ini</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddKeyPoint(secIdx)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Plus size={14} />
                    <span>Tambah Poin</span>
                  </button>
                </div>

                {bag.poin_penting?.map((poin, kIdx) => (
                  <div key={kIdx} className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold text-sm">▸</span>
                    <input
                      type="text"
                      value={poin}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateModulField((prev) => {
                          if (prev.modul.bagian[secIdx].poin_penting) {
                            prev.modul.bagian[secIdx].poin_penting[kIdx] = val;
                          }
                          return prev;
                        });
                      }}
                      className="flex-1 text-xs sm:text-sm p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                      placeholder="Tulis poin penting..."
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyPoint(secIdx, kIdx)}
                      className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1 border border-rose-500/30"
                      title="Hapus Poin Ini"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Analogi & Contoh Kasus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm pt-4 border-t border-slate-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-amber-400 flex items-center gap-1.5">
                      <span>💡 Analogi Kehidupan Nyata</span>
                    </label>
                  </div>
                  <textarea
                    value={bag.analogi || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateModulField((prev) => {
                        prev.modul.bagian[secIdx].analogi = val;
                        return prev;
                      });
                    }}
                    rows={3}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 italic"
                    placeholder="Tulis analogi santai di sini..."
                  />
                </div>

                {bag.contoh_kasus && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span>📌 Contoh Kasus Konkret</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={bag.contoh_kasus.judul || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateModulField((prev) => {
                          if (prev.modul.bagian[secIdx].contoh_kasus) {
                            prev.modul.bagian[secIdx].contoh_kasus!.judul = val;
                          }
                          return prev;
                        });
                      }}
                      placeholder="Judul Kasus..."
                      className="w-full text-xs sm:text-sm font-bold p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                    <textarea
                      value={bag.contoh_kasus.cerita || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateModulField((prev) => {
                          if (prev.modul.bagian[secIdx].contoh_kasus) {
                            prev.modul.bagian[secIdx].contoh_kasus!.cerita = val;
                          }
                          return prev;
                        });
                      }}
                      rows={2}
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                      placeholder="Cerita kasus..."
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Section Button */}
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={handleAddSection}
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-2xl shadow-blue-900/50 mx-auto"
            >
              <Plus size={20} />
              <span>Tambah Bagian Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: RAW JSON CODE EDITOR ── */}
      {activeTab === 'code' && (
        <div className="card p-6 space-y-4">
          {/* Action & Validation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              {validation?.ok ? (
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <CheckCircle2 size={18} />
                  <span>JSON Valid ({validation.data.modul?.bagian?.length ?? 0} Bagian, {validation.data.modul?.kuis_akhir?.soal?.length ?? 0} Soal Kuis, {validation.data.modul?.glosarium?.length ?? 0} Glosarium)</span>
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1.5 font-bold text-xs sm:text-sm">
                  <AlertTriangle size={18} />
                  <span>
                    {validation && 'message' in validation
                      ? `Perlu Perbaikan Sintaks: ${validation.message}`
                      : 'Perlu Perbaikan Sintaks JSON'}
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoFix}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Wand2 size={15} />
                <span>Perbaiki Otomatis JSON</span>
              </button>
              <button
                type="button"
                onClick={handleFormatJson}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <FileCode size={15} />
                <span>Format Rapih</span>
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span>Editor Kode Raw JSON Modul</span>
              <span className="font-mono">Untuk pengguna tingkat lanjut</span>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={26}
              className="w-full text-xs font-mono p-4 rounded-2xl border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition-all leading-relaxed whitespace-pre shadow-inner"
              placeholder="Edit struktur JSON modul di sini..."
            />
          </div>
        </div>
      )}

      {/* ── TOOL CONFIGURATION MODAL DIALOG ── */}
      {toolModalState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 w-full max-w-lg space-y-4 border-2 border-slate-700 shadow-2xl bg-slate-900 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" />
                <span>Konfigurasi Tool HTML Views: {toolModalState.type.toUpperCase()}</span>
              </h3>
              <button
                type="button"
                onClick={() => setToolModalState(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              {(toolModalState.type === 'box' || toolModalState.type === 'alert' || toolModalState.type === 'badge' || toolModalState.type === 'link' || toolModalState.type === 'img') && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {toolModalState.type === 'link' ? 'Teks Link' : toolModalState.type === 'img' ? 'Judul / Alt Gambar' : 'Judul / Label'}
                  </label>
                  <input
                    type="text"
                    value={toolModalState.titleInput}
                    onChange={(e) => setToolModalState({ ...toolModalState, titleInput: e.target.value })}
                    className="w-full p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
                    placeholder="Tulis judul..."
                  />
                </div>
              )}

              {(toolModalState.type === 'link' || toolModalState.type === 'img') && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">URL (Tautan / Alamat Gambar)</label>
                  <input
                    type="text"
                    value={toolModalState.urlInput}
                    onChange={(e) => setToolModalState({ ...toolModalState, urlInput: e.target.value })}
                    className="w-full p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              )}

              {(toolModalState.type === 'box' || toolModalState.type === 'alert' || toolModalState.type === 'table' || toolModalState.type === 'math') && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    {toolModalState.type === 'table' ? 'Isi Baris Tabel (Pisahkan dengan karakter | )' : toolModalState.type === 'math' ? 'Rumus LaTeX Math' : 'Isi Teks Penjelasan'}
                  </label>
                  <textarea
                    value={toolModalState.contentInput}
                    onChange={(e) => setToolModalState({ ...toolModalState, contentInput: e.target.value })}
                    rows={4}
                    className="w-full p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs focus:border-blue-500 focus:outline-none leading-relaxed"
                    placeholder="Tulis isi..."
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setToolModalState(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyToolInsert}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-900/40"
              >
                <Check size={16} />
                <span>Sisipkan Elemen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
