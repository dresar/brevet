'use client';

import React from 'react';
import { ExternalLink, Calculator, Sparkles, Check, Info, AlertTriangle } from 'lucide-react';

interface RichContentRendererProps {
  content: string;
  fontSizeLarge?: boolean;
  className?: string;
}

/**
 * Formats LaTeX math notation like $$\text{PPN} = 12\% \times \text{DPP}$$ into sleek HTML math views
 */
function renderLatexMath(latexStr: string): string {
  let cleaned = latexStr
    .replace(/^(\$\$|\\\(|\\\[)\s*/g, '')
    .replace(/\s*(\$\$|\\\)|\\\])$/g, '')
    .trim();

  // Convert LaTeX commands to clean readable HTML
  cleaned = cleaned
    .replace(/\\text\{([^}]+)\}/g, '<span class="font-bold text-sky-200 font-mono">$1</span>')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="inline-flex flex-col items-center justify-center align-middle mx-1.5 font-mono"><span class="border-b border-sky-400/60 px-1 pb-0.5 text-sky-200 text-xs">$1</span><span class="px-1 pt-0.5 text-slate-300 text-xs">$2</span></span>')
    .replace(/\\times/g, ' × ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\le/g, ' ≤ ')
    .replace(/\\ge/g, ' ≥ ')
    .replace(/\\neq/g, ' ≠ ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_')
    .replace(/\\,/g, ' ');

  return `
    <div class="my-4 rounded-xl border border-sky-500/30 bg-slate-950/80 p-4 shadow-lg backdrop-blur-sm">
      <div class="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-sky-400 border-b border-sky-900/50 pb-2">
        <span class="text-base">🧮</span>
        <span>Perhitungan / Formula Matematika</span>
      </div>
      <div class="text-xs sm:text-base font-mono text-slate-100 overflow-x-auto py-1 leading-relaxed">
        ${cleaned}
      </div>
    </div>
  `;
}

/**
 * Processes content containing HTML, LaTeX math, or markdown text
 */
export function RichContentRenderer({ content, fontSizeLarge, className = '' }: RichContentRendererProps) {
  if (!content) return null;

  const baseFontSize = fontSizeLarge ? 'text-base sm:text-lg' : 'text-xs sm:text-sm md:text-base';

  // 1. Check if content contains LaTeX display math $$ ... $$ or inline math \( ... \)
  const hasDisplayMath = content.includes('$$') || content.includes('\\[');
  if (hasDisplayMath) {
    // Replace LaTeX blocks with formatted math cards
    const processedWithMath = content.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (match) => {
      return renderLatexMath(match);
    });

    return (
      <div
        className={`rich-content-view leading-relaxed text-justify ${baseFontSize} ${className}`}
        dangerouslySetInnerHTML={{ __html: processedWithMath }}
      />
    );
  }

  // 2. Check if content contains HTML tags (e.g. starting with <div, <span, <table, <p, <a, <img, <mark, etc.)
  const hasHtmlTags = /<[a-z][\s\S]*?>/i.test(content);

  if (hasHtmlTags) {
    // Enhance <a> tags to add target="_blank" and external link styling if missing
    let enhancedHtml = content.replace(
      /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']([^>]*)>(.*?)<\/a>/gi,
      (match, href, restAttrs, innerText) => {
        if (match.includes('target=')) return match;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline font-medium inline-flex items-center gap-1 transition-colors" ${restAttrs}>${innerText} <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link inline opacity-70"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 2 2 0 1 1-2 2H5a2 2 2 0 1 1-2-2V8a2 2 2 0 1 1 2-2h6"/></svg></a>`;
      }
    );

    // Enhance <img> tags to add crisp rounded borders & responsive styling
    enhancedHtml = enhancedHtml.replace(
      /<img\s+([^>]*)\/?>/gi,
      (match, attrs) => {
        if (attrs.includes('class=')) return match;
        return `<img ${attrs} class="rounded-xl max-w-full h-auto border border-slate-800 shadow-xl my-3 block object-cover transition-all hover:border-slate-700" loading="lazy" />`;
      }
    );

    // Enhance <table> tags to add dark-mode glassmorphism table styling
    enhancedHtml = enhancedHtml.replace(
      /<table\s*([^>]*)>/gi,
      (match, attrs) => {
        if (attrs.includes('class=')) return match;
        return `<div class="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 shadow-lg"><table ${attrs} class="w-full text-sm border-collapse">`;
      }
    ).replace(/<\/table>/gi, '</table></div>');

    return (
      <div
        className={`rich-html-view leading-relaxed text-justify ${baseFontSize} ${className}`}
        style={{ color: 'var(--text-body)', lineHeight: '1.85' }}
        dangerouslySetInnerHTML={{ __html: enhancedHtml }}
      />
    );
  }

  // 3. Fallback: Normal text with inline markdown formatting (bold, italic, code)
  return (
    <div className={`plain-text-view leading-relaxed text-justify ${baseFontSize} ${className}`} style={{ color: 'var(--text-body)', lineHeight: '1.85' }}>
      {renderInlineMarkdown(content)}
    </div>
  );
}

/**
 * Formats inline markdown (bold, italic, inline code)
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  const parts: React.ReactNode[] = [];
  const segments = text.split(regex);

  segments.forEach((seg, idx) => {
    if (!seg) return;

    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
      parts.push(
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-950 text-amber-300 font-mono text-xs border border-slate-800"
        >
          {seg.slice(1, -1)}
        </code>
      );
    } else if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      parts.push(
        <strong key={idx} className="font-bold text-sky-200">
          {seg.slice(2, -2)}
        </strong>
      );
    } else if (
      (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) ||
      (seg.startsWith('_') && seg.endsWith('_') && seg.length > 2)
    ) {
      parts.push(
        <em key={idx} className="italic text-slate-300">
          {seg.slice(1, -1)}
        </em>
      );
    } else {
      parts.push(<span key={idx}>{seg}</span>);
    }
  });

  return parts;
}
