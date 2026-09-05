'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  Copy,
  CheckCircle2,
  Download,
  Code2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { MermaidLightboxModal } from './mermaid-lightbox-modal';

interface MermaidBlockProps {
  code: string;
  penjelasan?: string;
  onAskAI?: (question: string) => void;
}

export function MermaidBlock({ code, penjelasan, onAskAI }: MermaidBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    setError(null);
    setRendered(false);

    const render = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#1e40af',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#3b82f6',
            lineColor: '#64748b',
            secondaryColor: '#0f172a',
            tertiaryColor: '#1e293b',
            background: '#1e293b',
            mainBkg: '#1e293b',
            nodeBorder: '#334155',
            clusterBkg: '#0f172a',
            titleColor: '#f8fafc',
            edgeLabelBackground: '#1e293b',
          },
        });

        // Clean quotes inside pipe edge labels e.g. -->|"text"| -> -->|text|
        const cleanCode = code
          .replace(/-->\s*\|"([^"]+)"\|/g, '-->|$1|')
          .replace(/---\s*\|"([^"]+)"\|/g, '---|$1|')
          .trim();

        // Validate syntax first with parse()
        await mermaid.parse(cleanCode);

        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, cleanCode);

        if (ref.current) {
          ref.current.innerHTML = svg;
          setSvgHtml(svg);
          setRendered(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Diagram tidak dapat dirender.');
      }
    };

    render();
  }, [code]);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Kode Mermaid disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgHtml) return;
    try {
      const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `diagram-mermaid-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Diagram SVG berhasil diunduh!');
    } catch {
      toast.error('Gagal mengunduh SVG.');
    }
  };

  const handleAskDiagramAI = () => {
    const prompt =
      `Bisa tolong jelaskan secara detail maksud dan alur dari diagram perpajakan berikut?\n\n` +
      `Sintaks Diagram Mermaid:\n\`\`\`mermaid\n${code}\n\`\`\`\n` +
      `Mohon terangkan setiap tahapan, panah, serta konsep hukum/aturan perpajakan yang digambarkan di dalamnya agar saya benar-benar mengerti.`;

    if (onAskAI) {
      onAskAI(prompt);
    } else {
      toast.info('Fitur AI Tutor siap menjelaskan diagram ini.');
    }
  };

  if (error) {
    return (
      <div className="rounded-xl p-4 space-y-2 bg-red-950/20 border border-red-500/30">
        <p className="text-sm text-red-400 font-medium flex items-center gap-2">
          <span>⚠️</span> Diagram gagal dirender
        </p>
        <pre className="text-xs overflow-x-auto p-3 rounded-lg bg-slate-950 text-slate-300 font-mono">
          {code}
        </pre>
        <p className="text-xs text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div
        className="group relative rounded-xl overflow-hidden transition-all duration-200 border border-slate-800 bg-slate-900/60 shadow-md space-y-0"
      >
        {/* ── Top Header Actions Bar ── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/80 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              📊 Diagram Alur Perpajakan
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleAskDiagramAI}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-1.5 shadow-sm border border-blue-400/30"
              title="Tanya AI Maksud Diagram Ini"
            >
              <Sparkles size={13} className="text-cyan-300 animate-pulse" />
              <span>Tanya AI Maksud Diagram</span>
            </button>

            <button
              onClick={() => setShowCode((s) => !s)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-all flex items-center gap-1"
              title={showCode ? 'Sembunyikan Kode' : 'Lihat Kode Mermaid'}
            >
              <Code2 size={13} />
              <span className="hidden sm:inline">{showCode ? 'Teks Kode' : 'Kode'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-all flex items-center gap-1"
              title="Salin Kode Mermaid"
            >
              {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            {rendered && (
              <>
                <button
                  onClick={handleDownloadSvg}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-all flex items-center gap-1"
                  title="Unduh Diagram SVG"
                >
                  <Download size={13} />
                  <span className="hidden sm:inline">Unduh SVG</span>
                </button>

                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 transition-all"
                  title="Perbesar Modal (Zoom)"
                >
                  <Maximize2 size={13} />
                  <span>Perbesar</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Optional Code Toggle View ── */}
        {showCode && (
          <div className="p-3 bg-slate-950 border-b border-slate-800 animate-fade-in">
            <pre className="text-xs p-3 rounded-lg overflow-x-auto font-mono text-blue-300 bg-slate-900 border border-slate-800 whitespace-pre-wrap">
              {code}
            </pre>
          </div>
        )}

        {/* ── Mermaid Render & Side/Bottom Box Container ── */}
        <div className="p-4 flex flex-col md:flex-row gap-4 items-stretch">
          {/* Mermaid Render Area */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative cursor-pointer p-4 overflow-x-auto flex flex-1 justify-center group/render min-h-[120px] rounded-xl bg-slate-950/60 border border-slate-800/80"
          >
            <div
              ref={ref}
              className="w-full flex justify-center items-center mermaid"
            />

            {/* Hover Overlay Suggestion */}
            {rendered && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/render:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none rounded-xl">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs font-semibold border border-slate-700 shadow-xl">
                  <Maximize2 size={13} className="text-blue-400" />
                  Klik untuk memperbesar modal
                </span>
              </div>
            )}
          </div>

          {/* 💡 Box Penjelasan Diagram */}
          <div className="md:w-72 shrink-0 p-4 rounded-xl bg-slate-950 border border-blue-500/20 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <HelpCircle size={14} className="text-cyan-400" />
                <span>Penjelasan Diagram</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {penjelasan ||
                  'Diagram ini menggambarkan alur kerja dan prosedur hukum perpajakan. Setiap kotak mewakili tahapan resmi dan panah menunjukkan alur prosesnya.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Butuh penjelasan spesifik?</span>
              <button
                onClick={handleAskDiagramAI}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-all"
              >
                <Sparkles size={12} /> Tanya AI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fullscreen Lightbox Zoom Modal ── */}
      {rendered && (
        <MermaidLightboxModal
          isOpen={isLightboxOpen}
          svgHtml={svgHtml}
          code={code}
          onClose={() => setIsLightboxOpen(false)}
          onAskAI={onAskAI}
        />
      )}
    </>
  );
}
