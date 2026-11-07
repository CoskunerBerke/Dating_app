import React from 'react';
import { ShieldCheck, FileWarning, Lock } from 'lucide-react';

interface NavbarProps {
  activeSection: 'anket' | 'sabika' | 'eslesmeler' | 'kvkk';
  onNavigate: (section: 'anket' | 'sabika' | 'eslesmeler' | 'kvkk') => void;
  kvkkApproved: boolean;
  criminalUploaded: boolean;
  completedQuestionsCount: number;
  totalQuestionsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  criminalUploaded,
  completedQuestionsCount,
  totalQuestionsCount,
}) => {
  const navItems: {
    id: 'anket' | 'sabika' | 'eslesmeler' | 'kvkk';
    label: string;
  }[] = [
    {
      id: 'anket',
      label: `1. Kayıt & 9 Soru (${completedQuestionsCount}/${totalQuestionsCount})`,
    },
    { id: 'sabika', label: '2. Adli Sicil Yükle' },
    { id: 'eslesmeler', label: '3. Eşleşmeler' },
    { id: 'kvkk', label: 'KVKK & Güvenlik' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Sol: Logo */}
        <button
          type="button"
          onClick={() => onNavigate('anket')}
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

        {/* Orta: Masaüstü Sekmeler */}
        <nav className="hidden md:flex items-center gap-1.5 bg-zinc-200/60 p-1 rounded-2xl">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeSection === item.id
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sağ: Adli Sicil & Güvenlik Durumu */}
        <div className="flex items-center gap-2 shrink-0">
          {criminalUploaded ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-xs font-semibold whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Adli Sicil: Yüklendi</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('sabika')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold whitespace-nowrap hover:bg-amber-100 transition-colors"
            >
              <FileWarning className="w-3.5 h-3.5" />
              <span>Adli Sicil: Yüklenmedi</span>
            </button>
          )}
          <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-semibold whitespace-nowrap">
            <Lock className="w-3 h-3 text-[#0F6E45]" />
            <span>TR Sunucu</span>
          </span>
        </div>
      </div>

      {/* Mobil Sekme Çubuğu */}
      <div className="flex md:hidden border-t border-zinc-200/80 bg-white px-2 py-1.5 overflow-x-auto gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeSection === item.id
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
