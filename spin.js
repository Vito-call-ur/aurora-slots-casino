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

    _rememberKeys: {
        userName: 'vip_user_name',
        userPhoto: 'vip_user_photo',
        balance: 'balance'
    },

    // --- независимые окна: #auth-modal и #profile-modal ---
    openAuthWindow: function () {
        const authModal = document.getElementById('auth-modal');
        const profileModal = document.getElementById('profile-modal');
        if (authModal) {
            authModal.style.display = 'flex';
            authModal.classList.remove('active');
            // auth-pop анимация управляется существующим кодом в index.html через .active
            void authModal.offsetWidth;
            authModal.classList.add('active');
        }
        if (profileModal) profileModal.style.display = 'none';
    },

    openProfileWindow: function () {
        const authModal = document.getElementById('auth-modal');
        const profileModal = document.getElementById('profile-modal');
        if (authModal) authModal.style.display = 'none';
        if (profileModal) profileModal.style.display = 'flex';
        this.syncProfile();
    },

    // Переключатель экранов
    openAuthOrProfile: function () {
        if (this.currentUser) return this.openProfileWindow();
        return this.openAuthWindow();
    },

    // СИНХРОНИЗАЦИЯ ДАННЫХ КАБИНЕТА
    syncProfile: function () {
        if (!this.currentUser) return;

        const nameDisplay = document.getElementById('user-display-name');
        const bigAvatar = document.getElementById('user-big-avatar');
        const vipStatus = document.getElementById('user-vip-status');

        if (nameDisplay) nameDisplay.innerText = this.currentUser.displayName || "LEVIATHAN_BOSS";

        if (bigAvatar) {
            if (this.currentUser.photoURL) {
                bigAvatar.src = this.currentUser.photoURL;
                bigAvatar.style.display = 'block';
            } else {
                bigAvatar.style.display = 'none';
            }
        }

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

        // баланс кабинета
        const profBal = document.getElementById('prof-balance');
        if (profBal) profBal.innerText = balance.toLocaleString();

        updateBalanceUI();
    },

    saveRememberMeFromUser: function (user) {
        if (!user) return;

        try {
            localStorage.setItem(this._rememberKeys.userName, user.displayName || 'LEVIATHAN_BOSS');
            if (user.photoURL) localStorage.setItem(this._rememberKeys.userPhoto, user.photoURL);

            // balance у нас и так живёт в localStorage, но продублируем
            localStorage.setItem(this._rememberKeys.balance, String(balance));

            // подмена авы в хедере (сразу после входа)
            const headerFrameImg = document.getElementById('profile-avatar-img');
            const headerDefault = document.getElementById('profile-default-icon');
            const headerFrame = document.getElementById('profile-avatar-frame');

            if (headerFrameImg && user.photoURL) {
                headerFrameImg.src = user.photoURL;
                headerFrameImg.style.display = 'block';
            }
            if (headerFrame) headerFrame.style.display = 'inline-flex';
            if (headerDefault) headerDefault.style.display = 'none';
        } catch (e) {
            console.warn('RememberMe save failed:', e);
        }
    },

    // Вызывается после успешного входа, но может быть и из любых колбеков
    afterSuccessfulLogin: function (user) {
        this.currentUser = user || null;
        this.saveRememberMeFromUser(this.currentUser);
        this.openAuthOrProfile();
    },

    // Поднимаем remember-me при загрузке страницы (без Firebase)
    applyRememberMeOnBoot: function () {
        try {
            const photo = localStorage.getItem(this._rememberKeys.userPhoto);
            const name = localStorage.getItem(this._rememberKeys.userName);

            if (!photo) return false;

            // Подмена авы в хедере
            const headerFrameImg = document.getElementById('profile-avatar-img');
            const headerDefault = document.getElementById('profile-default-icon');
            const headerFrame = document.getElementById('profile-avatar-frame');

            if (headerFrameImg) {
                headerFrameImg.src = photo;
                headerFrameImg.style.display = 'block';
            }
            if (headerFrame) headerFrame.style.display = 'inline-flex';
            if (headerDefault) headerDefault.style.display = 'none';

            // Имитация "авторизован" для отображения кабинки
            this.currentUser = {
                displayName: name || 'LEVIATHAN_BOSS',
                photoURL: photo
            };

            // обновим баланс UI (balance уже подхватили вверху файла)
            updateBalanceUI();

            // открыть модалку сразу и показать профиль
            this.openAuthOrProfile();
            return true;
        } catch (e) {
            console.warn('RememberMe boot failed:', e);
            return false;
        }
    },

    // Выйти “по следам” (чистим remember-me и возвращаем экран входа)
    rememberLogout: function () {
        try {
            localStorage.removeItem(this._rememberKeys.userName);
            localStorage.removeItem(this._rememberKeys.userPhoto);
            // balance оставим? по ТЗ он должен очиститься как “следы”, но баланс и так хранится;
            // очистим чтобы было чисто
            localStorage.removeItem(this._rememberKeys.balance);
        } catch (e) {}

        // Сбрасываем текущий UI-state
        this.currentUser = null;

        // Если Firebase тоже залогинен — можно не трогать его сессии (по ТЗ “пока не очистит кэш”),
        // но UI обязан вернуться на signup.
        this.openAuthOrProfile();

        // обновим баланс обратно к дефолту (как в начале файла)
        balance = parseInt(localStorage.getItem('balance')) || 50000;
        updateBalanceUI();

        // если загружались через openAuthOrProfile — фиксируем видимость
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'flex';
    },

    hideAuth: function () {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'none';
    },

    loginWith: function (provider) {
        if (provider === 'google') {
            auth.signInWithPopup(googleProvider).then((res) => {
                this.afterSuccessfulLogin(res.user);
            }).catch(err => alert("Connection error: " + err.message));
        }
    },

    logout: function () {
        if (confirm("TERMINATE CONNECTION WITH LEVIATHAN?")) {
            auth.signOut().then(() => {
                this.currentUser = null;
                this.rememberLogout();
            });
        }
    },

    // Подписка на Firebase auth-состояние (настоящая авторизация)
    initAuthState: function () {
        const self = this;
        auth.onAuthStateChanged((user) => {
            self.currentUser = user || null;

            if (user) {
                self.saveRememberMeFromUser(user);
            }

            // если модалка открыта — обновляем экран
            const modal = document.getElementById('auth-modal');
            if (modal && modal.style.display === 'flex') {
                self.openAuthOrProfile();
            }

            updateBalanceUI();
        });
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
    // Remember Me: если пользователь ранее логинился — сразу показываем кабинет,
    // без повторной регистрации/SignUp.
    try {
        AuthSystem.applyRememberMeOnBoot();
    } catch (e) {}

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

        const profileModal = document.getElementById('profile-modal');
        if (e.target === profileModal) {
            window.closeProfile?.();
            profileModal.style.display = 'none';
        }
    };

    // ====== QUICK FIX: открыть Личный кабинет по клику на профиль в хедере ======
    // Селектор кнопки профиля в index.html:
    // <button class="btn-profile-icon" onclick="AuthSystem.openProfileWindow()"...>
    const profileBtn = document.querySelector('button.btn-profile-icon') || document.getElementById('profile-avatar-frame');
    const profileModal = document.getElementById('profile-modal');

    if (profileBtn && profileModal) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            profileModal.style.display = 'flex';
            // если auth модалка открыта — выключаем
            const authModal = document.getElementById('auth-modal');
            if (authModal) authModal.style.display = 'none';

            // синхронизируем данные (если текущий юзер известен)
            try {
                AuthSystem.syncProfile?.();
            } catch (_) {}
        });
    }

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

