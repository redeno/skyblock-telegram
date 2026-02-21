// blacksmith.js — система рефоржа (кузнец)

const reforgeStones = {
    weapon: [
        { name: 'Острый', bonuses: { str: 5 }, cost: 10000 },
        { name: 'Мощный', bonuses: { str: 10, cd: 5 }, cost: 50000 },
        { name: 'Яростный', bonuses: { str: 15, cc: 3, cd: 10 }, cost: 250000 },
        { name: 'Смертоносный', bonuses: { str: 20, cc: 5, cd: 15 }, cost: 1000000 },
        { name: 'Легендарный', bonuses: { str: 30, cc: 8, cd: 25, mf: 5 }, cost: 5000000 },
        { name: 'Мифический', bonuses: { str: 50, cc: 12, cd: 40, mf: 10 }, cost: 25000000 }
    ],
    armor: [
        { name: 'Крепкий', bonuses: { def: 5 }, cost: 10000 },
        { name: 'Защитный', bonuses: { def: 10, hp: 5 }, cost: 50000 },
        { name: 'Бронированный', bonuses: { def: 15, hp: 10 }, cost: 250000 },
        { name: 'Несокрушимый', bonuses: { def: 25, hp: 20 }, cost: 1000000 },
        { name: 'Священный', bonuses: { def: 35, hp: 30, vitality: 3 }, cost: 5000000 },
        { name: 'Бессмертный', bonuses: { def: 50, hp: 50, vitality: 5 }, cost: 25000000 }
    ],
    tool: [
        { name: 'Добротный', bonuses: { mining_fortune: 10, farming_fortune: 10, fishing_fortune: 10, foraging_fortune: 10 }, cost: 10000 },
        { name: 'Искусный', bonuses: { mining_fortune: 25, farming_fortune: 25, fishing_fortune: 25, foraging_fortune: 25 }, cost: 50000 },
        { name: 'Мастерской', bonuses: { mining_fortune: 50, farming_fortune: 50, fishing_fortune: 50, foraging_fortune: 50 }, cost: 250000 },
        { name: 'Великий', bonuses: { mining_fortune: 100, farming_fortune: 100, fishing_fortune: 100, foraging_fortune: 100 }, cost: 1000000 },
        { name: 'Божественный', bonuses: { mining_fortune: 200, farming_fortune: 200, fishing_fortune: 200, foraging_fortune: 200 }, cost: 5000000 }
    ]
};

