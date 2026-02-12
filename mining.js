// mining.js — Система шахты с 4 островами

const MINING_ISLANDS = {
    cave: {
        id: 'cave',
        name: 'Пещера',
        icon: '⛰️',
        desc: 'Базовые руды. Уровень увеличивает шанс редких руд.',
        minLevel: 0,
        baseChances: [
            { resource: 'Булыжник', chance: 80 },
            { resource: 'Уголь', chance: 17 },
            { resource: 'Медь', chance: 2 },
            { resource: 'Железо', chance: 1 }
        ],
        multiDrop: false,
        levelScaling: true,
        fortuneApplies: true,
        mobs: [
            { name: 'Пещерный Паук', hp: 80, dmg: 15, def: 5 },
            { name: 'Летучая Мышь', hp: 40, dmg: 10, def: 0 },
            { name: 'Каменный Голем', hp: 150, dmg: 25, def: 20 }
        ]
    },
    gold_mine: {
        id: 'gold_mine',
        name: 'Золотая Шахта',
        icon: '✨',
        desc: 'Можно добыть несколько ресурсов за раз! Уровень увеличивает шансы.',
        minLevel: 15,
        baseChances: [
            { resource: 'Железо', chance: 50 },
            { resource: 'Золото', chance: 35 },
            { resource: 'Лазурит', chance: 10, minDrop: 1, maxDrop: 5 },
            { resource: 'Редстоун', chance: 5, minDrop: 1, maxDrop: 5 }
        ],
        multiDrop: true,
        levelScaling: true,
        fortuneApplies: true,
        maxChance: 50,
        mobs: [
            { name: 'Золотой Скелет', hp: 200, dmg: 40, def: 15 },
            { name: 'Шахтёр-Призрак', hp: 300, dmg: 50, def: 10 },
            { name: 'Жадный Гном', hp: 250, dmg: 35, def: 25 }
        ]
    },
    crystal: {
        id: 'crystal',
        name: 'Кристальная Пещера',
        icon: '💎',
        desc: 'Редкие кристаллы. Только один ресурс за вскопку.',
        minLevel: 30,
        baseChances: [
            { resource: 'Мифрил', chance: 60 },
            { resource: 'Рубин', chance: 10 },
            { resource: 'Сапфир', chance: 10 },
            { resource: 'Изумруд', chance: 10 },
            { resource: 'Алмаз', chance: 10 }
        ],
        multiDrop: false,
        levelScaling: false,
        fortuneApplies: true,
        mobs: [
            { name: 'Кристальный Страж', hp: 500, dmg: 80, def: 30 },
            { name: 'Мифриловый Элементаль', hp: 400, dmg: 100, def: 15 },
            { name: 'Алмазный Жук', hp: 600, dmg: 60, def: 50 }
        ]
    },
    nether: {
        id: 'nether',
        name: 'Адский Остров',
        icon: '🔥',
        desc: 'Опасные ресурсы. Уровень не влияет на шансы.',
        minLevel: 50,
        baseChances: [
            { resource: 'Кварц', chance: 70 },
            { resource: 'Обсидиан', chance: 20 },
            { resource: 'Сера', chance: 10 }
        ],
        rareDrop: { resource: 'Кусочек Звезды Ада', chance: 0.1, noFortune: true },
        multiDrop: false,
        levelScaling: false,
        fortuneApplies: true,
        mobs: [
            { name: 'Блейз-Шахтёр', hp: 800, dmg: 120, def: 20 },
            { name: 'Адский Рыцарь', hp: 1200, dmg: 150, def: 40 },
            { name: 'Демон Недр', hp: 1500, dmg: 200, def: 30 }
        ]
    }
};

const MINING_MOB_COMBAT_CHANCE = 5;

