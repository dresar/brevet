'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  BookOpen,
  Loader2,
  Lock,
  Mail,
  User,
  Zap,
  ChevronDown,
  ArrowRight,
  UserCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface DevUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dev Users state
  const [devUsers, setDevUsers] = useState<DevUser[]>([]);
  const [showDevAccounts, setShowDevAccounts] = useState(false);
  const [quickLoggingIn, setQuickLoggingIn] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  // Check if already logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          if (redirectParam) {
            router.replace(redirectParam);
          } else if (data.user.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/dashboard');
          }
        }
      })
      .catch(() => {});

    // Fetch registered accounts from database for dev quick-fill
    fetch('/api/auth/dev-login')
      .then((r) => r.json())
      .then((data) => {
        if (data.users) setDevUsers(data.users);
      })
      .catch(() => {});
  }, [router, redirectParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email dan password wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal masuk. Cek email dan password Anda.');
        return;
      }

      toast.success('Berhasil masuk! Selamat datang.');
      if (redirectParam) {
        router.push(redirectParam);
      } else if (data.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      toast.error('Terjadi kesalahan. Periksa koneksi internet Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      toast.error('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal mendaftar.');
        return;
      }

      toast.success('Pendaftaran akun siswa berhasil! 🎉');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Terjadi kesalahan saat pendaftaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (user: DevUser) => {
    setQuickLoggingIn(user.id);
    try {
      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email, role: user.role }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal login cepat.');
        return;
      }

      toast.success('Login cepat berhasil!');
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      toast.error('Gagal terhubung ke server.');
    } finally {
      setQuickLoggingIn(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo area */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-all">
              <GraduationCap size={26} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Brevet<span className="text-blue-500">AB</span> Hub
            </span>
          </Link>
          <p className="text-xs text-slate-400">
            Platform Belajar Pajak, Kuis Brevet, & Simulasi Ujian Masuk DJP
          </p>
        </div>

        {/* Tab Switcher: Masuk vs Daftar */}
        <div className="flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'login'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock size={15} />
            <span>Masuk (Login)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={15} className="text-yellow-300" />
            <span>Daftar Siswa Baru</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {activeTab === 'login' ? (
            <>
              <div>
                <h2 className="text-lg font-bold text-white">Masuk ke Akun Anda</h2>
                <p className="text-xs text-slate-400">
                  Akses Dashboard Belajar, Riwayat Nilai, atau Admin Panel
                </p>
              </div>

              {/* Auto-Fill Demo Accounts Section (Siswa & Admin) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <Zap size={14} className="fill-current text-amber-400" />
                    Pilih Akun Demo (Auto-Fill / 1-Klik):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDevAccounts((s) => !s)}
                    className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-mono transition"
                  >
                    <span>{showDevAccounts ? 'Tutup' : 'Lihat Semua'}</span>
                    <ChevronDown size={13} className={`transition-transform ${showDevAccounts ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Quick 2-Column Buttons (Siswa Demo vs Admin Demo) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        fullName: 'Muhammad Reza',
                        email: 'siswa@brevet.local',
                        password: 'siswa123456',
                      });
                      toast.success('Akun Siswa Demo (siswa@brevet.local) diisi!');
                    }}
                    className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-600/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                        🎓 Siswa Demo
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                        User
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">siswa@brevet.local</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForm({
                        fullName: 'Admin Utama',
                        email: 'admin@brevet.local',
                        password: 'admin123456',
                      });
                      toast.success('Akun Admin Demo (admin@brevet.local) diisi!');
                    }}
                    className="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-600/40 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                        👨‍💼 Admin Demo
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        Admin
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">admin@brevet.local</p>
                  </button>
                </div>

                {/* Dropdown list if expanded */}
                {showDevAccounts && (
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl space-y-1.5 animate-fade-in">
                    <div className="px-2 py-1 flex items-center justify-between border-b border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Daftar Akun Database & Demo ({devUsers.length})
                      </span>
                      <span className="text-[10px] text-amber-400">Klik Auto-Fill / 1-Klik</span>
                    </div>

                    {devUsers.map((u) => (
                      <div
                        key={u.id}
                        className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                        onClick={() => {
                          setForm({
                            fullName: u.fullName,
                            email: u.email,
                            password: u.role === 'admin' ? 'admin123456' : 'siswa123456',
                          });
                          setShowDevAccounts(false);
                          toast.success(`Form diisi dengan akun ${u.email}!`);
                        }}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 truncate">
                              {u.fullName}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 truncate">{u.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLogin(u);
                          }}
                          disabled={quickLoggingIn === u.id}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow transition flex items-center gap-1 shrink-0"
                          title="Masuk langsung 1-klik tanpa password"
                        >
                          {quickLoggingIn === u.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <>
                              <UserCheck size={11} />
                              <span>1-Klik</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail size={14} className="text-blue-400" />
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock size={14} className="text-blue-400" />
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password akun Anda"
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Masuk...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-bold text-white">Buat Akun Siswa Baru</h2>
                <p className="text-xs text-slate-400">
                  Daftar gratis untuk mencatat progres materi & skor ujian
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <User size={14} className="text-blue-400" />
                    Nama Lengkap
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Contoh: Muhammad Reza"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Mail size={14} className="text-blue-400" />
                    Alamat Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock size={14} className="text-blue-400" />
                    Kata Sandi (Minimal 6 Karakter)
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password baru Anda"
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Membuat Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Quick link to public learning */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <Link
              href="/belajar"
              className="text-xs text-slate-400 hover:text-blue-400 flex items-center justify-center gap-1.5 transition"
            >
              <BookOpen size={13} />
              <span>Akses Modul Belajar Langsung (Mode Publik)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
