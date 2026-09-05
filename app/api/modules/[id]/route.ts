import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { modules } from '@/lib/schema';
import { requireAuth, requireAdmin } from '@/lib/middleware-auth';
import { eq } from 'drizzle-orm';
import { deleteModuleFile, saveModuleToFile } from '@/lib/module-file-manager';
import type { Modul } from '@/lib/module-types';

export const runtime = 'nodejs';

// GET /api/modules/[id] — full module detail with content_json
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const [module] = await db
    .select()
    .from(modules)
    .where(eq(modules.id, id))
    .limit(1);

  if (!module) {
    return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({ module });
}

// PUT /api/modules/[id] — update module metadata or content
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(modules)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(modules.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
  }

  // Also save updated JSON to data/modules/[slug].json if contentJson was updated
  if (updated.slug && updated.contentJson) {
    try {
      saveModuleToFile(updated.slug, updated.contentJson as unknown as Modul);
    } catch {
      // ignore file write error if DB update succeeded
    }
  }

  return NextResponse.json({ ok: true, module: updated });
}

// DELETE /api/modules/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  // Fetch slug & code BEFORE deleting from DB so we can delete the file too
  const [existing] = await db
    .select({ id: modules.id, slug: modules.slug, code: modules.code })
    .from(modules)
    .where(eq(modules.id, id))
    .limit(1);

  if (!existing) {
    // If not found in DB by id, attempt deletion on disk by slug/code
    deleteModuleFile(id, id);
    return NextResponse.json({ ok: true });
  }

  // Delete from database
  await db.delete(modules).where(eq(modules.id, id));

  // Delete JSON files from disk (data/modules + root .json)
  deleteModuleFile(existing.slug, existing.code);

  return NextResponse.json({ ok: true });
}
