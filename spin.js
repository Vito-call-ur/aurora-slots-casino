// ==========================================
// 1. КОНФИГУРАЦИЯ FIREBASE
// ==========================================
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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// ==========================================
// 2. ДВИЖОК КАЗИНО
// ==========================================
const LeviatEngine = {
    balance: 50000,
    init: function() {
        console.log("LEVIATHAN: Системы онлайн");
        this.updateBalanceUI();
    },
    updateBalanceUI: function() {
        const balEl = document.getElementById('balance-amount');
        const profBalEl = document.getElementById('prof-balance');
        if (balEl) balEl.innerText = this.balance.toLocaleString();
        if (profBalEl) profBalEl.innerText = this.balance.toLocaleString();
    }
};

// ==========================================
// 3. СИСТЕМА АВТОРИЗАЦИИ И ПРОФИЛЯ
// ==========================================
const AuthSystem = {
    currentUser: null,
    isProcessing: false,

    openAuthorOrProfile: function() {
        const modal = document.getElementById('profile-modal');
        const authMod = document.getElementById('auth-modal');
        
        // Если залогинены — открываем профиль, если нет — окно входа
        if (this.currentUser) {
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
                this.syncProfile(); 
            }
        } else {
            if (authMod) authMod.style.display = 'flex';
        }
    },

    hideAuth: function() {
        const pModal = document.getElementById('profile-modal');
        const aModal = document.getElementById('auth-modal');
        if (pModal) { pModal.style.display = 'none'; pModal.classList.remove('active'); }
        if (aModal) aModal.style.display = 'none';
    },

    loginWithGoogle: function() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        auth.signInWithPopup(googleProvider).then((result) => {
            this.currentUser = result.user;
            this.syncProfile();
            this.hideAuth();
            alert("Вход выполнен: " + this.currentUser.displayName);
            LeviatEngine.updateBalanceUI();
            this.isProcessing = false;
        }).catch((err) => { 
            this.isProcessing = false;
            if (err.code !== 'auth/cancelled-popup-request') {
                alert("Ошибка Гугла: " + err.message);
            }
            console.error(err);
        });
    },

    // --- НОВАЯ ФУНКЦИЯ ВЫХОДА ---
    logout: function() {
        auth.signOut().then(() => {
            this.currentUser = null;
            alert("Вы вышли из системы");
            location.reload(); // Перезагрузка страницы
        });
    },

    loginWithTelegram: function() {
        alert("Вход через Telegram временно в разработке (нужен бот)");
    },

    syncProfile: function() {
        if (!this.currentUser) return;
        
        // 1. Имя
        const nameEls = document.querySelectorAll('#user-display-name, .profile-name');
        nameEls.forEach(el => el.innerText = this.currentUser.displayName);
        
        // 2. Аватарка
        const avatarImg = document.getElementById('logged-in-avatar');
        const icon = document.getElementById('logged-out-icon');
        if (avatarImg && this.currentUser.photoURL) {
            avatarImg.src = this.currentUser.photoURL;
            avatarImg.style.display = 'block';
            if (icon) icon.style.display = 'none';
        }

        // 3. СОСТОЯНИЕ (VIP статус)
        const vipEl = document.getElementById('user-vip-status');
        if (vipEl) {
            const isVip = LeviatEngine.balance >= 100000; 
            vipEl.innerText = isVip ? "VIP LEVEL" : "PLAYER";
            vipEl.style.color = isVip ? "#ffd700" : "#fff";
        }

        // 4. АКТИВНОСТЬ
        const statusEl = document.getElementById('user-activity');
        if (statusEl) {
            statusEl.innerText = "ONLINE";
            statusEl.style.color = "#00ff00";
        }
    }
};


// Сделаем системы доступными глобально
window.AuthSystem = AuthSystem;
window.LeviatEngine = LeviatEngine;

// ==========================================
// 4. ЗАПУСК И ОБРАБОТЧИКИ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    LeviatEngine.init();

    // Лоадер
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => { loader.style.display = 'none'; }, 500);
        }, 1000);
    }

    // Кнопка профиля/входа в шапке
    const avatarBtn = document.getElementById('header-avatar-box');
    if (avatarBtn) {
        avatarBtn.onclick = (e) => {
            e.preventDefault();
            AuthSystem.openAuthorOrProfile();
        };
    }

    // Обработчик кликов (Универсальный)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('div, button, a');
        if (!target) return;

        // Кнопка закрытия профиля
        if (target.classList.contains('close-profile')) {
            AuthSystem.hideAuth();
        }

        // Кнопка Google
        if (target.innerHTML.toLowerCase().includes('google') || target.innerText.includes('Google')) {
            AuthSystem.loginWithGoogle();
        }

        // Меню категорий
        const catTrigger = document.getElementById('categories-trigger');
        const catMenu = document.getElementById('cat-menu');
        if (target === catTrigger) {
            e.preventDefault();
            catMenu.style.display = (catMenu.style.display === 'block') ? 'none' : 'block';
        }
    });
});

// --- ЖЕСТКИЙ ПЕРЕХВАТ КАБИНЕТА ВИТО (ЗАМЕНА) ---
(function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const profileBtn = navLinks[1]; // Убедись, что Профиль — второй в списке!

    if (profileBtn) {
        // Ставим обработчик на фазу погружения (true), чтобы быть быстрее Firebase
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation(); // Глушим Firebase на корню

            const pPage = document.getElementById('profile-screen');
            const appShell = document.querySelector('.app-shell');

            if (pPage && appShell) {
                appShell.style.display = 'none';
                pPage.style.display = 'block';
                
                // Обновляем баланс и статус из глобальных переменных
                const bDisp = document.getElementById('user-balance-display');
                const sDisp = document.getElementById('user-status');
                
                if (bDisp) bDisp.textContent = balance.toLocaleString();
                if (sDisp) {
                    sDisp.textContent = (balance > 100000) ? "VIP ELITE (БОСС)" : "START игрок (HUSTLER)";
                    sDisp.style.color = (balance > 100000) ? "#ffd700" : "#c0c0c0";
                }
            }
            console.log('Вито, мы пробили защиту Firebase!');
        }, true);
    }

    // Кнопка НАЗАД (её Firebase не трогает, ставим просто так)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'back-to-slots') {
            const pPage = document.getElementById('profile-screen');
            const appShell = document.querySelector('.app-shell');
            if (pPage && appShell) {
                pPage.style.display = 'none';
                appShell.style.display = 'flex';
            }
        }
    });

    // Кнопка ВЫХОД
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'logout-btn') {
            if (confirm('Вито, реально выходим?')) {
                window.location.reload();
            }
        }
    });
})();
