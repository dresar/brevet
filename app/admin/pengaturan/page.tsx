'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Settings, Database, RefreshCw, Moon, ShieldAlert, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PengaturanPage() {
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; latencyMs?: number; error?: string } | null>(null);

  const { data: healthData, refetch: refetchHealth } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const res = await fetch('/api/admin/health');
      return res.json() as Promise<{ ok: boolean; latencyMs?: number; error?: string; nodeVersion?: string }>;
    },
  });

  const handleTestConnection = async () => {
    setTestingDb(true);
    setDbStatus(null);
    try {
      const res = await fetch('/api/admin/health');
      const data = await res.json();
      setDbStatus(data);
      if (data.ok) {
        toast.success(`Koneksi database sukses! (${data.latencyMs}ms)`);
      } else {
        toast.error('Koneksi database gagal: ' + (data.error || 'Unknown error'));
      }
      refetchHealth();
    } catch {
      toast.error('Gagal menghubungi server.');
      setDbStatus({ ok: false, error: 'Network error' });
    } finally {
      setTestingDb(false);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Cache dan penyimpanan lokal browser berhasil dibersihkan.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-heading)' }}>
          <Settings size={24} className="text-blue-400" />
          Pengaturan Sistem
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Konfigurasi aplikasi, status database Neon PostgreSQL, dan cache lokal.
        </p>
      </div>

      {/* Database Status */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-500/30">
              <Database size={20} />
            </div>
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
                Database Neon PostgreSQL + Drizzle ORM
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Status koneksi dan latensi query serverless.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestConnection}
            loading={testingDb}
          >
            <RefreshCw size={14} className={testingDb ? 'animate-spin' : ''} />
            Test Koneksi
          </Button>
        </div>

        <div className="p-4 rounded-xl space-y-2" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Status Koneksi:</span>
            {(dbStatus ?? healthData) ? (
              (dbStatus ?? healthData)?.ok ? (
                <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                  <CheckCircle2 size={16} /> Terhubung ({ (dbStatus ?? healthData)?.latencyMs }ms)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                  <AlertCircle size={16} /> Gagal Terhubung
                </span>
              )
            ) : (
              <span className="text-amber-400 text-xs">Belum diuji</span>
            )}
          </div>
          {healthData?.nodeVersion && (
            <div className="flex items-center justify-between text-xs pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Node.js Runtime Version:</span>
              <span className="font-mono text-blue-400">{healthData.nodeVersion}</span>
            </div>
          )}
          {(dbStatus?.error || healthData?.error) && (
            <p className="text-xs text-red-300 pt-1 border-t" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
              Error: {dbStatus?.error || healthData?.error}
            </p>
          )}
        </div>
      </div>

      {/* Tema & UI Preferences */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-purple-400 border border-purple-500/30">
            <Moon size={20} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
              Preferensi Tampilan (Dark Mode Exclusive)
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Aplikasi ini dikonfigurasi khusus untuk mode gelap guna kenyamanan membaca materi brevet.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>
            Mode Tema
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-500/40">
            🌙 Dark Mode (Aktif Permanen)
          </span>
        </div>
      </div>

      {/* AI Key Rotation Policy */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-500/30">
            <Cpu size={20} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
              Kebijakan Rotasi Kunci AI Gemini
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Sistem rotasi otomatis saat limit tercapai atau terjadi kendala jaringan (Fetch API non-SDK).
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl space-y-2 text-xs leading-relaxed" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <p>
            • Kunci dengan <strong>order_index</strong> terkecil dan status <strong>active</strong> akan digunakan pertama kali.
          </p>
          <p>
            • Jika terjadi error HTTP 429 (Too Many Requests) atau timeout, sistem otomatis meningkatkan <strong>error_count</strong>, merotasi kunci ke urutan belakang, dan meminta klien untuk retry.
          </p>
          <p>
            • Jika error berturut-turut melebihi 5 kali, status kunci diubah menjadi <strong>error</strong> dan tidak digunakan hingga direset di menu Kunci Gemini.
          </p>
        </div>
      </div>

      {/* Cloudinary Integration Info */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-950/40 text-blue-400 border border-blue-500/30">
            <Settings size={20} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
              Integrasi Cloudinary Media Library
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Penyimpanan & CDN gambar dan video untuk materi modul perpajakan.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl space-y-2 text-xs leading-relaxed" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <p>
            • Media dikelola langsung melalui menu <strong className="text-blue-400">Media Library</strong> di Admin Panel.
          </p>
          <p>
            • Kredensial dibaca dari variabel lingkungan <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">CLOUDINARY_API_KEY</code>, dan <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">CLOUDINARY_API_SECRET</code> di file <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">.env</code>.
          </p>
        </div>
      </div>

      {/* Local Storage & Cache */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950/40 text-red-400 border border-red-500/30">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
              Pemeliharaan & Cache Lokal
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Bersihkan riwayat draft atau pengaturan lokal browser jika terjadi ketidaksinkronan tampilan.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm" style={{ color: 'var(--text-body)' }}>
            Hapus Cache & Storage Browser
          </span>
          <Button variant="danger" size="sm" onClick={handleClearCache}>
            Bersihkan Cache
          </Button>
        </div>
      </div>
    </div>
  );
}
