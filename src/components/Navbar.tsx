import React from 'react';
import { ShieldCheck } from 'lucide-react';

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
  criminalClean,
  completedQuestionsCount,
  totalQuestionsCount,
}) => {
  const navItems: {
    id: 'hero' | 'anket' | 'sabika' | 'eslesmeler' | 'kvkk';
    label: string;
  }[] = [
    { id: 'hero', label: 'Ana Sayfa' },
    { id: 'anket', label: `Sorular (${completedQuestionsCount}/${totalQuestionsCount})` },
    { id: 'sabika', label: 'Adli Sicil' },
    { id: 'eslesmeler', label: 'Eşleşmeler' },
    { id: 'kvkk', label: 'KVKK' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Sol: Logo */}
        <button
          type="button"
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-2.5 shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0F6E45] text-white flex items-center justify-center font-serif text-base font-bold">
            M
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-zinc-900">
            Mizan
          </span>
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

        {/* Sağ: Durum & Başla */}
        <div className="flex items-center gap-2 shrink-0">
          {criminalClean && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#0F6E45] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sicil Onaylı</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => onNavigate('anket')}
            className="px-4 py-2 rounded-xl bg-[#0F6E45] hover:bg-[#0b5736] text-white text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Sorulara Başla
          </button>
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
