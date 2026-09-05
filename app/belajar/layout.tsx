import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import type { ReactNode } from 'react';

export default async function BelajarLayout({ children }: { children: ReactNode }) {
  // Allow both authenticated users and guests to access learning modules
  return <>{children}</>;
}
