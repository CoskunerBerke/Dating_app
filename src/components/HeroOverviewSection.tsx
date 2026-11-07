import React from 'react';
import { ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';

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
      {/* Ana Editoryal Giriş */}
      <section className="border-b border-zinc-300 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Compass className="w-4 h-4 text-zinc-900" />
              <span>PSİKOMETRİK UYUM VE GÜVEN DOĞRULAMALI TANIŞMA AĞI</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-zinc-900 leading-[1.12] tracking-tight">
              Rastgele kaydırmayı bırak; gerçekten aynı frekansta olduğun insanlarla tanış.
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
              Yüzlerce fotoğraf arasında kaybolup ilk buluşmada hayal kırıklığı yaşama. Schwartz değer kuramı, sosyal yaşam ritmi, dünya görüşü ve e-Devlet güven doğrulamasıyla çalışan yeni nesil tanışma deneyimi.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartQuestionnaire}
                className="px-7 py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <span>Frekans Testine Başla (2 Dk)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenMatches}
                className="px-6 py-4 border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-mono uppercase tracking-wider transition-all hover:-translate-y-0.5"
              >
                Eşleşme Kartlarını Gör
              </button>

              <button
                type="button"
                onClick={onOpenCriminalCheck}
                className="px-6 py-4 border border-zinc-300 bg-transparent hover:border-zinc-900 text-zinc-800 text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Güvenlik & Sicil Doğrulama
              </button>
            </div>
          </div>

          {/* Sağ: Canlı Frekans Eşikleri Kartı */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-zinc-300 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-900 font-semibold">
                  AKADEMİK UYUM VE KİMYA EŞİKLERİ
                </span>
                <span className="font-mono text-[11px] text-zinc-500">ALGORİTMA v2.0</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-zinc-900 bg-zinc-900 text-white transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between font-mono text-xs mb-1">
                    <span className="text-emerald-300 font-semibold">%90 – %100 FREKANS</span>
                    <span>YÜKSEK KİMYA</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    “Yüzde 90+ uyumlu: Bence hiç vakit kaybetmeyin, direkt sevgili olabilirsiniz!”
                  </p>
                </div>

                <div className="p-4 border border-zinc-300 bg-[#FAF8F5] transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between font-mono text-xs text-zinc-900 font-semibold mb-1">
                    <span>%80 – %89 FREKANS</span>
                    <span>UZUN VADELİ POTANSİYEL</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    “Yüzde 80+ uyumlu: Bence çok sağlam bir ilişki çıkar, uzun vadede çok iyi anlaşırsınız.”
                  </p>
                </div>

                <div className="p-4 border border-zinc-300 bg-[#FAF8F5] transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between font-mono text-xs text-zinc-900 font-semibold mb-1">
                    <span>%60 – %79 FREKANS</span>
                    <span>KEŞİF & İLK KAHVE</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    “Yüzde 60+ uyumlu: Bence bir kahve içip şansınızı kesinlikle deneyebilirsiniz.”
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs font-mono text-zinc-600">
                <span>Kimlikler: GİZLİ (#TR-KOD)</span>
                <span>İletişim: E2EE ŞİFRELİ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Sütunlu Mimari Çalışma Prensibi (01 - 06) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            DAVRANIŞSAL PSİKOLOJİ & GÜVEN MİMARİSİ
          </span>
          <h2 className="font-serif text-3xl font-semibold text-zinc-900">
            Sıradan Tanışma Uygulamalarından Farkı Ne?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-zinc-300 bg-white">
          <div className="p-8 border-r border-b border-zinc-300 hover:bg-[#FAF8F5]/60 transition-colors">
            <span className="font-mono text-xs text-zinc-400 block mb-4">01 / DİNAMİK SORU FORMATLARI</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Sıkmayan İnteraktif Keşif Akışı
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Tekdüze formlar yerine; 2x2 Bento matrisi, yatay frekans spektrumu ve karşılaştırmalı ikilem kartlarıyla ilerleyen, yanıtlarken kendi karakter arketipini çözen akış.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300 hover:bg-[#FAF8F5]/60 transition-colors">
            <span className="font-mono text-xs text-zinc-400 block mb-4">02 / PSİKOMETRİK ALTYAPI</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Schwartz, Big Five & Gottman Modeli
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Sorular rastgele değil; temel değerler kuramı, bağlanma stilleri, sosyal enerji ritmi ve tartışma anındaki onarım reflekslerini ölçen akademik modellere dayanır.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300 hover:bg-[#FAF8F5]/60 transition-colors">
            <span className="font-mono text-xs text-zinc-400 block mb-4">03 / GERÇEK GÜVEN DOĞRULAMASI</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              e-Devlet Barkodlu Sicil & Yaş Onayı
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Tanıştığın kişinin kim olduğundan emin olman için e-Devlet PDF üzerinden ADB barkodu, MERNİS yaş doğrulaması ve temiz adli sicil kontrolü yapılır; belge anında imha edilir.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300 hover:bg-[#FAF8F5]/60 transition-colors">
            <span className="font-mono text-xs text-zinc-400 block mb-4">04 / KIRMIZI ÇİZGİ FİLTRESİ</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Olmazsa Olmazlarını Baştan Koru
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Dünya görüşü, inanç, sosyal ortam veya kişisel alan sınırlarında “esneyemem” dediğin başlıkları kırmızı çizgi olarak işaretle; algoritma uyumsuz profilleri otomatik elesin.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300 hover:bg-[#FAF8F5]/60 transition-colors">
            <span className="font-mono text-xs text-zinc-400 block mb-4">05 / BUZKIRAN (ICEBREAKER) MOTORU</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              “Selam” Demekten Kurtaran İlk Mesajlar
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Her eşleşme kartında, iki tarafın ortak verdiği yanıtlara ve hafta sonu zevklerine göre otomatik üretilen akıllı ilk mesaj önerileri yer alır.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300 hover:bg-[#FAF8F5]/60 transition-colors">
            <span className="font-mono text-xs text-zinc-400 block mb-4">06 / GİZLİLİK & KVKK KALKANI</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Anonim Kod & Şifreli İletişim
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Havuzda kimsenin açık adı veya numarası görünmez. Yalnızca her iki taraf da “İletişim Kurmak İster misin?” butonuna bastığında uçtan uca şifreli kanal açılır.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
