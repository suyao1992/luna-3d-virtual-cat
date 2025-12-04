

import React from 'react';

export interface CatStats {
  hunger: number;   // 0-100 (100 is full)
  happiness: number; // 0-100 (100 is happy)
  energy: number;   // 0-100 (100 is energetic)
  thirst: number;   // 0-100 (100 is hydrated)
  hygiene: number;  // 0-100 (100 is clean litter box)
  level: number;
  experience: number;
  maxExperience: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'cat';
  text: string;
}

export type CatAction = 
  'idle' | 'walking' | 'eating' | 'drinking' | 'playing' | 
  'sleeping' | 'using_litter' | 'petting' | 'poked' | 
  'waking_up' | 'stretching' | 'grooming' | 'scratching' |
  'playing_ball' | 'singing' | 'dancing' | 'playing_gomoku' |
  'playing_xiangqi' | 'playing_match3' | 'preparing_game' | 'yoga' | 'fishing' | 'climbing' | 'falling' |
  'watching_birds' | 'hiding' | 'hunting' | 'wandering' | 'reading' | 'sitting' | 'standing' | 'chasing' | 'belly_rub' | 'tail_grabbed' | 'catnip_high' | 'opening_blind_box';

export enum CatMood {
  HAPPY = 'Happy',
  HUNGRY = 'Hungry',
  TIRED = 'Tired',
  BORED = 'Bored',
  NEUTRAL = 'Neutral'
}

export type Language = 'en' | 'zh' | 'jp';

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'starry';

export interface ClothingItem {
    id: string;
    name: string;
    type: 'hat' | 'top' | 'shoes' | 'accessory';
    reason: string;
}

export interface PixelArtConfig {
    hat?: 'sun_hat' | 'beanie' | 'rain_hat' | 'sleeping_cap';
    top?: 't_shirt' | 'sweater' | 'raincoat';
    shoes?: 'sneakers' | 'boots';
    accessory?: 'sunglasses' | 'scarf';
}

export interface OutfitRecommendation {
    style: string;
    desc: string;
    color: string;
    items: ClothingItem[];
    pixelConfig: PixelArtConfig;
}

export interface WeatherState {
    condition: WeatherCondition;
    temp: number;
    city: string;
    isLocating: boolean;
    timezoneOffset?: number; // UTC offset in hours
}

export type OutfitId = 'none' | 'casual' | 'formal' | 'summer' | 'winter' | 'halloween' | 'christmas';

// --- INVENTORY SYSTEM ---
export type ItemId = 'sardine' | 'tuna' | 'koi' | 'golden_carp' | 'old_boot' | 'tin_can' | 'carrot' | 'radish';

export interface ItemDef {
    id: ItemId;
    rarity: 'common' | 'rare' | 'legendary' | 'trash';
    score: number; // Value when caught/sold
}

export const ITEM_REGISTRY: Record<ItemId, ItemDef> = {
    sardine: { id: 'sardine', rarity: 'common', score: 10 },
    tuna: { id: 'tuna', rarity: 'common', score: 30 },
    koi: { id: 'koi', rarity: 'rare', score: 50 },
    golden_carp: { id: 'golden_carp', rarity: 'legendary', score: 100 },
    old_boot: { id: 'old_boot', rarity: 'trash', score: 0 },
    tin_can: { id: 'tin_can', rarity: 'trash', score: 0 },
    carrot: { id: 'carrot', rarity: 'common', score: 15 },
    radish: { id: 'radish', rarity: 'common', score: 15 },
};

// --- GARDEN SYSTEM ---
export type PlantType = 'carrot' | 'radish';
export type SoilState = 'empty' | 'ready';

export interface GardenSlot {
    id: number;
    soilState: SoilState;
    plantType: PlantType | null;
    growthStage: number; // 0=Seed, 1=Sprout, 2=Growing, 3=Mature
    growthProgress: number; // 0-100 for current stage
    moisture: number; // 0-100
    health: number; // 0-100
    hasWeeds: boolean;
}

