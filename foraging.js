// foraging.js — Система леса с 3 островами

const FORAGING_ISLANDS = {
    normal_park: {
        id: 'normal_park',
        name: 'Обычный Парк',
        icon: '\u{1F333}',
        desc: 'Базовые деревья. Уровень 0-10.',
        minLevel: 0,
        trees: ['Дуб', 'Берёза', 'Осина', 'Ель'],
        minBlocks: 4,
        maxBlocks: 6,
        resourceValue: 2,
        mobs: [
            { name: 'Дикий Кабан', hp: 60, dmg: 12, def: 3 },
            { name: 'Лесной Волк', hp: 45, dmg: 18, def: 2 },
            { name: 'Энт-саженец', hp: 100, dmg: 8, def: 15 }
        ]
    },
    dark_park: {
        id: 'dark_park',
        name: 'Тёмный Парк',
        icon: '\u{1F332}',
        desc: 'Тёмные деревья. Уровень 10-20.',
        minLevel: 10,
        trees: ['Тёмный Дуб', 'Акация', 'Вяз Тьмы', 'Чёрная Ива'],
        minBlocks: 8,
        maxBlocks: 12,
        resourceValue: 4,
        mobs: [
            { name: 'Тёмный Энт', hp: 250, dmg: 45, def: 20 },
            { name: 'Лесной Фантом', hp: 180, dmg: 60, def: 10 },
            { name: 'Проклятый Лесник', hp: 300, dmg: 35, def: 30 }
        ]
    },
    galatea: {
        id: 'galatea',
        name: 'Галатея',
        icon: '\u{2728}',
        desc: 'Легендарные деревья. Уровень 20+.',
        minLevel: 20,
        trees: ['Древо Жизни', 'Кристальный Кедр', 'Звёздная Секвойя', 'Лунный Ясень'],
        minBlocks: 20,
        maxBlocks: 40,
        resourceValue: 6,
        mobs: [
            { name: 'Древний Страж', hp: 600, dmg: 90, def: 35 },
            { name: 'Кристальный Дракон', hp: 800, dmg: 120, def: 25 },
            { name: 'Хранитель Рощи', hp: 1000, dmg: 80, def: 50 }
        ]
    }
};

const FORAGING_MOB_COMBAT_CHANCE = 5;

const FORAGING_MOB_DROPS = {
    normal_park: [
        { resource: 'Дуб', min: 3, max: 8 },
        { resource: 'Берёза', min: 2, max: 5 },
        { resource: 'Осина', min: 1, max: 3 }
    ],
    dark_park: [
        { resource: 'Тёмный Дуб', min: 3, max: 8 },
        { resource: 'Акация', min: 2, max: 6 },
        { resource: 'Вяз Тьмы', min: 1, max: 4 }
    ],
    galatea: [
        { resource: 'Древо Жизни', min: 2, max: 6 },
        { resource: 'Кристальный Кедр', min: 1, max: 4 },
        { resource: 'Звёздная Секвойя', min: 1, max: 3 }
    ]
};

const FORAGING_RARE_MOB_DROPS = [
    { name: 'Топор Древнего', type: 'weapon', str: 65, cd: 25, cost: 5000000, chance: 1 },
    { name: 'Талисман Леса', type: 'accessory', foraging_fortune: 40, foraging_exp_bonus: 3, cost: 3000000, chance: 1 }
];

