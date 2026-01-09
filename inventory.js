// inventory.js — логика инвентаря (добавление, рендер, экипировка, продажа)
Object.assign(game, {
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
    addMaterial(name, type = 'material') {
        const existing = this.state.inventory.find(i => i.name === name && i.type === type);
        if (existing) existing.count = (existing.count || 1) + 1;
        else this.state.inventory.push({id: this.state.nextItemId++, name, type, count: 1});
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
        // Определяем этаж из названия сундука
        const floorMatch = i.name.match(/\d+/);
        const floor = floorMatch ? parseInt(floorMatch[0]) : 1;
        // Отладка — посмотри в консоли, какой этаж определяется
        console.log('Открытие сундука:', i.name, 'определён этаж:', floor);
        // Берём награду из dungeonRewards (если этаж не найден — берём 1-й)
        const r = dungeonRewards[floor] || dungeonRewards[1];
        const coins = Math.floor(Math.random() * (r.coins_max - r.coins_min + 1) + r.coins_min);
        this.state.coins += coins;
        if (i.count > 1) i.count--;
        else this.state.inventory = this.state.inventory.filter(x => x.id !== id);
        this.msg(`+${coins.toLocaleString()} 💰 из сундука этажа ${floor}!`);
        this.updateUI();
    },
sellItem(id) {
    const i = this.state.inventory.find(x => x.id === id);
    if (!i || i.type !== 'material') return;
    const pricePer = 2; // цена за штуку
    const amount = i.count || 1;
    const totalCoins = pricePer * amount;
    this.state.coins += totalCoins;
    // Удаляем предмет полностью (даже если count был 1)
    this.state.inventory = this.state.inventory.filter(x => x.id !== id);
    this.msg(`Продано ${amount} ${i.name}! +${totalCoins} 💰`);
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
    }
});
а
this.renderInvList(this.lastFilter); это че куда вставитьв game.js
