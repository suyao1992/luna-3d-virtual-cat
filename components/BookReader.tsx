
import React, { useState, useEffect } from 'react';
import { X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface Book {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    type: 'poem' | 'novel'; // Added type to handle layout differences
    pages: string[]; // Content split into pages
}

const BOOKS: Book[] = [
    {
        id: 'tang',
        title: '唐诗三百首',
        author: '蘅塘退士',
        coverColor: 'bg-indigo-700',
        type: 'poem',
        pages: [
            // Page 1
            `《静夜思》\n李白\n\n床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。`,
            // Page 2
            `《春晓》\n孟浩然\n\n春眠不觉晓，\n处处闻啼鸟。\n夜来风雨声，\n花落知多少。`,
            // Page 3
            `《登鹳雀楼》\n王之涣\n\n白日依山尽，\n黄河入海流。\n欲穷千里目，\n更上一层楼。`,
            // Page 4
            `《相思》\n王维\n\n红豆生南国，\n春来发几枝。\n愿君多采撷，\n此物最相思。`,
            // Page 5
            `《游子吟》\n孟郊\n\n慈母手中线，\n游子身上衣。\n临行密密缝，\n意恐迟迟归。\n谁言寸草心，\n报得三春晖。`,
            // Page 6
            `《江雪》\n柳宗元\n\n千山鸟飞绝，\n万径人踪灭。\n孤舟蓑笠翁，\n独钓寒江雪。`,
            // Page 7
            `《春望》\n杜甫\n\n国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。\n烽火连三月，家书抵万金。\n白头搔更短，浑欲不胜簪。`,
            // Page 8
            `《早发白帝城》\n李白\n\n朝辞白帝彩云间，\n千里江陵一日还。\n两岸猿声啼不住，\n轻舟已过万重山。`,
            // Page 9
            `《赋得古原草送别》\n白居易\n\n离离原上草，一岁一枯荣。\n野火烧不尽，春风吹又生。\n远芳侵古道，晴翠接荒城。\n又送王孙去，萋萋满别情。`,
            // Page 10
            `《悯农》\n李绅\n\n锄禾日当午，\n汗滴禾下土。\n谁知盘中餐，\n粒粒皆辛苦。`,
            // Page 11
            `《清明》\n杜牧\n\n清明时节雨纷纷，\n路上行人欲断魂。\n借问酒家何处有？\n牧童遥指杏花村。`
        ]
    },
    {
        id: 'sanguo',
        title: '三国演义',
        author: '罗贯中',
        coverColor: 'bg-red-800',
        type: 'novel',
        pages: [
            // Page 1
            `第一回 宴桃园豪杰三结义 斩黄巾英雄首立功\n\n    滚滚长江东逝水，浪花淘尽英雄。是非成败转头空。\n    青山依旧在，几度夕阳红。\n    白发渔樵江渚上，惯看秋月春风。一壶浊酒喜相逢。\n    古今多少事，都付笑谈中。`,
            // Page 2
            `    话说天下大势，分久必合，合久必分。周末七国分争，并入于秦。及秦灭之后，楚、汉分争，又并入于汉。汉朝自高祖斩白蛇而起义，一统天下，后来光武中兴，传至献帝，遂分为三国。\n    推其致乱之由，殆始于桓、灵二帝。桓帝禁锢善类，崇信宦官。及桓帝崩，灵帝即位，大将军窦武、太傅陈蕃共相辅佐。时有宦官曹节等弄权，窦武、陈蕃谋诛之，机事不密，反为所害，中涓自此愈横。`,
            // Page 3
            `    建宁二年四月望日，帝御温德殿。方升座，殿角狂风骤起。只见一条大青蛇，从梁上飞将下来，蟠于椅上。帝惊倒，左右急救入宫，百官俱奔避。须臾，蛇不见了。忽然大雷大雨，加以冰雹，落到半夜方止，坏却房屋无数。建宁四年二月，洛阳地震；又海水泛溢，沿海居民，尽被大浪卷入海中。光和元年，雌鸡化雄。六月朔，黑气十余丈，飞入温德殿中。秋七月，有虹现于玉堂；五原山岸，尽皆崩裂。`,
            // Page 4
            `    种种不祥，非止一端。帝下诏问群臣以灾异之由，议郎蔡邕上疏，以为蜺堕鸡化，乃妇寺干政之所致，言颇切直。帝览奏叹息，因起更衣。曹节在后窃视，悉宣告左右；遂以他事陷邕于罪，放归田里。后张让、赵忠、封谞、段珪、曹节、侯览、蹇硕、程旷、夏恽、郭胜十人朋比为奸，号为“十常侍”。帝尊信张让，呼为“阿父”。朝政日非，以致天下人心思乱，盗贼蜂起。`,
            // Page 5
            `    时巨鹿郡有兄弟三人，一名张角，一名张宝，一名张梁。那张角本是个不第秀才，因入山采药，遇一老人，碧眼童颜，手执藜杖，唤角至一洞中，以天书三卷授之，曰：“此名《太平要术》。汝得之，当代天宣化，普救世人；若萌异心，必获恶报。”角拜问姓名。老人曰：“吾乃南华老仙也。”言讫，化阵清风而去。角得此书，日夜攻习，能呼风唤雨，号为“太平道人”。`,
            // Page 6
            `    中平元年正月内，疫气流行，张角散施符水，为人治病，自称“大贤良师”。角有徒弟五百余人，云游四方，皆能书符念咒。次后徒众日多，角乃立三十六方，大方万余人，小方六七千，各立渠帅，称为将军；讹言：“苍天已死，黄天当立；岁在甲子，天下大吉。”令人各以白土，书“甲子”二字于门上。青、幽、徐、冀、荆、扬、兖、豫八州之人，家家侍奉大贤良师张角名字。`,
            // Page 7
            `    角遣其党马元义，暗金帛，结交中涓封谞，以为内应。角与二弟商议曰：“至难得者，民心也。今民心已顺，若不乘势取天下，诚为可惜。”遂一面私造黄旗，约期举事；一面使弟子唐周，驰书报封谞。唐周乃径赴省中告变。帝召大将军何进调兵擒马元义，斩之；次收封谞等一干人下狱。张角闻知事露，星夜举兵，自称“天公将军”，张宝称“地公将军”，张梁称“人公将军”。`
        ]
    },
    {
        id: 'xiyou',
        title: '西游记',
        author: '吴承恩',
        coverColor: 'bg-yellow-700',
        type: 'novel',
        pages: [
            // Page 1
            `第一回 灵根育孕源流出 心性修持大道生\n\n    诗曰：\n    混沌未分天地乱，茫茫渺渺无人见。\n    自从盘古破鸿蒙，开辟从兹清浊辨。\n    覆载群生仰至仁，发明万物皆成善。\n    欲知造化会元功，须看西游释厄传。`,
            // Page 2
            `    盖闻天地之数，有十二万九千六百岁为一元。将一元分为十二会，乃子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥之十二支也。每会该一万八百岁。且就一日而论：子时得阳气，而丑则鸡鸣；寅不通光，而卯则日出；辰时食后，而巳则挨排；日午天中，而未则西蹉；申时晡，而酉则日入；戌黄昏，而亥则人定。`,
            // Page 3
            `    感盘古开辟，三皇治世，五帝定伦，世界之间，遂分为四大部洲：曰东胜神洲，曰西牛贺洲，曰南赡部洲，曰北俱芦洲。这部书单表东胜神洲。海外有一国土，名曰傲来国。国近大海，海中有一座名山，唤为花果山。此山乃十洲之祖脉，三岛之来龙，自开清浊而立，鸿蒙判后而成。真个好山！`,
            // Page 4
            `    那座山，正当顶上，有一块仙石。其石有三丈六尺五寸高，有二丈四尺围圆。三丈六尺五寸高，按周天三百六十五度；二丈四尺围圆，按政历二十四气。上有九窍八孔，按九宫八卦。四面更无树木遮阴，左右倒有芝兰相衬。盖自开辟以来，每受天真地秀，日精月华，感之既久，遂有灵通之意。`,
            // Page 5
            `    内育仙胞，一日迸裂，产一石卵，似圆球样大。因见风，化作一个石猴，五官俱备，四肢皆全。便就学爬学走，拜了四方。目运两道金光，射冲斗府。惊动高天上圣大慈仁者玉皇大天尊玄穹高上帝，驾座金阙云宫灵霄宝殿，聚集仙卿，见有金光焰焰，即命千里眼、顺风耳开南天门观看。`,
            // Page 6
            `    二将果奉旨出门外，看得真，听得明。须臾回报道：“臣奉旨观听金光之处，乃东胜神洲海东傲来小国之界，有一座花果山，山上有一仙石，石产一卵，见风化一石猴，在那里拜四方，眼运金光，射冲斗府。如今服饵水食，金光将潜息矣。”玉帝垂赐恩慈曰：“下方之物，乃天地精华所生，不足为异。”`,
            // Page 7
            `    那猴在山中，却会行走跳跃，食草木，饮涧泉，采山花，觅树果；与狼虫为伴，虎豹为群，獐鹿为友，猕猿为亲；夜宿石崖之下，朝游峰洞之中。真是“山中无甲子，寒尽不知年”。一朝天气炎热，与群猴避暑，都在松阴之下顽耍。`,
            // Page 8
            `    一群猴子耍了一会，却去那山涧中洗澡。见那股涧水奔流，真个似滚瓜涌溅。古云：“禽有禽言，兽有兽语。”众猴都道：“这股水不知是那里的水。我们今日赶闲无事，顺涧边往上溜头寻看源流，耍子去耶！”喊一声，都拖男挈女，呼弟呼兄，一齐跑来，顺涧爬山，直至源流之处，乃是一股瀑布飞泉。`
        ]
    },
    {
        id: 'honglou',
        title: '红楼梦',
        author: '曹雪芹',
        coverColor: 'bg-rose-800',
        type: 'novel',
        pages: [
            // Page 1
            `第一回 甄士隐梦幻识通灵 贾雨村风尘怀闺秀\n\n    此开卷第一回也。作者自云：因曾历过一番梦幻之后，故将真事隐去，而借“通灵”之说，撰此《石头记》一书也。故曰“甄士隐”云云。但书中所记何事何人？`,
            // Page 2
            `    自又云：“今风尘碌碌，一事无成，忽念及当日所有之女子，一一细考较去，觉其行止见识，皆出于我之上。何我堂堂须眉，诚不若彼裙钗哉？实愧则有余，悔又无益之大无可如何之日也！当此，则自欲将已往所赖天恩祖德，锦衣纨绔之时，饫甘餍肥之日，背父兄教育之恩，负师友规谈之德，以至今日一技无成，半生潦倒之罪，编述一集，以告天下人。”`,
            // Page 3
            `    “我之罪固不免，然闺阁中本自历历有人，万不可因我之不肖，自护己短，一并使其泯灭也。虽今日之茅椽蓬牖，瓦灶绳床，其晨夕风露，阶柳庭花，亦未有妨我之襟怀笔墨者。虽我未学，下笔无文，又何妨用假语村言，敷演出一段故事来，亦可使闺阁昭传，复可悦世之目，破人愁闷，不亦宜乎？”故曰“贾雨村”云云。`,
            // Page 4
            `    此回中凡用“梦”用“幻”等字，是提醒阅者眼目，亦是此书立意本旨。列位看官：你道此书从何而来？说起根由，虽近荒唐，细按则深有趣味。待在下将此来历注明，方使阅者了然不惑。`,
            // Page 5
            `    原来女娲氏炼石补天之时，于大荒山无稽崖练成高经十二丈、方经二十四丈顽石三万六千五百零一块。娲皇氏只用了三万六千五百块，只单单剩了一块未用，便弃在此山青埂峰下。谁知此石自经煅炼之后，灵性已通，因见众石俱得补天，独自己无材不堪入选，遂自怨自叹，日夜悲号惭愧。`,
            // Page 6
            `    一日，正当嗟悼之际，俄见一僧一道远远而来，生得骨格不凡，丰神迥异，说说笑笑来至峰下，坐于石边高谈快论。先是说些云山雾海神仙玄幻之事，后便说到红尘中荣华富贵。此石听了，不觉打动凡心，也想要到人间去享一享这荣华富贵，但自恨粗蠢，不得已，便口吐人言，向那僧道说道：“大师，弟子蠢物，不能见礼了。适闻二位谈那人世间荣耀繁华，心切慕之。”`
        ]
    }
];

interface BookReaderProps {
    onClose: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ onClose }) => {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);

    const openBook = (book: Book) => {
        setSelectedBook(book);
        setCurrentPage(0);
    };

    const nextPage = () => {
        if (!selectedBook || currentPage >= selectedBook.pages.length - 1) return;
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPage(prev => prev + 1);
            setIsFlipping(false);
        }, 300);
    };

    const prevPage = () => {
        if (!selectedBook || currentPage <= 0) return;
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPage(prev => prev - 1);
            setIsFlipping(false);
        }, 300);
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-[#fdf6e3] w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border-4 border-[#d4a373] relative">
                
                {/* Header */}
                <div className="bg-[#deb887] p-4 flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-3">
                        {selectedBook && (
                            <button 
                                onClick={() => setSelectedBook(null)}
                                className="p-2 hover:bg-[#d4a373] rounded-full transition-colors text-[#5d4037]"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}
                        <h2 className="text-xl md:text-2xl font-bold text-[#5d4037] flex items-center gap-2">
                            <BookOpen className="w-6 h-6" /> 
                            {selectedBook ? selectedBook.title : "Luna's Library"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#d4a373] rounded-full transition-colors text-[#5d4037]">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative bg-paper-pattern">
                    {!selectedBook ? (
                        /* Library Grid */
                        <div className="h-full overflow-y-auto p-6 md:p-8 scrollbar-hide">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {BOOKS.map((book) => (
                                    <button 
                                        key={book.id}
                                        onClick={() => openBook(book)}
                                        className="group relative aspect-[2/3] rounded-r-lg rounded-l-sm shadow-xl hover:-translate-y-2 transition-transform duration-300 flex flex-col"
                                    >
                                        {/* Book Spine Effect */}
                                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-white/20 z-20 border-r border-white/10 rounded-l-sm"></div>
                                        
                                        {/* Cover */}
                                        <div className={`flex-1 w-full ${book.coverColor} rounded-r-lg rounded-l-sm p-4 flex flex-col justify-between text-left relative overflow-hidden`}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent pointer-events-none"></div>
                                            <div className="z-10">
                                                <h3 className="text-white text-lg md:text-xl font-bold leading-tight drop-shadow-md writing-vertical-rl">{book.title}</h3>
                                            </div>
                                            <div className="z-10 text-white/80 text-xs font-serif">{book.author}</div>
                                            
                                            {/* Decorative Circle */}
                                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                        </div>
                                        
                                        {/* Pages Effect (Bottom) */}
                                        <div className="h-3 w-[95%] bg-white mx-auto rounded-b-sm border-t border-gray-200 mt-[-2px] shadow-sm"></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Reading View with Pagination */
                        <div className="h-full flex flex-col items-center justify-center p-4 md:p-12 relative">
                            
                            {/* Previous Button */}
                            <button 
                                onClick={prevPage}
                                disabled={currentPage === 0}
                                className="absolute left-2 md:left-6 p-3 rounded-full bg-[#d4a373]/20 hover:bg-[#d4a373]/50 text-[#5d4037] disabled:opacity-0 transition-all z-20"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            {/* Next Button */}
                            <button 
                                onClick={nextPage}
                                disabled={currentPage === selectedBook.pages.length - 1}
                                className="absolute right-2 md:right-6 p-3 rounded-full bg-[#d4a373]/20 hover:bg-[#d4a373]/50 text-[#5d4037] disabled:opacity-0 transition-all z-20"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                            {/* Page Content Container */}
                            <div className={`
                                w-full max-w-2xl bg-white/60 shadow-sm border border-[#d4a373]/20 p-8 md:p-12 h-full max-h-[70vh] rounded-sm relative transition-opacity duration-300 overflow-y-auto scrollbar-hide
                                ${isFlipping ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
                            `}>
                                <div className={`
                                    font-serif text-gray-800 text-lg md:text-xl whitespace-pre-wrap
                                    ${selectedBook.type === 'poem' ? 'text-center leading-[2.5rem] flex items-center justify-center h-full' : 'text-justify leading-loose'}
                                `}>
                                    {selectedBook.pages[currentPage]}
                                </div>
                            </div>
                            
                            {/* Page Number */}
                            <div className="absolute bottom-4 right-6 text-sm text-[#8d6e63] font-serif font-bold">
                                Page {currentPage + 1} / {selectedBook.pages.length}
                            </div>

                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .bg-paper-pattern {
                    background-color: #fdf6e3;
                    background-image: radial-gradient(#d4a373 0.5px, transparent 0.5px);
                    background-size: 20px 20px;
                }
                .writing-vertical-rl {
                    writing-mode: vertical-rl;
                    text-orientation: upright;
                }
            `}</style>
        </div>
    );
};
