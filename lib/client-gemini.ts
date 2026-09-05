'use client';

import { GoogleGenerativeAI } from '@google/generative-ai';

// ── PRIMARY ENGINE CONFIGURATION (bandelbanget.xyz) ──────────
const PRIMARY_API_ENDPOINT = 'https://bandelbanget.xyz/v1/chat/completions';
const PRIMARY_API_KEY = 'sk-proj-SANITIZED_KEY_PROTECTED';
const PRIMARY_MODEL = 'auto';
const PRIMARY_TIMEOUT_MS = 12000; // 12 seconds max before auto-fallback to Gemini

let cachedKeys: string[] = [];
let currentKeyIndex = 0;

export async function getClientKeyPool(): Promise<string[]> {
  if (cachedKeys.length > 0) return cachedKeys;

  try {
    const res = await fetch('/api/keys/active-pool');
    const data = await res.json();
    if (data.ok && Array.isArray(data.keys) && data.keys.length > 0) {
      cachedKeys = data.keys;
      return cachedKeys;
    }
  } catch (e) {
    console.warn('[Client AI] Failed to fetch Gemini pool:', e);
  }

  return cachedKeys;
}

export interface StreamGeminiOptions {
  systemPrompt: string;
  userPrompt?: string;
  prompt?: string;
  onChunk?: (streamedText: string) => void;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StreamGeminiChatOptions {
  systemPrompt: string;
  history: ChatMessage[];
  message: string;
  onChunk?: (streamedText: string) => void;
  maxOutputTokens?: number;
  temperature?: number;
}

// ── 1. PRIMARY STREAMING CALL (bandelbanget.xyz) ──────────────
async function streamPrimaryOpenAI(
  messages: Array<{ role: string; content: string }>,
  onChunk?: (text: string) => void,
  maxTokens: number = 4000
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PRIMARY_TIMEOUT_MS);

  try {
    const res = await fetch(PRIMARY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PRIMARY_API_KEY}`,
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Primary API error: ${res.status} ${res.statusText}`);
    }

    if (!res.body) {
      throw new Error('No response body from primary API');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let accumulatedReasoning = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const raw = trimmed.replace(/^data:s*/, '');
        if (raw === '[DONE]') continue;

        try {
          const json = JSON.parse(raw);
          const delta = json.choices?.[0]?.delta;
          if (delta?.content) {
            accumulatedContent += delta.content;
            if (onChunk) onChunk(accumulatedContent);
          } else if (delta?.reasoning_content) {
            accumulatedReasoning += delta.reasoning_content;
          }
        } catch {}
      }
    }

    const finalText = (accumulatedContent || accumulatedReasoning).trim();
    if (!finalText) {
      throw new Error('Empty response from primary API');
    }

    return finalText;
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

// ── 2. FALLBACK STREAMING CALL (Google Gemini 3.6 Flash) ──────
async function streamGeminiFallback(
  systemPrompt: string,
  userPrompt: string,
  onChunk?: (text: string) => void,
  maxOutputTokens: number = 4000,
  temperature: number = 0.4
): Promise<string> {
  console.log('🔄 [AI Fallback] Failing over to Google Gemini 3.6 Flash Rotation Pool...');
  const keys = await getClientKeyPool();

  if (!keys || keys.length === 0) {
    throw new Error('Tidak ada kunci API Gemini cadangan yang tersedia.');
  }

  let lastError = '';
  const totalKeys = keys.length;

  for (let attempt = 0; attempt < Math.min(totalKeys, 15); attempt++) {
    const key = keys[(currentKeyIndex + attempt) % totalKeys];
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      });

      const result = await model.generateContentStream(userPrompt);
      let accumulatedText = '';

      for await (const chunk of result.stream) {
        const text = chunk.text();
        accumulatedText += text;
        if (onChunk) {
          onChunk(accumulatedText);
        }
      }

      currentKeyIndex = (currentKeyIndex + attempt) % totalKeys;
      return accumulatedText;
    } catch (err: any) {
      console.warn(`[Client Gemini] Key ${attempt + 1} failed: ${err.message}`);
      lastError = err.message || 'Error koneksi Gemini';
      continue;
    }
  }

  throw new Error('Semua kunci API Gemini di browser gagal: ' + lastError);
}

// ── 3. UNIVERSAL SINGLE PROMPT STREAMER ───────────────────────
export async function streamGeminiClient({
  systemPrompt,
  userPrompt,
  prompt,
  onChunk,
  maxOutputTokens = 4000,
  temperature = 0.3,
}: StreamGeminiOptions): Promise<string> {
  const actualPrompt = userPrompt || prompt || '';

  // 1. Try Primary Engine (bandelbanget.xyz)
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: actualPrompt },
    ];
    return await streamPrimaryOpenAI(messages, onChunk, maxOutputTokens);
  } catch (primaryErr: any) {
    console.warn('⚠️ [AI Engine] Primary engine failed or timed out:', primaryErr.message);
    // 2. Fallback to Gemini 3.6 Flash Rotation Pool
    return await streamGeminiFallback(
      systemPrompt,
      actualPrompt,
      onChunk,
      maxOutputTokens,
      temperature
    );
  }
}

// ── 4. UNIVERSAL MULTI-TURN CHAT STREAMER ─────────────────────
export async function streamGeminiChatClient({
  systemPrompt,
  history,
  message,
  onChunk,
  maxOutputTokens = 4000,
  temperature = 0.4,
}: StreamGeminiChatOptions): Promise<string> {
  // 1. Try Primary Engine (bandelbanget.xyz)
  try {
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.text,
      })),
      { role: 'user', content: message },
    ];

    return await streamPrimaryOpenAI(messages, onChunk, maxOutputTokens);
  } catch (primaryErr: any) {
    console.warn('⚠️ [AI Engine] Primary chat engine failed or timed out:', primaryErr.message);

    // 2. Fallback to Gemini 3.6 Flash Chat
    const keys = await getClientKeyPool();
    if (!keys || keys.length === 0) {
      throw new Error('Tidak ada kunci API Gemini cadangan yang tersedia.');
    }

    let lastError = '';
    const totalKeys = keys.length;

    for (let attempt = 0; attempt < Math.min(totalKeys, 15); attempt++) {
      const key = keys[(currentKeyIndex + attempt) % totalKeys];
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.6-flash',
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature,
            maxOutputTokens,
          },
        });

        const chatHistory = history.map((h) => ({
          role: h.role,
          parts: [{ text: h.text }],
        }));

        const chat = model.startChat({
          history: chatHistory,
        });

        const result = await chat.sendMessageStream(message);
        let accumulatedText = '';

        for await (const chunk of result.stream) {
          const text = chunk.text();
          accumulatedText += text;
          if (onChunk) {
            onChunk(accumulatedText);
          }
        }

        currentKeyIndex = (currentKeyIndex + attempt) % totalKeys;
        return accumulatedText;
      } catch (err: any) {
        lastError = err.message || 'Error koneksi Gemini';
        continue;
      }
    }

    throw new Error('Semua AI cadangan gagal: ' + lastError);
  }
}
