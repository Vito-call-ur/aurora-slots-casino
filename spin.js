/* === LEVIATHAN CORE ENGINE: GLOBAL ELITE === */

// 1. CONFIGURATION (Твой Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBUjjFWdxBZNpTTtCpJVVf3_up0jtdEK58",
  authDomain: "leviathan-21118.firebaseapp.com",
  projectId: "leviathan-21118",
  storageBucket: "leviathan-21118.firebasestorage.app",
  messagingSenderId: "460847163421",
  appId: "1:460847163421:web:0decd4f6bbf0893746fef4",
  measurementId: "G-0JHVG1CSRY"
};

// Инициализация
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// 2. GLOBAL STATE
let balance = parseInt(localStorage.getItem('balance')) || 50000;
let currentJackpot = 1250500;

// 3. UI SYNC (Обновление баланса везде)
function updateBalanceUI() {
    const balTop = document.getElementById('balance-amount');
    const balProf = document.getElementById('prof-balance');
    const formatted = balance.toLocaleString();
    
    if (balTop) balTop.innerText = formatted;
    if (balProf) balProf.innerText = formatted;
    
    localStorage.setItem('balance', balance);
}

// 4. AUTH & PROFILE SYSTEM
window.AuthSystem = {
    currentUser: null,

    // ГЛАВНЫЙ ТРИГГЕР (Клик на аву)
    openAuthOrProfile: function() {
        const modal = document.getElementById('auth-modal');
        const authView = document.getElementById('auth-container');
        const profView = document.getElementById('profile-container');

        if (modal) {
            modal.style.display = 'flex';
            if (this.currentUser) {
                // Юзер в системе -> ПОКАЗЫВАЕМ КАБИНЕТ
                authView.style.display = 'none';
                profView.style.display = 'block';
                this.syncProfile();
            } else {
                // Гость -> ПОКАЗЫВАЕМ ВХОД
                authView.style.display = 'block';
                profView.style.display = 'none';
            }
        }
    },

    // СИНХРОНИЗАЦИЯ ДАННЫХ ВНУТРИ КАБИНЕТА
    syncProfile: function() {
        if (!this.currentUser) return;

        const nameDisplay = document.getElementById('user-display-name');
        const bigAvatar = document.getElementById('user-big-avatar');
        const vipStatus = document.getElementById('user-vip-status');

        if (nameDisplay) nameDisplay.innerText = this.currentUser.displayName || "LEVIATHAN_BOSS";
        if (bigAvatar && this.currentUser.photoURL) bigAvatar.src = this.currentUser.photoURL;

        // ПРОВЕРКА VIP СТАТУСА (СТРОГО!)
        if (vipStatus) {
            if (balance >= 500000) {
                vipStatus.innerText = "MEMBERSHIP: GOLDEN ELITE";
                vipStatus.style.color = "#ffd700";
            } else if (balance >= 100000) {
                vipStatus.innerText = "MEMBERSHIP: SILVER PARTNER";
                vipStatus.style.color = "#c0c0c0";
            } else {
                vipStatus.innerText = "MEMBERSHIP: START HUSTLER";
                vipStatus.style.color = "#ffffff";
            }
        }
        updateBalanceUI();
    },

    hideAuth: function() {
        document.getElementById('auth-modal').style.display = 'none';
    },

    loginWith: function(provider) {
        if (provider === 'google') {
            auth.signInWithPopup(googleProvider).then((res) => {
                this.currentUser = res.user;
                this.hideAuth();
                location.reload(); // Перезагружаем для чистого рендера
            }).catch(err => alert("Connection error: " + err.message));
        }
    },

    logout: function() {
        if (confirm("TERMINATE CONNECTION WITH LEVIATHAN?")) {
            auth.signOut().then(() => {
                localStorage.clear();
                location.reload();
            });
        }
    }
};

