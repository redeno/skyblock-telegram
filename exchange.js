// exchange.js — Система обмена и крафта ресурсов с отделами

Object.assign(game, {
    // Рецепты обмена по категориям
    exchangeCategories: {
        farming: {
            label: '🌾 ФЕРМА',
            recipes: [
                // Пшеница
                { from: 'Пшеница', to: 'Стог Пшена', rate: 256 },
                { from: 'Стог Пшена', to: 'Пшеничная сингулярность', rate: 16 },
                // Картофель
                { from: 'Картофель', to: 'Стог Картошки', rate: 256 },
                { from: 'Стог Картошки', to: 'Картофельная сингулярность', rate: 16 },
                // Морковь
                { from: 'Морковь', to: 'Стог Моркови', rate: 256 },
                { from: 'Стог Моркови', to: 'Морковная сингулярность', rate: 16 },
                // Тыква
                { from: 'Тыква', to: 'Стог Тыквы', rate: 256 },
                { from: 'Стог Тыквы', to: 'Тыквенная сингулярность', rate: 16 },
                // Арбуз
                { from: 'Арбуз', to: 'Стог Арбузов', rate: 256 },
                { from: 'Стог Арбузов', to: 'Арбузная сингулярность', rate: 16 },
                // Тростник
                { from: 'Тростник', to: 'Стог Тростника', rate: 256 },
                { from: 'Стог Тростника', to: 'Тростниковая сингулярность', rate: 16 },
                // Грибы
                { from: 'Грибы', to: 'Стог Грибов', rate: 256 },
                { from: 'Стог Грибов', to: 'Грибная сингулярность', rate: 16 },
                // Адский нарост
                { from: 'Адский нарост', to: 'Стог Адского нароста', rate: 256 },
                { from: 'Стог Адского нароста', to: 'Адская сингулярность', rate: 16 },
            ]
        },
        mining: {
            label: '⛏️ МАЙНИНГ',
            recipes: [
                // Добавишь свои рецепты для майнинга
            ]
        },
        fishing: {
            label: '🎣 РЫБАЛКА',
            recipes: [
                // Добавишь свои рецепты для рыбалки
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

        // Табы категорий
        let tabsHtml = '<div class="inv-tabs" style="margin-bottom:15px;">';
        for (const [key, cat] of Object.entries(this.exchangeCategories)) {
            const active = key === this.currentExchangeCategory ? 'active' : '';
            tabsHtml += `<div class="inv-tab ${active}" onclick="game.switchExchangeCategory('${key}')">${cat.label}</div>`;
        }
        tabsHtml += '</div>';

        // Рецепты текущей категории
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

        // P2P Обмен (заглушка)
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

        // Списываем ресурсы
        fromItem.count -= cost;
        if (fromItem.count <= 0) {
            this.state.inventory = this.state.inventory.filter(i => i.id !== fromItem.id);
        }

        // Добавляем новые
        this.addMaterial(toName, 'material', amount);
        
        this.msg(`Создано: ${amount} ${toName}`);
        this.renderExchange();
        this.updateUI();
    },

    // addMaterial с поддержкой количества
    addMaterial(name, type = 'material', count = 1) {
        const existing = this.state.inventory.find(i => i.name === name && i.type === type);
        if (existing) {
            existing.count = (existing.count || 1) + count;
        } else {
            this.state.inventory.push({
                id: this.state.nextItemId++,
                name,
                type,
                count: count,
                equipped: false
            });
        }
    },

    async refreshP2P() {
        this.msg('Загрузка предложений...');
        try {
            const { data, error } = await supabaseClient
                .from('offers')
                .select('*')
                .limit(10);
                
            if (error) {
                console.error(error);
                this.msg('Ошибка загрузки предложений');
                return;
            }
            
            const list = document.getElementById('p2p-list');
            if (list) {
                if (!data || data.length === 0) {
                    list.innerHTML = '<div style="text-align:center; color:#666;">Нет активных предложений</div>';
                } else {
                    list.innerHTML = data.map(o => `<div>${o.item_name} за ${o.price}💰</div>`).join('');
                }
            }
        } catch (e) {
            this.msg('Ошибка соединения');
        }
    }
});
