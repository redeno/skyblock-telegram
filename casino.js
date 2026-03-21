// casino.js — общее казино с казной и недельной экономикой

const CASINO_SYMBOLS = ['7', '🍒', '🍋', '⭐', '🔔'];

const Casino = {
    userId: null,
    userName: null,
    treasury: 0,
    schemaError: null,
    isSpinning: false,
    currentReels: ['❔', '❔', '❔'],
    statusText: '',
    showHistory: false,
    weekStats: { week_key: '', week_income: 0, week_payout: 0, history: [] },

    async init() {
        this.userId = game.playerTelegramId ? String(game.playerTelegramId) : 'guest';
        this.userName = tg.initDataUnsafe?.user?.first_name || 'Гость';
        await this.loadState();
    },

    getWeekKey(d = new Date()) {
        const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = tmp.getUTCDay() || 7;
        tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
        return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    },

    isOpenToday() {
        const day = new Date().getDay();
        return day === 3 || day === 0; // Wednesday / Sunday
    },

    getNextOpenDate() {
        const now = new Date();
        for (let i = 1; i <= 7; i++) {
            const d = new Date(now.getTime() + i * 86400000);
            const day = d.getDay();
            if (day === 3 || day === 0) return d;
        }
        return now;
    },

    async ensureState() {
        const { data, error } = await supabaseClient.from('casino_state').select('*').eq('id', 1).maybeSingle();
        if (error) return { error };
        if (!data) {
            const { error: insErr } = await supabaseClient.from('casino_state').insert([{
                id: 1, treasury: 0, week_key: this.getWeekKey(), week_income: 0, week_payout: 0, history: []
            }]);
            if (insErr) return { error: insErr };
            return { data: { id: 1, treasury: 0, week_key: this.getWeekKey(), week_income: 0, week_payout: 0, history: [] } };
        }
        return { data };
    },

    async loadState() {
        this.schemaError = null;
        if (!supabaseClient) return;
        const st = await this.ensureState();
        if (st.error) {
            this.schemaError = st.error;
            return;
        }
        const row = st.data || {};
        this.treasury = Number(row.treasury || 0);
        this.weekStats.week_key = row.week_key || this.getWeekKey();
        this.weekStats.week_income = Number(row.week_income || 0);
        this.weekStats.week_payout = Number(row.week_payout || 0);
        this.weekStats.history = Array.isArray(row.history) ? row.history : [];
        await this.handleWeekRollover();
    },

    async handleWeekRollover() {
        const currentKey = this.getWeekKey();
        if (this.weekStats.week_key === currentKey) return;
        const income = Math.floor(this.weekStats.week_income || 0);
        const payout = Math.floor(this.weekStats.week_payout || 0);
        const weeklyAdd = 5000000;
        const weeklyLoss = Math.floor(Math.max(0, income) * 0.5);
        this.treasury = Math.max(0, Math.floor(this.treasury + weeklyAdd - weeklyLoss));
        const history = (this.weekStats.history || []).slice(-3);
        history.push({
            week: this.weekStats.week_key || currentKey,
            income, payout, add: weeklyAdd, loss: weeklyLoss, treasury_end: this.treasury
        });
        this.weekStats = { week_key: currentKey, week_income: 0, week_payout: 0, history };
        let { error } = await supabaseClient.from('casino_state').update({
            treasury: this.treasury,
            week_key: this.weekStats.week_key,
            week_income: 0,
            week_payout: 0,
            history: this.weekStats.history,
            updated_at: new Date().toISOString()
        }).eq('id', 1);
        if (error) {
            await supabaseClient.from('casino_state').update({
                treasury: this.treasury,
                updated_at: new Date().toISOString()
            }).eq('id', 1);
        }
    },

    async addToTreasury(amount, reason = 'contribution') {
        const add = Math.max(0, Math.floor(Number(amount) || 0));
        if (!add || !supabaseClient) return;
        await this.loadState();
        const next = Math.floor(this.treasury + add);
        const newIncome = Math.floor((this.weekStats.week_income || 0) + add);
        let { error } = await supabaseClient.from('casino_state').update({
            treasury: next,
            week_income: newIncome,
            updated_at: new Date().toISOString()
        }).eq('id', 1);
        if (error) {
            ({ error } = await supabaseClient.from('casino_state').update({
                treasury: next,
                updated_at: new Date().toISOString()
            }).eq('id', 1));
        }
        if (!error) {
            this.treasury = next;
            this.weekStats.week_income = newIncome;
        }
        await supabaseClient.from('casino_spins').insert([{
            user_id: this.userId, user_name: this.userName, bet: add, payout: 0, contribution: add, result: reason
        }]);
    },

    animateSpin(targetReels, durationMs) {
        return new Promise((resolve) => {
            const start = Date.now();
            const lockAt = [durationMs * 0.65, durationMs * 0.82, durationMs];
            const reels = ['❔', '❔', '❔'];
            const timer = setInterval(() => {
                const elapsed = Date.now() - start;
                for (let i = 0; i < 3; i++) {
                    reels[i] = elapsed >= lockAt[i]
                        ? targetReels[i]
                        : CASINO_SYMBOLS[Math.floor(Math.random() * CASINO_SYMBOLS.length)];
                }
                this.currentReels = [...reels];
                this.render(this.currentReels);
                if (elapsed >= durationMs) {
                    clearInterval(timer);
                    this.currentReels = [...targetReels];
                    resolve();
                }
            }, 90);
        });
    },

    async spin(bet) {
        if (this.isSpinning) return;
        if (!this.isOpenToday()) {
            this.statusText = `Казино закрыто. Откроется ${this.getNextOpenDate().toLocaleDateString('ru-RU')}`;
            this.render(this.currentReels);
            return;
        }
        const amount = Math.max(0, Math.floor(Number(bet) || 0));
        if (!amount) return;
        if (game.state.coins < amount) {
            this.statusText = 'Не хватает монет на ставку.';
            this.render(this.currentReels);
            return;
        }
        game.state.coins -= amount;
        game.updateUI?.();
        const contribution = Math.floor(amount * 0.3);
        await this.addToTreasury(contribution, 'slot-spin');
        await this.loadState();

        const reels = [
            CASINO_SYMBOLS[Math.floor(Math.random() * CASINO_SYMBOLS.length)],
            CASINO_SYMBOLS[Math.floor(Math.random() * CASINO_SYMBOLS.length)],
            CASINO_SYMBOLS[Math.floor(Math.random() * CASINO_SYMBOLS.length)]
        ];

        this.isSpinning = true;
        this.statusText = 'Барабаны крутятся...';
        this.render(this.currentReels);
        const durationMs = 5000 + Math.floor(Math.random() * 5001);
        await this.animateSpin(reels, durationMs);

        let payout = 0;
        if (reels[0] === '7' && reels[1] === '7' && reels[2] === '7') {
            payout = Math.floor(this.treasury * 0.65);
            this.treasury = Math.max(0, this.treasury - payout);
            await supabaseClient.from('casino_state').update({
                treasury: this.treasury,
                updated_at: new Date().toISOString()
            }).eq('id', 1);
            game.state.coins += payout;
            this.statusText = `ДЖЕКПОТ 777! +${payout.toLocaleString()} 💰`;
        } else if (reels[0] === reels[1] && reels[1] === reels[2]) {
            payout = Math.floor(amount * 4);
            game.state.coins += payout;
            this.statusText = `x3 символа! +${payout.toLocaleString()} 💰`;
        } else if (reels.includes('7') && reels.filter(x => x === '7').length === 2) {
            payout = Math.floor(amount * 2);
            game.state.coins += payout;
            this.statusText = `Две семерки! +${payout.toLocaleString()} 💰`;
        } else {
            this.statusText = `Не повезло: ${reels.join(' | ')}`;
        }
        game.updateUI?.();

        this.weekStats.week_payout = Math.floor((this.weekStats.week_payout || 0) + payout);
        const { error: payoutErr } = await supabaseClient.from('casino_state').update({
            week_payout: this.weekStats.week_payout,
            updated_at: new Date().toISOString()
        }).eq('id', 1);
        if (payoutErr) {
            // Совместимость со старой схемой без week_payout
        }
        await supabaseClient.from('casino_spins').insert([{
            user_id: this.userId,
            user_name: this.userName,
            bet: amount,
            payout,
            contribution,
            result: reels.join('|')
        }]);

        this.isSpinning = false;
        this.render(reels);
    },

    async openMenu() {
        game.switchTab('casino-menu');
        await this.loadState();
        this.render();
    },

    toggleHistory() {
        this.showHistory = !this.showHistory;
        this.render(this.currentReels);
    },

    renderSchemaError() {
        return `<div class="card"><p style="color:var(--red)">Нужны таблицы казино в Supabase.</p>
<pre style="white-space:pre-wrap;font-size:0.72rem;background:rgba(255,255,255,0.06);padding:8px;border-radius:8px;">create table if not exists casino_state (
  id int primary key,
  treasury numeric not null default 0,
  week_key text,
  week_income numeric not null default 0,
  week_payout numeric not null default 0,
  history jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists casino_spins (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  user_name text,
  bet numeric not null default 0,
  payout numeric not null default 0,
  contribution numeric not null default 0,
  result text,
  created_at timestamptz default now()
);</pre></div>`;
    },

    render(lastReels = null) {
        const c = document.getElementById('casino-content');
        if (!c) return;
        if (this.schemaError) {
            c.innerHTML = this.renderSchemaError();
            return;
        }
        const reels = lastReels || this.currentReels || ['❔', '❔', '❔'];
        const closed = !this.isOpenToday();
        const disabled = (this.isSpinning || closed) ? 'disabled' : '';
        const spinTitle = this.statusText || '777 = вся казна игроку (минус 35% налог)';
        const nextOpen = this.getNextOpenDate().toLocaleDateString('ru-RU');
        const historyRows = (this.weekStats.history || []).slice(-4).reverse();
        c.innerHTML = `<div class="card" style="text-align:center;">
            <div style="font-size:0.85rem;color:var(--gray);">Казна казино</div>
            <div style="font-size:1.5rem;color:var(--accent);font-weight:800;">${Math.floor(this.treasury).toLocaleString()} 💰</div>
            <div style="margin:12px 0;font-size:2.2rem;letter-spacing:10px;min-height:48px;">${reels.join(' ')}</div>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                <button class="act-btn" ${disabled} onclick="Casino.spin(1000000)">${closed ? `Закрыто до ${nextOpen}` : 'Ставка 1M'}</button>
            </div>
            <button class="act-btn" style="margin-top:8px;" onclick="Casino.toggleHistory()">${this.showHistory ? 'Скрыть' : 'Показать'} историю 4 недели</button>
            <p style="margin-top:10px;color:var(--gray);font-size:0.8rem;">${spinTitle}</p>
            ${this.showHistory ? `<div class="card" style="text-align:left;margin-top:8px;">
                <b>История (4 недели)</b>
                ${historyRows.length ? historyRows.map(h => `<div style="margin-top:6px;font-size:0.82rem;">
                    <b>${h.week}</b> • пришло ${Math.floor(h.income || 0).toLocaleString()} • ушло ${Math.floor(h.payout || 0).toLocaleString()} • +5M ${Math.floor(h.add || 0).toLocaleString()} • -50% ${Math.floor(h.loss || 0).toLocaleString()}
                </div>`).join('') : '<div style="margin-top:6px;color:var(--gray);">Пока нет данных.</div>'}
            </div>` : ''}
        </div>`;
    }
};

Object.assign(game, {
    openCasinoMenu() {
        if (typeof Casino !== 'undefined') Casino.openMenu();
    }
});
