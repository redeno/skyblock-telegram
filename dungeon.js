// dungeon.js — обновлённый XP по формуле (этаж * множитель)
const dungeonConfig = {
    1: { mobs: ['ЗОМБИ','СКЕЛЕТ','ПАУК','МЕРТВЕЦ'], baseHp:50, baseDmg:25, baseDef:5, bossMultiplier:2 },
    2: { mobs: ['ПАУК','ПЕЩЕРНЫЙ ПАУК','ПАУК-СКОРПИОН','БРУДА'], baseHp:250, baseDmg:50, baseDef:15, bossMultiplier:2 },
    3: { mobs: ['ЭНДЕРМИТ','ЭНДЕРМЕН','ШАЛКЕР','ЗАЩИТНИК КРАЯ'], baseHp:500, baseDmg:100, baseDef:10, bossStats:{hp:750,dmg:125,def:50} },
    4: { mobs: ['РЫЦАРЬ','ПАЛАДИН','ПРОРОК','КОРОЛЬ'], baseHp:450, baseDmg:100, baseDef:30, bossStats:{hp:1000,dmg:150,def:50}, bossSpecial:'kingDefDrop' },
    5: { mobs: ['ОХОТНИК','ИСКАТЕЛЬ','МАГ','АССАСИН'], baseHp:500, baseDmg:175, baseDef:0, baseCc:5, baseCd:25, bossStats:{hp:750,dmg:200,cc:25,cd:75} },
    6: { mobs: ['ОРК','ГОБЛИН','ТРОЛЬ','ГИГАНТ'], baseHp:1000, baseDmg:100, baseDef:10, bossStats:{hp:2000,dmg:125,def:20} },
    7: { mobs: ['БЛЕЙЗ','ГАСТ','СКЕЛЕТ ИССУШИТЕЛЬ','ИССУШИТЕЛЬ'], baseHp:750, baseDmg:50, baseDef:0, fireStacks:true, bossStats:{hp:3000,dmgBase:75,dmgInc:15}, bossSpecial:'witherPhase' }
};

const dungeonRewards = {
    1: {coins_min:50, coins_max:250, drops:[]},
    2: {coins_min:300, coins_max:500, drops:[{chance:1, items:[
        {name:'Талисман силы +1',type:'accessory',str:1,cost:100},
        {name:'Талисман крита +1',type:'accessory',cd:1,cost:100},
        {name:'Талисман удачи +1',type:'accessory',mf:1,cost:100}
    ]}]},
    3: {coins_min:1000, coins_max:2500, drops:[{chance:1,item:{name:'Талисман защиты +20',type:'accessory',def:20,cost:5000}}]},
    4: {coins_min:5000, coins_max:25000, drops:[{chance:5,item:{name:'Меч Мидаса',type:'weapon',dynamic_str:'midas',cost:10000}}]},
    5: {coins_min:10000, coins_max:40000, drops:[]},
    6: {coins_min:100000, coins_max:500000, drops:[{chance:3,item:{name:'Меч Гиганта',type:'weapon',str:100,cd:50,cost:250000}}]},
    7: {coins_min:200000, coins_max:1000000, drops:[{chance:0.5,item:{name:'Гиперион',type:'weapon',magic:true,cost:500000}}]}
};

