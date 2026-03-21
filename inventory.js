// inventory.js — логика инвентаря

Object.assign(game, {
    getItemDesc(i) {
        let d = '';
        if (i.ranged && i.bow_base_str) d += `+${i.bow_base_str} СИЛЫ ЛУКА `;
        else if (i.str) d += `+${i.str} СИЛЫ `;
        if (i.ranged && i.bow_base_cc) d += `+${i.bow_base_cc}% КРИТ ШАНС (ЛУК) `;
        if (i.ranged && i.bow_base_cd) d += `+${i.bow_base_cd}% КРИТ УРОН (ЛУК) `;
        if (i.def) d += `+${i.def} БРОНИ `;
        if (i.cc) d += `+${i.cc}% КРИТ ШАНС `;
        if (i.cd) d += `+${i.cd}% КРИТ УРОН `;
        if (i.mf) d += `+${i.mf} УДАЧИ `;
        if (i.int) d += `+${i.int} ИНТЕЛЛЕКТА `;
        if (i.mag_amp) d += `+${i.mag_amp} МАГ УСИЛЕНИЯ `;
        if (i.xp_bonus) d += `+${i.xp_bonus}% ОПЫТА `;
        if (i.farming_fortune) d += `+${i.farming_fortune} 🌾ФОРТУНЫ `;
        if (i.farming_exp_bonus) d += `+${i.farming_exp_bonus}% 🌾ОПЫТА `;
        if (i.mining_fortune) d += `+${i.mining_fortune} ⛏️ФОРТУНЫ `;
        if (i.mining_exp_bonus) d += `+${i.mining_exp_bonus}% ⛏️ОПЫТА `;
        if (i.fishing_fortune) d += `+${i.fishing_fortune} 🎣ФОРТУНЫ `;
        if (i.fishing_exp_bonus) d += `+${i.fishing_exp_bonus}% 🎣ОПЫТА `;
        if (i.foraging_fortune) d += `+${i.foraging_fortune} 🌲ФОРТУНЫ `;
        if (i.foraging_exp_bonus) d += `+${i.foraging_exp_bonus}% 🌲ОПЫТА `;
        if (i.hp) d += `+${i.hp} ХП `;
        if (i.vitality) d += `+${i.vitality}% ВОССТАНОВЛЕНИЕ `;
        if (i.zombie_bonus) d += `+${i.zombie_bonus}% УРОН ПО ЗОМБИ `;
        if (i.boss_damage) d += `+${i.boss_damage} УРОНА ПО БОССАМ `;
        if (i.bow_str) d += `+${i.bow_str} УРОНА (ЛУК) `;
        if (i.bow_fire) d += `+${i.bow_fire} УРОНА ОГНЁМ (ЛУК) `;
        if (i.arrow_save) d += `+${i.arrow_save}% ШАНС ЭКОНОМИИ СТРЕЛЫ `;
        if (i.bow_cc) d += `+${i.bow_cc}% ШАНС КРИТА (ЛУК) `;
        if (i.vampirism) d += `+${i.vampirism}% ВАМПИРИЗМ `;
        if (i.slayer_zombie_def_bonus) d += `+${i.slayer_zombie_def_bonus}% ЗАЩИТЫ В ZOMBIE SLAYER `;
        if (i.gold_bonus) d += `+${i.gold_bonus}% ЗОЛОТО `;
        if (i.double_chance) d += `+${i.double_chance}% ШАНС УДВОЕНИЯ `;
        if (i.triple_chance) d += `+${i.triple_chance}% ШАНС УТРОЕНИЯ `;
        if (i.resource_cost) {
            const materialMap = {
                wheat: 'Пшеница',
                carrot: 'Морковь',
                potato: 'Картофель',
                pumpkin: 'Тыква',
                melon: 'Арбуз',
                cane: 'Тростник'
            };
            const costs = Object.entries(i.resource_cost).map(([k, v]) => `${v} ${materialMap[k] || k}`).join(', ');
            d += `[Цена: ${costs}] `;
        }
        if (i.fast) d += 'БЫСТРАЯ ';
        if (i.dynamic_str === 'midas') {
            const midasStr = Math.floor(Math.min(game.state.coins || 0, 1000000000) / 1000000) * 0.5;
            d += `МЕЧ МИДАСА | +${midasStr.toFixed(0)} СИЛЫ (от монет) | Сила зависит от кол-ва монет (макс 1млрд). Легендарный меч, дроп с 4 этажа данжей. `;
        }
        if (i.magic) d += 'МАГИЧЕСКОЕ ';
        if (i.enchantments && Object.keys(i.enchantments).length > 0) {
            const enchNames = Object.entries(i.enchantments).map(([key, tier]) => {
                const e = window.enchantmentConfig?.[key];
                const roman = ['I','II','III','IV','V'];
                return e ? `${e.icon}${e.name} ${roman[tier-1]}` : key;
            }).join(', ');
            d += `[${enchNames}] `;
        }
        if (i.type === 'pet') {
            if (window.calcPetBonus) {
                const pb = window.calcPetBonus(i, game.state.skills);
                d += `+${pb.xp_bonus.toFixed(1)}% XP в ${i.skill.toUpperCase()} `;
                if (pb.fortune > 0) d += `+${pb.fortune.toFixed(0)} Фортуна `;
            } else {
                d += `+${(petRarityBonuses[i.rarity] * i.lvl).toFixed(1)}% XP в ${i.skill.toUpperCase()} `;
            }
        }
        if (i.desc) d += `${i.desc} `;
        return d.trim() || 'Без бонусов';
    },

    getMaterialSellPrice(name) {
        const prices = {
            'Пшеница': 2,
            'Картофель': 3,
            'Морковь': 4,
            'Тыква': 5,
            'Арбуз': 6,
            'Тростник': 7,
            'Грибы': 8,
            'Адский нарост': 10,
            'Уголь': 1,
            'Рыба': 3,
            'Дерево': 2,
            'Гнилая плоть': 1,
            'Кость': 1,
            'Нить': 1,
            'Булыжник': 1,
            'Медь': 1,
            'Железо': 2,
            'Золото': 3,
            'Лазурит': 2,
            'Редстоун': 2,
            'Мифрил': 2,
            'Рубин': 5,
            'Сапфир': 5,
            'Алмаз': 10,
            'Кварц': 5,
            'Обсидиан': 6,
            'Сера': 5,
            'Кусочек Звезды Ада': 50000,
            'Звезда Ада': 500000,
            'Стог Пшена': 600,
            'Стог Картошки': 900,
            'Стог Моркови': 1200,
            'Стог Тыквы': 1500,
            'Стог Арбузов': 1800,
            'Стог Тростника': 2100,
            'Стог Грибов': 2400,
            'Стог Адского нароста': 3000,
            'Стог Угля': 300,
            'Стог Меди': 300,
            'Стог Железа': 600,
            'Стог Золота': 900,
            'Стог Лазурита': 600,
            'Стог Редстоуна': 600,
            'Стог Мифрила': 600,
            'Стог Рубинов': 1500,
            'Стог Сапфиров': 1500,
            'Стог Алмазов': 3000,
            'Стог Кварца': 1500,
            'Стог Обсидиана': 1800,
            'Стог Булыжника': 300,
            'Сингулярность': 50000,
            'Апгрейд питомца': 8000000,
            'Фрагмент из Данжа': 1000,
            'Изумруд': 5000,
            'Стог Изумрудов': 1500,
            'Hot Potato Book': 50000,
            'Плоть зомби': 10,
            'Живая плоть': 10000
        };
        // Цена при продаже для осколков из Алтаря
        if (name === 'Обычный осколок') return 200000;
        if (name === 'Древний осколок') return 1000000;
        if (name === 'Реликвия Алтаря') return 30000000;
        if (name === 'Стрела') return 1;
        if (name === 'Ядовитая стрела') return 4000;
        if (name === 'Пробивающая стрела') return 6000;
        if (name === 'Тяжёлая пробивающая стрела') return 10000;
        return prices[name] || 2;
    },

    addMaterial(name, type = 'material', count = 1, opts = {}) {
        const existing = this.state.inventory.find(i => i.name === name && i.type === type);
        if (existing) {
            existing.count = (existing.count || 1) + count;
            // Merge additional properties (e.g. rarity, gramota flag)
            Object.entries(opts || {}).forEach(([k, v]) => {
                if (k === 'count' || k === 'name' || k === 'type' || k === 'id') return;
                existing[k] = v;
            });
        } else {
            const item = {
                id: this.state.nextItemId++,
                name,
                type,
                count: count,
                equipped: false
            };
            Object.assign(item, opts || {});
            this.state.inventory.push(item);
        }
    },

    filterInv(t, e) {
        document.querySelectorAll('#inventory .inv-tab').forEach(x => x.classList.remove('active'));
        if (e) e.classList.add('active');
        this.lastFilter = t;
        this.renderInvList(t);
    },

    renderInvList(t) {
        const l = document.getElementById('inv-list');
        l.innerHTML = '';
        const items = t === 'pet' ? this.state.pets : this.state.inventory.filter(i => i.type === t || (t === 'accessory' && i.type === 'artifact'));
        
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
                const sellPrice = typeof game.getPetSellPrice === 'function' ? game.getPetSellPrice(i) : Math.floor(i.cost / 2);
                a = `
                    <button class="act-btn" onclick="game.toggleEquipPet(${idx})">${i.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>
                    <button class="act-btn" onclick="game.upgradePet(${idx})">УЛУЧШИТЬ</button>
                    <button class="act-btn" onclick="game.sellPet(${idx})">ПРОДАТЬ (${sellPrice.toLocaleString()}💰)</button>
                `;
            } else if (i.type === 'material') {
                const pricePer = this.getMaterialSellPrice(i.name);
                const totalPrice = pricePer * (i.count || 1);
                let arrowExtra = '';
                if (window.ALL_ARROW_NAMES && window.ALL_ARROW_NAMES.includes(i.name)) {
                    arrowExtra = `
                    <button class="act-btn" style="font-size:0.72rem;padding:6px 8px;" onclick="game.bumpArrowPriority('${i.name.replace(/'/g, "\\'")}',-1)">Приоритет ↑</button>
                    <button class="act-btn" style="font-size:0.72rem;padding:6px 8px;" onclick="game.bumpArrowPriority('${i.name.replace(/'/g, "\\'")}',1)">Приоритет ↓</button>
                    <button class="act-btn" style="font-size:0.72rem;padding:6px 8px;" onclick="game.setSelectedArrowType('${i.name.replace(/'/g, "\\'")}')">В данж: эти</button>`;
                }
                a = `${arrowExtra}<button class="act-btn" onclick="game.sellItem(${i.id})">ПРОДАТЬ (${totalPrice.toLocaleString()}💰 | ${pricePer}/шт)</button>`;
            } else if (i.type === 'accessory' || i.type === 'artifact') {
                const sellPrice = Math.floor((i.cost || 100) / 2);
                let upgradeBtn = '';
                if (i.name === 'Zombie Ring' && !i.upgraded) {
                    upgradeBtn = `<button class="act-btn" onclick="game.upgradeZombieRing(${i.id})">УЛУЧШИТЬ (256 Плоть зомби)</button>`;
                }
                a = `
                    <button class="act-btn" onclick="game.toggleEquip(${i.id})">${i.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>
                    ${upgradeBtn}
                    <button class="act-btn" onclick="game.sellItem(${i.id})">ПРОДАТЬ (${sellPrice.toLocaleString()}💰)</button>
                `;
            } else if (i.type === 'chest') {
                a = `<button class="act-btn" onclick="game.openChest(${i.id})">ОТКРЫТЬ</button>`;
            } else if (['weapon','armor','tool'].includes(i.type)) {
                let sellBtn = '';
                if (i.dynamic_str === 'midas') {
                    sellBtn = `<button class="act-btn" onclick="game.sellWeapon(${i.id}, 50000000)">ПРОДАТЬ (50,000,000💰)</button>`;
                } else if (i.name === 'Меч Гиганта') {
                    sellBtn = `<button class="act-btn" onclick="game.sellWeapon(${i.id}, 125000)">ПРОДАТЬ (125,000💰)</button>`;
                } else if (i.name === 'Гиперион') {
                    sellBtn = `<button class="act-btn" onclick="game.sellWeapon(${i.id}, 250000)">ПРОДАТЬ (250,000💰)</button>`;
                }
                a = `
                    <button class="act-btn" onclick="game.toggleEquip(${i.id})">${i.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}</button>
                    ${sellBtn}
                `;
            } else if (i.type === 'potion' && i.name === 'GodPotion') {
                a = `<button class="act-btn" onclick="game.activateGodPotion(${i.id})">АКТИВИРОВАТЬ</button>`;
            } else if (i.type === 'potion' && i.name === 'Печенька') {
                a = `<button class="act-btn" onclick="game.activateCookie(${i.id})">АКТИВИРОВАТЬ</button>`;
            }

            const rc = i.rarity ? (rarityColors[i.rarity] || '#aaa') : '#aaa';
            const rt = typeof getRarityTag === 'function' ? getRarityTag(i.rarity) : '';
            l.innerHTML += `
                <div class="card" style="border-left:3px solid ${rc}">
                    <b>${i.name}${c}</b> ${rt}<br>
                    <small style="color:#0f0; font-weight:bold">${this.getItemDesc(i)}</small>
                    ${i.reforge ? `<br><small style="color:#ff0;">РЕФОРЖ: ${i.reforge.name} (${Object.entries(i.reforge.bonuses).map(([k,v])=>`+${v} ${k}`).join(', ')})</small>` : ''}
                    <div class="item-actions">${a}</div>
                </div>`;
        });
    },

    sellWeapon(id, price) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i) return;
        if (i.equipped) {
            this.msg('Сначала снимите предмет!');
            return;
        }
        this.state.coins += price;
        this.state.inventory = this.state.inventory.filter(x => x.id !== id);
        this.msg(`Продано ${i.name}! +${price.toLocaleString()} 💰`);
        this.updateUI();
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
        if (i.gramota || (i.name && i.name.startsWith('Грамота'))) {
            this.msg('Эту грамоту нельзя продать.');
            return;
        }

        let pricePer;
        if (i.type === 'material') {
            pricePer = this.getMaterialSellPrice(i.name);
        } else {
            pricePer = Math.floor((i.cost || 100) / 2);
        }
        
        const amount = i.count || 1;
        const total = pricePer * amount;

        this.state.coins += total;
        this.state.inventory = this.state.inventory.filter(x => x.id !== id);

        this.msg(`Продано ${amount} ${i.name}! +${total.toLocaleString()} 💰`);
        this.updateUI();
    },

    upgradeZombieRing(id) {
        const ring = this.state.inventory.find(x => x.id === id && x.name === 'Zombie Ring');
        if (!ring) return;
        if (ring.upgraded) {
            this.msg('Zombie Ring уже улучшен!');
            return;
        }
        const flesh = this.state.inventory.find(i => i.name === 'Плоть зомби' && i.type === 'material');
        const fleshCount = flesh ? (flesh.count || 0) : 0;
        if (fleshCount < 256) {
            this.msg(`Недостаточно Плоти зомби! Нужно 256, у вас ${fleshCount}`);
            return;
        }
        flesh.count -= 256;
        if (flesh.count <= 0) {
            this.state.inventory = this.state.inventory.filter(i => i.id !== flesh.id);
        }
        ring.upgraded = true;
        ring.name = 'Zombie Ring ★';
        ring.mf = (ring.mf || 0) + 5;
        ring.str = (ring.str || 0) + 10;
        ring.vitality = (ring.vitality || 0) + 1;
        ring.cost = 100000;
        this.msg('Zombie Ring улучшен! +5 MF, +10 STR, +1% Восстановление');
        this.updateUI();
    },

    toggleEquip(id) {
        const i = this.state.inventory.find(x => x.id === id);
        if (!i || !['weapon','armor','tool','accessory','artifact'].includes(i.type)) return;

        if (i.type === 'accessory' || i.type === 'artifact') {
            if (!i.equipped) {
                const sameName = this.state.inventory.find(x => (x.type === 'accessory' || x.type === 'artifact') && x.equipped && x.name === i.name);
                if (sameName) {
                    this.msg('Талисман с таким названием уже надет!');
                    return;
                }
            }
            i.equipped = !i.equipped;
        } else {
            if (i.type === 'weapon') {
                if (i.ranged) {
                    // Лук: снимаем только другие луки, но не мечи
                    this.state.inventory.forEach(x => {
                        if (x.type === 'weapon' && x.ranged && x.id !== id) x.equipped = false;
                    });
                } else {
                    // Меч: снимаем все другие мечи, но не луки
                    this.state.inventory.forEach(x => {
                        if (x.type === 'weapon' && !x.ranged && x.id !== id) x.equipped = false;
                    });
                }
            }
            if (i.type === 'armor') this.state.inventory.forEach(x => { if (x.type === 'armor' && x.id !== id) x.equipped = false; });
            if (i.type === 'tool') this.state.inventory.forEach(x => { if (x.type === 'tool' && x.sub_type === i.sub_type && x.id !== id) x.equipped = false; });
            i.equipped = !i.equipped;
        }

        this.updateUI();
    }
});
