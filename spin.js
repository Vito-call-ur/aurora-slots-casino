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
    const label = `${formatted} LVC`;

    if (balTop) balTop.innerText = label;
    if (balProf) balProf.innerText = label;

    localStorage.setItem('balance', balance);

    const profileModal = document.getElementById('profile-modal');
    if (profileModal?.classList.contains('is-open') && AuthSystem?.syncProfile) {
        AuthSystem.syncProfile();
    }
}

// 4. AUTH & PROFILE SYSTEM
window.AuthSystem = {
    currentUser: null,

    _rememberKeys: {
        userName: 'vip_user_name',
        userPhoto: 'vip_user_photo',
        balance: 'balance'
    },

    _vipTiers: [
        { id: 'BRONZE', min: 0, next: 100000, nextLabel: 'SILVER', color: '#cd7f32' },
        { id: 'SILVER', min: 100000, next: 500000, nextLabel: 'GOLD', color: '#c0c0c0' },
        { id: 'GOLD', min: 500000, next: null, nextLabel: null, color: '#ffd700' }
    ],

    isAuthenticated: function () {
        if (this.currentUser) return true;
        if (auth.currentUser) return true;
        return !!localStorage.getItem(this._rememberKeys.userName);
    },

    getSessionUser: function () {
        if (this.currentUser) return this.currentUser;
        if (auth.currentUser) {
            return {
                displayName: auth.currentUser.displayName || localStorage.getItem(this._rememberKeys.userName) || 'LEVIATHAN_BOSS',
                photoURL: auth.currentUser.photoURL || localStorage.getItem(this._rememberKeys.userPhoto) || ''
            };
        }
        const name = localStorage.getItem(this._rememberKeys.userName);
        if (!name) return null;
        return {
            displayName: name,
            photoURL: localStorage.getItem(this._rememberKeys.userPhoto) || ''
        };
    },

    openAuthWindow: function () {
        const authModal = document.getElementById('auth-modal');
        const profileModal = document.getElementById('profile-modal');
        this.closeProfileWindow();
        if (authModal) {
            authModal.style.display = 'flex';
            authModal.classList.remove('active', 'closing');
            void authModal.offsetWidth;
            authModal.classList.add('active');
        }
        if (profileModal) profileModal.style.display = 'none';
    },

    openProfileWindow: function () {
        const authModal = document.getElementById('auth-modal');
        const profileModal = document.getElementById('profile-modal');
        if (authModal) {
            authModal.classList.remove('active');
            authModal.style.display = 'none';
        }
        if (!profileModal) return;

        this.currentUser = this.getSessionUser();
        if (!this.currentUser) {
            this.openAuthWindow();
            return;
        }

        this.syncProfile();

        profileModal.style.display = 'flex';
        profileModal.classList.remove('closing');
        void profileModal.offsetWidth;
        profileModal.classList.add('is-open');
    },

    closeProfileWindow: function () {
        const profileModal = document.getElementById('profile-modal');
        if (!profileModal || !profileModal.classList.contains('is-open')) {
            if (profileModal) {
                profileModal.classList.remove('is-open', 'closing');
                profileModal.style.display = 'none';
            }
            return;
        }

        profileModal.classList.remove('is-open');
        profileModal.classList.add('closing');
        setTimeout(() => {
            profileModal.classList.remove('closing');
            profileModal.style.display = 'none';
        }, 320);
    },

    openAuthOrProfile: function () {
        if (this.isAuthenticated()) return this.openProfileWindow();
        return this.openAuthWindow();
    },

    openDepositFromCabinet: function () {
        this.closeProfileWindow();
        const depositModal = document.getElementById('deposit-modal');
        if (depositModal) depositModal.style.display = 'flex';
    },

    registerLocalUser: function () {
        const usernameEl = document.getElementById('auth-signup-username');
        const passwordEl = document.getElementById('auth-signup-password');
        const username = (usernameEl?.value || '').trim();
        const password = (passwordEl?.value || '').trim();

        if (!username) {
            alert('Enter username, Boss!');
            usernameEl?.focus();
            return;
        }
        if (!password) {
            alert('Create a password to continue.');
            passwordEl?.focus();
            return;
        }

        const user = { displayName: username, photoURL: '' };
        this.currentUser = user;
        this.saveRememberMeFromUser(user);

        if (typeof closeAuth === 'function') closeAuth();
        this.openProfileWindow();
    },

    syncProfileXP: function (bal) {
        const amount = typeof bal === 'number' ? bal : balance;
        let tier = this._vipTiers[0];
        if (amount >= 500000) tier = this._vipTiers[2];
        else if (amount >= 100000) tier = this._vipTiers[1];

        const vipStatus = document.getElementById('user-vip-status');
        if (vipStatus) {
            vipStatus.innerText = `VIP • ${tier.id}`;
            vipStatus.style.color = tier.color;
        }

        let pct = 100;
        if (tier.next != null) {
            pct = Math.min(100, Math.max(0, ((amount - tier.min) / (tier.next - tier.min)) * 100));
        }

        const fill = document.getElementById('xp-fill');
        if (fill) fill.style.width = `${pct}%`;

        const level = Math.max(1, Math.min(99, Math.floor(amount / 7500) + 1));
        const meta = document.getElementById('xp-meta');
        if (meta) {
            if (tier.next != null) {
                const remaining = Math.max(0, tier.next - amount);
                meta.innerText = `Level ${level} · To ${tier.nextLabel}: ${remaining.toLocaleString()} LVC`;
            } else {
                meta.innerText = `Level ${level} · MAX TIER`;
            }
        }

        const ticks = document.querySelectorAll('.lgc-xp-ticks span');
        ticks.forEach((tick, i) => {
            const threshold = i * 25;
            tick.classList.toggle('active', pct >= threshold);
        });
    },

    syncProfile: function () {
        const user = this.getSessionUser();
        if (!user) return;

        const nameDisplay = document.getElementById('user-display-name');
        const bigAvatar = document.getElementById('user-big-avatar');
        const avatarFallback = document.getElementById('user-avatar-fallback');

        if (nameDisplay) nameDisplay.innerText = user.displayName || 'LEVIATHAN_BOSS';

        if (bigAvatar && avatarFallback) {
            if (user.photoURL) {
                bigAvatar.src = user.photoURL;
                bigAvatar.style.display = 'block';
                avatarFallback.style.display = 'none';
            } else {
                bigAvatar.removeAttribute('src');
                bigAvatar.style.display = 'none';
                avatarFallback.style.display = 'flex';
                avatarFallback.innerHTML = `<span class="lgc-avatar-letter">${(user.displayName || 'L').charAt(0).toUpperCase()}</span>`;
            }
        }

        const profBal = document.getElementById('prof-balance');
        if (profBal) profBal.innerText = `${balance.toLocaleString()} LVC`;

        this.syncProfileXP(balance);
    },

    saveRememberMeFromUser: function (user) {
        if (!user) return;

        try {
            localStorage.setItem(this._rememberKeys.userName, user.displayName || 'LEVIATHAN_BOSS');
            if (user.photoURL) {
                localStorage.setItem(this._rememberKeys.userPhoto, user.photoURL);
            } else {
                localStorage.removeItem(this._rememberKeys.userPhoto);
            }

            localStorage.setItem(this._rememberKeys.balance, String(balance));

            const headerFrameImg = document.getElementById('profile-avatar-img');
            const headerDefault = document.getElementById('profile-default-icon');
            const headerFrame = document.getElementById('profile-avatar-frame');

            if (headerFrameImg && user.photoURL) {
                headerFrameImg.src = user.photoURL;
                headerFrameImg.style.display = 'block';
                if (headerFrame) headerFrame.style.display = 'inline-flex';
                if (headerDefault) headerDefault.style.display = 'none';
            } else {
                if (headerFrame) headerFrame.style.display = 'none';
                if (headerFrameImg) headerFrameImg.style.display = 'none';
                if (headerDefault) headerDefault.style.display = 'block';
            }
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

            if (!name) return false;

            const headerFrameImg = document.getElementById('profile-avatar-img');
            const headerDefault = document.getElementById('profile-default-icon');
            const headerFrame = document.getElementById('profile-avatar-frame');

            if (photo && headerFrameImg) {
                headerFrameImg.src = photo;
                headerFrameImg.style.display = 'block';
                if (headerFrame) headerFrame.style.display = 'inline-flex';
                if (headerDefault) headerDefault.style.display = 'none';
            } else {
                if (headerFrame) headerFrame.style.display = 'none';
                if (headerDefault) headerDefault.style.display = 'block';
            }

            this.currentUser = {
                displayName: name || 'LEVIATHAN_BOSS',
                photoURL: photo || ''
            };

            updateBalanceUI();
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
            if (user) {
                self.currentUser = user;
                self.saveRememberMeFromUser(user);
            } else {
                const name = localStorage.getItem(self._rememberKeys.userName);
                if (name) {
                    self.currentUser = {
                        displayName: name,
                        photoURL: localStorage.getItem(self._rememberKeys.userPhoto) || ''
                    };
                } else {
                    self.currentUser = null;
                }
            }

            const authModal = document.getElementById('auth-modal');
            if (authModal && authModal.style.display === 'flex' && authModal.classList.contains('active')) {
                self.openAuthOrProfile();
            }

            const profileModal = document.getElementById('profile-modal');
            if (profileModal?.classList.contains('is-open')) {
                self.syncProfile();
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

        // apply graphics quality to animation speed (visual-only)
        const graphicsQuality = localStorage.getItem('graphics_quality') || 'Ultra';
        const turboEnabled = (localStorage.getItem('settings_turboSpins') || 'false') === 'true';

        const baseDelay = (graphicsQuality === 'Low') ? 420 : (graphicsQuality === 'Medium' ? 360 : 320);
        const speedMul = turboEnabled ? 0.65 : 1.0;

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
            }, (baseDelay + (index * 200)) * speedMul); // Задержка для эффекта (graphics quality)
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
            AuthSystem.closeProfileWindow();
        }
    };

    // Профиль: гость → SIGN UP, авторизован → личный кабинет
    const profileBtn = document.querySelector('button.btn-profile-icon');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            AuthSystem.openAuthOrProfile();
        });
    }

    const profileCloseBtn = document.getElementById('profile-close-btn');
    if (profileCloseBtn) {
        profileCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            AuthSystem.closeProfileWindow();
        });
    }

    const topUpBtn = document.getElementById('btn-topup');
    if (topUpBtn) {
        topUpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthSystem.openDepositFromCabinet();
        });
    }

    const withdrawBtn = document.getElementById('btn-withdraw');
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Withdraw flow (demo)');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') AuthSystem.closeProfileWindow();
    });

    // === PROMO under balance (gift icon toggles) ===
    const PROMO_SECRET = 'Leviathan1488';
    const PROMO_BONUS = 228;

    const giftBtn = document.querySelector('.fa-gift')?.closest('button') || document.getElementById('promo-gift-btn');
    const promoWrap = document.getElementById('promo-header-input');
    const promoField = document.getElementById('promo-code-field');
    const promoOkBtn = document.getElementById('promo-submit-btn');
    let promoOpen = false;

    const openPromoField = () => {
        if (!promoWrap) return;
        promoWrap.setAttribute('aria-hidden', 'false');
        promoWrap.classList.remove('is-closing');
        requestAnimationFrame(() => {
            promoWrap.classList.add('is-open');
        });
        promoOpen = true;
        if (giftBtn) giftBtn.classList.add('is-active');
        if (promoField) {
            promoField.value = '';
            promoField.classList.remove('promo-error', 'promo-success');
            setTimeout(() => promoField.focus(), 80);
        }
    };

    const closePromoField = () => {
        if (!promoWrap) return;
        promoWrap.classList.remove('is-open');
        promoWrap.classList.add('is-closing');
        promoWrap.setAttribute('aria-hidden', 'true');
        promoOpen = false;
        if (giftBtn) giftBtn.classList.remove('is-active');
        setTimeout(() => {
            if (!promoOpen) {
                promoWrap.classList.remove('is-closing');
            }
        }, 280);
    };

    const togglePromoField = () => {
        if (promoOpen) closePromoField();
        else openPromoField();
    };

    const showPromoError = () => {
        if (!promoField) return;
        promoField.classList.remove('promo-success');
        promoField.classList.add('promo-error');
        if (promoWrap) {
            promoWrap.classList.remove('promo-shake');
            void promoWrap.offsetWidth;
            promoWrap.classList.add('promo-shake');
            setTimeout(() => promoWrap.classList.remove('promo-shake'), 450);
        }
        setTimeout(() => promoField.classList.remove('promo-error'), 1200);
    };

    const applyPromo = () => {
        const raw = (promoField?.value || '').trim();
        if (!raw) {
            showPromoError();
            return;
        }
        if (raw.toLowerCase() !== PROMO_SECRET.toLowerCase()) {
            showPromoError();
            return;
        }

        balance += PROMO_BONUS;
        updateBalanceUI();
        try { AuthSystem.syncProfile?.(); } catch (_) {}

        if (promoField) {
            promoField.value = 'SUCCESS!';
            promoField.classList.add('promo-success');
            promoField.classList.remove('promo-error');
        }
        if (promoOkBtn) promoOkBtn.disabled = true;

        setTimeout(() => {
            closePromoField();
            if (promoField) {
                promoField.value = '';
                promoField.classList.remove('promo-success', 'promo-error');
            }
            if (promoOkBtn) promoOkBtn.disabled = false;
        }, 1500);
    };

    if (giftBtn && promoWrap && promoField && promoOkBtn) {
        giftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePromoField();
        });

        promoOkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            applyPromo();
        });

        promoField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyPromo();
            }
        });

        promoWrap.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', () => {
            if (promoOpen) closePromoField();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && promoOpen) closePromoField();
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
window.openProfile = function () {
    AuthSystem.openProfileWindow();
};

