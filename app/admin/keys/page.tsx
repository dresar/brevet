'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Key,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Zap,
  Eye,
  EyeOff,
  ArrowDown,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { KeyStatusBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

type ApiKeyRow = {
  id: string;
  name: string;
  keyValue: string; // masked
  provider: 'gemini' | 'elevenlabs' | 'cloudinary';
  status: string;
  orderIndex: number;
  errorCount: number | null;
  lastError: string | null;
  lastUsedAt: string | null;
  createdAt: string | null;
};

// ── Key Modal (Add / Edit) ────────────────────────────────────
function KeyModal({
  open,
  onClose,
  editKey,
}: {
  open: boolean;
  onClose: () => void;
  editKey?: ApiKeyRow;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState(editKey?.name ?? '');
  const [keyValue, setKeyValue] = useState(editKey?.keyValue ?? '');
  const [provider, setProvider] = useState<'gemini' | 'elevenlabs' | 'cloudinary'>(editKey?.provider as any ?? 'gemini');
  const [showKey, setShowKey] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Cloudinary specific fields
  let initCloudName = '';
  let initCloudApiKey = '';
  let initCloudApiSecret = '';
  if (editKey?.provider === 'cloudinary' && editKey.keyValue) {
    try {
      const parsed = JSON.parse(editKey.keyValue);
      initCloudName = parsed.cloud_name || '';
      initCloudApiKey = parsed.api_key || '';
      initCloudApiSecret = parsed.api_secret || '';
    } catch (e) {}
  }
  const [cloudName, setCloudName] = useState(initCloudName);
  const [cloudinaryApiKey, setCloudinaryApiKey] = useState(initCloudApiKey);
  const [cloudinaryApiSecret, setCloudinaryApiSecret] = useState(initCloudApiSecret);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const isEdit = !!editKey;
      const url = isEdit ? `/api/keys/${editKey.id}` : '/api/keys';
      const method = isEdit ? 'PUT' : 'POST';
      
      let finalName = name.trim();
      if (!finalName) {
        finalName = `Kunci ${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
      }

      let finalKeyValue = keyValue.trim();
      if (provider === 'cloudinary') {
        if (!isEdit && (!cloudName.trim() || !cloudinaryApiKey.trim() || !cloudinaryApiSecret.trim())) {
          setSubmitting(false);
          return toast.error('Semua kredensial Cloudinary wajib diisi.');
        }
        if (cloudName.trim() || cloudinaryApiKey.trim() || cloudinaryApiSecret.trim()) {
           finalKeyValue = JSON.stringify({
             cloud_name: cloudName.trim(),
             api_key: cloudinaryApiKey.trim(),
             api_secret: cloudinaryApiSecret.trim(),
           });
        }
      }

      const body: Record<string, string> = { name: finalName, provider };
      if (finalKeyValue) body.keyValue = finalKeyValue;
      
      if (!isEdit && !finalKeyValue) {
        setSubmitting(false);
        return toast.error('Kunci API wajib diisi.');
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal menyimpan kunci.');
        return;
      }

      toast.success(isEdit ? 'Kunci berhasil diperbarui.' : 'Kunci berhasil ditambahkan.');
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      onClose();
    } catch {
      toast.error('Terjadi kesalahan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editKey ? 'Edit Kunci API' : 'Tambah Kunci API'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="keyName"
          label="Nama Kunci (Opsional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Contoh: Kunci ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
        />

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
            Layanan (Provider)
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            disabled={!!editKey}
            className="w-full px-4 py-2.5 rounded-lg text-sm border transition-all"
            style={{
              background: 'var(--bg-base)',
              borderColor: 'var(--border)',
              color: 'var(--text-body)',
            }}
          >
            <option value="gemini">Google Gemini AI</option>
            <option value="elevenlabs">ElevenLabs TTS</option>
            <option value="cloudinary">Cloudinary Storage</option>
          </select>
        </div>

        {provider === 'cloudinary' ? (
          <div className="space-y-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}>
             <p className="text-xs text-blue-400 mb-2 font-medium">Masukkan Kredensial API Cloudinary</p>
             <Input
               id="cloudName"
               label="Cloud Name"
               value={cloudName}
               onChange={(e) => setCloudName(e.target.value)}
               placeholder="Contoh: dxxxxxxx"
               required={!editKey}
             />
             <div className="space-y-1 relative">
               <label className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>API Key</label>
               <Input
                 type={showKey ? 'text' : 'password'}
                 placeholder="Misal: 123456789012345"
                 value={cloudinaryApiKey}
                 onChange={(e) => setCloudinaryApiKey(e.target.value)}
                 required={!editKey}
               />
             </div>
             <div className="space-y-1 relative">
               <label className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>
                 API Secret {editKey && <span className="opacity-75">(Abaikan jika tak diubah)</span>}
               </label>
               <div className="relative">
                 <Input
                   type={showKey ? 'text' : 'password'}
                   value={cloudinaryApiSecret}
                   onChange={(e) => setCloudinaryApiSecret(e.target.value)}
                   required={!editKey}
                   placeholder={editKey ? '••••••••••••••••' : 'Rahasia API...'}
                 />
                 <button
                   type="button"
                   onClick={() => setShowKey((s) => !s)}
                   className="absolute right-3 top-1/2 -translate-y-1/2"
                   style={{ color: 'var(--text-muted)' }}
                 >
                   {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                 </button>
               </div>
             </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-body)' }}>
              {editKey ? 'Kunci API Baru (kosongkan jika tidak ingin mengubah)' : `Kunci API ${provider === 'gemini' ? 'Gemini' : 'ElevenLabs'}`}
            </label>
            <div className="relative">
              <input
                id="keyValue"
                type={showKey ? 'text' : 'password'}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                required={!editKey}
                placeholder={editKey ? '••••••••••••••••' : 'AIza...'}
                className="w-full pr-10 pl-4 py-2.5 rounded-lg text-sm border transition-all"
                style={{
                  background: 'var(--bg-base)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-body)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {provider === 'gemini' 
                ? 'Kunci Gemini dari Google AI Studio. Disimpan di database untuk rotasi otomatis.' 
                : 'Kunci ElevenLabs API. Digunakan untuk fitur Suara (Text-to-Speech) dengan rotasi otomatis.'}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={submitting} className="flex-1">
            {editKey ? 'Simpan Perubahan' : 'Tambah Kunci'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function KeysPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editKey, setEditKey] = useState<ApiKeyRow | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; detail: string }>>({});
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const { data, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/keys');
      return res.json() as Promise<{ keys: ApiKeyRow[] }>;
    },
  });

  const keys = data?.keys ?? [];
  const invalidKeysCount = keys.filter((k) => k.status === 'error' || k.status === 'disabled').length;

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/keys/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Gagal menghapus kunci.');
        return;
      }
      toast.success('Kunci berhasil dihapus.');
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      setDeleteId(null);
    } catch {
      toast.error('Terjadi kesalahan.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTestAll = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/keys/test', { method: 'POST' });
      const data = await res.json();

      const map: Record<string, { ok: boolean; detail: string }> = {};
      for (const r of data.results ?? []) {
        map[r.id] = { ok: r.ok, detail: r.detail };
      }
      setTestResults(map);

      toast.success(
        `Uji selesai: ${data.summary?.berhasil ?? 0} valid, ${data.summary?.gagal ?? 0} gagal.`
      );
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    } catch {
      toast.error('Gagal menguji kunci.');
    } finally {
      setTesting(false);
    }
  };

  const handleTestSingle = async (keyId: string) => {
    setTestingId(keyId);
    try {
      const res = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: keyId }),
      });
      const data = await res.json();
      const single = (data.results ?? []).find((r: { id: string }) => r.id === keyId);

      if (single) {
        setTestResults((prev) => ({
          ...prev,
          [keyId]: { ok: single.ok, detail: single.detail },
        }));
        if (single.ok) {
          toast.success(`Kunci ${single.name} valid & aktif!`);
        } else {
          toast.error(`Kunci ${single.name} tidak valid: ${single.detail}`);
        }
      }
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    } catch {
      toast.error('Gagal menguji kunci.');
    } finally {
      setTestingId(null);
    }
  };

  const handleCleanupInvalid = async () => {
    setCleaning(true);
    try {
      const res = await fetch('/api/keys/cleanup', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal membersihkan kunci.');
        return;
      }

      toast.success(data.message || 'Kunci rusak berhasil dibersihkan.');
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    } catch {
      toast.error('Gagal membersihkan kunci rusak.');
    } finally {
      setCleaning(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/keys/reset', { method: 'POST' });
      const data = await res.json();
      toast.success(data.message || 'Rotasi direset.');
      setTestResults({});
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    } catch {
      toast.error('Gagal mereset rotasi.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-heading)' }}>
              <Key size={24} className="text-blue-400" />
              Manajemen Kunci API
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30 flex items-center gap-1">
              <Sparkles size={12} className="text-cyan-400" />
              Model: gemini-3.6-flash (.env)
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Kelola kunci Gemini dengan rotasi pintar &amp; auto-failover hingga 5 kunci beruntun per permintaan.
          </p>
        </div>
        <Button
          id="addKeyBtn"
          variant="primary"
          onClick={() => { setEditKey(undefined); setModalOpen(true); }}
        >
          <Plus size={16} />
          Tambah Kunci
        </Button>
      </div>

      {/* Warning banner for invalid keys with 1-click cleanup recommendation */}
      {invalidKeysCount > 0 && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 flex items-center justify-between flex-wrap gap-3 animate-fade-in shadow-md">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-300">
                Rekomendasi Pembersihan Kunci API
              </p>
              <p className="text-xs text-red-200/80">
                Ditemukan <strong>{invalidKeysCount} kunci API</strong> yang berstatus error atau nonaktif (tidak valid). Disarankan untuk menghapusnya agar rotasi berjalan optimal.
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleCleanupInvalid}
            loading={cleaning}
            className="shrink-0"
          >
            <Trash2 size={13} />
            Hapus {invalidKeysCount} Kunci Rusak
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3 flex-wrap">
          <Button
            id="testAllBtn"
            variant="outline"
            onClick={handleTestAll}
            loading={testing}
            size="sm"
          >
            <Zap size={14} />
            Uji Semua Kunci
          </Button>
          <Button
            id="resetRotationBtn"
            variant="ghost"
            onClick={handleReset}
            loading={resetting}
            size="sm"
          >
            <RefreshCw size={14} />
            Reset Rotasi
          </Button>
          {invalidKeysCount > 0 && (
            <Button
              id="cleanupBtn"
              variant="ghost"
              onClick={handleCleanupInvalid}
              loading={cleaning}
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
            >
              <Trash2 size={14} />
              Bersihkan Kunci Rusak ({invalidKeysCount})
            </Button>
          )}
        </div>
        
        {/* Filter Dropdown */}
        <select
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm border transition-all"
          style={{
            background: 'var(--bg-base)',
            borderColor: 'var(--border)',
            color: 'var(--text-body)',
          }}
        >
          <option value="all">Semua Kunci</option>
          <option value="gemini">Google Gemini AI</option>
          <option value="elevenlabs">ElevenLabs TTS</option>
          <option value="cloudinary">Cloudinary Storage</option>
        </select>
      </div>

      {/* Info box */}
      <div
        className="rounded-xl p-4 text-sm"
        style={{ background: 'var(--primary-subtle)', border: '1px solid rgba(59,130,246,0.2)' }}
      >
        <p className="font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'var(--primary)' }}>
          <Sparkles size={15} /> Cara kerja rotasi super pintar (Auto-Failover)
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#93c5fd' }}>
          Sistem mendukung rotasi multi-provider (Gemini, ElevenLabs, Cloudinary). Jika kunci pertama terkena limit (429) atau error, sistem secara otomatis mencoba kunci berikutnya dengan <i>provider</i> yang sama dalam antrian tanpa menghentikan respon user. Kunci rusak otomatis ditandai dan dipindahkan ke antrian paling belakang.
        </p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>No</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Nama</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Kunci</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Error</th>
                  <th className="px-4 py-3 text-left font-medium hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>Dipakai</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Aksi</th>
                </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : keys.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                      Belum ada kunci. Tambahkan kunci pertama Anda.
                    </td>
                  </tr>
                )
                : keys
                    .filter((key) => filterProvider === 'all' || key.provider === filterProvider)
                    .map((key, i) => {
                    const testResult = testResults[key.id];
                    const isError = key.status === 'error' || key.status === 'disabled';
                    return (
                      <tr
                        key={key.id}
                        className={isError ? 'key-row-error' : ''}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.2s',
                        }}
                      >
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                          {i + 1}
                          {i === 0 && key.status === 'active' && (
                            <span
                              className="ml-1 px-1 py-0.5 text-xs rounded"
                              style={{ background: 'var(--success-subtle)', color: 'var(--success)', fontSize: '10px' }}
                            >
                              utama
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-heading)' }}>
                          <div className="flex flex-col gap-1">
                            <span>{key.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 w-fit text-slate-400">
                              {key.provider}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                          {key.provider === 'cloudinary' 
                            ? '{ Konfigurasi Cloudinary }'
                            : key.keyValue?.length > 10 
                              ? key.keyValue.substring(0, 4) + '••••••••' + key.keyValue.slice(-4)
                              : '••••••••'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <KeyStatusBadge status={key.status} />
                            {isError && (
                              <span title="Kunci error/nonaktif — direkomendasikan untuk dihapus">
                                <ArrowDown size={12} className="text-red-400 animate-rotate-down" />
                              </span>
                            )}
                            {testResult && (
                              <span className={testResult.ok ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'} title={testResult.detail}>
                                {testResult.ok ? '✓ Valid' : '✗ Invalid'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {key.errorCount && key.errorCount > 0 ? (
                            <span className="text-red-400 font-medium">{key.errorCount}×</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                          {key.lastError && (
                            <p className="text-xs text-red-400/70 mt-0.5 max-w-[150px] truncate" title={key.lastError}>
                              {key.lastError}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>
                          {key.lastUsedAt ? formatDate(key.lastUsedAt) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              id={`testSingleBtn-${key.id}`}
                              onClick={() => handleTestSingle(key.id)}
                              disabled={testingId === key.id}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-blue-400 transition-all border border-slate-700 flex items-center gap-1"
                              title="Tes Kunci Ini"
                            >
                              <Zap size={12} />
                              <span>{testingId === key.id ? 'Testing...' : 'Tes'}</span>
                            </button>
                            <button
                              id={`editKeyBtn-${key.id}`}
                              onClick={() => { setEditKey(key); setModalOpen(true); }}
                              className="p-1.5 rounded-lg transition-default hover:bg-slate-700"
                              style={{ color: 'var(--text-muted)' }}
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              id={`deleteKeyBtn-${key.id}`}
                              onClick={() => setDeleteId(key.id)}
                              className="p-1.5 rounded-lg transition-default hover:bg-red-950/40 text-red-400/70 hover:text-red-400"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {keys.length > 0 && (
        <div className="flex gap-6 text-sm flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <span>Total: <strong style={{ color: 'var(--text-body)' }}>{keys.length}</strong></span>
          <span>Aktif: <strong className="text-green-400">{keys.filter(k => k.status === 'active').length}</strong></span>
          <span>Error/Nonaktif: <strong className="text-red-400">{invalidKeysCount}</strong></span>
        </div>
      )}

      {/* Modals */}
      <KeyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editKey={editKey}
      />
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Kunci API"
        description="Kunci ini akan dihapus permanen dan tidak bisa dikembalikan. Yakin?"
        confirmText="Ya, Hapus"
        loading={deleteLoading}
      />
    </div>
  );
}
