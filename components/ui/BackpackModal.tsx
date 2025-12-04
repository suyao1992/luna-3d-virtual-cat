
import React, { useState } from 'react';
import { X, Package } from 'lucide-react';
import { Language, TRANSLATIONS, ItemId } from '../../types';
import { SardineVisual, TunaVisual, KoiVisual, GoldenCarpVisual, BootVisual, TinCanVisual } from './FishVisuals';

interface BackpackModalProps {
    inventory: Record<string, number>;
    onClose: () => void;
    onUseItem: (itemId: string) => void;
    onSellItem: (itemId: string) => void;
    language: Language;
}

const ItemIcon: React.FC<{ id: ItemId }> = ({ id }) => {
    switch(id) {
        case 'sardine': return <div className="w-10 h-10"><SardineVisual /></div>;
        case 'tuna': return <div className="w-12 h-12"><TunaVisual /></div>;
        case 'koi': return <div className="w-12 h-12"><KoiVisual /></div>;
        case 'golden_carp': return <div className="w-14 h-14"><GoldenCarpVisual /></div>;
        case 'old_boot': return <div className="w-10 h-10"><BootVisual /></div>;
        case 'tin_can': return <div className="w-10 h-10"><TinCanVisual /></div>;
        default: return <Package className="w-6 h-6 text-gray-400" />;
    }
};

export const BackpackModal: React.FC<BackpackModalProps> = ({ inventory, onClose, onUseItem, onSellItem, language }) => {
    const [selectedItem, setSelectedItem] = useState<ItemId | null>(null);
    const t = TRANSLATIONS[language];
    
    // Convert inventory map to array for display, filter out 0 quantity
    const items = Object.entries(inventory)
        .filter(([_, count]) => (count as number) > 0)
        .map(([id, count]) => ({ id: id as ItemId, count: count as number }));

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in select-none">
            <div className="bg-[#fffbf0] p-4 md:p-6 rounded-3xl shadow-2xl border-4 border-[#e6c9a8] w-full max-w-lg h-[60vh] flex flex-col relative">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-black text-[#5d4037] flex items-center gap-2">
                        <Package className="w-6 h-6" /> {t.backpack.title}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#e6d7c3] rounded-full transition-colors">
                        <X className="w-6 h-6 text-[#8d6e63]" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                    
                    {/* Grid */}
                    <div className="flex-1 bg-white/50 rounded-2xl p-4 border border-[#e6c9a8] overflow-y-auto scrollbar-hide">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <Package className="w-12 h-12 opacity-20" />
                                <p>{t.backpack.empty}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {items.map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => setSelectedItem(item.id)}
                                        className={`
                                            aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition-all overflow-hidden
                                            ${selectedItem === item.id 
                                                ? 'bg-blue-50 border-blue-400 shadow-md scale-105 z-10' 
                                                : 'bg-white border-[#e6c9a8] hover:bg-[#fff9f0]'}
                                        `}
                                    >
                                        <div className="mb-1 transform scale-90 pointer-events-none">
                                            <ItemIcon id={item.id} />
                                        </div>
                                        <div className="absolute top-1 right-1 bg-[#8d6e63] text-white text-[10px] font-bold px-1.5 rounded-full min-w-[1.2rem] text-center shadow-sm">
                                            {item.count}
                                        </div>
                                    </button>
                                ))}
                                {/* Empty Slots for visuals */}
                                {Array.from({ length: Math.max(0, 12 - items.length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square rounded-xl border-2 border-dashed border-[#e6c9a8]/50 bg-black/5" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Panel */}
                    <div className="h-32 md:h-full md:w-48 bg-white rounded-2xl p-4 border border-[#e6c9a8] flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                        {selectedItem ? (
                            <div className="flex flex-col items-center justify-between h-full w-full">
                                <div>
                                    <h3 className="font-bold text-[#5d4037] text-lg mb-1">{t.fishing.fish_names[selectedItem]}</h3>
                                    <div className="transform scale-150 my-4 drop-shadow-lg">
                                        <ItemIcon id={selectedItem} />
                                    </div>
                                    <p className="text-xs text-gray-500 leading-tight mt-2 px-1">
                                        {t.backpack.description[selectedItem]}
                                    </p>
                                </div>
                                
                                <div className="flex flex-col gap-2 w-full mt-2 z-10">
                                    <button 
                                        onClick={() => { onUseItem(selectedItem); }}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 rounded-lg text-sm transition-colors shadow-sm active:scale-95"
                                    >
                                        {t.backpack.use}
                                    </button>
                                    <button 
                                        onClick={() => { onSellItem(selectedItem); }}
                                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-1.5 rounded-lg text-sm transition-colors shadow-sm active:scale-95"
                                    >
                                        {t.backpack.sell}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic px-4">
                                Select an item to see details
                            </p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
