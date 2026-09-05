'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  BookOpen,
  Trophy,
  Loader2,
  FileText,
  UserCheck,
  Scale,
  LayoutGrid,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import type {
  DJPSoal,
  DJPSoalPG,
  DJPSoalEsai,
  DJPSoalWawancara,
  EssayAIAnalysis,
  InterviewAIAnalysis,
  ExamMode,
} from '@/lib/djp-types';
import { DJPEssayWorkspace } from './djp-essay-workspace';
import { DJPInterviewSimulator } from './djp-interview-simulator';
import { DjpAiQuestionTutor } from './djp-ai-question-tutor';
import { DJPScorecard } from './djp-scorecard';
import { enqueueSyncItem } from '@/lib/offline-sync-queue';
import { toast } from 'sonner';

interface DJPCbtExamProps {
  initialMode?: ExamMode;
  onClose?: () => void;
}

export function DJPCbtExam({ initialMode = 'all-100', onClose }: DJPCbtExamProps) {
  const [mode, setMode] = useState<ExamMode>(initialMode);
  const [soalList, setSoalList] = useState<DJPSoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Attempt state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [essayAnalysis, setEssayAnalysis] = useState<Record<string, EssayAIAnalysis>>({});
  const [interviewAnalysis, setInterviewAnalysis] = useState<Record<string, InterviewAIAnalysis>>({});
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 mins
  const [quizFinished, setQuizFinished] = useState(false);
  const [showNavSheet, setShowNavSheet] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  const storageKey = `djp_exam_cbt_progress_${mode}`;

  // Fetch Questions
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/djp-exam?mode=${mode}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.ok && Array.isArray(data.soal)) {
          setSoalList(data.soal);

          // Default timer based on mode
          const defaultTime = mode === 'all-100' ? 120 * 60 : mode === 'tkb-50' ? 60 * 60 : 45 * 60;

          // Restore saved progress from localStorage
          try {
            const saved = localStorage.getItem(`djp_exam_cbt_progress_${mode}`);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed) {
                if (typeof parsed.currentIdx === 'number') setCurrentIdx(parsed.currentIdx);
                if (parsed.answers) setAnswers(parsed.answers);
                if (parsed.flagged) setFlagged(parsed.flagged);
                if (parsed.essayAnalysis) setEssayAnalysis(parsed.essayAnalysis);
                if (parsed.interviewAnalysis) setInterviewAnalysis(parsed.interviewAnalysis);
                if (typeof parsed.timeLeft === 'number') setTimeLeft(parsed.timeLeft);
                if (typeof parsed.quizFinished === 'boolean') setQuizFinished(parsed.quizFinished);
              }
            } else {
              setTimeLeft(defaultTime);
            }
          } catch (e) {
            console.error('Error loading saved CBT state:', e);
            setTimeLeft(defaultTime);
          }
        } else {
          toast.error('Gagal memuat soal ujian.');
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        toast.error('Gagal menghubungi server ujian.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mode]);

  // Timer Tick
  useEffect(() => {
    if (isLoading || quizFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, quizFinished, timeLeft]);

  // Auto-save state to localStorage
  useEffect(() => {
    if (isLoading || soalList.length === 0) return;

    const state = {
      currentIdx,
      answers,
      flagged,
      essayAnalysis,
      interviewAnalysis,
      timeLeft,
      quizFinished,
    };
    try {
      localStorage.setItem(`djp_exam_cbt_progress_${mode}`, JSON.stringify(state));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }, [currentIdx, answers, flagged, essayAnalysis, interviewAnalysis, timeLeft, quizFinished, mode, isLoading, soalList.length]);

  // Handlers
  const handleSelectOption = (letter: string) => {
    if (quizFinished) return;
    const currentQ = soalList[currentIdx];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: letter,
    }));
  };

  const handleTextAnswer = (text: string) => {
    if (quizFinished) return;
    const currentQ = soalList[currentIdx];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: text,
    }));
  };

  const toggleFlag = () => {
    const currentQ = soalList[currentIdx];
    if (!currentQ) return;

    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleFinishQuiz = () => {
    setShowFinishConfirm(false);
    setShowNavSheet(false);
    setQuizFinished(true);

    // 1. Calculate composite scores based on mode weights
    let pgTotal = 0;
    let pgCorrect = 0;
    let essayTotal = 0;
    let essayScoreSum = 0;
    let interviewTotal = 0;
    let interviewScoreSum = 0;

    soalList.forEach((s) => {
      if (s.tipe === 'pilihan_ganda') {
        pgTotal += 1;
        const userAns = answers[s.id];
        const isCorrect = userAns && userAns.trim().toUpperCase() === s.jawabanKunci.trim().toUpperCase();
        if (isCorrect) {
          pgCorrect += 1;
        }
      } else if (s.tipe === 'esai_kasus') {
        essayTotal += 1;
        const analysis = essayAnalysis[s.id];
        const score = analysis ? analysis.skor : (answers[s.id] && answers[s.id].length > 20 ? 70 : 0);
        essayScoreSum += score;
      } else if (s.tipe === 'wawancara') {
        interviewTotal += 1;
        const analysis = interviewAnalysis[s.id];
        const score = analysis ? analysis.skor : (answers[s.id] && answers[s.id].length > 20 ? 75 : 0);
        interviewScoreSum += score;
      }
    });

    const tkbScore = pgTotal > 0 ? Math.round((pgCorrect / pgTotal) * 100) : 0;
    const essayScore = essayTotal > 0 ? Math.round(essayScoreSum / essayTotal) : 0;
    const interviewScore = interviewTotal > 0 ? Math.round(interviewScoreSum / interviewTotal) : 0;

    let finalScore = 0;
    if (mode === 'all-100') {
      finalScore = Math.round(tkbScore * 0.4 + essayScore * 0.3 + interviewScore * 0.3);
    } else if (mode === 'tkb-50') {
      finalScore = tkbScore;
    } else if (mode === 'esai-25') {
      finalScore = essayScore;
    } else if (mode === 'wawancara-25') {
      finalScore = interviewScore;
    }

    const isPassed = finalScore >= 75;

    const attemptPayload = {
      mode,
      tkbScore,
      essayScore,
      interviewScore,
      finalScore,
      isPassed,
      answersJson: answers,
      essayAnalysisJson: essayAnalysis,
      interviewAnalysisJson: interviewAnalysis,
    };

    // Save attempt to user persistent history
    fetch('/api/user/djp-attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attemptPayload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (data.ok) {
          toast.success('Hasil ujian DJP berhasil disimpan ke riwayat!');
        }
      })
      .catch((e) => {
        console.warn('Network save attempt error, enqueuing to offline sync:', e);
        enqueueSyncItem('djp_attempt', attemptPayload);
        toast.info('Hasil ujian tersimpan secara lokal dan akan disinkronkan saat online.');
      });
  };

  const handleRetake = () => {
    try {
      localStorage.removeItem(`djp_exam_cbt_progress_${mode}`);
    } catch (e) {}

    setAnswers({});
    setFlagged({});
    setEssayAnalysis({});
    setInterviewAnalysis({});
    setCurrentIdx(0);
    setTimeLeft(mode === 'all-100' ? 120 * 60 : mode === 'tkb-50' ? 60 * 60 : 45 * 60);
    setQuizFinished(false);
    toast.info('Simulasi ujian telah diulang kembali.');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizFinished || showNavSheet || showFinishConfirm) return;

      if (e.key === 'ArrowRight') {
        if (currentIdx < soalList.length - 1) setCurrentIdx((c) => c + 1);
      } else if (e.key === 'ArrowLeft') {
        if (currentIdx > 0) setCurrentIdx((c) => c - 1);
      } else if (['a', 'b', 'c', 'd', 'e'].includes(e.key.toLowerCase())) {
        const currentQ = soalList[currentIdx];
        if (currentQ && currentQ.tipe === 'pilihan_ganda') {
          handleSelectOption(e.key.toUpperCase());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, soalList, quizFinished, showNavSheet, showFinishConfirm]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = soalList[currentIdx];

  // Stats summary for header
  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k].trim().length > 0).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b13] flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="animate-spin text-blue-400 mb-3" size={40} />
        <p className="text-base font-bold text-white">Menyiapkan Bank Soal Seleksi DJP...</p>
        <p className="text-xs text-slate-500 mt-1">Mengunduh 100 soal standar Kemenkeu & modul evaluasi AI</p>
      </div>
    );
  }

  // ── Render Scorecard when finished ──
  if (quizFinished) {
    return (
      <div className="min-h-screen bg-[#070b13] text-slate-100 pb-16">
        <header className="sticky top-0 z-40 w-full h-12 sm:h-14 px-3 sm:px-6 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Trophy size={16} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate">
                <span className="sm:hidden">Hasil Ujian DJP</span>
                <span className="hidden sm:inline">Laporan Hasil & Pembahasan Ujian DJP</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">Mode: {mode.toUpperCase()} ({soalList.length} Soal)</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleRetake}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              <RotateCcw size={13} />
              <span>Ulang</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Tutup Ujian"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </header>

        <DJPScorecard
          soalList={soalList}
          answers={answers}
          essayAnalysis={essayAnalysis}
          interviewAnalysis={interviewAnalysis}
          mode={mode}
          onRetake={handleRetake}
          onReviewQuestion={(idx) => {
            setCurrentIdx(idx);
            setQuizFinished(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col justify-between select-none">
      {/* ── Top Bar CBT Header ── */}
      <header className="sticky top-0 z-40 w-full h-12 sm:h-14 px-2.5 sm:px-6 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0">
        {/* Left: Brand & Progress */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[100px] xs:max-w-[130px] sm:max-w-none">
              <span className="sm:hidden">Ujian DJP</span>
              <span className="hidden sm:inline">Simulasi Ujian Masuk DJP</span>
              <span className="hidden md:inline-block ml-1.5 px-2 py-0.2 rounded text-[10px] bg-blue-500/10 text-blue-400 font-mono">
                {mode === 'all-100' ? '100 Soal' : mode === 'tkb-50' ? '50 TKB' : mode === 'esai-25' ? '25 Esai' : '25 Wawancara'}
              </span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">
              {answeredCount}/{soalList.length} Dijawab
            </p>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg border text-[11px] sm:text-xs font-mono font-bold shrink-0 ${
            timeLeft < 300
              ? 'bg-red-950/90 text-red-400 border-red-800 animate-pulse'
              : 'bg-slate-950 text-yellow-400 border-slate-800'
          }`}
        >
          <Clock size={13} className={timeLeft < 300 ? 'text-red-400' : 'text-yellow-400'} />
          <span>{formatTimer(timeLeft)}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setShowNavSheet(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Daftar Soal"
          >
            <LayoutGrid size={13} />
            <span className="font-mono">{currentIdx + 1}/{soalList.length}</span>
          </button>

          <button
            onClick={() => setShowFinishConfirm(true)}
            className="px-2.5 sm:px-3.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all"
          >
            Selesai
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="Tutup Ujian"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* ── Main CBT Body ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {currentQ && (
          <div className="space-y-6">
            {/* Number Bar & Category Badge */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow">
                  {currentIdx + 1}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  {currentQ.kategori}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    flagged[currentQ.id]
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Flag size={13} className={flagged[currentQ.id] ? 'fill-amber-400 text-amber-400' : ''} />
                  <span>Ragu-Ragu</span>
                </button>
              </div>
            </div>

            {/* ── RENDER ACCORDING TO QUESTION TYPE ── */}

            {/* 1. Multiple Choice TKB CAT Question with Instant Right/Wrong Feedback */}
            {currentQ.tipe === 'pilihan_ganda' && (() => {
              const pgQ = currentQ as DJPSoalPG;
              const userAnswer = answers[currentQ.id];
              const isAnswered = Boolean(userAnswer);
              const isCorrect = isAnswered && userAnswer === pgQ.jawabanKunci;

              return (
                <div className="space-y-4 sm:space-y-6">
                  {/* Question Text */}
                  <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 text-xs sm:text-base text-slate-100 leading-relaxed font-sans shadow-lg">
                    {pgQ.pertanyaan}
                  </div>

                  {/* Option Choices */}
                  <div className="space-y-2.5 sm:space-y-3">
                    {pgQ.pilihan.map((optStr) => {
                      const letter = optStr.trim().charAt(0).toUpperCase();
                      const isSelected = userAnswer === letter;
                      const isTargetCorrect = pgQ.jawabanKunci === letter;

                      let btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700';
                      let badgeStyle = 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white';
                      let rightIndicator = null;

                      if (isAnswered) {
                        if (isSelected && isTargetCorrect) {
                          btnStyle = 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500';
                          badgeStyle = 'bg-emerald-600 text-white font-bold';
                          rightIndicator = (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 ml-auto">
                              <CheckCircle2 size={11} /> Benar
                            </span>
                          );
                        } else if (isSelected && !isTargetCorrect) {
                          btnStyle = 'bg-red-950/50 border-red-500 text-white shadow-lg shadow-red-500/10 ring-1 ring-red-500';
                          badgeStyle = 'bg-red-600 text-white font-bold';
                          rightIndicator = (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 ml-auto">
                              <X size={11} /> Salah
                            </span>
                          );
                        } else if (!isSelected && isTargetCorrect) {
                          btnStyle = 'bg-emerald-950/30 border-emerald-600/70 text-emerald-200';
                          badgeStyle = 'bg-emerald-700 text-white font-bold';
                          rightIndicator = (
                            <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ml-auto">
                              Kunci Benar ({pgQ.jawabanKunci})
                            </span>
                          );
                        } else {
                          btnStyle = 'opacity-40 bg-slate-950/40 border-slate-800/80 text-slate-500';
                          badgeStyle = 'bg-slate-900 text-slate-600';
                        }
                      }

                      return (
                        <button
                          key={letter}
                          onClick={() => handleSelectOption(letter)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-2.5 sm:gap-3.5 group ${btnStyle}`}
                        >
                          <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${badgeStyle}`}
                          >
                            {letter}
                          </span>
                          <span className="leading-relaxed mt-0.5 flex-1">{optStr.slice(2).trim()}</span>
                          {rightIndicator}
                        </button>
                      );
                    })}
                  </div>

                  {/* Instant Feedback & Pembahasan Card */}
                  {isAnswered && (
                    <div
                      className={`p-4 sm:p-5 rounded-2xl border transition-all animate-fade-in space-y-3 shadow-xl ${
                        isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500/40'
                          : 'bg-red-950/30 border-red-500/40'
                      }`}
                    >
                      {/* Status Banner */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <CheckCircle2 size={18} />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                              <AlertTriangle size={18} />
                            </div>
                          )}
                          <div>
                            <p
                              className={`text-xs sm:text-sm font-bold ${
                                isCorrect ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {isCorrect
                                ? 'Jawaban Anda BENAR! (+1 Poin)'
                                : `Jawaban Anda SALAH (Kunci Jawaban yang Benar: Pilihan ${pgQ.jawabanKunci})`}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Tingkat Kesulitan: <strong className="text-slate-300">{pgQ.tingkatKesulitan}</strong>
                            </p>
                          </div>
                        </div>

                        {pgQ.landasanHukum && (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-blue-300 border border-slate-700 font-mono">
                            📜 {pgQ.landasanHukum}
                          </span>
                        )}
                      </div>

                      {/* Pembahasan Box */}
                      {pgQ.pembahasan && (
                        <div className="pt-2.5 border-t border-slate-800/80">
                          <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                            <Sparkles size={13} className="text-yellow-400" />
                            Pembahasan Ringkas:
                          </p>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                            {pgQ.pembahasan}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Comprehensive Question Tutor & Interactive Follow-Up Chat */}
                  <DjpAiQuestionTutor 
                    soal={pgQ} 
                    userAnswer={userAnswer} 
                  />
                </div>
              );
            })()}

            {/* 2. Case Study Essay Workspace */}
            {currentQ.tipe === 'esai_kasus' && (
              <DJPEssayWorkspace
                soal={currentQ as DJPSoalEsai}
                userAnswer={answers[currentQ.id] || ''}
                onAnswerChange={handleTextAnswer}
                essayAnalysis={essayAnalysis[currentQ.id]}
                onSaveAnalysis={(analysis) => {
                  setEssayAnalysis((prev) => ({
                    ...prev,
                    [currentQ.id]: analysis,
                  }));
                }}
              />
            )}

            {/* 3. Interactive Interview Simulator */}
            {currentQ.tipe === 'wawancara' && (
              <DJPInterviewSimulator
                soal={currentQ as DJPSoalWawancara}
                userAnswer={answers[currentQ.id] || ''}
                onAnswerChange={handleTextAnswer}
                interviewAnalysis={interviewAnalysis[currentQ.id]}
                onSaveAnalysis={(analysis) => {
                  setInterviewAnalysis((prev) => ({
                    ...prev,
                    [currentQ.id]: analysis,
                  }));
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* ── Bottom Fixed Navigation Footer ── */}
      <footer className="sticky bottom-0 z-20 px-4 sm:px-6 py-3 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => {
            if (currentIdx > 0) setCurrentIdx((prev) => prev - 1);
          }}
          disabled={currentIdx === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft size={16} />
          <span>Sebelumnya</span>
        </button>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Gunakan [← / →] untuk beralih nomor, [A/B/C/D] untuk menjawab PG
        </span>

        <button
          onClick={() => {
            if (currentIdx < soalList.length - 1) {
              setCurrentIdx((prev) => prev + 1);
            } else {
              setShowFinishConfirm(true);
            }
          }}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
        >
          <span>{currentIdx === soalList.length - 1 ? 'Selesai & Kumpulkan' : 'Berikutnya'}</span>
          <ChevronRight size={16} />
        </button>
      </footer>

      {/* ── Question Grid Navigation Drawer / Modal ── */}
      {showNavSheet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <LayoutGrid size={16} className="text-blue-400" />
                  Daftar Nomor Soal Ujian ({soalList.length})
                </h3>
                <button
                  onClick={() => setShowNavSheet(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Grid 100 with Correct (Green) / Incorrect (Red) Visuals */}
              <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                {soalList.map((s, idx) => {
                  const hasAnswer = answers[s.id] && answers[s.id].trim().length > 0;
                  const isFlagged = flagged[s.id];
                  const isActive = idx === currentIdx;

                  let btnBg = 'bg-slate-800/80 text-slate-300 border-slate-700';
                  if (isFlagged) {
                    btnBg = 'bg-amber-500 text-slate-950 font-extrabold border-amber-400';
                  } else if (hasAnswer) {
                    if (s.tipe === 'pilihan_ganda') {
                      const isCorrectAnswer = answers[s.id] === (s as DJPSoalPG).jawabanKunci;
                      btnBg = isCorrectAnswer
                        ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                        : 'bg-rose-600 text-white font-bold border-rose-500';
                    } else {
                      btnBg = 'bg-blue-600 text-white font-bold border-blue-500';
                    }
                  }

                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCurrentIdx(idx);
                        setShowNavSheet(false);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex flex-col items-center justify-center ${btnBg} ${
                        isActive ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-105' : ''
                      }`}
                    >
                      <span>{idx + 1}</span>
                      <span className="text-[8px] opacity-70">
                        {s.tipe === 'pilihan_ganda' ? 'PG' : s.tipe === 'esai_kasus' ? 'Esai' : 'Wwn'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowNavSheet(false);
                  setShowFinishConfirm(true);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
              >
                Selesaikan Ujian Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Finish Confirmation Modal ── */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-lg font-bold text-white">Selesaikan & Kumpulkan Ujian?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Anda telah menjawab <strong className="text-white">{answeredCount}</strong> dari{' '}
              <strong className="text-white">{soalList.length}</strong> total soal. Sisa waktu ujian adalah{' '}
              <strong className="text-yellow-400">{formatTimer(timeLeft)}</strong>.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                onClick={handleFinishQuiz}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              >
                Ya, Kumpulkan Jawaban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
