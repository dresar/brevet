'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Loader2,
  FileText,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { KuisSoal } from '@/lib/module-types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { streamGeminiClient } from '@/lib/client-gemini';

interface MiniQuizProps {
  soal: KuisSoal[];
  judul?: string;
  onAskAI?: (question: string) => void;
}

interface QuizState {
  [soalId: string]: {
    selected: string | null;
    answered: boolean;
  };
}

export function MiniQuiz({ soal, judul, onAskAI }: MiniQuizProps) {
  const [state, setState] = useState<QuizState>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  // Essay specific states
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});
  const [essayAnalysis, setEssayAnalysis] = useState<Record<string, any>>({});
  const [analyzingEssay, setAnalyzingEssay] = useState<Record<string, boolean>>({});
  const [showKeyAnswer, setShowKeyAnswer] = useState<Record<string, boolean>>({});

  const currentSoal = soal[currentIdx];
  const soalState = currentSoal ? state[currentSoal.id] : null;

  const handleAnswer = (soalId: string, jawaban: string, benar: string) => {
    if (state[soalId]?.answered) return; // already answered
    setState((prev) => ({
      ...prev,
      [soalId]: { selected: jawaban, answered: true },
    }));
  };

  const handleResetCurrent = () => {
    if (!currentSoal) return;
    const sId = currentSoal.id;
    setState((prev) => {
      const next = { ...prev };
      delete next[sId];
      return next;
    });
    setEssayAnswers((prev) => ({ ...prev, [sId]: '' }));
    setEssayAnalysis((prev) => {
      const next = { ...prev };
      delete next[sId];
      return next;
    });
    setShowKeyAnswer((prev) => ({ ...prev, [sId]: false }));
    toast.info('Soal ini telah di-reset. Silakan coba jawab kembali!');
  };

  const handleResetAll = () => {
    setState({});
    setEssayAnswers({});
    setEssayAnalysis({});
    setShowKeyAnswer({});
    setCurrentIdx(0);
    toast.info('Seluruh kuis telah di-reset.');
  };

  const handleAnalyzeEssay = async (soalId: string) => {
    const userText = (essayAnswers[soalId] || '').trim();
    if (!userText) {
      toast.error('Silakan ketik jawaban esai Anda terlebih dahulu.');
      return;
    }

    setAnalyzingEssay((prev) => ({ ...prev, [soalId]: true }));

    try {
      const res = await fetch('/api/ai/evaluate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pertanyaan: currentSoal.pertanyaan,
          jawabanKunci: currentSoal.jawaban,
          jawabanUser: userText,
          pembahasan: currentSoal.pembahasan,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Gagal melakukan evaluasi AI');
      }

      setEssayAnalysis((prev) => ({ ...prev, [soalId]: data.result }));
      setState((prev) => ({ ...prev, [soalId]: { selected: userText, answered: true } }));
      toast.success('Analisis AI selesai!');
    } catch (err: unknown) {
      toast.error('Gagal menganalisis esai: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setAnalyzingEssay((prev) => ({ ...prev, [soalId]: false }));
    }
  };

  const checkIsBenar = (selected: string | null | undefined, jawaban: string) => {
    if (!selected) return false;
    return (
      selected === jawaban ||
      selected.startsWith(`${jawaban}. `) ||
      selected.startsWith(`${jawaban} `) ||
      (jawaban.length === 1 && selected.startsWith(`${jawaban}.`))
    );
  };

  const score = soal.filter((s) => checkIsBenar(state[s.id]?.selected, s.jawaban)).length;
  const allAnswered = soal.every((s) => state[s.id]?.answered);

  if (!currentSoal) return null;

  const isAnswered = soalState?.answered;
  const isCorrect = checkIsBenar(soalState?.selected, currentSoal.jawaban);
  const isEssay = currentSoal.tipe === 'esai';

  const handleAskDetailAI = () => {
    if (!soalState?.selected) return;
    const prompt =
      `Saya menjawab "${soalState.selected}" untuk soal kuis berikut:\n` +
      `Pertanyaan: "${currentSoal.pertanyaan}"\n` +
      `Jawaban Benar: "${currentSoal.jawaban}"\n` +
      `Pembahasan Singkat: "${currentSoal.pembahasan}"\n\n` +
      `Bisa tolong berikan PENJELASAN SANGAT DETAIL dari sudut pandang aturan hukum perpajakan Indonesia, berikan analogi sederhana, serta contoh penerapannya agar saya benar-benar mengerti?`;

    if (onAskAI) {
      onAskAI(prompt);
    } else {
      toast.info('Fitur AI Tutor siap menjelaskan materi ini.');
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden shadow-md transition-all duration-200"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
    >
      {/* Header */}
      <div
        className="px-3.5 py-3 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 gap-2.5"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <HelpCircle size={16} className="text-blue-400 shrink-0" />
          <span className="text-sm font-semibold text-white">
            {judul ?? 'Mini Kuis Test Pemahaman'}
          </span>
          {isEssay && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ✍️ Soal Esai AI
            </span>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-mono">
            Soal {currentIdx + 1} / {soal.length}
            {!isEssay && allAnswered && (
              <span className="ml-2 text-green-400 font-bold font-sans">
                (Skor: {score}/{soal.length})
              </span>
            )}
          </span>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-all shrink-0"
            title="Reset Seluruh Kuis"
          >
            <RotateCcw size={11} />
            <span>Reset Kuis</span>
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="p-5 space-y-4">
        <p className="text-sm font-medium leading-relaxed text-white">
          {currentSoal.pertanyaan}
        </p>

        {/* ── Render Option Type: Pilihan Ganda ── */}
        {currentSoal.tipe === 'pilihan_ganda' && currentSoal.pilihan && (
          <div className="space-y-2">
            {currentSoal.pilihan.map((pilihan, i) => {
              const isSelected = soalState?.selected === pilihan;
              const isBenar = 
                pilihan === currentSoal.jawaban || 
                pilihan.startsWith(`${currentSoal.jawaban}. `) || 
                pilihan.startsWith(`${currentSoal.jawaban} `) ||
                (currentSoal.jawaban.length === 1 && pilihan.startsWith(`${currentSoal.jawaban}.`));
              let optStyle = {};

              if (isAnswered) {
                if (isBenar) {
                  optStyle = { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.5)', color: '#34d399' };
                } else if (isSelected && !isBenar) {
                  optStyle = { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171' };
                } else {
                  optStyle = { background: '#090d16', border: '1px solid #1F2937', color: '#64748B' };
                }
              } else {
                optStyle = {
                  background: '#0d1424',
                  border: '1px solid #1F2937',
                  color: 'var(--text-body)',
                  cursor: 'pointer',
                };
              }

              return (
                <button
                  key={i}
                  id={`quiz-opt-${currentSoal.id}-${i}`}
                  onClick={() => handleAnswer(currentSoal.id, pilihan, currentSoal.jawaban)}
                  disabled={isAnswered}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 font-medium',
                    !isAnswered && 'hover:border-blue-500/60 hover:bg-blue-950/30'
                  )}
                  style={optStyle}
                >
                  <span className="flex items-center gap-3">
                    {isAnswered && isBenar && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                    {isAnswered && isSelected && !isBenar && <XCircle size={16} className="text-red-400 shrink-0" />}
                    {pilihan}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Render Option Type: Benar / Salah ── */}
        {currentSoal.tipe === 'benar_salah' && (
          <div className="flex gap-3">
            {['Benar', 'Salah'].map((opt) => {
              const isSelected = soalState?.selected === opt;
              const isBenar = opt === currentSoal.jawaban;
              let optStyle = {};

              if (isAnswered) {
                if (isBenar) {
                  optStyle = { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.5)', color: '#34d399' };
                } else if (isSelected && !isBenar) {
                  optStyle = { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.5)', color: '#f87171' };
                } else {
                  optStyle = { background: '#090d16', border: '1px solid #1F2937', color: '#64748B' };
                }
              } else {
                optStyle = { background: '#0d1424', border: '1px solid #1F2937', color: 'var(--text-body)', cursor: 'pointer' };
              }

              return (
                <button
                  key={opt}
                  id={`quiz-bs-${currentSoal.id}-${opt}`}
                  onClick={() => handleAnswer(currentSoal.id, opt, currentSoal.jawaban)}
                  disabled={isAnswered}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                    !isAnswered && 'hover:border-blue-500/60 hover:bg-blue-950/30'
                  )}
                  style={optStyle}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Render Option Type: ESAI ── */}
        {isEssay && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <FileText size={13} className="text-blue-400" />
                Jawab dengan Kalimat & Bahasa Anda Sendiri:
              </label>
              <textarea
                rows={4}
                value={essayAnswers[currentSoal.id] ?? ''}
                onChange={(e) =>
                  setEssayAnswers((prev) => ({ ...prev, [currentSoal.id]: e.target.value }))
                }
                disabled={isAnswered}
                placeholder="Tuliskan analisis atau jawaban Anda di sini. AI akan memeriksa kesesuaiannya dengan database..."
                className="w-full p-3.5 rounded-xl text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-y leading-relaxed"
              />
            </div>

            {!isAnswered && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAnalyzeEssay(currentSoal.id)}
                  disabled={analyzingEssay[currentSoal.id] || !(essayAnswers[currentSoal.id] || '').trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all"
                >
                  {analyzingEssay[currentSoal.id] ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} className="text-cyan-300 animate-pulse" />
                  )}
                  {analyzingEssay[currentSoal.id]
                    ? 'Menganalisis Jawaban Anda...'
                    : '🚀 Analisis Jawaban Saya dengan AI'}
                </button>
              </div>
            )}

            {/* AI Essay Evaluation Result Box */}
            {essayAnalysis[currentSoal.id] && (
              <div className="rounded-xl p-4 bg-slate-900 border border-purple-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {essayAnalysis[currentSoal.id].status === 'sesuai'
                        ? '🟢'
                        : essayAnalysis[currentSoal.id].status === 'cukup'
                        ? '🟡'
                        : '🔴'}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {essayAnalysis[currentSoal.id].verdictText || 'Hasil Evaluasi AI'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                      Skor: {essayAnalysis[currentSoal.id].skor}/100
                    </span>
                    <button
                      onClick={handleResetCurrent}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800"
                    >
                      <RotateCcw size={11} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Apresiasi */}
                {essayAnalysis[currentSoal.id].apresiasi && (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-xs text-emerald-300 space-y-1">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1">
                      ✅ Yang Sudah Tepat dari Jawaban Anda:
                    </p>
                    <p className="leading-relaxed">{essayAnalysis[currentSoal.id].apresiasi}</p>
                  </div>
                )}

                {/* Perbaikan */}
                {essayAnalysis[currentSoal.id].perbaikan && (
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/40 text-xs text-amber-300 space-y-1">
                    <p className="font-semibold text-amber-400 flex items-center gap-1">
                      💡 Hal yang Perlu Dilengkapi / Ditingkatkan:
                    </p>
                    <p className="leading-relaxed">{essayAnalysis[currentSoal.id].perbaikan}</p>
                  </div>
                )}

                {/* Penjelasan Detail */}
                {essayAnalysis[currentSoal.id].penjelasanDetail && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-1">
                    <p className="font-semibold text-blue-400 flex items-center gap-1">
                      📘 Penjelasan Resmi Aturan Perpajakan:
                    </p>
                    <p className="leading-relaxed whitespace-pre-wrap">{essayAnalysis[currentSoal.id].penjelasanDetail}</p>
                  </div>
                )}

                {/* Key answer toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setShowKeyAnswer((prev) => ({ ...prev, [currentSoal.id]: !prev[currentSoal.id] }))
                    }
                    className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 font-medium transition-colors"
                  >
                    <KeyRound size={13} className="text-amber-400" />
                    <span>
                      {showKeyAnswer[currentSoal.id]
                        ? 'Sembunyikan Kunci Jawaban Database'
                        : '🔑 Lihat Kunci Jawaban Referensi Database'}
                    </span>
                    {showKeyAnswer[currentSoal.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>

                  {showKeyAnswer[currentSoal.id] && (
                    <div className="mt-2 p-3 rounded-lg bg-slate-950 border border-amber-500/30 text-xs text-amber-300 font-mono leading-relaxed animate-fade-in">
                      <p className="font-bold text-amber-400 mb-1">KUNCI JAWABAN REFERENSI (DATABASE):</p>
                      {currentSoal.jawaban}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback (for non-essay) */}
        {!isEssay && isAnswered && (
          <div
            className="rounded-xl p-3.5 sm:p-4 animate-fade-in space-y-3"
            style={
              isCorrect
                ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }
                : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }
            }
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className={cn('text-sm font-bold flex items-center gap-1.5', isCorrect ? 'text-emerald-400' : 'text-red-400')}>
                {isCorrect ? '✅ Jawaban Anda Benar!' : `❌ Jawaban Anda Belum Tepat. (Jawaban: ${currentSoal.jawaban})`}
              </p>

              <button
                onClick={handleResetCurrent}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition-all shrink-0"
                title="Reset Soal Ini"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-200">
              {currentSoal.pembahasan}
            </p>

            {/* Ask AI for Detailed Explanation */}
            <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 leading-snug">
                Ingin tahu aturan hukum &amp; penjelasan lebih mendalam?
              </span>

              <button
                onClick={handleAskDetailAI}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all shrink-0"
              >
                <Sparkles size={13} className="text-cyan-300 animate-pulse" />
                <span>Tanya AI Penjelasan Detail</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-slate-800 disabled:opacity-30 text-slate-400"
          >
            ← Soal Sebelumnya
          </button>
          {currentIdx < soal.length - 1 && (
            <button
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-slate-800 text-slate-300 hover:text-white"
            >
              Soal Berikutnya <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
