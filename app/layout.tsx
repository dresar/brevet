import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from './providers';
import { PwaRegister } from '@/components/pwa-register';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';
import { OfflineBadge } from '@/components/offline-badge';
import { FloatingBottomNav } from '@/components/navigation/floating-bottom-nav';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Brevet AB Hub — Platform Belajar Pajak Pribadi',
  description:
    'Platform belajar pajak Brevet A/B yang visual, interaktif, dan dibantu AI. Pelajari PPh, PPN, dan semua topik pajak dengan mudah.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Brevet AB',
  },
  icons: {
    icon: '/icons/icon-192.svg',
    shortcut: '/icons/icon-192.svg',
    apple: '/icons/icon-512.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <QueryProvider>
          <PwaRegister />
          {children}
          <OfflineBadge />
          <FloatingBottomNav />
          <PwaInstallPrompt />
          <Toaster
            position="top-right"
            theme="dark"
            duration={1500}
            richColors
            closeButton
            toastOptions={{
              style: {
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}

