import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { verifyPassword, hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

const DEMO_USERS: Record<string, { role: string; fullName: string; defaultPass: string }> = {
  'siswa@brevet.local': { role: 'user', fullName: 'Muhammad Reza (Siswa Demo)', defaultPass: 'siswa123456' },
  'siti.pajak@brevet.local': { role: 'user', fullName: 'Siti Nurhaliza (Siswa Demo)', defaultPass: 'siswa123456' },
  'admin@brevet.local': { role: 'admin', fullName: 'Admin Utama', defaultPass: 'admin123456' },
  'admin@contoh.com': { role: 'admin', fullName: 'Admin Utama', defaultPass: 'admin123456' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Data login tidak valid' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if demo user
    const demoInfo = DEMO_USERS[cleanEmail];

    // Find user in database
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail))
      .limit(1);

    // If user does not exist in DB but is a demo account, auto-create seamlessly
    if (!user && demoInfo) {
      const passwordHash = await hashPassword(demoInfo.defaultPass);
      const [created] = await db
        .insert(users)
        .values({
          email: cleanEmail,
          passwordHash,
          fullName: demoInfo.fullName,
          role: demoInfo.role,
        })
        .returning();
      user = created;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai. Silakan daftar jika belum punya akun.' },
        { status: 401 }
      );
    }

    // Verify password: Check real password OR demo default password bypass
    const isDemoPass = demoInfo && (password === demoInfo.defaultPass || password === 'admin123456' || password === 'siswa123456');
    const isValid = isDemoPass || (await verifyPassword(password, user.passwordHash));

    if (!isValid) {
      return NextResponse.json(
        { error: 'Kata sandi tidak sesuai. Silakan coba lagi.' },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = await signToken({
      sub: user.id,
      role: user.role ?? demoInfo?.role ?? 'user',
    });

    const response = NextResponse.json({
      ok: true,
      message: 'Login berhasil!',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (err: any) {
    console.error('[login error]', err);
    return NextResponse.json(
      { error: 'Terjadi kendala pada server saat proses login.' },
      { status: 500 }
    );
  }
}
