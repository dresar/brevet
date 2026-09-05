'use client';

import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium"
            style={{ color: 'var(--text-body)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150',
            'border focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]',
            'placeholder:text-slate-600',
            error
              ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500'
              : 'border-[#1F2937] hover:border-[#334155]',
            className
          )}
          style={{
            background: '#0d1424',
            color: 'var(--text-heading)',
          }}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium"
            style={{ color: 'var(--text-body)' }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 resize-y min-h-[80px]',
            'border focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6]',
            'placeholder:text-slate-600',
            error
              ? 'border-red-500/60 focus:ring-red-500/30 focus:border-red-500'
              : 'border-[#1F2937] hover:border-[#334155]',
            className
          )}
          style={{
            background: '#0d1424',
            color: 'var(--text-heading)',
          }}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
