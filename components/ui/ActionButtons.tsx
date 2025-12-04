import React, { useState } from 'react';
import { Fish, Droplets, Trash2, Heart, Zap, Grid3X3, Mic, Music, Activity, ShipWheel, TrendingUp, X, Puzzle, BookOpen, Shirt, Check, Package } from 'lucide-react';
import { CatStats, CatAction, Language, TRANSLATIONS, OutfitId } from '../../types';

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
    currentOutfit: OutfitId;
    onSetOutfit: (outfit: OutfitId) => void;
    onOpenBackpack: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
    stats, currentAction, language, 
    onFeed, onWater, onClean, onPlayAction, onSleep, onSelectGame,
    currentOutfit, onSetOutfit, onOpenBackpack
}) => {
    const [showPlayMenu, setShowPlayMenu] = useState(false);
    const [showGameMenu, setShowGameMenu] = useState(false);
    const [showWardrobeMenu, setShowWardrobeMenu] = useState(false);
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
        setShowWardrobeMenu(false);
        setShowPlayMenu(!showPlayMenu);
    };
    
    const handleGameClick = () => {
        setShowPlayMenu(false);
        setShowWardrobeMenu(false);
        setShowGameMenu(!showGameMenu);
    };

    const handleWardrobeClick = () => {
        setShowPlayMenu(false);
        setShowGameMenu(false);
        setShowWardrobeMenu(!showWardrobeMenu);
    };

    const outfits: { id: OutfitId; name: string; icon: React.ReactNode; color: string }[] = [
        { id: 'none', name: t.wardrobe_menu.none, icon: <div className="w-6 h-6 rounded-full border border-gray-400 bg-white"></div>, color: 'bg-gray-100' },
        { id: 'casual', name: t.wardrobe_menu.casual, icon: <Shirt className="w-6 h-6 text-red-500" />, color: 'bg-red-50' },
        { id: 'formal', name: t.wardrobe_menu.formal, icon: <Shirt className="w-6 h-6 text-gray-800" />, color: 'bg-gray-200' },
        { id: 'summer', name: t.wardrobe_menu.summer, icon: <div className="text-xl">☀️</div>, color: 'bg-yellow-100' },
        { id: 'winter', name: t.wardrobe_menu.winter, icon: <div className="text-xl">❄️</div>, color: 'bg-blue-100' },
        { id: 'halloween', name: t.wardrobe_menu.halloween, icon: <div className="text-xl">🎃</div>, color: 'bg-purple-100' },
        { id: 'christmas', name: t.wardrobe_menu.christmas, icon: <div className="text-xl">🎄</div>, color: 'bg-green-100' },
    ];

    return (
        <div className="flex flex-wrap gap-2 md:gap-4 mb-2 max-w-[70%] pointer-events-auto items-end">
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

            {/* Wardrobe Menu Overlay */}
            {showWardrobeMenu && (
                <div className="absolute bottom-24 right-0 md:right-auto md:left-60 bg-white/95 backdrop-blur-lg p-4 rounded-3xl shadow-2xl border border-white/50 animate-fade-in-up z-50 w-64">
                    <h3 className="text-gray-700 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Shirt className="w-4 h-4" /> {t.actions.wardrobe}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {outfits.map((outfit) => (
                            <button 
                                key={outfit.id}
                                onClick={() => onSetOutfit(outfit.id)}
                                className={`
                                    relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all
                                    ${currentOutfit === outfit.id ? 'border-green-400 bg-green-50' : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}
                                `}
                            >
                                <div className={`w-10 h-10 ${outfit.color} rounded-full flex items-center justify-center shadow-sm`}>
                                    {outfit.icon}
                                </div>
                                <span className="text-[10px] font-bold text-gray-600 text-center leading-tight">{outfit.name}</span>
                                {currentOutfit === outfit.id && (
                                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 shadow-md">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowWardrobeMenu(false)} className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-500">
                        {t.chat.close}
                    </button>
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

            <button onClick={handleWardrobeClick} disabled={!isPassive} className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale relative">
                <div className={`w-12 h-12 md:w-14 md:h-14 bg-teal-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-teal-200 transition-colors ${showWardrobeMenu ? 'bg-teal-300 border-teal-400' : 'group-hover:bg-teal-200'}`}><Shirt className={`w-6 h-6 md:w-8 md:h-8 ${showWardrobeMenu ? 'text-white' : 'text-teal-600'}`} /></div>
                <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.wardrobe}</span>
            </button>

            <button onClick={onOpenBackpack} disabled={!isPassive} className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-amber-200 group-hover:bg-amber-200 transition-colors"><Package className="w-6 h-6 md:w-8 md:h-8 text-amber-700" /></div>
                <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.backpack}</span>
            </button>
        </div>
    );
};