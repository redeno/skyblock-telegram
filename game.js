const tg = window.Telegram?.WebApp || {};

const SUPABASE_URL = 'https://acddabgvsbqmaqfvjfst.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t63MwjVo6ILOZYH64SWORg_S_KlENDS';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const defaultState = {
    coins: 500000000,
    nextItemId: 10,
    mayor: {
        current: 'dodoll',
        lastSwitch: Date.now(),
        rotation: ['dodoll', 'waifu625', 'necronchik']
    },
    globalMayor: null,
    skills: {
        mining: {lvl:1,xp:0,next:100,label:'ШАХТА'},
        farming: {lvl:1,xp:0,next:100,label:'ФЕРМА'},
        fishing: {lvl:1,xp:0,next:100,label:'РЫБАЛКА'},
        combat: {lvl:1,xp:0,next:100,label:'БОЙ'},
        foraging: {lvl:1,xp:0,next:100,label:'ЛЕС'},
        dungeons: {lvl:1,xp:0,next:200,label:'ДАНЖИ'},
        skyblock: {lvl:1,xp:0,next:1,label:'SKYBLOCK'}
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
        fishing_fortune:0,        // ← фортуна для рыбалки
        fishing_exp_bonus:0       // ← бонус опыта для рыбалки (если нужен отдельно)
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
        {id:'zombie', name:'ЗОМБИ', category:'combat', resource:'Гнилая плоть', lvl:0, stored:0},
        {id:'skeleton', name:'СКЕЛЕТ', category:'combat', resource:'Кость', lvl:0, stored:0},
        {id:'spider', name:'ПАУК', category:'combat', resource:'Нить', lvl:0, stored:0}
    ],
    pets: []
};

