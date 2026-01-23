// skills.js — множитель 1.4 для данжей

const skillConfig = {
    mining: { baseNext: 100, multiplier: 1.5 },
    farming: { baseNext: 100, multiplier: 1.5 },
    fishing: { baseNext: 100, multiplier: 1.5 },
    combat: { baseNext: 100, multiplier: 1.5 },
    foraging: { baseNext: 100, multiplier: 1.5 },
    dungeons: { baseNext: 200, multiplier: 1.4 }, // 1.4 как просил
    skyblock: { baseNext: 1, multiplier: 1.0 }
};

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
            if (game.state.skills[key].next === undefined) {
                game.state.skills[key].next = skillConfig[key].baseNext;
            }
        }
    });
}

game.addXp = function(skillKey, amount) {
    if (!game.state.skills[skillKey]) return;

    const sk = game.state.skills[skillKey];
    const petBonus = game.calcPetBonus ? game.calcPetBonus(skillKey) : 0;
    amount *= (1 + petBonus / 100);

    sk.xp += amount;

    // Use a small epsilon to prevent floating point issues with level ups
    const epsilon = 0.00001;
    while (sk.xp >= sk.next - epsilon) {
        sk.lvl++;
        sk.xp -= sk.next;
        // For SkyBlock skill, we want next to stay 1.0 (0.1 increments)
        if (skillKey !== 'skyblock') {
            sk.next = Math.floor(sk.next * skillConfig[skillKey].multiplier);
        } else {
            sk.next = 1.0;
        }
        game.msg(`LEVEL UP! ${sk.label} ${sk.lvl}`);
    }
};

game.initSkills = function() {
    initSkills();
};

if (game.state && game.state.skills) {
    initSkills();
}
