import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { modules, aiChatHistory } from '@/lib/schema';
import { requireAuth } from '@/lib/middleware-auth';
import { chatSchema } from '@/lib/validators';
import { callGemini } from '@/lib/gemini';
import { eq } from 'drizzle-orm';
import type { Modul } from '@/lib/module-types';
import { getModuleFromFile } from '@/lib/module-file-manager';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Data tidak valid', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { message, module_slug, judul_bagian, riwayat } = parsed.data;

  // Build a concise module context instead of dumping 100,000+ characters of raw JSON
  let moduleContext = '';

  if (module_slug) {
    try {
      let content = getModuleFromFile(module_slug);
      if (!content) {
        const [modulRecord] = await db
          .select()
          .from(modules)
          .where(eq(modules.slug, module_slug))
          .limit(1);
        if (modulRecord?.contentJson) {
          content = modulRecord.contentJson as Modul;
        }
      }

      if (content?.modul) {
        const m = content.modul;
        
        // Find relevant section if user is reading a specific section
        const targetBagian = judul_bagian
          ? (m.bagian || []).find((b) => b.judul.toLowerCase().includes(judul_bagian.toLowerCase()))
          : null;

        if (targetBagian) {
          moduleContext =
            `\n\n=== RELEVANSI MATERI SANGAT PENTING (${m.judul} - ${targetBagian.judul}) ===\n` +
            `Ringkasan Modul: ${m.ringkasan || '-'}\n` +
            `Isi Bagian Ini: ${(targetBagian.paragraf || []).slice(0, 3).join(' ')}\n` +
            (targetBagian.poin_penting?.length ? `Poin Utama: ${targetBagian.poin_penting.join('; ')}\n` : '') +
            (targetBagian.analogi ? `Analogi: ${targetBagian.analogi}\n` : '');
        } else {
          // General concise summary of module sections
          const daftarBagian = (m.bagian || []).map((b) => b.judul).join('; ');
          moduleContext =
            `\n\n=== RELEVANSI MATERI MODUL (${m.judul}) ===\n` +
            `Ringkasan: ${m.ringkasan || '-'}\n` +
            `Daftar Pokok Bahasan: ${daftarBagian}\n`;
        }

        // Trim context to under 2000 chars to guarantee lightning fast AI response
        if (moduleContext.length > 2500) {
          moduleContext = moduleContext.slice(0, 2500) + '...';
        }
      }
    } catch (err) {
      console.error('[AI Chat] Error loading module context:', err);
    }
  }

  // Build system prompt
  let systemPrompt =
    'Kamu adalah AI Tutor Pajak Brevet AB yang SANGAT CERDAS, AKURAT, dan RAMAH untuk PEMULA TOTAL. ' +
    'Jawab pertanyaan user berdasarkan konteks materi modul perpajakan dengan ringkas, tepat, dan mudah dipahami. ' +
    'Gaya bahasa: super santai, nonformal banget, gaul, kayak ngobrol sehari-hari sama bestie atau teman tongkrongan yang pintar (pakai lo/gue atau aku/kamu yang sangat luwes). Jangan kaku sama sekali! ' +
    'PENTING FORMAT TAMPILAN: Kamu WAJIB menggunakan tag HTML kaya warna untuk format jawaban. Gunakan <p> untuk teks biasa. ' +
    'Jika menyebut nama tokoh/pakar (misal Prof. Dr. Rochmat), WAJIB gunakan <span class="tokoh-name">NAMA TOKOH</span>. ' +
    'Jika ada penjelasan inti/paragraf penting, WAJIB bungkus dengan <div class="highlight-box">PENJELASAN PENTING</div>. ' +
    'Gunakan <strong> untuk kata kunci. JANGAN pernah tampilkan simbol markdown mentah seperti ### atau *** atau ---. Jangan sertakan <!DOCTYPE html> atau <html> atau <body>.';

  if (judul_bagian) {
    systemPrompt += ` User saat ini sedang membaca bagian: "${judul_bagian}".`;
  }

  if (moduleContext) {
    systemPrompt += moduleContext;
  }

  // Build messages history (max 6 recent messages to keep context lean and fast)
  const historyMessages = (riwayat ?? []).slice(-6).map((m) => ({
    role: m.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: m.content }],
  }));

  const allMessages = [
    ...historyMessages,
    { role: 'user' as const, parts: [{ text: message }] },
  ];

  // Call Gemini
  const result = await callGemini({
    systemPrompt,
    messages: allMessages,
    maxOutputTokens: 1500,
    temperature: 0.4,
  });

  if (!result.ok) {
    if ('rotated' in result && result.rotated) {
      return NextResponse.json({
        ok: false,
        rotated: true,
        pesan: result.pesan,
        detail: result.detail,
      });
    }
    return NextResponse.json({ ok: false, pesan: result.pesan }, { status: 500 });
  }

  // Save to chat history
  try {
    await db.insert(aiChatHistory).values([
      {
        userId: auth.id,
        moduleSlug: module_slug,
        role: 'user',
        content: message,
      },
      {
        userId: auth.id,
        moduleSlug: module_slug,
        role: 'assistant',
        content: result.teks,
      },
    ]);
  } catch (e) {
    console.error('[chat history save]', e);
  }

  return NextResponse.json({ ok: true, teks: result.teks });
}
