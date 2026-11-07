import React, { useState } from 'react';
import { QUESTIONS } from '../data/questionsData';
import { UserAnswer, UserSelfProfile } from '../types/domain';
import { Check, AlertCircle, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface QuestionnaireSectionProps {
  profile: UserSelfProfile;
  onUpdateProfile: (profile: UserSelfProfile) => void;
  answers: Record<string, UserAnswer>;
  onSelectAnswer: (questionId: string, optionId: string, isDealbreaker: boolean) => void;
  onApplyPresetPersona: (persona: 'muhafazakar' | 'sentez' | 'ataturkcu_sekuler') => void;
  kvkkApproved: boolean;
  onRequestKvkkModal: () => void;
  onFinishQuestionnaire: () => void;
}

export const QuestionnaireSection: React.FC<QuestionnaireSectionProps> = ({
  profile,
  onUpdateProfile,
  answers,
  onSelectAnswer,
  onApplyPresetPersona,
  kvkkApproved,
  onRequestKvkkModal,
  onFinishQuestionnaire,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const completedCount = Object.keys(answers).length;
  const progressPercent = Math.round((completedCount / QUESTIONS.length) * 100);

  const handleOptionClick = (optionId: string) => {
    const dealbreaker = currentAnswer?.isDealbreaker ?? false;
    onSelectAnswer(currentQuestion.id, optionId, dealbreaker);

    // Sıkmayan mikro-etkileşim: Seçim yapıldığında 220ms sonra bir sonraki soruya yumuşak geçiş
    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(QUESTIONS.length - 1, prev + 1));
      }, 220);
    }
  };

  const handleToggleDealbreaker = () => {
    if (!currentAnswer?.selectedOptionId) return;
    onSelectAnswer(
      currentQuestion.id,
      currentAnswer.selectedOptionId,
      !currentAnswer.isDealbreaker
    );
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Üst Başlık ve Hızlı Persona Test Çubuğu */}
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            SIKMAYAN SENARYO BAZLI DEĞER & KARAKTER ANALİZİ
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-zinc-900">
            Evlilik Uyum ve Kırmızı Çizgi Matrisi
          </h1>
        </div>

        {/* Demo Hızlı Doldurma Seçenekleri */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-zinc-500 mr-1">Hızlı Test Profili:</span>
          <button
            type="button"
            onClick={() => onApplyPresetPersona('muhafazakar')}
            className="px-3 py-1.5 border border-zinc-300 bg-white hover:border-zinc-900 text-xs font-mono text-zinc-800 transition-colors"
          >
            01 Muhafazakâr
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetPersona('sentez')}
            className="px-3 py-1.5 border border-zinc-300 bg-white hover:border-zinc-900 text-xs font-mono text-zinc-800 transition-colors"
          >
            02 Milli / Sentez
          </button>
          <button
            type="button"
            onClick={() => onApplyPresetPersona('ataturkcu_sekuler')}
            className="px-3 py-1.5 border border-zinc-300 bg-white hover:border-zinc-900 text-xs font-mono text-zinc-800 transition-colors"
          >
            03 Atatürkçü / Seküler
          </button>
        </div>
      </div>

      {/* KVKK Uyarısı (Henüz onaylanmadıysa) */}
      {!kvkkApproved && (
        <div className="mb-8 p-4 border border-amber-300 bg-amber-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-950 leading-relaxed">
              <strong>KVKK Madde 6 Hatırlatması:</strong> İnanç, dünya görüşü ve yaşam tarzı yanıtlarınızın Türkiye sunucu havuzuna kaydedilebilmesi için Açık Rıza Sözleşmesi’ni onaylamanız gerekmektedir.
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestKvkkModal}
            className="px-4 py-2 bg-zinc-900 text-white text-xs font-mono uppercase tracking-wider shrink-0 whitespace-nowrap"
          >
            Sözleşmeyi İncele & Onayla
          </button>
        </div>
      )}

      {/* Kişisel Tanıtım Özeti & Düzenleme Barı */}
      <div className="bg-white border border-zinc-300 p-5 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <div>
              <span className="font-mono text-zinc-400 block text-[10px]">ANONİM ADAY KODUNUZ</span>
              <span className="font-mono font-semibold text-zinc-900">{profile.aliasCode}</span>
            </div>
            <div>
              <span className="font-mono text-zinc-400 block text-[10px]">CİNSİYET / ARANAN</span>
              <span className="font-medium text-zinc-900">
                {profile.gender === 'erkek' ? 'Erkek → Kadın Adaylar' : 'Kadın → Erkek Adaylar'}
              </span>
            </div>
            <div>
              <span className="font-mono text-zinc-400 block text-[10px]">YAŞ & ŞEHİR</span>
              <span className="font-medium text-zinc-900">
                {profile.age} • {profile.city}
              </span>
            </div>
            <div>
              <span className="font-mono text-zinc-400 block text-[10px]">MESLEK & HEDEF</span>
              <span className="font-medium text-zinc-900">
                {profile.profession} ({profile.marriageTimeline})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowProfileEditor(!showProfileEditor)}
            className="px-4 py-2 border border-zinc-300 hover:border-zinc-900 text-xs font-mono uppercase tracking-wider shrink-0 whitespace-nowrap"
          >
            {showProfileEditor ? 'Bilgileri Kapat' : 'Kendini Tanıt / Düzenle'}
          </button>
        </div>

        {showProfileEditor && (
          <div className="mt-6 pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                Cinsiyetiniz ve Aday Tercihiniz
              </label>
              <select
                value={profile.gender}
                onChange={(e) => {
                  const g = e.target.value as 'erkek' | 'kadin';
                  onUpdateProfile({
                    ...profile,
                    gender: g,
                    lookingFor: g === 'erkek' ? 'kadin' : 'erkek',
                  });
                }}
                className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
              >
                <option value="erkek">Erkek (Kadın Aday Havuzuyla Eşleş)</option>
                <option value="kadin">Kadın (Erkek Aday Havuzuyla Eşleş)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                Yaşınız
              </label>
              <input
                type="number"
                min={20}
                max={65}
                value={profile.age}
                onChange={(e) =>
                  onUpdateProfile({ ...profile, age: Number(e.target.value) || 27 })
                }
                className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                Yaşadığınız Şehir
              </label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => onUpdateProfile({ ...profile, city: e.target.value })}
                className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                Meslek / Çalışma Alanı
              </label>
              <input
                type="text"
                value={profile.profession}
                onChange={(e) => onUpdateProfile({ ...profile, profession: e.target.value })}
                className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                Evlilik Zaman Ufku
              </label>
              <select
                value={profile.marriageTimeline}
                onChange={(e) => onUpdateProfile({ ...profile, marriageTimeline: e.target.value })}
                className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
              >
                <option value="6 - 12 Ay İçinde">6 - 12 Ay İçinde</option>
                <option value="1 Yıl İçinde">1 Yıl İçinde</option>
                <option value="1 - 2 Yıl İçinde">1 - 2 Yıl İçinde</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                Şifreli İletişim Kanalınız (Karşılıklı Onayda Açılır)
              </label>
              <input
                type="text"
                value={profile.contactChannel}
                onChange={(e) => onUpdateProfile({ ...profile, contactChannel: e.target.value })}
                placeholder="Örn: +90 532 ... veya @kullaniciadi"
                className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
                Kendi Cümlelerinizle Kısa Tanıtımınız
              </label>
              <textarea
                rows={2}
                value={profile.bio}
                onChange={(e) => onUpdateProfile({ ...profile, bio: e.target.value })}
                className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Numaralı Soru Seçici (01 - 12) */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-600 mb-2">
          <span>SORU İLERLEMESİ: {completedCount} / {QUESTIONS.length} TAMAMLANDI</span>
          <span>%{progressPercent}</span>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-12 border-t border-l border-zinc-300 bg-white">
          {QUESTIONS.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]?.selectedOptionId);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`py-2.5 font-mono text-xs border-r border-b border-zinc-300 transition-colors ${
                  isCurrent
                    ? 'bg-zinc-900 text-white font-semibold'
                    : isAnswered
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'bg-white text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {q.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aktif Soru Kartı */}
      <div className="bg-white border border-zinc-300 p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 bg-zinc-900 text-white">
              SORU {currentQuestion.code} / 12
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              {currentQuestion.categoryLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleDealbreaker}
            disabled={!currentAnswer?.selectedOptionId}
            className={`px-3.5 py-1.5 border text-xs font-mono transition-colors ${
              currentAnswer?.isDealbreaker
                ? 'border-red-800 bg-red-900 text-white'
                : 'border-zinc-300 bg-[#FAF8F5] text-zinc-700 hover:border-zinc-900'
            }`}
          >
            {currentAnswer?.isDealbreaker
              ? '★ Kırmızı Çizgim Olarak İşaretlendi'
              : '☆ Bu Konu Kırmızı Çizgimdir (Esneyemem)'}
          </button>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3 leading-snug">
          {currentQuestion.prompt}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mb-8 leading-relaxed">
          {currentQuestion.scenarioContext}
        </p>

        {/* Seçenekler Listesi */}
        <div className="space-y-3.5">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = currentAnswer?.selectedOptionId === opt.id;
            const optionLetter = ['A', 'B', 'C', 'D'][idx] || String(idx + 1);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleOptionClick(opt.id)}
                className={`w-full text-left p-5 border transition-all flex items-start gap-4 ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-[#FAF8F5]/60 hover:border-zinc-500 hover:bg-white text-zinc-900'
                }`}
              >
                <span
                  className={`w-7 h-7 flex items-center justify-center font-mono text-xs border shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-white bg-white text-zinc-900 font-bold'
                      : 'border-zinc-300 text-zinc-600'
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : optionLetter}
                </span>
                <div>
                  <span className="block font-medium text-sm sm:text-base leading-snug mb-1">
                    {opt.label}
                  </span>
                  <span
                    className={`block text-xs leading-relaxed ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {opt.subtext}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Alt Navigasyon */}
        <div className="mt-8 pt-6 border-t border-zinc-200 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 border border-zinc-300 text-xs font-mono uppercase tracking-wider text-zinc-700 disabled:opacity-40 flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Önceki</span>
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(QUESTIONS.length - 1, prev + 1))}
                className="px-5 py-2.5 border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-mono uppercase tracking-wider flex items-center gap-2"
              >
                <span>Sonraki Soru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={onFinishQuestionnaire}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider whitespace-nowrap"
            >
              Uyum Havuzunu Hesapla ({completedCount}/{QUESTIONS.length}) →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
