
import React, { useState, useEffect, useRef } from 'react';
import { CatStats, ChatMessage, CatAction, Language, TRANSLATIONS } from '../types';
import { Heart, Zap, Fish, Send, MessageCircle, Droplets, Trash2, Sparkles, Grid3X3, Music, Video, ShipWheel, Disc, Mic, Activity, X } from 'lucide-react';

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
  onPlayAction: (actionType: 'chase' | 'sing' | 'dance' | 'yoga' | 'fish') => void;
  onSleep: () => void;
  onSelectGame: (gameType: 'gomoku' | 'xiangqi') => void;
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
  onSelectGame
}) => {
  const [input, setInput] = useState('');
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [showPlayMenu, setShowPlayMenu] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpenChat]);

  // Close menus if action starts
  useEffect(() => {
      if (currentAction !== 'idle') {
          setShowPlayMenu(false);
          setShowGameMenu(false);
      }
  }, [currentAction]);

  const handleSend = () => {
      if (!input.trim()) return;
      onSendMessage(input);
      setInput('');
  };

  const getBarColor = (value: number) => {
    if (value > 70) return 'bg-green-500';
    if (value > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handlePlayClick = () => {
      setShowGameMenu(false);
      setShowPlayMenu(!showPlayMenu);
  };
  
  const handleGameClick = () => {
      setShowPlayMenu(false);
      setShowGameMenu(!showGameMenu);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-10">
      
      {/* Top Right: Language Switcher */}
      <div className="absolute top-4 right-4 pointer-events-auto flex gap-1 bg-white/50 backdrop-blur rounded-lg p-1 z-50">
          <button 
            onClick={() => onSetLanguage('en')} 
            className={`px-2 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-white/50'}`}
          >
            EN
          </button>
          <button 
            onClick={() => onSetLanguage('zh')} 
            className={`px-2 py-1 text-xs font-bold rounded ${language === 'zh' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-white/50'}`}
          >
            中文
          </button>
          <button 
            onClick={() => onSetLanguage('jp')} 
            className={`px-2 py-1 text-xs font-bold rounded ${language === 'jp' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-white/50'}`}
          >
            JP
          </button>
      </div>

      {/* Top Section: Stats Only */}
      <div className="flex flex-col items-center gap-2 mt-8 md:mt-0 w-full">
        
        {/* Top Bar: Stats */}
        <div className="pointer-events-auto bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/50 shadow-lg w-full max-w-2xl animate-fade-in-down">
            <div className="grid grid-cols-5 gap-2 md:gap-4">
                
                {/* Hunger */}
                <div>
                <div className="flex items-center gap-1 mb-1">
                    <Fish className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                    <span className="text-[9px] md:text-xs font-bold text-gray-800 uppercase tracking-tighter">{t.stats.food}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${getBarColor(stats.hunger)}`} style={{ width: `${stats.hunger}%` }} />
                </div>
                </div>

                {/* Thirst */}
                <div>
                <div className="flex items-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                    <span className="text-[9px] md:text-xs font-bold text-gray-800 uppercase tracking-tighter">{t.stats.water}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${getBarColor(stats.thirst)}`} style={{ width: `${stats.thirst}%` }} />
                </div>
                </div>

                {/* Hygiene */}
                <div>
                <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
                    <span className="text-[9px] md:text-xs font-bold text-gray-800 uppercase tracking-tighter">{t.stats.clean}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${stats.hygiene > 60 ? 'bg-purple-500' : 'bg-gray-600'}`} style={{ width: `${stats.hygiene}%` }} />
                </div>
                </div>

                {/* Happiness */}
                <div>
                <div className="flex items-center gap-1 mb-1">
                    <Heart className="w-3 h-3 md:w-4 md:h-4 text-pink-500" />
                    <span className="text-[9px] md:text-xs font-bold text-gray-800 uppercase tracking-tighter">{t.stats.love}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${getBarColor(stats.happiness)}`} style={{ width: `${stats.happiness}%` }} />
                </div>
                </div>

                {/* Energy */}
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
      </div>


      {/* Bottom Area: Controls & Chat */}
      <div className="flex items-end justify-between w-full pointer-events-auto gap-4 relative">
        
        {/* Play Menu Overlay */}
        {showPlayMenu && (
            <div className="absolute bottom-24 left-0 bg-white/90 backdrop-blur-lg p-4 rounded-3xl shadow-2xl border border-white/50 animate-fade-in-up flex gap-4 z-50">
                <button onClick={() => onPlayAction('sing')} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors shadow-sm">
                        <Mic className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{t.play_menu.sing}</span>
                </button>
                <button onClick={() => onPlayAction('dance')} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors shadow-sm">
                        <Music className="w-6 h-6 text-pink-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{t.play_menu.dance}</span>
                </button>
                <button onClick={() => onPlayAction('yoga')} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors shadow-sm">
                        <Activity className="w-6 h-6 text-teal-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{t.play_menu.yoga}</span>
                </button>
                <button onClick={() => onPlayAction('fish')} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors shadow-sm">
                        <ShipWheel className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{t.play_menu.fish}</span>
                </button>
                <button onClick={() => onPlayAction('chase')} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors shadow-sm">
                        <Disc className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{t.play_menu.chase}</span>
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                 <button onClick={() => setShowPlayMenu(false)} className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
            </div>
        )}

        {/* Game Menu Overlay */}
        {showGameMenu && (
            <div className="absolute bottom-24 left-40 bg-white/90 backdrop-blur-lg p-4 rounded-3xl shadow-2xl border border-white/50 animate-fade-in-up flex gap-4 z-50">
                 <button onClick={() => onSelectGame('gomoku')} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors shadow-sm">
                        <Grid3X3 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{t.game_menu.gomoku}</span>
                </button>
                 <button onClick={() => onSelectGame('xiangqi')} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors shadow-sm">
                        <span className="text-xl font-serif text-red-800 font-bold">帅</span>
                    </div>
                    <span className="text-xs font-bold text-gray-600">{t.game_menu.xiangqi}</span>
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                 <button onClick={() => setShowGameMenu(false)} className="flex flex-col items-center justify-center gap-1 group text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-2 max-w-[60%]">
          {/* Feed */}
          <button 
            onClick={onFeed}
            disabled={currentAction !== 'idle' || stats.hunger >= 95}
            className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-orange-200 group-hover:bg-orange-200 transition-colors">
               <Fish className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
            </div>
            <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.feed}</span>
          </button>

          {/* Water */}
          <button 
            onClick={onWater}
            disabled={currentAction !== 'idle' || stats.thirst >= 95}
            className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-blue-200 group-hover:bg-blue-200 transition-colors">
               <Droplets className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            </div>
            <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.water}</span>
          </button>

           {/* Clean */}
           <button 
            onClick={onClean}
            disabled={stats.hygiene >= 100}
            className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-300 group-hover:bg-gray-200 transition-colors">
               <Trash2 className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
            </div>
            <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.clean}</span>
          </button>

          {/* Play (Toggles Menu) */}
          <button 
            onClick={handlePlayClick}
            disabled={currentAction !== 'idle' || stats.energy <= 10}
            className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale relative"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 bg-pink-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-pink-200 transition-colors ${showPlayMenu ? 'bg-pink-300 border-pink-400' : 'group-hover:bg-pink-200'}`}>
               <Heart className={`w-6 h-6 md:w-8 md:h-8 ${showPlayMenu ? 'text-white' : 'text-pink-500'}`} />
            </div>
            <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.play}</span>
          </button>

          {/* Sleep */}
          <button 
            onClick={onSleep}
            disabled={currentAction !== 'idle' || stats.energy >= 90}
            className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-purple-200 group-hover:bg-purple-200 transition-colors">
               <Zap className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
            </div>
            <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.sleep}</span>
          </button>
          
           {/* Game (Toggles Menu) */}
           <button 
            onClick={handleGameClick}
            disabled={currentAction !== 'idle'}
            className="group flex flex-col items-center gap-1 transition-transform active:scale-95 disabled:opacity-50 disabled:grayscale relative"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-lg border-2 border-indigo-200 transition-colors ${showGameMenu ? 'bg-indigo-300 border-indigo-400' : 'group-hover:bg-indigo-200'}`}>
               <Grid3X3 className={`w-6 h-6 md:w-8 md:h-8 ${showGameMenu ? 'text-white' : 'text-indigo-500'}`} />
            </div>
            <span className="font-bold text-gray-700 text-xs md:text-sm bg-white/70 px-2 rounded">{t.actions.game}</span>
          </button>
        </div>

        {/* Chat Button (Toggles Modal) */}
        <button 
            onClick={() => setIsOpenChat(!isOpenChat)}
            className="mb-6 mr-2 bg-blue-500 hover:bg-blue-600 text-white p-3 md:p-4 rounded-full shadow-xl transition-all active:scale-90 animate-bounce-slow"
        >
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      </div>

      {/* Chat Overlay */}
      {isOpenChat && (
        <div className="pointer-events-auto absolute bottom-24 right-4 w-80 md:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 flex flex-col overflow-hidden animate-slide-up origin-bottom-right h-[50vh]">
            <div className="bg-blue-50 p-3 border-b border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-bold text-gray-700">{t.chat.title}</span>
                </div>
                <button onClick={() => setIsOpenChat(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                            msg.sender === 'user' 
                                ? 'bg-blue-500 text-white rounded-br-none' 
                                : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-2 text-sm text-gray-400 flex gap-1">
                            <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t.chat.placeholder}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
