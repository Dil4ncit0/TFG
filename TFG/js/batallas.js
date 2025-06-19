// Battle system functionality with API integration
let currentBattleState = {
    playerCharacter: null,
    enemyCharacter: null,
    battleResult: null,
    userCharacters: [],
    selectedCharacter: null
};

document.addEventListener('DOMContentLoaded', function() {
    loadUserCharacters();
    setupBattleModal();
    setupBattleControls();
    setupTabs();
});

// Setup tab functionality
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Load user's unlocked characters
async function loadUserCharacters() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('🔐 No hay token en localStorage');
        showLoginMessage();
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5050/usuario_personajes', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                showLoginMessage();
                return;
            }
            throw new Error('Error al obtener personajes del usuario');
        }

        const data = await response.json();
        currentBattleState.userCharacters = data.characters || [];
        
        if (currentBattleState.userCharacters.length === 0) {
            showNoCharactersMessage();
        } else {
            loadBattleOptions();
        }
        
    } catch (error) {
        console.error('❌ Error al cargar personajes:', error);
        showErrorMessage('Error al cargar tus personajes. Inténtalo de nuevo.');
    }
}

function showLoginMessage() {
    const opponentsGrid = document.getElementById('opponents-grid');
    opponentsGrid.innerHTML = `
        <div class="no-content-message">
            <i class="fas fa-user-lock" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
            <h3>Inicia Sesión</h3>
            <p>Debes iniciar sesión para acceder a las batallas</p>
            <a href="inicio.html" class="btn btn-primary">Iniciar Sesión</a>
        </div>
    `;
}

function showNoCharactersMessage() {
    const opponentsGrid = document.getElementById('opponents-grid');
    opponentsGrid.innerHTML = `
        <div class="no-content-message">
            <i class="fas fa-users-slash" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
            <h3>Sin Personajes</h3>
            <p>Necesitas desbloquear al menos un personaje para batallar</p>
            <a href="comprarSobres.html" class="btn btn-primary">Comprar Sobres</a>
        </div>
    `;
}

function showErrorMessage(message) {
    const opponentsGrid = document.getElementById('opponents-grid');
    opponentsGrid.innerHTML = `
        <div class="no-content-message">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error); margin-bottom: 1rem;"></i>
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="loadUserCharacters()">Reintentar</button>
        </div>
    `;
}

