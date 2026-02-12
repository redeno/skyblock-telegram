// mayor.js — Система мэров с ротацией каждые 4 часа

const MAYORS = {
    dodoll: {
        id: 'dodoll',
        name: 'DoDoll',
        icon: '🌸',
        color: '#ff9900',
        desc: [
            'Активен питомец Зайчик (опыт в ремеслах +5%)',
            'Улучшение питомца за монеты:',
            '  Обычный → Редкий: 100,000',
            '  Редкий → Эпический: 250,000',
            '  Эпический → Легендарный: 350,000',
            'Пропадает когда DoDoll уходит',
            '+500,000 монет при появлении мэра',
            'Автосбор миньонов каждые 10 минут'
        ],
        onActivate(game) {
            game.state.coins += 500000;
            game.msg('Мэр DoDoll даёт +500,000 монет!');
            const existingMayorPet = game.state.pets.find(p => p.mayorPet === true);
            if (!existingMayorPet) {
                game.state.pets.push({
                    name: 'Зайчик',
                    type: 'pet',
                    skill: 'all',
                    rarity: 'common',
                    lvl: 1,
                    xp: 0,
                    next: 100,
                    cost: 0,
                    equipped: true,
                    mayorPet: true
                });
                game.msg('Зайчик появился! (+5% опыта в ремёслах)');
            }
        },
        onDeactivate(game) {
            game.state.pets = game.state.pets.filter(p => !p.mayorPet);
            game.msg('Зайчик ушёл вместе с DoDoll...');
        },
        getBonuses() {
            return {
                craft_xp_bonus: 5,
                auto_collect_minions: true,
                pet_upgrade_discount: {
                    rare: 100000,
                    epic: 250000,
                    legendary: 350000
                }
            };
        }
    },
    waifu625: {
        id: 'waifu625',
        name: 'Waifu625',
        icon: '🎪',
        color: '#ff69b4',
        desc: [
            'Увеличение опыта с данжей на 25%',
            'Увеличивает урон в данжах на 10%',
            'Уменьшает ХП мобов в данжах на 5%'
        ],
        onActivate(game) {
            game.msg('Мэр Waifu625 усиливает данжи!');
        },
        onDeactivate(game) {
            game.msg('Waifu625 покидает пост мэра...');
        },
        getBonuses() {
            return {
                dungeon_xp_bonus: 25,
                dungeon_dmg_bonus: 10,
                dungeon_mob_hp_reduction: 5
            };
        }
    },
    necronchik: {
        id: 'necronchik',
        name: 'Necronchik',
        icon: '💀',
        color: '#9b59b6',
        desc: [
            'Увеличивает удачу игроков на 30 единиц',
            'Увеличивает доп. золото на 10%',
            'Стоимость всех предметов в магазине дешевле на 10%'
        ],
        onActivate(game) {
            game.msg('Мэр Necronchik даёт удачу и скидки!');
        },
        onDeactivate(game) {
            game.msg('Necronchik покидает пост мэра...');
        },
        getBonuses() {
            return {
                mf_bonus: 30,
                gold_bonus: 10,
                shop_discount: 10
            };
        }
    }
};

const MAYOR_ROTATION_MS = 4 * 60 * 60 * 1000;

