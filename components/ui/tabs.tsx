'use client';

import { cn } from '@/lib/utils';
import { type ReactNode, useState } from 'react';
import { motion } from 'motion/react';

interface TabsProps {
  tabs: Array<{ id: string; label: ReactNode }>;
  children: (activeTab: string) => ReactNode;
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, children, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Tab header */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-4 border relative"
        style={{ background: '#0d1424', borderColor: '#1F2937' }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                'flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors duration-150 relative z-10',
                isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-lg bg-[#111827] border border-[#334155] -z-10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">{children(active)}</div>
    </div>
  );
}

// ── Simple controlled Tabs ──
interface ControlledTabsProps {
  tabs: Array<{ id: string; label: ReactNode }>;
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function ControlledTabs({ tabs, active, onChange, className }: ControlledTabsProps) {
  return (
    <div
      className={cn('flex gap-1 p-1 rounded-xl border relative', className)}
      style={{ background: '#0d1424', borderColor: '#1F2937' }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            id={`ctab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors duration-150 relative z-10',
              isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeControlledTabPill"
                className="absolute inset-0 rounded-lg bg-[#111827] border border-[#334155] -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
