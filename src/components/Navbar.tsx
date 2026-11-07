import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface NavbarProps {
  activeSection: 'hero' | 'anket' | 'sabika' | 'eslesmeler' | 'kvkk';
  onNavigate: (section: 'hero' | 'anket' | 'sabika' | 'eslesmeler' | 'kvkk') => void;
  kvkkApproved: boolean;
  criminalClean: boolean;
  completedQuestionsCount: number;
  totalQuestionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  kvkkApproved,
  criminalClean,
  completedQuestionsCount,
  totalQuestionsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Sol: Marka & Kimlik (shrink-0) */}
        <button
          type="button"
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-3.5 text-left shrink-0 group"
        >
          <div className="w-10 h-10 bg-zinc-900 text-[#FAF8F5] flex items-center justify-center font-serif text-lg font-semibold tracking-wider border border-zinc-900">
            M
          </div>
          <div className="shrink-0">
            <span className="block font-serif text-xl font-bold tracking-tight text-zinc-900 leading-none">
              MİZAN
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500 mt-1 whitespace-nowrap">
              Evlilik Uyum Havuzu
            </span>
          </div>
        </button>

        {/* Orta: Tek Kelimelik Net Menü Linkleri (whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-8">
          <button
            type="button"
            onClick={() => onNavigate('hero')}
            className={`text-sm font-medium transition-colors whitespace-nowrap ${
              activeSection === 'hero'
                ? 'text-zinc-950 underline underline-offset-8 decoration-2'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Sistem
          </button>
          <button
            type="button"
            onClick={() => onNavigate('anket')}
            className={`text-sm font-medium transition-colors whitespace-nowrap ${
              activeSection === 'anket'
                ? 'text-zinc-950 underline underline-offset-8 decoration-2'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Anket ({completedQuestionsCount}/{totalQuestionsCount})
          </button>
          <button
            type="button"
            onClick={() => onNavigate('sabika')}
            className={`text-sm font-medium transition-colors whitespace-nowrap ${
              activeSection === 'sabika'
                ? 'text-zinc-950 underline underline-offset-8 decoration-2'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Sicil
          </button>
          <button
            type="button"
            onClick={() => onNavigate('eslesmeler')}
            className={`text-sm font-medium transition-colors whitespace-nowrap ${
              activeSection === 'eslesmeler'
                ? 'text-zinc-950 underline underline-offset-8 decoration-2'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Eşleşmeler
          </button>
          <button
            type="button"
            onClick={() => onNavigate('kvkk')}
            className={`text-sm font-medium transition-colors whitespace-nowrap ${
              activeSection === 'kvkk'
                ? 'text-zinc-950 underline underline-offset-8 decoration-2'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Sözleşme
          </button>
        </nav>

        {/* Sağ: Durum & Ana Aksiyon (shrink-0 whitespace-nowrap) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 border border-zinc-300 bg-white text-xs font-mono text-zinc-700 whitespace-nowrap shrink-0">
            <Lock className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
            <span>{kvkkApproved ? 'KVKK Açık Rıza Onaylı' : 'KVKK Onayı Bekleniyor'}</span>
            <span className="text-zinc-300">|</span>
            <ShieldCheck
              className={`w-3.5 h-3.5 shrink-0 ${
                criminalClean ? 'text-emerald-700' : 'text-zinc-400'
              }`}
            />
            <span>{criminalClean ? 'Sicil Temiz' : 'Sicil Bekleniyor'}</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('anket')}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-mono uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
          >
            Analize Başla
          </button>
        </div>
      </div>

      {/* Mobil Alt Gezinme Çubuğu */}
      <div className="flex lg:hidden border-t border-zinc-200 bg-white overflow-x-auto">
        {[
          { id: 'hero', label: 'Sistem' },
          { id: 'anket', label: `Anket (${completedQuestionsCount}/${totalQuestionsCount})` },
          { id: 'sabika', label: 'Adli Sicil' },
          { id: 'eslesmeler', label: 'Eşleşmeler' },
          { id: 'kvkk', label: 'KVKK' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id as any)}
            className={`flex-1 py-2.5 px-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap border-b-2 ${
              activeSection === tab.id
                ? 'border-zinc-900 text-zinc-950 font-semibold bg-zinc-50'
                : 'border-transparent text-zinc-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
