'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  CheckCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Loader2,
  Check,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import type { KuisSoal } from '@/lib/module-types';
import { toast } from 'sonner';
import { streamGeminiClient } from '@/lib/client-gemini';
import { RichContentRenderer } from './rich-content-renderer';

interface KuisAkhirProps {
  soal: KuisSoal[];
  onClose: () => void;
  moduleTitle: string;
  moduleSlug: string;
  moduleId: string;
  quizType?: 'akhir' | 'perhitungan';
}

export default function KuisAkhir({
  soal,
  onClose,
  moduleTitle,
  moduleSlug,
  moduleId,
  quizType = 'akhir',
}: KuisAkhirProps) {
  const progressKey = quizType === 'perhitungan' ? `brevet_quiz_progress_calc_${moduleId}` : `brevet_quiz_progress_${moduleId}`;
  const scoreKey = quizType === 'perhitungan' ? `brevet_quiz_calc_score_${moduleSlug}` : `brevet_quiz_score_${moduleSlug}`;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [essayAnalysis, setEssayAnalysis] = useState<Record<string, any>>({});
  const [analyzingEssay, setAnalyzingEssay] = useState<Record<string, boolean>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes standard for Brevet AB 100 questions
  const [showNavSheet, setShowNavSheet] = useState(false);
  const [expandedPembahasan, setExpandedPembahasan] = useState<Record<string, boolean>>({});
  const [isProgressLoaded, setIsProgressLoaded] = useState(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed) {
          if (typeof parsed.currentIdx === 'number') setCurrentIdx(parsed.currentIdx);
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.essayAnalysis) setEssayAnalysis(parsed.essayAnalysis);
          if (typeof parsed.timeLeft === 'number') setTimeLeft(parsed.timeLeft);
          if (typeof parsed.quizFinished === 'boolean') setQuizFinished(parsed.quizFinished);
        }
      }
    } catch (e) {
      console.error('Gagal memuat progress kuis:', e);
    } finally {
      setIsProgressLoaded(true);
    }
  }, [progressKey]);

  // Save progress to localStorage on change
  useEffect(() => {
    if (!isProgressLoaded) return;
    try {
      const progressData = {
        currentIdx,
        answers,
        essayAnalysis,
        timeLeft,
        quizFinished
      };
      localStorage.setItem(progressKey, JSON.stringify(progressData));
    } catch (e) {
      console.error('Gagal menyimpan progress kuis:', e);
    }
  }, [currentIdx, answers, essayAnalysis, timeLeft, quizFinished, progressKey, isProgressLoaded]);

  // Countdown timer
  useEffect(() => {
    if (quizFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizFinished]);

  if (!isProgressLoaded) {
    return (
      <div className="min-h-dvh bg-[#070b13] flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="animate-spin text-yellow-400 mb-3" size={36} />
        <p className="text-sm font-semibold">Memuat Progres Ujian...</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSoal = soal[currentIdx];

  const isOptionCorrect = (opt: string, answerKey: string) => {
    if (!opt || !answerKey) return false;
    const optClean = opt.trim().toUpperCase();
    const keyClean = answerKey.trim().toUpperCase();
    if (optClean === keyClean) return true;
    if (optClean.startsWith(`${keyClean}.`) || optClean.startsWith(`${keyClean} `)) return true;
    return false;
  };

  const isOptionSelected = (opt: string, userAns?: string) => {
    if (!userAns) return false;
    const optClean = opt.trim().toUpperCase();
    const ansClean = userAns.trim().toUpperCase();
    if (optClean === ansClean) return true;
    if (ansClean.length === 1 && optClean.startsWith(`${ansClean}.`)) return true;
    if (optClean.startsWith(`${ansClean}.`) || optClean.startsWith(`${ansClean} `)) return true;
    return false;
  };

  const handleSelectOption = (option: string) => {
    if (!currentSoal) return;
    if (answers[currentSoal.id]) return; // Locked once answered!
    setAnswers((prev) => ({ ...prev, [currentSoal.id]: option }));
  };

  const handleAnalyzeEssay = async () => {
    if (!currentSoal) return;
    const userText = (answers[currentSoal.id] || '').trim();
    if (!userText) {
      toast.error('Silakan ketik jawaban esai Anda terlebih dahulu.');
      return;
    }

    setAnalyzingEssay({ ...analyzingEssay, [currentSoal.id]: true });

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
        throw new Error(data.error || 'Gagal mengevaluasi jawaban.');
      }

      setEssayAnalysis({ ...essayAnalysis, [currentSoal.id]: data.result });
      toast.success('Jawaban esai berhasil dinilai oleh AI!');
    } catch (err: any) {
      toast.error('Gagal mengevaluasi esai: ' + err.message);
    } finally {
      setAnalyzingEssay({ ...analyzingEssay, [currentSoal.id]: false });
    }
  };

  const checkIsCorrect = (soalObj: KuisSoal) => {
    const selected = answers[soalObj.id];
    if (!selected) return false;
    // Extract letter answer (e.g. "A") from selected text or match exact
    const selectedClean = selected.trim();
    const isLetterMatching = selectedClean.length === 1 && selectedClean.toUpperCase() === soalObj.jawaban.toUpperCase();
    const isPrefixMatching = selectedClean.startsWith(`${soalObj.jawaban}. `) || selectedClean.startsWith(`${soalObj.jawaban} `);
    return isLetterMatching || isPrefixMatching;
  };

  const handleFinishQuiz = () => {
    // Check if there are unanswered questions
    const unansweredCount = soal.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      if (!confirm(`Terdapat ${unansweredCount} soal yang belum Anda jawab. Apakah Anda yakin ingin mengirim kuis ini?`)) {
        return;
      }
    }
    setQuizFinished(true);
    
    // calculate final score here to save it
    const calculatedPgCorrect = pgSoal.filter(checkIsCorrect).length;
    const calculatedPgScore = pgSoal.length > 0 ? Math.round((calculatedPgCorrect / pgSoal.length) * 100) : 0;
    const calculatedEssayScores = essaySoal.map((s) => essayAnalysis[s.id]?.skor ?? 0);
    const calculatedAvgEssay = essaySoal.length > 0 
      ? Math.round(calculatedEssayScores.reduce((a, b) => a + b, 0) / essaySoal.length) 
      : 0;
    const calculatedFinal = Math.round((calculatedPgScore * 0.8) + (calculatedAvgEssay * 0.2));
    
    localStorage.setItem(scoreKey, calculatedFinal.toString());
    
    if (quizType === 'akhir') {
      // Save to Database in background
      fetch('/api/belajar/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          pgScore: calculatedPgScore,
          essayScore: calculatedAvgEssay,
          finalScore: calculatedFinal,
          answersJson: answers,
          essayAnalysisJson: essayAnalysis,
        }),
      }).catch(console.error);
    }

    toast.success('Kuis Akhir Berhasil Dikirim!');
  };

  // Calculate scores
  const pgSoal = soal.filter((s) => s.tipe === 'pilihan_ganda');
  const essaySoal = soal.filter((s) => s.tipe === 'esai');

  const pgCorrectCount = pgSoal.filter(checkIsCorrect).length;
  const pgScore = pgSoal.length > 0 ? Math.round((pgCorrectCount / pgSoal.length) * 100) : 0;

  const essayScores = essaySoal.map((s) => essayAnalysis[s.id]?.skor ?? 0);
  const averageEssayScore = essaySoal.length > 0 
    ? Math.round(essayScores.reduce((a, b) => a + b, 0) / essaySoal.length) 
    : 0;

  const finalScore = Math.round((pgScore * 0.8) + (averageEssayScore * 0.2));
  const isLulus = finalScore >= 70;

  // Calculate Progress Percentages
  const totalQuestions = soal.length;
  const answeredCount = Object.keys(answers).length;
  const percentProgress = Math.round((answeredCount / totalQuestions) * 100);

  const handleResetAll = () => {
    if (confirm('Apakah Anda yakin ingin mereset dan mengulangi kuis ini dari awal?')) {
      setAnswers({});
      setEssayAnalysis({});
      setAnalyzingEssay({});
      setQuizFinished(false);
      setTimeLeft(120 * 60);
      setCurrentIdx(0);
      localStorage.removeItem(scoreKey);
      localStorage.removeItem(progressKey);
      
      if (quizType === 'akhir') {
        // Delete from Database in background
        fetch(`/api/belajar/quiz-attempts?moduleId=${moduleId}`, { method: 'DELETE' }).catch(console.error);
      }

      toast.info('Kuis telah di-reset. Silakan mulai ulang kuis.');
    }
  };

  const toggleExpandPembahasan = (id: string) => {
    setExpandedPembahasan((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (quizFinished) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070b13] text-slate-200 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-6 py-6 sm:py-10 animate-fade-in">
          
          {/* Dashboard Summary Card */}
          <div className="card p-5 sm:p-8 bg-[#0B132B] border border-slate-800 rounded-2xl sm:rounded-3xl text-center space-y-4 sm:space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
            <Trophy className="mx-auto text-yellow-400 animate-bounce" size={48} />
            <div className="space-y-1">
              <h1 className="text-xl sm:text-3xl font-extrabold text-white">
                {quizType === 'perhitungan' ? 'Hasil Latihan Perhitungan' : 'Hasil Ujian Brevet'}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm truncate max-w-md mx-auto">
                Modul: <strong className="text-white">{moduleTitle}</strong>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 py-1 max-w-3xl mx-auto">
              <div className="bg-slate-900/60 border border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
                <span className="block text-xl sm:text-3xl font-black text-blue-400">{pgScore}%</span>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 block leading-tight">Pilihan Ganda</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl">
                <span className="block text-xl sm:text-3xl font-black text-purple-400">{averageEssayScore}%</span>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 block leading-tight">Essay AI</span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl relative">
                <span className={`block text-xl sm:text-3xl font-black ${isLulus ? 'text-emerald-400' : 'text-red-400'}`}>
                  {finalScore}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 block font-semibold uppercase truncate">
                  {isLulus ? '🟢 LULUS' : '🔴 ULANGI'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg transition"
              >
                Kembali ke Ruang Belajar
              </button>
              <button
                onClick={handleResetAll}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} />
                Mulai Ulang Kuis
              </button>
            </div>
          </div>

          {/* Review Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="text-blue-500" size={18} />
                Review & Pembahasan Soal
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">{soal.length} Soal</span>
            </div>

            {soal.map((s, idx) => {
              const isPg = s.tipe === 'pilihan_ganda';
              const userAns = answers[s.id] || 'Tidak dijawab';
              const isCorrect = isPg ? checkIsCorrect(s) : null;
              const essayResult = !isPg ? essayAnalysis[s.id] : null;
              const isExpanded = !!expandedPembahasan[s.id];

              return (
                <div
                  key={s.id}
                  className={`p-4 sm:p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                    isPg
                      ? isCorrect
                        ? 'bg-emerald-950/10 border-emerald-900/30'
                        : 'bg-red-950/10 border-red-900/30'
                      : 'bg-purple-950/10 border-purple-900/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 tracking-wider">
                      Soal {idx + 1} &middot; {isPg ? 'PG' : 'Essay'}
                    </span>
                    {isPg ? (
                      isCorrect ? (
                        <span className="text-[10px] sm:text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          🟢 BENAR
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full">
                          🔴 SALAH
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] sm:text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full">
                        🤖 AI Skor: {essayResult?.skor ?? 0}%
                      </span>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm font-semibold text-white leading-relaxed mb-3">
                    <RichContentRenderer content={s.pertanyaan} />
                  </div>

                  <div className="text-xs space-y-2.5 bg-slate-950/40 p-3.5 sm:p-4 rounded-xl border border-slate-900">
                    <div>
                      <span className="text-slate-500 block font-semibold uppercase text-[9px] mb-0.5">Jawaban Anda:</span>
                      <p className="text-slate-200 font-medium">{userAns}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block font-semibold uppercase text-[9px] mb-0.5">Kunci Jawaban:</span>
                      <p className="text-emerald-400 font-bold">{s.jawaban}</p>
                    </div>

                    {s.pembahasan && (
                      <div className="pt-2 border-t border-slate-900">
                        <span className="text-slate-500 block font-semibold uppercase text-[9px] mb-1">Pembahasan Ringkas:</span>
                        <div className={`text-slate-300 leading-relaxed text-xs ${!isExpanded ? 'line-clamp-2' : ''}`}>
                          <RichContentRenderer content={s.pembahasan} />
                        </div>
                        {s.pembahasan.length > 100 && (
                          <button
                            onClick={() => toggleExpandPembahasan(s.id)}
                            className="mt-1 text-[11px] font-bold text-cyan-400 hover:underline"
                          >
                            {isExpanded ? '▲ Sembunyikan' : '▼ Baca Selengkapnya'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#070b13] text-slate-200 flex flex-col overflow-hidden font-sans">
      
      {/* Top Header */}
      <header className="flex flex-col shrink-0 bg-[#0d1424] border-b border-slate-800/80">
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-base font-bold text-white tracking-wide truncate max-w-[150px] sm:max-w-md">
              {moduleTitle}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-400 font-medium">
                Soal {currentIdx + 1}/{totalQuestions}
              </span>
              <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.2 rounded">
                {percentProgress}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-yellow-400 text-xs font-semibold font-mono">
              <Clock size={13} className="text-yellow-500 shrink-0" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              title="Keluar Kuis"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-950 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300" 
            style={{ width: `${percentProgress}%` }}
          />
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#070b13]">
        {/* Active Question Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 space-y-4 bg-radial-gradient">
          {currentSoal ? (
            <div className="space-y-4 max-w-3xl mx-auto w-full pb-16 md:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Soal {currentIdx + 1} dari {soal.length}
                  </span>
                  <span className="text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {currentSoal.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Essay'}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm sm:text-base sm:text-lg font-bold text-white leading-relaxed break-words">
                <RichContentRenderer content={currentSoal.pertanyaan} />
              </div>

              {/* Choice Options */}
              {currentSoal.tipe === 'pilihan_ganda' && currentSoal.pilihan && (
                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  {currentSoal.pilihan.map((opt, i) => {
                    const hasAnswered = !!answers[currentSoal.id];
                    const isSelected = isOptionSelected(opt, answers[currentSoal.id]);
                    const isCorrect = isOptionCorrect(opt, currentSoal.jawaban);

                    let optionStyle = 'bg-[#0e172a] border-slate-800 text-slate-300 hover:border-slate-700';
                    let badgeStyle = 'bg-slate-950 border-slate-700 text-slate-400';

                    if (hasAnswered) {
                      if (isSelected && isCorrect) {
                        optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-500/10';
                        badgeStyle = 'bg-emerald-500 border-transparent text-white';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'bg-red-950/40 border-red-500 text-red-300 font-bold shadow-lg shadow-red-500/10';
                        badgeStyle = 'bg-red-500 border-transparent text-white';
                      } else if (isCorrect) {
                        optionStyle = 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300 font-bold';
                        badgeStyle = 'bg-emerald-500/30 border-emerald-500 text-emerald-300';
                      } else {
                        optionStyle = 'bg-[#0e172a]/40 border-slate-850 text-slate-500 opacity-40 cursor-not-allowed';
                        badgeStyle = 'bg-slate-950/50 border-slate-800 text-slate-600';
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={hasAnswered}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full p-3 sm:p-4 rounded-xl text-left text-xs sm:text-sm border transition-all duration-200 flex items-start gap-2.5 sm:gap-3.5 break-words ${optionStyle}`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-black mt-0.5 ${badgeStyle}`}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="leading-relaxed flex-1">{opt}</span>

                        {hasAnswered && isSelected && isCorrect && (
                          <span className="shrink-0 text-emerald-400 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 size={16} /> Benar
                          </span>
                        )}
                        {hasAnswered && isSelected && !isCorrect && (
                          <span className="shrink-0 text-red-400 font-bold text-xs flex items-center gap-1">
                            <XCircle size={16} /> Salah
                          </span>
                        )}
                        {hasAnswered && !isSelected && isCorrect && (
                          <span className="shrink-0 text-emerald-400 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 size={16} /> Kunci Jawaban
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Instant Answer Feedback Card */}
              {answers[currentSoal.id] && currentSoal.tipe === 'pilihan_ganda' && (
                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {checkIsCorrect(currentSoal) ? (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs space-y-2 shadow-lg shadow-emerald-500/5">
                      <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                        <CheckCircle2 size={18} /> Jawaban Anda BENAR! 🎉
                      </div>
                      {currentSoal.pembahasan && (
                        <div className="pt-2 border-t border-emerald-900/50">
                          <span className="font-bold text-emerald-400 block mb-1">📖 Uraian & Pembahasan:</span>
                          <div className="text-slate-200 leading-relaxed text-xs">
                            <RichContentRenderer content={currentSoal.pembahasan} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs space-y-2 shadow-lg shadow-red-500/5">
                      <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                        <XCircle size={18} /> Jawaban Anda SALAH ❌
                      </div>
                      <p className="text-slate-200">
                        Kunci Jawaban Resmi: <strong className="text-emerald-400 font-bold">{currentSoal.jawaban}</strong>
                      </p>
                      {currentSoal.pembahasan && (
                        <div className="pt-2 border-t border-red-900/50">
                          <span className="font-bold text-yellow-400 block mb-1">📖 Uraian & Pembahasan:</span>
                          <div className="text-slate-200 leading-relaxed text-xs">
                            <RichContentRenderer content={currentSoal.pembahasan} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lanjut Ke Soal Selanjutnya Button */}
                  {currentIdx < soal.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx((i) => Math.min(soal.length - 1, i + 1))}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.01]"
                    >
                      <span>Lanjut ke Soal Berikutnya #{currentIdx + 2}</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishQuiz}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.01]"
                    >
                      <Check size={16} />
                      <span>Selesai & Kirim Ujian</span>
                    </button>
                  )}
                </div>
              )}

              {/* Essay Input */}
              {currentSoal.tipe === 'esai' && (
                <div className="space-y-3 pt-1">
                  <textarea
                    value={answers[currentSoal.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentSoal.id]: e.target.value })}
                    placeholder="Tuliskan analisis & perhitungan Anda di sini secara rinci..."
                    rows={5}
                    className="w-full p-3.5 bg-[#0e172a] border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm leading-relaxed"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleAnalyzeEssay}
                      disabled={analyzingEssay[currentSoal.id] || !(answers[currentSoal.id] || '').trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md"
                    >
                      {analyzingEssay[currentSoal.id] ? (
                        <>
                          <Loader2 className="animate-spin" size={14} /> Menilai...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="text-yellow-400" /> Uji AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <HelpCircle size={40} />
              <p className="mt-2 text-xs">Soal kuis tidak ditemukan.</p>
            </div>
          )}
        </div>

        {/* Desktop Right Side: Question Navigator (Hidden on Mobile) */}
        <div className="hidden md:flex w-80 border-l border-slate-800/80 p-5 flex-col bg-[#0b101c] shrink-0">
          <h3 className="font-bold text-xs text-slate-400 mb-3 uppercase tracking-wider">
            Navigasi Soal (1-{soal.length})
          </h3>

          <div className="grid grid-cols-5 gap-1.5 overflow-y-auto flex-1 pr-1 pb-2">
            {soal.map((s, idx) => {
              const isSelected = idx === currentIdx;
              const hasAnswer = !!answers[s.id];
              const isEssay = s.tipe === 'esai';
              const essayEvaluated = isEssay && !!essayAnalysis[s.id];

              let btnBg = 'bg-slate-900/60 border-slate-850 text-slate-400 hover:border-slate-700';
              if (isSelected) {
                btnBg = 'bg-blue-600 text-white border-blue-500 font-extrabold shadow-md';
              } else if (essayEvaluated) {
                btnBg = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
              } else if (hasAnswer) {
                btnBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
              }

              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`aspect-square flex items-center justify-center text-xs font-bold rounded-xl border transition ${btnBg}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar on Mobile & Desktop */}
      <footer className="shrink-0 bg-[#0d1424] border-t border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 z-40">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 px-3 py-2 bg-slate-900 border border-slate-800 disabled:opacity-30 rounded-xl text-xs font-semibold text-slate-300"
        >
          <ChevronLeft size={15} /> <span className="hidden sm:inline">Sebelum</span>
        </button>

        {/* Mobile Nav Drawer Toggle Button */}
        <button
          onClick={() => setShowNavSheet(true)}
          className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs font-bold text-cyan-400"
        >
          <BookOpen size={14} />
          <span>No. {currentIdx + 1}/{soal.length} 📋</span>
        </button>

        {currentIdx < soal.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => Math.min(soal.length - 1, i + 1))}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md"
          >
            <span className="hidden sm:inline">Berikut</span> <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleFinishQuiz}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg text-xs"
          >
            <Check size={15} /> Kirim Kuis
          </button>
        )}
      </footer>

      {/* Mobile Question Navigator Bottom Sheet / Drawer */}
      {showNavSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm md:hidden animate-in fade-in">
          <div className="bg-[#0b101c] border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[75vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                Navigasi Soal (1-{soal.length})
              </h3>
              <button
                onClick={() => setShowNavSheet(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 overflow-y-auto p-1 flex-1">
              {soal.map((s, idx) => {
                const isSelected = idx === currentIdx;
                const hasAnswer = !!answers[s.id];
                const isEssay = s.tipe === 'esai';
                const essayEvaluated = isEssay && !!essayAnalysis[s.id];

                let btnBg = 'bg-slate-900 border-slate-800 text-slate-400';
                if (isSelected) {
                  btnBg = 'bg-blue-600 text-white border-blue-500 font-bold';
                } else if (essayEvaluated) {
                  btnBg = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                } else if (hasAnswer) {
                  btnBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                }

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentIdx(idx);
                      setShowNavSheet(false);
                    }}
                    className={`h-10 flex items-center justify-center text-xs font-bold rounded-xl border ${btnBg}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowNavSheet(false)}
              className="w-full py-2.5 bg-slate-800 text-slate-200 font-bold rounded-xl text-xs"
            >
              Tutup Navigasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
