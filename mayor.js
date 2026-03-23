// mayor.js — ГЛОБАЛЬНАЯ система мэров через Supabase (4 часа ротация)

const MAYORS = {
    diana: {
        id: 'diana',
        name: 'Diana',
        icon: '🦅',
        color: '#fbbf24',
        desc: ['🌍 +35% Pet XP', '🌍 +20 MF', '🌍 Открывает Ритуал (Mythological)'],
        getBonuses() {
            return { pet_xp_bonus: 35, mf_bonus: 20, diana_event: true };
        }
    },
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
            'Автосбор миньонов каждый час'
        ],
        onActivate(game) {
            game.state.coins += 500000;
            game.msg('🌍 Мэр DoDoll даёт +500,000 монет!');
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
                game.msg('🌍 Зайчик появился! (+5% опыта в ремёслах)');
            }
        },
        getBonuses() {
            return {
                craft_xp_bonus: 5,
                auto_collect_minions: true,
                pet_upgrade_discount: { rare: 100000, epic: 250000, legendary: 350000 }
            };
        }
    },
    waifu625: {
        id: 'waifu625',
        name: 'Waifu625',
        icon: '🎪',
        color: '#ff69b4',
        desc: ['🌍 +25% опыта с данжей', '🌍 +10% урона в данжах', '🌍 -5% ХП мобов в данжах'],
        getBonuses() {
            return { dungeon_xp_bonus: 25, dungeon_dmg_bonus: 10, dungeon_mob_hp_reduction: 5 };
        }
    },
    necronchik: {
        id: 'necronchik',
        name: 'Necronchik',
        icon: '💀',
        color: '#9b59b6',
        desc: ['🌍 +30 удачи', '🌍 +10% доп. золота', '🌍 -10% стоимость магазина'],
        getBonuses() {
            return { mf_bonus: 30, gold_bonus: 10, shop_discount: 10 };
        }
    }
};

const MAYOR_ROTATION_MS = 4 * 60 * 60 * 1000; // 4 часа

