// skills.js — система уровней с таблицей опыта

const skillXpTable = [
    50, 125, 200, 300, 500, 750, 1000, 1500, 2000, 3500,
    5000, 7500, 10000, 15000, 20000, 30000, 50000, 75000, 100000, 200000,
    300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000, 1200000,
    1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000,
    2300000, 2400000, 2500000, 2600000, 2700000, 2800000, 2900000, 3000000, 3100000, 3200000,
    3300000, 3400000, 3500000, 3600000, 3700000, 3800000, 3900000, 4000000, 4100000, 4200000
];

const skillConfig = {
    mining: { baseNext: 50, useTable: true },
    farming: { baseNext: 50, useTable: true },
    fishing: { baseNext: 50, useTable: true },
    combat: { baseNext: 50, useTable: true },
    foraging: { baseNext: 50, useTable: true },
    dungeons: { baseNext: 200, multiplier: 1.4, useTable: false },
    enchanting: { baseNext: 50, useTable: true },
    skyblock: { baseNext: 1, multiplier: 1.0, useTable: false },
};

function getNextXp(skillKey, level) {
    const cfg = skillConfig[skillKey];
    if (cfg && cfg.useTable) {
        const idx = level - 1;
        if (idx >= 0 && idx < skillXpTable.length) return skillXpTable[idx];
        return skillXpTable[skillXpTable.length - 1];
    }
    return undefined;
}

function initSkills() {
    Object.keys(skillConfig).forEach((key) => {
        const cfg = skillConfig[key];
        if (!game.state.skills[key]) {
            const next = cfg.useTable ? (skillXpTable[0] || cfg.baseNext) : cfg.baseNext;
            game.state.skills[key] = {
                lvl: 1,
                xp: 0,
                next: next,
                label: key === "dungeons" ? "ДАНЖИ" : key === "enchanting" ? "ЗАЧАРОВАНИЕ" : key.toUpperCase(),
            };
        } else {
            if (cfg.useTable) {
                const correctNext = getNextXp(key, game.state.skills[key].lvl);
                if (correctNext !== undefined) {
                    game.state.skills[key].next = correctNext;
                }
            } else if (game.state.skills[key].next === undefined) {
                game.state.skills[key].next = cfg.baseNext;
            }
        }
    });
}

game.addXp = function (skillKey, amount) {
    if (!game.state.skills[skillKey]) return;

    const sk = game.state.skills[skillKey];
    const petBonus = game.calcPetBonus ? game.calcPetBonus(skillKey) : 0;
    amount *= 1 + petBonus / 100;

    sk.xp += amount;

    const epsilon = 0.00001;
    while (sk.xp >= sk.next - epsilon) {
        sk.lvl++;
        sk.xp -= sk.next;
        const cfg = skillConfig[skillKey];
        if (skillKey === "skyblock") {
            sk.next = 1.0;
        } else if (cfg && cfg.useTable) {
            const tableNext = getNextXp(skillKey, sk.lvl);
            sk.next = tableNext !== undefined ? tableNext : sk.next;
        } else if (cfg && cfg.multiplier) {
            sk.next = Math.floor(sk.next * cfg.multiplier);
        }
        if (['mining','farming','fishing','foraging','combat','dungeons','enchanting'].includes(skillKey)) {
            game.addXp('skyblock', 0.1);
        }
        game.msg(`LEVEL UP! ${sk.label} ${sk.lvl}`);
    }
};

game.initSkills = function () {
    initSkills();
};

if (game.state && game.state.skills) {
    initSkills();
}
