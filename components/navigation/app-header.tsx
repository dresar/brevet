'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  Calculator,
  User,
  LogOut,
  LogIn,
  Settings,
  DownloadCloud,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AppHeaderProps { badgeText?: string; }
export function AppHeader({ badgeText }: AppHeaderProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    fullName: string;
    role: string;
  } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check cached user first for 0ms render
    try {
      const cached = localStorage.getItem('brevet_user_session');
      if (cached) {
        setCurrentUser(JSON.parse(cached));
      }
    } catch {}

    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('brevet_user_session', JSON.stringify(data.user));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('brevet_user_session');
        }
      })
      .catch(() => {});

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Berhasil keluar');
      setCurrentUser(null);
      localStorage.removeItem('brevet_user_session');
      localStorage.removeItem('brevet_user_stats');
      setShowDropdown(false);
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Gagal keluar');
    }
  };

  const handleDownloadOffline = async () => {
    toast.info('Memulai pengunduhan seluruh modul untuk mode offline...');
    try {
      const res = await fetch('/api/modules?status=tayang');
      if (!res.ok) throw new Error('Gagal mengambil daftar modul');
      const data = await res.json();
      const modules = data.modules || [];

      if (!modules.length) {
        toast.warning('Belum ada modul yang tersedia');
        return;
      }

      const { cacheModuleOffline } = await import('@/lib/offline-manager');
      for (let i = 0; i < modules.length; i++) {
        const m = modules[i];
        toast.loading(`Mengunduh Modul Offline ${i + 1}/${modules.length} (${m.code})...`, { id: 'dl-offline' });
        const modRes = await fetch(`/api/belajar/${m.slug}`);
        let audioUrl: string | null = null;
        if (modRes.ok) {
          const modData = await modRes.json();
          audioUrl = modData.content?.modul?.url_audio || null;
        }
        await cacheModuleOffline(m.slug, audioUrl);
      }
      toast.success('Semua modul, glosarium, & audio berhasil tersimpan offline!', { id: 'dl-offline' });
    } catch (e: any) {
      toast.error('Gagal mengunduh modul offline: ' + (e.message || 'Error'), { id: 'dl-offline' });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B1220]/95 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo — Clean Brevet AB */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/" prefetch={true} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
            <GraduationCap size={19} />
          </div>
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-none">
              Brevet <span className="text-blue-500">AB</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Desktop Navigation Links — Sequence: Dashboard -> Ujian DJP -> Belajar -> Kalkulator */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
        <Link
          href="/dashboard"
          prefetch={true}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition',
            pathname === '/dashboard'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          )}
        >
          <LayoutDashboard size={14} className="text-indigo-400" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/ujian-djp"
          prefetch={true}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition',
            pathname.startsWith('/ujian-djp')
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          )}
        >
          <ShieldCheck size={14} className="text-cyan-400" />
          <span>Ujian DJP</span>
        </Link>

        <Link
          href="/belajar"
          prefetch={true}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition',
            pathname.startsWith('/belajar') && !pathname.includes('simulasi-djp')
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          )}
        >
          <BookOpen size={14} />
          <span>Belajar</span>
        </Link>

        <Link
          href="/tools/kalkulator"
          prefetch={true}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition',
            pathname.startsWith('/tools/kalkulator')
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          )}
        >
          <Calculator size={14} className="text-emerald-400" />
          <span>Kalkulator</span>
        </Link>
      </nav>

      {/* Right Side: Offline Download & Circular Profile Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          onClick={handleDownloadOffline}
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs transition-all bg-slate-900/80 hover:bg-slate-800 text-blue-400 border border-slate-800 hover:border-blue-500/40 flex items-center gap-1.5"
          title="Unduh seluruh modul untuk akses offline"
        >
          <DownloadCloud size={15} />
          <span className="hidden md:inline font-semibold">Unduh Offline</span>
        </button>

        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="flex items-center gap-1.5 p-1 rounded-full bg-slate-900 border border-slate-700 hover:border-blue-500 transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              title="Menu Akun Saya"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md group-hover:scale-105 transition-transform">
                {getInitials(currentUser.fullName || currentUser.email)}
              </div>
              <ChevronDown size={13} className={`text-slate-400 pr-0.5 transition-transform ${showDropdown ? 'rotate-180 text-white' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 space-y-1">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate block">
                      {currentUser.fullName || 'Siswa Brevet'}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                </div>

                <div className="pt-1 space-y-0.5 text-xs">
                  <Link
                    href="/dashboard"
                    prefetch={true}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition font-medium"
                  >
                    <LayoutDashboard size={14} className="text-indigo-400" />
                    <span>Dashboard Belajar</span>
                  </Link>

                  <Link
                    href="/profil"
                    prefetch={true}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition font-medium"
                  >
                    <User size={14} className="text-blue-400" />
                    <span>Lihat & Edit Profil</span>
                  </Link>

                  {currentUser.role === 'admin' && (
                    <Link
                      href="/admin"
                      prefetch={true}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-950/40 transition font-bold"
                    >
                      <Settings size={14} className="text-purple-400" />
                      <span>Panel Admin</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition text-xs font-semibold"
                  >
                    <LogOut size={14} />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            prefetch={true}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition flex items-center gap-1.5"
          >
            <LogIn size={14} />
            <span>Masuk</span>
          </Link>
        )}
      </div>
    </header>
  );
}