// 5. КАТЕГОРИИ И НАВИГАЦИЯ ПО ИГРАМ
window.LeviatEngine = {
    // Список категорий (можно расширять)
    categories: [
        { id: 'slots', title: 'SLOTS & MEGAWAYS', icon: '🔥' },
        { id: 'live', title: 'LIVE CASINO', icon: '🃏' },
        { id: 'tables', title: 'TABLE GAMES', icon: '🎲' },
        { id: 'vip', title: 'VIP EXCLUSIVE', icon: '👑' }
    ],

    init: function() {
        this.renderCategories();
        updateBalanceUI();
    },

        renderCategories: function() {
        const grid = document.getElementById('categories-grid');
        if (!grid) return;
        grid.innerHTML = '';

        this.categories.forEach(cat => {
            const card = document.createElement('div');
            // Убедись, что тут НЕТ лишних классов с анимациями
            card.className = "game-card category-card"; 
            
            card.onclick = () => {
                // 1. Убираем класс у всех
                document.querySelectorAll('.category-card').forEach(c => {
                    c.classList.remove('selected');
                });
                // 2. Добавляем нажатой
                card.classList.add('selected');
                // 3. Переключаем контент
                this.openCategory(cat.id);
            };

            card.innerHTML = `
                <div class="game-img-box" style="background:rgba(255,255,255,0.05); height:150px; display:flex; align-items:center; justify-content:center; font-size:3rem;">
                    ${cat.icon}
                </div>
                <div class="game-info">
                    <h4>${cat.title}</h4>
                    <button class="btn-play-small" style="pointer-events: none;">ENTER ARENA</button>
                </div>
            `;
            grid.appendChild(card);
        });
    },

    openCategory: function(id) {
        const lobby = document.getElementById('lobby-view');
        const gamesView = document.getElementById('games-view');
        const title = document.getElementById('category-title');

        if (lobby && gamesView) {
            lobby.style.display = 'none';
            gamesView.style.display = 'block';
            title.innerText = id.toUpperCase();
            this.renderGames(id);
        }
    },

    backToLobby: function() {
        document.getElementById('games-view').style.display = 'none';
        document.getElementById('lobby-view').style.display = 'block';
    },

    renderGames: function(catId) {
        const grid = document.getElementById('main-games-grid');
        if (!grid) return;
        grid.innerHTML = '';
        
        // Тут будет цикл загрузки твоих игр из базы
        for(let i=1; i<=8; i++) {
            const game = document.createElement('div');
            game.className = 'game-card';
            game.innerHTML = `
                <div class="game-img-box">
                    <img src="https://via.placeholder.com/200x120?text=GAME+${i}" alt="Game">
                </div>
                <div class="game-info">
                    <h4>PREMIER SLOT ${i}</h4>
                    <button class="btn-play-small" onclick="SlotMachine.open('${catId}_game_${i}')">PLAY</button>
                </div>
            `;
            grid.appendChild(game);
        }
    }
};

// 6. SLOT MACHINE CORE LOGIC
window.SlotMachine = {
    isSpinning: false,
    symbols: ['💎', '👑', '🍒', '777', '🍋', '🔔', '🍀', '💰'],

    open: function(gameId) {
        const modal = document.getElementById('game-modal');
        const title = document.getElementById('current-game-title');
        if (modal) {
            modal.style.display = 'flex';
            title.innerText = gameId.toUpperCase().replace('_', ' ');
            this.initReels();
        }
    },

    initReels: function() {
        const container = document.getElementById('reels-container');
        if (!container) return;
        container.innerHTML = '';
        // Создаем 3 барабана
        for (let i = 0; i < 3; i++) {
            const reel = document.createElement('div');
            reel.className = 'reel';
            reel.id = `reel-${i}`;
            reel.innerHTML = `<div class="symbol">${this.symbols[Math.floor(Math.random() * this.symbols.length)]}</div>`;
            container.appendChild(reel);
        }
    },

    spinReal: function() {
        if (this.isSpinning || balance < 500) {
            if (balance < 500) alert("LOW LIQUIDITY! NEED DEPOSIT.");
            return;
        }

        this.isSpinning = true;
        balance -= 500; // Ставка
        updateBalanceUI();

        const reels = [
            document.getElementById('reel-0'),
            document.getElementById('reel-1'),
            document.getElementById('reel-2')
        ];

        const results = [];

        reels.forEach((reel, index) => {
            reel.classList.add('spinning');
            setTimeout(() => {
                const finalSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                reel.innerHTML = `<div class="symbol">${finalSymbol}</div>`;
                reel.classList.remove('spinning');
                results.push(finalSymbol);

                if (results.length === 3) {
                    this.checkWin(results);
                }
            }, 500 + (index * 300)); // Задержка для эффекта
        });
    },

    checkWin: function(res) {
        this.isSpinning = false;
        // Логика победы: если 3 в ряд
        if (res[0] === res[1] && res[1] === res[2]) {
            let winAmount = 5000;
            if (res[0] === '777') winAmount = 50000;
            if (res[0] === '💎') winAmount = 25000;
            
            balance += winAmount;
            alert(`EXTREME WIN! +${winAmount} LVC`);
            updateBalanceUI();
        }
    }
};

