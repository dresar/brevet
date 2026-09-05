'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  RotateCcw,
  Volume2,
  Square,
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  RefreshCw, 
  Zap, 
  Send, 
  MessageSquare, 
  BookOpen, 
  HelpCircle,
  User,
  Bot,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { streamGeminiClient, streamGeminiChatClient, ChatMessage } from '@/lib/client-gemini';
import { speakText, stopSpeech } from '@/lib/chrome-speech';
import type { DJPSoalPG } from '@/lib/djp-types';

interface DjpAiQuestionTutorProps {
  soal: DJPSoalPG;
  userAnswer?: string;
}

interface FollowUpMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function DjpAiQuestionTutor({
  soal,
  userAnswer,
}: DjpAiQuestionTutorProps) {
  const [loading, setLoading] = useState(false);
  const [analysisHtml, setAnalysisHtml] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    if (!analysisHtml) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = analysisHtml;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    speakText(textContent, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Follow-up chat state
  const [chatMessages, setChatMessages] = useState<FollowUpMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset analysis when question changes
  useEffect(() => {
    setAnalysisHtml(null);
    setChatMessages([]);
    setInputQuestion('');
  }, [soal.id]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  const cleanHtml = (raw: string): string => {
    if (!raw) return '';
    let cleaned = raw.replace(new RegExp('^' + String.fromCharCode(96,96,96) + '(html)?', 'gi'), '');
    cleaned = cleaned.replace(new RegExp(String.fromCharCode(96,96,96) + '$', 'g'), '').trim();
    cleaned = cleaned.replace(/style="[^"]*color:s*(#333|#000|black|#111)[^"]*"/gi, '');
    cleaned = cleaned.replace(/color:s*(#333|#000|black|#111);?/gi, '');
    return cleaned;
  };

  const buildSystemPrompt = () => `
Kamu adalah "Prof. Widyaiswara Utama Pusdiklat Pajak / DJP Kemenkeu RI" — Instruktur Senior Pembuat Soal Ujian Masuk DJP & Brevet Pajak Nasional.
Kamu memiliki keahlian luar biasa dalam membedah soal-soal ujian CAT TKB Pajak, mengupas tuntas kenapa satu opsi menjadi jawaban yang paling benar dan kenapa opsi lainnya adalah pengecoh (distractor) yang salah.

TUGAS UTAMA:
Berikan KULIAH BEDAH MATERI LENGKAP & PEMAHAMAN MENDALAM tentang soal ujian ini dengan gaya bahasa yang SANGAT JELAS, EDUKATIF, SANTUN, SANTAI, dan MUDAH DIPAHAMI SIAPAPUN. Penjelasan WAJIB SANGAT PANJANG, RINCI, DAN KOMPREHENSIF (Minimal 800 - 1500 kata).

PEDOMAN FORMAT OUTPUT (WAJIB HTML BERSIH & DARK THEME FRIENDLY):
- Gunakan tag HTML semantik: <div class="space-y-4">, <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">, <p class="text-slate-200 leading-relaxed">, <h4 class="font-bold text-emerald-400">, <strong>, <span class="text-amber-300 font-mono">, <ul>, <li>.
- JANGAN GUNAKAN warna teks gelap (hitam/#333/#000) karena website menggunakan DARK THEME! Semua teks wajib terang dan kontras (text-slate-200, text-white, text-amber-300, text-emerald-400, text-cyan-300).
- JANGAN sertakan <!DOCTYPE html>, <html>, atau <body>.

STRUKTUR JAWABAN YANG WAJIB PANJANG & SISTEMATIS:
1. 🎯 <div class="kunci-box"> -> KUNCI JAWABAN BENAR & LOGIKA FUNDAMENTAL:
   Jelaskan secara gamblang mengapa jawaban yang tepat adalah opsi tersebut, apa konsep utama yang sedang diuji oleh pembuat soal, dan kenapa opsi ini 100% selaras dengan doktrin perpajakan.

2. 🍭 <div class="analogi-box"> -> ANALOGI SIMPEL ALA SEHARI-HARI:
   Buat perumpamaan yang asyik dan mudah dicerna (misal: urusan jual beli motor, titip belanja di pasar, tabungan keluarga, sewa ruko, dsb) sehingga logika dasarnya langsung nempel di kepala.

3. 🔍 <div class="bedah-opsi-box"> -> BEDAH TUNTAS SELURUH OPSI (A, B, C, D, E):
   Bedah setiap opsi satu per satu:
   - 🔘 OPSI A: [Teks Opsi] -> Analisis Kenapa Benar / Kenapa Salah (Trik pengecohnya di mana).
   - 🔘 OPSI B: [Teks Opsi] -> Analisis Kenapa Benar / Kenapa Salah.
   - 🔘 OPSI C: [Teks Opsi] -> Analisis Kenapa Benar / Kenapa Salah.
   - 🔘 OPSI D: [Teks Opsi] -> Analisis Kenapa Benar / Kenapa Salah.
   - 🔘 OPSI E: [Teks Opsi] -> Analisis Kenapa Benar / Kenapa Salah.

4. 📜 <div class="hukum-box"> -> KAJIAN REGULASI RESMI & PASAL-PASAL HUKUM:
   Sebutkan dan jelaskan pasal-pasal peraturan yang menjadi payung hukumnya (UU HPP No. 7/2021, UU KUP No. 28/2007, UU PPh No. 36/2008, UU PPN No. 42/2009, PP 58/2023, PMK terkait).

5. 💡 <div class="tips-box"> -> TIPS & TRIK MENJAWAB CEPAT SOAL CAT DJP:
   Berikan strategi taktis membaca kata kunci (*keyword clue*), pola jebakan (*trap pattern*), dan metode eliminasi kilat dalam 30 detik untuk soal sejenis.
`;

  const handleBedahSoal = async () => {
    setLoading(true);
    setAnalysisHtml('');
    setChatMessages([]);

    const opsiListStr = soal.pilihan.join('\n');

    const promptUser = `
Halo Prof Widyaiswara DJP! Tolong bedah secara mendalam materi soal ujian ini:

📌 KATEGORI SOAL: ${soal.kategori}
📌 TINGKAT KESULITAN: ${soal.tingkatKesulitan}

❓ PERTANYAAN SOAL:
${soal.pertanyaan}

📋 PILIHAN JAWABAN:
${opsiListStr}

🔑 KUNCI JAWABAN RESMI: Pilihan ${soal.jawabanKunci}
${userAnswer ? `👤 JAWABAN PESERTA SAAT INI: Pilihan ${userAnswer}\n` : ''}
${soal.landasanHukum ? `📜 DASAR HUKUM SOAL: ${soal.landasanHukum}\n` : ''}
${soal.pembahasan ? `📝 CATATAN PEMBAHASAN DASAR: ${soal.pembahasan}\n` : ''}

TUGAS ANDA:
Berikan kuliah bedah materi yang SANGAT PANJANG, MENDALAM, DAN DETAIL (Minimal 800 - 1500 kata) yang mencakup:
1. Logika kenapa kunci jawaban adalah ${soal.jawabanKunci}
2. Analogi sehari-hari yang mudah diingat
3. Bedah detail setiap opsi A, B, C, D, E (kenapa salah / jebakannya)
4. Landasan hukum resmi & pasal-pasal UU HPP/KUP/PPh/PPN
5. Tips & trik kilat menjawab soal serupa pada ujian CAT DJP
`;

    try {
      await streamGeminiClient({
        systemPrompt: buildSystemPrompt(),
        userPrompt: promptUser,
        maxOutputTokens: 6000,
        temperature: 0.4,
        onChunk: (text) => {
          setAnalysisHtml(cleanHtml(text));
        },
      });

      toast.success('Bedah materi & pemahaman soal AI berhasil disajikan!');
    } catch (err: unknown) {
      console.error('DJP Question Tutor error:', err);
      toast.error('Gagal memproses AI: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowUp = async (customText?: string) => {
    const question = customText || inputQuestion.trim();
    if (!question || chatLoading || !analysisHtml) return;

    const userMsg: FollowUpMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: question,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setChatLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    setChatMessages((prev) => [
      ...prev,
      { id: modelMsgId, role: 'model', text: '' },
    ]);

    const history: ChatMessage[] = [
      {
        role: 'user',
        text: `Berikut konteks soal ujian DJP:\nPertanyaan: ${soal.pertanyaan}\nPilihan: ${JSON.stringify(soal.pilihan)}\nKunci: ${soal.jawabanKunci}\nBedah Awal: ${analysisHtml.slice(0, 1500)}`,
      },
      {
        role: 'model',
        text: 'Saya sudah memahami seluruh konteks materi soal ujian DJP ini. Silakan tanyakan hal apa pun yang ingin diperdalam!',
      },
      ...chatMessages.map((m) => ({
        role: m.role,
        text: m.text,
      })),
    ];

    try {
      await streamGeminiChatClient({
        systemPrompt: buildSystemPrompt(),
        history,
        message: question,
        maxOutputTokens: 4000,
        temperature: 0.4,
        onChunk: (text) => {
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === modelMsgId ? { ...msg, text: cleanHtml(text) } : msg
            )
          );
        },
      });
    } catch (err: any) {
      toast.error('Gagal mengirim pertanyaan lanjutan: ' + err.message);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMsgId
            ? { ...msg, text: 'Maaf, terjadi kendala saat menjawab pertanyaan ini. Silakan coba lagi.' }
            : msg
        )
      );
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopyAnalysis = async () => {
    if (!analysisHtml) return;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = analysisHtml;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    toast.success('Teks bedah soal AI berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const quickPrompts = [
    'Kenapa opsi lain salah dan apa jebakannya?',
    'Bagaimana pasal hukum UU HPP mengatur kasus ini?',
    'Ada contoh kasus nyata di lapangan?',
    'Apa tips cepat mengenali soal ini dalam 30 detik?',
  ];

  return (
    <div className="pt-3 border-t border-slate-800/80 space-y-3.5 w-full">
      <button
        type="button"
        onClick={handleBedahSoal}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin text-cyan-300" />
        ) : (
          <GraduationCap size={16} className="text-yellow-300" />
        )}
        <span>
          {loading
            ? 'Memproses...'
            : 'Bedah Soal'}
        </span>
      </button>

      {analysisHtml !== null && (
        <div className="pt-4 space-y-4 animate-fade-in text-slate-200 border-t border-slate-800/80">
          {/* Header Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span>Penjelasan & Bedah Materi Soal</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAnalysisHtml(null);
                  setChatMessages([]);
                  stopSpeech();
                  setIsSpeaking(false);
                  toast.info('Pembahasan soal dibersihkan.');
                }}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition flex items-center justify-center gap-1.5"
                title="Reset Pembahasan Soal"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={handleToggleSpeech}
                className={"p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border transition flex items-center justify-center gap-1.5 " + (
                  isSpeaking
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700"
                )}
                title={isSpeaking ? "Hentikan Suara" : "Dengarkan Suara (Chrome Pria Indonesia)"}
              >
                {isSpeaking ? <Square size={13} className="fill-current text-rose-400" /> : <Volume2 size={14} />}
                <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Suara"}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyAnalysis}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Salin Teks Penjelasan"
              >
                <Copy size={12} />
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
              <button
                type="button"
                onClick={handleBedahSoal}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition"
                title="Bedah Ulang Soal"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                <span>Bedah Ulang</span>
              </button>
            </div>
          </div>

          {/* HTML Rendered Content */}
          <div 
            className="ai-analysis-content text-xs sm:text-sm text-slate-200 leading-relaxed font-sans space-y-4 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: analysisHtml || '<p class="text-slate-400 animate-pulse">Menyiapkan pembahasan soal...</p>' }}
          />

          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 pt-2 border-t border-slate-800/60 animate-pulse">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Sedang mengalirkan pembahasan komprehensif kata demi kata...</span>
            </div>
          )}

          {/* INTERACTIVE FOLLOW-UP CHAT ASSISTANT ("TANYA ULANG AI") */}
          {!loading && analysisHtml && (
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400">
                <MessageSquare size={16} />
                <span>Masih Ingin Memperdalam? Tanya Ulang AI Seputar Soal Ini:</span>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendFollowUp(q)}
                    disabled={chatLoading}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50 text-left"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>

              {/* Chat Thread Messages */}
              {chatMessages.length > 0 && (
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 max-h-96 overflow-y-auto">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 text-xs sm:text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'model' && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot size={13} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none ai-analysis-content'
                        }`}
                        dangerouslySetInnerHTML={{ __html: msg.text || (chatLoading ? '<span class="animate-pulse">Mengetik jawaban...</span>' : '') }}
                      />
                      {msg.role === 'user' && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <User size={13} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* Chat Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendFollowUp();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="Ketik pertanyaan lanjutan (misal: 'Kenapa opsi C salah?')..."
                  disabled={chatLoading}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputQuestion.trim()}
                  className="p-2.5 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-600/20"
                >
                  {chatLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={15} />
                      <span className="hidden sm:inline">Kirim</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
