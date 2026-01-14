
// exchange.js — Система обмена и крафта ресурсов

Object.assign(game, {
    exchangeRates: {
        'Пшеница': { to: 'Стог Пшена', rate: 512 },
        'Стог Пшена': { to: 'Сингулярность Пшена', rate: 64 }
    },

    openExchange() {
        this.renderExchange();
        this.showModal('exchangeModal');
    },

    renderExchange() {
        const content = document.getElementById('exchange-content');
        if (!content) return;

        let html = '<div class="card"><h3>🔄 Крафт ресурсов</h3>';
        
        for (const [from, data] of Object.entries(this.exchangeRates)) {
            const to = data.to;
            const rate = data.rate;
            
            // Найти предметы в инвентаре
            const fromItem = this.state.inventory.find(i => i.name === from && i.type === 'material');
            const fromCount = fromItem ? fromItem.count || 0 : 0;
            
            const toItem = this.state.inventory.find(i => i.name === to && i.type === 'material');
            const toCount = toItem ? toItem.count || 0 : 0;

            const canCraft = Math.floor(fromCount / rate);

            html += `
                <div style="margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span>${from} (${fromCount})</span>
                        <span>➔</span>
                        <span>${to} (${toCount})</span>
                    </div>
                    <div style="text-align:center; margin-top:5px;">
                        <small>Курс: ${rate} ${from} = 1 ${to}</small><br>
                        <button class="act-btn" onclick="game.craftResource('${from}', 1)" ${canCraft < 1 ? 'disabled' : ''}>Создать 1</button>
                        <button class="act-btn" onclick="game.craftResource('${from}', ${canCraft})" ${canCraft < 1 ? 'disabled' : ''}>Создать все (${canCraft})</button>
                    </div>
                </div>
            `;
        }
        html += '</div>';

        // P2P Обмен (заглушка для UI, логика через Supabase)
        html += `
            <div class="card">
                <h3>🤝 Обмен между игроками</h3>
                <p style="color:var(--gray); font-size:0.8rem;">
                    Здесь можно будет обмениваться ресурсами с другими игроками через облако.
                    <br>Статус: <b>В разработке</b>
                </p>
                <div id="p2p-list"></div>
                <button class="cooldown-btn" onclick="game.refreshP2P()">Обновить предложения</button>
            </div>
        `;

        content.innerHTML = html;
    },

    craftResource(fromName, amount) {
        if (amount <= 0) return;
        
        const rateData = this.exchangeRates[fromName];
        if (!rateData) return;

        const cost = amount * rateData.rate;
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
        this.addMaterial(rateData.to, 'material', amount); // amount добавляем в addMaterial
        
        this.msg(`Создано: ${amount} ${rateData.to}`);
        this.renderExchange();
        this.updateUI();
    },

    // Переопределим addMaterial чтобы он поддерживал количество
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
        // Тут будет логика Supabase
        const { data, error } = await supabaseClient
            .from('offers')
            .select('*')
            .limit(10);
            
        if (error) {
            console.error(error);
            this.msg('Ошибка загрузки предложений');
            return;
        }
        
        // Рендер предложений...
        const list = document.getElementById('p2p-list');
        if (list) {
            if (!data || data.length === 0) {
                list.innerHTML = '<div style="text-align:center; color:#666;">Нет активных предложений</div>';
            } else {
                list.innerHTML = data.map(o => `<div>${o.item_name} за ${o.price}💰</div>`).join('');
            }
        }
    }
});