// Функция закрытия игры (в глобальную область)
window.closeGame = function() {
    document.getElementById('game-modal').style.display = 'none';
};

// 7. SYSTEM BOOT (ЗАПУСК ВСЕХ СИСТЕМ)
document.addEventListener('DOMContentLoaded', () => {
    // Запускаем движок лобби
    LeviatEngine.init();

    // Прячем прелоадер (Твой фикс зависания!)
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1500); // Даем 1.5 секунды насладиться твоей ебабельной заставкой
    }

    // Слушатель категорий (чтобы не тупили)
    const catTrigger = document.getElementById('categories-trigger');
    const catMenu = document.getElementById('cat-menu');
    if (catTrigger && catMenu) {
        catTrigger.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            catMenu.style.display = (catMenu.style.display === 'block') ? 'none' : 'block';
        };
    }

    // Закрытие всего при клике мимо
    window.onclick = (e) => {
        if (catMenu && !catTrigger.contains(e.target)) {
            catMenu.style.display = 'none';
        }
        const authModal = document.getElementById('auth-modal');
        if (e.target === authModal) {
            AuthSystem.hideAuth();
        }
    };
});

// 8. AI INTERFACE (LEVIATHAN AI)
const aiInput = document.getElementById('ai-input');
const aiSendBtn = document.getElementById('ai-send-btn');
const aiMessages = document.getElementById('ai-messages');

if (aiSendBtn) {
    aiSendBtn.onclick = () => {
        const text = aiInput.value.trim();
        if (!text) return;
        
        // Твое сообщение
        const userMsg = document.createElement('div');
        userMsg.style.cssText = 'color: #ffd700; margin-bottom: 10px; font-size: 0.8rem;';
        userMsg.innerHTML = `<strong>YOU:</strong> ${text}`;
        aiMessages.appendChild(userMsg);
        
        aiInput.value = '';
        
        // Ответ ИИ (пока заглушка, потом прикрутим настоящий разум)
        setTimeout(() => {
            const aiMsg = document.createElement('div');
            aiMsg.style.cssText = 'color: #fff; margin-bottom: 15px; font-size: 0.8rem; opacity: 0.8;';
            aiMsg.innerHTML = `<strong>AI:</strong> Processing your request... Betting on red is not a strategy, but I like your style.`;
            aiMessages.appendChild(aiMsg);
            aiMessages.scrollTop = aiMessages.scrollHeight;
        }, 1000);
    };
}

// Следим за состоянием Firebase
auth.onAuthStateChanged((user) => {
    if (user) {
        AuthSystem.currentUser = user;
        AuthSystem.syncProfile();
        
        // Ставим аву в хедер (ФИНАЛЬНЫЙ ФИКС ГЕЙ-НЕОНА)
        const headAva = document.getElementById('logged-in-avatar');
        const logoutIc = document.getElementById('logged-out-icon');
        if (headAva && user.photoURL) {
            headAva.src = user.photoURL;
            headAva.style.display = 'block';
            if (logoutIc) logoutIc.style.display = 'none';
        }
    }
});

console.log("LEVIATHAN ENGINE: ALL SYSTEMS NOMINAL. MONTE CARLO IS WAITING.");

/* === GLOBAL CASHIER LOGIC === */
const mainDepBtn = document.getElementById('deposit-btn-main');
if (mainDepBtn) { mainDepBtn.onclick = () => { document.getElementById('deposit-modal').style.display = 'flex'; }; }

function selectPayMethod(method) {
    const cards = document.querySelectorAll('.pay-card');
    cards.forEach(c => { c.style.borderColor = '#333'; c.style.background = 'rgba(255,255,255,0.02)'; });
    const active = event.currentTarget;
    let col = (method === 'onion') ? '#00ff00' : (method === 'tg-wallet' ? '#0088cc' : '#ffd700');
    active.style.borderColor = col; active.style.background = `${col}11`;
    const aiM = document.getElementById('ai-messages');
    if (aiM) {
        const d = document.createElement('div'); d.style.cssText = `color:${col}; font-size:0.8rem; margin-bottom:10px; border-left:2px solid ${col}; padding-left:10px;`;
        d.innerHTML = `<strong>AI:</strong> GATEWAY ${method.toUpperCase()} SYNCED.`;
        aiM.appendChild(d); aiM.scrollTop = aiM.scrollHeight;
    }
}

