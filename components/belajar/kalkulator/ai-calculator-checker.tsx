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
  User,
  Bot
} from 'lucide-react';
import { toast } from 'sonner';
import { streamGeminiClient, streamGeminiChatClient, ChatMessage } from '@/lib/client-gemini';
import { speakText, stopSpeech } from '@/lib/chrome-speech';

interface AiCalculatorCheckerProps {
  namaKalkulator: string;
  inputData: Record<string, string>;
  hasilData: Record<string, string>;
  rumus?: string;
}

interface FollowUpMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function AiCalculatorChecker({
  namaKalkulator,
  inputData,
  hasilData,
  rumus,
}: AiCalculatorCheckerProps) {
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
Kamu adalah "Prof. Dr. Pajak AI" — Pakar Konsultan Pajak Senior & Instruktur Utama Brevet AB Indonesia.
Kamu memiliki keahlian luar biasa dalam membedah konsep pajak yang rumit menjadi SANGAT MENDALAM, KOMPREHENSIF, STEP-BY-STEP, namun disampaikan dengan BAHASA YANG SANTAI, ASYIK, MENYENANGKAN, dan SUPER MUDAH DIMENGERTI PEMULA / ORANG AWAM.

TUGAS UTAMA:
Bukan hanya sekadar memeriksa angka, melainkan MEMBERIKAN PEMAHAMAN LENGKAP & KULIAH BEDAH MATERI MENYELURUH tentang kenapa perhitungan ini menghasilkan angka tersebut, bagaimana alur perpajakannya di dunia nyata, dan aturan hukum yang mengaturnya.

PEDOMAN FORMAT OUTPUT (WAJIB HTML BERSIH, BEBAS KOTAK GARIS BERLAPIS & FULL WIDTH):
- JANGAN MEMBUAT KOTAK/CARD BERGARIS (NO BORDER BOXES, NO BORDER LINES). Teks harus mengalir bersih dari tepi ke tepi tanpa sekat garis berlapis agar sangat luas dan nyaman dibaca di layar HP/Android.
- Gunakan struktur tipografi yang bersih:
  • Judul bagian: <h3 class="text-sm sm:text-base font-bold text-emerald-400 mt-4 mb-1.5 flex items-center gap-1.5">...</h3>
  • Paragraf: <p class="text-slate-200 leading-relaxed mb-3 text-xs sm:text-sm">...</p>
  • Penekanan penting: <strong class="text-sky-300 font-bold">...</strong>, <span class="text-amber-300 font-mono">...</span>
  • List / Poin: <ul class="list-disc pl-4 space-y-1 text-slate-300 text-xs sm:text-sm mb-3"><li>...</li></ul>
- JANGAN GUNAKAN warna teks gelap (hitam/#333/#000).
- JANGAN gunakan tag <!DOCTYPE html>, <html>, atau <body>.

STRUKTUR JAWABAN YANG LENGKAP & MENDALAM:
1. 🎓 LOGIKA DASAR & ALASAN PERHITUNGAN:
   Jelaskan esensi objek pajak, kenapa dikenakan tarif tersebut, makna DPP/PKP/Bruto, dan kenapa nilainya sebesar itu.

2. 🍭 ANALOGI REALISTIS SEHARI-HARI:
   Buat perumpamaan simpel sehari-hari agar pemula langsung paham tanpa kebingungan.

3. 🧮 LANGKAH BEDAH MATEMATIKA DARI HULU KE HILIR:
   Uraikan tahap demi tahap perhitungan angka dengan rumus jelas.

4. 🏢 PENERAPAN DI DUNIA USAHA & KANTOR (ALUR NYATA):
   Jelaskan pencatatan pembukuan, penerbitan Faktur Pajak/Bukti Potong, dan mekanisme penyetoran/pengkreditan.

5. 📜 KAJIAN REGULASI RESMI & PASAL ATURAN:
   Sebutkan pasal hukum terkait (UU HPP No. 7/2021, PP 58/2023, PMK 168/2023, UU KUP/PPh/PPN) serta batas waktu setor & lapor SPT.

6. 💡 TIPS STRATEGIS EFISIENSI PAJAK (TAX PLANNING LEGAL):
   Berikan panduan kepatuhan perpajakan yang aman dan bebas sanksi.
`;

  const handleVerifyWithAi = async () => {
    setLoading(true);
    setAnalysisHtml('');
    setChatMessages([]);

    const inputListStr = Object.entries(inputData)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    const hasilListStr = Object.entries(hasilData)
      .map(([k, v]) => `• ${k}: ${v}`)
      .join('\n');

    const promptUser = `
Halo Prof AI! Tolong berikan PEMAHAMAN MENDALAM & BEDAH MATERI LENGKAP tentang perhitungan pajak berikut ini:

📌 NAMA KALKULATOR: ${namaKalkulator}

📥 DATA INPUT:
${inputListStr}

📊 HASIL PERHITUNGAN:
${hasilListStr}

${rumus ? `📐 RUMUS TEKNIS:\n${rumus}\n` : ''}

MOHON JELASKAN SECARA SANGAT LENGKAP, PANJANG, MENDALAM, DAN EDUKATIF (Minimal 800-1500 kata penjelasan) mencakup:
1. Logika kenapa angkanya bisa segitu
2. Analogi seru sehari-hari
3. Bedah matematika bertahap
4. Alur praktik di dunia bisnis & kantor
5. Landasan hukum & pasal-pasal UU HPP/PMK
6. Tips praktis wajib pajak
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

      toast.success('Pemahaman & Bedah Pajak AI berhasil disajikan!');
    } catch (err: unknown) {
      console.error('Client stream error:', err);
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
        text: `Berikut konteks perhitungan ${namaKalkulator}:\nInput: ${JSON.stringify(inputData)}\nHasil: ${JSON.stringify(hasilData)}\nAnalisis Awal: ${analysisHtml.slice(0, 1500)}`,
      },
      {
        role: 'model',
        text: 'Saya sudah memahami seluruh konteks perhitungan dan materi pajak ini. Silakan ajukan pertanyaan lanjutan apa pun!',
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
    toast.success('Teks penjelasan AI berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const quickPrompts = [
    'Bagaimana jika transaksi ini belum termasuk PPN?',
    'Kapan batas waktu pembayaran dan pelaporan SPT-nya?',
    'Apakah pajak ini bisa dikreditkan di SPT Tahunan?',
    'Bagaimana cara menerbitkan Faktur Pajak / Bukti Potongnya?',
  ];

  return (
    <div className="mt-4 pt-3.5 border-t border-slate-800/80 space-y-4 w-full">
      <button
        type="button"
        onClick={handleVerifyWithAi}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin text-cyan-300" />
        ) : (
          <BookOpen size={18} className="text-yellow-300" />
        )}
        <span>
          {loading
            ? 'Memproses...'
            : 'Bedah Perhitungan'}
        </span>
      </button>

      {analysisHtml !== null && (
        <div className="mt-4 pt-5 pb-8 space-y-5 animate-in fade-in slide-in-from-top-3 duration-300 text-slate-200 border-t border-indigo-500/30 bg-slate-950/70 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5 text-blue-400 font-bold text-xs sm:text-sm">
              <ShieldCheck size={20} className="text-emerald-400" />
              <span>Bedah & Analisis Perhitungan Pajak</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAnalysisHtml(null);
                  setChatMessages([]);
                  stopSpeech();
                  setIsSpeaking(false);
                  toast.info('Hasil analisis dibersihkan.');
                }}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition flex items-center justify-center gap-1.5"
                title="Reset Hasil Analisis"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="Salin Teks Penjelasan"
              >
                <Copy size={13} />
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
              <button
                type="button"
                onClick={handleVerifyWithAi}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition"
                title="Hitung Ulang Analisis"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Bedah Ulang</span>
              </button>
            </div>
          </div>

          {/* HTML Rendered Content */}
          <div 
            className="ai-analysis-content text-xs sm:text-sm text-slate-200 leading-relaxed font-sans space-y-4 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: analysisHtml || '<p class="text-slate-400 animate-pulse">Menyiapkan analisis perhitungan...</p>' }}
          />

          {loading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 pt-2 border-t border-slate-800/60 animate-pulse">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>Sedang menulis analisis komprehensif langsung kata demi kata...</span>
            </div>
          )}

          {/* INTERACTIVE FOLLOW-UP CHAT ASSISTANT ("TANYA ULANG AI") */}
          {!loading && analysisHtml && (
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400">
                <MessageSquare size={16} />
                <span>Masih Bingung? Tanya Ulang AI Seputar Perhitungan Ini:</span>
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
                  placeholder="Ketik pertanyaan lanjutan untuk AI (misal: 'Kenapa tarifnya 12%?')..."
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
