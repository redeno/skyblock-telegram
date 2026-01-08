// dungeon.js — логика данжей (бой, награды, UI)

// dungeonRewards вынесен сюда, чтобы не дублировался с game.js
const dungeonRewards = {
    1: {coins_min:50, coins_max:250, drops:[]},
    2: {coins_min:300, coins_max:500, drops:[{chance:1, items:[
        {name:'Талисман силы +1',type:'accessory',str:1},
        {name:'Талисман крита +1',type:'accessory',cd:1},
        {name:'Талисман удачи +1',type:'accessory',mf:1}
    ]}]},
    3: {coins_min:1000, coins_max:2500, drops:[{chance:1, item:{name:'Талисман защиты +20',type:'accessory',def:20}}]},
    4: {coins_min:5000, coins_max:25000, drops:[
        {chance:1, item:{name:'Меч Мидаса',type:'weapon',dynamic_str:'midas'}},
        {chance:1, item:{name:'Талисман золота +5%',type:'accessory',gold_bonus:5}}
    ]},
    5: {coins_min:10000, coins_max:40000, drops:[
        {chance:3, item:{name:'Меч Гиганта',type:'weapon',str:100,cd:50}},
        {chance:5, item:{name:'Меч Мидаса',type:'weapon',dynamic_str:'midas'}}
    ]},
    6: {coins_min:100000, coins_max:500000, drops:[{chance:0.5, item:{name:'Гиперион',type:'weapon',magic:true}}]}
};

// Добавляем всё в объект game
Object.assign(game, {
    // Инициализируем dungeon (если ещё не было)
    dungeon: game.dungeon || {floor:1, mobIdx:0, mobHp:50, pHp:100, pMaxHp:100, mobs:['ЗОМБИ','СКЕЛЕТ','ПАУК','БОСС']},

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
        const baseMobDmg = (this.dungeon.mobIdx === 3 ? 6 : 4) * this.dungeon.floor;
        const actualDmg = Math.max(1, baseMobDmg - s.def);
        this.dungeon.pHp -= actualDmg;
        if (msgText) this.msg(msgText.trim());
        if (this.dungeon.mobHp <= 0) {
            this.addXp('combat', this.dungeon.mobIdx === 3 ? 50 : 20);
            this.dungeon.mobIdx++;
            if (this.dungeon.mobIdx >= 4) {
                this.giveDungeonReward();
                this.switchTab('loot-screen');
            } else {
                this.dungeon.mobHp = (this.dungeon.mobIdx === 3 ? 80 : 50) * this.dungeon.floor;
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
        } else {
            this.updateBattleUI();
        }
    },

    updateBattleUI() {
        document.getElementById('mob-name').innerText = this.dungeon.mobs[this.dungeon.mobIdx];
        const maxMobHp = (this.dungeon.mobIdx === 3 ? 80 : 50) * this.dungeon.floor;
        document.getElementById('m-hp-txt').innerText = `${Math.max(0, Math.floor(this.dungeon.mobHp))}/${maxMobHp}`;
        document.getElementById('m-hp-fill').style.width = `${Math.max(0, this.dungeon.mobHp / maxMobHp * 100)}%`;
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
        r.drops?.forEach(drop => {
            if (Math.random() * 100 < (drop.chance + s.mf)) {
                const item = drop.item || drop.items[Math.floor(Math.random() * drop.items.length)];
                this.state.inventory.push({...item, id: this.state.nextItemId++, equipped: false});
                this.msg(`Выпал ${item.name}!`);
            }
        });
        let upgradeChance = this.dungeon.floor >= 5 ? 5 : 1;
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
    },

    startDungeon(floor) {
        const req = (floor - 1) * 5 + 1;
        if (this.state.skills.dungeons.lvl < req) {
            this.msg(`Требуется уровень ДАНЖЕЙ ${req}`);
            return;
        }
        const s = this.calcStats(true);
        this.dungeon = {
            floor,
            mobIdx: 0,
            mobHp: 50 * floor,
            pHp: s.hp,
            pMaxHp: s.hp,
            mobs: ['ЗОМБИ','СКЕЛЕТ','ПАУК','БОСС']
        };
        this.updateBattleUI();
        this.switchTab('battle-screen');
    },

    repeatDungeon() {
        if (!this.dungeon || !this.dungeon.floor) {
            this.msg('Нет активного данжа для повторения');
            return;
        }
        this.startDungeon(this.dungeon.floor);
    }
});