Object.assign(game, {
    globalMayor: null,
    globalMayorLastSync: 0,
    mayorSyncInterval: null,
    mayorAutoCollectInterval: null,

    // 🔥 ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ ГЛОБАЛЬНЫХ МЭРОВ
    async initMayor() {
        await this.syncGlobalMayor();
        this.startMayorTimers();
        this.updateMayorBuffDisplay();
    },

    // ✅ ИСПРАВЛЕНО: supabaseClient вместо supabase
    async syncGlobalMayor() {
        try {
            if (typeof supabaseClient === 'undefined') {
                console.error('supabaseClient не найден!');
                return;
            }

            const { data, error } = await supabaseClient
                .from('global_events')
                .select('*')
                .eq('event_type', 'mayor')
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Ошибка глобального мэра:', error);
                return;
            }

            if (data) {
                this.globalMayor = data;

                // Проверяем что все мэры есть в ротации (вдруг добавили нового мэра)
                const expectedIds = Object.keys(MAYORS);
                const storedRotation = data.rotation_order || [];
                const missing = expectedIds.filter(id => !storedRotation.includes(id));
                if (missing.length > 0) {
                    console.log('Ротация не включает:', missing, '-- обновляю...');
                    await this.fixMayorRotation(expectedIds);
                    return;
                }

                this.checkGlobalMayorRotation();
                this.globalMayorLastSync = Date.now();
                console.log('🌍 Глобальный мэр:', data.current_mayor);
            } else {
                await this.createFirstGlobalMayor();
            }
            this.updateMayorBuffDisplay();
            this.updateNavIcons();
        } catch (error) {
            console.error('syncGlobalMayor:', error);
        }
    },

    // ✅ ИСПРАВЛЕНО: supabaseClient
    async createFirstGlobalMayor() {
        try {
            const { error } = await supabaseClient
                .from('global_events')
                .insert([{
                    event_type: 'mayor',
                    current_mayor: 'dodoll',
                    rotation_order: ['dodoll', 'diana', 'waifu625', 'necronchik'],
                    last_switch: new Date().toISOString()
                }]);

            if (!error) {
                console.log('🌍 Создан первый глобальный мэр DoDoll');
                await this.syncGlobalMayor();
            }
        } catch (error) {
            console.error('createFirstGlobalMayor:', error);
        }
    },

    // Обновляем rotation_order в Supabase если там не хватает мэров
    async fixMayorRotation(newRotation) {
        try {
            const { error } = await supabaseClient
                .from('global_events')
                .update({ rotation_order: newRotation })
                .eq('event_type', 'mayor');
            if (!error) {
                console.log('Ротация мэров обновлена:', newRotation);
                await this.syncGlobalMayor();
            } else {
                console.error('fixMayorRotation error:', error);
            }
        } catch (err) {
            console.error('fixMayorRotation:', err);
        }
    },

    async checkGlobalMayorRotation() {
        if (!this.globalMayor) return;
        const elapsed = Date.now() - new Date(this.globalMayor.last_switch).getTime();
        if (elapsed >= MAYOR_ROTATION_MS) {
            await this.rotateGlobalMayor();
        }
    },

    // ✅ ИСПРАВЛЕНО: supabaseClient
    async rotateGlobalMayor() {
        if (!this.globalMayor) return;

        const rotation = this.globalMayor.rotation_order || ['dodoll', 'diana', 'waifu625', 'necronchik'];
        const currentIdx = rotation.indexOf(this.globalMayor.current_mayor);
        const newMayor = rotation[(currentIdx + 1) % rotation.length];

        try {
            const { error } = await supabaseClient
                .from('global_events')
                .update({
                    current_mayor: newMayor,
                    last_switch: new Date().toISOString()
                })
                .eq('event_type', 'mayor')
                .eq('id', this.globalMayor.id);

            if (!error) {
                this.msg(`🌍 Новый мэр: ${MAYORS[newMayor].name}!`);
                await this.syncGlobalMayor();
            }
        } catch (error) {
            console.error('rotateGlobalMayor:', error);
        }
    },

    updateNavIcons() {
        const nav = document.getElementById('nav');
        if (!nav) return;
        const btns = nav.querySelectorAll('.nav-item');
        const isDoDoll = this.globalMayor?.current_mayor === 'dodoll';
        const iconMap = [
            { emoji: '🏠', img: 'img_home.png', label: 'ДОМ' },
            { emoji: '🌀', img: 'img_portal.png', label: 'ПОРТАЛ' },
            { emoji: '👷', img: 'img_minions.png', label: 'МИНЬОНЫ' },
            { emoji: '🎒', img: 'img_inventory.png', label: 'ИНВЕНТАРЬ' }
        ];
        btns.forEach((btn, idx) => {
            const m = iconMap[idx];
            if (!m) return;
            const span = btn.querySelector('span');
            if (!span) return;
            if (isDoDoll) {
                span.innerHTML = `<img src="${m.img}" style="width:20px;height:20px;vertical-align:middle;">`;
            } else {
                span.textContent = m.emoji;
            }
        });
    },

    startMayorTimers() {
        if (this.mayorSyncInterval) clearInterval(this.mayorSyncInterval);
        if (this.mayorAutoCollectInterval) clearInterval(this.mayorAutoCollectInterval);

        this.mayorSyncInterval = setInterval(() => this.syncGlobalMayor(), 60000);
        this.mayorAutoCollectInterval = setInterval(() => {
            const bonuses = this.getMayorBonuses();
            if (bonuses.auto_collect_minions) {
                this.autoCollectAllMinions();
            }
        }, 3600000);
    },

    getMayorBonuses() {
        if (!this.globalMayor?.current_mayor) return {};
        return MAYORS[this.globalMayor.current_mayor]?.getBonuses?.() || {};
    },

    getCurrentMayor() {
        return MAYORS[this.globalMayor?.current_mayor] || MAYORS.dodoll;
    },

    getMayorTimeLeft() {
        if (!this.globalMayor?.last_switch) return 0;
        const elapsed = Date.now() - new Date(this.globalMayor.last_switch).getTime();
        return Math.max(0, MAYOR_ROTATION_MS - elapsed);
    },

    updateMayorBuffDisplay() {
        const buffContainer = document.getElementById('active-buffs');
        if (!buffContainer || !this.globalMayor) return;

        const mayorData = this.getCurrentMayor();
        const bonuses = mayorData.getBonuses();
        const timeLeft = this.getMayorTimeLeft();
        const hours = Math.floor(timeLeft / 3600000);
        const mins = Math.floor((timeLeft % 3600000) / 60000);

        let bonusText = [];
        if (bonuses.craft_xp_bonus) bonusText.push(`+${bonuses.craft_xp_bonus}% ремесло`);
        if (bonuses.auto_collect_minions) bonusText.push('авто-сбор');
        if (bonuses.dungeon_xp_bonus) bonusText.push(`+${bonuses.dungeon_xp_bonus}% данж XP`);
        if (bonuses.pet_xp_bonus) bonusText.push(`+${bonuses.pet_xp_bonus}% Pet XP`);
        if (bonuses.mf_bonus) bonusText.push(`+${bonuses.mf_bonus} удача`);
        if (bonuses.shop_discount) bonusText.push(`-${bonuses.shop_discount}% магазин`);

        // Удаляем старый буфф мэра
        const oldMayorBuff = buffContainer.querySelector('.global-mayor-buff');
        if (oldMayorBuff) oldMayorBuff.remove();

        const div = document.createElement('div');
        div.className = 'buff-item global-mayor-buff';
        div.style.cssText = `display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:8px;border:2px solid ${mayorData.color};background:rgba(0,0,0,0.4);cursor:pointer;`;
        div.innerHTML = `
            <span style="font-size:1.3rem;">🌍 ${mayorData.icon}</span>
            <div style="line-height:1.2; flex:1;">
                <div style="font-size:0.8rem;font-weight:bold;color:${mayorData.color};">${mayorData.name}</div>
                <div style="font-size:0.65rem;color:var(--green);">${bonusText.join(' | ')}</div>
                <div style="font-size:0.55rem;color:var(--gray);">ГЛОБАЛЬНЫЙ (${hours}ч ${mins}м)</div>
            </div>
        `;
        div.onclick = () => this.openMayorMenu();
        buffContainer.appendChild(div);
    },

    autoCollectAllMinions() {
        let total = 0;
        this.state.minions.forEach(m => {
            if (m.lvl > 0 && m.stored > 0) {
                const count = Math.floor(m.stored);
                if (count > 0) {
                    this.addMaterial(m.resource, 'material', count);
                    m.stored -= count;
                    total += count;
                }
            }
        });
        if (total > 0) this.msg(`🌍 Автосбор: +${total} ресурсов!`);
    },

    upgradeMayorPet(targetRarity) {
        const pet = this.state.pets.find(p => p.mayorPet === true);
        if (!pet || this.globalMayor?.current_mayor !== 'dodoll') {
            this.msg('❌ Зайчик доступен только при DoDoll!');
            return;
        }

        const upgradePath = { common: 'rare', rare: 'epic', epic: 'legendary' };
        if (upgradePath[pet.rarity] !== targetRarity) return;

        const costs = { rare: 100000, epic: 250000, legendary: 350000 };
        const cost = costs[targetRarity];
        if (this.state.coins < cost) {
            this.msg(`❌ Нужно ${cost.toLocaleString()} монет`);
            return;
        }

        this.state.coins -= cost;
        pet.rarity = targetRarity;
        this.msg(`🌍 Зайчик → ${targetRarity.toUpperCase()}!`);
        this.updateUI();
    },

    openMayorMenu() {
        this.syncGlobalMayor();
        this.renderMayorContent();
        this.showModal('mayorModal');
    },

    renderMayorContent() {
        const content = document.getElementById('mayor-content');
        if (!content || !this.globalMayor) return;

        const current = this.getCurrentMayor();
        const rotation = this.globalMayor.rotation_order || ['dodoll', 'diana', 'waifu625', 'necronchik'];
        const currentIdx = rotation.indexOf(this.globalMayor.current_mayor);
        const nextId = rotation[(currentIdx + 1) % rotation.length] || rotation[0];
        const nextMayor = MAYORS[nextId] || MAYORS.dodoll;
        const others = rotation.filter(id => id !== this.globalMayor.current_mayor).map(id => MAYORS[id]).filter(Boolean);
        const timeLeft = this.getMayorTimeLeft();
        const hours = Math.floor(timeLeft / 3600000);
        const mins = Math.floor((timeLeft % 3600000) / 60000);

        content.innerHTML = `
            <h3 style="text-align:center;">🌍 ГЛОБАЛЬНЫЙ МЭР</h3>
            <div style="text-align:center; margin-bottom:15px;">
                <small>Смена через: <b style="color:var(--accent);">${hours}ч ${mins}м</b></small>
            </div>
            <div style="text-align:center; border:2px solid ${current.color}; border-radius:12px; padding:20px; background:rgba(255,255,255,0.05);">
                <div style="font-size:3rem;">${current.icon}</div>
                <b style="font-size:1.4rem; color:${current.color};">${current.name}</b>
                <div style="color:var(--green);">✓ АКТИВЕН ДЛЯ ВСЕХ</div>
            </div>
            <div class="card" style="border-left:3px solid ${current.color}; margin-top:15px;">
                <b style="color:${current.color};">Глобальные бонусы:</b>
                <ul style="margin:8px 0 0 0; padding-left:20px; list-style:none;">
                    ${current.desc.map(line => `<li style="margin-bottom:4px; color:var(--green); font-size:0.9rem;">${line}</li>`).join('')}
                </ul>
            </div>
            <div class="card" style="margin-top:12px;">
                <b>Следующий мэр:</b> <span style="color:${nextMayor.color}">${nextMayor.icon} ${nextMayor.name}</span>
            </div>
            <div class="card" style="margin-top:10px;">
                <b>Остальные мэры и баффы:</b>
                ${others.map(m => `<div style="margin-top:8px;border-left:3px solid ${m.color};padding-left:8px;">
                    <b style="color:${m.color}">${m.icon} ${m.name}</b>
                    <div style="font-size:0.85rem;color:var(--green);">${(m.desc || []).join(' | ')}</div>
                </div>`).join('')}
            </div>
            ${current.id === 'dodoll' ? this.renderMayorPetUI() : ''}
            <div style="margin-top:15px; padding:10px; background:rgba(0,255,0,0.1); border-radius:8px; text-align:center;">
                <small style="color:var(--accent);">⏰ Синхронизация каждые 60 сек</small><br>
                <small style="color:var(--gray);">🌍 ОДИНАКОВЫЙ ДЛЯ ВСЕХ ИГРОКОВ</small>
            </div>
        `;
    },

    renderMayorPetUI() {
        const pet = this.state.pets.find(p => p.mayorPet);
        if (!pet) return '';

        const rarityNames = { common: 'Обычный', rare: 'Редкий', epic: 'Эпический', legendary: 'Легендарный' };
        const upgradePath = { common: 'rare', rare: 'epic', epic: 'legendary' };
        const nextRarity = upgradePath[pet.rarity];
        const costs = { rare: 100000, epic: 250000, legendary: 350000 };

        let html = `
            <div class="card" style="margin-top:10px;">
                <div style="display:flex; justify-content:space-between;">
                    <b>🐰 Зайчик</b>
                    <span style="color:#fa0; font-weight:bold;">${rarityNames[pet.rarity]}</span>
                </div>
                <small style="color:var(--green);">+5% опыта в ремёслах</small>
        `;

        if (nextRarity) {
            html += `
                <div class="item-actions" style="margin-top:10px;">
                    <button class="act-btn" onclick="game.upgradeMayorPet('${nextRarity}')">
                        УЛУЧШИТЬ → ${rarityNames[nextRarity]} (${costs[nextRarity].toLocaleString()})
                    </button>
                </div>
            `;
        } else {
            html += `<div style="margin-top:8px;"><small style="color:var(--accent);">🏆 МАКС УРОВЕНЬ</small></div>`;
        }
        html += `</div>`;
        return html;
    }
});
