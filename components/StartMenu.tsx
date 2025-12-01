import React from 'react';
import { Play } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface StartMenuProps {
  onStart: () => void;
  language: Language;
  onSetLanguage: (lang: Language) => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ onStart, language, onSetLanguage }) => {
  const t = TRANSLATIONS[language].start_menu;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm select-none">
      
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex gap-2">
         {['en', 'zh', 'jp'].map((lang) => (
             <button
                key={lang}
                onClick={() => onSetLanguage(lang as Language)}
                className={`px-3 py-1 rounded-full font-bold text-sm transition-all border ${
                    language === lang 
                    ? 'bg-white text-pink-500 border-white shadow-lg scale-110' 
                    : 'bg-black/30 text-white border-white/30 hover:bg-black/50'
                }`}
             >
                 {lang === 'en' ? 'EN' : lang === 'zh' ? '中文' : 'JP'}
             </button>
         ))}
      </div>

      <div className="flex flex-col items-center gap-8 animate-fade-in-up">
        {/* Title */}
        <div className="text-center">
            <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 drop-shadow-2xl tracking-tighter" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {t.title}
            </h1>
            <p className="text-white text-lg md:text-xl font-medium tracking-widest mt-2 uppercase opacity-90 drop-shadow-md">
                {t.subtitle}
            </p>
        </div>

        {/* Start Button */}
        <button 
            onClick={onStart}
            className="group relative bg-white text-pink-500 px-12 py-4 rounded-full font-bold text-xl shadow-[0_0_40px_rgba(236,72,153,0.4)] hover:shadow-[0_0_60px_rgba(236,72,153,0.6)] hover:scale-105 transition-all duration-300 overflow-hidden"
        >
            <span className="relative z-10 flex items-center gap-3">
                <Play className="w-6 h-6 fill-current" />
                {t.start}
            </span>
            <div className="absolute inset-0 bg-pink-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-white/60 text-xs font-mono">
          {t.credits}
      </div>
    </div>
  );
};
