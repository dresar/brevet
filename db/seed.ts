import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcryptjs';

async function seed() {
  loadEnvConfig(process.cwd());
  console.log('🌱 Starting database seeding...');

  const { db } = await import('../lib/db');
  const { users, apiKeys } = await import('../lib/schema');
  const { eq } = await import('drizzle-orm');

  // 1. Seed default admin user
  const adminEmail = 'admin@brevet.local';
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash('admin123456', 10);
    await db.insert(users).values({
      email: adminEmail,
      fullName: 'Administrator Brevet AB',
      passwordHash,
      role: 'admin',
    });
    console.log('✅ Admin user created: admin@brevet.local / admin123456');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // 2. Seed placeholder Gemini API Key (disabled by default so user can edit it)
  const existingKey = await db.select().from(apiKeys).limit(1);
  if (existingKey.length === 0) {
    await db.insert(apiKeys).values({
      name: 'Key Utama 1 (Starter)',
      keyValue: 'AIzaSy_SANITIZED_KEY_PROTECTED',
      status: 'disabled',
      orderIndex: 0,
    });
    console.log('✅ Starter Gemini API Key placeholder seeded.');
  } else {
    console.log('ℹ️ Gemini API Key table already initialized.');
  }

  console.log('🎉 Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