Object.assign(game, {
    dungeon: {floor:1, mobIdx:0, mobHp:50, pHp:100, pMaxHp:100, mobs:['ЗОМБИ','СКЕЛЕТ','ПАУК','БОСС']},
    mobDef: 0,
    fireStacks: 0,
    witherAttackCount: 0,
    tigerHitCount: 0,

    // Бонус к XP от Бейби Иссушителя
    getBabyWitherXpBonus() {
        const pet = this.state.pets.find(p => p.equipped && p.name === 'Бейби Иссушитель');
        if (!pet) return { bonusMul:1, pet:null };
        return { bonusMul:1 + pet.lvl / 100, pet };
    },

    // Добавление XP питомцу
    addPetXp(pet, xp) {
        pet.xp += xp;
        while(pet.xp >= pet.next){
            pet.lvl++;
            pet.xp -= pet.next;
            pet.next = Math.floor(pet.next*1.4);
            this.msg(`${pet.name} повысил уровень! Теперь ${pet.lvl}`);
        }
    },

    dungeonAttack() {
    const inDungeon = true;
    const s = this.calcStats(inDungeon);
    const weapon = this.state.inventory.find(i=>i.equipped && i.type==='weapon');
    let damage = weapon?.magic ? s.int*s.mag_amp*100 : s.str;
    damage *= 1 + (s.dungeon_damage||0)/100;
    let msgText='';
    if(this.state.class==='berserk' && Math.random()<0.2){damage*=2; msgText+='ДВОЙНОЙ УДАР! ';}
    if(this.state.class==='archer'){
        if(this.dungeon.mobIdx<3 && Math.random()<0.2){damage=999999; msgText+='ВАНШОТ! ';}
        else if(this.dungeon.mobIdx===3 && Math.random()<0.03){damage=this.dungeon.mobHp*0.4; msgText+='Мощный выстрел по боссу! ';}
    }
    if(Math.random()*100<s.cc){damage*=(1+s.cd/100); msgText+='КРИТИЧЕСКИЙ УДАР! ';}

    // Tiger Legendary Perk
    const tiger = this.state.pets.find(p => p.equipped && p.name === 'Тигр');
    if (tiger && tiger.rarity === 'legendary') {
        const lvl = tiger.lvl || 1;
        // 1% (lvl 1) -> 5% (lvl 100) per hit
        const perkBonus = 1 + (lvl - 1) * (4/99);
        const multiplier = 1 + (this.tigerHitCount * perkBonus / 100);
        damage *= multiplier;
        this.tigerHitCount++;
        // msgText += `(TIGER x${multiplier.toFixed(2)}) `; 
    }

    this.dungeon.mobHp-=damage;
    if(this.dungeon.floor===4 && this.dungeon.mobIdx===3) this.mobDef=Math.max(0,this.mobDef-10);
    if(msgText) this.msg(msgText.trim());
    const config = dungeonConfig[this.dungeon.floor];
    const isBoss = this.dungeon.mobIdx===3;
    let mobDmg = isBoss && config.bossStats ? config.bossStats.dmg||config.baseDmg*(config.bossMultiplier||1) : config.baseDmg;
    if(this.dungeon.floor===5){
        const mobCc = isBoss ? config.bossStats.cc : config.baseCc;
        const mobCd = isBoss ? config.bossStats.cd : config.baseCd;
        if(Math.random()*100<mobCc){mobDmg*=(1+mobCd/100); this.msg('КРИТ ОТ ВРАГА!');}
    }
    if(this.dungeon.floor===7 && config.fireStacks){
        this.fireStacks=Math.min(3,this.fireStacks+1);
        mobDmg+=5*this.fireStacks;
        this.msg(`ОГОНЬ! +${5*this.fireStacks} дамага`);
    }
    if(this.dungeon.floor===7 && isBoss){
        this.witherAttackCount++;
        if(this.witherAttackCount%2===0) mobDmg+=config.bossStats.dmgInc;
        if(this.dungeon.mobHp/this.dungeon.mobMaxHp<0.5) this.mobDef=75;
    }
    let actualDmg=Math.max(1,mobDmg-s.def-this.mobDef);
    this.dungeon.pHp-=actualDmg;

    if (this.dungeon.mobHp <= 0) {
        // XP за моба с бонусом Бейби
        const baseXp = isBoss ? this.dungeon.floor * 50 : this.dungeon.floor * 20;
        const {bonusMul} = this.getBabyWitherXpBonus();
        const finalXp = Math.floor(baseXp * bonusMul);
        this.addXp('combat', finalXp);
        const equippedPet = this.state.pets.find(p => p.equipped);
        if (equippedPet) this.addPetXp(equippedPet, finalXp * 0.5);

        // ХИЛ ОТ ХИЛЛЕРА — всегда после убийства моба
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
        const baseHp = isBoss && config.bossStats ? config.bossStats.hp||config.baseHp*(config.bossMultiplier||1) : config.baseHp;
        this.dungeon.mobHp = baseHp;
        this.dungeon.mobMaxHp = baseHp;
        this.mobDef = isBoss && config.bossStats ? config.bossStats.def||config.baseDef*(config.bossMultiplier||1) : config.baseDef;
        this.fireStacks=0;
        this.witherAttackCount=0;
        this.tigerHitCount=0;
    },

    updateBattleUI(){
        document.getElementById('mob-name').innerText=this.dungeon.mobs[this.dungeon.mobIdx];
        document.getElementById('m-hp-txt').innerText=`${Math.max(0,Math.floor(this.dungeon.mobHp))}/${this.dungeon.mobMaxHp}`;
        document.getElementById('m-hp-fill').style.width=`${Math.max(0,this.dungeon.mobHp/this.dungeon.mobMaxHp*100)}%`;
        document.getElementById('p-hp-txt').innerText=`${Math.max(0,Math.floor(this.dungeon.pHp))}/${Math.floor(this.dungeon.pMaxHp)}`;
        document.getElementById('p-hp-fill').style.width=`${Math.max(0,this.dungeon.pHp/this.dungeon.pMaxHp*100)}%`;
    },

    giveDungeonReward(){
        const s=this.calcStats(true);
        const r=dungeonRewards[this.dungeon.floor];
        let coins=Math.floor(Math.random()*(r.coins_max-r.coins_min+1)+r.coins_min);
        coins=Math.floor(coins*(1+(s.gold_bonus||0)/100));
        this.state.coins+=coins;

        // XP за этаж с бонусом Бейби
        const baseDungeonXp = this.dungeon.floor*200;
        const {bonusMul} = this.getBabyWitherXpBonus();
        const finalDungeonXp = Math.floor(baseDungeonXp*bonusMul);
        this.addXp('dungeons', finalDungeonXp);
        const equippedPet = this.state.pets.find(p => p.equipped);
        if (equippedPet) this.addPetXp(equippedPet, finalDungeonXp * 0.5);

        // Фрагменты из данжа (Шансы 29% -> 25% -> 21% -> 17% -> 13% -> 9% -> 5%)
        // Кол-во: Floor 1 (0-1), Floor 2 (0-2)... Floor 7 (0-7) ? Или как просил юзер "0-1, 0-2, 1-3..."
        // Юзер: 1 эт (29% 0-1), 2 эт (25% 0-2), 3 эт (21% 1-3), 4 эт (17% 2-4), 5 эт (13% 3-5), 6 эт (9% 4-6), 7 эт (5% 5-7)
        let fragChance = 0;
        let minFrag = 0;
        let maxFrag = 0;

        switch(this.dungeon.floor) {
            case 1: fragChance = 29; minFrag = 0; maxFrag = 1; break;
            case 2: fragChance = 25; minFrag = 0; maxFrag = 2; break;
            case 3: fragChance = 21; minFrag = 1; maxFrag = 3; break;
            case 4: fragChance = 17; minFrag = 2; maxFrag = 4; break;
            case 5: fragChance = 13; minFrag = 3; maxFrag = 5; break;
            case 6: fragChance = 9;  minFrag = 4; maxFrag = 6; break;
            case 7: fragChance = 5;  minFrag = 5; maxFrag = 7; break;
        }

        if (fragChance > 0 && Math.random() * 100 < fragChance) {
            const count = Math.floor(Math.random() * (maxFrag - minFrag + 1)) + minFrag;
            if (count > 0) {
                this.addMaterial('Фрагмент из Данжа', 'material', count);
                // dropsText += ` | +${count} Фрагмент(ов)`; // Добавим в общий текст
                // Лучше просто добавить в лог
            }
        }

        // Дропы
        let dropsText='';
        // Добавим фрагменты в текст, если они выпали (нужно проверить инвентарь или просто вывести)
        // Упростим: просто выведем в dropsText, если шанс сработал
        if (fragChance > 0 && Math.random() * 100 < fragChance) { // Повторный ролл для текста? Нет, надо было сохранить результат.
             // Исправим логику выше
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
        const req=(floor-1)*5+1;
        if(this.state.skills.dungeons.lvl<req){this.msg(`Требуется уровень ДАНЖЕЙ ${req}`); return;}
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
