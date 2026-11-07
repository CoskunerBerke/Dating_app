import React from 'react';
import { ArrowRight, ShieldCheck, CheckCircle2, SlidersHorizontal } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 animate-section-enter">
      {/* Ana Karşılama ve Örnek Eşleşme Kartı */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sol: Sade Başlık ve Aksiyonlar */}
        <div className="lg:col-span-6 space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kriter & Güven Doğrulamalı Tanışma</span>
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-zinc-900 leading-tight">
            Kafa dengi insanlarla yüzdelik uyum üzerinden tanış.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Kendi özelliklerini seç, kesinlikle istemediğin kriterleri kırmızı kutucuklarla ele ve sana gerçekten uyan adayları gör.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onStartQuestionnaire}
              className="px-6 py-3.5 rounded-2xl bg-[#0F6E45] hover:bg-[#0b5736] text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Sorulara Başla</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenMatches}
              className="px-5 py-3.5 rounded-2xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-semibold transition-colors"
            >
              Eşleşmeleri Gör
            </button>

            <button
              type="button"
              onClick={onOpenCriminalCheck}
              className="px-4 py-3.5 rounded-2xl text-zinc-600 hover:text-zinc-900 text-xs font-semibold underline underline-offset-4"
            >
              e-Devlet Adli Sicil Doğrula
            </button>
          </div>
        </div>

        {/* Sağ: Sade Örnek Profil Kartı */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-[28px] border border-zinc-200/90 p-6 sm:p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">Can</h2>
                <p className="text-sm text-zinc-600 mt-0.5">
                  24 yaş · 187 cm · Orta yapılı · İzmir · Özgür Yolcu
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-3xl font-bold text-[#0F6E45] block leading-none">
                  %91
                </span>
                <span className="text-xs font-bold text-zinc-800 block mt-1">
                  Çok yüksek uyum
                </span>
                <span className="text-[11px] text-zinc-500 block">
                  adaylarınız arasında ilk %2
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {[
                'Dinde esnek',
                'Bağımsız',
                'Açık sözlü',
                'Sabırlı',
                'Titiz ve bakımlı',
                'Düzenli',
                'Sakin mizaçlı',
                'Anlayışlı',
              ].map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <span className="text-xs font-bold text-zinc-800 block mb-1.5">
                Ortak ilgi alanlarınız (4)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Film / dizi', 'Seyahat', 'Tarih / müze gezmek', 'Arkadaşlarla sohbet'].map(
                  (i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-xs font-semibold"
                    >
                      {i}
                    </span>
                  )
                )}
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-zinc-700">
              <strong className="text-[#0F6E45]">Uyumlu olduğunuz konular: </strong>
              Para yönetimi ★, Siyasi görüş ★, Düzen ve sorumluluk, Yaşam temposu ★, Dini çizgi ★, Mezhep ★, Sosyal hayat, Güven ve özel alan
            </p>

            <p className="mt-2 text-xs leading-relaxed text-zinc-700">
              <strong className="text-[#9A5B13]">Farklı olduğunuz konular: </strong>
              İletişim tarzı ★, Öfke anı
            </p>

            <div className="mt-5 grid grid-cols-12 gap-2">
              <button
                type="button"
                onClick={onStartQuestionnaire}
                className="col-span-6 py-2.5 px-4 rounded-xl bg-[#0F6E45] text-white text-xs sm:text-sm font-bold"
              >
                İlgileniyorum
              </button>
              <button
                type="button"
                onClick={onOpenMatches}
                className="col-span-3 py-2.5 px-3 rounded-xl border border-zinc-300 text-zinc-700 text-xs sm:text-sm font-semibold"
              >
                Geç
              </button>
              <button
                type="button"
                onClick={onOpenMatches}
                className="col-span-3 py-2.5 px-3 rounded-xl border border-zinc-300 text-zinc-700 text-xs sm:text-sm font-semibold"
              >
                Engelle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Sade Adım Özeti */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center mb-3">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 mb-1">
            1. Kişisel Bilgilerini & Kriterlerini Seç
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Boy, yaş, mizaç özelliklerin ile inanç, siyasi görüş ve yaşam tarzı sorularını hızlıca işaretle.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#B90E0A] flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 mb-1">
            2. Kırmızı Kutucuklarla Eleme Yap
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Kesinlikle birlikte olamayacağın grupları kırmızı kutucuklarla seç; o kişiler sana hiç gösterilmesin.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5">
          <div className="w-8 h-8 rounded-lg bg-[#E6F4EC] text-[#0F6E45] flex items-center justify-center mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 mb-1">
            3. e-Devlet Güveniyle İletişime Geç
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Karşılıklı onay verildiğinde seçtiğin WhatsApp veya Instagram üzerinden güvenle tanış.
          </p>
        </div>
      </div>
    </div>
  );
};
