
import React, { useEffect, useState, useRef } from 'react';
import { X, Sun, CloudRain, Cloud, Moon, Thermometer, MapPin, Loader, Info, Search, Activity, Navigation } from 'lucide-react';
import { WeatherCondition, OutfitRecommendation, WeatherState, PixelArtConfig, Language } from '../../types';

interface WeatherPanelProps {
    onClose: () => void;
    weather: WeatherCondition;
    timeOfDay: number;
    language: Language;
}

const API_KEY = "e48b3961f648620fd7b90f203f6391d8"; // Provided API Key

const UI_TEXT = {
    en: {
        title: "OOTD Guide",
        locating: "Locating...",
        scanning: "Scanning...",
        searchPlaceholder: "Search city...",
        time: "LOCAL TIME",
        clickTip: "Click items!",
        defaultReason: "Click on a clothing item to see why it was chosen for today!",
        style: {
            rainy: "Rainy Day Gear",
            night: "Sleepy Time",
            summer: "Summer Vibes",
            winter: "Winter Warmth",
            casual: "Casual Chic"
        },
        desc: {
            rainy: "Keep dry and splash safely!",
            night: "Ready for sweet dreams.",
            summer: "Hot sun protection is key.",
            winter: "Bundle up against the chill.",
            casual: "Comfortable for mild weather."
        },
        items: {
            rain_hat: { name: "Yellow Sou'wester", reason: "Wide brim keeps rain off your face and whiskers." },
            raincoat: { name: "Waterproof Slicker", reason: "Essential layer to keep fur dry and warm." },
            boots: { name: "Rubber Wellies", reason: "Perfect traction for wet pavement and puddles." },
            night_cap: { name: "Night Cap", reason: "Keeps ears warm during chilly nights." },
            pjs: { name: "Cozy PJs", reason: "Soft fabric for maximum comfort." },
            sun_hat: { name: "Sun Hat", reason: "Shades eyes from bright glare." },
            light_shirt: { name: "Light Shirt", reason: "Breathable fabric prevents overheating." },
            sunglasses: { name: "Sunglasses", reason: "Protects vision from UV rays." },
            beanie: { name: "Wool Beanie", reason: "Retains body heat efficiently." },
            sweater: { name: "Knitted Sweater", reason: "Thick insulation against cold winds." },
            scarf: { name: "Scarf", reason: "Protects the neck from drafts." },
            denim: { name: "Denim Jacket", reason: "Versatile layer for changing temps." },
            sneakers: { name: "Sneakers", reason: "Comfortable for walking around town." }
        },
        conditions: {
            sunny: "Sunny",
            rainy: "Rainy",
            cloudy: "Cloudy",
            starry: "Clear Night"
        },
        activity: {
            title: "Lifestyle Guide",
            rainy: "Indoor yoga or gym recommended. Roads are slippery, drive safe.",
            hot: "Swimming or evening walks. Avoid outdoor activities at noon.",
            perfect: "Great for hiking, cycling, and picnics! Enjoy the outdoors.",
            chilly: "Brisk walking or jogging. Good visibility for sightseeing.",
            cold: "Indoor sports or hot springs. Keep warm if traveling."
        }
    },
    zh: {
        title: "今日穿搭指南",
        locating: "定位中...",
        scanning: "扫描中...",
        searchPlaceholder: "搜索城市...",
        time: "当地时间",
        clickTip: "点击查看!",
        defaultReason: "点击衣物查看为什么今天要这样穿！",
        style: {
            rainy: "雨天装备",
            night: "睡衣派对",
            summer: "夏日风情",
            winter: "冬日暖阳",
            casual: "休闲时尚"
        },
        desc: {
            rainy: "保持干燥，安心踩水！",
            night: "准备做一个甜甜的梦。",
            summer: "防晒是关键哦。",
            winter: "裹紧小被子，拒绝寒冷。",
            casual: "舒适自在，适合温和天气。"
        },
        items: {
            rain_hat: { name: "黄色防雨帽", reason: "宽大的帽檐能挡住雨水，保护胡须。" },
            raincoat: { name: "防水雨衣", reason: "保持毛发干燥温暖的必备层。" },
            boots: { name: "橡胶雨靴", reason: "在湿滑路面和水坑中提供完美抓地力。" },
            night_cap: { name: "睡帽", reason: "在寒冷的夜晚保护耳朵温暖。" },
            pjs: { name: "舒适睡衣", reason: "柔软面料带来最大舒适度。" },
            sun_hat: { name: "遮阳帽", reason: "遮挡刺眼的阳光。" },
            light_shirt: { name: "轻薄衬衫", reason: "透气面料防止过热。" },
            sunglasses: { name: "太阳镜", reason: "保护视力免受紫外线伤害。" },
            beanie: { name: "羊毛冷帽", reason: "有效保持体温。" },
            sweater: { name: "针织毛衣", reason: "抵御寒风的厚实保暖层。" },
            scarf: { name: "围巾", reason: "保护颈部免受冷风侵袭。" },
            denim: { name: "牛仔夹克", reason: "应对变温的多功能外套。" },
            sneakers: { name: "运动鞋", reason: "适合在城市中漫步。" }
        },
        conditions: {
            sunny: "晴朗",
            rainy: "下雨",
            cloudy: "多云",
            starry: "晴朗夜空"
        },
        activity: {
            title: "运动出行建议",
            rainy: "建议室内瑜伽或健身。雨天路滑，开车出行请注意安全。",
            hot: "适合游泳或夜跑。中午紫外线强，避免长时间户外暴晒。",
            perfect: "完美的天气！非常适合徒步、骑行或郊游野餐。",
            chilly: "空气清新，适合慢跑或快走。适合城市观光。",
            cold: "推荐室内运动或泡温泉。户外出行请注意防风保暖。"
        }
    },
    jp: {
        title: "今日のコーデ",
        locating: "測位中...",
        scanning: "スキャン中...",
        searchPlaceholder: "都市を検索...",
        time: "現地時間",
        clickTip: "詳細を見る",
        defaultReason: "アイテムをクリックして、おすすめの理由をチェック！",
        style: {
            rainy: "雨の日コーデ",
            night: "おやすみスタイル",
            summer: "サマーバイブス",
            winter: "あったか冬服",
            casual: "カジュアルシック"
        },
        desc: {
            rainy: "濡れないように気をつけて！",
            night: "いい夢を見る準備はOK？",
            summer: "日差し対策は重要だよ。",
            winter: "寒さに負けないように着込んで。",
            casual: "穏やかな天気にぴったり。"
        },
        items: {
            rain_hat: { name: "黄色いレインハット", reason: "広いツバが雨から顔とヒゲを守ります。" },
            raincoat: { name: "防水レインコート", reason: "毛並みをドライで暖かく保つ必需品。" },
            boots: { name: "ゴム長靴", reason: "濡れた路面や水たまりでも滑りにくい。" },
            night_cap: { name: "ナイトキャップ", reason: "寒い夜に耳を温かく保ちます。" },
            pjs: { name: "快適なパジャマ", reason: "最高の着心地を提供する柔らかい生地。" },
            sun_hat: { name: "サンハット", reason: "眩しい日差しを遮ります。" },
            light_shirt: { name: "薄手のシャツ", reason: "通気性が良く、オーバーヒートを防ぎます。" },
            sunglasses: { name: "サングラス", reason: "紫外線から目を守ります。" },
            beanie: { name: "ウールビーニー", reason: "体温を効率的に保持します。" },
            sweater: { name: "ニットセーター", reason: "冷たい風を防ぐ厚手の断熱層。" },
            scarf: { name: "マフラー", reason: "首元を隙間風から守ります。" },
            denim: { name: "デニムジャケット", reason: "気温の変化に対応できる万能アウター。" },
            sneakers: { name: "スニーカー", reason: "街歩きに最適な履き心地。" }
        },
        conditions: {
            sunny: "晴れ",
            rainy: "雨",
            cloudy: "曇り",
            starry: "快晴（夜）"
        },
        activity: {
            title: "ライフスタイルガイド",
            rainy: "室内ヨガやジムがおすすめ。雨で道が滑りやすいので運転は慎重に。",
            hot: "水泳や夜の散歩が良いでしょう。日中の屋外活動は控えめに。",
            perfect: "ハイキングやサイクリングに最適！アウトドアを楽しもう。",
            chilly: "ジョギングにいい気温です。観光にも適しています。",
            cold: "屋内スポーツや温泉がおすすめ。外出時は暖かくして。"
        }
    }
};

