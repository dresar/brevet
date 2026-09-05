'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, FileJson, ArrowRight, ExternalLink, Code2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuizClaudeImportTabProps {
  promptText: string;
  onImportJson: (jsonString: string, mode: 'replace' | 'append') => void;
  selectedModuleId: string;
}

export function QuizClaudeImportTab({
  promptText,
  onImportJson,
  selectedModuleId,
}: QuizClaudeImportTabProps) {
  const [copied, setCopied] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [showPromptDetails, setShowPromptDetails] = useState(false);

  const handleCopyPrompt = async () => {
    if (!promptText) {
      toast.error('Silakan pilih modul terlebih dahulu!');
      return;
    }
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('🎉 Master Prompt AI External berhasil disalin!');
    } catch {
      toast.error('Gagal menyalin prompt.');
    }
  };

  const handleApplyJson = () => {
    if (!pastedJson.trim()) return;
    onImportJson(pastedJson, importMode);
    setPastedJson('');
  };

  return (
    <div className="space-y-6">
      {/* Workflow Steps Banner */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Alur Pembuatan Soal via AI External (Claude / ChatGPT)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hasilkan 100 soal Brevet AB (80 PG & 20 Essay) secara instan dan gratis menggunakan AI External favorit Anda.
            </p>
          </div>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Step 1 */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                Langkah 1
              </span>
              <Code2 size={16} className="text-slate-500" />
            </div>
            <h4 className="font-semibold text-sm text-white">Salin Master Prompt</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Klik tombol salin di bawah. Prompt otomatis diisi materi modul & dasar hukum pajak 2026 (TER PPh 21, PPN 12%).
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded">
                Langkah 2
              </span>
              <ExternalLink size={16} className="text-slate-500" />
            </div>
            <h4 className="font-semibold text-sm text-white">Tempel di AI External</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buka <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-pink-400 underline font-semibold">Claude.ai</a> / ChatGPT, lalu paste prompt dan kirim. AI akan memberikan balasan JSON 100 soal.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Langkah 3
              </span>
              <FileJson size={16} className="text-slate-500" />
            </div>
            <h4 className="font-semibold text-sm text-white">Import JSON Ke Sistem</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Copy teks JSON balasan AI, tempelkan di form sebelah kanan, lalu klik &quot;Proses & Terapkan Ke Bank Soal&quot;.
            </p>
          </div>
        </div>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Prompt Copy Box */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base text-white flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" /> Master Prompt AI External
            </h4>
            <button
              onClick={() => setShowPromptDetails(!showPromptDetails)}
              className="text-xs text-slate-400 hover:text-white transition font-medium"
            >
              {showPromptDetails ? 'Sembunyikan Teks' : 'Lihat Teks Lengkap'}
            </button>
          </div>

          <button
            onClick={handleCopyPrompt}
            disabled={!selectedModuleId}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition cursor-pointer text-sm"
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Prompt Disalin!' : 'Salin Prompt AI'}</span>
          </button>

          {/* Prompt Preview Codebox */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-400">Pratinjau Prompt Master (Siap Copy):</label>
            <div className="relative">
              <textarea
                readOnly
                value={promptText || 'Silakan pilih modul pembelajaran di atas untuk memuat prompt master.'}
                rows={showPromptDetails ? 14 : 6}
                className="w-full text-xs font-mono p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none select-all cursor-pointer leading-relaxed transition-all"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <span className="absolute bottom-2 right-3 text-[9px] text-slate-500 font-bold uppercase tracking-wider pointer-events-none">
                Klik Untuk Select All
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: JSON Import Box */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h4 className="font-bold text-base text-white flex items-center gap-2">
            <FileJson size={18} className="text-blue-400" /> Form Tempel Output JSON
          </h4>

          <div className="space-y-2">
            <label className="block text-xs text-slate-400">
              Paste-kan output balasan dari Claude.ai / AI External di sini:
            </label>
            <textarea
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder='{\n  "soal": [\n    {\n      "id": "q-1",\n      "pertanyaan": "...",\n      "tipe": "pilihan_ganda",\n      "pilihan": ["A. ...", "B. ...", "C. ...", "D. ..."],\n      "jawaban": "A",\n      "pembahasan": "..."\n    }\n  ]\n}'
              rows={9}
              className="w-full text-xs font-mono p-3 rounded-xl border bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-slate-300">Mode Impor Soal:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  importMode === 'replace'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🔄 Timpa Semua Soal
              </button>
              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  importMode === 'append'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ➕ Tambahkan Ke Yang Ada
              </button>
            </div>
          </div>

          <button
            onClick={handleApplyJson}
            disabled={!pastedJson.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition cursor-pointer text-sm"
          >
            <span>{importMode === 'replace' ? 'Import (Timpa Soal)' : 'Import (Tambahkan Soal)'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
