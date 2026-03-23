// ritual.js — Diana Ritual / Mythological event

const RITUAL_MOBS_BY_RARITY = {
    common: [
        { n: 'Minos Hunter', p: 57.14, hp: 200, dmg: 30, xp: 30, tier: 'normal' },
        { n: 'Siamese Lynx', p: 42.86, hp: 300, dmg: 25, xp: 20, tier: 'normal' }
    ],
    uncommon: [
        { n: 'Minos Hunter', p: 26.67, hp: 200, dmg: 30, xp: 30, tier: 'normal' },
        { n: 'Siamese Lynx', p: 40, hp: 300, dmg: 25, xp: 20, tier: 'normal' },
        { n: 'Venerable Minotaur', p: 33.33, hp: 600, dmg: 20, xp: 20, tier: 'uncommon' }
    ],
    rare: [
        { n: 'Blessed Minos Hunter', p: 16.67, hp: 400, dmg: 50, xp: 40, tier: 'rare' },
        { n: 'Blessed Siamese Lynx', p: 27.78, hp: 600, dmg: 40, xp: 50, tier: 'rare' },
        { n: 'Exalted Minotaur', p: 33.33, hp: 1200, dmg: 40, xp: 60, tier: 'rare' },
        { n: 'Stalwart Gaia Construct', p: 22.22, hp: 2000, dmg: 60, xp: 70, tier: 'rare' }
    ],
    epic: [
        { n: 'Blessed Minos Hunter', p: 9.52, hp: 400, dmg: 50, xp: 40, tier: 'epic' },
        { n: 'Blessed Siamese Lynx', p: 19.05, hp: 600, dmg: 40, xp: 50, tier: 'epic' },
        { n: 'Exalted Minotaur', p: 23.81, hp: 1200, dmg: 40, xp: 60, tier: 'epic' },
        { n: 'Stalwart Gaia Construct', p: 28.57, hp: 2000, dmg: 60, xp: 60, tier: 'epic' },
        { n: 'Venerable Minos Champion', p: 19.05, hp: 1800, dmg: 75, xp: 80, tier: 'epic' }
    ],
    legendary: [
        { n: 'Stalwart Minos Hunter', p: 12.35, hp: 500, dmg: 60, xp: 65, tier: 'legendary' },
        { n: 'Stalwart Siamese Lynx', p: 18.52, hp: 700, dmg: 50, xp: 70, tier: 'legendary' },
        { n: 'Empyrean Minotaur', p: 24.69, hp: 1500, dmg: 50, xp: 150, tier: 'legendary' },
        { n: 'Venerable Gaia Construct', p: 24.69, hp: 2000, dmg: 80, xp: 250, tier: 'legendary' },
        { n: 'Exalted Minos Champion', p: 18.52, hp: 2000, dmg: 90, xp: 300, tier: 'legendary' },
        { n: 'Exalted Minos Inquisitor', p: 1.23, hp: 3000, dmg: 20, xp: 500, tier: 'inquisitor', inc: 10 }
    ]
};

// ─── Типы лунок ───────────────────────────────────────────────
// rareMul — множитель для редких дропов (шанс предметов/мобов с низкой вероятностью)
// Предметы с базовым шансом >= 60% не получают буста
const HOLE_TYPES = [
    { id: 'common',    label: 'ОБЫЧНАЯ',    color: '#aaaaaa', mobChance: 0.28, rareMul: 1.0 },
    { id: 'rare',      label: 'РЕДКАЯ',     color: '#5555ff', mobChance: 0.38, rareMul: 1.3 },
    { id: 'epic',      label: 'ЭПИЧЕСКАЯ',  color: '#aa00aa', mobChance: 0.50, rareMul: 1.6 },
    { id: 'legendary', label: 'ЛЕГЕНДАРНАЯ',color: '#ffaa00', mobChance: 0.65, rareMul: 2.0 }
];

function rollHoleType(spadeName) {
    let pool, weights;
    if (spadeName === 'Deific Spade') {
        pool = HOLE_TYPES;
        weights = [55, 25, 15, 5];
    } else if (spadeName === 'Archaic Spade') {
        pool = HOLE_TYPES.slice(0, 3);
        weights = [55, 30, 15];
    } else {
        pool = HOLE_TYPES.slice(0, 2);
        weights = [70, 30];
    }
    let r = Math.random() * 100;
    for (let i = 0; i < pool.length; i++) {
        r -= weights[i];
        if (r <= 0) return pool[i];
    }
    return pool[0];
}

