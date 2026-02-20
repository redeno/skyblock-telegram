// top.js — топ игроков по разделам

const TOP_LIMIT = 50;

// Добавляем функцию прямо в game
game.loadTop = async function(type = 'rich') {
    const listEl = document.getElementById('lead-list');
    listEl.innerHTML = '<div style="text-align:center;color:#666">Загрузка топа...</div>';

    let data = [];
    let error = null;

    if (type === 'level') {
        const { data: rawData, error: rawError } = await supabaseClient.from('players').select('skills, username');
        error = rawError;
        if (!error && rawData) {
            data = rawData.map(row => ({
                username: row.username || 'Аноним',
                value: (() => {
                    let total = 0;
                    if (row.skills) Object.values(row.skills).forEach(sk => total += sk.lvl || 1);
                    return ((total - 6) / 10).toFixed(2);
                })()
            })).sort((a, b) => parseFloat(b.value) - parseFloat(a.value)).slice(0, TOP_LIMIT);
        }
    } else if (type === 'rich') {
        const { data: rawData, error: rawError } = await supabaseClient.from('players').select('coins, username').order('coins', { ascending: false }).limit(TOP_LIMIT);
        error = rawError;
        if (!error && rawData) {
            data = rawData.map(row => ({
                username: row.username || 'Аноним',
                value: row.coins || 0
            }));
        }
    } else if (type === 'dungeons') {
        const { data: rawData, error: rawError } = await supabaseClient.from('players').select('skills, username');
        error = rawError;
        if (!error && rawData) {
            data = rawData.map(row => ({
                username: row.username || 'Аноним',
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
    let label = type === 'rich' ? '💰' : type === 'dungeons' ? '💀 LVL' : '🌟 LVL';

    data.forEach((player, index) => {
        const place = index + 1;
        const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.`;
        const nick = player.username.startsWith('@') ? player.username : `@${player.username}`;
        const value = type === 'rich' ? Math.floor(player.value).toLocaleString() : player.value;

        html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
            <span>${medal} ${nick}</span>
            <span style="color:var(--accent)">${value} ${label}</span>
        </div>`;
    });

    listEl.innerHTML = html;
};

// Подсветка вкладок
function setActiveTab(tabElement) {
    document.querySelectorAll('#leadModal .inv-tab').forEach(t => t.classList.remove('active'));
    tabElement.classList.add('active');
}

// Открытие модалки топа
const originalShowModal = game.showModal || function() {};
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
