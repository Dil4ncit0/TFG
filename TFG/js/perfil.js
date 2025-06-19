const API_BASE_URL = 'http://localhost:5050'; // Ajusta al dominio/puerto de tu backend

function checkProfileAccess() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = 'inicio.html';
  }
}

async function loadUserProfile() {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/usuario_info`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('No se pudo cargar la información del perfil');
    const userData = await res.json();

    document.getElementById('username').textContent       = userData.username;
    document.getElementById('user-level').textContent     = userData.level;
    document.getElementById('current-xp').textContent     = userData.experience;
    document.getElementById('max-xp').textContent         = userData.xpToNextLevel;
    document.getElementById('profile-coins').textContent  = userData.coins;
    document.getElementById('total-cards').textContent    = userData.unlockedCharacters.length;

    const xpPct = (userData.experience / userData.xpToNextLevel) * 100;
    document.getElementById('xp-progress').style.width = `${xpPct}%`;

    updateRarityStats(userData);
    renderRecentCards(userData.recentCharacters || []);
    renderAchievements(userData.achievements || []);

  } catch (err) {
    console.error(err);
  }
}

function renderRecentCards(cards) {
  const container = document.getElementById('recent-cards');
  if (!container) return;
  container.innerHTML = '';

  cards.forEach(card => {
    const rawUrl = card.imagen_url || card.image_url || '';
    const imageUrl = rawUrl
      ? (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
          ? rawUrl
          : `${API_BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`
        )
      : 'img/placeholder.png';

    const rarityClass = (card.rarity || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const dateStr = card.timestamp
      ? new Date(card.timestamp).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })
      : '';

    const html = `
      <div class="recent-card">
        <img 
          src="${imageUrl}" 
          alt="${card.name}" 
          class="card-image"
          onerror="this.onerror=null;this.src='img/placeholder.png';"
          loading="lazy"
          style="width: 150px; height: 200px; object-fit: cover;"
        />
        <div class="recent-card-rarity badge-${rarityClass}">${card.rarity}</div>
        <div class="recent-card-info">
          <div class="recent-card-name">${card.name}</div>
          <div class="recent-card-date">${dateStr}</div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

function renderAchievements(achievements) {
  const preview = document.getElementById('achievements-preview');
  const fullList = document.getElementById('achievements-list');
  if (preview) preview.innerHTML = renderAchievementsList(achievements.slice(0, 3));
  if (fullList) fullList.innerHTML = renderAchievementsList(achievements);
}

function renderAchievementsList(list) {
  return list.map(a => {
    const pct = a.total ? Math.round(a.progress / a.total * 100) : 0;
    return `
      <div class="achievement-item">
        <div class="achievement-header">
          <div class="achievement-info">
            <div class="achievement-title">
              ${a.completed
                ? '<i class="fas fa-star" style="color: var(--warning)"></i>'
                : '<i class="fas fa-clock" style="color: var(--text-muted)"></i>'}
              ${a.name}
            </div>
            <div class="achievement-description">${a.description}</div>
          </div>
          ${a.completed
            ? '<div class="achievement-status completed">Completado</div>'
            : `<div class="achievement-progress">${a.progress}/${a.total}</div>`}
        </div>
        ${!a.completed && a.progress
          ? `<div class="progress-bar">
               <div class="progress-fill" style="width:${pct}%"></div>
             </div>`
          : ''}
      </div>
    `;
  }).join('');
}

function updateRarityStats(userData) {
  const totalByRarity = { legendary: 0, epic: 0, rare: 0, common: 0 };
  userData.unlockedCharacters.forEach(r => {
    const key = r.toLowerCase();
    if (totalByRarity[key] !== undefined) totalByRarity[key]++;
  });

  const maxCards = userData.lockedCharacters.length + userData.unlockedCharacters.length;

  const stats = [
    { cls: 'legendary', label: 'Legendarias', count: totalByRarity.legendary, max: maxCards },
    { cls: 'epic',      label: 'Épicas',      count: totalByRarity.epic,      max: maxCards },
    { cls: 'rare',      label: 'Raras',       count: totalByRarity.rare,      max: maxCards },
    { cls: 'common',    label: 'Comunes',     count: totalByRarity.common,    max: maxCards },
  ];

  stats.forEach((s, i) => {
    const item = document.querySelectorAll('.rarity-item')[i];
    if (!item) return;
    item.querySelector('.rarity-count').textContent = `${s.count}/${s.max}`;
    item.querySelector('.progress-fill').style.width = `${Math.round(100 * s.count / s.max)}%`;
  });
}

function setupProfileTabs() {
  document.querySelectorAll('#profile-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('#profile-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('#profile-tabs .tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(tab)?.classList.add('active');
    });
  });
}

function loadFeaturedProfileCards() {
  fetch(`${API_BASE_URL}/personajes/destacados`)
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener personajes destacados');
      return response.json();
    })
    .then(data => {
      const container = document.getElementById('profile-featured-cards');
      if (!container) return;
      container.innerHTML = '';

      data.forEach(p => {
        const rawUrl = p.imagen_url || p.image_url || '';
        const imageUrl = rawUrl.startsWith('http')
          ? rawUrl
          : `${API_BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

        const cardHTML = `
          <div class="card">
            <img class="card-image" src="${imageUrl}" alt="${p.name}" 
              onerror="this.onerror=null;this.src='img/placeholder.png';" 
              loading="lazy" style="width:150px; height:200px; object-fit:cover;">
            <h3>${p.name}</h3>
          </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
      });
    })
    .catch(error => console.error('Error al cargar personajes destacados del perfil:', error));
}

document.addEventListener('DOMContentLoaded', () => {
  checkProfileAccess();
  loadUserProfile();
  setupProfileTabs();
  loadFeaturedProfileCards();
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

