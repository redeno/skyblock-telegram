const tg = window.Telegram?.WebApp || {};
/** Синхрон с index.html ADMIN_IDS для Dark Auction / админ-видимости */
window.ADMIN_TELEGRAM_IDS = window.ADMIN_TELEGRAM_IDS || [1546583402];

const SUPABASE_URL = 'https://acddabgvsbqmaqfvjfst.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t63MwjVo6ILOZYH64SWORg_S_KlENDS';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const defaultState = {
    coins: 999999990,
    emeralds: 0,
    nextItemId: 10,
    mayor: {
        current: 'dodoll',
        lastSwitch: Date.now(),
        rotation: ['dodoll', 'diana', 'waifu625', 'necronchik']
    },
    globalMayor: null,
    skills: {
        mining: {lvl:1,xp:0,next:100,label:'ШАХТА'},
        farming: {lvl:1,xp:0,next:100,label:'ФЕРМА'},
        fishing: {lvl:1,xp:0,next:100,label:'РЫБАЛКА'},
        combat: {lvl:1,xp:0,next:100,label:'БОЙ'},
        foraging: {lvl:1,xp:0,next:100,label:'ЛЕС'},
        dungeons: {lvl:1,xp:0,next:200,label:'ДАНЖИ'},
        enchanting: {lvl:1,xp:0,next:100,label:'ЗАЧАРОВАНИЕ'},
        skyblock: {lvl:1,xp:0,next:1,label:'SKYBLOCK',claimedRewards: []}
    },
    stats: {
        hp:100,
        str:10,
        def:0,
        cc:5,
        cd:50,
        mf:0,
        int:0,
        mag_amp:0,
        magic_res:0,
        mining_fortune:0,
        mining_exp_bonus:0,
        foraging_fortune:0,
        foraging_exp_bonus:0,
        farming_fortune:0,
        farming_exp_bonus:0,
        fishing_fortune:0,
        fishing_exp_bonus:0,
        vitality:0,
        arrow_priority: ['Стрела', 'Ядовитая стрела', 'Пробивающая стрела', 'Тяжёлая пробивающая стрела'],
        selected_arrow_type: null,
        duel_opt_in: false,
        duel_wins: 0
    },
    class: '',
    buffs: {godpotion:{endTime:0}, cookie:{endTime:0}},
    farmingTalents: {
        fortune: { lvl: 0, max: 25 },
        exp: { lvl: 0, max: 10 },
        double_drop: { lvl: 0, max: 10, req: { id: 'fortune', lvl: 3 } },
        triple_drop: { lvl: 0, max: 10, req: { id: 'double_drop', lvl: 5 } },
        overdrive: { lvl: 0, max: 1, req: { id: 'fortune', lvl: 5 } },
        overdrive_duration: { lvl: 0, max: 10, req: { id: 'overdrive', lvl: 1 } }
    },
    foragingTalents: {
        fortune: { lvl: 0, max: 25 },
        exp: { lvl: 0, max: 10 },
        double_drop: { lvl: 0, max: 10, req: { id: 'fortune', lvl: 3 } },
        triple_drop: { lvl: 0, max: 10, req: { id: 'double_drop', lvl: 5 } },
        instant_chop: { lvl: 0, max: 5, req: { id: 'fortune', lvl: 5 } }
    },
    activeEvent: null,
    eventEndTime: 0,
    farmingQuests: {
        lastReset: 0,
        active: []
    },
    inventory: [
        //{id:1,name:'Старый меч',type:'weapon',str:15,equipped:false},
       // {id:2,name:'Начальная кирка',type:'tool',sub_type:'pickaxe',equipped:true}
    ],
    minions: [
        // Mining
        {id:'cobble', name:'БУЛЫЖНИКОВЫЙ', category:'mining', resource:'Булыжник', lvl:1, stored:0},
        {id:'coal', name:'УГОЛЬНЫЙ', category:'mining', resource:'Уголь', lvl:0, stored:0},
        {id:'copper', name:'МЕДНЫЙ', category:'mining', resource:'Медь', lvl:0, stored:0},
        {id:'iron', name:'ЖЕЛЕЗНЫЙ', category:'mining', resource:'Железо', lvl:0, stored:0},
        {id:'gold', name:'ЗОЛОТОЙ', category:'mining', resource:'Золото', lvl:0, stored:0},
        {id:'lapis', name:'ЛАЗУРИТОВЫЙ', category:'mining', resource:'Лазурит', lvl:0, stored:0},
        {id:'redstone', name:'РЕДСТОУНОВЫЙ', category:'mining', resource:'Редстоун', lvl:0, stored:0},
        {id:'mithril', name:'МИФРИЛОВЫЙ', category:'mining', resource:'Мифрил', lvl:0, stored:0},
        {id:'ruby', name:'РУБИНОВЫЙ', category:'mining', resource:'Рубин', lvl:0, stored:0},
        {id:'sapphire', name:'САПФИРОВЫЙ', category:'mining', resource:'Сапфир', lvl:0, stored:0},
        {id:'diamond', name:'АЛМАЗНЫЙ', category:'mining', resource:'Алмаз', lvl:0, stored:0},
        {id:'quartz', name:'КВАРЦЕВЫЙ', category:'mining', resource:'Кварц', lvl:0, stored:0},
        {id:'obsidian', name:'ОБСИДИАНОВЫЙ', category:'mining', resource:'Обсидиан', lvl:0, stored:0},
        // Farming
        {id:'wheat', name:'ПШЕНИЧНЫЙ', category:'farming', resource:'Пшеница', lvl:1, stored:0},
        {id:'potato', name:'КАРТОФЕЛЬНЫЙ', category:'farming', resource:'Картофель', lvl:0, stored:0},
        {id:'carrot', name:'МОРКОВНЫЙ', category:'farming', resource:'Морковь', lvl:0, stored:0},
        {id:'cane', name:'ТРОСТНИКОВЫЙ', category:'farming', resource:'Тростник', lvl:0, stored:0},
        {id:'pumpkin', name:'ТЫКВЕННЫЙ', category:'farming', resource:'Тыква', lvl:0, stored:0},
        {id:'melon', name:'АРБУЗНЫЙ', category:'farming', resource:'Арбуз', lvl:0, stored:0},
        {id:'mushroom', name:'ГРИБНОЙ', category:'farming', resource:'Грибы', lvl:0, stored:0},
        {id:'wart', name:'АДСКИЙ', category:'farming', resource:'Адский нарост', lvl:0, stored:0},
        // Fishing
        {id:'karas', name:'КАРАСЁВЫЙ', category:'fishing', resource:'Карась', lvl:1, stored:0},
        {id:'okun', name:'ОКУНЁВЫЙ', category:'fishing', resource:'Окунь', lvl:0, stored:0},
        {id:'shuka', name:'ЩУЧИЙ', category:'fishing', resource:'Щука', lvl:0, stored:0},
        {id:'treska', name:'ТРЕСКОВЫЙ', category:'fishing', resource:'Треска', lvl:0, stored:0},
        {id:'losos', name:'ЛОСОСЁВЫЙ', category:'fishing', resource:'Лосось', lvl:0, stored:0},
        {id:'tunec', name:'ТУНЦОВЫЙ', category:'fishing', resource:'Тунец', lvl:0, stored:0},
        {id:'caveFish', name:'ПЕЩЕРНЫЙ', category:'fishing', resource:'Пещерная Рыба', lvl:0, stored:0},
        {id:'magmaFish', name:'МАГМОВЫЙ', category:'fishing', resource:'Магмовая Рыба', lvl:0, stored:0},
        // Foraging
        {id:'oak', name:'ДУБОВЫЙ', category:'foraging', resource:'Дуб', lvl:1, stored:0},
        {id:'birch', name:'БЕРЁЗОВЫЙ', category:'foraging', resource:'Берёза', lvl:0, stored:0},
        {id:'aspen', name:'ОСИНОВЫЙ', category:'foraging', resource:'Осина', lvl:0, stored:0},
        {id:'spruce', name:'ЕЛОВЫЙ', category:'foraging', resource:'Ель', lvl:0, stored:0},
        {id:'darkoak', name:'ТЁМНОДУБОВЫЙ', category:'foraging', resource:'Тёмный Дуб', lvl:0, stored:0},
        {id:'acacia', name:'АКАЦИЕВЫЙ', category:'foraging', resource:'Акация', lvl:0, stored:0},
        {id:'darkelm', name:'ВЯЗ ТЬМЫ', category:'foraging', resource:'Вяз Тьмы', lvl:0, stored:0},
        {id:'blackwillow', name:'ЧЁРНОИВОВЫЙ', category:'foraging', resource:'Чёрная Ива', lvl:0, stored:0},
        {id:'lifetree', name:'ДРЕВОЖИЗНИ', category:'foraging', resource:'Древо Жизни', lvl:0, stored:0},
        {id:'crystalcedar', name:'КРИСТАЛКЕДРОВЫЙ', category:'foraging', resource:'Кристальный Кедр', lvl:0, stored:0},
        {id:'starseq', name:'ЗВЁЗДНОСЕКВОЙНЫЙ', category:'foraging', resource:'Звёздная Секвойя', lvl:0, stored:0},
        {id:'moonash', name:'ЛУННОЯСЕНЕВЫЙ', category:'foraging', resource:'Лунный Ясень', lvl:0, stored:0},
        // Combat
        {id:'zombie', name:'ЗОМБИ', category:'combat', resource:'Плоть зомби', lvl:0, stored:0},
        {id:'skeleton', name:'СКЕЛЕТ', category:'combat', resource:'Кость', lvl:0, stored:0},
        {id:'spider', name:'ПАУК', category:'combat', resource:'Нить', lvl:0, stored:0}
    ],
    pets: [],
    dungeonsProgress: {
        catacombs: { maxCleared: 0 },
        master: { maxCleared: 0 }
    }
};

function autoRarity(cost) {
    if (cost >= 100000000) return 'legendary';
    if (cost >= 5000000) return 'epic';
    if (cost >= 500000) return 'rare';
    if (cost >= 50000) return 'uncommon';
    return 'common';
}

const rarityColors = {
    common: '#aaa',
    uncommon: '#55ff55',
    rare: '#5555ff',
    epic: '#aa00aa',
    legendary: '#ffaa00',
    mythic: '#ff55ff',
    divine: '#55ffff',
    special: '#ff5555'
};
const rarityLabels = {
    common: 'ОБЫЧНЫЙ',
    uncommon: 'НЕОБЫЧНЫЙ',
    rare: 'РЕДКИЙ',
    epic: 'ЭПИЧЕСКИЙ',
    legendary: 'ЛЕГЕНДАРНЫЙ',
    mythic: 'МИФИЧЕСКИЙ',
    divine: 'БОЖЕСТВЕННЫЙ',
    special: 'ОСОБЫЙ'
};
function getRarityTag(rarity) {
    if (!rarity) return '';
    const c = rarityColors[rarity] || '#aaa';
    const l = rarityLabels[rarity] || rarity.toUpperCase();
    return `<span style="color:${c};font-weight:bold;font-size:0.7rem;">${l}</span>`;
}

/** Линейка луков в магазине: один прогресс, покупка/улучшение по цепочке */
const BOW_PROGRESSION_DEFS = [
    { name: 'Деревянный лук', type: 'weapon', ranged: true, bow_base_str: 25, cost: 500000, rarity: 'common', desc: 'Тир 1. +25 силы лука. Нужны стрелы для выстрела.' },
    { name: 'Редкий лук', type: 'weapon', ranged: true, bow_base_str: 30, cost: 2000000, rarity: 'rare', desc: 'Тир 2 (редкий). +30 силы лука.' },
    { name: 'Эпический лук', type: 'weapon', ranged: true, bow_base_str: 30, bow_base_cd: 5, cost: 8000000, rarity: 'epic', desc: 'Тир 3 (эпик). +30 силы лука, +5% крит урона.' },
    { name: 'Легендарный лук', type: 'weapon', ranged: true, bow_base_str: 30, bow_base_cc: 5, bow_base_cd: 10, cost: 25000000, rarity: 'legendary', desc: 'Тир 4 (легенда). +30 силы, +5% крит шанс, +10% крит урон.' }
];
const LONG_BOW_SHOP_DEF = {
    name: 'Длинный лук',
    type: 'weapon',
    ranged: true,
    bow_base_str: 50,
    bow_base_cd: 25,
    cost: 15000000,
    rarity: 'epic',
    desc: 'Эпический длинный лук. +50 силы лука, +25% крит урона. Отдельная покупка (не заменяет цепочку).'
};

window.ARROW_TYPES = {
    'Стрела': { defShred: 0, dmgBonus: 0 },
    'Ядовитая стрела': { defShred: 0, dmgBonus: 0.08 },
    'Пробивающая стрела': { defShred: 5, dmgBonus: 0 },
    'Тяжёлая пробивающая стрела': { defShred: 15, dmgBonus: 0 }
};
window.ALL_ARROW_NAMES = Object.keys(window.ARROW_TYPES);

