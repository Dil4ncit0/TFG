// Coins purchase functionality
document.addEventListener('DOMContentLoaded', function() {
    loadCoinPackages();
    loadSubscriptions();
    setupCoinsModal();
    setupGiftCode();
});

const coinPackages = [
    {
        id: "small",
        name: "Paquete Pequeño",
        coins: 500,
        price: 4.99,
        color: "small",
    },
    {
        id: "medium",
        name: "Paquete Mediano",
        coins: 1200,
        price: 9.99,
        color: "medium",
        popular: true,
    },
    {
        id: "large",
        name: "Paquete Grande",
        coins: 2500,
        price: 19.99,
        color: "large",
        bonus: 300,
    },
    {
        id: "mega",
        name: "Paquete Mega",
        coins: 6000,
        price: 49.99,
        color: "mega",
        bonus: 1000,
    },
];

const subscriptions = [
    {
        id: "basic",
        name: "Pase Básico",
        coins: 600,
        price: 4.99,
        period: "mes",
        benefits: [
            "600 monedas mensuales",
            "1 sobre premium mensual",
            "Acceso a torneos básicos"
        ],
        color: "basic",
    },
    {
        id: "premium",
        name: "Pase Premium",
        coins: 1500,
        price: 9.99,
        period: "mes",
        benefits: [
            "1500 monedas mensuales",
            "3 sobres premium mensuales",
            "Acceso a todos los torneos",
            "Carta exclusiva mensual",
            "10% de descuento en la tienda"
        ],
        color: "premium",
        popular: true,
    },
];

