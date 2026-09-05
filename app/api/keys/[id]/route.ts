import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiKeys } from '@/lib/schema';
import { requireAdmin } from '@/lib/middleware-auth';
import { updateKeySchema } from '@/lib/validators';
import { maskApiKey } from '@/lib/utils';
import { eq, and, ne } from 'drizzle-orm';

export const runtime = 'nodejs';

// PUT /api/keys/[id] — update key
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateKeySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data tidak valid', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updateData: Partial<typeof apiKeys.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name.trim();
  if (parsed.data.keyValue !== undefined) {
    const kv = parsed.data.keyValue.trim();
    if (kv !== '{ Konfigurasi Cloudinary }' && !kv.includes('Kunci Disembunyikan') && !kv.includes('****')) {
      // Check for duplicates
      const existingKey = await db.query.apiKeys.findFirst({
        where: and(eq(apiKeys.keyValue, kv), ne(apiKeys.id, id)),
      });
      if (existingKey) {
        return NextResponse.json({ error: 'Kunci API ini sudah terdaftar sebelumnya.' }, { status: 400 });
      }
      updateData.keyValue = kv;
    }
  }
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  const [updated] = await db
    .update(apiKeys)
    .set(updateData)
    .where(eq(apiKeys.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Kunci tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    key: updated,
  });
}

// DELETE /api/keys/[id] — delete key
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const [deleted] = await db
    .delete(apiKeys)
    .where(eq(apiKeys.id, id))
    .returning({ id: apiKeys.id });

  if (!deleted) {
    return NextResponse.json({ error: 'Kunci tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
