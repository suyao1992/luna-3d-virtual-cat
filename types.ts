

export interface CatStats {
  hunger: number;   // 0-100 (100 is full)
  happiness: number; // 0-100 (100 is happy)
  energy: number;   // 0-100 (100 is energetic)
  thirst: number;   // 0-100 (100 is hydrated)
  hygiene: number;  // 0-100 (100 is clean litter box)
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
  'watching_birds' | 'hiding' | 'hunting' | 'wandering' | 'reading' | 'sitting' | 'standing';

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

export const TRANSLATIONS = {
  en: {
    start_menu: {
        title: "LUNA",
        subtitle: "Your Virtual 3D Companion",
        start: "Start Game",
        credits: "Powered by Gemini AI"
    },
    stats: { food: 'Food', water: 'Water', clean: 'Clean', love: 'Love', sleep: 'Sleep' },
    actions: { feed: 'Feed', water: 'Water', clean: 'Clean', play: 'Play', sleep: 'Sleep', game: 'Game' },
    play_menu: { sing: 'Sing', dance: 'Dance', yoga: 'Yoga', fish: 'Fish', climb: 'Climb', read: 'Read' },
    game_menu: { gomoku: 'Gomoku', xiangqi: 'Xiangqi', match3: 'Meow Match' },
    status: {
      eating: "Crunch crunch... 🐟",
      drinking: "Slurp slurp... 💧",
      playing: "Wheee! 🧶",
      sleeping: "Zzzzz... 🌙",
      using_litter: "Using the litter box... 🚽",
      petting: "Purrrrr... ❤️",
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
      play_again: "Fish Again"
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
    actions: { feed: '喂食', water: '喂水', clean: '铲屎', play: '玩耍', sleep: '睡觉', game: '游戏' },
    play_menu: { sing: '唱歌', dance: '跳舞', yoga: '瑜伽', fish: '钓鱼', climb: '爬架子', read: '读书' },
    game_menu: { gomoku: '五子棋', xiangqi: '中国象棋', match3: '猫猫消消乐' },
    status: {
      eating: "嚼嚼嚼... 🐟",
      drinking: "咕噜咕噜... 💧",
      playing: "呼呼! 🧶",
      sleeping: "呼噜呼噜... 🌙",
      using_litter: "上厕所中... 🚽",
      petting: "呼噜呼噜... ❤️",
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
      play_again: "再钓一次"
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
    actions: { feed: 'ご飯', water: 'お水', clean: '掃除', play: '遊ぶ', sleep: '寝る', game: 'ゲーム' },
    play_menu: { sing: '歌う', dance: '踊る', yoga: 'ヨガ', fish: '釣り', climb: '登る', read: '読書' },
    game_menu: { gomoku: '五目並べ', xiangqi: 'シャンチー (中国将棋)', match3: '猫パズル' },
    status: {
      eating: "モグモグ... 🐟",
      drinking: "ゴクゴク... 💧",
      playing: "わーい! 🧶",
      sleeping: "Zzzzz... 🌙",
      using_litter: "トイレ中... 🚽",
      petting: "ゴロゴロ... ❤️",
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
      play_again: "もう一度釣る"
    }
  }
};