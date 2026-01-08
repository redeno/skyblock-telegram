// top.js — топ игроков по разделам

const TOP_LIMIT = 50;

async function loadTop(type = 'rich') {
    const listEl = document.getElementById('lead-list');
    listEl.innerHTML = '<div style="text-align:center;color:#666">Загрузка топа...</div>';

    let orderBy = 'coins';
    let field = 'coins';
    let label = '💰';

    if (type === 'dungeons') {
        orderBy = 'skills->dungeons->>lvl';
        field = 'skills';
        label = '💀 Данжи LVL';
    } else if (type === 'level') {
        // Supabase не может сортировать по вычисляемому полю напрямую, так что загрузим всех и посчитаем на клиенте
        // (для небольшого количества игроков — норм)
        const { data, error } = await supabaseClient
            .from('players')
            .select('skills');

        if (error || !data) {
            listEl.innerHTML = '<div style="text-align:center;color:var(--red)">Ошибка загрузки</div>';
            return;
        }

        // Считаем общий уровень для каждого
        const ranked = data.map(row => {
            let totalLvl = 0;
            if (row.skills) {
                Object.values(row.skills).forEach(sk => {
                    totalLvl += sk.lvl || 1;
                });
            }
            const sbLevel = ((totalLvl - 6) / 10).toFixed(2);
            return { sbLevel: parseFloat(sbLevel) };
        }).sort((a, b) => b.sbLevel - a.sbLevel).slice(0, TOP_LIMIT);

        renderTopList(ranked, '🌟 SB LVL', 'sbLevel');
        return;
    }

    const { data, error } = await supabaseClient
        .from('players')
        .select(field + ', class')
        .order(orderBy, { ascending: false })
        .limit(TOP_LIMIT);

    if (error) {
        console.error('Ошибка топа:', error);
        listEl.innerHTML = '<div style="text-align:center;color:var(--red)">Ошибка загрузки топа</div>';
        return;
    }

    if (!data || data.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;color:#666">Топ пуст</div>';
        return;
    }

    let ranked = data;
    if (type === 'dungeons') {
        ranked = data.map(row => ({
            value: row.skills?.dungeons?.lvl || 1,
            class: row.class
        })).sort((a, b) => b.value - a.value);
    } else if (type === 'rich') {
        ranked = data.map(row => ({
            value: row.coins || 0,
            class: row.class
        }));
    }

    renderTopList(ranked, label, 'value');
}

function renderTopList(players, label, valueKey) {
    const listEl = document.getElementById('lead-list');
    let html = '';

    players.forEach((p, i) => {
        const place = i + 1;
        let medal = place <= 3 ? ['🥇', '🥈', '🥉'][i] : `${place}.`;
        const value = valueKey === 'sbLevel' ? p[valueKey] : Math.floor(p[valueKey]).toLocaleString();
        const className = p.class ? p.class.toUpperCase() : 'Нет класса';

        html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
            <span>${medal} ${value} ${label}</span>
            <small style="color:var(--gray)">${className}</small>
        </div>`;
    });

    listEl.innerHTML = html || '<div style="text-align:center;color:#666">Топ пуст</div>';
}

// Перехватываем открытие модалки
const originalShowModal = game.showModal;
game.showModal = function(id) {
    originalShowModal.call(game, id);
    if (id === 'leadModal') {
        // По умолчанию открываем топ богатых
        document.querySelectorAll('#leadModal .inv-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector('#leadModal .inv-tab').classList.add('active');
        loadTop('rich');
    }
};

// Клик по вкладкам
document.querySelectorAll('#leadModal .inv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('#leadModal .inv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const type = tab.textContent.includes('БОГАТЫЕ') ? 'rich' :
                     tab.textContent.includes('ДАНЖИ') ? 'dungeons' : 'level';
        loadTop(type);
    });
});
