import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroOverviewSectionProps {
  onStartQuestionnaire: () => void;
  onOpenCriminalCheck: () => void;
  onOpenMatches: () => void;
  onOpenKvkk: () => void;
}

export const HeroOverviewSection: React.FC<HeroOverviewSectionProps> = ({
  onStartQuestionnaire,
  onOpenCriminalCheck,
  onOpenMatches,
}) => {
  return (
    <div className="animate-section-enter">
      {/* Ana Giriş */}
      <section className="border-b border-zinc-300 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              GERÇEK KRİTERLER VE GÜVEN DOĞRULAMALI TANIŞMA UYGULAMASI
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-zinc-900 leading-[1.12] tracking-tight">
              Kimin ne olduğu baştan belli olsun; gerçekten sana uyan insanlarla tanış.
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
              Aylarca konuşup karşı tarafın inancını, cemaat/mezhep bağlantısını, siyasi görüşünü, tuttuğu takımı veya alışkanlıklarını sonradan öğrenip hayal kırıklığı yaşama. Kendi özelliklerini seç, kesinlikle istemediklerini kırmızı kutucuklarla ele ve sana yüzde kaç uyduğunu gör.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartQuestionnaire}
                className="px-7 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <span>Soruları Cevapla & Kendini Tanıt</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenMatches}
                className="px-6 py-4 rounded-xl border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-semibold uppercase tracking-wider transition-all hover:-translate-y-0.5"
              >
                Eşleşme Oranlarını Gör
              </button>

              <button
                type="button"
                onClick={onOpenCriminalCheck}
                className="px-6 py-4 rounded-xl border border-zinc-300 bg-transparent hover:border-zinc-900 text-zinc-800 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                e-Devlet Sabıka Kaydı Sorgula
              </button>
            </div>
          </div>

          {/* Sağ: Örnek Uyum Oranları */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-zinc-300 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <span className="text-xs uppercase tracking-wider text-zinc-900 font-bold">
                  UYUM YÜZDESİ VE ÖNERİ SİSTEMİ
                </span>
                <span className="font-mono text-[11px] text-zinc-500">CANLI EŞLEŞME</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-zinc-900 bg-zinc-900 text-white">
                  <div className="flex items-center justify-between font-mono text-xs mb-1">
                    <span className="text-emerald-300 font-semibold">%90 VE ÜZERİ UYUM</span>
                    <span>TAM KAFA DENGİ</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    “Yüzde 90+ uyumlu: Bence hiç vakit kaybetmeyin, direkt sevgili olabilirsiniz!”
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-300 bg-[#FAF8F5]">
                  <div className="flex items-center justify-between font-mono text-xs text-zinc-900 font-semibold mb-1">
                    <span>%80 – %89 UYUM</span>
                    <span>CİDDİ İLİŞKİ ADAYI</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    “Yüzde 80+ uyumlu: Bence çok sağlam bir ilişki çıkar, çok iyi anlaşırsınız.”
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-300 bg-[#FAF8F5]">
                  <div className="flex items-center justify-between font-mono text-xs text-zinc-900 font-semibold mb-1">
                    <span>%60 – %79 UYUM</span>
                    <span>ŞANS DENENEBİLİR</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    “Yüzde 60+ uyumlu: Bence bir kahve içip şansınızı kesinlikle deneyebilirsiniz.”
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs font-mono text-zinc-600">
                <span>Kişisel Bilgiler: GİZLİ</span>
                <span>Sunucu: TÜRKİYE (KVKK Uyumlu)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Sütunlu Net Çalışma Mantığı */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            SİSTEM NASIL ÇALIŞIYOR?
          </span>
          <h2 className="font-serif text-3xl font-semibold text-zinc-900">
            İnsanları Yormadan Gerçekten Tanıyan Sistem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-zinc-300 bg-white">
          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">01 / HER DALDA NET SORULAR</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Din, Mezhep, Cemaat, Siyaset, Takım ve Meslek
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              En popüler seçenekler hazır kutucuklar halinde gelir. Listede yoksa “Diğer” diyerek kendin yazabilir veya “Bahsetmek İstemiyorum” diyerek geçebilirsin.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">02 / KIRMIZI KUTUCUK FİLTRESİ</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Kesinlikle İstemiyorum Dediğin Grupları Ele
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Belirli bir siyasi görüşten, cemaatten, mezhepten veya alışkanlıktan biriyle asla yapamam diyorsan kırmızı kutucukla işaretle; sistem o kişileri sana hiç göstermesin.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">03 / CEVABA GÖRE AÇILAN SORULAR</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Kişiye Göre Şekillenen Akıllı Sorular
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Verdiğin cevaba göre sana uygun alt sorular açılır. Örneğin İslam seçersen mezhep/cemaat sorulur; takım seçersen ne kadar fanatik olduğun sorulur.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">04 / E-DEVLET SABIKA KAYDI</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Barkodlu Adli Sicil PDF Doğrulaması
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Kullanıcılar e-Devlet’ten aldıkları sabıka kaydı PDF’ini yükler. Sistem “Adli Sicil Kaydı Yoktur” satırını ve doğum yılını kontrol eder, ardından dosyayı siler.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">05 / YÜZDE KAÇ UYUMLU?</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Net Uyum Oranı ve İletişim Seçeneği
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Adayların sana yüzde kaç uyduğunu (%90, %80, %60) ve hangi başlıklarda anlaştığınızı görürsün. Beğendiğin kişiye “İletişim Kurmak İster misin?” isteği gönderirsin.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">06 / KVKK SÖZLEŞMESİ & TÜRKİYE SUNUCUSU</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Tam Yasal Güvence ve Gizlilik
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Veriler açık rıza sözleşmesiyle alınır, Türkiye’deki sunucularda anonim kodla tutulur ve iletişim bilgileri sadece karşılıklı onayda açılır.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
