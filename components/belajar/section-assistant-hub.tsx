'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  RotateCcw,
  Volume2, 
  Square, 
  Sparkles, 
  Send, 
  Copy, 
  Bot, 
  User, 
  Layers, 
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { speakText, stopSpeech, readFullModulePlaylist } from '@/lib/chrome-speech';
import { streamGeminiChatClient, ChatMessage } from '@/lib/client-gemini';

interface SectionAssistantHubProps {
  sectionTitle: string;
  paragraphs: string[];
  moduleSlug?: string;
  isOffline?: boolean;
  selectedParagraphIndex: number | null;
  onSelectParagraph: (index: number | null) => void;
}

interface ChatItem {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function SectionAssistantHub({
  sectionTitle,
  paragraphs,
  moduleSlug,
  isOffline,
  selectedParagraphIndex,
  onSelectParagraph,
}: SectionAssistantHubProps) {
  const activeTab = selectedParagraphIndex === null ? -1 : selectedParagraphIndex;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatItem[]>([]);
  const [isSpeakingAi, setIsSpeakingAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const cancelPlaylistRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const cleanHtml = (raw: string): string => {
    if (!raw) return '';
    let cleaned = raw.replace(new RegExp('^' + String.fromCharCode(96,96,96) + '(html)?', 'gi'), '');
    cleaned = cleaned.replace(new RegExp(String.fromCharCode(96,96,96) + '$', 'g'), '').trim();
    cleaned = cleaned.replace(/style="[^"]*color:\s*(#333|#000|black|#111)[^"]*"/gi, '');
    cleaned = cleaned.replace(/color:\s*(#333|#000|black|#111);?/gi, '');
    return cleaned;
  };

  const getActiveText = (): string => {
    if (activeTab === -1) {
      return sectionTitle + '. ' + paragraphs.map((p) => p.replace(/<[^>]*>/g, '')).join(' ');
    }
    return (paragraphs[activeTab] || '').replace(/<[^>]*>/g, '');
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      cancelPlaylistRef.current?.();
      cancelPlaylistRef.current = null;
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }

    if (activeTab === -1) {
      setIsPlayingAudio(true);
      const textsToRead = [sectionTitle, ...paragraphs];
      cancelPlaylistRef.current = readFullModulePlaylist(
        textsToRead,
        (idx) => {
          if (idx > 0) {
            onSelectParagraph(idx - 1);
          }
        },
        () => {
          setIsPlayingAudio(false);
          cancelPlaylistRef.current = null;
        }
      );
    } else {
      const text = getActiveText();
      if (!text) return;
      setIsPlayingAudio(true);
      speakText(text, {
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  const buildSystemPrompt = () => `
Kamu adalah "Tutor Ahli Brevet Pajak AB & Konsultan Senior".
Kamu bertugas menjelaskan dan membedah materi sub-bab "${sectionTitle}".

TUGAS UTAMA:
1. Jawab pertanyaan siswa dengan mengaitkannya ke konteks materi ${activeTab === -1 ? 'seluruh sub-bab ini' : 'paragraf ke-' + (activeTab + 1)}.
2. Berikan penjelasan yang SANGAT JELAS, EDUKATIF, NON-FORMAL, LENGKAP, dan MUDAH DIPAHAMI.
3. Berikan analogi simpel sehari-hari, pasal aturan hukum resmi (UU HPP No. 7/2021, UU KUP, UU PPh, UU PPN, PMK), serta contoh kasus nyata di kantor/bisnis.

PEDOMAN FORMAT OUTPUT (WAJIB HTML BERSIH & DARK THEME FRIENDLY):
- Gunakan tag semantik HTML: <div class="space-y-3">, <div class="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700">, <p class="text-slate-200 leading-relaxed">, <h4 class="font-bold text-emerald-400">, <strong>, <span class="text-amber-300 font-mono">, <ul>, <li>.
- JANGAN gunakan teks gelap (#333/#000/black). Gunakan warna terang (text-slate-200, text-white, text-amber-300, text-emerald-400, text-cyan-300).
- JANGAN sertakan <!DOCTYPE html>, <html>, atau <body>.
`;

  const handleAskAi = async (customPrompt?: string) => {
    const activePrompt = customPrompt || question.trim();
    if (!activePrompt || aiLoading) return;

    if (!isAiExpanded) setIsAiExpanded(true);

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
    setAiLoading(true);

    const contextText = getActiveText();
    const history: ChatMessage[] = [
      {
        role: 'user',
        text: `Berikut konteks materi yang sedang dipelajari:\nSub-Bab: "${sectionTitle}"\nKonteks Terpilih (${activeTab === -1 ? 'Seluruh Bagian' : 'Paragraf ' + (activeTab + 1)}): "${contextText}"`,
      },
      {
        role: 'model',
        text: 'Saya sudah memahami konteks materi sub-bab ini. Silakan ajukan pertanyaan!',
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
      console.error('Section Assistant error:', err);
      toast.error('Gagal memproses AI: ' + err.message);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === modelMsgId
            ? { ...m, text: '<p class="text-rose-400">Maaf, terjadi kendala koneksi AI. Silakan coba lagi.</p>' }
            : m
        )
      );
    } finally {
      setAiLoading(false);
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

  const handleSpeakAi = (text: string) => {
    if (isSpeakingAi) {
      stopSpeech();
      setIsSpeakingAi(false);
      return;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    speakText(textContent, {
      onStart: () => setIsSpeakingAi(true),
      onEnd: () => setIsSpeakingAi(false),
      onError: () => setIsSpeakingAi(false),
    });
  };

  const quickPrompts = [
    'Jelaskan materi bagian ini dengan analogi simpel',
    'Apa dasar hukum & pasal aturan resminya?',
    'Bagaimana contoh kasus nyata di lapangan/kantor?',
    'Kalau ada soal ujian tentang materi ini, gimana trik jawabnya?',
  ];

  return (
    <div className="mt-8 rounded-2xl bg-gradient-to-b from-[#0d162d] to-[#070c18] border border-blue-500/40 shadow-xl overflow-hidden">
      {/* Top Header Bar with Tabs */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs sm:text-sm">
            <Layers size={16} className="text-blue-400" />
            <span>Asisten Audio & Bedah AI Sub-Bab</span>
          </div>

          {/* Audio & AI Action Buttons for Active Tab */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAudio}
              disabled={isOffline}
              title={isPlayingAudio ? 'Hentikan Suara' : 'Dengarkan Suara (Chrome Pria Indonesia)'}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md border',
                isPlayingAudio
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse ring-1 ring-rose-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700 hover:border-blue-500/50'
              )}
            >
              {isPlayingAudio ? <Square size={13} className="fill-current text-rose-400" /> : <Volume2 size={14} />}
              <span>{isPlayingAudio ? 'Stop Suara' : activeTab === -1 ? 'Dengar Seluruh Bagian' : 'Dengar Paragraf ' + (activeTab + 1)}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAiExpanded(!isAiExpanded)}
              disabled={isOffline}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md border',
                isAiExpanded
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-blue-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-slate-700 hover:border-purple-500/50'
              )}
            >
              <Sparkles size={14} className={isAiExpanded ? 'text-yellow-300 animate-spin' : 'text-purple-400'} />
              <span>{isAiExpanded ? 'Tutup' : 'Tanya'}</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons for Paragraphs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => onSelectParagraph(null)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0',
              activeTab === -1
                ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            )}
          >
            📑 Seluruh Bagian
          </button>

          {paragraphs.map((_, pIdx) => {
            const isSelected = activeTab === pIdx;
            return (
              <button
                key={pIdx}
                type="button"
                onClick={() => onSelectParagraph(pIdx)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5',
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                )}
              >
                <FileText size={12} className={isSelected ? 'text-white' : 'text-slate-500'} />
                <span>Paragraf {pIdx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable AI Tutor Area */}
      {isAiExpanded && (
        <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
          {/* Active Context Card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-blue-400 block mb-1">
              📌 Konteks Terpilih: {activeTab === -1 ? 'Seluruh Bagian' : 'Paragraf ' + (activeTab + 1)} ({sectionTitle})
            </span>
            <p className="italic text-slate-400 line-clamp-3">"{getActiveText()}"</p>
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
                    disabled={aiLoading}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white transition disabled:opacity-50 text-left"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages Stream */}
          {chatMessages.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-400">Diskusi Materi:</span>
              <button
                type="button"
                onClick={() => {
                  setChatMessages([]);
                  stopSpeech();
                  setIsSpeakingAi(false);
                  toast.info('Sesi diskusi dibersihkan.');
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
          )}
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
                        __html: msg.text || (aiLoading ? '<span class="text-cyan-400 animate-pulse">Sedang mengetik jawaban langsung dari browser...</span>' : ''),
                      }}
                    />

                    {msg.role === 'model' && msg.text && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleSpeakAi(msg.text)}
                          className={"flex items-center gap-1 px-2 py-1 rounded-lg border transition " + (
                            isSpeakingAi
                              ? "bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse"
                              : "bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700"
                          )}
                          title={isSpeakingAi ? "Hentikan Suara" : "Dengarkan Jawaban (Suara Pria Indonesia)"}
                        >
                          {isSpeakingAi ? <Square size={11} className="fill-current text-rose-400" /> : <Volume2 size={12} />}
                          <span>{isSpeakingAi ? "Stop" : "Suara"}</span>
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

          {/* Question Input Form */}
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
              placeholder={`Tanyakan seputar ${activeTab === -1 ? 'seluruh bagian ini' : 'paragraf ' + (activeTab + 1)}...`}
              disabled={aiLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition"
            />
            <button
              type="submit"
              disabled={aiLoading || !question.trim()}
              className="p-2.5 sm:px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-600/25"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Tanya</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