const shopItems = {
    weapon: [
                {name:'Старый меч',type:'weapon',str:10,cost:1000},
        {name:'Каменный меч',type:'weapon',str:20,cost:25000},
        {name:'Железный Меч',type:'weapon',str:30,cost:500000},
        {name:'Алмазный Меч',type:'weapon',str:40,cost:1000000},
        {name:'Незеритовый Меч',type:'weapon',str:50,cost:10000000},
                {name:'Меч первопроходца',type:'weapon',str:60,hp:10,def:0,cd:10,cost:500000000}
    ],
    armor: [
        {name:'🛡️ Железная Броня',type:'armor',def:10,cost:10000},
        {name:'🛡️ Алмазная броня',type:'armor',def:20,cost:50000},
        {name:'⚔️ Shaddow Assasins броня',type:'armor',def:25,str:25,cc:5,cd:10,cost:1000000},
        {name:'🧠 ДемонЛорд Броня',type:'armor',str:50,def:30,cc:10,cd:25,mag_amp:5,mf:25,cost:10000000},
        {name:'🍀 Накидка первопроходца',type:'armor',hp:50,str:25,int:25,def:15,cc:15,cd:25,farming_exp_bonus:3,mining_exp_bonus:3,foraging_exp_bonus:3,fishing_exp_bonus:3,dungeon_exp_bonus:3,farming_fortune:20,mining_fortune:20,foraging_fortune:20,fishing_fortune:20,cost:50000000}
    ],
    mining_armor: [
        {name:'⛏️ Шахтёрская броня',type:'armor',mining_fortune:50,mining_exp_bonus:5,def:5,cost:50000,desc:'Базовая броня шахтёра. +50 фортуны, +5% опыта шахты, +5 защиты.'},
        {name:'⛏️ Рудокопная броня',type:'armor',mining_fortune:125,mining_exp_bonus:7,def:10,cost:500000,desc:'Улучшенная шахтёрская экипировка. +125 фортуны, +7% опыта шахты, +10 защиты.'},
        {name:'⛏️ Мифриловая броня',type:'armor',mining_fortune:200,mining_exp_bonus:10,def:20,mf:10,cost:5000000,desc:'Редкая мифриловая броня. +200 фортуны, +10% опыта шахты, +20 защиты, +10 удачи.'},
        {name:'⛏️ Кристальная броня',type:'armor',mining_fortune:300,mining_exp_bonus:15,def:30,mf:20,cost:50000000,desc:'Легендарная кристальная броня. +300 фортуны, +15% опыта шахты, +30 защиты, +20 удачи.'}
    ],
    farming_armor: [
        {name:'🌾 Фермерская броня',type:'armor',farming_fortune:50,farming_exp_bonus:5,cost:50000,desc:'Базовая фермерская броня. +50 фортуны, +5% опыта фермы.'},
        {name:'🌾 Арбузная броня',type:'armor',farming_fortune:125,farming_exp_bonus:7,cost:500000,desc:'Улучшенная фермерская экипировка. +125 фортуны, +7% опыта фермы.'},
        {name:'🌾 Ферменто броня',type:'armor',farming_fortune:200,farming_exp_bonus:10,cost:5000000,desc:'Редкая ферментированная броня. +200 фортуны, +10% опыта фермы.'},
        {name:'🌾 Гелиантус броня',type:'armor',farming_fortune:300,farming_exp_bonus:15,cost:50000000,desc:'Легендарная солнечная броня. +300 фортуны, +15% опыта фермы.'}
    ],
    fishing_armor: [
        {name:'🎣 Рыбацкая броня',type:'armor',fishing_fortune:50,fishing_exp_bonus:5,cost:50000,desc:'Базовая рыбацкая экипировка. +50 фортуны, +5% опыта рыбалки.'},
        {name:'🎣 Морская броня',type:'armor',fishing_fortune:125,fishing_exp_bonus:7,def:8,cost:500000,desc:'Улучшенная морская экипировка. +125 фортуны, +7% опыта рыбалки, +8 защиты.'},
        {name:'🎣 Броня глубин',type:'armor',fishing_fortune:200,fishing_exp_bonus:10,def:15,hp:25,cost:5000000,desc:'Редкая броня из глубин океана. +200 фортуны, +10% опыта рыбалки, +15 защиты, +25 ХП.'},
        {name:'🎣 Левиафанова броня',type:'armor',fishing_fortune:300,fishing_exp_bonus:15,def:25,hp:50,cost:50000000,desc:'Легендарная броня из чешуи Левиафана. +300 фортуны, +15% опыта рыбалки, +25 защиты, +50 ХП.'}
    ],
    foraging_armor: [
        {name:'🌲 Лесная броня',type:'armor',foraging_fortune:50,foraging_exp_bonus:5,cost:50000,desc:'Базовая лесная экипировка. +50 фортуны, +5% опыта леса.'},
        {name:'🌲 Броня лесника',type:'armor',foraging_fortune:125,foraging_exp_bonus:7,str:10,cost:500000,desc:'Улучшенная лесная экипировка. +125 фортуны, +7% опыта леса, +10 силы.'},
        {name:'🌲 Древесная броня',type:'armor',foraging_fortune:200,foraging_exp_bonus:10,str:20,def:10,cost:5000000,desc:'Редкая древесная броня. +200 фортуны, +10% опыта леса, +20 силы, +10 защиты.'},
        {name:'🌲 Броня Друида',type:'armor',foraging_fortune:300,foraging_exp_bonus:15,str:30,def:20,hp:30,cost:50000000,desc:'Легендарная броня Друида. +300 фортуны, +15% опыта леса, +30 силы, +20 защиты, +30 ХП.'}
    ],
    tool: [], // Deprecated, split into subsections
    mining_tool: [
        {name:'Деревянная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:10,cost:500},
        {name:'Каменная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:30,cost:2500},
        {name:'Железная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:60,double_chance:10,cost:15000},
        {name:'Золотая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:100,double_chance:25,cost:50000},
        {name:'Алмазная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:150,triple_chance:10,cost:250000},
        {name:'Незеритовая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:250,triple_chance:20,cost:1000000},
        {name:'Титаническая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:400,triple_chance:30,cost:10000000},
        {name:'Дивайн кирка',type:'tool',sub_type:'pickaxe',mining_fortune:600,triple_chance:50,cost:100000000},
        {name:'Разрушитель Границ',type:'tool',sub_type:'pickaxe',mining_fortune:1000,triple_chance:70,cost:5000000000}
    ],
    farming_tool: [
        {name:'Деревянная мотыга',type:'tool',sub_type:'hoe',farming_fortune:10,cost:500},
        {name:'Каменная мотыга',type:'tool',sub_type:'hoe',farming_fortune:30,cost:2500},
        {name:'Железная мотыга',type:'tool',sub_type:'hoe',farming_fortune:60,cost:15000},
        {name:'Алмазная мотыга',type:'tool',sub_type:'hoe',farming_fortune:150,cost:250000},
        {name:'Незеритовая мотыга',type:'tool',sub_type:'hoe',farming_fortune:250,cost:1000000},
        {name:'Титаническая мотыга',type:'tool',sub_type:'hoe',farming_fortune:400,cost:10000000},
        {name:'Дивайн мотыга',type:'tool',sub_type:'hoe',farming_fortune:600,cost:100000000},
        {name:'Мотыга созидания',type:'tool',sub_type:'hoe',farming_fortune:1000,farming_exp_bonus:15,cost:5000000000}
    ],
    foraging_tool: [
        {name:'Деревянный топор',type:'tool',sub_type:'axe',foraging_fortune:10,cost:500},
        {name:'Каменный топор',type:'tool',sub_type:'axe',foraging_fortune:30,cost:2500},
        {name:'Железный топор',type:'tool',sub_type:'axe',foraging_fortune:60,cost:15000},
        {name:'Золотой топор',type:'tool',sub_type:'axe',foraging_fortune:100,cost:50000},
        {name:'Алмазный топор',type:'tool',sub_type:'axe',foraging_fortune:150,cost:250000},
        {name:'Незеритовый топор',type:'tool',sub_type:'axe',foraging_fortune:250,cost:1000000},
        {name:'Титанический топор',type:'tool',sub_type:'axe',foraging_fortune:400,cost:10000000},
        {name:'Дивайн топор',type:'tool',sub_type:'axe',foraging_fortune:600,cost:100000000}
    ],
    fishing_tool: [
        {name:'Старая удочка',type:'tool',sub_type:'rod',fishing_fortune:10,cost:500},
        {name:'Укрепленная удочка',type:'tool',sub_type:'rod',fishing_fortune:30,cost:5000},
        {name:'Удочка мастера',type:'tool',sub_type:'rod',fishing_fortune:70,cost:50000},
        {name:'Морская удочка',type:'tool',sub_type:'rod',fishing_fortune:150,cost:500000},
        {name:'Удочка гиганта',type:'tool',sub_type:'rod',fishing_fortune:300,triple_chance:25,cost:100000000},
        {name:'Удочка героя',type:'tool',sub_type:'rod',fishing_fortune:500,triple_chance:25,cost:500000000}
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
        {name:'GodPotion',type:'potion',cost:1000000},
        {name:'Печенька',type:'potion',cost:10000000}
    ],
    pet: [
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
        }
    ]
};

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

        // Статы — с защитой
        this.state.stats = data.stats 
            ? { ...defaultState.stats, ...data.stats } 
            : defaultState.stats;

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
        const { error } = await supabaseClient
            .from('players')
            .upsert({
                telegram_id: this.playerTelegramId,
                coins: this.state.coins,
                next_item_id: this.state.nextItemId,
                class: this.state.class,
                skills: this.state.skills,
                stats: this.state.stats,
                inventory: this.state.inventory,
                minions: this.state.minions,
                pets: this.state.pets,
                buffs: this.state.buffs,
                farmingTalents: this.state.farmingTalents,
                foragingTalents: this.state.foragingTalents,
                activeEvent: this.state.activeEvent,
                eventEndTime: this.state.eventEndTime,
                farmingQuests: this.state.farmingQuests,
                mayor: this.state.mayor
            }, { onConflict: 'telegram_id' });
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
        if (typeof this.initGlobalMayor === 'function') await this.initGlobalMayor();
        if (typeof this.initMayor === 'function') this.initMayor();
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

    calcStats(inDungeon = false) {
        let s = {...this.state.stats, xp_bonus: 0, gold_bonus: 0, dungeon_exp_bonus: 0, dungeon_damage: 0};
        this.state.inventory.forEach(i => {
            if (i.equipped) {
                ['str','def','cc','cd','mf','int','mag_amp','xp_bonus','gold_bonus','magic_res',
                 'mining_fortune','mining_exp_bonus','foraging_fortune','foraging_exp_bonus',
                 'farming_fortune','farming_exp_bonus','fishing_fortune','fishing_exp_bonus', 'hp', 'dungeon_exp_bonus'].forEach(st => {
                    if (i[st]) s[st] += i[st];
                });
                if (i.dynamic_str === 'midas') s.str += Math.floor(Math.min(this.state.coins, 1000000000) / 1000000) * 0.5;
            }
        });
        const buffs = this.state.buffs || {};
    const godEnd = buffs.godpotion?.endTime || 0;
    const cookieEnd = buffs.cookie?.endTime || 0;

    if (Date.now() < godEnd) {
        s.str += 5; s.cc += 5; s.cd += 5; s.mf += 10; s.def += 5; s.int += 5; s.mag_amp += 5;
        s.mining_fortune += 5; s.farming_fortune += 5; s.foraging_fortune += 5; s.fishing_fortune += 5;
        s.xp_bonus += 1; s.magic_res += 5;
    }

    if (Date.now() < cookieEnd) {
        s.str += 50; s.cc += 10; s.cd += 25; s.mf += 25; s.def += 50; s.int += 50; s.mag_amp += 5;
        s.mining_fortune += 25; s.farming_fortune += 25; s.foraging_fortune += 25; s.fishing_fortune += 25;
        s.xp_bonus += 3; s.magic_res += 5; s.gold_bonus += 25;
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

        s.def += 2 * (this.state.skills.mining.lvl - 1);
        s.hp += 2 * (this.state.skills.farming.lvl - 1);
        s.str += 2 * (this.state.skills.foraging.lvl - 1);
        s.hp += 1 * (this.state.skills.fishing.lvl - 1);
        s.int += 1 * (this.state.skills.fishing.lvl - 1);
        s.str += 2 * (this.state.skills.combat.lvl - 1);
        s.cd += 2 * (this.state.skills.combat.lvl - 1);

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
                <span class="stat-label">🛡️ ОСОБАЯ ЗАЩИТА (Заглушка)</span> <span class="stat-val">${Math.floor(s.magic_res || 0)}%</span>
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
        if (typeof this.updateMayorBuffDisplay === 'function') {
            this.updateMayorBuffDisplay();
        }
        this.renderMinions();
        if (typeof this.renderInvList === 'function') {
            this.renderInvList(this.lastFilter);
        }
        if (document.getElementById('shop')?.classList.contains('active') && typeof this.renderShopList === 'function') {
            this.renderShopList(this.lastShopFilter);
        }
        if (document.getElementById('pen')?.classList.contains('active') && typeof this.renderPenList === 'function') {
            this.renderPenList();
        }
        if (document.getElementById('skillsModal').style.display === 'block') this.showModal('skillsModal');
        document.getElementById('class-select').value = this.state.class;
        this.saveToSupabase();
    },


    renderPenList() {
        // Deprecated
    },

    toggleEquipPet(idx) {
        const pet = this.state.pets[idx];
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
        const cost = petUpgradeCosts[nextRarity];
        const resourceName = petResourceMap[pet.skill];
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

    sellPet(idx) {
        const pet = this.state.pets[idx];
        this.state.coins += Math.floor(pet.cost / 2);
        this.state.pets.splice(idx, 1);
        this.msg(`${pet.name} продан!`);
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
    pet.xp += amount;
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
        this.msg(`Меч улучшен до: ${currentSword.name}!`);
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
        
        this.msg(`Миньон ${m.name} улучшен до ${nextLvl} уровня!`);
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
                    l.innerHTML += `<div class="card"><b>${i.name}</b><br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.upgradeSwordInShop()">УЛУЧШИТЬ (${i.cost.toLocaleString()}💰)</button></div></div>`;
                }
            } else if (nextIdx === 0) {
                // Если меча нет совсем, предлагаем купить первый (Каменный)
                const i = shopItems.weapon[0];
                l.innerHTML += `<div class="card"><b>${i.name}</b><br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('weapon', 0)">КУПИТЬ (${i.cost.toLocaleString()}💰)</button></div></div>`;
            } else {
                l.innerHTML = '<div class="card" style="text-align:center;color:#666">Максимальный уровень меча!</div>';
            }
            return;
        }

        if (t.endsWith('_armor')) {
            const mb = typeof this.getMayorBonuses === 'function' ? this.getMayorBonuses() : {};
            const discount = mb.shop_discount || 0;
            items.forEach((i,x)=>{
                const owned = this.state.inventory.some(inv => inv.name === i.name);
                let price = i.cost;
                if (discount) price = Math.floor(price * (1 - discount / 100));
                const statsText = this.getItemDesc(i);
                let html = `<div class="card" ${owned?'style="opacity:0.5;border-color:var(--green)"':''}><b>${i.name}</b>`;
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
                l.innerHTML+=`<div class="card"><b>${i.name}</b><br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('${t}',${nextIdx})">${action} (${i.cost.toLocaleString()}💰)</button></div></div>`;
            } else {
                l.innerHTML='<div class="card" style="text-align:center;color:#666">Максимальный уровень!</div>';
            }
            return;
        }

        items.forEach((i,x)=>{
            l.innerHTML+=`<div class="card"><b>${i.name}</b><br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('${t}',${x})">КУПИТЬ (${i.cost.toLocaleString()}💰)</button></div></div>`;
        });
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
             // Open first tab by default
             const firstTab = document.querySelector('#shop .inv-tab');
             if (firstTab) game.shopFilter('weapon', firstTab);
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

game.init();
