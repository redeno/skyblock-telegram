const tg = window.Telegram?.WebApp || {};

// === SUPABASE ПОДКЛЮЧЕНИЕ ===
const SUPABASE_URL = 'https://acddabgvsbqmaqfvjfst.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t63MwjVo6ILOZYH64SWORg_S_KlENDS';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === ДЕФОЛТНОЕ СОСТОЯНИЕ ===
const defaultState = {
    coins: 0,
    nextItemId: 10,
    skills: {
        mining: {lvl:1,xp:0,next:100,label:'ШАХТА'},
        farming: {lvl:1,xp:0,next:100,label:'ФЕРМА'},
        fishing: {lvl:1,xp:0,next:100,label:'РЫБАЛКА'},
        combat: {lvl:1,xp:0,next:100,label:'БОЙ'},
        foraging: {lvl:1,xp:0,next:100,label:'ЛЕС'},
        dungeons: {lvl:1,xp:0,next:200,label:'ДАНЖИ'}
    },
    stats: {hp:100,str:10,def:0,cc:5,cd:50,mf:0,int:0,mag_amp:0},
    class: '',
    buffs: {godpotion:{endTime:0}},
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

const dungeonRewards = {
    1: {coins_min:50, coins_max:250, drops:[]},
    2: {coins_min:300, coins_max:500, drops:[{chance:1, items:[
        {name:'Талисман силы +1',type:'accessory',str:1},
        {name:'Талисман крита +1',type:'accessory',cd:1},
        {name:'Талисман удачи +1',type:'accessory',mf:1}
    ]}]},
    3: {coins_min:1000, coins_max:2500, drops:[{chance:1, item:{name:'Талисман защиты +20',type:'accessory',def:20}}]},
    4: {coins_min:5000, coins_max:25000, drops:[
        {chance:1, item:{name:'Меч Мидаса',type:'weapon',dynamic_str:'midas'}},
        {chance:1, item:{name:'Талисман золота +5%',type:'accessory',gold_bonus:5}}
    ]},
    5: {coins_min:10000, coins_max:40000, drops:[
        {chance:3, item:{name:'Меч Гиганта',type:'weapon',str:100,cd:50}},
        {chance:5, item:{name:'Меч Мидаса',type:'weapon',dynamic_str:'midas'}}
    ]},
    6: {coins_min:100000, coins_max:500000, drops:[{chance:0.5, item:{name:'Гиперион',type:'weapon',magic:true}}]}
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
        {name:'ДемонЛорд Броня',type:'armor',str:50,def:30,cc:10,cd:25,mag_amp:5,mf:25,cost:10000000}
    ],
    tool: [
        {name:'Деревянная мотыга',type:'tool',sub_type:'hoe',double_chance:5,cost:2000},
        {name:'Деревянная кирка',type:'tool',sub_type:'pickaxe',double_chance:5,cost:2000},
        {name:'Деревянный топор',type:'tool',sub_type:'axe',double_chance:5,cost:2000},
        {name:'Обычная удочка',type:'tool',sub_type:'rod',double_chance:5,cost:2000},
        {name:'Каменная мотыга',type:'tool',sub_type:'hoe',double_chance:10,cost:10000},
        {name:'Каменная кирка',type:'tool',sub_type:'pickaxe',double_chance:10,cost:10000},
        {name:'Каменный топор',type:'tool',sub_type:'axe',double_chance:10,cost:10000},
        {name:'Необыкновенная удочка',type:'tool',sub_type:'rod',double_chance:10,cost:100000},
        {name:'Быстрая Удочка',type:'tool',sub_type:'rod',double_chance:50,fast:true,cost:1000000},
        {name:'Великая удочка',type:'tool',sub_type:'rod',double_chance:30,xp_bonus:5,cost:25000000},
        {name:'Удочка гиганта',type:'tool',sub_type:'rod',double_chance:50,triple_chance:25,xp_bonus:10,cost:100000000},
        {name:'Удочка героя',type:'tool',sub_type:'rod',double_chance:100,triple_chance:25,xp_bonus:20,cost:500000000}
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
        {name:'GodPotion',type:'potion',cost:1000000}
    ],
    pet: [
        {name:'Чешуйница',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'mining',base_bonus:0.1,cost:5000},
        {name:'Кролик',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'farming',base_bonus:0.1,cost:5000},
        {name:'Сквид',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'fishing',base_bonus:0.1,cost:5000}
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
    legendary: {coins:5000000, resources:1000, upgradeItem:1}
};

const petResourceMap = {
    mining: 'Уголь',
    farming: 'Пшеница',
    fishing: 'Рыба'
};

const game = {
    state: {...defaultState},
    dungeon: {floor:1,mobIdx:0,mobHp:50,pHp:100,pMaxHp:100,mobs:['ЗОМБИ','СКЕЛЕТ','ПАУК','БОСС']},
    isBusy: false,
    currentLoc: '',
    lastFilter: 'weapon',
    lastShopFilter: 'weapon',
    messageQueue: [],
    playerTelegramId: null,

    async loadFromSupabase() {
    if (!this.playerTelegramId) {
        this.msg('Не удалось получить Telegram ID');
        this.state = JSON.parse(JSON.stringify(defaultState));
        this.updateUI();
        return;
    }

    // Сначала пытаемся найти существующую запись
    let { data, error } = await supabaseClient
        .from('players')
        .select('*')
        .eq('telegram_id', this.playerTelegramId)
        .maybeSingle();  // maybeSingle() — не падает ошибкой, если ничего нет

    if (error && error.code !== 'PGRST116') {
        console.error('Ошибка Supabase:', error);
        this.msg('Ошибка связи с сервером');
        this.state = JSON.parse(JSON.stringify(defaultState));
        this.updateUI();
        return;
    }

    if (data) {
        // Загружаем данные из базы
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
        // Если данных нет — создаем нового игрока с дефолтными значениями
        const newPlayer = {
            telegram_id: this.playerTelegramId,
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
            .insert(newPlayer); // Используем insert для создания нового игрока

        if (insertError) {
            console.error('Не удалось создать нового игрока:', insertError);
            this.msg('Ошибка создания профиля');
            this.state = JSON.parse(JSON.stringify(defaultState));
        } else {
            this.state = JSON.parse(JSON.stringify(defaultState));
            this.msg('Новый профиль создан!');
        }
    }

    this.updateUI();
},


    async saveToSupabase() {
    if (!this.playerTelegramId) return;

    // Попытка обновить запись
    const { data, error } = await supabaseClient
        .from('players')
        .update({
            coins: this.state.coins,
            next_item_id: this.state.nextItemId,
            class: this.state.class,
            skills: this.state.skills,
            stats: this.state.stats,
            inventory: this.state.inventory,
            minions: this.state.minions,
            pets: this.state.pets,
            buffs: this.state.buffs
        })
        .eq('telegram_id', this.playerTelegramId); // Обновление по уникальному ключу (telegram_id)

    // Если не удалось обновить (например, записи нет), то вставляем новую
    if (error && error.code !== 'PGRST116') {
        console.error('Ошибка обновления:', error);
        this.msg('Ошибка обновления данных');
    } else if (data.length === 0) {
        // Если данных не было обновлено (например, если записи не существует), вставляем
        const { insertError } = await supabaseClient
            .from('players')
            .insert({
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
            });

        if (insertError) {
            console.error('Ошибка создания нового игрока:', insertError);
            this.msg('Ошибка создания профиля');
        } else {
            console.log('Новый профиль создан!');
        }
    } else {
        console.log('Данные успешно обновлены!');
    }
},



    async init() {
        this.playerTelegramId = tg.initDataUnsafe?.user?.id;

        if (!this.playerTelegramId) {
            this.msg('Не удалось получить Telegram ID');
        }

        await this.loadFromSupabase();
        this.updateUI();

        setInterval(() => this.minionTick(), 1000);
        setInterval(() => this.saveToSupabase(), 10000);

        tg.expand?.();
    },

    msg(t) {
        if (this.messageQueue.includes(t)) return;
        this.messageQueue.push(t);
        try {
            if (tg && typeof tg.showAlert === 'function') {
                tg.showAlert(t);
            } else {
                throw new Error("showAlert not available");
            }
        } catch (e) {
            alert(t);
        }
        setTimeout(() => {
            this.messageQueue = this.messageQueue.filter(m => m !== t);
        }, 5000);
    },

    addMaterial(name, type = 'material') {
        const existing = this.state.inventory.find(i => i.name === name && i.type === type);
        if (existing) existing.count = (existing.count || 1) + 1;
        else this.state.inventory.push({id: this.state.nextItemId++, name, type, count: 1});
    },

    addXp(skillKey, amount) {
        const sk = this.state.skills[skillKey];
        const petBonus = this.calcPetBonus(skillKey);
        amount *= (1 + petBonus / 100);
        sk.xp += amount;
        if (sk.xp >= sk.next) {
            sk.lvl++;
            sk.xp = 0;
            sk.next *= 1.6;
            this.msg(`LEVEL UP! ${sk.label} ${sk.lvl}`);
        }
    },

    calcStats(inDungeon = false) {
        let s = {...this.state.stats, xp_bonus: 0, gold_bonus: 0};
        this.state.inventory.forEach(i => {
            if (i.equipped) {
                ['str','def','cc','cd','mf','int','mag_amp','xp_bonus','gold_bonus'].forEach(st => {
                    if (i[st]) s[st] += i[st];
                });
                if (i.dynamic_str === 'midas') s.str += Math.floor(25 * (this.state.coins / 1000000));
            }
        });
        if (Date.now() < this.state.buffs.godpotion.endTime) {
            s.str += 50; s.cc += 10; s.cd += 25; s.mf += 10; s.def += 50; s.int += 50; s.mag_amp += 5;
        }
        s.def += 2 * (this.state.skills.mining.lvl - 1);
        s.hp += 2 * (this.state.skills.farming.lvl - 1);
        s.str += 2 * (this.state.skills.foraging.lvl - 1);
        s.hp += 1 * (this.state.skills.fishing.lvl - 1);
        s.int += 1 * (this.state.skills.fishing.lvl - 1);
        s.str += 2 * (this.state.skills.combat.lvl - 1);
        s.cd += 2 * (this.state.skills.combat.lvl - 1);
        if (inDungeon) {
            const dunMul = 1 + 0.015 * (this.state.skills.dungeons.lvl - 1);
            s.hp *= dunMul; s.str *= dunMul; s.def *= dunMul;
            s.cc *= dunMul; s.cd *= dunMul; s.int *= dunMul; s.mag_amp *= dunMul;
        }
        const c = this.state.class;
        if (c === 'berserk' && inDungeon) s.str *= 1.2;
        else if (c === 'tank') { s.def *= 1.3; s.str *= 1.05; }
        else if (c === 'mage') s.mag_amp *= 1.2;
        else if (c === 'healer') {
            Object.keys(s).forEach(k => { if (typeof s[k] === 'number') s[k] *= 1.05; });
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
        const inDungeon = document.getElementById('battle-screen')?.classList.contains('active') || false;
        const s = this.calcStats(inDungeon);
        document.getElementById('coins-val').innerText = Math.floor(this.state.coins).toLocaleString();
        document.getElementById('m-coins-val').innerText = Math.floor(this.state.coins).toLocaleString();
        const totalLvl = Object.values(this.state.skills).reduce((a,b) => a + b.lvl, 0) - 6;
        document.getElementById('sb-lvl').innerText = (totalLvl / 10).toFixed(2);
        document.getElementById('stats-display').innerHTML = `
            <div><span class="stat-label">❤️ ЗДОРОВЬЕ:</span> <span class="stat-val">${Math.floor(s.hp)}</span></div>
            <div><span class="stat-label">⚔️ СИЛА:</span> <span class="stat-val">${Math.floor(s.str)}</span></div>
            <div><span class="stat-label">🛡️ БРОНЯ:</span> <span class="stat-val">${Math.floor(s.def)}</span></div>
            <div><span class="stat-label">💥 КРИТ ШАНС:</span> <span class="stat-val">${Math.floor(s.cc)}%</span></div>
            <div><span class="stat-label">🔥 КРИТ УРОН:</span> <span class="stat-val">${Math.floor(s.cd)}%</span></div>
            <div><span class="stat-label">🍀 УДАЧА:</span> <span class="stat-val">${Math.floor(s.mf)}</span></div>
            <div><span class="stat-label">🧠 ИНТЕЛЛЕКТ:</span> <span class="stat-val">${Math.floor(s.int)}</span></div>
            <div><span class="stat-label">🔮 МАГ УСИЛЕНИЕ:</span> <span class="stat-val">${Math.floor(s.mag_amp)}</span></div>`;
        this.renderMinions();
        this.renderInvList(this.lastFilter);
        if (document.getElementById('shop').classList.contains('active')) this.renderShopList(this.lastShopFilter);
        if (document.getElementById('pen').classList.contains('active')) this.renderPenList();
        if (document.getElementById('skillsModal').style.display === 'block') this.showModal('skillsModal');
        document.getElementById('class-select').value = this.state.class;

        this.saveToSupabase();
    },

    renderPenList() {
        const l = document.getElementById('pen-list');
        l.innerHTML = '';
        this.state.pets.forEach((pet, idx) => {
            const rarity = pet.rarity.toUpperCase();
            const bonus = (petRarityBonuses[pet.rarity] * pet.lvl * 100).toFixed(1);
            l.innerHTML += `<div class="card">
                <b>${pet.name} (${rarity}, LVL ${pet.lvl})</b><br>
                <small>+${bonus}% XP в ${pet.skill.toUpperCase()}</small><br>
                <div class="item-actions">
                    <button class="act-btn" onclick="game.toggleEquipPet(${idx})">${pet.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>
                    <button class="act-btn" onclick="game.upgradePet(${idx})">УЛУЧШИТЬ</button>
                    <button class="act-btn" onclick="game.sellPet(${idx})">ПРОДАТЬ (${Math.floor(pet.cost / 2)}💰)</button>
                </div>
            </div>`;
        });
        if (!this.state.pets.length) l.innerHTML = '<div class="card" style="text-align:center;color:#666">Пусто</div>';
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
        const upgradeItem = this.state.inventory.find(i => i.name === 'Апгрейд петомца' && i.type === 'material');
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
        const map = {mine:'mining',farm:'farming',fish:'fishing',forage:'foraging'};
        const skillKey = map[this.currentLoc];
        const skill = this.state.skills[skillKey];
        const gain = 15 * skill.lvl;
        this.state.coins += gain;
        this.addXp(skillKey, 20);
        const mat = {mine:'Уголь',farm:'Пшеница',fish:'Рыба',forage:'Дерево'}[this.currentLoc];
        let count = 1;
        const equippedTool = this.state.inventory.find(i => i.equipped && i.type === 'tool' && i.sub_type);
        if (equippedTool) {
            if (equippedTool.triple_chance && Math.random() * 100 < equippedTool.triple_chance) count = 3;
            else if (equippedTool.double_chance && Math.random() * 100 < equippedTool.double_chance) count = 2;
        }
        for (let i = 0; i < count; i++) this.addMaterial(mat);
        document.getElementById('loc-log').innerText = `+${gain} 💰 | +20 XP | +${count} ${mat}`;
        this.updateUI();
    },

    buyExtraChest(level) {
        const costs = this.dungeon.floor >= 5 ? [3000000, 5000000, 10000000] : [10000000, 15000000, 20000000];
        const names = ['Обычный', 'Эпический', 'Элитный'];
        const cost = costs[level - 1];
        if (this.state.coins < cost) { this.msg('Не хватает монет!'); return; }
        this.state.coins -= cost;
        this.addMaterial(`Сундук ${this.dungeon.floor} этажа ${names[level - 1]}`, 'chest');
        this.msg(`Куплен ${names[level - 1]} сундук!`);
        this.updateUI();
    },

    giveDungeonReward() {
        const s = this.calcStats(true);
        const r = dungeonRewards[this.dungeon.floor];
        let coins = Math.floor(Math.random() * (r.coins_max - r.coins_min + 1) + r.coins_min);
        coins = Math.floor(coins * (1 + s.gold_bonus / 100));
        this.state.coins += coins;
        this.addXp('dungeons', this.dungeon.floor * 100);
        r.drops?.forEach(drop => {
            if (Math.random() * 100 < (drop.chance + s.mf)) {
                const item = drop.item || drop.items[Math.floor(Math.random() * drop.items.length)];
                this.state.inventory.push({...item, id: this.state.nextItemId++, equipped: false});
                this.msg(`Выпал ${item.name}!`);
            }
        });
        let upgradeChance = this.dungeon.floor >= 5 ? 5 : 1;
        if (Math.random() * 100 < upgradeChance) {
            this.addMaterial('Апгрейд петомца', 'material');
            this.msg('Выпал Апгрейд петомца!');
        }
        this.addMaterial(`Сундук этажа ${this.dungeon.floor}`, 'chest');
        if (this.dungeon.floor >= 5) {
            document.getElementById('extra-chests').style.display = 'block';
        } else {
            document.getElementById('extra-chests').style.display = 'none';
        }
        this.updateUI();
    },

    getItemDesc(i) {
        let d = '';
        if (i.str) d += `+${i.str} СИЛЫ `;
        if (i.def) d += `+${i.def} БРОНИ `;
        if (i.cc) d += `+${i.cc}% КРИТ ШАНС `;
        if (i.cd) d += `+${i.cd}% КРИТ УРОН `;
        if (i.mf) d += `+${i.mf} УДАЧИ `;
        if (i.int) d += `+${i.int} ИНТЕЛЛЕКТА `;
        if (i.mag_amp) d += `+${i.mag_amp} МАГ УСИЛЕНИЯ `;
        if (i.xp_bonus) d += `+${i.xp_bonus}% ОПЫТА `;
        if (i.double_chance) d += `+${i.double_chance}% ШАНС УДВОЕНИЯ `;
        if (i.triple_chance) d += `+${i.triple_chance}% ШАНС УТРОЕНИЯ `;
        if (i.fast) d += 'БЫСТРАЯ ';
        if (i.dynamic_str === 'midas') d += 'МИДАС ';
        if (i.magic) d += 'МАГИЧЕСКОЕ ';
        if (i.type === 'pet') d += `+${(petRarityBonuses[i.rarity] * i.lvl * 100).toFixed(1)}% XP в ${i.skill.toUpperCase()} `;
        return d || 'ПРЕДМЕТ';
    },

    dungeonAttack() {
        const inDungeon = true;
        const s = this.calcStats(inDungeon);
        const weapon = this.state.inventory.find(i => i.equipped && i.type === 'weapon');
        let damage = weapon?.magic ? s.int * s.mag_amp * 100 : s.str;
        let msgText = '';
        if (this.state.class === 'berserk' && Math.random() < 0.2) {
            damage *= 2;
            msgText += 'ДВОЙНОЙ УДАР! ';
        }
        if (this.state.class === 'archer') {
            if (this.dungeon.mobIdx < 3 && Math.random() < 0.2) {
                damage = 999999;
                msgText += 'ВАНШОТ! ';
            } else if (this.dungeon.mobIdx === 3 && Math.random() < 0.03) {
                damage = this.dungeon.mobHp * 0.4;
                msgText += 'Мощный выстрел по боссу! ';
            }
        }
        if (Math.random() * 100 < s.cc) {
            damage *= (1 + s.cd / 100);
            msgText += 'КРИТИЧЕСКИЙ УДАР! ';
        }
        this.dungeon.mobHp -= damage;
        const baseMobDmg = (this.dungeon.mobIdx === 3 ? 6 : 4) * this.dungeon.floor;
        const actualDmg = Math.max(1, baseMobDmg - s.def);
        this.dungeon.pHp -= actualDmg;
        if (msgText) this.msg(msgText.trim());
        if (this.dungeon.mobHp <= 0) {
            this.addXp('combat', this.dungeon.mobIdx === 3 ? 50 : 20);
            this.dungeon.mobIdx++;
            if (this.dungeon.mobIdx >= 4) {
                this.giveDungeonReward();
                this.switchTab('loot-screen');
            } else {
                this.dungeon.mobHp = (this.dungeon.mobIdx === 3 ? 80 : 50) * this.dungeon.floor;
                if (this.state.class === 'healer') {
                    this.dungeon.pHp = Math.min(this.dungeon.pMaxHp, this.dungeon.pHp + this.dungeon.pMaxHp * 0.2);
                    this.msg('МОБ УБИТ! +20% ХП (Хиллер)');
                } else {
                    this.msg('МОБ УБИТ!');
                }
                this.updateBattleUI();
            }
        } else if (this.dungeon.pHp <= 0) {
            this.msg(`ТЫ УМЕР на этаже ${this.dungeon.floor}!`);
            this.switchTab('portal');
        } else {
            this.updateBattleUI();
        }
    },

    updateBattleUI() {
        document.getElementById('mob-name').innerText = this.dungeon.mobs[this.dungeon.mobIdx];
        const maxMobHp = (this.dungeon.mobIdx === 3 ? 80 : 50) * this.dungeon.floor;
        document.getElementById('m-hp-txt').innerText = `${Math.max(0, Math.floor(this.dungeon.mobHp))}/${maxMobHp}`;
        document.getElementById('m-hp-fill').style.width = `${Math.max(0, this.dungeon.mobHp / maxMobHp * 100)}%`;
        document.getElementById('p-hp-txt').innerText = `${Math.max(0, Math.floor(this.dungeon.pHp))}/${Math.floor(this.dungeon.pMaxHp)}`;
        document.getElementById('p-hp-fill').style.width = `${this.dungeon.pHp / this.dungeon.pMaxHp * 100}%`;
    },

    renderMinions(){
        const l=document.getElementById('minions-list');l.innerHTML='';
        this.state.minions.forEach((m,i)=>{
            const buy=this.state.coins>=m.cost&&m.count<13;
            const coll=m.stored>=0.1;
            l.innerHTML+=`<div class="card"><div style="display:flex;justify-content:space-between"><b>${m.name} (${m.count}/13)</b><span>📦 ${m.stored.toFixed(1)}/64</span></div><div class="item-actions"><button class="act-btn" ${!buy?'disabled':''} onclick="game.buyMinion(${i})">КУПИТЬ (${Math.floor(m.cost)}💰)</button><button class="act-btn" ${!coll?'disabled':''} onclick="game.collectMinion(${i})">СОБРАТЬ (${Math.floor(m.stored*20)}💰)</button></div></div>`;
        });
    },

    buyMinion(i){
        const m=this.state.minions[i];
        if(this.state.coins>=m.cost&&m.count<13){
            this.state.coins-=m.cost;
            m.count++;
            m.cost*=1.5;
            m.rate*=1.2;
            this.updateUI();
            this.msg('Миньон улучшен!');
        }
    },

    collectMinion(i){
        const m=this.state.minions[i];
        if(m.stored>=0.1){
            const g=Math.floor(m.stored*20);
            this.state.coins+=g;
            m.stored=0;
            this.updateUI();
            this.msg(`+${g} 💰 от миньона!`);
        }
    },

    minionTick(){
        let u=false;
        this.state.minions.forEach(m=>{
            if(m.count>0){
                const o=m.stored;
                m.stored=Math.min(64,m.stored+m.rate*m.count/30);
                if(Math.floor(m.stored*10)>Math.floor(o*10)) u=true;
            }
        });
        if(u||document.querySelector('#minions.active')){
            this.renderMinions();
            document.getElementById('m-coins-val').innerText=Math.floor(this.state.coins).toLocaleString();
        }
    },

    shopFilter(t,e){
        document.querySelectorAll('#shop .inv-tab').forEach(x=>x.classList.remove('active'));
        e.classList.add('active');
        this.lastShopFilter=t;
        this.renderShopList(t);
    },

    renderShopList(t){
        const l=document.getElementById('shop-list');
        l.innerHTML='';
        (shopItems[t]||[]).forEach((i,x)=>{
            l.innerHTML+=`<div class="card"><b>${i.name}</b><br><small>${this.getItemDesc(i)}</small><div class="item-actions"><button class="act-btn" onclick="game.buyShopItem('${t}',${x})">КУПИТЬ (${i.cost.toLocaleString()}💰)</button></div></div>`;
        });
    },

    buyShopItem(t,x){
        const i=shopItems[t][x];
        if(this.state.coins<i.cost){this.msg('Не хватает монет!');return;}
        this.state.coins-=i.cost;
        if (i.type === 'pet') {
            this.state.pets.push({...i, equipped:false});
            this.msg(`${i.name} куплен и добавлен в Загон!`);
        } else {
            this.state.inventory.push({...i,id:this.state.nextItemId++,equipped:false});
            this.msg(`${i.name} куплен!`);
        }
        this.updateUI();
    },

    filterInv(t,e){
        document.querySelectorAll('.inv-tab').forEach(x=>x.classList.remove('active'));
        e.classList.add('active');
        this.lastFilter=t;
        this.renderInvList(t);
    },

    renderInvList(t){
        const l=document.getElementById('inv-list');
        l.innerHTML='';
        const items = t === 'pet' ? this.state.pets : this.state.inventory.filter(i=>i.type===t);
        if(!items.length){l.innerHTML='<div class="card" style="text-align:center;color:#666">Пусто</div>';return;}
        items.forEach((i, idx)=>{
            const c=i.count>1?` (${i.count})`:'';let a='';
            if (t === 'pet') {
                a = `<button class="act-btn" onclick="game.toggleEquipPet(${idx})">${i.equipped?'СНЯТЬ':'НАДЕТЬ'}</button><button class="act-btn" onclick="game.upgradePet(${idx})">УЛУЧШИТЬ</button><button class="act-btn" onclick="game.sellPet(${idx})">ПРОДАТЬ (${Math.floor(i.cost/2)}💰)</button>`;
            } else if(i.type==='material') a=`<button class="act-btn" onclick="game.sellItem(${i.id})">ПРОДАТЬ (2💰/шт)</button>`;
            else if(i.type==='chest')a=`<button class="act-btn" onclick="game.openChest(${i.id})">ОТКРЫТЬ</button>`;
            else if(['weapon','armor','tool','accessory'].includes(i.type))a=`<button class="act-btn" onclick="game.toggleEquip(${i.id})">${i.equipped?'СНЯТЬ':'НАДЕТЬ'}</button>`;
            else if(i.type==='potion'&&i.name==='GodPotion')a=`<button class="act-btn" onclick="game.activateGodPotion(${i.id})">АКТИВИРОВАТЬ</button>`;
            l.innerHTML+=`<div class="card"><b>${i.name}${c}</b><br><small>${this.getItemDesc(i)}</small><div class="item-actions">${a}</div></div>`;
        });
    },

    activateGodPotion(id){
        const i=this.state.inventory.find(x=>x.id===id);
        if(!i||i.name!=='GodPotion')return;
        if(Date.now()<this.state.buffs.godpotion.endTime){this.msg('Уже активен!');return;}
        this.state.buffs.godpotion.endTime=Date.now()+86400000;
        this.state.inventory=this.state.inventory.filter(x=>x.id!==id);
        this.msg('GodPotion на 24 часа!');
        this.updateUI();
    },

    openChest(id){
        const i=this.state.inventory.find(x=>x.id===id);
        if(!i||i.type!=='chest')return;
        const floorMatch = i.name.match(/\d+/);
        const floor = floorMatch ? parseInt(floorMatch[0]) : 1;
        const r = dungeonRewards[floor] || dungeonRewards[1];
        const coins = Math.floor(Math.random() * (r.coins_max - r.coins_min + 1) + r.coins_min);
        this.state.coins += coins;
        if (i.count > 1) i.count--;
        else this.state.inventory = this.state.inventory.filter(x => x.id !== id);
        this.msg(`+${coins} 💰 из сундука!`);
        this.updateUI();
    },

    sellItem(id){
        const i=this.state.inventory.find(x=>x.id===id);
        if(!i||i.type!=='material')return;
        const p=2,c=i.count||1;
        this.state.coins+=p*c;
        if(c>1)i.count-=c;
        else this.state.inventory=this.state.inventory.filter(x=>x.id!==id);
        this.msg(`Продано! +${p*c} 💰`);
        this.updateUI();
    },

    toggleEquip(id){
        const i=this.state.inventory.find(x=>x.id===id);
        if(!i||!['weapon','armor','tool','accessory'].includes(i.type))return;
        if(i.type==='weapon')this.state.inventory.forEach(x=>{if(x.type==='weapon'&&x.id!==id)x.equipped=false;});
        if(i.type==='armor')this.state.inventory.forEach(x=>{if(x.type==='armor'&&x.id!==id)x.equipped=false;});
        if(i.type==='tool')this.state.inventory.forEach(x=>{if(x.type==='tool'&&x.sub_type===i.sub_type&&x.id!==id)x.equipped=false;});
        i.equipped=!i.equipped;
        this.updateUI();
    },

    switchTab(id, el) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        if (el) {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
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
    },

    startDungeon(floor) {
        const req = (floor - 1) * 5 + 1;
        if (this.state.skills.dungeons.lvl < req) {
            this.msg(`Требуется уровень ДАНЖЕЙ ${req}`);
            return;
        }
        const s = this.calcStats(true);
        this.dungeon = {
            floor,
            mobIdx: 0,
            mobHp: 50 * floor,
            pHp: s.hp,
            pMaxHp: s.hp,
            mobs: ['ЗОМБИ','СКЕЛЕТ','ПАУК','БОСС']
        };
        this.updateBattleUI();
        this.switchTab('battle-screen');
    }
};

game.init();
