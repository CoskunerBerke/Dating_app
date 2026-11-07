import React, { useState, useMemo } from 'react';
import { QUESTIONS } from '../data/questionsData';
import { UserAnswer, UserSelfProfile } from '../types/domain';
import { computeLiveArchetype } from '../services/matchingEngine';
import {
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Compass,
  Flame,
  Layers,
} from 'lucide-react';

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
  const [transitionDir, setTransitionDir] = useState<'next' | 'prev'>('next');
  const [animKey, setAnimKey] = useState(0);
  const [justSelectedId, setJustSelectedId] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const currentQuestion = QUESTIONS[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const completedCount = Object.keys(answers).length;
  const progressPercent = Math.round((completedCount / QUESTIONS.length) * 100);

  const liveArchetype = useMemo(() => computeLiveArchetype(answers), [answers]);

  const navigateToQuestion = (targetIdx: number) => {
    if (targetIdx === currentIndex) return;
    setTransitionDir(targetIdx > currentIndex ? 'next' : 'prev');
    setAnimKey((prev) => prev + 1);
    setCurrentIndex(targetIdx);
  };

  const handleOptionClick = (optionId: string) => {
    const dealbreaker = currentAnswer?.isDealbreaker ?? false;
    setJustSelectedId(optionId);
    onSelectAnswer(currentQuestion.id, optionId, dealbreaker);

    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => {
        setJustSelectedId(null);
        navigateToQuestion(currentIndex + 1);
      }, 340);
    } else {
      setTimeout(() => {
        setJustSelectedId(null);
      }, 340);
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

  const layoutBadgeText: Record<string, string> = {
    bento_2x2: '2x2 Karar Matrisi',
    spectrum_horizontal: 'Yatay Frekans Spektrumu',
    versus_split: 'Karşılaştırmalı Kartlar',
    editorial_cards: 'Senaryo Tepki Ölçeği',
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-section-enter">
      {/* Üst Başlık ve Hızlı Persona Test Çubuğu */}
      <div className="border-b border-zinc-300 pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-2">
            PSİKOMETRİK KEŞİF & SOSYAL UYUM ANALİZİ
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-zinc-900">
            Frekans, Karakter ve Sınır Haritası
          </h1>
        </div>

        {/* Hızlı Test Profilleri */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-zinc-500 mr-1">Hızlı Persona Dene:</span>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('muhafazakar');
              setAnimKey((k) => k + 1);
            }}
            className="px-3 py-1.5 border border-zinc-300 bg-white hover:border-zinc-900 hover:-translate-y-0.5 text-xs font-mono text-zinc-800 transition-all"
          >
            01 Geleneksel / Manevi
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('sentez');
              setAnimKey((k) => k + 1);
            }}
            className="px-3 py-1.5 border border-zinc-300 bg-white hover:border-zinc-900 hover:-translate-y-0.5 text-xs font-mono text-zinc-800 transition-all"
          >
            02 Dengeli Sentez
          </button>
          <button
            type="button"
            onClick={() => {
              onApplyPresetPersona('ataturkcu_sekuler');
              setAnimKey((k) => k + 1);
            }}
            className="px-3 py-1.5 border border-zinc-300 bg-white hover:border-zinc-900 hover:-translate-y-0.5 text-xs font-mono text-zinc-800 transition-all"
          >
            03 Atatürkçü / Seküler
          </button>
        </div>
      </div>

      {/* KVKK Uyarısı */}
      {!kvkkApproved && (
        <div className="mb-8 p-4 border border-amber-300 bg-amber-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-950 leading-relaxed">
              <strong>KVKK Hatırlatması:</strong> Tercih vektörlerinizin anonim havuzda işlenebilmesi için Gizlilik & Açık Rıza metnini onaylamanız gerekmektedir.
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestKvkkModal}
            className="px-4 py-2 bg-zinc-900 text-white text-xs font-mono uppercase tracking-wider shrink-0 whitespace-nowrap"
          >
            Gizlilik Onayını Aç
          </button>
        </div>
      )}

      {/* Canlı Karakter Arketipi & Kişisel Kart Barı (Akademik Tutundurma Mekanizması) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Sol: Canlı Çözümlenen Karakter Arketipi */}
        <div className="lg:col-span-7 bg-zinc-900 text-white p-6 border border-zinc-900 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>CANLI KARAKTER ARKETİPİN (ANLIK HESAPLANIR)</span>
            </div>
            <span className="font-mono text-xs text-emerald-400">%{progressPercent} Çözümlendi</span>
          </div>

          <div className="mb-5">
            <h3 className="font-serif text-2xl font-semibold text-white mb-1">
              {liveArchetype.title}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">{liveArchetype.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-800">
            {liveArchetype.traits.map((t) => (
              <div key={t.label}>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span className="truncate pr-1">{t.label}</span>
                  <span className="text-white">%{t.value}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500 ease-out"
                    style={{ width: `${t.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ: Kısa Tanıtım & Profil Özeti */}
        <div className="lg:col-span-5 bg-white border border-zinc-300 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                SENİN KARTIN • {profile.aliasCode}
              </span>
              <button
                type="button"
                onClick={() => setShowProfileEditor(!showProfileEditor)}
                className="font-mono text-xs text-zinc-900 underline hover:text-zinc-600 flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>{showProfileEditor ? 'Kapat' : 'Profili Düzenle'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div className="p-2.5 bg-[#FAF8F5] border border-zinc-200">
                <span className="font-mono text-[10px] text-zinc-400 block">ARADIĞIN EŞLEŞME</span>
                <span className="font-medium text-zinc-900">
                  {profile.gender === 'erkek' ? 'Kadın Adaylar' : 'Erkek Adaylar'}
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF8F5] border border-zinc-200">
                <span className="font-mono text-[10px] text-zinc-400 block">YAŞ & ŞEHİR</span>
                <span className="font-medium text-zinc-900">
                  {profile.age} • {profile.city}
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-600 line-clamp-2 italic">“{profile.bio}”</p>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-200 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Mod: {profile.relationshipDynamic}</span>
            <span>Meslek: {profile.profession}</span>
          </div>
        </div>
      </div>

      {/* Açılır Profil Düzenleyici */}
      {showProfileEditor && (
        <div className="bg-white border border-zinc-300 p-6 mb-8 animate-section-enter grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
              Kendi Cinsiyetin & Görmek İstediğin Adaylar
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
              <option value="erkek">Erkek (Kadın Adaylarla Eşleş)</option>
              <option value="kadin">Kadın (Erkek Adaylarla Eşleş)</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
              Yaşın
            </label>
            <input
              type="number"
              min={18}
              max={65}
              value={profile.age}
              onChange={(e) =>
                onUpdateProfile({ ...profile, age: Number(e.target.value) || 26 })
              }
              className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
              Şehir
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
              Meslek / Alan
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
              Tanışma & İlişki Modun
            </label>
            <select
              value={profile.relationshipDynamic}
              onChange={(e) =>
                onUpdateProfile({ ...profile, relationshipDynamic: e.target.value })
              }
              className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
            >
              <option value="Uzun Vadeli & Ciddi İlişki">Uzun Vadeli & Ciddi İlişki</option>
              <option value="Kafa Dengi Biriyle Tanışmak">Kafa Dengi Biriyle Tanışmak</option>
              <option value="Tanıyarak & Akışında">Tanıyarak & Akışında</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
              Şifreli İletişim Bilgin (Karşılıklı Onayda Açılır)
            </label>
            <input
              type="text"
              value={profile.contactChannel}
              onChange={(e) => onUpdateProfile({ ...profile, contactChannel: e.target.value })}
              placeholder="Örn: @instagram veya +90 532 ..."
              className="w-full p-2.5 border border-zinc-300 bg-[#FAF8F5]"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block font-mono text-[10px] uppercase text-zinc-500 mb-1">
              Kendini Anlatan Kısa Notun
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

      {/* Etkileşimli Soru İlerleme Barı & Sekmeleri (01 - 12) */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-600 mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-900" />
            <span>
              ADIM {currentQuestion.code} / {QUESTIONS.length} • FORMAT:{' '}
              <strong className="text-zinc-900">
                {layoutBadgeText[currentQuestion.layoutShape]}
              </strong>
            </span>
          </div>
          <span>{completedCount} / 12 Yanıtlandı</span>
        </div>

        {/* Akıcı Progress Çubuğu */}
        <div className="w-full h-1.5 bg-zinc-200 mb-3 overflow-hidden">
          <div
            className="h-full bg-zinc-900 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 border-t border-l border-zinc-300 bg-white">
          {QUESTIONS.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]?.selectedOptionId);
            const isCurrent = idx === currentIndex;
            const isDealbreaker = Boolean(answers[q.id]?.isDealbreaker);
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => navigateToQuestion(idx)}
                className={`py-2.5 font-mono text-xs border-r border-b border-zinc-300 transition-all relative ${
                  isCurrent
                    ? 'bg-zinc-900 text-white font-semibold scale-[1.03] z-10 shadow-sm'
                    : isAnswered
                    ? 'bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200'
                    : 'bg-white text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {q.code}
                {isDealbreaker && (
                  <span
                    className={`block w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${
                      isCurrent ? 'bg-red-400' : 'bg-red-700'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dinamik Şekilli ve Geçiş Efektli Soru Alanı */}
      <div
        key={`${currentQuestion.id}-${animKey}`}
        className={`bg-white border border-zinc-300 p-6 sm:p-10 ${
          transitionDir === 'next' ? 'animate-question-next' : 'animate-question-prev'
        }`}
      >
        {/* Soru Üst Bilgi Şeridi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-5 mb-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs px-2.5 py-1 bg-zinc-900 text-white">
              {currentQuestion.code}
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-700 font-semibold">
              {currentQuestion.categoryLabel}
            </span>
            <span className="text-zinc-300">•</span>
            <span className="font-mono text-[11px] text-zinc-500">
              Model: {currentQuestion.psychModel}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleDealbreaker}
            disabled={!currentAnswer?.selectedOptionId}
            className={`px-3.5 py-1.5 border text-xs font-mono transition-all flex items-center gap-1.5 ${
              currentAnswer?.isDealbreaker
                ? 'border-red-900 bg-red-900 text-white scale-[1.02]'
                : 'border-zinc-300 bg-[#FAF8F5] text-zinc-700 hover:border-zinc-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>
              {currentAnswer?.isDealbreaker
                ? 'Kırmızı Çizgim Olarak Kitlendi'
                : 'Bu Soruyu Kırmızı Çizgim Yap'}
            </span>
          </button>
        </div>

        {/* Soru Başlığı ve Psikolojik Bağlam */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-zinc-900 mb-2.5 leading-snug">
            {currentQuestion.prompt}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            {currentQuestion.scenarioContext}
          </p>
        </div>

        {/* ŞEKİL 1: 2x2 BENTO KARAR MATRİSİ (bento_2x2) */}
        {currentQuestion.layoutShape === 'bento_2x2' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = currentAnswer?.selectedOptionId === opt.id;
              const isPopping = justSelectedId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOptionClick(opt.id)}
                  className={`text-left p-6 border transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-md ${
                    isPopping ? 'animate-card-pop' : ''
                  } ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                      : 'border-zinc-300 bg-[#FAF8F5]/70 hover:border-zinc-900 hover:bg-white text-zinc-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`font-mono text-xs uppercase tracking-wider px-2.5 py-1 border ${
                          isSelected
                            ? 'border-zinc-700 bg-zinc-800 text-emerald-300'
                            : 'border-zinc-300 bg-white text-zinc-700'
                        }`}
                      >
                        {opt.shortTag}
                      </span>
                      <span
                        className={`w-7 h-7 flex items-center justify-center font-mono text-xs border transition-transform group-hover:scale-110 ${
                          isSelected
                            ? 'border-white bg-white text-zinc-900 font-bold'
                            : 'border-zinc-300 text-zinc-400'
                        }`}
                      >
                        {isSelected ? <Check className="w-4 h-4" /> : `0${idx + 1}`}
                      </span>
                    </div>

                    <h3 className="font-medium text-base leading-snug mb-2">{opt.label}</h3>
                  </div>

                  <p
                    className={`text-xs leading-relaxed pt-3 border-t ${
                      isSelected
                        ? 'border-zinc-800 text-zinc-300'
                        : 'border-zinc-200/80 text-zinc-500'
                    }`}
                  >
                    {opt.subtext}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* ŞEKİL 2: YATAY FREKANS SPEKTRUMU (spectrum_horizontal) */}
        {currentQuestion.layoutShape === 'spectrum_horizontal' && (
          <div>
            {/* Spektrum Ölçek Çizgisi */}
            <div className="hidden md:flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-3 px-2">
              <span>◀ SOL EKSEN ({currentQuestion.options[0]?.shortTag})</span>
              <span>FREKANS SPEKTRUMU</span>
              <span>
                SAĞ EKSEN ({currentQuestion.options[currentQuestion.options.length - 1]?.shortTag}) ▶
              </span>
            </div>

            <div
              className={`grid grid-cols-1 gap-4 ${
                currentQuestion.options.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'
              }`}
            >
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = currentAnswer?.selectedOptionId === opt.id;
                const isPopping = justSelectedId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleOptionClick(opt.id)}
                    className={`text-left p-5 border transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 hover:shadow-md ${
                      isPopping ? 'animate-card-pop' : ''
                    } ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                        : 'border-zinc-300 bg-[#FAF8F5]/60 hover:border-zinc-900 hover:bg-white text-zinc-900'
                    }`}
                  >
                    <div>
                      {/* Spektrum Derece Noktası */}
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          className={`w-6 h-6 flex items-center justify-center font-mono text-xs border ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-400 text-zinc-950 font-bold'
                              : 'border-zinc-400 text-zinc-600'
                          }`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <span
                          className={`font-mono text-[11px] uppercase tracking-wider font-semibold ${
                            isSelected ? 'text-emerald-300' : 'text-zinc-600'
                          }`}
                        >
                          {opt.shortTag}
                        </span>
                      </div>

                      <p className="font-medium text-sm leading-snug mb-3">{opt.label}</p>
                    </div>

                    <p
                      className={`text-xs leading-relaxed pt-3 border-t ${
                        isSelected
                          ? 'border-zinc-800 text-zinc-300'
                          : 'border-zinc-200 text-zinc-500'
                      }`}
                    >
                      {opt.subtext}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ŞEKİL 3: KARŞILAŞTIRMALI SPLIT KARTLAR (versus_split) */}
        {currentQuestion.layoutShape === 'versus_split' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = currentAnswer?.selectedOptionId === opt.id;
              const isPopping = justSelectedId === opt.id;
              const letter = ['A', 'B', 'C', 'D'][idx];
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOptionClick(opt.id)}
                  className={`text-left p-6 border-2 transition-all duration-200 flex flex-col justify-between relative hover:-translate-y-1.5 hover:shadow-lg ${
                    isPopping ? 'animate-card-pop' : ''
                  } ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg'
                      : 'border-zinc-300 bg-white hover:border-zinc-900 text-zinc-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-current/15 pb-3 mb-4">
                      <span className="font-serif text-2xl font-bold">Yaklaşım {letter}</span>
                      <span
                        className={`font-mono text-[11px] px-2.5 py-0.5 border ${
                          isSelected
                            ? 'border-emerald-400 text-emerald-300'
                            : 'border-zinc-300 text-zinc-600 bg-[#FAF8F5]'
                        }`}
                      >
                        {opt.shortTag}
                      </span>
                    </div>

                    <p className="font-medium text-base leading-relaxed mb-4">{opt.label}</p>
                  </div>

                  <div
                    className={`p-3 text-xs leading-relaxed ${
                      isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-[#FAF8F5] text-zinc-600'
                    }`}
                  >
                    {opt.subtext}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ŞEKİL 4: EDİTORYAL SENARYO KARTLARI (editorial_cards) */}
        {currentQuestion.layoutShape === 'editorial_cards' && (
          <div className="space-y-3.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = currentAnswer?.selectedOptionId === opt.id;
              const isPopping = justSelectedId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOptionClick(opt.id)}
                  className={`w-full text-left p-5 border transition-all duration-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center hover:translate-x-1 ${
                    isPopping ? 'animate-card-pop' : ''
                  } ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                      : 'border-zinc-300 bg-[#FAF8F5]/60 hover:border-zinc-900 hover:bg-white text-zinc-900'
                  }`}
                >
                  <div className="md:col-span-3 flex items-center gap-3 border-b md:border-b-0 md:border-r border-current/15 pb-2 md:pb-0 md:pr-4">
                    <span
                      className={`w-8 h-8 flex items-center justify-center font-mono text-xs border shrink-0 ${
                        isSelected
                          ? 'border-white bg-white text-zinc-900 font-bold'
                          : 'border-zinc-400 text-zinc-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4" /> : `0${idx + 1}`}
                    </span>
                    <span
                      className={`font-mono text-xs uppercase tracking-wider font-semibold ${
                        isSelected ? 'text-emerald-300' : 'text-zinc-800'
                      }`}
                    >
                      {opt.shortTag}
                    </span>
                  </div>

                  <div className="md:col-span-9 md:pl-2">
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
        )}

        {/* Alt Navigasyon */}
        <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateToQuestion(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="w-full sm:w-auto px-4 py-2.5 border border-zinc-300 text-xs font-mono uppercase tracking-wider text-zinc-700 disabled:opacity-40 flex items-center justify-center gap-2 hover:border-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Önceki Soru</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {currentIndex < QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={() =>
                  navigateToQuestion(Math.min(QUESTIONS.length - 1, currentIndex + 1))
                }
                className="px-5 py-2.5 border border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <span>Atla / Sonraki</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={onFinishQuestionnaire}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-transform hover:-translate-y-0.5"
            >
              Eşleşme Sonuçlarını Gör ({completedCount}/{QUESTIONS.length}) →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