window.closeProfile = function () {
    AuthSystem.closeProfileWindow();
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

/* === SETTINGS / SUPPORT MODALS (Leviathan UI) === */
(function () {
    const SETTINGS_MODAL_ID = 'settings-modal';
    const SUPPORT_MODAL_ID = 'support-modal';

    const LS_KEYS = {
        sound: 'settings_soundEffects',
        ambient: 'settings_ambientMusic',
        turbo: 'settings_turboSpins',

        // pro settings (gold matte) - streamer_mode is secret-only, so no UI binding/labels
        graphicsQuality: 'graphics_quality',
        autoSpinsLimit: 'auto_spins_limit',
        selectedCurrency: 'selected_currency'
    };

    const defaultState = {
        sound: true,
        ambient: false,
        turbo: false,

        graphicsQuality: 'Ultra',
        autoSpinsLimit: 'Infinite',
        selectedCurrency: 'LVC'
    };


    function getEl(id) {
        return document.getElementById(id);
    }

    function isAnyOpen() {
        const s = getEl(SETTINGS_MODAL_ID);
        const h = getEl(SUPPORT_MODAL_ID);
        return (s && s.classList.contains('is-open')) || (h && h.classList.contains('is-open'));
    }

    function applyToggleVisual(inputEl, labelEl) {
        const on = !!inputEl?.checked;
        if (labelEl) labelEl.textContent = on ? 'ON' : 'OFF';
    }

    function setModalOpen(modalEl, open) {
        if (!modalEl) return;

        if (open) {
            modalEl.style.display = 'flex';
            modalEl.classList.remove('closing');
            // старт анимации
            // eslint-disable-next-line no-unused-expressions
            void modalEl.offsetWidth;
            modalEl.classList.add('is-open');
        } else {
            modalEl.classList.remove('is-open');
            modalEl.classList.add('closing');
            setTimeout(() => {
                modalEl.classList.remove('closing');
                modalEl.style.display = 'none';
            }, 260);
        }
    }

    function loadSettingsState() {
        const readBool = (k, fallback) => {
            const raw = localStorage.getItem(k);
            if (raw === null) return fallback;
            return raw === 'true';
        };

        const readStr = (k, fallback) => {
            const raw = localStorage.getItem(k);
            if (raw === null || raw === '') return fallback;
            return raw;
        };

        return {
            sound: readBool(LS_KEYS.sound, defaultState.sound),
            ambient: readBool(LS_KEYS.ambient, defaultState.ambient),
            turbo: readBool(LS_KEYS.turbo, defaultState.turbo),

            graphicsQuality: readStr(LS_KEYS.graphicsQuality, defaultState.graphicsQuality),
            autoSpinsLimit: readStr(LS_KEYS.autoSpinsLimit, defaultState.autoSpinsLimit),
            selectedCurrency: readStr(LS_KEYS.selectedCurrency, defaultState.selectedCurrency)
        };
    }

    function saveSettingsState(state) {
        localStorage.setItem(LS_KEYS.sound, String(!!state.sound));
        localStorage.setItem(LS_KEYS.ambient, String(!!state.ambient));
        localStorage.setItem(LS_KEYS.turbo, String(!!state.turbo));

        localStorage.setItem(LS_KEYS.graphicsQuality, String(state.graphicsQuality));
        localStorage.setItem(LS_KEYS.autoSpinsLimit, String(state.autoSpinsLimit));
        localStorage.setItem(LS_KEYS.selectedCurrency, String(state.selectedCurrency));
    }


    function syncSettingsUI(state) {
        const soundInput = getEl('settings-sound');
        const ambientInput = getEl('settings-ambient');
        const turboInput = getEl('settings-turbo');

        const soundLabel = getEl('settings-sound-label');
        const ambientLabel = getEl('settings-ambient-label');
        const turboLabel = getEl('settings-turbo-label');

        const graphicsSelect = getEl('settings-graphics-quality');
        const autoSpinsSelect = getEl('settings-auto-spins-limit');
        const currencySelect = getEl('settings-selected-currency');

        if (soundInput) soundInput.checked = !!state.sound;
        if (ambientInput) ambientInput.checked = !!state.ambient;
        if (turboInput) turboInput.checked = !!state.turbo;

        if (soundInput) applyToggleVisual(soundInput, soundLabel);
        if (ambientInput) applyToggleVisual(ambientInput, ambientLabel);
        if (turboInput) applyToggleVisual(turboInput, turboLabel);

        if (graphicsSelect) graphicsSelect.value = state.graphicsQuality;
        if (autoSpinsSelect) autoSpinsSelect.value = state.autoSpinsLimit;
        if (currencySelect) currencySelect.value = state.selectedCurrency;
    }

    function bindSettingsToggles() {
        const soundInput = getEl('settings-sound');
        const ambientInput = getEl('settings-ambient');
        const turboInput = getEl('settings-turbo');

        const soundLabel = getEl('settings-sound-label');
        const ambientLabel = getEl('settings-ambient-label');
        const turboLabel = getEl('settings-turbo-label');

        const graphicsSelect = getEl('settings-graphics-quality');
        const autoSpinsSelect = getEl('settings-auto-spins-limit');
        const currencySelect = getEl('settings-selected-currency');

        const state = loadSettingsState();
        syncSettingsUI(state);

        const update = (partial) => {
            const next = { ...loadSettingsState(), ...partial };
            saveSettingsState(next);
            syncSettingsUI(next);
            return next;
        };

        if (soundInput) {
            soundInput.addEventListener('change', () => update({ sound: soundInput.checked }));
            applyToggleVisual(soundInput, soundLabel);
        }
        if (ambientInput) {
            ambientInput.addEventListener('change', () => update({ ambient: ambientInput.checked }));
            applyToggleVisual(ambientInput, ambientLabel);
        }
        if (turboInput) {
            turboInput.addEventListener('change', () => update({ turbo: turboInput.checked }));
            applyToggleVisual(turboInput, turboLabel);
        }

        if (graphicsSelect) {
            graphicsSelect.addEventListener('change', () => update({ graphicsQuality: graphicsSelect.value }));
        }

        if (autoSpinsSelect) {
            autoSpinsSelect.addEventListener('change', () => update({ autoSpinsLimit: autoSpinsSelect.value }));
        }

        if (currencySelect) {
            currencySelect.addEventListener('change', () => update({ selectedCurrency: currencySelect.value }));
        }
    }


    window.openSettingsModal = function () {
        const settings = getEl(SETTINGS_MODAL_ID);
        const support = getEl(SUPPORT_MODAL_ID);

        // close other if open
        if (support && support.classList.contains('is-open')) setModalOpen(support, false);

        // ensure css transition exists (no dependence on cos.css)
        if (settings) {
            settings.style.transition = 'opacity .25s ease, transform .25s ease, backdrop-filter .4s ease';
            settings.style.opacity = '1';
        }

        bindSettingsToggles();
        setModalOpen(settings, true);
    };

    window.closeSettingsModal = function () {
        const settings = getEl(SETTINGS_MODAL_ID);
        setModalOpen(settings, false);
    };

    window.openSupportModal = function () {
        const settings = getEl(SETTINGS_MODAL_ID);
        const support = getEl(SUPPORT_MODAL_ID);

        if (settings && settings.classList.contains('is-open')) setModalOpen(settings, false);

        if (support) {
            support.style.transition = 'opacity .25s ease, transform .25s ease, backdrop-filter .4s ease';
            support.style.opacity = '1';
        }

        setModalOpen(support, true);
    };

    window.closeSupportModal = function () {
        const support = getEl(SUPPORT_MODAL_ID);
        setModalOpen(support, false);
    };

    function ensureBackdropClose(modalId, closeFn) {
        const modal = getEl(modalId);
        if (!modal) return;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeFn();
        });
    }

    // Inject minimal animation CSS once
    function injectModalAnimationCSS() {
        if (document.getElementById('settings-support-modal-anim-style')) return;

        const style = document.createElement('style');
        style.id = 'settings-support-modal-anim-style';
        style.textContent = `
            #settings-modal, #support-modal {
                opacity: 0;
                transform: translateY(10px) scale(.98);
                transition: opacity .25s ease, transform .25s ease, backdrop-filter .4s ease;
                pointer-events: none;
            }
            #settings-modal.is-open, #support-modal.is-open {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }
            #settings-modal.closing, #support-modal.closing {
                opacity: 0;
                transform: translateY(10px) scale(.98);
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectModalAnimationCSS();

        ensureBackdropClose(SETTINGS_MODAL_ID, window.closeSettingsModal);
        ensureBackdropClose(SUPPORT_MODAL_ID, window.closeSupportModal);

        // Safety: Escape closes whichever open
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (!isAnyOpen()) return;
            if (getEl(SETTINGS_MODAL_ID)?.classList.contains('is-open')) window.closeSettingsModal();
            else if (getEl(SUPPORT_MODAL_ID)?.classList.contains('is-open')) window.closeSupportModal();
        });

        // also bind initial defaults to avoid labels mismatch
        bindSettingsToggles();
    });
})();

