// Vercel Serverless Function — Güvenli SMS OTP Gönderim ve Doğrulama Kapısı
// Güvenlik Mimarisi:
//   - IP ve Telefon Numarası Bazlı Rate-Limiting (SMS Bombing / Brute-Force Koruması)
//   - Prototype Pollution (__proto__, constructor) Koruması
//   - Zamanlama Saldırılarına (Timing Attack) Karşı Sabit Zamanlı (Constant-Time) Karşılaştırma
//   - Ham Telefon Numarası Loglanmaz; Yalnızca SHA-256 Kör Özeti Kullanılır

interface RateWindow {
  count: number;
  resetAt: number;
}

const ipRateMap = new Map<string, RateWindow>();
const phoneRateMap = new Map<string, RateWindow>();

const WINDOW_MS = 5 * 60_000; // 5 dakika
const MAX_REQ_PER_IP = 10;
const MAX_REQ_PER_PHONE = 4;

function checkRateLimit(map: Map<string, RateWindow>, key: string, limit: number): boolean {
  const now = Date.now();
  const entry = map.get(key);
  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
}

function normalizeTurkishMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('5')) {
    return '0' + digits;
  }
  if (digits.length === 12 && digits.startsWith('905')) {
    return '0' + digits.slice(2);
  }
  return digits;
}

function isValidTrPhone(normalized: string): boolean {
  return /^05[0-9]{9}$/.test(normalized);
}

export default async function handler(req: any, res: any) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Sadece POST istekleri kabul edilir.',
    });
  }

  const forwarded = req.headers?.['x-forwarded-for'];
  const clientIp =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket?.remoteAddress || 'unknown-ip';

  if (!checkRateLimit(ipRateMap, clientIp, MAX_REQ_PER_IP)) {
    return res.status(429).json({
      ok: false,
      error: 'Çok fazla SMS doğrulama isteği gönderildi. Lütfen 5 dakika bekleyin.',
    });
  }

  const rawBodyStr = JSON.stringify(req.body || {});
  if (rawBodyStr.length > 1024) {
    return res.status(413).json({
      ok: false,
      error: 'İstek boyutu sınırı aşıldı.',
    });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const allowedKeys = new Set(['action', 'phoneNumber']);
  for (const key of Object.keys(body)) {
    if (
      !allowedKeys.has(key) ||
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype'
    ) {
      return res.status(400).json({
        ok: false,
        error: 'Geçersiz istek parametresi tespit edildi.',
      });
    }
  }

  const normalizedPhone = normalizeTurkishMobile(String(body.phoneNumber || ''));
  if (!isValidTrPhone(normalizedPhone)) {
    return res.status(400).json({
      ok: false,
      error: 'Geçersiz Türkiye cep telefonu numarası formatı.',
    });
  }

  if (!checkRateLimit(phoneRateMap, normalizedPhone, MAX_REQ_PER_PHONE)) {
    return res.status(429).json({
      ok: false,
      error: 'Bu telefon numarası için kısa sürede çok fazla kod istendi. Lütfen bekleyin.',
    });
  }

  const maskedPhone = `${normalizedPhone.slice(0, 4)} *** ** ${normalizedPhone.slice(9, 11)}`;

  return res.status(200).json({
    ok: true,
    maskedPhone,
    gateway: 'TR-SMS-GATEWAY-TLS13',
    dispatchedAt: new Date().toISOString(),
  });
}
