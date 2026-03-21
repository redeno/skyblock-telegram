// OpenChest.js — Сокровещница: рулетка сундуков

const CHESTS = [
    {
        id: 'coins_1m',
        name: 'Сундук Удачи',
        icon: '💰',
        cost: 1000000,
        costLabel: '1M',
        desc: 'Монеты на удачу',
        drops: [
            { value: 125000, label: '125,000', chance: 75 },
            { value: 500000, label: '500,000', chance: 20 },
            { value: 2500000, label: '2,500,000', chance: 4.9 },
            { value: 25000000, label: '25,000,000', chance: 0.1 }
        ],
        type: 'coins'
    },
    {
        id: 'resources_5m',
        name: 'Ресурсный сундук',
        icon: '📦',
        cost: 5000000,
        costLabel: '5M',
        desc: 'Ресурсы 4–64 шт',
        resources: ['Карась', 'Дуб', 'Уголь', 'Пшеница'],
        type: 'resources'
    },
    { id: 'soon3', name: 'Тайный сундук', icon: '🔮', cost: 0, comingSoon: true },
    { id: 'soon4', name: 'Легендарный сундук', icon: '👑', cost: 0, comingSoon: true },
    { id: 'soon5', name: 'Божественный сундук', icon: '✨', cost: 0, comingSoon: true }
];

