// skills.js — логика прокачки навыков (отдельная для данжей)

const skillConfig = {
    mining: { type: 'normal', baseNext: 100, multiplier: 1.6 },
    farming: { type: 'normal', baseNext: 100, multiplier: 1.6 },
    fishing: { type: 'normal', baseNext: 100, multiplier: 1.6 },
    combat: { type: 'normal', baseNext: 100, multiplier: 1.6 },
    foraging: { type: 'normal', baseNext: 100, multiplier: 1.6 },
    dungeons: { type: 'dungeons_special', baseNext: 200 } // специальная формула
};

// Инициализация скиллов (для новых игроков и совместимости)
function initSkills() {
    Object.keys(skillConfig).forEach(key => {
        if (!game.state.skills[key]) {
            game.state.skills[key] = {
                lvl: 1,
                xp: 0,
                next: skillConfig[key].baseNext,
                label: key === 'dungeons' ? 'ДАНЖИ' : key.toUpperCase()
            };
        } else {
            // Если скилл есть — убеждаемся, что next правильный
            if (game.state.skills[key].next === undefined) {
                game.state.skills[key].next = skillConfig[key].baseNext;
            }
        }
    });
}

// Основная функция начисления XP
game.addXp = function(skillKey, amount) {
    if (!game.state.skills[skillKey]) return;

    const sk = game.state.skills[skillKey];
    const petBonus = game.calcPetBonus ? game.calcPetBonus(skillKey) : 0;
    amount *= (1 + petBonus / 100);

    sk.xp += amount;

    while (sk.xp >= sk.next) {
        sk.lvl++;
        sk.xp -= sk.next;

        if (skillConfig[skillKey].type === 'dungeons_special') {
            // Твоя формула: next = previous_next + previous_next / 2
            sk.next = Math.floor(sk.next + sk.next / 2);
        } else {
            // Обычная формула для остальных
            sk.next = Math.floor(sk.next * skillConfig[skillKey].multiplier);
        }

        game.msg(`LEVEL UP! ${sk.label} ${sk.lvl}`);
    }
};

// Вызываем инициализацию при старте
game.initSkills = function() {
    initSkills();
};

// Автоинициализация (если файл загружен после game.js)
if (game.state && game.state.skills) {
    initSkills();
}
