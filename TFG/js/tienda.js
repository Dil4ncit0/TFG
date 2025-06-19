const API_URL = 'http://localhost:5050/tirada'; // Cambia por tu dominio real si usas producción

// Insertar sobres dinámicamente
document.addEventListener('DOMContentLoaded', () => {
  const packsGrid = document.getElementById('packs-grid');

  const sobres = [
    {
      type: 'standard',
      name: 'Sobre Estándar',
      price: 100,
      image: 'img-portadas/estandar.jpg'  // Aquí la ruta correcta
    },
    {
      type: 'premium',
      name: 'Sobre Premium',
      price: 250,
      image: 'img-portadas/premium.jpg'
    },
    {
      type: 'legendary',
      name: 'Sobre Legendario',
      price: 500,
      image: 'img-portadas/legendario.jpg'
    }
  ];

  sobres.forEach(sobre => {
    const card = document.createElement('div');
    card.className = 'pack-card';
    card.innerHTML = `
      <div class="pack-image">
        <img src="${sobre.image}" alt="${sobre.name}">
      </div>
      <h3>${sobre.name}</h3>
      <p class="pack-price"><i class="fas fa-coins"></i> ${sobre.price}</p>
      <button class="btn btn-primary btn-tirar-pack" data-pack-type="${sobre.type}">Abrir</button>
    `;
    packsGrid.appendChild(card);
  });

  // Agregar evento a cada botón
  document.querySelectorAll('.btn-tirar-pack').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-pack-type');
      tirarPack(type);
    });
  });
});

async function tirarPack(packType) {
  const token = localStorage.getItem('token');
  if (!token) return mostrarError('⚠️ Debes iniciar sesión.');

  try {
    const res = await fetch(API_URL, {
      method: 'POST', 
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ packType })
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarError(data.message || '⚠️ Error en la tirada');
      return;
    }

    abrirModal(data);
    actualizarMonedas(data.personaje ? -1 : +data.coinsEarned); // Opcional: lógica para sumar/restar monedas

  } catch (err) {
    console.error(err);
    mostrarError('⚠️ Error al conectar con el servidor.');
  }
}

function mostrarError(msg) {
  const errorBox = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  errorText.textContent = msg;
  errorBox.classList.remove('hidden');

  setTimeout(() => {
    errorBox.classList.add('hidden');
  }, 4000);
}

function abrirModal(data) {
  const modal  = document.getElementById('pack-modal');
  const title  = document.getElementById('modal-title');
  const body   = document.getElementById('modal-body');
  const footer = document.getElementById('modal-footer');
  const p      = data.personaje;
  const baseURL = 'http://localhost:5050'; // Ajusta si cambia el dominio

  // 1) Obtén la ruta cruda, cubriendo todos los posibles campos:
  let rawUrl = null;
  if (p.imagenes_url && Array.isArray(p.imagenes_url)) {
    rawUrl = p.imagenes_url[0];
  } else if (p.imagen_url) {
    rawUrl = p.imagen_url;
  } else if (p.imagenes_url && typeof p.imagenes_url === 'string') {
    rawUrl = p.imagenes_url;
  }

  // 2) Normaliza a una URL completa o al placeholder:
  const imagenUrl = rawUrl
    ? (rawUrl.startsWith('http') ? rawUrl : `${baseURL}${rawUrl}`)
    : 'img/placeholder.png';

  // 3) Limpia caracteres especiales en la clase de rareza:
  const rarityClass = (p.rarity || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 4) Resto de contenido:
  title.textContent = p
    ? `¡Has conseguido a ${p.name}!`
    : 'Carta duplicada';

  body.innerHTML = `
    <div class="card-result">
      <div class="modal-card">
        <img src="${imagenUrl}"
             alt="${p.name}"
             class="modal-card-img" />
        <div class="modal-card-info">
          <h2 class="modal-card-name">${p.name}</h2>
          <span class="badge badge-${rarityClass}">${p.rarity}</span>
          ${p.stats ? `
            <ul class="modal-stats-list">
              ${Object.entries(p.stats)
                .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                .join('')}
            </ul>` : ''}
        </div>
      </div>
    </div>
  `;

  footer.innerHTML = `
    <p>${data.message}</p>
    <button class="btn btn-secondary" onclick="cerrarModal()">Cerrar</button>
  `;

  modal.classList.remove('hidden');
}



function cerrarModal() {
  document.getElementById('pack-modal').classList.add('hidden');
}

// Simulación de cambio de monedas
function actualizarMonedas(delta) {
  const coins = document.getElementById('user-coins');
  const shopCoins = document.getElementById('shop-coins');
  if (coins && shopCoins && !isNaN(delta)) {
    let nuevaCantidad = Math.max(0, parseInt(coins.textContent) + delta);
    coins.textContent = nuevaCantidad;
    shopCoins.textContent = nuevaCantidad;
  }
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