function loadBattleOptions() {
    const opponentsGrid = document.getElementById('opponents-grid');
    
    // Show character selection interface
    opponentsGrid.innerHTML = `
        <div class="character-selection">
            <h3>Selecciona tu personaje para la batalla</h3>
            <div class="characters-grid">
                ${currentBattleState.userCharacters.map(character => `
                    <div class="character-card ${currentBattleState.selectedCharacter?.name === character.name ? 'selected' : ''}" 
                         onclick="selectCharacter('${character.name}')">
                        <div class="character-image">
                            <img src="${character.imagenes_url}" alt="${character.name}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="character-placeholder" style="display: none;">
                                <i class="fas fa-user"></i>
                            </div>
                        </div>
                        <div class="character-info">
                            <h4>${character.name}</h4>
                            <div class="character-type">${character.type}</div>
                            <div class="character-rarity rarity-${character.rarity?.toLowerCase()}">${character.rarity}</div>
                            <div class="character-stats">
                                <div class="stat">
                                    <i class="fas fa-sword"></i>
                                    <span>${character.stats.attack}</span>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-shield"></i>
                                    <span>${character.stats.defense}</span>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-heart"></i>
                                    <span>${character.stats.health}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="battle-actions">
                <button class="btn btn-primary btn-large" id="start-random-battle" 
                        ${!currentBattleState.selectedCharacter ? 'disabled' : ''}>
                    <i class="fas fa-dice"></i>
                    Batalla Aleatoria
                </button>
            </div>
        </div>
    `;

    // Add event listener to start battle button
    const startBattleBtn = document.getElementById('start-random-battle');
    if (startBattleBtn) {
        startBattleBtn.addEventListener('click', startRandomBattle);
    }

    // Load tournaments (keeping the existing tournament system)
    loadTournaments();
}

function selectCharacter(characterName) {
    const character = currentBattleState.userCharacters.find(c => c.name === characterName);
    if (character) {
        currentBattleState.selectedCharacter = character;
        
        // Update UI
        const characterCards = document.querySelectorAll('.character-card');
        characterCards.forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[onclick="selectCharacter('${characterName}')"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Enable battle button
        const startBattleBtn = document.getElementById('start-random-battle');
        if (startBattleBtn) {
            startBattleBtn.disabled = false;
        }
    }
}

async function startRandomBattle() {
    if (!currentBattleState.selectedCharacter) {
        alert('Selecciona un personaje primero');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Debes iniciar sesión para batallar');
        return;
    }

    // Show loading state
    const startBattleBtn = document.getElementById('start-random-battle');
    const originalText = startBattleBtn.innerHTML;
    startBattleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando oponente...';
    startBattleBtn.disabled = true;

    try {
        const response = await fetch('http://127.0.0.1:5050/battle-1v1', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                character: currentBattleState.selectedCharacter.name
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en la batalla');
        }

        const battleData = await response.json();
        currentBattleState.battleResult = battleData;
        
        // Show battle result
        showBattleResult(battleData);
        
    } catch (error) {
        console.error('❌ Error en la batalla:', error);
        alert(error.message || 'Error al iniciar la batalla. Inténtalo de nuevo.');
    } finally {
        // Restore button state
        startBattleBtn.innerHTML = originalText;
        startBattleBtn.disabled = false;
    }
}

function showBattleResult(battleData) {
    const battleSelection = document.getElementById('battle-selection');
    const battleArena = document.getElementById('battle-arena');
    
    // Hide selection screen and show arena
    battleSelection.classList.add('hidden');
    battleArena.classList.remove('hidden');
    
    // Update battle UI with real data
    updateBattleUIWithApiData(battleData);
    
    // Show battle animation
    animateBattle(battleData);
}

function updateBattleUIWithApiData(battleData) {
    // Update opponent info
    document.getElementById('opponent-name').textContent = battleData.enemy.name;
    document.getElementById('opponent-display-name').textContent = battleData.enemy.name;
    
    // Set opponent avatar
    const opponentAvatar = document.getElementById('opponent-avatar');
    opponentAvatar.src = battleData.enemy.imageUrl;
    opponentAvatar.onerror = function() {
        this.style.display = 'none';
        this.parentElement.innerHTML = '<i class="fas fa-user"></i>';
    };
    
    // Update character stats display
    updateCharacterDisplay('player', battleData.player);
    updateCharacterDisplay('opponent', battleData.enemy);
    
    // Add battle message
    addToBattleLog(`¡Batalla iniciada entre ${battleData.player.name} y ${battleData.enemy.name}!`);
    addToBattleLog(`Tipo de ${battleData.player.name}: ${battleData.player.type}`);
    addToBattleLog(`Tipo de ${battleData.enemy.name}: ${battleData.enemy.type}`);
}

function updateCharacterDisplay(side, character) {
    const prefix = side === 'player' ? 'player' : 'opponent';
    
    // Create character info display
    const infoContainer = document.querySelector(`.${side === 'player' ? 'player-area-self' : 'opponent-area'} .player-details`);
    if (infoContainer) {
        infoContainer.innerHTML = `
            <h3>${character.name}</h3>
            <div class="character-type-display">${character.type}</div>
            <div class="character-stats-display">
                <div class="stat-item">
                    <i class="fas fa-sword"></i>
                    <span>ATK: ${character.stats.attack}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-shield"></i>
                    <span>DEF: ${character.stats.defense}</span>
                </div>
                <div class="stat-item">
                    <i class="fas fa-heart"></i>
                    <span>HP: ${character.stats.health}</span>
                </div>
            </div>
        `;
    }
}

function animateBattle(battleData) {
    const battleLog = [];
    
    // Determine winner based on message
    const isVictory = battleData.message.includes('ganado');
    
    // Add battle progression
    setTimeout(() => {
        addToBattleLog('⚔️ ¡La batalla comienza!');
    }, 500);
    
    setTimeout(() => {
        addToBattleLog(`${battleData.player.name} se prepara para la batalla...`);
    }, 1000);
    
    setTimeout(() => {
        addToBattleLog(`${battleData.enemy.name} acepta el desafío!`);
    }, 1500);
    
    setTimeout(() => {
        addToBattleLog('💥 ¡Los combatientes chocan!');
    }, 2000);
    
    setTimeout(() => {
        if (isVictory) {
            addToBattleLog(`🎯 ${battleData.player.name} logra una ventaja estratégica!`);
        } else {
            addToBattleLog(`🎯 ${battleData.enemy.name} toma la delantera!`);
        }
    }, 2500);
    
    setTimeout(() => {
        addToBattleLog('⚡ ¡Intercambio final de ataques!');
    }, 3000);
    
    setTimeout(() => {
        // Show final result
        addToBattleLog(battleData.message);
        showFinalBattleResult(isVictory, battleData);
    }, 3500);
}

function showFinalBattleResult(isVictory, battleData) {
    const battleResult = document.getElementById('battle-result');
    
    if (isVictory) {
        battleResult.className = 'battle-result victory';
        battleResult.innerHTML = `
            <div class="result-content">
                <h4>🏆 ¡Victoria!</h4>
                <p>${battleData.message}</p>
                <div class="battle-stats">
                    <div class="battle-stat">
                        <strong>Tu personaje:</strong> ${battleData.player.name}
                    </div>
                    <div class="battle-stat">
                        <strong>Oponente:</strong> ${battleData.enemy.name}
                    </div>
                </div>
                <button class="btn btn-primary" onclick="endBattle()">Continuar</button>
            </div>
        `;
    } else {
        battleResult.className = 'battle-result defeat';
        battleResult.innerHTML = `
            <div class="result-content">
                <h4>💀 Derrota</h4>
                <p>${battleData.message}</p>
                <div class="battle-stats">
                    <div class="battle-stat">
                        <strong>Tu personaje:</strong> ${battleData.player.name}
                    </div>
                    <div class="battle-stat">
                        <strong>Oponente:</strong> ${battleData.enemy.name}
                    </div>
                </div>
                <button class="btn btn-primary" onclick="endBattle()">Continuar</button>
            </div>
        `;
    }
    
    battleResult.classList.remove('hidden');
    
    // Update user coins after battle
    setTimeout(() => {
        fetchAndDisplayUserCoins();
    }, 1000);
}

// Keep existing tournament functionality
function loadTournaments() {
    const tournaments = [
        {
            id: 1,
            name: "Torneo Semanal",
            status: "En Progreso",
            statusClass: "in-progress",
            participants: 64,
            rewards: "500 monedas + 3 sobres premium",
            endTime: "23h 45m",
            entryFee: "Gratis",
        },
        {
            id: 2,
            name: "Copa de Campeones",
            status: "Inscripciones",
            statusClass: "registration",
            participants: 32,
            rewards: "1000 monedas + 1 carta legendaria",
            endTime: "3d 12h",
            entryFee: "200 monedas",
        },
        {
            id: 3,
            name: "Desafío de Villanos",
            status: "Próximamente",
            statusClass: "upcoming",
            participants: 0,
            rewards: "800 monedas + sobre legendario",
            endTime: "5d 8h",
            entryFee: "150 monedas",
        }
    ];

    const tournamentsList = document.getElementById('tournaments-list');
    if (tournamentsList) {
        tournamentsList.innerHTML = tournaments.map(tournament => `
            <div class="tournament-card">
                <div class="tournament-header">
                    <div class="tournament-info">
                        <h3>${tournament.name}</h3>
                        <div class="tournament-status ${tournament.statusClass}">
                            <i class="fas fa-${tournament.statusClass === 'in-progress' ? 'clock' : tournament.statusClass === 'registration' ? 'users' : 'clock'}"></i>
                            ${tournament.status === "En Progreso" ? `Termina en ${tournament.endTime}` : 
                              tournament.status === "Inscripciones" ? "Inscripciones abiertas" : 
                              `Comienza en ${tournament.endTime}`}
                        </div>
                    </div>
                    <div class="tournament-badge ${tournament.statusClass}">${tournament.status}</div>
                </div>
                <div class="tournament-content">
                    <div class="tournament-details">
                        <div class="tournament-detail">
                            <h4>Participantes</h4>
                            <div class="tournament-detail-content">
                                <i class="fas fa-users"></i>
                                <span>${tournament.participants} jugadores</span>
                            </div>
                        </div>
                        <div class="tournament-detail">
                            <h4>Costo de Entrada</h4>
                            <div class="tournament-detail-content">
                                <i class="fas fa-coins"></i>
                                <span>${tournament.entryFee}</span>
                            </div>
                        </div>
                        <div class="tournament-detail">
                            <h4>Recompensas</h4>
                            <div class="tournament-detail-content">
                                <i class="fas fa-trophy"></i>
                                <span>${tournament.rewards}</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-full" ${tournament.status === "Próximamente" ? 'disabled' : ''}>
                        ${tournament.status === "En Progreso" ? "Ver Torneo" : 
                          tournament.status === "Inscripciones" ? "Inscribirse" : "Recordarme"}
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function setupBattleModal() {
    // Modal functionality can be removed as we're using direct battle start
    const modal = document.getElementById('battle-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function setupBattleControls() {
    const abandonBtn = document.getElementById('abandon-battle');
    
    if (abandonBtn) {
        abandonBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres abandonar la batalla?')) {
                endBattle();
            }
        });
    }
}

