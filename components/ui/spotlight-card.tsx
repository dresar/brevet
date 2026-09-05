'use client';

import { useRef, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  spotlightColor?: string;
  className?: string;
}

export function SpotlightCard({
  children,
  spotlightColor = 'rgba(59, 130, 246, 0.15)',
  className,
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    cardRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        'relative rounded-xl border border-[#1F2937] bg-[#111827] overflow-hidden transition-all duration-200 group',
        className
      )}
      style={{
        backgroundImage:
          'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color, rgba(59, 130, 246, 0.15)), transparent 80%)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