const MINING_MOB_DROPS = {
    cave: [
        { resource: 'Уголь', min: 3, max: 8 },
        { resource: 'Медь', min: 2, max: 5 },
        { resource: 'Железо', min: 1, max: 3 }
    ],
    gold_mine: [
        { resource: 'Золото', min: 3, max: 10 },
        { resource: 'Лазурит', min: 5, max: 15 },
        { resource: 'Редстоун', min: 5, max: 15 }
    ],
    crystal: [
        { resource: 'Рубин', min: 1, max: 4 },
        { resource: 'Сапфир', min: 1, max: 4 },
        { resource: 'Изумруд', min: 1, max: 4 },
        { resource: 'Алмаз', min: 1, max: 3 }
    ],
    nether: [
        { resource: 'Кварц', min: 5, max: 15 },
        { resource: 'Обсидиан', min: 3, max: 8 },
        { resource: 'Сера', min: 2, max: 6 }
    ]
};

const MINING_RARE_MOB_DROPS = [
    { name: 'Адский Меч', type: 'weapon', str: 75, cd: 30, burn: true, cost: 6000000, chance: 1 },
    { name: 'Боевой Талисман Шахтёра', type: 'accessory', str: 20, def: 10, cc: 5, mining_fortune: 30, cost: 2000000, chance: 1 }
];

