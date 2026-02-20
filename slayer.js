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
                reqKills: 10,
                cost: 0 
            }
        ],
        mobs: [
            { name: 'Обычный Зомби', hp: 50, dmg: 5, def: 15, exp: 1, chance: 90 },
            { name: 'Крепкий Зомби', hp: 75, dmg: 5, def: 30, exp: 2, chance: 10 }
        ]
    }
};

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
        let html = `
            <div style="display:flex; flex-direction:column; gap:15px;">
                <button class="top-btn" style="align-self:flex-start; padding: 10px 20px; font-size: 0.9rem;" onclick="game.switchTab('portal')">← НАЗАД В ПОРТАЛ</button>
                <h2 style="text-align:center; color:var(--accent); margin: 10px 0;">👹 ОХОТА НА МОНСТРОВ</h2>
                
                <div class="card" style="border-left: 5px solid var(--red); display:flex; flex-direction:column; gap:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="color:var(--red); margin:0;">🧟 Зомби Слейер</h3>
                        <span class="sb-lvl-badge">УРОВЕНЬ ${zomb.lvl}</span>
                    </div>
                    <p style="color:var(--gray); font-size:0.9rem; margin:0;">Опыт: <span style="color:var(--white); font-weight:bold;">${zomb.xp.toLocaleString()}</span> XP</p>
                    
                    <div style="background: rgba(0,0,0,0.3); padding:12px; border-radius:8px; border:1px solid var(--dark-gray);">
                        <h4 style="margin:0 0 8px 0; font-size:0.9rem; color:var(--accent);">Доступные тиры:</h4>
                        <button class="cooldown-btn" style="height:50px; font-size:1rem;" onclick="game.startSlayer('zombie', 1)">
                            НАЧАТЬ TIER I <span style="font-size:0.8rem; opacity:0.7;">(100 HP)</span>
                        </button>
                    </div>
                </div>
                
                <div class="card" style="opacity:0.5; border-style:dashed;">
                    <h3 style="margin:0; color:var(--gray);">🔒 СКОРО: Паучий Слейер</h3>
                    <p style="font-size:0.8rem; margin:5px 0 0 0;">Требуется Combat 15</p>
                </div>
            </div>
        `;
        content.innerHTML = html;
        this.switchTab('slayer-menu');
    },

    startSlayer(type, tier) {
        if (this.slayerActive) {
            this.msg('Слейер квест уже запущен!');
            return;
        }
        const boss = slayerConfig[type].bosses[tier-1];
        this.slayerActive = { type, tier, kills: 0, reqKills: boss.reqKills };
        this.msg(`Запущен квест: ${slayerConfig[type].name} Tier ${tier}`);
        this.spawnSlayerMob();
        this.switchTab('slayer-battle-screen');
    },

    spawnSlayerMob() {
        if (!this.slayerActive) return;
        
        const type = this.slayerActive.type;
        const config = slayerConfig[type];
        
        if (this.slayerActive.kills >= this.slayerActive.reqKills) {
            const boss = config.bosses[this.slayerActive.tier - 1];
            this.slayerCurrentMob = { name: config.name + ' БОСС', hp: boss.hp, dmg: boss.dmg, def: boss.def, isBoss: true, exp: 0 };
        } else {
            const roll = Math.random() * 100;
            let cumulative = 0;
            let selectedMob = config.mobs[0];
            for (const mob of config.mobs) {
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
    },

    slayerAttack() {
        if (!this.slayerActive || !this.slayerCurrentMob) return;
        
        const s = this.calcStats(false);
        const weapon = this.state.inventory.find(i=>i.equipped && i.type==='weapon');
        let damage = weapon?.magic ? s.int * (s.mag_amp || 1) * 10 : s.str; 
        
        const ring = this.state.inventory.find(i => i.equipped && i.name === 'Zombie Ring');
        if (ring && this.slayerActive.type === 'zombie') {
            damage *= 1.05;
        }

        if(Math.random()*100 < s.cc) {
            damage *= (1 + s.cd/100); 
            this.msg('КРИТ!');
        }

        this.slayerMobHp -= damage;
        
        if (this.slayerMobHp > 0) {
            let actualDmg = Math.max(1, this.slayerMobDmg - s.def);
            this.slayerPlayerHp -= actualDmg;
            
            if (this.slayerPlayerHp <= 0) {
                this.msg('ТЫ УМЕР! Квест провален.');
                this.slayerActive = null;
                this.switchTab('portal');
                return;
            }
        } else {
            if (this.slayerCurrentMob.isBoss) {
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
        slayerData.xp += 5;
        
        const config = slayerConfig[this.slayerActive.type];
        if (slayerData.lvl < 10) {
            const nextLvlReq = config.levels[slayerData.lvl].req;
            if (slayerData.xp >= nextLvlReq) {
                slayerData.lvl++;
                const lvlConfig = config.levels[slayerData.lvl - 1];
                this.addXp('skyblock', lvlConfig.sb); 
                this.msg(`УРОВЕНЬ SLAYER ПОВЫШЕН! Теперь ${slayerData.lvl}`);
            }
        }

        const combatXp = slayerData.lvl * 25;
        this.addXp('combat', combatXp);
        
        let dropMsg = '';
        if (Math.random() * 100 < 0.1) {
            this.state.inventory.push({ id: this.state.nextItemId++, name: 'Zombie Ring', type: 'accessory', equipped: false, cost: 50000 });
            dropMsg += ' ВЫПАЛ ZOMBIE RING!';
        }
        this.addMaterial('Плоть зомби', 'material', 1);
        dropMsg += ' Получена Плоть зомби.';
        
        this.msg(`Награда: +5 опыта Slayer, +${combatXp} опыта Combat.` + dropMsg);
        
        this.slayerActive = null;
        this.switchTab('portal');
    }
});
