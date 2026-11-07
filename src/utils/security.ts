/**
 * Güvenlik ve Veri Sızıntısı Önleme Katmanı (XSS, Injection ve PII Koruması)
 */

export function sanitizeUserText(input: string, maxLength = 180): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>`"']/g, '') // HTML ve attribute enjeksiyon karakterlerini temizle
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/[\u0000-\u001F\u007F]/g, '') // Kontrol karakterlerini temizle
    .slice(0, maxLength);
}

export function sanitizeBarcode(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 24);
}

export function sanitizeTcKimlik(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[^0-9]/g, '').slice(0, 11);
}

export function normalizeWhatsAppNumber(input: string): string {
  const digits = input.replace(/[^0-9]/g, '');
  if (digits.startsWith('905') && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith('05') && digits.length === 11) {
    return '9' + digits;
  }
  if (digits.startsWith('5') && digits.length === 10) {
    return '90' + digits;
  }
  return digits.slice(0, 13);
}

export function isValidTurkishMobile(input: string): boolean {
  const norm = normalizeWhatsAppNumber(input);
  return /^905[0-9]{9}$/.test(norm);
}

export function sanitizeInstagramHandle(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const cleaned = input
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 30);
  return cleaned;
}

export function isValidInstagramHandle(input: string): boolean {
  const clean = sanitizeInstagramHandle(input);
  return /^[a-zA-Z0-9._]{2,30}$/.test(clean);
}

export function buildSafeContactUrl(
  channel: 'whatsapp' | 'instagram',
  rawValue: string
): string | null {
  if (channel === 'whatsapp') {
    const phone = normalizeWhatsAppNumber(rawValue);
    if (!/^905[0-9]{9}$/.test(phone)) return null;
    return `https://wa.me/${phone}`;
  }
  if (channel === 'instagram') {
    const handle = sanitizeInstagramHandle(rawValue);
    if (!/^[a-zA-Z0-9._]{2,30}$/.test(handle)) return null;
    return `https://www.instagram.com/${encodeURIComponent(handle)}/`;
  }
  return null;
}