Object.assign(game, {
    showBlacksmith() {
        let area = document.getElementById('blacksmith-screen');
        if (!area) {
            area = document.createElement('div');
            area.id = 'blacksmith-screen';
            area.className = 'screen';
            const viewport = document.getElementById('viewport');
            if (viewport) viewport.appendChild(area);
            else return;
        }

        this.switchTab('blacksmith-screen');

        const equippedItems = this.state.inventory.filter(i =>
            (i.type === 'weapon' || i.type === 'armor' || i.type === 'tool')
        );

        let itemsHtml = '';
        equippedItems.forEach(item => {
            const stones = reforgeStones[item.type] || [];
            const currentReforge = item.reforge ? (item.reforge.name || item.reforge) : 'Нет';
            const rc = item.rarity ? (rarityColors[item.rarity] || '#aaa') : '#aaa';
            const rt = typeof getRarityTag === 'function' ? getRarityTag(item.rarity) : '';

            let stonesHtml = '';
            stones.forEach((stone, idx) => {
                const isApplied = item.reforge && (item.reforge.name === stone.name || item.reforge === stone.name);
                const bonusText = Object.entries(stone.bonuses)
                    .filter(([k,v]) => {
                        if (item.type === 'tool') {
                            if (item.sub_type === 'pickaxe' && k !== 'mining_fortune') return false;
                            if (item.sub_type === 'hoe' && k !== 'farming_fortune') return false;
                            if (item.sub_type === 'rod' && k !== 'fishing_fortune') return false;
                            if (item.sub_type === 'axe' && k !== 'foraging_fortune') return false;
                        }
                        return true;
                    })
                    .map(([k,v]) => `+${v} ${k.toUpperCase()}`)
                    .join(', ');

                stonesHtml += `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div>
                            <span style="color:${isApplied ? '#0f0' : '#fff'}">${stone.name}</span>
                            <small style="color:#aaa;margin-left:8px;">${bonusText}</small>
                        </div>
                        <button class="act-btn" style="padding:4px 12px;font-size:0.75rem;" 
                            onclick="game.applyReforge(${item.id}, '${item.type}', ${idx})"
                            ${isApplied ? 'disabled style="opacity:0.5;padding:4px 12px;font-size:0.75rem;"' : ''}>
                            ${isApplied ? 'УСТАНОВЛЕН' : stone.cost.toLocaleString() + '💰'}
                        </button>
                    </div>`;
            });

            itemsHtml += `
                <div class="card" style="border-left:3px solid ${rc};margin-bottom:10px;">
                    <b>${item.name}</b> ${rt}
                    <br><small style="color:var(--green);">Текущий рефорж: <b style="color:#ff0;">${currentReforge}</b></small>
                    ${(item.reforge && item.reforge.bonuses) ? `<br><small style="color:#ff0;">${Object.entries(item.reforge.bonuses).map(([k,v])=>`+${v} ${k.toUpperCase()}`).join(', ')}</small>` : ''}
                    <div style="margin-top:8px;">${stonesHtml}</div>
                    ${item.reforge ? `<button class="act-btn" style="margin-top:6px;background:#600;padding:4px 12px;font-size:0.75rem;" onclick="game.removeReforge(${item.id})">УБРАТЬ РЕФОРЖ</button>` : ''}
                </div>`;
        });

        if (!equippedItems.length) {
            itemsHtml = '<div class="card" style="text-align:center;color:#666;">У вас нет предметов для рефоржа</div>';
        }

        area.innerHTML = `
            <div style="padding:10px;">
                <h2 style="text-align:center;margin-bottom:10px;">🔨 КУЗНЕЦ</h2>
                <p style="color:#aaa;text-align:center;font-size:0.85rem;margin-bottom:15px;">
                    Улучшайте предметы с помощью рефоржей!<br>
                    Каждый предмет может иметь только один рефорж.
                </p>
                ${itemsHtml}
                <button class="act-btn" style="width:100%;margin-top:10px;" onclick="game.switchTab('home')">НАЗАД</button>
            </div>`;
    },

    applyReforge(itemId, itemType, stoneIdx) {
        const item = this.state.inventory.find(i => i.id === itemId);
        if (!item) { this.msg('Предмет не найден!'); return; }

        const stones = reforgeStones[itemType];
        if (!stones || !stones[stoneIdx]) { this.msg('Рефорж не найден!'); return; }

        const stone = stones[stoneIdx];
        if (this.state.coins < stone.cost) {
            this.msg(`Не хватает монет! Нужно: ${stone.cost.toLocaleString()}`);
            return;
        }

        this.state.coins -= stone.cost;

        let bonuses = { ...stone.bonuses };
        if (item.type === 'tool' && item.sub_type) {
            const filtered = {};
            for (const [k, v] of Object.entries(bonuses)) {
                if (item.sub_type === 'pickaxe' && k === 'mining_fortune') filtered[k] = v;
                else if (item.sub_type === 'hoe' && k === 'farming_fortune') filtered[k] = v;
                else if (item.sub_type === 'rod' && k === 'fishing_fortune') filtered[k] = v;
                else if (item.sub_type === 'axe' && k === 'foraging_fortune') filtered[k] = v;
                else if (!['mining_fortune','farming_fortune','fishing_fortune','foraging_fortune'].includes(k)) filtered[k] = v;
            }
            bonuses = filtered;
        }

        item.reforge = {
            name: stone.name,
            bonuses: bonuses
        };

        this.msg(`Рефорж "${stone.name}" применён к ${item.name}!`);
        this.updateUI();
        this.showBlacksmith();
    },

    removeReforge(itemId) {
        const item = this.state.inventory.find(i => i.id === itemId);
        if (!item || !item.reforge) { this.msg('Нет рефоржа!'); return; }

        delete item.reforge;
        this.msg('Рефорж убран!');
        this.updateUI();
        this.showBlacksmith();
    }
});
