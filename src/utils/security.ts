/**
 * Kurumsal Güvenlik, Girdi Doğrulama ve Veri Sızıntısı Önleme Katmanı
 * (OWASP ASVS Level 2 & 6698 Sayılı KVKK Madde 12 Teknik Tedbirleri)
 */

export const TURKIYE_ILLER: string[] = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Gaziantep',
  'Kocaeli',
  'Mersin',
  'Kayseri',
  'Eskişehir',
  'Samsun',
  'Trabzon',
  'Diyarbakır',
  'Sakarya',
  'Tekirdağ',
  'Muğla',
  'Aydın',
  'Balıkesir',
  'Manisa',
  'Denizli',
  'Hatay',
  'Şanlıurfa',
  'Malatya',
  'Erzurum',
  'Sivas',
  'Kahramanmaraş',
  'Van',
  'Elazığ',
  'Ordu',
  'Giresun',
  'Rize',
  'Çanakkale',
  'Edirne',
  'Kırklareli',
  'Zonguldak',
  'Bolu',
  'Düzce',
  'Afyonkarahisar',
  'Kütahya',
  'Uşak',
  'Isparta',
  'Burdur',
  'Aksaray',
  'Nevşehir',
  'Niğde',
  'Kırıkkale',
  'Kırşehir',
  'Yozgat',
  'Çorum',
  'Amasya',
  'Tokat',
  'Sinop',
  'Kastamonu',
  'Çankırı',
  'Karabük',
  'Bartın',
  'Artvin',
  'Gümüşhane',
  'Bayburt',
  'Erzincan',
  'Tunceli',
  'Bingöl',
  'Muş',
  'Bitlis',
  'Hakkâri',
  'Şırnak',
  'Mardin',
  'Batman',
  'Siirt',
  'Adıyaman',
  'Osmaniye',
  'Kilis',
  'Karaman',
  'Yalova',
  'Bilecik',
  'Ağrı',
  'Kars',
  'Iğdır',
  'Ardahan',
];

export function sanitizeUserText(input: string, maxLength = 180): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>`"';\\]/g, '') // HTML, SQL ve attribute enjeksiyon karakterlerini temizle
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/(__proto__|constructor|prototype)/gi, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
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

export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._%+-@]/g, '')
    .slice(0, 100);
}

export function isValidEmail(input: string): boolean {
  const clean = sanitizeEmail(input);
  return /^[a-z0-9._%+-]{2,64}@[a-z0-9.-]{2,63}\.[a-z]{2,10}$/.test(clean);
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

export function calculateAgeFromBirthDate(birthDateIso: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateIso)) return 24;
  const [y, m, d] = birthDateIso.split('-').map(Number);
  const now = new Date();
  let age = now.getFullYear() - y;
  const monthDiff = now.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d)) {
    age--;
  }
  return Math.max(18, Math.min(95, age));
}

export function isValidAdultBirthDate(birthDateIso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateIso)) return false;
  const [y, m, d] = birthDateIso.split('-').map(Number);
  if (y < 1935 || y > 2008 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const now = new Date();
  let age = now.getFullYear() - y;
  const monthDiff = now.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d)) {
    age--;
  }
  return age >= 18 && age <= 90;
}

export function buildSafeContactUrl(
  channel: 'whatsapp' | 'instagram' | 'email',
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
  if (channel === 'email') {
    const email = sanitizeEmail(rawValue);
    if (!isValidEmail(email)) return null;
    return `mailto:${encodeURIComponent(email)}`;
  }
  return null;
}
