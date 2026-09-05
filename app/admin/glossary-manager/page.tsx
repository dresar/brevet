'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { GlossaryStatsBar } from '@/components/admin/glossary/GlossaryStatsBar';
import { GlossaryBankTab } from '@/components/admin/glossary/GlossaryBankTab';
import { GlossaryClaudeImportTab } from '@/components/admin/glossary/GlossaryClaudeImportTab';
import { GlossaryEditModal, type GlossaryItem } from '@/components/admin/glossary/GlossaryEditModal';

export default function GlossaryManagerPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'bank' | 'ai-external'>('bank');
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GlossaryItem | null>(null);

  // 1. Fetch Glossary & Modules
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-glossary', selectedModuleSlug],
    queryFn: async () => {
      const url = selectedModuleSlug
        ? `/api/admin/glossary?moduleSlug=${selectedModuleSlug}`
        : `/api/admin/glossary`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal memuat glosarium');
      return res.json() as Promise<{
        glossary: GlossaryItem[];
        total: number;
        modules: { id: string; code: string; title: string; slug: string }[];
      }>;
    },
  });

  const glossaryItems = data?.glossary || [];
  const modulesList = data?.modules || [];
  const selectedModule = modulesList.find((m) => m.slug === selectedModuleSlug) || null;

  // 2. Sync mutation (extract from modules)
  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/glossary/sync', { method: 'POST' });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Gagal sinkronisasi');
      return resData;
    },
    onSuccess: (resData) => {
      toast.success(resData.message || 'Berhasil mengunduh & mengekstrak glosarium dari modul!');
      qc.invalidateQueries({ queryKey: ['admin-glossary'] });
    },
    onError: (err: any) => {
      toast.error('Gagal ekstraksi glosarium: ' + err.message);
    },
  });

  // 3. Save single item mutation (create/update)
  const saveItemMutation = useMutation({
    mutationFn: async (item: GlossaryItem) => {
      const isEdit = Boolean(item.id);
      const res = await fetch('/api/admin/glossary', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Gagal menyimpan');
      return resData;
    },
    onSuccess: () => {
      toast.success('Istilah glosarium berhasil disimpan!');
      setIsEditModalOpen(false);
      setEditingItem(null);
      qc.invalidateQueries({ queryKey: ['admin-glossary'] });
    },
    onError: (err: any) => {
      toast.error('Gagal menyimpan: ' + err.message);
    },
  });

  // 4. Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/glossary?id=${id}`, { method: 'DELETE' });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Gagal menghapus');
      return resData;
    },
    onSuccess: () => {
      toast.success('Istilah glosarium berhasil dihapus!');
      qc.invalidateQueries({ queryKey: ['admin-glossary'] });
    },
    onError: (err: any) => {
      toast.error('Gagal menghapus: ' + err.message);
    },
  });

  // 5. Import Batch JSON mutation
  const importJsonMutation = useMutation({
    mutationFn: async ({ jsonString, mode }: { jsonString: string; mode: 'replace' | 'append' }) => {
      const parsed = JSON.parse(jsonString);
      const items = parsed.glosarium || parsed.items || parsed;
      if (!Array.isArray(items)) {
        throw new Error('JSON harus mempunyai properti array "glosarium".');
      }

      const targetSlug = selectedModuleSlug || modulesList[0]?.slug;
      if (!targetSlug) {
        throw new Error('Silakan pilih modul terlebih dahulu.');
      }

      const res = await fetch('/api/admin/glossary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleSlug: targetSlug,
          glosarium: items,
          mode,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Gagal impor JSON');
      return resData;
    },
    onSuccess: (resData) => {
      toast.success(resData.message || 'Glosarium berhasil diimpor ke database!');
      setActiveTab('bank');
      qc.invalidateQueries({ queryKey: ['admin-glossary'] });
    },
    onError: (err: any) => {
      toast.error('Gagal impor: ' + err.message);
    },
  });

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 p-6 space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-cyan-400" size={22} />
              Glosarium Manager
            </h1>
            <p className="text-xs text-slate-400">
              Kelola istilah perpajakan, definisi, dan penjelasan sederhana per modul.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'bank'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={15} />
            <span>Bank Glosarium ({glossaryItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ai-external')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === 'ai-external'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={15} />
            <span>AI External (Claude)</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Header Bar */}
        <GlossaryStatsBar
          totalTerms={glossaryItems.length}
          totalModules={modulesList.length}
          selectedModuleTitle={selectedModule?.title || 'Semua Modul'}
          onSyncFromModules={() => syncMutation.mutate()}
          onAddManual={() => {
            setEditingItem(null);
            setIsEditModalOpen(true);
          }}
          isSyncing={syncMutation.isPending}
        />

        {/* Main Tab View */}
        {activeTab === 'bank' ? (
          <GlossaryBankTab
            items={glossaryItems}
            selectedModuleSlug={selectedModuleSlug}
            onSelectModuleSlug={setSelectedModuleSlug}
            modules={modulesList}
            onEdit={(item) => {
              setEditingItem(item);
              setIsEditModalOpen(true);
            }}
            onDelete={(id) => {
              if (confirm('Yakin ingin menghapus istilah glosarium ini dari database?')) {
                deleteItemMutation.mutate(id);
              }
            }}
          />
        ) : (
          <GlossaryClaudeImportTab
            selectedModule={selectedModule || modulesList[0] || null}
            onImportJson={(jsonString, mode) => importJsonMutation.mutate({ jsonString, mode })}
            isSubmitting={importJsonMutation.isPending}
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      <GlossaryEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={(item) => saveItemMutation.mutate(item)}
        initialItem={editingItem}
        modules={modulesList}
        defaultModuleSlug={selectedModuleSlug || modulesList[0]?.slug || ''}
        isSaving={saveItemMutation.isPending}
      />
    </div>
  );
}
