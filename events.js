Object.assign(game, {
    eventsList: {
        rain_season: {
            name: 'Сезон Дождей',
            icon: '🌧️',
            desc: '+25% фортуны рыбалки, +10% XP рыбалки, 3% шанс Золотой Рыбки',
            duration: 3600000
        },
        lucky_season: {
            name: 'Удачный Сезон',
            icon: '🍀',
            desc: 'Шанс появления мобов увеличен x2 на всех локациях',
            duration: 3600000
        }
    },

    openEventsMenu() {
        this.checkEventExpiry();
        this.renderEventsMenu();
        this.showModal('eventsModal');
    },

    checkEventExpiry() {
        if (this.state.activeEvent && this.state.eventEndTime && Date.now() > this.state.eventEndTime) {
            const evtInfo = this.eventsList[this.state.activeEvent];
            if (evtInfo) this.msg(`${evtInfo.icon} ${evtInfo.name} завершился!`);
            this.state.activeEvent = null;
            this.state.eventEndTime = 0;
        }
    },

    renderEventsMenu() {
        const content = document.getElementById('events-content');
        if (!content) return;

        let html = '';

        if (this.state.activeEvent) {
            const evt = this.eventsList[this.state.activeEvent];
            const remaining = Math.max(0, this.state.eventEndTime - Date.now());
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            html += `
                <div class="card" style="border-color:var(--green);">
                    <h4 style="color:var(--green);">${evt.icon} АКТИВНЫЙ ИВЕНТ: ${evt.name}</h4>
                    <p style="color:var(--gray);">${evt.desc}</p>
                    <p style="color:var(--accent);">Осталось: ${mins}м ${secs}с</p>
                </div>
            `;
        } else {
            html += `
                <div class="card" style="text-align:center;">
                    <p style="color:var(--gray);">Нет активного ивента</p>
                </div>
            `;
        }

        html += '<h4 style="margin-top:15px;">Доступные ивенты:</h4>';

        for (const [key, evt] of Object.entries(this.eventsList)) {
            const isActive = this.state.activeEvent === key;
            html += `
                <div class="card" style="${isActive ? 'opacity:0.5;' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <b>${evt.icon} ${evt.name}</b>
                            <br><small style="color:var(--gray);">${evt.desc}</small>
                            <br><small style="color:var(--accent);">Длительность: ${evt.duration / 60000} мин</small>
                        </div>
                    </div>
                    <div class="item-actions" style="margin-top:10px;">
                        <button class="act-btn" ${isActive || this.state.activeEvent ? 'disabled' : ''} onclick="game.startEvent('${key}')">
                            ${isActive ? 'АКТИВЕН' : this.state.activeEvent ? 'ДРУГОЙ ИВЕНТ АКТИВЕН' : 'ЗАПУСТИТЬ'}
                        </button>
                    </div>
                </div>
            `;
        }

        content.innerHTML = html;
    },

    startEvent(eventKey) {
        if (this.state.activeEvent) {
            this.msg('Уже есть активный ивент!');
            return;
        }
        const evt = this.eventsList[eventKey];
        if (!evt) return;

        this.state.activeEvent = eventKey;
        this.state.eventEndTime = Date.now() + evt.duration;
        this.msg(`${evt.icon} ${evt.name} активирован на ${evt.duration / 60000} минут!`);
        this.renderEventsMenu();
        this.updateUI();
    },

    isEventActive(eventKey) {
        this.checkEventExpiry();
        return this.state.activeEvent === eventKey && Date.now() < this.state.eventEndTime;
    },

    getMobSpawnMultiplier() {
        if (this.isEventActive('lucky_season')) return 2;
        return 1;
    }
});
