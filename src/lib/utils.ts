import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility untuk menggabungkan class Tailwind dengan resolusi konflik clsx & twMerge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format angka ke format mata uang Rupiah Indonesia (IDR)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatCurrency = formatRupiah;

/**
 * Format tanggal ke format standar Indonesia (e.g. 13 November 2026)
 */
export function formatDateIndonesia(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Format tanggal dan waktu lengkap (e.g. 13 November 2026, 14:00 WIB)
 */
export function formatDateTimeIndonesia(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDateIndonesia(d)}, ${new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)} WIB`;
}

