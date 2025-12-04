
import React, { useState, useEffect, useRef } from 'react';
import { X, ShipWheel, AlertCircle } from 'lucide-react';
import { Language, TRANSLATIONS, ItemId } from '../types';
import { audioService } from '../services/audio';
import { SardineVisual, TunaVisual, KoiVisual, GoldenCarpVisual, BootVisual, TinCanVisual } from './ui/FishVisuals';

interface FishingGameProps {
  onClose: () => void;
  onCatch: (itemId: string, score: number) => void;
  language: Language;
}

type GameState = 'idle' | 'waiting' | 'bite' | 'caught' | 'missed';

interface CatchItemDef {
    id: ItemId;
    score: number;
    color: string;
    rarity: 'common' | 'rare' | 'legendary' | 'trash';
}

// Pure data
const ITEMS_DATA: CatchItemDef[] = [
    { id: 'sardine', score: 10, color: 'bg-gray-100', rarity: 'common' },
    { id: 'tuna', score: 30, color: 'bg-blue-100', rarity: 'common' },
    { id: 'koi', score: 50, color: 'bg-orange-100', rarity: 'rare' },
    { id: 'golden_carp', score: 100, color: 'bg-yellow-100', rarity: 'legendary' },
    { id: 'old_boot', score: 0, color: 'bg-stone-200', rarity: 'trash' },
    { id: 'tin_can', score: 0, color: 'bg-gray-200', rarity: 'trash' },
];

