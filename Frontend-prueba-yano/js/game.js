const API_AUTH = '/BootcampPHP/api/auth.php';
const API_ROOMS = '/BootcampPHP/api/rooms.php';
const API_GAME = '/BootcampPHP/api/game.php';

let gameState = {
    roomId: null,
    playerId: null,
    players: [],
    currentRound: 1,
    selectedMap: null,
    playerCards: [],
    currentAttribute: null,
    currentTurn: 1,
    currentPlayerId: null,
    currentPlayerName: '',
    roundInProgress: false,
    gameFinished: false,
    totalPlayers: 0,
    needsAttributeSelection: false
};

// Inicializar juego desde datos del lobby
async function initializeGame() {
    // Obtener parámetros de URL
    const params = new URLSearchParams(window.location.search);
    gameState.roomId = params.get('roomId');
    gameState.playerId = params.get('playerId');

    if (!gameState.roomId || !gameState.playerId) {
        showError('Datos de juego inválidos');
        setTimeout(() => window.location.href = 'lobby.html', 2000);
        return;
    }

    // Recuperar configuración del juego
    const gameConfig = JSON.parse(sessionStorage.getItem('gameConfig'));
    if (gameConfig) {
        gameState.players = gameConfig.players;
        gameState.selectedMap = gameConfig.selectedMap;
        
        // Establecer fondo del mapa
        if (gameState.selectedMap && gameState.selectedMap.image_url) {
            document.body.style.backgroundImage = `url('${gameState.selectedMap.image_url}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        }
    }

    try {
        // Cargar estado inicial del juego
        await fetchGameState();
        // Iniciar actualizaciones periódicas
        startGameLoop();
        
        showAlert('¡Juego iniciado! Preparando primera ronda...', 'success');
        
        // Iniciar primera ronda después de un momento
        setTimeout(startNewRound, 2000);
        
    } catch (error) {
        console.error('Error inicializando juego:', error);
        showError('Error al inicializar el juego: ' + error.message);
    }
}

// Obtener estado actual del juego
async function fetchGameState() {
    try {
        const response = await fetch(`${API_ROOMS}?action=room_status&room_id=${gameState.roomId}`);
        const data = await response.json();
        
        if (data.room) {
            gameState.currentRound = data.room.current_round;
            gameState.currentTurn = data.room.current_turn;
            gameState.players = data.players;
            gameState.totalPlayers = data.players.length;
            gameState.gameFinished = data.room.status === 'finished';
            gameState.needsAttributeSelection = data.needs_attribute_selection || false;
            
            // Determinar el jugador actual del turno
            const currentPlayer = data.players.find(p => p.player_order === gameState.currentTurn);
            if (currentPlayer) {
                gameState.currentPlayerId = currentPlayer.id;
                gameState.currentPlayerName = currentPlayer.player_name;
            }
            
            updateGameUI(data);
        }
    } catch (error) {
        console.error('Error obteniendo estado del juego:', error);
    }
}

// Obtener cartas del jugador actual del turno
async function fetchCurrentPlayerCards() {
    try {
        const response = await fetch(`${API_ROOMS}?action=player_cards&room_id=${gameState.roomId}&player_id=${gameState.currentPlayerId}`);
        const data = await response.json();
        
        if (data.cards) {
            gameState.playerCards = data.cards;
            renderPlayerCards();
        }
    } catch (error) {
        console.error('Error obteniendo cartas del jugador:', error);
    }
}

// Iniciar nueva ronda
async function startNewRound() {
    if (gameState.gameFinished) {
        showFinalResults();
        return;
    }
    
    try {
        const response = await fetch(`${API_ROOMS}?action=start_round`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_id: gameState.roomId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            gameState.currentTurn = data.current_turn;
            
            // Actualizar estado del juego después de obtener la información de la ronda
            await fetchGameState();
            
            // Verificar si necesita selección de atributo
            if (data.needs_attribute_selection) {
                gameState.needsAttributeSelection = true;
                showAttributeSelectionModal();
            } else {
                // Ya tiene atributo seleccionado
                gameState.currentAttribute = data.selected_attribute;
                gameState.roundInProgress = true;
                
                // Actualizar UI
                document.getElementById('currentRound').textContent = `Ronda: ${data.round_number}`;
                document.getElementById('selectedAttribute').textContent = data.attribute_name;
                
                // Preparar turno
                prepareTurn();
            }
            
        } else {
            showError(data.error || 'Error al iniciar ronda');
        }
    } catch (error) {
        console.error('Error iniciando ronda:', error);
        showError('Error al iniciar nueva ronda');
    }
}

// NUEVA FUNCIÓN: Mostrar modal de selección de atributos
function showAttributeSelectionModal() {
    const attributes = [
        { key: 'altura_mts', name: 'Altura', icon: '📏', description: 'Medida en metros' },
        { key: 'fuerza', name: 'Fuerza', icon: '⚡', description: 'Poder de combate' },
        { key: 'velocidad_percent', name: 'Velocidad', icon: '🏃', description: 'Rapidez en batalla' },
        { key: 'tecnica', name: 'Técnica', icon: '🧠', description: 'Habilidad técnica' },
        { key: 'ki', name: 'Ki', icon: '💫', description: 'Energía espiritual' },
        { key: 'peleas_ganadas', name: 'Peleas Ganadas', icon: '🏆', description: 'Victorias conseguidas' }
    ];
    
    // Crear modal de selección
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 800px;">
            <h2>🎯 Selecciona el Atributo para la Ronda ${gameState.currentRound}</h2>
            <p style="color: #666; margin-bottom: 30px;">
                Es el turno de <strong>${gameState.currentPlayerName}</strong> para elegir el atributo de combate
            </p>
            <div id="attributeOptions" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0;">
                ${attributes.map(attr => `
                    <div class="attribute-option" 
                         onclick="selectAttribute('${attr.key}')" 
                         style="padding: 25px; border: 3px solid #ddd; border-radius: 15px; background: white; 
                               cursor: pointer; transition: all 0.3s ease; text-align: center;">
                        <div style="font-size: 4em; margin-bottom: 10px;">${attr.icon}</div>
                        <div style="font-weight: bold; font-size: 1.3em; margin-bottom: 8px; color: #333;">${attr.name}</div>
                        <div style="font-size: 0.9em; color: #666;">${attr.description}</div>
                    </div>
                `).join('')}
            </div>
            <div style="color: #888; font-size: 0.9em; margin-top: 20px;">
                Haz clic en el atributo que quieres usar para esta ronda
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Función global para seleccionar atributo
    window.selectAttribute = function(attributeKey) {
        selectAttributeForRound(attributeKey);
        modal.remove();
    };
    
    // Añadir efectos hover a las opciones
    const options = modal.querySelectorAll('.attribute-option');
    options.forEach(option => {
        option.addEventListener('mouseenter', function() {
            this.style.border = '3px solid #ff6b6b';
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
        });
        
        option.addEventListener('mouseleave', function() {
            this.style.border = '3px solid #ddd';
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });
}

// NUEVA FUNCIÓN: Seleccionar atributo para la ronda
async function selectAttributeForRound(selectedAttribute) {
    try {
        showAlert('Seleccionando atributo...', 'info');
        
        const response = await fetch(`${API_ROOMS}?action=select_attribute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_id: gameState.roomId,
                selected_attribute: selectedAttribute
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            gameState.currentAttribute = data.selected_attribute;
            gameState.roundInProgress = true;
            gameState.needsAttributeSelection = false;
            
            // Mostrar animación de atributo seleccionado
            showAttributeConfirmation(data.selected_attribute, data.attribute_name);
            
            // Actualizar UI
            document.getElementById('currentRound').textContent = `Ronda: ${data.round_number}`;
            document.getElementById('selectedAttribute').textContent = data.attribute_name;
            
            showAlert(`¡Atributo seleccionado: ${data.attribute_name}!`, 'success');
            
            // Preparar turno después de mostrar confirmación
            setTimeout(() => {
                prepareTurn();
            }, 3000);
            
        } else {
            showError(data.error || 'Error al seleccionar atributo');
        }
    } catch (error) {
        console.error('Error seleccionando atributo:', error);
        showError('Error al seleccionar el atributo');
    }
}

