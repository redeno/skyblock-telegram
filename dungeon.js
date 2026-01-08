// dungeon.js — финальная версия с правильной удачей (mf / 100)

const dungeonConfig = {
    1: {
        mobs: ['ЗОМБИ', 'СКЕЛЕТ', 'ПАУК', 'МЕРТВЕЦ'],
        baseHp: 50,
        baseDmg: 25,
        baseDef: 5,
        bossMultiplier: 2
    },
    2: {
        mobs: ['ПАУК', 'ПЕЩЕРНЫЙ ПАУК', 'ПАУК-СКОРПИОН', 'БРУДА'],
        baseHp: 250,
        baseDmg: 50,
        baseDef: 15,
        bossMultiplier: 2
    },
    3: {
        mobs: ['ЭНДЕРМИТ', 'ЭНДЕРМЕН', 'ШАЛКЕР', 'ЗАЩИТНИК КРАЯ'],
        baseHp: 500,
        baseDmg: 100,
        baseDef: 10,
        bossStats: {hp: 750, dmg: 125, def: 50}
    },
    4: {
        mobs: ['РЫЦАРЬ', 'ПАЛАДИН', 'ПРОРОК', 'КОРОЛЬ'],
        baseHp: 450,
        baseDmg: 100,
        baseDef: 30,
        bossStats: {hp: 1000, dmg: 150, def: 50},
        bossSpecial: 'kingDefDrop'
    },
    5: {
        mobs: ['ОХОТНИК', 'ИСКАТЕЛЬ', 'МАГ', 'АССАСИН'],
        baseHp: 500,
        baseDmg: 175,
        baseDef: 0,
        baseCc: 5,
        baseCd: 25,
        bossStats: {hp: 750, dmg: 200, cc: 25, cd: 75}
    },
    6: {
        mobs: ['ОРК', 'ГОБЛИН', 'ТРОЛЬ', 'ГИГАНТ'],
        baseHp: 1000,
        baseDmg: 100,
        baseDef: 10,
        bossStats: {hp: 2000, dmg: 125, def: 20}
    },
    7: {
        mobs: ['БЛЕЙЗ', 'ГАСТ', 'СКЕЛЕТ ИССУШИТЕЛЬ', 'ИССУШИТЕЛЬ'],
        baseHp: 750,
        baseDmg: 50,
        baseDef: 0,
        fireStacks: true,
        bossStats: {hp: 3000, dmgBase: 75, dmgInc: 15},
        bossSpecial: 'witherPhase'
    }
};

const dungeonRewards = {
    1: {coins_min:50, coins_max:250, drops:[]},
    2: {coins_min:300, coins_max:500, drops:[{chance:1, items:[
        {name:'Талисман силы +1',type:'accessory',str:1},
        {name:'Талисман крита +1',type:'accessory',cd:1},
        {name:'Талисман удачи +1',type:'accessory',mf:1}
    ]}]},
    3: {coins_min:1000, coins_max:2500, drops:[{chance:1, item:{name:'Талисман защиты +20',type:'accessory',def:20}}]},
    4: {coins_min:5000, coins_max:25000, drops:[
        {chance:5, item:{name:'Меч Мидаса',type:'weapon',dynamic_str:'midas'}}
    ]},
    5: {coins_min:10000, coins_max:40000, drops:[]},
    6: {coins_min:100000, coins_max:500000, drops:[
        {chance:3, item:{name:'Меч Гиганта',type:'weapon',str:100,cd:50}}
    ]},
    7: {coins_min:200000, coins_max:1000000, drops:[
        {chance:0.5, item:{name:'Гиперион',type:'weapon',magic:true}}
    ]}
};