function setHeaderAvatar(photoUrl, displayName){
    const frame = document.getElementById('profile-avatar-frame');
    const img = document.getElementById('profile-avatar-img');
    const defIcon = document.getElementById('profile-default-icon');

    if (!frame) return;

    frame.style.display = 'inline-flex';

    if (img){
        if (photoUrl) {
            img.src = photoUrl;
            img.style.display = 'block';
        } else {
            // no photo -> keep img hidden, frame visible
            img.style.display = 'none';
        }
    }

    if (defIcon) defIcon.style.display = 'none';

    // store for persistence
    try{
        if (displayName) localStorage.setItem('telegram_display_name', displayName);
        if (photoUrl) localStorage.setItem('telegram_photo_url', photoUrl);
    }catch(_){}
}

// Restore (optional)
try{
    const savedPhoto = localStorage.getItem('telegram_photo_url');
    const savedName = localStorage.getItem('telegram_display_name');
    if (savedPhoto) setHeaderAvatar(savedPhoto, savedName);
}catch(_){}

/* Firebase auth-состояние:
   AuthSystem.initAuthState() сам переключит auth/profile экран внутри модалки */
AuthSystem.initAuthState();

/* === PROMO / GIFTS (left sidebar) === */
const PROMO_CODE = 'Leviatha1488';
const PROMO_REWARD = 228;

