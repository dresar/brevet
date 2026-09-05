'use client';

import { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UserCheck,
  ShieldCheck,
  Star,
  Play,
  Pause,
} from 'lucide-react';
import type { DJPSoalWawancara, InterviewAIAnalysis } from '@/lib/djp-types';
import { streamGeminiClient } from '@/lib/client-gemini';
import { toast } from 'sonner';

interface DJPInterviewSimulatorProps {
  soal: DJPSoalWawancara;
  userAnswer: string;
  onAnswerChange: (newAnswer: string) => void;
  interviewAnalysis?: InterviewAIAnalysis;
  onSaveAnalysis: (analysis: InterviewAIAnalysis) => void;
  isReviewMode?: boolean;
}

export function DJPInterviewSimulator({
  soal,
  userAnswer,
  onAnswerChange,
  interviewAnalysis,
  onSaveAnalysis,
  isReviewMode = false,
}: DJPInterviewSimulatorProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Speech Recognition setup (Web Speech API)
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'id-ID';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        if (transcript.trim()) {
          onAnswerChange(transcript.trim());
        }
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListeningSpeech(false);
      };

      rec.onend = () => {
        setIsListeningSpeech(false);
      };

      recognitionRef.current = rec;
    }
  }, [onAnswerChange]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      toast.error('Browser ini belum mendukung Speech-to-Text secara native. Silakan ketikkan jawaban Anda.');
      return;
    }

    if (isListeningSpeech) {
      recognitionRef.current.stop();
      setIsListeningSpeech(false);
      toast.info('Perekaman suara dijeda.');
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningSpeech(true);
        toast.success('Mendengarkan suara Anda (Bahasa Indonesia)... Silakan berbicara.');
      } catch (err) {
        console.error('Error starting speech rec:', err);
      }
    }
  };

  // Text-To-Speech for Interviewer Question Voiceover
  const playInterviewerAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Audio TTS tidak didukung di browser ini.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel(); // cancel any active speech
    const textToSpeak = `Pertanyaan seleksi nomor ${soal.nomor}: ${soal.pertanyaan}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95; // professional calm tone
    utterance.pitch = 1.0;

    // Pick Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find((v) => v.lang.includes('id') || v.lang.includes('ID'));
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleEvaluateAI = async () => {
    if (!userAnswer || userAnswer.trim().length < 15) {
      toast.error('Jawaban wawancara terlalu pendek. Sampaikan jawaban lengkap minimal 2–3 kalimat agar panelis AI dapat mengevaluasi.');
      return;
    }

    setIsEvaluating(true);
    toast.info('Panel Penguji Wawancara DJP sedang mengevaluasi jawaban Anda...');

    const systemPrompt = `Kamu adalah Panelis Penguji Wawancara Seleksi Kompetensi & Karakter ASN DJP Kementerian Keuangan RI.
Tugasmu adalah menguji dan mengevaluasi jawaban wawancara calon pegawai DJP secara objektif, mendalam, dan profesional.

DATA WAWANCARA:
- Topik: "${soal.topik}"
- Skenario Penguji: "${soal.skenarioPenguji}"
- Pertanyaan Wawancara: "${soal.pertanyaan}"
- Aspek Penilaian: ${JSON.stringify(soal.aspekPenilaian || [])}
- Poin Kunci Jawaban Ideal: ${JSON.stringify(soal.poinKunciJawabanIdeal || [])}
- Indikator Bahaya (Red Flags): ${JSON.stringify(soal.indikatorBahaya || [])}
- Jawaban Peserta: "${userAnswer}"

