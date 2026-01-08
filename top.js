// top.js — топ игроков по разделам (без класса, только ник)

const TOP_LIMIT = 50;

// Функция для генерации случайного ника (пока нет реальных ников в базе)
// В будущем замени на реальное поле username из базы
function generateFakeNick(index) {
    const names = ['SkyLord', 'NoobMaster', 'ProGamer', 'FarmKing', 'DungeonBoss', 'RichBoy', 'PetLover', 'MinerPro', 'FisherMan', 'WarriorX'];
    return names[index % names.length] + (Math.floor(Math.random() * 999));
}

async function loadTop(type = 'rich') {
    const listEl = document.getElementById('lead-list');
    listEl.innerHTML = '<div style="text-align:center;color:#666">Загрузка топа...</div>';

    let data = [];
    let error = null;

    if (type === 'level') {
        // Для общего уровня — считаем на клиенте
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
    } else {
        let selectFields = 'coins';
        let orderBy = 'coins';

        if (type === 'dungeons') {
            selectFields = 'skills';
            orderBy = '(skills->dungeons->>lvl)::integer';
        }

        const { data: rawData, error: rawError } = await supabaseClient
            .from('players')
            .select(selectFields)
            .order(orderBy, { ascending: false })
            .limit(TOP_LIMIT);

        error = rawError;
        if (!error && rawData) {
            if (type === 'dungeons') {
                data = rawData.map(row => ({
                    value: row.skills?.dungeons?.lvl || 1
                })).sort((a, b) => b.value - a.value);
            } else {
                data = rawData.map(row => ({
                    value: row.coins || 0
                }));
            }
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
    let label = type === 'rich' ? '💰' : type === 'dungeons' ? '💀 LVL' : '🌟 SB LVL';

    data.forEach((player, index) => {
        const place = index + 1;
        const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `${place}.`;
        const nick = generateFakeNick(index); // ← пока фейковые ники, потом замени на реальные
        const value = type === 'rich' ? Math.floor(player.value).toLocaleString() : player.value;

        html += `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
            <span>${medal} ${nick}</span>
            <span style="color:var(--accent)">${value} ${label}</span>
        </div>`;
    });

    listEl.innerHTML = html;
}

// Активная вкладка
function setActiveTab(tabElement) {
    document.querySelectorAll('#leadModal .inv-tab').forEach(t => t.classList.remove('active'));
    tabElement.classList.add('active');
}

// Открытие модалки — загружаем топ богатых по умолчанию
const originalShowModal = game.showModal;
game.showModal = function(id) {
    originalShowModal.call(game, id);
    if (id === 'leadModal') {
        setActiveTab(document.querySelector('#leadModal .inv-tab'));
        loadTop('rich');
    }
};

// Клик по вкладкам
document.querySelectorAll('#leadModal .inv-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        setActiveTab(this);
        const text = this.textContent.trim();
        if (text.includes('БОГАТЫЕ')) loadTop('rich');
        else if (text.includes('ДАНЖИ')) loadTop('dungeons');
        else if (text.includes('УРОВЕНЬ')) loadTop('level');
    });
});
