'use client';

let activeUtterance: SpeechSynthesisUtterance | null = null;
let isSpeakingState = false;
let currentPlaylistCancel: (() => void) | null = null;

/**
 * Strips HTML tags, Markdown symbols, and URLs for clean natural speech
 */
export function cleanSpeechText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_~]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds the best Indonesian Male Voice in Chrome / Browser
 */
export function getIndonesianMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();

  // 1. Look for male Indonesian voices (e.g. Microsoft Ardi, Google Indonesian Male)
  const maleIndo = voices.find(
    (v) =>
      v.lang.toLowerCase().includes('id') &&
      (v.name.toLowerCase().includes('ardi') ||
        v.name.toLowerCase().includes('male') ||
        v.name.toLowerCase().includes('pria') ||
        v.name.toLowerCase().includes('laki'))
  );
  if (maleIndo) return maleIndo;

  // 2. Look for Google Bahasa Indonesia
  const googleIndo = voices.find(
    (v) => v.lang.toLowerCase().includes('id') && v.name.toLowerCase().includes('google')
  );
  if (googleIndo) return googleIndo;

  // 3. Look for any Indonesian voice
  const anyIndo = voices.find((v) => v.lang.toLowerCase().includes('id') || v.lang.toLowerCase().includes('indonesia'));
  if (anyIndo) return anyIndo;

  return voices[0] || null;
}

/**
 * Speaks a single text string using Chrome's built-in male Indonesian voice
 */
export function speakText(
  rawText: string,
  optionsOrOnEnd?:
    | {
        onStart?: () => void;
        onEnd?: () => void;
        onError?: () => void;
      }
    | (() => void),
  onErrorCallback?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

  stopSpeech();

  const text = cleanSpeechText(rawText);
  if (!text) return false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  utterance.rate = 0.98; // Natural pace
  utterance.pitch = 0.88; // Masculine pitch

  const voice = getIndonesianMaleVoice();
  if (voice) {
    utterance.voice = voice;
  }

  const isFn = typeof optionsOrOnEnd === 'function';
  const onStart = !isFn && optionsOrOnEnd ? optionsOrOnEnd.onStart : undefined;
  const onEnd = isFn ? optionsOrOnEnd : optionsOrOnEnd?.onEnd;
  const onError = isFn ? onErrorCallback : optionsOrOnEnd?.onError;

  utterance.onstart = () => {
    isSpeakingState = true;
    onStart?.();
  };

  utterance.onend = () => {
    isSpeakingState = false;
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn('[Chrome Speech] Utterance error:', e);
    isSpeakingState = false;
    activeUtterance = null;
    onError?.();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Stops any ongoing speech synthesis immediately
 */
export function stopSpeech(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  if (currentPlaylistCancel) {
    currentPlaylistCancel();
    currentPlaylistCancel = null;
  }

  window.speechSynthesis.cancel();
  activeUtterance = null;
  isSpeakingState = false;
}

/**
 * Reads a list of paragraphs continuously (Read Full Module playlist)
 */
export function readFullModulePlaylist(
  paragraphs: string[],
  onParagraphChange?: (index: number) => void,
  onFinish?: () => void
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return () => {};

  stopSpeech();

  let isCancelled = false;
  let currentIndex = 0;

  const cancel = () => {
    isCancelled = true;
    window.speechSynthesis.cancel();
    activeUtterance = null;
    isSpeakingState = false;
  };

  currentPlaylistCancel = cancel;

  const playNext = () => {
    if (isCancelled || currentIndex >= paragraphs.length) {
      currentPlaylistCancel = null;
      onFinish?.();
      return;
    }

    const currentText = cleanSpeechText(paragraphs[currentIndex]);
    if (!currentText) {
      currentIndex++;
      playNext();
      return;
    }

    onParagraphChange?.(currentIndex);

    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.98;
    utterance.pitch = 0.88;

    const voice = getIndonesianMaleVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (!isCancelled) {
        currentIndex++;
        setTimeout(playNext, 350);
      }
    };

    utterance.onerror = () => {
      if (!isCancelled) {
        currentIndex++;
        setTimeout(playNext, 350);
      }
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  playNext();
  return cancel;
}
