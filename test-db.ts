import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './lib/schema';
import { eq } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  const id = '4d982d09-7389-422a-829b-46f5a6b610e4';
  const mods = await db.select().from(schema.modules).where(eq(schema.modules.id, id));
  console.log('Module found in DB:', mods.length > 0 ? mods[0].title : 'NONE');
}
main();
