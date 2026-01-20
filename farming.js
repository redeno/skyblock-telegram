// farming.js — New Farming System

const farmingCrops = {
    wheat: { 
        id: 'wheat', 
        name: 'Пшеница', 
        level: 1, 
        resource: 'Пшеница',
        drops: [
            { type: 'pet', name: 'Pig', rarity: 'common', chance: 0.001 } 
        ]
    },
    potato: { 
        id: 'potato', 
        name: 'Картофель', 
        level: 5, 
        resource: 'Картофель',
        drops: [
            { type: 'material', name: 'Hot Potato Book', chance: 0.05 } 
        ]
    },
    carrot: { 
        id: 'carrot', 
        name: 'Морковь', 
        level: 10, 
        resource: 'Морковь',
        drops: [
            { type: 'pet', name: 'Rabbit', rarity: 'common', chance: 0.001 },
            { type: 'accessory', name: 'Cropie Talisman', chance: 0.001, stats: { farming_fortune: 25 }, cost: 250000 }
        ]
    },
    pumpkin: { 
        id: 'pumpkin', 
        name: 'Тыква', 
        level: 15, 
        resource: 'Тыква',
        specialDrop: { type: 'resource_jackpot', amountBase: 128, chance: 0.1 },
        drops: [
            { type: 'accessory', name: 'Squash Ring', chance: 0.001, stats: { farming_fortune: 75 }, cost: 2500000 }
        ]
    },
    melon: { 
        id: 'melon', 
        name: 'Арбуз', 
        level: 15, 
        resource: 'Арбуз',
        specialDrop: { type: 'resource_jackpot', amountBase: 128, chance: 0.1 },
        drops: [
            { type: 'accessory', name: 'Squash Ring', chance: 0.001, stats: { farming_fortune: 75 }, cost: 2500000 }
        ]
    },
    cane: { 
        id: 'cane', 
        name: 'Тростник', 
        level: 25, 
        resource: 'Тростник',
        drops: [
            { type: 'pet', name: 'Moth', rarity: 'common', chance: 0.001 },
            { type: 'accessory', name: 'Fermento Artifact', chance: 0.001, stats: { farming_fortune: 150 }, cost: 30000000 }
        ]
    },
    mushroom: { 
        id: 'mushroom', 
        name: 'Грибы', 
        level: 40, 
        resource: 'Грибы',
        specialDrop: { type: 'resource_jackpot', amountBase: 256, chance: 0.05 },
        drops: [
            { type: 'accessory', name: 'Fermento Artifact', chance: 0.002, stats: { farming_fortune: 150 }, cost: 30000000 }
        ]
    },
    wart: { 
        id: 'wart', 
        name: 'Адский нарост', 
        level: 50, 
        resource: 'Адский нарост',
        drops: [
            { type: 'accessory', name: 'Fermento Artifact', chance: 0.01, stats: { farming_fortune: 150 }, cost: 30000000 }
        ]
    }
};

