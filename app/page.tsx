import Link from 'next/link';
import { GraduationCap, BookOpen, Trophy, Calculator, ArrowRight, ShieldCheck, Sparkles, User, CheckCircle2 } from 'lucide-react';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('brevet_session')?.value;
  let user: { sub: string; role: string } | null = null;

  if (token) {
    user = await verifyToken(token);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 flex flex-col justify-between relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap size={20} />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Brevet<span className="text-blue-500">AB</span> Hub
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link
              href={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
            >
              <User size={13} />
              <span>{user.role === 'admin' ? 'Admin Panel' : 'Dashboard Siswa'}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition"
              >
                Masuk
              </Link>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition"
              >
                Daftar Gratis
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 text-blue-400">
          <Sparkles size={13} className="text-yellow-300" />
          Platform Belajar Perpajakan & Ujian DJP Kemenkeu No. 1
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Kuasai Brevet Pajak A/B & Tembus Ujian Masuk{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
              DJP Kemenkeu RI
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Dilengkapi modul materi lengkap, kuis evaluasi 100 soal, simulasi CAT TKB, bedah esai studi kasus oleh AI Penguji Pajak, serta simulasi wawancara STAR.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/belajar"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-blue-600/30 hover:scale-105 transition-all"
          >
            <BookOpen size={18} />
            <span>Mulai Belajar Modul</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/ujian-djp"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 text-sm font-bold shadow-xl hover:scale-105 transition-all"
          >
            <Trophy size={18} className="text-yellow-400" />
            <span>Simulasi Ujian Masuk DJP</span>
          </Link>

          <Link
            href="/tools/kalkulator"
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-sm font-semibold transition-all"
          >
            <Calculator size={18} />
            <span>Kalkulator Pajak</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 text-left">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl hover:border-blue-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Modul & Audio Lengkap</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Materi perpajakan PPh Badan, PPh Orang Pribadi, PPN 11-12%, KUP, PBB & BPHTB dengan dukungan audio narasi offline.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Trophy size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Simulasi DJP 4-Mode</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              CAT 50 Soal TKB, Bedah Esai Studi Kasus dengan AI Penguji ramah, dan Simulasi Wawancara 5 Nilai Kemenkeu.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-white">Dashboard Siswa & Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catat progres belajar secara permanen, pantau radar kompetensi pemahaman pajak, serta raih sertifikat kelulusan.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Brevet AB Hub. Platform Belajar Perpajakan Pribadi & Mandiri.</p>
      </footer>
    </div>
  );
}
