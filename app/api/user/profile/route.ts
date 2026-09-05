import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

// GET /api/user/profile — get authenticated user profile
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, auth.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error('Error loading profile:', err);
    return NextResponse.json({ error: 'Gagal memuat profil' }, { status: 500 });
  }
}

// PUT /api/user/profile — update fullName, email, or password
export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { fullName, email, currentPassword, newPassword } = body;

    // Fetch current user record
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, auth.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };

    // Update fullName
    if (fullName && typeof fullName === 'string' && fullName.trim()) {
      updateData.fullName = fullName.trim();
    }

    // Update email (check uniqueness)
    if (email && typeof email === 'string' && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== currentUser.email) {
        const [existing] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, cleanEmail))
          .limit(1);

        if (existing && existing.id !== auth.id) {
          return NextResponse.json(
            { error: 'Alamat email sudah digunakan oleh akun lain.' },
            { status: 400 }
          );
        }
        updateData.email = cleanEmail;
      }
    }

    // Update password if requested
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Kata sandi baru minimal 6 karakter.' },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Kata sandi saat ini wajib diisi untuk mengubah sandi.' },
          { status: 400 }
        );
      }

      const isCurrentValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: 'Kata sandi saat ini tidak sesuai.' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, auth.id))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
      });

    return NextResponse.json({
      ok: true,
      message: 'Profil berhasil diperbarui!',
      user: updated,
    });
  } catch (err: any) {
    console.error('Error updating profile:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal memperbarui profil.' },
      { status: 500 }
    );
  }
}