function ritualPick(arr) {
    let r = Math.random() * 100;
    for (const x of arr) {
        r -= x.p;
        if (r <= 0) return { ...x };
    }
    return { ...arr[arr.length - 1] };
}

// Выбор с учётом редкости лунки: мобы с p < 5% (инквизитор и аналоги) получают rareMul-буст
function ritualPickWithHole(arr, rareMul) {
    rareMul = rareMul || 1;
    const weights = arr.map(x => x.p < 5 ? x.p * rareMul : x.p);
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < arr.length; i++) {
        r -= weights[i];
        if (r <= 0) return { ...arr[i] };
    }
    return { ...arr[arr.length - 1] };
}

// Взвешенный выбор награды с бустом редких позиций (p < 60% получают rareMul)
function rollRewardWithHole(tbl, rareMul) {
    rareMul = rareMul || 1;
    const weights = tbl.map(x => x.p < 60 ? x.p * rareMul : x.p);
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < tbl.length; i++) {
        r -= weights[i];
        if (r <= 0) return tbl[i];
    }
    return tbl[tbl.length - 1];
}

// ─── HP Bar helper ─────────────────────────────────────────────
function hpBarHtml(current, max, color) {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    return `<div class="hp-bar"><div class="hp-fill" style="width:${pct}%;background:${color || 'var(--red)'};"></div></div>`;
}

