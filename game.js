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
            l.innerHTML += `
                <div class="card">
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
            this.addMaterial(i.name, i.type); // теперь добавление через inventory.js
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
    }
};

game.init();
