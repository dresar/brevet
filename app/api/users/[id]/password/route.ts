import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { passwordChangeSchema } from '@/lib/validators';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

// PUT /api/users/[id]/password — change password
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  // Only allow changing self password unless admin
  if (auth.id !== id && auth.role !== 'admin') {
    return NextResponse.json({ error: 'Tidak memiliki izin.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = passwordChangeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data tidak valid', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  // Fetch current user hash
  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Password saat ini salah.' }, { status: 400 });
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, id));

  return NextResponse.json({ ok: true, message: 'Password berhasil diubah.' });
}
