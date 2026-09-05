'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { TikTokPromptStudio } from '@/components/admin/tiktok-prompt-studio';
import { Wand2, ArrowLeft, RefreshCw } from 'lucide-react';
import { cleanTitle } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function TikTokPromptModuleSlugPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get('tab');
  const initialTab = initialTabParam === 'super_prompt' ? 'super_prompt' : 'json_importer';

  // Fetch module detail from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['module-detail-by-slug', slug],
    queryFn: async () => {
      const res = await fetch(`/api/modules?simple=true`);
      if (!res.ok) throw new Error('Gagal mengambil data modul');
      const json = await res.json();
      const matched = json.modules?.find((m: any) => m.slug === slug || m.id === slug);
      if (!matched) throw new Error('Modul tidak ditemukan');
      return matched as { id: string; code: string; slug: string; title: string };
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center space-y-4 animate-fade-in">
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 w-fit mx-auto text-cyan-400">
          <Wand2 size={32} className="animate-spin" />
        </div>
        <p className="text-xs text-slate-400 font-medium">Memuat Studio Prompt TikTok untuk modul...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-5 animate-fade-in">
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white">Modul Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400">
            Modul dengan slug <code className="text-pink-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">{slug}</code> tidak ditemukan di database.
          </p>
          <button
            onClick={() => router.push('/admin/tiktok-prompts')}
            className="py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Daftar Modul TikTok</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4">
      <TikTokPromptStudio
        moduleSlug={data.slug}
        moduleTitle={cleanTitle(data.title)}
        initialTab={initialTab}
        onBack={() => router.push('/admin/tiktok-prompts')}
      />
    </div>
  );
}
