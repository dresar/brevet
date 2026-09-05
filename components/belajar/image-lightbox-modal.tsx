'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  caption?: string;
  onClose: () => void;
}

export function ImageLightboxModal({
  isOpen,
  src,
  alt = 'Gambar Modul',
  caption,
  onClose,
}: ImageLightboxModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Mobile Touch States
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null);
  const [pinchStartScale, setPinchStartScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleReset();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setPinchStartDistance(null);
    }
  }, [isOpen]);

  if (!isOpen || !src) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.3, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.3, 0.5));
  const handleRotate = () => setRotation((prev) => prev + 90);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Handlers (Mobile Pinch & Pan)
  const getDistance = (touches: React.TouchEvent['touches']) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    } else if (e.touches.length === 2) {
      setPinchStartDistance(getDistance(e.touches));
      setPinchStartScale(scale);
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && pinchStartDistance !== null) {
      const currentDistance = getDistance(e.touches);
      const diff = currentDistance - pinchStartDistance;
      const newScale = Math.max(0.5, Math.min(pinchStartScale + diff * 0.01, 5));
      setScale(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    if (e.touches.length < 2) {
      setPinchStartDistance(null);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gambar-modul-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(src, '_blank');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in select-none p-2 md:p-8"
      onClick={onClose}
    >
      <div 
        className="flex flex-col w-full h-full max-w-6xl max-h-[95vh] bg-slate-950 border border-slate-800 md:rounded-2xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Bar Controls ── */}
        <div className="w-full flex items-center justify-center px-4 py-3 border-b border-slate-800 bg-slate-900/50 z-10">
          
          {/* Tools */}
          <div className="flex flex-wrap items-center justify-center gap-1 w-full md:w-auto overflow-x-auto">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default"
              title="Perbesar (+)"
            >
              <ZoomIn size={18} />
            </button>

            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default"
              title="Perkecil (-)"
            >
              <ZoomOut size={18} />
            </button>
            
            <button
              onClick={handleRotate}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default"
              title="Putar (Rotate)"
            >
              <RotateCw size={18} />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default"
              title="Reset Ukuran & Rotasi (0)"
            >
              <RefreshCw size={18} />
            </button>

            <div className="w-[1px] h-5 bg-slate-800 mx-1 hidden sm:block" />

            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default flex items-center gap-1.5 text-xs font-medium"
              title="Unduh Gambar"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Unduh</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-default hidden sm:block"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-default sm:ml-2"
              title="Tutup (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Image View Area ── */}
        <div
          className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative cursor-grab active:cursor-grabbing p-4 bg-black/40 touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              maxHeight: '100%',
              maxWidth: '100%',
            }}
            className="object-contain rounded-lg pointer-events-auto"
            draggable={false}
          />
        </div>


      </div>
    </div>
  );
}
