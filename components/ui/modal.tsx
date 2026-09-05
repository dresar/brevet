'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
};

export function Modal({ open, onClose, title, children, size = 'md', className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Trap scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          style={{ background: 'rgba(11, 18, 32, 0.82)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={cn(
              'w-full relative rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
              sizeClasses[size],
              className
            )}
            style={{
              background: '#111827',
              border: '1px solid #1F2937',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0"
                style={{ borderColor: '#1F2937' }}
              >
                <h3 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-heading)' }}>
                  {title}
                </h3>
                <button
                  id="modalCloseBtn"
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-default hover:bg-[#172030] hover:text-white text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* No title — still show close button */}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-lg transition-default hover:bg-slate-800 z-10 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}

            {/* Content */}
            <div className="p-3.5 sm:p-5 overflow-y-auto custom-scrollbar flex-1 min-h-0">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
              variant === 'danger'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            )}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">{title}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
