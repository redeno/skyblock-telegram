const enchantmentConfig = {
    fire_aspect: {
        name: 'Поджигание Огня',
        icon: '🔥',
        tiers: 2,
        targets: ['weapon'],
        stats: [
            { str: 5 },
            { str: 10 }
        ],
        conflict: null
    },
    poison_blade: {
        name: 'Отравленный клинок',
        icon: '☠️',
        tiers: 3,
        targets: ['weapon'],
        stats: [
            { str: 1 },
            { str: 2 },
            { str: 3 }
        ],
        conflict: null
    },
    smite: {
        name: 'Небесная Кара',
        icon: '⚡',
        tiers: 5,
        targets: ['weapon'],
        stats: [
            { str: 5 },
            { str: 10 },
            { str: 15 },
            { str: 20 },
            { str: 25 }
        ],
        conflict: 'damage_type',
        desc: 'Против нежити'
    },
    bane: {
        name: 'Бич членистоногих',
        icon: '🕷️',
        tiers: 5,
        targets: ['weapon'],
        stats: [
            { str: 5 },
            { str: 10 },
            { str: 15 },
            { str: 20 },
            { str: 25 }
        ],
        conflict: 'damage_type',
        desc: 'Против пауков'
    },
    sharpness: {
        name: 'Острота',
        icon: '🗡️',
        tiers: 5,
        targets: ['weapon'],
        stats: [
            { str: 5 },
            { str: 10 },
            { str: 15 },
            { str: 20 },
            { str: 25 }
        ],
        conflict: 'damage_type',
        desc: 'Против живых'
    },
    looting: {
        name: 'Добыча',
        icon: '💎',
        tiers: 5,
        targets: ['weapon'],
        stats: [
            { mf: 5 },
            { mf: 10 },
            { mf: 15 },
            { mf: 20 },
            { mf: 25 }
        ],
        conflict: null
    },
    critical: {
        name: 'Критикал',
        icon: '💥',
        tiers: 5,
        targets: ['weapon'],
        stats: [
            { cd: 10 },
            { cd: 20 },
            { cd: 30 },
            { cd: 40 },
            { cd: 50 }
        ],
        conflict: null
    },
    titan_slayer: {
        name: 'Убийца Титанов',
        icon: '🗿',
        tiers: 5,
        targets: ['weapon'],
        stats: [
            { boss_damage: 10 },
            { boss_damage: 20 },
            { boss_damage: 30 },
            { boss_damage: 40 },
            { boss_damage: 50 }
        ],
        conflict: null,
        desc: 'Добавляет бонусный урон по боссам.'
    },
    bow_strength: {
        name: 'Сила',
        icon: '💪',
        tiers: 5,
        targets: ['weapon'],
        stats: [
            { bow_str: 25 },
            { bow_str: 50 },
            { bow_str: 75 },
            { bow_str: 100 },
            { bow_str: 125 }
        ],
        conflict: null,
        desc: 'Увеличивает урон лука.'
    },
    flaming_arrow: {
        name: 'Огненная стрела',
        icon: '🔥',
        tiers: 2,
        targets: ['weapon'],
        stats: [
            { bow_fire: 5 },
            { bow_fire: 10 }
        ],
        conflict: null,
        desc: 'Накладывает поджог, который усиливается с каждым ударом.'
    },
    arrow_saver: {
        name: 'Экономия',
        icon: '🏹',
        tiers: 5,
        targets: ['weapon'],
        stats: [
            { arrow_save: 5 },
            { arrow_save: 10 },
            { arrow_save: 15 },
            { arrow_save: 20 },
            { arrow_save: 25 }
        ],
        conflict: null,
        desc: 'Шанс не потратить стрелу при выстреле из лука.'
    },
    eagle_eye: {
        name: 'Меткий глаз',
        icon: '🎯',
        tiers: 5,
        targets: ['weapon'],
        stats: [
            { bow_cc: 2 },
            { bow_cc: 4 },
            { bow_cc: 6 },
            { bow_cc: 8 },
            { bow_cc: 10 }
        ],
        conflict: null,
        desc: 'Шанс нанести двойной урон из лука.'
    },
    protection: {
        name: 'Защита',
        icon: '🛡️',
        tiers: 5,
        targets: ['armor'],
        stats: [
            { def: 4 },
            { def: 8 },
            { def: 12 },
            { def: 16 },
            { def: 20 }
        ],
        conflict: null
    },
    health: {
        name: 'Здоровье',
        icon: '❤️',
        tiers: 5,
        targets: ['armor'],
        stats: [
            { hp: 5 },
            { hp: 10 },
            { hp: 15 },
            { hp: 20 },
            { hp: 25 }
        ],
        conflict: null
    },
    rejuvenate: {
        name: 'Режевинейт',
        icon: '💚',
        tiers: 5,
        targets: ['armor'],
        stats: [
            { vitality: 0.2 },
            { vitality: 0.4 },
            { vitality: 0.6 },
            { vitality: 0.8 },
            { vitality: 1 }
        ],
        conflict: null
    },
    fortune_ench: {
        name: 'Фортуна',
        icon: '🍀',
        tiers: 5,
        targets: ['tool'],
        stats: [
            { mining_fortune: 10, farming_fortune: 10, foraging_fortune: 10, fishing_fortune: 10 },
            { mining_fortune: 20, farming_fortune: 20, foraging_fortune: 20, fishing_fortune: 20 },
            { mining_fortune: 30, farming_fortune: 30, foraging_fortune: 30, fishing_fortune: 30 },
            { mining_fortune: 40, farming_fortune: 40, foraging_fortune: 40, fishing_fortune: 40 },
            { mining_fortune: 50, farming_fortune: 50, foraging_fortune: 50, fishing_fortune: 50 }
        ],
        conflict: null
    }
};