Object.assign(game, {
    openFarmingMenu() {
        this.renderFarmingMenu();
        this.switchTab('farming-menu');
    },
    renderFarmingMenu() {
        const list = document.getElementById('farming-list');
        if (!list) return;
        
        const farmingLvl = this.state.skills.farming.lvl;
        let html = '';
        Object.values(farmingCrops).forEach(crop => {
            const locked = farmingLvl < crop.level;
            const btnClass = locked ? 'cooldown-btn disabled' : 'cooldown-btn';
            const status = locked ? `🔒 Требуется LVL ${crop.level}` : 'ВЫБРАТЬ';
            const onclick = locked ? '' : `onclick="game.startFarming('${crop.id}')"`;
            const style = locked ? 'opacity:0.5; cursor:not-allowed' : '';
            html += `
                <div class="card" style="${style}">
                    <div style="display:flex; justify-content:space-between; align-items:center">
                        <b>${crop.name}</b>
                        <span>${crop.resource}</span>
                    </div>
                    <button class="${btnClass}" ${onclick} style="margin-top:10px; height:40px">
                        ${status}
                    </button>
                </div>
            `;
        });
        list.innerHTML = html;
    },
    startFarming(cropId) {
        const crop = farmingCrops[cropId];
        if (!crop) return;
        
        if (this.state.skills.farming.lvl < crop.level) {
            this.msg(`Нужен ${crop.level} уровень фермерства!`);
            return;
        }
        this.state.currentCrop = cropId;
        if (!this.state.stats) this.state.stats = {};
        this.state.stats.currentCrop = cropId;   
        this.goLoc('farm'); 
        document.getElementById('loc-title').innerText = `ФЕРМА: ${crop.name.toUpperCase()}`;
    },
    processFarmingAction() {
        const crop = farmingCrops[this.state.currentCrop];
        if (!crop) {
            this.msg('Ошибка: культура не выбрана!');
            this.switchTab('portal');
            return;
        }
        const s = this.calcStats(false);
        const fortune = s.farming_fortune || 0;
        const skillLvl = this.state.skills.farming.lvl;
        const base_xp = 20 + (crop.level * 0.5); // Slightly scaling base XP
        const exp_bonus = s.farming_exp_bonus || 0;
        // Pet XP Bonus check
        let petXpBonus = 0;
        const pet = this.state.pets.find(p => p.equipped && p.skill === 'farming');
        if (pet) {
             if (pet.name === 'Pig' && pet.rarity === 'legendary') {
                petXpBonus += 1 + (pet.lvl * 0.04); 
             } else {
                petXpBonus += (window.petRarityBonuses[pet.rarity] || 0) * pet.lvl;
             }
        }
        const total_xp = base_xp * (1 + (exp_bonus + petXpBonus) / 100);
        // 2. Resource Drops
        let amount = 1;
        const guaranteed = Math.floor(fortune / 100);
        amount += guaranteed;
        if (Math.random() * 100 < (fortune % 100)) amount++;
        const equippedTool = this.state.inventory.find(i => i.equipped && i.type === 'tool' && i.sub_type === 'hoe');
        if (equippedTool) {
            if (equippedTool.triple_chance && Math.random() * 100 < equippedTool.triple_chance) amount *= 3;
            else if (equippedTool.double_chance && Math.random() * 100 < equippedTool.double_chance) amount *= 2;
        }
        // 3. Jackpot Logic (Pumpkin/Melon/Mushroom)
        let jackpotMsg = '';
        if (crop.specialDrop) {
            // chance to drop 128 * (fortune/100) items
            // User formula: 128 * (farming fortune) / 100
            // Interpretation: If fortune is 100, drop 128. If 200, drop 256.
            // Minimum fortune for formula? Let's assume fortune 100 minimum or just raw math.
            const jackpotChance = crop.specialDrop.chance; // e.g. 0.1%
            if (Math.random() * 100 < jackpotChance) {
                const jackpotAmount = Math.floor(crop.specialDrop.amountBase * (Math.max(100, fortune) / 100));
                amount += jackpotAmount;
                jackpotMsg = ` | 🎰 ДЖЕКПОТ! +${jackpotAmount} шт.`;
            }
        }
        this.addMaterial(crop.resource, 'material', amount);

        // 4. Rare Drops
        let dropMsg = '';
        if (crop.drops) {
            crop.drops.forEach(drop => {
                const mf = s.mf || 0;
                const chance = drop.chance * (1 + mf / 100);             
                if (Math.random() * 100 < chance) {
                    if (drop.type === 'pet') {
                        const newPet = {
                            name: drop.name,
                            type: 'pet',
                            rarity: drop.rarity,
                            lvl: 1,
                            xp: 0,
                            next: 100,
                            skill: 'farming',
                            cost: 5000 // default value
                        };
                        this.state.pets.push(newPet);
                        dropMsg += ` | 🐾 ВЫПАЛ ПИТОМЕЦ: ${drop.name}!`;
                    } else if (drop.type === 'accessory' || drop.type === 'material') {
                        // Add item
                        const newItem = {
                            id: this.state.nextItemId++,
                            name: drop.name,
                            type: drop.type,
                            count: 1,
                            equipped: false,
                            ...drop.stats // add stats if any
                        };
                        if (drop.cost) newItem.cost = drop.cost; // for selling
                        
                        this.state.inventory.push(newItem);
                        dropMsg += ` | 💎 ВЫПАЛ: ${drop.name}!`;
                    }
                }
            });
        }
        // 5. Finalize
        const coinsGain = 10 * skillLvl; // Simple coin gain per action
        this.state.coins += coinsGain;
        const final_xp = total_xp * amount; // Small bonus for big drops, not linear to avoid crazy numbers    
        this.addXp('farming', final_xp);
        if (pet) this.addPetXp(pet, final_xp * 0.5);
        document.getElementById('loc-log').innerText = `+${coinsGain} 💰 | +${final_xp.toFixed(1)} XP | +${amount} ${crop.resource}${jackpotMsg}${dropMsg}`;
        this.updateUI();
    }
});