const Ritual = {
    init() {
        this.updatePortalVisibility();
    },

    _isAdminOrTest() {
        return !tg?.initDataUnsafe?.user || !!window.TG_IS_ADMIN;
    },

    _isDianaActive() {
        const mb = typeof game.getMayorBonuses === 'function' ? game.getMayorBonuses() : {};
        return !!mb.diana_event;
    },

    _getEquippedSpade() {
        return game.state.inventory.find(i => i.equipped && i.type === 'tool' && i.sub_type === 'spade');
    },

    _getEquippedGriffon() {
        return game.state.pets.find(p => p.equipped && p.name === 'Гриффон');
    },

    canUseRitual() {
        return this._isDianaActive() || this._isAdminOrTest();
    },

    updatePortalVisibility() {
        const el = document.getElementById('portal-node-ritual');
        if (!el) return;
        el.style.display = this.canUseRitual() ? '' : 'none';
    },

    openMenu() {
        game.switchTab('ritual-menu');
        this.render();
    },

    _spadeHoles(spade) {
        if (!spade) return 0;
        if (spade.name === 'Deific Spade') return 8;
        if (spade.name === 'Archaic Spade') return 6;
        return 4;
    },

    startRun() {
        const spade = this._getEquippedSpade();
        const griffon = this._getEquippedGriffon();
        if (!spade || !griffon) {
            game.msg('Для ритуала нужен надетый Ancestral/Archaic/Deific Spade и надетый Гриффон.');
            return;
        }
        game.ritualState = {
            active: true,
            lockedPetName: griffon.name,
            hole: 0,
            maxHoles: this._spadeHoles(spade),
            path: [],
            inCombat: false,
            combat: null,
            pendingHole: null, // текущая лунка до выбора пути
            log: ['Ритуал начат. Выберите путь.']
        };
        this.render();
    },

    choosePath(dir) {
        const st = game.ritualState;
        if (!st || !st.active || st.inCombat) return;

        st.path.push(dir);
        st.hole++;

        // Используем тип лунки, который уже был показан на кнопке
        const isLast = st.hole >= st.maxHoles;
        const spadeForRoll = this._getEquippedSpade();
        const holeType = (st.previewHoles && st.previewHoles[dir]) ? st.previewHoles[dir] : rollHoleType(spadeForRoll?.name);
        delete st.previewHoles;
        st.pendingHole = holeType;

        const typeName = `<span style="color:${holeType.color};font-weight:bold;">[${holeType.label}]</span>`;

        if (isLast || Math.random() < holeType.mobChance) {
            st.log.unshift(`Лунка ${st.hole} ${typeName}: появляется моб!`);
            this.spawnMob(holeType);
            return;
        }

        this.rollNonMobReward(holeType);
        this.render();
    },

    _nonMobTable(spadeName) {
        if (spadeName === 'Archaic Spade') {
            return [
                { t: 'mat', n: 'Griffin Feather', p: 63.34, c: 1 },
                { t: 'coin', v: 5000, p: 16.89 },
                { t: 'coin', v: 10000, p: 6.76 },
                { t: 'mat', n: 'Mythos Fragment', p: 6.76, c: 1 },
                { t: 'coin', v: 25000, p: 3.38 },
                { t: 'coin', v: 50000, p: 1.69 },
                { t: 'coin', v: 100000, p: 0.84 },
                { t: 'coin', v: 250000, p: 0.34 }
            ];
        }
        if (spadeName === 'Deific Spade') {
            return [
                { t: 'mat', n: 'Griffin Feather', p: 62.71, c: 1 },
                { t: 'coin', v: 10000, p: 15.52 },
                { t: 'mat', n: 'Mythos Fragment', p: 9.31, c: 1 },
                { t: 'coin', v: 25000, p: 6.21 },
                { t: 'coin', v: 50000, p: 3.10 },
                { t: 'coin', v: 100000, p: 1.55 },
                { t: 'coin', v: 250000, p: 0.78 },
                { t: 'coin', v: 500000, p: 0.47 },
                { t: 'coin', v: 1000000, p: 0.31 }
            ];
        }
        return [
            { t: 'mat', n: 'Griffin Feather', p: 66.67, c: 1 },
            { t: 'coin', v: 2500, p: 15.62 },
            { t: 'coin', v: 5000, p: 10.42 },
            { t: 'coin', v: 10000, p: 5.21 },
            { t: 'coin', v: 25000, p: 2.08 }
        ];
    },

    rollNonMobReward(holeType) {
        const st = game.ritualState;
        const spade = this._getEquippedSpade();
        const tbl = this._nonMobTable(spade?.name || 'Ancestral Spade');
        const rareMul = holeType ? holeType.rareMul : 1;

        // Редкость лунки бустит шанс редких предметов (p < 60%), не их количество/ценность
        const pick = rollRewardWithHole(tbl, rareMul);

        const hColor = holeType ? holeType.color : '#aaa';
        const hLabel = holeType ? holeType.label : '';

        if (pick.t === 'coin') {
            game.state.coins += pick.v;
            st.log.unshift(`Лунка ${st.hole} <span style="color:${hColor}">[${hLabel}]</span>: +${pick.v.toLocaleString()} 💰`);
        } else {
            const cnt = pick.c || 1;
            game.addMaterial(pick.n, 'material', cnt);
            st.log.unshift(`Лунка ${st.hole} <span style="color:${hColor}">[${hLabel}]</span>: +${cnt} ${pick.n}`);
        }
    },

    spawnMob(holeType) {
        const st = game.ritualState;
        const griffon = this._getEquippedGriffon();
        const rarity = griffon?.rarity || 'common';
        const rareMul = holeType ? holeType.rareMul : 1;
        const mob = ritualPickWithHole(RITUAL_MOBS_BY_RARITY[rarity] || RITUAL_MOBS_BY_RARITY.common, rareMul);

        st.inCombat = true;
        st.combat = {
            mob,
            mobHp: mob.hp,
            pHp: Math.floor(game.calcStats(true).hp || 100),
            pMax: Math.floor(game.calcStats(true).hp || 100),
            hits: 0,
            holeType: holeType || HOLE_TYPES[0]
        };
        this.render();
    },

    attack() {
        const st = game.ritualState;
        if (!st?.inCombat || !st.combat) return;
        const s = game.calcStats(true);
        const c = st.combat;
        let playerDmg = Math.max(1, Math.floor((s.str || 10) * (1 + (s.ritual_mob_damage || 0) / 100)));
        if (Math.random() * 100 < (s.cc || 0)) playerDmg = Math.floor(playerDmg * (1 + (s.cd || 0) / 100));
        c.mobHp -= playerDmg;
        if (c.mobHp <= 0) {
            game.addXp('combat', c.mob.xp || 10);
            const pet = game.state.pets.find(p => p.equipped);
            if (pet && typeof game.addPetXp === 'function') game.addPetXp(pet, (c.mob.xp || 10) * 0.5);
            this.rollMobDrops(c.mob, c.holeType);
            st.inCombat = false;
            st.combat = null;
            st.log.unshift(`${c.mob.n} побеждён!`);
            if (st.hole >= st.maxHoles) {
                // Ритуал завершён — не выключаем, а предлагаем новый
                st.active = false;
                st.lockedPetName = null;
                st.log.unshift('Ритуал завершён! Начать новый?');
            }
            game.updateUI();
            this.render();
            return;
        }
        c.hits++;
        let mobDmg = c.mob.dmg || 10;
        if (c.mob.tier === 'inquisitor') mobDmg += c.hits * (c.mob.inc || 10);
        mobDmg = Math.max(1, Math.floor(mobDmg * (1 - (s.ritual_mob_def_bonus || 0) / 100)));
        c.pHp -= Math.max(1, mobDmg - Math.floor((s.def || 0) / 5));
        if (c.pHp <= 0) {
            st.inCombat = false;
            st.combat = null;
            st.active = false;
            st.lockedPetName = null;
            st.log.unshift('Вы погибли в ритуале.');
        }
        this.render();
    },

    _addTalisman(name, stats, rarity, cost) {
        const already = game.state.inventory.some(i => i.name === name && i.type === 'accessory');
        if (already) {
            const consolation = Math.floor(cost * 0.05);
            game.state.coins += consolation;
            game.ritualState?.log?.unshift?.(`${name} уже есть — +${consolation.toLocaleString()} 💰`);
            return;
        }
        game.state.inventory.push({
            id: game.state.nextItemId++,
            name,
            type: 'accessory',
            rarity,
            cost,
            equipped: false,
            count: 1,
            ...stats
        });
        game.ritualState?.log?.unshift?.(`🏆 ДРОП: ${name}!`);
    },

    rollMobDrops(mob, holeType) {
        const s = game.calcStats(true);
        const griffon = this._getEquippedGriffon();
        let mf = s.mf || 0;
        if (this._isDianaActive() && griffon?.rarity === 'legendary') mf *= 2;
        const baseMul = 1 + mf / 100;
        const holeMul = holeType ? holeType.rareMul : 1;
        const mul = baseMul * holeMul;

        let ancient = 30, stick = 0;
        if (mob.tier === 'uncommon') { ancient = 40; stick = 0.1; }
        if (mob.tier === 'rare') { ancient = 50; stick = 1; }
        if (mob.tier === 'epic') { ancient = 60; stick = 2; }
        if (mob.tier === 'legendary' || mob.tier === 'inquisitor') { ancient = 60; stick = 3; }
        if (Math.random() * 100 < ancient * mul) game.addMaterial('Ancient Claw', 'material', 1);
        if (Math.random() * 100 < stick * mul) game.addMaterial('Daedalus Stick', 'material', 1);
        if (mob.tier === 'inquisitor' && Math.random() * 100 < 1 * mul) game.addMaterial('Chimera Enchantment', 'material', 1);

        // Diana Bookshelf — 2% с Минотавра и Инквизитора, +5 MF, легендарный, 50M
        if (mob.n.includes('Minotaur') || mob.tier === 'inquisitor') {
            if (Math.random() * 100 < 2 * mul) {
                this._addTalisman('Diana Bookshelf', { mf: 5 }, 'legendary', 50000000);
            }
        }

        // Gaia Stone — 1% с Gaia Construct и Minos Champion, +10 DEF, редкий, 2M
        if (mob.n.includes('Gaia Construct') || mob.n.includes('Minos Champion')) {
            if (Math.random() * 100 < 1 * mul) {
                this._addTalisman('Gaia Stone', { def: 10 }, 'rare', 2000000);
            }
        }
    },

    render() {
        const c = document.getElementById('ritual-content');
        if (!c) return;
        const st = game.ritualState;
        const can = this.canUseRitual();
        const spade = this._getEquippedSpade();
        const griffon = this._getEquippedGriffon();

        if (!can) {
            c.innerHTML = '<div class="card">Ритуал доступен только во время Diana (или в админ/тест режиме).</div>';
            return;
        }

        // ── Экран завершения / начала ─────────────────────────────
        if (!st || !st.active) {
            const logHtml = st?.log?.length
                ? (st.log).slice(0, 7).map(x => `<div style="font-size:0.82rem;">• ${x}</div>`).join('')
                : '';
            const finished = st && st.log && st.log[0]?.includes('завершён');
            c.innerHTML = `
                <div class="card">
                    <b>${finished ? '✅ Ритуал завершён!' : 'Подготовка к ритуалу'}</b>
                    ${finished ? '' : '<br><small>Нужно надеть лопату и Гриффона.</small>'}
                    <div style="margin-top:8px;">Лопата: <b>${spade?.name || 'не надета'}</b></div>
                    <div>Питомец: <b>${griffon?.name || 'не надет'}</b></div>
                    <div class="item-actions" style="margin-top:10px;">
                        <button class="cooldown-btn" ${spade && griffon ? '' : 'disabled'} onclick="Ritual.startRun()">
                            ${finished ? '🔄 НОВЫЙ РИТУАЛ' : 'НАЧАТЬ РИТУАЛ'}
                        </button>
                    </div>
                </div>
                ${logHtml ? `<div class="card">${logHtml}</div>` : ''}
            `;
            return;
        }

        const log = (st.log || []).slice(0, 7).map(x => `<div style="font-size:0.82rem;">• ${x}</div>`).join('');

        // ── Экран боя ─────────────────────────────────────────────
        if (st.inCombat && st.combat) {
            const c2 = st.combat;
            const ht = c2.holeType || HOLE_TYPES[0];
            c.innerHTML = `
                <div class="card">
                    <b>Бой: <span style="color:${ht.color}">[${ht.label}]</span> ${c2.mob.n}</b>

                    <div style="display:flex;justify-content:space-between;margin-top:10px;">
                        <span>ХП ВРАГА</span>
                        <span>${Math.max(0, Math.floor(c2.mobHp))}/${c2.mob.hp}</span>
                    </div>
                    ${hpBarHtml(Math.max(0, c2.mobHp), c2.mob.hp, 'var(--red)')}

                    <div style="display:flex;justify-content:space-between;margin-top:10px;">
                        <span>ТВОЁ ХП</span>
                        <span>${Math.max(0, Math.floor(c2.pHp))}/${c2.pMax}</span>
                    </div>
                    ${hpBarHtml(Math.max(0, c2.pHp), c2.pMax, 'var(--blue)')}

                    <div class="item-actions" style="margin-top:12px;">
                        <button class="cooldown-btn" onclick="Ritual.attack()">⚔️ АТАКОВАТЬ</button>
                    </div>
                </div>
                <div class="card">${log}</div>
            `;
            return;
        }

        // ── Экран выбора пути (лунки) ─────────────────────────────
        // Генерируем типы лунок один раз и сохраняем в стейте,
        // чтобы choosePath использовал именно то, что показано на кнопках
        if (!st.previewHoles) {
            st.previewHoles = {
                left:    rollHoleType(spade?.name),
                forward: rollHoleType(spade?.name),
                right:   rollHoleType(spade?.name)
            };
        }
        const { left: leftHole, forward: fwdHole, right: rightHole } = st.previewHoles;

        c.innerHTML = `
            <div class="card">
                <b>Лунка ${st.hole + 1}/${st.maxHoles}</b><br>
                <small>Выберите путь. Цвет — редкость лунки.</small>
                <div class="item-actions" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="act-btn" style="border-color:${leftHole.color};color:${leftHole.color};"
                        onclick="Ritual.choosePath('left')">⬅️ Влево<br><small>${leftHole.label}</small></button>
                    <button class="act-btn" style="border-color:${fwdHole.color};color:${fwdHole.color};"
                        onclick="Ritual.choosePath('forward')">⬆️ Вперед<br><small>${fwdHole.label}</small></button>
                    <button class="act-btn" style="border-color:${rightHole.color};color:${rightHole.color};"
                        onclick="Ritual.choosePath('right')">➡️ Вправо<br><small>${rightHole.label}</small></button>
                </div>
            </div>
            <div class="card">${log}</div>
        `;
    }
};

Object.assign(game, {
    openRitualMenu() {
        Ritual.openMenu();
    }
});
