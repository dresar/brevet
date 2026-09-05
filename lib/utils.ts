import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format angka ke format Rupiah Indonesia
 * Contoh: formatRupiah(1500000) → "Rp 1.500.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke format Indonesia
 * Contoh: formatDate(new Date()) → "27 Jul 2026, 15:00"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Mask API key: show first 4 and last 4 chars
 * Contoh: "AIza...XYZ123" → "AIza••••••••••••3"
 */
export function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/**
 * Hapus emoji dan ikon dari judul agar rapi dan bersih
 */
export function cleanTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2300}-\u{23FF}]|\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
    .replace(/^\s*[•\-\*><\|\/\\⚙️📁🛡️💰📌💡📊🔑🎯]+\s*/gu, '')
    .trim();
}


/**
 * Format string angka yang sedang diketik user ke format Rupiah Indonesia otomatis
 * Contoh: formatInputRupiah("20000000000") -> "Rp 20.000.000.000"
 */
export function formatInputRupiah(val: string | number): string {
  if (val === null || val === undefined || val === '') return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  if (isNaN(num)) return '';
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Ekstrak angka murni (number) dari input berformat Rupiah
 * Contoh: parseInputNumber("Rp 20.000.000.000") -> 20000000000
 */
export function parseInputNumber(val: string | number): number {
  if (!val) return 0;
  const digits = String(val).replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}
