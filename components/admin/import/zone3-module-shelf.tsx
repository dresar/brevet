'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  Eye,
  Edit3,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Download,
  Wand2,
} from 'lucide-react';
import { StatusBadge, DifficultyBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';

type ModuleRow = {
  id: string;
  code: string;
  slug: string;
  title: string;
  category: string | null;
  difficulty: string | null;
  estimatedMinutes: number | null;
  status: string | null;
  progressPersen: number;
  updatedAt: string | null;
};

interface Zone3Props {
  onEditJson?: (id: string) => void;
}

export default function Zone3ModuleShelf({ onEditJson }: Zone3Props) {
  const qc = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle & Duplicate state
  const [toggling, setToggling] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [tiktokTarget, setTiktokTarget] = useState<{ slug: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['modules', search, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/modules?${params}`);
      return res.json() as Promise<{ modules: ModuleRow[] }>;
    },
  });

  const modules = data?.modules ?? [];

  const handleToggle = async (id: string, currentStatus: string) => {
    setToggling(id);
    try {
      const res = await fetch(`/api/modules/${id}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) return toast.error('Gagal mengubah status.');
      toast.success(data.status === 'tayang' ? 'Modul ditayangkan!' : 'Modul disembunyikan.');
      qc.invalidateQueries({ queryKey: ['modules'] });
    } catch {
      toast.error('Terjadi kesalahan.');
    } finally {
      setToggling(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setDuplicating(id);
    try {
      const res = await fetch(`/api/modules/${id}/duplicate`, { method: 'POST' });
      if (!res.ok) return toast.error('Gagal menduplikat modul.');
      toast.success('Modul berhasil diduplikat sebagai draft.');
      qc.invalidateQueries({ queryKey: ['modules'] });
    } catch {
      toast.error('Terjadi kesalahan.');
    } finally {
      setDuplicating(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/modules/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) return toast.error('Gagal menghapus modul.');
      toast.success('Modul berhasil dihapus.');
      qc.invalidateQueries({ queryKey: ['modules'] });
      setDeleteId(null);
    } catch {
      toast.error('Terjadi kesalahan.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportJson = async (id: string, slug: string) => {
    try {
      const res = await fetch(`/api/modules/${id}`);
      const data = await res.json();
      const jsonStr = JSON.stringify(data.module.contentJson, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('JSON diekspor.');
    } catch {
      toast.error('Gagal mengekspor JSON.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>
          🗄️ Rak Modul
        </h3>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {modules.length} modul
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            id="moduleSearchInput"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari modul..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border"
            style={{
              background: 'var(--bg-base)',
              borderColor: 'var(--border)',
              color: 'var(--text-body)',
            }}
          />
        </div>
        <select
          id="statusFilterSelect"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border appearance-none"
          style={{
            background: 'var(--bg-base)',
            borderColor: 'var(--border)',
            color: 'var(--text-body)',
          }}
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="tayang">Tayang</option>
        </select>
      </div>

      {/* Module table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                {['Kode', 'Judul', 'Kategori', 'Status', 'Progres', 'Diperbarui', 'Aksi'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : modules.length === 0
                ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                        Belum ada modul. Gunakan Zona 1 & Zona 2 di atas untuk membuat & mengimpor modul.
                      </td>
                    </tr>
                  )
                : modules.map((m) => (
                    <tr
                      key={m.id}
                      className="transition-default hover:bg-slate-900/50"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        {m.code}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <a
                          href={`/belajar/${m.slug}`}
                          className="hover:underline flex items-center gap-1.5"
                          style={{ color: 'var(--text-heading)' }}
                        >
                          <span>{m.title}</span>
                          <Eye size={13} className="text-slate-400 opacity-60" />
                        </a>
                        {m.difficulty && <DifficultyBadge difficulty={m.difficulty} />}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {m.category ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={m.status ?? 'draft'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${m.progressPersen}%`, background: 'var(--success)' }}
                            />
                          </div>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {m.progressPersen}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {m.updatedAt ? formatDate(m.updatedAt) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Toggle tayang */}
                          <button
                            id={`toggleBtn-${m.id}`}
                            onClick={() => handleToggle(m.id, m.status ?? 'draft')}
                            disabled={toggling === m.id}
                            className="p-1.5 rounded-lg transition-default hover:bg-slate-700"
                            title={m.status === 'tayang' ? 'Sembunyikan' : 'Tayangkan'}
                            style={{ color: m.status === 'tayang' ? 'var(--success)' : 'var(--text-muted)' }}
                          >
                            {m.status === 'tayang' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          {/* Edit Direct Page Link */}
                          <Link
                            id={`editJsonBtn-${m.id}`}
                            href={`/admin/modules/${m.id}/edit`}
                            className="p-1.5 rounded-lg transition-default hover:bg-blue-600/20 text-blue-400"
                            title="Edit Modul & JSON (Halaman Khusus)"
                          >
                            <Edit3 size={14} />
                          </Link>
                          {/* Duplicate */}
                          <button
                            id={`dupBtn-${m.id}`}
                            onClick={() => handleDuplicate(m.id)}
                            disabled={duplicating === m.id}
                            className="p-1.5 rounded-lg transition-default hover:bg-slate-700"
                            title="Duplikat"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Copy size={14} />
                          </button>
                          {/* Export JSON */}
                          <button
                            id={`exportBtn-${m.id}`}
                            onClick={() => handleExportJson(m.id, m.slug)}
                            className="p-1.5 rounded-lg transition-default hover:bg-slate-700"
                            title="Ekspor JSON"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Download size={14} />
                          </button>
                          {/* Prompt TikTok AI */}
                          <Link
                            id={`tiktokBtn-${m.id}`}
                            href="/admin/tiktok-prompts"
                            className="p-1.5 rounded-lg transition-default hover:bg-pink-600/20 text-pink-400"
                            title="Buka Studio Prompt TikTok AI (Halaman Penuh)"
                          >
                            <Wand2 size={14} />
                          </Link>
                          {/* Delete */}
                          <button
                            id={`deleteModBtn-${m.id}`}
                            onClick={() => setDeleteId(m.id)}
                            className="p-1.5 rounded-lg transition-default hover:bg-red-950/40 text-red-400/60 hover:text-red-400"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Modul"
        description="Modul ini dan semua progres terkait akan dihapus permanen. Yakin?"
        confirmText="Ya, Hapus"
        loading={deleteLoading}
      />
    </div>
  );
}
