import React, { useState } from 'react';
import { KvkkConsentRecord } from '../types/domain';
import { Server, ShieldAlert, FileCheck2, Globe, Database, ShieldCheck } from 'lucide-react';
import { getTurkiyeServerStatus } from '../services/turkiyeDatabaseClient';

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

  const serverStatus = getTurkiyeServerStatus();
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
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-section-enter">
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            HUKUKİ ALTYAPI & YURT İÇİ VERİ YERLEŞİKLİĞİ PROTOKOLÜ
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-semibold text-zinc-900">
            6698 Sayılı KVKK Sözleşmesi ve Türkiye Sunucu Mimarisi
          </h1>
        </div>
        <div className="font-mono text-xs text-emerald-900 border border-emerald-300 bg-emerald-50 px-3.5 py-2 rounded-xl shrink-0">
          Veritabanı Konumu: <strong>TR-İSTANBUL (Fiziksel Yurt İçi Sunucu)</strong>
        </div>
      </div>

      {/* İsimtescil Domain + Vercel Statik Arayüz + Türkiye Fiziksel Veritabanı Mimarisi */}
      <div className="bg-white rounded-3xl border border-zinc-300 p-6 sm:p-8 mb-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4 mb-6">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 block">
              KVKK MADDE 9 UYUMLU 3 KATMANLI SUNUCU YAPISI
            </span>
            <h2 className="font-serif text-xl font-semibold text-zinc-900 mt-1">
              Verileriniz Yurt Dışına Çıkmaz; Tamamı Türkiye’deki Sunucuda Tutulur
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-mono text-xs shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sıfır Yurt Dışı Veri Aktarımı</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-zinc-200">
            <div className="flex items-center gap-2.5 mb-2">
              <Globe className="w-4 h-4 text-zinc-900 shrink-0" />
              <span className="font-mono text-xs font-bold uppercase text-zinc-900">
                1. Alan Adı & DNS Katmanı
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-900 mb-1">
              {serverStatus.domainProvider}
            </p>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Alan adı ve SSL yönlendirmeleri İsimtescil üzerinden yönetilir. Arayüz trafiği ile Türkiye veritabanı trafiği DNS seviyesinde birbirinden ayrılır.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-zinc-200">
            <div className="flex items-center gap-2.5 mb-2">
              <Server className="w-4 h-4 text-zinc-900 shrink-0" />
              <span className="font-mono text-xs font-bold uppercase text-zinc-900">
                2. Arayüz (Frontend) Katmanı
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-900 mb-1">
              {serverStatus.frontendLayer}
            </p>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Vercel üzerinde yalnızca sitenin boş görsel arayüz kodları (.html/.css/.js) çalışır. Vercel üzerinde hiçbir kullanıcı veritabanı veya kişisel bilgi <strong>tutulmaz</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-300">
            <div className="flex items-center gap-2.5 mb-2">
              <Database className="w-4 h-4 text-emerald-800 shrink-0" />
              <span className="font-mono text-xs font-bold uppercase text-emerald-950">
                3. Türkiye Fiziksel Veritabanı
              </span>
            </div>
            <p className="text-xs font-semibold text-emerald-950 mb-1">
              {serverStatus.databaseRegion}
            </p>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Tüm kullanıcı cevapları, KVKK açık rıza imzaları, adli sicil doğrulama damgaları ve şifreli WhatsApp/Instagram bilgileri <strong>fiziksel olarak Türkiye sınırları içindeki PostgreSQL sunucusunda</strong> saklanır.
            </p>
          </div>
        </div>
      </div>

      {/* Mimari Güvenlik Özeti: 01 - 04 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-zinc-300 bg-white mb-10">
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-3">01 / MADDE 6 KAPSAMI</span>
          <h3 className="font-semibold text-zinc-900 text-sm mb-2">Özel Nitelikli Veri Ayrımı</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Din, mezhep, cemaat/topluluk, siyasi görüş ve giyim tercihleri KVKK m.6 kapsamında ayrı açık rıza ile ve kimlik tablosundan ayrı bir tabloda işlenir.
          </p>
        </div>
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-3">02 / ANONİM HAVUZ</span>
          <h3 className="font-semibold text-zinc-900 text-sm mb-2">Kimlikten Arındırılmış Kayıt</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Anket yanıtlarınız ad-soyad veya telefon bilginizle değil, rastgele üretilen <code className="font-mono">#TR-XXXX</code> aday koduyla Türkiye veritabanında tutulur.
          </p>
        </div>
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-3">03 / SIFIR BELGE SAKLAMA</span>
          <h3 className="font-semibold text-zinc-900 text-sm mb-2">Anlık e-Devlet Sicil Sorgusu</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            e-Devlet Adli Sicil barkod sorgusunda T.C. Kimlik Numaranız ve PDF dosyanız diske kaydedilmez; yalnızca doğrulama sonucu profilinize otomatik yazdırılır.
          </p>
        </div>
        <div className="p-6 border-r border-b border-zinc-300">
          <span className="font-mono text-xs text-zinc-400 block mb-3">04 / YURT İÇİ SUNUCU</span>
          <h3 className="font-semibold text-zinc-900 text-sm mb-2">Türkiye Veri Yerleşimi</h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Tüm kişisel veriler KVKK m.9 kapsamında Türkiye Cumhuriyeti sınırları içindeki (İstanbul TIER-III Veri Merkezi) sunucularda barındırılır.
          </p>
        </div>
      </div>

      {/* Sözleşme Metni Kutusu */}
      <div className="bg-white rounded-3xl border border-zinc-300 p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
          <h2 className="font-mono text-xs uppercase tracking-wider text-zinc-800 font-semibold">
            SÖZLEŞME VE AÇIK RIZA METNİ (TAM METİN)
          </h2>
          <span className="font-mono text-[11px] text-zinc-500">Sürüm: 2026.11-TR</span>
        </div>

        <div className="h-64 overflow-y-auto pr-4 text-xs text-zinc-700 space-y-4 leading-relaxed border-b border-zinc-200 pb-6">
          <p>
            <strong>1. VERİ SORUMLUSU VE YURT İÇİ SUNUCU TAAHHÜDÜ:</strong> İşbu Aydınlatma Metni ve Açık Rıza Sözleşmesi, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca Mizan Tanışma ve Uyum Platformu’na katılan kullanıcıların kişisel verilerinin işlenme şartlarını düzenler. Platformumuzda toplanan tüm veriler <strong>fiziksel olarak Türkiye Cumhuriyeti sınırları içerisinde bulunan (İstanbul TIER-III Veri Merkezi) veritabanı sunucularında</strong> saklanmakta olup yurt dışındaki herhangi bir veritabanına aktarılmaz.
          </p>
          <p>
            <strong>2. ÖZEL NİTELİKLİ KİŞİSEL VERİLERİN İŞLENMESİ (KVKK MADDE 6):</strong> Kullanıcıların kendi özgür iradeleriyle cevapladıkları din, mezhep, dini grup/cemaat, siyasi görüş, yaşam tarzı, giyim tercihi ve kırmızı kutucuk (eleme) kriterleri KVKK Madde 6 kapsamında “Özel Nitelikli Kişisel Veri” niteliğindedir. Bu veriler yalnızca sizin vereceğiniz <strong>açık rıza</strong> doğrultusunda, sadece adaylar arası uyum yüzdesi hesaplamak amacıyla işlenir.
          </p>
          <p>
            <strong>3. E-DEVLET ADLİ SİCİL BARKOD SORGULAMA VE OTOMATİK PROFİL KAYDI:</strong> e-Devlet Adli Sicil belgesinin sağ üstündeki karekodun altında yer alan barkod numarası (<code>ADB...</code>) ile yapılan sorgulamada, T.C. Kimlik Numarası ve PDF belgesi veritabanına <strong>kaydedilmez</strong>. Sorgulama sonucunda kişinin adli sicil kaydı olup olmadığı profiline otomatik olarak yazdırılır. Adli sicil kaydı bulunan bir kullanıcıyla iletişim kurulabilmesi için karşı tarafın bu kaydı gördüğünü ve kabul ettiğini açıkça onaylaması zorunludur.
          </p>
          <p>
            <strong>4. WHATSAPP VE INSTAGRAM İLETİŞİM BİLGİLERİNİN ŞİFRELENMESİ:</strong> Profil sonunda seçtiğiniz WhatsApp numarası veya Instagram kullanıcı adı Türkiye sunucumuzda AES-256 standardıyla şifrelenerek saklanır ve yalnızca her iki taraf da karşılıklı olarak “İletişim Kurmak İster misin?” onayını verdiğinde açılır.
          </p>
          <p>
            <strong>5. HAKLARINIZ VE UNUTULMA HAKKI (KVKK MADDE 11):</strong> Dilediğiniz anda açık rızanızı geri çekme ve Türkiye sunucusundaki tüm kayıtlarınızın kalıcı olarak silinmesini talep etme hakkına sahipsiniz.
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

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-400 cursor-pointer bg-[#FAF8F5]/60">
            <input
              type="checkbox"
              checked={c1}
              onChange={(e) => setC1(e.target.checked)}
              className="mt-1 w-4 h-4 accent-zinc-900 shrink-0"
            />
            <span className="text-xs text-zinc-800 leading-relaxed">
              <strong>Genel Aydınlatma Beyanı:</strong> 6698 sayılı KVKK kapsamındaki Aydınlatma Metni’ni okudum; profil ve iletişim tercih verilerimin Türkiye’deki sunucularda işlenmesini kabul ediyorum.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-400 cursor-pointer bg-[#FAF8F5]/60">
            <input
              type="checkbox"
              checked={c2}
              onChange={(e) => setC2(e.target.checked)}
              className="mt-1 w-4 h-4 accent-zinc-900 shrink-0"
            />
            <span className="text-xs text-zinc-800 leading-relaxed">
              <strong>Özel Nitelikli Veri Açık Rızası (KVKK m.6):</strong> Test kapsamında kendi isteğimle yanıtlayacağım <em>inanç, mezhep, cemaat, siyasi görüş ve giyim</em> tercihlerimin yalnızca uyum yüzdesi hesaplamak amacıyla Türkiye’deki veritabanında işlenmesine <strong>açık rıza veriyorum</strong>.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-400 cursor-pointer bg-[#FAF8F5]/60">
            <input
              type="checkbox"
              checked={c3}
              onChange={(e) => setC3(e.target.checked)}
              className="mt-1 w-4 h-4 accent-zinc-900 shrink-0"
            />
            <span className="text-xs text-zinc-800 leading-relaxed">
              <strong>e-Devlet Adli Sicil Sorgulama ve Otomatik Profil Kaydı Rızası:</strong> Barkodlu e-Devlet Adli Sicil sorgulamamın sonucunun profilime otomatik olarak yazdırılmasına ve karşı tarafın açık onayına sunulmasına rıza veriyorum.
            </span>
          </label>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 hover:border-zinc-400 cursor-pointer bg-[#FAF8F5]/60">
            <input
              type="checkbox"
              checked={c4}
              onChange={(e) => setC4(e.target.checked)}
              className="mt-1 w-4 h-4 accent-zinc-900 shrink-0"
            />
            <span className="text-xs text-zinc-800 leading-relaxed">
              <strong>Türkiye İçi Sunucu ve Şifreli WhatsApp / Instagram Paylaşım Rızası:</strong> Tüm verilerimin Türkiye sınırları içerisindeki sunucularda tutulacağını ve seçtiğim WhatsApp/Instagram iletişim kanalımın yalnızca karşılıklı onay verdiğim kişiye açılacağını kabul ediyorum.
            </span>
          </label>

          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-zinc-200">
            {consent.specialCategoryExplicitConsent ? (
              <div className="flex items-center gap-2.5 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl">
                <FileCheck2 className="w-4 h-4 shrink-0" />
                <span>
                  TÜRKİYE SUNUCUSUNA KAYDEDİLDİ — Belge No: {consent.consentId} ({consent.consentTimestamp})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Sorulara ve adli sicil sorgulamasına geçmek için sözleşme onayı gereklidir.</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={!allChecked}
                className={`px-6 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
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
                  className="px-6 py-3 rounded-xl border border-zinc-900 bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-mono uppercase tracking-wider whitespace-nowrap"
                >
                  Sorulara Geç →
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};
