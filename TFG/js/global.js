// Global JavaScript functionality
class MarvelCardsApp {
    constructor() {
        this.userCoins = 0;  // inicializamos a 0 y luego haremos fetch
        this.userData = JSON.parse(localStorage.getItem('userData')) || this.getDefaultUserData();
        this.init();
    }

    async init() {
        await this.fetchUserCoins();      // ** <<< fetch de monedas al iniciar **
        this.updateCoinsDisplay();
        this.loadFooter();
        this.setupMobileMenu();
        this.setupTabs();
        this.setupModals();
    }

    // ————— Helpers básicos —————

    getDefaultUserData() {
        return {
            username: 'MarvelFan2023',
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            wins: 0,
            losses: 0,
            cards: 0,
            legendaryCards: 0,
            epicCards: 0,
            rareCards: 0,
            commonCards: 0
        };
    }

    // ————— MONEDAS —————

    async fetchUserCoins() {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/monedas_usuario`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('No se pudo cargar las monedas');
            const json = await res.json();
            this.userCoins = json.coins;
            localStorage.setItem('userCoins', this.userCoins.toString());
        } catch (err) {
            console.error('Error al obtener monedas:', err);
        }
    }

    updateCoinsDisplay() {
        const coinsElements = document.querySelectorAll('#user-coins, #shop-coins, #profile-coins');
        coinsElements.forEach(el => {
            if (el) el.textContent = this.formatNumber(this.userCoins);
        });
    }

    spendCoins(amount) {
        if (this.userCoins >= amount) {
            this.userCoins -= amount;
            localStorage.setItem('userCoins', this.userCoins.toString());
            this.updateCoinsDisplay();
            return true;
        }
        return false;
    }

    addCoins(amount) {
        this.userCoins += amount;
        localStorage.setItem('userCoins', this.userCoins.toString());
        this.updateCoinsDisplay();
    }

    // ————— CARGAR FOOTER —————

    async loadFooter() {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (!footerPlaceholder) return;
        try {
            const response = await fetch('footer.html');
            footerPlaceholder.innerHTML = await response.text();
        } catch {
            footerPlaceholder.innerHTML = `
                <footer class="footer">
                    <div class="footer-container">
                        <div class="footer-bottom">
                            <p>&copy; 2025 Marvel Cards. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </footer>
            `;
        }
    }

    // ————— MENÚ MÓVIL —————

    setupMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('nav-menu');
        if (!btn || !menu) return;
        btn.addEventListener('click', () => menu.classList.toggle('active'));
        document.addEventListener('click', e => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }

    // ————— TABS —————

    setupTabs() {
        document.querySelectorAll('.tabs').forEach(container => {
            const btns = container.querySelectorAll('.tab-btn');
            const panels = container.querySelectorAll('.tab-panel');
            btns.forEach(btn => btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                btns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                container.querySelector(`#${target}`)?.classList.add('active');
            }));
        });
    }

    // ————— MODALES —————

    setupModals() {
        document.addEventListener('click', e => {
            document.querySelectorAll('.modal').forEach(modal => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)')
                        .forEach(m => m.classList.add('hidden'));
            }
        });
    }
    
    showModal(id) {
        document.getElementById(id)?.classList.remove('hidden');
    }
    hideModal(id) {
        document.getElementById(id)?.classList.add('hidden');
    }

    // ————— ERRORES —————

    showError(msg) {
        const err = document.getElementById('error-message');
        const txt = document.getElementById('error-text');
        if (err && txt) {
            txt.textContent = msg;
            err.classList.remove('hidden');
            setTimeout(() => err.classList.add('hidden'), 5000);
        }
    }

    // ————— UTILIDADES —————

    formatNumber(n) {
        return new Intl.NumberFormat('es-ES').format(n);
    }

    // ... resto de métodos (generar cartas, estadísticas, etc.) siguen igual ...
}

// Inicializar la app
const app = new MarvelCardsApp();

// Función global para cambiar tabs
function switchTab(tab) {
    document.querySelector(`[data-tab="${tab}"]`)?.click();
}


