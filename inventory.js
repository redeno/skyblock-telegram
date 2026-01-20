// inventory.js — логика инвентаря (с stackable талисманами, показом статов, правильной продажей)

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
        if (i.farming_fortune) d += `+${i.farming_fortune} 🌾ФОРТУНЫ `;
        if (i.farming_exp_bonus) d += `+${i.farming_exp_bonus}% 🌾ОПЫТА `;
        if (i.double_chance) d += `+${i.double_chance}% ШАНС УДВОЕНИЯ `;
        if (i.triple_chance) d += `+${i.triple_chance}% ШАНС УТРОЕНИЯ `;
        if (i.resource_cost) {
            const materialMap = {
                wheat: 'Пшеница',
                carrot: 'Морковь',
                potato: 'Картофель'
            };
            const costs = Object.entries(i.resource_cost).map(([k, v]) => `${v} ${materialMap[k] || k}`).join(', ');
            d += `[Цена: ${costs}] `;
        }
        if (i.fast) d += 'БЫСТРАЯ ';
        if (i.dynamic_str === 'midas') d += 'МИДАС ';
        if (i.magic) d += 'МАГИЧЕСКОЕ ';
        if (i.type === 'pet') d += `+${(petRarityBonuses[i.rarity] * i.lvl).toFixed(1)}% XP в ${i.skill.toUpperCase()} `;
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
        const items = t === 'pet' ? this.state.pets : this.state.inventory.filter(i => i.type === t);
        
        if (t === 'chest' && items.length > 0) {
             l.innerHTML += `<button class="cooldown-btn" style="margin-bottom:10px;height:40px" onclick="game.openAllChests()">ОТКРЫТЬ ВСЕ СУНДУКИ</button>`;
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
                a = `
                    <button class="act-btn" onclick="game.toggleEquip(${i.id})">${i.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>
                    <button class="act-btn" onclick="game.sellItem(${i.id})">ПРОДАТЬ (2💰)</button>
                `;
            } else if (i.type === 'chest') {
                a = `<button class="act-btn" onclick="game.openChest(${i.id})">ОТКРЫТЬ</button>`;
            } else if (['weapon','armor','tool'].includes(i.type)) {
                a = `<button class="act-btn" onclick="game.toggleEquip(${i.id})">${i.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>`;
            } else if (i.type === 'potion' && i.name === 'GodPotion') {
                a = `<button class="act-btn" onclick="game.activateGodPotion(${i.id})">АКТИВИРОВАТЬ</button>`;
            } else if (i.type === 'potion' && i.name === 'Печенька') {
                a = `<button class="act-btn" onclick="game.activateCookie(${i.id})">АКТИВИРОВАТЬ</button>`;
            }

            l.innerHTML += `
                <div class="card">
                    <b>${i.name}${c}</b><br>
                    <small style="color:#0f0; font-weight:bold">${this.getItemDesc(i)}</small>
                    <div class="item-actions">${a}</div>
                </div>`;
        });
    },

    openAllChests() {
        const chests = this.state.inventory.filter(i => i.type === 'chest');
        if (!chests.length) { this.msg('Нет сундуков!'); return; }
        
        let totalCoins = 0;
        let rareDrops = [];
        let countOpened = 0;
        
        this.state.inventory = this.state.inventory.filter(i => {
            if (i.type === 'chest') {
                const floorMatch = i.name.match(/\d+/);
                const floor = floorMatch ? parseInt(floorMatch[0]) : 1;
                const r = dungeonRewards[floor] || dungeonRewards[1];
                const count = i.count || 1;
                
                for(let k=0; k<count; k++) {
                    countOpened++;
                    const s = this.calcStats(true);
                    let coins = Math.floor(Math.random()*(r.coins_max-r.coins_min+1)+r.coins_min);
                    coins = Math.floor(coins*(1+(s.gold_bonus||0)/100));
                    totalCoins += coins;
                    
                    if (r.drops) {
                        r.drops.forEach(drop => {
                             let effChance = drop.chance + ((s.mf||0)/100);
                             if(Math.random()*100 < effChance) {
                                 const item = drop.item || drop.items[Math.floor(Math.random()*drop.items.length)];
                                 rareDrops.push({item, chance: effChance});
                             }
                        });
                    }
                }
                return false; 
            }
            return true; 
        });
        
        this.state.coins += totalCoins;
        rareDrops.forEach(d => {
             this.state.inventory.push({...d.item, id: this.state.nextItemId++, equipped: false});
        });
        
        let msg = `Открыто: ${countOpened}\nСуммарная сумма: ${totalCoins.toLocaleString()} 💰`;
        if (rareDrops.length > 0) {
            msg += '\n\nРедкие вещи:';
            rareDrops.forEach(d => {
                msg += `\n${d.item.name} (Шанс: ${d.chance.toFixed(2)}%)`;
            });
        }
        
        this.msg(msg);
        this.updateUI();
    },

    activateGodPotion(id) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i || i.name !== 'GodPotion') return;
        if (Date.now() < this.state.buffs.godpotion.endTime) {
            this.msg('Уже активен!');
            return;
        }
        this.state.buffs.godpotion.endTime = Date.now() + 3600000;
        this.state.inventory = this.state.inventory.filter(x => x.id !== id);
        this.msg('GodPotion на 1 час!');
        this.updateUI();
    },

    activateCookie(id) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i || i.name !== 'Печенька') return;
        if (Date.now() < this.state.buffs.cookie.endTime) {
            this.msg('Уже активен!');
            return;
        }
        // 4 hours = 4 * 60 * 60 * 1000 = 14400000 ms
        this.state.buffs.cookie.endTime = Date.now() + 14400000;
        this.state.inventory = this.state.inventory.filter(x => x.id !== id);
        this.msg('Печенька активирована на 4 часа!');
        this.updateUI();
    },

    openChest(id) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i || i.type !== 'chest') return;
        const floorMatch = i.name.match(/\d+/);
        const floor = floorMatch ? parseInt(floorMatch[0]) : 1;
        console.log('Открытие сундука:', i.name, 'этаж:', floor);
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

        const pricePer = (i.name === 'Апгрейд питомца') ? 8000000 : 2;
        const amount = i.count || 1;
        const total = pricePer * amount;

        this.state.coins += total;
        this.state.inventory = this.state.inventory.filter(x => x.id !== id);

        this.msg(`Продано ${amount} ${i.name}! +${total} 💰`);
        this.updateUI();
    },

    toggleEquip(id) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i || !['weapon','armor','tool','accessory'].includes(i.type)) return;

        if (i.type === 'accessory') {
            // Разрешаем надевать несколько аксессуаров, если у них РАЗНЫЕ названия
            // (защита от стакания одинаковых талисманов)
            if (!i.equipped) {
                const sameName = this.state.inventory.find(x => x.type === 'accessory' && x.equipped && x.name === i.name);
                if (sameName) {
                    this.msg('Талисман с таким названием уже надет!');
                    return;
                }
            }
            i.equipped = !i.equipped;
        } else {
            if (i.type === 'weapon') this.state.inventory.forEach(x => { if (x.type === 'weapon' && x.id !== id) x.equipped = false; });
            if (i.type === 'armor') this.state.inventory.forEach(x => { if (x.type === 'armor' && x.id !== id) x.equipped = false; });
            if (i.type === 'tool') this.state.inventory.forEach(x => { if (x.type === 'tool' && x.sub_type === i.sub_type && x.id !== id) x.equipped = false; });
            i.equipped = !i.equipped;
        }

        this.updateUI();
    }
});
