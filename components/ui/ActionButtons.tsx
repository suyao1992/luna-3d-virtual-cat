
import React, { useState } from 'react';
import { Fish, Droplets, Trash2, Heart, Zap, Grid3X3, Mic, Music, Activity, ShipWheel, TrendingUp, X, Puzzle, BookOpen } from 'lucide-react';
import { CatStats, CatAction, Language, TRANSLATIONS } from '../../types';

interface ActionButtonsProps {
    stats: CatStats;
    currentAction: CatAction;
    language: Language;
    onFeed: () => void;
    onWater: () => void;
    onClean: () => void;
    onPlayAction: (actionType: 'sing' | 'dance' | 'yoga' | 'fish' | 'climb' | 'read') => void;
    onSleep: () => void;
    onSelectGame: (gameType: 'gomoku' | 'xiangqi' | 'match3') => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
    stats, currentAction, language, 
    onFeed, onWater, onClean, onPlayAction, onSleep, onSelectGame 
}) => {
    const [showPlayMenu, setShowPlayMenu] = useState(false);
    const [showGameMenu, setShowGameMenu] = useState(false);
    const t = TRANSLATIONS[language];

    const isPassive = [
        'idle', 'walking', 'wandering', 
        'watching_birds', 'hiding', 'hunting', 'reading',
        'sitting', 'standing',
        'grooming', 'scratching', 'playing_ball', 'climbing', 'using_litter'
    ].includes(currentAction);

    const isSleeping = currentAction === 'sleeping';

    const handlePlayClick = () => {
        setShowGameMenu(false);
        setShowPlayMenu(!showPlayMenu);
    };
    
    const handleGameClick = () => {
        setShowPlayMenu(false);
        setShowGameMenu(!showGameMenu);
    };

    return (
        <div className="flex flex-wrap gap-2 md:gap-4 mb-2 max-w-[60%] pointer-events-auto">
            {/* Play Menu Overlay */}
            {showPlayMenu && (
                <div className="absolute bottom-24 left-0 bg-white/90 backdrop-blur-lg p-4 rounded-3xl shadow-2xl border border-white/50 animate-fade-in-up flex gap-4 z-50 flex-wrap max-w-md">
                    <button onClick={() => onPlayAction('sing')} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors shadow-sm"><Mic className="w-6 h-6 text-purple-600" /></div>
                        <span className="text-xs font-bold text-gray-600">{t.play_menu.sing}</span>
                    </button>
                    <button onClick={() => onPlayAction('dance')} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors shadow-sm"><Music className="w-6 h-6 text-pink-600" /></div>
                        <span className="text-xs font-bold text-gray-600">{t.play_menu.dance}</span>
                    </button>
                    <button onClick={() => onPlayAction('yoga')} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors shadow-sm"><Activity className="w-6 h-6 text-teal-600" /></div>
                        <span className="text-xs font-bold text-gray-600">{t.play_menu.yoga}</span>
                    </button>
                    <button onClick={() => onPlayAction('fish')} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors shadow-sm"><ShipWheel className="w-6 h-6 text-blue-600" /></div>
                        <span className="text-xs font-bold text-gray-600">{t.play_menu.fish}</span>
                    </button>
                    <button onClick={() => onPlayAction('climb')} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors shadow-sm"><TrendingUp className="w-6 h-6 text-orange-600" /></div>
                        <span className="text-xs font-bold text-gray-600">{t.play_menu.climb}</span>
                    </button>
                    <button onClick={() => onPlayAction('read')} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors shadow-sm"><BookOpen className="w-6 h-6 text-indigo-600" /></div>
                        <span className="text-xs font-bold text-gray-600">{t.play_menu.read}</span>
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button onClick={() => setShowPlayMenu(false)} className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
            )}

            {/* Game Menu Overlay */}
            {showGameMenu && (
                <div className="absolute bottom-24 left-40 bg-white/90 backdrop-blur-lg p-4 rounded-3xl shadow-2xl border border-white/50 animate-fade-in-up flex gap-4 z-50">
                    <button onClick={() => onSelectGame('gomoku')} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors shadow-sm"><Grid3X3 className="w-6 h-6 text-indigo-600" /></div>
                        <span className="text-xs font-bold text-gray-600">{t.game_menu.gomoku}</span>
                    </button>
                    <button onClick={() => onSelectGame('xiangqi')} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors shadow-sm"><span className="text-xl font-serif text-red-800 font-bold">帅</span></div>
                        <span className="text-xs font-bold text-gray-600">{t.game_menu.xiangqi}</span>
                    </button>
                    <button onClick={() => onSelectGame('match3')} className="flex flex-col items-center gap-1 group">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors shadow-sm"><Puzzle className="w-6 h-6 text-orange-600" /></div>
                        <span className="text-xs font-bold text-gray-600">{t.game_menu.match3}</span>
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button onClick={() => setShowGameMenu(false)} className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                </div>
            )}

            <button onClick={onFeed} disabled={!isPassive || stats.hunger >= 95} className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-orange-200 group-hover:bg-orange-200 transition-colors"><Fish className="w-6 h-6 md:w-8 md:h-8 text-orange-500" /></div>
                <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.feed}</span>
            </button>

            <button onClick={onWater} disabled={!isPassive || stats.thirst >= 95} className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-blue-200 group-hover:bg-blue-200 transition-colors"><Droplets className="w-6 h-6 md:w-8 md:h-8 text-blue-500" /></div>
                <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.water}</span>
            </button>

            <button onClick={onClean} disabled={stats.hygiene >= 100} className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-300 group-hover:bg-gray-200 transition-colors"><Trash2 className="w-6 h-6 md:w-8 md:h-8 text-gray-500" /></div>
                <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.clean}</span>
            </button>

            <button onClick={handlePlayClick} disabled={!isPassive || stats.energy <= 10} className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale relative">
                <div className={`w-12 h-12 md:w-14 md:h-14 bg-pink-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-pink-200 transition-colors ${showPlayMenu ? 'bg-pink-300 border-pink-400' : 'group-hover:bg-pink-200'}`}><Heart className={`w-6 h-6 md:w-8 md:h-8 ${showPlayMenu ? 'text-white' : 'text-pink-500'}`} /></div>
                <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.play}</span>
            </button>

            <button onClick={onSleep} disabled={isSleeping ? false : (!isPassive || stats.energy >= 90)} className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-colors ${isSleeping ? 'bg-purple-300 border-purple-400' : 'bg-purple-100 border-purple-200 group-hover:bg-purple-200'}`}><Zap className={`w-6 h-6 md:w-8 md:h-8 ${isSleeping ? 'text-white' : 'text-purple-500'}`} /></div>
                <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.sleep}</span>
            </button>
            
            <button onClick={handleGameClick} disabled={!isPassive} className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale relative">
                <div className={`w-12 h-12 md:w-14 md:h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-indigo-200 transition-colors ${showGameMenu ? 'bg-indigo-300 border-indigo-400' : 'group-hover:bg-indigo-200'}`}><Grid3X3 className={`w-6 h-6 md:w-8 md:h-8 ${showGameMenu ? 'text-white' : 'text-indigo-500'}`} /></div>
                <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.game}</span>
            </button>
        </div>
    );
};
