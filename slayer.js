// slayer.js — Система Слейеров

const slayerConfig = {
    zombie: {
        name: 'Zombie',
        levels: [
            { req: 0, hp: 0, sb: 0 },         // lvl 1 (0 exp)
            { req: 25, hp: 5, sb: 1 },        // lvl 2
            { req: 100, hp: 5, sb: 1 },       // lvl 3
            { req: 1000, hp: 10, sb: 1.5 },   // lvl 4
            { req: 5000, hp: 10, sb: 1.5 },   // lvl 5
            { req: 20000, hp: 10, sb: 1.5 },  // lvl 6
            { req: 100000, hp: 10, sb: 1.5 }, // lvl 7
            { req: 400000, hp: 15, sb: 2 },   // lvl 8
            { req: 1000000, hp: 15, sb: 2 },  // lvl 9
            { req: 5000000, hp: 20, sb: 3 }   // lvl 10
        ],
        bosses: [
            {
                tier: 1,
                hp: 100,
                dmg: 15,
                def: 50,
                magicRes: 10,
                reqKills: 5,
                cost: 500,
                xp: 5,
                fleshDrop: 1
            },
            {
                tier: 2,
                hp: 250,
                dmg: 60,
                def: 40,
                magicRes: 25,
                reqKills: 10,
                cost: 2500,
                xp: 25,
                fleshDrop: 2
            },
            {
                tier: 3,
                hp: 750,
                dmg: 120,
                def: 60,
                magicRes: 40,
                reqKills: 15,
                cost: 10000,
                xp: 100,
                fleshDropMin: 2,
                fleshDropMax: 4
            },
            {
                tier: 4,
                hp: 2500,
                dmg: 200,
                def: 100,
                magicRes: 70,
                reqKills: 20,
                cost: 500000,
                xp: 500,
                fleshDropMin: 4,
                fleshDropMax: 5,
                enrage: { hpThreshold: 0.4, dmg: 350, def: 150 }
            },
            {
                tier: 5,
                hp: 10000,
                dmg: 250,
                def: 150,
                magicRes: 80,
                reqKills: 25,
                cost: 2000000,
                xp: 2000,
                fleshDropMin: 6,
                fleshDropMax: 10
            }
        ],
        tierMobs: {
            1: [
                { name: 'Обычный Зомби', hp: 50, dmg: 5, def: 15, exp: 1, chance: 90 },
                { name: 'Крепкий Зомби', hp: 75, dmg: 5, def: 30, exp: 2, chance: 10 }
            ],
            2: [
                { name: 'Обычный Зомби', hp: 200, dmg: 25, def: 30, exp: 1, chance: 85 },
                { name: 'Крепкий Зомби', hp: 350, dmg: 35, def: 50, exp: 2, chance: 15 }
            ],
            3: [
                { name: 'Обычный Зомби', hp: 400, dmg: 40, def: 40, exp: 1, chance: 80 },
                { name: 'Крепкий Зомби', hp: 600, dmg: 55, def: 60, exp: 2, chance: 15 },
                { name: 'Агрессивный Зомби', hp: 600, dmg: 75, def: 60, exp: 3, chance: 5 }
            ],
            4: [
                { name: 'Обычный Зомби', hp: 800, dmg: 80, def: 60, exp: 1, chance: 70 },
                { name: 'Крепкий Зомби', hp: 1200, dmg: 100, def: 80, exp: 2, chance: 20 },
                { name: 'Агрессивный Зомби', hp: 1200, dmg: 140, def: 90, exp: 3, chance: 10 }
            ],
            5: [
                { name: 'Обычный Зомби', hp: 1400, dmg: 140, def: 120, exp: 1, chance: 65 },
                { name: 'Крепкий Зомби', hp: 1900, dmg: 190, def: 140, exp: 2, chance: 22 },
                { name: 'Агрессивный Зомби', hp: 2200, dmg: 250, def: 150, exp: 3, chance: 13 }
            ]
        },
        mobs: [
            { name: 'Обычный Зомби', hp: 50, dmg: 5, def: 15, exp: 1, chance: 90 },
            { name: 'Крепкий Зомби', hp: 75, dmg: 5, def: 30, exp: 2, chance: 10 }
        ]
    }
};

