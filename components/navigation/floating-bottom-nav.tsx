'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  Calculator,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingBottomNav() {
  const pathname = usePathname();

  // Hide on admin panel, auth pages
  if (
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  // Exact requested order: Dashboard -> Ujian DJP -> Belajar (Tengah) -> Kalkulator -> Profil
  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      label: 'Ujian DJP',
      href: '/ujian-djp',
      icon: ShieldCheck,
      isActive: pathname.startsWith('/ujian-djp') || pathname.includes('simulasi-djp'),
    },
    {
      label: 'Belajar',
      href: '/belajar',
      icon: BookOpen,
      isActive: pathname === '/belajar' || (pathname.startsWith('/belajar/') && !pathname.includes('simulasi-djp')),
    },
    {
      label: 'Kalkulator',
      href: '/tools/kalkulator',
      icon: Calculator,
      isActive: pathname.startsWith('/tools/kalkulator'),
    },
    {
      label: 'Profil',
      href: '/profil',
      icon: User,
      isActive: pathname === '/profil',
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation Frame"
      className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#0B1220]/95 backdrop-blur-2xl border-t border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.6)] px-2 py-1.5 flex items-center justify-around md:hidden"
    >
      <div className="w-full max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative group',
                active
                  ? 'text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    'p-1.5 rounded-xl transition-all',
                    active ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400'
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      'transition-transform duration-150',
                      active ? 'scale-110 text-blue-400' : 'text-slate-400'
                    )}
                  />
                </div>
                {item.label === 'Ujian DJP' && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>

              <span
                className={cn(
                  'text-[10px] mt-0.5 tracking-tight truncate font-medium',
                  active ? 'text-blue-400 font-bold' : 'text-slate-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
