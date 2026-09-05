'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  Scale,
  Award,
  Volume2,
  Square,
  Copy,
  Check,
  RotateCcw,
  Send,
  MessageSquare,
  User,
  Bot,
  Trash2,
  Zap,
} from 'lucide-react';
import type { DJPSoalEsai, EssayAIAnalysis } from '@/lib/djp-types';
import { streamGeminiClient, streamGeminiChatClient, ChatMessage } from '@/lib/client-gemini';
import { speakText, stopSpeech } from '@/lib/chrome-speech';
import { toast } from 'sonner';

interface DJPEssayWorkspaceProps {
  soal: DJPSoalEsai;
  userAnswer: string;
  onAnswerChange: (newAnswer: string) => void;
  essayAnalysis?: EssayAIAnalysis;
  onSaveAnalysis: (analysis: EssayAIAnalysis) => void;
  isReviewMode?: boolean;
}

interface FollowUpMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function DJPEssayWorkspace({
  soal,
  userAnswer,
  onAnswerChange,
  essayAnalysis,
  onSaveAnalysis,
  isReviewMode = false,
}: DJPEssayWorkspaceProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRubrik, setShowRubrik] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // HTML Output state
  const [htmlOutput, setHtmlOutput] = useState<string>('');

  // Follow-up chat state
  const [chatMessages, setChatMessages] = useState<FollowUpMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Reset analysis & chat when question changes
  useEffect(() => {
    setHtmlOutput('');
    setChatMessages([]);
    setInputQuestion('');
    setIsPlayingAudio(false);
    stopSpeech();
  }, [soal.id]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  const cleanHtml = (raw: string): string => {
    if (!raw) return '';
    let cleaned = raw.replace(/^[`]{3}(html)?/gi, '').replace(/[`]{3}$/g, '').trim();
    cleaned = cleaned.replace(/style="[^"]*color:s*(#333|#000|black|#111)[^"]*"/gi, '');
    cleaned = cleaned.replace(/color:s*(#333|#000|black|#111);?/gi, '');
    return cleaned;
  };

  const handleResetAnswer = () => {
    onAnswerChange('');
    setHtmlOutput('');
    setChatMessages([]);
    stopSpeech();
    setIsPlayingAudio(false);
    toast.info('Lembar jawaban dan analisis telah direset bersih.');
  };

  const handleEvaluateAI = async () => {
    if (!userAnswer || userAnswer.trim().length < 3) {
      toast.error('Ketikkan jawaban Anda terlebih dahulu (walaupun singkat atau bilang belum paham).');
      return;
    }

    setIsAnalyzing(true);
    setHtmlOutput('');
    setChatMessages([]);
    toast.info('Kakak Penguji AI DJP sedang membedah jawaban esai Anda secara live...');

    const systemPrompt = `Kamu adalah "Kakak Pembina & Penguji Ahli Pajak DJP Kemenkeu RI" yang SUPER ASIK, GAUL, LUCU, PENUH CANDAAN TAPI ILMUNYA DAGING SEMUA (SUPER TAJAM, AKURAT, DAN EDUKATIF).
Tugasmu adalah membedah dan menilai jawaban studi kasus esai perpajakan dari peserta ujian masuk DJP / Brevet AB.

DATA KASUS & SOAL:
- Judul Kasus: "${soal.judulKasus || 'Studi Kasus Pajak'}"
- Skenario Kasus: "${soal.skenario || '-'}"
- Pertanyaan Ujian: "${soal.pertanyaan}"
- Landasan Hukum Utama: "${soal.landasanHukum || '-'}"
- Kunci Jawaban Model Resmi: "${soal.jawabanKunci}"
- Rubrik Poin Penting: ${JSON.stringify(soal.rubrikPoinPenting || [])}
- Jawaban Peserta Ujian: "${userAnswer}"

PETUNJUK EVALUASI & GAYA BAHASA:
1. GAYA BAHASA SUPER NON-FORMAL, SANTAI, BANYAK EMOJI & CANDAAN SEGAR:
   - Gunakan sapaan akrab ("Halo Sobat Pajak!", "Waduh santai bro/sis!", "Gini lho ceritanya...", "Keren abis!", "Yuk kita kuliti bareng!").
   - Sisipkan analogi kocak kehidupan sehari-hari (misal: traktiran pacar vs biaya entertainment kantor, jajan seblak tanpa struk, bos minta reimburse bon kosong, dll).
   - Banyak emoji: 🔥, 💡, ⚖️, 🎯, 🚀, 💰, 😂, 👏, ☕, 📌, 📜.
2. JIKA PESERTA MENJAWAB "TIDAK TAHU" / SINGKAT / SALAH:
   - Jangan bikin peserta down! Berikan respon lucu & hangat ("Hehe gapapa banget bro! Kejujuran nomor 1 di DJP! Yang penting habis ini kamu langsung jadi suhu perpajakan!").
   - Berikan skor apresiasi (misal 15-25).
   - Lalu JELASKAN DARI DASAR SAMPAI TINGKAT MASTER SECARA SANGAT PANJANG, LENGKAP, DAN EDUKATIF!
3. JIKA PESERTA MENJAWAB MENDEKATI / BENAR:
   - Beri pujian meriah ("Gokil, calon Pemeriksa Pajak Masa Depan nih!"), berikan skor tinggi (70-100), lalu sempurnakan dengan analisis pasal yang lebih tajam.
4. BEDAH HUKUM SANGAT PANJANG & DETAIL:
   - Sebutkan UU HPP No. 7/2021, UU PPh Pasal 4, Pasal 6 ayat (1), Pasal 9 ayat (1), UU KUP, PMK terkait.
   - Jelaskan konsep Deductible Expense (3M: Mendapatkan, Menagih, Memelihara) vs Non-Deductible Expense.
   - Tunjukkan perhitungan angka koreksi fiskal positif/negatif dan rekomendasi tindakan resmi Pemeriksa Pajak (SKP, denda, himbauan).

FORMAT OUTPUT WAJIB 100% KODE HTML MURNI TANPA CODEBLOCK DENGAN STRUKTUR BERIKUT:

<div class="space-y-6">
  <!-- Card Header Skor & Verdict -->
  <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🎯</span>
        <span class="text-xs font-bold uppercase tracking-wider text-purple-300">Hasil Evaluasi Penguji DJP</span>
      </div>
      <h3 class="text-base sm:text-lg font-black text-white">[Tuliskan Verdict Lucu, Santai, & Ber-Emoji]</h3>
    </div>
    <div class="px-5 py-3 rounded-2xl bg-purple-900/50 border border-purple-400/40 text-center shrink-0 w-full sm:w-auto">
      <span class="text-xs text-purple-300 block font-semibold">Skor Analisis:</span>
      <span class="text-3xl font-black text-yellow-300 font-mono">[ANGKA SKOR 0-100]<span class="text-sm text-purple-300">/100</span></span>
    </div>
  </div>

  <!-- Card Apresiasi & Review Jawaban Kamu -->
  <div class="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-slate-100 space-y-2">
    <h4 class="text-sm font-bold text-emerald-400 flex items-center gap-2">
      <span>💎</span> Bedah Jawaban Kamu:
    </h4>
    <p class="text-sm leading-relaxed text-slate-200">[Ulas jawaban peserta secara ramah, penuh canda tapi edukatif]</p>
  </div>

  <!-- Card Poin Jebakan / Hal Penting -->
  <div class="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-slate-100 space-y-2">
    <h4 class="text-sm font-bold text-amber-400 flex items-center gap-2">
      <span>💡</span> Poin Kunci & Jebakan Ujian DJP:
    </h4>
    <p class="text-sm leading-relaxed text-slate-200">[Sebutkan hal-hal krusial yang sering bikin salah tafsir di lapangan]</p>
  </div>

  <!-- Card Jawaban Ideal & Kuliah Bedah Hukum Super Panjang -->
  <div class="p-6 rounded-3xl bg-slate-900/90 border border-blue-500/40 shadow-xl space-y-4">
    <h4 class="text-base font-bold text-blue-400 flex items-center gap-2 border-b border-slate-800 pb-3">
      <span>⚖️</span> Kuliah Bedah Kasus & Jawaban Ideal Pemeriksa Pajak (Super Lengkap):
    </h4>
    
    <div class="text-sm text-slate-200 leading-relaxed space-y-3 font-sans">
      <div class="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-1">
        <h5 class="font-bold text-blue-300 text-xs uppercase tracking-wider">📌 1. Inti Masalah & Logika Sederhana</h5>
        <p>[Penjelasan konsep inti dengan analogi santai]</p>
      </div>
      
      <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
        <h5 class="font-bold text-emerald-300 text-xs uppercase tracking-wider">📜 2. Dasar Hukum & Pasal Sakti</h5>
        <p>[Sebutkan pasal-pasal UU HPP/PPh/KUP/PMK terkait]</p>
      </div>

      <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
        <h5 class="font-bold text-yellow-300 text-xs uppercase tracking-wider">💰 3. Simulasi Hitungan & Koreksi Fiskal</h5>
        <p>[Uraikan koreksi fiskal positif/negatif dan dampak tarif pajaknya]</p>
      </div>

      <div class="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-1">
        <h5 class="font-bold text-purple-300 text-xs uppercase tracking-wider">🚀 4. Langkah Konkret Tindakan Fiskus</h5>
        <p>[Rekomendasi tindakan penagihan/pemeriksaan sebagai aparatur DJP]</p>
      </div>
    </div>
  </div>
</div>`;

    try {
      let accumulated = '';
      await streamGeminiClient({
        systemPrompt,
        prompt: 'Silakan berikan evaluasi mendalam dalam format HTML lengkap di atas.',
        maxOutputTokens: 6000,
        temperature: 0.3,
        onChunk: (text) => {
          accumulated = cleanHtml(text);
          setHtmlOutput(accumulated);
        },
      });

      const scoreMatch = accumulated.match(/(\d{1,3})\s*<span[^>]*>\/100/i) || accumulated.match(/Skor[^:]*:\s*(\d{1,3})/i);
      const parsedScore = scoreMatch ? parseInt(scoreMatch[1], 10) : 75;

      const analysisObj: EssayAIAnalysis = {
        skor: isNaN(parsedScore) ? 75 : parsedScore,
        status: parsedScore >= 80 ? 'sesuai' : parsedScore >= 50 ? 'cukup' : 'kurang',
        verdictText: 'Evaluasi AI Selesai',
        apresiasi: 'Analisis tersimpan',
        perbaikan: '',
        penjelasanDetail: accumulated,
        analisisPoinHukum: [],
      };

      onSaveAnalysis(analysisObj);
      toast.success('Evaluasi selesai! Hasil bedah materi siap dipelajari.');

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err: any) {
      console.error('Error in in-browser essay evaluate call:', err);
      toast.error('Gagal mengevaluasi esai: ' + (err.message || 'Error AI'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Follow-Up Chat Sender
  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputQuestion.trim();
    if (!q || chatLoading) return;

    const userMsgId = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();

    const newHistory: FollowUpMessage[] = [
      ...chatMessages,
      { id: userMsgId, role: 'user', text: q },
      { id: assistantMsgId, role: 'model', text: '' },
    ];

    setChatMessages(newHistory);
    setInputQuestion('');
    setChatLoading(true);

    const systemPrompt = `Kamu adalah "Kakak Pembina & Penguji Ahli Pajak DJP Kemenkeu RI" yang SUPER ASIK, GAUL, RAMAH, DAN LUCU.
Peserta sedang menanyakan hal lanjutan terkait soal studi kasus esai perpajakan ini.

KONTEKS KASUS:
- Judul Kasus: "${soal.judulKasus}"
- Skenario: "${soal.skenario}"
- Pertanyaan Ujian: "${soal.pertanyaan}"
- Jawaban Model Resmi: "${soal.jawabanKunci}"
- Landasan Hukum: "${soal.landasanHukum}"
- Jawaban Peserta: "${userAnswer}"

ATURAN MENJAWAB CHAT:
1. Jawab pertanyaan peserta dengan gaya bahasa santai, non-formal, penuh analogi sederhana, dan emoji.
2. Jelaskan dengan lugas dan tuntas agar peserta langsung paham tanpa kebingungan.
3. Berikan contoh kasus nyata jika ditanyakan.`;

    const chatHistoryForAi: ChatMessage[] = chatMessages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      await streamGeminiChatClient({
        systemPrompt,
        history: chatHistoryForAi,
        message: q,
        maxOutputTokens: 3000,
        temperature: 0.3,
        onChunk: (streamedText) => {
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, text: streamedText } : msg
            )
          );
        },
      });
    } catch (err: any) {
      console.error('Follow-up chat error:', err);
      toast.error('Gagal mengirim pertanyaan lanjutan: ' + (err.message || 'Error AI'));
    } finally {
      setChatLoading(false);
    }
  };

  const handleToggleSpeech = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    if (!htmlOutput) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlOutput;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    setIsPlayingAudio(true);
    speakText(
      textContent,
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const handleCopy = () => {
    if (!htmlOutput) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlOutput;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    toast.success('Teks evaluasi disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = userAnswer ? userAnswer.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-6">
      {/* ── 1. Case Study Scenario Card (Full Width) ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center gap-1.5">
            <Scale size={13} />
            Studi Kasus Pemeriksaan & Sengketa Pajak
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Tingkat: {soal.tingkatKesulitan}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          {soal.judulKasus}
        </h3>

        {/* Narrative Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 mb-5 text-sm text-slate-200 leading-relaxed font-sans">
          <p className="whitespace-pre-line">{soal.skenario}</p>
        </div>

        {/* The Exact Question */}
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-blue-200 text-sm">
          <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
            <FileText size={16} />
            Pertanyaan Analisis Penguji:
          </div>
          <p className="font-medium">{soal.pertanyaan}</p>
        </div>
      </div>

      {/* ── 2. Answer Input Workspace (Full Width, No Empty Columns) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <FileText size={16} className="text-purple-400" />
            Lembar Jawaban Analisis Peserta
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {wordCount} Kata | {userAnswer.length} Karakter
            </span>
            {userAnswer && !isReviewMode && (
              <button
                type="button"
                onClick={handleResetAnswer}
                className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
                title="Hapus / Reset Jawaban"
              >
                <Trash2 size={13} />
                <span>Hapus</span>
              </button>
            )}
          </div>
        </div>

        <textarea
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          disabled={isReviewMode || isAnalyzing}
          placeholder="Tuliskan analisis atau jawaban Anda di sini... (Boleh santai, sebutkan pasal, perhitungan, atau jika belum paham sampaikan saja agar AI membedah tuntas untuk Anda)."
          className="w-full h-44 sm:h-52 p-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm text-slate-100 placeholder:text-slate-500 resize-none outline-none leading-relaxed transition-all"
        />

        {!isReviewMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowRubrik(!showRubrik)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <HelpCircle size={14} />
              <span>{showRubrik ? 'Sembunyikan' : 'Lihat'} Rubrik Poin Kunci</span>
            </button>

            <button
              type="button"
              onClick={handleEvaluateAI}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/25 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-yellow-300" />
                  <span>Evaluasi</span>
                </>
              )}
            </button>
          </div>
        )}

        {showRubrik && (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs space-y-2 animate-fade-in">
            <span className="font-bold text-slate-300">Rubrik Kunci yang Dinilai Penguji:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              {soal.rubrikPoinPenting.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── 3. LIVE STREAMING HTML VIEWS (Full Width Di Bawahnya, 100% Layar Bersih) ── */}
      {(isAnalyzing || htmlOutput) && (
        <div ref={resultRef} className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles size={18} className="text-yellow-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isAnalyzing ? 'Sedang Memproses Analisis...' : 'Hasil Evaluasi Penguji Ahli:'}
              </span>
            </div>

            {htmlOutput && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHtmlOutput('');
                    setChatMessages([]);
                    stopSpeech();
                    setIsPlayingAudio(false);
                    toast.info('Hasil evaluasi AI dibersihkan.');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold transition"
                  title="Reset / Hapus Hasil Evaluasi AI"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 text-xs font-semibold transition"
                  title={isPlayingAudio ? 'Hentikan Suara' : 'Dengarkan Pembahasan'}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square size={13} className="fill-current text-rose-400" />
                      <span>Stop Suara</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={13} />
                      <span>Dengar Suara</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                  title="Salin Hasil Pembahasan"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>

          {/* Rendered Direct HTML Output */}
          <div
            className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-2xl relative overflow-hidden"
            dangerouslySetInnerHTML={{ __html: htmlOutput }}
          />

          {/* ── 4. Interactive Follow-Up Chat Box ("Tanya Lanjutan ke Penguji AI") ── */}
          {htmlOutput && !isAnalyzing && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <MessageSquare size={18} />
                  <span className="text-sm font-bold text-white">
                    Tanya Lanjutan ke Kakak Penguji AI
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Masih bingung? Tanyakan apa saja seputar kasus ini!
                </span>
              </div>

              {/* Chat messages list */}
              {chatMessages.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-purple-950/40 border border-purple-800/50 text-purple-100 ml-4'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 mr-4'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-slate-800 text-slate-300">
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-purple-400" />}
                      </div>
                      <div className="flex-1 whitespace-pre-line">
                        {msg.text || (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Loader2 size={13} className="animate-spin text-purple-400" />
                            <span>Kakak AI sedang mengetik penjelasan...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* Input follow-up form */}
              <form onSubmit={handleSendFollowUp} className="flex gap-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  disabled={chatLoading}
                  placeholder="Ketik pertanyaan lanjutan... (misal: 'Kak, kalau daftar nominatif terlambat dibuat apa sanksinya?')"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || chatLoading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shrink-0"
                >
                  {chatLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Tanya</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── 5. Official Model Answer (Review Mode) ── */}
      {isReviewMode && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <BookOpen size={18} />
            <span>Kunci Jawaban Model & Pembahasan Resmi DJP</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-200 text-xs leading-relaxed whitespace-pre-line">
            {soal.jawabanKunci}
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Landasan Hukum Resmi:</span>
            <p className="font-mono text-[11px] text-blue-400">{soal.landasanHukum}</p>
          </div>
        </div>
      )}
    </div>
  );
}
