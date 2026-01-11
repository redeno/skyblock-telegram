// pets.js — вставь это целиком
window.PET_RARITY = {
    common: {
        xp: 0.001, // 0.1% за уровень
        fortune: 0,
        skill_fortune: 0
    },
    rare: {
        xp: 0.0015,
        fortune: 0,
        skill_fortune: 0
    },
    epic: {
        xp: 0.002,
        fortune: 0.5,
        skill_fortune: 0
    },
    legendary: {
        xp: 0.003,
        fortune: 1,
        skill_fortune: 0.05
    }
};

window.calcPetBonus = function(pet, skills) {
    const r = window.PET_RARITY[pet.rarity] || window.PET_RARITY.common;
    const lvl = pet.lvl || 1;

    let bonus = {
        xp_bonus: lvl * r.xp * 100, // в процентах
        fortune: lvl * r.fortune
    };

    // Легендарка — доп. фортуна от уровня скилла
    if (r.skill_fortune > 0 && pet.skill && skills[pet.skill]) {
        bonus.fortune += skills[pet.skill].lvl * lvl * r.skill_fortune;
    }

    return bonus;
};