window.enchantmentConfig = enchantmentConfig;
/** Зачары только для луков (не показывать на мечах и наоборот) */
window.BOW_ONLY_ENCHANT_KEYS = new Set(['bow_strength', 'flaming_arrow', 'arrow_saver', 'eagle_eye']);

const enchantCosts = [10000, 50000, 250000, 1000000, 15000000];
const enchantXpMultipliers = [10, 15, 20, 25, 30];
const tierRoman = ['I', 'II', 'III', 'IV', 'V'];
const tierColors = ['#55ff55', '#5555ff', '#aa00aa', '#ffaa00', '#ff5555'];

Object.assign(game, {
    enchantSelectedItem: null,

    openEnchanting() {
        this.enchantSelectedItem = null;
        this.renderEnchanting();
        this.showModal('enchantModal');
    },

    renderEnchanting() {
        const el = document.getElementById('enchant-content');
        if (!el) return;

        const item = this.enchantSelectedItem;
        let html = '';

        if (!item) {
            html += `<div style="text-align:center;margin:15px 0;"><b style="color:var(--accent);">Выберите предмет для зачарования</b></div>`;
            html += `<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:10px;">`;
            html += `<button class="act-btn" onclick="game.showEnchantPicker('weapon','melee')" style="flex:1;min-width:72px;">⚔️ МЕЧИ</button>`;
            html += `<button class="act-btn" onclick="game.showEnchantPicker('weapon','bow')" style="flex:1;min-width:72px;">🏹 ЛУКИ</button>`;
            html += `<button class="act-btn" onclick="game.showEnchantPicker('armor')" style="flex:1;min-width:80px;">🛡️ БРОНЯ</button>`;
            html += `<button class="act-btn" onclick="game.showEnchantPicker('tool')" style="flex:1;min-width:80px;">🔧 ИНСТРУМЕНТЫ</button>`;
            html += `</div>`;
            html += `<div id="enchant-picker"></div>`;
        } else {
            html += this._renderEnchantWorkbench(item);
        }

        el.innerHTML = html;
    },

    showEnchantPicker(type, weaponKind) {
        const picker = document.getElementById('enchant-picker');
        if (!picker) return;
        let items = this.state.inventory.filter(i => i.type === type);
        if (type === 'weapon') {
            if (weaponKind === 'bow') items = items.filter(i => i.ranged);
            else items = items.filter(i => !i.ranged);
        }
        if (!items.length) {
            picker.innerHTML = `<div class="card" style="text-align:center;color:#666;">Нет ${type === 'weapon' ? (weaponKind === 'bow' ? 'луков' : 'мечей') : 'предметов'}</div>`;
            return;
        }
        let html = '';
        items.forEach(i => {
            const enchCount = i.enchantments ? Object.keys(i.enchantments).length : 0;
            const enchText = enchCount > 0 ? ` [${enchCount} зач.]` : '';
            html += `<div class="card" style="cursor:pointer;${i.equipped ? 'border-color:var(--green);' : ''}" onclick="game.selectEnchantItem(${i.id})">
                <b>${i.name}${enchText}</b>${i.equipped ? ' <span style="color:var(--green);font-size:0.7rem;">НАДЕТО</span>' : ''}
                <br><small style="color:#0f0;">${this.getItemDesc(i)}</small>
            </div>`;
        });
        picker.innerHTML = html;
    },

    selectEnchantItem(itemId) {
        const item = this.state.inventory.find(i => i.id === itemId);
        if (!item) return;
        this.enchantSelectedItem = item;
        this.renderEnchanting();
    },

    _renderEnchantWorkbench(item) {
        const enchants = item.enchantments || {};
        const itemType = item.type;
        const bowKeys = window.BOW_ONLY_ENCHANT_KEYS || new Set();
        const isBow = item.type === 'weapon' && item.ranged;
        const available = Object.entries(enchantmentConfig).filter(([key, e]) => {
            if (!e.targets.includes(itemType)) return false;
            if (isBow) return bowKeys.has(key);
            return !bowKeys.has(key);
        });

        let html = `<div style="text-align:center;margin-bottom:10px;">`;
        html += `<div class="card" style="border-color:var(--accent);display:inline-block;padding:8px 20px;">`;
        html += `<b style="color:var(--accent);">${item.name}</b>`;
        if (item.equipped) html += ` <span style="color:var(--green);font-size:0.7rem;">НАДЕТО</span>`;
        html += `<br><small style="color:#0f0;">${this.getItemDesc(item)}</small>`;
        html += `</div>`;
        html += `<div style="margin-top:8px;"><button class="act-btn" onclick="game.enchantSelectedItem=null;game.renderEnchanting();">ОТМЕНИТЬ ВЫБОР</button></div>`;
        html += `</div>`;

        html += `<div style="display:flex;gap:8px;flex-wrap:wrap;">`;

        html += `<div style="flex:1;min-width:140px;">`;
        html += `<h4 style="color:var(--accent);margin:0 0 6px;font-size:0.8rem;">📖 ДОСТУПНЫЕ</h4>`;
        available.forEach(([key, ench]) => {
            const currentTier = enchants[key] || 0;
            const maxTier = ench.tiers;
            const hasConflict = ench.conflict && Object.entries(enchants).some(([ek]) => {
                const other = enchantmentConfig[ek];
                return other && other.conflict === ench.conflict && ek !== key;
            });

            for (let t = 1; t <= maxTier; t++) {
                if (t <= currentTier) continue;
                const cost = enchantCosts[t - 1];
                const color = tierColors[t - 1];
                const conflictNote = hasConflict ? ' <span style="color:var(--red);font-size:0.6rem;">⚠️ КОНФЛИКТ</span>' : '';
                const statDesc = Object.entries(ench.stats[t - 1]).map(([st, v]) => {
                    const statNames = {str:'СИЛА',def:'БРОНЯ',cd:'КРИТ УРОН',cc:'КРИТ ШАНС',mf:'УДАЧА',hp:'ХП',vitality:'ВОССТ',
                        mining_fortune:'⛏️ФОРТ',farming_fortune:'🌾ФОРТ',foraging_fortune:'🌲ФОРТ',fishing_fortune:'🎣ФОРТ',
                        bow_str:'УРОН ЛУКА',bow_fire:'ОГОНЬ ЛУКА',arrow_save:'ЭКОН. СТРЕЛ',bow_cc:'ДВОЙНОЙ ВЫСТРЕЛ %'};
                    return `+${v} ${statNames[st] || st}`;
                }).join(', ');
                html += `<div class="card" style="padding:6px 8px;margin-bottom:4px;border-left:3px solid ${color};cursor:pointer;" onclick="game.applyEnchant(${item.id},'${key}',${t})">`;
                html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
                html += `<span style="color:${color};font-size:0.75rem;font-weight:bold;">${ench.icon} ${ench.name} ${tierRoman[t - 1]}</span>`;
                html += `</div>`;
                html += `<small style="color:#0f0;">${statDesc}</small>`;
                if (ench.desc) html += ` <small style="color:var(--gray);font-size:0.6rem;">(${ench.desc})</small>`;
                html += conflictNote;
                html += `<div style="text-align:right;"><small style="color:var(--accent);">${cost.toLocaleString()}💰</small></div>`;
                html += `</div>`;
            }
        });
        html += `</div>`;

        html += `<div style="flex:1;min-width:140px;">`;
        html += `<h4 style="color:var(--green);margin:0 0 6px;font-size:0.8rem;">✅ НАЛОЖЕННЫЕ</h4>`;
        if (Object.keys(enchants).length === 0) {
            html += `<div style="color:#666;font-size:0.75rem;text-align:center;padding:10px;">Нет зачарований</div>`;
        } else {
            Object.entries(enchants).forEach(([key, tier]) => {
                const ench = enchantmentConfig[key];
                if (!ench) return;
                const color = tierColors[tier - 1];
                const statDesc = Object.entries(ench.stats[tier - 1]).map(([st, v]) => {
                    const statNames = {str:'СИЛА',def:'БРОНЯ',cd:'КРИТ УРОН',cc:'КРИТ ШАНС',mf:'УДАЧА',hp:'ХП',vitality:'ВОССТ',
                        mining_fortune:'⛏️ФОРТ',farming_fortune:'🌾ФОРТ',foraging_fortune:'🌲ФОРТ',fishing_fortune:'🎣ФОРТ',
                        bow_str:'УРОН ЛУКА',bow_fire:'ОГОНЬ ЛУКА',arrow_save:'ЭКОН. СТРЕЛ',bow_cc:'ДВОЙНОЙ ВЫСТРЕЛ %'};
                    return `+${v} ${statNames[st] || st}`;
                }).join(', ');
                html += `<div class="card" style="padding:6px 8px;margin-bottom:4px;border-left:3px solid ${color};">`;
                html += `<span style="color:${color};font-weight:bold;font-size:0.75rem;">${ench.icon} ${ench.name} ${tierRoman[tier - 1]}</span>`;
                html += `<br><small style="color:#0f0;">${statDesc}</small>`;
                html += `</div>`;
            });
        }
        html += `</div>`;

        html += `</div>`;
        return html;
    },

    applyEnchant(itemId, enchKey, tier) {
        const item = this.state.inventory.find(i => i.id === itemId);
        if (!item) return;
        const ench = enchantmentConfig[enchKey];
        if (!ench) return;
        const cost = enchantCosts[tier - 1];
        if (this.state.coins < cost) {
            this.msg(`Не хватает монет! Нужно ${cost.toLocaleString()} 💰`);
            return;
        }

        if (!item.enchantments) item.enchantments = {};

        if (ench.conflict) {
            Object.keys(item.enchantments).forEach(ek => {
                const other = enchantmentConfig[ek];
                if (other && other.conflict === ench.conflict && ek !== enchKey) {
                    delete item.enchantments[ek];
                    this.msg(`${other.name} заменено на ${ench.name}!`);
                }
            });
        }

        this.state.coins -= cost;
        item.enchantments[enchKey] = tier;

        const enchLvl = this.state.skills.enchanting?.lvl || 1;
        const xpGain = enchantXpMultipliers[tier - 1] * enchLvl;
        if (typeof this.addXp === 'function') {
            this.addXp('enchanting', xpGain);
        }

        this.msg(`${ench.name} ${tierRoman[tier - 1]} наложено! +${xpGain} XP Зачарования`);
        this.enchantSelectedItem = item;
        this.renderEnchanting();
        this.updateUI();
    }
});
