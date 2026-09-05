'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles, ArrowRight, Layers, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface GlossaryClaudeImportTabProps {
  selectedModule: { id: string; code: string; title: string; slug: string } | null;
  onImportJson: (jsonString: string, mode: 'replace' | 'append') => void;
  isSubmitting: boolean;
}

export function GlossaryClaudeImportTab({
  selectedModule,
  onImportJson,
  isSubmitting,
}: GlossaryClaudeImportTabProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('append');
  const [copied, setCopied] = useState(false);

  const moduleTitle = selectedModule?.title || 'Perpajakan Indonesia';
  const moduleCode = selectedModule?.code || 'BRVT-AB';

  const masterPromptText = `Kamu adalah AI Spesialis Brevet Pajak Indonesia, Konsultan Pajak Senior, dan Penyusun Kamus Istilah Perpajakan Profesional.
Tugasmu adalah menyusun daftar Glosarium Perpajakan LENGKAP dan MENDALAM sebanyak TEPA 50 SAMPAI 100 ISTILAH PERPAJAKAN untuk modul "${moduleTitle}" (${moduleCode}).

Petunjuk & Ketentuan Output:
1. Output WAJIB berupa JSON murni dengan properti utama "glosarium" yang berisi array objek istilah.
2. Setiap objek istilah WAJIB memiliki properti:
   - "kata": Nama istilah pajak (misal: "Tax Avoidance", "Withholding Tax", "NPOP", "SKPKBT", "TER Kategori A").
   - "definisi": Definisi formal & legal sesuai UU Perpajakan Indonesia (UU KUP, UU PPh, UU PPN, UU HPP, PMK terbaru).
   - "penjelasan_sederhana": Penjelasan dengan bahasa yang sangat mudah dipahami oleh pemula/orang awam.
   - "contoh": Contoh kasus singkat penerapan istilah tersebut dalam praktik bisnis/kerja sehari-hari.

Format JSON yang Wajib Diikuti:
{
  "glosarium": [
    {
      "kata": "Tax Avoidance",
      "definisi": "Penghindaran pajak secara legal dengan memanfaatkan celah hukum (loopholes) dalam peraturan perpajakan tanpa melanggar undang-undang.",
      "penjelasan_sederhana": "Cara hemat pajak yang sah dengan memanfaatkan aturan yang ada tanpa berbuat curang.",
      "contoh": "Perusahaan memilih memberikan tunjangan dalam bentuk uang daripada fasilitas kenikmatan natura yang kena pajak tinggi."
    }
  ]
}

Silakan hasilkan tepat 50-100 istilah glosarium perpajakan untuk modul "${moduleTitle}" dalam format JSON murni tanpa markdown tambahan.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(masterPromptText);
    setCopied(true);
    toast.success('Master Prompt AI Glosarium berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) {
      toast.error('Silakan paste balasan output JSON dari Claude/ChatGPT terlebih dahulu.');
      return;
    }
    onImportJson(jsonInput, importMode);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Master Prompt AI External */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Master Prompt AI External (Glosarium)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              {moduleCode}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Salin prompt di bawah ini dan paste-kan ke <strong className="text-cyan-300">Claude.ai</strong> atau <strong className="text-blue-300">ChatGPT</strong> untuk menghasilkan 50–100 istilah glosarium lengkap untuk modul <span className="text-white font-semibold">{moduleTitle}</span>.
          </p>

          <button
            onClick={handleCopyPrompt}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] active:scale-[0.99]"
          >
            {copied ? <Check className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Prompt AI Tersalin!' : 'Salin Prompt AI Glosarium'}</span>
          </button>

          {/* Preview Box */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Pratinjau Prompt Master (Siap Copy):</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {masterPromptText}
            </pre>
          </div>
        </div>
      </div>

      {/* Right Column: Form Paste & Import JSON */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileCode className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold text-sm text-white">Form Tempel Output JSON Glosarium</h3>
        </div>

        <form onSubmit={handleImportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1.5">
              Paste-kan output balasan dari Claude.ai / AI External di sini:
            </label>
            <textarea
              rows={8}
              placeholder={`{\n  "glosarium": [\n    {\n      "kata": "NPWP",\n      "definisi": "...",\n      "penjelasan_sederhana": "...",\n      "contoh": "..."\n    }\n  ]\n}`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="block text-xs text-slate-300 font-medium">Mode Impor Glosarium:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  importMode === 'append'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>+ Tambahkan Ke Yang Ada</span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  importMode === 'replace'
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔄 Timpa Semua Istilah</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              {importMode === 'append'
                ? 'Mode Tambah: Istilah baru akan digabungkan dengan glosarium yang sudah ada (misal dari 10 istilah menjadi 100+).'
                : 'Mode Timpa: Seluruh glosarium lama pada modul ini akan digantikan penuh dengan data JSON baru.'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !jsonInput.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Memproses Import...' : `Import Glosarium (${importMode === 'append' ? 'Tambahkan' : 'Timpa'})`}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
