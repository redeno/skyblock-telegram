// fishing.js — Система рыбалки с 4 островами

const FISHING_ISLANDS = {
    creek: {
        id: 'creek',
        name: 'Ручей',
        icon: '🏞️',
        desc: 'Простая рыбалка. Уровень 0-10.',
        minLevel: 0,
        baseChances: [
            { resource: 'Карась', chance: 60 },
            { resource: 'Окунь', chance: 25 },
            { resource: 'Щука', chance: 10 },
            { resource: 'Раки', chance: 5 }
        ],
        resourceValue: 3,
        levelScaling: true,
        mobs: [
            { name: 'Злой Бобр', hp: 70, dmg: 15, def: 5 },
            { name: 'Водяной Змей', hp: 50, dmg: 20, def: 3 }
        ],
        boss: { name: 'Король Кролик', hp: 500, dmg: 40, def: 25, drops: [
            { name: 'Талисман Ручья', type: 'accessory', fishing_fortune: 20, hp: 15, cost: 500000, chance: 30 },
            { name: 'Корона Кролика', type: 'accessory', mf: 15, fishing_fortune: 10, cost: 1000000, chance: 10 },
            { name: 'Мешочек Золота', type: 'material', count: 1, chance: 60 }
        ]}
    },
    ocean: {
        id: 'ocean',
        name: 'Океан',
        icon: '🌊',
        desc: 'Морская рыбалка. Уровень 10-20.',
        minLevel: 10,
        baseChances: [
            { resource: 'Треска', chance: 50 },
            { resource: 'Лосось', chance: 30 },
            { resource: 'Тунец', chance: 12 },
            { resource: 'Морской Ёж', chance: 8 }
        ],
        resourceValue: 5,
        levelScaling: true,
        mobs: [
            { name: 'Акула', hp: 250, dmg: 50, def: 15 },
            { name: 'Морской Змей', hp: 200, dmg: 60, def: 10 }
        ],
        boss: { name: 'Император', hp: 1200, dmg: 80, def: 35, drops: [
            { name: 'Трезубец Императора', type: 'weapon', str: 55, cd: 20, cost: 5000000, chance: 25 },
            { name: 'Имперский Амулет', type: 'accessory', fishing_fortune: 50, fishing_exp_bonus: 5, def: 15, cost: 8000000, chance: 10 },
            { name: 'Мешочек Золота', type: 'material', count: 1, chance: 50 }
        ]}
    },
    cave: {
        id: 'cave',
        name: 'Пещера',
        icon: '🦇',
        desc: 'Глубинная рыбалка. Уровень 20-40.',
        minLevel: 20,
        baseChances: [
            { resource: 'Пещерная Рыба', chance: 45 },
            { resource: 'Слепой Сом', chance: 30 },
            { resource: 'Кристальный Краб', chance: 15 },
            { resource: 'Светящаяся Медуза', chance: 10 }
        ],
        resourceValue: 8,
        levelScaling: false,
        mobs: [
            { name: 'Глубинный Ужас', hp: 500, dmg: 90, def: 30 },
            { name: 'Пещерный Тролль', hp: 600, dmg: 70, def: 40 }
        ],
        boss: { name: 'Светящийся Спрут', hp: 2000, dmg: 120, def: 45, drops: [
            { name: 'Щупальце Спрута', type: 'weapon', str: 70, int: 30, mag_amp: 3, cost: 12000000, chance: 20 },
            { name: 'Сияющий Талисман', type: 'accessory', fishing_fortune: 80, int: 20, cost: 15000000, chance: 8 },
            { name: 'Мешочек Золота', type: 'material', count: 2, chance: 50 }
        ]}
    },
    hell: {
        id: 'hell',
        name: 'Ад',
        icon: '🔥',
        desc: 'Адская рыбалка. Уровень 40+.',
        minLevel: 40,
        baseChances: [
            { resource: 'Магмовая Рыба', chance: 40 },
            { resource: 'Адский Угорь', chance: 30 },
            { resource: 'Огненный Скат', chance: 20 },
            { resource: 'Лавовый Левиафан', chance: 10 }
        ],
        resourceValue: 12,
        levelScaling: false,
        mobs: [
            { name: 'Адский Кракен', hp: 1000, dmg: 150, def: 35 }
        ],
        boss: { name: 'Рагнарёк', hp: 5000, dmg: 200, def: 60, drops: [
            { name: 'Клинок Рагнарёка', type: 'weapon', str: 100, cc: 10, cd: 40, cost: 50000000, chance: 15 },
            { name: 'Амулет Конца Света', type: 'accessory', str: 30, def: 30, fishing_fortune: 100, fishing_exp_bonus: 10, cost: 80000000, chance: 5 },
            { name: 'Мешочек Золота', type: 'material', count: 5, chance: 60 }
        ]}
    }
};

