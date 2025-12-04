
import React, { useState } from 'react';
import { X, Sprout, Droplets, Scissors, Shovel, Check, Carrot } from 'lucide-react';
import { Language, TRANSLATIONS, GardenSlot, PlantType } from '../../types';

interface GardenModalProps {
    slots: GardenSlot[];
    onClose: () => void;
    onTill: (id: number) => void;
    onPlant: (id: number, type: PlantType) => void;
    onWater: (id: number) => void;
    onWeed: (id: number) => void;
    onHarvest: (id: number) => void;
    language: Language;
}

export const GardenModal: React.FC<GardenModalProps> = ({ slots, onClose, onTill, onPlant, onWater, onWeed, onHarvest, language }) => {
    const t = TRANSLATIONS[language].garden;
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

    const selectedSlot = selectedSlotId !== null ? slots.find(s => s.id === selectedSlotId) : null;

    const renderSlot = (slot: GardenSlot) => {
        const isSelected = slot.id === selectedSlotId;
        
        let content = <div className="text-gray-300 text-xs">{t.soil_empty}</div>;
        let bgClass = "bg-[#d7ccc8]"; // Dry soil

        if (slot.soilState === 'ready') {
            bgClass = slot.moisture > 30 ? "bg-[#5d4037]" : "bg-[#a1887f]"; // Wet vs Dry Tilled
            content = <div className="text-white/50 text-xs">{t.soil_ready}</div>;
        }

        if (slot.plantType) {
            content = (
                <div className="flex flex-col items-center">
                    <div className="text-2xl mb-1">
                        {slot.growthStage === 0 && "🌱"}
                        {slot.growthStage === 1 && "🌿"}
                        {slot.growthStage === 2 && "🥕"}
                        {slot.growthStage === 3 && "🧺"}
                    </div>
                    {slot.growthStage < 3 && (
                        <div className="w-10 h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <div className="h-full bg-green-400" style={{ width: `${slot.growthProgress}%` }}></div>
                        </div>
                    )}
                </div>
            );
        }

        if (slot.hasWeeds) {
            content = <div className="text-green-800 font-bold text-lg">🌿!</div>;
        }

        return (
            <button
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`
                    aspect-square rounded-xl border-4 relative flex items-center justify-center transition-all
                    ${bgClass}
                    ${isSelected ? 'border-yellow-400 scale-105 z-10 shadow-lg' : 'border-[#8d6e63] hover:brightness-110'}
                `}
            >
                {content}
                {/* Moisture Indicator */}
                {slot.moisture > 0 && (
                    <div className="absolute top-1 right-1 text-blue-400 text-[10px]">💧</div>
                )}
            </button>
        );
    };

    return (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in select-none">
            <div className="bg-[#fff3e0] p-6 rounded-3xl shadow-2xl border-4 border-[#8d6e63] w-full max-w-lg flex flex-col relative overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-[#5d4037] flex items-center gap-2">
                        <Sprout className="w-6 h-6 text-green-600" /> {t.title}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#ffe0b2] rounded-full transition-colors">
                        <X className="w-6 h-6 text-[#5d4037]" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-3 w-full md:w-64 aspect-square bg-[#795548] p-3 rounded-2xl shadow-inner">
                        {slots.map(renderSlot)}
                    </div>

                    {/* Controls */}
                    <div className="flex-1 flex flex-col gap-3">
                        {selectedSlot ? (
                            <div className="bg-white/50 rounded-2xl p-4 h-full border border-[#ffe0b2] flex flex-col">
                                <div className="mb-4">
                                    <h3 className="font-bold text-[#5d4037] text-lg">
                                        Slot #{selectedSlot.id + 1}
                                    </h3>
                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                        Status: {selectedSlot.soilState === 'empty' ? t.soil_empty : selectedSlot.plantType ? selectedSlot.plantType : t.soil_ready}
                                    </div>
                                    {selectedSlot.plantType && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                                <span>{t.moisture}</span>
                                                <span className="text-blue-500">{Math.round(selectedSlot.moisture)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-400" style={{ width: `${selectedSlot.moisture}%` }}></div>
                                            </div>
                                            
                                            <div className="flex justify-between text-xs font-bold text-gray-600 mt-1">
                                                <span>{t.health}</span>
                                                <span className={selectedSlot.health < 50 ? "text-red-500" : "text-green-500"}>{Math.round(selectedSlot.health)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className={`h-full ${selectedSlot.health < 50 ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${selectedSlot.health}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    {/* Actions based on state */}
                                    {selectedSlot.soilState === 'empty' && (
                                        <button onClick={() => onTill(selectedSlot.id)} className="col-span-2 bg-[#8d6e63] hover:bg-[#6d4c41] text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                                            <Shovel className="w-4 h-4" /> {t.till}
                                        </button>
                                    )}

                                    {selectedSlot.soilState === 'ready' && !selectedSlot.plantType && (
                                        <>
                                            <button onClick={() => onPlant(selectedSlot.id, 'carrot')} className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm">
                                                <span>🥕</span> {t.plant_carrot}
                                            </button>
                                            <button onClick={() => onPlant(selectedSlot.id, 'radish')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm border border-gray-300">
                                                <span>🥬</span> {t.plant_radish}
                                            </button>
                                        </>
                                    )}

                                    {selectedSlot.plantType && (
                                        <>
                                            {selectedSlot.growthStage === 3 ? (
                                                <button onClick={() => onHarvest(selectedSlot.id)} className="col-span-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-md animate-pulse">
                                                    <Carrot className="w-5 h-5" /> {t.harvest}
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => onWater(selectedSlot.id)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 shadow-sm">
                                                        <Droplets className="w-4 h-4" /> {t.water}
                                                    </button>
                                                    {selectedSlot.hasWeeds && (
                                                        <button onClick={() => onWeed(selectedSlot.id)} className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1 shadow-sm animate-bounce">
                                                            <Scissors className="w-4 h-4" /> {t.weed}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic bg-black/5 rounded-2xl border border-dashed border-[#d7ccc8]">
                                Select a slot to interact
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