const shopItems = {
    weapon: [
                {name:'Старый меч',type:'weapon',str:10,cost:1000,rarity:'common'},
        {name:'Каменный меч',type:'weapon',str:20,cost:25000,rarity:'common'},
        {name:'Железный Меч',type:'weapon',str:30,cost:500000,rarity:'rare'},
        {name:'Алмазный Меч',type:'weapon',str:40,cost:1000000,rarity:'rare'},
        {name:'Незеритовый Меч',type:'weapon',str:50,cost:10000000,rarity:'epic'},
                {name:'Меч первопроходца',type:'weapon',str:60,hp:10,def:0,cd:10,cost:500000000,rarity:'legendary'}
    ],
    zombie_weapon: [
        {name:'Zombie Sword',type:'weapon',str:20,zombie_bonus:25,cost:0,flesh_cost:32,rarity:'uncommon',slayer_req:0},
        {name:'Reaper Falchion',type:'weapon',str:30,zombie_bonus:50,cost:0,flesh_cost:512,rarity:'epic',slayer_req:5},
        {name:'Shredder Sword',type:'weapon',str:50,zombie_bonus:100,cost:0,living_flesh_cost:8,rarity:'legendary',slayer_req:7}
    ],
    zombie_armor: [
        {name:'🧟 Зомби броня',type:'armor',def:10,vitality:5,cost:0,flesh_cost:64,rarity:'uncommon',slayer_req:0},
        {name:'🧟 Ревенант броня',type:'armor',def:20,vitality:7.5,cost:0,flesh_cost:256,rarity:'epic',slayer_req:5},
        {name:'🧟 Рипер броня',type:'armor',def:30,vitality:10,zombie_bonus:10,cost:0,flesh_cost:512,living_flesh_cost:4,rarity:'legendary',slayer_req:7}
    ],
    armor: [
        {name:'🛡️ Железная Броня',type:'armor',def:10,cost:10000,rarity:'common'},
        {name:'🛡️ Алмазная броня',type:'armor',def:20,cost:50000,rarity:'uncommon'},
        {name:'⚔️ Shaddow Assasins броня',type:'armor',def:25,str:25,cc:5,cd:10,cost:1000000,rarity:'rare'},
        {name:'🧠 ДемонЛорд Броня',type:'armor',str:50,def:30,cc:10,cd:25,mag_amp:5,mf:25,cost:10000000,rarity:'epic'},
        {name:'🍀 Накидка первопроходца',type:'armor',hp:50,str:25,int:25,def:15,cc:15,cd:25,farming_exp_bonus:3,mining_exp_bonus:3,foraging_exp_bonus:3,fishing_exp_bonus:3,dungeon_exp_bonus:3,farming_fortune:20,mining_fortune:20,foraging_fortune:20,fishing_fortune:20,cost:50000000,rarity:'legendary'}
    ],
    mining_armor: [
        {name:'⛏️ Шахтёрская броня',type:'armor',mining_fortune:50,mining_exp_bonus:5,def:5,cost:50000,rarity:'uncommon',desc:'Базовая броня шахтёра. +50 фортуны, +5% опыта шахты, +5 защиты.'},
        {name:'⛏️ Рудокопная броня',type:'armor',mining_fortune:125,mining_exp_bonus:7,def:10,cost:500000,rarity:'rare',desc:'Улучшенная шахтёрская экипировка. +125 фортуны, +7% опыта шахты, +10 защиты.'},
        {name:'⛏️ Мифриловая броня',type:'armor',mining_fortune:200,mining_exp_bonus:10,def:20,mf:10,cost:5000000,rarity:'epic',desc:'Редкая мифриловая броня. +200 фортуны, +10% опыта шахты, +20 защиты, +10 удачи.'},
        {name:'⛏️ Кристальная броня',type:'armor',mining_fortune:300,mining_exp_bonus:15,def:30,mf:20,cost:50000000,rarity:'legendary',desc:'Легендарная кристальная броня. +300 фортуны, +15% опыта шахты, +30 защиты, +20 удачи.'}
    ],
    farming_armor: [
        {name:'🌾 Фермерская броня',type:'armor',farming_fortune:50,farming_exp_bonus:5,cost:50000,rarity:'uncommon',desc:'Базовая фермерская броня. +50 фортуны, +5% опыта фермы.'},
        {name:'🌾 Арбузная броня',type:'armor',farming_fortune:125,farming_exp_bonus:7,cost:500000,rarity:'rare',desc:'Улучшенная фермерская экипировка. +125 фортуны, +7% опыта фермы.'},
        {name:'🌾 Ферменто броня',type:'armor',farming_fortune:200,farming_exp_bonus:10,cost:5000000,rarity:'epic',desc:'Редкая ферментированная броня. +200 фортуны, +10% опыта фермы.'},
        {name:'🌾 Гелиантус броня',type:'armor',farming_fortune:300,farming_exp_bonus:15,cost:50000000,rarity:'legendary',desc:'Легендарная солнечная броня. +300 фортуны, +15% опыта фермы.'}
    ],
    fishing_armor: [
        {name:'🎣 Рыбацкая броня',type:'armor',fishing_fortune:50,fishing_exp_bonus:5,cost:50000,rarity:'uncommon',desc:'Базовая рыбацкая экипировка. +50 фортуны, +5% опыта рыбалки.'},
        {name:'🎣 Морская броня',type:'armor',fishing_fortune:125,fishing_exp_bonus:7,def:8,cost:500000,rarity:'rare',desc:'Улучшенная морская экипировка. +125 фортуны, +7% опыта рыбалки, +8 защиты.'},
        {name:'🎣 Броня глубин',type:'armor',fishing_fortune:200,fishing_exp_bonus:10,def:15,hp:25,cost:5000000,rarity:'epic',desc:'Редкая броня из глубин океана. +200 фортуны, +10% опыта рыбалки, +15 защиты, +25 ХП.'},
        {name:'🎣 Левиафанова броня',type:'armor',fishing_fortune:300,fishing_exp_bonus:15,def:25,hp:50,cost:50000000,rarity:'legendary',desc:'Легендарная броня из чешуи Левиафана. +300 фортуны, +15% опыта рыбалки, +25 защиты, +50 ХП.'}
    ],
    foraging_armor: [
        {name:'🌲 Лесная броня',type:'armor',foraging_fortune:50,foraging_exp_bonus:5,cost:50000,rarity:'uncommon',desc:'Базовая лесная экипировка. +50 фортуны, +5% опыта леса.'},
        {name:'🌲 Броня лесника',type:'armor',foraging_fortune:125,foraging_exp_bonus:7,str:10,cost:500000,rarity:'rare',desc:'Улучшенная лесная экипировка. +125 фортуны, +7% опыта леса, +10 силы.'},
        {name:'🌲 Древесная броня',type:'armor',foraging_fortune:200,foraging_exp_bonus:10,str:20,def:10,cost:5000000,rarity:'epic',desc:'Редкая древесная броня. +200 фортуны, +10% опыта леса, +20 силы, +10 защиты.'},
        {name:'🌲 Броня Друида',type:'armor',foraging_fortune:300,foraging_exp_bonus:15,str:30,def:20,hp:30,cost:50000000,rarity:'legendary',desc:'Легендарная броня Друида. +300 фортуны, +15% опыта леса, +30 силы, +20 защиты, +30 ХП.'}
    ],
    tool: [
        {name:'Ancestral Spade',type:'tool',sub_type:'spade',cost:10000,rarity:'rare',desc:'Нужен для Ритуала Дианы. 4 лунки.'}
    ],
    mining_tool: [
        {name:'Деревянная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:10,cost:500,rarity:'common'},
        {name:'Каменная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:30,cost:2500,rarity:'common'},
        {name:'Железная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:60,double_chance:10,cost:15000,rarity:'common'},
        {name:'Золотая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:100,double_chance:25,cost:50000,rarity:'uncommon'},
        {name:'Алмазная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:150,triple_chance:10,cost:250000,rarity:'uncommon'},
        {name:'Незеритовая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:250,triple_chance:20,cost:1000000,rarity:'rare'},
        {name:'Титаническая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:400,triple_chance:30,cost:10000000,rarity:'epic'},
        {name:'Дивайн кирка',type:'tool',sub_type:'pickaxe',mining_fortune:600,triple_chance:50,cost:100000000,rarity:'legendary'},
        {name:'Разрушитель Границ',type:'tool',sub_type:'pickaxe',mining_fortune:1000,triple_chance:70,cost:5000000000,rarity:'legendary'}
    ],
    farming_tool: [
        {name:'Деревянная мотыга',type:'tool',sub_type:'hoe',farming_fortune:10,cost:500,rarity:'common'},
        {name:'Каменная мотыга',type:'tool',sub_type:'hoe',farming_fortune:30,cost:2500,rarity:'common'},
        {name:'Железная мотыга',type:'tool',sub_type:'hoe',farming_fortune:60,cost:15000,rarity:'common'},
        {name:'Алмазная мотыга',type:'tool',sub_type:'hoe',farming_fortune:150,cost:250000,rarity:'uncommon'},
        {name:'Незеритовая мотыга',type:'tool',sub_type:'hoe',farming_fortune:250,cost:1000000,rarity:'rare'},
        {name:'Титаническая мотыга',type:'tool',sub_type:'hoe',farming_fortune:400,cost:10000000,rarity:'epic'},
        {name:'Дивайн мотыга',type:'tool',sub_type:'hoe',farming_fortune:600,cost:100000000,rarity:'legendary'},
        {name:'Мотыга созидания',type:'tool',sub_type:'hoe',farming_fortune:1000,farming_exp_bonus:15,cost:5000000000,rarity:'legendary'}
    ],
    foraging_tool: [
        {name:'Деревянный топор',type:'tool',sub_type:'axe',foraging_fortune:10,cost:500,rarity:'common'},
        {name:'Каменный топор',type:'tool',sub_type:'axe',foraging_fortune:30,cost:2500,rarity:'common'},
        {name:'Железный топор',type:'tool',sub_type:'axe',foraging_fortune:60,cost:15000,rarity:'common'},
        {name:'Золотой топор',type:'tool',sub_type:'axe',foraging_fortune:100,cost:50000,rarity:'uncommon'},
        {name:'Алмазный топор',type:'tool',sub_type:'axe',foraging_fortune:150,cost:250000,rarity:'uncommon'},
        {name:'Незеритовый топор',type:'tool',sub_type:'axe',foraging_fortune:250,cost:1000000,rarity:'rare'},
        {name:'Титанический топор',type:'tool',sub_type:'axe',foraging_fortune:400,cost:10000000,rarity:'epic'},
        {name:'Дивайн топор',type:'tool',sub_type:'axe',foraging_fortune:600,cost:100000000,rarity:'legendary'}
    ],
    fishing_tool: [
        {name:'Старая удочка',type:'tool',sub_type:'rod',fishing_fortune:10,cost:500,rarity:'common'},
        {name:'Укрепленная удочка',type:'tool',sub_type:'rod',fishing_fortune:30,cost:5000,rarity:'common'},
        {name:'Удочка мастера',type:'tool',sub_type:'rod',fishing_fortune:70,cost:50000,rarity:'uncommon'},
        {name:'Морская удочка',type:'tool',sub_type:'rod',fishing_fortune:150,cost:500000,rarity:'rare'},
        {name:'Удочка гиганта',type:'tool',sub_type:'rod',fishing_fortune:300,triple_chance:25,cost:100000000,rarity:'legendary'},
        {name:'Удочка героя',type:'tool',sub_type:'rod',fishing_fortune:500,triple_chance:25,cost:500000000,rarity:'legendary'}
    ],
    accessory: [ 
        {name:'🍀 Талисман удачи',type:'accessory',mf:10,cost:10000},
        {name:'⚔️ Талисман силы',type:'accessory',str:5,cost:5000},
        {name:'🛡️ Талисман защиты',type:'accessory',def:5,cost:5000},
        {name:'⚔️ Талисман мощи',type:'accessory',cd:5,cc:1,cost:10000},
        {name:'🧠 Талисман знаний',type:'accessory',int:5,cost:5000},
        {name:'🧠 Талисман древних знаний',type:'accessory',int:25,mag_amp:1,cost:1000000},
        {name:'🍀 Кольцо опыта',type:'accessory',xp_bonus:1,cost:100000},
                {name:'🍀 Golden Box Talisman',type:'accessory',gold_bonus:1,cost:5000000},
                {name:'🌾 Hay Bale Talisman',type:'accessory',farming_fortune:5,cost:100000},
                {name:'🌾 Farmer Orb Talisman',type:'accessory',farming_exp_bonus:1,cost:10000000},
                {name:'⚔️ Tiger Talisman',type:'accessory',cc:7,cost:50000000},
                {name:'🍀 Treasure Artifact',type:'accessory',gold_bonus:5,str:10,cost:300000000}                
    ],
    buff: [
        {name:'GodPotion',type:'potion',cost:1500000},
        {name:'Печенька',type:'potion',cost:15000000}
    ],
    material: [
        {name:'Стрела',type:'material',cost:1000,rarity:'common',desc:'Нужна для стрельбы из лука. Данжи и Алтарь.'},
        {name:'Ядовитая стрела',type:'material',cost:20000,rarity:'uncommon',desc:'+8% урона выстрелом. Приоритет настраивается в инвентаре.'},
        {name:'Пробивающая стрела',type:'material',cost:30000,rarity:'rare',desc:'Игнорирует 5% брони врага (бонус к урону по данжу).'},
        {name:'Тяжёлая пробивающая стрела',type:'material',cost:50000,rarity:'epic',desc:'Игнорирует 15% брони врага (бонус к урону по данжу).'},
        {name:'Griffin Feather',type:'material',cost:0,rarity:'uncommon',desc:'Материал ритуала Дианы.'},
        {name:'Ancient Claw',type:'material',cost:0,rarity:'rare',desc:'Дроп с мобов ритуала.'},
        {name:'Daedalus Stick',type:'material',cost:0,rarity:'epic',desc:'Редкий дроп ритуала.'},
        {name:'Chimera Enchantment',type:'material',cost:0,rarity:'legendary',desc:'Очень редкий дроп Minos Inquisitor.'},
        {name:'Mythos Fragment',type:'material',cost:0,rarity:'rare',desc:'Ресурс ритуала Дианы.'}
    ],
    potion: [
        {name:'Зелье Силы',type:'potion',cost:500000,desc:'+30 силы на 5 минут'},
        {name:'Зелье восстановления хп',type:'potion',cost:300000,desc:'+150 ХП сразу'},
        {name:'Зелье Удачи',type:'potion',cost:250000,desc:'+30 фортуны на 5 минут'}
    ],
    pet: [
        {name:'Гриффон',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'combat',base_bonus:0.1,cost:50000,desc:'Нужен для Ритуала Дианы.'},
        {name:'Чешуйница',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'mining',base_bonus:0.1,cost:5000},
        {name:'Кролик',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'farming',base_bonus:0.1,cost:5000},
        {name:'Сквид',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'fishing',base_bonus:0.1,cost:5000},
        {
        name: 'Ёжик',
        type: 'pet',
        skill: 'foraging',
        rarity: 'common',
        lvl: 1,
        xp: 0,
        next: 100,
        cost: 5000
         },
        {
        name: 'Бейби Иссушитель',
        type: 'pet',
        skill: 'combat',
        rarity: 'common',
        lvl: 1,
        xp: 0,
        next: 100,
        cost: 50000000
        },
        {
        name: 'Тигр',
        type: 'pet',
        skill: 'combat',
        rarity: 'common',
        lvl: 1,
        xp: 0,
        next: 100,
        cost: 1000000
        },
        {
        name: 'Бобёр',
        type: 'pet',
        skill: 'foraging',
        rarity: 'common',
        lvl: 1,
        xp: 0,
        next: 100,
        cost: 25000
        },
        {
        name: 'Дельфин',
        type: 'pet',
        skill: 'fishing',
        rarity: 'common',
        lvl: 1,
        xp: 0,
        next: 100,
        cost: 25000
        },
        {
        name: 'Черепаха',
        type: 'pet',
        skill: 'fishing',
        rarity: 'common',
        lvl: 1,
        xp: 0,
        next: 100,
        cost: 100000
        },
        {
        name: 'Зомби',
        type: 'pet',
        skill: 'combat',
        rarity: 'common',
        lvl: 1,
        xp: 0,
        next: 100,
        cost: 500000
        }
    ]
};

// Make shopItems available globally so the InfoBook can list all shop/слайер items.
window.shopItems = shopItems;

Object.values(shopItems).forEach(arr => {
    if (Array.isArray(arr)) arr.forEach(item => {
        if (!item.rarity && item.cost > 0) item.rarity = autoRarity(item.cost);
    });
});

window.petRarityBonuses = {
    common: 0.1,
    rare: 0.2,
    epic: 0.3,
    legendary: 0.5
};

const petUpgradeCosts = {
    rare: {coins:0, resources:32},
    epic: {coins:250000, resources:256},
    legendary: {coins:8000000, resources:1000, upgradeItem:1}
};

const petResourceMap = {
    mining: 'Уголь',
    farming: 'Пшеница',
    fishing: 'Карась',
    foraging: 'Дуб',
    combat: 'Фрагмент из Данжа' 
};
const farmingArmorTiers = [
    {
        name: 'Фермерская броня',
        rarity: 'rare',
        farming_fortune: 50,
        farming_exp_bonus: 5,
        material_cost: { 'Пшеница': 512 }
    },
    {
        name: 'Арбузная броня',
        rarity: 'epic',
        farming_fortune: 125,
        farming_exp_bonus: 7,
        material_cost: {
            'Стог Пшена': 1,
            'Стог Картошки': 1,
            'Стог Моркови': 1
        }
    },
    {
        name: 'Ферменто броня',
        rarity: 'legendary',
        farming_fortune: 200,
        farming_exp_bonus: 10,
        material_cost: {
            'Сингулярность Пшена': 1,
            'Сингулярность Картошки': 1,
            'Сингулярность Моркови': 1
        }
    },
    {
        name: 'Гелиантус броня',
        rarity: 'mythic',
        farming_fortune: 300,
        farming_exp_bonus: 15,
        material_cost: {
            'Сингулярность Пшена': 4,
            'Сингулярность Картошки': 4,
            'Сингулярность Моркови': 4
        }
    }
];

const gramotaRarityOrder = ['common','uncommon','rare','epic','mythic','legendary','divine','godlike'];
const gramotaRarityNames = {
    common: 'Обычная',
    uncommon: 'Необычная',
    rare: 'Редкая',
    epic: 'Эпическая',
    mythic: 'Мифическая',
    legendary: 'Легендарная',
    divine: 'Божественная',
    godlike: 'Богоподобная'
};

const gramotaBonusByRarity = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    mythic: 5,
    legendary: 6,
    divine: 7,
    godlike: 8
};

function getGramotaRarityForLevel(level) {
    const idx = Math.floor(level / 10) - 1;
    return gramotaRarityOrder[Math.min(Math.max(idx, 0), gramotaRarityOrder.length - 1)] || 'common';
}

function getGramotaName(level) {
    const idx = Math.floor(level / 10);
    const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
    const romanNum = roman[idx - 1] || idx.toString();
    return `Грамота ${romanNum} Уровня`;
}

function makeGramotaItem(level) {
    const rarity = getGramotaRarityForLevel(level);
    return {
        name: getGramotaName(level),
        type: 'material',
        rarity,
        gramota: true,
        gramotaLevel: level / 10
    };
}

function makeSkyblockResourcePack(level) {
    const packs = {
        5: [
            { name: 'Дуб', type: 'material', count: 64 },
            { name: 'Уголь', type: 'material', count: 64 },
            { name: 'Пшеница', type: 'material', count: 64 }
        ],
        15: [
            { name: 'Картофель', type: 'material', count: 64 },
            { name: 'Морковь', type: 'material', count: 64 },
            { name: 'Стрела', type: 'material', count: 32 },
            { name: 'Печенька', type: 'potion', count: 1 }
        ],
        25: [
            { name: 'Тыква', type: 'material', count: 64 },
            { name: 'Арбуз', type: 'material', count: 64 },
            { name: 'Стрела', type: 'material', count: 50 },
            { name: 'Печенька', type: 'potion', count: 1 }
        ],
        35: [
            { name: 'Тростник', type: 'material', count: 64 },
            { name: 'Грибы', type: 'material', count: 64 },
            { name: 'Стрела', type: 'material', count: 64 },
            { name: 'GodPotion', type: 'potion', count: 1 }
        ],
        45: [
            { name: 'Уголь', type: 'material', count: 128 },
            { name: 'Дуб', type: 'material', count: 128 },
            { name: 'Стрела', type: 'material', count: 64 },
            { name: 'Печенька', type: 'potion', count: 2 }
        ],
        55: [
            { name: 'Изумруд', type: 'material', count: 64 },
            { name: 'Мифрил', type: 'material', count: 32 },
            { name: 'Стрела', type: 'material', count: 80 },
            { name: 'Печенька', type: 'potion', count: 2 }
        ],
        65: [
            { name: 'Рубин', type: 'material', count: 64 },
            { name: 'Сапфир', type: 'material', count: 64 },
            { name: 'Стрела', type: 'material', count: 100 },
            { name: 'GodPotion', type: 'potion', count: 1 }
        ],
        75: [
            { name: 'Алмаз', type: 'material', count: 64 },
            { name: 'Обсидиан', type: 'material', count: 64 },
            { name: 'Стрела', type: 'material', count: 120 },
            { name: 'Печенька', type: 'potion', count: 2 }
        ]
    };
    return packs[level] || [
        { name: 'Уголь', type: 'material', count: 64 },
        { name: 'Дуб', type: 'material', count: 64 },
        { name: 'Стрела', type: 'material', count: 32 }
    ];
}

const skyblockRewardTable = {};
for (let lvl = 1; lvl <= 80; lvl++) {
    if (lvl % 5 !== 0) {
        skyblockRewardTable[lvl] = {
            title: 'Монеты',
            desc: `Награда за достижение ${lvl} уровня SkyBlock.`,
            coins: lvl * 10000
        };
    } else if (lvl % 10 === 0) {
        const item = makeGramotaItem(lvl);
        const bonus = gramotaRarityNames[item.rarity] ? gramotaRarityNames[item.rarity] : item.rarity;
        skyblockRewardTable[lvl] = {
            title: item.name,
            desc: `Получите ${item.name} (+${gramotaBonusByRarity[item.rarity]}% ко всем статистикам).`,
            items: [item]
        };
    } else {
        skyblockRewardTable[lvl] = {
            title: 'Набор ресурсов',
            desc: `Набор материалов за достижение ${lvl} уровня SkyBlock.`,
            items: makeSkyblockResourcePack(lvl)
        };
    }
}

const minionConfig = {
    1: { cost: 0, resources: 32, storage: 32 },
    2: { cost: 500, resources: 64, storage: 40 },
    3: { cost: 2500, resources: 128, storage: 48 },
    4: { cost: 12500, resources: 256, storage: 56 },
    5: { cost: 62500, resources: 512, storage: 64 },
    6: { cost: 312500, resources: 1024, storage: 72 },
    7: { cost: 1562500, resources: 2048, storage: 80 },
    8: { cost: 7812500, resources: 4096, storage: 88 },
    9: { cost: 39062500, resources: 8192, storage: 96 },
    10: { cost: 100000000, resources: 16384, storage: 104 },
    11: { cost: 0, resources: 8, resourceName: 'Изумруд', storage: 112 },
    12: { cost: 0, resources: 16, resourceName: 'Изумруд', storage: 120 },
    13: { cost: 0, resources: 1, resourceName: 'Сингулярность Пшена', storage: 128 },
    14: { cost: 0, resources: 2, resourceName: 'Сингулярность Пшена', storage: 256 },
    15: { cost: 0, resources: 4, resourceName: 'Сингулярность Пшена', storage: 512 }
};

const game = {
    state: {...defaultState},
    isBusy: false,
    currentLoc: '',
    lastFilter: 'weapon',
    lastShopFilter: 'weapon',
    messageQueue: [],
    playerTelegramId: null,

    loadFromSupabase: async function() {
    if (!this.playerTelegramId) {
        this.msg('Не удалось получить Telegram ID — тестовый режим');
        this.state = JSON.parse(JSON.stringify(defaultState));
        // Restore currentCrop if it was in state (from local storage simulation or just init)
        this.state.currentCrop = null; 
        this.updateUI();
        return;
    }

    let { data, error } = await supabaseClient
        .from('players')
        .select('*')
        .eq('telegram_id', this.playerTelegramId)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        console.error('Ошибка Supabase:', error);
        this.msg('Ошибка связи с сервером — загружаем локально');
        this.state = JSON.parse(JSON.stringify(defaultState));
        this.updateUI();
        return;
    }

    if (data) {
        // Безопасное присваивание всех полей с дефолтами
        this.state.coins = data.coins ?? 0;
        this.state.emeralds = data.emeralds ?? data.stats?.emeralds ?? 0;
        this.state.nextItemId = data.next_item_id ?? 10;
        this.state.class = data.class ?? '';
        // Restore currentCrop from loaded data if we start saving it in JSON columns or separate field
        // Since we are using this.state to save, and supabase saves specific fields, we might lose it if not in schema.
        // However, we are saving 'stats', 'skills', 'inventory' etc separately in upsert.
        // We need to add 'currentCrop' to the upsert and schema OR put it in 'stats' or another JSON field?
        // 'stats' is a JSONB column usually. 'skills' is JSONB.
        // Let's put currentCrop in this.state directly, but we need to ensure it's saved.
        // Inspect saveToSupabase: it saves explicit fields.
        // So we should add currentCrop to 'stats' or 'skills' temporarily or update saveToSupabase.
        // Updating saveToSupabase requires DB schema change if it's a column.
        // If 'stats' is JSONB, we can add it there.
        
        // Let's use this.state.stats.currentCrop for persistence without schema change!
        this.state.stats.currentCrop = data.stats?.currentCrop || null;
        this.state.currentCrop = this.state.stats.currentCrop; // Sync to root state for easier access

        // Навыки — с защитой от null/undefined
        this.state.skills = data.skills 
            ? { ...defaultState.skills, ...data.skills } 
            : defaultState.skills;
        // Ensure skyblock reward tracking always exists
        if (this.state.skills?.skyblock) {
            this.state.skills.skyblock = { ...defaultState.skills.skyblock, ...this.state.skills.skyblock };
        }

        // Статы — с защитой
        this.state.stats = data.stats 
            ? { ...defaultState.stats, ...data.stats } 
            : defaultState.stats;
        if (!Array.isArray(this.state.stats.arrow_priority) || this.state.stats.arrow_priority.length === 0) {
            this.state.stats.arrow_priority = [...(defaultState.stats.arrow_priority || [])];
        }

        // Инвентарь
        this.state.inventory = Array.isArray(data.inventory) 
            ? data.inventory 
            : defaultState.inventory;

        // Миньоны — с миграцией
        const savedMinions = Array.isArray(data.minions) ? data.minions : [];
        this.state.minions = defaultState.minions.map(defM => {
            const saved = savedMinions.find(s => s.id === defM.id);
            if (saved) {
                // Сохраняем прогресс (уровень и накопленное)
                return { ...defM, lvl: saved.lvl, stored: saved.stored };
            }
            return defM;
        });

        // Питомцы
        this.state.pets = Array.isArray(data.pets) 
            ? data.pets 
            : [];

        // Баффы — САМОЕ ВАЖНОЕ МЕСТО, где раньше падало
        this.state.buffs = data.buffs && typeof data.buffs === 'object'
            ? {
                godpotion: { endTime: data.buffs.godpotion?.endTime ?? 0 },
                cookie: { endTime: data.buffs.cookie?.endTime ?? 0 },
                ...data.buffs  // если появятся новые баффы — сохраним
              }
            : { 
                godpotion: { endTime: 0 }, 
                cookie: { endTime: 0 } 
              };

        this.state.farmingTalents = data.farmingTalents || {
            fortune: { lvl: 0, max: 25 },
            exp: { lvl: 0, max: 10 },
            double_drop: { lvl: 0, max: 10, req: { id: 'fortune', lvl: 3 } },
            triple_drop: { lvl: 0, max: 10, req: { id: 'double_drop', lvl: 5 } },
            overdrive: { lvl: 0, max: 1, req: { id: 'fortune', lvl: 5 } },
            overdrive_duration: { lvl: 0, max: 10, req: { id: 'overdrive', lvl: 1 } }
        };

        this.state.foragingTalents = data.foragingTalents || {
            fortune: { lvl: 0, max: 25 },
            exp: { lvl: 0, max: 10 },
            double_drop: { lvl: 0, max: 10, req: { id: 'fortune', lvl: 3 } },
            triple_drop: { lvl: 0, max: 10, req: { id: 'double_drop', lvl: 5 } },
            instant_chop: { lvl: 0, max: 5, req: { id: 'fortune', lvl: 5 } }
        };

        this.state.activeEvent = data.activeEvent || null;
        this.state.eventEndTime = data.eventEndTime || 0;

        this.state.farmingQuests = data.farmingQuests || { lastReset: 0, active: [] };
        this.state.mayor = data.mayor || defaultState.mayor;
        this.state.slayer = {
    zombie: {
        lvl: data.slayer?.zombie?.lvl ?? 1,
        xp: data.slayer?.zombie?.xp ?? 0
    }
};
        this.checkDailyQuests();

        this.msg('Сохранение успешно загружено!');
    } else {
        // Новый игрок — создаём с дефолтными значениями
        const tgUser = tg.initDataUnsafe?.user;
        const username = tgUser?.username || null;

        const newPlayer = {
            telegram_id: this.playerTelegramId,
            username: username,
            coins: 0,
            emeralds: 0,
            next_item_id: 10,
            class: '',
            skills: defaultState.skills,
            stats: defaultState.stats,
            inventory: defaultState.inventory,
            minions: defaultState.minions,
            pets: [],
            buffs: { 
                godpotion: { endTime: 0 }, 
                cookie: { endTime: 0 } 
            }
        };

        const { error: insertError } = await supabaseClient
            .from('players')
            .insert(newPlayer);

        if (insertError) {
            console.error('Ошибка создания профиля:', insertError);
            this.msg('Ошибка создания нового профиля');
            this.state = JSON.parse(JSON.stringify(defaultState));
        } else {
            this.state = JSON.parse(JSON.stringify(defaultState));
            this.msg('Создан новый профиль!');
        }
    }

    // Финальная защита — на всякий случай
    if (!this.state.buffs) {
        this.state.buffs = { 
            godpotion: { endTime: 0 }, 
            cookie: { endTime: 0 } 
        };
    }

    this.initSkills();

    // Защита статов (как было у тебя)
    Object.assign(this.state.stats, {
        mining_fortune: this.state.stats.mining_fortune ?? 0,
        mining_exp_bonus: this.state.stats.mining_exp_bonus ?? 0,
        foraging_fortune: this.state.stats.foraging_fortune ?? 0,
        foraging_exp_bonus: this.state.stats.foraging_exp_bonus ?? 0,
        farming_fortune: this.state.stats.farming_fortune ?? 0,
        farming_exp_bonus: this.state.stats.farming_exp_bonus ?? 0,
        fishing_fortune: this.state.stats.fishing_fortune ?? 0,
        fishing_exp_bonus: this.state.stats.fishing_exp_bonus ?? 0,
        magic_res: this.state.stats.magic_res ?? 0
    });

    this.updateUI();
},
    saveToSupabase: async function() {
        if (!this.playerTelegramId) return;
        this.state.stats = this.state.stats || {};
        this.state.stats.emeralds = this.state.emeralds || 0;
        const payload = {
                telegram_id: this.playerTelegramId,
                coins: this.state.coins,
                emeralds: this.state.emeralds || 0,
                next_item_id: this.state.nextItemId,
                class: this.state.class,
                skills: this.state.skills,
                stats: this.state.stats,
                inventory: this.state.inventory,
                minions: this.state.minions,
                pets: this.state.pets,
                buffs: this.state.buffs,
                farmingTalents: this.state.farmingTalents,
                farmingQuests: this.state.farmingQuests,
                mayor: this.state.mayor,
                slayer: this.state.slayer
        };
        let { error } = await supabaseClient
            .from('players')
            .upsert(payload, { onConflict: 'telegram_id' });
        if (error && /emeralds/i.test(error.message || '')) {
            delete payload.emeralds;
            ({ error } = await supabaseClient.from('players').upsert(payload, { onConflict: 'telegram_id' }));
        }
        if (error) console.error('Ошибка сохранения:', error);
    },

    checkDailyQuests() {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - this.state.farmingQuests.lastReset > oneDay) {
            this.state.farmingQuests.lastReset = now;
            this.state.farmingQuests.active = this.generateQuests();
        }
    },

    generateQuests() {
        const pool = [
            { id: 'q1', type: 'collect', target: 'Пшеница', goal: 500, reward: 15000 },  // 1 * 30 * 500
            { id: 'q2', type: 'collect', target: 'Картофель', goal: 300, reward: 18000 }, // 2 * 30 * 300
            { id: 'q3', type: 'collect', target: 'Морковь', goal: 200, reward: 18000 },   // 3 * 30 * 200
            { id: 'q4', type: 'collect', target: 'Тыква', goal: 150, reward: 18000 },     // 4 * 30 * 150
            { id: 'q5', type: 'collect', target: 'Арбуз', goal: 400, reward: 60000 },     // 5 * 30 * 400
            { id: 'q6', type: 'collect', target: 'Тростник', goal: 600, reward: 108000 }  // 6 * 30 * 600
        ];
        return pool.sort(() => 0.5 - Math.random()).slice(0, 3).map(q => ({ ...q, progress: 0, completed: false }));
    },

    updateQuestProgress(target, amount) {
        if (!this.state.farmingQuests.active) return;
        this.state.farmingQuests.active.forEach(q => {
            if (q.type === 'collect' && q.target === target && !q.completed) {
                q.progress += amount;
                
                // Начисляем опыт за прогресс: (Порядковый номер * 0.5 + 0.5) * 50
                const cropOrder = {
                    'Пшеница': 1,
                    'Картофель': 2,
                    'Морковь': 3,
                    'Тыква': 4,
                    'Арбуз': 5,
                    'Тростник': 6
                };
                const order = cropOrder[target] || 1;
                const multiplier = 1 + (order - 1) * 0.1;
                const xpGain = amount * multiplier * 3;
                this.addXp('farming', xpGain);

                if (q.progress >= q.goal) {
                    q.completed = true;
                    this.state.coins += q.reward;
                    this.addXp('skyblock', 0.5);
                    this.msg(`✅ КВЕСТ ВЫПОЛНЕН: ${q.target}! +${q.reward}💰`);
                }
            }
        });
    },

    renderQuests() {
        const div = document.getElementById('farming-list');
        if (!div) return;
        
        // Проверяем наличие активных квестов и генерируем, если их нет
        if (!this.state.farmingQuests.active || this.state.farmingQuests.active.length === 0) {
            this.state.farmingQuests.active = this.generateQuests();
        }

        let html = `<h3 style="color:var(--accent); text-align:center;">📅 ЕЖЕДНЕВНЫЕ КВЕСТЫ</h3>`;
        this.state.farmingQuests.active.forEach(q => {
            const prog = Math.min(100, (q.progress / q.goal) * 100);
            html += `
                <div class="card" style="margin-bottom:10px; border-left:4px solid ${q.completed ? 'var(--green)' : 'var(--accent)'}">
                    <div style="display:flex; justify-content:space-between;">
                        <b>📦 Собрать: ${q.target}</b>
                        ${q.completed ? '<b style="color:var(--green)">✅ ГОТОВО</b>' : ''}
                    </div>
                    <div style="margin:8px 0;">
                        <small style="color:var(--gray)">Прогресс: ${q.progress} / ${q.goal}</small>
                        <div class="hp-bar" style="height:12px; background:rgba(255,255,255,0.1); border-radius:6px; overflow:hidden; margin-top:4px;">
                            <div class="hp-fill" style="width:${prog}%; height:100%; background:linear-gradient(90deg, var(--accent), #ffaa00); transition:width 0.3s;"></div>
                        </div>
                    </div>
                    ${!q.completed ? `<div style="display:flex; justify-content:space-between; align-items:center;">
                        <small style="color:var(--gray)">Награда:</small>
                        <b style="color:var(--yellow)">${q.reward.toLocaleString()} 💰 + ${Math.floor(q.goal * (1 + ({'Пшеница':1,'Картофель':2,'Морковь':3,'Тыква':4,'Арбуз':5,'Тростник':6}[q.target]-1)*0.1) * 3).toLocaleString()} Ферм. XP</b>
                    </div>` : ''}
                </div>
            `;
        });
        
        div.innerHTML = `
            <div style="padding:10px;">
                ${html}
                <button class="act-btn" style="width:100%; height:45px; margin-top:15px; background:var(--bg-secondary);" onclick="game.openFarmingMenu()">
                    ⬅️ НАЗАД К ГРЯДКАМ
                </button>
            </div>
        `;
    },
    async init() {
        this.playerTelegramId = tg.initDataUnsafe?.user?.id;
        if (!this.playerTelegramId) {
            this.msg('Запуск вне Telegram — тестовый режим');
        }
        await this.loadFromSupabase();
        // [ТЕСТ] Выдать 1 фрагмент в начале игры, если у игрока 0
        const frag = this.state.inventory?.find(i => i.name === 'Фрагмент из Данжа' && i.type === 'material');
        if (!frag || (frag.count || 0) < 1) {
            if (typeof this.addMaterial === 'function') {
                this.addMaterial('Фрагмент из Данжа', 'material', 1);
            }
        }
        if (typeof this.initMayor === 'function') await this.initMayor();
        if (typeof this.initGlobalMayor === 'function') await this.initGlobalMayor();
        if (typeof Altar !== 'undefined' && typeof Altar.init === 'function') await Altar.init();
        if (typeof Bank !== 'undefined' && typeof Bank.init === 'function') await Bank.init();
        if (typeof Casino !== 'undefined' && typeof Casino.init === 'function') await Casino.init();
        window.TG_IS_ADMIN = !!(this.playerTelegramId && window.ADMIN_TELEGRAM_IDS.includes(Number(this.playerTelegramId)));
        if (typeof DarkAuction !== 'undefined' && typeof DarkAuction.init === 'function') await DarkAuction.init();
        if (typeof Duel !== 'undefined' && typeof Duel.init === 'function') await Duel.init();
        if (typeof Ritual !== 'undefined' && typeof Ritual.init === 'function') await Ritual.init();
        setInterval(() => this.minionTick(), 1000);
        setInterval(() => this.saveToSupabase(), 10000);
        tg.expand?.();
    },

    msg(t) {
        if (this.messageQueue.includes(t)) return;
        this.messageQueue.push(t);
        try {
            tg.showAlert(t);
        } catch (e) {
            alert(t);
        }
        setTimeout(() => {
            this.messageQueue = this.messageQueue.filter(m => m !== t);
        }, 5000);
    },

    showCombatFeedback(text, kind = 'hit') {
        const container = document.getElementById('combat-feedback');
        if (!container) return;
        const div = document.createElement('div');
        div.className = `combat-float ${kind}`;
        div.textContent = text;
        container.appendChild(div);
        setTimeout(() => {
            try { div.remove(); } catch (e) {}
        }, 950);
    },

    calcStats(inDungeon = false) {
        let s = {...this.state.stats, xp_bonus: 0, gold_bonus: 0, dungeon_exp_bonus: 0, dungeon_damage: 0, vitality: this.state.stats.vitality || 0, boss_damage: 0, bow_str: 0, bow_fire: 0, arrow_save: 0, bow_cc: 0, bow_weapon_base: 0, bow_weapon_cc: 0, bow_weapon_cd: 0, ritual_mob_damage: 0, ritual_mob_def_bonus: 0};
        const mayorBonuses = typeof this.getMayorBonuses === 'function' ? this.getMayorBonuses() : {};
        const isDianaEvent = !!mayorBonuses.diana_event;
        this.state.inventory.forEach(i => {
            if (i.equipped) {
                const isBow = i.type === 'weapon' && i.ranged;
                ['str','def','cc','cd','mf','int','mag_amp','xp_bonus','gold_bonus','magic_res',
                 'mining_fortune','mining_exp_bonus','foraging_fortune','foraging_exp_bonus',
                 'farming_fortune','farming_exp_bonus','fishing_fortune','fishing_exp_bonus', 'hp', 'dungeon_exp_bonus', 'vitality'].forEach(st => {
                    if (isBow && st === 'str') return;
                    let addVal = i[st] || 0;
                    if (addVal && isDianaEvent && i.diana_scaled) addVal *= 2;
                    if (addVal) s[st] += addVal;
                });
                if (isDianaEvent && i.diana_mf_bonus) s.mf += i.diana_mf_bonus;
                if (i.ritual_mob_damage) s.ritual_mob_damage += i.ritual_mob_damage;
                if (i.ritual_mob_def_bonus) s.ritual_mob_def_bonus += i.ritual_mob_def_bonus;
                if (isBow) {
                    let bbs = i.bow_base_str;
                    if (bbs == null && i.str != null) bbs = i.str;
                    if (bbs) s.bow_weapon_base += bbs;
                    if (i.bow_base_cc) s.bow_weapon_cc += i.bow_base_cc;
                    if (i.bow_base_cd) s.bow_weapon_cd += i.bow_base_cd;
                }
                if (!isBow && i.dynamic_str === 'midas') s.str += Math.floor(Math.min(this.state.coins, 1000000000) / 1000000) * 0.5;
                if (i.enchantments) {
                    Object.entries(i.enchantments).forEach(([ench, tier]) => {
                        const enchData = window.enchantmentConfig?.[ench];
                        if (enchData && enchData.stats[tier - 1]) {
                            Object.entries(enchData.stats[tier - 1]).forEach(([stat, val]) => {
                                if (s[stat] !== undefined) s[stat] += val;
                            });
                        }
                    });
                }
                if (i.reforge && i.reforge.bonuses) {
                    Object.entries(i.reforge.bonuses).forEach(([stat, val]) => {
                        if (s[stat] !== undefined) s[stat] += val;
                        else s[stat] = val;
                    });
                }
            }
        });
        const buffs = this.state.buffs || {};
    const godEnd = buffs.godpotion?.endTime || 0;
    const cookieEnd = buffs.cookie?.endTime || 0;

    if (Date.now() < godEnd) {
        s.str += 5; s.cc += 5; s.cd += 5; s.mf += 10; s.def += 5; s.int += 5; s.mag_amp += 5;
        s.mining_fortune += 5; s.farming_fortune += 5; s.foraging_fortune += 5; s.fishing_fortune += 5;
        s.xp_bonus += 1; s.magic_res += 5; s.vitality += 1;
    }

    if (Date.now() < cookieEnd) {
        s.str += 50; s.cc += 10; s.cd += 25; s.mf += 25; s.def += 50; s.int += 50; s.mag_amp += 5;
        s.mining_fortune += 25; s.farming_fortune += 25; s.foraging_fortune += 25; s.fishing_fortune += 25;
        s.xp_bonus += 3; s.magic_res += 5; s.gold_bonus += 25; s.vitality += 2;
    }

    // Gramota bonus (пассивный бонус к статам)
    const gramotaItems = this.state.inventory.filter(i => i.gramota || (i.name && i.name.startsWith('Грамота')));
    if (gramotaItems.length) {
        const bestGramota = gramotaItems.reduce((best, item) => {
            const bestIdx = gramotaRarityOrder.indexOf(best?.rarity);
            const itemIdx = gramotaRarityOrder.indexOf(item?.rarity);
            return itemIdx > bestIdx ? item : best;
        }, gramotaItems[0]);
        const bonusPercent = gramotaBonusByRarity[bestGramota.rarity] || 0;
        if (bonusPercent > 0) {
            Object.keys(s).forEach(stat => {
                if (typeof s[stat] === 'number') s[stat] += s[stat] * (bonusPercent / 100);
            });
        }
    }

        // Tiger Stats
        const tiger = this.state.pets.find(p => p.equipped && p.name === 'Тигр');
        if (tiger) {
            const lvl = tiger.lvl || 1;
            // Common: 1 (1) -> 20 (100)
            let strBase = 1;
            let strMax = 20;
            let cdBase = 0;
            let cdMax = 0;

            if (tiger.rarity === 'rare') {
                 // Rare: 1 (1) -> 25 (100)
                 strMax = 25;
            } else if (tiger.rarity === 'epic') {
                 // Epic: 1 (1) -> 30 (100). CD: 1 (1) -> 20 (100)
                 // User said "1 lvl - 1 str, crit dmg 1. 100 lvl - 30 str, crit dmg 20"
                 strMax = 30;
                 cdBase = 1;
                 cdMax = 20;
            } else if (tiger.rarity === 'legendary') {
                 // Leg: 1 (1) -> 40 (100). CD: 2 (1) -> 75 (100)
                 strMax = 40;
                 cdBase = 2;
                 cdMax = 75;
            }
            
            // Linear interpolation
            const strBonus = strBase + (strMax - strBase) * ((lvl - 1) / 99);
            s.str += Math.floor(strBonus);

            if (cdMax > 0) {
                 const cdBonus = cdBase + (cdMax - cdBase) * ((lvl - 1) / 99);
                 s.cd += Math.floor(cdBonus);
            }
        }

        // Pig Stats
        const pig = this.state.pets.find(p => p.equipped && p.name === 'Pig');
        if (pig) {
            const lvl = pig.lvl || 1;
            // Common: 1 (1) -> 20 (100) -> 0.2 per level (approx)
            // Rare: 40 (100) -> 0.4 per level
            // Epic: 60 (100) -> 0.6 per level
            // Legendary: 100 (100) -> 1.0 per level
            
            let fortuneMax = 20;
            if (pig.rarity === 'rare') fortuneMax = 40;
            if (pig.rarity === 'epic') fortuneMax = 60;
            if (pig.rarity === 'legendary') fortuneMax = 100;
            
            const fortune = 1 + (fortuneMax - 1) * ((lvl - 1) / 99);
            s.farming_fortune += Math.floor(fortune);
        }
        
        s.farming_fortune += (this.state.farmingTalents?.fortune?.lvl || 0) * 3;
        s.farming_exp_bonus += (this.state.farmingTalents?.exp?.lvl || 0) * 0.5;

        s.foraging_fortune += (this.state.foragingTalents?.fortune?.lvl || 0) * 3;
        s.foraging_exp_bonus += (this.state.foragingTalents?.exp?.lvl || 0) * 0.5;

        const beaver = this.state.pets.find(p => p.equipped && p.name === 'Бобёр');
        if (beaver) {
            const lvl = beaver.lvl || 1;
            let fortuneMax = 20;
            if (beaver.rarity === 'rare') fortuneMax = 40;
            if (beaver.rarity === 'epic') fortuneMax = 60;
            if (beaver.rarity === 'legendary') fortuneMax = 100;
            const fortune = 1 + (fortuneMax - 1) * ((lvl - 1) / 99);
            s.foraging_fortune += Math.floor(fortune);
        }

        const dolphin = this.state.pets.find(p => p.equipped && p.name === 'Дельфин');
        if (dolphin) {
            const lvl = dolphin.lvl || 1;
            let fortuneMax = 20;
            if (dolphin.rarity === 'rare') fortuneMax = 40;
            if (dolphin.rarity === 'epic') fortuneMax = 60;
            if (dolphin.rarity === 'legendary') fortuneMax = 100;
            const fortune = 1 + (fortuneMax - 1) * ((lvl - 1) / 99);
            s.fishing_fortune += Math.floor(fortune);
        }

        const turtle = this.state.pets.find(p => p.equipped && p.name === 'Черепаха');
        if (turtle) {
            const lvl = turtle.lvl || 1;
            let defMax = 15;
            if (turtle.rarity === 'rare') defMax = 30;
            if (turtle.rarity === 'epic') defMax = 50;
            if (turtle.rarity === 'legendary') defMax = 80;
            const def = 1 + (defMax - 1) * ((lvl - 1) / 99);
            s.def += Math.floor(def);
            s.fishing_fortune += Math.floor(def * 0.5);
        }

        const ghoul = this.state.pets.find(p => p.equipped && p.name === 'Гуль');
        if (ghoul) {
            const lvl = ghoul.lvl || 1;
            let vitMin = 0.01, vitMax = 2;
            if (ghoul.rarity === 'rare') { vitMin = 0.02; vitMax = 4; }
            if (ghoul.rarity === 'epic') { vitMin = 0.03; vitMax = 6; }
            if (ghoul.rarity === 'legendary') { vitMin = 0.04; vitMax = 8; }
            const vit = vitMin + (vitMax - vitMin) * ((lvl - 1) / 99);
            s.vitality += parseFloat(vit.toFixed(2));
            if (ghoul.rarity === 'legendary') {
                const zDmgMin = 1, zDmgMax = 40;
                const zDmg = zDmgMin + (zDmgMax - zDmgMin) * ((lvl - 1) / 99);
                s.str += Math.floor(zDmg);
            }
        }

        const zombiePet = this.state.pets.find(p => p.equipped && p.name === 'Зомби');
        if (zombiePet) {
            const lvl = zombiePet.lvl || 1;
            let strMax = 5, defMax = 5;
            if (zombiePet.rarity === 'rare') { strMax = 10; defMax = 10; }
            if (zombiePet.rarity === 'epic') { strMax = 20; defMax = 20; }
            if (zombiePet.rarity === 'legendary') { strMax = 35; defMax = 30; }
            const strB = 1 + (strMax - 1) * ((lvl - 1) / 99);
            const defB = 1 + (defMax - 1) * ((lvl - 1) / 99);
            s.str += Math.floor(strB);
            s.def += Math.floor(defB);
        }
        const griffon = this.state.pets.find(p => p.equipped && p.name === 'Гриффон');
        if (griffon) {
            const byR = {
                common: { str: 10, mf: 5, cd: 5 },
                uncommon: { str: 20, mf: 10, cd: 7.5 },
                rare: { str: 30, mf: 15, cd: 10 },
                epic: { str: 40, mf: 20, cd: 12.5 },
                legendary: { str: 50, mf: 25, cd: 15 }
            };
            const g = byR[griffon.rarity] || byR.common;
            s.str += g.str;
            s.cd += g.cd;
            let gMf = g.mf;
            if (isDianaEvent && griffon.rarity === 'legendary') gMf *= 2;
            s.mf += gMf;
        }

        s.def += 2 * (this.state.skills.mining.lvl - 1);
        s.hp += 2 * (this.state.skills.farming.lvl - 1);
        s.str += 2 * (this.state.skills.foraging.lvl - 1);
        s.hp += 1 * (this.state.skills.fishing.lvl - 1);
        s.int += 1 * (this.state.skills.fishing.lvl - 1);
        s.str += 2 * (this.state.skills.combat.lvl - 1);
        s.cd += 2 * (this.state.skills.combat.lvl - 1);
        s.int += 2 * ((this.state.skills.enchanting?.lvl || 1) - 1);

        const slayerZomb = this.state.slayer?.zombie;
        if (slayerZomb && slayerZomb.lvl > 1) {
            s.mf += (slayerZomb.lvl - 1) * 1.5;
            s.vitality += (slayerZomb.lvl - 1) * 0.5;
        }

        // ПРОФЕССИОНАЛЬНЫЕ БОНУСЫ ОТ УРОВНЯ (возвращаем как было)
        s.mining_fortune += 3 * (this.state.skills.mining.lvl - 1);
        s.farming_fortune += 3 * (this.state.skills.farming.lvl - 1);
        s.foraging_fortune += 3 * (this.state.skills.foraging.lvl - 1);
        s.fishing_fortune += 3 * (this.state.skills.fishing.lvl - 1);  // ← вот он, вернулся
        s.mining_exp_bonus += 0.5 * (this.state.skills.mining.lvl - 1);
        s.farming_exp_bonus += 0.5 * (this.state.skills.farming.lvl - 1);
        s.foraging_exp_bonus += 0.5 * (this.state.skills.foraging.lvl - 1);
        s.fishing_exp_bonus += 0.5 * (this.state.skills.fishing.lvl - 1);

        if (typeof this.getMayorBonuses === 'function') {
           const globalMb = typeof this.getGlobalMayorBonuses === 'function' ? this.getGlobalMayorBonuses() : {};
            if (globalMb.mf_bonus) s.mf += globalMb.mf_bonus;
            if (globalMb.gold_bonus) s.goldbonus += globalMb.gold_bonus;
            if (globalMb.dungeon_xp_bonus) s.dungeonexpbonus += globalMb.dungeon_xp_bonus;
            if (globalMb.dungeon_dmg_bonus) s.dungeondamage += globalMb.dungeon_dmg_bonus;
            if (globalMb.craft_xp_bonus) s.xpbonus += globalMb.craft_xp_bonus;
            
            // Локальные бонусы мэра (если есть)
            const localMb = typeof this.getMayorBonuses === 'function' ? this.getMayorBonuses() : {};
            if (localMb.mf_bonus) s.mf += localMb.mf_bonus;
            if (localMb.gold_bonus) s.goldbonus += localMb.gold_bonus;
        }

        const mayorPet = this.state.pets?.find(p => p.mayorPet && p.equipped);
        if (mayorPet) {
            const rarityBonus = window.petRarityBonuses?.[mayorPet.rarity] || 0.1;
            s.xp_bonus += 5 * rarityBonus * (mayorPet.lvl || 1) / 10;
        }

        return s;
    },

    calcPetBonus(skillKey) {
        let bonus = 0;
        this.state.pets.forEach(pet => {
            if (pet.equipped && pet.skill === skillKey) {
                const rarityMul = petRarityBonuses[pet.rarity];
                bonus += rarityMul * pet.lvl;
            }
        });
        return bonus;
    },

    updateUI() {
        const s = this.calcStats(false);
        document.getElementById('coins-val').innerText = Math.floor(this.state.coins).toLocaleString();
        document.getElementById('m-coins-val').innerText = Math.floor(this.state.coins).toLocaleString();
        const e = Math.floor(this.state.emeralds || 0).toLocaleString();
        const e1 = document.getElementById('emeralds-val');
        const e2 = document.getElementById('m-emeralds-val');
        if (e1) e1.innerText = e;
        if (e2) e2.innerText = e;
        
        // Расчет SkyBlock уровня
        const sbSkill = this.state.skills.skyblock || { lvl: 0, xp: 0 };
        document.getElementById('sb-lvl').innerText = (sbSkill.lvl + sbSkill.xp).toFixed(2);
        document.getElementById('stats-display').innerHTML = `
            <div class="stat-row">
                <span class="stat-label">❤️ ЗДОРОВЬЕ</span> <span class="stat-val">${Math.floor(s.hp || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">⚔️ СИЛА</span> <span class="stat-val">${Math.floor(s.str || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🛡️ БРОНЯ</span> <span class="stat-val">${Math.floor(s.def || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">💥 КРИТ ШАНС</span> <span class="stat-val">${Math.floor(s.cc || 0)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🔥 КРИТ УРОН</span> <span class="stat-val">${Math.floor(s.cd || 0)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🍀 УДАЧА</span> <span class="stat-val">${Math.floor(s.mf || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🧠 ИНТЕЛЛЕКТ</span> <span class="stat-val">${Math.floor(s.int || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🔮 МАГ УСИЛЕНИЕ</span> <span class="stat-val">${Math.floor(s.mag_amp || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🛡️ МАГ ЗАЩИТА</span> <span class="stat-val">${Math.floor(s.magic_res || 0)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">💚 ВОССТАНОВЛЕНИЕ</span> <span class="stat-val">${(s.vitality || 0).toFixed(1)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">⛏️ МАЙНИНГ ФОРТУНА</span> <span class="stat-val">${Math.floor(s.mining_fortune || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">⛏️ МАЙНИНГ ОПЫТ</span> <span class="stat-val">${(s.mining_exp_bonus || 0).toFixed(1)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🌲 ЛЕСНАЯ ФОРТУНА</span> <span class="stat-val">${Math.floor(s.foraging_fortune || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🌲 ЛЕСНОЙ ОПЫТ</span> <span class="stat-val">${(s.foraging_exp_bonus || 0).toFixed(1)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🌾 ФАРМИНГ ФОРТУНА</span> <span class="stat-val">${Math.floor(s.farming_fortune || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🌾 ФАРМИНГ ОПЫТ</span> <span class="stat-val">${(s.farming_exp_bonus || 0).toFixed(1)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🎣 ФИШИНГ ФОРТУНА</span> <span class="stat-val">${Math.floor(s.fishing_fortune || 0)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">🎣 ФИШИНГ ОПЫТ</span> <span class="stat-val">${(s.fishing_exp_bonus || 0).toFixed(1)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">💀 ДАНЖ ОПЫТ</span> <span class="stat-val">${(s.dungeon_exp_bonus || 0).toFixed(1)}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">💰 ГОЛД БОНУС</span> <span class="stat-val">${(s.gold_bonus || 0)}%</span>
            </div>
        `;
        const equippedPet = this.state.pets.find(p => p.equipped);
        let petHtml = '';
        if (equippedPet) {
            const rarityColor = {
                common: '#aaaaaa',
                rare: '#7aa0ff',
                epic: '#ae70ff',
                legendary: '#ffbd38'
            }[equippedPet.rarity] || '#ffffff';
            const progress = (equippedPet.xp / equippedPet.next * 100).toFixed(1);
            petHtml = `
                <div class="pet-row" style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;">
                    <div style="color:${rarityColor};font-weight:bold;">
                        ${equippedPet.rarity.toUpperCase()} ${equippedPet.name} LVL ${equippedPet.lvl}
                    </div>
                    <div class="hp-bar" style="margin:5px 0;">
                        <div class="hp-fill" style="width:${progress}%;background:${rarityColor}"></div>
                    </div>
                    <small style="color:#0f0">+${(petRarityBonuses[equippedPet.rarity] * equippedPet.lvl).toFixed(1)}% XP</small>
                </div>
            `;
        }
        document.getElementById('stats-display').innerHTML += petHtml;
        if (typeof this.updateGlobalMayorBuffDisplay === 'function') this.updateGlobalMayorBuffDisplay();
        if (typeof this.updateMayorBuffDisplay === 'function') this.updateMayorBuffDisplay(); 
        this.renderMinions();
        if (typeof this.renderInvList === 'function') {
            this.renderInvList(this.lastFilter || 'weapon');
        }
        if (document.getElementById('shop')?.classList.contains('active') && typeof this.renderShopList === 'function') {
            this.renderShopList(this.lastShopFilter);
        }
        if (document.getElementById('pen')?.classList.contains('active') && typeof this.renderPenList === 'function') {
            this.renderPenList();
        }
        if (document.getElementById('skillsModal').style.display === 'block') this.showModal('skillsModal');
        document.getElementById('class-select').value = this.state.class;
        if (typeof DarkAuction !== 'undefined' && DarkAuction.updatePortalVisibility) DarkAuction.updatePortalVisibility();
        if (typeof Duel !== 'undefined' && Duel.updatePortalVisibility) Duel.updatePortalVisibility();
        if (typeof Ritual !== 'undefined' && Ritual.updatePortalVisibility) Ritual.updatePortalVisibility();
        this.saveToSupabase();
    },

    getSkyblockLevel() {
        const sb = this.state.skills?.skyblock;
        if (!sb) return 0;
        return Math.floor((sb.lvl || 0) + (sb.xp || 0));
    },

    isSkyblockRewardClaimed(level) {
        const claimed = this.state.skills?.skyblock?.claimedRewards || [];
        return claimed.includes(level);
    },

    canClaimSkyblockReward(level) {
        return this.getSkyblockLevel() >= level && !this.isSkyblockRewardClaimed(level);
    },

    _applyGramotaReward(item) {
        const existing = this.state.inventory.find(i => i.gramota || (i.name && i.name.startsWith('Грамота')));
        if (!existing) {
            this.addMaterial(item.name, item.type, 1, item);
            return;
        }
        const currentIdx = gramotaRarityOrder.indexOf(existing.rarity);
        const newIdx = gramotaRarityOrder.indexOf(item.rarity);
        if (newIdx > currentIdx) {
            existing.rarity = item.rarity;
            existing.name = item.name;
            existing.gramotaLevel = item.gramotaLevel;
            existing.gramota = true;
            this.msg(`Ваша грамота улучшена до ${item.name}!`);
        } else {
            this.msg('У вас уже есть такая или лучшая грамота.');
        }
    },

    claimSkyblockReward(level) {
        if (!this.canClaimSkyblockReward(level)) return;
        const reward = skyblockRewardTable[level];
        if (!reward) return;

        this.state.skills.skyblock.claimedRewards = this.state.skills.skyblock.claimedRewards || [];
        this.state.skills.skyblock.claimedRewards.push(level);

        if (reward.coins) {
            this.state.coins += reward.coins;
        }
        if (reward.items) {
            reward.items.forEach(item => {
                const count = item.count || 1;
                if (item.gramota) {
                    this._applyGramotaReward(item);
                } else {
                    this.addMaterial(item.name, item.type, count, item);
                }
            });
        }

        this.msg(`Получена награда SkyBlock: ${reward.title}`);
        this.renderSkyblockRewards();
        this.updateUI();
    },

    openSkyblockRewards() {
        this.renderSkyblockRewards();
        this.showModal('skyblockRewardsModal');
    },

    renderSkyblockRewards() {
        const current = this.getSkyblockLevel();
        const claimed = this.state.skills?.skyblock?.claimedRewards || [];
        let html = `<div style="text-align:center;padding-bottom:10px;">Уровень SkyBlock: <b>${current}</b></div>`;
        html += '<div style="display:flex;flex-direction:column;gap:10px;">';
        Object.keys(skyblockRewardTable).sort((a,b)=>a-b).forEach(key => {
            const level = parseInt(key, 10);
            const r = skyblockRewardTable[level];
            const already = claimed.includes(level);
            const canClaim = current >= level && !already;
            html += `<div class="card" style="border-left:4px solid ${canClaim ? 'var(--green)' : already ? 'var(--gray)' : 'var(--accent)'};">`;
            html += `<div style="display:flex;justify-content:space-between;align-items:center;"><b>${r.title}</b><span style="font-size:0.8rem;color:var(--gray);">LVL ${level}</span></div>`;
            html += `<small style="color:var(--gray)">${r.desc}</small><br/>`;
            if (r.coins) html += `<small style="color:var(--yellow)">+${r.coins.toLocaleString()}💰</small><br/>`;
            if (r.items && r.items.length) {
                html += `<small style="color:var(--green)">`; 
                html += r.items.map(i => `${i.count||1}× ${i.name}`).join(', ');
                html += `</small><br/>`;
            }
            if (already) {
                html += `<div style="text-align:center;color:var(--green);font-weight:bold;margin-top:6px;">ПОЛУЧЕНО</div>`;
            } else if (canClaim) {
                html += `<div class="item-actions"><button class="act-btn" onclick="game.claimSkyblockReward(${level})">ЗАБРАТЬ</button></div>`;
            } else {
                html += `<div style="text-align:center;color:var(--gray);margin-top:6px;">Требуется уровень ${level}</div>`;
            }
            html += `</div>`;
        });
        html += '</div>';
        document.getElementById('skyblockRewardsContent').innerHTML = html;
    },

    renderPenList() {
        // Deprecated
    },

    toggleEquipPet(idx) {
        const pet = this.state.pets[idx];
        if (this.ritualState?.active && this.ritualState?.lockedPetName && pet.name !== this.ritualState.lockedPetName) {
            this.msg(`Во время ритуала нельзя сменить питомца (${this.ritualState.lockedPetName}).`);
            return;
        }
        if (pet.equipped) {
            pet.equipped = false;
        } else {
            this.state.pets.forEach(p => {
                if (p.skill === pet.skill) p.equipped = false;
            });
            pet.equipped = true;
        }
        this.msg(pet.equipped ? `${pet.name} надет!` : `${pet.name} снят.`);
        this.updateUI();
    },

    upgradePet(idx) {
        const pet = this.state.pets[idx];
        const nextRarity = {common:'rare', rare:'epic', epic:'legendary'}[pet.rarity];
        if (!nextRarity) { this.msg('Уже максимальная редкость!'); return; }
        if (pet.name === 'Гриффон') {
            const costs = {
                rare: [{n:'Griffin Feather',c:8},{n:'Золото',c:16},{n:'Булыжник',c:8}],
                epic: [{n:'Griffin Feather',c:8},{n:'Ancient Claw',c:32},{n:'Золото',c:48}],
                legendary: [{n:'Griffin Feather',c:16},{n:'Ancient Claw',c:64},{n:'Золото',c:128}],
                mythic: [{n:'Griffin Feather',c:64},{n:'Ancient Claw',c:128},{n:'Золото',c:256}]
            };
            const step = { common:'uncommon', uncommon:'rare', rare:'epic', epic:'legendary' }[pet.rarity];
            const req = costs[step] || costs[nextRarity];
            if (!req) { this.msg('Уже максимальная редкость!'); return; }
            const missing = req.filter(x => !this._hasMaterial(x.n, x.c));
            if (missing.length) {
                this.msg(`Не хватает: ${missing.map(x => `${x.c} ${x.n}`).join(', ')}`);
                return;
            }
            req.forEach(x => this._consumeMaterial(x.n, x.c));
            pet.rarity = step;
            this.msg(`Гриффон улучшен до ${step.toUpperCase()}!`);
            this.updateUI();
            return;
        }
        const petOverrides = {
            'Гуль': { rare: {coins:0, resources:64, resName:'Плоть зомби'}, epic: {coins:500000, resources:256, resName:'Плоть зомби'}, legendary: {coins:10000000, resources:4, resName:'Живая плоть', upgradeItem:1} },
            'Зомби': { rare: {coins:0, resources:64, resName:'Плоть зомби'}, epic: {coins:250000, resources:128, resName:'Плоть зомби'}, legendary: {coins:5000000, resources:2, resName:'Живая плоть', upgradeItem:1} }
        };
        const override = petOverrides[pet.name]?.[nextRarity];
        const cost = override || petUpgradeCosts[nextRarity];
        const resourceName = override?.resName || petResourceMap[pet.skill];
        const resourceItem = this.state.inventory.find(i => i.name === resourceName && i.type === 'material');
        const resourceCount = resourceItem ? resourceItem.count || 0 : 0;
        const upgradeItem = this.state.inventory.find(i => i.name === 'Апгрейд питомца' && i.type === 'material');
        const upgradeCount = upgradeItem ? upgradeItem.count || 0 : 0;
        if (this.state.coins < cost.coins || resourceCount < cost.resources || (cost.upgradeItem && upgradeCount < cost.upgradeItem)) {
            let missing = [];
            if (this.state.coins < cost.coins) missing.push(`${(cost.coins - this.state.coins).toLocaleString()} монет`);
            if (resourceCount < cost.resources) missing.push(`${cost.resources - resourceCount} ${resourceName}`);
            if (cost.upgradeItem && upgradeCount < cost.upgradeItem) missing.push(`${cost.upgradeItem - upgradeCount} Апгрейд питомца`);
            
            this.msg(`Не хватает: ${missing.join(', ')}`);
            return;
        }
        this.state.coins -= cost.coins;
        if (resourceItem) {
            resourceItem.count -= cost.resources;
            if (resourceItem.count <= 0) this.state.inventory = this.state.inventory.filter(i => i.id !== resourceItem.id);
        }
        if (cost.upgradeItem && upgradeItem) {
            upgradeItem.count -= cost.upgradeItem;
            if (upgradeItem.count <= 0) this.state.inventory = this.state.inventory.filter(i => i.id !== upgradeItem.id);
        }
        pet.rarity = nextRarity;
        this.msg(`Питомец улучшен до ${nextRarity.toUpperCase()}!`);
        this.updateUI();
    },

    getPetSellPrice(pet) {
        const specialPrices = {
            'Гуль': { common: 50000, rare: 200000, epic: 1000000, legendary: 15000000 }
        };
        if (specialPrices[pet.name]) return specialPrices[pet.name][pet.rarity] || Math.floor(pet.cost / 2);
        return Math.floor(pet.cost / 2);
    },

    sellPet(idx) {
        const pet = this.state.pets[idx];
        const price = this.getPetSellPrice(pet);
        this.state.coins += price;
        this.state.pets.splice(idx, 1);
        this.msg(`${pet.name} продан! +${price.toLocaleString()} 💰`);
        this.updateUI();
    },

    finishAction() {
        if (this.currentLoc === 'farm' && typeof this.processFarmingAction === 'function' && (this.state.currentCrop || this.state.stats?.currentCrop)) {
            if (!this.state.currentCrop) this.state.currentCrop = this.state.stats.currentCrop;
            this.processFarmingAction();
            return;
        }

        if (this.currentLoc === 'mine' && typeof this.processMiningAction === 'function') {
            this.processMiningAction();
            return;
        }

        if (this.currentLoc === 'forage' && typeof this.processForagingAction === 'function' && this.currentForagingIsland) {
            this.processForagingAction();
            return;
        }

        if (this.currentLoc === 'fish' && typeof this.processFishingAction === 'function') {
            this.processFishingAction();
            return;
        }

        const map = {mine:'mining',farm:'farming',fish:'fishing',forage:'foraging',combat:'combat'};
        const skillKey = map[this.currentLoc];
        const skill = this.state.skills[skillKey];
        const s = this.calcStats(false);
        const goldMul = 1 + (s.gold_bonus || 0) / 100;
        const gain = Math.floor(15 * skill.lvl * goldMul);
        this.state.coins += gain;

        const base_xp = 20;
        let exp_bonus = 0;
        let fortune = 0;
        let amount = 1;

        if (this.currentLoc === 'mine') {
            exp_bonus = s.mining_exp_bonus || 0;
            fortune = s.mining_fortune || 0;
        } else if (this.currentLoc === 'farm') {
            exp_bonus = s.farming_exp_bonus || 0;
            fortune = s.farming_fortune || 0;
        } else if (this.currentLoc === 'fish') {
            exp_bonus = s.fishing_exp_bonus || 0;
            fortune = s.fishing_fortune || 0;  // ← теперь фортуна рыбалки
        } else if (this.currentLoc === 'forage') {
            exp_bonus = s.foraging_exp_bonus || 0;
            fortune = s.foraging_fortune || 0;
        }
        let petXpBonus = 0;

        const pet = this.state.pets.find(p => p.equipped && p.skill === skillKey);
        if (pet) {
            const rarityMul = petRarityBonuses[pet.rarity] || 0;
          petXpBonus = rarityMul * pet.lvl; // в процентах
        }

        const total_xp = base_xp * (1 + (exp_bonus + petXpBonus) / 100);



        const mat = {mine:'Уголь',farm:'Пшеница',fish:'Рыба',forage:'Дерево'}[this.currentLoc];

        const guaranteed = Math.floor(fortune / 100);
        amount = guaranteed + 1;
        const chance = fortune % 100;
        if (Math.random() * 100 < chance) amount++;

        const equippedTool = this.state.inventory.find(i => i.equipped && i.type === 'tool' && i.sub_type);
        if (equippedTool) {
            if (equippedTool.triple_chance && Math.random() * 100 < equippedTool.triple_chance) amount *= 3;
            else if (equippedTool.double_chance && Math.random() * 100 < equippedTool.double_chance) amount *= 2;
        }

        for (let i = 0; i < amount; i++) this.addMaterial(mat);

        const final_xp = total_xp * amount;
        this.addXp(skillKey, final_xp);

        if (pet) {
        const petXp = final_xp * 0.5;
        this.addPetXp(pet, petXp);
        }
        document.getElementById('loc-log').innerText = `+${gain} 💰 | +${final_xp.toFixed(1)} XP | +${amount} ${mat}`;
        this.updateUI();
    },
addPetXp(pet, amount) {
    const mb = typeof this.getMayorBonuses === 'function' ? this.getMayorBonuses() : {};
    const petXpMul = 1 + (mb.pet_xp_bonus || 0) / 100;
    pet.xp += amount * petXpMul;
    while (pet.xp >= pet.next && pet.lvl < 100) {
        pet.xp -= pet.next;
        pet.lvl++;
        pet.next = Math.floor(pet.next * 1.15);
    }
},      
    upgradeSwordInShop() {
        const swordProgression = ['Старый меч', 'Каменный меч', 'Железный Меч', 'Алмазный Меч', 'Незеритовый Меч', 'Меч первопроходца'];
        const currentSword = this.state.inventory.find(i => i.type === 'weapon' && swordProgression.includes(i.name));
        if (!currentSword) return;

        const currentIdx = swordProgression.indexOf(currentSword.name);
        if (currentIdx === -1 || currentIdx >= swordProgression.length - 1) return;

        const nextSword = shopItems.weapon.find(w => w.name === swordProgression[currentIdx + 1]);
        if (!nextSword) return;

        if (this.state.coins < nextSword.cost) {
            this.msg(`Недостаточно монет! Нужно ${nextSword.cost.toLocaleString()} 💰`);
            return;
        }

        this.state.coins -= nextSword.cost;
        currentSword.name = nextSword.name;
        currentSword.str = nextSword.str;
        if (nextSword.rarity) currentSword.rarity = nextSword.rarity;
        this.msg(`Меч улучшен до: ${currentSword.name}!`);
        this.updateUI();
    },

    applyBowShopDefToItem(item, def) {
        item.name = def.name;
        item.type = 'weapon';
        item.ranged = true;
        item.bow_base_str = def.bow_base_str;
        if (def.bow_base_cc != null) item.bow_base_cc = def.bow_base_cc;
        else delete item.bow_base_cc;
        if (def.bow_base_cd != null) item.bow_base_cd = def.bow_base_cd;
        else delete item.bow_base_cd;
        delete item.str;
        item.rarity = def.rarity;
        if (def.desc) item.desc = def.desc;
    },

    purchaseBowProgression() {
        const defs = BOW_PROGRESSION_DEFS;
        const progNames = defs.map(b => b.name);
        const owned = this.state.inventory.find(i => i.type === 'weapon' && i.ranged && progNames.includes(i.name));
        let cost = 0;
        let targetDef = null;
        if (!owned) {
            targetDef = defs[0];
            cost = targetDef.cost;
        } else {
            const idx = progNames.indexOf(owned.name);
            if (idx < 0 || idx >= defs.length - 1) {
                this.msg('Лук уже максимального тира!');
                return;
            }
            targetDef = defs[idx + 1];
            cost = targetDef.cost;
        }
        let finalCost = cost;
        if (typeof this.getMayorBonuses === 'function') {
            const mb = this.getMayorBonuses();
            if (mb.shop_discount) finalCost = Math.floor(finalCost * (1 - mb.shop_discount / 100));
        }
        if (this.state.coins < finalCost) {
            this.msg(`Не хватает монет! Нужно ${finalCost.toLocaleString()} 💰`);
            return;
        }
        this.state.coins -= finalCost;
        if (!owned) {
            const newItem = {
                id: this.state.nextItemId++,
                type: 'weapon',
                count: 1,
                equipped: false
            };
            this.applyBowShopDefToItem(newItem, targetDef);
            this.state.inventory.push(newItem);
            this.msg(`${targetDef.name} куплен!`);
        } else {
            this.applyBowShopDefToItem(owned, targetDef);
            this.msg(`Лук улучшен до: ${targetDef.name}!`);
        }
        this.updateUI();
    },

    buyLongBowFromShop() {
        const def = LONG_BOW_SHOP_DEF;
        if (this.state.inventory.some(i => i.name === def.name && i.type === 'weapon')) {
            this.msg('Длинный лук уже куплен!');
            return;
        }
        let finalCost = def.cost;
        if (typeof this.getMayorBonuses === 'function') {
            const mb = this.getMayorBonuses();
            if (mb.shop_discount) finalCost = Math.floor(finalCost * (1 - mb.shop_discount / 100));
        }
        if (this.state.coins < finalCost) {
            this.msg(`Не хватает монет! Нужно ${finalCost.toLocaleString()} 💰`);
            return;
        }
        this.state.coins -= finalCost;
        const newItem = { id: this.state.nextItemId++, type: 'weapon', count: 1, equipped: false };
        this.applyBowShopDefToItem(newItem, def);
        this.state.inventory.push(newItem);
        this.msg(`${def.name} куплен!`);
        this.updateUI();
    },

    getActiveArrowStack() {
        const ARROW_TYPES = window.ARROW_TYPES || {};
        const ALL = window.ALL_ARROW_NAMES || Object.keys(ARROW_TYPES);
        this.state.stats = this.state.stats || {};
        const selected = this.state.stats.selected_arrow_type;
        if (selected && ARROW_TYPES[selected]) {
            const stack = this.state.inventory.find(i => i.type === 'material' && i.name === selected && (i.count || 0) > 0);
            if (stack) return { stack, name: selected, meta: ARROW_TYPES[selected] };
        }
        let order = Array.isArray(this.state.stats.arrow_priority) ? [...this.state.stats.arrow_priority] : [...ALL];
        order = order.filter(n => ARROW_TYPES[n]);
        for (const n of ALL) {
            if (!order.includes(n)) order.push(n);
        }
        for (const name of order) {
            const stack = this.state.inventory.find(i => i.type === 'material' && i.name === name && (i.count || 0) > 0);
            if (stack) return { stack, name, meta: ARROW_TYPES[name] };
        }
        return null;
    },

    /** В данже: переключить активный тип стрелы (среди тех, что есть в инвентаре) */
    cycleDungeonArrow() {
        const ALL = window.ALL_ARROW_NAMES || [];
        const owned = ALL.filter(n => this.state.inventory.some(i => i.type === 'material' && i.name === n && (i.count || 0) > 0));
        if (owned.length === 0) {
            this.msg('Нет стрел в инвентаре.');
            return;
        }
        this.state.stats = this.state.stats || {};
        const cur = this.state.stats.selected_arrow_type;
        let ix = cur ? owned.indexOf(cur) : -1;
        ix = (ix + 1) % owned.length;
        this.state.stats.selected_arrow_type = owned[ix];
        this.msg(`Стрелы: ${owned[ix]}`);
        if (typeof this.updateBattleUI === 'function') this.updateBattleUI();
    },

    setSelectedArrowType(name) {
        if (!window.ARROW_TYPES || !window.ARROW_TYPES[name]) return;
        this.state.stats = this.state.stats || {};
        this.state.stats.selected_arrow_type = name;
        this.msg(`Для данжа выбраны: ${name}`);
        this.updateUI();
    },

    bumpArrowPriority(name, dir) {
        const ALL = window.ALL_ARROW_NAMES || [];
        if (!ALL.includes(name)) return;
        this.state.stats = this.state.stats || {};
        let arr = Array.isArray(this.state.stats.arrow_priority) ? [...this.state.stats.arrow_priority] : [...ALL];
        ALL.forEach(n => {
            if (!arr.includes(n)) arr.push(n);
        });
        const ix = arr.indexOf(name);
        if (ix < 0) return;
        const ni = ix + (dir < 0 ? -1 : 1);
        if (ni < 0 || ni >= arr.length) return;
        [arr[ix], arr[ni]] = [arr[ni], arr[ix]];
        this.state.stats.arrow_priority = arr;
        this.msg('Порядок приоритета стрел обновлён (если нет выбранного типа для данжа, берётся первый доступный по списку).');
        this.updateUI();
    },

    minionTick() {
        if (this.isBusy) return;
        const hasCookie = Date.now() < this.state.buffs.cookie.endTime;
        
        this.state.minions.forEach(m => {
            if (m.lvl > 0) {
                const config = minionConfig[m.lvl] || { storage: 32 };
                // Базовая скорость: 1 ресурс в минуту + 10% за уровень
                let speed = 1 + (m.lvl - 1) * 0.1; 
                if (hasCookie) speed *= 1.25;
                
                // Накапливаем ресурсы
                m.stored = Math.min(config.storage || 32, (m.stored || 0) + (speed / 60)); 
            }
        });
        // Обновляем UI только если открыта вкладка миньонов (оптимизация)
        if (document.getElementById('minions')?.classList.contains('active')) {
            this.renderMinions();
            // Обновляем кошелек миньонов... а, его больше нет, но текст остался
            const coinText = document.getElementById('m-coins-val');
            if(coinText) coinText.innerText = Math.floor(this.state.coins).toLocaleString();
        }
    },

    collectMinion(i) {
        const m = this.state.minions[i];
        if (!m || !m.stored || m.stored < 1) return;
        
        const count = Math.floor(m.stored);
        if (count <= 0) return;

        // Добавляем ресурс в инвентарь
        this.addMaterial(m.resource, 'material', count);
        
        m.stored -= count;
        this.msg(`Собрано: ${count} ${m.resource}`);
        this.updateUI();
    },

    upgradeMinion(id) {
        const m = this.state.minions.find(x => x.id === id);
        if (!m) return;
        const nextLvl = (m.lvl || 0) + 1;
        if (nextLvl > 15) { this.msg('Максимальный уровень!'); return; }
        
        const config = minionConfig[nextLvl];
        // Используем ресурс миньона или спец. ресурс из конфига (например, для 11+ уровней)
        const resName = config.resourceName || m.resource;
        
        const resItem = this.state.inventory.find(i => i.name === resName && i.type === 'material');
        const resCount = resItem ? resItem.count || 0 : 0;
        
        if (this.state.coins < config.cost) {
            this.msg(`Недостаточно монет! Нужно ${config.cost.toLocaleString()} 💰`);
            return;
        }
        
        // Проверяем ресурсы только если требуются
        if (config.resources > 0) {
            if (resCount < config.resources) {
                this.msg(`Недостаточно ресурсов! Нужно ${config.resources} ${resName} (у вас ${resCount})`);
                return;
            }
             // Списываем ресурсы
            if (resItem) {
                resItem.count -= config.resources;
                if (resItem.count <= 0) {
                    this.state.inventory = this.state.inventory.filter(i => i.id !== resItem.id);
                }
            }
        }
        
        this.state.coins -= config.cost;
        m.lvl = nextLvl;
        if (m.lvl === 1 && m.stored === undefined) m.stored = 0; 
        
        this.addXp('skyblock', 0.1);
        this.msg(`Миньон ${m.name} улучшен до ${nextLvl} уровня! (+0.1 SB LVL)`);
        this.updateUI();
    },

    filterMinions(cat) {
        this.lastMinionFilter = cat;
        this.renderMinions();
    },

    renderMinions() {
        const l = document.getElementById('minions-list');
        if (!l) return;
        
        const currentCat = this.lastMinionFilter || 'farming'; 
        
        const categories = [
            {id:'farming', label:'🌾 ФЕРМА'},
            {id:'mining', label:'⛏️ ШАХТА'},
            {id:'foraging', label:'🌲 ЛЕС'},
            {id:'fishing', label:'🎣 РЫБАЛКА'},
            {id:'combat', label:'⚔️ БОЙ'}
        ];

        let html = '';
        const mayorBonuses = typeof this.getMayorBonuses === 'function' ? this.getMayorBonuses() : {};
        if (mayorBonuses.auto_collect_minions) {
            const mayor = typeof this.getCurrentMayor === 'function' ? this.getCurrentMayor() : null;
            html += `<div class="card" style="border-color:${mayor?.color || 'var(--accent)'};text-align:center;padding:8px;">
                <small style="color:var(--green);font-weight:bold;">${mayor?.icon || ''} АВТОСБОР АКТИВЕН (${mayor?.name || 'МЭР'})</small>
            </div>`;
        }

        html += '<div class="inv-tabs">';
        categories.forEach(c => {
            const active = c.id === currentCat ? 'active' : '';
            html += `<div class="inv-tab ${active}" onclick="game.filterMinions('${c.id}')">${c.label}</div>`;
        });
        html += '</div>';

        // Фильтрация
        const list = this.state.minions.filter(m => m.category === currentCat);
        
        if (list.length === 0) {
            html += '<div class="card" style="text-align:center;color:#666">Нет миньонов в этой категории</div>';
        } else {
            list.forEach((m) => {
                // Ищем оригинальный индекс для actions
                const originalIdx = this.state.minions.findIndex(x => x.id === m.id);
                
                const lvl = m.lvl || 0;
                const nextLvl = lvl + 1;
                const config = minionConfig[lvl] || { storage: 32 };
                const nextConfig = minionConfig[nextLvl];
                
                if (lvl === 0) {
                    // ЗАБЛОКИРОВАН (нужно купить 1 уровень за ресурсы)
                    const resCost = minionConfig[1].resources;
                    html += `
                        <div class="card" style="opacity:0.8; border:1px dashed #555">
                            <div style="display:flex;justify-content:space-between">
                                <b>🔒 ${m.name}</b>
                                <small>Ресурс: ${m.resource}</small>
                            </div>
                            <div class="item-actions" style="margin-top:10px">
                                <button class="act-btn" onclick="game.upgradeMinion('${m.id}')">КУПИТЬ (${resCost} ${m.resource})</button>
                            </div>
                        </div>`;
                } else {
                    // РАЗБЛОКИРОВАН
                    let upgradeBtn = '';
                    if (nextConfig) {
                        const resName = nextConfig.resourceName || m.resource;
                        upgradeBtn = `<button class="act-btn" onclick="game.upgradeMinion('${m.id}')">АП (${nextLvl} LVL): ${nextConfig.cost.toLocaleString()}💰 + ${nextConfig.resources} ${resName}</button>`;
                    } else {
                         upgradeBtn = `<small style="color:var(--green); font-weight:bold">МАКС УРОВЕНЬ</small>`;
                    }

                    html += `
                        <div class="card">
                            <div style="display:flex;justify-content:space-between">
                                <b>${m.name} (LVL ${lvl})</b>
                                <span style="color:var(--accent)">${Math.floor(m.stored || 0)} / ${config.storage} шт.</span>
                            </div>
                            <small style="color:#888">Добывает: ${m.resource}</small>
                            <div class="item-actions">
                                <button class="act-btn" onclick="game.collectMinion(${originalIdx})">СОБРАТЬ</button>
                                ${upgradeBtn}
                            </div>
                        </div>`;
                }
            });
        }
        
        l.innerHTML = html;
    },

    shopFilter(t,e){
        document.querySelectorAll('#shop .inv-tab').forEach(x=>x.classList.remove('active'));
        e.classList.add('active');
        this.lastShopFilter=t;
        this.renderShopList(t);
    },

    _renderZombieItems(zombieType, l) {
        const zItems = shopItems[zombieType] || [];
        if (!zItems.length) return;
        const rarityColors = { uncommon: '#55ff55', rare: '#5555ff', epic: '#aa00aa', legendary: '#ffaa00' };
        const rarityNames = { uncommon: 'Необычное', rare: 'Редкое', epic: 'Эпик', legendary: 'Легендарное' };
        const slayerLvl = this.state.slayer?.zombie?.lvl || 1;
        const progression = zItems.map(z => z.name);
        const currentItem = this.state.inventory.find(inv => progression.includes(inv.name));
        let currentIdx = currentItem ? progression.indexOf(currentItem.name) : -1;
        let nextIdx = currentIdx + 1;
        l.innerHTML += `<div style="margin:12px 0 6px;padding:6px 10px;background:rgba(255,50,50,0.1);border-radius:6px;border-left:3px solid var(--red);"><b style="color:var(--red);">🧟 ЗОМБИ СЛЕЙЕР</b></div>`;
        if (nextIdx >= zItems.length) {
            const maxItem = zItems[zItems.length - 1];
            const color = rarityColors[maxItem.rarity] || '#fff';
            l.innerHTML += `<div class="card" style="border-left:4px solid ${color};opacity:0.6;border-color:var(--green);"><div style="display:flex;justify-content:space-between;align-items:center;"><b style="color:${color};">${maxItem.name}</b><span style="font-size:0.65rem;padding:2px 6px;border-radius:4px;background:${color}22;color:${color};border:1px solid ${color}44;">${rarityNames[maxItem.rarity]}</span></div><small style="color:#0f0;font-weight:bold">${this.getItemDesc(maxItem)}</small><div style="text-align:center;color:var(--green);margin-top:6px;font-weight:bold;">МАКСИМАЛЬНЫЙ УРОВЕНЬ</div></div>`;
            return;
        }
        const i = zItems[nextIdx];
        const color = rarityColors[i.rarity] || '#fff';
        const locked = i.slayer_req > 0 && slayerLvl < i.slayer_req;
        let costParts = [];
        if (i.flesh_cost) costParts.push(`${i.flesh_cost} Плоти зомби`);
        if (i.living_flesh_cost) costParts.push(`${i.living_flesh_cost} Живой плоти`);
        if (i.cost > 0) costParts.push(`${i.cost.toLocaleString()}💰`);
        const costText = costParts.join(' + ') || 'Бесплатно';
        const action = currentIdx >= 0 ? 'УЛУЧШИТЬ' : 'КУПИТЬ';
        let html = `<div class="card" style="border-left:4px solid ${color}; ${locked ? 'opacity:0.5;' : ''}">`;
        html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
        html += `<b style="color:${color};">${i.name}</b>`;
        html += `<span style="font-size:0.65rem;padding:2px 6px;border-radius:4px;background:${color}22;color:${color};border:1px solid ${color}44;">${rarityNames[i.rarity]}</span>`;
        html += `</div>`;
        html += `<small style="color:#0f0; font-weight:bold">${this.getItemDesc(i)}</small>`;
        if (locked) {
            html += `<div style="text-align:center;color:var(--red);margin-top:6px;font-weight:bold;">🔒 Требуется Zombie Slayer ${i.slayer_req} LVL</div>`;
        } else {
            html += `<div class="item-actions"><button class="act-btn" onclick="game.buyZombieItem('${zombieType}',${nextIdx})">${action} (${costText})</button></div>`;
        }
        html += `</div>`;
        l.innerHTML += html;
    },

    renderShopList(t) {
        const l = document.getElementById('shop-list');
        l.innerHTML = '';
        const items = shopItems[t] || [];

        // Оружие: показываем только следующий тир для улучшения
        if (t === 'weapon') {
            const swordProgression = ['Старый меч', 'Каменный меч', 'Железный Меч', 'Алмазный Меч', 'Незеритовый Меч'];
            const currentSword = this.state.inventory.find(i => i.type === 'weapon' && swordProgression.includes(i.name));
            
            let nextIdx = 0;
            if (currentSword) {
                nextIdx = swordProgression.indexOf(currentSword.name) + 1;
            }

            if (nextIdx < swordProgression.length && nextIdx > 0) {
                const i = shopItems.weapon.find(w => w.name === swordProgression[nextIdx]);
                if (i) {
                    l.innerHTML += `<div class="card" style="border-left:3px solid ${rarityColors[i.rarity]||'#aaa'}"><b>${i.name}</b> ${getRarityTag(i.rarity)}<br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.upgradeSwordInShop()">УЛУЧШИТЬ (${i.cost.toLocaleString()}💰)</button></div></div>`;
                }
            } else if (nextIdx === 0) {
                const i = shopItems.weapon[0];
                l.innerHTML += `<div class="card" style="border-left:3px solid ${rarityColors[i.rarity]||'#aaa'}"><b>${i.name}</b> ${getRarityTag(i.rarity)}<br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('weapon', 0)">КУПИТЬ (${i.cost.toLocaleString()}💰)</button></div></div>`;
            } else {
                l.innerHTML = '<div class="card" style="text-align:center;color:#666">Максимальный уровень меча!</div>';
            }

            l.innerHTML += `<div style="margin:12px 0 6px;padding:6px 10px;background:rgba(80,160,255,0.12);border-radius:6px;border-left:3px solid var(--blue);"><b style="color:var(--blue);">🏹 ЛУКИ (одна цепочка)</b></div>`;
            const progNames = BOW_PROGRESSION_DEFS.map(b => b.name);
            const ownedProgBow = this.state.inventory.find(i => i.type === 'weapon' && i.ranged && progNames.includes(i.name));
            const bowIdx = ownedProgBow ? progNames.indexOf(ownedProgBow.name) : -1;
            if (bowIdx < 0) {
                const f = BOW_PROGRESSION_DEFS[0];
                l.innerHTML += `<div class="card" style="border-left:3px solid ${rarityColors[f.rarity]||'#aaa'}"><b>${f.name}</b> ${getRarityTag(f.rarity)}<br><small>${this.getItemDesc({ ...f, ranged: true })}</small><div class="item-actions"><button class="act-btn" onclick="game.purchaseBowProgression()">КУПИТЬ (${f.cost.toLocaleString()}💰)</button></div></div>`;
            } else if (bowIdx < BOW_PROGRESSION_DEFS.length - 1) {
                const nx = BOW_PROGRESSION_DEFS[bowIdx + 1];
                l.innerHTML += `<div class="card" style="border-left:3px solid ${rarityColors[nx.rarity]||'#aaa'}"><b>${nx.name}</b> ${getRarityTag(nx.rarity)}<br><small>${this.getItemDesc({ ...nx, ranged: true })}</small><div class="item-actions"><button class="act-btn" onclick="game.purchaseBowProgression()">УЛУЧШИТЬ (${nx.cost.toLocaleString()}💰)</button></div></div>`;
            } else {
                l.innerHTML += `<div class="card" style="text-align:center;color:var(--green);font-weight:bold;">🏹 Лук: максимальный тир цепочки</div>`;
            }
            const hasLongBow = this.state.inventory.some(i => i.name === LONG_BOW_SHOP_DEF.name && i.type === 'weapon');
            const lb = LONG_BOW_SHOP_DEF;
            if (hasLongBow) {
                l.innerHTML += `<div class="card" style="border-left:3px solid ${rarityColors[lb.rarity]};opacity:0.65;"><b>${lb.name}</b> ${getRarityTag(lb.rarity)}<br><small>${this.getItemDesc({ ...lb, ranged: true })}</small><div style="text-align:center;color:var(--green);margin-top:6px;font-weight:bold;">УЖЕ КУПЛЕНО</div></div>`;
            } else {
                l.innerHTML += `<div class="card" style="border-left:3px solid ${rarityColors[lb.rarity]||'#aaa'}"><b>${lb.name}</b> ${getRarityTag(lb.rarity)}<br><small>${this.getItemDesc({ ...lb, ranged: true })}</small><div class="item-actions"><button class="act-btn" onclick="game.buyLongBowFromShop()">КУПИТЬ (${lb.cost.toLocaleString()}💰)</button></div></div>`;
            }

            const extraWeapons = shopItems.weapon.filter(w => !swordProgression.includes(w.name));
            extraWeapons.forEach(i => {
                l.innerHTML += `<div class="card" style="border-left:3px solid ${rarityColors[i.rarity]||'#aaa'}"><b>${i.name}</b> ${getRarityTag(i.rarity)}<br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('weapon',${shopItems.weapon.indexOf(i)})">КУПИТЬ (${i.cost.toLocaleString()}💰)</button></div></div>`;
            });
            const hasSpade = this.state.inventory.some(i => i.type === 'tool' && i.sub_type === 'spade');
            const spade = this.state.inventory.find(i => i.type === 'tool' && i.sub_type === 'spade');
            const spadeName = spade?.name || 'Ancestral Spade';
            l.innerHTML += `<div class="card" style="border-left:3px solid #fbbf24"><b>Ритуальные лопаты</b><br><small>${hasSpade ? `Текущая: ${spadeName}` : 'Ancestral Spade открывает ритуал (4 лунки).'}</small><div class="item-actions"><button class="act-btn" onclick="game.upgradeSpadeInShop()">${hasSpade ? 'УЛУЧШИТЬ ЛОПАТУ' : 'КУПИТЬ ANCESTRAL SPADE (10,000💰)'}</button></div></div>`;
            const hasDaedalusSword = this.state.inventory.some(i => i.name === 'Daedalus Sword' && i.type === 'weapon');
            l.innerHTML += `<div class="card" style="border-left:3px solid #ffaa00;${hasDaedalusSword ? 'opacity:0.6;' : ''}"><b>Daedalus Sword</b> ${getRarityTag('legendary')}<br><small>+75 STR +30 MF +25 CC +50 CD. В Diana ивенте x2 статы и x2 рефорж.</small>${hasDaedalusSword ? `<div style="margin-top:6px;color:var(--green);font-weight:bold;">УЖЕ КУПЛЕНО</div>` : `<div class="item-actions"><button class="act-btn" onclick="game.buyDaedalusSword()">КУПИТЬ (50M + 1 Daedalus Stick + 16 Mythos Fragment)</button></div>`}</div>`;

            this._renderZombieItems('zombie_weapon', l);
            return;
        }

        if (t === 'armor' || t.endsWith('_armor')) {
            const mb = typeof this.getMayorBonuses === 'function' ? this.getMayorBonuses() : {};
            const discount = mb.shop_discount || 0;
            items.forEach((i,x)=>{
                const owned = this.state.inventory.some(inv => inv.name === i.name);
                let price = i.cost;
                if (discount) price = Math.floor(price * (1 - discount / 100));
                const statsText = this.getItemDesc(i);
                let html = `<div class="card" ${owned?`style="opacity:0.5;border-color:var(--green);border-left:3px solid ${rarityColors[i.rarity]||'#aaa'}"`:`style="border-left:3px solid ${rarityColors[i.rarity]||'#aaa'}"`}><b>${i.name}</b> ${getRarityTag(i.rarity)}`;
                if (i.desc) html += `<br><small style="color:var(--gray)">${i.desc}</small>`;
                html += `<br><small style="color:var(--green)">${statsText}</small>`;
                if (owned) {
                    html += `<div style="text-align:center;color:var(--green);margin-top:6px;font-weight:bold;">УЖЕ КУПЛЕНО</div>`;
                } else {
                    const priceText = discount ? `<s>${i.cost.toLocaleString()}</s> ${price.toLocaleString()}` : price.toLocaleString();
                    html += `<div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('${t}',${x})">КУПИТЬ (${priceText}💰)</button></div>`;
                }
                html += `</div>`;
                l.innerHTML += html;
            });
            if (t === 'armor') this._renderZombieItems('zombie_armor', l);
            if (t === 'armor') {
                const hasChallenger = this.state.inventory.some(i => i.name === 'Challenger Armor' && i.type === 'armor');
                const hasMythos = this.state.inventory.some(i => i.name === 'Mythos Armor' && i.type === 'armor');
                if (!hasChallenger && !hasMythos) {
                    l.innerHTML += `<div class="card" style="border-left:3px solid #aa00aa;"><b>Challenger Armor</b> ${getRarityTag('epic')}<br><small>+60 HP +32.5 DEF +15 STR, x2 в Diana.</small><div class="item-actions"><button class="act-btn" onclick="game.buyOrUpgradeDianaArmor()">КУПИТЬ (256 Ancient Claw + 16 Griffin Feather + 160 Золота)</button></div></div>`;
                } else if (hasChallenger && !hasMythos) {
                    l.innerHTML += `<div class="card" style="border-left:3px solid #ffaa00;"><b>Mythos Armor</b> ${getRarityTag('legendary')}<br><small>+120 HP +65 DEF +30 STR, x2 в Diana, +20% урон/деф против мобов Дианы, +40 MF в Diana.</small><div class="item-actions"><button class="act-btn" onclick="game.buyOrUpgradeDianaArmor()">УЛУЧШИТЬ (16 Mythos Fragment + 768 Ancient Claw + 512 Золота + 64 Griffin Feather)</button></div></div>`;
                }
            }
            return;
        }

        if (t.endsWith('_tool')) {
            let bestIdx = -1;
            items.forEach((item, idx) => {
                if (this.state.inventory.some(inv => inv.name === item.name)) {
                    bestIdx = Math.max(bestIdx, idx);
                }
            });

            const nextIdx = bestIdx + 1;
            if (nextIdx < items.length) {
                const i = items[nextIdx];
                const action = bestIdx >= 0 ? 'УЛУЧШИТЬ' : 'КУПИТЬ';
                l.innerHTML+=`<div class="card" style="border-left:3px solid ${rarityColors[i.rarity]||'#aaa'}"><b>${i.name}</b> ${getRarityTag(i.rarity)}<br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('${t}',${nextIdx})">${action} (${i.cost.toLocaleString()}💰)</button></div></div>`;
            } else {
                l.innerHTML='<div class="card" style="text-align:center;color:#666">Максимальный уровень!</div>';
            }
            return;
        }

        if (t === 'material') {
            items.forEach((i, x) => {
                const isArrow = window.ALL_ARROW_NAMES && window.ALL_ARROW_NAMES.includes(i.name);
                let bulk = '';
                if (isArrow) {
                    bulk = `<div class="item-actions" style="margin-top:8px;flex-wrap:wrap;gap:6px;">
                        <button class="act-btn" style="font-size:0.75rem;padding:6px 10px;" onclick="game.buyShopMaterialBulk('material',${x},5)">×5</button>
                        <button class="act-btn" style="font-size:0.75rem;padding:6px 10px;" onclick="game.buyShopMaterialBulk('material',${x},10)">×10</button>
                        <button class="act-btn" style="font-size:0.75rem;padding:6px 10px;" onclick="game.buyShopMaterialBulk('material',${x},32)">×32</button>
                    </div>`;
                }
                l.innerHTML += `<div class="card" style="border-left:3px solid ${rarityColors[i.rarity]||'#aaa'}"><b>${i.name}</b> ${getRarityTag(i.rarity)}<br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('${t}',${x})">КУПИТЬ 1 шт (${i.cost.toLocaleString()}💰)</button></div>${bulk}</div>`;
            });
            return;
        }

        items.forEach((i,x)=>{
            l.innerHTML+=`<div class="card" style="border-left:3px solid ${rarityColors[i.rarity]||'#aaa'}"><b>${i.name}</b> ${getRarityTag(i.rarity)}<br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('${t}',${x})">КУПИТЬ (${i.cost.toLocaleString()}💰)</button></div></div>`;
        });
    },

    buyShopMaterialBulk(t, x, qty) {
        const i = shopItems[t] && shopItems[t][x];
        if (!i || i.type !== 'material' || !Number.isFinite(qty) || qty < 1) return;
        let unitCost = i.cost;
        if (typeof this.getMayorBonuses === 'function') {
            const mb = this.getMayorBonuses();
            if (mb.shop_discount) unitCost = Math.floor(unitCost * (1 - mb.shop_discount / 100));
        }
        const total = unitCost * qty;
        if (this.state.coins < total) {
            this.msg(`Не хватает монет! Нужно ${total.toLocaleString()} 💰`);
            return;
        }
        this.state.coins -= total;
        const opts = {};
        if (i.rarity) opts.rarity = i.rarity;
        if (i.desc) opts.desc = i.desc;
        this.addMaterial(i.name, i.type, qty, opts);
        this.msg(`Куплено ${qty}× ${i.name} за ${total.toLocaleString()} 💰`);
        this.updateUI();
    },

    _hasMaterial(name, count) {
        const it = this.state.inventory.find(i => i.type === 'material' && i.name === name);
        return (it?.count || 0) >= count;
    },

    _consumeMaterial(name, count) {
        const it = this.state.inventory.find(i => i.type === 'material' && i.name === name);
        if (!it || (it.count || 0) < count) return false;
        it.count -= count;
        if (it.count <= 0) this.state.inventory = this.state.inventory.filter(x => x.id !== it.id);
        return true;
    },

    buyDaedalusSword() {
        if (this.state.inventory.some(i => i.name === 'Daedalus Sword' && i.type === 'weapon')) { this.msg('Уже куплено.'); return; }
        if (this.state.coins < 50000000) { this.msg('Нужно 50,000,000 монет.'); return; }
        if (!this._hasMaterial('Daedalus Stick', 1) || !this._hasMaterial('Mythos Fragment', 16)) {
            this.msg('Нужно: 1 Daedalus Stick и 16 Mythos Fragment.');
            return;
        }
        this.state.coins -= 50000000;
        this._consumeMaterial('Daedalus Stick', 1);
        this._consumeMaterial('Mythos Fragment', 16);
        this.state.inventory.push({ id: this.state.nextItemId++, name:'Daedalus Sword', type:'weapon', str:75, mf:30, cc:25, cd:50, rarity:'legendary', diana_scaled:true, equipped:false, count:1 });
        this.msg('Daedalus Sword куплен!');
        this.updateUI();
    },

    buyOrUpgradeDianaArmor() {
        const chall = this.state.inventory.find(i => i.name === 'Challenger Armor' && i.type === 'armor');
        const myth = this.state.inventory.find(i => i.name === 'Mythos Armor' && i.type === 'armor');
        if (myth) { this.msg('Mythos Armor уже есть.'); return; }
        if (!chall) {
            if (!this._hasMaterial('Ancient Claw', 256) || !this._hasMaterial('Griffin Feather', 16) || !this._hasMaterial('Золото', 160)) {
                this.msg('Нужно: 256 Ancient Claw, 16 Griffin Feather, 160 Золота.');
                return;
            }
            this._consumeMaterial('Ancient Claw', 256); this._consumeMaterial('Griffin Feather', 16); this._consumeMaterial('Золото', 160);
            this.state.inventory.push({ id:this.state.nextItemId++, name:'Challenger Armor', type:'armor', hp:60, def:32.5, str:15, rarity:'epic', diana_scaled:true, equipped:false, count:1 });
            this.msg('Challenger Armor куплена!');
        } else {
            if (!this._hasMaterial('Mythos Fragment', 16) || !this._hasMaterial('Ancient Claw', 768) || !this._hasMaterial('Золото', 512) || !this._hasMaterial('Griffin Feather', 64)) {
                this.msg('Нужно: 16 Mythos Fragment, 768 Ancient Claw, 512 Золота, 64 Griffin Feather.');
                return;
            }
            this._consumeMaterial('Mythos Fragment', 16); this._consumeMaterial('Ancient Claw', 768); this._consumeMaterial('Золото', 512); this._consumeMaterial('Griffin Feather', 64);
            chall.name = 'Mythos Armor';
            chall.hp = 120; chall.def = 65; chall.str = 30; chall.rarity = 'legendary';
            chall.diana_scaled = true; chall.ritual_mob_damage = 20; chall.ritual_mob_def_bonus = 20; chall.diana_mf_bonus = 40;
            this.msg('Challenger Armor улучшена до Mythos Armor!');
        }
        this.updateUI();
    },

    upgradeSpadeInShop() {
        const spade = this.state.inventory.find(i => i.type === 'tool' && i.sub_type === 'spade');
        if (!spade) {
            if (this.state.coins < 10000) { this.msg('Нужно 10,000 монет.'); return; }
            this.state.coins -= 10000;
            this.state.inventory.push({ id:this.state.nextItemId++, name:'Ancestral Spade', type:'tool', sub_type:'spade', rarity:'rare', equipped:false, count:1, ritual_holes:4 });
            this.msg('Ancestral Spade куплена!');
            this.updateUI();
            return;
        }
        if (spade.name === 'Ancestral Spade') {
            if (!this._hasMaterial('Ancient Claw', 128) || !this._hasMaterial('Griffin Feather', 32) || !this._hasMaterial('Daedalus Stick', 1)) {
                this.msg('Нужно: 128 Ancient Claw, 32 Griffin Feather, 1 Daedalus Stick.');
                return;
            }
            this._consumeMaterial('Ancient Claw', 128); this._consumeMaterial('Griffin Feather', 32); this._consumeMaterial('Daedalus Stick', 1);
            spade.name = 'Archaic Spade'; spade.rarity = 'epic'; spade.ritual_holes = 6;
            this.msg('Лопата улучшена до Archaic Spade!');
        } else if (spade.name === 'Archaic Spade') {
            if (!this._hasMaterial('Ancient Claw', 1024) || !this._hasMaterial('Griffin Feather', 128) || !this._hasMaterial('Золото', 512) || !this._hasMaterial('Mythos Fragment', 64)) {
                this.msg('Нужно: 1024 Ancient Claw, 128 Griffin Feather, 512 Золота, 64 Mythos Fragment.');
                return;
            }
            this._consumeMaterial('Ancient Claw', 1024); this._consumeMaterial('Griffin Feather', 128); this._consumeMaterial('Золото', 512); this._consumeMaterial('Mythos Fragment', 64);
            spade.name = 'Deific Spade'; spade.rarity = 'legendary'; spade.ritual_holes = 8;
            this.msg('Лопата улучшена до Deific Spade!');
        } else {
            this.msg('Лопата уже максимального уровня.');
        }
        this.updateUI();
    },

    buyShopItem(t,x){
        const i = shopItems[t][x];

        // Проверка ресурсов
        if (i.resource_cost) {
            const resourceMap = {
                wheat: 'Пшеница',
                carrot: 'Морковь',
                potato: 'Картофель',
                pumpkin: 'Тыква',
                melon: 'Арбуз',
                cane: 'Тростник'
            };

            for (const [key, amount] of Object.entries(i.resource_cost)) {
                const resName = resourceMap[key] || key;
                const invItem = this.state.inventory.find(inv => inv.name === resName && inv.type === 'material');
                if (!invItem || (invItem.count || 0) < amount) {
                    this.msg(`Не хватает ресурсов: ${resName} (${amount} шт.)`);
                    return;
                }
            }
        }

        let finalCost = i.cost;
        if (typeof this.getMayorBonuses === 'function') {
            const mb = this.getMayorBonuses();
            if (mb.shop_discount) finalCost = Math.floor(finalCost * (1 - mb.shop_discount / 100));
        }
        if(this.state.coins < finalCost){this.msg('Не хватает монет!');return;}

        // Списание ресурсов
        if (i.resource_cost) {
            const resourceMap = {
                wheat: 'Пшеница',
                carrot: 'Морковь',
                potato: 'Картофель',
                pumpkin: 'Тыква',
                melon: 'Арбуз',
                cane: 'Тростник'
            };
            for (const [key, amount] of Object.entries(i.resource_cost)) {
                const resName = resourceMap[key] || key;
                const invItem = this.state.inventory.find(inv => inv.name === resName && inv.type === 'material');
                if (invItem) {
                    invItem.count -= amount;
                    if (invItem.count <= 0) {
                        this.state.inventory = this.state.inventory.filter(inv => inv.id !== invItem.id);
                    }
                }
            }
        }

        if (t.endsWith('_tool')) {
            // Удаляем предыдущий тир при улучшении
            if (x > 0) {
                const prevItem = shopItems[t][x-1];
                const prevInv = this.state.inventory.find(inv => inv.name === prevItem.name);
                if (prevInv) {
                    this.state.inventory = this.state.inventory.filter(inv => inv.id !== prevInv.id);
                }
            }
        }

        this.state.coins -= finalCost;
        if (i.type === 'pet') {
            this.state.pets.push({...i, equipped:false});
            this.msg(`${i.name} куплен!`);
        } else if (i.type === 'material') {
            // Складируются (например, фрагменты из данжа)
            this.addMaterial(i.name, i.type, 1);
            this.msg(`${i.name} куплен!`);
        } else {
            const newItem = {
                id: this.state.nextItemId++,
                name: i.name,
                type: i.type,
                count: 1,
                equipped: false,
                ...i
            };
            delete newItem.cost;
            if (!newItem.rarity && i.cost) newItem.rarity = autoRarity(i.cost);
            this.state.inventory.push(newItem);
            this.msg(`${i.name} куплен!`);
        }
        this.updateUI();
    },

    buyZombieItem(t, x) {
        const i = shopItems[t][x];
        if (!i) return;
        
        const slayerLvl = this.state.slayer?.zombie?.lvl || 1;
        if (i.slayer_req > 0 && slayerLvl < i.slayer_req) {
            this.msg(`Требуется Zombie Slayer ${i.slayer_req} уровня!`);
            return;
        }
        
        if (i.flesh_cost) {
            const flesh = this.state.inventory.find(inv => inv.name === 'Плоть зомби' && inv.type === 'material');
            const fleshCount = flesh ? (flesh.count || 0) : 0;
            if (fleshCount < i.flesh_cost) {
                this.msg(`Недостаточно Плоти зомби! Нужно ${i.flesh_cost}, у вас ${fleshCount}`);
                return;
            }
        }
        if (i.living_flesh_cost) {
            const lf = this.state.inventory.find(inv => inv.name === 'Живая плоть' && inv.type === 'material');
            const lfCount = lf ? (lf.count || 0) : 0;
            if (lfCount < i.living_flesh_cost) {
                this.msg(`Недостаточно Живой плоти! Нужно ${i.living_flesh_cost}, у вас ${lfCount}`);
                return;
            }
        }
        if (i.cost > 0 && this.state.coins < i.cost) {
            this.msg('Не хватает монет!');
            return;
        }
        
        if (i.flesh_cost) {
            const flesh = this.state.inventory.find(inv => inv.name === 'Плоть зомби' && inv.type === 'material');
            flesh.count -= i.flesh_cost;
            if (flesh.count <= 0) this.state.inventory = this.state.inventory.filter(inv => inv.id !== flesh.id);
        }
        if (i.living_flesh_cost) {
            const lf = this.state.inventory.find(inv => inv.name === 'Живая плоть' && inv.type === 'material');
            lf.count -= i.living_flesh_cost;
            if (lf.count <= 0) this.state.inventory = this.state.inventory.filter(inv => inv.id !== lf.id);
        }
        if (i.cost > 0) this.state.coins -= i.cost;
        
        const progression = (shopItems[t] || []).map(z => z.name);
        const prevItem = this.state.inventory.find(inv => progression.includes(inv.name));
        if (prevItem) {
            const wasEquipped = prevItem.equipped;
            prevItem.name = i.name;
            prevItem.str = i.str || 0;
            prevItem.def = i.def || 0;
            prevItem.vitality = i.vitality || 0;
            prevItem.zombie_bonus = i.zombie_bonus || 0;
            prevItem.cost = i.flesh_cost ? i.flesh_cost * 100 : 10000;
            prevItem.equipped = wasEquipped;
            this.msg(`Улучшено до: ${i.name}!`);
        } else {
            const newItem = {
                id: this.state.nextItemId++,
                name: i.name,
                type: i.type,
                equipped: false,
                str: i.str || 0,
                def: i.def || 0,
                vitality: i.vitality || 0,
                zombie_bonus: i.zombie_bonus || 0,
                cost: i.flesh_cost ? i.flesh_cost * 100 : 10000
            };
            this.state.inventory.push(newItem);
            this.msg(`${i.name} куплен!`);
        }
        this.updateUI();
    },

    switchTab(id, el) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        if (el) {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
        }
        if (id === 'shop') {
             const firstTab = document.querySelector('#shop .inv-tab');
             if (firstTab) game.shopFilter('weapon', firstTab);
        }
        if (id === 'inventory') {
             const filter = this.lastFilter || 'weapon';
             this.renderInvList(filter);
             document.querySelectorAll('#inventory .inv-tab').forEach(tab => {
                 tab.classList.remove('active');
                 if (tab.textContent === {weapon:'ОРУЖИЕ',armor:'БРОНЯ',tool:'ИНСТРУМЕНТЫ',accessory:'ТАЛИСМАНЫ',material:'МАТЕРИАЛ',chest:'СУНДУКИ',potion:'БАФФЫ',book:'📖 КНИГИ',pet:'ПИТОМЦЫ'}[filter]) tab.classList.add('active');
             });
        }
    },

    showModal(id) {
        document.getElementById(id).style.display = 'block';
        if (id === 'skillsModal') {
            let html = '';
            Object.values(this.state.skills).forEach(sk => {
                const progress = Math.min(100, (sk.xp / sk.next * 100)).toFixed(1);
                html += `<div class="card"><b>${sk.label} LVL ${sk.lvl}</b><br><small>${sk.xp.toFixed(2)} / ${sk.next.toFixed(2)} XP</small><div class="hp-bar" style="margin-top:8px"><div class="hp-fill" style="width:${progress}%;background:var(--green)"></div></div></div>`;
            });
            if (this.state.slayer) {
                html += '<h3 style="color:var(--red); text-align:center; margin-top:15px;">👹 СЛЕЙЕРЫ</h3>';
                const zomb = this.state.slayer.zombie || { lvl: 1, xp: 0 };
                const zombCfg = typeof slayerConfig !== 'undefined' ? slayerConfig.zombie : null;
                let nextReq = 0;
                if (zombCfg && zomb.lvl < 10) {
                    nextReq = zombCfg.levels[zomb.lvl]?.req || 0;
                }
                const slayerProg = nextReq > 0 ? Math.min(100, (zomb.xp / nextReq * 100)).toFixed(1) : 100;
                html += `<div class="card" style="border-left:4px solid var(--red);">
                    <b>🧟 Zombie Slayer LVL ${zomb.lvl}</b><br>
                    <small>${zomb.xp.toLocaleString()} / ${nextReq > 0 ? nextReq.toLocaleString() : 'MAX'} XP</small>
                    <div class="hp-bar" style="margin-top:8px"><div class="hp-fill" style="width:${slayerProg}%;background:var(--red)"></div></div>
                </div>`;
            }
            document.getElementById('skills-content').innerHTML = html;
        }
        if (id === 'talentsModal') {
            let html = '';
            const talents = [
                { id: 'fortune', name: '🌾 Фортуна', desc: 'прирост +3', valPrefix: '+', valSuffix: ' фортуны' },
                { id: 'exp', name: '🌟 Бонус опыта', desc: 'прирост +0.5%', valPrefix: '+', valSuffix: '%' },
                { id: 'double_drop', name: '🚜 Двойной дроп', desc: 'прирост +2%', reqText: 'Нужна Фортуна Ур. 3', valPrefix: '+', valSuffix: '%' },
                { id: 'triple_drop', name: '🚜 Тройной дроп', desc: 'прирост +0.5%', reqText: 'Нужен Дв. дроп Ур. 5', valPrefix: '+', valSuffix: '%' },
                { id: 'overdrive', name: '⚡ Овердрайв', desc: 'Способность: x2 ресурсы', reqText: 'Нужна Фортуна Ур. 5', valPrefix: '', valSuffix: ' ур.' },
                { id: 'overdrive_duration', name: '⏳ Продление', desc: 'прирост +1с', reqText: 'Нужен Овердрайв Ур. 1', valPrefix: '+', valSuffix: 'с' }
            ];
            talents.forEach(t => {
                const state = this.state.farmingTalents[t.id];
                const costInfo = this.getTalentCost(t.id, state.lvl);
                let cost = costInfo.coins;
                let resReq = '';
                if (costInfo.count > 0) {
                    resReq = `<br><small style="color:var(--accent)">+ ${costInfo.count.toLocaleString()} ${costInfo.res}</small>`;
                }
                
                // Проверка условий (зависимости)
                let locked = false;
                if (state.req) {
                    const dep = this.state.farmingTalents[state.req.id];
                    if (dep.lvl < state.req.lvl) locked = true;
                }

                const isMax = state.lvl >= state.max;
                
                // Расчет текущего и следующего значения
                const getVal = (lvl) => {
                    if (t.id === 'fortune') return lvl * 3;
                    if (t.id === 'exp') return (lvl * 0.5).toFixed(1);
                    if (t.id === 'double_drop') return lvl * 2;
                    if (t.id === 'triple_drop') return (lvl * 0.5).toFixed(1);
                    if (t.id === 'overdrive') return lvl;
                    if (t.id === 'overdrive_duration') return lvl * 1;
                    return 0;
                };

                const currentVal = getVal(state.lvl);
                const nextVal = isMax ? null : getVal(state.lvl + 1);
                const progressText = isMax 
                    ? `<span style="color:var(--green)">${t.valPrefix}${currentVal}${t.valSuffix} (МАКС)</span>`
                    : `<span>${t.valPrefix}${currentVal}${t.valSuffix} ➔ <b style="color:var(--accent)">${t.valPrefix}${nextVal}${t.valSuffix}</b></span>`;

                html += `
                    <div class="card" style="${locked ? 'opacity:0.5' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:5px;">
                            <b>${t.name} (Ур. ${state.lvl}/${state.max})</b>
                            <small style="color:var(--gray)">${t.desc}</small>
                        </div>
                        <div style="margin-bottom:8px;">${progressText}</div>
                        ${resReq}
                        ${locked ? `<small style="color:var(--red)">🔒 ${t.reqText}</small>` : ''}
                        <div class="item-actions" style="margin-top:10px">
                            <button class="act-btn" ${isMax || locked ? 'disabled' : ''} onclick="game.upgradeTalent('${t.id}')">
                                ${isMax ? 'МАКСИМУМ' : locked ? 'ЗАБЛОКИРОВАНО' : `УЛУЧШИТЬ (${cost.toLocaleString()}💰)`}
                            </button>
                        </div>
                    </div>
                `;
            });
            document.getElementById('talents-content').innerHTML = html;
        }
        if (id === 'foragingTalentsModal') {
            let html = '';
            const talents = [
                { id: 'fortune', name: '🌲 Фортуна', desc: 'прирост +3', valPrefix: '+', valSuffix: ' фортуны' },
                { id: 'exp', name: '🌟 Бонус опыта', desc: 'прирост +0.5%', valPrefix: '+', valSuffix: '%' },
                { id: 'double_drop', name: '🪓 Двойной дроп', desc: 'прирост +2%', reqText: 'Нужна Фортуна Ур. 3', valPrefix: '+', valSuffix: '%' },
                { id: 'triple_drop', name: '🪓 Тройной дроп', desc: 'прирост +0.5%', reqText: 'Нужен Дв. дроп Ур. 5', valPrefix: '+', valSuffix: '%' },
                { id: 'instant_chop', name: '⚡ Мгновенная рубка', desc: 'прирост +0.6%', reqText: 'Нужна Фортуна Ур. 5', valPrefix: '+', valSuffix: '%' }
            ];
            talents.forEach(t => {
                const state = this.state.foragingTalents[t.id];
                const costInfo = this.getForagingTalentCost(t.id, state.lvl);
                let cost = costInfo.coins;
                let resReq = '';
                if (costInfo.count > 0) {
                    resReq = `<br><small style="color:var(--accent)">+ ${costInfo.count.toLocaleString()} ${costInfo.res}</small>`;
                }
                let locked = false;
                if (state.req) {
                    const dep = this.state.foragingTalents[state.req.id];
                    if (dep.lvl < state.req.lvl) locked = true;
                }
                const isMax = state.lvl >= state.max;
                const getVal = (lvl) => {
                    if (t.id === 'fortune') return lvl * 3;
                    if (t.id === 'exp') return (lvl * 0.5).toFixed(1);
                    if (t.id === 'double_drop') return lvl * 2;
                    if (t.id === 'triple_drop') return (lvl * 0.5).toFixed(1);
                    if (t.id === 'instant_chop') return (lvl * 0.6).toFixed(1);
                    return 0;
                };
                const currentVal = getVal(state.lvl);
                const nextVal = isMax ? null : getVal(state.lvl + 1);
                const progressText = isMax 
                    ? `<span style="color:var(--green)">${t.valPrefix}${currentVal}${t.valSuffix} (МАКС)</span>`
                    : `<span>${t.valPrefix}${currentVal}${t.valSuffix} ➔ <b style="color:var(--accent)">${t.valPrefix}${nextVal}${t.valSuffix}</b></span>`;
                html += `
                    <div class="card" style="${locked ? 'opacity:0.5' : ''}">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:5px;">
                            <b>${t.name} (Ур. ${state.lvl}/${state.max})</b>
                            <small style="color:var(--gray)">${t.desc}</small>
                        </div>
                        <div style="margin-bottom:8px;">${progressText}</div>
                        ${resReq}
                        ${locked ? `<small style="color:var(--red)">🔒 ${t.reqText}</small>` : ''}
                        <div class="item-actions" style="margin-top:10px">
                            <button class="act-btn" ${isMax || locked ? 'disabled' : ''} onclick="game.upgradeForagingTalent('${t.id}')">
                                ${isMax ? 'МАКСИМУМ' : locked ? 'ЗАБЛОКИРОВАНО' : `УЛУЧШИТЬ (${cost.toLocaleString()}💰)`}
                            </button>
                        </div>
                    </div>
                `;
            });
            document.getElementById('foraging-talents-content').innerHTML = html;
        }
        if (id === 'updatesModal') {
            if (typeof renderUpdates === 'function') {
                renderUpdates();
            } else {
                document.getElementById('updatesModal').innerHTML = '<div style="text-align:center;color:#666;padding:20px;">Обновления загружаются...</div>';
            }
        }
    },

    closeModal(id) {
        document.getElementById(id).style.display = 'none';
    },

    getTalentCost(talentId, lvl) {
        // Экспоненциальная прогрессия стоимости (макс 100М монет)
        // Каждый уровень требует ресурсы + монеты
        const baseCosts = {
            fortune: { base: 10000, mult: 2.5, res: 'Пшеница', resBase: 64, resMult: 2 },
            exp: { base: 15000, mult: 2.2, res: 'Картофель', resBase: 32, resMult: 2 },
            double_drop: { base: 100000, mult: 2.8, res: 'Морковь', resBase: 128, resMult: 2 },
            triple_drop: { base: 500000, mult: 3.0, res: 'Тыква', resBase: 256, resMult: 2 },
            overdrive: { base: 1000000, mult: 3.5, res: 'Арбуз', resBase: 512, resMult: 2 },
            overdrive_duration: { base: 750000, mult: 3.2, res: 'Грибы', resBase: 256, resMult: 2 }
        };
        const cfg = baseCosts[talentId] || { base: 50000, mult: 2, res: 'Пшеница', resBase: 64, resMult: 2 };
        
        let coins = Math.floor(cfg.base * Math.pow(cfg.mult, lvl));
        coins = Math.min(coins, 100000000); // Макс 100М
        
        const resCount = Math.floor(cfg.resBase * Math.pow(cfg.resMult, lvl));
        
        return { coins, res: cfg.res, count: resCount };
    },

    upgradeTalent(id) {
        const t = this.state.farmingTalents[id];
        if (!t || t.lvl >= t.max) return;

        // Проверка требований
        if (t.req) {
            const dep = this.state.farmingTalents[t.req.id];
            if (dep.lvl < t.req.lvl) {
                this.msg('Сначала вкачайте ' + t.req.id + ' до ' + t.req.lvl + '!');
                return;
            }
        }

        const costInfo = this.getTalentCost(id, t.lvl);
        const cost = costInfo.coins;

        if (this.state.coins < cost) {
            this.msg('Не хватает монет!');
            return;
        }

        // Проверка ресурсов
        if (costInfo.count > 0) {
            const invItem = this.state.inventory.find(i => i.name === costInfo.res && i.type === 'material');
            if (!invItem || invItem.count < costInfo.count) {
                this.msg(`Нужно ${costInfo.count.toLocaleString()} ${costInfo.res}!`);
                return;
            }
            invItem.count -= costInfo.count;
            if (invItem.count <= 0) {
                this.state.inventory = this.state.inventory.filter(i => i.id !== invItem.id);
            }
        }

        this.state.coins -= cost;
        t.lvl++;
        this.addXp('skyblock', 0.01); 
        this.msg('Талант улучшен!');
        this.showModal('talentsModal');
        this.updateUI();
    },

    getForagingTalentCost(talentId, lvl) {
        const baseCosts = {
            fortune: { base: 10000, mult: 2.5, res: 'Дуб', resBase: 64, resMult: 2 },
            exp: { base: 15000, mult: 2.2, res: 'Берёза', resBase: 32, resMult: 2 },
            double_drop: { base: 100000, mult: 2.8, res: 'Тёмный Дуб', resBase: 128, resMult: 2 },
            triple_drop: { base: 500000, mult: 3.0, res: 'Акация', resBase: 256, resMult: 2 },
            instant_chop: { base: 750000, mult: 3.2, res: 'Древо Жизни', resBase: 128, resMult: 2 }
        };
        const cfg = baseCosts[talentId] || { base: 50000, mult: 2, res: 'Дуб', resBase: 64, resMult: 2 };
        let coins = Math.floor(cfg.base * Math.pow(cfg.mult, lvl));
        coins = Math.min(coins, 100000000);
        const resCount = Math.floor(cfg.resBase * Math.pow(cfg.resMult, lvl));
        return { coins, res: cfg.res, count: resCount };
    },

    upgradeForagingTalent(id) {
        const t = this.state.foragingTalents[id];
        if (!t || t.lvl >= t.max) return;
        if (t.req) {
            const dep = this.state.foragingTalents[t.req.id];
            if (dep.lvl < t.req.lvl) {
                this.msg('Сначала вкачайте ' + t.req.id + ' до ' + t.req.lvl + '!');
                return;
            }
        }
        const costInfo = this.getForagingTalentCost(id, t.lvl);
        const cost = costInfo.coins;
        if (this.state.coins < cost) {
            this.msg('Не хватает монет!');
            return;
        }
        if (costInfo.count > 0) {
            const invItem = this.state.inventory.find(i => i.name === costInfo.res && i.type === 'material');
            if (!invItem || invItem.count < costInfo.count) {
                this.msg(`Нужно ${costInfo.count.toLocaleString()} ${costInfo.res}!`);
                return;
            }
            invItem.count -= costInfo.count;
            if (invItem.count <= 0) {
                this.state.inventory = this.state.inventory.filter(i => i.id !== invItem.id);
            }
        }
        this.state.coins -= cost;
        t.lvl++;
        this.addXp('skyblock', 0.01);
        this.msg('Талант улучшен!');
        this.showModal('foragingTalentsModal');
        this.updateUI();
    },

    initSkills() {
        if (!this.state.skills.skyblock) {
            this.state.skills.skyblock = { lvl: 0, xp: 0, next: 1, label: 'SKYBLOCK' };
        }
    },

    setClass(val) {
        this.state.class = val;
        this.msg(val ? `Класс: ${val.toUpperCase()}` : 'Класс снят');
        this.updateUI();
    },

    goLoc(loc) {
        this.currentLoc = loc;
        this.switchTab('action-loc');
        const titles = {mine:'ШАХТА',farm:'ФЕРМА',fish:'РЫБАЛКА',forage:'ЛЕС'};
        document.getElementById('loc-title').innerText = titles[loc] || 'ЛОКАЦИЯ';
        document.getElementById('loc-log').innerText = '';

        // Показываем кнопку способности, если она вкачана
        const extraBtn = document.getElementById('extra-action-container');
        if (loc === 'farm' && this.state.farmingTalents?.overdrive?.lvl > 0) {
            const now = Date.now();
            const cd = this.state.overdriveCooldown || 0;
            const onCooldown = now < cd;
            const btnText = onCooldown ? `⏳ КД (${Math.ceil((cd - now)/60000)}м)` : '⚡ ОВЕРДРАЙВ (10с)';
            
            if (!extraBtn) {
                const card = document.querySelector('#action-loc .card');
                const div = document.createElement('div');
                div.id = 'extra-action-container';
                div.style.marginTop = '10px';
                div.innerHTML = `
                    <button id="overdrive-btn" class="act-btn" style="width:100%; height:45px; background:var(--blue); font-weight:bold;" onclick="game.useOverdrive()" ${onCooldown ? 'disabled' : ''}>
                        ${btnText}
                    </button>
                `;
                card.appendChild(div);
            } else {
                extraBtn.style.display = 'block';
                const btn = document.getElementById('overdrive-btn');
                if (btn) {
                    btn.innerText = btnText;
                    btn.disabled = onCooldown;
                }
            }
        } else if (extraBtn) {
            extraBtn.style.display = 'none';
        }
    },

    useOverdrive() {
        if (this.state.overdriveActive) {
            this.msg('Уже активно!');
            return;
        }

        const now = Date.now();
        if (this.state.overdriveCooldown && now < this.state.overdriveCooldown) {
             const left = Math.ceil((this.state.overdriveCooldown - now) / 1000);
             this.msg(`Овердрайв на перезарядке! (${left}с)`);
             return;
        }

        const extraDuration = (this.state.farmingTalents?.overdrive_duration?.lvl || 0) * 1000;
        const totalDuration = 10000 + extraDuration;
        
        this.state.overdriveActive = true;
        this.state.overdriveCooldown = now + 300000; // 5 минут КД

        this.msg(`⚡ ОВЕРДРАЙВ АКТИВИРОВАН! (x2 на ${totalDuration/1000} сек)`);
        const btn = document.getElementById('overdrive-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerText = '⚡ АКТИВНО!';
        }
        
        setTimeout(() => {
            this.state.overdriveActive = false;
            this.msg('Овердрайв закончился');
            // Обновляем кнопку, если мы всё ещё на экране
            const currentBtn = document.getElementById('overdrive-btn');
            if (currentBtn) {
                // Она останется disabled, так как КД 5 минут, а действие ~10-20 сек
                const timeLeft = Math.ceil((this.state.overdriveCooldown - Date.now()) / 60000);
                currentBtn.innerText = `⏳ КД (${timeLeft}м)`;
            }
        }, totalDuration);
    },

    executeAction() {
        if (this.isBusy) return;
        this.isBusy = true;
        const prog = document.getElementById('action-prog');
        const btn = document.getElementById('action-btn');
        btn.disabled = true;
        prog.style.width = '0%';
        setTimeout(() => {
            prog.style.transition = 'width 1.5s linear';
            prog.style.width = '100%';
        }, 20);
        setTimeout(() => {
            this.isBusy = false;
            btn.disabled = false;
            prog.style.transition = 'none';
            prog.style.width = '0%';
            this.finishAction();
        }, 1520);
    },

    buyExtraChest(tier) {
        const costs = {1: 3000000, 2: 5000000, 3: 10000000};
        const cost = costs[tier];
        if (!cost) return;

        if (this.state.coins < cost) {
            this.msg(`Недостаточно монет! Нужно ${cost.toLocaleString()} 💰`);
            return;
        }

        this.state.coins -= cost;
        const floor = this.dungeon && this.dungeon.floor ? this.dungeon.floor : 5;
        
        // Для простоты добавляем сундук в инвентарь
        // Можно усложнить логику (сразу открывать с лучшим дропом), но пока так
        const chestName = tier === 1 ? `Сундук этажа ${floor}` : 
                          tier === 2 ? `Эпический сундук этажа ${floor}` : 
                                       `Элитный сундук этажа ${floor}`;
        
        this.addMaterial(chestName, 'chest');
        this.msg(`Куплен ${chestName}!`);
        this.updateUI();
    }
};
