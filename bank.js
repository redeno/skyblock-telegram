// bank.js — вклад под процент

const BANK_TERMS = [
    { id: '12h', label: '12 часов', ms: 12 * 60 * 60 * 1000, baseRate: 0.2, reqLevel: 2 },
    { id: '1d', label: '1 день', ms: 24 * 60 * 60 * 1000, baseRate: 0.35, reqLevel: 1 },
    { id: '3d', label: '3 дня', ms: 3 * 24 * 60 * 60 * 1000, baseRate: 0.6, reqLevel: 1 },
    { id: '7d', label: '7 дней', ms: 7 * 24 * 60 * 60 * 1000, baseRate: 1.0, reqLevel: 1 }
];

const Bank = {
    userId: null,
    userName: null,
    account: null,
    schemaError: null,

    async init() {
        this.userId = game.playerTelegramId ? String(game.playerTelegramId) : 'guest';
        this.userName = tg.initDataUnsafe?.user?.first_name || 'Гость';
        await this.load();
    },

    getRate(term) {
        const lvl = this.account?.level || 1;
        const extra = Math.min(0.4, (lvl - 1) * 0.1);
        return Math.min(1.0, term.baseRate + extra);
    },

    async load() {
        if (!supabaseClient) return;
        this.schemaError = null;
        const { data, error } = await supabaseClient
            .from('bank_accounts')
            .select('*')
            .eq('user_id', this.userId)
            .maybeSingle();
        if (error) {
            this.schemaError = error;
            this.account = null;
            return;
        }
        if (!data) {
            const base = { user_id: this.userId, user_name: this.userName, level: 1, xp: 0, active_deposit: null };
            const { data: created, error: createErr } = await supabaseClient.from('bank_accounts').insert([base]).select().single();
            if (createErr) {
                this.schemaError = createErr;
                this.account = null;
                return;
            }
            this.account = created;
        } else {
            this.account = data;
        }
    },

    async openMenu() {
        game.switchTab('bank-menu');
        await this.load();
        this.render();
    },

    async createDeposit(termId, amount) {
        if (!this.account) return;
        if (this.account.active_deposit) {
            game.msg('Сначала заберите текущий вклад.');
            return;
        }
        const term = BANK_TERMS.find(t => t.id === termId);
        if (!term) return;
        if ((this.account.level || 1) < (term.reqLevel || 1)) {
            game.msg(`Требуется уровень банка ${term.reqLevel}.`);
            return;
        }
        const val = Number(amount || 0);
        if (!Number.isFinite(val) || val <= 0) {
            game.msg('Введите корректную сумму.');
            return;
        }
        if (game.state.coins < val) {
            game.msg('Не хватает монет.');
            return;
        }
        game.state.coins -= val;
        const rate = this.getRate(term);
        const dep = {
            amount: Math.floor(val),
            term_id: term.id,
            term_label: term.label,
            opened_at: Date.now(),
            unlock_at: Date.now() + term.ms,
            rate
        };
        const { error } = await supabaseClient
            .from('bank_accounts')
            .update({ active_deposit: dep, updated_at: new Date().toISOString() })
            .eq('user_id', this.userId);
        if (error) {
            game.state.coins += val;
            game.msg('Ошибка вклада.');
            return;
        }
        this.account.active_deposit = dep;
        game.updateUI?.();
        this.render();
    },

    async claimDeposit() {
        if (!this.account?.active_deposit) return;
        const dep = this.account.active_deposit;
        if (Date.now() < (dep.unlock_at || 0)) {
            game.msg('Вклад еще не созрел.');
            return;
        }
        const reward = Math.floor(dep.amount * (1 + (dep.rate || 0) / 100));
        const xpGain = Math.max(1, Math.floor(dep.amount / 1000000));
        const oldBankLevel = this.account.level || 1;
        let level = oldBankLevel;
        let xp = (this.account.xp || 0) + xpGain;
        while (xp >= 10 && level < 10) {
            xp -= 10;
            level++;
        }
        const bankLevelsGained = level - oldBankLevel;
        if (bankLevelsGained > 0 && typeof game.addXp === 'function') {
            game.addXp('skyblock', bankLevelsGained);
        }
        game.state.coins += reward;
        const patch = { active_deposit: null, level, xp, updated_at: new Date().toISOString() };
        const { error } = await supabaseClient.from('bank_accounts').update(patch).eq('user_id', this.userId);
        if (error) {
            game.msg('Ошибка выдачи вклада.');
            return;
        }
        this.account.active_deposit = null;
        this.account.level = level;
        this.account.xp = xp;
        game.updateUI?.();
        game.msg(`Вклад закрыт: +${reward.toLocaleString()} 💰`);
        this.render();
    },

    renderSchemaError() {
        return `<div class="card"><p style="color:var(--red)">Нужна таблица банка в Supabase.</p>
<pre style="white-space:pre-wrap;font-size:0.72rem;background:rgba(255,255,255,0.06);padding:8px;border-radius:8px;">create table if not exists bank_accounts (
  user_id text primary key,
  user_name text,
  level int not null default 1,
  xp int not null default 0,
  active_deposit jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);</pre></div>`;
    },

    render() {
        const c = document.getElementById('bank-content');
        if (!c) return;
        if (this.schemaError) {
            c.innerHTML = this.renderSchemaError();
            return;
        }
        const acc = this.account || { level: 1, xp: 0 };
        const dep = acc.active_deposit;
        let html = `<div class="card"><b>Уровень банка:</b> ${acc.level || 1} | XP ${acc.xp || 0}/10</div>`;
        if (dep) {
            const left = Math.max(0, (dep.unlock_at || 0) - Date.now());
            const h = Math.floor(left / 3600000);
            const m = Math.floor((left % 3600000) / 60000);
            html += `<div class="card">
                <div><b>Активный вклад:</b> ${Math.floor(dep.amount).toLocaleString()} 💰</div>
                <div>Срок: ${dep.term_label} | Ставка: ${dep.rate}%</div>
                <div>${left > 0 ? `До выдачи: ${h}ч ${m}м` : 'Готов к получению'}</div>
                <button class="cooldown-btn" ${left > 0 ? 'disabled' : ''} onclick="Bank.claimDeposit()">ЗАБРАТЬ</button>
            </div>`;
        } else {
            html += `<div class="card">
                <div style="margin-bottom:8px;">Депозит фиксированный: <b>1,000,000 💰</b></div>
                <div style="margin-bottom:10px;color:var(--gray);font-size:0.82rem;">Срок: 7 дней, ставка зависит от уровня банка.</div>
                <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px;">
                    <button class="cooldown-btn" ${(acc.level || 1) < 1 ? 'disabled' : ''} onclick="Bank.createDeposit('7d', 1000000)">
                        ВНЕСТИ ДЕПОЗИТ 1M (${this.getRate(BANK_TERMS.find(t => t.id === '7d')).toFixed(2)}%)
                    </button>
                </div>
            </div>`;
        }
        c.innerHTML = html;
    }
};

Object.assign(game, {
    openBankMenu() {
        if (typeof Bank !== 'undefined') Bank.openMenu();
    }
});