function processDeposit() {
    const amt = parseInt(document.getElementById('deposit-amount').value);
    if (!amt || amt <= 0) return;
    const b = event.target; b.innerText = "AUTHORIZING...";
    setTimeout(() => {
        balance += amt; updateBalanceUI();
        b.innerText = "SUCCESSFUL"; b.style.background = "#00ff00";
        setTimeout(() => {
            document.getElementById('deposit-modal').style.display = 'none';
            b.innerText = "Authorize Transaction"; b.style.background = "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)";
        }, 1000);
    }, 1500);
}

/* === OPEN MODAL === */
const cashBtn = document.getElementById('deposit-btn-main');
if (cashBtn) cashBtn.onclick = () => document.getElementById('deposit-modal').style.display = 'flex';

/* === SELECT METHOD (Glow Effect) === */
function selectPayMethod(method) {
    console.log(`Financial Protocol [${method.toUpperCase()}] selected.`);
    // Тут в будущем можно добавить более сложную селекцию
}

function selectPayMethod(method) {
    console.log("Selected method:", method);
    const cardFields = document.getElementById('card-fields');
    const cryptoFields = document.getElementById('crypto-fields');

    // Прячем всё
    cardFields.style.display = 'none';
    cryptoFields.style.display = 'none';

    // Показываем нужное
    if (['visa', 'unionpay', 'mir', 'sepa'].includes(method)) {
        cardFields.style.display = 'block';
    } else if (['onion', 'btc', 'ton', 'xmr'].includes(method)) {
        cryptoFields.style.display = 'block';
    }
}

// ОСНОВНОЙ ПРОЦЕССИНГ ПЛАТЕЖА
function processDeposit() {
    const amount = document.getElementById('deposit-amount').value;
    const btn = document.getElementById('confirm-deposit-btn');
    const aiViewport = document.getElementById('ai-messages');

    if (!amount || amount <= 0) {
        alert("Enter transaction volume, Boss!");
        return;
    }

    // Имитация работы банковского шлюза
    btn.innerText = "CONNECTING TO SECURE GATEWAY...";
    btn.style.opacity = "0.5";
    btn.disabled = true;

    // Сообщение от ИИ
    if (aiViewport) {
        const msg = document.createElement('div');
        msg.style.color = "#ffd700";
        msg.style.fontSize = "0.8rem";
        msg.style.marginBottom = "10px";
        msg.innerHTML = `<strong>LEVIATHAN AI:</strong> Initializing ${currentMethod.toUpperCase()} bridge. Laundering... I mean, processing ${amount} LVC.`;
        aiViewport.appendChild(msg);
    }

    // Задержка "процессинга"
    setTimeout(() => {
        btn.innerText = "AUTHORIZING...";
        
        setTimeout(() => {
            // ФИНАЛ: ВЫДАЕМ УСПЕХ
            btn.innerText = "TRANSACTION SUCCESSFUL";
            btn.style.background = "linear-gradient(135deg, #00ff00 0%, #008800 100%)";
            
            // Начисляем бабки (настоящая магия цифр)
            const currentBal = parseInt(document.getElementById('balance-amount').innerText.replace(/\s/g, ''));
            const newBal = currentBal + parseInt(amount);
            document.getElementById('balance-amount').innerText = newBal.toLocaleString();
            document.getElementById('prof-balance').innerText = newBal.toLocaleString();

            alert(`Boss, ${amount} LVC added to your shadow account!`);
            
            // Сбрасываем всё через 2 сек
            setTimeout(() => {
                document.getElementById('deposit-modal').style.display = 'none';
                btn.innerText = "Authorize Transaction";
                btn.style.background = "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)";
                btn.disabled = false;
                btn.style.opacity = "1";
            }, 2000);
            
        }, 2000);
    }, 1500);
}

function selectMajorMethod(type) {
    const cardEl = document.getElementById('card-fields-dynamic');
    const cryptoEl = document.getElementById('crypto-fields-dynamic');
    
    // Сбрасываем всё
    cardEl.style.display = 'none';
    cryptoEl.style.display = 'none';
    
    // Подсвечиваем выбор
    if (type === 'card') {
        cardEl.style.display = 'block';
    } else {
        cryptoEl.style.display = 'block';
    }
}

// ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ НА КАРТУ (ДЛЯ ВИТО)
window.selectMajorMethod = function(type) {
    console.log("Selecting method:", type); // Чтобы ты видел в консоли (F12), что нажатие прошло
    if (type === 'card') {
        const selectionScreen = document.getElementById('payment-selection-main');
        const cardInterface = document.getElementById('card-interface');
        
        if (selectionScreen && cardInterface) {
            selectionScreen.style.display = 'none';
            cardInterface.style.display = 'block';
        } else {
            console.error("Бро, я не нашел ID блоков в HTML!");
        }
    }
};

// КНОПКА НАЗАД К ВЫБОРУ
window.backToMethods = function() {
    const selectionScreen = document.getElementById('payment-selection-main');
    const cardInterface = document.getElementById('card-interface');
    
    if (selectionScreen && cardInterface) {
        selectionScreen.style.display = 'flex';
        cardInterface.style.display = 'none';
    }
};

window.selectMajorMethod = function(type) {
    const selection = document.getElementById('payment-selection-main');
    const cardInt = document.getElementById('card-interface');
    const cryptoInt = document.getElementById('crypto-interface');

    selection.style.display = 'none';

    if (type === 'card') {
        cardInt.style.display = 'block';
        cryptoInt.style.display = 'none';
    } else if (type === 'crypto') {
        cardInt.style.display = 'none';
        cryptoInt.style.display = 'block';
    }
};

// Добавим выбор кошелька
window.selectCoin = function(coin) {
    constaddr = document.getElementById('wallet-address');
    const wallets = {
        'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        'ETH': '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
        'USDT': 'TXj9M6STPSTXvHSm5uxXJ5f9jSSTDXvHkx'
    };
    addr.innerText = wallets[coin];
    // Можно еще рамки менять у выбранной кнопки, но это лоск
    console.log("Coin changed to:", coin);
};

// И не забудь подправить backToMethods, чтобы скрывал и крипту тоже
window.backToMethods = function() {
    document.getElementById('payment-selection-main').style.display = 'flex';
    document.getElementById('card-interface').style.display = 'none';
    document.getElementById('crypto-interface').style.display = 'none';
};

window.smartClose = function() {
    const selection = document.getElementById('payment-selection-main');
    const cardInt = document.getElementById('card-interface');
    const cryptoInt = document.getElementById('crypto-interface');
    const modal = document.getElementById('deposit-modal');

    // Если сейчас открыта карта или крипта — возвращаем к выбору
    if ((cardInt && cardInt.style.display === 'block') || (cryptoInt && cryptoInt.style.display === 'block')) {
        cardInt.style.display = 'none';
        if(cryptoInt) cryptoInt.style.display = 'none';
        selection.style.display = 'flex';
        console.log("Юзер хотел сбежать, но мы вернули его к выбору методов!");
    } 
    // Если он уже на экране выбора — тогда закрываем нахер всё окно
    else {
        modal.style.display = 'none';
        console.log("Касса закрыта.");
    }
};

window.selectCoin = function(coin) {
    const wallets = {
        'BTC': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        'ETH': '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        'USDT': 'TR7NHqjuSXPabT7395q66u26tnRHHgb8iL'
    };

    // Сбрасываем все кнопки
    document.querySelectorAll('.coin-btn').forEach(btn => {
        btn.style.borderColor = 'rgba(255,255,255,0.1)';
        btn.style.background = 'rgba(255,255,255,0.05)';
    });

    // Подсвечиваем выбранную
    const activeBtn = document.getElementById('coin-' + coin.toLowerCase());
    activeBtn.style.borderColor = '#f7931a';
    activeBtn.style.background = 'rgba(247, 147, 26, 0.1)';

    // Обновляем инфу
    document.getElementById('wallet-addr-display').innerText = wallets[coin];
    document.getElementById('coin-label').innerText = coin;
    
    console.log("Crypto mode: " + coin);
};

window.copyWallet = function() {
    const addr = document.getElementById('wallet-addr-display').innerText;
    navigator.clipboard.writeText(addr);
    alert("Address copied to clipboard!");
};

// ВОЗВРАЩАЕМ ВИТЮ НА БАЗУ
window.openProfile = function() {
    const modal = document.getElementById('profile-modal'); // Проверь ID в HTML!
    if (modal) {
        modal.style.display = 'flex';
        console.log("Welcome back, Boss Vitya!");
    } else {
        console.error("Profile modal not found! Check ID in index.html");
    }
};

window.closeProfile = function() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.style.display = 'none';
};

// Чтобы кнопка TERMINATE SESSION работала
window.logout = function() {
    alert("TERMINATING SESSION...");
    location.reload();
};
