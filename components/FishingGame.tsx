import React, { useState, useEffect, useRef } from 'react';
import { X, ShipWheel, Fish, Anchor, Trash2, Trophy, AlertCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';
import { audioService } from '../services/audio';

interface FishingGameProps {
  onClose: () => void;
  onCatch: (score: number) => void;
  language: Language;
}

type GameState = 'idle' | 'waiting' | 'bite' | 'caught' | 'missed';

interface CatchItem {
    name: string;
    icon: React.ReactNode;
    score: number;
    color: string;
    rarity: 'common' | 'rare' | 'legendary' | 'trash';
}

const ITEMS: CatchItem[] = [
    { name: 'Sardine', icon: <Fish className="w-8 h-8" />, score: 10, color: 'text-gray-400', rarity: 'common' },
    { name: 'Tuna', icon: <Fish className="w-10 h-10" />, score: 30, color: 'text-blue-500', rarity: 'common' },
    { name: 'Koi', icon: <Fish className="w-10 h-10" />, score: 50, color: 'text-orange-500', rarity: 'rare' },
    { name: 'Golden Carp', icon: <Trophy className="w-12 h-12" />, score: 100, color: 'text-yellow-500', rarity: 'legendary' },
    { name: 'Old Boot', icon: <Anchor className="w-8 h-8" />, score: 0, color: 'text-brown-500', rarity: 'trash' },
    { name: 'Tin Can', icon: <Trash2 className="w-8 h-8" />, score: 0, color: 'text-gray-500', rarity: 'trash' },
];

export const FishingGame: React.FC<FishingGameProps> = ({ onClose, onCatch, language }) => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [caughtItem, setCaughtItem] = useState<CatchItem | null>(null);
  const [reactionTime, setReactionTime] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const biteTimeoutRef = useRef<number | null>(null);
  
  const t = TRANSLATIONS[language].fishing;

  // --- GAME LOGIC ---

  const startFishing = () => {
    setGameState('waiting');
    setCaughtItem(null);
    audioService.playSplash();

    // Random wait time between 2s and 6s
    const waitTime = 2000 + Math.random() * 4000;

    timerRef.current = window.setTimeout(() => {
        triggerBite();
    }, waitTime);
  };

  const triggerBite = () => {
      setGameState('bite');
      audioService.playBoing(); // Use Boing as Bite sound or implement playSplash
      
      // Player has limited time to react (e.g., 800ms - 1200ms)
      const difficultyWindow = 1000; 
      
      biteTimeoutRef.current = window.setTimeout(() => {
          if (gameState === 'bite') { // If user hasn't clicked yet
              handleMiss();
          }
      }, difficultyWindow);
  };

  const handleReel = () => {
      if (gameState === 'waiting') {
          // Pulled too early
          handleMiss();
          if (timerRef.current) clearTimeout(timerRef.current);
      } else if (gameState === 'bite') {
          // Success!
          if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current);
          handleCatch();
      }
  };

  const handleCatch = () => {
      // Determine what was caught based on random weights
      const rand = Math.random();
      let item;
      
      if (rand > 0.95) item = ITEMS.find(i => i.rarity === 'legendary');
      else if (rand > 0.8) item = ITEMS.find(i => i.rarity === 'rare');
      else if (rand > 0.3) item = ITEMS.filter(i => i.rarity === 'common')[Math.floor(Math.random() * 2)]; // Random common
      else item = ITEMS.filter(i => i.rarity === 'trash')[Math.floor(Math.random() * 2)];

      if (!item) item = ITEMS[0]; // Fallback

      setCaughtItem(item);
      setGameState('caught');
      
      if (item.score > 0) {
        audioService.playMeow('happy');
        onCatch(item.score);
      } else {
        audioService.playMeow('grumpy');
      }
  };

  const handleMiss = () => {
      setGameState('missed');
      setCaughtItem(null);
      // audioService.playFail(); 
  };

  // Cleanup
  useEffect(() => {
      return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
          if (biteTimeoutRef.current) clearTimeout(biteTimeoutRef.current);
      };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in select-none">
       <div className="bg-[#e0f7fa] p-6 rounded-3xl shadow-2xl border-4 border-[#4dd0e1] w-full max-w-md flex flex-col items-center relative overflow-hidden">
           
           {/* Header */}
           <div className="flex justify-between w-full items-center mb-6 z-10">
                <h2 className="text-2xl font-bold text-[#006064] flex items-center gap-2">
                    <ShipWheel className="w-8 h-8" /> {t.title}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-[#b2ebf2] rounded-full transition-colors">
                    <X className="w-6 h-6 text-[#00838f]" />
                </button>
           </div>

           {/* Scene */}
           <div className="w-full h-64 bg-gradient-to-b from-sky-300 to-blue-500 rounded-2xl relative shadow-inner overflow-hidden mb-6 cursor-pointer"
                onClick={() => {
                    if (gameState === 'idle' || gameState === 'caught' || gameState === 'missed') startFishing();
                    else handleReel();
                }}
           >
               {/* Sun/Reflections */}
               <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-300 rounded-full blur-xl opacity-60"></div>

               {/* Water Surface Animation */}
               <div className="absolute bottom-0 w-full h-1/2 bg-blue-600/30 backdrop-blur-[2px] animate-wave"></div>

               {/* Bobber */}
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

               {/* Alert Icon */}
               {gameState === 'bite' && (
                   <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-red-500 animate-ping">
                       <AlertCircle className="w-16 h-16" fill="white" />
                   </div>
               )}

               {/* Catch Display */}
               {gameState === 'caught' && caughtItem && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center animate-bounce-in bg-white/30 backdrop-blur-sm">
                        <div className={`p-6 rounded-full bg-white shadow-xl mb-2 ${caughtItem.color}`}>
                            {caughtItem.icon}
                        </div>
                        <h3 className="text-2xl font-black text-white drop-shadow-md">{caughtItem.name}</h3>
                        <p className="text-white font-bold drop-shadow-md">+{caughtItem.score} pts</p>
                   </div>
               )}

               {/* Miss Display */}
               {gameState === 'missed' && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in bg-black/20 backdrop-blur-sm">
                        <div className="text-6xl mb-2">💦</div>
                        <h3 className="text-2xl font-black text-white drop-shadow-md">{t.missed}</h3>
                   </div>
               )}
           </div>

           {/* Controls / Instructions */}
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