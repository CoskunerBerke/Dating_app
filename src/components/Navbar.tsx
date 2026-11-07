import React from 'react';
import { ShieldCheck, FileWarning, Lock, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeSection: 'kayit' | 'sorular' | 'sabika' | 'eslesmeler' | 'kvkk';
  onNavigate: (section: 'kayit' | 'sorular' | 'sabika' | 'eslesmeler' | 'kvkk') => void;
  registrationCompleted: boolean;
  questionnaireCompleted: boolean;
  criminalStepCompleted: boolean;
  criminalUploaded: boolean;
  completedQuestionsCount: number;
  totalQuestionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  registrationCompleted,
  questionnaireCompleted,
  criminalStepCompleted,
  criminalUploaded,
  completedQuestionsCount,
  totalQuestionsCount,
}) => {
  const navItems: {
    id: 'kayit' | 'sorular' | 'sabika' | 'eslesmeler';
    label: string;
    unlocked: boolean;
    completed: boolean;
  }[] = [
    {
      id: 'kayit',
      label: '1. Uygulamaya Kayıt Ol',
      unlocked: true,
      completed: registrationCompleted,
    },
    {
      id: 'sorular',
      label: `2. 9 Soru (${completedQuestionsCount}/${totalQuestionsCount})`,
      unlocked: registrationCompleted,
      completed: questionnaireCompleted,
    },
    {
      id: 'sabika',
      label: '3. Adli Sicil Yükle',
      unlocked: registrationCompleted && questionnaireCompleted,
      completed: criminalStepCompleted,
    },
    {
      id: 'eslesmeler',
      label: '4. Eşleşmeler',
      unlocked:
        registrationCompleted && questionnaireCompleted && criminalStepCompleted,
      completed: false,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Sol: Logo */}
        <button
          type="button"
          onClick={() => onNavigate('kayit')}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0F6E45] text-white flex items-center justify-center font-serif text-base font-bold">
            M
          </div>
          <div className="text-left">
            <span className="font-serif text-lg font-bold tracking-tight text-zinc-900 block leading-none">
              Mizan
            </span>
            <span className="text-[10px] font-semibold text-zinc-500 block mt-0.5">
              Güvenli Tanışma Uygulaması
            </span>
          </div>
        </button>

        {/* Orta: Masaüstü Sıralı Adım Sekmeleri (Önceki adım bitmeden tıklanamaz) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-zinc-200/70 p-1 rounded-2xl">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const isDisabled = !item.unlocked;
            return (
              <button
                key={item.id}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    onNavigate(item.id);
                  }
                }}
                title={
                  isDisabled
                    ? 'Bu adıma geçebilmek için önce bir önceki adımı tamamlamalısın.'
                    : item.label
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : isDisabled
                    ? 'text-zinc-400 opacity-55 cursor-not-allowed select-none'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
              >
                {isDisabled ? (
                  <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
                ) : item.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6E45] shrink-0" />
                ) : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sağ: Adli Sicil & Güvenlik Durumu */}
        <div className="flex items-center gap-2 shrink-0">
          {criminalUploaded ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-xs font-semibold whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Adli Sicil: Yüklendi</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold whitespace-nowrap">
              <FileWarning className="w-3.5 h-3.5" />
              <span>Adli Sicil: Yüklenmedi</span>
            </span>
          )}
          <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-semibold whitespace-nowrap">
            <Lock className="w-3 h-3 text-[#0F6E45]" />
            <span>TR Sunucu</span>
          </span>
        </div>
      </div>

      {/* Mobil Sıralı Adım Çubuğu (Önceki adım bitmeden tıklanamaz) */}
      <div className="flex md:hidden border-t border-zinc-200/80 bg-white px-2 py-1.5 overflow-x-auto gap-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const isDisabled = !item.unlocked;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  onNavigate(item.id);
                }
              }}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-zinc-900 text-white'
                  : isDisabled
                  ? 'text-zinc-400 opacity-50 cursor-not-allowed select-none bg-zinc-50'
                  : 'text-zinc-700'
              }`}
            >
              {isDisabled && <Lock className="w-3 h-3 shrink-0" />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
