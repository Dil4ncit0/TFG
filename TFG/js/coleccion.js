// js/coleccion.js
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('cards-grid');
  const backBtn = document.getElementById('back-btn');

  backBtn.addEventListener('click', () => {
    window.location.href = 'perfil.html';
  });

  const token = localStorage.getItem('token');
  if (!token) {
    grid.innerHTML = '<p class="error">No estás autenticado. Inicia sesión para ver tus cartas.</p>';
    return;
  }

  const apiUrl = 'http://localhost:5050/characters/unlocked';

  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(resp => {
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      return resp.json();
    })
    .then(chars => {
      if (!Array.isArray(chars) || chars.length === 0) {
        grid.innerHTML = '<p class="error">No tienes personajes desbloqueados.</p>';
        return;
      }
      chars.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'collection-card';
        card.addEventListener('click', () => {
          window.location.href = `personaje.html?nombre=${encodeURIComponent(ch.name)}`;
        });

        card.innerHTML = `
          <img src="${ch.image}" alt="${ch.name}">
          <div class="collection-card-info">
            <div class="collection-card-name">${ch.name}</div>
          </div>
        `;
        grid.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = '<p class="error">⚠️ No se pudo cargar la colección.</p>';
    });
});
