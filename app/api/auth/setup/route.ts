import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { setupSchema } from '@/lib/validators';
import { count } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Check if any users exist
    const [{ value: userCount }] = await db
      .select({ value: count() })
      .from(users);

    if (Number(userCount) > 0) {
      return NextResponse.json(
        { error: 'Setup telah selesai. Akun admin sudah ada.' },
        { status: 409 }
      );
    }

    // Validate body
    const body = await req.json();
    const parsed = setupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data tidak valid', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { fullName, email, password } = parsed.data;

    // Create admin user
    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName: fullName.trim(),
        role: 'admin',
      })
      .returning({ id: users.id, role: users.role });

    // Sign JWT and set cookie
    const token = await signToken({ sub: newUser.id, role: newUser.role ?? 'admin' });
    const response = NextResponse.json({ ok: true });
    setAuthCookie(response, token);

    return response;
  } catch (err) {
    console.error('[setup]', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