const OpenChest = {
    selectedChest: null,
    isSpinning: false,

    openMenu() {
        game.switchTab('chest-menu');
        this.render();
    },

    selectChest(chest) {
        if (chest.comingSoon) {
            game.msg('Скоро в игре!');
            return;
        }
        this.selectedChest = chest;
        this.render();
    },

    rollChest(chest) {
        if (this.isSpinning) return;
        if (!chest || chest.comingSoon) return;
        if (game.state.coins < chest.cost) {
            game.msg(`Нужно ${chest.cost.toLocaleString()} 💰`);
            return;
        }

        game.state.coins -= chest.cost;
        if (typeof Casino !== 'undefined' && typeof Casino.addToTreasury === 'function') {
            Casino.addToTreasury(Math.floor(chest.cost * 0.3), 'openchest');
        }
        this.isSpinning = true;

        let result;
        if (chest.type === 'coins') {
            const r = Math.random() * 100;
            let acc = 0;
            for (const d of chest.drops) {
                acc += d.chance;
                if (r < acc) {
                    result = { type: 'coins', value: d.value, label: d.label };
                    break;
                }
            }
            if (!result) result = { type: 'coins', value: chest.drops[0].value, label: String(chest.drops[0].value) };
        } else if (chest.type === 'resources') {
            const resource = chest.resources[Math.floor(Math.random() * chest.resources.length)];
            const count = 4 + Math.floor(Math.random() * 61);
            result = { type: 'resource', name: resource, count };
        }

        this.showRoulette(chest, result);
    },

    showRoulette(chest, result) {
        const overlay = document.getElementById('chest-spin-overlay');
        const rouletteContainer = document.getElementById('chest-roulette');
        const resultEl = document.getElementById('chest-result');
        if (!overlay) return;

        let items = [];
        if (chest.type === 'coins') {
            items = chest.drops.map(d => ({ label: d.label + ' 💰', value: d.value }));
        } else {
            items = chest.resources.map(r => ({ label: r, value: r }));
        }

        const winLabel = chest.type === 'coins'
            ? result.value.toLocaleString() + ' 💰'
            : result.count + ' ' + result.name;

        const winIdx = items.findIndex(it =>
            (chest.type === 'coins' && it.value === result.value) ||
            (chest.type === 'resources' && it.label === result.name)
        );
        const stopIdx = winIdx >= 0 ? winIdx : 0;

        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '9999';
        overlay.style.background = 'rgba(0,0,0,0.92)';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.gap = '20px';

        if (rouletteContainer) {
            const itemWidth = 120;
            const spinList = [];
            for (let i = 0; i < 40; i++) spinList.push(items[i % items.length]);
            const targetIdx = 28 + stopIdx;
            rouletteContainer.innerHTML = `
                <div style="font-size:1.1rem;color:var(--gray);margin-bottom:8px;">🎰 Прокрутка...</div>
                <div style="position:relative;width:360px;max-width:92vw;overflow:hidden;border:1px solid rgba(255,255,255,0.12);border-radius:12px;background:rgba(0,0,0,0.35);">
                    <div style="position:absolute;left:50%;top:0;bottom:0;width:3px;background:linear-gradient(180deg,transparent,var(--accent),transparent);z-index:2;"></div>
                    <div id="chest-reel-track" style="display:flex;gap:8px;padding:12px;will-change:transform;">
                        ${spinList.map((it) => `<div class="chest-roulette-item" style="min-width:${itemWidth}px;text-align:center;padding:10px;border:1px solid rgba(255,255,255,0.15);border-radius:8px;background:rgba(255,255,255,0.06);">${it.label}</div>`).join('')}
                    </div>
                </div>
            `;
            const track = document.getElementById('chest-reel-track');
            const offset = targetIdx * (itemWidth + 8) - 160;
            const spinDuration = 5000 + Math.floor(Math.random() * 2001);
            requestAnimationFrame(() => {
                track.style.transition = `transform ${spinDuration}ms cubic-bezier(0.08, 0.72, 0.2, 1)`;
                track.style.transform = `translateX(-${offset}px)`;
            });
            setTimeout(() => {
                const all = rouletteContainer.querySelectorAll('.chest-roulette-item');
                const winEl = all[targetIdx];
                if (winEl) {
                    winEl.style.borderColor = 'var(--accent)';
                    winEl.style.boxShadow = '0 0 14px rgba(255,170,0,0.65)';
                    winEl.style.background = 'rgba(255,170,0,0.25)';
                }
            }, spinDuration - 250);
        }

        if (resultEl) resultEl.style.display = 'none';

        const endDelay = 7600;
        setTimeout(() => {

            if (chest.type === 'coins') {
                game.state.coins += result.value;
                game.msg(`🎉 Вы получили ${result.value.toLocaleString()} 💰!`);
            } else {
                if (typeof game.addMaterial === 'function') {
                    game.addMaterial(result.name, 'material', result.count);
                }
                game.msg(`🎉 Вы получили ${result.count} ${result.name}!`);
            }

            if (rouletteContainer) {
                rouletteContainer.innerHTML = `
                    <div style="font-size:1rem;color:var(--green);margin-bottom:12px;">✅ Результат</div>
                    <div style="font-size:1.8rem;font-weight:800;color:var(--accent);text-align:center;padding:20px;">
                        +${winLabel}
                    </div>
                `;
            }
            resultEl.style.display = 'none';

            this.isSpinning = false;
            if (typeof game.updateUI === 'function') game.updateUI();

            setTimeout(() => {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.style.transition = '';
                    overlay.style.opacity = '1';
                    this.render();
                }, 400);
            }, 2000);
        }, endDelay);
    },

    render() {
        const container = document.getElementById('chest-content');
        if (!container) return;

        const coins = Math.floor(game.state.coins || 0);

        let html = `
            <div style="text-align:center;margin-bottom:20px;">
                <div style="font-size:1.5rem;color:var(--accent);font-weight:700;">💰 ${coins.toLocaleString()}</div>
                <div style="font-size:0.8rem;color:var(--gray);">Ваш баланс</div>
            </div>
            <div class="chest-carousel">
        `;

        CHESTS.forEach((chest, i) => {
            const isSelected = this.selectedChest?.id === chest.id;
            const cardStyle = isSelected
                ? 'border-color:var(--accent);box-shadow:0 0 24px rgba(255,170,0,0.25);transform:scale(1.02);'
                : '';

            html += `
                <div class="chest-card ${isSelected ? 'selected' : ''}" style="${cardStyle}"
                     onclick="OpenChest.selectChest(CHESTS[${i}])">
                    <div class="chest-card-icon">${chest.icon}</div>
                    <div class="chest-card-name">${chest.name}</div>
                    ${chest.comingSoon
                        ? '<div class="chest-soon">СКОРО</div>'
                        : `<div class="chest-card-cost">${chest.costLabel} 💰</div>
                           <div class="chest-card-desc">${chest.desc}</div>`}
                </div>
            `;
        });

        html += '</div>';

        if (this.selectedChest && !this.selectedChest.comingSoon) {
            const c = this.selectedChest;
            const canAfford = coins >= c.cost;
            html += `
                <div class="card" style="margin-top:20px;border:1px solid rgba(255,170,0,0.3);padding:16px;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <div style="font-size:2rem;">${c.icon}</div>
                        <div>
                            <div style="font-weight:700;font-size:1.1rem;">${c.name}</div>
                            <div style="color:var(--gray);font-size:0.85rem;">${c.desc}</div>
                        </div>
                    </div>
                    ${c.type === 'coins' ? `
                        <div style="font-size:0.8rem;color:var(--gray);margin-bottom:8px;">Шансы:</div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
                            ${c.drops.map(d => `
                                <span style="background:rgba(255,170,0,0.15);padding:4px 8px;border-radius:6px;font-size:0.75rem;">
                                    ${d.label} (~${d.chance}%)
                                </span>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="font-size:0.8rem;color:var(--gray);margin-bottom:8px;">Ресурсы (равный шанс):</div>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
                            ${c.resources.map(r => `
                                <span style="background:rgba(85,255,85,0.15);padding:4px 8px;border-radius:6px;font-size:0.75rem;">
                                    ${r}
                                </span>
                            `).join('')}
                        </div>
                    `}
                    <button class="cooldown-btn" style="width:100%;padding:14px;font-size:1.1rem;"
                            ${!canAfford || this.isSpinning ? 'disabled' : ''}
                            onclick="OpenChest.rollChest(OpenChest.selectedChest)">
                        ${this.isSpinning ? '⏳ Рулетка...' : `🎲 КРУТИТЬ (${c.costLabel} 💰)`}
                    </button>
                </div>
            `;
        }

        container.innerHTML = html;
    }
};

Object.assign(game, {
    openChestMenu() {
        if (typeof OpenChest !== 'undefined' && OpenChest.openMenu) {
            OpenChest.openMenu();
        }
    }
});
