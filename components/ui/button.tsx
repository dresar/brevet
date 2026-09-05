'use client';

import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, type HTMLMotionProps } from 'motion/react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#3B82F6] hover:bg-[#2563EB] text-white border border-[#3B82F6] hover:border-[#2563EB] shadow-md shadow-blue-500/10 font-medium',
  secondary:
    'bg-[#111827] hover:bg-[#172030] text-[#E2E8F0] hover:text-white border border-[#1F2937] hover:border-[#334155] font-medium',
  ghost:
    'bg-transparent hover:bg-[#111827] text-[#94A3B8] hover:text-white border border-transparent hover:border-[#1F2937] font-medium',
  danger:
    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 font-medium',
  outline:
    'bg-transparent hover:bg-[#111827] text-[#E2E8F0] hover:text-white border border-[#1F2937] hover:border-[#334155] font-medium',
  success:
    'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 font-medium',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2 rounded-lg gap-2',
  lg: 'text-sm px-5 py-2.5 rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      loading = false,
      disabled,
      children,
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref as any}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'inline-flex items-center justify-center font-medium border transition-all duration-150 relative overflow-hidden select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B1220]',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...(props as any)}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
