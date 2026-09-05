'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, User, LogOut, Settings, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const breadcrumbMap: Record<string, string> = {
  '/admin/import': 'Impor Modul',
  '/admin/keys': 'Manajemen Kunci',
  '/admin/profil': 'Profil',
  '/admin/pengaturan': 'Pengaturan',
};

interface TopbarProps {
  userName?: string | null;
}

export function AdminTopbar({ userName }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  let currentLabel = breadcrumbMap[pathname];
  if (!currentLabel) {
    if (pathname.includes('/admin/modules/') && pathname.includes('/edit')) {
      currentLabel = 'Studio Edit Modul';
    } else {
      currentLabel = 'Dashboard';
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Berhasil keluar');
    router.push('/login');
  };

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b"
      style={{
        background: 'rgba(11, 18, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        borderColor: '#1F2937',
      }}
    >
      {/* Breadcrumb & Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.dispatchEvent(new Event('toggleMobileMenu'))}
          className="md:hidden p-1.5 -ml-1.5 rounded-lg transition-default hover:bg-[#131b2e]"
          style={{ color: 'var(--text-muted)' }}
        >
          <Menu size={20} />
        </button>
        <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <span className="hidden sm:inline" style={{ color: 'var(--text-muted)' }}>Admin</span>
          <ChevronRight size={14} className="hidden sm:block" style={{ color: 'var(--text-muted)' }} />
          <span className="font-medium" style={{ color: 'var(--text-heading)' }}>
            {currentLabel}
          </span>
        </nav>
      </div>

      {/* Avatar dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          id="topbarAvatarBtn"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-default hover:bg-[#131b2e]"
          style={{ border: '1px solid #1F2937' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: '#3B82F6' }}
          >
            {(userName?.[0] ?? 'A').toUpperCase()}
          </div>
          <span className="text-xs sm:text-sm font-medium hidden sm:block" style={{ color: 'var(--text-body)' }}>
            {userName ?? 'Admin'}
          </span>
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-44 rounded-xl py-1 z-30 animate-fade-in"
            style={{
              background: '#111827',
              border: '1px solid #1F2937',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Link
              href="/admin/profil"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-default hover:bg-[#172030] hover:text-white"
              style={{ color: 'var(--text-body)' }}
            >
              <User size={15} />
              Profil Saya
            </Link>
            <Link
              href="/admin/pengaturan"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-default hover:bg-[#172030] hover:text-white"
              style={{ color: 'var(--text-body)' }}
            >
              <Settings size={15} />
              Pengaturan
            </Link>
            <div
              className="my-1 border-t"
              style={{ borderColor: '#1F2937' }}
            />
            <button
              id="topbarLogoutBtn"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-default text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={15} />
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
