import React, { useState, useEffect } from 'react';
import { PawPrint } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface GameLoadingScreenProps {
  progress: number;
  language: Language;
}

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({ progress, language }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const t = TRANSLATIONS[language].loading;

  useEffect(() => {
    // Randomize starting tip
    setTipIndex(Math.floor(Math.random() * t.tips.length));
    
    const interval = setInterval(() => {
        setTipIndex(prev => (prev + 1) % t.tips.length);
    }, 1500); // Slower tip rotation
    return () => clearInterval(interval);
  }, [language, t.tips.length]);

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-pink-50/90 backdrop-blur-md animate-fade-in select-none">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-pink-200 w-full max-w-md flex flex-col items-center gap-6 transform transition-transform hover:scale-[1.02]">
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-pink-600 animate-pulse tracking-wide">
                {t.title}
            </h2>

            {/* Animation Icon */}
            <div className="relative w-28 h-28 flex items-center justify-center bg-pink-100 rounded-full border-4 border-white shadow-inner">
                <PawPrint className="w-14 h-14 text-pink-500 animate-bounce" />
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-8 bg-gray-100 rounded-full relative overflow-visible border border-gray-200 shadow-inner">
                {/* Fill */}
                <div 
                    className="h-full bg-gradient-to-r from-pink-300 to-pink-500 rounded-full transition-all duration-200 ease-linear shadow-[0_0_15px_rgba(244,114,182,0.4)]"
                    style={{ width: `${progress}%` }}
                ></div>
                
                {/* Moving Paw Icon */}
                <div 
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 ease-linear z-10 filter drop-shadow-md"
                    style={{ left: `calc(${progress}% - 14px)` }}
                >
                     <div className="bg-white p-1.5 rounded-full border-2 border-pink-200">
                        <PawPrint className="w-4 h-4 text-pink-600" fill="currentColor" />
                     </div>
                </div>
            </div>
            
            {/* Percentage Text */}
            <div className="font-mono text-pink-400 font-bold text-lg">
                {Math.round(progress)}%
            </div>

            {/* Random Tips */}
            <p className="text-gray-500 text-sm font-medium h-6 text-center animate-fade-in-up w-full px-4">
                {t.tips[tipIndex]}
            </p>
        </div>
    </div>
  );
};
