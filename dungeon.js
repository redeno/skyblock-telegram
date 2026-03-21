// dungeon.js — обновлённый XP по формуле (этаж * множитель)
const dungeonConfig = {
    1: { mobs: ['ЗОМБИ','СКЕЛЕТ','ПАУК','МЕРТВЕЦ'], baseHp:80, baseDmg:35, baseDef:10, bossMultiplier:2.5 },
    2: { mobs: ['ПАУК','ПЕЩЕРНЫЙ ПАУК','ПАУК-СКОРПИОН','БРУДА'], baseHp:500, baseDmg:80, baseDef:25, bossMultiplier:2.5 },
    3: { mobs: ['ЭНДЕРМИТ','ЭНДЕРМЕН','ШАЛКЕР','ЗАЩИТНИК КРАЯ'], baseHp:1000, baseDmg:150, baseDef:20, bossStats:{hp:2000,dmg:200,def:80} },
    4: { mobs: ['РЫЦАРЬ','ПАЛАДИН','ПРОРОК','КОРОЛЬ'], baseHp:1200, baseDmg:180, baseDef:50, bossStats:{hp:3000,dmg:250,def:80}, bossSpecial:'kingDefDrop' },
    5: { mobs: ['ОХОТНИК','ИСКАТЕЛЬ','МАГ','АССАСИН'], baseHp:1500, baseDmg:250, baseDef:0, baseCc:10, baseCd:40, bossStats:{hp:3500,dmg:350,cc:30,cd:100} },
    6: { mobs: ['ОРК','ГОБЛИН','ТРОЛЬ','ГИГАНТ'], baseHp:3000, baseDmg:200, baseDef:30, bossStats:{hp:6000,dmg:300,def:50} },
    7: { mobs: ['БЛЕЙЗ','ГАСТ','СКЕЛЕТ ИССУШИТЕЛЬ','ИССУШИТЕЛЬ'], baseHp:2500, baseDmg:120, baseDef:0, fireStacks:true, bossStats:{hp:8000,dmgBase:150,dmgInc:25}, bossSpecial:'witherPhase' }
};

const MASTER_MODE_MULTIPLIERS = {
    hp: 3,
    dmg: 3,
    def: 2,
    magic_res: 1.5
};

const dungeonRewards = {
    1: {coins_min:50, coins_max:250, fragments: {chance: 29, min: 0, max: 1}, drops:[]},
    2: {coins_min:300, coins_max:500, fragments: {chance: 25, min: 0, max: 2}, drops:[{chance:1, items:[
        {name:'Талисман силы +1',type:'accessory',str:1,cost:100},
        {name:'Талисман крита +1',type:'accessory',cd:1,cost:100},
        {name:'Талисман удачи +1',type:'accessory',mf:1,cost:100}
    ]}]},
    3: {coins_min:1000, coins_max:2500, fragments: {chance: 21, min: 1, max: 3}, drops:[{chance:1,item:{name:'Талисман защиты +20',type:'accessory',def:20,cost:5000}}]},
    4: {coins_min:5000, coins_max:25000, fragments: {chance: 17, min: 2, max: 4}, drops:[{chance:1,item:{name:'Меч Мидаса',type:'weapon',dynamic_str:'midas',cost:50000000}}]},
    5: {coins_min:10000, coins_max:40000, fragments: {chance: 13, min: 3, max: 5}, drops:[]},
    6: {coins_min:100000, coins_max:500000, fragments: {chance: 9, min: 4, max: 6}, drops:[{chance:3,item:{name:'Меч Гиганта',type:'weapon',str:100,cd:50,cost:250000}}]},
    7: {coins_min:200000, coins_max:1000000, fragments: {chance: 5, min: 5, max: 7}, drops:[{chance:0.5,item:{name:'Гиперион',type:'weapon',magic:true,cost:500000}}]}
};

// Expose dungeon settings for the info book and other UI components
window.dungeonConfig = dungeonConfig;
window.dungeonRewards = dungeonRewards;

// Если инфо-справочник уже загружен, обновим данные (чтобы дропы стали видны сразу)
if (typeof initInfoData === 'function') initInfoData();

