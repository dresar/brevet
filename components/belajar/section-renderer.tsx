'use client';

import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { MermaidBlock } from './mermaid-block';
import { ImagePromptCard } from './image-prompt-card';
import { MiniQuiz } from './mini-quiz';
import { KalkulatorPPN } from './kalkulator/ppn';
import { KalkulatorPPh21TER } from './kalkulator/pph21-ter';
import { KalkulatorPBB } from './kalkulator/pbb';
import { KalkulatorBPHTB } from './kalkulator/bphtb';
import { RichContentRenderer } from './rich-content-renderer';
import type { Bagian } from '@/lib/module-types';
import { cleanTitle, cn } from '@/lib/utils';
import { useOffline } from '@/lib/use-offline';
import { SectionAssistantHub } from './section-assistant-hub';

interface SectionRendererProps {
  bagian: Bagian;
  isCompleted?: boolean;
  onToggleComplete?: (sectionId: string, completed: boolean) => void;
  fontSizeLarge?: boolean;
  moduleSlug?: string;
  onImageUpdated?: () => void;
  onAskAI?: (question: string) => void;
  onAskAITyping?: (text: string) => void;
}

function KalkulatorInline({ tipe, judul, keterangan }: { tipe: string; judul: string; keterangan?: string }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(59,130,246,0.3)', background: 'var(--primary-subtle)' }}>
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(59,130,246,0.2)' }}>
        <span className="text-lg">🧮</span>
        <div>
          <h4 className="text-sm font-semibold text-blue-300">{judul}</h4>
          {keterangan && <p className="text-xs text-blue-400/70">{keterangan}</p>}
        </div>
      </div>
      <div className="p-4">
        {tipe === 'ppn' && <KalkulatorPPN />}
        {tipe === 'pph21_ter' && <KalkulatorPPh21TER />}
        {tipe === 'pbb' && <KalkulatorPBB />}
        {tipe === 'bphtb' && <KalkulatorBPHTB />}
        {!['ppn', 'pph21_ter', 'pbb', 'bphtb'].includes(tipe) && (
          <div className="p-4 rounded-lg text-sm" style={{ background: '#0d1424', border: '1px solid #1F2937', color: 'var(--text-body)' }}>
            <p className="font-medium text-white mb-1">💡 Simulasi Perhitungan: {judul}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Silakan ikuti panduan langkah dan rumus pada contoh kasus di atas untuk melakukan simulasi perhitungan atau gunakan kalkulator umum perpajakan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionRenderer({
  bagian,
  isCompleted,
  onToggleComplete,
  fontSizeLarge,
  moduleSlug,
  onImageUpdated,
  onAskAI,
  onAskAITyping,
}: SectionRendererProps) {
  const isOffline = useOffline();
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number | null>(null);
  
  return (
    <article id={`section-${bagian.id}`} className="scroll-mt-24 space-y-6">
      {/* Section heading + completion toggle */}
      <div className="flex items-start gap-3">
        <button
          id={`complete-${bagian.id}`}
          onClick={() => onToggleComplete?.(bagian.id, !isCompleted)}
          className="mt-1 shrink-0 transition-default hover:scale-110"
          title={isCompleted ? 'Batal Selesai' : 'Selesai'}
          aria-label={isCompleted ? 'Selesai' : 'Selesai'}
        >
          {isCompleted
            ? <CheckCircle size={22} className="text-green-400" />
            : <Circle size={22} style={{ color: 'var(--text-muted)' }} />
          }
        </button>
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text-heading)', lineHeight: '1.3' }}
        >
          {cleanTitle(bagian.judul)}
        </h2>
      </div>

      {/* Clean Paragraphs with Rich HTML & LaTeX Renderer */}
      <div className="space-y-4">
        {bagian.paragraf.map((p, i) => {
          const isSelected = selectedParagraphIndex === i;
          return (
            <div 
              key={i} 
              id={`section-${bagian.id}-p-${i}`}
              className={cn(
                "group/para relative rounded-2xl transition-all duration-300 p-3 sm:p-4 border",
                isSelected 
                  ? "bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/40"
                  : "bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-800/60"
              )}
            >
              <RichContentRenderer content={p} fontSizeLarge={fontSizeLarge} />
            </div>
          );
        })}
      </div>

      {/* Unified Section Assistant Panel (Audio & AI Hub with Paragraph Tabs) */}
      <SectionAssistantHub
        sectionTitle={cleanTitle(bagian.judul)}
        paragraphs={bagian.paragraf}
        moduleSlug={moduleSlug}
        isOffline={isOffline}
        selectedParagraphIndex={selectedParagraphIndex}
        onSelectParagraph={setSelectedParagraphIndex}
      />

      {/* Poin penting */}
      {bagian.poin_penting && bagian.poin_penting.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{ borderLeft: '4px solid var(--primary)', background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderLeftWidth: '4px' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: 'var(--primary)' }}>
            💡 Poin Penting
          </p>
          <ul className="space-y-2">
            {bagian.poin_penting.map((poin, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-blue-400 mt-1 shrink-0">▸</span>
                <div className="flex-1 min-w-0">
                  <RichContentRenderer content={poin} fontSizeLarge={fontSizeLarge} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Analogi */}
      {bagian.analogi && (
        <div
          className="rounded-xl p-4 italic"
          style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-semibold mb-1.5 not-italic" style={{ color: 'var(--accent)' }}>
            💡 Analogi
          </p>
          <RichContentRenderer content={bagian.analogi} fontSizeLarge={fontSizeLarge} />
        </div>
      )}

      {/* Diagram Mermaid */}
      {bagian.diagram_mermaid && bagian.diagram_mermaid.length > 0 && (
        <div className="my-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            📊 Diagram Visual
          </p>
          {bagian.diagram_mermaid.map((chart, idx) => (
            <MermaidBlock key={idx} code={chart} penjelasan={bagian.penjelasan_diagram || undefined} />
          ))}
          {bagian.penjelasan_diagram && (
            <p className="text-xs italic text-slate-400">{bagian.penjelasan_diagram}</p>
          )}
        </div>
      )}

      {/* Gambar Ilustrasi Interaktif */}
      {bagian.prompt_gambar && bagian.prompt_gambar.length > 0 && (
        <div className="my-6 space-y-4">
          {bagian.prompt_gambar.map((gbr, idx) => (
            <ImagePromptCard
              key={idx}
              gambar={gbr}
              sectionId={bagian.id}
              moduleSlug={moduleSlug}
              onImageUpdated={onImageUpdated}
            />
          ))}
        </div>
      )}

      {/* Kalkulator inline jika bagian memiliki kalkulator */}
      {bagian.kalkulator && (
        <div className="my-6">
          <KalkulatorInline
            tipe={bagian.kalkulator.tipe}
            judul={bagian.kalkulator.judul || `Kalkulator ${cleanTitle(bagian.judul)}`}
            keterangan={bagian.kalkulator.keterangan}
          />
        </div>
      )}

      {/* Mini kuis di akhir bagian */}
      {bagian.mini_kuis && bagian.mini_kuis.length > 0 && (
        <div className="my-6">
          <MiniQuiz soal={bagian.mini_kuis} judul={cleanTitle(bagian.judul)} />
        </div>
      )}
    </article>
  );
}