export const TRANSLATIONS = {
  en: {
    start_menu: {
        title: "LUNA",
        subtitle: "Your Virtual 3D Companion",
        start: "Start Game",
        credits: "Powered by Gemini AI"
    },
    stats: { food: 'Food', water: 'Water', clean: 'Clean', love: 'Love', sleep: 'Sleep' },
    profile: {
        title: "Luna's Profile",
        level: "Level",
        exp: "EXP",
        next_level: "Next Level",
        intimacy: "Intimacy Rank",
        ranks: ["Stranger", "Acquaintance", "Friend", "Best Friend", "Soulmate", "Family"],
        days_together: "Days Together",
        happiness: "Happiness",
        energy: "Energy",
        wins: "Wins",
        collection: "Collection"
    },
    actions: { feed: 'Feed', water: 'Water', clean: 'Clean', play: 'Play', sleep: 'Sleep', game: 'Game', wardrobe: 'Wear', backpack: 'Bag' },
    play_menu: { sing: 'Sing', dance: 'Dance', yoga: 'Yoga', fish: 'Fish', climb: 'Climb', read: 'Read' },
    game_menu: { gomoku: 'Gomoku', xiangqi: 'Xiangqi', match3: 'Meow Match' },
    wardrobe_menu: {
        none: 'Natural',
        casual: 'Casual Bow',
        formal: 'Business',
        summer: 'Beach Vibe',
        winter: 'Cozy Winter',
        halloween: 'Witchy',
        christmas: 'Festive'
    },
    backpack: {
        title: "Backpack",
        empty: "Your backpack is empty. Go fishing!",
        use: "Use",
        sell: "Sell",
        quantity: "Qty",
        description: {
            sardine: "A small, tasty fish. Luna loves these!",
            tuna: "A big catch! Rich in protein.",
            koi: "A beautiful orange fish. Good luck charm.",
            golden_carp: "Legendary! Shimmers with gold light.",
            old_boot: "Someone lost a shoe...",
            tin_can: "Just trash. Recycle it.",
            carrot: "A crunchy orange carrot from your garden.",
            radish: "A fresh white radish."
        }
    },
    garden: {
        title: "My Garden",
        soil_empty: "Empty Soil",
        soil_ready: "Tilled Soil",
        plant_carrot: "Plant Carrot",
        plant_radish: "Plant Radish",
        water: "Water",
        till: "Till Soil",
        weed: "Remove Weeds",
        harvest: "Harvest!",
        growing: "Growing...",
        mature: "Ready!",
        moisture: "Moisture",
        health: "Health"
    },
    reward: {
        title: "SURPRISE!",
        unlocked: "YOU UNLOCKED",
        claim: "Claim Reward",
        exp_50: "50 EXP",
        outfit_christmas: "Christmas Outfit",
        outfit_formal: "Formal Suit"
    },
    status: {
      eating: "Crunch crunch... 🐟",
      drinking: "Slurp slurp... 💧",
      playing: "Wheee! 🧶",
      sleeping: "Zzzzz... 🌙",
      using_litter: "Using the litter box... 🚽",
      petting: "Purrrrr... ❤️",
      belly_rub: "Belly Rubs! ❤️",
      tail_grabbed: "Hey! Don't pull my tail! 💢",
      catnip_high: "Catnip Heaven! 🌿✨",
      opening_blind_box: "Opening Blind Box! 🎁",
      poked: "Meow?! 💢",
      waking_up: "Yawn... huh?",
      stretching: "Big stretch! 🙆‍♀️",
      walking: "Exploring... 🐾",
      wandering: "Just wandering around... 🐾",
      grooming: "Making myself pretty... ✨",
      scratching: "Sharpening my claws! 😼",
      playing_ball: "Gotta get the yarn! 🧶",
      singing: "Meow meow meow! 🎶",
      dancing: "Look at my moves! 💃",
      playing_gomoku: "Thinking about the next move... ♟️",
      playing_xiangqi: "Planning my strategy... ♟️",
      playing_match3: "Matching items... ✨",
      preparing_game: "Setting up the board... 🎲",
      yoga: "Finding inner peace... 🧘‍♀️",
      fishing: "Waiting for a bite... 🐟",
      climbing: "King of the castle! 🏰",
      falling: "WAAAAAAH!!! 🙀",
      thinking: "Luna is thinking...",
      watching_birds: "Chirp chirp? Birds! 🐦",
      hiding: "I am invisible... 📦",
      hunting: "Stalking the prey... 🐭",
      chasing: "Get that mouse! 🐭",
      reading: "Reading a good book... 📖",
      sitting: "Just sitting.",
      standing: "Standing tall.",
      idle: "Meow?"
    },
    loading: {
        title: "Loading...",
        tips: [
            "Polishing the chess pieces...",
            "Reviewing strategy books...",
            "Stretching paws for victory...",
            "Calculating winning moves...",
            "Asking the Great Cat in the sky for luck..."
        ]
    },
    chat: {
      placeholder: "Say hi to Luna...",
      close: "Close",
      title: "Luna"
    },
    gomoku: {
      title: "Gomoku with Luna",
      user_turn: "Your Turn (Black)",
      cat_turn: "Luna is thinking...",
      user_win: "You Won!",
      cat_win: "Luna Won!",
      play_again: "Play Again"
    },
    xiangqi: {
      title: "Xiangqi",
      user_turn: "Your Turn (Red)",
      cat_turn: "Luna is thinking...",
      user_win: "You Won!",
      cat_win: "Luna Won!",
      check: "Check!",
      play_again: "Play Again"
    },
    match3: {
      title: "Meow Match",
      score: "Score",
      moves: "Moves",
      game_over: "Game Over",
      play_again: "Play Again",
      final_score: "Final Score"
    },
    fishing: {
      title: "Gone Fishing",
      instructions: "Click 'CAST' to start. Wait for the bobber to shake, then click 'REEL'!",
      cast: "CAST",
      waiting: "Waiting...",
      bite: "BITE!",
      reel: "REEL!",
      caught: "Caught:",
      missed: "Got away!",
      play_again: "Fish Again",
      fish_names: {
          sardine: "Sardine",
          tuna: "Tuna",
          koi: "Koi",
          golden_carp: "Golden Carp",
          old_boot: "Old Boot",
          tin_can: "Tin Can",
          carrot: "Carrot",
          radish: "Radish"
      }
    },
    tv: {
        power_on: "Power: ON",
        power_off: "Power: OFF",
        prev_channel: "Prev Channel",
        next_channel: "Next Channel",
        channel: "CH"
    }
  },
  zh: {
    start_menu: {
        title: "LUNA",
        subtitle: "你的 3D 虚拟伴侣",
        start: "开始游戏",
        credits: "Powered by Gemini AI"
    },
    stats: { food: '饥饿', water: '口渴', clean: '卫生', love: '心情', sleep: '体力' },
    profile: {
        title: "Luna 的档案",
        level: "等级",
        exp: "经验值",
        next_level: "下一级",
        intimacy: "亲密度",
        ranks: ["陌生人", "点头之交", "好朋友", "亲密挚友", "灵魂伴侣", "家人"],
        days_together: "相伴天数",
        happiness: "心情指数",
        energy: "活力指数",
        wins: "获胜场次",
        collection: "图鉴收藏"
    },
    actions: { feed: '喂食', water: '喂水', clean: '铲屎', play: '玩耍', sleep: '睡觉', game: '游戏', wardrobe: '换装', backpack: '背包' },
    play_menu: { sing: '唱歌', dance: '跳舞', yoga: '瑜伽', fish: '钓鱼', climb: '爬架子', read: '读书' },
    game_menu: { gomoku: '五子棋', xiangqi: '中国象棋', match3: '猫猫消消乐' },
    wardrobe_menu: {
        none: '天然毛色',
        casual: '休闲领结',
        formal: '商务精英',
        summer: '海滩度假',
        winter: '冬日暖暖',
        halloween: '魔法女巫',
        christmas: '圣诞快乐'
    },
    backpack: {
        title: "背包",
        empty: "背包空空如也，去钓鱼吧！",
        use: "使用",
        sell: "出售",
        quantity: "数量",
        description: {
            sardine: "美味的小沙丁鱼，Luna的最爱！",
            tuna: "大家伙！富含蛋白质。",
            koi: "美丽的橙色锦鲤，好运的象征。",
            golden_carp: "传说级！闪烁着金色的光芒。",
            old_boot: "谁丢的鞋子...",
            tin_can: "只是垃圾，记得回收。",
            carrot: "自家花园种的脆胡萝卜。",
            radish: "新鲜的白萝卜。"
        }
    },
    garden: {
        title: "我的花园",
        soil_empty: "空地",
        soil_ready: "已翻土",
        plant_carrot: "种胡萝卜",
        plant_radish: "种萝卜",
        water: "浇水",
        till: "翻土",
        weed: "除草",
        harvest: "收获!",
        growing: "生长中...",
        mature: "可收获!",
        moisture: "水分",
        health: "健康"
    },
    reward: {
        title: "惊喜！",
        unlocked: "解锁了",
        claim: "领取奖励",
        exp_50: "50 经验值",
        outfit_christmas: "圣诞套装",
        outfit_formal: "商务套装"
    },
    status: {
      eating: "嚼嚼嚼... 🐟",
      drinking: "咕噜咕噜... 💧",
      playing: "呼呼! 🧶",
      sleeping: "呼噜呼噜... 🌙",
      using_litter: "上厕所中... 🚽",
      petting: "呼噜呼噜... ❤️",
      belly_rub: "摸肚肚! ❤️",
      tail_grabbed: "哎呀！别拽我尾巴！💢",
      catnip_high: "猫薄荷上头了! 🌿✨",
      opening_blind_box: "正在开盲盒! 🎁",
      poked: "喵?! 💢",
      waking_up: "哈欠... 唔?",
      stretching: "伸个大懒腰! 🙆‍♀️",
      walking: "巡视领地... 🐾",
      wandering: "随便逛逛... 🐾",
      grooming: "舔毛变漂亮... ✨",
      scratching: "磨爪子! 😼",
      playing_ball: "抓住那个毛线球! 🧶",
      singing: "喵喵喵~ 🎶",
      dancing: "看我跳舞! 💃",
      playing_gomoku: "思考下一步怎么走... ♟️",
      playing_xiangqi: "正在布局... ♟️",
      playing_match3: "正在消除... ✨",
      preparing_game: "准备棋盘中... 🎲",
      yoga: "寻找内心的平静... 🧘‍♀️",
      fishing: "等待鱼儿上钩... 🐟",
      climbing: "我是城堡之王! 🏰",
      falling: "哇啊啊啊!!! 🙀",
      thinking: "Luna 正在思考...",
      watching_birds: "有小鸟！盯... 🐦",
      hiding: "你看不见我... 📦",
      hunting: "悄悄靠近猎物... 🐭",
      chasing: "抓住那只老鼠! 🐭",
      reading: "正在阅读... 📖",
      sitting: "坐着发呆。",
      standing: "站立。",
      idle: "喵?"
    },
    loading: {
        title: "加载中...",
        tips: [
            "正在擦拭棋子...",
            "正在复习棋谱...",
            "伸展爪子准备应战...",
            "正在计算必胜法...",
            "正在祈求猫猫神的庇佑..."
        ]
    },
    chat: {
      placeholder: "和 Luna 打个招呼...",
      close: "关闭",
      title: "Luna"
    },
    gomoku: {
      title: "五子棋对战",
      user_turn: "你的回合 (黑棋)",
      cat_turn: "Luna 思考中...",
      user_win: "你赢了!",
      cat_win: "Luna 赢了!",
      play_again: "再来一局"
    },
    xiangqi: {
      title: "中国象棋",
      user_turn: "你的回合 (红棋)",
      cat_turn: "Luna 思考中...",
      user_win: "你赢了!",
      cat_win: "Luna 赢了!",
      check: "将军!",
      play_again: "再来一局"
    },
    match3: {
      title: "猫猫消消乐",
      score: "得分",
      moves: "剩余步数",
      game_over: "游戏结束",
      play_again: "再玩一次",
      final_score: "最终得分"
    },
    fishing: {
      title: "快乐钓鱼",
      instructions: "点击 '抛竿' 开始。等待浮标晃动，然后立即点击 '收杆'!",
      cast: "抛竿",
      waiting: "等待中...",
      bite: "咬钩了!",
      reel: "收杆!",
      caught: "钓到了:",
      missed: "鱼跑了!",
      play_again: "再钓一次",
      fish_names: {
          sardine: "沙丁鱼",
          tuna: "金枪鱼",
          koi: "锦鲤",
          golden_carp: "黄金鲤鱼",
          old_boot: "旧靴子",
          tin_can: "易拉罐",
          carrot: "胡萝卜",
          radish: "白萝卜"
      }
    },
    tv: {
        power_on: "电源: 开",
        power_off: "电源: 关",
        prev_channel: "上一频道",
        next_channel: "下一频道",
        channel: "频道"
    }
  },
  jp: {
    start_menu: {
        title: "LUNA",
        subtitle: "あなたの3Dバーチャルパートナー",
        start: "ゲーム開始",
        credits: "Powered by Gemini AI"
    },
    stats: { food: '食事', water: '水分', clean: '清潔', love: '機嫌', sleep: '元気' },
    profile: {
        title: "Lunaのプロフィール",
        level: "レベル",
        exp: "経験値",
        next_level: "次のレベル",
        intimacy: "親密度ランク",
        ranks: ["他人", "知り合い", "友達", "親友", "ソウルメイト", "家族"],
        days_together: "一緒に過ごした日々",
        happiness: "幸福度",
        energy: "エネルギー",
        wins: "勝利数",
        collection: "コレクション"
    },
    actions: { feed: 'ご飯', water: 'お水', clean: '掃除', play: '遊ぶ', sleep: '寝る', game: 'ゲーム', wardrobe: '着替え', backpack: 'バッグ' },
    play_menu: { sing: '歌う', dance: '踊る', yoga: 'ヨガ', fish: '釣り', climb: '登る', read: '読書' },
    game_menu: { gomoku: '五目並べ', xiangqi: 'シャンチー (中国将棋)', match3: '猫パズル' },
    wardrobe_menu: {
        none: 'ナチュラル',
        casual: '蝶ネクタイ',
        formal: 'ビジネス',
        summer: 'ビーチ',
        winter: '冬コーデ',
        halloween: '魔女',
        christmas: 'クリスマス'
    },
    backpack: {
        title: "バックパック",
        empty: "空っぽです。釣りに行こう！",
        use: "使う",
        sell: "売る",
        quantity: "数",
        description: {
            sardine: "美味しいイワシ。Lunaの大好物！",
            tuna: "大物だ！タンパク質が豊富。",
            koi: "美しいオレンジの鯉。幸運のお守り。",
            golden_carp: "伝説級！金色の輝き。",
            old_boot: "誰かの靴...",
            tin_can: "ただのゴミ。リサイクルしよう。",
            carrot: "家庭菜園で採れたニンジン。",
            radish: "新鮮な大根。"
        }
    },
    garden: {
        title: "私の庭",
        soil_empty: "空き地",
        soil_ready: "耕した土",
        plant_carrot: "ニンジンを植える",
        plant_radish: "ダイコンを植える",
        water: "水やり",
        till: "耕す",
        weed: "草むしり",
        harvest: "収穫!",
        growing: "成長中...",
        mature: "収穫可能!",
        moisture: "水分",
        health: "健康"
    },
    reward: {
        title: "サプライズ！",
        unlocked: "ロック解除",
        claim: "報酬を受け取る",
        exp_50: "50 経験値",
        outfit_christmas: "クリスマスの衣装",
        outfit_formal: "ビジネススーツ"
    },
    status: {
      eating: "モグモグ... 🐟",
      drinking: "ゴクゴク... 💧",
      playing: "わーい! 🧶",
      sleeping: "Zzzzz... 🌙",
      using_litter: "トイレ中... 🚽",
      petting: "ゴロゴロ... ❤️",
      belly_rub: "お腹なでなで! ❤️",
      tail_grabbed: "ニャ！しっぽを引っ張らないで！💢",
      catnip_high: "マタタビ最高！ 🌿✨",
      opening_blind_box: "ブラインドボックスを開封中！ 🎁",
      poked: "ニャッ?! 💢",
      waking_up: "ふわぁ... ねむ...",
      stretching: "伸び〜！ 🙆‍♀️",
      walking: "パトロール中... 🐾",
      wandering: "ぶらぶら中... 🐾",
      grooming: "毛づくろい中... ✨",
      scratching: "爪とぎ中! 😼",
      playing_ball: "毛糸玉だー! 🧶",
      singing: "ニャーニャーニャー♪ 🎶",
      dancing: "私のダンスを見て! 💃",
      playing_gomoku: "次はどうしようかな... ♟️",
      playing_xiangqi: "作戦を練り中... ♟️",
      playing_match3: "パズル中... ✨",
      preparing_game: "準備中... 🎲",
      yoga: "精神統一... 🧘‍♀️",
      fishing: "魚来ないかな... 🐟",
      climbing: "高いところ大好き! 🏰",
      falling: "うわぁぁぁ!!! 🙀",
      thinking: "Lunaは考え中...",
      watching_birds: "鳥さんだ! じーっ... 🐦",
      hiding: "隠れ身の術... 📦",
      hunting: "狙いを定めて... 🐭",
      chasing: "ネズミを捕まえる！ 🐭",
      reading: "読書中... 📖",
      sitting: "座っています。",
      standing: "立っています。",
      idle: "ニャ?"
    },
    loading: {
        title: "読み込み中...",
        tips: [
            "駒を磨いています...",
            "定石を復習中...",
            "爪の手入れ中...",
            "必勝法を計算中...",
            "猫神様にお祈り中..."
        ]
    },
    chat: {
      placeholder: "Lunaに話しかける...",
      close: "閉じる",
      title: "Luna"
    },
    gomoku: {
      title: "五目並べ",
      user_turn: "あなたの番 (黒)",
      cat_turn: "Lunaの番...",
      user_win: "あなたの勝ち!",
      cat_win: "Lunaの勝ち!",
      play_again: "もう一度遊ぶ"
    },
    xiangqi: {
      title: "シャンチー",
      user_turn: "あなたの番 (紅)",
      cat_turn: "Lunaの番...",
      user_win: "あなたの勝ち!",
      cat_win: "Lunaの勝ち!",
      check: "王手!",
      play_again: "もう一度遊ぶ"
    },
    match3: {
      title: "猫パズル",
      score: "スコア",
      moves: "残り手数",
      game_over: "ゲーム終了",
      play_again: "もう一度遊ぶ",
      final_score: "最終スコア"
    },
    fishing: {
      title: "釣りゲーム",
      instructions: "「キャスト」を押して開始。ウキが沈んだらすぐに「リール」を押して！",
      cast: "キャスト",
      waiting: "待機中...",
      bite: "食いついた！",
      reel: "リール！",
      caught: "釣れた：",
      missed: "逃げられた！",
      play_again: "もう一度釣る",
      fish_names: {
          sardine: "イワシ",
          tuna: "マグロ",
          koi: "鯉",
          golden_carp: "金の鯉",
          old_boot: "古びた長靴",
          tin_can: "空き缶",
          carrot: "ニンジン",
          radish: "ダイコン"
      }
    },
    tv: {
        power_on: "電源: ON",
        power_off: "電源: OFF",
        prev_channel: "前のチャンネル",
        next_channel: "次のチャンネル",
        channel: "CH"
    }
  }
};
