import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { userUpdateSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// PUT /api/users/[id] — update user profile (name, email)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  // Only allow updating self unless admin
  if (auth.id !== id && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Tidak memiliki izin.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = userUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data tidak valid', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { fullName, email } = parsed.data;

  // Check if email is being changed and if it already exists
  if (email && email !== auth.email) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'Email sudah digunakan oleh akun lain.' }, { status: 400 });
    }
  }

  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (fullName !== undefined) updateData.fullName = fullName;
  if (email !== undefined) updateData.email = email;

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
    });

  if (!updated) {
    return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, user: updated });
}