Object.assign(game, {
    currentMiningIsland: null,

    openMiningMenu() {
        this.currentLoc = 'mine';
        this.currentMiningIsland = null;
        this.switchTab('action-loc');
        document.getElementById('loc-title').innerText = 'ШАХТА — ВЫБОР ОСТРОВА';
        document.getElementById('loc-log').innerText = '';

        const extraBtn = document.getElementById('extra-action-container');
        if (extraBtn) extraBtn.style.display = 'none';
        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) actionBtn.style.display = 'none';

        const islandContainer = document.getElementById('mining-islands');
        if (islandContainer) {
            islandContainer.style.display = 'block';
            this.renderMiningIslands();
        }
    },

    renderMiningIslands() {
        const container = document.getElementById('mining-islands');
        if (!container) return;

        const miningLvl = game.state.skills.mining?.lvl || 1;
        let html = '';

        for (const [key, island] of Object.entries(MINING_ISLANDS)) {
            const locked = miningLvl < (island.minLevel || 0);

            if (locked) {
                html += `
                    <div class="card" style="margin-bottom:10px; opacity:0.4; cursor:not-allowed;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <b style="font-size:1.1rem;">${island.icon} ${island.name}</b>
                            <small style="color:var(--red)">Нужен ${island.minLevel} лвл</small>
                        </div>
                        <p style="color:var(--gray); font-size:0.75rem;">Требуется уровень майнинга ${island.minLevel}</p>
                    </div>
                `;
                continue;
            }

            const chances = this.getMiningChances(key, miningLvl);
            let chanceList = chances.map(c => {
                let dropInfo = '';
                if (c.minDrop && c.maxDrop && c.minDrop !== c.maxDrop) {
                    dropInfo = ` (${c.minDrop}-${c.maxDrop} шт.)`;
                }
                return `<span style="color:var(--gray)">${c.resource}: ${c.chance.toFixed(1)}%${dropInfo}</span>`;
            }).join('<br>');

            if (island.rareDrop) {
                chanceList += `<br><span style="color:var(--red)">${island.rareDrop.resource}: ${island.rareDrop.chance}% (без фортуны!)</span>`;
            }

            const mobNames = island.mobs ? island.mobs.map(m => m.name).join(', ') : '';

            html += `
                <div class="card" style="margin-bottom:10px; cursor:pointer; border: 1px solid var(--accent);" onclick="game.selectMiningIsland('${key}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <b style="font-size:1.1rem;">${island.icon} ${island.name}</b>
                        ${island.levelScaling ? '<small style="color:var(--green)">Уровень влияет</small>' : '<small style="color:var(--gray)">Уровень не влияет</small>'}
                    </div>
                    <p style="color:var(--gray); font-size:0.75rem; margin-bottom:8px;">${island.desc}</p>
                    <div style="font-size:0.7rem; line-height:1.6;">${chanceList}</div>
                    ${island.multiDrop ? '<div style="margin-top:5px;"><small style="color:var(--accent)">Несколько ресурсов за раз!</small></div>' : ''}
                    ${mobNames ? `<div style="margin-top:5px;"><small style="color:var(--red)">Мобы: ${mobNames}</small></div>` : ''}
                </div>
            `;
        }

        container.innerHTML = html;
    },

    closeMiningMenu() {
        const islandContainer = document.getElementById('mining-islands');
        if (islandContainer) islandContainer.style.display = 'none';
        
        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) {
            actionBtn.style.display = 'flex';
            const island = MINING_ISLANDS[this.currentMiningIsland || 'cave'];
            const span = actionBtn.querySelector('span');
            if (span) span.innerText = `КОПАТЬ (${island.name})`;
        }
        
    },

    getMiningChances(islandKey, miningLvl) {
        const island = MINING_ISLANDS[islandKey];
        if (!island) return [];

        let chances = island.baseChances.map(c => ({ ...c }));

        if (island.levelScaling && miningLvl > 1) {
            const bonus = (miningLvl - 1) * 0.3;

            if (islandKey === 'cave') {
                const stoneIdx = chances.findIndex(c => c.resource === 'Булыжник');
                const ores = chances.filter(c => c.resource !== 'Булыжник');
                const totalOreBonus = Math.min(bonus, 60);
                const perOreBonus = totalOreBonus / ores.length;
                ores.forEach(c => { c.chance = Math.min(c.chance + perOreBonus, 40); });
                const usedBonus = ores.reduce((s, c) => s + (c.chance - island.baseChances.find(b => b.resource === c.resource).chance), 0);
                if (stoneIdx >= 0) chances[stoneIdx].chance = Math.max(10, 80 - usedBonus);
            }

            if (islandKey === 'gold_mine') {
                const ironIdx = chances.findIndex(c => c.resource === 'Железо');
                const rares = chances.filter(c => c.resource !== 'Железо');
                const perRareBonus = Math.min(bonus * 0.5, 15);
                let totalShifted = 0;
                rares.forEach(c => {
                    const maxC = island.maxChance || 50;
                    const oldChance = c.chance;
                    c.chance = Math.min(c.chance + perRareBonus, maxC);
                    totalShifted += c.chance - oldChance;
                });
                if (ironIdx >= 0) chances[ironIdx].chance = Math.max(10, 50 - totalShifted);
            }
        }

        return chances;
    },

    selectMiningIsland(islandKey) {
        const island = MINING_ISLANDS[islandKey];
        if (!island) return;

        const miningLvl = this.state.skills.mining?.lvl || 1;
        if (miningLvl < (island.minLevel || 0)) {
            this.msg(`Нужен ${island.minLevel} уровень майнинга!`);
            return;
        }

        this.currentLoc = 'mine';
        this.currentMiningIsland = islandKey;

        const locTitle = document.getElementById('loc-title');
        locTitle.innerText = `${island.icon} ${island.name}`;
        locTitle.style.cursor = 'pointer';
        locTitle.onclick = () => game.openMiningMenu();
        document.getElementById('loc-log').innerText = '';

        const islandContainer = document.getElementById('mining-islands');
        if (islandContainer) islandContainer.style.display = 'none';

        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) {
            actionBtn.style.display = 'flex';
            actionBtn.style.alignItems = 'center';
            actionBtn.style.justifyContent = 'center';
            const span = actionBtn.querySelector('span');
            if (span) span.innerText = 'КОПАТЬ';
        }

        const extraBtn = document.getElementById('extra-action-container');
        if (extraBtn) extraBtn.style.display = 'none';
    },

    showBackToIslands() {
    },

    rollMiningResources() {
        const islandKey = this.currentMiningIsland;
        if (!islandKey) return [{ resource: 'Булыжник', amount: 1 }];

        const island = MINING_ISLANDS[islandKey];
        const miningLvl = this.state.skills.mining?.lvl || 1;
        const chances = this.getMiningChances(islandKey, miningLvl);
        const s = this.calcStats(false);
        const fortune = s.mining_fortune || 0;

        let drops = [];

        if (island.multiDrop) {
            for (const c of chances) {
                const roll = Math.random() * 100;
                if (roll < c.chance) {
                    let amount = 1;
                    if (c.minDrop && c.maxDrop) {
                        amount = c.minDrop + Math.floor(Math.random() * (c.maxDrop - c.minDrop + 1));
                    }
                    if (island.fortuneApplies) {
                        const fortuneExtra = Math.floor(fortune / 100);
                        amount += fortuneExtra;
                        if (Math.random() * 100 < (fortune % 100)) amount++;
                    }
                    drops.push({ resource: c.resource, amount });
                }
            }
            if (drops.length === 0) {
                drops.push({ resource: 'Булыжник', amount: 1 });
            }
        } else {
            const roll = Math.random() * 100;
            let current = 0;
            let chosen = null;
            
            for (const c of chances) {
                current += c.chance;
                if (roll < current) {
                    chosen = c;
                    break;
                }
            }
            
            if (!chosen) chosen = chances[0];

            let amount = 1;
            if (chosen.minDrop && chosen.maxDrop) {
                amount = chosen.minDrop + Math.floor(Math.random() * (chosen.maxDrop - chosen.minDrop + 1));
            }
            if (island.fortuneApplies) {
                const fortuneExtra = Math.floor(fortune / 100);
                amount += fortuneExtra;
                if (Math.random() * 100 < (fortune % 100)) amount++;
            }
            drops.push({ resource: chosen.resource, amount });
        }

        if (island.rareDrop) {
            const rareRoll = Math.random() * 100;
            if (rareRoll < island.rareDrop.chance) {
                drops.push({ resource: island.rareDrop.resource, amount: 1 });
            }
        }

        return drops;
    },

    processMiningAction() {
        if (!this.state.skills.mining) {
            this.state.skills.mining = { lvl: 1, xp: 0, next: 100, label: 'ШАХТА' };
        }
        const s = this.calcStats(false);
        const skill = this.state.skills.mining;
        const gain = 15 * skill.lvl;
        const goldBonus = s.gold_bonus || 0;
        const totalGain = Math.floor(gain * (1 + goldBonus / 100));
        this.state.coins += totalGain;

        const drops = this.rollMiningResources();
        const base_xp = 20;
        const exp_bonus = s.mining_exp_bonus || 0;
        const total_xp = base_xp * (1 + exp_bonus / 100);

        let totalAmount = 0;
        let logParts = [];
        for (const drop of drops) {
            this.addMaterial(drop.resource, 'material', drop.amount);
            totalAmount += drop.amount;
            logParts.push(`+${drop.amount} ${drop.resource}`);
        }

        const equippedTool = this.state.inventory.find(i => i.equipped && i.type === 'tool' && i.sub_type === 'pickaxe');
        if (equippedTool) {
            if (equippedTool.triple_chance && Math.random() * 100 < equippedTool.triple_chance) {
                for (const drop of drops) {
                    this.addMaterial(drop.resource, 'material', drop.amount * 2);
                    totalAmount += drop.amount * 2;
                }
                logParts.push('x3!');
            } else if (equippedTool.double_chance && Math.random() * 100 < equippedTool.double_chance) {
                for (const drop of drops) {
                    this.addMaterial(drop.resource, 'material', drop.amount);
                    totalAmount += drop.amount;
                }
                logParts.push('x2!');
            }
        }

        const final_xp = total_xp * Math.max(totalAmount, 1);
        if (typeof game.addXp === 'function') {
            game.addXp('mining', final_xp);
        } else {
            const sk = this.state.skills.mining;
            if (sk) {
                sk.xp += final_xp;
                while (sk.xp >= sk.next) {
                    sk.lvl++;
                    sk.xp -= sk.next;
                    sk.next = Math.floor(sk.next * 1.4);
                    this.msg(`LEVEL UP! ШАХТА ${sk.lvl}`);
                }
            }
        }

        const pet = this.state.pets.find(p => p.equipped && p.skill === 'mining');
        if (pet) {
            this.addPetXp(pet, final_xp * 0.5);
        }

        document.getElementById('loc-log').innerText = `+${totalGain} \u{1F4B0} | +${final_xp.toFixed(1)} XP | ${logParts.join(' | ')}`;

        if (Math.random() * 100 < MINING_MOB_COMBAT_CHANCE) {
            this.startMiningCombat();
        }

        this.updateUI();
    },

    startMiningCombat() {
        const islandKey = this.currentMiningIsland;
        const island = MINING_ISLANDS[islandKey];
        if (!island || !island.mobs || island.mobs.length === 0) return;

        const mobTemplate = island.mobs[Math.floor(Math.random() * island.mobs.length)];
        this.miningMob = {
            name: mobTemplate.name,
            hp: mobTemplate.hp,
            maxHp: mobTemplate.hp,
            dmg: mobTemplate.dmg,
            def: mobTemplate.def,
            island: islandKey
        };

        const s = this.calcStats(false);
        this.miningPlayerHp = s.hp || 100;
        this.miningPlayerMaxHp = s.hp || 100;

        this.showMiningCombatUI();
    },

    showMiningCombatUI() {
        const mob = this.miningMob;
        if (!mob) return;

        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) actionBtn.style.display = 'none';

        let combatDiv = document.getElementById('mining-combat');
        if (!combatDiv) {
            const card = document.querySelector('#action-loc .card');
            if (!card) return;
            combatDiv = document.createElement('div');
            combatDiv.id = 'mining-combat';
            card.appendChild(combatDiv);
        }
        combatDiv.style.display = 'block';

        const mobHpPct = Math.max(0, (mob.hp / mob.maxHp) * 100);
        const pHpPct = Math.max(0, (this.miningPlayerHp / this.miningPlayerMaxHp) * 100);

        combatDiv.innerHTML = `
            <div style="text-align:center; margin-top:10px;">
                <h3 style="color:var(--red); margin-bottom:10px;">ВНЕЗАПНАЯ АТАКА!</h3>
                <div style="margin-bottom:8px;">
                    <b>${mob.name}</b>
                    <div style="background:var(--darker); border-radius:4px; height:14px; margin:5px 0; overflow:hidden;">
                        <div style="background:var(--red); height:100%; width:${mobHpPct}%; transition:width 0.3s;"></div>
                    </div>
                    <small>${Math.max(0, Math.floor(mob.hp))} / ${mob.maxHp} HP | ATK: ${mob.dmg} | DEF: ${mob.def}</small>
                </div>
                <div style="margin-bottom:8px;">
                    <b>ВЫ</b>
                    <div style="background:var(--darker); border-radius:4px; height:14px; margin:5px 0; overflow:hidden;">
                        <div style="background:var(--green); height:100%; width:${pHpPct}%; transition:width 0.3s;"></div>
                    </div>
                    <small>${Math.max(0, Math.floor(this.miningPlayerHp))} / ${this.miningPlayerMaxHp} HP</small>
                </div>
                <button class="act-btn" style="width:100%; height:45px; background:var(--red); font-weight:bold; margin-top:5px;" onclick="game.miningCombatAttack()">АТАКОВАТЬ</button>
                <button class="act-btn" style="width:100%; height:35px; background:var(--gray); margin-top:5px; font-size:0.75rem;" onclick="game.miningCombatFlee()">СБЕЖАТЬ</button>
            </div>
        `;
    },

    miningCombatAttack() {
        const mob = this.miningMob;
        if (!mob) return;

        const s = this.calcStats(false);
        const weapon = this.state.inventory.find(i => i.equipped && i.type === 'weapon');
        let playerDmg = weapon?.magic ? (s.int || 1) * (s.mag_amp || 1) * 100 : (s.str || 10);

        let combatMsg = '';
        if (Math.random() * 100 < (s.cc || 0)) {
            playerDmg *= (1 + (s.cd || 0) / 100);
            combatMsg += 'КРИТ! ';
        }

        const effectiveDmg = Math.max(1, playerDmg - mob.def);
        mob.hp -= effectiveDmg;
        combatMsg += `-${Math.floor(effectiveDmg)} урона мобу. `;

        if (mob.hp <= 0) {
            this.miningCombatVictory();
            return;
        }

        const mobDmg = Math.max(1, mob.dmg - (s.def || 0));

        if (weapon?.burn) {
            const burnDmg = Math.floor(mob.maxHp * 0.03);
            mob.hp -= burnDmg;
            combatMsg += `Поджог: -${burnDmg}. `;
            if (mob.hp <= 0) {
                this.miningCombatVictory();
                return;
            }
        }

        this.miningPlayerHp -= mobDmg;
        combatMsg += `-${Math.floor(mobDmg)} урона вам.`;

        if (this.miningPlayerHp <= 0) {
            this.miningCombatDefeat();
            return;
        }

        this.msg(combatMsg);
        this.showMiningCombatUI();
    },

    miningCombatFlee() {
        this.msg('Вы сбежали от моба!');
        this.endMiningCombat();
    },

    miningCombatVictory() {
        const mob = this.miningMob;
        if (!mob) return;
        const islandKey = mob.island;
        let loot = [];

        const mobDrops = MINING_MOB_DROPS[islandKey] || [];
        if (mobDrops.length > 0) {
            const drop = mobDrops[Math.floor(Math.random() * mobDrops.length)];
            const amount = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
            this.addMaterial(drop.resource, 'material', amount);
            loot.push(`+${amount} ${drop.resource}`);
        }

        for (const rareDrop of MINING_RARE_MOB_DROPS) {
            if (Math.random() * 100 < rareDrop.chance) {
                const item = { ...rareDrop, id: Date.now() + Math.random() };
                delete item.chance;
                this.state.inventory.push(item);
                loot.push(`${item.name}!`);
            }
        }

        const combatXp = 30 + (MINING_ISLANDS[islandKey]?.minLevel || 0) * 2;
        if (typeof game.addXp === 'function') {
            game.addXp('mining', combatXp);
        } else if (this.addXp) {
            this.addXp('mining', combatXp);
        } else {
            const sk = this.state.skills.mining;
            if (sk) {
                sk.xp += combatXp;
                while (sk.xp >= sk.next) {
                    sk.lvl++;
                    sk.xp -= sk.next;
                    sk.next = Math.floor(sk.next * 1.4);
                    this.msg(`LEVEL UP! ШАХТА ${sk.lvl}`);
                }
            }
        }
        loot.push(`+${combatXp} XP`);

        this.msg(`${mob.name} побеждён! ${loot.join(' | ')}`);
        this.endMiningCombat();
    },

    miningCombatDefeat() {
        this.msg('Вы проиграли бой! Потеряно 10% монет.');
        this.state.coins = Math.floor(this.state.coins * 0.9);
        this.endMiningCombat();
    },

    endMiningCombat() {
        this.miningMob = null;
        const combatDiv = document.getElementById('mining-combat');
        if (combatDiv) combatDiv.style.display = 'none';

        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) {
            actionBtn.style.display = 'flex';
            actionBtn.style.alignItems = 'center';
            actionBtn.style.justifyContent = 'center';
        }

        this.updateUI();
    }
});
