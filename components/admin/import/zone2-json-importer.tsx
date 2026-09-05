'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDropzone } from 'react-dropzone';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wand2,
  Save,
  Copy,
  Download,
  Trash2,
  ChevronDown,
  FileJson,
  Eye,
  BookOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ControlledTabs } from '@/components/ui/tabs';
import { validateModuleJson, beautify, extractModuleSummary, autoFixModuleJson } from '@/lib/json-utils';
import type { Modul } from '@/lib/module-types';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });
import { json as jsonLang } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';

type ModuleSummary = { id: string; title: string; code: string };

type ValidationState =
  | { type: 'idle' }
  | { type: 'valid'; summary: ReturnType<typeof extractModuleSummary> }
  | { type: 'syntax'; line?: number; column?: number; message: string }
  | { type: 'schema'; issues: Array<{ path: string; message: string }> };

interface Zone2Props {
  existingModules: ModuleSummary[];
  onSaved?: () => void;
  initialJson?: string;
  onAutoFix?: (fixedJson: string) => void;
}

export default function Zone2JsonImporter({ existingModules, onSaved, initialJson }: Zone2Props) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [jsonText, setJsonText] = useState(initialJson ?? '');
  const [validation, setValidation] = useState<ValidationState>({ type: 'idle' });
  const [targetId, setTargetId] = useState('');
  const [saving, setSaving] = useState(false);
  const [parsedData, setParsedData] = useState<Modul | null>(null);
  const [editorExpanded, setEditorExpanded] = useState(false);

  // Auto-validate on change (debounced)
  useEffect(() => {
    if (!jsonText.trim()) {
      setValidation({ type: 'idle' });
      setParsedData(null);
      return;
    }
    const timer = setTimeout(() => {
      const result = validateModuleJson(jsonText);
      if (result.ok) {
        setValidation({ type: 'valid', summary: extractModuleSummary(result.data) });
        setParsedData(result.data);
      } else if (result.kind === 'syntax') {
        setValidation({ type: 'syntax', line: result.line, column: result.column, message: result.message });
        setParsedData(null);
      } else {
        setValidation({ type: 'schema', issues: result.issues });
        setParsedData(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [jsonText]);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: unknown[]) => {
    if (rejectedFiles && (rejectedFiles as Array<{file: File}>).length > 0) {
      toast.error('Hanya file .json yang diterima. Bukan .pdf atau format lain.');
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setJsonText(text);
      toast.info(`File "${file.name}" dimuat.`);
    };
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  const handleBeautify = () => {
    const result = beautify(jsonText);
    setJsonText(result);
    toast.success('JSON dirapikan.');
  };

  const handleAutoFix = () => {
    const result = autoFixModuleJson(jsonText);
    if (!result) {
      toast.error('Perbaikan otomatis gagal karena struktur teks terlalu rusak. Periksa baris error secara manual.');
      return;
    }
    setJsonText(result.fixed);

    // Immediately re-validate synchronously so button states & error banners update instantly
    const vResult = validateModuleJson(result.fixed);
    if (vResult.ok) {
      setValidation({ type: 'valid', summary: extractModuleSummary(vResult.data) });
      setParsedData(vResult.data);
    } else if (vResult.kind === 'syntax') {
      setValidation({ type: 'syntax', line: vResult.line, column: vResult.column, message: vResult.message });
      setParsedData(null);
    } else {
      setValidation({ type: 'schema', issues: vResult.issues });
      setParsedData(null);
    }

    if (result.fixes && result.fixes.length > 0) {
      toast.success(`✅ Berhasil diperbaiki otomatis: ${result.fixes.join('. ')}`);
    } else {
      toast.info('Format JSON berhasil dirapikan!');
    }
  };

  const handleSave = async (mode: 'baru' | 'timpa') => {
    if (!jsonText.trim()) return toast.error('Editor kosong.');
    if (validation.type !== 'valid') return toast.error('Perbaiki error JSON terlebih dahulu.');
    if (mode === 'timpa' && !targetId) return toast.error('Pilih modul yang akan ditimpa.');

    setSaving(true);
    try {
      const res = await fetch('/api/modules/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonText,
          mode,
          targetId: mode === 'timpa' ? targetId : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.kind === 'syntax') {
          toast.error(`JSON rusak di baris ${data.line}: ${data.message}`);
        } else if (data.kind === 'schema') {
          toast.error(`Schema error: ${data.issues?.[0]?.message ?? 'tidak valid'}`);
        } else {
          toast.error(data.error || 'Gagal menyimpan.');
        }
        return;
      }

      toast.success(mode === 'baru' ? 'Modul berhasil disimpan!' : 'Modul berhasil ditimpa!');
      qc.invalidateQueries({ queryKey: ['modules'] });
      onSaved?.();
    } catch {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonText);
    toast.success('JSON disalin ke clipboard.');
  };

  const handleDownload = () => {
    const filename = parsedData
      ? `${parsedData.modul.slug}.json`
      : 'modul.json';
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = jsonText ? jsonText.split('\n').length : 0;

  return (
    <div className="space-y-4">
      <ControlledTabs
        tabs={[
          { id: 'editor', label: <span className="flex items-center gap-1.5"><FileJson size={14} />Editor JSON</span> },
          { id: 'preview', label: <span className="flex items-center gap-1.5"><Eye size={14} />Preview Visual</span> },
        ]}
        active={activeTab}
        onChange={(id) => setActiveTab(id as 'editor' | 'preview')}
      />

      {activeTab === 'editor' && (
        <div {...getRootProps()} className="space-y-3">
          <input {...getInputProps()} />

          {/* Dropzone overlay indicator */}
          {isDragActive && (
            <div
              className="border-2 border-dashed border-blue-500 rounded-xl p-8 text-center animate-pulse-subtle"
              style={{ background: 'var(--primary-subtle)' }}
            >
              <Upload size={32} className="mx-auto mb-2 text-blue-400" />
              <p className="text-blue-400 font-medium">Lepas file .json di sini</p>
            </div>
          )}

          {/* Drop zone hint */}
          {!isDragActive && !jsonText && (
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-default"
              style={{ borderColor: 'var(--border)' }}
              onClick={() => document.getElementById('fileDropInput')?.click()}
            >
              <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>
                Seret & lepas file .json di sini, atau klik untuk pilih
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-placeholder)' }}>
                Atau paste teks JSON di bawah (Tampilan otomatis diringkas rapi)
              </p>
            </div>
          )}

          {/* Compact Ringkasan Modul Card (if valid JSON pasted) */}
          {parsedData && (
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex items-center justify-between flex-wrap gap-2 text-xs animate-fade-in shadow-md">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold border border-blue-500/30">
                  {parsedData.modul.kode}
                </span>
                <span className="font-semibold text-white truncate max-w-[280px] sm:max-w-[400px]">
                  {parsedData.modul.judul}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>📖 {parsedData.modul.bagian?.length || 0} Bagian</span>
                <span>⏱️ {parsedData.modul.estimasi_menit || 0}m</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> JSON Valid
                </span>
              </div>
            </div>
          )}

          {/* Toolbar */}
          {jsonText && (
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button id="autoFixBtn" variant="ghost" size="sm" onClick={handleAutoFix} className="text-amber-400 hover:text-amber-300">
                  <Wand2 size={13} /> Perbaiki Auto-JSON
                </Button>
                <Button id="beautifyBtn" variant="ghost" size="sm" onClick={handleBeautify}>
                  <Wand2 size={13} /> Rapikan
                </Button>
                <Button id="copyJsonBtn" variant="ghost" size="sm" onClick={handleCopy}>
                  <Copy size={13} /> Salin
                </Button>
                <Button id="downloadJsonBtn" variant="ghost" size="sm" onClick={handleDownload}>
                  <Download size={13} /> Unduh
                </Button>
                <Button id="clearJsonBtn" variant="ghost" size="sm" onClick={() => { setJsonText(''); setParsedData(null); }}>
                  <Trash2 size={13} /> Kosongkan
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-mono">
                  {lineCount.toLocaleString()} Baris Teks
                </span>
                <button
                  type="button"
                  onClick={() => setEditorExpanded((v) => !v)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all"
                  title={editorExpanded ? 'Kecilkan Tampilan Editor' : 'Perluas Editor'}
                >
                  {editorExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  <span>{editorExpanded ? 'Tampilan Ringkas (260px)' : 'Perluas Editor'}</span>
                </button>
              </div>
            </div>
          )}

          {/* CodeMirror editor (Compact Height by default: 260px) */}
          <div
            className="rounded-xl overflow-hidden shadow-inner transition-all duration-200"
            style={{
              border: '1px solid var(--border)',
              height: editorExpanded ? '680px' : '260px',
              maxHeight: editorExpanded ? '680px' : '260px',
              overflowY: 'auto',
            }}
          >
            <CodeMirror
              value={jsonText}
              onChange={setJsonText}
              extensions={[jsonLang()]}
              theme={oneDark}
              placeholder="Paste JSON modul di sini..."
              style={{ fontSize: '13px' }}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                bracketMatching: true,
                autocompletion: true,
              }}
            />
          </div>

          {/* Validation status */}
          <ValidationStatus state={validation} onAutoFix={handleAutoFix} />

          {/* Save actions */}
          {validation.type === 'valid' && (
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <Button
                  id="saveNewBtn"
                  variant="primary"
                  onClick={() => handleSave('baru')}
                  loading={saving}
                  className="flex-1"
                >
                  <Save size={14} />
                  Simpan Modul Baru
                </Button>
              </div>

              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <select
                    id="timpaModulSelect"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg text-sm border"
                    style={{
                      background: 'var(--bg-base)',
                      borderColor: 'var(--border)',
                      color: targetId ? 'var(--text-body)' : 'var(--text-muted)',
                    }}
                  >
                    <option value="">Pilih modul yang akan ditimpa...</option>
                    {existingModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} — {m.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                </div>
                <Button
                  id="timpaBtn"
                  variant="danger"
                  onClick={() => handleSave('timpa')}
                  loading={saving}
                  disabled={!targetId}
                >
                  Timpa Modul
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'preview' && (
        <div>
          {parsedData ? (
            <ModulePreview modul={parsedData} />
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <Eye size={32} className="mx-auto mb-3 opacity-40" />
              <p>Paste JSON valid terlebih dahulu untuk melihat preview.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Validation Status Banner ──
function ValidationStatus({ state, onAutoFix }: { state: ValidationState; onAutoFix?: () => void }) {
  if (state.type === 'idle') return null;

  if (state.type === 'valid') {
    return (
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: 'var(--success-subtle)', border: '1px solid rgba(16,185,129,0.3)' }}
      >
        <CheckCircle2 size={18} className="text-green-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-400">JSON Valid & Siap Di-Import ✓</p>
          <p className="text-xs mt-0.5" style={{ color: '#6ee7b7' }}>
            {state.summary.totalBagian} bagian
            {state.summary.totalSoalKuis > 0 && `, ${state.summary.totalSoalKuis} soal kuis akhir`}
            {state.summary.totalMiniKuis > 0 && `, ${state.summary.totalMiniKuis} mini kuis`}
            {' — '}{state.summary.judul}
          </p>
        </div>
      </div>
    );
  }

  if (state.type === 'syntax') {
    return (
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: 'var(--error-subtle)', border: '1px solid rgba(239,68,68,0.3)' }}
      >
        <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-400">JSON Rusak (Syntax Error)</p>
          <p className="text-xs mt-0.5 text-red-300">
            {state.line != null ? `Baris ${state.line}${state.column != null ? `, kolom ${state.column}` : ''}: ` : ''}
            {state.message}
          </p>
          {onAutoFix && (
            <button
              type="button"
              onClick={onAutoFix}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 hover:text-white transition-all shadow-sm"
            >
              <Wand2 size={13} className="text-red-300" />
              🔧 Perbaiki Format Syntax JSON (Auto-Repair)
            </button>
          )}
        </div>
      </div>
    );
  }

  if (state.type === 'schema') {
    return (
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: 'var(--warning-subtle)', border: '1px solid rgba(245,158,11,0.3)' }}
      >
        <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-400">Schema Tidak Sesuai</p>
          <ul className="mt-1.5 space-y-0.5">
            {state.issues.slice(0, 5).map((issue, i) => (
              <li key={i} className="text-xs text-amber-300">
                <span className="font-mono">{issue.path}</span>: {issue.message}
              </li>
            ))}
            {state.issues.length > 5 && (
              <li className="text-xs text-amber-400">... dan {state.issues.length - 5} error lainnya</li>
            )}
          </ul>
          {onAutoFix && (
            <button
              type="button"
              onClick={onAutoFix}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-100 transition-all"
            >
              <Wand2 size={13} />
              Perbaiki Otomatis
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ── Simple Module Preview ──
function ModulePreview({ modul }: { modul: Modul }) {
  const { modul: m } = modul;
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--primary-subtle)' }}
          >
            <BookOpen size={18} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                {m.kode}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                {m.tingkat_kesulitan ?? 'pemula'}
              </span>
              {m.estimasi_menit && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  ⏱ {m.estimasi_menit} menit
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold mt-1" style={{ color: 'var(--text-heading)' }}>
              {m.judul}
            </h2>
            {m.ringkasan && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {m.ringkasan}
              </p>
            )}
          </div>
        </div>
      </div>

      {m.tujuan_belajar && m.tujuan_belajar.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>
            🎯 Tujuan Belajar
          </h3>
          <ul className="space-y-1">
            {m.tujuan_belajar.map((t, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-body)' }}>
                <span className="text-blue-400 mt-0.5">▸</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>
          📋 Daftar Bagian ({m.bagian.length})
        </h3>
        <ol className="space-y-1.5">
          {m.bagian.map((b, i) => (
            <li key={b.id} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-body)' }}>
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}
              >
                {i + 1}
              </span>
              <span>{b.judul}</span>
              <span className="ml-auto flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                {b.diagram_mermaid && '📊'}
                {b.prompt_gambar && '🖼'}
                {b.mini_kuis && '❓'}
                {b.kalkulator && '🧮'}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {m.kuis_akhir && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
            📝 Kuis Akhir: {m.kuis_akhir.judul}
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {m.kuis_akhir.soal.length} soal · Nilai lulus: {m.kuis_akhir.nilai_lulus ?? 70}%
            {m.kuis_akhir.waktu_menit && ` · ${m.kuis_akhir.waktu_menit} menit`}
          </p>
        </div>
      )}
    </div>
  );
}
