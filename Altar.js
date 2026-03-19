// Altar.js — модуль "Алтарь" (совместный вызов босса через Supabase)
//
// Чтобы эта система работала, в Supabase должна быть настроена структура таблиц.
// Пример SQL-схемы для запуска в Supabase SQL Editor:
//
// create table altar_events (
//   id uuid primary key default gen_random_uuid(),
//   status text not null default 'waiting', -- waiting | active | defeated
//   required_fragments int not null default 5,
//   contributed_fragments int not null default 0,
//   boss_hp int,
//   boss_max_hp int,
//   boss_armor int,
//   drop_log jsonb,
//   created_at timestamptz default now(),
//   updated_at timestamptz default now()
// );
//
// create table altar_contributions (
//   id uuid primary key default gen_random_uuid(),
//   altar_id uuid references altar_events(id),
//   user_id text,
//   user_name text,
//   fragments int,
//   created_at timestamptz default now()
// );
//
// create table altar_damage (
//   id uuid primary key default gen_random_uuid(),
//   altar_id uuid references altar_events(id),
//   user_id text,
//   user_name text,
//   damage int,
//   created_at timestamptz default now()
// );

const BOSS_NAME = 'Защитник Энда';
const ALTAR_FRAGMENT_NAME = 'Фрагмент из Данжа';
const DEFAULT_REQUIRED_FRAGMENTS = 100;
const DEFAULT_BOSS_HP = 2000;
const DEFAULT_BOSS_ARMOR = 500;
const BOSS_DURATION_MS = 10 * 60 * 1000;
const BOSS_INACTIVITY_MS = 2 * 60 * 1000;
const POST_KILL_COOLDOWN_MS = 20 * 60 * 1000;

const DEBUG_WEAK_BOSS = false;
const DEBUG_BOSS_HP = 5;

