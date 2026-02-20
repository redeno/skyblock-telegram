// exchange.js — Система обмена и крафта ресурсов с отделами

Object.assign(game, {
    exchangeCategories: {
        farming: {
            label: '🌾 ФЕРМА',
            recipes: [
                { from: 'Пшеница', to: 'Стог Пшена', rate: 256 },
                { from: 'Картофель', to: 'Стог Картошки', rate: 256 },
                { from: 'Морковь', to: 'Стог Моркови', rate: 256 },
                { from: 'Тыква', to: 'Стог Тыквы', rate: 256 },
                { from: 'Арбуз', to: 'Стог Арбузов', rate: 256 },
                { from: 'Тростник', to: 'Стог Тростника', rate: 256 },
                { from: 'Грибы', to: 'Стог Грибов', rate: 256 },
                { from: 'Адский нарост', to: 'Стог Адского нароста', rate: 256 },
            ]
        },
        singularity: {
            label: '✨ СИНГУЛЯРНОСТЬ',
            recipes: [
                { from: 'Стог Пшена', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Картошки', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Моркови', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Тыквы', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Арбузов', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Тростника', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Грибов', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Адского нароста', to: 'Сингулярность', rate: 16 },
            ]
        },
        mining: {
            label: '⛏️ МАЙНИНГ',
            recipes: [
                { from: 'Булыжник', to: 'Сингулярность', rate: 25000 },
                { from: 'Уголь', to: 'Стог Угля', rate: 256 },
                { from: 'Стог Угля', to: 'Сингулярность', rate: 16 },
                { from: 'Медь', to: 'Стог Меди', rate: 256 },
                { from: 'Стог Меди', to: 'Сингулярность', rate: 16 },
                { from: 'Железо', to: 'Стог Железа', rate: 256 },
                { from: 'Стог Железа', to: 'Сингулярность', rate: 16 },
                { from: 'Золото', to: 'Стог Золота', rate: 256 },
                { from: 'Стог Золота', to: 'Сингулярность', rate: 16 },
                { from: 'Лазурит', to: 'Стог Лазурита', rate: 256 },
                { from: 'Стог Лазурита', to: 'Сингулярность', rate: 16 },
                { from: 'Редстоун', to: 'Стог Редстоуна', rate: 256 },
                { from: 'Стог Редстоуна', to: 'Сингулярность', rate: 16 },
                { from: 'Мифрил', to: 'Стог Мифрила', rate: 256 },
                { from: 'Стог Мифрила', to: 'Сингулярность', rate: 16 },
                { from: 'Рубин', to: 'Стог Рубинов', rate: 256 },
                { from: 'Стог Рубинов', to: 'Сингулярность', rate: 16 },
                { from: 'Сапфир', to: 'Стог Сапфиров', rate: 256 },
                { from: 'Стог Сапфиров', to: 'Сингулярность', rate: 16 },
                { from: 'Изумруд', to: 'Стог Изумрудов', rate: 256 },
                { from: 'Стог Изумрудов', to: 'Сингулярность', rate: 16 },
                { from: 'Алмаз', to: 'Стог Алмазов', rate: 256 },
                { from: 'Стог Алмазов', to: 'Сингулярность', rate: 16 },
                { from: 'Кварц', to: 'Стог Кварца', rate: 256 },
                { from: 'Стог Кварца', to: 'Сингулярность', rate: 16 },
                { from: 'Обсидиан', to: 'Стог Обсидиана', rate: 256 },
                { from: 'Стог Обсидиана', to: 'Сингулярность', rate: 16 },
                { from: 'Кусочек Звезды Ада', to: 'Звезда Ада', rate: 9 },
            ]
        },
        foraging: {
            label: '🌲 ФОРЕСТ',
            recipes: [
                { from: 'Дуб', to: 'Стог Дуба', rate: 256 },
                { from: 'Берёза', to: 'Стог Берёзы', rate: 256 },
                { from: 'Осина', to: 'Стог Осины', rate: 256 },
                { from: 'Ель', to: 'Стог Ели', rate: 256 },
                { from: 'Тёмный Дуб', to: 'Стог Тёмного Дуба', rate: 256 },
                { from: 'Акация', to: 'Стог Акации', rate: 256 },
                { from: 'Вяз Тьмы', to: 'Стог Вяза Тьмы', rate: 256 },
                { from: 'Чёрная Ива', to: 'Стог Чёрной Ивы', rate: 256 },
                { from: 'Древо Жизни', to: 'Стог Древа Жизни', rate: 256 },
                { from: 'Кристальный Кедр', to: 'Стог Кристального Кедра', rate: 256 },
                { from: 'Звёздная Секвойя', to: 'Стог Звёздной Секвойи', rate: 256 },
                { from: 'Лунный Ясень', to: 'Стог Лунного Ясеня', rate: 256 },
                { from: 'Стог Дуба', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Берёзы', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Осины', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Ели', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Тёмного Дуба', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Акации', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Вяза Тьмы', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Чёрной Ивы', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Древа Жизни', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Кристального Кедра', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Звёздной Секвойи', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Лунного Ясеня', to: 'Сингулярность', rate: 16 }
            ]
        },
        fishing: {
            label: '🎣 РЫБАЛКА',
            recipes: [
                { from: 'Карась', to: 'Стог Карасей', rate: 256 },
                { from: 'Окунь', to: 'Стог Окуней', rate: 256 },
                { from: 'Щука', to: 'Стог Щук', rate: 256 },
                { from: 'Раки', to: 'Стог Раков', rate: 256 },
                { from: 'Треска', to: 'Стог Трески', rate: 256 },
                { from: 'Лосось', to: 'Стог Лосося', rate: 256 },
                { from: 'Тунец', to: 'Стог Тунца', rate: 256 },
                { from: 'Морской Ёж', to: 'Стог Морских Ежей', rate: 256 },
                { from: 'Пещерная Рыба', to: 'Стог Пещерной Рыбы', rate: 256 },
                { from: 'Слепой Сом', to: 'Стог Слепых Сомов', rate: 256 },
                { from: 'Кристальный Краб', to: 'Стог Кристальных Крабов', rate: 256 },
                { from: 'Светящаяся Медуза', to: 'Стог Медуз', rate: 256 },
                { from: 'Магмовая Рыба', to: 'Стог Магмовой Рыбы', rate: 256 },
                { from: 'Адский Угорь', to: 'Стог Адских Угрей', rate: 256 },
                { from: 'Огненный Скат', to: 'Стог Огненных Скатов', rate: 256 },
                { from: 'Лавовый Левиафан', to: 'Стог Левиафанов', rate: 256 },
                { from: 'Стог Карасей', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Окуней', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Щук', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Раков', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Трески', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Лосося', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Тунца', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Морских Ежей', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Пещерной Рыбы', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Слепых Сомов', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Кристальных Крабов', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Медуз', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Магмовой Рыбы', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Адских Угрей', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Огненных Скатов', to: 'Сингулярность', rate: 16 },
                { from: 'Стог Левиафанов', to: 'Сингулярность', rate: 16 }
            ]
        }
    },

    currentExchangeCategory: 'farming',

    openExchange() {
        this.currentExchangeCategory = 'farming';
        this.renderExchange();
        this.showModal('exchangeModal');
    },

    switchExchangeCategory(category) {
        this.currentExchangeCategory = category;
        this.renderExchange();
    },

    renderExchange() {
        const content = document.getElementById('exchange-content');
        if (!content) return;

        let tabsHtml = '<div class="inv-tabs" style="margin-bottom:15px;">';
        for (const [key, cat] of Object.entries(this.exchangeCategories)) {
            const active = key === this.currentExchangeCategory ? 'active' : '';
            tabsHtml += `<div class="inv-tab ${active}" onclick="game.switchExchangeCategory('${key}')">${cat.label}</div>`;
        }
        tabsHtml += '</div>';

        const category = this.exchangeCategories[this.currentExchangeCategory];
        let recipesHtml = '<div class="card"><h3>🔄 Крафт ресурсов</h3>';

        if (!category.recipes || category.recipes.length === 0) {
            recipesHtml += '<div style="text-align:center;color:#666;padding:20px;">Пока нет рецептов в этом отделе</div>';
        } else {
            for (const recipe of category.recipes) {
                const fromItem = this.state.inventory.find(i => i.name === recipe.from && i.type === 'material');
                const fromCount = fromItem ? fromItem.count || 0 : 0;
                
                const toItem = this.state.inventory.find(i => i.name === recipe.to && i.type === 'material');
                const toCount = toItem ? toItem.count || 0 : 0;

                const canCraft = Math.floor(fromCount / recipe.rate);

                recipesHtml += `
                    <div style="margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <b>${recipe.from}</b>
                                <span style="color:var(--accent);">(${fromCount})</span>
                            </div>
                            <span style="color:var(--gray);">➔</span>
                            <div>
                                <b>${recipe.to}</b>
                                <span style="color:var(--green);">(${toCount})</span>
                            </div>
                        </div>
                        <div style="text-align:center; margin-top:8px;">
                            <small style="color:var(--gray);">${recipe.rate} ${recipe.from} = 1 ${recipe.to}</small>
                        </div>
                        <div class="item-actions" style="margin-top:10px;">
                            <button class="act-btn" onclick="game.craftResource('${recipe.from}', '${recipe.to}', ${recipe.rate}, 1)" ${canCraft < 1 ? 'disabled' : ''}>
                                Создать
                            </button>
                            <button class="act-btn" onclick="game.craftResource('${recipe.from}', '${recipe.to}', ${recipe.rate}, ${canCraft})" ${canCraft < 1 ? 'disabled' : ''}>
                                Создать всё (${canCraft})
                            </button>
                        </div>
                    </div>
                `;
            }
        }
        recipesHtml += '</div>';

        const p2pHtml = `
            <div class="card" style="margin-top:15px;">
                <h3>🤝 Обмен между игроками</h3>
                <p style="color:var(--gray); font-size:0.8rem;">
                    Здесь можно будет обмениваться ресурсами с другими игроками через облако.
                    <br>Статус: <b>В разработке</b>
                </p>
                <div id="p2p-list"></div>
                <button class="cooldown-btn" onclick="game.refreshP2P()">Обновить предложения</button>
            </div>
        `;

        content.innerHTML = tabsHtml + recipesHtml + p2pHtml;
    },

    craftResource(fromName, toName, rate, amount) {
        if (amount <= 0) return;
        
        const cost = amount * rate;
        const fromItem = this.state.inventory.find(i => i.name === fromName && i.type === 'material');
        
        if (!fromItem || (fromItem.count || 0) < cost) {
            this.msg(`Недостаточно ${fromName}! Нужно ${cost}`);
            return;
        }

        fromItem.count -= cost;
        if (fromItem.count <= 0) {
            this.state.inventory = this.state.inventory.filter(i => i.id !== fromItem.id);
        }

        this.addMaterial(toName, 'material', amount);
        
        this.msg(`Создано: ${amount} ${toName}`);
        this.renderExchange();
        this.updateUI();
    },

    async refreshP2P() {
        const list = document.getElementById('p2p-list');
        if (list) {
            list.innerHTML = '<div style="text-align:center; color:#666;">P2P обмен недоступен в локальном режиме</div>';
        }
    }
});
