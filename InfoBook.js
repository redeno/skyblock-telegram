window.INFO_ITEMS = window.INFO_ITEMS || {};
window.INFO_ITEM_BY_NAME = window.INFO_ITEM_BY_NAME || {};
window.INFO_DUNGEONS = window.INFO_DUNGEONS || {};
window.INFO_SLAYERS = window.INFO_SLAYERS || {};

function registerInfoItem(id, base) {
    if (!id || !base) return;
    base.id = id;
    window.INFO_ITEMS[id] = base;
    if (base.name) {
        window.INFO_ITEM_BY_NAME[base.name] = id;
    }
}

function initInfoData() {
    // Магазинные предметы
    if (window.shopItems) {
        const regShopGroup = (prefix, arr, shopCategory) => {
            if (!arr) return;
            arr.forEach((it, idx) => {
                const id = `${prefix}_${idx}`;
                it.infoId = id;
                const src = { source: 'shop', shopCategory, cost: it.cost || 0 };
                registerInfoItem(id, Object.assign({ typeGroup: shopCategory, sources: [src] }, it));
            });
        };
        regShopGroup('weapon', shopItems.weapon, 'weapon');
        regShopGroup('zombie_weapon', shopItems.zombie_weapon, 'zombie_weapon');
        regShopGroup('armor', shopItems.armor, 'armor');
        regShopGroup('zombie_armor', shopItems.zombie_armor, 'zombie_armor');
        regShopGroup('mining_armor', shopItems.mining_armor, 'mining_armor');
        regShopGroup('farming_armor', shopItems.farming_armor, 'farming_armor');
        regShopGroup('fishing_armor', shopItems.fishing_armor, 'fishing_armor');
        regShopGroup('foraging_armor', shopItems.foraging_armor, 'foraging_armor');
        regShopGroup('mining_tool', shopItems.mining_tool, 'mining_tool');
        regShopGroup('farming_tool', shopItems.farming_tool, 'farming_tool');
        regShopGroup('foraging_tool', shopItems.foraging_tool, 'foraging_tool');
        regShopGroup('fishing_tool', shopItems.fishing_tool, 'fishing_tool');
        if (shopItems.accessory) {
            shopItems.accessory.forEach((it, idx) => {
                const id = `accessory_${idx}`;
                it.infoId = id;
                const src = { source: 'shop', shopCategory: 'accessory', cost: it.cost || 0 };
                registerInfoItem(id, Object.assign({ typeGroup: 'accessory', sources: [src] }, it));
            });
        }
    }

    // Дроп из данжей
    if (window.dungeonRewards) {
        Object.entries(dungeonRewards).forEach(([floorStr, r]) => {
            const floor = parseInt(floorStr, 10);
            if (!r.drops) return;
            r.drops.forEach(drop => {
                const baseChance = drop.chance || 0;
                if (drop.item) {
                    const it = drop.item;
                    const name = it.name;
                    let id = window.INFO_ITEM_BY_NAME[name];
                    if (!id) {
                        id = `dungeon_item_${floor}_${name}`;
                        registerInfoItem(id, Object.assign({ sources: [] }, it));
                    }
                    const item = window.INFO_ITEMS[id];
                    item.sources = item.sources || [];
                    item.sources.push({ source: 'dungeon', floor, baseChance });
                } else if (drop.items) {
                    drop.items.forEach(it => {
                        const name = it.name;
                        let id = window.INFO_ITEM_BY_NAME[name];
                        if (!id) {
                            id = `dungeon_item_${floor}_${name}`;
                            registerInfoItem(id, Object.assign({ sources: [] }, it));
                        }
                        const item = window.INFO_ITEMS[id];
                        item.sources = item.sources || [];
                        item.sources.push({ source: 'dungeon', floor, baseChance });
                    });
                }
            });
        });
    }

    // Слейер-специфичные предметы и мобы
    if (window.slayerConfig && slayerConfig.zombie) {
        const zConf = slayerConfig.zombie;
        window.INFO_SLAYERS.zombie = {
            name: 'Zombie Slayer',
            bosses: zConf.bosses.map((b, idx) => Object.assign({ tier: idx + 1 }, b)),
            mobsByTier: zConf.tierMobs || {}
        };

        // Zombie Ring
        const zrName = 'Zombie Ring';
        let zrId = window.INFO_ITEM_BY_NAME[zrName];
        if (!zrId) {
            zrId = 'zombie_ring';
            registerInfoItem(zrId, {
                name: zrName,
                type: 'accessory',
                mf: 0,
                str: 0,
                rarity: 'rare',
                sources: []
            });
        }
        const zr = window.INFO_ITEMS[zrId];
        zr.sources = zr.sources || [];
        zr.sources.push({ source: 'slayer', slayerType: 'zombie', note: 'Награда за убийство босса', chance: 0.1 });

        // Питомец Гуль
        const ghoulName = 'Гуль';
        let ghId = window.INFO_ITEM_BY_NAME[ghoulName];
        if (!ghId) {
            ghId = 'pet_ghoul';
            registerInfoItem(ghId, {
                name: ghoulName,
                type: 'pet',
                skill: 'combat',
                rarity: 'common',
                sources: [{ source: 'slayer', slayerType: 'zombie', tier: 4, note: 'Очень редкий дроп с босса', chance: 0.01 }]
            });
        }

        // Плоть зомби
        const fleshName = 'Плоть зомби';
        let fleshId = window.INFO_ITEM_BY_NAME[fleshName];
        if (!fleshId) {
            fleshId = 'material_zombie_flesh';
            registerInfoItem(fleshId, {
                name: fleshName,
                type: 'material',
                sources: []
            });
        }
        const fleshItem = window.INFO_ITEMS[fleshId];
        fleshItem.sources = fleshItem.sources || [];
        fleshItem.sources.push({ source: 'slayer', slayerType: 'zombie', note: 'Гарантированный дроп с босса, количество зависит от тира' });

        // Дропы из Алтаря (Защитник Энда)
        const altarDrops = [
            {
                name: 'Реликвия Алтаря',
                type: 'material',
                rarity: 'legendary',
                cost: 30000000,
                sources: [{ source: 'altar', baseChance: 3, note: 'Шанс увеличивается с Удачей (MF).' }]
            },
            {
                name: 'Древний осколок',
                type: 'material',
                rarity: 'epic',
                cost: 1000000,
                sources: [{ source: 'altar', baseChance: 10, note: 'Шанс увеличивается с Удачей (MF).' }]
            },
            {
                name: 'Обычный осколок',
                type: 'material',
                rarity: 'common',
                cost: 200000,
                sources: [{ source: 'altar', baseChance: 87, note: 'Шанс увеличивается с Удачей (MF).' }]
            },
            {
                name: 'Питомец Голем',
                type: 'pet',
                rarity: 'legendary',
                skill: 'combat',
                def: 50,
                boss_damage_per_lvl: 0.25,
                boss_damage_max: 25,
                cost: 75000000,
                sources: [{ source: 'altar', baseChance: 0.01, note: 'Шанс увеличивается с Удачей (MF).' }]
            },
            {
                name: 'Меч Защитника Энда',
                type: 'weapon',
                rarity: 'legendary',
                str: 200,
                def: 50,
                cost: 100000000,
                sources: [{ source: 'altar', baseChance: 0.01, note: 'Шанс увеличивается с Удачей (MF).' }]
            },
            {
                name: 'Кольцо Защитника Энда',
                type: 'accessory',
                rarity: 'rare',
                def: 10,
                cost: 1000000,
                desc: 'Можно улучшить: талисман (эпик, +20 брони) за 32 Обычных осколка (8M) и артефакт (легендарка, +30 брони) за 1 Реликвию Алтаря + 5 Древних осколков (50M).',
                sources: [{ source: 'altar', baseChance: 0.1, note: 'Шанс увеличивается с Удачей (MF).' }]
            }
        ];

        altarDrops.forEach(item => {
            let id = window.INFO_ITEM_BY_NAME[item.name];
            if (!id) {
                id = `altar_${item.name.toLowerCase().replace(/[^\w]+/g, '_')}`;
                registerInfoItem(id, item);
            }
            const existing = window.INFO_ITEMS[id];
            existing.sources = existing.sources || [];
            item.sources.forEach(src => {
                if (!existing.sources.some(s => s.source === src.source && s.baseChance === src.baseChance)) {
                    existing.sources.push(src);
                }
            });
        });
    }

    // Общая информация по данжам
    if (window.dungeonConfig) {
        Object.entries(dungeonConfig).forEach(([floorStr, cfg]) => {
            const floor = parseInt(floorStr, 10);
            const reward = (window.dungeonRewards && dungeonRewards[floor]) || null;
            const bossName = cfg.mobs[3] || 'Босс';
            let mechanics = '';
            if (floor === 4) mechanics = 'Босс постепенно теряет броню: с каждого удара часть защиты уменьшается.';
            if (floor === 5) mechanics = 'Мобы и босс могут наносить критический урон по игроку.';
            if (floor === 7) mechanics = 'Огонь накапливается стаками, усиливая урон, а босс Иссушитель переходит в усиленную фазу с повышенной бронёй и уроном при низком ХП.';

            const rewards = [];
            if (reward && reward.drops) {
                reward.drops.forEach(drop => {
                    if (drop.item) rewards.push(drop.item.name);
                    if (drop.items) drop.items.forEach(it => rewards.push(it.name));
                });
            }

            window.INFO_DUNGEONS[floor] = {
                floor,
                mobs: cfg.mobs,
                baseHp: cfg.baseHp,
                baseDmg: cfg.baseDmg,
                baseDef: cfg.baseDef || 0,
                bossName,
                bossStats: cfg.bossStats || null,
                mechanics,
                rewards
            };
        });
    }
}


