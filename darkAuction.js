// darkAuction.js — выходные слоты по 3ч, регистрация 10 мин, 3 лота

const DA_SLOT_MS = 3 * 60 * 60 * 1000;
const DA_REG_MS = 10 * 60 * 1000;
const DA_ITEM_BASE_MS = 5 * 60 * 1000;
const DA_BID_EXTEND_MS = 90 * 1000;
const DA_ITEM_MAX_MS = 20 * 60 * 1000;
const DA_POST_MS = 60 * 1000;
const DA_MIN_INCREMENT = 800000;

function daIsWeekend(d = new Date()) {
    const day = d.getDay();
    return day === 6 || day === 0;
}

function daSlotBounds(d = new Date()) {
    const sod = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const idx = Math.floor((d.getTime() - sod) / DA_SLOT_MS);
    const start = sod + idx * DA_SLOT_MS;
    const end = start + DA_SLOT_MS;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}_S${idx}`;
    return { start, end, idx, key, sod };
}

const DA_REWARDS = () => [
    {
        id: 'void_blade',
        title: 'Клинок Бездны',
        startBid: 10000000,
        reward: {
            kind: 'weapon',
            payload: { name: 'Клинок Бездны', type: 'weapon', str: 120, cc: 15, cd: 40, rarity: 'legendary', desc: 'Легендарный меч с Dark Auction.' }
        }
    },
    {
        id: 'pet_owl',
        title: 'Боевая сова (питомец)',
        startBid: 6000000,
        reward: {
            kind: 'pet',
            payload: { name: 'Боевая сова', type: 'pet', skill: 'combat', rarity: 'epic', lvl: 1, xp: 0, next: 100, cost: 0, desc: '+урон в бою за уровень.' }
        }
    },
    {
        id: 'pet_warden',
        title: 'Хранитель Рока',
        startBid: 12000000,
        reward: {
            kind: 'pet',
            payload: {
                name: 'Хранитель Рока', type: 'pet', skill: 'mining', rarity: 'legendary', lvl: 1, xp: 0, next: 100, cost: 0,
                universal_bonus: true,
                desc: 'Универсал: даёт +0.05% ко всем основным скилам за уровень (через бонусы питомца).'
            }
        }
    },
    {
        id: 'art_moon',
        title: 'Артефакт «Лунный осколок»',
        startBid: 5000000,
        reward: { kind: 'accessory', payload: { name: 'Лунный осколок', type: 'accessory', mf: 12, str: 5, rarity: 'rare' } }
    },
    {
        id: 'art_dusk',
        title: 'Артефакт «Сумеречное кольцо»',
        startBid: 5200000,
        reward: { kind: 'accessory', payload: { name: 'Сумеречное кольцо', type: 'accessory', def: 8, cd: 6, rarity: 'rare' } }
    },
    {
        id: 'art_void',
        title: 'Артефакт «Пыль Бездны»',
        startBid: 4800000,
        reward: { kind: 'accessory', payload: { name: 'Пыль Бездны', type: 'accessory', cc: 3, mf: 8, rarity: 'rare' } }
    },
    {
        id: 'art_echo',
        title: 'Артефакт «Эхо катакомб»',
        startBid: 5500000,
        reward: { kind: 'accessory', payload: { name: 'Эхо катакомб', type: 'accessory', dungeon_exp_bonus: 4, str: 4, rarity: 'rare' } }
    },
    {
        id: 'art_blood',
        title: 'Артефакт «Кровавая печать»',
        startBid: 5100000,
        reward: { kind: 'accessory', payload: { name: 'Кровавая печать', type: 'accessory', cd: 8, hp: 15, rarity: 'rare' } }
    },
    {
        id: 'gem_bundle',
        title: 'Gem Stone ×64',
        startBid: 10000000,
        reward: { kind: 'material', payload: { name: 'Gem Stone', type: 'material', count: 64 } }
    },
    {
        id: 'bulk_mithril',
        title: 'Мифрил ×1024',
        startBid: 50000000,
        reward: { kind: 'material', payload: { name: 'Мифрил', type: 'material', count: 1024 } }
    }
];

function daPickThreeItems(slotKey) {
    const pool = DA_REWARDS();
    let h = 0;
    for (let i = 0; i < slotKey.length; i++) h = (h * 31 + slotKey.charCodeAt(i)) >>> 0;
    const out = [];
    const used = new Set();
    while (out.length < 3 && used.size < pool.length) {
        h = (h * 1103515245 + 12345) >>> 0;
        const ix = h % pool.length;
        if (!used.has(ix)) {
            used.add(ix);
            out.push(JSON.parse(JSON.stringify(pool[ix])));
        }
    }
    return out;
}

function daIsMissingTableError(err) {
    if (!err) return false;
    const c = String(err.code || '');
    const m = `${err.message || ''} ${err.details || ''} ${err.hint || ''}`.toLowerCase();
    if (c === 'pgrst205' || c === '42p01') return true;
    if (/\b404\b/.test(m) || m.includes('schema cache') || m.includes('does not exist')) return true;
    return false;
}

const DarkAuction = {
    schemaError: null,
    /** Таблицы нет в БД — не дёргаем REST, чтобы не спамить 404 */
    skipRemote: false,
    live: null,
    pollTimer: null,

    isAdmin() {
        return !!window.TG_IS_ADMIN;
    },

    async init() {
        this.updatePortalVisibility();
        this.pollTimer = setInterval(() => this.tick(), 8000);
        await this.tick();
    },

    renderSchemaError() {
        return `<div class="card"><p style="color:var(--red)">Таблица <code>dark_auction_state</code> не найдена (404). Создай её в Supabase.</p>
