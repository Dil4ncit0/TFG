// js/personaje.js
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('personaje-container');
  const backBtn = document.getElementById('back-btn');
  backBtn.addEventListener('click', () => history.back());

  const params = new URLSearchParams(window.location.search);
  const nombre = params.get('nombre');

  if (!nombre) {
    container.innerHTML = '<p class="error">⚠️ No se proporcionó ningún personaje.</p>';
    return;
  }

  fetch(`http://localhost:5050/personaje/${encodeURIComponent(nombre)}`)
    .then(res => {
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    })
    .then(p => {
      container.innerHTML = `
        <div class="personaje-card">
          <img src="${p.imagenes_url}" alt="${p.name}">
          <div class="personaje-info">
            <h1>${p.name}</h1>
            <p><strong>Tipo:</strong> ${p.type}</p>
            <p><strong>Rareza:</strong> ${p.rarity}</p>
            <p><strong>Descripción:</strong> ${p.description}</p>
            <p><strong>Historia:</strong> ${p.story}</p>
            <div class="personaje-stats">
              <h2>Estadísticas</h2>
              <ul>
                ${Object.entries(p.stats || {}).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = '<p class="error">⚠️ No se pudo cargar la información del personaje.</p>';
    });
});
