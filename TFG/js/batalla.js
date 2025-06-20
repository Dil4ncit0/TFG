document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const battleMode = localStorage.getItem("battleMode") || "1v1";

  const battleArena = document.querySelector(".battle-arena");
  const playerContainer = document.getElementById("player-container");
  const enemyContainer = document.getElementById("enemy-container");
  const resultBox = document.getElementById("battle-result");
  const backBtn = document.getElementById("back-btn");

  if (!token) {
    alert("Token no encontrado. Por favor inicia sesión.");
    return window.location.href = "login.html";
  }

  // Añadir clase CSS según el modo de batalla
  if (battleMode === "1v1") {
    battleArena.classList.add("one-vs-one");
  } else if (battleMode === "2v2") {
    battleArena.classList.add("two-vs-two");
  }

  try {
    if (battleMode === "1v1") {
      const selectedCharacterName = localStorage.getItem("selectedCharacterName");
      if (!selectedCharacterName) {
        alert("Personaje no seleccionado para batalla 1v1.");
        return window.location.href = "seleccion.html";
      }

      const res = await fetch("http://localhost:5050/battle-1v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ character: selectedCharacterName })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error en la batalla 1v1");
      }

      const data = await res.json();

      // Crear card del jugador
      const playerCard = document.createElement("div");
      playerCard.classList.add("character-card");
      playerCard.innerHTML = `
        <h2>${data.player.name}</h2>
        <img src="${data.player.imagenes_url}" alt="${data.player.name}" class="char-img"/>
        <ul>
          <li>Tipo: ${data.player.type}</li>
          <li>Ataque: ${data.player.stats.attack}</li>
          <li>Defensa: ${data.player.stats.defense}</li>
          <li>Salud: ${data.player.stats.health}</li>
        </ul>
      `;
      playerContainer.appendChild(playerCard);

      // Crear card del enemigo
      const enemyCard = document.createElement("div");
      enemyCard.classList.add("character-card");
      enemyCard.innerHTML = `
        <h2>${data.enemy.name}</h2>
        <img src="${data.enemy.imageUrl}" alt="${data.enemy.name}" class="char-img"/>
        <ul>
          <li>Tipo: ${data.enemy.type}</li>
          <li>Ataque: ${data.enemy.stats.attack}</li>
          <li>Defensa: ${data.enemy.stats.defense}</li>
          <li>Salud: ${data.enemy.stats.health}</li>
        </ul>
      `;
      enemyContainer.appendChild(enemyCard);

      // Mostrar resultado
      const message = data.message || "";
      resultBox.textContent = message;
      resultBox.className = "";
      if (message.includes("ganado")) {
        resultBox.classList.add("win");
      } else {
        resultBox.classList.add("lose");
      }

    } else if (battleMode === "2v2") {
      const selectedCharacters = JSON.parse(localStorage.getItem("selectedCharacters2v2"));
      if (!selectedCharacters || !Array.isArray(selectedCharacters) || selectedCharacters.length !== 2) {
        alert("Debes seleccionar exactamente 2 personajes para la batalla 2v2.");
        return window.location.href = "seleccion.html";
      }

      const res = await fetch("http://localhost:5050/battle-2v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ characters: selectedCharacters })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error en la batalla 2v2");
      }

      const data = await res.json();

      // Limpiar contenedores
      playerContainer.innerHTML = "";
      enemyContainer.innerHTML = "";
      resultBox.textContent = "";
      resultBox.className = "";

      // Crear cards del equipo del jugador
      data.player.team.forEach((char) => {
        const card = document.createElement("div");
        card.classList.add("character-card");
        card.innerHTML = `
          <h3>${char.name}</h3>
          <img src="${char.imagenes_url}" alt="${char.name}" class="char-img" />
          <ul>
            <li>Tipo: ${char.type}</li>
            <li>Ataque: ${char.stats.attack}</li>
            <li>Defensa: ${char.stats.defense}</li>
            <li>Salud: ${char.stats.health}</li>
          </ul>
        `;
        playerContainer.appendChild(card);
      });

      // Crear cards del equipo enemigo
      data.enemy.team.forEach((char) => {
        const card = document.createElement("div");
        card.classList.add("character-card");
        card.innerHTML = `
          <h3>${char.name}</h3>
          <img src="${char.imageUrl}" alt="${char.name}" class="char-img" />
          <ul>
            <li>Tipo: ${char.type}</li>
            <li>Ataque: ${char.stats.attack}</li>
            <li>Defensa: ${char.stats.defense}</li>
            <li>Salud: ${char.stats.health}</li>
          </ul>
        `;
        enemyContainer.appendChild(card);
      });

      // Mostrar resultado
      const message = data.message || "";
      resultBox.textContent = message;
      if (message.includes("ganado")) {
        resultBox.classList.add("win");
      } else {
        resultBox.classList.add("lose");
      }

    } else {
      alert("Modo de batalla desconocido.");
      window.location.href = "seleccion.html";
    }
  } catch (err) {
    console.error(err);
    resultBox.textContent = err.message || "Error al realizar la batalla.";
    resultBox.classList.add("lose");
  }

  backBtn.addEventListener("click", () => {
    window.location.href = "batallas.html";
  });
});