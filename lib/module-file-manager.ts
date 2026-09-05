import fs from 'fs';
import path from 'path';
import type { Modul } from './module-types';
import { db } from './db';
import { modules } from './schema';

const MODULES_DIR = path.join(process.cwd(), 'data', 'modules');

/**
 * Ensures the data/modules directory exists (if filesystem is writable).
 */
function ensureModulesDir() {
  try {
    if (!fs.existsSync(MODULES_DIR)) {
      fs.mkdirSync(MODULES_DIR, { recursive: true });
    }
  } catch (err) {
    // Read-only filesystem on serverless (e.g. Vercel)
  }
}

/**
 * Saves a module JSON content to data/modules/[slug].json
 * On Vercel / Serverless environments, filesystem is read-only (EROFS).
 * Disk save will log a warning and return null without crashing database updates.
 */
export function saveModuleToFile(slug: string, content: Modul): string | null {
  try {
    ensureModulesDir();
    const filePath = path.join(MODULES_DIR, `${slug}.json`);
    const jsonString = JSON.stringify(content, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf-8');
    return filePath;
  } catch (err: any) {
    console.warn(`[ModuleFileManager] File write skipped on serverless env (${err?.code || err?.message}) for ${slug}.json`);
    return null;
  }
}

/**
 * Reads a module JSON content from data/modules/[slug].json
 */
export function getModuleFromFile(slug: string): Modul | null {
  try {
    const filePath = path.join(MODULES_DIR, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileData) as Modul;
    }
  } catch (err) {
    console.error(`[ModuleFileManager] Error reading module file ${slug}.json:`, err);
  }
  return null;
}

/**
 * Deletes a module file data/modules/[slug].json AND any matching root .json files.
 */