Object.assign(game, {
    showInfoModal(title, html) {
        const modal = document.getElementById('infoModal');
        if (!modal) return;
        const titleEl = document.getElementById('infoModal-title');
        const contentEl = document.getElementById('infoModal-content');
        if (titleEl) titleEl.innerText = title;
        if (contentEl) contentEl.innerHTML = html;
        modal.style.display = 'block';
    },

    closeInfoModal() {
        const modal = document.getElementById('infoModal');
        if (modal) modal.style.display = 'none';
    },

    showInfoItem(id) {
        const items = window.INFO_ITEMS || {};
        const item = items[id];
        if (!item) return;
        const rarity = item.rarity ? getRarityTag(item.rarity) : '';
        const stats = [];
        if (item.str) stats.push(`Сила: +${item.str}`);
        if (item.def) stats.push(`Защита: +${item.def}`);
        if (item.hp) stats.push(`ХП: +${item.hp}`);
        if (item.cc) stats.push(`Крит. шанс: +${item.cc}%`);
        if (item.cd) stats.push(`Крит. урон: +${item.cd}%`);
        if (item.mf) stats.push(`Удача (MF): +${item.mf}`);
        if (item.int) stats.push(`Интеллект: +${item.int}`);
        if (item.mag_amp) stats.push(`Маг. мощь: +${item.mag_amp}`);
        if (item.vitality) stats.push(`Восстановление: +${item.vitality}%`);
        if (item.zombie_bonus) stats.push(`Урон по зомби: +${item.zombie_bonus}%`);
        if (item.boss_damage_per_lvl) {
            const max = item.boss_damage_max != null ? item.boss_damage_max : (item.boss_damage_per_lvl * 100);
            stats.push(`Доп. урон по Защитнику Энда: +${item.boss_damage_per_lvl}%/уровень (до ${max}%).`);
        }
        if (item.dynamic_str === 'midas') stats.push('Сила зависит от количества монет (Меч Мидаса).');

        let econ = '';
        if (item.cost) {
            econ += `Стоимость покупки: ${item.cost.toLocaleString()} 💰<br>`;
        }
        if (item.type === 'material' || item.type === 'accessory') {
            const sellBase = item.cost ? Math.floor(item.cost / 2) : 0;
            if (sellBase > 0) {
                econ += `Ориентировочная цена продажи: ~${sellBase.toLocaleString()} 💰 (может отличаться).<br>`;
            }
        }

        const sources = item.sources || [];
        const srcLines = [];
        sources.forEach(src => {
            if (src.source === 'shop') {
                srcLines.push(`Магазин (${src.shopCategory || 'общий раздел'}), цена ${src.cost.toLocaleString()} 💰.`);
            } else if (src.source === 'dungeon') {
                const ch = src.baseChance != null ? `Шанс выпадения: ${src.baseChance}% + <span style="color:green">MF / 100</span> = общий шанс.` : '';
                srcLines.push(`Данж: Этаж ${src.floor} (сундук этажа). ${ch}`);
            } else if (src.source === 'slayer') {
                const ch = src.chance != null ? `Шанс выпадения: ${src.chance}%.` : '';
                const tierTxt = src.tier ? ` (Tier ${src.tier})` : '';
                srcLines.push(`Слейер: ${src.slayerType}${tierTxt}. ${src.note || ''} ${ch}`);
            } else if (src.source === 'altar') {
                const ch = src.baseChance != null ? `Шанс выпадения: ${src.baseChance}% + <span style="color:green">MF / 100</span> = общий шанс.` : '';
                srcLines.push(`Алтарь (Защитник Энда). ${ch}`);
            } else {
                srcLines.push(src.note || 'Особый источник получения.');
            }
        });

        let html = `<div>`;
        html += `<h4 style="margin-top:0;">${item.name} ${rarity}</h4>`;
        html += `<p><b>Тип:</b> ${item.type || item.typeGroup || 'предмет'}</p>`;
        if (stats.length) {
            html += `<p><b>Статы:</b><br>${stats.join('<br>')}</p>`;
        }
        if (econ) {
            html += `<p><b>Экономика:</b><br>${econ}</p>`;
        }
        if (srcLines.length) {
            html += `<p><b>Где достать:</b><br>${srcLines.join('<br>')}</p>`;
        }
        html += `</div>`;

        this.showInfoModal(item.name, html);
    },

    showMobInfo(id) {
        if (!id) return;
        if (id.startsWith('dungeon_')) {
            const parts = id.split('_'); // dungeon_floor_idx
            const floor = parseInt(parts[1], 10);
            const idx = parseInt(parts[2], 10);
            const cfg = window.dungeonConfig && dungeonConfig[floor];
            if (!cfg) return;
            const info = window.INFO_DUNGEONS && INFO_DUNGEONS[floor];
            const isBoss = idx === 3;
            const name = cfg.mobs[idx] || (isBoss ? (info && info.bossName) : 'Моб');
            const baseHp = isBoss && cfg.bossStats ? cfg.bossStats.hp || cfg.baseHp * (cfg.bossMultiplier || 1) : cfg.baseHp;
            const baseDmg = isBoss && cfg.bossStats && cfg.bossStats.dmg ? cfg.bossStats.dmg : cfg.baseDmg;
            const baseDef = isBoss && cfg.bossStats && cfg.bossStats.def != null ? cfg.bossStats.def : (cfg.baseDef || 0);

            let html = `<div>`;
            html += `<h4 style="margin-top:0;">${name} (Этаж ${floor}${isBoss ? ', БОСС' : ''})</h4>`;
            html += `<p><b>Базовые статы (Катакомбы):</b><br>ХП: ~${baseHp.toLocaleString()}<br>Урон: ~${baseDmg.toLocaleString()}<br>Защита: ~${baseDef}</p>`;
            html += `<p><b>В Мастер Моде:</b><br>ХП и урон примерно x3, защита x2 по сравнению с обычными Катакомбами.</p>`;
            if (info && info.mechanics && isBoss) {
                html += `<p><b>Особенности босса:</b><br>${info.mechanics}</p>`;
            }
            if (info && info.rewards && info.rewards.length) {
                html += `<p><b>Связанные награды этажа:</b><br>${info.rewards.join(', ')}</p>`;
            }
            html += `</div>`;
            this.showInfoModal(name, html);
            return;
        }

        if (id.startsWith('slayer_')) {
            const parts = id.split('_'); // slayer_type_tX_(boss|mob|mobIdx)
            const type = parts[1];
            const tierStr = parts[2] || '';
            const isBoss = parts[3] === 'boss';
            const tier = parseInt(tierStr.replace('t', ''), 10) || 1;
            const conf = window.INFO_SLAYERS && INFO_SLAYERS[type];
            if (!conf) return;

            if (isBoss) {
                const boss = (conf.bosses || []).find(b => b.tier === tier);
                if (!boss) return;
                let html = `<div>`;
                html += `<h4 style="margin-top:0;">${conf.name} БОСС Tier ${tier}</h4>`;
                html += `<p><b>Статы:</b><br>ХП: ${boss.hp.toLocaleString()}<br>Урон: ${boss.dmg.toLocaleString()}<br>Защита: ${boss.def}<br>Маг. резист: ${boss.magicRes || 0}%</p>`;
                if (boss.enrage) {
                    html += `<p><b>Ярость:</b><br>При ХП ≤ ${boss.enrage.hpThreshold * 100}% босс усиливает урон до ${boss.enrage.dmg} и защиту до ${boss.enrage.def}.</p>`;
                }
                html += `<p><b>Награды:</b><br>Плоть зомби (кол-во зависит от тира).<br>Шанс получить Zombie Ring (около 0.1%).<br>На высоких тирах возможен питомец Гуль (очень редкий дроп).</p>`;
                html += `</div>`;
                this.showInfoModal(`${conf.name} Tier ${tier}`, html);
            } else {
                const mobs = (conf.mobsByTier && conf.mobsByTier[tier]) || [];
                const idx = parseInt(parts[3] || '0', 10);
                const mob = mobs[idx] || mobs[0];
                if (!mob) return;
                let html = `<div>`;
                html += `<h4 style="margin-top:0;">${mob.name} (Zombie Slayer Tier ${tier})</h4>`;
                html += `<p><b>Статы:</b><br>ХП: ${mob.hp.toLocaleString()}<br>Урон: ${mob.dmg.toLocaleString()}<br>Защита: ${mob.def}</p>`;
                html += `<p><b>Частота появления:</b> примерно ${mob.chance}% среди обычных мобов тира.</p>`;
                html += `</div>`;
                this.showInfoModal(mob.name, html);
            }
        }
    },

    showInfoSection(section, tabEl) {
        // Ensure info data is initialized after all game data is loaded (shop/dungeon/slayer/etc.)
        if (!window.INFO_BOOK_INITIALIZED) {
            if (typeof initInfoData === 'function') initInfoData();
            window.INFO_BOOK_INITIALIZED = true;
        }

        const container = document.getElementById('info-book-content');
        if (!container) return;
        const tabs = document.querySelectorAll('#info-book .inv-tab');
        tabs.forEach(t => t.classList.remove('active'));
        if (tabEl) tabEl.classList.add('active');

        if (section === 'weapons') {
            this.renderWeaponsInfo(container);
        } else if (section === 'armor') {
            this.renderArmorInfo(container);
        } else if (section === 'tools') {
            this.renderToolsInfo(container);
        } else if (section === 'artifacts') {
            this.renderArtifactsInfo(container);
        } else if (section === 'player_stats') {
            this.renderPlayerStatsInfo(container);
        } else if (section === 'materials') {
            this.renderMaterialsInfo(container);
        } else if (section === 'pets') {
            this.renderPetsInfo(container);
        } else if (section === 'mobs') {
            this.renderMobsInfo(container);
        } else if (section === 'modes') {
            this.renderModesInfo(container);
        }
    },

    renderWeaponsInfo(container) {
        const list = [];
        list.push('<h4>⚔️ Оружие в игре</h4>');
        list.push('<p>Оружие повышает ваш урон в бою. Есть физическое (сила) и магическое (интеллект). Некоторые имеют специальные бонусы.</p>');

        // Магазинное оружие
        const shopWeapons = (window.shopItems && window.shopItems.weapon) || [];
        list.push('<h5>🛒 Магазинное оружие</h5>');
        if (shopWeapons.length) {
            shopWeapons.forEach(it => {
                const icon = it.magic ? '🔮' : '⚔️';
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                const stats = [];
                if (it.str) stats.push(`Урон: +${it.str} (от силы)`);
                if (it.hp) stats.push(`ХП: +${it.hp}`);
                if (it.def) stats.push(`Защита: +${it.def}`);
                if (it.cd) stats.push(`Крит. урон: +${it.cd}%`);
                if (it.cc) stats.push(`Крит. шанс: +${it.cc}%`);
                if (it.dynamic_str === 'midas') {
                    stats.push(`Урон: зависит от ваших монет (Меч Мидаса)`);
                }
                const cost = it.cost ? `Стоимость: ${it.cost.toLocaleString()} 💰` : '';
                list.push(`<div style="margin-bottom:12px; padding:8px; border:1px solid var(--dark-gray); border-radius:6px;">
                    ${icon} <b>${it.name}</b> ${rarity}<br>
                    ${stats.join('<br>')}<br>
                    ${cost}
                </div>`);
            });
        } else {
            list.push('<div style="margin-bottom:12px; color:var(--gray);">Нет доступного магазинного оружия.</div>');
        }

        // Слейерское оружие
        const zombieWeapons = (window.shopItems && window.shopItems.zombie_weapon) || [];
        list.push('<h5>🧟 Оружие Слейера (покупается за плоть)</h5>');
        if (zombieWeapons.length) {
            zombieWeapons.forEach(it => {
                const icon = '🧟';
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                const stats = [];
                if (it.str) stats.push(`Урон: +${it.str} (от силы)`);
                if (it.zombie_bonus) stats.push(`Бонус урона по зомби: +${it.zombie_bonus}%`);
                const cost = it.flesh_cost ? `Стоимость: ${it.flesh_cost} Плоти зомби` : '';
                list.push(`<div style="margin-bottom:12px; padding:8px; border:1px solid var(--dark-gray); border-radius:6px;">
                    ${icon} <b>${it.name}</b> ${rarity}<br>
                    ${stats.join('<br>')}<br>
                    ${cost}
                </div>`);
            });
        } else {
            list.push('<div style="margin-bottom:12px; color:var(--gray);">Нет доступного оружия Слейера.</div>');
        }

        // Оружие, выпадающее из данжей (не из магазина)
        list.push('<h5>💀 Оружие данжей</h5>');
        const dungeonWeapons = Object.values(window.INFO_ITEMS || {}).filter(i => i.type === 'weapon' && (i.sources || []).some(src => src.source === 'dungeon'));
        if (dungeonWeapons.length) {
            dungeonWeapons.forEach(it => {
                const icon = it.dynamic_str === 'midas' || it.name?.toLowerCase().includes('мида') ? '💰' : (it.magic ? '🔮' : '⚔️');
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                const stats = [];
                if (it.str && typeof it.str === 'number') stats.push(`Урон: +${it.str} (от силы)`);
                if (it.dynamic_str === 'midas') stats.push(`Урон: зависит от количества монет (Меч Мидаса)`);
                if (it.cd) stats.push(`Крит. урон: +${it.cd}%`);
                if (it.magic) stats.push('Магическое оружие');

                const sources = (it.sources || []).filter(src => src.source === 'dungeon');
                const srcLines = sources.map(src => {
                    const base = src.baseChance != null ? `шанс ${src.baseChance}% + MF/100` : 'шанс неизвестен';
                    return `Данж: этаж ${src.floor} (сундук) — ${base}`;
                });

                const cost = it.cost ? `Стоимость: ${it.cost.toLocaleString()} 💰` : '';
                list.push(`<div style="margin-bottom:12px; padding:8px; border:1px solid var(--dark-gray); border-radius:6px;">
                    ${icon} <b>${it.name}</b> ${rarity}<br>
                    ${stats.join('<br>')}<br>
                    ${cost}${cost && srcLines.length ? '<br>' : ''}${srcLines.join('<br>')}
                </div>`);
            });
        } else {
            list.push('<div style="margin-bottom:12px; color:var(--gray);">Нет данных об оружии, выпадающем из данжей.</div>');
        }

        // Отдельный блок: оружие из Алтаря
        const altarWeapons = Object.values(window.INFO_ITEMS || {}).filter(i => i.type === 'weapon' && (i.sources || []).some(src => src.source === 'altar'));
        if (altarWeapons.length) {
            list.push('<h5>🕯️ Оружие из Алтаря</h5>');
            altarWeapons.forEach(it => {
                const icon = it.dynamic_str === 'midas' || it.name?.toLowerCase().includes('мида') ? '💰' : (it.magic ? '🔮' : '⚔️');
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                const stats = [];
                if (it.str && typeof it.str === 'number') stats.push(`Урон: +${it.str} (от силы)`);
                if (it.cd) stats.push(`Крит. урон: +${it.cd}%`);
                if (it.magic) stats.push('Магическое оружие');

                const src = (it.sources || []).find(s => s.source === 'altar');
                const srcLine = src ? `Алтарь (Защитник Энда) — шанс ${src.baseChance != null ? src.baseChance : 'неизвестен'}% + MF/100` : 'Источник: Алтарь (Защитник Энда)';
                const cost = it.cost ? `Стоимость: ${it.cost.toLocaleString()} 💰` : '';
                list.push(`<div style="margin-bottom:12px; padding:8px; border:1px solid var(--dark-gray); border-radius:6px;">
                    ${icon} <b>${it.name}</b> ${rarity}<br>
                    ${stats.join('<br>')}<br>
                    ${cost}${cost ? '<br>' : ''}${srcLine}
                </div>`);
            });
        }

        container.innerHTML = list.join('');
    },

    renderArmorInfo(container) {
        const list = [];
        const addGroup = (items, title) => {
            if (!items || !items.length) return;
            list.push(`<h4>${title}</h4>`);
            items.forEach(it => {
                const stats = [];
                if (it.hp) stats.push(`ХП: +${it.hp}`);
                if (it.def) stats.push(`Защита: +${it.def}`);
                if (it.str) stats.push(`Сила: +${it.str}`);
                if (it.cc) stats.push(`Крит. шанс: +${it.cc}%`);
                if (it.cd) stats.push(`Крит. урон: +${it.cd}%`);
                if (it.mag_amp) stats.push(`Маг. мощь: +${it.mag_amp}`);
                if (it.vitality) stats.push(`Виталити: +${it.vitality}`);
                const cost = it.cost ? `Стоимость: ${it.cost.toLocaleString()} 💰` : '';
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                const desc = it.desc ? `<br><i>${it.desc}</i>` : '';
                list.push(`<div style="margin-bottom:8px;"><b>${it.name}</b> ${rarity}<br>${stats.join(' | ')}<br>${cost}${desc}</div>`);
            });
        };
        addGroup(shopItems.armor, 'Броня общая');
        addGroup(shopItems.zombie_armor, 'Броня Слейера');
        addGroup(shopItems.mining_armor, 'Шахтёрская броня');
        addGroup(shopItems.farming_armor, 'Фермерская броня');
        addGroup(shopItems.fishing_armor, 'Рыбацкая броня');
        addGroup(shopItems.foraging_armor, 'Лесная броня');
        container.innerHTML = list.join('');
    },

    renderToolsInfo(container) {
        const list = [];
        const addGroup = (items, title) => {
            if (!items || !items.length) return;
            list.push(`<h4>${title}</h4>`);
            items.forEach(it => {
                const stats = [];
                if (it.mining_fortune) stats.push(`Шахт. фортуна: +${it.mining_fortune}`);
                if (it.farming_fortune) stats.push(`Фермер. фортуна: +${it.farming_fortune}`);
                if (it.foraging_fortune) stats.push(`Лесная фортуна: +${it.foraging_fortune}`);
                if (it.fishing_fortune) stats.push(`Рыбацкая фортуна: +${it.fishing_fortune}`);
                if (it.double_chance) stats.push(`Шанс двойного дропа: +${it.double_chance}%`);
                if (it.triple_chance) stats.push(`Шанс тройного дропа: +${it.triple_chance}%`);
                const cost = it.cost ? `Стоимость: ${it.cost.toLocaleString()} 💰` : '';
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                list.push(`<div style="margin-bottom:8px;"><b>${it.name}</b> ${rarity}<br>${stats.join(' | ')}<br>${cost}</div>`);
            });
        };
        addGroup(shopItems.mining_tool, 'Кирки');
        addGroup(shopItems.farming_tool, 'Мотыги');
        addGroup(shopItems.foraging_tool, 'Топоры');
        addGroup(shopItems.fishing_tool, 'Удочки');
        container.innerHTML = list.join('');
    },

    renderArtifactsInfo(container) {
        const list = [];
        list.push('<h4>🍀 Талисманы и артефакты</h4>');
        list.push('<p>Талисманы дают бонусы к статам. Некоторые покупаются, другие падают из данжей и слейеров.</p>');

        // Магазинные
        const shopAcc = shopItems.accessory || [];
        if (shopAcc.length) {
            list.push('<h5>🛒 Магазинные талисманы</h5>');
            shopAcc.forEach(it => {
                const stats = [];
                if (it.str) stats.push(`Сила: +${it.str}`);
                if (it.def) stats.push(`Защита: +${it.def}`);
                if (it.mf) stats.push(`Удача: +${it.mf}`);
                if (it.cc) stats.push(`Крит. шанс: +${it.cc}%`);
                if (it.cd) stats.push(`Крит. урон: +${it.cd}%`);
                if (it.int) stats.push(`Интеллект: +${it.int}`);
                if (it.gold_bonus) stats.push(`Бонус золота: +${it.gold_bonus}%`);
                if (it.xp_bonus) stats.push(`Бонус опыта: +${it.xp_bonus}%`);
                const cost = it.cost ? `Стоимость: ${it.cost.toLocaleString()} 💰` : '';
                list.push(`<div style="margin-bottom:8px;"><b>${it.name}</b><br>${stats.join(' | ')}<br>${cost}</div>`);
            });
        }

        // Дропающиеся талисманы / артефакты (из данжей, слейеров и специальных источников)
        const allAccessories = Object.values(window.INFO_ITEMS || {}).filter(i => i.type === 'accessory');
        const dropAccessories = allAccessories.filter(i => !(i.sources||[]).some(src => src.source === 'shop'));
        if (dropAccessories.length) {
            list.push('<h5>💀 Дропающиеся талисманы</h5>');
            dropAccessories.forEach(it => {
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                const stats = [];
                if (it.str) stats.push(`Сила: +${it.str}`);
                if (it.def) stats.push(`Защита: +${it.def}`);
                if (it.mf) stats.push(`Удача: +${it.mf}`);
                if (it.cc) stats.push(`Крит. шанс: +${it.cc}%`);
                if (it.cd) stats.push(`Крит. урон: +${it.cd}%`);
                if (it.int) stats.push(`Интеллект: +${it.int}`);
                if (it.gold_bonus) stats.push(`Бонус золота: +${it.gold_bonus}%`);
                if (it.xp_bonus) stats.push(`Бонус опыта: +${it.xp_bonus}%`);

                const srcLines = (it.sources || []).map(src => {
                    if (src.source === 'dungeon') {
                        return `Данж: этаж ${src.floor} (шанс ${src.baseChance}% + MF/100)`;
                    } else if (src.source === 'slayer') {
                        const tier = src.tier ? `Tier ${src.tier}` : '';
                        const chance = src.chance != null ? `шанс ${src.chance}%` : '';
                        return `Слейер: ${src.slayerType} ${tier} ${chance}`.trim();
                    }
                    return src.note || 'Особый источник.';
                });

                list.push(`<div style="margin-bottom:8px;"><b>${it.name}</b> ${rarity}<br>${stats.join(' | ')}<br>${srcLines.join('<br>')}</div>`);
            });
        }

        container.innerHTML = list.join('');
    },

    renderPlayerStatsInfo(container) {
        const list = [];
        list.push('<h4>📊 Статы игрока</h4>');
        list.push('<p>Статы определяют вашу силу в игре. Они влияют на урон, защиту, шансы и т.д. Поднимайте их через экипировку, питомцев, скиллы и события.</p>');

        const stats = [
            { name: 'Сила (STR)', icon: '💪', desc: 'Увеличивает физический урон в бою. Поднимается: оружие, броня, талисманы, питомцы, скилл Combat.' },
            { name: 'Защита (DEF)', icon: '🛡️', desc: 'Снижает получаемый урон. Поднимается: броня, талисманы, скилл Combat.' },
            { name: 'ХП (HP)', icon: '❤️', desc: 'Максимальное здоровье. Поднимается: броня, талисманы, питомцы.' },
            { name: 'Крит. шанс (CC)', icon: '🎯', desc: 'Шанс нанести критический удар (x2 урон). Поднимается: оружие, броня, талисманы, питомцы.' },
            { name: 'Крит. урон (CD)', icon: '💥', desc: 'Множитель критического урона. Поднимается: оружие, броня, талисманы.' },
            { name: 'Удача (MF)', icon: '🍀', desc: 'Увеличивает шансы дропа и рыбалки. Поднимается: талисманы, питомцы, скиллы (Mining, Farming и т.д.).' },
            { name: 'Интеллект (INT)', icon: '🧠', desc: 'Увеличивает магический урон. Поднимается: талисманы, скилл Combat.' },
            { name: 'Маг. мощь (MAG AMP)', icon: '🔮', desc: 'Усиливает магический урон. Поднимается: броня, талисманы.' },
            { name: 'Виталити', icon: '⚕️', desc: 'Восстановление ХП после удара. Поднимается: броня Слейера.' },
            { name: 'Фортуна (Mining/Farming/etc.)', icon: '⛏️🌾🎣🌲', desc: 'Увеличивает шансы и количество дропа в соответствующих активностях. Поднимается: инструменты, броня, талисманы, питомцы, скиллы.' }
        ];

        stats.forEach(stat => {
            list.push(`<div style="margin-bottom:12px; padding:8px; border:1px solid var(--dark-gray); border-radius:6px;">
                ${stat.icon} <b>${stat.name}</b><br>
                ${stat.desc}
            </div>`);
        });

        list.push('<h5>Как поднимать статов:</h5>');
        list.push('<ul>');
        list.push('<li><b>Экипировка:</b> Надевайте лучшее оружие, броню, талисманы.</li>');
        list.push('<li><b>Питомцы:</b> Экипируйте питомца с бонусами к статам.</li>');
        list.push('<li><b>Скиллы:</b> Повышайте уровни скиллов для пассивных бонусов (Combat для STR/DEF, Mining для Mining Fortune и т.д.).</li>');
        list.push('<li><b>Ивенты:</b> Некоторые ивенты дают временные бонусы.</li>');
        list.push('</ul>');

        container.innerHTML = list.join('');
    },

    renderMaterialsInfo(container) {
        const list = [];
        list.push('<h4>📦 Материалы</h4>');
        list.push('<p>Здесь указаны шансы и количество <b>Фрагментов из Данжа</b> по этажам.</p>');

        list.push('<h5>Фрагменты из Данжа</h5>');
        const dungeonRewardsData = window.dungeonRewards || {};
        for (let floor = 1; floor <= 7; floor++) {
            const reward = dungeonRewardsData[floor] || {};
            const coinsText = (reward.coins_min != null && reward.coins_max != null)
                ? `Монеты: ${reward.coins_min.toLocaleString()}–${reward.coins_max.toLocaleString()}`
                : '';

            const fragments = reward.fragments;
            let fragText = '';
            if (fragments) {
                fragText = `Шанс: ${fragments.chance}% → при выпадении ${fragments.min}–${fragments.max} фрагментов.`;
            } else {
                fragText = 'Нет информации о шансах фрагментов.';
            }

            const parts = [fragText, coinsText].filter(Boolean);
            list.push(`<div style="margin-bottom:8px;"><b>Этаж ${floor}:</b> ${parts.join('<br>')}</div>`);
        }

        // Алтарь: материалы
        const altarMaterials = Object.values(window.INFO_ITEMS || {}).filter(i => i.type === 'material' && (i.sources || []).some(src => src.source === 'altar'));
        if (altarMaterials.length) {
            list.push('<h5>🕯️ Материалы из Алтаря</h5>');
            altarMaterials.forEach(it => {
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                const src = (it.sources || []).find(s => s.source === 'altar');
                const srcLine = src ? `Алтарь (Защитник Энда) — шанс ${src.baseChance != null ? src.baseChance : 'неизвестен'}% + MF/100` : 'Алтарь (Защитник Энда)';
                list.push(`<div style="margin-bottom:8px;"><b>${it.name}</b> ${rarity}<br>${srcLine}</div>`);
            });
        }

        container.innerHTML = list.join('');
    },

    renderPetsInfo(container) {
        const list = [];
        list.push('<h4>🐾 Питомцы</h4>');
        list.push('<p>Питомцы дают бонусы к статам и опыту. Чем выше редкость и уровень, тем сильнее эффект.</p>');

        // Список питомцев
        const pets = shopItems.pet || [];
        if (pets.length) {
            list.push('<h5>🛒 Доступные питомцы</h5>');
            pets.forEach(it => {
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                const skill = it.skill ? `Скилл: ${it.skill}` : '';
                const cost = it.cost ? `Стоимость: ${it.cost.toLocaleString()} 💰` : '';
                list.push(`<div style="margin-bottom:8px;"><b>${it.name}</b> ${rarity}<br>${skill}<br>${cost}</div>`);
            });
        }

        // Дропающиеся
        list.push('<h5>💀 Дропающиеся питомцы</h5>');
        const dropPets = Object.values(window.INFO_ITEMS || {}).filter(i => i.type === 'pet' && (i.sources || []).some(src => src.source !== 'shop'));
        if (dropPets.length) {
            dropPets.forEach(it => {
                const rarity = it.rarity ? getRarityTag(it.rarity) : '';
                const skill = it.skill ? `Скилл: ${it.skill}` : '';
                const srcLines = (it.sources || []).map(src => {
                    if (src.source === 'slayer') {
                        const tier = src.tier ? `Tier ${src.tier}` : '';
                        const chance = src.chance != null ? `шанс ${src.chance}%` : '';
                        return `Слейер: ${src.slayerType} ${tier} ${chance}`.trim();
                    }
                    if (src.source === 'altar') {
                        const chance = src.baseChance != null ? `шанс ${src.baseChance}% + MF/100` : '';
                        return `Алтарь (Защитник Энда) ${chance}`.trim();
                    }
                    if (src.source === 'dungeon') {
                        const chance = src.baseChance != null ? `шанс ${src.baseChance}% + MF/100` : '';
                        return `Данж: этаж ${src.floor} ${chance}`.trim();
                    }
                    return src.note || '';
                }).filter(Boolean).join('<br>');
                list.push(`<div style="margin-bottom:8px;"><b>${it.name}</b> ${rarity}<br>${skill}<br>${srcLines}</div>`);
            });
        } else {
            list.push('<div style="margin-bottom:12px; color:var(--gray);">Нет дропа питомцев.</div>');
        }

        list.push('<h4>Апгрейд питомцев</h4>');
        list.push('<p>Питомцев можно улучшать до более высокой редкости, тратя ресурсы и "Апгрейд питомца".</p>');
        list.push('<p>Шанс апгрейда: <span style="color:green">100%</span> (всегда успешен, если есть все необходимые ресурсы).</p>');
        list.push('<p>Редкости: common → rare → epic → legendary.</p>');
        container.innerHTML = list.join('');
    },

    renderMobsInfo(container) {
        const list = [];
        list.push('<h4>👹 Мобы и боссы</h4>');
        list.push('<p>Мобы - враги в данжах и слейерах. У каждого моба есть статы: ХП (здоровье), Урон (атака), Защита (снижает урон). Боссы сильнее и имеют особые механики.</p>');
        list.push('<p><b>Как влияют статы:</b> Ваш урон = (сила или интеллект) - защита моба. Урон моба = его урон - ваша защита. Если ХП <=0, победа.</p>');
        list.push('<p>В Мастер Моде статы мобов x3, защита x2.</p>');

        list.push('<h5>💀 Мобы данжей</h5>');
        const dungeonMobs = [
            { floor: 1, mobs: ['ЗОМБИ', 'СКЕЛЕТ', 'ПАУК', 'МЕРТВЕЦ'] },
            { floor: 2, mobs: ['ПАУК', 'ПЕЩЕРНЫЙ ПАУК', 'ПАУК-СКОРПИОН', 'БРУДА'] },
            { floor: 3, mobs: ['ЭНДЕРМИТ', 'ЭНДЕРМЕН', 'ШАЛКЕР', 'ЗАЩИТНИК КРАЯ'] },
            { floor: 4, mobs: ['РЫЦАРЬ', 'ПАЛАДИН', 'ПРОРОК', 'КОРОЛЬ'] },
            { floor: 5, mobs: ['ОХОТНИК', 'ИСКАТЕЛЬ', 'МАГ', 'АССАСИН'] },
            { floor: 6, mobs: ['ОРК', 'ГОБЛИН', 'ТРОЛЬ', 'ГИГАНТ'] },
            { floor: 7, mobs: ['БЛЕЙЗ', 'ГАСТ', 'СКЕЛЕТ ИССУШИТЕЛЬ', 'ИССУШИТЕЛЬ'] }
        ];
        dungeonMobs.forEach(f => {
            list.push(`<div style="margin-bottom:8px;"><b>Этаж ${f.floor}</b></div>`);
            f.mobs.forEach((name, idx) => {
                const isBoss = idx === 3;
                const icon = isBoss ? '👑' : '🕷️';
                list.push(`<div style="margin-left:10px;margin-bottom:4px;">${icon} ${name} ${isBoss ? '(Босс)' : '(Моб)'}</div>`);
            });
        });

        list.push('<h5>🧟 Мобы Слейеров</h5>');
        const slayerMobs = [
            { tier: 1, mobs: ['Обычный Зомби', 'Крепкий Зомби'], boss: 'Zombie БОСС T1' },
            { tier: 2, mobs: ['Обычный Зомби', 'Крепкий Зомби'], boss: 'Zombie БОСС T2' },
            { tier: 3, mobs: ['Обычный Зомби', 'Крепкий Зомби', 'Агрессивный Зомби'], boss: 'Zombie БОСС T3' },
            { tier: 4, mobs: ['Обычный Зомби', 'Крепкий Зомби', 'Агрессивный Зомби'], boss: 'Zombie БОСС T4' }
        ];
        slayerMobs.forEach(t => {
            list.push(`<div style="margin-bottom:8px;"><b>Tier ${t.tier}</b></div>`);
            t.mobs.forEach(name => {
                list.push(`<div style="margin-left:10px;margin-bottom:2px;">🧟 ${name} (Моб)</div>`);
            });
            list.push(`<div style="margin-left:10px;margin-bottom:2px;">👑 ${t.boss} (Босс)</div>`);
        });

        list.push('<h5>Особенности боссов:</h5>');
        const bossFeatures = [
            { floor: 4, name: 'КОРОЛЬ', features: 'Постепенно теряет броню: с каждого удара защита уменьшается.' },
            { floor: 5, name: 'АССАСИН', features: 'Мобы и босс наносят критический урон по игроку.' },
            { floor: 7, name: 'ИССУШИТЕЛЬ', features: 'Огонь накапливается стаками, усиливая урон. При низком ХП переходит в фазу с повышенной бронёй и уроном.' }
        ];
        bossFeatures.forEach(b => {
            list.push(`<div style="margin-bottom:8px;"><b>Этаж ${b.floor} (${b.name}):</b> ${b.features}</div>`);
        });

        list.push('<h5>Боссы слайеров:</h5>');
        const slayerBosses = [
            { tier: 1, features: 'Стандартный босс, ярость при низком ХП.' },
            { tier: 2, features: 'Стандартный босс, ярость при низком ХП.' },
            { tier: 3, features: 'Стандартный босс, ярость при низком ХП.' },
            { tier: 4, features: 'Стандартный босс, ярость при низком ХП. Возможен дроп питомца Гуль.' }
        ];
        slayerBosses.forEach(b => {
            list.push(`<div style="margin-bottom:8px;"><b>Tier ${b.tier}:</b> ${b.features}</div>`);
        });

        container.innerHTML = list.join('');
    },

    renderModesInfo(container) {
        const list = [];
        list.push('<h4>Режимы данжей</h4>');
        list.push('<div style="margin-bottom:8px;"><b>Катакомбы</b><br>Обычный режим. Базовые статы мобов и боссов. Подходит для прокачки и фарма первых наград.</div>');
        list.push('<div style="margin-bottom:8px;"><b>Мастер Мод</b><br>Усиленная версия тех же этажей (усиленные статы мобов и боссов).</div>');
        container.innerHTML = list.join('');
    },

    showModeInfo(mode) {
        if (mode === 'catacombs') {
            let html = '<div>';
            html += '<h4 style="margin-top:0;">Катакомбы</h4>';
            html += '<p>Классический режим данжей. Каждый этаж состоит из трёх обычных мобов и одного босса.</p>';
            html += '<p><b>Опыт за убийство мобов:</b><br>Обычный моб: этаж × 20 боевого XP.<br>Босс: этаж × 50 боевого XP.</p>';
            html += '<p><b>Опыт за прохождение этажа:</b><br>Этаж × 200 XP навыка Данжи (с учётом бонусов, питомца Бейби Иссушитель и статов dungeon_exp_bonus).</p>';
            html += '<p><b>Монеты:</b><br>За прохождение этажа вы получаете случайное количество монет в диапазоне, заданном для этажа (см. сундук этажа), с учётом стата gold_bonus.</p>';
            html += '<p><b>Открытие этажей:</b><br>Для каждого следующего этажа требуется определённый уровень навыка Данжи. Для 7 этажа требуется уровень Данжи 26.</p>';
            html += '</div>';
            this.showInfoModal('Катакомбы', html);
        } else if (mode === 'master') {
            let html = '<div>';
            html += '<h4 style="margin-top:0;">Мастер Мод</h4>';
            html += '<p>Усложнённый режим тех же этажей Катакомб. Все мобы и боссы используют те же механики, но их статы сильно усилены.</p>';
            html += '<p><b>Множители статов:</b><br>ХП мобов и боссов примерно x3.<br>Урон мобов примерно x3.<br>Броня мобов примерно x2.</p>';
            html += '<p><b>Условия доступа:</b><br>Мастер Мод открывается только после прохождения 7 этажа обычных Катакомб и при уровне навыка Данжи выше 26. Для более высоких этажей Мастер Мода требуется всё больший уровень Данжи и прохождение предыдущих этажей Мастер Мода.</p>';
            html += '<p>Мастер Мод предназначен для эндгейм-игроков и даёт максимально сложные бои и лучшие награды.</p>';
            html += '</div>';
            this.showInfoModal('Мастер Мод', html);
        }
    }
});

