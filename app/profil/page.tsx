'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Save,
  Loader2,
  GraduationCap,
  BookOpen,
  Trophy,
  Award,
  CheckCircle2,
  Calendar,
  LogOut,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Mail,
  LayoutDashboard,
  Calculator,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/navigation/app-header';

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt?: string;
}

interface UserStats {
  totalModules: number;
  totalCompletedSections: number;
  totalQuizTaken: number;
  avgQuizScore: number;
  totalDjpExams: number;
  highestDjpScore: number;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states: Profile
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Form states: Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    // 1. Instant Cache Load (0ms)
    try {
      const cachedUser = localStorage.getItem('brevet_user_session');
      const cachedStats = localStorage.getItem('brevet_user_stats');
      if (cachedUser) {
        const u = JSON.parse(cachedUser);
        setUser(u);
        setFullName(u.fullName || '');
        setEmail(u.email || '');
      }
      if (cachedStats) {
        setStats(JSON.parse(cachedStats));
      }
      if (cachedUser) {
        setLoading(false);
      }
    } catch {}

    // 2. Silent Background Revalidation
    async function loadProfileData() {
      try {
        const res = await fetch('/api/user/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.user) {
            setUser(data.user);
            setStats(data.stats);
            setFullName(data.user.fullName || '');
            setEmail(data.user.email || '');
            localStorage.setItem('brevet_user_session', JSON.stringify(data.user));
            if (data.stats) {
              localStorage.setItem('brevet_user_stats', JSON.stringify(data.stats));
            }
          }
        } else if (res.status === 401) {
          // Provide instant fallback demo student profile without throwing error toast
          const demoUser = {
            id: 'demo-student',
            fullName: 'Siswa Brevet',
            email: 'siswa@brevet.local',
            role: 'user',
            createdAt: new Date().toISOString(),
          };
          setUser(demoUser);
          setFullName(demoUser.fullName);
          setEmail(demoUser.email);
        }
      } catch (err: any) {
        console.warn('[Profil] Background load warning:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [router]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      toast.error('Nama lengkap tidak boleh kosong.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Email tidak valid.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Gagal menyimpan profil.');
        return;
      }

      toast.success('Profil berhasil diperbarui!');
      if (data.user) {
        setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi saat menyimpan profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!currentPassword) {
      toast.error('Password saat ini wajib diisi.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Gagal mengubah password.');
        return;
      }

      toast.success('Password berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Terjadi kesalahan koneksi saat mengubah password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Berhasil keluar akun.');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Gagal keluar.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center mx-auto animate-spin">
            <GraduationCap size={24} className="text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-slate-400">Memuat Profil Siswa...</p>
        </div>
      </div>
    );
  }

  const avatarInitial = (fullName?.[0] || user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation Bar */}
      <AppHeader />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        {/* Page Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-500/30 text-blue-300 mb-2">
              <ShieldCheck size={13} />
              Portal Pengguna
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <User className="text-blue-400" size={28} />
              Profil Akun Saya
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kelola identitas, data kontak, dan keamanan kredensial akun pembelajaran Anda.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 text-xs font-bold transition"
          >
            <LayoutDashboard size={14} />
            <span>Lihat Statistik Lengkap</span>
          </Link>
        </div>

        {/* User Identity Header Card */}
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800/80 p-6 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-2xl sm:text-3xl font-black text-white shadow-lg ring-4 ring-blue-500/20 shrink-0">
            {avatarInitial}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                {user?.fullName || 'Siswa Brevet AB'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-500/20 border border-blue-500/40 text-blue-300">
                {user?.role === 'admin' ? 'Administrator' : 'Siswa'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5 truncate">
              <Mail size={14} className="text-slate-500 shrink-0" />
              <span>{user?.email}</span>
            </p>

            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-slate-600" />
                Status Akun: Aktif Terdaftar
              </span>
            </div>
          </div>
        </div>

        {/* Quick Learning Statistics Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Trophy size={15} className="text-yellow-400" />
            Ringkasan Prestasi Belajar
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Sub-Bab Selesai</span>
                <CheckCircle2 size={16} className="text-green-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{stats?.totalCompletedSections || 0}</p>
              <p className="text-[11px] text-slate-500">Materi dipelajari</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Kuis Diambil</span>
                <BookOpen size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{stats?.totalQuizTaken || 0}</p>
              <p className="text-[11px] text-slate-500">Ujian & latihan modul</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Rata-Rata Nilai</span>
                <Trophy size={16} className="text-yellow-400" />
              </div>
              <p className="text-2xl font-black text-yellow-300 font-mono">
                {stats?.avgQuizScore || 0}
                <span className="text-xs text-slate-500">/100</span>
              </p>
              <p className="text-[11px] text-slate-500">Akurasi kuis modul</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Top Skor DJP</span>
                <Award size={16} className="text-purple-400" />
              </div>
              <p className="text-2xl font-black text-purple-300 font-mono">
                {stats?.highestDjpScore || 0}
                <span className="text-xs text-slate-500">/100</span>
              </p>
              <p className="text-[11px] text-slate-500">Skor terbaik seleksi DJP</p>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form 1: Edit Profile */}
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800/80 p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <User size={18} className="text-blue-400" />
                  Informasi Profil
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ubah nama tampilan dan alamat email aktif akun Anda.
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  id="studentFullName"
                  label="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Setiawan"
                  required
                />

                <Input
                  id="studentEmail"
                  label="Alamat Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@domain.com"
                  required
                />

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Tipe Akun (Role)</label>
                  <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>{user?.role === 'admin' ? 'Administrator' : 'Siswa Reguler'}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Read-only</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={savingProfile}
                className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-600/20"
              >
                {savingProfile ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>Simpan Perubahan Profil</span>
              </Button>
            </div>
          </form>

          {/* Form 2: Change Password */}
          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800/80 p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock size={18} className="text-indigo-400" />
                  Keamanan & Password
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Perbarui kata sandi akun untuk menjaga keamanan data.
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  id="studentCurrentPassword"
                  label="Password Saat Ini"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  required
                />

                <Input
                  id="studentNewPassword"
                  label="Password Baru"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                  hint="Gunakan kombinasi huruf & angka minimal 8 karakter"
                />

                <Input
                  id="studentConfirmPassword"
                  label="Konfirmasi Password Baru"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                loading={savingPassword}
                className="w-full justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-2.5 rounded-xl transition"
              >
                {savingPassword ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                <span>Perbarui Password</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Learning Portal Quick Links */}
        <div className="rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            Navigasi Cepat Portal Siswa
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/belajar"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition flex items-center justify-between group"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white group-hover:text-blue-400 transition">Modul Belajar</p>
                <p className="text-[11px] text-slate-500">Materi Brevet AB & Audio</p>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-400 transition" />
            </Link>

            <Link
              href="/ujian-djp"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition flex items-center justify-between group"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white group-hover:text-purple-400 transition">Simulasi DJP</p>
                <p className="text-[11px] text-slate-500">100 Soal CAT & Evaluasi AI</p>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-purple-400 transition" />
            </Link>

            <Link
              href="/tools/kalkulator"
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition flex items-center justify-between group"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Kalkulator Pajak</p>
                <p className="text-[11px] text-slate-500">Simulasi TER, PPN & PBB</p>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition" />
            </Link>
          </div>
        </div>

        {/* Danger / Logout Zone */}
        <div className="rounded-2xl bg-rose-950/20 border border-rose-900/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-rose-300">Sesi Akun</h4>
            <p className="text-xs text-rose-400/80">
              Akhiri sesi pembelajaran Anda pada perangkat ini dengan aman.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-rose-900/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition shrink-0"
          >
            <LogOut size={14} />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </main>
    </div>
  );
}