<p style="font-size:0.85rem;">Готовый скрипт: файл <b>sql/dark_auction_state.sql</b> → <b>SQL Editor</b> → Run.</p>
<button type="button" class="act-btn" onclick="DarkAuction.retryRemote()">Проверить снова после создания таблицы</button>
<pre style="white-space:pre-wrap;font-size:0.72rem;background:rgba(255,255,255,0.06);padding:8px;border-radius:8px;margin-top:10px;">create table if not exists public.dark_auction_state (
  id int primary key default 1,
  slot_key text not null default '',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
insert into public.dark_auction_state (id, slot_key, data) values (1, '', '{}')
  on conflict (id) do nothing;
-- полный файл: sql/dark_auction_state.sql (RLS для anon)</pre></div>`;
    },

    retryRemote() {
        this.skipRemote = false;
        this.schemaError = null;
        this.tick().then(() => this.render());
    },

    async loadRow() {
        if (!supabaseClient || this.skipRemote) return null;
        const { data, error } = await supabaseClient.from('dark_auction_state').select('*').eq('id', 1).maybeSingle();
        if (error) {
            this.schemaError = error;
            if (daIsMissingTableError(error)) {
                this.skipRemote = true;
                console.info('[DarkAuction] Таблица dark_auction_state отсутствует — локальный режим. Выполни sql/dark_auction_state.sql в Supabase.');
            }
            return null;
        }
        this.schemaError = null;
        return data;
    },

    async saveRow(slotKey, data) {
        if (!supabaseClient || this.skipRemote) return;
        const { error } = await supabaseClient.from('dark_auction_state').upsert({
            id: 1,
            slot_key: slotKey,
            data,
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        if (error) console.warn('DarkAuction save', error);
    },

    freshState(items) {
        const now = Date.now();
        return {
            participants: {},
            itemIndex: 0,
            items,
            highBid: 0,
            leaderId: null,
            leaderName: '',
            bids: {},
            itemStartedAt: now,
            itemEndsAt: now + DA_ITEM_BASE_MS,
            phase: 'register',
            postUntil: null
        };
    },

    async tick() {
        if (!daIsWeekend()) {
            this.live = null;
            this.updatePortalVisibility();
            return;
        }
        const { key, start } = daSlotBounds();
        const now = Date.now();
        const row = await this.loadRow();
        let data;
        if (this.skipRemote || !row || this.schemaError) {
            if (this.live?.slotKey === key && this.live?.data) {
                data = this.live.data;
            } else {
                data = this.freshState(daPickThreeItems(key));
            }
            this.applyPhaseLogic(data, start, now);
            this.live = { slotKey: key, localOnly: true, offline: this.skipRemote, data };
            this.updatePortalVisibility();
            if (document.getElementById('dark-auction-menu')?.classList.contains('active')) this.render();
            return;
        }
        if (row.slot_key !== key) {
            data = this.freshState(daPickThreeItems(key));
            await this.saveRow(key, data);
        } else {
            data = typeof row.data === 'object' && row.data ? row.data : this.freshState(daPickThreeItems(key));
            if (!data.items || !data.items.length) data.items = daPickThreeItems(key);
        }
        this.applyPhaseLogic(data, start, now);
        this.live = { slotKey: key, data };
        await this.saveRow(key, data);
        this.updatePortalVisibility();
        if (document.getElementById('dark-auction-menu')?.classList.contains('active')) this.render();
    },

    applyPhaseLogic(data, slotStart, now) {
        const regEnd = slotStart + DA_REG_MS;
        if (now < regEnd) {
            data.phase = 'register';
            return;
        }
        if (data.phase === 'register') {
            data.phase = 'bidding';
            data.itemIndex = data.itemIndex || 0;
            this.ensureItemTimer(data, now);
        }
        if (data.phase === 'bidding') {
            const items = data.items || [];
            if (data.itemIndex >= items.length) {
                data.phase = 'post';
                data.postUntil = now + DA_POST_MS;
                return;
            }
            if (now >= (data.itemEndsAt || 0) && data.itemIndex < items.length) {
                data.itemEndsAt = now + 365 * 24 * 3600000;
                this.settleCurrentItem(data);
                if (data.itemIndex >= items.length) {
                    data.phase = 'post';
                    data.postUntil = now + DA_POST_MS;
                } else {
                    this.startNextItem(data, now);
                }
            }
        }
        if (data.phase === 'post' && data.postUntil && now >= data.postUntil) {
            data.phase = 'closed';
        }
    },

    ensureItemTimer(data, now) {
        const it = data.items[data.itemIndex];
        if (!it) return;
        if (!data.itemStartedAt) {
            data.itemStartedAt = now;
            data.highBid = 0;
            data.leaderId = null;
            data.leaderName = '';
            data.bids = {};
            data.itemEndsAt = now + DA_ITEM_BASE_MS;
        }
    },

    startNextItem(data, now) {
        data.itemStartedAt = now;
        data.highBid = 0;
        data.leaderId = null;
        data.leaderName = '';
        data.bids = {};
        data.itemEndsAt = now + DA_ITEM_BASE_MS;
    },

    settleCurrentItem(data) {
        const uid = game.playerTelegramId ? String(game.playerTelegramId) : null;
        const items = data.items || [];
        const it = items[data.itemIndex];
        if (!it) {
            data.itemIndex++;
            return;
        }
        const winnerId = data.leaderId;
        const amount = Math.floor(data.highBid || 0);
        if (winnerId && amount > 0 && winnerId === uid) {
            if (game.state.coins >= amount) {
                game.state.coins -= amount;
                this.grantRewardLocal(it.reward);
                game.msg(`Dark Auction: вы выиграли «${it.title}» за ${amount.toLocaleString()} 💰`);
                if (typeof Casino !== 'undefined' && Casino.addToTreasury) {
                    Casino.addToTreasury(Math.floor(amount * 0.7), 'dark_auction');
                }
            } else {
                game.msg(`Dark Auction: не хватило монет для оплаты лота «${it.title}».`);
            }
        }
        data.itemIndex++;
    },

    grantRewardLocal(reward) {
        const r = reward;
        if (!r || !r.kind) return;
        if (r.kind === 'weapon' || r.kind === 'accessory') {
            const o = { ...r.payload, id: game.state.nextItemId++, equipped: false, count: 1 };
            delete o.cost;
            game.state.inventory.push(o);
        } else if (r.kind === 'pet') {
            game.state.pets.push({ ...r.payload, equipped: false });
        } else if (r.kind === 'material') {
            game.addMaterial(r.payload.name, 'material', r.payload.count || 1, r.payload);
        }
        game.updateUI?.();
    },

    parseMoneyInput(raw) {
        let s = String(raw || '').trim().toLowerCase().replace(/\s/g, '').replace(/,/g, '.');
        if (!s) return NaN;
        let mul = 1;
        if (s.endsWith('м') || s.endsWith('m')) {
            mul = 1e6;
            s = s.slice(0, -1);
        } else if (s.endsWith('к') || s.endsWith('k')) {
            mul = 1e3;
            s = s.slice(0, -1);
        }
        const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
        return Number.isFinite(n) ? Math.floor(n * mul) : NaN;
    },

    minNextBid(data) {
        const it = data.items[data.itemIndex];
        if (!it) return 0;
        const start = it.startBid || 0;
        if (!data.leaderId) return start;
        return Math.max(start, (data.highBid || 0) + DA_MIN_INCREMENT);
    },

    async register() {
        await this.tick();
        const uid = game.playerTelegramId ? String(game.playerTelegramId) : null;
        if (!uid) {
            game.msg('Войдите через Telegram.');
            return;
        }
        if (!this.live?.data) await this.tick();
        const d = this.live?.data;
        if (!d || d.phase !== 'register') {
            game.msg('Регистрация закрыта.');
            return;
        }
        d.participants = d.participants || {};
        d.participants[uid] = { name: tg?.initDataUnsafe?.user?.first_name || 'Игрок', at: Date.now() };
        await this.saveRow(this.live.slotKey, d);
        game.msg('Вы записаны на Dark Auction!');
        this.render();
    },

    async bidPlus800k() {
        await this.tick();
        const d = this.live?.data;
        if (!d || d.phase !== 'bidding') {
            game.msg('Сейчас нет торгов.');
            return;
        }
        const next = this.minNextBid(d);
        await this.commitBid(next);
    },

    async bidCustom() {
        const inp = document.getElementById('da-bid-input');
        const v = this.parseMoneyInput(inp?.value || '');
        if (!Number.isFinite(v) || v <= 0) {
            game.msg('Введите сумму (например 3м, 23м, 3000000).');
            return;
        }
        await this.tick();
        await this.commitBid(v);
    },

    async commitBid(amount) {
        const uid = game.playerTelegramId ? String(game.playerTelegramId) : null;
        if (!uid) return;
        const d = this.live?.data;
        if (!d || d.phase !== 'bidding') return;
        if (!d.participants || !d.participants[uid]) {
            game.msg('Вы не зарегистрированы на этот аукцион.');
            return;
        }
        const min = this.minNextBid(d);
        if (amount < min) {
            game.msg(`Минимальная ставка: ${min.toLocaleString()} 💰`);
            return;
        }
        if (game.state.coins < amount) {
            game.msg('Недостаточно монет на балансе для такой ставки.');
            return;
        }
        d.bids = d.bids || {};
        d.bids[uid] = amount;
        d.highBid = amount;
        d.leaderId = uid;
        d.leaderName = d.participants[uid]?.name || 'Игрок';
        const now = Date.now();
        const cap = (d.itemStartedAt || now) + DA_ITEM_MAX_MS;
        d.itemEndsAt = Math.min(cap, Math.max(d.itemEndsAt || now, now + DA_BID_EXTEND_MS));
        await this.saveRow(this.live.slotKey, d);
        game.msg(`Ставка ${amount.toLocaleString()} 💰 принята (списание при победе в лоте).`);
        this.render();
    },

    portalVisible() {
        if (!daIsWeekend()) return false;
        if (this.isAdmin()) return true;
        const uid = game.playerTelegramId ? String(game.playerTelegramId) : null;
        if (!this.live?.data) return true;
        const d = this.live.data;
        if (d.phase === 'register') return true;
        if (d.phase === 'closed') return false;
        if (d.phase === 'post') return !!(uid && d.participants && d.participants[uid]);
        if (d.phase === 'bidding') return !!(uid && d.participants && d.participants[uid]);
        return false;
    },

    updatePortalVisibility() {
        const el = document.getElementById('portal-node-dark-auction');
        if (!el) return;
        el.style.display = this.portalVisible() ? '' : 'none';
    },

    openMenu() {
        game.switchTab('dark-auction-menu');
        this.tick().then(() => this.render());
    },

    render() {
        const c = document.getElementById('dark-auction-content');
        if (!c) return;
        if (this.schemaError && !this.live?.localOnly) {
            c.innerHTML = this.renderSchemaError();
            return;
        }
        if (!daIsWeekend()) {
            c.innerHTML = '<div class="card">Dark Auction только в субботу и воскресенье.</div>';
            return;
        }
        const d = this.live?.data;
        if (!d) {
            c.innerHTML = '<div class="card">Загрузка…</div>';
            return;
        }
        const items = d.items || [];
        const cur = items[d.itemIndex];
        let phaseRu = d.phase === 'register' ? 'РЕГИСТРАЦИЯ' : d.phase === 'bidding' ? 'ТОРГИ' : d.phase === 'post' ? 'ЗАКРЫТИЕ' : 'ПАУЗА ДО СЛОТА';
        let offlineBanner = '';
        if (this.live?.offline) {
            offlineBanner = `<div class="card" style="border-left:3px solid #f59e0b;margin-bottom:10px;">
                ⚠️ Без БД: ставки не синхронизируются между игроками. Создай таблицу (<b>sql/dark_auction_state.sql</b>).
                <button type="button" class="act-btn" style="margin-top:8px;" onclick="DarkAuction.retryRemote()">Подключить БД</button>
            </div>`;
        }
        let html = offlineBanner + `<div class="card"><b>Слот:</b> ${this.live.slotKey}<br><b>Фаза:</b> ${phaseRu}</div>`;
        if (d.phase === 'register') {
            html += `<div class="card"><button class="cooldown-btn" onclick="DarkAuction.register()">ЗАПИСАТЬСЯ НА АУКЦИОН</button><p style="font-size:0.82rem;color:var(--gray);">10 минут в начале каждого 3-часового окна.</p></div>`;
        }
        if (d.phase === 'bidding' && cur) {
            const min = this.minNextBid(d);
            const list = Object.entries(d.bids || {}).map(([id, amt]) => {
                const nm = (d.participants && d.participants[id]?.name) || id;
                return `<div>${nm}: <b>${Math.floor(amt).toLocaleString()}</b> 💰</div>`;
            }).join('') || '<div style="color:var(--gray)">Пока нет ставок</div>';
            html += `<div class="card"><h4 style="margin:0 0 8px;">Лот ${(d.itemIndex || 0) + 1}/3: ${cur.title}</h4>
                <div style="font-size:0.85rem;">Старт: ${cur.startBid.toLocaleString()} 💰 | Лидер: ${d.leaderName || '—'} | Текущая: ${(d.highBid || cur.startBid).toLocaleString()} 💰</div>
                <div style="margin-top:10px;"><b>Ставки:</b></div>${list}
                <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                    <button class="act-btn" onclick="DarkAuction.bidPlus800k()">+800 000 💰 к минимуму</button>
                </div>
                <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    <input id="da-bid-input" type="text" placeholder="23м или 3000000" style="flex:1;min-width:120px;padding:8px;border-radius:8px;border:1px solid var(--dark-gray);background:var(--card);color:inherit;">
                    <button class="act-btn" onclick="DarkAuction.bidCustom()">Поставить сумму</button>
                </div>
                <p style="font-size:0.78rem;color:var(--gray);">Мин. шаг ${DA_MIN_INCREMENT.toLocaleString()} 💰. Монеты списываются только с победителя лота. 70% уходит в казну казино.</p>
                <p style="font-size:0.78rem;">До конца лота: ~${Math.max(0, Math.ceil(((d.itemEndsAt || 0) - Date.now()) / 1000))} сек</p>
            </div>`;
        }
        if (d.phase === 'post') {
            html += `<div class="card">Аукцион завершён. Следующий слот через меню портала (кнопка скроется через минуту).</div>`;
        }
        if (d.phase === 'closed') {
            html += `<div class="card">Слот завершён. Ждите следующее 3-часовое окно.</div>`;
        }
        c.innerHTML = html;
    }
};

Object.assign(game, {
    openDarkAuctionMenu() {
        if (typeof DarkAuction !== 'undefined') DarkAuction.openMenu();
    }
});
