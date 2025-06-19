// Marvel homepage functionality
// --- SESSION MANAGEMENT ---
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        console.log('Usuario logueado:', localStorage.getItem('userName'));
        // Aquí puedes mostrar elementos específicos para usuarios logueados
        // Ejemplo:
        // document.getElementById('welcome-msg').textContent = `Hola, ${localStorage.getItem('userName')}`;
    } else {
        console.log('No hay sesión activa');
        // Aquí puedes ocultar elementos que requieren login
    }
}

// Ejemplo: función para simular login (llámala tras validar credenciales)
function login(userName) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', userName);
    checkLoginStatus();
}

// Función para logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    checkLoginStatus();
}

document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();

    loadFeaturedCards();
    setupHowToPlayTabs();
    setupSmoothScrolling();
});

function loadFeaturedCardsFromAPI() {
    fetch('http://127.0.0.1:5050/personajes/destacados')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('featured-cards-grid');
            container.innerHTML = '';

            data.forEach(p => {
                const imagenUrl = p.imagen_url
                    ? (p.imagen_url.startsWith('http') ? p.imagen_url : `http://127.0.0.1:5050${p.imagen_url}`)
                    : 'img/placeholder.png';

                const cardHTML = `
                    <div class="card">
                        <img class="card-image" src="${imagenUrl}" alt="${p.name}">
                        <h3>${p.name}</h3>
                    </div>
                `;

                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        })
        .catch(error => console.error('Error al cargar personajes:', error));
}

window.addEventListener('DOMContentLoaded', loadFeaturedCardsFromAPI);

function createCardHTML(card) {
    const rarityClass = card.rarity.toLowerCase().replace('é', 'e').replace('í', 'i');
    
    return `
        <div class="featured-card">
            <div class="card-image">
                <div class="card-rarity">
                    <span class="badge badge-${rarityClass}">${card.rarity}</span>
                </div>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="card-name">${card.name}</h3>
                    <span class="card-type">${card.type}</span>
                </div>
                <div class="card-stats">
                    <div class="stat stat-attack">
                        <i class="fas fa-sword"></i>
                        <span>${card.attack}</span>
                    </div>
                    <div class="stat stat-defense">
                        <i class="fas fa-shield"></i>
                        <span>${card.defense}</span>
                    </div>
                    <div class="stat stat-energy">
                        <i class="fas fa-bolt"></i>
                        <span>${card.energy}</span>
                    </div>
                    <div class="stat stat-health">
                        <i class="fas fa-heart"></i>
                        <span>${card.health}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupHowToPlayTabs() {
    const tabButtons = document.querySelectorAll('#how-to-play-tabs .tab-btn');
    const tabPanels = document.querySelectorAll('#how-to-play-tabs .tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

function setupSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
});


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
