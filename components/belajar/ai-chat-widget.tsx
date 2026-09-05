'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Trash2,
  Bot,
  User,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { streamGeminiChatClient } from '@/lib/client-gemini';

type ChatRole = 'user' | 'assistant' | 'system';
type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  rotated?: boolean;
};

interface AIChatWidgetProps {
  moduleSlug: string;
  judulBagian?: string;
  initialQuestion?: string;
  initialInputText?: string;
  onClose: () => void;
}

// Inline formatting parser (bold, italic, code, strip stray ### / ***)
function renderInlineText(text: string): React.ReactNode[] {
  let cleaned = text
    .replace(/^#{1,6}\s*/g, '')
    .replace(/^\*{2,4}\s*/g, '')
    .replace(/^---\s*/g, '');

  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|<strong>[\s\S]*?<\/strong>|<em>[\s\S]*?<\/em>|<code>[\s\S]*?<\/code>)/g;
  const parts: React.ReactNode[] = [];
  const segments = cleaned.split(regex);

  segments.forEach((seg, idx) => {
    if (!seg) return;

    if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
      parts.push(
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-950 text-amber-300 font-mono text-[11px] border border-slate-800"
        >
          {seg.slice(1, -1)}
        </code>
      );
    } else if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
      parts.push(
        <strong key={idx} className="font-bold text-sky-200">
          {seg.slice(2, -2)}
        </strong>
      );
    } else if (
      (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) ||
      (seg.startsWith('_') && seg.endsWith('_') && seg.length > 2)
    ) {
      parts.push(
        <em key={idx} className="italic text-slate-300">
          {seg.slice(1, -1)}
        </em>
      );
    } else if (seg.startsWith('<strong>') && seg.endsWith('</strong>')) {
      parts.push(
        <strong key={idx} className="font-bold text-sky-200">
          {seg.replace(/<\/?strong>/g, '')}
        </strong>
      );
    } else if (seg.startsWith('<em>') && seg.endsWith('</em>')) {
      parts.push(
        <em key={idx} className="italic text-slate-300">
          {seg.replace(/<\/?em>/g, '')}
        </em>
      );
    } else if (seg.startsWith('<code>') && seg.endsWith('</code>')) {
      parts.push(
        <code key={idx} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-950 text-amber-300 font-mono text-[11px]">
          {seg.replace(/<\/?code>/g, '')}
        </code>
      );
    } else {
      const sanitized = seg.replace(/\*{2,4}/g, '').replace(/#{1,6}\s*/g, '');
      parts.push(<span key={idx}>{sanitized}</span>);
    }
  });

  return parts;
}

