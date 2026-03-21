// duel.js — дуэли (тренировка локально; PvP и ЛС Telegram — задел под бэкенд)

const Duel = {
    schemaError: null,
    topList: [],

    isAdmin() {
        return !!window.TG_IS_ADMIN;
    },

    async init() {
        this.updatePortalVisibility();
        await this.loadTop();
    },

    updatePortalVisibility() {
        const el = document.getElementById('portal-node-duel');
        if (el) el.style.display = '';
    },

    renderSchemaError() {
        return `<div class="card"><p style="color:var(--red)">Опционально: таблица duel_wins для топа.</p>
<pre style="font-size:0.72rem;">create table if not exists duel_wins (
  user_id bigint primary key,
  user_name text,
  wins int default 0,
  updated_at timestamptz default now()
);</pre></div>`;
    },

    async loadTop() {
        if (!supabaseClient) return;
        const { data, error } = await supabaseClient.from('duel_wins').select('*').order('wins', { ascending: false }).limit(20);
        if (error) {
            this.schemaError = error;
            this.topList = [];
            return;
        }
        this.schemaError = null;
        this.topList = data || [];
    },

    async upsertWin() {
        const uid = game.playerTelegramId;
        if (!uid || !supabaseClient) return;
        const name = tg?.initDataUnsafe?.user?.first_name || 'Игрок';
        const wins = Math.floor(game.state.stats?.duel_wins || 0);
        await supabaseClient.from('duel_wins').upsert({
            user_id: uid,
            user_name: name,
            wins,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    },

    openMenu() {
        game.switchTab('duel-menu');
        this.renderMenu();
        this.loadTop().then(() => this.renderMenu());
    },

    setOptIn(v) {
        game.state.stats = game.state.stats || {};
        game.state.stats.duel_opt_in = !!v;
        game.msg(v ? 'Запросы дуэлей включены (уведомления в ЛС нужен Telegram-бот на сервере).' : 'Запросы дуэлей выключены.');
        game.updateUI?.();
    },

    renderMenu() {
        const c = document.getElementById('duel-menu-content');
        if (!c) return;
        game.state.stats = game.state.stats || {};
        const opt = !!game.state.stats.duel_opt_in;
        let topHtml = (this.topList || []).map((r, i) => `<div>${i + 1}. ${r.user_name || r.user_id} — <b>${r.wins || 0}</b></div>`).join('') || '<div style="color:var(--gray)">Топ пуст (или нет таблицы duel_wins).</div>';
        if (this.schemaError) topHtml = this.renderSchemaError() + topHtml;
        c.innerHTML = `
            <div class="card">
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
                    <input type="checkbox" ${opt ? 'checked' : ''} onchange="Duel.setOptIn(this.checked)">
                    <span>Получать запросы на дуэль (для ЛС нужен бот; пока проверяйте меню)</span>
                </label>
            </div>
            <div class="card">
                <button class="cooldown-btn" onclick="Duel.startTraining()">ТРЕНИРОВКА (без ставки)</button>
                <p style="font-size:0.82rem;color:var(--gray);">До 2 побед в раунде. Есть меч / лук / зелье.</p>
            </div>
            <div class="card">
                <h4 style="margin:0 0 8px;">Топ побед</h4>
                ${topHtml}
            </div>
            <div class="card" style="opacity:0.75;">
                <b>PvP со ставкой</b> — в разработке (нужна синхронизация двух клиентов и эскроу).
            </div>`;
    },

    startTraining() {
        const s = game.calcStats(true);
        const hp = Math.max(80, Math.floor(s.hp || 100));
        game.duelBattle = {
            mode: 'training',
            wins: [0, 0],
            round: 1,
            pHp: hp,
            pMax: hp,
            oHp: hp,
            oMax: hp,
            oppStrMul: 0.85,
            potionLeft: 1,
            log: ''
        };
        game.switchTab('duel-battle-screen');
        Duel.renderBattle();
    },

    _oppDamage() {
        const s = game.calcStats(true);
        const base = Math.floor((s.str || 10) * game.duelBattle.oppStrMul);
        return Math.max(5, base + Math.floor(Math.random() * 15));
    },

    _myMeleeDmg() {
        const s = game.calcStats(true);
        return Math.max(8, Math.floor(s.str * (0.9 + Math.random() * 0.2)));
    },

    _myBowDmgFromStack(ap) {
        const s = game.calcStats(true);
        let d = (s.bow_weapon_base || 0) + (s.bow_str || 0) + Math.floor((s.str || 0) * 0.15);
        ap.stack.count -= 1;
        if (ap.stack.count <= 0) game.state.inventory = game.state.inventory.filter(i => i.id !== ap.stack.id);
        return Math.max(6, d);
    },

    renderBattle() {
        const b = game.duelBattle;
        if (!b) return;
        const el = document.getElementById('duel-battle-content');
        if (!el) return;
        const bowOk = typeof game.getActiveArrowStack === 'function' && game.getActiveArrowStack();
        el.innerHTML = `
            <div class="card">Раунд ${b.round} | Счёт: вы ${b.wins[0]} — ${b.wins[1]} бот</div>
            <div class="card">
                <div>Ваше HP: <b>${Math.floor(b.pHp)}</b> / ${b.pMax}</div>
                <div class="hp-bar"><div class="hp-fill" style="width:${Math.max(0, b.pHp / b.pMax * 100)}%;background:var(--blue)"></div></div>
                <div style="margin-top:8px;">Противник HP: <b>${Math.floor(b.oHp)}</b> / ${b.oMax}</div>
                <div class="hp-bar"><div class="hp-fill" style="width:${Math.max(0, b.oHp / b.oMax * 100)}%;background:var(--red)"></div></div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
                <button class="cooldown-btn" onclick="Duel.playerAttack('melee')">⚔️ Меч</button>
                <button class="cooldown-btn" ${bowOk ? '' : 'disabled'} onclick="Duel.playerAttack('bow')">🏹 Лук</button>
                <button class="cooldown-btn" ${b.potionLeft ? '' : 'disabled'} onclick="Duel.playerAttack('potion')">💊 Зелье</button>
            </div>
            <p style="text-align:center;font-size:0.85rem;color:var(--gray);">${b.log || ''}</p>
            <button class="top-btn" style="margin-top:12px;" onclick="game.switchTab('duel-menu');Duel.renderMenu();">Выйти</button>`;
        game.updateUI?.();
    },

    playerAttack(kind) {
        const b = game.duelBattle;
        if (!b) return;
        let myDmg = 0;
        if (kind === 'melee') {
            myDmg = this._myMeleeDmg();
            b.oHp -= myDmg;
            b.log = `Вы ударили на ${myDmg}.`;
        } else if (kind === 'bow') {
            const ap = typeof game.getActiveArrowStack === 'function' ? game.getActiveArrowStack() : null;
            if (!ap) {
                game.msg('Нет стрел.');
                return;
            }
            myDmg = this._myBowDmgFromStack(ap);
            if (myDmg <= 0) return;
            b.oHp -= myDmg;
            b.log = `Вы выстрелили на ${myDmg}.`;
        } else if (kind === 'potion') {
            if (!b.potionLeft) return;
            b.potionLeft--;
            const heal = Math.floor(b.pMax * 0.25);
            b.pHp = Math.min(b.pMax, b.pHp + heal);
            b.log = `+${heal} HP`;
        }
        if (b.oHp <= 0) {
            b.wins[0]++;
            if (b.wins[0] >= 2) {
                game.state.stats.duel_wins = Math.floor((game.state.stats.duel_wins || 0) + 1);
                game.msg('Победа в дуэли!');
                this.upsertWin();
                game.switchTab('duel-menu');
                this.renderMenu();
                game.duelBattle = null;
                game.updateUI?.();
                return;
            }
            b.round++;
            b.pHp = b.pMax;
            b.oHp = b.oMax;
            b.potionLeft = 1;
            b.log = 'Новый раунд!';
            this.renderBattle();
            return;
        }
        const od = this._oppDamage();
        b.pHp -= od;
        b.log += ` Враг ответил на ${od}.`;
        if (b.pHp <= 0 && b.oHp <= 0) {
            game.msg('Ничья: оба повержены.');
            game.switchTab('duel-menu');
            this.renderMenu();
            game.duelBattle = null;
            return;
        }
        if (b.pHp <= 0) {
            b.wins[1]++;
            if (b.wins[1] >= 2) {
                game.msg('Поражение.');
                game.switchTab('duel-menu');
                this.renderMenu();
                game.duelBattle = null;
                return;
            }
            b.round++;
            b.pHp = b.pMax;
            b.oHp = b.oMax;
            b.potionLeft = 1;
            b.log = 'Новый раунд после поражения в раунде.';
        }
        this.renderBattle();
    }
};

Object.assign(game, {
    openDuelMenu() {
        Duel.openMenu();
    }
});
