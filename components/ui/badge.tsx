import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'active'
  | 'error'
  | 'disabled'
  | 'draft'
  | 'tayang'
  | 'pemula'
  | 'menengah'
  | 'lanjut'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantMap: Record<BadgeVariant, string> = {
  active:   'badge-active',
  error:    'badge-error',
  disabled: 'badge-disabled',
  draft:    'badge-draft',
  tayang:   'badge-tayang',
  pemula:   'bg-blue-950/60 text-blue-400 border border-blue-700/40',
  menengah: 'bg-amber-950/60 text-amber-400 border border-amber-700/40',
  lanjut:   'bg-purple-950/60 text-purple-400 border border-purple-700/40',
  default:  'bg-slate-800 text-slate-400 border border-slate-700',
};

const sizeMap = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ variant = 'default', children, className, size = 'md' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantMap[variant],
        sizeMap[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status badge helper for modules
export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === 'tayang' ? 'tayang' : 'draft'}>
      {status === 'tayang' ? '● Tayang' : '○ Draft'}
    </Badge>
  );
}

// API key status badge
export function KeyStatusBadge({ status }: { status: string }) {
  const labelMap: Record<string, string> = {
    active: '✓ Aktif',
    error: '✗ Error',
    disabled: '⊘ Nonaktif',
  };
  return (
    <Badge variant={status as BadgeVariant}>
      {labelMap[status] ?? status}
    </Badge>
  );
}

// Difficulty badge
export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const labelMap: Record<string, string> = {
    pemula: '🌱 Pemula',
    menengah: '🔥 Menengah',
    lanjut: '⚡ Lanjut',
  };
  return (
    <Badge variant={difficulty as BadgeVariant} size="sm">
      {labelMap[difficulty] ?? difficulty}
    </Badge>
  );
}
