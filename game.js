const tg = window.Telegram?.WebApp || {};

const SUPABASE_URL = 'https://acddabgvsbqmaqfvjfst.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t63MwjVo6ILOZYH64SWORg_S_KlENDS';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const defaultState = {
    coins: 500000000,
    nextItemId: 10,
    skills: {
        mining: {lvl:1,xp:0,next:100,label:'ШАХТА'},
        farming: {lvl:1,xp:0,next:100,label:'ФЕРМА'},
        fishing: {lvl:1,xp:0,next:100,label:'РЫБАЛКА'},
        combat: {lvl:1,xp:0,next:100,label:'БОЙ'},
        foraging: {lvl:1,xp:0,next:100,label:'ЛЕС'},
        dungeons: {lvl:1,xp:0,next:200,label:'ДАНЖИ'}
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
    farmingQuests: {
        lastReset: 0,
        active: []
    },
    inventory: [
        //{id:1,name:'Старый меч',type:'weapon',str:15,equipped:false},
       // {id:2,name:'Начальная кирка',type:'tool',sub_type:'pickaxe',equipped:true}
    ],
    minions: [
        {id:'wheat',name:'ПШЕНИЧНЫЙ',cost:50,count:0,stored:0,rate:0.5},
        {id:'fish',name:'РЫБНЫЙ',cost:75,count:0,stored:0,rate:0.75},
        {id:'oak',name:'ДУБОВЫЙ',cost:100,count:0,stored:0,rate:1.0},
        {id:'coal',name:'УГОЛЬНЫЙ',cost:125,count:0,stored:0,rate:1.5}
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
        {name:'🍀 Накидка первопроходца',type:'armor',hp:50,str:25,int:25,def:15,cc:15,cd:25,farming_exp_bonus:3,mining_exp_bonus:3,foraging_exp_bonus:3,fishing_exp_bonus:3,dungeon_exp_bonus:3,farming_fortune:20,mining_fortune:20,foraging_fortune:20,fishing_fortune:20,cost:50000000},
                {name: '🌾 Farmer Armor',type: 'armor',rarity: 'rare',farming_fortune: 50,farming_exp_bonus: 5,cost: 20000,resource_cost: { wheat: 512 }},
        {name: '🌾 Melon Armor',type: 'armor',rarity: 'epic',farming_fortune: 125,farming_exp_bonus: 7,cost: 500000,resource_cost: { wheat: 64, carrot: 64, potato: 64 }},
        {name: '🌾 Fermento Armor',type: 'armor',rarity: 'legendary',farming_fortune: 200,farming_exp_bonus: 10,cost: 45000000,resource_cost: { wheat: 512, carrot: 512, potato: 512,pumpkin: 512,melon: 512,cane: 512 }},
        {name: '🌾 Helianthus Armor',type: 'armor',rarity: 'legendary',farming_fortune: 300,farming_exp_bonus: 15,cost: 9999999999999,resource_cost: { wheat: 99999, carrot: 99999, potato: 99999,pumpkin: 99999,melon: 99999,cane: 99999 }}
    ],
    tool: [], // Deprecated, split into subsections
    mining_tool: [
        {name:'Деревянная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:25,cost:5000},
        {name:'Каменная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:50,cost:25000},
        {name:'Железная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:100,cost:125000},
        {name:'Алмазная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:150,cost:750000},
        {name:'Незеритовая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:200,cost:5000000},
        {name:'Титаническая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:300,cost:50000000},
        {name:'Дивайн кирка',type:'tool',sub_type:'pickaxe',mining_fortune:500,cost:500000000}
    ],
    farming_tool: [
        {name:'Деревянная мотыга',type:'tool',sub_type:'hoe',farming_fortune:25,cost:5000},
        {name:'Каменная мотыга',type:'tool',sub_type:'hoe',farming_fortune:50,cost:25000},
        {name:'Железная мотыга',type:'tool',sub_type:'hoe',farming_fortune:100,cost:125000},
        {name:'Алмазная мотыга',type:'tool',sub_type:'hoe',farming_fortune:150,cost:750000},
        {name:'Незеритовая мотыга',type:'tool',sub_type:'hoe',farming_fortune:200,cost:5000000},
        {name:'Титаническая мотыга',type:'tool',sub_type:'hoe',farming_fortune:300,cost:50000000},
        {name:'Дивайн мотыга',type:'tool',sub_type:'hoe',farming_fortune:500,cost:500000000},
        {name:'Мотыга созидания',type:'tool',sub_type:'hoe',farming_fortune:1000,farming_exp_bonus:15,cost:5000000000}
    ],
    foraging_tool: [
        {name:'Деревянный топор',type:'tool',sub_type:'axe',foraging_fortune:25,cost:5000},
        {name:'Каменный топор',type:'tool',sub_type:'axe',foraging_fortune:50,cost:25000},
        {name:'Железный топор',type:'tool',sub_type:'axe',foraging_fortune:100,cost:125000},
        {name:'Алмазный топор',type:'tool',sub_type:'axe',foraging_fortune:150,cost:750000},
        {name:'Незеритовый топор',type:'tool',sub_type:'axe',foraging_fortune:200,cost:5000000},
        {name:'Титанический топор',type:'tool',sub_type:'axe',foraging_fortune:300,cost:50000000},
        {name:'Дивайн топор',type:'tool',sub_type:'axe',foraging_fortune:500,cost:500000000}
    ],
    fishing_tool: [
        {name:'Обычная удочка',type:'tool',sub_type:'rod',fishing_fortune:5,cost:2000},
        {name:'Необыкновенная удочка',type:'tool',sub_type:'rod',fishing_fortune:10,cost:100000},
        // Fast Rod removed as requested
        {name:'Великая удочка',type:'tool',sub_type:'rod',fishing_fortune:30,cost:25000000},
        {name:'Удочка гиганта',type:'tool',sub_type:'rod',fishing_fortune:50,triple_chance:25,cost:100000000},
        {name:'Удочка героя',type:'tool',sub_type:'rod',fishing_fortune:100,triple_chance:25,cost:500000000}
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
        }
    ]
};

const petRarityBonuses = {
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
    fishing: 'Рыба',
    foraging: 'Дерево',
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
    1: { cost: 50, resources: 0, storage: 32 },
    2: { cost: 250, resources: 32, storage: 40 },
    3: { cost: 1250, resources: 128, storage: 48 },
    4: { cost: 6250, resources: 512, storage: 56 },
    5: { cost: 31250, resources: 1024, storage: 64 },
    6: { cost: 156250, resources: 8, resourceName: 'Стог Пшена', storage: 72 },
    7: { cost: 781250, resources: 32, resourceName: 'Стог Пшена', storage: 80 },
    8: { cost: 3906250, resources: 64, resourceName: 'Стог Пшена', storage: 88 },
    9: { cost: 19531250, resources: 128, resourceName: 'Стог Пшена', storage: 96 },
    10: { cost: 97656250, resources: 256, resourceName: 'Стог Пшена', storage: 104 },
    11: { cost: 488281250, resources: 1, resourceName: 'Апгрейд Пшена', storage: 112 },
    12: { cost: 0, resources: 8, resourceName: 'Изумруд', storage: 120 },
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

        // Миньоны
        this.state.minions = Array.isArray(data.minions) 
            ? data.minions 
            : defaultState.minions;

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

        this.state.farmingQuests = data.farmingQuests || { lastReset: 0, active: [] };
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
                farmingQuests: this.state.farmingQuests
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
        let s = {...this.state.stats, xp_bonus: 0, gold_bonus: 0, dungeon_exp_bonus: 0};
        this.state.inventory.forEach(i => {
            if (i.equipped) {
                ['str','def','cc','cd','mf','int','mag_amp','xp_bonus','gold_bonus','magic_res',
                 'mining_fortune','mining_exp_bonus','foraging_fortune','foraging_exp_bonus',
                 'farming_fortune','farming_exp_bonus','fishing_fortune','fishing_exp_bonus', 'hp', 'dungeon_exp_bonus'].forEach(st => {
                    if (i[st]) s[st] += i[st];
                });
                if (i.dynamic_str === 'midas') s.str += Math.floor(25 * (this.state.coins / 1000000));
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
        // Delegate to new farming system if applicable
                if (this.currentLoc === 'farm' && typeof this.processFarmingAction === 'function' && (this.state.currentCrop || this.state.stats?.currentCrop)) {
            if (!this.state.currentCrop) this.state.currentCrop = this.state.stats.currentCrop;
            this.processFarmingAction();
            return;
        }

        const map = {mine:'mining',farm:'farming',fish:'fishing',forage:'foraging',combat:'combat'};
        const skillKey = map[this.currentLoc];
        const skill = this.state.skills[skillKey];
        const gain = 15 * skill.lvl;
        this.state.coins += gain;

        const s = this.calcStats(false);

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
            if (m.count > 0) {
                const lvl = m.lvl || 0;
                const config = minionConfig[lvl] || { storage: 32 };
                let yieldPerMin = (lvl || 1) * 40;
                if (hasCookie) yieldPerMin *= 1.25;
                
                // Накапливаем ресурсы
                m.stored = Math.min(config.storage || 32, (m.stored || 0) + (1 / 60)); // 1 единица ресурса в минуту
                m.yieldPerUnit = yieldPerMin; // Сохраняем цену за единицу
            }
        });
        this.updateUI();
    },

    collectMinion(i) {
        const m = this.state.minions[i];
        if (!m || !m.stored) return;
        const count = Math.floor(m.stored);
        const pricePerUnit = m.yieldPerUnit || ((m.lvl || 1) * 40);
        const total = count * pricePerUnit;
        
        this.state.coins += total;
        m.stored = 0;
        this.msg(`Собрано ${count} шт. на сумму ${total.toLocaleString()} 💰 с миньона ${m.name}`);
        this.updateUI();
    },

    upgradeMinion(id) {
        const m = this.state.minions.find(x => x.id === id);
        if (!m) return;
        const nextLvl = (m.lvl || 0) + 1;
        if (nextLvl > 15) { this.msg('Максимальный уровень!'); return; }
        
        const config = minionConfig[nextLvl];
        const minionResourceMap = {
            wheat: 'Пшеница',
            fish: 'Рыба',
            oak: 'Дерево',
            coal: 'Уголь'
        };
        const baseResName = minionResourceMap[m.id] || 'Пшеница';
        const resName = config.resourceName || baseResName;
        const resItem = this.state.inventory.find(i => i.name === resName && i.type === 'material');
        const resCount = resItem ? resItem.count || 0 : 0;
        
        if (this.state.coins < config.cost) {
            this.msg(`Недостаточно монет! Нужно ${config.cost.toLocaleString()} 💰`);
            return;
        }
        if (resCount < config.resources) {
            this.msg(`Недостаточно ресурсов! Нужно ${config.resources} ${resName} (у вас ${resCount})`);
            return;
        }
        
        this.state.coins -= config.cost;
        if (resItem) {
            resItem.count -= config.resources;
            if (resItem.count <= 0) {
                this.state.inventory = this.state.inventory.filter(i => i.id !== resItem.id);
            }
        }
        
        m.lvl = nextLvl;
        m.count = 1;
        this.msg(`Миньон ${m.name} улучшен до ${nextLvl} уровня!`);
        this.updateUI();
    },

    renderMinions() {
        const l = document.getElementById('minions-list');
        if (!l) return;
        l.innerHTML = '';
        this.state.minions.forEach((m, idx) => {
            const lvl = m.lvl || 0;
            const nextLvl = lvl + 1;
            const config = minionConfig[lvl] || { storage: 32 };
            const nextConfig = minionConfig[nextLvl];
            
            const minionResourceMap = {
                wheat: 'Пшеница',
                fish: 'Рыба',
                oak: 'Дерево',
                coal: 'Уголь'
            };
            const baseResName = minionResourceMap[m.id] || 'Пшеница';

            let upgradeBtn = '';
            if (nextConfig) {
                const resName = nextConfig.resourceName || baseResName;
                upgradeBtn = `<button class="act-btn" onclick="game.upgradeMinion('${m.id}')">АП (${nextLvl} LVL): ${nextConfig.cost.toLocaleString()}💰 + ${nextConfig.resources} ${resName}</button>`;
            }

            l.innerHTML += `
                <div class="card">
                    <div style="display:flex;justify-content:space-between">
                        <b>${m.name} (LVL ${lvl})</b>
                        <span style="color:var(--accent)">${Math.floor(m.stored || 0)} / ${config.storage || 32} шт.</span>
                    </div>
                    <div class="item-actions">
                        <button class="act-btn" onclick="game.collectMinion(${idx})">СОБРАТЬ</button>
                        ${upgradeBtn}
                    </div>
                </div>`;
        });
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

        // Инструменты: показываем только следующий тир
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
        if(this.state.coins < i.cost){this.msg('Не хватает монет!');return;}

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

        this.state.coins -= i.cost;
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
                { id: 'fortune', name: '🌾 Фортуна', desc: 'прирост +3', costBase: 5000, valPrefix: '+', valSuffix: ' фортуны' },
                { id: 'exp', name: '🌟 Бонус опыта', desc: 'прирост +0.5%', costBase: 10000, valPrefix: '+', valSuffix: '%' },
                { id: 'double_drop', name: '🚜 Двойной дроп', desc: 'прирост +2%', costBase: 50000, reqText: 'Нужна Фортуна Ур. 3', valPrefix: '+', valSuffix: '%' },
                { id: 'triple_drop', name: '🚜 Тройной дроп', desc: 'прирост +0.5%', costBase: 150000, reqText: 'Нужен Дв. дроп Ур. 5', valPrefix: '+', valSuffix: '%' },
                { id: 'overdrive', name: '⚡ Овердрайв', desc: 'Способность: x2 ресурсы', costBase: 500000, reqText: 'Нужна Фортуна Ур. 5', valPrefix: '', valSuffix: ' ур.' },
                { id: 'overdrive_duration', name: '⏳ Продление', desc: 'прирост +1с', costBase: 250000, reqText: 'Нужен Овердрайв Ур. 1', valPrefix: '+', valSuffix: 'с' }
            ];
            talents.forEach(t => {
                const state = this.state.farmingTalents[t.id];
                let cost = 0;
                let resReq = '';
                
                // Проверка условий (зависимости)
                let locked = false;
                if (state.req) {
                    const dep = this.state.farmingTalents[state.req.id];
                    if (dep.lvl < state.req.lvl) locked = true;
                }

                if (t.id === 'fortune') {
                    const costs = [5000, 25000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000, 25000000];
                    cost = costs[state.lvl] || 500000;
                    if (state.lvl === 2) resReq = '<br><small style="color:var(--accent)">+ 256 Пшеницы</small>';
                } else {
                    cost = t.costBase * (state.lvl + 1);
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

        let cost = 0;
        let resCost = null;

        if (id === 'fortune') {
            const costs = [5000, 25000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000, 25000000];
            cost = costs[t.lvl] || 500000;
            if (t.lvl === 2) resCost = { name: 'Пшеница', count: 256 };
        } else {
            cost = 10000 * (t.lvl + 1);
        }

        if (this.state.coins < cost) {
            this.msg('Не хватает монет!');
            return;
        }

        if (resCost) {
            const invItem = this.state.inventory.find(i => i.name === resCost.name && i.type === 'material');
            if (!invItem || invItem.count < resCost.count) {
                this.msg(`Нужно ${resCost.count} ${resCost.name}!`);
                return;
            }
            invItem.count -= resCost.count;
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
            if (!extraBtn) {
                const card = document.querySelector('#action-loc .card');
                const div = document.createElement('div');
                div.id = 'extra-action-container';
                div.style.marginTop = '10px';
                div.innerHTML = `
                    <button id="overdrive-btn" class="act-btn" style="width:100%; height:45px; background:var(--blue); font-weight:bold;" onclick="game.useOverdrive()">
                        ⚡ ОВЕРДРАЙВ (10с)
                    </button>
                `;
                card.appendChild(div);
            } else {
                extraBtn.style.display = 'block';
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
        const extraDuration = (this.state.farmingTalents?.overdrive_duration?.lvl || 0) * 1000;
        const totalDuration = 10000 + extraDuration;
        
        this.state.overdriveActive = true;
        this.msg(`⚡ ОВЕРДРАЙВ АКТИВИРОВАН! (x2 на ${totalDuration/1000} сек)`);
        const btn = document.getElementById('overdrive-btn');
        if (btn) btn.disabled = true;
        
        setTimeout(() => {
            this.state.overdriveActive = false;
            this.msg('Овердрайв закончился');
            if (btn) btn.disabled = false;
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