// NUEVA FUNCIÓN: Mostrar confirmación del atributo seleccionado
function showAttributeConfirmation(selectedAttribute, attributeName) {
    const attributeIcons = {
        'altura_mts': '📏',
        'fuerza': '⚡',
        'velocidad_percent': '🏃',
        'tecnica': '🧠',
        'ki': '💫',
        'peleas_ganadas': '🏆'
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.innerHTML = `
        <div class="modal-content" style="text-align: center; max-width: 500px;">
            <h2>✨ ¡Atributo Seleccionado! ✨</h2>
            <div style="margin: 30px 0;">
                <div style="font-size: 6em; margin-bottom: 20px; animation: pulse 2s infinite;">
                    ${attributeIcons[selectedAttribute]}
                </div>
                <div style="font-size: 2em; color: #ff6b6b; font-weight: bold; margin-bottom: 10px;">
                    ${attributeName}
                </div>
                <div style="color: #666; font-size: 1.1em;">
                    Este será el atributo de combate para la Ronda ${gameState.currentRound}
                </div>
            </div>
            <div style="background: #f0f8f0; padding: 15px; border-radius: 10px; margin-top: 20px;">
                <p style="margin: 0; color: #2e7d32;">
                    🎮 Preparando turnos de jugadores...
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 3000);
}

// Preparar turno del jugador actual
async function prepareTurn() {
    await fetchGameState();
    
    // Solo cargar cartas si no necesita selección de atributo
    if (!gameState.needsAttributeSelection) {
        await fetchCurrentPlayerCards();
        
        // Mostrar de quién es el turno
        if (gameState.currentPlayerId) {
            showAlert(`Turno de: ${gameState.currentPlayerName}`, 'info');
            
            // Solo habilitar cartas si es el turno del jugador correcto
            enableCardSelection();
            
            // Actualizar información en pantalla
            updateTurnInfo();
        }
    }
}

// Actualizar información del turno en pantalla
function updateTurnInfo() {
    document.getElementById('currentTurn').textContent = `Turno de: ${gameState.currentPlayerName}`;
    
    // Actualizar área de estado del juego
    const roundStatus = document.getElementById('roundStatus');
    if (roundStatus) {
        if (gameState.needsAttributeSelection) {
            roundStatus.innerHTML = `
                <p><strong>Esperando selección de atributo...</strong></p>
                <p><strong>Turno de:</strong> ${gameState.currentPlayerName}</p>
                <p><strong>Acción:</strong> Seleccionar atributo de combate</p>
            `;
        } else {
            roundStatus.innerHTML = `
                <p><strong>Es el turno de:</strong> ${gameState.currentPlayerName}</p>
                <p><strong>Atributo:</strong> ${getAttributeName(gameState.currentAttribute)}</p>
                <p><strong>Jugadores restantes:</strong> ${getPlayersLeftInRound()}</p>
            `;
        }
    }
}

// Obtener cuántos jugadores faltan por jugar en la ronda
function getPlayersLeftInRound() {
    // Esta información debe venir del backend, por ahora estimamos
    return `${gameState.totalPlayers - (gameState.currentTurn - 1)} de ${gameState.totalPlayers}`;
}

// Habilitar selección de cartas solo para el jugador del turno actual
function enableCardSelection() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.cursor = 'pointer';
        card.style.opacity = '1';
        card.classList.add('selectable');
        card.onclick = function() {
            const cardId = this.dataset.cardId;
            playCard(cardId);
        };
    });
}

// Deshabilitar selección de cartas
function disableCardSelection() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.cursor = 'not-allowed';
        card.style.opacity = '0.5';
        card.classList.remove('selectable');
        card.onclick = null;
    });
}

// Jugar una carta
async function playCard(cardId) {
    if (!gameState.roundInProgress) {
        showAlert('No hay ronda activa', 'error');
        return;
    }
    
    if (gameState.needsAttributeSelection) {
        showAlert('Primero debe seleccionarse un atributo para la ronda', 'error');
        return;
    }
    
    try {
        // Deshabilitar todas las cartas inmediatamente
        disableCardSelection();
        
        const response = await fetch(`${API_ROOMS}?action=play_card`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_id: gameState.roomId,
                player_id: gameState.currentPlayerId,
                card_id: cardId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Remover carta jugada de la mano
            gameState.playerCards = gameState.playerCards.filter(card => card.id != cardId);
            
            showAlert(`¡${gameState.currentPlayerName} jugó su carta! Valor: ${data.attribute_value}`, 'success');
            
            // Mostrar carta en el área de juego
            addCardToPlayArea(cardId, data.attribute_value, gameState.currentPlayerName);
            
            if (data.round_complete && data.round_result) {
                // Mostrar resultado de la ronda
                setTimeout(() => showRoundResult(data.round_result), 2000);
            } else {
                // Continuar con el siguiente jugador
                if (data.next_player) {
                    gameState.currentPlayerId = data.next_player.id;
                    gameState.currentPlayerName = data.next_player.player_name;
                    
                    setTimeout(() => {
                        showAlert(`Turno de: ${data.next_player.player_name}`, 'info');
                        prepareTurn();
                    }, 1500);
                } else {
                    showAlert('Esperando a que otros jugadores jueguen sus cartas...', 'info');
                }
            }
            
        } else {
            // Rehabilitar cartas si hay error
            enableCardSelection();
            showError(data.error || 'Error al jugar carta');
        }
        
    } catch (error) {
        console.error('Error jugando carta:', error);
        enableCardSelection();
        showError('Error al jugar la carta');
    }
}

// Agregar carta al área de juego
function addCardToPlayArea(cardId, attributeValue, playerName) {
    const playArea = document.getElementById('cardsInPlay');
    
    // Limpiar el mensaje inicial si existe
    if (playArea.children.length === 1 && playArea.children[0].tagName === 'P') {
        playArea.innerHTML = '';
    }
    
    const card = gameState.playerCards.find(c => c.id == cardId);
    if (!card) return;
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card played-card';
    cardElement.innerHTML = `
        <img src="${card.image_url || '/placeholder-card.jpg'}" alt="${card.name}" onerror="this.style.display='none'">
        <div class="card-content">
            <h4>${card.name}</h4>
            <div class="player-label">${playerName}</div>
            <div class="attribute-value">
                <strong>${getAttributeIcon(gameState.currentAttribute)} ${attributeValue}</strong>
            </div>
        </div>
    `;
    playArea.appendChild(cardElement);
    
    // Añadir animación
    cardElement.style.transform = 'scale(0)';
    cardElement.style.transition = 'transform 0.3s ease';
    setTimeout(() => {
        cardElement.style.transform = 'scale(1)';
    }, 100);
}

// Obtener icono del atributo
function getAttributeIcon(attribute) {
    const icons = {
        'altura_mts': '📏',
        'fuerza': '⚡',
        'velocidad_percent': '🏃',
        'tecnica': '🧠',
        'ki': '💫',
        'peleas_ganadas': '🏆'
    };
    return icons[attribute] || '⭐';
}

// Obtener nombre legible del atributo
function getAttributeName(attribute) {
    const names = {
        'altura_mts': 'Altura',
        'fuerza': 'Fuerza',
        'velocidad_percent': 'Velocidad',
        'tecnica': 'Técnica',
        'ki': 'Ki',
        'peleas_ganadas': 'Peleas Ganadas'
    };
    return names[attribute] || attribute;
}

// Mostrar resultado de la ronda
function showRoundResult(roundResult) {
    gameState.roundInProgress = false;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🏆 Resultado de la Ronda ${gameState.currentRound}</h2>
            <div class="round-results">
                <h3>🎯 Atributo: ${getAttributeName(gameState.currentAttribute)}</h3>
                <div class="winner-announcement">
                    <h3>🥇 ¡Ganador: ${roundResult.player_name}!</h3>
                    <p>Carta: <strong>${roundResult.card_name}</strong></p>
                    <p>Valor: <strong>${roundResult.attribute_value}</strong></p>
                </div>
                <div class="cards-comparison" id="cardsComparison">
                    <!-- Se llenará con las cartas jugadas -->
                </div>
            </div>
            <button onclick="nextRound()" class="submit-btn">Siguiente Ronda</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Cargar comparación de cartas
    loadRoundComparison();
    
    // Función global para siguiente ronda
    window.nextRound = function() {
        modal.remove();
        gameState.currentRound++;
        
        // Limpiar área de juego
        document.getElementById('cardsInPlay').innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Las cartas jugadas aparecerán aquí</p>';
        
        // Verificar si el juego terminó
        if (gameState.currentRound > 8) {
            showFinalResults();
        } else {
            // Actualizar estado del juego
            fetchGameState();
            // Iniciar siguiente ronda
            setTimeout(startNewRound, 1000);
        }
    };
}

// Cargar comparación de cartas de la ronda
async function loadRoundComparison() {
    try {
        const response = await fetch(`${API_ROOMS}?action=round_result&room_id=${gameState.roomId}&round=${gameState.currentRound}`);
        const data = await response.json();
        
        if (data.cards_played) {
            const comparisonDiv = document.getElementById('cardsComparison');
            comparisonDiv.innerHTML = `
                <h4>Cartas jugadas:</h4>
                <div class="played-cards">
                    ${data.cards_played.map((card, index) => `
                        <div class="played-card ${index === 0 ? 'winner' : ''}">
                            <div class="player-name">${card.player_name}</div>
                            <div class="card-name">${card.card_name}</div>
                            <div class="card-value">${getAttributeIcon(gameState.currentAttribute)} ${card.attribute_value}</div>
                            ${index === 0 ? '<div class="winner-badge">🥇</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando comparación:', error);
    }
}

// Mostrar resultados finales
async function showFinalResults() {
    try {
        const response = await fetch(`${API_ROOMS}?action=final_results&room_id=${gameState.roomId}`);
        const data = await response.json();
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🎉 ¡Fin del Juego!</h2>
                <div class="final-results">
                    <div class="champion">
                        <h3>🏆 ¡Campeón: ${data.winner.player_name}!</h3>
                        <p>Puntuación: ${data.winner.score} puntos</p>
                    </div>
                    <div class="final-standings">
                        <h4>📊 Clasificación Final:</h4>
                        <ol>
                            ${data.final_standings.map((player, index) => `
                                <li class="standing-item ${index === 0 ? 'winner' : ''}">
                                    <span class="player-name">${player.player_name}</span>
                                    <span class="player-score">${player.score} puntos</span>
                                </li>
                            `).join('')}
                        </ol>
                    </div>
                </div>
                <div class="final-actions">
                    <button onclick="returnToLobby()" class="submit-btn">Volver al Lobby</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Función global para volver al lobby
        window.returnToLobby = function() {
            sessionStorage.removeItem('gameConfig');
            window.location.href = 'lobby.html';
        };
        
    } catch (error) {
        console.error('Error cargando resultados finales:', error);
        showError('Error al cargar resultados finales');
    }
}

// Renderizar cartas del jugador actual
function renderPlayerCards() {
    const cardsContainer = document.getElementById('playerCards');
    
    if (!gameState.playerCards || gameState.playerCards.length === 0) {
        cardsContainer.innerHTML = '<p>No hay cartas para mostrar</p>';
        return;
    }
    
    cardsContainer.innerHTML = gameState.playerCards.map(card => `
        <div class="card" data-card-id="${card.id}">
            <img src="${card.image_url || '/placeholder-card.jpg'}" alt="${card.name}" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="card-placeholder" style="display: none; align-items: center; justify-content: center; height: 40%; font-size: 3em;">🃏</div>
            <div class="card-content">
                <h4>${card.name}</h4>
                <div class="card-stats">
                    <div class="stat">📏 ${card.altura_mts}m</div>
                    <div class="stat">⚡ ${card.fuerza}</div>
                    <div class="stat">🏃 ${card.velocidad_percent}%</div>
                    <div class="stat">🧠 ${card.tecnica}</div>
                    <div class="stat">💫 ${card.ki}</div>
                    <div class="stat">🏆 ${card.peleas_ganadas}</div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Actualizar contador de cartas
    document.getElementById('cardsLeft').textContent = `Cartas restantes: ${gameState.playerCards.length}`;
}

// Actualizar UI del juego
function updateGameUI(data) {
    // Actualizar información de la ronda
    document.getElementById('currentRound').textContent = `Ronda: ${data.room.current_round}`;
    
    // Actualizar información del turno
    if (gameState.currentPlayerName) {
        document.getElementById('currentTurn').textContent = `Turno de: ${gameState.currentPlayerName}`;
    }
    
    // Actualizar marcador
    if (data.players) {
        updateScoreboard(data.players);
    }
    
    // Verificar si el juego terminó
    if (data.room.status === 'finished' || data.room.current_round > 8) {
        gameState.gameFinished = true;
        if (!document.querySelector('.modal.active')) {
            showFinalResults();
        }
    }
}

// Actualizar marcador
function updateScoreboard(players) {
    const scoreboard = document.getElementById('playerScores');
    scoreboard.innerHTML = players.map((player, index) => `
        <div class="player-score ${player.id === gameState.currentPlayerId ? 'current-turn' : ''}">
            <span class="player-name">${player.player_name}${player.id === gameState.currentPlayerId ? ' 👈' : ''}</span>
            <span class="score">${player.score} pts</span>
        </div>
    `).join('');
}

// Loop principal del juego
function startGameLoop() {
    // Actualizar estado cada 3 segundos
    setInterval(async () => {
        if (!gameState.gameFinished && !document.querySelector('.modal.active')) {
            await fetchGameState();
            
            // Si necesita selección de atributo y no hay modal activo, mostrarlo
            if (gameState.needsAttributeSelection && 
                gameState.currentPlayerId === parseInt(gameState.playerId) && 
                !document.querySelector('.modal.active')) {
                showAttributeSelectionModal();
            }
        }
    }, 3000);
}

// Función para mostrar errores
function showError(message) {
    showAlert(message, 'error');
}

// Función para mostrar alertas
function showAlert(message, type = 'info') {
    // Remover alertas existentes
    const existingAlert = document.querySelector('.game-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `game-alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    // Colores según tipo
    const colors = {
        'success': '#4CAF50',
        'error': '#f44336',
        'info': '#2196F3',
        'warning': '#ff9800'
    };
    
    alert.style.backgroundColor = colors[type] || colors.info;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Añadir estilos CSS para animaciones y turnos
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .card {
        transition: all 0.3s ease;
    }
    
    .card:hover {
        transform: translateY(-10px) scale(1.05);
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }
    
    .card.selectable {
        animation: pulse 2s infinite;
        border-color: var(--accent-color);
        box-shadow: 0 0 15px rgba(255, 215, 61, 0.5);
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .played-card {
        margin: 10px;
        position: relative;
    }
    
    .played-card .player-label {
        background: var(--primary-color);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        margin: 5px 0;
        text-align: center;
    }
    
    .player-score.current-turn {
        background: rgba(255, 255, 0, 0.57);
        border-left-color: #FFEA00;
        font-weight: bold;
    }
    
    .played-cards {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
        margin: 20px 0;
    }
    
    .played-card {
        background: white;
        border: 2px solid #ddd;
        border-radius: 10px;
        padding: 15px;
        text-align: center;
        min-width: 120px;
        position: relative;
    }
    
    .played-card.winner {
        border-color: #4CAF50;
        background: #f0f8f0;
    }
    
    .winner-badge {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #4CAF50;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    }
    
    .final-standings ol {
        list-style: none;
        padding: 0;
    }
    
    .standing-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        margin: 5px 0;
        background: white;
        border-radius: 8px;
        border: 2px solid #ddd;
    }
    
    .standing-item.winner {
        border-color: #4CAF50;
        background: #f0f8f0;
        font-weight: bold;
    }
    
    .card-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
        font-size: 0.8em;
        margin-top: 10px;
    }
    
    .stat {
        background: #f0f0f0;
        padding: 4px;
        border-radius: 4px;
        text-align: center;
    }
    
    /* Estilos para el modal de selección de atributos */
    .attribute-option {
        transition: all 0.3s ease;
    }
    
    .attribute-option:hover {
        border-color: #ff6b6b !important;
        transform: scale(1.05) !important;
        box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3) !important;
    }
    
    .attribute-option:active {
        transform: scale(0.95) !important;
    }
`;
document.head.appendChild(style);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeGame);