document.addEventListener("DOMContentLoaded", () => {
  const btn1v1 = document.getElementById("mode-1v1");
  const selectionScreen = document.getElementById("character-selection");
  const characterList = document.getElementById("character-list");
  const confirmButton = document.getElementById("confirm-character");
  const battleSelection = document.getElementById("battle-selection");

  let selectedCharacterId = null;

  // Simulación de personajes del usuario (reemplaza con tu API real)
  const userCharacters = [
    { id: 1, name: "Iron Man", image: "assets/ironman.png" },
    { id: 2, name: "Spider-Man", image: "assets/spiderman.png" },
    { id: 3, name: "Captain Marvel", image: "assets/captainmarvel.png" }
  ];

  // Simula obtener personaje random del servidor (API real)
  const getRandomOpponent = () => {
    const pool = ["Loki", "Thanos", "Ultron"];
    const name = pool[Math.floor(Math.random() * pool.length)];
    return { name, image: "assets/random_enemy.png" }; // Simulado
  };

  // Mostrar personajes del usuario
  function showCharacterSelection() {
    characterList.innerHTML = "";
    selectedCharacterId = null;
    confirmButton.classList.add("hidden");

    userCharacters.forEach(char => {
      const div = document.createElement("div");
      div.className = "character-card";
      div.innerHTML = `
        <img src="${char.image}" alt="${char.name}" />
        <p>${char.name}</p>
      `;
      div.addEventListener("click", () => {
        document.querySelectorAll(".character-card").forEach(card => card.classList.remove("selected"));
        div.classList.add("selected");
        selectedCharacterId = char.id;
        confirmButton.classList.remove("hidden");
      });
      characterList.appendChild(div);
    });

    battleSelection.classList.add("hidden");
    selectionScreen.classList.remove("hidden");
  }

  // Confirmar selección
  confirmButton.addEventListener("click", () => {
    if (!selectedCharacterId) return;
    
    const playerCharacter = userCharacters.find(c => c.id === selectedCharacterId);
    const opponent = getRandomOpponent();

    console.log("Iniciar combate entre:");
    console.log("Jugador:", playerCharacter);
    console.log("Oponente:", opponent);

    // Aquí iría la transición al combate real o llamada a la API
    alert(`¡Combate iniciado!\nTú: ${playerCharacter.name} vs ${opponent.name}`);
    
    // Por ahora, volvemos a la pantalla inicial
    selectionScreen.classList.add("hidden");
    battleSelection.classList.remove("hidden");
  });

  // Evento del botón 1v1
  btn1v1.addEventListener("click", () => {
    showCharacterSelection();
  });

  // Script básico para alternar pestañas
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;

      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === tab);
      });
    });
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