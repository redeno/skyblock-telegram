// admin.js — Админ-панель для тестирования
// Подключать ПОСЛЕ game.js и всех модулей

const AdminInventory = {
    weapons: [
        {name:'Старый меч',type:'weapon',str:10,cost:1000},
        {name:'Каменный меч',type:'weapon',str:20,cost:25000},
        {name:'Железный Меч',type:'weapon',str:30,cost:500000},
        {name:'Алмазный Меч',type:'weapon',str:40,cost:1000000},
        {name:'Незеритовый Меч',type:'weapon',str:50,cost:10000000},
        {name:'Меч первопроходца',type:'weapon',str:60,hp:10,def:0,cd:10,cost:500000000},
        {name:'Меч Мидаса',type:'weapon',dynamic_str:'midas',cost:50000000},
        {name:'Меч Гиганта',type:'weapon',str:100,cd:50,cost:250000},
        {name:'Гиперион',type:'weapon',magic:true,cost:500000},
        {name:'Адский Меч',type:'weapon',str:75,cd:30,burn:true,cost:6000000},
        {name:'Топор Древнего',type:'weapon',str:65,cd:25,cost:5000000},
        {name:'Трезубец Императора',type:'weapon',str:55,cd:20,cost:5000000},
        {name:'Щупальце Спрута',type:'weapon',str:70,int:30,mag_amp:3,cost:12000000},
        {name:'Клинок Рагнарёка',type:'weapon',str:100,cc:10,cd:40,cost:50000000}
    ],
    armor: [
        {name:'Железная Броня',type:'armor',def:10,cost:10000},
        {name:'Алмазная броня',type:'armor',def:20,cost:50000},
        {name:'Shaddow Assasins броня',type:'armor',def:25,str:25,cc:5,cd:10,cost:1000000},
        {name:'ДемонЛорд Броня',type:'armor',str:50,def:30,cc:10,cd:25,mag_amp:5,mf:25,cost:10000000},
        {name:'Накидка первопроходца',type:'armor',hp:50,str:25,int:25,def:15,cc:15,cd:25,farming_exp_bonus:3,mining_exp_bonus:3,foraging_exp_bonus:3,fishing_exp_bonus:3,dungeon_exp_bonus:3,farming_fortune:20,mining_fortune:20,foraging_fortune:20,fishing_fortune:20,cost:50000000},
        {name:'Farmer Armor',type:'armor',rarity:'rare',farming_fortune:50,farming_exp_bonus:5,cost:0},
        {name:'Melon Armor',type:'armor',rarity:'epic',farming_fortune:125,farming_exp_bonus:7,cost:0},
        {name:'Fermento Armor',type:'armor',rarity:'legendary',farming_fortune:200,farming_exp_bonus:10,cost:0},
        {name:'Helianthus Armor',type:'armor',rarity:'legendary',farming_fortune:300,farming_exp_bonus:15,cost:0},
        {name:'Шахтёрская броня',type:'armor',mining_fortune:50,mining_exp_bonus:5,def:5,cost:50000},
        {name:'Рудокопная броня',type:'armor',mining_fortune:125,mining_exp_bonus:7,def:10,cost:500000},
        {name:'Мифриловая броня',type:'armor',mining_fortune:200,mining_exp_bonus:10,def:20,mf:10,cost:5000000},
        {name:'Кристальная броня',type:'armor',mining_fortune:300,mining_exp_bonus:15,def:30,mf:20,cost:50000000},
        {name:'Фермерская броня',type:'armor',farming_fortune:50,farming_exp_bonus:5,cost:50000},
        {name:'Арбузная броня',type:'armor',farming_fortune:125,farming_exp_bonus:7,cost:500000},
        {name:'Ферменто броня',type:'armor',farming_fortune:200,farming_exp_bonus:10,cost:5000000},
        {name:'Гелиантус броня',type:'armor',farming_fortune:300,farming_exp_bonus:15,cost:50000000},
        {name:'Рыбацкая броня',type:'armor',fishing_fortune:50,fishing_exp_bonus:5,cost:50000},
        {name:'Морская броня',type:'armor',fishing_fortune:125,fishing_exp_bonus:7,def:8,cost:500000},
        {name:'Броня глубин',type:'armor',fishing_fortune:200,fishing_exp_bonus:10,def:15,hp:25,cost:5000000},
        {name:'Левиафанова броня',type:'armor',fishing_fortune:300,fishing_exp_bonus:15,def:25,hp:50,cost:50000000},
        {name:'Лесная броня',type:'armor',foraging_fortune:50,foraging_exp_bonus:5,cost:50000},
        {name:'Броня лесника',type:'armor',foraging_fortune:125,foraging_exp_bonus:7,str:10,cost:500000},
        {name:'Древесная броня',type:'armor',foraging_fortune:200,foraging_exp_bonus:10,str:20,def:10,cost:5000000},
        {name:'Броня Друида',type:'armor',foraging_fortune:300,foraging_exp_bonus:15,str:30,def:20,hp:30,cost:50000000}
    ],
    mining_tools: [
        {name:'Деревянная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:10,cost:500},
        {name:'Каменная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:30,cost:2500},
        {name:'Железная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:60,double_chance:10,cost:15000},
        {name:'Золотая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:100,double_chance:25,cost:50000},
        {name:'Алмазная кирка',type:'tool',sub_type:'pickaxe',mining_fortune:150,triple_chance:10,cost:250000},
        {name:'Незеритовая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:250,triple_chance:20,cost:1000000},
        {name:'Титаническая кирка',type:'tool',sub_type:'pickaxe',mining_fortune:400,triple_chance:30,cost:10000000},
        {name:'Дивайн кирка',type:'tool',sub_type:'pickaxe',mining_fortune:600,triple_chance:50,cost:100000000},
        {name:'Разрушитель Границ',type:'tool',sub_type:'pickaxe',mining_fortune:1000,triple_chance:70,cost:5000000000}
    ],
    farming_tools: [
        {name:'Деревянная мотыга',type:'tool',sub_type:'hoe',farming_fortune:10,cost:500},
        {name:'Каменная мотыга',type:'tool',sub_type:'hoe',farming_fortune:30,cost:2500},
        {name:'Железная мотыга',type:'tool',sub_type:'hoe',farming_fortune:60,cost:15000},
        {name:'Алмазная мотыга',type:'tool',sub_type:'hoe',farming_fortune:150,cost:250000},
        {name:'Незеритовая мотыга',type:'tool',sub_type:'hoe',farming_fortune:250,cost:1000000},
        {name:'Титаническая мотыга',type:'tool',sub_type:'hoe',farming_fortune:400,cost:10000000},
        {name:'Дивайн мотыга',type:'tool',sub_type:'hoe',farming_fortune:600,cost:100000000},
        {name:'Мотыга созидания',type:'tool',sub_type:'hoe',farming_fortune:1000,farming_exp_bonus:15,cost:5000000000}
    ],
    foraging_tools: [
        {name:'Деревянный топор',type:'tool',sub_type:'axe',foraging_fortune:10,cost:500},
        {name:'Каменный топор',type:'tool',sub_type:'axe',foraging_fortune:30,cost:2500},
        {name:'Железный топор',type:'tool',sub_type:'axe',foraging_fortune:60,cost:15000},
        {name:'Золотой топор',type:'tool',sub_type:'axe',foraging_fortune:100,cost:50000},
        {name:'Алмазный топор',type:'tool',sub_type:'axe',foraging_fortune:150,cost:250000},
        {name:'Незеритовый топор',type:'tool',sub_type:'axe',foraging_fortune:250,cost:1000000},
        {name:'Титанический топор',type:'tool',sub_type:'axe',foraging_fortune:400,cost:10000000},
        {name:'Дивайн топор',type:'tool',sub_type:'axe',foraging_fortune:600,cost:100000000}
    ],
    fishing_tools: [
        {name:'Старая удочка',type:'tool',sub_type:'rod',fishing_fortune:10,cost:500},
        {name:'Укрепленная удочка',type:'tool',sub_type:'rod',fishing_fortune:30,cost:5000},
        {name:'Удочка мастера',type:'tool',sub_type:'rod',fishing_fortune:70,cost:50000},
        {name:'Морская удочка',type:'tool',sub_type:'rod',fishing_fortune:150,cost:500000},
        {name:'Удочка гиганта',type:'tool',sub_type:'rod',fishing_fortune:300,triple_chance:25,cost:100000000},
        {name:'Удочка героя',type:'tool',sub_type:'rod',fishing_fortune:500,triple_chance:25,cost:500000000}
    ],
    accessories: [
        {name:'Талисман удачи',type:'accessory',mf:10,cost:10000},
        {name:'Талисман силы',type:'accessory',str:5,cost:5000},
        {name:'Талисман защиты',type:'accessory',def:5,cost:5000},
        {name:'Талисман мощи',type:'accessory',cd:5,cc:1,cost:10000},
        {name:'Талисман знаний',type:'accessory',int:5,cost:5000},
        {name:'Талисман древних знаний',type:'accessory',int:25,mag_amp:1,cost:1000000},
        {name:'Кольцо опыта',type:'accessory',xp_bonus:1,cost:100000},
        {name:'Golden Box Talisman',type:'accessory',gold_bonus:1,cost:5000000},
        {name:'Hay Bale Talisman',type:'accessory',farming_fortune:5,cost:100000},
        {name:'Farmer Orb Talisman',type:'accessory',farming_exp_bonus:1,cost:10000000},
        {name:'Tiger Talisman',type:'accessory',cc:7,cost:50000000},
        {name:'Treasure Artifact',type:'accessory',gold_bonus:5,str:10,cost:300000000},
        {name:'Талисман силы +1',type:'accessory',str:1,cost:100},
        {name:'Талисман крита +1',type:'accessory',cd:1,cost:100},
        {name:'Талисман удачи +1',type:'accessory',mf:1,cost:100},
        {name:'Талисман защиты +20',type:'accessory',def:20,cost:5000},
        {name:'Боевой Талисман Шахтёра',type:'accessory',str:20,def:10,cc:5,mining_fortune:30,cost:2000000},
        {name:'Cropie Talisman',type:'accessory',farming_fortune:25,cost:250000},
        {name:'Squash Ring',type:'accessory',farming_fortune:75,cost:2500000},
        {name:'Fermento Artifact',type:'accessory',farming_fortune:150,cost:30000000},
        {name:'Талисман Леса',type:'accessory',foraging_fortune:40,foraging_exp_bonus:3,cost:3000000},
        {name:'Талисман Ручья',type:'accessory',fishing_fortune:20,hp:15,cost:500000},
        {name:'Корона Кролика',type:'accessory',mf:15,fishing_fortune:10,cost:1000000},
        {name:'Имперский Амулет',type:'accessory',fishing_fortune:50,fishing_exp_bonus:5,def:15,cost:8000000},
        {name:'Сияющий Талисман',type:'accessory',fishing_fortune:80,int:20,cost:15000000},
        {name:'Амулет Конца Света',type:'accessory',str:30,def:30,fishing_fortune:100,fishing_exp_bonus:10,cost:80000000}
    ],
    potions: [
        {name:'GodPotion',type:'potion',cost:1000000},
        {name:'Печенька',type:'potion',cost:10000000}
    ],
    pets: [
        {name:'Чешуйница',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'mining',base_bonus:0.1,cost:5000},
        {name:'Кролик',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'farming',base_bonus:0.1,cost:5000},
        {name:'Сквид',type:'pet',rarity:'common',lvl:1,xp:0,next:100,skill:'fishing',base_bonus:0.1,cost:5000},
        {name:'Ёжик',type:'pet',skill:'foraging',rarity:'common',lvl:1,xp:0,next:100,cost:5000},
        {name:'Бейби Иссушитель',type:'pet',skill:'combat',rarity:'common',lvl:1,xp:0,next:100,cost:50000000},
        {name:'Тигр',type:'pet',skill:'combat',rarity:'common',lvl:1,xp:0,next:100,cost:1000000},
        {name:'Бобёр',type:'pet',skill:'foraging',rarity:'common',lvl:1,xp:0,next:100,cost:25000},
        {name:'Дельфин',type:'pet',skill:'fishing',rarity:'common',lvl:1,xp:0,next:100,cost:25000},
        {name:'Черепаха',type:'pet',skill:'fishing',rarity:'common',lvl:1,xp:0,next:100,cost:100000}
    ],
    materials: [
        {name:'Булыжник',type:'material',count:10000},
        {name:'Уголь',type:'material',count:10000},
        {name:'Медь',type:'material',count:5000},
        {name:'Железо',type:'material',count:5000},
        {name:'Золото',type:'material',count:5000},
        {name:'Лазурит',type:'material',count:5000},
        {name:'Редстоун',type:'material',count:5000},
        {name:'Мифрил',type:'material',count:3000},
        {name:'Рубин',type:'material',count:1000},
        {name:'Сапфир',type:'material',count:1000},
        {name:'Изумруд',type:'material',count:1000},
        {name:'Алмаз',type:'material',count:1000},
        {name:'Кварц',type:'material',count:3000},
        {name:'Обсидиан',type:'material',count:2000},
        {name:'Сера',type:'material',count:1000},
        {name:'Кусочек Звезды Ада',type:'material',count:100},
        {name:'Звезда Ада',type:'material',count:10},
        {name:'Пшеница',type:'material',count:100000},
        {name:'Картофель',type:'material',count:100000},
        {name:'Морковь',type:'material',count:100000},
        {name:'Тыква',type:'material',count:50000},
        {name:'Арбуз',type:'material',count:50000},
        {name:'Тростник',type:'material',count:50000},
        {name:'Грибы',type:'material',count:30000},
        {name:'Адский нарост',type:'material',count:30000},
        {name:'Карась',type:'material',count:50000},
        {name:'Окунь',type:'material',count:50000},
        {name:'Щука',type:'material',count:20000},
        {name:'Раки',type:'material',count:10000},
        {name:'Треска',type:'material',count:50000},
        {name:'Лосось',type:'material',count:50000},
        {name:'Тунец',type:'material',count:20000},
        {name:'Морской Ёж',type:'material',count:10000},
        {name:'Пещерная Рыба',type:'material',count:30000},
        {name:'Слепой Сом',type:'material',count:20000},
        {name:'Кристальный Краб',type:'material',count:10000},
        {name:'Светящаяся Медуза',type:'material',count:5000},
        {name:'Магмовая Рыба',type:'material',count:20000},
        {name:'Адский Угорь',type:'material',count:15000},
        {name:'Огненный Скат',type:'material',count:10000},
        {name:'Лавовый Левиафан',type:'material',count:5000},
        {name:'Дуб',type:'material',count:50000},
        {name:'Берёза',type:'material',count:50000},
        {name:'Осина',type:'material',count:30000},
        {name:'Ель',type:'material',count:30000},
        {name:'Тёмный Дуб',type:'material',count:30000},
        {name:'Акация',type:'material',count:30000},
        {name:'Вяз Тьмы',type:'material',count:20000},
        {name:'Чёрная Ива',type:'material',count:20000},
        {name:'Древо Жизни',type:'material',count:10000},
        {name:'Кристальный Кедр',type:'material',count:10000},
        {name:'Звёздная Секвойя',type:'material',count:5000},
        {name:'Лунный Ясень',type:'material',count:5000},
        {name:'Гнилая плоть',type:'material',count:10000},
        {name:'Кость',type:'material',count:10000},
        {name:'Нить',type:'material',count:10000},
        {name:'Hot Potato Book',type:'material',count:100},
        {name:'Апгрейд питомца',type:'material',count:100},
        {name:'Фрагмент из Данжа',type:'material',count:5000},
        {name:'Стог Пшена',type:'material',count:100},
        {name:'Стог Картошки',type:'material',count:100},
        {name:'Стог Моркови',type:'material',count:100},
        {name:'Стог Тыквы',type:'material',count:100},
        {name:'Стог Арбузов',type:'material',count:100},
        {name:'Стог Тростника',type:'material',count:100},
        {name:'Стог Грибов',type:'material',count:100},
        {name:'Стог Адского нароста',type:'material',count:100},
        {name:'Стог Угля',type:'material',count:100},
        {name:'Стог Меди',type:'material',count:100},
        {name:'Стог Железа',type:'material',count:100},
        {name:'Стог Золота',type:'material',count:100},
        {name:'Стог Лазурита',type:'material',count:100},
        {name:'Стог Редстоуна',type:'material',count:100},
        {name:'Стог Мифрила',type:'material',count:100},
        {name:'Стог Рубинов',type:'material',count:100},
        {name:'Стог Сапфиров',type:'material',count:100},
        {name:'Стог Изумрудов',type:'material',count:100},
        {name:'Стог Алмазов',type:'material',count:100},
        {name:'Стог Кварца',type:'material',count:100},
        {name:'Стог Обсидиана',type:'material',count:100},
        {name:'Сингулярность',type:'material',count:50},
        {name:'Сингулярность Пшена',type:'material',count:20},
        {name:'Сингулярность Картошки',type:'material',count:20},
        {name:'Сингулярность Моркови',type:'material',count:20}
    ]
};

Object.assign(game, {
    adminGiveAll() {
        let id = this.state.nextItemId || 100;

        const addItems = (items) => {
            for (const template of items) {
                const item = { ...template, id: id++, equipped: false };
                if (item.type === 'material') {
                    this.addMaterial(item.name, 'material', item.count || 1);
                } else if (item.type === 'pet') {
                    const exists = this.state.pets.find(p => p.name === item.name);
                    if (!exists) {
                        this.state.pets.push({ ...item });
                    }
                } else if (item.type === 'potion') {
                    if (item.name === 'GodPotion') {
                        this.state.buffs.godpotion = { endTime: Date.now() + 24*60*60*1000 };
                    } else if (item.name === 'Печенька') {
                        this.state.buffs.cookie = { endTime: Date.now() + 24*60*60*1000 };
                    }
                } else {
                    const exists = this.state.inventory.find(i => i.name === item.name);
                    if (!exists) {
                        this.state.inventory.push(item);
                    }
                }
            }
        };

        addItems(AdminInventory.weapons);
        addItems(AdminInventory.armor);
        addItems(AdminInventory.mining_tools);
        addItems(AdminInventory.farming_tools);
        addItems(AdminInventory.foraging_tools);
        addItems(AdminInventory.fishing_tools);
        addItems(AdminInventory.accessories);
        addItems(AdminInventory.potions);
        addItems(AdminInventory.pets);
        addItems(AdminInventory.materials);

        this.state.nextItemId = id;
        this.state.coins += 999999999;

        for (const m of this.state.minions) {
            m.lvl = Math.max(m.lvl, 5);
            m.stored = 0;
        }

        Object.keys(this.state.skills).forEach(k => {
            if (k !== 'skyblock') {
                this.state.skills[k].lvl = Math.max(this.state.skills[k].lvl, 50);
            }
        });

        this.msg('ADMIN: Все предметы выданы!');
        this.updateUI();
    },

    adminResetInventory() {
        this.state.inventory = [];
        this.state.pets = [];
        this.state.coins = 0;
        this.state.buffs = { godpotion:{endTime:0}, cookie:{endTime:0} };
        this.msg('ADMIN: Инвентарь очищен!');
        this.updateUI();
    },

    adminSetCoins(amount) {
        this.state.coins = amount;
        this.msg(`ADMIN: Монеты = ${amount.toLocaleString()}`);
        this.updateUI();
    },

    adminSetSkillLevel(skill, level) {
        if (this.state.skills[skill]) {
            this.state.skills[skill].lvl = level;
            this.msg(`ADMIN: ${skill} = LVL ${level}`);
            this.updateUI();
        }
    },

    adminMaxAll() {
        Object.keys(this.state.skills).forEach(k => {
            if (k !== 'skyblock') {
                this.state.skills[k].lvl = 100;
            }
        });
        for (const m of this.state.minions) {
            m.lvl = 15;
        }
        this.state.coins = 99999999999;
        this.msg('ADMIN: Все скиллы и миньоны на МАКС!');
        this.updateUI();
    },

    openAdminPanel() {
        this.renderAdminContent();
        this.showModal('adminModal');
    },

    renderAdminContent() {
        const content = document.getElementById('admin-content');
        if (!content) return;

        const categories = [
            {key: 'weapons', label: 'ОРУЖИЕ', icon: '⚔️'},
            {key: 'armor', label: 'БРОНЯ', icon: '🛡️'},
            {key: 'mining_tools', label: 'КИРКИ', icon: '⛏️'},
            {key: 'farming_tools', label: 'МОТЫГИ', icon: '🌾'},
            {key: 'foraging_tools', label: 'ТОПОРЫ', icon: '🌲'},
            {key: 'fishing_tools', label: 'УДОЧКИ', icon: '🎣'},
            {key: 'accessories', label: 'ТАЛИСМАНЫ', icon: '💎'},
            {key: 'pets', label: 'ПИТОМЦЫ', icon: '🐾'},
            {key: 'materials', label: 'РЕСУРСЫ', icon: '📦'},
            {key: 'potions', label: 'ЗЕЛЬЯ', icon: '🧪'}
        ];

        let html = `<h3 style="text-align:center;color:var(--red);margin-top:0;">🔧 АДМИН-ПАНЕЛЬ</h3>`;
        html += `<div style="display:flex;flex-direction:column;gap:8px;">`;
        html += `<button class="cooldown-btn" style="background:var(--green);" onclick="game.adminGiveAll()">ВЫДАТЬ ВСЁ</button>`;
        html += `<button class="cooldown-btn" style="background:var(--accent);" onclick="game.adminMaxAll()">МАКС ВСЕ СКИЛЛЫ</button>`;
        html += `<button class="cooldown-btn" style="background:var(--red);" onclick="game.adminResetInventory()">ОЧИСТИТЬ ИНВЕНТАРЬ</button>`;
        html += `<div style="display:flex;gap:6px;flex-wrap:wrap;">`;
        html += `<button class="act-btn" onclick="game.adminSetCoins(1000000)">+1М</button>`;
        html += `<button class="act-btn" onclick="game.adminSetCoins(100000000)">+100М</button>`;
        html += `<button class="act-btn" onclick="game.adminSetCoins(999999999)">+999М</button>`;
        html += `</div>`;
        html += `<hr style="border-color:var(--dark-gray);">`;
        html += `<h4 style="color:var(--gray);margin:4px 0;">ВЫДАТЬ ПО КАТЕГОРИИ:</h4>`;
        categories.forEach(c => {
            html += `<button class="act-btn" style="width:100%;text-align:left;padding:8px 12px;" onclick="game.adminGiveItem('${c.key}')">${c.icon} ${c.label}</button>`;
        });
        html += `</div>`;

        content.innerHTML = html;
    },

    adminGiveItem(categoryKey) {
        const items = AdminInventory[categoryKey];
        if (!items) {
            this.msg('ADMIN: Категория не найдена');
            return;
        }
        let id = this.state.nextItemId || 100;
        for (const template of items) {
            const item = { ...template, id: id++, equipped: false };
            if (item.type === 'material') {
                this.addMaterial(item.name, 'material', item.count || 1);
            } else if (item.type === 'pet') {
                const exists = this.state.pets.find(p => p.name === item.name);
                if (!exists) this.state.pets.push({ ...item });
            } else {
                const exists = this.state.inventory.find(i => i.name === item.name);
                if (!exists) this.state.inventory.push(item);
            }
        }
        this.state.nextItemId = id;
        this.msg(`ADMIN: Выдано из ${categoryKey}!`);
        this.updateUI();
    }
});

console.log('Admin tools loaded. Use: game.adminGiveAll(), game.adminResetInventory(), game.adminMaxAll(), game.adminSetCoins(N), game.adminSetSkillLevel(skill, lvl), game.adminGiveItem(category)');