const Altar = {
    event: null,
    contributions: [],
    damage: [],
    userId: null,
    userName: null,
    refreshTimer: null,
    schemaError: null,
    supportsBossLastActivity: true,
    supportsBossExpires: true,
    supportsDamagePlayerHp: true,
    countdownTimerId: null,
    currentExpiresAt: 0,

    // Текущий вид: 'list' — список боссов, 'boss' — детальная страница босса
    view: 'list',

    bosses: [
        {
            id: 'ender',
            name: 'Защитник Энда',
            icon: '👹',
            desc: 'Классический босс Алтаря. Дает фрагменты и шанс получить редкие предметы.',
            getDropTable: (mfBonus) => [
                { name: 'Реликвия Алтаря', rarity: 'legendary', baseChance: 3 },
                { name: 'Древний осколок', rarity: 'epic', baseChance: 10 },
                { name: 'Обычный осколок', rarity: 'common', baseChance: 87 },
                { name: 'Питомец Голем', rarity: 'legendary', baseChance: 0.01 },
                { name: 'Меч Защитника Энда', rarity: 'legendary', baseChance: 0.01 },
                { name: 'Кольцо Защитника Энда', rarity: 'rare', baseChance: 0.1 }
            ].map(d => ({ ...d, effectiveChance: d.baseChance + (mfBonus || 0) })),
        },
        { id: 'soon2', name: 'Тёмный Страж', icon: '🗡️', desc: 'В разработке. Скоро появится новый босс.', getDropTable: () => [], comingSoon: true },
        { id: 'soon3', name: 'Проклятый Колосс', icon: '💀', desc: 'В разработке. Скоро появится новый босс.', getDropTable: () => [], comingSoon: true }
    ],
    selectedBossId: 'ender',

    getSelectedBoss() {
        return this.bosses.find(b => b.id === this.selectedBossId) || this.bosses[0];
    },

    openBoss(id) {
        if (!this.bosses.some(b => b.id === id)) return;
        this.selectedBossId = id;
        this.view = 'boss';
        this.render();
    },

    goBackToList() {
        this.view = 'list';
        this.render();
    },

    ensureCountdown() {
        if (this.countdownTimerId) return;
        this.countdownTimerId = setInterval(() => {
            // Обновляем все элементы обратного отсчёта
            const expiresAt = this.currentExpiresAt || 0;
            const remainingMs = Math.max(0, expiresAt - Date.now());
            const m = Math.floor(remainingMs / 60000);
            const s = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0');
            const text = `${m}:${s}`;
            document.querySelectorAll('.altar-countdown').forEach(el => {
                el.textContent = text;
            });
        }, 1000);
    },

    clearCountdown() {
        if (this.countdownTimerId) {
            clearInterval(this.countdownTimerId);
            this.countdownTimerId = null;
        }
    },

    restorePlayerHp() {
        if (!window.game || !game.state || !game.state.stats) return;
        const prevHp = game.state.stats.hp;
        game.state.stats.hp = 100;
        const maxHp = (typeof game.calcStats === 'function' ? game.calcStats(false).hp : 100) || 100;
        game.state.stats.hp = Math.max(1, maxHp);
    },

    async init() {
        this.userId = game.playerTelegramId ? String(game.playerTelegramId) : 'guest';
        this.userName = tg.initDataUnsafe?.user?.first_name || 'Гость';
        await this.refresh();
        this.refreshTimer = setInterval(() => this.refresh(), 8000);
    },

    async openMenu() {
        game.switchTab('altar-menu');
        this.view = 'list';
        await this.refresh();
    },

    setSchemaError(err) {
        this.schemaError = err;
        console.warn('Altar: schema error detected', err);
    },

    async refresh() {
        this.schemaError = null;
        await this.loadEvent();
        if (this.event) {
            await this.loadContributions();
            // During an active fight we do not show damage leaderboard (it would include past runs).
            if (this.event.status === 'active') {
                this.damage = [];
            } else {
                await this.loadDamage();
            }

            const now = Date.now();

            // When boss is defeated and cooldown has expired, reset to waiting so the player can start collecting fragments again.
            if (this.event.status === 'defeated') {
                const defeatedAt = this.supportsBossLastActivity && this.event.boss_last_activity_at
                    ? new Date(this.event.boss_last_activity_at).getTime()
                    : new Date(this.event.updated_at).getTime();
                if (now - defeatedAt > POST_KILL_COOLDOWN_MS) {
                    await supabaseClient.from('altar_events').update({
                        status: 'waiting',
                        boss_hp: DEFAULT_BOSS_HP,
                        boss_armor: DEFAULT_BOSS_ARMOR,
                        boss_expires_at: null,
                        contributed_fragments: 0,
                        updated_at: new Date().toISOString(),
                        boss_last_activity_at: this.supportsBossLastActivity ? null : undefined
                    }).eq('id', this.event.id);
                    await supabaseClient.from('altar_contributions').delete().eq('altar_id', this.event.id);
                    await this.refresh();
                    return;
                }
            }

            if (this.event.status === 'active') {
                const expiresAt = this.supportsBossExpires && this.event.boss_expires_at
                    ? new Date(this.event.boss_expires_at).getTime()
                    : 0;
                if (expiresAt && now > expiresAt) {
                    await this.expireBoss('⏱️ Время вышло — босс ушёл.');
                    return;
                }

                const lastActivityAt = this.supportsBossLastActivity && this.event.boss_last_activity_at
                    ? new Date(this.event.boss_last_activity_at).getTime()
                    : new Date(this.event.updated_at).getTime();
                if (now - lastActivityAt > BOSS_INACTIVITY_MS) {
                    await this.expireBoss('⏳ Никто не атакует — босс ушёл.');
                    return;
                }

                if ((game.state.stats.hp || 0) <= 0) {
                    await this.expireBoss('💀 У вас 0 HP — босс ушёл.');
                    return;
                }
            }

            // Если игроки пожертвовали фрагменты, но не призвали босса в течение времени — возвращаем фрагменты.
            if (this.event.status === 'waiting' && (this.event.contributed_fragments || 0) > 0) {
                const startedAt = this.supportsBossLastActivity && this.event.boss_last_activity_at
                    ? new Date(this.event.boss_last_activity_at).getTime()
                    : new Date(this.event.updated_at).getTime();
                const FRAGMENT_TIMEOUT_MS = 5 * 60 * 1000;
                if (now - startedAt > FRAGMENT_TIMEOUT_MS) {
                    const myRefund = (this.contributions || [])
                        .filter(c => c.user_id === this.userId)
                        .reduce((sum, c) => sum + (c.fragments || 0), 0);
                    if (myRefund > 0) {
                        game.addMaterial(ALTAR_FRAGMENT_NAME, 'material', myRefund);
                        game.msg(`⌛ Время вышло — ваши ${myRefund} фрагментов возвращены.`);
                    }

                    await supabaseClient.from('altar_contributions').delete().eq('altar_id', this.event.id);
                    await supabaseClient.from('altar_events')
                        .update({ contributed_fragments: 0, boss_last_activity_at: null, updated_at: new Date().toISOString() })
                        .eq('id', this.event.id);
                    await this.refresh();
                    return;
                }
            }
        }

        this.render();
    },

    async loadEvent() {
        if (!supabaseClient) return;
        const { data, error } = await supabaseClient
            .from('altar_events')
            .select('*')
            .limit(1);
        if (error) {
            console.warn('Altar: failed to load event', error);
            if (error.code === 'PGRST205') this.setSchemaError(error);
            this.event = null;
            return;
        }

        this.event = data && data.length ? data[0] : null;
        this.supportsBossLastActivity = !!(this.event && Object.prototype.hasOwnProperty.call(this.event, 'boss_last_activity_at'));
        this.supportsBossExpires = !!(this.event && Object.prototype.hasOwnProperty.call(this.event, 'boss_expires_at'));

        if (!this.event) {
            const { data: created, error: createErr } = await supabaseClient
                .from('altar_events')
                .insert([{ status: 'waiting', required_fragments: DEFAULT_REQUIRED_FRAGMENTS, contributed_fragments: 0, boss_hp: DEFAULT_BOSS_HP, boss_max_hp: DEFAULT_BOSS_HP, boss_armor: DEFAULT_BOSS_ARMOR }])
                .select()
                .single();
            if (createErr) {
                console.warn('Altar: failed to create initial event', createErr);
            } else {
                this.event = created;
            }
        } else if (this.event.status === 'waiting') {
            const toUpdate = {};
            if (this.event.required_fragments !== DEFAULT_REQUIRED_FRAGMENTS) toUpdate.required_fragments = DEFAULT_REQUIRED_FRAGMENTS;
            if (!this.event.boss_max_hp || this.event.boss_max_hp !== DEFAULT_BOSS_HP) toUpdate.boss_max_hp = DEFAULT_BOSS_HP;
            if (!this.event.boss_hp || this.event.boss_hp > (this.event.boss_max_hp || 0)) toUpdate.boss_hp = DEFAULT_BOSS_HP;
            if (!this.event.boss_armor || this.event.boss_armor !== DEFAULT_BOSS_ARMOR) toUpdate.boss_armor = DEFAULT_BOSS_ARMOR;
            if (Object.keys(toUpdate).length) {
                toUpdate.updated_at = new Date();
                await supabaseClient.from('altar_events').update(toUpdate).eq('id', this.event.id);
                const { data: refreshed } = await supabaseClient.from('altar_events').select('*').eq('id', this.event.id).single();
                if (refreshed) this.event = refreshed;
            }
        }
    },

    async loadContributions() {
        if (!supabaseClient || !this.event) return;
        const { data, error } = await supabaseClient
            .from('altar_contributions')
            .select('*')
            .eq('altar_id', this.event.id)
            .order('created_at', { ascending: false });
        if (error) {
            console.warn('Altar: failed to load contributions', error);
            if (error.code === 'PGRST205') this.setSchemaError(error);
            this.contributions = [];
            return;
        }
        this.contributions = data || [];
    },

    async loadDamage() {
        if (!supabaseClient || !this.event) return;
        const { data, error } = await supabaseClient
            .from('altar_damage')
            .select('*')
            .eq('altar_id', this.event.id)
            .order('damage', { ascending: false });
        if (error) {
            console.warn('Altar: failed to load damage table', error);
            if (error.code === 'PGRST205') this.setSchemaError(error);
            this.damage = [];
            return;
        }
        this.damage = data || [];
        this.supportsDamagePlayerHp = this.damage.some(d => d.player_hp !== undefined);
    },

    async contribute(fragments) {
        if (!this.event) return;
        if (this.event.status !== 'waiting') return;
        if (fragments <= 0) return;

        // Ищем фрагмент по названию, принимаем любые типы (чтобы не ломалось после правок типа выдачи).
        const fragItem = game.state.inventory.find(i => i.name === ALTAR_FRAGMENT_NAME && i.type === 'material')
            || game.state.inventory.find(i => i.name === ALTAR_FRAGMENT_NAME);
        const available = fragItem ? (fragItem.count || 0) : 0;
        if (available <= 0) {
            game.msg(`У вас нет ${ALTAR_FRAGMENT_NAME}.`);
            return;
        }

        const required = this.event.required_fragments || DEFAULT_REQUIRED_FRAGMENTS;
        const current = this.event.contributed_fragments || 0;
        const remaining = Math.max(0, required - current);
        if (remaining <= 0) {
            game.msg('Фрагменты уже собраны. Призывайте босса!');
            return;
        }

        const toUse = Math.min(fragments, available, remaining);
        if (toUse <= 0) return;

        // Списываем использованные фрагменты
        fragItem.count -= toUse;
        if (fragItem.count <= 0) game.state.inventory = game.state.inventory.filter(i => i.id !== fragItem.id);

        if (fragments > toUse) {
            const refund = fragments - toUse;
            game.msg(`Избыточные фрагменты возвращены (${refund}).`);
        }

        const { error } = await supabaseClient
            .from('altar_contributions')
            .insert([{ altar_id: this.event.id, user_id: this.userId, user_name: this.userName, fragments: toUse }]);
        if (error) {
            console.warn('Altar: contribution failed', error);
            if (error.code === 'PGRST205') this.setSchemaError(error);
            return;
        }

        const newTotal = (this.event.contributed_fragments || 0) + toUse;
        const updates = { contributed_fragments: newTotal, updated_at: new Date().toISOString() };
        if (this.supportsBossLastActivity) updates.boss_last_activity_at = new Date().toISOString();
        const { error: updErr } = await supabaseClient.from('altar_events').update(updates).eq('id', this.event.id);
        if (updErr) console.warn('Altar: failed to update contribution total', updErr);

        await this.refresh();
        if (typeof game.updateUI === 'function') game.updateUI();
    },

    async expireBoss(reason) {
        if (!this.event) return;
        this.restorePlayerHp();

        const bossMax = this.event.boss_max_hp || DEFAULT_BOSS_HP;
        const updates = {
            status: 'waiting',
            boss_hp: bossMax,
            boss_expires_at: null,
            contributed_fragments: 0,
            updated_at: new Date().toISOString()
        };
        if (this.supportsBossLastActivity) updates.boss_last_activity_at = null;
        await supabaseClient.from('altar_events').update(updates).eq('id', this.event.id);
        await supabaseClient.from('altar_contributions').delete().eq('altar_id', this.event.id);
        await supabaseClient.from('altar_damage').delete().eq('altar_id', this.event.id);

        if (reason) game.msg(reason);
        await this.refresh();
    },

    async summonBoss() {
        if (!this.event) return;
        if (this.event.status !== 'waiting') return;
        if ((this.event.contributed_fragments || 0) < (this.event.required_fragments || 0)) return;

        this.restorePlayerHp();
        const bossHp = DEBUG_WEAK_BOSS ? DEBUG_BOSS_HP : (this.event.boss_max_hp || DEFAULT_BOSS_HP);
        const bossArmor = DEBUG_WEAK_BOSS ? 0 : (this.event.boss_armor || DEFAULT_BOSS_ARMOR);
        const expiresAt = new Date(Date.now() + BOSS_DURATION_MS).toISOString();
        const updates = { status: 'active', boss_hp: bossHp, boss_armor: bossArmor, updated_at: new Date().toISOString() };
        if (this.supportsBossExpires) updates.boss_expires_at = expiresAt;
        if (this.supportsBossLastActivity) updates.boss_last_activity_at = new Date().toISOString();
        const { error } = await supabaseClient.from('altar_events').update(updates).eq('id', this.event.id);
        if (error) {
            console.warn('Altar: failed to summon boss', error);
            return;
        }

        const { error: damageClearError } = await supabaseClient.from('altar_damage').delete().eq('altar_id', this.event.id);
        if (damageClearError) console.warn('Altar: failed to clear old damage log', damageClearError);

        await this.refresh();
    },

    getDropTable() {
        const stats = (typeof game.calcStats === 'function' ? game.calcStats(true) : { mf: 0 });
        const mfBonus = (stats.mf || 0) / 100;
        const boss = this.getSelectedBoss();
        if (!boss || typeof boss.getDropTable !== 'function') return [];
        return boss.getDropTable(mfBonus);
    },

    rollDrop() {
        const drops = this.getDropTable();
        const total = drops.reduce((sum, d) => sum + (d.effectiveChance || 0), 0);
        const roll = Math.random() * total;
        let acc = 0;
        for (const drop of drops) {
            acc += drop.effectiveChance;
            if (roll <= acc) return drop;
        }
        return drops[drops.length - 1];
    },

    async attackBoss(mode = 'melee') {
        if (!this.event) return;
        if (this.event.status !== 'active') return;
        if ((game.state.stats.hp || 0) <= 0) {
            game.msg('Вы мертвы и не можете атаковать. Дождитесь ухода босса или используйте зелье.');
            return;
        }

        await this.loadContributions();
        const myFragments = (this.contributions || [])
            .filter(c => c.user_id === this.userId)
            .reduce((sum, c) => sum + (c.fragments || 0), 0);
        if (myFragments < 1) {
            game.msg('Чтобы атаковать босса, внесите хотя бы 1 фрагмент.');
            return;
        }

        const stats = game.calcStats(true);
        const useBow = mode === 'ranged' && game.state.inventory.some(i => i.equipped && i.type === 'weapon' && i.ranged);
        if (useBow) {
            const arrowItem = game.state.inventory.find(i => i.type === 'material' && i.name === 'Стрела');
            if (!arrowItem || arrowItem.count <= 0) {
                game.msg('Нет стрел! Купите стрелы в магазине.');
                return;
            }
            const saveChance = stats.arrow_save || 0;
            if (Math.random() * 100 >= saveChance) {
                arrowItem.count -= 1;
                if (arrowItem.count <= 0) game.state.inventory = game.state.inventory.filter(i => i.id !== arrowItem.id);
            }
        }

        const baseMultiplier = useBow ? 0.4 : 0.5;
        const bowExtra = useBow ? (stats.bow_str || 0) : 0;
        const baseDmg = Math.max(1, Math.round(stats.str * baseMultiplier + (stats.cc || 0) * 0.2 + bowExtra));
        const bossArmor = this.event.boss_armor ?? DEFAULT_BOSS_ARMOR;
        const dmgMultiplier = 100 / (100 + bossArmor);
        const bowBonus = useBow ? 1.2 : 1;
        let damage = Math.max(1, Math.floor(baseDmg * (1 + Math.random() * 0.2) * dmgMultiplier * bowBonus));
        if (stats.boss_damage) damage = Math.max(1, Math.floor(damage * (1 + stats.boss_damage / 100)));

        const newHp = Math.max(0, (this.event.boss_hp || 0) - damage);
        const updates = { boss_hp: newHp, updated_at: new Date().toISOString() };
        if (this.supportsBossLastActivity) updates.boss_last_activity_at = new Date().toISOString();
        let drop = null;
        let rewardCoins = 0;
        let rewardXp = 0;
        if (newHp === 0) {
            updates.status = 'defeated';
            drop = this.rollDrop();
            updates.drop_log = { user: this.userName, item: drop.name, rarity: drop.rarity, time: new Date().toISOString() };
            if (this.supportsBossExpires) updates.boss_expires_at = new Date(Date.now() + POST_KILL_COOLDOWN_MS).toISOString();
            rewardCoins = Math.floor(Math.random() * 15000000) + 1000000;
            rewardXp = 5000;
            game.state.coins += rewardCoins;
            game.addXp('combat', rewardXp);

            // Выдаем немного фрагментов Алтаря за убийство
            const fragmentReward = 3;
            game.addMaterial(ALTAR_FRAGMENT_NAME, 'material', fragmentReward);
            game.msg(`Вы получили ${fragmentReward} ${ALTAR_FRAGMENT_NAME} за победу!`);
        }

        const { error } = await supabaseClient.from('altar_events').update(updates).eq('id', this.event.id);
        if (error) {
            console.warn('Altar: failed to update boss hp', error);
            return;
        }

        const damageEntry = { altar_id: this.event.id, user_id: this.userId, user_name: this.userName, damage };
        if (this.supportsDamagePlayerHp) damageEntry.player_hp = game.state.stats.hp || 0;

        let damageInsertError = null;
        const { error: insertErr } = await supabaseClient.from('altar_damage').insert([damageEntry]);
        if (insertErr) {
            if (this.supportsDamagePlayerHp && /player_hp/i.test(insertErr.message || '')) {
                this.supportsDamagePlayerHp = false;
                delete damageEntry.player_hp;
                const { error: retryErr } = await supabaseClient.from('altar_damage').insert([damageEntry]);
                damageInsertError = retryErr;
            } else {
                damageInsertError = insertErr;
            }
        }
        if (damageInsertError) console.warn('Altar: failed to record damage', damageInsertError);

        const contributors = [...new Map((this.contributions || []).map(c => [c.user_id || c.user_name, c.user_name]))].map(([id, name]) => ({ id, name }));
        if (contributors.length) {
            const target = contributors[Math.floor(Math.random() * contributors.length)];
            const bossHp = this.event.boss_hp ?? 0;
            const bossMax = this.event.boss_max_hp ?? DEFAULT_BOSS_HP;
            const damageToPlayer = bossHp > 0 && bossHp <= bossMax * 0.4 ? 50 : 25;
            const isSelf = target.id === this.userId || target.name === this.userName;
            if (isSelf) {
                const curHp = game.state.stats.hp || 0;
                game.state.stats.hp = Math.max(0, curHp - damageToPlayer);
                game.msg(`🛡️ ${BOSS_NAME} ударил вас за ${damageToPlayer} HP!`);
            } else {
                game.msg(`🛡️ ${BOSS_NAME} ударил ${target.name} за ${damageToPlayer} HP!`);
            }
        }

        if (drop) {
            const dropItem = drop.item ? { ...drop.item } : { name: drop.name, type: 'material', rarity: drop.rarity };
            if (dropItem.type === 'pet') {
                game.state.pets.push({ ...dropItem, equipped: false });
            } else if (dropItem.type === 'material' || dropItem.type === 'potion') {
                const count = dropItem.count || 1;
                game.addMaterial(dropItem.name, dropItem.type, count, dropItem);
            } else {
                // Weapons/armor/tools/etc. не стекуются, добавляем как отдельный айтем
                game.state.inventory.push({ ...dropItem, id: game.state.nextItemId++, equipped: false });
            }

            const { error: dropErr } = await supabaseClient
                .from('altar_drops')
                .insert([{ altar_id: this.event.id, user_id: this.userId, user_name: this.userName, item: drop.name, rarity: drop.rarity }]);
            if (dropErr) console.warn('Altar: failed to save drop entry', dropErr);
            game.msg(`🎉 ${this.userName} получил дроп: ${drop.name} (${drop.rarity})! +${rewardCoins.toLocaleString()}💰 +${rewardXp} XP`);
        }

        await this.refresh();
        if (typeof game.updateUI === 'function') game.updateUI();
    },

    useHealthPotion() {
        if (!game.usePotion) return;
        const hasPotion = game.state.inventory.some(i => i.type === 'potion' && i.name === 'Зелье восстановления хп');
        if (!hasPotion) {
            game.msg('У вас нет зелья восстановления HP.');
            return;
        }
        game.usePotion('Зелье восстановления хп');
        this.refresh();
    },

    // ─────────────────────────────────────────────
    //  RENDER
    // ─────────────────────────────────────────────

    render() {
        const container = document.getElementById('altar-content');
        if (!container) return;
        container.style.maxWidth = '480px';
        container.style.margin = '0 auto';

        if (this.schemaError) {
            container.innerHTML = this._renderSchemaError();
            return;
        }
        if (!this.event) {
            container.innerHTML = this._renderNoEvent();
            return;
        }

        if (this.view === 'boss') {
            container.innerHTML = this._renderBossDetail();
            this.ensureCountdown();
        } else {
            container.innerHTML = this._renderBossList();
            this.ensureCountdown();
        }
    },

    // ─────────────────────────────────────────────
    //  ВИД: СПИСОК БОССОВ
    // ─────────────────────────────────────────────

    _renderBossList() {
        const status = this.event ? (this.event.status || 'waiting') : 'waiting';
        const expiresAt = (this.supportsBossExpires && this.event && this.event.boss_expires_at)
            ? new Date(this.event.boss_expires_at).getTime()
            : 0;
        const cooldownMs = Math.max(0, expiresAt - Date.now());
        const cooldownMin = Math.floor(cooldownMs / 60000);
        const cooldownSec = Math.floor((cooldownMs % 60000) / 1000).toString().padStart(2, '0');

        const rarityColor = { legendary: '#e5c07b', epic: '#c678dd', rare: '#5b8af0', common: '#9ca3af' };

        let html = `<div style="padding:16px 0 8px;">
            <h3 style="margin:0 0 4px;font-size:1.2rem;font-weight:700;letter-spacing:0.05em;text-align:center;">
                ⚔️ АЛТАРЬ
            </h3>
            <p style="margin:0;color:var(--gray);font-size:0.85rem;text-align:center;">Выберите босса для призыва</p>
        </div>`;

        this.bosses.forEach((boss, idx) => {
            const isEnder = boss.id === 'ender';
            const isSoon = !!boss.comingSoon;

            // Определяем статус карточки
            let badgeHtml = '';
            let cardStyle = '';
            let bossHpBarHtml = '';
            let bottomHtml = '';

            if (isSoon) {
                badgeHtml = `<span style="background:rgba(109,40,217,0.3);color:#a78bfa;border:1px solid rgba(109,40,217,0.5);border-radius:99px;padding:2px 10px;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;">СКОРО</span>`;
                cardStyle = 'opacity:0.55;cursor:default;';
            } else if (status === 'active') {
                badgeHtml = `<span style="background:rgba(220,38,38,0.25);color:#f87171;border:1px solid rgba(220,38,38,0.5);border-radius:99px;padding:2px 10px;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;">⚔️ В БОЮ</span>`;
                cardStyle = 'border-color:rgba(220,38,38,0.5);box-shadow:0 0 18px rgba(220,38,38,0.15);cursor:pointer;';
                const bossHp = this.event.boss_hp ?? 0;
                const bossMax = this.event.boss_max_hp ?? DEFAULT_BOSS_HP;
                const hpPct = bossMax > 0 ? Math.min(100, Math.floor((bossHp / bossMax) * 100)) : 0;
                bossHpBarHtml = `<div style="margin:10px 0 2px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--gray);margin-bottom:4px;">
                        <span>HP Босса</span>
                        <span>${bossHp.toLocaleString()} / ${bossMax.toLocaleString()}</span>
                    </div>
                    <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:${hpPct}%;background:linear-gradient(90deg,#dc2626,#f87171);border-radius:99px;transition:width 0.5s;"></div>
                    </div>
                </div>`;
            } else if (status === 'defeated') {
                if (cooldownMs > 0) {
                    this.currentExpiresAt = expiresAt;
                    badgeHtml = `<span style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);border-radius:99px;padding:2px 10px;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;">☠️ УБИТ</span>`;
                    cardStyle = 'border-color:rgba(245,158,11,0.3);cursor:pointer;';
                    bottomHtml = `<div style="display:flex;align-items:center;gap:6px;margin-top:10px;padding:8px 10px;background:rgba(245,158,11,0.06);border-radius:8px;border:1px solid rgba(245,158,11,0.15);">
                        <span style="font-size:1rem;">⏱</span>
                        <div>
                            <div style="font-size:0.75rem;color:#fbbf24;font-weight:600;">Перезарядка</div>
                            <div style="font-size:0.75rem;color:var(--gray);">Снова через <span class="altar-countdown" style="color:#fbbf24;font-family:monospace;">${cooldownMin}:${cooldownSec}</span></div>
                        </div>
                    </div>`;
                } else {
                    badgeHtml = `<span style="background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.4);border-radius:99px;padding:2px 10px;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;">✅ ДОСТУПЕН</span>`;
                    cardStyle = 'border-color:rgba(34,197,94,0.35);box-shadow:0 0 14px rgba(34,197,94,0.1);cursor:pointer;';
                }
            } else {
                // waiting
                const required = this.event.required_fragments || DEFAULT_REQUIRED_FRAGMENTS;
                const contributed = this.event.contributed_fragments || 0;
                const progress = Math.min(100, Math.floor((contributed / required) * 100));
                badgeHtml = `<span style="background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.4);border-radius:99px;padding:2px 10px;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;">✅ ДОСТУПЕН</span>`;
                cardStyle = 'border-color:rgba(109,40,217,0.35);cursor:pointer;';
                if (isEnder) {
                    bossHpBarHtml = `<div style="margin:10px 0 2px;">
                        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--gray);margin-bottom:4px;">
                            <span>Фрагменты</span>
                            <span>${contributed} / ${required}</span>
                        </div>
                        <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
                            <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,var(--accent,#a855f7),#ffaa00);border-radius:99px;transition:width 0.5s;"></div>
                        </div>
                    </div>`;
                }
            }

            const clickAttr = isSoon ? '' : `onclick="Altar.openBoss('${boss.id}')"`;

            html += `<div class="card" style="margin-bottom:10px;border:1px solid rgba(109,40,217,0.2);border-radius:14px;padding:14px 16px;${cardStyle}" ${clickAttr}>
                <div style="display:flex;align-items:center;gap:12px;">
                    <div style="width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;background:rgba(109,40,217,0.15);border:1px solid rgba(109,40,217,0.25);flex-shrink:0;">
                        ${boss.icon}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                            <span style="font-weight:700;font-size:1rem;">${boss.name}</span>
                            ${badgeHtml}
                        </div>
                        <p style="margin:3px 0 0;color:var(--gray);font-size:0.8rem;line-height:1.3;">${boss.desc}</p>
                    </div>
                    ${!isSoon ? `<div style="color:var(--gray);font-size:1.1rem;flex-shrink:0;">›</div>` : ''}
                </div>
                ${bossHpBarHtml}
                ${bottomHtml}
            </div>`;
        });

        return html;
    },

    // ─────────────────────────────────────────────
    //  ВИД: ДЕТАЛЬНАЯ СТРАНИЦА БОССА
    // ─────────────────────────────────────────────

    _renderBossDetail() {
        const boss = this.getSelectedBoss();
        const rawStatus = this.event ? (this.event.status || 'waiting') : 'waiting';
        const status = rawStatus.toString().trim().toLowerCase();
        const bossHp = this.event ? (this.event.boss_hp ?? 0) : 0;
        const bossMax = this.event ? (this.event.boss_max_hp ?? DEFAULT_BOSS_HP) : DEFAULT_BOSS_HP;
        const bossArmor = this.event ? (this.event.boss_armor || DEFAULT_BOSS_ARMOR) : DEFAULT_BOSS_ARMOR;
        const hpPct = bossMax > 0 ? Math.min(100, Math.floor((bossHp / bossMax) * 100)) : 0;

        const expiresAt = (this.supportsBossExpires && this.event && this.event.boss_expires_at)
            ? new Date(this.event.boss_expires_at).getTime()
            : 0;
        const remainingMs = Math.max(0, expiresAt - Date.now());
        const remainingMin = Math.floor(remainingMs / 60000);
        const remainingSec = Math.floor((remainingMs % 60000) / 1000).toString().padStart(2, '0');
        if (expiresAt) this.currentExpiresAt = expiresAt;

        const required = this.event ? (this.event.required_fragments || DEFAULT_REQUIRED_FRAGMENTS) : DEFAULT_REQUIRED_FRAGMENTS;
        const contributed = this.event ? (this.event.contributed_fragments || 0) : 0;
        const fragProgress = Math.min(100, Math.floor((contributed / required) * 100));

        const hasBow = game.state.inventory.some(i => i.equipped && i.type === 'weapon' && i.ranged);
        const hasHealthPotion = game.state.inventory.some(i => i.type === 'potion' && i.name === 'Зелье восстановления хп');

        const playerHp = game.state.stats.hp || 0;
        const playerMaxHp = (typeof game.calcStats === 'function' ? game.calcStats(false).hp : playerHp) || 100;
        const playerHpPct = playerMaxHp > 0 ? Math.floor((playerHp / playerMaxHp) * 100) : 0;

        const rarityColor = { legendary: '#e5c07b', epic: '#c678dd', rare: '#5b8af0', common: '#9ca3af' };
        const rarityLabel = { legendary: 'ЛЕГЕНД.', epic: 'ЭПИК', rare: 'РЕДКИЙ', common: 'ОБЫЧНЫЙ' };

        let html = '';

        // ── Шапка: назад + имя босса ──
        html += `<div style="padding:14px 0 0;">
            <button onclick="Altar.goBackToList()" style="background:none;border:none;color:var(--gray);font-size:0.85rem;cursor:pointer;display:flex;align-items:center;gap:4px;padding:0;margin-bottom:14px;">
                ‹ Назад к Алтарю
            </button>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <div style="width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:2rem;background:rgba(109,40,217,0.18);border:1px solid rgba(109,40,217,0.35);">
                    ${boss.icon}
                </div>
                <div>
                    <div style="font-size:1.15rem;font-weight:700;">${boss.name}</div>
                    <div style="font-size:0.8rem;color:var(--gray);margin-top:2px;">${boss.desc}</div>
                    <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:0.75rem;color:#f87171;background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.25);border-radius:99px;padding:2px 8px;">❤️ ${bossMax.toLocaleString()} HP</span>
                        <span style="font-size:0.75rem;color:#60a5fa;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.25);border-radius:99px;padding:2px 8px;">🛡️ ${bossArmor} брони</span>
                    </div>
                </div>
            </div>
        </div>`;

        // ── Сбор фрагментов / бой / убит ──
        if (status === 'waiting') {
            html += `<div class="card" style="border:1px solid rgba(109,40,217,0.2);border-radius:14px;padding:14px;margin-bottom:10px;">
                <div style="font-weight:700;font-size:0.95rem;margin-bottom:10px;">🧩 Сбор фрагментов</div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--gray);margin-bottom:6px;">
                    <span>Прогресс</span>
                    <span>${contributed} / ${required}</span>
                </div>
                <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;margin-bottom:12px;">
                    <div style="height:100%;width:${fragProgress}%;background:linear-gradient(90deg,var(--accent,#a855f7),#ffaa00);border-radius:99px;transition:width 0.5s;"></div>
                </div>
                <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;">
                    <button class="act-btn" onclick="Altar.contribute(1)">+1</button>
                    <button class="act-btn" onclick="Altar.contribute(5)">+5</button>
                    <button class="act-btn" onclick="Altar.contribute(10)">+10</button>
                    <input id="altar-contribute-input" type="number" min="1" value="1" style="width:60px;padding:5px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.25);color:#fff;font-size:0.85rem;" />
                    <button class="act-btn" onclick="Altar.contribute(Number(document.getElementById('altar-contribute-input').value)||1)">Внести</button>
                </div>
                <div style="text-align:center;margin-top:4px;">
                    <button class="cooldown-btn" ${contributed < required ? 'disabled' : ''} onclick="Altar.summonBoss()" style="width:100%;padding:10px;">
                        ${contributed < required ? `Нужно ещё ${required - contributed} фрагментов` : '⚡ Призвать босса'}
                    </button>
                </div>
            </div>`;
        } else if (status === 'active') {
            html += `<div class="card" style="border:1px solid rgba(220,38,38,0.35);border-radius:14px;padding:14px;margin-bottom:10px;box-shadow:0 0 20px rgba(220,38,38,0.12);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <div style="font-weight:700;font-size:0.95rem;">⚔️ Босс на арене</div>
                    <div style="font-size:0.8rem;color:var(--gray);">Ушёт через <span class="altar-countdown" style="color:#fbbf24;font-family:monospace;">${remainingMin}:${remainingSec}</span></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--gray);margin-bottom:4px;">
                    <span>HP Босса</span><span>${bossHp.toLocaleString()} / ${bossMax.toLocaleString()}</span>
                </div>
                <div style="height:10px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;margin-bottom:14px;">
                    <div style="height:100%;width:${hpPct}%;background:linear-gradient(90deg,#dc2626,#f87171);border-radius:99px;transition:width 0.5s;"></div>
                </div>
                <div style="display:flex;gap:8px;justify-content:center;">
                    <button class="cooldown-btn" style="flex:1;padding:12px;font-size:1.2rem;" onclick="Altar.attackBoss('melee')">⚔️ Удар</button>
                    <button class="cooldown-btn" style="flex:1;padding:12px;font-size:1.2rem;" ${!hasBow ? 'disabled' : ''} onclick="Altar.attackBoss('ranged')">🏹 Лук</button>
                    <button class="cooldown-btn" style="flex:1;padding:12px;font-size:1.2rem;" ${!hasHealthPotion ? 'disabled' : ''} onclick="Altar.useHealthPotion()">💊 HP</button>
                </div>
            </div>`;

            // HP игрока
            html += `<div class="card" style="border:1px solid rgba(59,130,246,0.2);border-radius:14px;padding:12px;margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--gray);margin-bottom:4px;">
                    <span>Ваш HP</span><span>${playerHp.toLocaleString()} / ${playerMaxHp.toLocaleString()}</span>
                </div>
                <div style="height:6px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
                    <div style="height:100%;width:${playerHpPct}%;background:linear-gradient(90deg,#2563eb,#60a5fa);border-radius:99px;transition:width 0.5s;"></div>
                </div>
            </div>`;
        } else if (status === 'defeated') {
            const isOnCooldown = remainingMs > 0;
            if (isOnCooldown) {
                this.currentExpiresAt = expiresAt;
                html += `<div class="card" style="border:1px solid rgba(245,158,11,0.3);border-radius:14px;padding:14px;margin-bottom:10px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="font-size:1.8rem;">⏱</div>
                        <div>
                            <div style="font-weight:700;color:#fbbf24;">Перезарядка</div>
                            <div style="font-size:0.8rem;color:var(--gray);">Следующий призыв через <span class="altar-countdown" style="color:#fbbf24;font-family:monospace;">${remainingMin}:${remainingSec}</span></div>
                        </div>
                    </div>
                </div>`;
            } else {
                html += `<div class="card" style="border:1px solid rgba(34,197,94,0.3);border-radius:14px;padding:14px;margin-bottom:10px;text-align:center;">
                    <div style="font-size:1.5rem;margin-bottom:4px;">✅</div>
                    <div style="font-weight:700;color:#4ade80;">Готов к призыву</div>
                    <div style="font-size:0.8rem;color:var(--gray);margin-top:2px;">Соберите фрагменты для нового боя</div>
                </div>`;
            }

            // Последний дроп
            if (this.event.drop_log) {
                const log = typeof this.event.drop_log === 'string' ? JSON.parse(this.event.drop_log) : this.event.drop_log;
                if (log && log.item) {
                    const rColor = rarityColor[log.rarity] || '#9ca3af';
                    html += `<div class="card" style="border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:12px;margin-bottom:10px;">
                        <div style="font-size:0.75rem;color:var(--gray);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Последний дроп</div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="width:8px;height:8px;border-radius:50%;background:${rColor};flex-shrink:0;"></div>
                            <span style="font-weight:600;">${log.user}</span>
                            <span style="color:var(--gray);font-size:0.85rem;">получил</span>
                            <span style="font-weight:700;color:${rColor};">${log.item}</span>
                        </div>
                    </div>`;
                }
            }
        }

        // ── Таблица дропа ──
        const drops = this.getDropTable();
        if (drops.length) {
            const mf = (typeof game.calcStats === 'function' ? game.calcStats(true).mf : 0);
            html += `<div class="card" style="border:1px solid rgba(109,40,217,0.2);border-radius:14px;padding:14px;margin-bottom:10px;">
                <div style="font-weight:700;font-size:0.95rem;margin-bottom:4px;">🎁 Таблица дропа</div>
                <div style="font-size:0.75rem;color:var(--gray);margin-bottom:10px;">MF: ${Math.floor(mf)} (повышает каждый шанс на MF/100%)</div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    ${drops.map(d => {
                        const color = rarityColor[d.rarity] || '#9ca3af';
                        const label = rarityLabel[d.rarity] || d.rarity;
                        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:rgba(255,255,255,0.04);border-radius:8px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
                                <span style="font-size:0.88rem;">${d.name}</span>
                                <span style="font-size:0.7rem;font-weight:700;color:${color};">[${label}]</span>
                            </div>
                            <span style="font-size:0.8rem;font-family:monospace;color:var(--gray);">${d.baseChance}%</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }

        // ── Статистика урона ──
        // Показываем только после завершения боя (или во время ожидания), но не во время самого сражения.
        if (status !== 'active') {
            html += `<div class="card" style="border:1px solid rgba(109,40,217,0.2);border-radius:14px;padding:14px;margin-bottom:10px;">
                <div style="font-weight:700;font-size:0.95rem;margin-bottom:10px;">📊 Урон участников</div>
                ${this._renderDamageRanking()}
            </div>`;
        }

        // ── Вклады ──
        html += `<div class="card" style="border:1px solid rgba(109,40,217,0.2);border-radius:14px;padding:14px;margin-bottom:10px;">
            <div style="font-weight:700;font-size:0.95rem;margin-bottom:10px;">🧩 Вклады (фрагменты)</div>
            ${this._renderContributionsRanking()}
        </div>`;

        return html;
    },

    // ─────────────────────────────────────────────
    //  ВСПОМОГАТЕЛЬНЫЕ ЧАСТИ РЕНДЕРА
    // ─────────────────────────────────────────────

    _renderDamageRanking() {
        if (!this.damage || !this.damage.length) {
            return '<p style="color:var(--gray);font-size:0.85rem;margin:0;">Данные об уроне появятся во время боя.</p>';
        }

        const map = {};
        this.damage.forEach(row => {
            const key = row.user_id || row.user_name || 'unknown';
            if (!map[key]) map[key] = { user: row.user_name || 'Игрок', damage: 0, hp: null };
            map[key].damage += (row.damage || 0);
            if (row.player_hp !== undefined) map[key].hp = row.player_hp;
        });
        const list = Object.values(map).sort((a, b) => b.damage - a.damage);
        const maxDmg = list[0] ? list[0].damage : 1;
        const totalDmg = list.reduce((s, r) => s + r.damage, 0);
        const medalColors = ['#e5c07b', '#9ca3af', '#cd7f32'];

        let html = '<div style="display:flex;flex-direction:column;gap:6px;">';
        list.forEach((row, i) => {
            const bar = Math.round((row.damage / maxDmg) * 100);
            const medal = medalColors[i] || '#6b7280';
            html += `<div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:0.8rem;font-weight:700;color:${medal};width:18px;text-align:center;">#${i+1}</span>
                <span style="font-size:0.88rem;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${row.user}</span>
                <div style="width:60px;height:5px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
                    <div style="height:100%;width:${bar}%;background:${i===0?'#e5c07b':'#5b8af0'};border-radius:99px;"></div>
                </div>
                <span style="font-size:0.78rem;font-family:monospace;color:var(--gray);width:60px;text-align:right;">${row.damage.toLocaleString()}</span>
            </div>`;
        });
        html += `</div><div style="text-align:right;font-size:0.8rem;color:var(--gray);margin-top:8px;">Всего урона: <b style="color:#fff;">${totalDmg.toLocaleString()}</b></div>`;
        return html;
    },

    _renderContributionsRanking() {
        if (!this.contributions || !this.contributions.length) {
            return '<p style="color:var(--gray);font-size:0.85rem;margin:0;">Пока никто не вносил фрагменты.</p>';
        }

        const map = {};
        this.contributions.forEach(row => {
            const key = row.user_id || row.user_name || 'unknown';
            if (!map[key]) map[key] = { user: row.user_name || 'Игрок', fragments: 0 };
            map[key].fragments += (row.fragments || 0);
        });
        const list = Object.values(map).sort((a, b) => b.fragments - a.fragments);
        const maxFrag = list[0] ? list[0].fragments : 1;

        let html = '<div style="display:flex;flex-direction:column;gap:6px;">';
        list.forEach((row, i) => {
            const bar = Math.round((row.fragments / maxFrag) * 100);
            html += `<div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:0.8rem;color:var(--gray);width:18px;text-align:center;">${i+1}</span>
                <span style="font-size:0.88rem;flex:1;">${row.user}</span>
                <div style="width:60px;height:5px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
                    <div style="height:100%;width:${bar}%;background:var(--accent,#a855f7);border-radius:99px;"></div>
                </div>
                <span style="font-size:0.78rem;font-family:monospace;color:var(--gray);width:30px;text-align:right;">${row.fragments}</span>
            </div>`;
        });
        html += '</div>';
        return html;
    },

    _renderSchemaError() {
        return `<div class="card">
            <p style="color:var(--red)">Ошибка доступа к таблицам Supabase.</p>
            <p style="color:var(--gray);font-size:0.85rem;">Создайте нужные таблицы в Supabase SQL Editor:</p>
            <pre style="background:rgba(255,255,255,0.08);padding:8px;border-radius:6px;font-size:0.75rem;overflow:auto;">create table altar_events (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'waiting',
  required_fragments int not null default ${DEFAULT_REQUIRED_FRAGMENTS},
  contributed_fragments int not null default 0,
  boss_hp int, boss_max_hp int, boss_armor int,
  drop_log jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table altar_contributions (
  id uuid primary key default gen_random_uuid(),
  altar_id uuid references altar_events(id),
  user_id text, user_name text, fragments int,
  created_at timestamptz default now()
);

create table altar_damage (
  id uuid primary key default gen_random_uuid(),
  altar_id uuid references altar_events(id),
  user_id text, user_name text, damage int,
  created_at timestamptz default now()
);</pre>
            <button class="act-btn" onclick="Altar.showTableColumns('altar_events')">Показать колонки altar_events</button>
        </div>`;
    },

    _renderNoEvent() {
        return `<div class="card">
            <p style="color:var(--gray)">Не удалось загрузить состояние Алтаря. Проверьте настройки Supabase.</p>
            <button class="act-btn" onclick="Altar.refresh()">Повторить</button>
        </div>`;
    },

    async showTableColumns(tableName) {
        if (!supabaseClient) return;
        const { data, error } = await supabaseClient
            .from('information_schema.columns')
            .select('column_name,data_type')
            .eq('table_name', tableName);
        if (error) {
            console.warn('Altar: failed to query table columns', error);
            game.msg('Не удалось получить схему таблицы. Проверьте права Supabase.');
            return null;
        }
        console.table(data);
        game.msg(`Схема ${tableName} выведена в консоль (F12).`);
        return data;
    }
};

// Закрепление контекста (чтобы методы не теряли this, если их вызывают как callback)
['init','refresh','loadEvent','loadContributions','loadDamage','expireBoss','contribute','summonBoss','attackBoss','useHealthPotion','openMenu','openBoss','goBackToList'].forEach(fn => {
    if (typeof Altar[fn] === 'function') {
        Altar[fn] = Altar[fn].bind(Altar);
    }
});

Object.assign(game, {
    openAltarMenu() {
        if (typeof Altar !== 'undefined' && typeof Altar.openMenu === 'function') {
            Altar.openMenu();
        } else {
            game.switchTab('altar-menu');
        }
    }
});