// Render AI content as beautiful HTML views without raw ### or *** symbols
function FormattedChatMessage({ content }: { content: string }) {
  if (!content) return null;

  // Check if it contains any standard HTML tags anywhere
  const hasHtmlTags = /<(p|div|ul|ol|li|h[1-6]|strong|em|b|i|br|span|article|section)\b[^>]*>/i.test(content) && !content.includes('<!DOCTYPE');

  if (hasHtmlTags) {
    return (
      <div
        className="ai-html-content text-[13px] leading-relaxed text-slate-200"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Parse lines into clean HTML view components
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList || currentList.items.length === 0) return;
    const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';

    elements.push(
      <ListTag
        key={`list-${elements.length}`}
        className={cn(
          'my-2 space-y-1.5 pl-3 text-slate-200',
          currentList.type === 'ul' ? 'list-disc list-inside' : 'list-decimal list-inside'
        )}
      >
        {currentList.items.map((itemText, i) => (
          <li key={i} className="leading-relaxed">
            {renderInlineText(itemText)}
          </li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code block toggle (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${index}`}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-sky-300 font-mono text-[11px] overflow-x-auto my-2 shadow-inner"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      return;
    }

    // Horizontal Rule: ---, ***, ___
    if (/^(---|[*]{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${index}`} className="my-3 border-slate-800/80" />);
      return;
    }

    // Header: ### Header or ## Header or # Header
    if (/^#{1,6}\s+/.test(trimmed)) {
      flushList();
      const headerText = trimmed.replace(/^#{1,6}\s+/, '');
      elements.push(
        <h4
          key={`h-${index}`}
          className="text-xs font-bold text-sky-300 mt-3 mb-1.5 pb-1 border-b border-slate-800/60 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 inline-block" />
          <span>{renderInlineText(headerText)}</span>
        </h4>
      );
      return;
    }

    // Bullet List Item: * item or - item or + item
    if (/^[*+-]\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^[*+-]\s+/, '');
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(itemText);
      return;
    }

    // Numbered List Item: 1. item or 2. item
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(itemText);
      return;
    }

    // Paragraph
    flushList();
    elements.push(
      <p key={`p-${index}`} className="my-1 leading-relaxed text-slate-200">
        {renderInlineText(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1.5 text-xs leading-relaxed">{elements}</div>;
}


export function AIChatWidget({
  moduleSlug,
  judulBagian,
  initialQuestion,
  initialInputText,
  onClose,
}: AIChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialInputText || '');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasAskedRef = useRef<string | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (initialInputText) {
      inputRef.current?.focus();
      // place cursor at end
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = inputRef.current.value.length;
          inputRef.current.selectionEnd = inputRef.current.value.length;
        }
      }, 50);
    }
  }, [initialInputText]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prevent double trigger on initialQuestion
  useEffect(() => {
    if (initialQuestion && hasAskedRef.current !== initialQuestion) {
      hasAskedRef.current = initialQuestion;
      sendMessage(initialQuestion);
    }
  }, [initialQuestion]);

  const sendMessage = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history for context (last 10)
      const riwayat = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          module_slug: moduleSlug,
          judul_bagian: judulBagian,
          riwayat,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: data.teks },
        ]);
      } else if (data.rotated) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'system',
            content: data.pesan,
            rotated: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'system', content: data.pesan ?? 'Terjadi kesalahan.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'system', content: 'Gagal terhubung ke server.' },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col rounded-2xl shadow-2xl transition-all duration-300 backdrop-blur-xl border border-slate-800 bg-slate-950/95 overflow-hidden',
        isFullscreen
          ? 'inset-2 sm:inset-4 md:inset-6'
          : 'right-2 left-2 sm:left-auto sm:right-6 bottom-3 sm:bottom-24 w-auto sm:w-[540px] md:w-[620px] h-[calc(100vh-5rem)] max-h-[750px] min-h-[400px]'
      )}
      style={{
        boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(59, 130, 246, 0.15)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-slate-800/80 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #0d1b2a, #0f2d3e)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/20 border border-blue-500/30 text-blue-400 shrink-0">
            <Bot size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-bold text-white truncate">AI Tutor Pajak</p>
              <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                Online
              </span>
            </div>
            {judulBagian && (
              <p className="text-[11px] text-blue-300/80 truncate max-w-[170px] xs:max-w-[240px] sm:max-w-[340px]">
                {judulBagian}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title={isFullscreen ? 'Kecilkan Ukuran' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            id="chatClearBtn"
            onClick={() => setMessages([])}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
            title="Bersihkan riwayat"
          >
            <Trash2 size={16} />
          </button>
          <button
            id="chatCloseBtn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 transition-all"
            title="Tutup (Esc)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bot size={28} />
            </div>
            <p className="text-sm font-semibold text-white">
              Tanya apa saja tentang materi pajak ini!
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              AI Tutor memiliki akses lengkap ke seluruh isi modul ini. Silakan pilih contoh pertanyaan atau ketik sendiri di bawah.
            </p>
            <div className="grid gap-2 max-w-sm mx-auto pt-2">
              {[
                'Jelaskan materi modul ini secara singkat',
                'Berikan contoh kasus nyata & solusinya',
                'Sebutkan sanksi & batas waktu terkait',
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-xs text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500/30 text-slate-300 hover:text-white transition-all"
                >
                  💡 {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'flex gap-3 text-xs leading-relaxed animate-fade-in',
              m.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {m.role !== 'user' && (
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} />
              </div>
            )}
            <div
              className={cn(
                'p-3.5 rounded-2xl max-w-[85%] leading-relaxed shadow-sm',
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none font-medium whitespace-pre-wrap'
                  : m.role === 'system'
                  ? 'bg-amber-950/40 border border-amber-800/40 text-amber-300'
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none font-normal'
              )}
            >
              {m.role === 'assistant' ? (
                <FormattedChatMessage content={m.content} />
              ) : (
                m.content
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-start animate-pulse">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2 w-48">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 shrink-0">
        <div className="relative flex items-center gap-2">
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            className="w-full pl-3.5 pr-12 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="absolute right-2.5 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-md"
            title="Kirim Pesan"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 px-1">
          <span>AI Tutor dilengkapi konteks penuh modul & aturan perpajakan Indonesia</span>
          <span>Shift+Enter untuk baris baru</span>
        </div>
      </div>
    </div>
  );
}
