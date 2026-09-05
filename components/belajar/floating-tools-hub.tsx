'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Bot,
  BookOpen,
  Search,
  Calculator,
  BookMarked,
  Settings2,
  ArrowUp,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Images,
  Wand2,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface FloatingToolsHubProps {
  onOpenChat: () => void;
  onToggleToc: () => void;
  onOpenSearch: () => void;
  onOpenCalculator: () => void;
  onOpenGlossary: () => void;
  onOpenMedia?: () => void;
  onOpenTikTokPrompt?: () => void;
  onToggleSettings: () => void;
  showToc: boolean;
}

export function FloatingToolsHub({
  onOpenChat,
  onToggleToc,
  onOpenSearch,
  onOpenCalculator,
  onOpenGlossary,
  onOpenMedia,
  onOpenTikTokPrompt,
  onToggleSettings,
  showToc,
}: FloatingToolsHubProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  // If user completely hid the FAB hub, render a tiny subtle unhide button on the side
  if (isHidden) {
    return (
      <button
        onClick={() => setIsHidden(false)}
        className="fixed bottom-4 right-4 z-40 p-2.5 rounded-full bg-slate-900/90 text-slate-400 hover:text-white border border-slate-700 shadow-xl backdrop-blur transition-all duration-200 animate-fade-in hover:scale-110"
        title="Tampilkan Kembali Tools Menu"
      >
        <Eye size={18} className="text-blue-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3 select-none">
      {/* ── Dropdown / Popup Tools List ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="flex flex-col gap-2 p-2.5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl min-w-[200px] sm:min-w-[230px] max-w-[calc(100vw-1.5rem)] max-h-[75vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wrench size={12} className="text-blue-400" />
                Pusat Alat & Fitur
              </span>
              <button
                onClick={() => setIsHidden(true)}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-slate-800"
                title="Sembunyikan Floating Hub"
              >
                <EyeOff size={12} />
                <span>Sembunyikan</span>
              </button>
            </div>

            {/* Tool Item 1: AI Tutor */}
            <button
              onClick={() => {
                onOpenChat();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-blue-600/20 border border-transparent hover:border-blue-500/30 transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Sparkles size={15} />
              </div>
              <div>
                <p className="font-semibold text-blue-400">AI Tutor Pajak</p>
                <p className="text-[10px] text-slate-400">Tanya konsep & contoh</p>
              </div>
            </button>

            {/* Tool Item: Ujian Masuk DJP */}
            <Link
              href="/ujian-djp"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-emerald-600/20 border border-transparent hover:border-emerald-500/30 transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={15} />
              </div>
              <div>
                <p className="font-semibold text-emerald-400">Ujian Masuk DJP</p>
                <p className="text-[10px] text-slate-400">100 Soal CAT, Esai & Wawancara</p>
              </div>
            </Link>

            {/* Tool Item: TikTok 10-Slide Prompt Generator */}
            {onOpenTikTokPrompt && (
              <button
                onClick={() => {
                  onOpenTikTokPrompt();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-pink-600/20 border border-transparent hover:border-pink-500/30 transition-all text-left group"
              >
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
                  <Wand2 size={15} />
                </div>
                <div>
                  <p className="font-semibold text-pink-400">Prompt TikTok 10-Slide</p>
                  <p className="text-[10px] text-slate-400">Buat prompt AI gambar TikTok</p>
                </div>
              </button>
            )}

            {/* Tool Item 2: Cari Modul */}
            <button
              onClick={() => {
                onOpenSearch();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Search size={15} />
              </div>
              <div>
                <p className="font-semibold">Cari Materi Modul</p>
                <p className="text-[10px] text-slate-400">Pencarian cepat kata kunci</p>
              </div>
            </button>

            <button
              onClick={() => {
                onOpenCalculator();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <Calculator size={15} />
              </div>
              <div>
                <p className="font-semibold">Kalkulator Pajak (Cepat)</p>
                <p className="text-[10px] text-slate-400">PPN, PPh 21, PBB, BPHTB</p>
              </div>
            </button>

            {/* Tool Item 3b: Kalkulator Interaktif Penuh */}
            <Link
              href="/tools/kalkulator"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Sparkles size={15} />
              </div>
              <div>
                <p className="font-semibold">Kalkulator Interaktif Penuh</p>
                <p className="text-[10px] text-slate-400">6 Kalkulator + PPh OP/Badan + Prompt AI Claude</p>
              </div>
            </Link>

            {/* Tool Item 4: Glosarium Istilah */}
            <button
              onClick={() => {
                onOpenGlossary();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <BookMarked size={15} />
              </div>
              <div>
                <p className="font-semibold">Glosarium Istilah</p>
                <p className="text-[10px] text-slate-400">Kamus perpajakan</p>
              </div>
            </button>

            {/* Tool Item: Media Library */}
            {onOpenMedia && (
              <button
                onClick={() => {
                  onOpenMedia();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-left group"
              >
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                  <Images size={15} />
                </div>
                <div>
                  <p className="font-semibold">Media Library</p>
                  <p className="text-[10px] text-slate-400">Upload & salin link gambar</p>
                </div>
              </button>
            )}

            {/* Tool Item 5: Toggle Daftar Isi */}
            <button
              onClick={() => {
                onToggleToc();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <BookOpen size={15} />
              </div>
              <div>
                <p className="font-semibold">
                  {showToc ? 'Sembunyikan Daftar Isi' : 'Tampilkan Daftar Isi'}
                </p>
                <p className="text-[10px] text-slate-400">Navigasi bagian materi</p>
              </div>
            </button>

            {/* Tool Item 6: Pengaturan Tampilan */}
            <button
              onClick={() => {
                onToggleSettings();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                <Settings2 size={15} />
              </div>
              <div>
                <p className="font-semibold">Pengaturan Font</p>
                <p className="text-[10px] text-slate-400">Ukuran teks & mode baca</p>
              </div>
            </button>

            {/* Tool Item 7: Scroll Ke Atas */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-left mt-1 border-t border-slate-800/60 pt-2"
            >
              <ArrowUp size={14} className="text-slate-400" />
              <span>Kembali Ke Atas</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Trigger Button (Pulse Glow FAB Hub) ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          'p-3.5 rounded-2xl text-white shadow-2xl flex items-center justify-center transition-all duration-300 relative border',
          isOpen
            ? 'bg-slate-800 border-slate-700 text-slate-300'
            : 'bg-blue-600 hover:bg-blue-500 border-blue-400/30 shadow-blue-500/25'
        )}
        style={{
          boxShadow: isOpen
            ? '0 10px 30px rgba(0, 0, 0, 0.5)'
            : '0 8px 30px rgba(37, 99, 235, 0.45)',
        }}
        title={isOpen ? 'Tutup Menu' : 'Pusat Alat & AI Tutor'}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <div className="flex items-center gap-2 px-1">
            <Sparkles size={20} className="animate-pulse text-cyan-300" />
            <span className="text-xs font-bold tracking-wide hidden sm:inline">Tools & AI</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