window.openPromoModal = function () {
    const modal = document.getElementById('promo-modal');
    if (!modal) return;

    const input = document.getElementById('promo-code-input');
    if (input) input.value = '';

    modal.style.display = 'flex';
    input?.focus?.();
};

window.closePromoModal = function () {
    const modal = document.getElementById('promo-modal');
    if (!modal) return;
    modal.style.display = 'none';
};

window.applyPromoCode = function () {
    const input = document.getElementById('promo-code-input');
    const raw = (input?.value || '').trim();
    if (!raw) {
        alert('Enter promo code, Boss!');
        return;
    }

    if (raw !== PROMO_CODE) {
        alert('Invalid promo code, Boss!');
        return;
    }

    // начисляем награду
    balance += PROMO_REWARD;
    updateBalanceUI();

    // опционально: отметим факт активации в localStorage, чтобы не спамили при повторных запросах
    try {
        localStorage.setItem(`promo_${PROMO_CODE}_used`, '1');
    } catch (_) {}

    alert(`Promo activated! +${PROMO_REWARD} LVC`);

    closePromoModal();
};

// Ставим аватар в хедер (золотая рамка)
auth.onAuthStateChanged((user) => {
    if (user) {
        if (user.photoURL) setHeaderAvatar(user.photoURL, user.displayName || 'User');
    }
});

// --- Telegram Login Widget handler (bot: @LeviathanAuthBot) ---
// Telegram виджеты обычно вызывают глобальный коллбек/публикуют данные в window.
window.onTelegramLoginSuccess = function(payload){
    // поддержка разных имен полей
    const photoUrl =
        payload?.user_photo_url ||
        payload?.photo_url ||
        payload?.user?.photo_url ||
        payload?.user?.profile_photo_url ||
        payload?.profile_photo_url ||
        '';

    const displayName =
        payload?.user_name ||
        payload?.first_name ||
        payload?.last_name
        ? [payload.first_name, payload.last_name].filter(Boolean).join(' ')
        : (payload?.username || payload?.user?.username || payload?.full_name || '');

    setHeaderAvatar(photoUrl || '', displayName || 'Telegram User');

    // Важно: для Remember Me (чтобы после "регистрации" больше не показывать SIGN UP)
    // мы сохраняем аватар/имя локально и переключаем modal в profile-состояние.
    try {
        const fakeUser = {
            displayName: displayName || 'Telegram User',
            photoURL: photoUrl || ''
        };
        AuthSystem.currentUser = fakeUser;
        AuthSystem.saveRememberMeFromUser(fakeUser);
        AuthSystem.openAuthOrProfile();
    } catch (e) {}
};

// иногда коллбек приходит через onTelegramAuth / telegramLoginCallback
window.onTelegramAuth = function(payload){
    window.onTelegramLoginSuccess(payload);
};

/*
 * если widget кладёт данные в window.TelegramLoginWidgetData
 * или обновляет содержимое контейнера — поймаем это и дернем коллбек.
 */
setTimeout(() => {
    try{
        const w = window.TelegramLoginWidgetData;
        if (w) window.onTelegramLoginSuccess(w);
    }catch(_){}
}, 1500);

// DOM-based fallback: смотрим контейнер виджета на изменения
try {
    const widgetEl = document.getElementById('telegram-login-widget');
    if (widgetEl && typeof MutationObserver !== 'undefined') {
        const obs = new MutationObserver(() => {
            try {
                // часто виджет может отдавать данные через dataset:
                const ds = widgetEl.dataset || {};
                const photoUrl = ds.userPhotoUrl || ds.photoUrl || ds.userPhoto || ds.userpic || '';
                const displayName = ds.userName || ds.username || ds.firstName || ds.fullName || 'Telegram User';
                if (photoUrl || ds.user || ds.user_name || ds.userId) {
                    window.onTelegramLoginSuccess({
                        user_photo_url: photoUrl,
                        user_name: displayName,
                        ...ds
                    });
                }
                // еще вариант: виджет может положить JSON в data-поле
                const jsonStr = ds.payload || ds.authData || '';
                if (jsonStr) {
                    const maybeObj = JSON.parse(jsonStr);
                    if (maybeObj) window.onTelegramLoginSuccess(maybeObj);
                }
            } catch(_){}
        });
        obs.observe(widgetEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-*'] });
    }
} catch(_){}

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

// Функция для твоего золотого профиля
window.openAuth = function () {
    console.log("Leviathan: Открываю модальное окно профиля/входа...");
    AuthSystem.openAuthOrProfile();
};