Object.assign(game, {
    dungeon: {floor:1, mobIdx:0, mobHp:50, pHp:100, pMaxHp:100, mobs:['ЗОМБИ','СКЕЛЕТ','ПАУК','БОСС']},
    mobDef: 0,
    fireStacks: 0,
    witherAttackCount: 0,

    dungeonAttack() {
        const inDungeon = true;
        const s = this.calcStats(inDungeon);
        const weapon = this.state.inventory.find(i => i.equipped && i.type === 'weapon');
        let damage = weapon?.magic ? s.int * s.mag_amp * 100 : s.str;

        let msgText = '';
        if (this.state.class === 'berserk' && Math.random() < 0.2) {
            damage *= 2;
            msgText += 'ДВОЙНОЙ УДАР! ';
        }
        if (this.state.class === 'archer') {
            if (this.dungeon.mobIdx < 3 && Math.random() < 0.2) {
                damage = 999999;
                msgText += 'ВАНШОТ! ';
            } else if (this.dungeon.mobIdx === 3 && Math.random() < 0.03) {
                damage = this.dungeon.mobHp * 0.4;
                msgText += 'Мощный выстрел по боссу! ';
            }
        }
        if (Math.random() * 100 < s.cc) {
            damage *= (1 + s.cd / 100);
            msgText += 'КРИТИЧЕСКИЙ УДАР! ';
        }

        this.dungeon.mobHp -= damage;

        if (this.dungeon.floor === 4 && this.dungeon.mobIdx === 3) {
            this.mobDef = Math.max(0, this.mobDef - 10);
        }

        if (msgText) this.msg(msgText.trim());

        const config = dungeonConfig[this.dungeon.floor];
        const isBoss = this.dungeon.mobIdx === 3;
        let mobDmg = isBoss && config.bossStats ? config.bossStats.dmg || config.baseDmg * (config.bossMultiplier || 1) : config.baseDmg;

        if (this.dungeon.floor === 5) {
            const mobCc = isBoss ? config.bossStats.cc : config.baseCc;
            const mobCd = isBoss ? config.bossStats.cd : config.baseCd;
            if (Math.random() * 100 < mobCc) {
                mobDmg *= (1 + mobCd / 100);
                this.msg('КРИТ ОТ ВРАГА!');
            }
        }

        if (this.dungeon.floor === 7 && config.fireStacks) {
            this.fireStacks = Math.min(3, this.fireStacks + 1);
            mobDmg += 5 * this.fireStacks;
            this.msg(`ОГОНЬ! +${5 * this.fireStacks} дамага`);
        }

        if (this.dungeon.floor === 7 && isBoss) {
            this.witherAttackCount++;
            if (this.witherAttackCount % 2 === 0) mobDmg += config.bossStats.dmgInc;
            if (this.dungeon.mobHp / this.dungeon.mobMaxHp < 0.5) {
                this.mobDef = 75;
            }
        }

        let actualDmg = Math.max(1, mobDmg - s.def - this.mobDef);
        this.dungeon.pHp -= actualDmg;

        if (this.dungeon.mobHp <= 0) {
            this.addXp('combat', isBoss ? 50 : 20);
            this.dungeon.mobIdx++;
            if (this.dungeon.mobIdx >= 4) {
                this.giveDungeonReward();
                this.switchTab('loot-screen');
            } else {
                this.initMobStats();
                if (this.state.class === 'healer') {
                    this.dungeon.pHp = Math.min(this.dungeon.pMaxHp, this.dungeon.pHp + this.dungeon.pMaxHp * 0.2);
                    this.msg('МОБ УБИТ! +20% ХП (Хиллер)');
                } else {
                    this.msg('МОБ УБИТ!');
                }
                this.updateBattleUI();
            }
        } else if (this.dungeon.pHp <= 0) {
            this.msg(`ТЫ УМЕР на этаже ${this.dungeon.floor}!`);
            this.switchTab('portal');
            this.resetDungeonEffects();
        } else {
            this.updateBattleUI();
        }
    },

    initMobStats() {
        const config = dungeonConfig[this.dungeon.floor];
        const isBoss = this.dungeon.mobIdx === 3;
        const baseHp = isBoss && config.bossStats ? config.bossStats.hp || config.baseHp * (config.bossMultiplier || 1) : config.baseHp;
        this.dungeon.mobHp = baseHp;
        this.dungeon.mobMaxHp = baseHp;
        this.mobDef = isBoss && config.bossStats ? config.bossStats.def || config.baseDef * (config.bossMultiplier || 1) : config.baseDef;
        this.fireStacks = 0;
        this.witherAttackCount = 0;
    },

    updateBattleUI() {
        document.getElementById('mob-name').innerText = this.dungeon.mobs[this.dungeon.mobIdx];
        document.getElementById('m-hp-txt').innerText = `${Math.max(0, Math.floor(this.dungeon.mobHp))}/${this.dungeon.mobMaxHp}`;
        document.getElementById('m-hp-fill').style.width = `${Math.max(0, this.dungeon.mobHp / this.dungeon.mobMaxHp * 100)}%`;
        document.getElementById('p-hp-txt').innerText = `${Math.max(0, Math.floor(this.dungeon.pHp))}/${Math.floor(this.dungeon.pMaxHp)}`;
        document.getElementById('p-hp-fill').style.width = `${this.dungeon.pHp / this.dungeon.pMaxHp * 100}%`;
    },

    giveDungeonReward() {
        const s = this.calcStats(true);
        const r = dungeonRewards[this.dungeon.floor];
        let coins = Math.floor(Math.random() * (r.coins_max - r.coins_min + 1) + r.coins_min);
        coins = Math.floor(coins * (1 + s.gold_bonus / 100));
        this.state.coins += coins;
        this.addXp('dungeons', this.dungeon.floor * 100);

        // Правильная удача: +1% за каждые 100 mf
        r.drops?.forEach(drop => {
            let effectiveChance = drop.chance + (s.mf / 100);
            if (Math.random() * 100 < effectiveChance) {
                const item = drop.item || drop.items[Math.floor(Math.random() * drop.items.length)];
                this.state.inventory.push({...item, id: this.state.nextItemId++, equipped: false});
                this.msg(`Выпал ${item.name}!`);
            }
        });

        // Апгрейд питомца тоже от удачи
        let upgradeChance = this.dungeon.floor >= 5 ? 5 + (s.mf / 100) : 1 + (s.mf / 100);
        if (Math.random() * 100 < upgradeChance) {
            this.addMaterial('Апгрейд питомца', 'material');
            this.msg('Выпал Апгрейд питомца!');
        }

        this.addMaterial(`Сундук этажа ${this.dungeon.floor}`, 'chest');
        if (this.dungeon.floor >= 5) {
            document.getElementById('extra-chests').style.display = 'block';
        } else {
            document.getElementById('extra-chests').style.display = 'none';
        }
        this.updateUI();
        this.resetDungeonEffects();
    },

    startDungeon(floor) {
        const req = (floor - 1) * 5 + 1;
        if (this.state.skills.dungeons.lvl < req) {
            this.msg(`Требуется уровень ДАНЖЕЙ ${req}`);
            return;
        }
        const s = this.calcStats(true);
        const config = dungeonConfig[floor];
        this.dungeon = {
            floor,
            mobIdx: 0,
            mobs: config.mobs
        };
        this.initMobStats();
        this.dungeon.pHp = s.hp;
        this.dungeon.pMaxHp = s.hp;
        this.updateBattleUI();
        this.switchTab('battle-screen');
    },

    repeatDungeon() {
        if (!this.dungeon || !this.dungeon.floor) {
            this.msg('Нет активного данжа для повторения');
            return;
        }
        this.startDungeon(this.dungeon.floor);
    },

    resetDungeonEffects() {
        this.mobDef = 0;
        this.fireStacks = 0;
        this.witherAttackCount = 0;
    }
});
