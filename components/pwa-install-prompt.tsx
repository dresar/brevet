'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2, Share2, PlusSquare, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect OS & device type
    const ua = navigator.userAgent || '';
    const android = /android/i.test(ua);
    const ios = /iphone|ipad|ipod/i.test(ua);
    const mobile = android || ios || /mobile|tablet|touch|android/i.test(ua);

    setIsAndroid(android);
    setIsIOS(ios);
    setIsMobile(mobile);

    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  // NEVER show on Desktop / Laptop (only show on mobile devices)
  if (!isMobile || isInstalled || isDismissed) return null;

  return (
    <>
      {/* Floating Bottom Card / Banner */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 border border-sky-500/30 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          {/* Subtle Accent Background Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
              <Smartphone className="h-6 w-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Aplikasi Android Brevet</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                Install Brevet AB di HP Android
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Nikmati akses cepat 1-tap, mode layar penuh, dan pengalaman belajar pajak tanpa gangguan.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-sky-400 hover:to-indigo-500 transition-all active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" />
                  <span>{deferredPrompt ? 'Install Sekarang' : 'Unduh / Pasang App'}</span>
                </button>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="rounded-xl p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Modal if Browser does not support direct prompt trigger */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cara Install di HP Android</h3>
                <p className="text-xs text-slate-400">Ikuti langkah sederhana ini di browser HP Anda</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-slate-800/60 p-3 text-xs text-slate-200 border border-slate-700/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold">1</span>
                <div>
                  Buka browser <strong>Chrome</strong> di HP Android Anda.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-800/60 p-3 text-xs text-slate-200 border border-slate-700/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold">2</span>
                <div className="space-y-1">
                  <div>Tekan ikon <strong>Titik Tiga (⋮)</strong> di sudut kanan atas Chrome.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-800/60 p-3 text-xs text-slate-200 border border-slate-700/50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 font-bold">3</span>
                <div>
                  Pilih menu <strong>&quot;Tambah ke Layar Utama&quot;</strong> atau <strong>&quot;Install Aplikasi&quot;</strong>.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-6 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 text-xs transition-colors"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
