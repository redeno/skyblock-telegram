// top.js — топ игроков по разделам

const TOP_LIMIT = 50;
const getTgNick = (row) => row.username || 'Аноним';

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
                nick: getTgNick(row),
                value: (() => {
                    const sbSkill = row.skills?.skyblock || { lvl: 0, xp: 0, next: 1 };
                    const next = sbSkill.next || 1;
                    return (sbSkill.lvl + (sbSkill.xp || 0) / next).toFixed(2);
                })()
            })).sort((a, b) => parseFloat(b.value) - parseFloat(a.value)).slice(0, TOP_LIMIT);
        }
    } else if (type === 'rich') {
        const { data: rawData, error: rawError } = await supabaseClient.from('players').select('coins, username').order('coins', { ascending: false }).limit(TOP_LIMIT);
        error = rawError;
        if (!error && rawData) {
            data = rawData.map(row => ({
                nick: getTgNick(row),
                value: row.coins || 0
            }));
        }
    } else if (type === 'dungeons') {
        const { data: rawData, error: rawError } = await supabaseClient.from('players').select('skills, username');
        error = rawError;
        if (!error && rawData) {
            data = rawData.map(row => ({
                nick: getTgNick(row),
                value: row.skills?.dungeons?.lvl || 1
            })).sort((a, b) => b.value - a.value).slice(0, TOP_LIMIT);
        }
    } else if (type === 'slayer') {
        const { data: rawData, error: rawError } = await supabaseClient.from('players').select('slayer, username');
        error = rawError;
        if (!error && rawData) {
            data = rawData.map(row => {
                const sl = row.slayer || {};
                return {
                    nick: getTgNick(row),
                    zombie: sl.zombie?.lvl || 0,
                    spider: sl.spider?.lvl || 0,
                    wolf: sl.wolf?.lvl || 0,
                    total: (sl.zombie?.lvl || 0) + (sl.spider?.lvl || 0) + (sl.wolf?.lvl || 0)
                };
            }).sort((a, b) => b.total - a.total).slice(0, TOP_LIMIT);
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

    if (type === 'slayer') {
        const slayerGrid = 'display:grid;grid-template-columns:44px 1fr 60px 60px 60px;gap:4px;align-items:center;';
        html += `<div class="card" style="${slayerGrid}font-weight:bold;color:var(--accent);">
            <span>#</span>
            <span>Ник</span>
            <span style="text-align:center">🧟</span>
            <span style="text-align:center">🕷️</span>
            <span style="text-align:center">🐺</span>
        </div>`;
        data.forEach((player, index) => {
            const place = index + 1;
            const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.`;
            html += `<div class="card" style="${slayerGrid}">
                <span style="white-space:nowrap">${medal}</span>
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0">${player.nick}</span>
                <span style="color:var(--accent);text-align:center;font-weight:bold">${player.zombie}</span>
                <span style="color:var(--accent);text-align:center;font-weight:bold">${player.spider}</span>
                <span style="color:var(--accent);text-align:center;font-weight:bold">${player.wolf}</span>
            </div>`;
        });
        listEl.innerHTML = html;
        return;
    }

    data.forEach((player, index) => {
        const place = index + 1;
        const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.`;
        const value = type === 'rich' ? Math.floor(player.value).toLocaleString() : player.value;

        html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
            <span>${medal} ${player.nick}</span>
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
        else if (text.includes('SLAYER')) game.loadTop('slayer');
        else if (text.includes('УРОВЕНЬ')) game.loadTop('level');
    });
});
