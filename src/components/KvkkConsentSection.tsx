import React, { useState } from 'react';
import { KvkkConsentRecord } from '../types/domain';
import { Check, Lock, Server, ShieldAlert, FileCheck2 } from 'lucide-react';

interface KvkkConsentSectionProps {
  consent: KvkkConsentRecord;
  onSaveConsent: (updated: KvkkConsentRecord) => void;
  onContinueToQuestionnaire: () => void;
}

export const KvkkConsentSection: React.FC<KvkkConsentSectionProps> = ({
  consent,
  onSaveConsent,
  onContinueToQuestionnaire,
}) => {
  const [c1, setC1] = useState(consent.generalIlluminationAccepted);
  const [c2, setC2] = useState(consent.specialCategoryExplicitConsent);
  const [c3, setC3] = useState(consent.zeroRetentionPdfAccepted);
  const [c4, setC4] = useState(consent.trServerTransferAccepted);

  const allChecked = c1 && c2 && c3 && c4;

  const handleApproveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allChecked) return;
    const now = new Date();
    const record: KvkkConsentRecord = {
      generalIlluminationAccepted: true,
      specialCategoryExplicitConsent: true,
      zeroRetentionPdfAccepted: true,
      trServerTransferAccepted: true,
      consentTimestamp: now.toLocaleString('tr-TR'),
      consentId: `KVKK-TR-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    onSaveConsent(record);
  };

  const handleQuickSelectAll = () => {
    setC1(true);
    setC2(true);
    setC3(true);
    setC4(true);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            HUKUKİ ALTYAPI & VERİ GÜVENLİĞİ PROTOKOLÜ
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-zinc-900">
            6698 Sayılı KVKK Madde 6 Açık Rıza ve Aydınlatma Sözleşmesi
          </h1>
        </div>
        <div className="font-mono text-xs text-zinc-600 border border-zinc-300 bg-white px-3.5 py-2 shrink-0">
          Veri Bölgesi: <strong className="text-zinc-900">TR-İSTANBUL (Yurt İçi Sunucu)</strong>
        </div>
      </div>

      {/* Mimari Güvenlik Özeti: 01 - 04 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-zinc-300 bg-white mb-10">
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-3">01 / MADDE 6 KAPSAMI</span>
          <h3 className="font-semibold text-zinc-900 text-sm mb-2">Özel Nitelikli Veri Ayrımı</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Din, inanç pratiği, felsefi/siyasi görüş (Atatürkçülük, muhafazakârlık vb.) ve kılık-kıyafet tercihleri KVKK m.6 kapsamında ayrı açık rıza ile işlenir.
          </p>
        </div>
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-3">02 / ANONİM HAVUZ</span>
          <h3 className="font-semibold text-zinc-900 text-sm mb-2">Kimlikten Arındırılmış Kayıt</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Anket yanıtlarınız ad-soyad veya telefon bilginizle değil, rastgele üretilen <code className="font-mono">#TR-XXXX</code> aday vekil koduyla eşleşme matrisinde tutulur.
          </p>
        </div>
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-3">03 / SIFIR BELGE SAKLAMA</span>
          <h3 className="font-semibold text-zinc-900 text-sm mb-2">Anlık Adli Sicil Doğrulama</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Yüklenen e-Devlet Adli Sicil PDF dosyası diske kaydedilmez; RAM üzerinde barkod ve kayıt kontrolü yapıldıktan hemen sonra sıfırlanarak imha edilir.
          </p>
        </div>
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-3">04 / YURT İÇİ SUNUCU</span>
          <h3 className="font-semibold text-zinc-900 text-sm mb-2">Türkiye Veri Yerleşimi</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Canlı ortamda tüm kişisel veriler KVKK m.9 sınır ötesi veri aktarım kısıtlamalarına tam uyum için Türkiye sınırları içindeki sunucularda barındırılır.
          </p>
        </div>
      </div>

      {/* Sözleşme Metni Kutusu */}
      <div className="bg-white border border-zinc-300 p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
          <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-800 font-semibold">
            SÖZLEŞME VE AÇIK RIZA METNİ (TAM METİN)
          </h2>
          <span className="font-mono text-[11px] text-zinc-500">Sürüm: 2026.11-TR</span>
        </div>

        <div className="h-64 overflow-y-auto pr-4 text-xs text-zinc-700 space-y-4 leading-relaxed border-b border-zinc-200 pb-6">
          <p>
            <strong>1. VERİ SORUMLUSU VE AMAÇ:</strong> İşbu Aydınlatma Metni ve Açık Rıza Sözleşmesi, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, evlilik ve ciddi ilişki amacıyla oluşturulan Mizan Uyum Havuzu platformuna katılan adayların kişisel verilerinin işlenme şartlarını düzenler.
          </p>
          <p>
            <strong>2. ÖZEL NİTELİKLİ KİŞİSEL VERİLERİN İŞLENMESİ (KVKK MADDE 6):</strong> Platformun temel çalışma mantığı, adaylar arasında evlilikte kritik öneme sahip olan dünya görüşü, dini inanç ve ibadet pratiği, yaşam tarzı, toplumsal değerler (Cumhuriyet/Atatürkçülük hassasiyeti, muhafazakârlık düzeyi, giyim/tesettür tercihi) ve güvenlik doğrulaması (Adli Sicil/Sabıka Kaydı durumu) üzerinden matematiksel uyum analizi yapmaktır. Bu veriler KVKK Madde 6 kapsamında “Özel Nitelikli Kişisel Veri” niteliğindedir ve yalnızca sizin özgür iradenizle vereceğiniz <strong>açık rıza</strong> doğrultusunda, sadece eşleşme puanı hesaplamak amacıyla işlenir.
          </p>
          <p>
            <strong>3. E-DEVLET ADLİ SİCİL BELGESİ İŞLEME VE İMHA PROTOKOLÜ:</strong> Adayların güvenliğini sağlamak amacıyla talep edilen barkodlu e-Devlet Adli Sicil Kaydı PDF belgesi, sistemimizde dosya olarak <strong>saklanmaz</strong>. Yüklediğiniz PDF belgesi anlık olarak geçici bellekte (RAM) okunur; belgede “ADLİ SİCİL KAYDI YOKTUR” ve “ADLİ SİCİL ARŞİV KAYDI YOKTUR” ibarelerinin varlığı ile barkod formatı kontrol edilir. Analiz tamamlandığı saniyede PDF belgesi ve içindeki T.C. Kimlik Numarası bellekten kalıcı olarak silinir. Veritabanına yalnızca <code>adli_sicil_temiz: true/false</code> durumu, doğrulama tarihi ve tek yönlü kriptografik özet (SHA-256 hash) kaydedilir.
          </p>
          <p>
            <strong>4. VERİ YERLEŞİMİ VE UÇTAN UCA ŞİFRELİ İLETİŞİM:</strong> Gerçek kullanıcı verileri Türkiye Cumhuriyeti sınırları içerisindeki yüksek güvenlikli sunucularda (İstanbul Veri Merkezi) uçtan uca şifrelenerek saklanır. Eşleşme havuzunda hiçbir adayın gerçek adı, soyadı veya telefon numarası diğer adaylara açık gösterilmez. İletişim bilgileri yalnızca her iki aday da karşılıklı olarak “İletişim Kurmak İster misin?” onayını verdiğinde şifreli olarak taraflara açılır.
          </p>
          <p>
            <strong>5. HAKLARINIZ VE RIZANIN GERİ ALINMASI (KVKK MADDE 11):</strong> Dilediğiniz anda açık rızanızı geri çekme ve uyum havuzundaki tüm seçim vektörlerinizin kalıcı olarak silinmesini (“Unutulma Hakkı”) talep etme hakkına sahipsiniz.
          </p>
        </div>

        {/* Onay Kutuları */}
        <form onSubmit={handleApproveAll} className="pt-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-900">
              Yasal Onay Beyanları (Ayrı Ayrı Onaylanması Zorunludur)
            </span>
            <button
              type="button"
              onClick={handleQuickSelectAll}
              className="text-xs font-mono text-zinc-600 underline hover:text-zinc-950"
            >
              Tümünü İşaretle
            </button>
          </div>

          <label className="flex items-start gap-3 p-3.5 border border-zinc-200 hover:border-zinc-400 cursor-pointer bg-[#FAF8F5]/60">
            <input
              type="checkbox"
              checked={c1}
              onChange={(e) => setC1(e.target.checked)}
              className="mt-1 w-4 h-4 accent-zinc-900 shrink-0"
            />
            <span className="text-xs text-zinc-800 leading-relaxed">
              <strong>Genel Aydınlatma Beyanı:</strong> 6698 sayılı KVKK kapsamındaki Aydınlatma Metni’ni okudum; kimlik, demografi ve iletişim verilerimin eşleşme havuzu kapsamında işlenmesini kabul ediyorum.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 border border-zinc-200 hover:border-zinc-400 cursor-pointer bg-[#FAF8F5]/60">
            <input
              type="checkbox"
              checked={c2}
              onChange={(e) => setC2(e.target.checked)}
              className="mt-1 w-4 h-4 accent-zinc-900 shrink-0"
            />
            <span className="text-xs text-zinc-800 leading-relaxed">
              <strong>Özel Nitelikli Veri Açık Rızası (KVKK m.6):</strong> Anket kapsamında kendi isteğimle yanıtlayacağım <em>dini inanç, ibadet pratiği, felsefi/siyasi görüş (Atatürkçülük, muhafazakârlık, yaşam tarzı) ve kılık-kıyafet</em> tercihlerimin, kimliğimden ayrıştırılarak yalnızca evlilik uyum yüzdesi hesaplamak amacıyla işlenmesine <strong>açık rıza veriyorum</strong>.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 border border-zinc-200 hover:border-zinc-400 cursor-pointer bg-[#FAF8F5]/60">
            <input
              type="checkbox"
              checked={c3}
              onChange={(e) => setC3(e.target.checked)}
              className="mt-1 w-4 h-4 accent-zinc-900 shrink-0"
            />
            <span className="text-xs text-zinc-800 leading-relaxed">
              <strong>Adli Sicil (Sabıka Kaydı) Doğrulama ve İmha Rızası:</strong> Yükleyeceğim e-Devlet Adli Sicil PDF belgesinin sistemde saklanmaksızın anlık olarak analiz edilmesine ve profilime yalnızca “Adli Sicil Kaydı Yoktur / Doğrulandı” bilgisinin işlenmesine açık rıza veriyorum.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 border border-zinc-200 hover:border-zinc-400 cursor-pointer bg-[#FAF8F5]/60">
            <input
              type="checkbox"
              checked={c4}
              onChange={(e) => setC4(e.target.checked)}
              className="mt-1 w-4 h-4 accent-zinc-900 shrink-0"
            />
            <span className="text-xs text-zinc-800 leading-relaxed">
              <strong>Türkiye İçi Sunucu ve Şifreli İletişim Protokolü:</strong> Seçimlerimin Türkiye’deki veri merkezinde anonim aday koduyla saklanacağını ve gerçek iletişim bilgilerimin yalnızca karşılıklı onay verdiğim adaylarla uçtan uca şifreli paylaşılacağını kabul ediyorum.
            </span>
          </label>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-zinc-200">
            {consent.specialCategoryExplicitConsent ? (
              <div className="flex items-center gap-2.5 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5">
                <FileCheck2 className="w-4 h-4 shrink-0" />
                <span>
                  İMZALANDI — Belge No: {consent.consentId} ({consent.consentTimestamp})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Uyum testine ve adli sicil doğrulamasına geçmek için sözleşme onayı gereklidir.</span>
              </div>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={!allChecked}
                className={`px-6 py-3 text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                  allChecked
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                {consent.specialCategoryExplicitConsent
                  ? 'Açık Rıza Kaydını Güncelle'
                  : 'Sözleşmeyi Onayla ve Kaydet'}
              </button>

              {consent.specialCategoryExplicitConsent && (
                <button
                  type="button"
                  onClick={onContinueToQuestionnaire}
                  className="px-6 py-3 border border-zinc-900 bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-mono uppercase tracking-wider whitespace-nowrap"
                >
                  Ankete Geç →
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
