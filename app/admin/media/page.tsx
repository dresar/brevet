'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Video,
  Upload,
  Search,
  Copy,
  Trash2,
  Eye,
  X,
  Check,
  ChevronRight,
  RefreshCw,
  Filter,
  ExternalLink,
  FileText,
  AlertCircle,
  Play,
  Music,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal'; // Assuming Modal exists, let me check if Modal is in components/ui/modal.tsx

// ── Types ──────────────────────────────────────────────────────
type ResourceType = 'image' | 'video' | 'raw';
interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  resource_type: ResourceType;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
  folder?: string;
  filename?: string;
}

type FilterType = 'all' | 'image' | 'video';

// ── Helpers ────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Main Page ──────────────────────────────────────────────────
export default function MediaPage() {
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedKeyId, setSelectedKeyId] = useState<string>(''); // For Cloudinary account selection
  
  // Fetch keys for Cloudinary provider
  const { data: keysData } = useQuery({
    queryKey: ['api-keys', 'cloudinary'],
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

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [preview, setPreview] = useState<CloudinaryResource | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [credentialsMissing, setCredentialsMissing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch resources
  const fetchResources = useCallback(async (reset = true, cursor?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: filter });
      if (cursor) params.set('next_cursor', cursor);
      if (search) params.set('search', search);
      if (selectedKeyId) params.set('keyId', selectedKeyId);

      const res = await fetch(`/api/cloudinary?${params}`, { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes('credentials')) {
          setCredentialsMissing(true);
        } else {
          toast.error(data.error || 'Gagal memuat media.');
        }
        return;
      }

      setCredentialsMissing(false);
      setResources((prev) => reset ? data.resources : [...prev, ...data.resources]);
      setNextCursor(data.next_cursor);
      setTotalCount(data.total_count);
    } catch {
      toast.error('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  }, [filter, search, selectedKeyId]);

  useEffect(() => {
    fetchResources(true);
  }, [fetchResources]);

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
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'brevet');
      if (selectedKeyId) formData.append('keyId', selectedKeyId);

      try {
        const res = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          successCount++;
        } else {
          toast.error(`Gagal upload "${file.name}": ${data.error}`);
        }
      } catch (err) {
        console.error('Failed to upload', file.name, err);
        toast.error(`Error saat upload "${file.name}"`);
      }

      // Jeda 2 detik antar gambar jika bukan file terakhir
      if (i < fileArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    if (successCount > 0) {
      toast.success(`✅ ${successCount} file berhasil diupload!`);
      fetchResources(true);
    }
  };

  // Delete handler
  const handleDelete = async (resource: CloudinaryResource) => {
    if (!confirm(`Hapus "${resource.public_id}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setDeleting(resource.public_id);
    try {
      const params = new URLSearchParams({ public_id: resource.public_id, resource_type: resource.resource_type });
      if (selectedKeyId) params.set('keyId', selectedKeyId);
      
      const res = await fetch(`/api/cloudinary?${params}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Aset berhasil dihapus.');
        setResources((prev) => prev.filter((r) => r.public_id !== resource.public_id));
        if (preview?.public_id === resource.public_id) setPreview(null);
        setTotalCount((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(data.error || 'Gagal menghapus aset.');
      }
    } catch (err: any) {
      toast.error('Gagal terhubung ke server.');
    } finally {
      setDeleting(null);
    }
  };

  // Delete All handler
  const handleDeleteAll = async () => {
    if (!confirm('AWAS! Anda yakin ingin menghapus SEMUA media di Cloudinary? Tindakan ini tidak bisa dibatalkan.')) return;
    setDeleting('all');
    try {
      const res = await fetch('/api/cloudinary?delete_all=true', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Semua aset berhasil dihapus.');
        setResources([]);
        setTotalCount(0);
        setNextCursor(null);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gagal menghapus semua aset.');
      }
    } catch {
      toast.error('Gagal terhubung ke server.');
    } finally {
      setDeleting(null);
    }
  };

  // Copy URL
  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL disalin!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
  };

  // Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  if (credentialsMissing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <AlertCircle size={48} className="text-amber-400 opacity-80" />
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
          Cloudinary Belum Dikonfigurasi
        </h2>
        <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>
          Isi kredensial Cloudinary di file <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">.env</code> terlebih dahulu:
        </p>
        <div
          className="text-left rounded-xl p-4 font-mono text-xs space-y-1 w-full max-w-md"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-green-400">CLOUDINARY_CLOUD_NAME=&quot;your_cloud_name&quot;</p>
          <p className="text-green-400">CLOUDINARY_API_KEY=&quot;your_api_key&quot;</p>
          <p className="text-green-400">CLOUDINARY_API_SECRET=&quot;your_api_secret&quot;</p>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-placeholder)' }}>
          Dapatkan dari{' '}
          <a href="https://console.cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
            console.cloudinary.com
          </a>{' '}
          → Dashboard
        </p>
        <Button onClick={() => fetchResources(true)} variant="ghost" size="sm">
          <RefreshCw size={13} /> Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
            Media Library
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {totalCount > 0 ? `${totalCount} aset` : 'Loading...'} di Cloudinary
          </p>
        </div>
        <div className="flex items-center gap-2">
          {keysData && keysData.length > 0 && (
            <select
              value={selectedKeyId}
              onChange={(e) => {
                setSelectedKeyId(e.target.value);
              }}
              className="px-3 py-1.5 rounded-lg text-sm border transition-all mr-2"
              style={{
                background: 'var(--bg-base)',
                borderColor: 'var(--border)',
                color: 'var(--text-body)',
              }}
            >
              {keysData.map((key: any) => {
                return (
                  <option key={key.id} value={key.id}>
                    {key.name || 'Unknown'}
                  </option>
                );
              })}
            </select>
          )}
          <Button
            id="mediaDeleteAllBtn"
            variant="danger"
            size="sm"
            onClick={handleDeleteAll}
            disabled={resources.length === 0}
            loading={deleting === 'all'}
          >
            <Trash2 size={14} /> Hapus Semua
          </Button>
          <Button
            id="mediaRefreshBtn"
            variant="ghost"
            size="sm"
            onClick={() => fetchResources(true)}
            loading={loading}
          >
            <RefreshCw size={14} /> Refresh
          </Button>
          <Button
            id="mediaUploadBtn"
            variant="primary"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            loading={uploading}
          >
            <Upload size={14} /> Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      </div>

      {/* ── Upload Modal ── */}
      <Modal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Media Baru" size="md">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className="rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all cursor-pointer mb-2"
          style={{
            borderColor: dragOver ? '#3B82F6' : 'var(--border)',
            background: dragOver ? 'rgba(59,130,246,0.06)' : 'transparent',
            color: dragOver ? '#60A5FA' : 'var(--text-muted)',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={32} className="mx-auto mb-3 opacity-60" />
          <p className="text-base font-medium">
            {uploading 
              ? `Mengupload... ${uploadProgress ? `(${uploadProgress.current}/${uploadProgress.total})` : ''}` 
              : 'Seret & lepas gambar/video/audio di sini, atau klik untuk pilih'}
          </p>
          <p className="text-xs mt-2 opacity-60">PNG, JPG, WebP, GIF, MP4, WebM, MP3, WAV — maks 10 MB per file</p>
        </div>
      </Modal>

      {/* ── Filters & Search ── */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Type Filter */}
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          {(['all', 'image', 'video'] as FilterType[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: filter === t ? '#1D4ED8' : 'var(--bg-surface)',
                color: filter === t ? '#fff' : 'var(--text-muted)',
              }}
            >
              {t === 'all' && <Filter size={12} />}
              {t === 'image' && <ImageIcon size={12} />}
              {t === 'video' && <Video size={12} />}
              {t === 'all' ? 'Semua' : t === 'image' ? 'Gambar' : 'Video / Audio'}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              id="mediaSearchInput"
              type="text"
              placeholder="Cari nama file..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                color: 'var(--text-body)',
              }}
            />
          </div>
          <Button id="mediaSearchBtn" type="submit" variant="ghost" size="sm">
            <Search size={13} />
          </Button>
        </form>
      </div>

      {/* ── Grid ── */}
      {loading && resources.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl animate-pulse"
              style={{ height: 160, background: 'var(--bg-surface)' }}
            />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-muted)' }}>
          <ImageIcon size={40} className="opacity-30" />
          <p className="text-sm">Belum ada media. Upload file pertamamu!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {resources.map((resource) => (
              <MediaCard
                key={resource.public_id}
                resource={resource}
                onPreview={() => setPreview(resource)}
                onCopy={() => handleCopy(resource.secure_url, resource.public_id)}
                onDelete={() => handleDelete(resource)}
                copied={copiedId === resource.public_id}
                deleting={deleting === resource.public_id}
              />
            ))}
          </div>

          {/* Load More */}
          {nextCursor && (
            <div className="flex justify-center pt-2">
              <Button
                id="mediaLoadMoreBtn"
                variant="ghost"
                onClick={() => fetchResources(false, nextCursor)}
                loading={loading}
              >
                Muat Lebih Banyak <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── Preview Modal ── */}
      {preview && (
        <PreviewModal
          resource={preview}
          onClose={() => setPreview(null)}
          onCopy={() => handleCopy(preview.secure_url, preview.public_id)}
          onDelete={() => handleDelete(preview)}
          copied={copiedId === preview.public_id}
          deleting={deleting === preview.public_id}
        />
      )}
    </div>
  );
}

// ── Media Card ────────────────────────────────────────────────
function MediaCard({
  resource,
  onPreview,
  onCopy,
  onDelete,
  copied,
  deleting,
}: {
  resource: CloudinaryResource;
  onPreview: () => void;
  onCopy: () => void;
  onDelete: () => void;
  copied: boolean;
  deleting: boolean;
}) {
  const isVideo = resource.resource_type === 'video' && !['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(resource.format.toLowerCase());
  const isAudio = resource.resource_type === 'video' && ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(resource.format.toLowerCase());
  const name = resource.public_id.split('/').pop() ?? resource.public_id;
  // Cloudinary generates video poster thumbnail by converting extension to .jpg (so_0 extracts first frame)
  const thumbnailUrl = isVideo
    ? resource.secure_url.replace(/\/upload\//, '/upload/so_0/').replace(/\.[^/.]+$/, '.jpg')
    : resource.secure_url;

  return (
    <div
      className="group relative rounded-xl overflow-hidden border transition-all hover:border-blue-500/50 hover:shadow-lg flex flex-col"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Thumbnail */}
      <div
        className="relative cursor-pointer overflow-hidden flex-shrink-0"
        style={{ height: 130, background: '#111827' }}
        onClick={onPreview}
      >
        {isAudio ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-900/50 to-blue-900/50">
            <Headphones size={32} className="text-blue-400 opacity-80" />
            <span className="text-[10px] font-mono text-blue-300 font-bold uppercase tracking-wider">{resource.format}</span>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to secure_url if jpg transformation fails
              if (isVideo && (e.target as HTMLImageElement).src !== resource.secure_url) {
                (e.target as HTMLImageElement).src = resource.secure_url.replace(/\.[^/.]+$/, '.jpg');
              }
            }}
          />
        )}

        {/* Video Badge Overlay */}
        {isVideo && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-blue-300 font-bold flex items-center gap-1 border border-blue-500/30">
            <Play size={10} className="fill-blue-400 text-blue-400" />
            {resource.format.toUpperCase()}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye size={20} className="text-white" />
        </div>
      </div>

      {/* Info + actions */}
      <div className="p-2 flex flex-col flex-1">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-body)' }} title={name}>
          {name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {formatBytes(resource.bytes)} · {resource.format.toUpperCase()}
        </p>
        <div className="flex items-center gap-1 mt-auto pt-2">
          <button
            id={`copyBtn-${resource.public_id.replace(/\//g, '-')}`}
            onClick={onCopy}
            title="Salin URL"
            className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs transition-all hover:bg-blue-500/10"
            style={{ color: copied ? '#34D399' : 'var(--text-muted)' }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Tersalin' : 'Salin'}
          </button>
          <button
            id={`deleteBtn-${resource.public_id.replace(/\//g, '-')}`}
            onClick={onDelete}
            disabled={deleting}
            title="Hapus"
            className="flex items-center justify-center p-1 rounded-lg text-xs transition-all hover:bg-red-500/10 hover:text-red-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Preview Modal ──────────────────────────────────────────────
function PreviewModal({
  resource,
  onClose,
  onCopy,
  onDelete,
  copied,
  deleting,
}: {
  resource: CloudinaryResource;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
  copied: boolean;
  deleting: boolean;
}) {
  const isVideo = resource.resource_type === 'video' && !['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(resource.format.toLowerCase());
  const isAudio = resource.resource_type === 'video' && ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(resource.format.toLowerCase());
  const name = resource.public_id.split('/').pop() ?? resource.public_id;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl animate-fade-in flex flex-col"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>

        {/* Media */}
        <div className="flex flex-col items-center justify-center min-h-[300px] max-h-[60vh] w-full" style={{ background: '#0a0f1a' }}>
          {isVideo ? (
            <video
              src={resource.secure_url}
              controls
              autoPlay
              className="max-h-[60vh] max-w-full"
              style={{ objectFit: 'contain' }}
            />
          ) : isAudio ? (
            <div className="w-full flex flex-col items-center justify-center px-10 gap-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                <Music size={40} className="text-blue-400" />
              </div>
              <audio
                src={resource.secure_url}
                controls
                autoPlay
                className="w-full max-w-md h-12"
              />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resource.secure_url}
              alt={name}
              className="max-h-[60vh] max-w-full object-contain"
            />
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <InfoItem label="Nama" value={name} />
            <InfoItem label="Format" value={resource.format.toUpperCase()} />
            <InfoItem label="Ukuran" value={formatBytes(resource.bytes)} />
            <InfoItem label="Upload" value={formatDate(resource.created_at)} />
            {resource.width && resource.height && (
              <InfoItem label="Dimensi" value={`${resource.width} × ${resource.height}`} />
            )}
            <InfoItem label="Folder" value={resource.folder || '-'} />
            <InfoItem label="Resource" value={resource.resource_type} />
            <InfoItem label="Public ID" value={resource.public_id} mono />
          </div>

          {/* URL Box */}
          <div className="rounded-lg p-3 text-xs font-mono break-all" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            {resource.secure_url}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              id="previewCopyUrlBtn"
              variant="primary"
              size="sm"
              onClick={onCopy}
              className="flex-1"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'URL Tersalin!' : 'Salin URL'}
            </Button>
            <Button
              id="previewOpenBtn"
              variant="ghost"
              size="sm"
              onClick={() => window.open(resource.secure_url, '_blank')}
            >
              <ExternalLink size={13} /> Buka di Tab Baru
            </Button>
            <Button
              id="previewCopyIdBtn"
              variant="ghost"
              size="sm"
              onClick={() => { navigator.clipboard.writeText(resource.public_id); toast.success('Public ID disalin!'); }}
            >
              <FileText size={13} /> Salin Public ID
            </Button>
            <Button
              id="previewDeleteBtn"
              variant="danger"
              size="sm"
              onClick={onDelete}
              loading={deleting}
            >
              <Trash2 size={13} /> Hapus
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Info Item ──────────────────────────────────────────────────
function InfoItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs mb-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p
        className={`text-xs truncate ${mono ? 'font-mono' : 'font-medium'}`}
        style={{ color: 'var(--text-body)' }}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