// Expose slayer configuration for info book / UI
window.slayerConfig = slayerConfig;

Object.assign(game, {
    slayerActive: null, // { type: 'zombie', tier: 1, kills: 0, reqKills: 10 }
    slayerMobHp: 0,
    slayerMobMaxHp: 0,
    slayerMobDef: 0,
    slayerMobDmg: 0,
    slayerCurrentMob: null,
    slayerPlayerHp: 0,
    slayerPlayerMaxHp: 0,
    
    openSlayerMenu() {
        if (!this.state.slayer) {
            this.state.slayer = { zombie: { lvl: 1, xp: 0 } };
        }
        
        const content = document.getElementById('slayer-menu');
        if (!content) return;
        
        let zomb = this.state.slayer.zombie;
        const config = slayerConfig.zombie;
        let nextReq = 0;
        if (zomb.lvl < 10) {
            nextReq = config.levels[zomb.lvl]?.req || 0;
        }
        const xpPct = nextReq > 0 ? Math.min(100, (zomb.xp / nextReq * 100)).toFixed(1) : 100;

        let html = `
            <div style="display:flex; flex-direction:column; gap:15px;">
                <button class="top-btn" style="align-self:flex-start; padding: 10px 20px; font-size: 0.9rem;" onclick="game.switchTab('portal')">← НАЗАД В ПОРТАЛ</button>
                <h2 style="text-align:center; color:var(--accent); margin: 10px 0;">👹 ОХОТА НА МОНСТРОВ</h2>
                
                <div class="portal-grid" style="grid-template-columns: repeat(3, 1fr); gap:10px;">
                    <div class="portal-node" style="border:2px solid var(--red); background:linear-gradient(145deg, rgba(255,50,50,0.1), #18181e);" onclick="game.showZombieSlayerDetail()">
                        🧟<br>ЗОМБИ
                    </div>
                    <div class="portal-node" style="opacity:0.4; cursor:not-allowed; border-style:dashed;">
                        🕷️<br>ПАУК<br><small style="color:var(--gray); font-size:0.6rem;">СКОРО</small>
                    </div>
                    <div class="portal-node" style="opacity:0.4; cursor:not-allowed; border-style:dashed;">
                        🐺<br>ВОЛК<br><small style="color:var(--gray); font-size:0.6rem;">СКОРО</small>
                    </div>
                </div>
                
                <div id="slayer-detail-area"></div>
            </div>
        `;
        content.innerHTML = html;
        this.switchTab('slayer-menu');
    },

    showZombieSlayerDetail() {
        const zomb = this.state.slayer?.zombie || { lvl: 1, xp: 0 };
        const config = slayerConfig.zombie;
        let nextReq = 0;
        if (zomb.lvl < 10) {
            nextReq = config.levels[zomb.lvl]?.req || 0;
        }
        const xpPct = nextReq > 0 ? Math.min(100, (zomb.xp / nextReq * 100)).toFixed(1) : 100;

        const area = document.getElementById('slayer-detail-area');
        if (!area) return;

        const tierInfo = [
            { tier: 1, label: 'TIER I', hp: 100, cost: 500, mobs: 5, xp: 5, flesh: '1' },
            { tier: 2, label: 'TIER II', hp: 500, cost: 2500, mobs: 10, xp: 25, flesh: '2' },
            { tier: 3, label: 'TIER III', hp: 1500, cost: 10000, mobs: 15, xp: 100, flesh: '2-4' },
            { tier: 4, label: 'TIER IV', hp: 5000, cost: 500000, mobs: 20, xp: 500, flesh: '4-5' },
            { tier: 5, label: 'TIER V', hp: 10000, cost: 2000000, mobs: 25, xp: 2000, flesh: '6-10' }
        ];

        let tiersHtml = '';
        tierInfo.forEach(t => {
            tiersHtml += `<button class="cooldown-btn" style="height:50px; font-size:0.9rem; margin-bottom:6px;" onclick="game.startSlayer('zombie', ${t.tier})">
                ${t.label} <span style="font-size:0.75rem; opacity:0.7;">(${t.hp} HP | ${t.mobs} мобов | ${t.cost.toLocaleString()}💰 | +${t.xp} XP | ${t.flesh} плоти)</span>
            </button>`;
        });

        area.innerHTML = `
            <div class="card" style="border-left: 5px solid var(--red); display:flex; flex-direction:column; gap:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="color:var(--red); margin:0;">🧟 Зомби Слейер</h3>
                    <span class="sb-lvl-badge">УРОВЕНЬ ${zomb.lvl}</span>
                </div>
                <div style="margin:4px 0;">
                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
                        <span style="color:var(--gray);">Прогресс XP</span>
                        <span style="color:var(--white);">${zomb.xp.toLocaleString()} / ${nextReq > 0 ? nextReq.toLocaleString() : 'MAX'}</span>
                    </div>
                    <div class="hp-bar" style="height:12px;"><div class="hp-fill" style="width:${xpPct}%;background:var(--accent);"></div></div>
                </div>
                
                <div style="background: rgba(0,0,0,0.3); padding:12px; border-radius:8px; border:1px solid var(--dark-gray);">
                    <h4 style="margin:0 0 8px 0; font-size:0.9rem; color:var(--accent);">Доступные тиры:</h4>
                    ${tiersHtml}
                </div>
                
                <div style="font-size:0.75rem; color:var(--gray); padding:8px; background:rgba(0,0,0,0.2); border-radius:6px;">
                    <b style="color:var(--accent);">Награды:</b><br>
                    ● Плоть зомби (1-5 шт. в зависимости от тира)<br>
                    ● Zombie Ring (до 0.2% на Tier V)<br>
                    ● Питомец Гуль (до 0.02% на Tier V)<br>
                    ● Gem Stone (0.01%, Tier V)<br>
                    ● Artefact Slayer Zombie (0.001%, Tier V)<br>
                    ● Combat XP (тир × 25)
                </div>
            </div>
        `;
    },

    startSlayer(type, tier) {
        if (this.slayerActive) {
            this.msg('Слейер квест уже запущен!');
            return;
        }
        const boss = slayerConfig[type].bosses[tier-1];
        const cost = boss.cost || 0;
        if (cost > 0 && this.state.coins < cost) {
            this.msg(`Недостаточно монет! Нужно ${cost.toLocaleString()} 💰`);
            return;
        }
        if (cost > 0) this.state.coins -= cost;
        this.slayerActive = { type, tier, kills: 0, reqKills: boss.reqKills };
        this.msg(`Запущен квест: ${slayerConfig[type].name} Tier ${tier}` + (cost > 0 ? ` (-${cost.toLocaleString()} 💰)` : ''));
        this.spawnSlayerMob();
        this.switchTab('slayer-battle-screen');
    },

    spawnSlayerMob() {
        if (!this.slayerActive) return;
        
        const type = this.slayerActive.type;
        const config = slayerConfig[type];
        const tier = this.slayerActive.tier;
        
        if (this.slayerActive.kills >= this.slayerActive.reqKills) {
            const boss = config.bosses[tier - 1];
            this.slayerCurrentMob = { name: config.name + ` БОСС T${tier}`, hp: boss.hp, dmg: boss.dmg, def: boss.def, isBoss: true, exp: 0 };
        } else {
            const tierMobs = config.tierMobs?.[tier] || config.mobs;
            const roll = Math.random() * 100;
            let cumulative = 0;
            let selectedMob = tierMobs[0];
            for (const mob of tierMobs) {
                cumulative += mob.chance;
                if (roll <= cumulative) {
                    selectedMob = mob;
                    break;
                }
            }
            this.slayerCurrentMob = { ...selectedMob, isBoss: false };
        }
        
        this.slayerMobHp = this.slayerCurrentMob.hp;
        this.slayerMobMaxHp = this.slayerCurrentMob.hp;
        this.slayerMobDef = this.slayerCurrentMob.def;
        this.slayerMobDmg = this.slayerCurrentMob.dmg;
        
        const s = this.calcStats(false);
        this.slayerPlayerHp = s.hp;
        this.slayerPlayerMaxHp = s.hp;
        
        this.updateSlayerUI();
    },

    updateSlayerUI() {
        document.getElementById('slayer-mob-name').innerText = this.slayerCurrentMob.name;
        document.getElementById('slayer-kills-txt').innerText = `Прогресс: ${this.slayerActive.kills}/${this.slayerActive.reqKills}`;
        
        document.getElementById('slayer-m-hp-txt').innerText = `${Math.max(0, Math.floor(this.slayerMobHp))}/${this.slayerMobMaxHp}`;
        document.getElementById('slayer-m-hp-fill').style.width = `${Math.max(0, this.slayerMobHp / this.slayerMobMaxHp * 100)}%`;
        
        document.getElementById('slayer-p-hp-txt').innerText = `${Math.max(0, Math.floor(this.slayerPlayerHp))}/${this.slayerPlayerMaxHp}`;
        document.getElementById('slayer-p-hp-fill').style.width = `${Math.max(0, this.slayerPlayerHp / this.slayerPlayerMaxHp * 100)}%`;

        const slayerData = this.state.slayer?.[this.slayerActive.type] || { lvl: 1, xp: 0 };
        const config = slayerConfig[this.slayerActive.type];
        let nextReq = 0;
        if (config && slayerData.lvl < 10) {
            nextReq = config.levels[slayerData.lvl]?.req || 0;
        }
        const xpBarEl = document.getElementById('slayer-xp-bar');
        if (xpBarEl) {
            const pct = nextReq > 0 ? Math.min(100, (slayerData.xp / nextReq * 100)) : 100;
            xpBarEl.innerHTML = `
                <div style="margin-top:10px; padding:8px; background:rgba(0,0,0,0.3); border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                        <span style="color:var(--accent);">🧟 Zombie Slayer LVL ${slayerData.lvl}</span>
                        <span style="color:var(--gray);">${slayerData.xp} / ${nextReq > 0 ? nextReq : 'MAX'} XP</span>
                    </div>
                    <div class="hp-bar" style="height:10px;"><div class="hp-fill" style="width:${pct}%;background:var(--accent);"></div></div>
                </div>
            `;
        }
    },

    slayerAttack() {
        if (!this.slayerActive || !this.slayerCurrentMob) return;
        
        const s = this.calcStats(false);
        const weapon = this.state.inventory.find(i=>i.equipped && i.type==='weapon');
        let damage = weapon?.magic ? s.int * (s.mag_amp || 1) * 10 : s.str;
        
        if (weapon?.magic && this.slayerCurrentMob.isBoss && this.slayerActive) {
            const boss = slayerConfig[this.slayerActive.type]?.bosses[this.slayerActive.tier - 1];
            if (boss?.magicRes) {
                damage *= (1 - boss.magicRes / 100);
            }
        }
        
        if (this.slayerActive.type === 'zombie') {
            let zombieBonus = 0;
            this.state.inventory.forEach(i => {
                if (i.equipped && i.zombie_bonus) zombieBonus += i.zombie_bonus;
            });
            if (zombieBonus > 0) damage *= (1 + zombieBonus / 100);
            
            const ring = this.state.inventory.find(i => i.equipped && (i.name === 'Zombie Ring' || i.name === 'Zombie Ring ★'));
            if (ring) damage *= 1.05;
        }

        if(Math.random()*100 < s.cc) {
            damage *= (1 + s.cd/100);
            if (typeof this.showCombatFeedback === 'function') this.showCombatFeedback('КРИТ!', 'crit');
        }

        this.slayerMobHp -= damage;
        const vamp = this.state.inventory
            .filter(i => i.equipped && i.vampirism)
            .reduce((s, i) => s + (i.vampirism || 0), 0);
        if (vamp > 0 && this.slayerPlayerHp > 0) {
            const heal = Math.max(1, Math.floor(damage * (vamp / 100)));
            this.slayerPlayerHp = Math.min(this.slayerPlayerMaxHp, this.slayerPlayerHp + heal);
        }
        
        if (this.slayerMobHp > 0) {
            if (this.slayerCurrentMob.isBoss && this.slayerActive) {
                const boss = slayerConfig[this.slayerActive.type]?.bosses[this.slayerActive.tier - 1];
                if (boss?.enrage) {
                    const hpPct = this.slayerMobHp / this.slayerMobMaxHp;
                    if (hpPct <= boss.enrage.hpThreshold) {
                        if (!this.slayerCurrentMob._enraged) {
                            this.slayerCurrentMob._enraged = true;
                            this.slayerMobDmg = boss.enrage.dmg;
                            this.slayerMobDef = boss.enrage.def;
                            this.msg('🔥 БОСС В ЯРОСТИ! Урон и броня усилены!');
                        }
                    }
                }
            }
            const slayerArtifact = this.state.inventory.find(i => i.equipped && i.name === 'Artefact Slayer Zombie');
            const bonusDef = (slayerArtifact && this.slayerActive?.type === 'zombie') ? Math.floor((s.def || 0) * 0.2) : 0;
            let actualDmg = Math.max(1, this.slayerMobDmg - (s.def + bonusDef));
            this.slayerPlayerHp -= actualDmg;
            if (this.slayerCurrentMob.isBoss && this.slayerCurrentMob.phase2 && this.slayerCurrentMob.lifeSteal) {
                this.slayerMobHp = Math.min(this.slayerMobMaxHp, this.slayerMobHp + this.slayerCurrentMob.lifeSteal);
                if (typeof this.showCombatFeedback === 'function') this.showCombatFeedback(`+${this.slayerCurrentMob.lifeSteal} HP`, 'buff');
            }

            if (s.vitality > 0 && this.slayerPlayerHp > 0) {
                const healAmt = Math.floor(this.slayerPlayerMaxHp * s.vitality / 100);
                if (healAmt > 0) {
                    this.slayerPlayerHp = Math.min(this.slayerPlayerMaxHp, this.slayerPlayerHp + healAmt);
                    const hpTxt = document.getElementById('slayer-p-hp-txt');
                    if (hpTxt) hpTxt.innerText = `${Math.floor(this.slayerPlayerHp)}/${this.slayerPlayerMaxHp} (+${healAmt})`;
                }
            }
            
            if (this.slayerPlayerHp <= 0) {
                this.msg('ТЫ УМЕР! Квест провален.');
                this.slayerActive = null;
                this.switchTab('portal');
                return;
            }
        } else {
            if (this.slayerCurrentMob.isBoss) {
                if (this.slayerActive.tier === 5 && !this.slayerCurrentMob.phase2) {
                    this.slayerCurrentMob = {
                        name: 'Воскресший Revenant Hollow',
                        hp: 6000,
                        dmg: 280,
                        def: 170,
                        isBoss: true,
                        exp: 0,
                        phase2: true,
                        lifeSteal: 25
                    };
                    this.slayerMobHp = this.slayerCurrentMob.hp;
                    this.slayerMobMaxHp = this.slayerCurrentMob.hp;
                    this.slayerMobDef = this.slayerCurrentMob.def;
                    this.slayerMobDmg = this.slayerCurrentMob.dmg;
                    this.msg('☠️ БОСС ВОСКРЕС! Вторая фаза началась.');
                    this.updateSlayerUI();
                    return;
                }
                this.finishSlayerBoss();
                return;
            } else {
                this.slayerActive.kills += this.slayerCurrentMob.exp;
                if (this.slayerActive.kills > this.slayerActive.reqKills) this.slayerActive.kills = this.slayerActive.reqKills;
                this.msg('МОБ УБИТ!');
                this.spawnSlayerMob();
                return;
            }
        }
        this.updateSlayerUI();
    },

    finishSlayerBoss() {
        this.msg('БОСС УБИТ!');
        
        if (!this.state.slayer) {
            this.state.slayer = { zombie: { lvl: 1, xp: 0 } };
        }
        const slayerData = this.state.slayer[this.slayerActive.type];
        const config = slayerConfig[this.slayerActive.type];
        const boss = config.bosses[this.slayerActive.tier - 1];
        const xpGain = boss.xp || 5;
        slayerData.xp += xpGain;
        
        if (slayerData.lvl < 10) {
            const nextLvlReq = config.levels[slayerData.lvl].req;
            if (slayerData.xp >= nextLvlReq) {
                slayerData.lvl++;
                const lvlConfig = config.levels[slayerData.lvl - 1];
                this.addXp('skyblock', lvlConfig.sb); 
                this.msg(`УРОВЕНЬ SLAYER ПОВЫШЕН! Теперь ${slayerData.lvl}`);
            }
        }

        const combatXp = this.slayerActive.tier * 25;
        this.addXp('combat', combatXp);
        
        let dropMsg = '';
        const luckMult = this.slayerActive.tier >= 5 ? 2 : 1;
        if (Math.random() * 100 < (0.1 * luckMult)) {
            this.state.inventory.push({ id: this.state.nextItemId++, name: 'Zombie Ring', type: 'accessory', equipped: false, cost: 50000 });
            dropMsg += ' ВЫПАЛ ZOMBIE RING!';
        }
        if (this.slayerActive.tier >= 4 && Math.random() * 10000 < (1 * luckMult)) {
            const ghoul = {
                name: 'Гуль',
                type: 'pet',
                skill: 'combat',
                rarity: 'common',
                lvl: 1,
                xp: 0,
                next: 100,
                cost: 50000
            };
            this.state.pets.push({ ...ghoul, equipped: false });
            dropMsg += ' 🎉 ВЫПАЛ ПИТОМЕЦ ГУЛЬ!';
        }
        if (this.slayerActive.tier >= 5 && Math.random() * 10000 < 1) {
            this.state.emeralds = (this.state.emeralds || 0) + 1;
            dropMsg += ' 💎 ВЫПАЛ Gem Stone!';
        }
        if (this.slayerActive.tier >= 5 && Math.random() * 100000 < 1) {
            this.state.inventory.push({
                id: this.state.nextItemId++,
                name: 'Artefact Slayer Zombie',
                type: 'accessory',
                rarity: 'legendary',
                def: 0,
                slayer_zombie_def_bonus: 20,
                vampirism: 5,
                cost: 100000000,
                equipped: false
            });
            dropMsg += ' 🌟 ВЫПАЛ Artefact Slayer Zombie!';
        }
        let fleshDrop = boss.fleshDrop || 1;
        if (boss.fleshDropMin && boss.fleshDropMax) {
            fleshDrop = boss.fleshDropMin + Math.floor(Math.random() * (boss.fleshDropMax - boss.fleshDropMin + 1));
        }
        this.addMaterial('Плоть зомби', 'material', fleshDrop);
        dropMsg += ` Получено ${fleshDrop} Плоти зомби.`;
        
        this.msg(`Награда: +${xpGain} опыта Slayer, +${combatXp} опыта Combat.` + dropMsg);
        
        this.slayerActive = null;
        this.updateUI();
        this.showSlayerResult();
    },

    showSlayerResult() {
        const content = document.getElementById('slayer-menu');
        if (!content) { this.switchTab('portal'); return; }
        const zomb = this.state.slayer?.zombie || { lvl: 1, xp: 0 };
        content.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:15px; align-items:center; padding-top:30px;">
                <h2 style="color:var(--green);">✅ БОСС УБИТ!</h2>
                <p style="color:var(--gray);">Zombie Slayer LVL ${zomb.lvl} | XP: ${zomb.xp}</p>
                <button class="cooldown-btn" style="height:60px; font-size:1rem; width:80%;" onclick="game.openSlayerMenu()">ПРИЗВАТЬ ВНОВЬ</button>
                <button class="top-btn" style="padding:12px 24px;" onclick="game.switchTab('portal')">← В ПОРТАЛ</button>
            </div>
        `;
        this.switchTab('slayer-menu');
    },

    cancelSlayer() {
        this.slayerActive = null;
        this.slayerCurrentMob = null;
        this.msg('Квест отменён.');
        this.switchTab('portal');
    }
});
