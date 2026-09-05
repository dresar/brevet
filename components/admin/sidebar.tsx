'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Upload,
  Key,
  GraduationCap,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Images,
  Wand2,
  Calculator,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const navItems = [
  {
    id: 'import',
    href: '/admin/import',
    icon: Upload,
    label: 'Impor Modul',
  },
  {
    id: 'keys',
    href: '/admin/keys',
    icon: Key,
    label: 'Manajemen Kunci',
  },
  {
    id: 'media',
    href: '/admin/media',
    icon: Images,
    label: 'Media Library',
  },
  {
    id: 'tiktok-prompts',
    href: '/admin/tiktok-prompts',
    icon: Wand2,
    label: 'Prompt TikTok AI',
  },
  {
    id: 'quiz-manager',
    href: '/admin/quiz-manager',
    icon: BookOpen,
    label: 'Kuis 100 Soal',
  },
  {
    id: 'quiz-perhitungan',
    href: '/admin/quiz-perhitungan',
    icon: Calculator,
    label: 'Kuis Hitungan Pajak',
  },
  {
    id: 'glossary-manager',
    href: '/admin/glossary-manager',
    icon: BookOpen,
    label: 'Glosarium Manager',
  },
  {
    id: 'belajar',
    href: '/belajar',
    icon: GraduationCap,
    label: 'Ruang Belajar',
    external: true,
  },
  {
    id: 'profil',
    href: '/admin/profil',
    icon: User,
    label: 'Profil',
  },
  {
    id: 'pengaturan',
    href: '/admin/pengaturan',
    icon: Settings,
    label: 'Pengaturan',
  },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleToggle = () => setMobileOpen(o => !o);
    window.addEventListener('toggleMobileMenu', handleToggle);
    return () => window.removeEventListener('toggleMobileMenu', handleToggle);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Berhasil keluar');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          'h-full flex flex-col shrink-0 z-40 transition-transform duration-300',
          'border-r',
          'fixed inset-y-0 left-0 md:relative',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          collapsed ? 'w-[280px] md:w-[72px]' : 'w-[280px]'
        )}
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
        }}
      >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border"
          style={{
            background: '#13233c',
            borderColor: '#3B82F6',
            boxShadow: 'none',
          }}
        >
          <BookOpen size={18} className="text-blue-400" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs sm:text-sm truncate text-white">
              Brevet AB Hub
            </div>
            <div className="text-[10px] sm:text-xs truncate text-slate-400">
              Admin & Content Studio
            </div>
          </div>
        )}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 ml-auto"
          title="Tutup Menu"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = !item.external && pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.external) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                  'hover:text-white group',
                  collapsed ? 'justify-center' : ''
                )}
                style={{ color: 'var(--text-muted)' }}
                data-tooltip={collapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  className={cn('shrink-0', 'group-hover:text-blue-400')}
                />
                {!collapsed && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
                {!collapsed && (
                  <span className="ml-auto text-xs opacity-50">↗</span>
                )}
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                'group',
                isActive ? 'text-white' : 'hover:text-white hover:bg-[#131b2e]',
                collapsed ? 'justify-center' : ''
              )}
              style={
                isActive
                  ? {
                      background: '#13233c',
                      color: '#FFFFFF',
                      border: '1px solid #1F2937',
                    }
                  : { color: 'var(--text-muted)', border: '1px solid transparent' }
              }
              data-tooltip={collapsed ? item.label : undefined}
            >
              <Icon
                size={20}
                className={cn(
                  'shrink-0',
                  isActive ? 'text-blue-400' : 'group-hover:text-blue-400'
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="px-2 pb-4 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        <button
          id="sidebarLogoutBtn"
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
            'text-red-400/70 hover:text-red-400 hover:bg-red-500/10',
            collapsed ? 'justify-center' : ''
          )}
          data-tooltip={collapsed ? 'Keluar' : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Keluar</span>}
        </button>
      </div>

      {/* ── Collapse toggle (Desktop only) ── */}
      <button
        id="sidebarCollapseBtn"
        onClick={() => setCollapsed((c) => !c)}
        className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full items-center justify-center z-10 transition-default hover:scale-110"
        style={{
          background: '#111827',
          border: '1px solid #1F2937',
          color: 'var(--text-muted)',
          boxShadow: 'none',
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
    </>
  );
}
