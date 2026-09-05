'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Zone1PromptLibrary from '@/components/admin/import/zone1-prompt-library';
import Zone2JsonImporter from '@/components/admin/import/zone2-json-importer';
import Zone3ModuleShelf from '@/components/admin/import/zone3-module-shelf';

export default function ImportPage() {
  const [editJsonText, setEditJsonText] = useState<string | undefined>();

  // Fetch existing modules for Zone 2 (dropdown) and Zone 3
  const { data: modulesData } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const res = await fetch('/api/modules');
      return res.json() as Promise<{ modules: Array<{ id: string; title: string; code: string }> }>;
    },
  });

  const existingModules = modulesData?.modules ?? [];

  // When user clicks "Edit JSON" in Zone 3 — load JSON into Zone 2 editor
  const handleEditJson = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/modules/${id}`);
      const data = await res.json();
      const jsonStr = JSON.stringify(data.module.contentJson, null, 2);
      setEditJsonText(jsonStr);
      // Scroll to Zone 2
      document.getElementById('zone2')?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
          Impor Modul Belajar
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Salin prompt untuk Claude, generate JSON, lalu impor ke rak modul.
        </p>
      </div>

      {/* ── 2-Column layout for Zone 1 & 2 ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ZONA 1 — Pustaka Prompt */}
        <div
          id="zone1"
          className="card p-5"
          style={{ minHeight: '400px' }}
        >
          <Zone1PromptLibrary />
        </div>

        {/* ZONA 2 — Impor JSON */}
        <div
          id="zone2"
          className="card p-5"
          style={{ minHeight: '400px' }}
        >
          <div className="mb-4">
            <h3 className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>
              📥 Impor JSON Modul
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Paste atau seret file .json hasil dari Claude AI.
            </p>
          </div>
          <Zone2JsonImporter
            existingModules={existingModules}
            initialJson={editJsonText}
            onSaved={() => setEditJsonText(undefined)}
          />
        </div>
      </div>

      {/* ZONA 3 — Rak Modul (full width) */}
      <div id="zone3" className="card p-5">
        <Zone3ModuleShelf onEditJson={handleEditJson} />
      </div>
    </div>
  );
}
