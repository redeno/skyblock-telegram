// inventory.js — логика инвентаря (с stackable талисманами, показом статов, правильной продажей)

Object.assign(game, {
    getItemDesc(i) {
        let d = '';
        if (i.hp) d += `+${i.hp} ХП `;
        if (i.str) d += `+${i.str} СИЛЫ `;
        if (i.def) d += `+${i.def} БРОНИ `;
        if (i.cc) d += `+${i.cc}% КРИТ ШАНС `;
        if (i.cd) d += `+${i.cd}% КРИТ УРОН `;
        if (i.mf) d += `+${i.mf} УДАЧИ `;
        if (i.int) d += `+${i.int} ИНТЕЛЛЕКТА `;
        if (i.mag_amp) d += `+${i.mag_amp} МАГ УСИЛЕНИЯ `;
        if (i.xp_bonus) d += `+${i.xp_bonus}% ОПЫТА `;
        if (i.dungeon_exp_bonus) d += `+${i.dungeon_exp_bonus}% ОПЫТА ДАНЖЕЙ `;
        if (i.mining_fortune) d += `+${i.mining_fortune} МАЙНИНГ ФОРТУНЫ `;
        if (i.farming_fortune) d += `+${i.farming_fortune} ФАРМИНГ ФОРТУНЫ `;
        if (i.foraging_fortune) d += `+${i.foraging_fortune} ЛЕСНОЙ ФОРТУНЫ `;
        if (i.fishing_fortune) d += `+${i.fishing_fortune} ФИШИНГ ФОРТУНЫ `;
        if (i.double_chance) d += `+${i.double_chance}% ШАНС УДВОЕНИЯ `;
        if (i.triple_chance) d += `+${i.triple_chance}% ШАНС УТРОЕНИЯ `;
        if (i.fast) d += 'БЫСТРАЯ ';
        if (i.dynamic_str === 'midas') d += 'МИДАС ';
        if (i.magic) d += 'МАГИЧЕСКОЕ ';
        
        if (i.type === 'pet') {
            const petBonus = (petRarityBonuses[i.rarity] * i.lvl).toFixed(1);
            if (i.name === 'Тигр') {
                d = `Увеличивает урон за каждый удар по цели. Сила и Крит. урон зависят от уровня.`;
            } else if (i.name === 'Бейби Иссушитель') {
                d = `+${petBonus}% К ОПЫТУ ДАНЖЕЙ И БОЯ.`;
            } else if (i.skill) {
                d = `+${petBonus}% К ОПЫТУ ${i.skill === 'mining' ? 'ШАХТЫ' : i.skill === 'farming' ? 'ФЕРМЫ' : i.skill === 'fishing' ? 'РЫБАЛКИ' : i.skill === 'foraging' ? 'ЛЕСА' : 'БОЯ'}.`;
            }
        }
        return d.trim() || 'Без бонусов';
    },

    addMaterial(name, type = 'material') {
        const existing = this.state.inventory.find(i => i.name === name && i.type === type);
        if (existing) {
            existing.count = (existing.count || 1) + 1;
        } else {
            this.state.inventory.push({
                id: this.state.nextItemId++,
                name,
                type,
                count: 1,
                equipped: false
            });
        }
    },

    filterInv(t, e) {
        document.querySelectorAll('.inv-tab').forEach(x => x.classList.remove('active'));
        e.classList.add('active');
        this.lastFilter = t;
        this.renderInvList(t);
    },

    renderInvList(t) {
        const l = document.getElementById('inv-list');
        l.innerHTML = '';

        let items = [];

        if (t === 'pet') {
            items = this.state.pets;
        } else if (t === 'buff') {
            items = this.state.inventory.filter(i => i.type === 'potion' || i.type === 'buff');
        } else {
            items = this.state.inventory.filter(i => i.type === t);
        }

        if (!items.length) {
            l.innerHTML = '<div class="card" style="text-align:center;color:#666">Пусто</div>';
            return;
        }

        items.forEach((i, idx) => {
            const c = i.count > 1 ? ` (${i.count})` : '';
            let a = '';

            if (t === 'pet') {
                a = `
                    <button class="act-btn" onclick="game.toggleEquipPet(${idx})">${i.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>
                    <button class="act-btn" onclick="game.upgradePet(${idx})">УЛУЧШИТЬ</button>
                    <button class="act-btn" onclick="game.sellPet(${idx})">ПРОДАТЬ (${Math.floor(i.cost / 2)}💰)</button>
                `;
            } else if (i.type === 'material') {
                const pricePer = (i.name === 'Апгрейд питомца') ? 8000000 : 2;
                a = `<button class="act-btn" onclick="game.sellItem(${i.id})">ПРОДАТЬ (${pricePer * (i.count || 1)}💰)</button>`;
            } else if (i.type === 'accessory') {
                const sellPrice = i.cost ? Math.floor(i.cost / 2 * (i.count || 1)) : 2 * (i.count || 1);
                a = `
                    <button class="act-btn" onclick="game.toggleEquip(${i.id})">${i.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>
                    <button class="act-btn" onclick="game.sellItem(${i.id})">ПРОДАТЬ (${sellPrice}💰)</button>
                `;
            } else if (i.type === 'chest') {
                a = `<button class="act-btn" onclick="game.openChest(${i.id})">ОТКРЫТЬ</button>`;
            } else if (['weapon','armor','tool'].includes(i.type)) {
                a = `<button class="act-btn" onclick="game.toggleEquip(${i.id})">${i.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>`;
            } else if (i.type === 'potion') {
                if (i.name === 'GodPotion') {
                    a = `<button class="act-btn" onclick="game.activateGodPotion(${i.id})">АКТИВИРОВАТЬ (1ч)</button>`;
                } else if (i.name === 'Печенька') {
                    a = `<button class="act-btn" onclick="game.activateCookie(${i.id})">АКТИВИРОВАТЬ (4ч)</button>`;
                }
            }

            l.innerHTML += `
                <div class="card">
                    <b>${i.name}${c}</b><br>
                    <small style="color:#0f0; font-weight:bold">${game.getItemDesc(i)}</small>
                    <div class="item-actions">${a}</div>
                </div>`;
        });
    },

    activateGodPotion(id) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i || i.name !== 'GodPotion') return this.msg('Зелье не найдено');

        if (this.state.buffs.godpotion.endTime && Date.now() < this.state.buffs.godpotion.endTime) {
            this.msg('GodPotion уже активен!');
            return;
        }

        this.state.buffs.godpotion.endTime = Date.now() + 3600000; // 1 час
        this.state.inventory = this.state.inventory.filter(x => x.id !== id);
        this.msg('GodPotion активирован на 1 час!');
        this.updateUI();
    },

    activateCookie(id) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i || i.name !== 'Печенька') return this.msg('Печенька не найдена');

        if (this.state.buffs.cookie.endTime && Date.now() < this.state.buffs.cookie.endTime) {
            this.msg('Печенька уже активна!');
            return;
        }

        this.state.buffs.cookie.endTime = Date.now() + 14400000; // 4 часа
        this.state.inventory = this.state.inventory.filter(x => x.id !== id);
        this.msg('Печенька активирована на 4 часа!');
        this.updateUI();
    },

    openChest(id) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i || i.type !== 'chest') return;
        const floorMatch = i.name.match(/\d+/);
        const floor = floorMatch ? parseInt(floorMatch[0]) : 1;
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
        if (!i || (i.type !== 'material' && i.type !== 'accessory')) return;

        let pricePer;
        if (i.type === 'material') {
            pricePer = (i.name === 'Апгрейд питомца') ? 8000000 : 2;
        } else if (i.type === 'accessory') {
            pricePer = i.cost ? Math.floor(i.cost / 2) : 2;
        }

        const amount = i.count || 1;
        const total = pricePer * amount;
        this.state.coins += total;
        this.state.inventory = this.state.inventory.filter(x => x.id !== id);
        this.msg(`Продано ${amount} ${i.name}! +${total.toLocaleString()} 💰`);
        this.updateUI();
    },

    toggleEquip(id) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i || !['weapon','armor','tool','accessory'].includes(i.type)) return;

        if (i.type === 'accessory') {
            this.state.inventory.forEach(x => {
                if (x.type === 'accessory' && x.id !== id) x.equipped = false;
            });
        } else {
            if (i.type === 'weapon') this.state.inventory.forEach(x => { if (x.type === 'weapon' && x.id !== id) x.equipped = false; });
            if (i.type === 'armor') this.state.inventory.forEach(x => { if (x.type === 'armor' && x.id !== id) x.equipped = false; });
            if (i.type === 'tool') this.state.inventory.forEach(x => { if (x.type === 'tool' && x.sub_type === i.sub_type && x.id !== id) x.equipped = false; });
        }

        i.equipped = !i.equipped;
        this.msg(i.equipped ? `${i.name} надет!` : `${i.name} снят!`);
        this.updateUI();
    }
});

// Отдельная функция улучшения меча (вне Object.assign, чтобы не было синтаксической ошибки)
game.upgradeSword = function(id) {
    const i = this.state.inventory.find(x => x.id === id);
    if (!i || i.type !== 'weapon') return;

    const swordProgression = ['Каменный меч', 'Железный Меч', 'Алмазный Меч', 'Незеритовый Меч'];
    const currentIdx = swordProgression.indexOf(i.name);
    if (currentIdx === -1 || currentIdx >= swordProgression.length - 1) return;

    const nextSword = shopItems.weapon.find(w => w.name === swordProgression[currentIdx + 1]);
    if (!nextSword) return;

    if (this.state.coins < nextSword.cost) {
        this.msg(`Недостаточно монет! Нужно ${nextSword.cost}💰`);
        return;
    }

    this.state.coins -= nextSword.cost;
    i.name = nextSword.name;
    i.str = nextSword.str;
    this.msg(`Меч улучшен до: ${i.name}!`);
    this.updateUI();
};