const PixelCat: React.FC<{ config: PixelArtConfig; onClickItem: (type: string) => void }> = ({ config, onClickItem }) => {
    const catColor = "#ffffff";
    const hatColor = config.hat === 'rain_hat' ? '#facc15' : config.hat === 'beanie' ? '#ef4444' : config.hat === 'sun_hat' ? '#fcd34d' : '#818cf8';
    const topColor = config.top === 'raincoat' ? '#facc15' : config.top === 'sweater' ? '#ef4444' : '#60a5fa';
    const shoeColor = config.shoes === 'boots' ? '#1e3a8a' : '#ef4444';

    return (
        <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md" shapeRendering="crispEdges">
            <circle cx="16" cy="16" r="14" fill="#f3f4f6" />
            <path d="M22 22 H24 V24 H25 V26 H22 V25 H21 V22 Z" fill={catColor} />
            <rect x="10" y="14" width="12" height="12" fill={config.top ? topColor : catColor} onClick={() => config.top && onClickItem('top')} className={config.top ? "cursor-pointer hover:opacity-80" : ""} />
            <rect x="9" y="6" width="14" height="9" fill={catColor} />
            <rect x="9" y="4" width="3" height="2" fill={catColor} />
            <rect x="20" y="4" width="3" height="2" fill={catColor} />
            <rect x="11" y="9" width="2" height="2" fill="#333" />
            <rect x="19" y="9" width="2" height="2" fill="#333" />
            <rect x="15" y="11" width="2" height="1" fill="#fb7185" />

            {config.hat === 'rain_hat' && (
                <path d="M8 5 H24 V7 H8 Z M10 3 H22 V5 H10 Z" fill={hatColor} onClick={() => onClickItem('hat')} className="cursor-pointer hover:opacity-80" />
            )}
            {config.hat === 'sun_hat' && (
                <path d="M6 6 H26 V7 H6 Z M10 3 H22 V6 H10 Z" fill={hatColor} onClick={() => onClickItem('hat')} className="cursor-pointer hover:opacity-80" />
            )}
            {config.hat === 'beanie' && (
                <path d="M10 2 H22 V6 H10 Z" fill={hatColor} onClick={() => onClickItem('hat')} className="cursor-pointer hover:opacity-80" />
            )}
            {config.hat === 'sleeping_cap' && (
                <path d="M10 2 H22 V6 H10 Z M22 2 H24 V10 H22 Z" fill={hatColor} onClick={() => onClickItem('hat')} className="cursor-pointer hover:opacity-80" />
            )}

            {config.accessory === 'sunglasses' && (
                <g onClick={() => onClickItem('accessory')} className="cursor-pointer hover:opacity-80">
                    <rect x="10" y="9" width="4" height="2" fill="#111" />
                    <rect x="18" y="9" width="4" height="2" fill="#111" />
                    <rect x="14" y="10" width="4" height="1" fill="#111" />
                </g>
            )}
            {config.accessory === 'scarf' && (
                <rect x="9" y="14" width="14" height="2" fill="#1e40af" onClick={() => onClickItem('accessory')} className="cursor-pointer hover:opacity-80" />
            )}

            {config.shoes && (
                <g onClick={() => onClickItem('shoes')} className="cursor-pointer hover:opacity-80">
                    <rect x="10" y="26" width="4" height="2" fill={shoeColor} />
                    <rect x="18" y="26" width="4" height="2" fill={shoeColor} />
                </g>
            )}
            {!config.shoes && (
                <g>
                    <rect x="10" y="26" width="4" height="2" fill={catColor} />
                    <rect x="18" y="26" width="4" height="2" fill={catColor} />
                </g>
            )}
        </svg>
    );
};

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ onClose, weather, timeOfDay, language }) => {
    const t = UI_TEXT[language];
    const [localWeather, setLocalWeather] = useState<WeatherState>({
        condition: weather,
        temp: 20,
        city: t.scanning,
        isLocating: true,
        timezoneOffset: 8 // Default to UTC+8
    });
    
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [displayTime, setDisplayTime] = useState("");
    
    const isMounted = useRef(true);

    // --- TIME CALCULATION ---
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const utcHours = now.getUTCHours();
            const utcMinutes = now.getUTCMinutes();
            
            const offset = localWeather.timezoneOffset ?? 0;
            let localH = (utcHours + offset) % 24;
            if (localH < 0) localH += 24;
            
            const hStr = Math.floor(localH).toString().padStart(2, '0');
            const mStr = utcMinutes.toString().padStart(2, '0');
            setDisplayTime(`${hStr}:${mStr}`);
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [localWeather.timezoneOffset]);

    // --- API & GEOLOCATION ---
    const mapCondition = (owmMain: string): WeatherCondition => {
        const main = owmMain.toLowerCase();
        if (main.includes('rain') || main.includes('drizzle') || main.includes('thunder') || main.includes('snow')) return 'rainy';
        if (main.includes('cloud') || main.includes('mist') || main.includes('smoke') || main.includes('haze') || main.includes('fog')) return 'cloudy';
        return 'sunny';
    }

    const fetchWeatherData = async (query: { q?: string, lat?: number, lon?: number }) => {
        if(!isMounted.current) return;
        setLocalWeather(prev => ({ ...prev, isLocating: true, city: t.scanning }));
        
        const owmLang = language === 'zh' ? 'zh_cn' : language === 'jp' ? 'ja' : 'en';
        let url = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY.trim()}&units=metric&lang=${owmLang}`;
        
        if (query.q) {
            url += `&q=${encodeURIComponent(query.q.trim())}`;
        } else if (query.lat !== undefined && query.lon !== undefined) {
            url += `&lat=${query.lat}&lon=${query.lon}`;
        } else {
            return;
        }

        try {
            const res = await fetch(url);
            
            if(!isMounted.current) return;

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.warn("Weather API Error:", res.status, errData);
                
                let errorMsg = "Error";
                if (res.status === 404) errorMsg = "Not Found"; // City not found
                if (res.status === 401) errorMsg = "Bad Key"; // API Key Issue
                
                setLocalWeather(prev => ({ ...prev, isLocating: false, city: errorMsg }));
                return;
            }

            const data = await res.json();

            setLocalWeather({
                condition: mapCondition(data.weather[0].main),
                temp: data.main.temp,
                city: data.name || "Unknown",
                isLocating: false,
                timezoneOffset: data.timezone / 3600 // Convert seconds to hours
            });
        } catch (err) {
            console.error("Weather fetch failed", err);
            if(isMounted.current) {
                setLocalWeather(prev => ({ ...prev, isLocating: false, city: "Net Error" }));
            }
        }
    }

    // Initial Load (Geolocation with Timeout)
    useEffect(() => {
        isMounted.current = true;
        let geoTimeout: number;

        const startGeo = () => {
            if ("geolocation" in navigator) {
                geoTimeout = window.setTimeout(() => {
                    if(isMounted.current) {
                        console.warn("Geolocation timed out, defaulting to Beijing");
                        fetchWeatherData({ q: "Beijing" });
                    }
                }, 5000); // 5s timeout

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        window.clearTimeout(geoTimeout);
                        fetchWeatherData({ lat: position.coords.latitude, lon: position.coords.longitude });
                    },
                    (error) => {
                        window.clearTimeout(geoTimeout);
                        console.warn("Geolocation failed/denied:", error);
                        fetchWeatherData({ q: "Beijing" }); // Default
                    }
                );
            } else {
                fetchWeatherData({ q: "Beijing" });
            }
        };

        startGeo();

        return () => {
            isMounted.current = false;
            window.clearTimeout(geoTimeout);
        };
    }, []);

    const handleCitySearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setIsSearching(false);
            return;
        }
        fetchWeatherData({ q: searchQuery });
        setIsSearching(false);
    };

    // --- ACTIVITY ADVICE LOGIC ---
    const getActivityAdvice = (): string => {
        const { condition, temp } = localWeather;
        
        if (condition === 'rainy') return t.activity.rainy;
        if (temp > 30) return t.activity.hot;
        if (temp >= 20 && temp <= 30 && condition === 'sunny') return t.activity.perfect;
        if (temp >= 10 && temp < 20) return t.activity.chilly;
        if (temp < 10) return t.activity.cold;
        
        return t.activity.perfect; // Default
    };

    // --- OOTD LOGIC ---
    const getRecommendation = (): OutfitRecommendation => {
        const { condition, temp, timezoneOffset } = localWeather;
        
        const now = new Date();
        const utcHours = now.getUTCHours();
        const currentHourLocal = (utcHours + (timezoneOffset || 0) + 24) % 24;
        const isNight = currentHourLocal > 21 || currentHourLocal < 6;

        if (condition === 'rainy') return {
            style: t.style.rainy,
            desc: t.desc.rainy,
            color: "bg-blue-50 border-blue-200 text-blue-800",
            items: [
                { id: 'hat', type: 'hat', name: t.items.rain_hat.name, reason: t.items.rain_hat.reason },
                { id: 'top', type: 'top', name: t.items.raincoat.name, reason: t.items.raincoat.reason },
                { id: 'shoes', type: 'shoes', name: t.items.boots.name, reason: t.items.boots.reason }
            ],
            pixelConfig: { hat: 'rain_hat', top: 'raincoat', shoes: 'boots' }
        };

        if (isNight) return {
            style: t.style.night,
            desc: t.desc.night,
            color: "bg-indigo-50 border-indigo-200 text-indigo-800",
            items: [
                { id: 'hat', type: 'hat', name: t.items.night_cap.name, reason: t.items.night_cap.reason },
                { id: 'top', type: 'top', name: t.items.pjs.name, reason: t.items.pjs.reason }
            ],
            pixelConfig: { hat: 'sleeping_cap', top: 'sweater' } 
        };

        if (condition === 'sunny' && temp > 25) return {
            style: t.style.summer,
            desc: t.desc.summer,
            color: "bg-orange-50 border-orange-200 text-orange-800",
            items: [
                { id: 'hat', type: 'hat', name: t.items.sun_hat.name, reason: t.items.sun_hat.reason },
                { id: 'top', type: 'top', name: t.items.light_shirt.name, reason: t.items.light_shirt.reason },
                { id: 'accessory', type: 'accessory', name: t.items.sunglasses.name, reason: t.items.sunglasses.reason }
            ],
            pixelConfig: { hat: 'sun_hat', top: 't_shirt', accessory: 'sunglasses' }
        };

        if (temp < 15) return {
            style: t.style.winter,
            desc: t.desc.winter,
            color: "bg-red-50 border-red-200 text-red-800",
            items: [
                { id: 'hat', type: 'hat', name: t.items.beanie.name, reason: t.items.beanie.reason },
                { id: 'top', type: 'top', name: t.items.sweater.name, reason: t.items.sweater.reason },
                { id: 'accessory', type: 'accessory', name: t.items.scarf.name, reason: t.items.scarf.reason }
            ],
            pixelConfig: { hat: 'beanie', top: 'sweater', accessory: 'scarf' }
        };

        // Default Casual
        return {
            style: t.style.casual,
            desc: t.desc.casual,
            color: "bg-green-50 border-green-200 text-green-800",
            items: [
                { id: 'top', type: 'top', name: t.items.denim.name, reason: t.items.denim.reason },
                { id: 'shoes', type: 'shoes', name: t.items.sneakers.name, reason: t.items.sneakers.reason }
            ],
            pixelConfig: { top: 't_shirt', shoes: 'sneakers' }
        };
    };

    const rec = getRecommendation();
    const activityAdvice = getActivityAdvice();
    const selectedItemDetails = selectedItem ? rec.items.find(i => i.type === selectedItem) : null;

    return (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in p-4 select-none">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col md:flex-row overflow-hidden border-4 border-white/50 relative">
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors">
                    <X className="w-6 h-6 text-gray-700" />
                </button>

                {/* LEFT: Weather Info */}
                <div className={`w-full md:w-1/3 p-6 flex flex-col justify-between text-white ${localWeather.condition === 'rainy' ? 'bg-blue-500' : (localWeather.condition === 'starry' || displayTime.startsWith('2') || displayTime.startsWith('0')) ? 'bg-indigo-900' : 'bg-gradient-to-br from-yellow-400 to-orange-500'}`}>
                    <div>
                        {/* Location Header - Editable */}
                        <div className="mb-8 font-mono h-8 flex items-center">
                            {isSearching ? (
                                <form onSubmit={handleCitySearch} className="flex items-center gap-1 w-full animate-fade-in">
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="bg-white/20 border border-white/40 text-white placeholder-white/60 rounded px-2 py-1 text-sm outline-none w-full"
                                        placeholder={t.searchPlaceholder}
                                        onBlur={() => { if(!searchQuery) setIsSearching(false); }}
                                    />
                                    <button type="submit" className="p-1 hover:bg-white/20 rounded"><Search className="w-4 h-4" /></button>
                                </form>
                            ) : (
                                <div 
                                    className="flex items-center gap-2 opacity-80 cursor-pointer group hover:bg-white/10 p-1 -ml-1 rounded transition-colors" 
                                    onClick={() => { setIsSearching(true); setSearchQuery(localWeather.city === t.scanning || localWeather.city === t.locating ? "" : localWeather.city); }}
                                    title="Click to change city"
                                >
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm font-bold tracking-wider truncate max-w-[120px] uppercase">
                                        {localWeather.isLocating ? t.locating : localWeather.city}
                                    </span>
                                    <Search className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-col items-start gap-1">
                            <h1 className="text-6xl font-black tracking-tighter">{Math.round(localWeather.temp)}°</h1>
                            <span className="text-xl font-medium opacity-90 capitalize">
                                {t.conditions[localWeather.condition as keyof typeof t.conditions]}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs opacity-75 font-bold mb-1 tracking-wider">{t.time}</div>
                        <div className="text-3xl font-mono">{displayTime}</div>
                    </div>
                </div>

                {/* RIGHT: OOTD Panel */}
                <div className="w-full md:w-2/3 bg-[#fffbf0] p-6 flex flex-col relative">
                    <h2 className="text-2xl font-black text-gray-800 mb-1 flex items-center gap-2">
                        <span>{t.title}</span>
                        {localWeather.isLocating && <Loader className="w-4 h-4 animate-spin text-gray-400" />}
                    </h2>
                    <p className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wide">{rec.style}</p>

                    <div className="flex-1 flex flex-col md:flex-row gap-6 items-center md:items-start mb-4">
                        {/* 2D Pixel Cat */}
                        <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0 bg-white rounded-2xl shadow-inner border-4 border-gray-100 p-4">
                            <PixelCat config={rec.pixelConfig} onClickItem={(type) => setSelectedItem(type)} />
                            <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 flex items-center gap-1 animate-pulse">
                                <Info className="w-3 h-3" /> {t.clickTip}
                            </div>
                        </div>

                        {/* Item List & Details */}
                        <div className="flex-1 w-full flex flex-col gap-3">
                            {/* Selected Item Detail Bubble */}
                            {selectedItemDetails ? (
                                <div className="bg-white p-4 rounded-xl shadow-lg border border-blue-100 animate-fade-in-up">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-blue-600">{selectedItemDetails.name}</h3>
                                        <button onClick={() => setSelectedItem(null)} className="text-gray-300 hover:text-gray-500"><X className="w-4 h-4"/></button>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {selectedItemDetails.reason}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-400 text-sm text-center italic">
                                    {t.defaultReason}
                                </div>
                            )}

                            {/* List of Items */}
                            <div className="mt-auto space-y-2">
                                {rec.items.map((item) => (
                                    <button 
                                        key={item.id}
                                        onClick={() => setSelectedItem(item.type)}
                                        className={`w-full text-left px-4 py-2 rounded-xl font-bold text-sm transition-all flex justify-between items-center group
                                            ${selectedItem === item.type ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-100'}
                                        `}
                                    >
                                        <span>{item.name}</span>
                                        <span className={`text-[10px] uppercase tracking-wider opacity-60 ${selectedItem === item.type ? 'text-blue-200' : 'text-gray-400'}`}>{item.type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ACTIVITY GUIDE (New Section) */}
                    <div className="mt-auto bg-green-50 rounded-xl p-4 border border-green-100 flex items-start gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h4 className="text-green-800 font-bold text-xs uppercase tracking-widest mb-1">{t.activity.title}</h4>
                            <p className="text-green-900 text-sm font-medium leading-tight">
                                {activityAdvice}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
