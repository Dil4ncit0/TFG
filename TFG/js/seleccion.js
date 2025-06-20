// js/seleccion.js

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Detectar modo desde URL y guardarlo
  const params     = new URLSearchParams(window.location.search);
  const mode       = params.get('mode') === '2v2' ? '2v2' : '1v1';
  localStorage.setItem('battleMode', mode);

  // 2) Referencias DOM
  const title      = document.getElementById('mode-title');
  const grid       = document.getElementById('characters-grid');
  const confirmBtn = document.getElementById('confirm-btn');
  const finishBtn  = document.getElementById('finish-btn');

  title.textContent = `Modo ${mode}`;

  // Botones al inicio ocultos
  confirmBtn.style.display = 'none';
  finishBtn.style.display  = 'none';

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión primero.');
    return window.location.href = 'login.html';
  }

  // 3) Cargar personajes desbloqueados
  let characters = [];
  try {
    const resp = await fetch('http://localhost:5050/characters/unlocked', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!resp.ok) throw new Error();
    characters = await resp.json();
  } catch {
    grid.innerHTML = '<p>Error cargando personajes.</p>';
    return;
  }

  // 4) Renderizar tarjetas
  characters.forEach(c => {
    const card = document.createElement('div');
    card.className             = 'char-card';
    card.dataset.name          = c.name;
    card.innerHTML = `
      <img src="${c.image}" alt="${c.name}" />
      <p>${c.name}</p>
    `;
    grid.appendChild(card);
  });

  // 5) Lógica de selección según modo
  let selectedNames = [];

  grid.addEventListener('click', e => {
    const card = e.target.closest('.char-card');
    if (!card) return;
    const name = card.dataset.name;

    if (mode === '1v1') {
      // Sólo uno
      selectedNames = [name];
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    } else {
      // 2v2: toggle selección, max 2
      if (card.classList.contains('selected')) {
        card.classList.remove('selected');
        selectedNames = selectedNames.filter(n => n !== name);
      } else if (selectedNames.length < 2) {
        card.classList.add('selected');
        selectedNames.push(name);
      } else {
        // ya hay 2
        return;
      }
    }

    // Mostrar/Ocultar botón Iniciar Batalla
    if ((mode === '1v1' && selectedNames.length === 1) ||
        (mode === '2v2' && selectedNames.length === 2)) {
      confirmBtn.style.display = 'inline-block';
    } else {
      confirmBtn.style.display = 'none';
    }
  });

  // 6) Confirmar selección y redirigir
  confirmBtn.addEventListener('click', () => {
    if (mode === '1v1') {
      localStorage.setItem('selectedCharacterName', selectedNames[0]);
    } else {
      localStorage.setItem('selectedCharacters2v2', JSON.stringify(selectedNames));
    }
    window.location.href = 'batalla.html';
  });

  // 7) Botón finalizar (si lo necesitas)
  finishBtn.addEventListener('click', () => {
    window.location.href = 'batallas.html';
  });
});
