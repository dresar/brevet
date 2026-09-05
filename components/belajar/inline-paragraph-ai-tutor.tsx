'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  RotateCcw,
  Sparkles, 
  Loader2, 
  Send, 
  Copy, 
  RefreshCw, 
  Volume2, 
  Square, 
  MessageSquare, 
  X, 
  Bot, 
  User, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { streamGeminiClient, streamGeminiChatClient, ChatMessage } from '@/lib/client-gemini';
import { speakText, stopSpeech } from '@/lib/chrome-speech';

interface InlineParagraphAiTutorProps {
  paragraphText: string;
  sectionTitle: string;
  moduleSlug?: string;
  onClose: () => void;
}

interface ChatItem {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function InlineParagraphAiTutor({
  paragraphText,
  sectionTitle,
  moduleSlug,
  onClose,
}: InlineParagraphAiTutorProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  // Let the user freely scroll without fighting auto-scroll

  const cleanHtml = (raw: string): string => {
    if (!raw) return '';
    let cleaned = raw.replace(new RegExp('^' + String.fromCharCode(96,96,96) + '(html)?', 'gi'), '');
    cleaned = cleaned.replace(new RegExp(String.fromCharCode(96,96,96) + '$', 'g'), '').trim();
    cleaned = cleaned.replace(/style="[^"]*color:s*(#333|#000|black|#111)[^"]*"/gi, '');
    cleaned = cleaned.replace(/color:s*(#333|#000|black|#111);?/gi, '');
    return cleaned;
  };

  const buildSystemPrompt = () => `
Kamu adalah "Tutor Ahli Brevet Pajak AB & Konsultan Senior".
Kamu bertugas menjelaskan dan membedah secara mendalam paragraf materi yang sedang dipelajari siswa.

TUGAS UTAMA:
1. Jawab pertanyaan siswa dengan mengaitkannya langsung ke konteks isi paragraf terpilih dan materi sub-bab "${sectionTitle}".
2. Berikan penjelasan yang SANGAT JELAS, EDUKATIF, NON-FORMAL, LENGKAP, dan MUDAH DIPAHAMI.
3. Berikan analogi simpel sehari-hari, pasal aturan hukum resmi (UU HPP No. 7/2021, UU KUP, UU PPh, UU PPN, PMK), serta contoh kasus nyata di kantor/bisnis.

PEDOMAN FORMAT OUTPUT (WAJIB HTML BERSIH & DARK THEME FRIENDLY):
- Gunakan tag semantik HTML: <div class="space-y-3">, <div class="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">, <p class="text-slate-200 leading-relaxed">, <h4 class="font-bold text-emerald-400">, <strong>, <span class="text-amber-300 font-mono">, <ul>, <li>.
- JANGAN gunakan teks gelap (#333/#000/black) karena latar belakang gelap. Gunakan teks terang (text-slate-200, text-white, text-amber-300, text-emerald-400, text-cyan-300).
- JANGAN sertakan <!DOCTYPE html>, <html>, atau <body>.
`;

  const handleAskAi = async (customPrompt?: string) => {
    const activePrompt = customPrompt || question.trim();
    if (!activePrompt || loading) return;

    const userMsgId = Date.now().toString();
    const userMsg: ChatItem = {
      id: userMsgId,
      role: 'user',
      text: activePrompt,
    };

    const modelMsgId = (Date.now() + 1).toString();
    setChatMessages((prev) => [
      ...prev,
      userMsg,
      { id: modelMsgId, role: 'model', text: '' },
    ]);

    setQuestion('');
    setLoading(true);

    const history: ChatMessage[] = [
      {
        role: 'user',
        text: `Berikut konteks materi yang sedang dipelajari:\nSub-Bab: "${sectionTitle}"\nParagraf Pilihan: "${paragraphText}"`,
      },
      {
        role: 'model',
        text: 'Saya sudah memahami konteks paragraf materi ini secara penuh. Silakan ajukan pertanyaan!',
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
        message: activePrompt,
        maxOutputTokens: 4000,
        temperature: 0.4,
        onChunk: (streamedText) => {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === modelMsgId ? { ...m, text: cleanHtml(streamedText) } : m
            )
          );
        },
      });
    } catch (err: any) {
      console.error('Inline AI Tutor error:', err);
      toast.error('Gagal memproses AI: ' + err.message);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === modelMsgId
            ? { ...m, text: '<p class="text-rose-400">Maaf, terjadi kendala saat menjawab pertanyaan ini. Silakan coba kembali.</p>' }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    toast.success('Jawaban AI disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    speakText(textContent, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const quickPrompts = [
    'Jelaskan maksud paragraf ini dengan analogi simpel',
    'Apa dasar hukum & pasal resmi dari aturan ini?',
    'Bagaimana contoh kasus nyata di lapangan/kantor?',
    'Kalau ada pertanyaan ujian tentang ini, cara jawabnya gimana?',
  ];

  return (
    <div className="mt-3.5 p-4 sm:p-5 rounded-2xl bg-[#091124] border border-blue-500/50 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm">
          <Sparkles size={16} className="text-yellow-400 animate-pulse" />
          <span>Tutor Pintar Paragraf</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setChatMessages([]);
            stopSpeech();
            setIsSpeaking(false);
            toast.info('Sesi tanya AI dibersihkan.');
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition"
          title="Reset Sesi Diskusi"
        >
          <RotateCcw size={12} />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={() => {
            stopSpeech();
            onClose();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Tutup AI Paragraf"
        >
          <X size={16} />
        </button>
      </div>

      {/* Selected Paragraph Quote Pill */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs text-slate-300 leading-relaxed">
        <span className="font-bold text-blue-400 block mb-1">📌 Paragraf Terpilih ({sectionTitle}):</span>
        <p className="italic text-slate-400 line-clamp-3">"{paragraphText.replace(/<[^>]*>/g, '')}"</p>
      </div>

      {/* Quick Suggestion Chips */}
      {chatMessages.length === 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-slate-400">Pilih pertanyaan cepat atau ketik sendiri:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAi(q)}
                disabled={loading}
                className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition disabled:opacity-50 text-left"
              >
                💬 {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Thread Messages */}
      {chatMessages.length > 0 && (
        <div className="space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 text-xs sm:text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow">
                  <Bot size={13} className="text-white" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl w-full max-w-none leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none ai-analysis-content shadow-xl'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: msg.text || (loading ? '<span class="text-cyan-400 animate-pulse">Sedang menganalisis materi...</span>' : ''),
                  }}
                />

                {/* Model message actions: Copy & Voice */}
                {msg.role === 'model' && msg.text && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleSpeak(msg.text)}
                      className={"flex items-center gap-1 px-2 py-1 rounded-lg border transition " + (
                        isSpeaking
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse"
                          : "bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700"
                      )}
                      title={isSpeaking ? "Hentikan Suara" : "Dengarkan Jawaban (Suara Pria Indonesia)"}
                    >
                      {isSpeaking ? <Square size={11} className="fill-current text-rose-400" /> : <Volume2 size={12} />}
                      <span>{isSpeaking ? "Stop" : "Suara"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title="Salin Teks"
                    >
                      <Copy size={11} />
                      <span>{copied ? "Tersalin" : "Salin"}</span>
                    </button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow">
                  <User size={13} className="text-white" />
                </div>
              )}
            </div>
          ))}
          
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAskAi();
        }}
        className="flex items-center gap-2 pt-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ketik pertanyaan seputar paragraf di atas..."
          disabled={loading}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="p-2.5 sm:px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-600/25"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin text-cyan-300" />
          ) : (
            <>
              <Send size={14} />
              <span className="hidden sm:inline">Tanya</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