export function deleteModuleFile(slug: string, kode?: string): boolean {
  let deletedAny = false;
  try {
    ensureModulesDir();

    // 1. Delete data/modules/[slug].json if exists
    if (slug) {
      const filePath = path.join(MODULES_DIR, `${slug}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deletedAny = true;
      }
    }

    // 2. Scan data/modules and root .json for matching kode or slug and delete them
    const candidatePaths: string[] = [];
    if (fs.existsSync(MODULES_DIR)) {
      const files = fs.readdirSync(MODULES_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          candidatePaths.push(path.join(MODULES_DIR, file));
        }
      }
    }
    const rootJsonPath = path.join(process.cwd(), '.json');
    if (fs.existsSync(rootJsonPath)) {
      candidatePaths.push(rootJsonPath);
    }

    for (const itemPath of candidatePaths) {
      try {
        if (fs.existsSync(itemPath)) {
          const content = fs.readFileSync(itemPath, 'utf-8');
          const parsed = JSON.parse(content);
          const root = (parsed?.modul ?? parsed) as { kode?: string; slug?: string };

          if (root && typeof root === 'object') {
            const matchesSlug = Boolean(slug && root.slug && root.slug.toLowerCase() === slug.toLowerCase());
            const matchesKode = Boolean(kode && root.kode && root.kode.toUpperCase() === kode.toUpperCase());

            if (matchesSlug || matchesKode) {
              fs.unlinkSync(itemPath);
              deletedAny = true;
              console.log(`[ModuleFileManager] Deleted matching JSON file: ${itemPath}`);
            }
          }
        }
      } catch {
        // Skip unparseable files
      }
    }
  } catch (err) {
    console.error(`[ModuleFileManager] Error deleting module file ${slug}:`, err);
  }
  return deletedAny;
}

export interface SavedModuleFileMatch {
  jsonString: string;
  fileName: string;
  modul: Modul;
}

/**
 * Searches data/modules/*.json and root .json for a file matching the module kode or slug.
 */
export function findModuleJsonByKode(kode: string, targetSlug?: string): SavedModuleFileMatch | null {
  try {
    ensureModulesDir();
    const candidatePaths: { path: string; name: string }[] = [];

    // 1. Scan data/modules directory
    if (fs.existsSync(MODULES_DIR)) {
      const files = fs.readdirSync(MODULES_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          candidatePaths.push({ path: path.join(MODULES_DIR, file), name: file });
        }
      }
    }

    // 2. Scan root directory for .json files
    const rootJsonPath = path.join(process.cwd(), '.json');
    if (fs.existsSync(rootJsonPath)) {
      candidatePaths.push({ path: rootJsonPath, name: '.json' });
    }

    // Match candidate files
    for (const item of candidatePaths) {
      try {
        const content = fs.readFileSync(item.path, 'utf-8');
        const parsed = JSON.parse(content);
        const root = (parsed?.modul ?? parsed) as { kode?: string; slug?: string };

        if (root && typeof root === 'object') {
          // Check kode match (e.g. BRVT-AB-01)
          if (root.kode && typeof root.kode === 'string' && root.kode.toUpperCase() === kode.toUpperCase()) {
            return {
              jsonString: JSON.stringify(parsed, null, 2),
              fileName: item.name,
              modul: parsed as Modul,
            };
          }
          // Check slug match
          if (targetSlug && root.slug && typeof root.slug === 'string' && root.slug.toLowerCase() === targetSlug.toLowerCase()) {
            return {
              jsonString: JSON.stringify(parsed, null, 2),
              fileName: item.name,
              modul: parsed as Modul,
            };
          }
        }
      } catch {
        // Skip unparseable files
      }
    }
  } catch (err) {
    console.error(`[ModuleFileManager] Error finding module JSON for kode ${kode}:`, err);
  }
  return null;
}

/**
 * Syncs any saved disk module JSON files from data/modules and root .json into SQLite database table "modules".
 */
export async function syncDiskModulesToDb() {
  try {
    ensureModulesDir();
    const candidatePaths: string[] = [];

    if (fs.existsSync(MODULES_DIR)) {
      const files = fs.readdirSync(MODULES_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          candidatePaths.push(path.join(MODULES_DIR, file));
        }
      }
    }

    const rootJsonPath = path.join(process.cwd(), '.json');
    if (fs.existsSync(rootJsonPath)) {
      candidatePaths.push(rootJsonPath);
    }

    for (const p of candidatePaths) {
      try {
        const raw = fs.readFileSync(p, 'utf-8');
        const content = JSON.parse(raw) as Modul;
        const m = (content?.modul ?? content) as unknown as Record<string, unknown>;

        if (m && typeof m === 'object' && m.kode && m.slug) {
          await db
            .insert(modules)
            .values({
              code: String(m.kode),
              title: String(m.judul || m.kode),
              slug: String(m.slug),
              category: String(m.kategori || 'Dasar'),
              difficulty: String(m.tingkat_kesulitan || 'pemula'),
              estimatedMinutes: Number(m.estimasi_menit) || 120,
              contentJson: content as unknown as Record<string, unknown>,
              status: 'tayang',
            })
            .onConflictDoUpdate({
              target: modules.code,
              set: {
                contentJson: content as unknown as Record<string, unknown>,
                title: String(m.judul || m.kode),
                slug: String(m.slug),
                status: 'tayang',
              },
            });
        }
      } catch (err) {
        console.error(`[ModuleFileManager] Error syncing disk file ${p} to DB:`, err);
      }
    }
  } catch (err) {
    console.error(`[ModuleFileManager] Error running syncDiskModulesToDb:`, err);
  }
}

// Cache flag — ensures restoreModulesFromDbToDisk runs only once per server process lifetime.
let _restoreHasRun = false;

/**
 * Automatically restores any missing module files to data/modules from the Neon Database.
 * This acts as a backup system if Vercel or the user deletes the local files.
 * Runs only ONCE per server process lifetime to avoid redundant DB queries on every request.
 */
export async function restoreModulesFromDbToDisk() {
  // Skip entirely if already ran in this server process
  if (_restoreHasRun) return;
  _restoreHasRun = true;

  try {
    ensureModulesDir();
    const allModulesInDb = await db.select({ slug: modules.slug, contentJson: modules.contentJson }).from(modules);
    
    let restoredCount = 0;
    for (const m of allModulesInDb) {
      if (m.slug && m.contentJson) {
        const filePath = path.join(MODULES_DIR, `${m.slug}.json`);
        if (!fs.existsSync(filePath)) {
          // File is missing, restore it from DB
          const jsonString = JSON.stringify(m.contentJson, null, 2);
          fs.writeFileSync(filePath, jsonString, 'utf-8');
          restoredCount++;
          console.log(`[Backup Restore] Restored missing file for module: ${m.slug}`);
        }
      }
    }
    
    if (restoredCount > 0) {
      console.log(`[Backup Restore] Successfully restored ${restoredCount} module files from database.`);
    } else {
      console.log(`[Backup Restore] All module files intact, no restore needed.`);
    }
  } catch (err) {
    _restoreHasRun = false; // Allow retry on error
    console.error(`[Backup Restore] Error restoring modules from DB to disk:`, err);
  }
}
