// top.js — загрузка и отображение топа игроков

const TOP_LIMIT = 50; // сколько игроков в топе показывать

async function loadLeaderboard() {
    const listEl = document.getElementById('lead-list');
    listEl.innerHTML = '<div style="text-align:center;color:#666">Загрузка топа...</div>';

    const { data, error } = await supabaseClient
        .from('players')
        .select('coins, class') // можно добавить другие поля, если хочешь (например, skills для расчёта уровня)
        .order('coins', { ascending: false })
        .limit(TOP_LIMIT);

    if (error) {
        console.error('Ошибка загрузки топа:', error);
        listEl.innerHTML = '<div style="text-align:center;color:var(--red)">Ошибка загрузки топа</div>';
        return;
    }

    if (!data || data.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;color:#666">Топ пуст</div>';
        return;
    }

    let html = '';
    data.forEach((player, index) => {
        const place = index + 1;
        const coins = Math.floor(player.coins).toLocaleString();
        const className = player.class ? player.class.toUpperCase() : 'Нет класса';

        let medal = '';
        if (place === 1) medal = '🥇';
        else if (place === 2) medal = '🥈';
        else if (place === 3) medal = '🥉';
        else medal = `${place}.`;

        html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
            <span>${medal} ${coins} 💰</span>
            <small style="color:var(--gray)">${className}</small>
        </div>`;
    });

    listEl.innerHTML = html;
}

// Автоматически загружаем топ, когда открывается модалка
document.getElementById('leadModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('leadModal') || e.target.textContent === '[ЗАКРЫТЬ]') {
        document.getElementById('leadModal').style.display = 'none';
    }
});

// Переопределяем открытие модалки, чтобы загружать топ каждый раз свежий
game.showModal = function(id) {
    document.getElementById(id).style.display = 'block';
    if (id === 'leadModal') {
        loadLeaderboard();
    }
    if (id === 'skillsModal') {
        // старый код для навыков (если нужно, оставляем)
        let html = '';
        Object.values(game.state.skills).forEach(sk => {
            const progress = (sk.xp / sk.next * 100).toFixed(1);
            html += `<div class="card"><b>${sk.label} LVL ${sk.lvl}</b><br><small>${Math.floor(sk.xp)} / ${Math.floor(sk.next)} XP</small><div class="hp-bar" style="margin-top:8px"><div class="hp-fill" style="width:${progress}%;background:var(--green)"></div></div></div>`;
        });
        document.getElementById('skills-content').innerHTML = html;
    }
};