Object.assign(game, {
    currentForagingIsland: null,
    foragingTree: null,
    foragingMob: null,

    openForagingMenu() {
        this.currentLoc = 'forage';
        this.currentForagingIsland = null;
        this.foragingTree = null;
        this.switchTab('action-loc');
        document.getElementById('loc-title').innerText = 'ЛЕС \u{2014} ВЫБОР ОСТРОВА';
        document.getElementById('loc-log').innerText = '';

        const extraBtn = document.getElementById('extra-action-container');
        if (extraBtn) extraBtn.style.display = 'none';
        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) actionBtn.style.display = 'none';

        const islandContainer = document.getElementById('mining-islands');
        if (islandContainer) {
            islandContainer.style.display = 'block';
            let talentHtml = `
                <div class="card" style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,180,80,0.1); border-color:var(--green); margin-bottom:10px;">
                    <div>
                        <b style="color:var(--green)">📜 ТАЛАНТЫ ЛЕСА</b><br>
                        <small style="color:var(--gray)">ПРОКАЧКА ДРОВОСЕКА</small>
                    </div>
                    <button class="act-btn" style="width:100px; height:40px; font-weight:bold;" onclick="game.showModal('foragingTalentsModal')">ОТКРЫТЬ</button>
                </div>
            `;
            islandContainer.innerHTML = talentHtml;
            this.renderForagingIslands();
        }
    },

    renderForagingIslands() {
        const container = document.getElementById('mining-islands');
        if (!container) return;

        const foragingLvl = game.state.skills.foraging?.lvl || 1;
        let html = '';

        for (const [key, island] of Object.entries(FORAGING_ISLANDS)) {
            const locked = foragingLvl < (island.minLevel || 0);

            if (locked) {
                html += `
                    <div class="card" style="margin-bottom:10px; opacity:0.4; cursor:not-allowed;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <b style="font-size:1.1rem;">${island.icon} ${island.name}</b>
                            <small style="color:var(--red)">Нужен ${island.minLevel} лвл</small>
                        </div>
                        <p style="color:var(--gray); font-size:0.75rem;">Требуется уровень леса ${island.minLevel}</p>
                    </div>
                `;
                continue;
            }

            const treeList = island.trees.map(t => `<span style="color:var(--gray)">${t}</span>`).join(', ');
            const mobNames = island.mobs ? island.mobs.map(m => m.name).join(', ') : '';

            html += `
                <div class="card" style="margin-bottom:10px; cursor:pointer; border: 1px solid var(--accent);" onclick="game.selectForagingIsland('${key}')">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <b style="font-size:1.1rem;">${island.icon} ${island.name}</b>
                        <small style="color:var(--green)">${island.minBlocks}-${island.maxBlocks} блоков</small>
                    </div>
                    <p style="color:var(--gray); font-size:0.75rem; margin-bottom:8px;">${island.desc}</p>
                    <div style="font-size:0.7rem; line-height:1.6;">Деревья: ${treeList}</div>
                    <div style="margin-top:5px;"><small style="color:var(--accent)">Ценность: ${island.resourceValue} монет/ед.</small></div>
                    ${mobNames ? `<div style="margin-top:5px;"><small style="color:var(--red)">Мобы: ${mobNames}</small></div>` : ''}
                </div>
            `;
        }

        container.innerHTML += html;
    },

    selectForagingIsland(islandKey) {
        const island = FORAGING_ISLANDS[islandKey];
        if (!island) return;

        const foragingLvl = this.state.skills.foraging?.lvl || 1;
        if (foragingLvl < (island.minLevel || 0)) {
            this.msg(`Нужен ${island.minLevel} уровень леса!`);
            return;
        }

        this.currentLoc = 'forage';
        this.currentForagingIsland = islandKey;

        const locTitle = document.getElementById('loc-title');
        locTitle.innerText = `${island.icon} ${island.name}`;
        locTitle.style.cursor = 'pointer';
        locTitle.onclick = () => game.openForagingMenu();
        document.getElementById('loc-log').innerText = '';

        const islandContainer = document.getElementById('mining-islands');
        if (islandContainer) islandContainer.style.display = 'none';

        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) {
            actionBtn.style.display = 'flex';
            actionBtn.style.alignItems = 'center';
            actionBtn.style.justifyContent = 'center';
            const span = actionBtn.querySelector('span');
            if (span) span.innerText = 'РУБИТЬ';
        }

        const extraBtn = document.getElementById('extra-action-container');
        if (extraBtn) extraBtn.style.display = 'none';

        this.spawnTree();
    },

    spawnTree() {
        const islandKey = this.currentForagingIsland;
        const island = FORAGING_ISLANDS[islandKey];
        if (!island) return;

        const treeName = island.trees[Math.floor(Math.random() * island.trees.length)];
        const totalBlocks = island.minBlocks + Math.floor(Math.random() * (island.maxBlocks - island.minBlocks + 1));

        this.foragingTree = {
            name: treeName,
            totalBlocks: totalBlocks,
            currentBlocks: 0,
            resource: treeName,
            island: islandKey,
            resourceValue: island.resourceValue
        };

        this.updateTreeProgress();
    },

    updateTreeProgress() {
        const tree = this.foragingTree;
        if (!tree) return;

        const pct = Math.floor((tree.currentBlocks / tree.totalBlocks) * 100);
        const locLog = document.getElementById('loc-log');
        if (locLog) {
            locLog.innerText = `\u{1F332} ${tree.name} \u{2014} ${tree.currentBlocks}/${tree.totalBlocks} \u{0431}\u{043B}\u{043E}\u{043A}\u{043E}\u{0432} (${pct}%)`;
        }
    },

    processForagingAction() {
        if (!this.state.skills.foraging) {
            this.state.skills.foraging = { lvl: 1, xp: 0, next: 100, label: 'ЛЕС' };
        }

        if (!this.currentForagingIsland || !this.foragingTree) {
            this.openForagingMenu();
            return;
        }

        if (!this.state.foragingTalents) {
            this.state.foragingTalents = {
                fortune: { lvl: 0, max: 25 },
                exp: { lvl: 0, max: 10 },
                double_drop: { lvl: 0, max: 10, req: { id: 'fortune', lvl: 3 } },
                triple_drop: { lvl: 0, max: 10, req: { id: 'double_drop', lvl: 5 } },
                instant_chop: { lvl: 0, max: 5, req: { id: 'fortune', lvl: 5 } }
            };
        }

        const instantLvl = this.state.foragingTalents?.instant_chop?.lvl || 0;
        const instantChance = instantLvl * 0.6;
        if (instantLvl > 0 && Math.random() * 100 < instantChance) {
            this.foragingTree.currentBlocks = this.foragingTree.totalBlocks;
            this.msg('ТАЛАНТ: Мгновенная рубка!');
        } else {
            this.foragingTree.currentBlocks++;
        }

        if (this.foragingTree.currentBlocks >= this.foragingTree.totalBlocks) {
            this.harvestTree();
        } else {
            this.updateTreeProgress();
        }

        this.updateUI();
    },

    harvestTree() {
        const tree = this.foragingTree;
        if (!tree) return;

        const s = this.calcStats(false);
        const fortune = s.foraging_fortune || 0;
        const exp_bonus = s.foraging_exp_bonus || 0;
        const gold_bonus = s.gold_bonus || 0;

        let amount = 1;
        const guaranteed = Math.floor(fortune / 100);
        amount += guaranteed;
        if (Math.random() * 100 < (fortune % 100)) amount++;

        const talentFortuneLvl = this.state.foragingTalents?.fortune?.lvl || 0;
        const talentFortune = talentFortuneLvl * 3;
        if (talentFortune > 0) {
            const extra = Math.floor(talentFortune / 100);
            amount += extra;
            if (Math.random() * 100 < (talentFortune % 100)) amount++;
        }

        const ddLvl = this.state.foragingTalents?.double_drop?.lvl || 0;
        if (ddLvl > 0 && Math.random() * 100 < (ddLvl * 2)) {
            amount *= 2;
            this.msg('ТАЛАНТ: Двойной дроп!');
        }

        const tdLvl = this.state.foragingTalents?.triple_drop?.lvl || 0;
        if (tdLvl > 0 && Math.random() * 100 < (tdLvl * 0.5)) {
            amount *= 3;
            this.msg('ТАЛАНТ: Тройной дроп!');
        }

        const equippedTool = this.state.inventory.find(i => i.equipped && i.type === 'tool' && i.sub_type === 'axe');
        if (equippedTool) {
            if (equippedTool.triple_chance && Math.random() * 100 < equippedTool.triple_chance) {
                amount *= 3;
            } else if (equippedTool.double_chance && Math.random() * 100 < equippedTool.double_chance) {
                amount *= 2;
            }
        }

        if (amount < 1) amount = 1;

        this.addMaterial(tree.resource, 'material', amount);

        const base_xp = 25;
        const talentExpLvl = this.state.foragingTalents?.exp?.lvl || 0;
        const talentExpBonus = talentExpLvl * 0.5;
        const total_xp = base_xp * (1 + (exp_bonus + talentExpBonus) / 100);

        const coinsGain = Math.floor(tree.totalBlocks * tree.resourceValue * (1 + gold_bonus / 100));
        this.state.coins += coinsGain;

        if (typeof this.addXp === 'function') {
            this.addXp('foraging', total_xp);
        }

        const pet = this.state.pets.find(p => p.equipped && p.skill === 'foraging');
        if (pet) {
            this.addPetXp(pet, total_xp * 0.5);
        }

        const locLog = document.getElementById('loc-log');
        if (locLog) {
            locLog.innerText = `\u{1F332} ${tree.name} срублен! +${amount} ${tree.resource} | +${total_xp.toFixed(1)} XP | +${coinsGain} монет`;
        }

        if (Math.random() * 100 < FORAGING_MOB_COMBAT_CHANCE) {
            this.startForagingCombat();
        } else {
            this.spawnTree();
        }

        this.updateUI();
    },

    startForagingCombat() {
        const islandKey = this.currentForagingIsland;
        const island = FORAGING_ISLANDS[islandKey];
        if (!island || !island.mobs || island.mobs.length === 0) return;

        const mobTemplate = island.mobs[Math.floor(Math.random() * island.mobs.length)];
        this.foragingMob = {
            name: mobTemplate.name,
            hp: mobTemplate.hp,
            maxHp: mobTemplate.hp,
            dmg: mobTemplate.dmg,
            def: mobTemplate.def,
            island: islandKey
        };

        const s = this.calcStats(false);
        this.foragingPlayerHp = s.hp || 100;
        this.foragingPlayerMaxHp = s.hp || 100;

        this.showForagingCombatUI();
    },

    showForagingCombatUI() {
        const mob = this.foragingMob;
        if (!mob) return;

        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) actionBtn.style.display = 'none';

        let combatDiv = document.getElementById('foraging-combat');
        if (!combatDiv) {
            const card = document.querySelector('#action-loc .card');
            if (!card) return;
            combatDiv = document.createElement('div');
            combatDiv.id = 'foraging-combat';
            card.appendChild(combatDiv);
        }
        combatDiv.style.display = 'block';

        const mobHpPct = Math.max(0, (mob.hp / mob.maxHp) * 100);
        const pHpPct = Math.max(0, (this.foragingPlayerHp / this.foragingPlayerMaxHp) * 100);

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
                    <small>${Math.max(0, Math.floor(this.foragingPlayerHp))} / ${this.foragingPlayerMaxHp} HP</small>
                </div>
                <button class="act-btn" style="width:100%; height:45px; background:var(--red); font-weight:bold; margin-top:5px;" onclick="game.foragingCombatAttack()">АТАКОВАТЬ</button>
                <button class="act-btn" style="width:100%; height:35px; background:var(--gray); margin-top:5px; font-size:0.75rem;" onclick="game.foragingCombatFlee()">СБЕЖАТЬ</button>
            </div>
        `;
    },

    foragingCombatAttack() {
        const mob = this.foragingMob;
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
            this.defeatForagingMob();
            return;
        }

        const mobDmg = Math.max(1, mob.dmg - (s.def || 0));

        if (weapon?.burn) {
            const burnDmg = Math.floor(mob.maxHp * 0.03);
            mob.hp -= burnDmg;
            combatMsg += `Поджог: -${burnDmg}. `;
            if (mob.hp <= 0) {
                this.defeatForagingMob();
                return;
            }
        }

        this.foragingPlayerHp -= mobDmg;
        combatMsg += `-${Math.floor(mobDmg)} урона вам.`;

        if (this.foragingPlayerHp <= 0) {
            this.foragingCombatDefeat();
            return;
        }

        this.msg(combatMsg);
        this.showForagingCombatUI();
    },

    foragingCombatFlee() {
        this.msg('Вы сбежали от моба!');
        this.endForagingCombat();
    },

    defeatForagingMob() {
        const mob = this.foragingMob;
        if (!mob) return;
        const islandKey = mob.island;
        let loot = [];

        const mobDrops = FORAGING_MOB_DROPS[islandKey] || [];
        if (mobDrops.length > 0) {
            const drop = mobDrops[Math.floor(Math.random() * mobDrops.length)];
            const amount = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
            this.addMaterial(drop.resource, 'material', amount);
            loot.push(`+${amount} ${drop.resource}`);
        }

        for (const rareDrop of FORAGING_RARE_MOB_DROPS) {
            if (Math.random() * 100 < rareDrop.chance) {
                const item = { ...rareDrop, id: Date.now() + Math.random() };
                delete item.chance;
                this.state.inventory.push(item);
                loot.push(`${item.name}!`);
            }
        }

        const combatXp = 30 + (FORAGING_ISLANDS[islandKey]?.minLevel || 0) * 2;
        if (typeof game.addXp === 'function') {
            game.addXp('foraging', combatXp);
        }
        loot.push(`+${combatXp} XP`);

        this.msg(`${mob.name} побеждён! ${loot.join(' | ')}`);
        this.endForagingCombat();
    },

    foragingCombatDefeat() {
        this.msg('Вы проиграли бой! Потеряно 10% монет.');
        this.state.coins = Math.floor(this.state.coins * 0.9);
        this.endForagingCombat();
    },

    endForagingCombat() {
        this.foragingMob = null;
        const combatDiv = document.getElementById('foraging-combat');
        if (combatDiv) combatDiv.style.display = 'none';

        const actionBtn = document.getElementById('action-btn');
        if (actionBtn) {
            actionBtn.style.display = 'flex';
            actionBtn.style.alignItems = 'center';
            actionBtn.style.justifyContent = 'center';
        }

        this.spawnTree();
        this.updateUI();
    }
});
