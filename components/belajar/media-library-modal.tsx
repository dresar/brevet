'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Upload,
  Search,
  Copy,
  Check,
  Filter,
  ImageIcon,
  Video,
  RefreshCw,
  ExternalLink,
  Play,
  Images,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function MediaLibraryModal({ isOpen, onClose }: MediaLibraryModalProps) {
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedKeyId, setSelectedKeyId] = useState<string>('');

  // Fetch Cloudinary keys for selection
  const { data: keysData } = useQuery({
    queryKey: ['cloudinary-keys'],
    queryFn: async () => {
      const res = await fetch('/api/keys');
      const data = await res.json();
      const cloudinaryKeys = data.keys ? data.keys.filter((k: any) => k.provider === 'cloudinary') : [];
      if (cloudinaryKeys.length > 0 && !selectedKeyId) {
        setSelectedKeyId(cloudinaryKeys[0].id);
      }
      return cloudinaryKeys;
    }
  });

  // Fetch media
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: filter });
      if (search) params.set('search', search);
      if (selectedKeyId) params.set('keyId', selectedKeyId);

      const res = await fetch(`/api/cloudinary?${params}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setResources(data.resources || []);
      } else {
        toast.error(data.error || 'Gagal memuat media.');
      }
    } catch {
      toast.error('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  }, [filter, search, selectedKeyId]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Upload handler
  const handleUpload = async (files: FileList | File[]) => {
    let fileArray = Array.from(files);
    if (!fileArray.length) return;

    if (fileArray.length > 30) {
      toast.warning('Upload massal dibatasi maksimal 30 media. Sisa file akan diabaikan.');
      fileArray = fileArray.slice(0, 30);
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: fileArray.length });
    let successCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress({ current: i + 1, total: fileArray.length });

      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'brevet');
      if (selectedKeyId) fd.append('keyId', selectedKeyId);
      try {
        const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (res.ok) {
          successCount++;
        } else {
          toast.error(`Gagal upload "${file.name}": ${data.error}`);
        }
      } catch {
        toast.error(`Error upload "${file.name}"`);
      }

      // Jeda 2 detik antar gambar jika bukan file terakhir
      if (i < fileArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setUploading(false);
    setUploadProgress(null);
    if (successCount > 0) {
      toast.success(`✅ ${successCount} file berhasil diupload!`);
      fetchMedia();
    }
  };

  const handleCopyLink = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('🔗 Link disalin ke clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border animate-fade-in"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <Images size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                Media Library
              </h2>
              <p className="text-[11px] sm:text-xs hidden xs:block" style={{ color: 'var(--text-muted)' }}>
                Pilih gambar/video yang sudah diupload atau upload file baru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            >
              <Upload size={14} /> <span className="hidden xs:inline">Upload Media</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <div className="flex items-center gap-3">
            {keysData && keysData.length > 0 && (
              <select
                value={selectedKeyId}
                onChange={(e) => setSelectedKeyId(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm border transition-all"
                style={{
                  background: 'var(--bg-base)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-body)',
                }}
              >
                {keysData.map((key: any) => (
                  <option key={key.id} value={key.id}>
                    {key.name || 'Unknown'}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-body)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={20} />
            </button>
          </div>
          </div>
        </div>

        {/* ── Toolbar: Filter & Search ── */}
        <div className="flex items-center justify-between gap-2.5 px-4 sm:px-6 py-2.5 border-b shrink-0 flex-wrap" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
          {/* Type Filters */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            {(['all', 'image', 'video'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-all"
                style={{
                  background: filter === t ? '#1D4ED8' : 'var(--bg-surface)',
                  color: filter === t ? '#fff' : 'var(--text-muted)',
                }}
              >
                {t === 'all' && <Filter size={12} />}
                {t === 'image' && <ImageIcon size={12} />}
                {t === 'video' && <Video size={12} />}
                {t === 'all' ? 'Semua' : t === 'image' ? 'Gambar' : 'Video'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Cari nama file..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border bg-slate-900 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={fetchMedia} loading={loading}>
              <RefreshCw size={13} />
            </Button>
          </div>
        </div>

        {/* ── Dropzone Banner ── */}
        <div
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleUpload(e.dataTransfer.files); }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className="mx-4 sm:mx-6 mt-3 p-2.5 sm:p-3 rounded-xl border-2 border-dashed text-center text-xs transition-all cursor-pointer"
          style={{
            borderColor: dragOver ? '#3B82F6' : 'var(--border)',
            background: dragOver ? 'rgba(59,130,246,0.08)' : 'var(--bg-base)',
            color: 'var(--text-muted)',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="font-medium">
            {uploading 
              ? `Mengupload media... ${uploadProgress ? `(${uploadProgress.current}/${uploadProgress.total})` : ''}` 
              : '📂 Seret & lepas file di sini untuk upload, atau klik di sini'}
          </p>
        </div>

        {/* ── Media Grid ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {loading && resources.length === 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl animate-pulse bg-slate-800/60" />
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <ImageIcon size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Belum ada media ditemukan</p>
              <p className="text-xs mt-1">Upload gambar atau video baru di atas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {resources.map((r) => {
                const isVideo = r.resource_type === 'video';
                const name = r.public_id.split('/').pop() ?? r.public_id;
                const thumbnailUrl = isVideo
                  ? r.secure_url.replace(/\/upload\//, '/upload/so_0/').replace(/\.[^/.]+$/, '.jpg')
                  : r.secure_url;
                const isCopied = copiedId === r.public_id;

                return (
                  <div
                    key={r.public_id}
                    className="group relative rounded-xl overflow-hidden border bg-slate-900/90 border-slate-800 transition-all hover:border-blue-500/50"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative h-28 overflow-hidden bg-slate-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailUrl}
                        alt={name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          if (isVideo) {
                            (e.target as HTMLImageElement).src = r.secure_url.replace(/\.[^/.]+$/, '.jpg');
                          }
                        }}
                      />

                      {/* Video badge */}
                      {isVideo && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-mono text-blue-300 font-bold flex items-center gap-1">
                          <Play size={10} className="fill-blue-400 text-blue-400" />
                          {r.format.toUpperCase()}
                        </div>
                      )}

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          onClick={() => handleCopyLink(r.secure_url, r.public_id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md"
                        >
                          {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          {isCopied ? 'Tersalin' : 'Salin Link'}
                        </button>
                        <a
                          href={r.secure_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                          title="Buka media"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>

                    {/* Card Footer Info */}
                    <div className="p-2.5 space-y-1.5">
                      <p className="text-xs font-medium text-slate-200 truncate" title={name}>
                        {name}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{formatBytes(r.bytes)}</span>
                        <button
                          onClick={() => handleCopyLink(r.secure_url, r.public_id)}
                          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                        >
                          {isCopied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                          {isCopied ? 'Tersalin!' : 'Salin Link'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
