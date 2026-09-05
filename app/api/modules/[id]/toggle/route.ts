import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { modules } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// POST /api/modules/[id]/toggle — flip status draft <-> tayang
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const [current] = await db
    .select({ status: modules.status })
    .from(modules)
    .where(eq(modules.id, id))
    .limit(1);

  if (!current) {
    return NextResponse.json({ error: 'Modul tidak ditemukan.' }, { status: 404 });
  }

  const newStatus = current.status === 'tayang' ? 'draft' : 'tayang';

  await db
    .update(modules)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(modules.id, id));

  return NextResponse.json({ ok: true, status: newStatus });
}
