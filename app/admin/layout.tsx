import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';
import type { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();

  // Build a mock request to reuse getCurrentUser
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const { NextRequest } = await import('next/server');
  const fakeReq = new NextRequest('http://localhost', {
    headers: { cookie: cookieHeader },
  });

  const user = await getCurrentUser(fakeReq);

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar userName={user.fullName} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
