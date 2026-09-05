import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

const DEMO_ACCOUNTS = [
  {
    id: 'demo-student-1',
    email: 'siswa@brevet.local',
    fullName: 'Muhammad Reza (Siswa Demo)',
    role: 'user',
    password: 'siswa123456',
  },
  {
    id: 'demo-student-2',
    email: 'siti.pajak@brevet.local',
    fullName: 'Siti Nurhaliza (Siswa Demo)',
    role: 'user',
    password: 'siswa123456',
  },
  {
    id: 'demo-admin-1',
    email: 'admin@brevet.local',
    fullName: 'Admin Utama (Administrator)',
    role: 'admin',
    password: 'admin123456',
  },
];

// GET /api/auth/dev-login — list demo and real users
export async function GET() {
  try {
    let dbUsers: any[] = [];
    try {
      dbUsers = await db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          role: users.role,
        })
        .from(users)
        .limit(10);
    } catch {
      dbUsers = [];
    }

    // Combine or fallback to demo accounts
    const allUsers = [...DEMO_ACCOUNTS];
    dbUsers.forEach((u) => {
      if (!allUsers.some((demo) => demo.email === u.email)) {
        allUsers.push({
          id: u.id,
          email: u.email,
          fullName: u.fullName || u.email,
          role: u.role || 'user',
          password: 'password123',
        });
      }
    });

    return NextResponse.json({ ok: true, users: allUsers });
  } catch (err: any) {
    return NextResponse.json({ ok: true, users: DEMO_ACCOUNTS });
  }
}

// POST /api/auth/dev-login — 1-Click Quick Login
export async function POST(req: NextRequest) {
  try {
    const { userId, email, role } = await req.json();

    const targetAccount =
      DEMO_ACCOUNTS.find((a) => a.id === userId || a.email === email) || {
        id: userId || 'demo-user',
        email: email || 'siswa@brevet.local',
        fullName: 'Siswa Demo',
        role: role || 'user',
      };

    // Ensure user exists in database if possible
    let existingUser = null;
    try {
      const [u] = await db
        .select()
        .from(users)
        .where(eq(users.email, targetAccount.email));
      existingUser = u;

      if (!existingUser) {
        const passwordHash = await hashPassword('siswa123456');
        const [created] = await db
          .insert(users)
          .values({
            email: targetAccount.email,
            passwordHash,
            fullName: targetAccount.fullName,
            role: targetAccount.role,
          })
          .returning();
        existingUser = created;
      }
    } catch {
      // Offline / fallback dummy session
      existingUser = {
        id: targetAccount.id,
        email: targetAccount.email,
        fullName: targetAccount.fullName,
        role: targetAccount.role,
      };
    }

    const token = await signToken({
      sub: existingUser.id,
      role: existingUser.role || targetAccount.role || 'user',
    });

    const res = NextResponse.json({
      ok: true,
      message: `Login berhasil sebagai ${existingUser.fullName}`,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        fullName: existingUser.fullName,
        role: existingUser.role || targetAccount.role,
      },
    });

    setAuthCookie(res, token);
    return res;
  } catch (err: any) {
    console.error('Dev login error:', err);
    return NextResponse.json({ error: 'Gagal login cepat.' }, { status: 500 });
  }
}
