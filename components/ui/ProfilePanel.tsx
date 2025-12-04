
import React from 'react';
import { X, Star, Heart, Trophy, Calendar, Sparkles, Zap, Award } from 'lucide-react';
import { CatStats, Language, TRANSLATIONS } from '../../types';

interface ProfilePanelProps {
    stats: CatStats;
    language: Language;
    onClose: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ stats, language, onClose }) => {
    const t = TRANSLATIONS[language].profile;

    const getRank = (level: number) => {
        if (level < 5) return t.ranks[0];
        if (level < 10) return t.ranks[1];
        if (level < 20) return t.ranks[2];
        if (level < 35) return t.ranks[3];
        if (level < 50) return t.ranks[4];
        return t.ranks[5];
    };

    const rankColor = (level: number) => {
        if (level < 5) return 'text-gray-500 bg-gray-100';
        if (level < 10) return 'text-blue-500 bg-blue-100';
        if (level < 20) return 'text-green-500 bg-green-100';
        if (level < 35) return 'text-purple-500 bg-purple-100';
        if (level < 50) return 'text-pink-500 bg-pink-100';
        return 'text-yellow-600 bg-yellow-100';
    };

    const expPercent = Math.min(100, (stats.experience / stats.maxExperience) * 100);

    return (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in select-none">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border-4 border-pink-100 relative m-4">
                
                {/* Header Background */}
                <div className="h-32 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors text-white">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-10 left-8">
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                            <div className="w-full h-full rounded-full bg-pink-50 flex items-center justify-center overflow-hidden border-2 border-pink-200">
                                <span className="text-4xl">🐱</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-12 pb-8 px-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-800">Luna</h2>
                            <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${rankColor(stats.level)}`}>
                                <Award className="w-3 h-3 mr-1" />
                                {getRank(stats.level)}
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-sm text-gray-400 font-bold uppercase">{t.days_together}</div>
                             <div className="text-2xl font-black text-gray-700 flex items-center justify-end gap-1">
                                 <Calendar className="w-5 h-5 text-pink-400" /> 1
                             </div>
                        </div>
                    </div>

                    {/* Level & XP */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6 relative overflow-hidden">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-gray-500 uppercase">{t.level}</span>
                                <span className="text-4xl font-black text-indigo-600">{stats.level}</span>
                            </div>
                            <div className="text-xs font-bold text-gray-400">
                                {Math.floor(stats.experience)} / {stats.maxExperience} {t.exp}
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner relative">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-1000 ease-out relative"
                                style={{ width: `${expPercent}%` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="text-[10px] text-center mt-1 text-gray-400 font-bold uppercase tracking-widest">{t.next_level}</div>
                    </div>

                    {/* Attributes Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-600">
                                <Heart className="w-5 h-5" fill="currentColor" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase">{t.happiness}</div>
                                <div className="text-lg font-black text-gray-700">{Math.floor(stats.happiness)}%</div>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-600">
                                <Zap className="w-5 h-5" fill="currentColor" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase">{t.energy}</div>
                                <div className="text-lg font-black text-gray-700">{Math.floor(stats.energy)}%</div>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-600">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase">{t.wins}</div>
                                <div className="text-lg font-black text-gray-700">-</div>
                            </div>
                        </div>
                        
                        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-600">
                                <Star className="w-5 h-5" fill="currentColor" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-bold uppercase">{t.collection}</div>
                                <div className="text-lg font-black text-gray-700">-</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
