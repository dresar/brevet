'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Copy,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface MermaidLightboxModalProps {
  isOpen: boolean;
  svgHtml: string;
  code: string;
  onClose: () => void;
  onAskAI?: (question: string) => void;
}

export function MermaidLightboxModal({
  isOpen,
  svgHtml,
  code,
  onClose,
  onAskAI,
}: MermaidLightboxModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1.2);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen || !svgHtml) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.4));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Kode Mermaid disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
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
      `Bisa tolong jelaskan maksud dan alur dari diagram perpajakan ini secara detail?\n\n` +
      `Sintaks Diagram Mermaid:\n\`\`\`mermaid\n${code}\n\`\`\`\n` +
      `Mohon terangkan setiap tahapan, panah, serta konsep hukum/aturan perpajakan yang digambarkan di dalamnya agar saya benar-benar mengerti.`;

    if (onAskAI) {
      onAskAI(prompt);
      onClose();
    } else {
      toast.info('Fitur AI Tutor siap menjelaskan diagram ini.');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl animate-fade-in select-none"
      onClick={onClose}
    >
      {/* ── Top Bar Controls ── */}
      <div
        className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 z-10 flex-wrap gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
          <span className="text-blue-400">📊</span>
          <span>Diagram Mermaid (Interaktif)</span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleAskDiagramAI}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
            title="Tanya AI Maksud Diagram Ini"
          >
            <Sparkles size={14} className="text-cyan-300 animate-pulse" />
            <span>Tanya AI Maksud Diagram</span>
          </button>

          <div className="w-[1px] h-5 bg-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default"
            title="Perbesar (+)"
          >
            <ZoomIn size={18} />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default"
            title="Perkecil (-)"
          >
            <ZoomOut size={18} />
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default"
            title="Reset Ukuran (0)"
          >
            <RotateCcw size={18} />
          </button>

          <div className="w-[1px] h-5 bg-slate-800 mx-1 hidden sm:block" />

          <button
            onClick={handleCopyCode}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default flex items-center gap-1 text-xs font-medium"
            title="Salin Kode Mermaid"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin Kode'}</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default flex items-center gap-1 text-xs font-medium"
            title="Unduh SVG"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Unduh SVG</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-default ml-2"
            title="Tutup (Esc)"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Diagram SVG View Area ── */}
      <div
        className="flex-1 w-full flex items-center justify-center overflow-hidden relative cursor-grab active:cursor-grabbing p-6"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            transformOrigin: 'center center',
          }}
          className="svg-container pointer-events-auto max-w-full max-h-full flex items-center justify-center p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 shadow-2xl"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      </div>

      {/* ── Footer Info ── */}
      <div
        className="w-full text-center py-2.5 px-6 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 z-10 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <span>💡 Gunakan klik & geser mouse untuk menggeser diagram</span>
        <button
          onClick={handleAskDiagramAI}
          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
        >
          <Sparkles size={13} /> Tanya AI penjelasan alur diagram ini
        </button>
      </div>
    </div>
  );
}