Object.assign(game, {
    mayorAutoCollectInterval: null,

    initMayor() {
        if (!this.state.mayor) {
            this.state.mayor = { ...defaultState.mayor };
        }
        this.checkMayorRotation();
        this.startMayorTimers();
        this.updateMayorBuffDisplay();
    },

    startMayorTimers() {
        if (this.mayorAutoCollectInterval) clearInterval(this.mayorAutoCollectInterval);
        this.mayorAutoCollectInterval = setInterval(() => {
            this.checkMayorRotation();
            const bonuses = this.getMayorBonuses();
            if (bonuses.auto_collect_minions) {
                this.autoCollectAllMinions();
            }
        }, 60000); // Сбор каждую минуту
    },

    checkMayorRotation() {
        if (!this.state.mayor) return;
        const now = Date.now();
        const elapsed = now - (this.state.mayor.lastSwitch || 0);

        if (elapsed >= MAYOR_ROTATION_MS) {
            const rotation = this.state.mayor.rotation || ['dodoll', 'waifu625', 'necronchik'];
            const currentIdx = rotation.indexOf(this.state.mayor.current);
            const oldMayor = this.state.mayor.current;
            const nextIdx = (currentIdx + 1) % rotation.length;
            const newMayor = rotation[nextIdx];

            const oldMayorData = MAYORS[oldMayor];
            if (oldMayorData && oldMayorData.onDeactivate) {
                oldMayorData.onDeactivate(this);
            }

            this.state.mayor.current = newMayor;
            this.state.mayor.lastSwitch = now;

            const newMayorData = MAYORS[newMayor];
            if (newMayorData && newMayorData.onActivate) {
                newMayorData.onActivate(this);
            }
            
            this.updateMayorBuffDisplay();
        }
    },

    getMayorBonuses() {
        const mayorId = this.state.mayor?.current;
        if (!mayorId || !MAYORS[mayorId]) return {};
        return MAYORS[mayorId].getBonuses();
    },

    getCurrentMayor() {
        const id = this.state.mayor?.current;
        if (!id) return MAYORS.dodoll;
        return MAYORS[id] || MAYORS.dodoll;
    },

    updateMayorBuffDisplay() {
        const buffContainer = document.getElementById('active-buffs');
        if (!buffContainer) return;
        
        const mayorId = this.state.mayor?.current;
        const mayorData = MAYORS[mayorId];
        
        buffContainer.innerHTML = '';
        
        if (mayorData) {
            const bonuses = mayorData.getBonuses();
            const timeLeft = this.getMayorTimeLeft();
            const hours = Math.floor(timeLeft / 3600000);
            const mins = Math.floor((timeLeft % 3600000) / 60000);
            
            let bonusText = [];
            if (bonuses.craft_xp_bonus) bonusText.push(`+${bonuses.craft_xp_bonus}% ремесло`);
            if (bonuses.auto_collect_minions) bonusText.push('авто-сбор');
            if (bonuses.dungeon_xp_bonus) bonusText.push(`+${bonuses.dungeon_xp_bonus}% данж XP`);
            if (bonuses.dungeon_dmg_bonus) bonusText.push(`+${bonuses.dungeon_dmg_bonus}% данж урон`);
            if (bonuses.mf_bonus) bonusText.push(`+${bonuses.mf_bonus} удача`);
            if (bonuses.shop_discount) bonusText.push(`-${bonuses.shop_discount}% магазин`);
            if (bonuses.gold_bonus) bonusText.push(`+${bonuses.gold_bonus}% золото`);
            
            const div = document.createElement('div');
            div.className = 'buff-item mayor-buff';
            div.style.cssText = `display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;border:1px solid ${mayorData.color};background:rgba(0,0,0,0.3);cursor:pointer;`;
            div.onclick = () => game.openMayorMenu();
            div.innerHTML = `
                <span style="font-size:1.2rem;">${mayorData.icon}</span>
                <div style="line-height:1.2;">
                    <div style="font-size:0.75rem;font-weight:bold;color:${mayorData.color};">${mayorData.name}</div>
                    <div style="font-size:0.6rem;color:var(--green);">${bonusText.join(' | ')}</div>
                    <div style="font-size:0.55rem;color:var(--gray);">${hours}ч ${mins}м</div>
                </div>
            `;
            buffContainer.appendChild(div);
        }
    },

    getMayorTimeLeft() {
        if (!this.state.mayor) return 0;
        const elapsed = Date.now() - (this.state.mayor.lastSwitch || 0);
        return Math.max(0, MAYOR_ROTATION_MS - elapsed);
    },

    autoCollectAllMinions() {
        let totalCollected = 0;
        this.state.minions.forEach(m => {
            if (m.lvl > 0 && m.stored > 0) {
                const count = Math.floor(m.stored);
                if (count > 0) {
                    this.addMaterial(m.resource, 'material', count);
                    m.stored -= count;
                    totalCollected += count;
                }
            }
        });
        if (totalCollected > 0) {
            this.msg(`Автосбор DoDoll: собрано ${totalCollected} ресурсов!`);
        }
    },

    upgradeMayorPet(targetRarity) {
        const pet = this.state.pets.find(p => p.mayorPet === true);
        if (!pet) {
            this.msg('Зайчик не найден!');
            return;
        }

        const currentMayor = this.state.mayor?.current;
        if (currentMayor !== 'dodoll') {
            this.msg('Улучшение доступно только при мэре DoDoll!');
            return;
        }

        const upgradePath = { common: 'rare', rare: 'epic', epic: 'legendary' };
        const expectedTarget = upgradePath[pet.rarity];
        if (!expectedTarget || expectedTarget !== targetRarity) {
            this.msg('Невозможно улучшить!');
            return;
        }

        const costs = { rare: 100000, epic: 250000, legendary: 350000 };
        const cost = costs[targetRarity];
        if (!cost) return;

        if (this.state.coins < cost) {
            this.msg(`Не хватает монет! Нужно ${cost.toLocaleString()}`);
            return;
        }

        this.state.coins -= cost;
        pet.rarity = targetRarity;
        this.msg(`Зайчик улучшен до ${targetRarity.toUpperCase()}!`);
        this.renderMayorContent();
        this.updateUI();
    },

    openMayorMenu() {
        this.checkMayorRotation();
        this.renderMayorContent();
        this.showModal('mayorModal');
    },

    renderMayorContent() {
        const content = document.getElementById('mayor-content');
        if (!content) return;

        const current = this.getCurrentMayor();
        const rotation = this.state.mayor?.rotation || ['dodoll', 'waifu625', 'necronchik'];
        const currentIdx = rotation.indexOf(current.id);
        const timeLeft = this.getMayorTimeLeft();
        const hours = Math.floor(timeLeft / 3600000);
        const mins = Math.floor((timeLeft % 3600000) / 60000);

        const prevIdx = (currentIdx - 1 + rotation.length) % rotation.length;
        const nextIdx = (currentIdx + 1) % rotation.length;
        const prevMayor = MAYORS[rotation[prevIdx]];
        const nextMayor = MAYORS[rotation[nextIdx]];

        let html = `
            <h3 style="text-align:center; margin-top:0;">🗳️ МЭР ГОРОДА</h3>
            <div style="text-align:center; margin-bottom:15px;">
                <small style="color:var(--gray);">Смена мэра через: <b style="color:var(--accent);">${hours}ч ${mins}м</b></small>
            </div>

            <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:20px;">
                <div style="text-align:center; opacity:0.4; flex:1;">
                    <div style="font-size:1.5rem;">${prevMayor.icon}</div>
                    <small style="color:var(--gray);">${prevMayor.name}</small>
                </div>

                <div style="text-align:center; flex:2; border:2px solid ${current.color}; border-radius:12px; padding:15px; background:rgba(255,255,255,0.03);">
                    <div style="font-size:2.5rem; margin-bottom:5px;">${current.icon}</div>
                    <b style="font-size:1.2rem; color:${current.color};">${current.name}</b>
                    <div style="margin-top:3px;"><small style="color:var(--green);">АКТИВНЫЙ МЭР</small></div>
                </div>

                <div style="text-align:center; opacity:0.4; flex:1;">
                    <div style="font-size:1.5rem;">${nextMayor.icon}</div>
                    <small style="color:var(--gray);">${nextMayor.name}</small>
                    <div><small style="color:var(--accent); font-size:0.6rem;">СЛЕДУЮЩИЙ</small></div>
                </div>
            </div>

            <div class="card" style="border-left:3px solid ${current.color};">
                <b style="color:${current.color};">Бонусы ${current.name}:</b>
                <ul style="margin:8px 0 0 0; padding-left:20px; list-style:none;">
        `;

        current.desc.forEach(line => {
            html += `<li style="margin-bottom:4px; color:var(--green); font-size:0.85rem;">${line}</li>`;
        });

        html += `</ul></div>`;

        if (current.id === 'dodoll') {
            const mayorPet = this.state.pets.find(p => p.mayorPet === true);
            if (mayorPet) {
                const rarityColors = { common: '#aaa', rare: '#55f', epic: '#a0a', legendary: '#fa0' };
                const rarityNames = { common: 'Обычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный' };
                const upgradePath = { common: 'rare', rare: 'epic', epic: 'legendary' };
                const nextRarity = upgradePath[mayorPet.rarity];
                const costs = { rare: 100000, epic: 250000, legendary: 350000 };

                html += `
                    <div class="card" style="margin-top:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <b>Зайчик</b>
                            <span style="color:${rarityColors[mayorPet.rarity]}; font-weight:bold;">${rarityNames[mayorPet.rarity]}</span>
                        </div>
                        <small style="color:var(--green);">+5% опыта в ремёслах</small>
                `;

                if (nextRarity) {
                    html += `
                        <div class="item-actions" style="margin-top:10px;">
                            <button class="act-btn" onclick="game.upgradeMayorPet('${nextRarity}')">
                                УЛУЧШИТЬ до ${rarityNames[nextRarity]} (${costs[nextRarity].toLocaleString()} монет)
                            </button>
                        </div>
                    `;
                } else {
                    html += `<div style="margin-top:8px;"><small style="color:var(--accent);">МАКС УРОВЕНЬ</small></div>`;
                }

                html += `</div>`;
            }
        }

        html += `
            <div style="margin-top:15px;">
                <h4 style="color:var(--gray); margin-bottom:10px;">Все мэры:</h4>
        `;

        for (const [key, mayor] of Object.entries(MAYORS)) {
            const isActive = key === current.id;
            html += `
                <div class="card" style="margin-bottom:8px; ${isActive ? 'border:1px solid ' + mayor.color : 'opacity:0.6'}">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                        <span style="font-size:1.3rem;">${mayor.icon}</span>
                        <b style="color:${mayor.color};">${mayor.name}</b>
                        ${isActive ? '<span style="color:var(--green); font-size:0.7rem; margin-left:auto;">АКТИВЕН</span>' : ''}
                    </div>
                    <ul style="margin:0; padding-left:18px; list-style:none;">
            `;
            mayor.desc.forEach(line => {
                html += `<li style="font-size:0.75rem; color:var(--gray); margin-bottom:2px;">${line}</li>`;
            });
            html += `</ul></div>`;
        }

        html += `</div>`;

        content.innerHTML = html;
    }
});
