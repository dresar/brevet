'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import KuisAkhir from '@/components/belajar/kuis-akhir';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StudentPerhitunganPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  // Fetch Module detail & Quiz questions
  const { data, isLoading, isError } = useQuery({
    queryKey: ['belajar-ujian-module', slug],
    queryFn: async () => {
      const res = await fetch(`/api/belajar/${slug}`);
      if (!res.ok) throw new Error('Gagal memuat latihan perhitungan');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#070b13] flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="animate-spin text-yellow-400 mb-3" size={36} />
        <p className="text-sm font-semibold">Memuat Latihan Perhitungan...</p>
      </div>
    );
  }

  if (isError || !data?.content?.modul?.kuis_perhitungan?.soal) {
    return (
      <div className="min-h-dvh bg-[#070b13] flex flex-col items-center justify-center p-6 text-slate-300 space-y-4 text-center">
        <h2 className="text-xl font-bold text-white">Soal Latihan Perhitungan Tidak Ditemukan</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          Latihan perhitungan pajak untuk modul ini belum tersedia atau sedang diproses oleh admin.
        </p>
        <Link
          href={`/belajar/${slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Modul</span>
        </Link>
      </div>
    );
  }

  const soal = data.content.modul.kuis_perhitungan.soal;
  const modul = data.modul;

  return (
    <div className="min-h-dvh bg-[#070b13]">
      <KuisAkhir
        soal={soal}
        moduleTitle={data.content.modul.kuis_perhitungan.judul || `Latihan Perhitungan - ${modul.title}`}
        moduleSlug={slug}
        moduleId={modul.id}
        quizType="perhitungan"
        onClose={() => router.push(`/belajar/${slug}`)}
      />
    </div>
  );
}
