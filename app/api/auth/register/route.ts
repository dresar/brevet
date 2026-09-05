import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/auth';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Data pendaftaran tidak valid' },
        { status: 400 }
      );
    }

    const { email, password, fullName } = parsed.data;

    // Check if email already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));

    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan login atau gunakan email lain.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName: fullName.trim(),
        role: 'user', // regular student role
      })
      .returning();

    const token = await signToken({
      sub: newUser.id,
      role: newUser.role || 'user',
    });

    const response = NextResponse.json({
      ok: true,
      message: 'Pendaftaran berhasil!',
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat pendaftaran.' },
      { status: 500 }
    );
  }
}
