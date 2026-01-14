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
    inventory: [
        {id:1,name:'Старый меч',type:'weapon',str:15,equipped:false},
        {id:2,name:'Начальная кирка',type:'tool',sub_type:'pickaxe',equipped:true}
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
        {name:'Каменный меч',type:'weapon',str:10,cost:1000},
        {name:'Железный Меч',type:'weapon',str:20,cost:5000},
        {name:'Алмазный Меч',type:'weapon',str:30,cost:20000},
        {name:'Незеритовый Меч',type:'weapon',str:50,cost:100000}
    ],
    armor: [
        {name:'Железная Броня',type:'armor',def:10,cost:10000},
        {name:'Алмазная броня',type:'armor',def:20,cost:50000},
        {name:'Shaddow Assasins броня',type:'armor',def:25,str:25,cc:5,cd:10,cost:1000000},
        {name:'ДемонЛорд Броня',type:'armor',str:50,def:30,cc:10,cd:25,mag_amp:5,mf:25,cost:10000000},
        {name:'Накидка первопроходца',type:'armor',hp:50,str:25,int:25,def:15,cc:15,cd:25,farming_exp_bonus:3,mining_exp_bonus:3,foraging_exp_bonus:3,fishing_exp_bonus:3,dungeon_exp_bonus:3,farming_fortune:20,mining_fortune:20,foraging_fortune:20,fishing_fortune:20,cost:50000000}
    ],
    tool: [], // Deprecated, split into subsections
    mining_tool: [
        {name:'Деревянная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:10,cost:2000},
        {name:'Каменная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:20,cost:10000},
        {name:'Железная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:40,cost:50000},
        {name:'Алмазная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:60,cost:250000},
        {name:'Незеритовая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:80,cost:1000000},
        {name:'Титаническая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:150,cost:10000000},
        {name:'Дивайн кирка',type:'tool',sub_type:'pickaxe',mining_fortune:300,cost:100000000}
    ],
    farming_tool: [
        {name:'Деревянная мотыга',type:'tool',sub_type:'hoe',farming_fortune:10,cost:2000},
        {name:'Каменная мотыга',type:'tool',sub_type:'hoe',farming_fortune:20,cost:10000},
        {name:'Железная мотыга',type:'tool',sub_type:'hoe',farming_fortune:40,cost:50000},
        {name:'Алмазная мотыга',type:'tool',sub_type:'hoe',farming_fortune:60,cost:250000},
        {name:'Незеритовая мотыга',type:'tool',sub_type:'hoe',farming_fortune:80,cost:1000000},
        {name:'Титаническая мотыга',type:'tool',sub_type:'hoe',farming_fortune:150,cost:10000000},
        {name:'Дивайн мотыга',type:'tool',sub_type:'hoe',farming_fortune:300,cost:100000000}
    ],
    foraging_tool: [
        {name:'Деревянный топор',type:'tool',sub_type:'axe',foraging_fortune:10,cost:2000},
        {name:'Каменный топор',type:'tool',sub_type:'axe',foraging_fortune:20,cost:10000},
        {name:'Железный топор',type:'tool',sub_type:'axe',foraging_fortune:40,cost:50000},
        {name:'Алмазный топор',type:'tool',sub_type:'axe',foraging_fortune:60,cost:250000},
        {name:'Незеритовый топор',type:'tool',sub_type:'axe',foraging_fortune:80,cost:1000000},
        {name:'Титанический топор',type:'tool',sub_type:'axe',foraging_fortune:150,cost:10000000},
        {name:'Дивайн топор',type:'tool',sub_type:'axe',foraging_fortune:300,cost:100000000}
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
        {name:'Талисман удачи',type:'accessory',mf:10,cost:10000},
        {name:'Талисман силы',type:'accessory',str:5,cost:5000},
        {name:'Талисман защиты',type:'accessory',def:5,cost:5000},
        {name:'Талисман мощи',type:'accessory',cd:5,cc:1,cost:10000},
        {name:'Талисман знаний',type:'accessory',int:5,cost:5000},
        {name:'Талисман древних знаний',type:'accessory',int:25,mag_amp:1,cost:1000000},
        {name:'Кольцо опыта',type:'accessory',xp_bonus:1,cost:100000}
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

const minionConfig = {
    1: { cost: 50, resources: 0, storage: 32 },
    2: { cost: 250, resources: 32, storage: 40 },
    3: { cost: 1250, resources: 128, storage: 48 },
    4: { cost: 6250, resources: 512, storage: 56 },
    5: { cost: 31250, resources: 1024, storage: 64 },
    6: { cost: 156250, resources: 8, resourceName: 'Стог сена', storage: 72 },
    7: { cost: 781250, resources: 32, resourceName: 'Стог сена', storage: 80 },
    8: { cost: 3906250, resources: 64, resourceName: 'Стог сена', storage: 88 },
    9: { cost: 19531250, resources: 128, resourceName: 'Стог сена', storage: 96 },
    10: { cost: 97656250, resources: 256, resourceName: 'Стог сена', storage: 104 },
    11: { cost: 488281250, resources: 1, resourceName: 'Апгрейд Пшена', storage: 112 },
    12: { cost: 0, resources: 8, resourceName: 'Изумруд', storage: 120 },
    13: { cost: 0, resources: 1, resourceName: 'Сингулярность', storage: 128 },
    14: { cost: 0, resources: 2, resourceName: 'Сингулярность', storage: 256 },
    15: { cost: 0, resources: 4, resourceName: 'Сингулярность', storage: 512 }
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
            this.msg('Не удалось получить Telegram ID');
            this.state = JSON.parse(JSON.stringify(defaultState));
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
            this.msg('Ошибка связи с сервером');
            this.state = JSON.parse(JSON.stringify(defaultState));
            this.updateUI();
            return;
        }
        if (data) {
            this.state.coins = data.coins ?? 0;
            this.state.nextItemId = data.next_item_id ?? 10;
            this.state.class = data.class ?? '';
            this.state.skills = data.skills ?? defaultState.skills;
            this.state.stats = data.stats ?? defaultState.stats;
            this.state.inventory = data.inventory ?? defaultState.inventory;
            this.state.minions = data.minions ?? defaultState.minions;
            this.state.pets = data.pets ?? [];
            this.state.buffs = data.buffs ?? defaultState.buffs;
            this.msg('Сохранение загружено!');
        } else {
            const tgUser = tg.initDataUnsafe?.user;
            const username = tgUser?.username ? tgUser.username : null;
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
                buffs: defaultState.buffs
            };
            const { error: insertError } = await supabaseClient
                .from('players')
                .insert(newPlayer);
            if (insertError) {
                console.error('Не удалось создать нового игрока:', insertError);
                this.msg('Ошибка создания профиля');
                this.state = JSON.parse(JSON.stringify(defaultState));
            } else {
                this.state = JSON.parse(JSON.stringify(defaultState));
                this.msg('Новый профиль создан!');
            }
        }
        this.initSkills();
        Object.assign(game.state.stats, {
            mining_fortune: game.state.stats.mining_fortune ?? 0,
            mining_exp_bonus: game.state.stats.mining_exp_bonus ?? 0,
            foraging_fortune: game.state.stats.foraging_fortune ?? 0,
            foraging_exp_bonus: game.state.stats.foraging_exp_bonus ?? 0,
            farming_fortune: game.state.stats.farming_fortune ?? 0,
            farming_exp_bonus: game.state.stats.farming_exp_bonus ?? 0,
            fishing_fortune: game.state.stats.fishing_fortune ?? 0,
            fishing_exp_bonus: game.state.stats.fishing_exp_bonus ?? 0,
            magic_res: game.state.stats.magic_res ?? 0
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
                buffs: this.state.buffs
            }, { onConflict: 'telegram_id' });
        if (error) console.error('Ошибка сохранения:', error);
    },

    init: async function() {
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
        if (Date.now() < this.state.buffs.godpotion.endTime) {
            s.str += 5; s.cc += 5; s.cd += 5; s.mf += 10; s.def += 5; s.int += 5; s.mag_amp += 5;
            s.mining_fortune += 5; s.farming_fortune += 5; s.foraging_fortune += 5; s.fishing_fortune += 5;
            s.xp_bonus += 1; s.magic_res += 5;
        }
        if (Date.now() < this.state.buffs.cookie.endTime) {
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
        let totalXp = 0;
        // Навыки: 1 уровень = 1 опыт
        Object.values(this.state.skills).forEach(sk => totalXp += (sk.lvl - 1));
        
        // Уникальные питомцы
        const uniquePets = new Map();
        this.state.pets.forEach(p => {
            const rarityWeight = {common:0, rare:1, epic:2, legendary:3}[p.rarity] || 0;
            const currentScore = 1 + rarityWeight;
            if (!uniquePets.has(p.name) || uniquePets.get(p.name) < currentScore) {
                uniquePets.set(p.name, currentScore);
            }
        });
        uniquePets.forEach(score => totalXp += score);
        
        document.getElementById('sb-lvl').innerText = (totalXp / 10).toFixed(2);
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
                <span class="stat-label">💰 ГУЛД БОНУС</span> <span class="stat-val">${(s.gold_bonus || 0)}%</span>
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
            this.msg('Не хватает ресурсов или монет!');
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
        const swordProgression = ['Старый меч', 'Каменный меч', 'Железный Меч', 'Алмазный Меч', 'Незеритовый Меч'];
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
                const progress = (sk.xp / sk.next * 100).toFixed(1);
                html += `<div class="card"><b>${sk.label} LVL ${sk.lvl}</b><br><small>${Math.floor(sk.xp)} / ${Math.floor(sk.next)} XP</small><div class="hp-bar" style="margin-top:8px"><div class="hp-fill" style="width:${progress}%;background:var(--green)"></div></div></div>`;
            });
            document.getElementById('skills-content').innerHTML = html;
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
    }
};

game.init();
