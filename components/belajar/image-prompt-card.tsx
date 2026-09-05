'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Copy,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Maximize2,
  Trash2,
  Image as ImageIcon,
  Save,
  Loader2,
  X,
  Plus,
  Sparkles,
} from 'lucide-react';
import type { Gambar } from '@/lib/module-types';
import { toast } from 'sonner';
import { ImageLightboxModal } from './image-lightbox-modal';

interface ImagePromptCardProps {
  gambar: Gambar;
  sectionId?: string;
  moduleSlug?: string;
  onImageUpdated?: () => void;
}

export function ImagePromptCard({
  gambar,
  sectionId,
  moduleSlug,
  onImageUpdated,
}: ImagePromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string | null>(gambar.url_gambar || null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showForm, setShowForm] = useState(!gambar.url_gambar);
  const [showPromptDetails, setShowPromptDetails] = useState(!gambar.url_gambar && !activeUrl);
  const [inputTab, setInputTab] = useState<'url' | 'file'>('url');

  // Synchronize state if gambar.url_gambar prop changes
  useEffect(() => {
    if (gambar.url_gambar) {
      setActiveUrl(gambar.url_gambar);
      setShowForm(false);
      setShowPromptDetails(false);
    }
  }, [gambar.url_gambar]);

  // Input states
  const [cdnUrl, setCdnUrl] = useState('');
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Spotlight Ref
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse move handler for Spotlight effect (React Bits style)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(gambar.prompt);
    setCopied(true);
    toast.success('Prompt AI gambar berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle local file selection -> convert to Base64 preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save image URL or file base64 to DB via API
  const handleSaveImage = async () => {
    const targetUrl = inputTab === 'url' ? cdnUrl.trim() : previewFileUrl;
    if (!targetUrl) {
      toast.error('Silakan isi URL CDN atau pilih file gambar terlebih dahulu.');
      return;
    }

    setIsSaving(true);
    try {
      if (moduleSlug && sectionId) {
        const res = await fetch('/api/modules/update-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleSlug,
            sectionId,
            imageId: gambar.id,
            urlGambar: targetUrl,
          }),
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Gagal menyimpan gambar');
      }

      setActiveUrl(targetUrl);
      setShowForm(false);
      setShowPromptDetails(false);
      setCdnUrl('');
      setPreviewFileUrl(null);
      toast.success('Gambar berhasil disimpan dan diperbarui di database!');
      onImageUpdated?.();
    } catch (err: unknown) {
      toast.error('Gagal menyimpan: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete/Remove Image
  const handleDeleteImage = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return;

    setIsDeleting(true);
    try {
      if (moduleSlug && sectionId) {
        const res = await fetch('/api/modules/update-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleSlug,
            sectionId,
            imageId: gambar.id,
            urlGambar: null,
          }),
        });

        if (!res.ok) throw new Error('Gagal menghapus gambar di server.');
      }

      setActiveUrl(null);
      setShowForm(true);
      setShowPromptDetails(true);
      toast.success('Gambar berhasil dihapus.');
      onImageUpdated?.();
    } catch (err: unknown) {
      toast.error('Gagal menghapus: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="group relative rounded-xl overflow-hidden transition-all duration-300 shadow-md"
        style={{
          border: '1px solid #1F2937',
          background: '#111827',
          // Spotlight effect custom properties
          backgroundImage:
            'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.08), transparent 80%)',
        }}
      >
        {/* ── Active Image Display ── */}
        {activeUrl ? (
          <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800">
            {/* Corner Delete Button (Small Top-Right Button) */}
            <button
              onClick={handleDeleteImage}
              disabled={isDeleting}
              className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-lg bg-slate-900/90 text-slate-400 hover:text-red-400 hover:bg-slate-800 border border-slate-700/70 hover:border-red-500/50 backdrop-blur transition-all shadow-md"
              title="Hapus / Reset Gambar"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
            </button>

            {/* Image Thumbnail with Click-to-Zoom */}
            <div
              className="relative cursor-pointer overflow-hidden group/img bg-[#090d1a] flex items-center justify-center p-2 sm:p-4 border-b border-slate-800/80"
              onClick={() => setIsLightboxOpen(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeUrl}
                alt={gambar.alt ?? gambar.keterangan ?? 'Gambar modul'}
                className="w-full h-auto max-h-[540px] aspect-video object-contain rounded-xl shadow-2xl transition-transform duration-300 group-hover/img:scale-[1.01]"
              />

              {/* Hover Zoom Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900/90 text-white text-xs font-semibold border border-slate-700/80 shadow-2xl backdrop-blur-md">
                  <Maximize2 size={15} className="text-blue-400" />
                  Perbesar Gambar Fullscreen
                </span>
              </div>
            </div>

            {/* Caption & Action bar */}
            <div className="px-3.5 py-3 bg-slate-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-800/80 gap-2.5">
              {gambar.keterangan ? (
                <p className="text-xs text-slate-300 italic leading-relaxed w-full sm:w-auto flex-1 min-w-0">
                  📌 {gambar.keterangan}
                </p>
              ) : <div className="hidden sm:block flex-1" />}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                <button
                  onClick={() => setShowPromptDetails((p) => !p)}
                  className="text-xs text-slate-300 hover:text-white font-medium transition-default flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 shadow-sm flex-1 sm:flex-none"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>{showPromptDetails ? 'Sembunyikan Prompt' : 'Lihat Prompt AI'}</span>
                </button>
                <button
                  onClick={() => setShowForm((s) => !s)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-default flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 shadow-sm flex-1 sm:flex-none"
                >
                  {showForm ? 'Batal Edit' : 'Ganti Gambar'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder area when image is missing */
          <div className="p-5 border-b border-slate-800 bg-slate-900/40">
            <div className="rounded-xl p-6 text-center border border-dashed border-slate-700/80 bg-slate-950/60 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ImageIcon size={24} />
              </div>
              <p className="text-sm font-semibold text-white">Gambar Belum Dibuat / Diunggah</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Gunakan prompt AI di bawah untuk generate gambar di AI Generator (Midjourney / DALL-E / Flux / Leonardo AI), lalu masukkan URL CDN atau unggah di bawah ini.
              </p>
            </div>
          </div>
        )}

        {/* ── Form Upload / CDN URL Input Section ── */}
        {showForm && (
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Upload size={14} className="text-blue-400" />
                Unggah / Hubungkan Gambar Ke Modul
              </span>

              {/* Tabs */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setInputTab('url')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    inputTab === 'url'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔗 URL CDN
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('file')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    inputTab === 'file'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📁 File Lokal
                </button>
              </div>
            </div>

            {/* Tab Content: URL CDN */}
            {inputTab === 'url' ? (
              <div className="space-y-2">
                <div className="relative flex items-center">
                  <LinkIcon size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
                  <input
                    type="url"
                    value={cdnUrl}
                    onChange={(e) => setCdnUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/cloud_name/image/upload/v1/brevet/gambar.jpg"
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-placeholder)' }}>
                  Salin URL dari <strong>Media Library</strong> di admin panel, atau tempel URL gambar langsung dari Cloudinary.
                </p>
              </div>
            ) : (
              /* Tab Content: Local File Upload */
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
                {previewFileUrl && (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-700 max-h-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewFileUrl} alt="Preview" className="w-full object-cover h-36" />
                    <button
                      onClick={() => setPreviewFileUrl(null)}
                      className="absolute top-1 right-1 p-1 rounded bg-black/70 text-white hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Save Button */}
            <div className="flex justify-end gap-2 pt-1">
              {activeUrl && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Batal
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveImage}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-md"
              >
                {isSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                {isSaving ? 'Menyimpan...' : 'Simpan Ke Database'}
              </button>
            </div>
          </div>
        )}

        {/* ── Prompt Section (Collapsible when image is already uploaded) ── */}
        {showPromptDetails && (
          <div className="p-3.5 sm:p-4 space-y-3 border-t border-slate-800/80 bg-slate-950/40 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                🎨 Prompt AI Image
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {!showForm && activeUrl && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white border border-slate-800 bg-slate-900 transition-all"
                  >
                    <Plus size={12} />
                    Form Upload
                  </button>
                )}

                <button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:border-blue-500/50"
                  style={{
                    background: copied ? 'rgba(16,185,129,0.1)' : '#0d1424',
                    border: '1px solid #1F2937',
                    color: copied ? '#10B981' : '#94A3B8',
                  }}
                >
                  {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  {copied ? 'Tersalin' : 'Salin Prompt'}
                </button>
              </div>
            </div>

            <pre className="text-xs p-3.5 rounded-xl overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono border border-slate-800 bg-[#090d16] text-blue-300 selection:bg-blue-600 selection:text-white">
              {gambar.prompt}
            </pre>

            {gambar.alt && (
              <p className="text-[11px] text-slate-500">
                Alt Text: <span className="text-slate-400">{gambar.alt}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Lightbox Zoom Modal ── */}
      {activeUrl && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          src={activeUrl}
          alt={gambar.alt ?? 'Gambar Modul'}
          caption={gambar.keterangan ?? undefined}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}
