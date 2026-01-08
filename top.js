// top.js — топ игроков по разделам (ник из Telegram)

const TOP_LIMIT = 50;

// Добавляем функцию в объект game (чтобы onclick работал)
game.loadTop = async function(type = 'rich') {
    const listEl = document.getElementById('lead-list');
    listEl.innerHTML = '<div style="text-align:center;color:#666">Загрузка топа...</div>';

    let data = [];
    let error = null;

    if (type === 'level') {
        // Общий уровень — считаем на клиенте
        const { data: rawData, error: rawError } = await supabaseClient
            .from('players')
            .select('skills');

        error = rawError;
        if (!error && rawData) {
            data = rawData.map(row => {
                let totalLvl = 0;
                if (row.skills) {
                    Object.values(row.skills).forEach(sk => totalLvl += sk.lvl || 1);
                }
                return { value: ((totalLvl - 6) / 10).toFixed(2) };
            }).sort((a, b) => parseFloat(b.value) - parseFloat(a.value)).slice(0, TOP_LIMIT);
        }
    } else if (type === 'rich') {
        // Самые богатые — по монетам
        const { data: rawData, error: rawError } = await supabaseClient
            .from('players')
            .select('coins')
            .order('coins', { ascending: false })
            .limit(TOP_LIMIT);

        error = rawError;
        if (!error && rawData) {
            data = rawData.map(row => ({ value: row.coins || 0 }));
        }
    } else if (type === 'dungeons') {
        // Лучшие в данжах — загружаем всех и сортируем на клиенте (Supabase не умеет сортировать по jsonb полю напрямую)
        const { data: rawData, error: rawError } = await supabaseClient
            .from('players')
            .select('skills');

        error = rawError;
        if (!error && rawData) {
            data = rawData.map(row => ({
                value: row.skills?.dungeons?.lvl || 1
            })).sort((a, b) => b.value - a.value).slice(0, TOP_LIMIT);
        }
    }

    if (error) {
        console.error('Ошибка топа:', error);
        listEl.innerHTML = '<div style="text-align:center;color:var(--red)">Ошибка загрузки топа</div>';
        return;
    }

    if (data.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;color:#666">Топ пуст</div>';
        return;
    }

    let html = '';
    let label = type === 'rich' ? '💰' : type === 'dungeons' ? '💀 ДАНЖИ LVL' : '🌟 SB LVL';

    data.forEach((player, index) => {
        const place = index + 1;
        const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.`;
        const value = type === 'rich' ? Math.floor(player.value).toLocaleString() : player.value;

        // Ник: если есть username из Telegram — @username, иначе просто ID
        // Но в базе у нас только telegram_id — пока показываем @ID (в будущем добавишь username)
        const nick = `@${player.telegram_id || 'unknown'}`;

        html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
            <span>${medal} ${nick}</span>
            <span style="color:var(--accent)">${value} ${label}</span>
        </div>`;
    });

    listEl.innerHTML = html;
};

// Активная вкладка
function setActiveTab(tabElement) {
    document.querySelectorAll('#leadModal .inv-tab').forEach(t => t.classList.remove('active'));
    tabElement.classList.add('active');
}

// Открытие модалки
const originalShowModal = game.showModal;
game.showModal = function(id) {
    originalShowModal.call(game, id);
    if (id === 'leadModal') {
        setActiveTab(document.querySelector('#leadModal .inv-tab'));
        game.loadTop('rich');
    }
};

// Клик по вкладкам
document.querySelectorAll('#leadModal .inv-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        setActiveTab(this);
        const text = this.textContent.trim();
        if (text.includes('БОГАТЫЕ')) game.loadTop('rich');
        else if (text.includes('ДАНЖИ')) game.loadTop('dungeons');
        else if (text.includes('УРОВЕНЬ')) game.loadTop('level');
    });
});
