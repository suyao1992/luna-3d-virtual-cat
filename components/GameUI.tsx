
import React, { useState } from 'react';
import { CatStats, ChatMessage, CatAction, Language, OutfitId } from '../types';
import { StatsBar } from './ui/StatsBar';
import { ActionButtons } from './ui/ActionButtons';
import { ChatWindow } from './ui/ChatWindow';
import { BookReader } from './BookReader';
import { ProfilePanel } from './ui/ProfilePanel';

interface GameUIProps {
  stats: CatStats;
  currentAction: CatAction;
  messages: ChatMessage[];
  isTyping: boolean;
  language: Language;
  onSetLanguage: (lang: Language) => void;
  onSendMessage: (text: string) => void;
  onFeed: () => void;
  onWater: () => void;
  onClean: () => void;
  onPlayAction: (actionType: 'sing' | 'dance' | 'yoga' | 'fish' | 'climb' | 'read') => void;
  onSleep: () => void;
  onSelectGame: (gameType: 'gomoku' | 'xiangqi' | 'match3') => void;
  onCloseReader: () => void;
  currentOutfit: OutfitId;
  onSetOutfit: (outfit: OutfitId) => void;
  onOpenBackpack: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ 
  stats, 
  currentAction,
  messages,
  isTyping,
  language,
  onSetLanguage,
  onSendMessage,
  onFeed, 
  onWater,
  onClean,
  onPlayAction,
  onSleep,
  onSelectGame,
  onCloseReader,
  currentOutfit,
  onSetOutfit,
  onOpenBackpack
}) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-[100]">
      
      {/* Top Left: Profile Button */}
      <div className="absolute top-4 left-4 pointer-events-auto z-50 animate-fade-in-down">
          <button 
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/50 shadow-sm hover:bg-white/80 transition-all group"
          >
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center border-2 border-white overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                 <span className="text-xl">🐱</span>
              </div>
              <div className="flex flex-col items-start leading-none">
                  <span className="text-sm font-black text-gray-700">Luna</span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Lv.{stats.level}</span>
              </div>
          </button>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 pointer-events-auto flex gap-1 bg-white/50 backdrop-blur rounded-lg p-1 z-50">
          <button onClick={() => onSetLanguage('en')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-white/50'}`}>EN</button>
          <button onClick={() => onSetLanguage('zh')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'zh' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-white/50'}`}>中文</button>
          <button onClick={() => onSetLanguage('jp')} className={`px-2 py-1 text-xs font-bold rounded ${language === 'jp' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-white/50'}`}>JP</button>
      </div>

      <div className="flex flex-col items-center gap-2 mt-16 md:mt-0 w-full pointer-events-auto">
        <StatsBar stats={stats} language={language} />
      </div>

      {currentAction === 'reading' && (
          <div className="pointer-events-auto">
              <BookReader onClose={onCloseReader} />
          </div>
      )}

      {showProfile && (
          <div className="pointer-events-auto">
              <ProfilePanel stats={stats} language={language} onClose={() => setShowProfile(false)} />
          </div>
      )}

      <div className="flex items-end justify-between w-full pointer-events-auto gap-4 relative">
        <ActionButtons 
            stats={stats} 
            currentAction={currentAction}
            language={language}
            onFeed={onFeed}
            onWater={onWater}
            onClean={onClean}
            onPlayAction={onPlayAction}
            onSleep={onSleep}
            onSelectGame={onSelectGame}
            currentOutfit={currentOutfit}
            onSetOutfit={onSetOutfit}
            onOpenBackpack={onOpenBackpack}
        />
        <ChatWindow 
            messages={messages} 
            isTyping={isTyping} 
            language={language} 
            onSendMessage={onSendMessage} 
        />
      </div>
    </div>
  );
};