Object.assign(game, {
    dungeon: {floor:1, mobIdx:0, mobHp:50, pHp:100, pMaxHp:100, mobs:['ЗОМБИ','СКЕЛЕТ','ПАУК','БОСС']},
    dungeonMode: 'catacombs',
    mobDef: 0,
    fireStacks: 0,
    witherAttackCount: 0,
    tigerHitCount: 0,

    getBabyWitherXpBonus() {
        const pet = this.state.pets.find(p => p.equipped && p.name === 'Бейби Иссушитель');
        if (!pet) return { bonusMul:1, pet:null };
        return { bonusMul:1 + pet.lvl / 100, pet };
    },

    addPetXp(pet, xp) {
        pet.xp += xp;
        while(pet.xp >= pet.next){
            pet.lvl++;
            pet.xp -= pet.next;
            pet.next = Math.floor(pet.next*1.4);
            this.msg(`${pet.name} повысил уровень! Теперь ${pet.lvl}`);
        }
    },

    setDungeonMode(mode) {
        if (mode !== 'catacombs' && mode !== 'master') return;
        this.dungeonMode = mode;
        const titleEl = document.getElementById('dungeon-mode-title');
        const catBtn = document.getElementById('dungeon-mode-catacombs');
        const masterBtn = document.getElementById('dungeon-mode-master');
        if (titleEl) {
            titleEl.textContent = mode === 'master' ? '🔥 МАСТЕР МОД' : '💀 КАТАКОМБЫ';
        }
        if (catBtn && masterBtn) {
            if (mode === 'master') {
                catBtn.classList.remove('active');
                masterBtn.classList.add('active');
            } else {
                masterBtn.classList.remove('active');
                catBtn.classList.add('active');
            }
        }
    },

    dungeonAttack() {
        const inDungeon = true;
        const s = this.calcStats(inDungeon);
        const bow = this.state.inventory.find(i => i.equipped && i.type === 'weapon' && i.ranged);
        const arrowPack = typeof this.getActiveArrowStack === 'function' ? this.getActiveArrowStack() : null;
        const useBow = Boolean(bow && arrowPack);
        let msgText = '';

        const meleeWeapon = this.state.inventory.find(i => i.equipped && i.type === 'weapon' && !i.ranged);
        const weapon = useBow ? bow : meleeWeapon;
        const isArcher = this.state.class === 'archer';

        let damage;
        if (useBow) {
            const meta = arrowPack.meta || {};
            if (isArcher) {
                damage = (s.bow_weapon_base || 0) + (s.bow_str || 0);
            } else {
                damage = (s.str || 0) + (s.bow_weapon_base || 0) + (s.bow_str || 0);
            }
            if (meta.dmgBonus) damage *= 1 + meta.dmgBonus;
            if (meta.defShred) damage *= 1 + meta.defShred / 100;

            if (s.bow_fire) {
                this.fireStacks = (this.fireStacks || 0) + s.bow_fire;
                damage += this.fireStacks;
            }

            if (s.bow_cc && Math.random() * 100 < s.bow_cc) {
                damage *= 2;
                msgText += 'МЕТКИЙ ГЛАЗ! ';
            }

            const saveChance = s.arrow_save || 0;
            if (Math.random() * 100 >= saveChance) {
                const arrow = arrowPack.stack;
                if (arrow) {
                    arrow.count -= 1;
                    if (arrow.count <= 0) {
                        this.state.inventory = this.state.inventory.filter(i => i.id !== arrow.id);
                    }
                    game.updateUI();
                }
            } else {
                msgText += 'Стрела не потрачена! ';
            }
        } else {
            if (!meleeWeapon) {
                this.msg('Наденьте меч или возьмите стрелы для лука.');
                return;
            }
            damage = weapon?.magic ? s.int * s.mag_amp * 100 : (s.str || 0);
            if (isArcher) damage *= 0.8;
        }

        damage *= 1 + (s.dungeon_damage || 0) / 100;
        if (this.state.class === 'berserk' && Math.random() < 0.2) { damage *= 2; msgText += 'ДВОЙНОЙ УДАР! '; }
        if (isArcher && useBow) {
            if (this.dungeon.mobIdx < 3 && Math.random() < 0.2) { damage = 999999; msgText += 'ВАНШОТ! '; }
            else if (this.dungeon.mobIdx === 3 && Math.random() < 0.03) { damage = this.dungeon.mobHp * 0.4; msgText += 'Мощный выстрел по боссу! '; }
        }
        let critChance = s.cc;
        let critCd = s.cd;
        if (isArcher && useBow) {
            critChance = (s.bow_weapon_cc || 0) + (s.cc || 0) * 0.15;
            critCd = (s.bow_weapon_cd || 0) + (s.cd || 0) * 0.15;
        }
        if (Math.random() * 100 < critChance) {
            damage *= (1 + critCd / 100);
            if (typeof this.showCombatFeedback === 'function') this.showCombatFeedback('КРИТ!', 'crit');
        }

        const tiger = this.state.pets.find(p => p.equipped && p.name === 'Тигр');
        if (tiger && tiger.rarity === 'legendary') {
            const lvl = tiger.lvl || 1;
            const perkBonus = 1 + (lvl - 1) * (4 / 99);
            const multiplier = 1 + (this.tigerHitCount * perkBonus / 100);
            damage *= multiplier;
            this.tigerHitCount++;
        }

        if (this.dungeon.mobIdx === 3 && s.boss_damage) {
            damage *= 1 + (s.boss_damage || 0) / 100;
        }
        this.dungeon.mobHp -= damage;
        const vamp = this.state.inventory
            .filter(i => i.equipped && i.vampirism)
            .reduce((sum, i) => sum + (i.vampirism || 0), 0);
        if (vamp > 0 && this.dungeon.pHp > 0) {
            const heal = Math.max(1, Math.floor(damage * (vamp / 100)));
            this.dungeon.pHp = Math.min(this.dungeon.pMaxHp, this.dungeon.pHp + heal);
        }
        if (this.dungeon.floor === 4 && this.dungeon.mobIdx === 3) this.mobDef = Math.max(0, this.mobDef - 10);
        if (msgText) this.msg(msgText.trim());
        const config = dungeonConfig[this.dungeon.floor];
        const isBoss = this.dungeon.mobIdx === 3;
        let mobDmg = isBoss && config.bossStats ? config.bossStats.dmg || config.baseDmg * (config.bossMultiplier || 1) : config.baseDmg;
        if (this.dungeonMode === 'master') {
            mobDmg *= MASTER_MODE_MULTIPLIERS.dmg;
        }
        if (this.dungeon.floor === 5) {
            const mobCc = isBoss ? config.bossStats.cc : config.baseCc;
            const mobCd = isBoss ? config.bossStats.cd : config.baseCd;
            if (Math.random() * 100 < mobCc) {
                mobDmg *= (1 + mobCd / 100);
                if (typeof this.showCombatFeedback === 'function') this.showCombatFeedback('КРИТ ОТ ВРАГА!', 'enemy-crit');
            }
        }
        if (this.dungeon.floor === 7 && config.fireStacks) {
            this.fireStacks = Math.min(3, this.fireStacks + 1);
            mobDmg += 5 * this.fireStacks;
            if (typeof this.showCombatFeedback === 'function') this.showCombatFeedback(`ОГОНЬ +${5 * this.fireStacks}`, 'fire');
        }
        if (this.dungeon.floor === 7 && isBoss) {
            this.witherAttackCount++;
            if (this.witherAttackCount % 2 === 0) mobDmg += config.bossStats.dmgInc;
            if (this.dungeon.mobHp / this.dungeon.mobMaxHp < 0.5) this.mobDef = 75;
        }
        let actualDmg = Math.max(1, mobDmg - s.def - this.mobDef);
        this.dungeon.pHp -= actualDmg;

    if (s.vitality > 0 && this.dungeon.pHp > 0) {
        const healAmt = Math.floor(this.dungeon.pMaxHp * s.vitality / 100);
        if (healAmt > 0) {
            this.dungeon.pHp = Math.min(this.dungeon.pMaxHp, this.dungeon.pHp + healAmt);
            this.dungeonHealFlash = healAmt;
        }
    }

    if (this.dungeon.mobHp <= 0) {
        const baseXp = isBoss ? this.dungeon.floor * 50 : this.dungeon.floor * 20;
        const {bonusMul} = this.getBabyWitherXpBonus();
        const dungeonStats = this.calcStats(true);
        const dungeonExpBonus = 1 + (dungeonStats.dungeon_exp_bonus || 0) / 100;
        const finalXp = Math.floor(baseXp * bonusMul * dungeonExpBonus);
        this.addXp('combat', finalXp);
        const equippedPet = this.state.pets.find(p => p.equipped);
        if (equippedPet) this.addPetXp(equippedPet, finalXp * 0.5);

        let killMsg = 'МОБ УБИТ!';
        if (this.state.class === 'healer') {
            const maxHp = Number(this.dungeon.pMaxHp) || 100;
            const healAmount = Math.floor(maxHp * 0.15);
            const newHp = (this.dungeon.pHp || 0) + healAmount;
            this.dungeon.pHp = Math.min(maxHp, newHp);
            killMsg = `МОБ УБИТ! +${healAmount} ХП (Хиллер) [${this.dungeon.pHp}/${maxHp}]`;
        }
        this.msg(killMsg);

        this.dungeon.mobIdx++;

        if (this.dungeon.mobIdx >= 4) {
            this.giveDungeonReward();
            this.switchTab('loot-screen');
        } else {
            this.initMobStats();
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

    initMobStats(){
        const config=dungeonConfig[this.dungeon.floor];
        const isBoss=this.dungeon.mobIdx===3;
        let baseHp = isBoss && config.bossStats ? config.bossStats.hp||config.baseHp*(config.bossMultiplier||1) : config.baseHp;
        
        if (game.state.mayor?.current === 'waifu625') {
            baseHp = Math.floor(baseHp * 0.95);
        }

        if (this.dungeonMode === 'master') {
            baseHp = Math.floor(baseHp * MASTER_MODE_MULTIPLIERS.hp);
        }
        
        this.dungeon.mobHp = baseHp;
        this.dungeon.mobMaxHp = baseHp;
        let mobDef = isBoss && config.bossStats ? config.bossStats.def||config.baseDef*(config.bossMultiplier||1) : config.baseDef;
        if (this.dungeonMode === 'master') {
            mobDef = Math.floor(mobDef * MASTER_MODE_MULTIPLIERS.def);
        }
        this.mobDef = mobDef;
        this.fireStacks=0;
        this.witherAttackCount=0;
        this.tigerHitCount=0;
    },

    updateBattleUI(){
        document.getElementById('mob-name').innerText=this.dungeon.mobs[this.dungeon.mobIdx];
        document.getElementById('m-hp-txt').innerText=`${Math.max(0,Math.floor(this.dungeon.mobHp))}/${this.dungeon.mobMaxHp}`;
        document.getElementById('m-hp-fill').style.width=`${Math.max(0,this.dungeon.mobHp/this.dungeon.mobMaxHp*100)}%`;
        let pHpText = `${Math.max(0,Math.floor(this.dungeon.pHp))}/${Math.floor(this.dungeon.pMaxHp)}`;
        if (this.dungeonHealFlash > 0) {
            pHpText += ` (+${this.dungeonHealFlash})`;
            this.dungeonHealFlash = 0;
        }
        document.getElementById('p-hp-txt').innerText=pHpText;
        document.getElementById('p-hp-fill').style.width=`${Math.max(0,this.dungeon.pHp/this.dungeon.pMaxHp*100)}%`;
        const bowRow = document.getElementById('dungeon-arrow-row');
        if (bowRow && typeof this.getActiveArrowStack === 'function') {
            const hasBow = this.state.inventory.some(i => i.equipped && i.type === 'weapon' && i.ranged);
            const ap = this.getActiveArrowStack();
            if (hasBow) {
                const cnt = ap ? (ap.stack.count || 0) : 0;
                const label = ap ? ap.name : 'нет';
                bowRow.style.display = 'flex';
                bowRow.innerHTML = `<span style="flex:1;">🏹 Стрелы: <b>${label}</b> ×${cnt}</span><button type="button" class="act-btn" style="padding:8px 12px;font-size:0.8rem;" onclick="game.cycleDungeonArrow()">Сменить ▼</button>`;
            } else {
                bowRow.style.display = 'none';
                bowRow.innerHTML = '';
            }
        }
    },

    giveDungeonReward(){
        const s=this.calcStats(true);
        const r=dungeonRewards[this.dungeon.floor];
        let coins=Math.floor(Math.random()*(r.coins_max-r.coins_min+1)+r.coins_min);
        coins=Math.floor(coins*(1+(s.gold_bonus||0)/100));
        this.state.coins+=coins;

        let baseDungeonXp = this.dungeon.floor*200;
        const dungeonExpBonus = 1 + (s.dungeon_exp_bonus || 0) / 100;
        const {bonusMul} = this.getBabyWitherXpBonus();
        const finalDungeonXp = Math.floor(baseDungeonXp*bonusMul*dungeonExpBonus);
        this.addXp('dungeons', finalDungeonXp);
        const equippedPet = this.state.pets.find(p => p.equipped);
        if (equippedPet) this.addPetXp(equippedPet, finalDungeonXp * 0.5);

        if (!this.state.dungeonsProgress) {
            this.state.dungeonsProgress = {
                catacombs: { maxCleared: 0 },
                master: { maxCleared: 0 }
            };
        }
        const modeKey = this.dungeonMode === 'master' ? 'master' : 'catacombs';
        const prog = this.state.dungeonsProgress[modeKey] || { maxCleared: 0 };
        if (this.dungeon.floor > (prog.maxCleared || 0)) {
            prog.maxCleared = this.dungeon.floor;
            this.state.dungeonsProgress[modeKey] = prog;
        }

        let fragChance = 0;
        let minFrag = 0;
        let maxFrag = 0;
        if (r && r.fragments) {
            fragChance = r.fragments.chance || 0;
            minFrag = r.fragments.min || 0;
            maxFrag = r.fragments.max || 0;
        }

        let fragDropped = 0;
        if (fragChance > 0 && Math.random() * 100 < fragChance) {
            fragDropped = Math.floor(Math.random() * (maxFrag - minFrag + 1)) + minFrag;
            if (fragDropped > 0) {
                this.addMaterial('Фрагмент из Данжа', 'material', fragDropped);
            }
        }

        let dropsText='';
        if (fragDropped > 0) {
            dropsText += ` | +${fragDropped} Фрагмент(ов)`;
        }
        r.drops?.forEach(drop=>{
            let effChance = drop.chance + ((s.mf||0)/100);
            if(Math.random()*100<effChance){
                const item=drop.item||drop.items[Math.floor(Math.random()*drop.items.length)];
                this.state.inventory.push({...item,id:this.state.nextItemId++,equipped:false});
                dropsText+=` | +${item.name}`;
            }
        });
        let upgradeChance = this.dungeon.floor>=5 ? 5+((s.mf||0)/100) : 1+((s.mf||0)/100);
        if(Math.random()*100<upgradeChance){ 
            this.addMaterial('Апгрейд питомца','material'); 
            dropsText+=' | +Апгрейд питомца';
        }
        const fullLog=`+${coins.toLocaleString()} 💰 | +${finalDungeonXp} XP (Данж ${this.dungeon.floor})${dropsText}`;
        document.getElementById('dungeon-log').innerText=fullLog;
        this.addMaterial(`Сундук этажа ${this.dungeon.floor}`,'chest');
        document.getElementById('extra-chests').style.display=this.dungeon.floor>=5?'block':'none';
        this.updateUI();
        this.resetDungeonEffects();
    },

    startDungeon(floor){
        const mode = this.dungeonMode === 'master' ? 'master' : 'catacombs';
        const dLvl = this.state.skills.dungeons.lvl;

        if (mode === 'master') {
            const baseReq = 26;
            const perFloor = 2;
            const req = baseReq + (floor - 1) * perFloor;
            const catProg = this.state.dungeonsProgress?.catacombs?.maxCleared || 0;
            const masterProg = this.state.dungeonsProgress?.master?.maxCleared || 0;
            if (catProg < 7) { this.msg('Мастер Мод открывается после прохождения 7 этажа обычных катакомб.'); return; }
            if (dLvl <= 26) { this.msg('Мастер Мод требует уровень ДАНЖЕЙ выше 26.'); return; }
            if (dLvl < req) { this.msg(`Для этажа Мастер Мода ${floor} требуется уровень ДАНЖЕЙ ${req}.`); return; }
            if (floor > 1 && masterProg < floor - 1) { this.msg(`Сначала пройди предыдущий этаж Мастер Мода.`); return; }
        } else {
            let req=(floor-1)*5+1;
            if (floor === 7) req = 26;
            if(dLvl<req){this.msg(`Требуется уровень ДАНЖЕЙ ${req}`); return;}
        }
        const s=this.calcStats(true);
        const config=dungeonConfig[floor];
        this.dungeon={floor,mobIdx:0,mobs:config.mobs};
        this.initMobStats();
        this.dungeon.pHp=s.hp;
        this.dungeon.pMaxHp=s.hp;
        this.updateBattleUI();
        this.switchTab('battle-screen');
    },

    repeatDungeon(){
        if(!this.dungeon||!this.dungeon.floor){this.msg('Нет активного данжа для повторения'); return;}
        this.startDungeon(this.dungeon.floor);
    },

    resetDungeonEffects(){this.mobDef=0; this.fireStacks=0; this.witherAttackCount=0;}
});
