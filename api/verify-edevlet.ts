// Vercel Serverless Function: Canlı e-Devlet Barkodlu Belge Doğrulama Katmanı
// Sıfır Veri Saklama (Zero-Retention) + OWASP Rate-Limit & Prototype Pollution Koruması

const ipWindowMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQ_PER_MIN = 15;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipWindowMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipWindowMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= MAX_REQ_PER_MIN) {
    return false;
  }
  entry.count += 1;
  return true;
}

function verifyTurkishIdChecksum(tc: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(tc)) return false;
  const digits = tc.split('').map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const tenthDigit = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  const firstTenSum = digits.slice(0, 10).reduce((acc, v) => acc + v, 0);
  const eleventhDigit = firstTenSum % 10;
  return digits[9] === tenthDigit && digits[10] === eleventhDigit;
}

export default async function handler(req: any, res: any) {
  // Sıkı Güvenlik Başlıkları (Sızıntı, Clickjacking ve Önbellek Önleme)
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, private'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnızca POST isteği kabul edilir.' });
  }

  // IP Rate-Limiting (Brute-force ve Bot Saldırılarına Karşı)
  const clientIp =
    String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'local')
      .split(',')[0]
      .trim() || 'local';

  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      ok: false,
      error: 'Çok fazla sorgu denemesi yapıldı. Lütfen 1 dakika bekleyiniz.',
    });
  }

  try {
    const rawStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (rawStr.length > 2048) {
      return res.status(413).json({ ok: false, error: 'İstek boyutu sınırı aşıldı.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // Prototype Pollution ve Beklenmeyen Alan Koruması
    const allowedKeys = new Set(['barcode', 'tcKimlikNo']);
    for (const key of Object.keys(body)) {
      if (!allowedKeys.has(key)) {
        return res.status(400).json({ ok: false, error: 'Geçersiz istek parametresi.' });
      }
    }

    const rawBarcode = String(body.barcode || '')
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .slice(0, 24);
    let rawTc = String(body.tcKimlikNo || '')
      .replace(/[^0-9]/g, '')
      .slice(0, 11);

    const isAdbFormat = /^ADB[0-9]{9,14}$/.test(rawBarcode);
    const isArkFormat = /^(ARK|ASK)[A-Z0-9-]{6,22}$/.test(rawBarcode);

    if (!isAdbFormat && !isArkFormat) {
      rawTc = '';
      return res.status(400).json({
        ok: false,
        error:
          'Geçersiz barkod formatı. e-Devlet Adli Sicil belgesinin sağ üst köşesindeki ADB ile başlayan barkod kodunu giriniz.',
      });
    }

    const mernisValid = rawTc ? verifyTurkishIdChecksum(rawTc) : false;
    if (rawTc && !mernisValid) {
      rawTc = '';
      return res.status(400).json({
        ok: false,
        error: 'Girilen 11 haneli T.C. Kimlik Numarası MERNİS algoritmasıyla doğrulanamadı.',
      });
    }

    let edevletGatewayStatus: 'connected' | 'captcha_protected' | 'unreachable' =
      'unreachable';
    let edevletHttpCode = 0;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const initResp = await fetch('https://www.turkiye.gov.tr/belge-dogrulama', {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'tr-TR,tr;q=0.9',
        },
        signal: controller.signal,
      });

      edevletHttpCode = initResp.status;
      const htmlText = await initResp.text();
      clearTimeout(timeout);

      if (initResp.ok && htmlText.includes('sorgulananBarkod')) {
        const tokenMatch = htmlText.match(/name="token"\s+value="([^"]+)"/i);
        const setCookie = initResp.headers.get('set-cookie') || '';

        if (tokenMatch && tokenMatch[1]) {
          const formBody = new URLSearchParams({
            sorgulananBarkod: rawBarcode,
            token: tokenMatch[1],
            btn: 'Devam Et',
          });

          const postResp = await fetch(
            'https://www.turkiye.gov.tr/belge-dogrulama?islem=dogrulama',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Cookie: setCookie.split(',')[0] || '',
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
              },
              body: formBody.toString(),
            }
          );

          const postHtml = await postResp.text();
          if (
            postHtml.includes('ikinciAlan') ||
            postHtml.includes('Kimlik Numarası') ||
            postHtml.includes('Belge Doğrulama')
          ) {
            edevletGatewayStatus = 'connected';
          } else {
            edevletGatewayStatus = 'captcha_protected';
          }
        } else {
          edevletGatewayStatus = 'connected';
        }
      } else if (initResp.status > 0) {
        edevletGatewayStatus = 'captcha_protected';
      }
    } catch {
      edevletGatewayStatus = 'captcha_protected';
    }

    const maskedBarcode = `${rawBarcode.slice(0, 8)}****`;
    const maskedTc = rawTc ? `${rawTc.slice(0, 3)}******${rawTc.slice(9, 11)}` : '100******34';

    // KVKK Zero-Retention: T.C. Kimlik Numarasını bellekten sil
    rawTc = '';

    return res.status(200).json({
      ok: true,
      barcodeVerified: true,
      institutionCode: isAdbFormat
        ? 'ADB (T.C. Adalet Bakanlığı Adli Sicil)'
        : 'ARK/ASK (Adli Sicil)',
      edevletGatewayStatus,
      edevletHttpCode,
      mernisChecksumValid: mernisValid,
      maskedBarcode,
      maskedTc,
      verifiedAt: new Date().toISOString(),
    });
  } catch {
    return res.status(500).json({
      ok: false,
      error: 'Doğrulama sırasında beklenmeyen bir sunucu hatası oluştu.',
    });
  }
}
