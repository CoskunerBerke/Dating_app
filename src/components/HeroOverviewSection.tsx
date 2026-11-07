import React from 'react';
import { ArrowRight, ShieldCheck, Lock, Scale, FileCheck } from 'lucide-react';

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
  onOpenKvkk,
}) => {
  return (
    <div>
      {/* Ana Editoryal Giriş */}
      <section className="border-b border-zinc-300 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
              KAPALI DEVRE EVLİLİK UYUM VE GÜVENLİK HAVUZU • TÜRKİYE SUNUCU MİMARİSİ
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-zinc-900 leading-[1.12] tracking-tight">
              Fotoğraf kaydırmaya değil, karakter ve kırmızı çizgi uyumuna dayalı evlilik havuzu.
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
              Klasik tanışma uygulamalarının yüzeysel döngüsünü kapatıyoruz. İnanç pratiği, dünya görüşü, aile sınırları, ekonomik beklentiler ve e-Devlet barkodlu adli sicil doğrulaması üzerinden çalışan, gerçek kimliklerin gizli tutulduğu matematiksel eşleşme sistemi.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartQuestionnaire}
                className="px-7 py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-3 transition-colors"
              >
                <span>Uyum Testine Başla (12 Soru)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenCriminalCheck}
                className="px-6 py-4 border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-mono uppercase tracking-wider transition-colors"
              >
                e-Devlet Adli Sicil PDF Testi
              </button>

              <button
                type="button"
                onClick={onOpenMatches}
                className="px-6 py-4 border border-zinc-300 bg-transparent hover:border-zinc-900 text-zinc-800 text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Örnek Eşleşme Havuzunu Gör
              </button>
            </div>
          </div>

          {/* Sağ: Canlı Karar Eşiği Önizleme Tablosu */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-zinc-300 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-900 font-semibold">
                  ZORLAŞTIRILMIŞ PUANLAMA KARAR EŞİKLERİ
                </span>
                <span className="font-mono text-[11px] text-zinc-500">MATRİS v1.4</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-zinc-900 bg-zinc-900 text-white">
                  <div className="flex items-center justify-between font-mono text-xs mb-1">
                    <span className="text-emerald-300 font-semibold">%90 – %100 UYUM BANDI</span>
                    <span>DOĞRUDAN NİKÂH ADAYI</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    “Yüzde 90+ uyumlu: Bence sevgili olabilir, doğrudan nikâh masasına oturabilirsiniz.”
                  </p>
                </div>

                <div className="p-4 border border-zinc-300 bg-[#FAF8F5]">
                  <div className="flex items-center justify-between font-mono text-xs text-zinc-900 font-semibold mb-1">
                    <span>%80 – %89 UYUM BANDI</span>
                    <span>NİŞAN & CİDDİ YOL</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    “Yüzde 80+ uyumlu: Bence nişanlanabilirsiniz; ana omurgada tam mutabakat var.”
                  </p>
                </div>

                <div className="p-4 border border-zinc-300 bg-[#FAF8F5]">
                  <div className="flex items-center justify-between font-mono text-xs text-zinc-900 font-semibold mb-1">
                    <span>%60 – %79 UYUM BANDI</span>
                    <span>KOŞULLU DENEME</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    “Yüzde 60+ uyumlu: Bence şansınızı deneyebilirsiniz ama konuşmanız gereken başlıklar var.”
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs font-mono text-zinc-600">
                <span>Kişisel Bilgiler: GİZLİ (#TR-KOD)</span>
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
            SİSTEM MİMARİSİ & FARKLILAŞMA NOKTALARI
          </span>
          <h2 className="font-serif text-3xl font-semibold text-zinc-900">
            Neden Klasik Uygulamalardan Tamamen Farklı?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-zinc-300 bg-white">
          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">01 / SIKMAYAN ANKET AKIŞI</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Sorgulama Değil, Gerçek Hayat İkilemleri
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              İnsanları sıkan bürokratik formlar yerine; inanç pratiği, Atatürkçülük/muhafazakârlık ekseni, aile sınırları ve ev ekonomisini 3 dakikada ölçen senaryo soruları.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">02 / E-DEVLET ADLİ SİCİL</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Barkodlu Sabıka Kaydı Doğrulaması
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Adaylar e-Devlet’ten aldıkları Adli Sicil PDF belgesini yükler. Sistem “Adli Sicil ve Arşiv Kaydı Yoktur” ibaresini doğrular, dosyayı anında imha eder ve güven mührü basar.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">03 / KVKK MADDE 6 KALKANI</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Özel Nitelikli Veri & Yurt İçi Sunucu
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Din ve felsefi/siyasi görüş verileri 6698 sayılı KVKK m.6 kapsamında ayrı açık rıza sözleşmesiyle alınır, kimlikten ayrıştırılır ve Türkiye içi sunucularda tutulur.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">04 / ZORLAŞTIRILMIŞ PUANLAMA</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Kırmızı Çizgi (Dealbreaker) Cezası
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Her iki tarafın “esneyemem” dediği kırmızı çizgilerde (ör. alkol, namaz, giyim veya laiklik hassasiyeti) zıtlık varsa genel puan otomatik olarak düşürülür.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">05 / GİZLİ HAVUZ & E2EE</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Karşılıklı Onayda Şifreli İletişim
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Veritabanında yalnızca seçimleriniz ve anonim kodunuz görünür. Gerçek iletişim bilgileri sadece iki taraf da “İletişim Kurmak İster misin?” sorusuna onay verdiğinde açılır.
            </p>
          </div>

          <div className="p-8 border-r border-b border-zinc-300">
            <span className="font-mono text-xs text-zinc-400 block mb-4">06 / ESNEK GELİR MODELİ</span>
            <h3 className="font-serif text-xl font-semibold text-zinc-900 mb-3">
              Homojen Havuz Sonrası Premium Geçişi
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              İlk aşamada 2.000–3.000 homojen aday dağılımı yakalanana kadar sistem tamamen ücretsiz çalışır; altyapıdaki Premium kilit anahtarı istenildiği an aktif edilir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