function loadCoinPackages() {
    const coinsGrid = document.getElementById('coins-packages');
    if (coinsGrid) {
        coinsGrid.innerHTML = coinPackages.map(pkg => `
            <div class="coin-package ${pkg.popular ? 'popular' : ''}">
                <div class="package-image ${pkg.color}">
                    <i class="fas fa-coins" style="font-size: 2.5rem; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;"></i>
                    <div class="package-coins">${pkg.coins}</div>
                    ${pkg.bonus ? `
                        <div class="package-bonus">
                            <i class="fas fa-sparkles"></i>
                            +${pkg.bonus} bonus
                        </div>
                    ` : ''}
                </div>
                <div class="package-content">
                    <h3 class="package-title">${pkg.name}</h3>
                    <p class="package-description">
                        ${pkg.bonus ? `${pkg.coins + pkg.bonus} monedas en total` : `${pkg.coins} monedas`}
                    </p>
                    <div class="package-price">$${pkg.price}</div>
                    ${pkg.bonus ? `
                        <div class="package-bonus-badge">¡${pkg.bonus} monedas extra!</div>
                    ` : ''}
                    <button class="btn btn-primary btn-full" onclick="purchasePackage('${pkg.id}')">
                        Comprar
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function loadSubscriptions() {
    const subscriptionsGrid = document.getElementById('subscriptions');
    if (subscriptionsGrid) {
        subscriptionsGrid.innerHTML = subscriptions.map(sub => `
            <div class="subscription-card ${sub.popular ? 'popular' : ''}">
                <div class="subscription-image ${sub.color}">
                    <h3 class="subscription-title">${sub.name}</h3>
                    <div class="subscription-coins">
                        <i class="fas fa-coins"></i>
                        ${sub.coins} / ${sub.period}
                    </div>
                </div>
                <div class="subscription-content">
                    <div class="subscription-header">
                        <span class="subscription-name">${sub.name}</span>
                        <span class="subscription-price">$${sub.price}/${sub.period}</span>
                    </div>
                    <p class="subscription-period">Suscripción renovable automáticamente</p>
                    <div class="subscription-benefits">
                        <h4>Beneficios:</h4>
                        <ul class="benefits-list">
                            ${sub.benefits.map(benefit => `
                                <li class="benefit-item">
                                    <i class="fas fa-sparkles benefit-icon"></i>
                                    ${benefit}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <button class="btn btn-primary btn-full" onclick="purchaseSubscription('${sub.id}')">
                        Suscribirse
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function setupCoinsModal() {
    const modal = document.getElementById('purchase-modal');
    const cancelBtn = document.getElementById('cancel-purchase');
    const confirmBtn = document.getElementById('confirm-purchase');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            processPurchase();
        });
    }

    // Payment method selection
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const creditCardForm = document.getElementById('credit-card-form');

    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'credit-card') {
                creditCardForm.style.display = 'block';
            } else {
                creditCardForm.style.display = 'none';
            }
        });
    });
}

function setupGiftCode() {
    const redeemBtn = document.getElementById('redeem-btn');
    const giftCodeInput = document.getElementById('gift-code');

    if (redeemBtn && giftCodeInput) {
        redeemBtn.addEventListener('click', () => {
            const code = giftCodeInput.value.trim().toUpperCase();
            redeemGiftCode(code);
        });

        giftCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const code = giftCodeInput.value.trim().toUpperCase();
                redeemGiftCode(code);
            }
        });
    }
}

function purchasePackage(packageId) {
    const pkg = coinPackages.find(p => p.id === packageId);
    if (!pkg) return;

    showPurchaseModal(pkg, 'package');
}

function purchaseSubscription(subscriptionId) {
    const sub = subscriptions.find(s => s.id === subscriptionId);
    if (!sub) return;

    showPurchaseModal(sub, 'subscription');
}

function showPurchaseModal(item, type) {
    const modal = document.getElementById('purchase-modal');
    const title = document.getElementById('purchase-title');
    const details = document.getElementById('purchase-details');
    const confirmBtn = document.getElementById('confirm-purchase');

    if (type === 'package') {
        title.textContent = `Comprar ${item.name}`;
        details.innerHTML = `
            <p>Estás a punto de comprar ${item.coins} monedas por $${item.price}
            ${item.bonus ? ` (incluye ${item.bonus} monedas de bonificación)` : ''}</p>
        `;
        confirmBtn.textContent = `Pagar $${item.price}`;
    } else {
        title.textContent = `Suscribirse a ${item.name}`;
        details.innerHTML = `
            <p>Estás a punto de suscribirte al ${item.name} por $${item.price}/${item.period}</p>
            <p>Recibirás ${item.coins} monedas cada ${item.period}.</p>
        `;
        confirmBtn.textContent = `Suscribirse por $${item.price}`;
    }

    // Store current item for purchase processing
    modal.dataset.itemId = item.id;
    modal.dataset.itemType = type;

    modal.classList.remove('hidden');
}

function processPurchase() {
    const modal = document.getElementById('purchase-modal');
    const itemId = modal.dataset.itemId;
    const itemType = modal.dataset.itemType;
    const confirmBtn = document.getElementById('confirm-purchase');

    // Show loading state
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Procesando...';

    // Simulate payment processing
    setTimeout(() => {
        let item;
        if (itemType === 'package') {
            item = coinPackages.find(p => p.id === itemId);
            if (item) {
                const totalCoins = item.coins + (item.bonus || 0);
                app.addCoins(totalCoins);
                
                // Show success message
                alert(`¡Compra exitosa! Has recibido ${totalCoins} monedas.`);
            }
        } else {
            item = subscriptions.find(s => s.id === itemId);
            if (item) {
                app.addCoins(item.coins);
                
                // In a real app, you would set up the subscription
                alert(`¡Suscripción exitosa! Has recibido ${item.coins} monedas y tu suscripción está activa.`);
            }
        }

        // Reset button and close modal
        confirmBtn.disabled = false;
        confirmBtn.textContent = itemType === 'package' ? `Pagar $${item.price}` : `Suscribirse por $${item.price}`;
        modal.classList.add('hidden');
    }, 2000);
}

function redeemGiftCode(code) {
    const giftCodeInput = document.getElementById('gift-code');
    const redeemBtn = document.getElementById('redeem-btn');

    if (!code) {
        alert('Por favor, ingresa un código de regalo.');
        return;
    }

    // Show loading state
    redeemBtn.disabled = true;
    redeemBtn.textContent = 'Canjeando...';

    // Simulate code validation
    setTimeout(() => {
        const validCodes = {
            'MARVEL2023': 500,
            'STARTER': 250,
            'WELCOME': 100,
            'HERO': 1000
        };

        if (validCodes[code]) {
            const coins = validCodes[code];
            app.addCoins(coins);
            alert(`¡Código canjeado exitosamente! Has recibido ${coins} monedas.`);
            giftCodeInput.value = '';
        } else {
            alert('Código de regalo inválido. Por favor, verifica e intenta de nuevo.');
        }

        // Reset button state
        redeemBtn.disabled = false;
        redeemBtn.textContent = 'Canjear';
    }, 1500);
}

async function fetchAndDisplayUserCoins() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('🔐 No hay token en localStorage');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5050/monedas_usuario', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener monedas');
        }

        const data = await response.json();
        const coinsElement = document.getElementById('user-coins');
        if (coinsElement) {
            coinsElement.textContent = data.coins;
        } else {
            console.warn('Elemento #user-coins no encontrado');
        }
    } catch (error) {
        console.error('❌ Error al cargar monedas del usuario:', error.message);
    }
}

// Llama a la función al cargar
document.addEventListener('DOMContentLoaded', function () {
    fetchAndDisplayUserCoins();
});