function endBattle() {
    const battleSelection = document.getElementById('battle-selection');
    const battleArena = document.getElementById('battle-arena');
    const battleResult = document.getElementById('battle-result');
    
    // Reset battle state
    currentBattleState.battleResult = null;
    currentBattleState.selectedCharacter = null;
    
    // Clear battle log
    const battleLog = document.getElementById('battle-log');
    if (battleLog) {
        battleLog.innerHTML = '';
    }
    
    // Hide battle arena and show selection
    battleArena.classList.add('hidden');
    battleSelection.classList.remove('hidden');
    battleResult.classList.add('hidden');
    
    // Reload character selection
    loadBattleOptions();
}

function addToBattleLog(message) {
    const battleLog = document.getElementById('battle-log');
    if (battleLog) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        battleLog.appendChild(logEntry);
        
        // Scroll to bottom
        battleLog.scrollTop = battleLog.scrollHeight;
        
        // Limit log entries
        while (battleLog.children.length > 50) {
            battleLog.removeChild(battleLog.firstChild);
        }
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
        }
    } catch (error) {
        console.error('❌ Error al cargar monedas del usuario:', error.message);
    }
}

// Load user coins on page load
document.addEventListener('DOMContentLoaded', function () {
    fetchAndDisplayUserCoins();
});