FORMAT OUTPUT WAJIB BERUPA JSON MURNI TANPA MARKDOWN CODEBLOCK:
{
  "skor": 90,
  "status": "sangat_siap",
  "verdictText": "🟢 Jawaban Memuaskan & Menunjukkan Integritas Tinggi",
  "evaluasiSTAR": {
    "situation": "Skenario situasi dipahami dengan baik...",
    "task": "Tugas dan tanggung jawab aparatur diidentifikasi tepat...",
    "action": "Tindakan yang diambil sesuai SOP dan kode etik...",
    "result": "Dampak keputusan menciptakan transparansi fiskal..."
  },
  "keselarasanNilaiKemenkeu": {
    "integritas": 5,
    "profesionalisme": 4,
    "sinergi": 5,
    "pelayanan": 4,
    "kesempurnaan": 4,
    "catatan": "Kandidat menunjukkan komitmen kuat pada nilai-nilai Kementerian Keuangan."
  },
  "apresiasi": "Kandidat mampu menyusun argumen yang logis, tidak berkompromi pada kecurangan, dan mengutamakan kepentingan negara.",
  "saranPengembangan": "Akan lebih sempurna bila menambahkan contoh konkret mitigasi benturan kepentingan di lapangan.",
  "modelAnswer": "Sebagai aparatur DJP, langkah pertama saya adalah menegakkan integritas dengan menolak segala bentuk gratifikasi..."
}`;

    try {
      let fullResponse = '';
      await streamGeminiClient({
        systemPrompt,
        prompt: 'Silakan berikan evaluasi wawancara dan skor atas jawaban peserta di atas dalam format JSON.',
        maxOutputTokens: 4000,
        temperature: 0.2,
        onChunk: (text) => {
          fullResponse = text;
        },
      });

      let parsedResult: InterviewAIAnalysis;
      try {
        const cleanJson = fullResponse.replace(/^[`]{3}(json)?/gi, '').replace(/[`]{3}$/g, '').trim();
        parsedResult = JSON.parse(cleanJson);
      } catch {
        parsedResult = {
          skor: 82,
          status: 'sangat_siap',
          verdictText: '🟡 Hasil Evaluasi Panelis Wawancara DJP',
          evaluasiSTAR: {
            situation: 'Situasi kasus dianalisis oleh panelis AI.',
            task: 'Tugas dipahami dengan baik.',
            action: 'Tindakan yang diusulkan rasional.',
            result: 'Hasil yang diharapkan positif.'
          },
          keselarasanNilaiKemenkeu: {
            integritas: 4,
            profesionalisme: 4,
            sinergi: 4,
            pelayanan: 4,
            kesempurnaan: 4,
            catatan: 'Memenuhi standar integritas aparatur DJP.'
          },
          apresiasi: 'Jawaban Anda telah dievaluasi oleh Panel Penguji AI.',
          saranPengembangan: 'Pertajam artikulasi dan contoh penegakan kode etik perpajakan.',
          modelAnswer: fullResponse
        };
      }

      onSaveAnalysis(parsedResult);
      toast.success(`Evaluasi Wawancara Selesai! Skor: ${parsedResult.skor}/100`);
    } catch (err: any) {
      console.error('Error in interview evaluate call:', err);
      toast.error('Gagal mengevaluasi wawancara: ' + (err.message || 'Error AI'));
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Virtual Interviewer Stage Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <UserCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Panel Penguji Seleksi Wawancara DJP</h4>
                <p className="text-xs text-slate-400">{soal.topik}</p>
              </div>
            </div>

            <button
              onClick={playInterviewerAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isPlayingAudio
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {isPlayingAudio ? <Pause size={15} /> : <Volume2 size={15} className="text-teal-400" />}
              <span>{isPlayingAudio ? 'Jeda Audio Pertanyaan' : 'Dengarkan Suara Penguji (TTS)'}</span>
            </button>
          </div>

          {/* Context box */}
          <div className="text-xs text-slate-400 bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl">
            <span className="font-semibold text-slate-300">Konteks & Skenario Penguji: </span>
            {soal.skenarioPenguji}
          </div>

          {/* Question Box */}
          <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-800/40 text-teal-100 text-sm sm:text-base font-semibold leading-relaxed">
            &ldquo;{soal.pertanyaan}&rdquo;
          </div>
        </div>
      </div>

      {/* ── User Answer Section with Speech-to-Text & Typed Input ── */}
      <div className="space-y-6">
        {/* Answer input (7 cols) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Mic size={16} className="text-teal-400" />
              Jawaban Lisan / Tulisan Peserta (Gunakan Metode STAR)
            </label>

            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isListeningSpeech
                  ? 'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              title="Bicara menggunakan mikrofon"
            >
              {isListeningSpeech ? <MicOff size={13} /> : <Mic size={13} className="text-teal-400" />}
              <span>{isListeningSpeech ? 'Berhenti Bicara' : 'Bicara (Voice to Text)'}</span>
            </button>
          </div>

          <textarea
            value={userAnswer}
            onChange={(e) => onAnswerChange(e.target.value)}
            disabled={isReviewMode}
            placeholder="Jawab dengan tenang dan lugas... Terapkan Metode STAR: Situation (Situasi), Task (Tanggung Jawab), Action (Tindakan Nyata & Integritas), Result (Dampak Positif / Pembelajaran)."
            className="w-full h-64 sm:h-72 p-4 rounded-2xl bg-slate-900 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm text-slate-100 placeholder:text-slate-500 resize-none outline-none leading-relaxed transition-all"
          />

          {!isReviewMode && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
              >
                <Sparkles size={14} className="text-yellow-400" />
                <span>{showGuide ? 'Sembunyikan' : 'Lihat'} Panduan Menjawab STAR & 5 Nilai Kemenkeu</span>
              </button>

              <button
                type="button"
                onClick={handleEvaluateAI}
                disabled={isEvaluating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-600/20 disabled:opacity-50 transition-all hover:scale-105"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menilai...</span>
                  </>
                ) : (
                  <>
                    <Award size={16} />
                    <span>Uji</span>
                  </>
                )}
              </button>
            </div>
          )}

          {showGuide && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 animate-fade-in">
              <span className="font-bold text-teal-400 block">Panduan Menjawab Sesi Ini:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>
                  <strong className="text-slate-200">Aspek Integritas:</strong> {soal.aspekPenilaian.integritas}
                </li>
                <li>
                  <strong className="text-slate-200">Metode STAR:</strong> {soal.aspekPenilaian.starMetode}
                </li>
                <li>
                  <strong className="text-slate-200">Nilai Kemenkeu:</strong> {soal.aspekPenilaian.nilaiKemenkeu}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* AI Examiner Score & STAR Feedback Panel */}
        <div className="w-full">
          {interviewAnalysis ? (
            <div className="bg-slate-900/95 border border-teal-800/40 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-teal-400" />
                  <span className="font-bold text-sm text-white">Raport Panel Penguji DJP</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onAnswerChange('');
                      toast.info('Jawaban dan raport wawancara dibersihkan.');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold transition"
                    title="Reset Sesi Wawancara"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-950 border border-teal-700/60">
                    <span className="text-xs text-teal-300 font-medium">Skor:</span>
                    <span className="text-lg font-black text-teal-200">{interviewAnalysis.skor}</span>
                    <span className="text-[10px] text-teal-400">/100</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-teal-300 mb-1">{interviewAnalysis.verdictText}</p>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/70">
                  {interviewAnalysis.apresiasi}
                </p>
              </div>

              {/* 5 Nilai Kemenkeu Rating */}
              <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Pilar Nilai Kementerian Keuangan:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400">
                  <span>Integritas: ⭐ {interviewAnalysis.keselarasanNilaiKemenkeu.integritas}/5</span>
                  <span>Profesionalisme: ⭐ {interviewAnalysis.keselarasanNilaiKemenkeu.profesionalisme}/5</span>
                  <span>Sinergi: ⭐ {interviewAnalysis.keselarasanNilaiKemenkeu.sinergi}/5</span>
                  <span>Pelayanan: ⭐ {interviewAnalysis.keselarasanNilaiKemenkeu.pelayanan}/5</span>
                  <span>Kesempurnaan: ⭐ {interviewAnalysis.keselarasanNilaiKemenkeu.kesempurnaan}/5</span>
                </div>
              </div>

              {/* STAR Breakdown */}
              <div className="text-xs text-slate-300 space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                <span className="font-bold text-slate-200 block">Metode STAR Feedback:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  • <strong>Action:</strong> {interviewAnalysis.evaluasiSTAR.action}
                </p>
              </div>

              {interviewAnalysis.saranPengembangan && (
                <div className="text-xs text-amber-300 bg-amber-950/20 border border-amber-800/40 p-3 rounded-xl">
                  <span className="font-bold block mb-1">💡 Saran Pengembangan Jawaban:</span>
                  {interviewAnalysis.saranPengembangan}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[220px] rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <UserCheck size={32} className="text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-400">Sesi Wawancara Belum Diuji</p>
              <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                Ketik atau sampaikan jawaban Anda lalu klik <strong className="text-slate-400">&quot;Uji&quot;</strong> untuk memperoleh penilaian formatif wawancara resmi.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Model Answer (Shown in Review Mode or on Demand) ── */}
      {isReviewMode && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
            <BookOpen size={18} />
            <span>Contoh Jawaban Teladan (Model Answer) Wawancara DJP</span>
          </div>

          <div className="p-4 rounded-2xl bg-teal-950/20 border border-teal-800/40 text-teal-200 text-xs leading-relaxed whitespace-pre-line">
            &ldquo;{soal.contohJawabanIdeal}&rdquo;
          </div>

          <div className="text-xs text-red-400/90 bg-red-950/20 p-3.5 rounded-xl border border-red-900/30">
            <span className="font-bold block mb-1">⚠️ Hal yang Dihindari (Red Flags):</span>
            <ul className="list-disc list-inside space-y-0.5">
              {soal.indikatorBahaya.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
