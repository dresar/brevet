'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronDown,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type ModulItem = {
  kode: string;
  judul: string;
  kategori?: string;
  kesulitan?: string;
  menit?: number;
};

interface PromptData {
  teks: string;
  teksStage1?: string;
  teksStage2?: string;
  teksFull?: string;
  stage?: string;
  kode: string;
  judul: string;
  kategori?: string;
  kesulitan?: string;
  menit?: number;
  daftarModul: ModulItem[];
  autoLoadedJson?: string;
  autoLoadedFileName?: string;
}

export default function Zone1PromptLibrary() {
  const [selectedKode, setSelectedKode] = useState('BRVT-AB-01');
  const [activeStage, setActiveStage] = useState<'1' | '2' | 'full'>('1');
  const [stage1Output, setStage1Output] = useState('');
  const [promptText, setPromptText] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data } = useQuery<PromptData>({
    queryKey: ['prompts', selectedKode, activeStage, stage1Output],
    queryFn: async () => {
      if (activeStage === '2' && stage1Output.trim()) {
        const res = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modul: selectedKode,
            stage: activeStage,
            stage1Output: stage1Output.trim(),
          }),
        });
        return res.json();
      }
      const res = await fetch(`/api/prompts?modul=${selectedKode}&stage=${activeStage}`);
      return res.json();
    },
  });

  const daftarModul = data?.daftarModul ?? [];

  // Reset or auto-fill stage1Output when module or data changes
  useEffect(() => {
    if (data?.autoLoadedJson && !stage1Output) {
      setStage1Output(data.autoLoadedJson);
    }
  }, [data, stage1Output]);

  // Update prompt preview text when query data changes or activeStage changes
  useEffect(() => {
    if (data) {
      if (activeStage === '1' && data.teksStage1) {
        setPromptText(data.teksStage1);
      } else if (activeStage === '2' && data.teksStage2) {
        setPromptText(data.teksStage2);
      } else if (activeStage === 'full' && data.teksFull) {
        setPromptText(data.teksFull);
      } else if (data.teks) {
        setPromptText(data.teks);
      }
    }
  }, [data, activeStage]);

  const handleModuleChange = (newKode: string) => {
    setSelectedKode(newKode);
    setStage1Output(''); // Reset to trigger auto-detection for new module
  };

  const handleBuildAndCopy = async (stageToCopy: '1' | '2' | 'full' = activeStage) => {
    setLoading(true);
    try {
      let fetchedData: PromptData;
      if (stageToCopy === '2' && stage1Output.trim()) {
        const res = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modul: selectedKode,
            stage: stageToCopy,
            stage1Output: stage1Output.trim(),
          }),
        });
        fetchedData = await res.json();
      } else {
        const res = await fetch(`/api/prompts?modul=${selectedKode}&stage=${stageToCopy}`);
        fetchedData = await res.json();
      }
      
      let textToCopy = fetchedData.teks;
      if (stageToCopy === '1' && fetchedData.teksStage1) textToCopy = fetchedData.teksStage1;
      if (stageToCopy === '2' && fetchedData.teksStage2) textToCopy = fetchedData.teksStage2;
      if (stageToCopy === 'full' && fetchedData.teksFull) textToCopy = fetchedData.teksFull;

      setPromptText(textToCopy);
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);

      const stageLabel = stageToCopy === '1' ? 'Tahap 1 (Materi Utama)' : stageToCopy === '2' ? 'Tahap 2 (Diagram & Visual + Konteks Materi)' : 'Full';
      toast.success(`✅ Prompt ${stageLabel} tersalin sekaligus! Tempel langsung ke AI.`);
    } catch {
      toast.error('Gagal menyalin ke clipboard. Salin manual dari teks di bawah.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!promptText) {
      toast.error('Bangun prompt terlebih dahulu.');
      return;
    }
    const blob = new Blob([promptText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `super-prompt-${selectedKode}-tahap-${activeStage}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Prompt Tahap ${activeStage.toUpperCase()} diunduh sebagai .md`);
  };

  const handleManualCopy = async () => {
    if (!promptText) return;
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Tersalin!');
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error('Clipboard kosong.');
        return;
      }
      setStage1Output(text);
      toast.success('📋 JSON Tahap 1 berhasil ditempel dari Clipboard!');
    } catch {
      toast.error('Gagal membaca clipboard. Tempelkan manual di kotak di bawah.');
    }
  };

  const hasJsonContext = Boolean(stage1Output.trim() || data?.autoLoadedJson);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-heading)' }}>
          📚 Pustaka Super-Prompt Generator
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Pilih modul & tahap generasi prompt.
        </p>
      </div>

      {/* Module selector */}
      <div className="space-y-2">
        <div className="relative">
          <select
            id="promptModulSelect"
            value={selectedKode}
            onChange={(e) => handleModuleChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg text-sm border font-medium"
            style={{
              background: '#0d1424',
              borderColor: '#1F2937',
              color: 'var(--text-heading)',
            }}
          >
            {daftarModul.map((m) => (
              <option key={m.kode} value={m.kode}>
                {m.kode} — {m.judul}
              </option>
            ))}
            <option value="CUSTOM">Kode Kustom...</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
        </div>

        {data && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {data.kategori && (
              <span className="px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 font-medium">
                📂 {data.kategori}
              </span>
            )}
            {data.kesulitan && (
              <span className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium uppercase">
                📊 {data.kesulitan}
              </span>
            )}
            {data.menit && (
              <span className="px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium">
                ⏱️ {data.menit} Menit
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stage Selector Tabs */}
      <div className="p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex gap-1">
        <button
          type="button"
          onClick={() => setActiveStage('1')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeStage === '1'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen size={14} />
          <span>Tahap 1: Materi Utama</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('2')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeStage === '2'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <AlertCircle size={14} />
          <span>Tahap 2: Diagram & Visual</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveStage('full')}
          className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            activeStage === 'full'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          ⚡ 1-Step
        </button>
      </div>

      {/* Auto-load Notification Badge for Stage 2 */}
      {activeStage === '2' && (
        <div className="text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-300">
          <FileCheck size={14} className="shrink-0 text-emerald-400" />
          <span>
            {data?.autoLoadedFileName
              ? `Otomatis mengambil JSON Tahap 1 dari berkas data/modules/${data.autoLoadedFileName}`
              : hasJsonContext
              ? 'JSON Tahap 1 terdeteksi dan otomatis digabungkan ke Prompt Tahap 2'
              : 'Tempelkan JSON dari Tahap 1 di kotak bawah atau klik "Tempel dari Clipboard"'}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          id="buildCopyPromptBtn"
          variant="primary"
          size="sm"
          onClick={() => handleBuildAndCopy(activeStage)}
          loading={loading}
          disabled={activeStage === '2' && !hasJsonContext}
          className="flex-1"
        >
          {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          {copied
            ? 'Tersalin!'
            : `Bangun & Salin Prompt Tahap ${activeStage === 'full' ? 'Full' : activeStage}`}
        </Button>
        <Button
          id="downloadPromptBtn"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={activeStage === '2' && !hasJsonContext}
        >
          <Download size={14} />
          Unduh .md
        </Button>
      </div>

      {/* Prompt preview */}
      {promptText && (
        <div className="relative">
          <div
            className="rounded-xl p-4 overflow-y-auto max-h-80 text-xs font-mono leading-relaxed whitespace-pre-wrap"
            style={{
              background: '#0d1117',
              border: '1px solid var(--border)',
              color: '#c9d1d9',
            }}
          >
            {promptText}
          </div>
          <button
            onClick={handleManualCopy}
            className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs transition-default hover:bg-slate-700"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {copied ? '✓ Tersalin' : 'Salin'}
          </button>
        </div>
      )}

      {/* Stage 2 JSON editor / override box */}
      {activeStage === '2' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
            <span>JSON Konteks Hasil Tahap 1 (Materi Utama)</span>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1 font-semibold"
            >
              📋 Tempel dari Clipboard
            </button>
          </div>
          <textarea
            value={stage1Output}
            onChange={(e) => setStage1Output(e.target.value)}
            placeholder="Tempelkan JSON dari Tahap 1 di sini atau klik tombol 'Tempel dari Clipboard'..."
            rows={4}
            className="w-full text-xs font-mono p-2.5 rounded-lg border bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-500"
          />
        </div>
      )}
    </div>
  );
}