export const FishingGame: React.FC<FishingGameProps> = ({ onClose, onCatch, language }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [caughtItemId, setCaughtItemId] = useState<ItemId | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const biteTimeoutRef = useRef<number | null>(null);
  
  const t = TRANSLATIONS[language].fishing;

  const getCaughtItemDef = () => caughtItemId ? ITEMS_DATA.find(i => i.id === caughtItemId) : null;
  const caughtItem = getCaughtItemDef();

  const startFishing = () => {
    setGameState('waiting');
    setCaughtItemId(null);
    audioService.playSplash();
    const waitTime = 2000 + Math.random() * 4000;
    timerRef.current = window.setTimeout(() => {
        triggerBite();
    }, waitTime);
  };

  const triggerBite = () => {
      setGameState('bite');
      audioService.playBoing();
      const difficultyWindow = 1000; 
      biteTimeoutRef.current = window.setTimeout(() => {
          if (gameState === 'bite') { 
              handleMiss();
          }
      }, difficultyWindow);
  };

  const handleReel = () => {
      if (gameState === 'waiting') {
          handleMiss();
          if (timerRef.current) clearTimeout(timerRef.current);
      } else if (gameState === 'bite') {
          if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current);
          handleCatch();
      }
  };

  const handleCatch = () => {
      const rand = Math.random();
      let item;
      
      if (rand > 0.95) item = ITEMS_DATA.find(i => i.rarity === 'legendary');
      else if (rand > 0.8) item = ITEMS_DATA.find(i => i.rarity === 'rare');
      else if (rand > 0.3) item = ITEMS_DATA.filter(i => i.rarity === 'common')[Math.floor(Math.random() * 2)];
      else item = ITEMS_DATA.filter(i => i.rarity === 'trash')[Math.floor(Math.random() * 2)];

      if (!item) item = ITEMS_DATA[0];

      setCaughtItemId(item.id);
      setGameState('caught');
      
      if (item.score > 0) {
        audioService.playMeow('happy');
        onCatch(item.id, item.score);
      } else {
        audioService.playMeow('grumpy');
        onCatch(item.id, item.score);
      }
  };

  const handleMiss = () => {
      setGameState('missed');
      setCaughtItemId(null);
  };

  useEffect(() => {
      return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
          if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current);
      };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in select-none">
       <div className="bg-[#e0f7fa] p-6 rounded-3xl shadow-2xl border-4 border-[#4dd0e1] w-full max-w-md flex flex-col items-center relative overflow-hidden">
           
           <div className="flex justify-between w-full items-center mb-6 z-10">
                <h2 className="text-2xl font-bold text-[#006064] flex items-center gap-2">
                    <ShipWheel className="w-8 h-8" /> {t.title}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-[#b2ebf2] rounded-full transition-colors">
                    <X className="w-6 h-6 text-[#00838f]" />
                </button>
           </div>

           <div className="w-full h-64 bg-gradient-to-b from-sky-300 to-blue-500 rounded-2xl relative shadow-inner overflow-hidden mb-6 cursor-pointer"
                onClick={() => {
                    if (gameState === 'idle' || gameState === 'caught' || gameState === 'missed') startFishing();
                    else handleReel();
                }}
           >
               <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-300 rounded-full blur-xl opacity-60"></div>
               <div className="absolute bottom-0 w-full h-1/2 bg-blue-600/30 backdrop-blur-[2px] animate-wave"></div>

               <div className={`
                    absolute left-1/2 -translate-x-1/2 transition-all duration-300
                    ${gameState === 'idle' ? 'top-[40%] opacity-50' : ''}
                    ${gameState === 'waiting' ? 'top-[60%] animate-bob' : ''}
                    ${gameState === 'bite' ? 'top-[70%] animate-shake scale-125' : ''}
                    ${gameState === 'caught' || gameState === 'missed' ? 'top-[10%] opacity-0' : ''}
               `}>
                   <div className="w-1 h-32 bg-gray-400 absolute bottom-4 left-1/2 -translate-x-1/2 -z-10 origin-top"></div>
                   <div className="w-6 h-6 bg-red-500 rounded-t-full border-2 border-white/50"></div>
                   <div className="w-6 h-6 bg-white rounded-b-full border-2 border-white/50 border-t-0"></div>
               </div>

               {gameState === 'bite' && (
                   <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-red-500 animate-ping">
                       <AlertCircle className="w-16 h-16" fill="white" />
                   </div>
               )}

               {gameState === 'caught' && caughtItem && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center animate-bounce-in bg-white/30 backdrop-blur-sm">
                        <div className={`w-32 h-32 p-4 rounded-full shadow-2xl mb-4 ${caughtItem.color} border-4 border-white`}>
                            {caughtItem.id === 'sardine' && <SardineVisual />}
                            {caughtItem.id === 'tuna' && <TunaVisual />}
                            {caughtItem.id === 'koi' && <KoiVisual />}
                            {caughtItem.id === 'golden_carp' && <GoldenCarpVisual />}
                            {caughtItem.id === 'old_boot' && <BootVisual />}
                            {caughtItem.id === 'tin_can' && <TinCanVisual />}
                        </div>
                        <h3 className="text-2xl font-black text-white drop-shadow-md stroke-black" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                            {t.fish_names[caughtItem.id]}
                        </h3>
                        <p className="text-white font-bold drop-shadow-md text-xl">+{caughtItem.score} pts</p>
                   </div>
               )}

               {gameState === 'missed' && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in bg-black/20 backdrop-blur-sm">
                        <div className="text-6xl mb-2">💦</div>
                        <h3 className="text-2xl font-black text-white drop-shadow-md">{t.missed}</h3>
                   </div>
               )}
           </div>

           <div className="text-center h-12">
               {gameState === 'idle' && (
                   <button onClick={startFishing} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded-full shadow-lg text-lg transition-transform active:scale-95">
                       {t.cast}
                   </button>
               )}
               {gameState === 'waiting' && (
                   <p className="text-[#00838f] font-bold animate-pulse text-lg">{t.waiting}</p>
               )}
               {gameState === 'bite' && (
                   <button onClick={handleReel} className="bg-red-500 hover:bg-red-600 text-white font-black py-4 px-12 rounded-full shadow-xl text-xl animate-pulse scale-110">
                       {t.reel}
                   </button>
               )}
               {(gameState === 'caught' || gameState === 'missed') && (
                   <button onClick={startFishing} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded-full shadow-lg text-lg transition-transform active:scale-95">
                       {t.play_again}
                   </button>
               )}
           </div>
           
           <p className="mt-4 text-xs text-[#006064]/60 text-center max-w-xs">
               {t.instructions}
           </p>

       </div>
       <style>{`
           @keyframes bob {
               0%, 100% { transform: translate(-50%, 0); }
               50% { transform: translate(-50%, -10px); }
           }
           @keyframes shake {
               0% { transform: translate(-50%, 0) rotate(0deg); }
               25% { transform: translate(-55%, 2px) rotate(-5deg); }
               50% { transform: translate(-45%, -2px) rotate(5deg); }
               75% { transform: translate(-52%, 2px) rotate(-5deg); }
               100% { transform: translate(-48%, -2px) rotate(5deg); }
           }
           @keyframes bounce-in {
               0% { transform: scale(0); opacity: 0; }
               60% { transform: scale(1.1); opacity: 1; }
               100% { transform: scale(1); }
           }
       `}</style>
    </div>
  );
};
