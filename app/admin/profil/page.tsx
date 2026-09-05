'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User, Lock, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type UserData = { id: string; email: string; fullName: string; role: string };

export default function ProfilPage() {
  const { data } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      return res.json() as Promise<{ user: UserData }>;
    },
  });

  const user = data?.user;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? '');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || 'Gagal menyimpan profil.');
        return;
      }
      toast.success('Profil berhasil diperbarui!');
    } catch {
      toast.error('Terjadi kesalahan.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Konfirmasi password tidak cocok.');
    if (newPassword.length < 8) return toast.error('Password minimal 8 karakter.');
    if (!user) return;

    setSavingPassword(true);
    try {
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error || 'Gagal mengubah password.');
        return;
      }
      toast.success('Password berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Terjadi kesalahan.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-heading)' }}>
          <User size={24} className="text-blue-400" />
          Profil Saya
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Kelola informasi akun Anda.
        </p>
      </div>

      {/* Avatar */}
      <div className="card p-6 flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #0e7490)' }}
        >
          {(user?.fullName?.[0] ?? 'A').toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>
            {user?.fullName ?? '—'}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {user?.email ?? '—'}
          </p>
          <span
            className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
            style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}
          >
            {user?.role ?? 'admin'}
          </span>
        </div>
      </div>

      {/* Edit profile */}
      <form onSubmit={handleSaveProfile} className="card p-6 space-y-4">
        <h2 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
          Informasi Profil
        </h2>
        <Input
          id="profilFullName"
          label="Nama Lengkap"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          id="profilEmail"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" variant="primary" loading={savingProfile}>
          <Save size={15} />
          Simpan Profil
        </Button>
      </form>

      {/* Change password */}
      <form onSubmit={handleChangePassword} className="card p-6 space-y-4">
        <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <Lock size={18} className="text-blue-400" />
          Ubah Password
        </h2>
        <Input
          id="currentPassword"
          label="Password Saat Ini"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          id="newPassword"
          label="Password Baru"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          hint="Minimal 8 karakter"
        />
        <Input
          id="confirmNewPassword"
          label="Konfirmasi Password Baru"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="secondary" loading={savingPassword}>
          <Lock size={15} />
          Ubah Password
        </Button>
      </form>
    </div>
  );
}
