
import React from 'react';
import { Fish, Droplets, Sparkles, Heart, Zap } from 'lucide-react';
import { CatStats, TRANSLATIONS, Language } from '../../types';

interface StatsBarProps {
    stats: CatStats;
    language: Language;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, language }) => {
    const t = TRANSLATIONS[language];
    
    const getBarColor = (value: number) => {
        if (value > 70) return 'bg-green-500';
        if (value > 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="pointer-events-auto bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-lg w-full max-w-2xl animate-fade-in-down">
            <div className="grid grid-cols-5 gap-2 md:gap-4">
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <Fish className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                        <span className="text-[9px] md:text-xs font-bold text-gray-800 uppercase tracking-tighter">{t.stats.food}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${getBarColor(stats.hunger)}`} style={{ width: `${stats.hunger}%` }} />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <Droplets className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                        <span className="text-[9px] md:text-xs font-bold text-gray-800 uppercase tracking-tighter">{t.stats.water}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${getBarColor(stats.thirst)}`} style={{ width: `${stats.thirst}%` }} />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                        <span className="text-[9px] md:text-xs font-bold text-gray-800 uppercase tracking-tighter">{t.stats.clean}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${stats.hygiene > 60 ? 'bg-purple-500' : 'bg-gray-600'}`} style={{ width: `${stats.hygiene}%` }} />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <Heart className="w-3 h-3 md:w-4 md:h-4 text-pink-500" />
                        <span className="text-[9px] md:text-xs font-bold text-gray-800 uppercase tracking-tighter">{t.stats.love}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${getBarColor(stats.happiness)}`} style={{ width: `${stats.happiness}%` }} />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-1 mb-1">
                        <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                        <span className="text-[9px] md:text-xs font-bold text-gray-800 uppercase tracking-tighter">{t.stats.sleep}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${getBarColor(stats.energy)}`} style={{ width: `${stats.energy}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
