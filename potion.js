// potion.js — логика зелий

// Эта система работает на основе набора предметов типа "potion" в инвентаре.
// Зелья тратятся при использовании (уменьшается count, удаляется при 0).
// Эффекты применяются через game.state.buffs (как у GodPotion/Печеньки).

(function() {
    const DURATION_MS = 5 * 60 * 1000;

    function getPotionItem(name) {
        return game.state.inventory.find(i => i.type === 'potion' && i.name === name);
    }

    function consumePotion(name) {
        const item = getPotionItem(name);
        if (!item) return false;
        item.count = (item.count || 1) - 1;
        if (item.count <= 0) {
            game.state.inventory = game.state.inventory.filter(i => i !== item);
        }
        game.updateUI();
        return true;
    }

    function applyBuff(name, field, value) {
        if (!game.state.buffs) game.state.buffs = {};
        game.state.buffs[field] = { endTime: Date.now() + DURATION_MS, value };
        game.updateUI();
    }

    game.usePotion = function(name) {
        if (!getPotionItem(name)) {
            game.msg('У вас нет такого зелья.');
            return;
        }

        switch (name) {
            case 'Зелье восстановления хп': {
                const cur = game.state.stats.hp || 0;
                game.state.stats.hp = cur + 150;
                game.msg('💖 +150 HP');
                consumePotion(name);
                break;
            }
            case 'Зелье Силы': {
                applyBuff(name, 'strengthPotion', 30);
                game.msg('💪 +30 силы на 5 минут');
                consumePotion(name);
                break;
            }
            case 'Зелье Удачи': {
                applyBuff(name, 'luckPotion', 30);
                game.msg('🍀 +30 фортуны на 5 минут');
                consumePotion(name);
                break;
            }
            default: {
                // Fallback: тоже можно использовать GodPotion/Печеньку
                if (name === 'GodPotion' && typeof game.activateGodPotion === 'function') {
                    const itm = getPotionItem(name);
                    if (!itm) return;
                    game.activateGodPotion(itm.id);
                } else if (name === 'Печенька' && typeof game.activateCookie === 'function') {
                    const itm = getPotionItem(name);
                    if (!itm) return;
                    game.activateCookie(itm.id);
                } else {
                    game.msg('Это зелье пока не работает.');
                }
            }
        }
    };

    // Вставляем эффект в calcStats
    const origCalcStats = game.calcStats;
    game.calcStats = function(inDungeon = false) {
        const s = origCalcStats.call(this, inDungeon);
        const buffs = this.state.buffs || {};
        if (buffs.strengthPotion && Date.now() < buffs.strengthPotion.endTime) {
            s.str += buffs.strengthPotion.value || 0;
        }
        if (buffs.luckPotion && Date.now() < buffs.luckPotion.endTime) {
            s.mf += buffs.luckPotion.value || 0;
        }
        return s;
    };
})();