const FISHING_MOB_COMBAT_CHANCE = 5;
const FISHING_BOSS_CHANCE = 1;

const FISHING_MOB_DROPS = {
    creek: [
        { resource: 'Карась', min: 3, max: 8 },
        { resource: 'Окунь', min: 2, max: 5 }
    ],
    ocean: [
        { resource: 'Треска', min: 3, max: 8 },
        { resource: 'Лосось', min: 2, max: 6 },
        { resource: 'Тунец', min: 1, max: 3 }
    ],
    cave: [
        { resource: 'Пещерная Рыба', min: 3, max: 6 },
        { resource: 'Кристальный Краб', min: 1, max: 3 }
    ],
    hell: [
        { resource: 'Магмовая Рыба', min: 3, max: 8 },
        { resource: 'Адский Угорь', min: 2, max: 5 },
        { resource: 'Огненный Скат', min: 1, max: 3 }
    ]
};

Object.assign(game, {
    currentFishingIsland: null,
    fishingMob: null,
    fishingPlayerHp: 0,
    fishingPlayerMaxHp: 0,

    openFishingMenu() {
        this.currentLoc = 'fish';
        this.currentFishingIsland = null;
        this.switchTab('action-loc');
        document.getElementById('loc-title').innerText = 'РЫБАЛКА — ВЫБОР ОСТРОВА';
        document.getElementById('loc-log').innerText = '';

        const extraBtn = document.getElementById('extra-action-container');
        if (extraBtn) extraBtn.style.display = 'none';
        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) actionBtn.style.display = 'none';

        const islandContainer = document.getElementById('mining-islands');
        if (islandContainer) {
            islandContainer.style.display = 'block';
            this.renderFishingIslands();
        }
    },

    renderFishingIslands() {
        const container = document.getElementById('mining-islands');
        if (!container) return;

        const fishingLvl = game.state.skills.fishing?.lvl || 1;
        let html = '';

        for (const [key, island] of Object.entries(FISHING_ISLANDS)) {
            const locked = fishingLvl < (island.minLevel || 0);

            if (locked) {
                html += `
                    <div class="card" style="margin-bottom:10px; opacity:0.4; cursor:not-allowed;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <b style="font-size:1.1rem;">${island.icon} ${island.name}</b>
                            <small style="color:var(--red)">Нужен ${island.minLevel} лвл</small>
                        </div>
                        <p style="color:var(--gray); font-size:0.75rem;">Требуется уровень рыбалки ${island.minLevel}</p>
                    </div>
                `;
                continue;
            }

            const chances = this.getFishingChances(key, fishingLvl);
            let chanceList = chances.map(c => {
                return `<span style="color:var(--gray)">${c.resource}: ${c.chance.toFixed(1)}%</span>`;
            }).join('<br>');

            const mobNames = island.mobs ? island.mobs.map(m => m.name).join(', ') : '';
            const bossName = island.boss ? island.boss.name : '';

            html += `
                <div class="card" style="margin-bottom:10px; cursor:pointer; border: 1px solid var(--accent);" onclick="game.selectFishingIsland('${key}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <b style="font-size:1.1rem;">${island.icon} ${island.name}</b>
                        ${island.levelScaling ? '<small style="color:var(--green)">Уровень влияет</small>' : '<small style="color:var(--gray)">Уровень не влияет</small>'}
                    </div>
                    <p style="color:var(--gray); font-size:0.75rem; margin-bottom:8px;">${island.desc}</p>
                    <div style="font-size:0.7rem; line-height:1.6;">${chanceList}</div>
                    <div style="margin-top:5px;"><small style="color:var(--accent)">Ценность: ${island.resourceValue} монет/ед.</small></div>
                    ${mobNames ? `<div style="margin-top:5px;"><small style="color:var(--red)">Мобы: ${mobNames}</small></div>` : ''}
                    ${bossName ? `<div style="margin-top:3px;"><small style="color:var(--red)">Босс: ${bossName}</small></div>` : ''}
                </div>
            `;
        }

        container.innerHTML = html;
    },

    getFishingChances(islandKey, fishingLvl) {
        const island = FISHING_ISLANDS[islandKey];
        if (!island) return [];

        let chances = island.baseChances.map(c => ({ ...c }));

        if (island.levelScaling && fishingLvl > 1) {
            const bonus = (fishingLvl - 1) * 0.3;

            if (islandKey === 'creek') {
                const commonIdx = chances.findIndex(c => c.resource === 'Карась');
                const rares = chances.filter(c => c.resource !== 'Карась');
                const totalRareBonus = Math.min(bonus, 40);
                const perRareBonus = totalRareBonus / rares.length;
                rares.forEach(c => { c.chance = Math.min(c.chance + perRareBonus, 35); });
                const usedBonus = rares.reduce((s, c) => s + (c.chance - island.baseChances.find(b => b.resource === c.resource).chance), 0);
                if (commonIdx >= 0) chances[commonIdx].chance = Math.max(15, 60 - usedBonus);
            }

            if (islandKey === 'ocean') {
                const commonIdx = chances.findIndex(c => c.resource === 'Треска');
                const rares = chances.filter(c => c.resource !== 'Треска');
                const totalRareBonus = Math.min(bonus, 30);
                const perRareBonus = totalRareBonus / rares.length;
                rares.forEach(c => { c.chance = Math.min(c.chance + perRareBonus, 35); });
                const usedBonus = rares.reduce((s, c) => s + (c.chance - island.baseChances.find(b => b.resource === c.resource).chance), 0);
                if (commonIdx >= 0) chances[commonIdx].chance = Math.max(15, 50 - usedBonus);
            }
        }

        return chances;
    },

    selectFishingIsland(islandKey) {
        const island = FISHING_ISLANDS[islandKey];
        if (!island) return;

        const fishingLvl = this.state.skills.fishing?.lvl || 1;
        if (fishingLvl < (island.minLevel || 0)) {
            this.msg(`Нужен ${island.minLevel} уровень рыбалки!`);
            return;
        }

        this.currentLoc = 'fish';
        this.currentFishingIsland = islandKey;

        const locTitle = document.getElementById('loc-title');
        locTitle.innerText = `${island.icon} ${island.name}`;
        locTitle.style.cursor = 'pointer';
        locTitle.onclick = () => game.openFishingMenu();
        document.getElementById('loc-log').innerText = '';

        const islandContainer = document.getElementById('mining-islands');
        if (islandContainer) islandContainer.style.display = 'none';

        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) {
            actionBtn.style.display = 'flex';
            actionBtn.style.alignItems = 'center';
            actionBtn.style.justifyContent = 'center';
            const span = actionBtn.querySelector('span');
            if (span) span.innerText = 'ЛОВИТЬ';
        }

        const extraBtn = document.getElementById('extra-action-container');
        if (extraBtn) extraBtn.style.display = 'none';
    },

    rollFishingResources() {
        const islandKey = this.currentFishingIsland;
        if (!islandKey) return [{ resource: 'Карась', amount: 1 }];

        const island = FISHING_ISLANDS[islandKey];
        const fishingLvl = this.state.skills.fishing?.lvl || 1;
        const chances = this.getFishingChances(islandKey, fishingLvl);
        const s = this.calcStats(false);
        let fortune = s.fishing_fortune || 0;

        if (this.state.activeEvent === 'rain_season') {
            fortune = Math.floor(fortune * 1.25);
        }

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
        const fortuneExtra = Math.floor(fortune / 100);
        amount += fortuneExtra;
        if (Math.random() * 100 < (fortune % 100)) amount++;

        return [{ resource: chosen.resource, amount }];
    },

    processFishingAction() {
        if (!this.state.skills.fishing) {
            this.state.skills.fishing = { lvl: 1, xp: 0, next: 100, label: 'РЫБАЛКА' };
        }

        if (!this.currentFishingIsland) {
            this.openFishingMenu();
            return;
        }

        const s = this.calcStats(false);
        const skill = this.state.skills.fishing;
        const gain = 15 * skill.lvl;
        const goldBonus = s.gold_bonus || 0;
        const totalGain = Math.floor(gain * (1 + goldBonus / 100));
        this.state.coins += totalGain;

        const drops = this.rollFishingResources();
        const base_xp = 20;
        const exp_bonus = s.fishing_exp_bonus || 0;
        let xpMul = 1 + exp_bonus / 100;
        if (this.state.activeEvent === 'rain_season') {
            xpMul *= 1.1;
        }
        const total_xp = base_xp * xpMul;

        let totalAmount = 0;
        let logParts = [];
        for (const drop of drops) {
            this.addMaterial(drop.resource, 'material', drop.amount);
            totalAmount += drop.amount;
            logParts.push(`+${drop.amount} ${drop.resource}`);
        }

        const equippedTool = this.state.inventory.find(i => i.equipped && i.type === 'tool' && i.sub_type === 'rod');
        if (equippedTool) {
            if (equippedTool.triple_chance && Math.random() * 100 < equippedTool.triple_chance) {
                for (const drop of drops) {
                    this.addMaterial(drop.resource, 'material', drop.amount * 2);
                    totalAmount += drop.amount * 2;
                }
                logParts.push('x3!');
            }
        }

        const final_xp = total_xp * Math.max(totalAmount, 1);
        if (typeof game.addXp === 'function') {
            game.addXp('fishing', final_xp);
        } else {
            const sk = this.state.skills.fishing;
            if (sk) {
                sk.xp += final_xp;
                while (sk.xp >= sk.next) {
                    sk.lvl++;
                    sk.xp -= sk.next;
                    sk.next = Math.floor(sk.next * 1.4);
                    this.msg(`LEVEL UP! РЫБАЛКА ${sk.lvl}`);
                }
            }
        }

        const pet = this.state.pets.find(p => p.equipped && p.skill === 'fishing');
        if (pet) {
            this.addPetXp(pet, final_xp * 0.5);
        }

        document.getElementById('loc-log').innerText = `+${totalGain} \u{1F4B0} | +${final_xp.toFixed(1)} XP | ${logParts.join(' | ')}`;

        if (this.state.activeEvent === 'rain_season' && Math.random() * 100 < 3) {
            this.startFishingCombat(true);
        } else if (Math.random() * 100 < FISHING_MOB_COMBAT_CHANCE * (typeof game.events !== 'undefined' ? game.events.getMobSpawnMultiplier() : 1)) {
            this.startFishingCombat(false);
        } else if (Math.random() * 100 < FISHING_BOSS_CHANCE * (typeof game.events !== 'undefined' ? game.events.getMobSpawnMultiplier() : 1)) {
            this.startFishingBossCombat();
        }

        this.updateUI();
    },

    startFishingCombat(isGoldenFish) {
        const islandKey = this.currentFishingIsland;
        const island = FISHING_ISLANDS[islandKey];
        if (!island) return;

        if (isGoldenFish) {
            this.fishingMob = {
                name: 'Золотая Рыбка',
                hp: 100,
                maxHp: 100,
                dmg: 5,
                def: 0,
                island: islandKey,
                isBoss: false,
                isGoldenFish: true
            };
        } else {
            if (!island.mobs || island.mobs.length === 0) return;
            const mobTemplate = island.mobs[Math.floor(Math.random() * island.mobs.length)];
            this.fishingMob = {
                name: mobTemplate.name,
                hp: mobTemplate.hp,
                maxHp: mobTemplate.hp,
                dmg: mobTemplate.dmg,
                def: mobTemplate.def,
                island: islandKey,
                isBoss: false,
                isGoldenFish: false
            };
        }

        const s = this.calcStats(false);
        this.fishingPlayerHp = s.hp || 100;
        this.fishingPlayerMaxHp = s.hp || 100;

        this.showFishingCombatUI();
    },

    startFishingBossCombat() {
        const islandKey = this.currentFishingIsland;
        const island = FISHING_ISLANDS[islandKey];
        if (!island || !island.boss) return;

        const boss = island.boss;
        this.fishingMob = {
            name: boss.name,
            hp: boss.hp,
            maxHp: boss.hp,
            dmg: boss.dmg,
            def: boss.def,
            island: islandKey,
            isBoss: true,
            isGoldenFish: false,
            drops: boss.drops
        };

        const s = this.calcStats(false);
        this.fishingPlayerHp = s.hp || 100;
        this.fishingPlayerMaxHp = s.hp || 100;

        this.showFishingCombatUI();
    },

    showFishingCombatUI() {
        const mob = this.fishingMob;
        if (!mob) return;

        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) actionBtn.style.display = 'none';

        let combatDiv = document.getElementById('fishing-combat');
        if (!combatDiv) {
            const card = document.querySelector('#action-loc .card');
            if (!card) return;
            combatDiv = document.createElement('div');
            combatDiv.id = 'fishing-combat';
            card.appendChild(combatDiv);
        }
        combatDiv.style.display = 'block';

        const mobHpPct = Math.max(0, (mob.hp / mob.maxHp) * 100);
        const pHpPct = Math.max(0, (this.fishingPlayerHp / this.fishingPlayerMaxHp) * 100);
        const titleColor = mob.isBoss ? 'var(--red)' : (mob.isGoldenFish ? 'gold' : 'var(--red)');
        const titleText = mob.isBoss ? 'БОСС!' : (mob.isGoldenFish ? 'ЗОЛОТАЯ РЫБКА!' : 'ВНЕЗАПНАЯ АТАКА!');

        combatDiv.innerHTML = `
            <div style="text-align:center; margin-top:10px;">
                <h3 style="color:${titleColor}; margin-bottom:10px;">${titleText}</h3>
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
                    <small>${Math.max(0, Math.floor(this.fishingPlayerHp))} / ${this.fishingPlayerMaxHp} HP</small>
                </div>
                <button class="act-btn" style="width:100%; height:45px; background:var(--red); font-weight:bold; margin-top:5px;" onclick="game.fishingCombatAttack()">АТАКОВАТЬ</button>
                <button class="act-btn" style="width:100%; height:35px; background:var(--gray); margin-top:5px; font-size:0.75rem;" onclick="game.fishingCombatFlee()">СБЕЖАТЬ</button>
            </div>
        `;
    },

    fishingCombatAttack() {
        const mob = this.fishingMob;
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
            this.defeatFishingMob();
            return;
        }

        const mobDmg = Math.max(1, mob.dmg - (s.def || 0));

        if (weapon?.burn) {
            const burnDmg = Math.floor(mob.maxHp * 0.03);
            mob.hp -= burnDmg;
            combatMsg += `Поджог: -${burnDmg}. `;
            if (mob.hp <= 0) {
                this.defeatFishingMob();
                return;
            }
        }

        this.fishingPlayerHp -= mobDmg;
        combatMsg += `-${Math.floor(mobDmg)} урона вам.`;

        if (this.fishingPlayerHp <= 0) {
            this.fishingCombatDefeat();
            return;
        }

        this.msg(combatMsg);
        this.showFishingCombatUI();
    },

    fishingCombatFlee() {
        this.msg('Вы сбежали от моба!');
        this.endFishingCombat();
    },

    defeatFishingMob() {
        const mob = this.fishingMob;
        if (!mob) return;
        const islandKey = mob.island;
        let loot = [];

        if (mob.isGoldenFish) {
            const goldBagCount = 1 + Math.floor(Math.random() * 3);
            const goldCoins = goldBagCount * 50000;
            this.state.coins += goldCoins;
            loot.push(`+${goldBagCount} Мешочек Золота (+${goldCoins} монет)`);
        } else if (mob.isBoss) {
            const bossDrops = mob.drops || [];
            for (const drop of bossDrops) {
                if (Math.random() * 100 < drop.chance) {
                    if (drop.name === 'Мешочек Золота') {
                        const goldCoins = (drop.count || 1) * 50000;
                        this.state.coins += goldCoins;
                        loot.push(`+${drop.count || 1} Мешочек Золота (+${goldCoins} монет)`);
                    } else {
                        const item = { ...drop, id: Date.now() + Math.random() };
                        delete item.chance;
                        this.state.inventory.push(item);
                        loot.push(`${item.name}!`);
                    }
                }
            }
        } else {
            const mobDrops = FISHING_MOB_DROPS[islandKey] || [];
            if (mobDrops.length > 0) {
                const drop = mobDrops[Math.floor(Math.random() * mobDrops.length)];
                const amount = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
                this.addMaterial(drop.resource, 'material', amount);
                loot.push(`+${amount} ${drop.resource}`);
            }
        }

        const combatXp = 30 + (FISHING_ISLANDS[islandKey]?.minLevel || 0) * 2;
        if (typeof game.addXp === 'function') {
            game.addXp('fishing', combatXp);
        }
        loot.push(`+${combatXp} XP`);

        this.msg(`${mob.name} побеждён! ${loot.join(' | ')}`);
        this.endFishingCombat();
    },

    fishingCombatDefeat() {
        this.msg('Вы проиграли бой! Потеряно 10% монет.');
        this.state.coins = Math.floor(this.state.coins * 0.9);
        this.endFishingCombat();
    },

    endFishingCombat() {
        this.fishingMob = null;
        const combatDiv = document.getElementById('fishing-combat');
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
