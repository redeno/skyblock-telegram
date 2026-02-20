// top.js — топ игроков
const TOP_LIMIT = 50;

game.loadTop = async function(type = 'rich') {
    const listEl = document.getElementById('lead-list');
    
    let data = [];
    const username = tg.initDataUnsafe?.user?.username || 'Игрок';
    const userId = tg.initDataUnsafe?.user?.id;
    
    // Try Supabase first if in Telegram
    if (supabaseClient && isTelegramEnv) {
        try {
            let query = supabaseClient.from('profiles').select('username, coins, level, dungeons_lvl');
            
            if (type === 'rich') query = query.order('coins', { ascending: false });
            else if (type === 'level') query = query.order('level', { ascending: false });
            else if (type === 'dungeons') query = query.order('dungeons_lvl', { ascending: false });

            const { data: dbData, error } = await query.limit(TOP_LIMIT);
            if (dbData) {
                data = dbData.map(p => ({
                    username: p.username,
                    value: type === 'rich' ? p.coins : (type === 'level' ? p.level : p.dungeons_lvl)
                }));
            }
        } catch (e) {
            console.error('Supabase loadTop error:', e);
        }
    }

    // Fallback if no data from Supabase
    if (data.length === 0) {
        if (type === 'level') {
            let total = 0;
            if (game.state.skills) Object.values(game.state.skills).forEach(sk => total += sk.lvl || 1);
            data = [{ username: username, value: ((total - 6) / 10).toFixed(2) }];
        } else if (type === 'rich') {
            data = [{ username: username, value: game.state.coins || 0 }];
        } else if (type === 'dungeons') {
            data = [{ username: username, value: game.state.skills?.dungeons?.lvl || 1 }];
        }
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

game.switchTop = function(type, tabElement) {
    document.querySelectorAll('#leadModal .inv-tab').forEach(t => t.classList.remove('active'));
    tabElement.classList.add('active');
    game.loadTop(type);
};

const originalShowModal = game.showModal || function() {};
game.showModal = function(id) {
    originalShowModal.call(game, id);
    if (id === 'leadModal') {
        const firstTab = document.querySelector('#leadModal .inv-tab');
        if (firstTab) firstTab.classList.add('active');
        game.loadTop('rich');
    }
};
