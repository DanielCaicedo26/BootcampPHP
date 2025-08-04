// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================

const API_AUTH = '/BootcampPHP/api/auth.php';
const API_ROOMS = '/BootcampPHP/api/rooms.php';
const API_GAME = '/BootcampPHP/api/game.php';

// Estado global del juego
let gameState = {
    roomId: null,
    playerId: null,
    playerName: null,
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
    gameLoopInterval: null,
    lastUpdateTime: 0
};

// Configuración del juego
const GAME_CONFIG = {
    UPDATE_INTERVAL: 3000, // 3 segundos
    MAX_ROUNDS: 8,
    CARDS_PER_PLAYER: 8,
    ATTRIBUTE_ROULETTE_DURATION: 3000, // 3 segundos
    ALERT_DURATION: 5000 // 5 segundos
};

// ==========================================
// INICIALIZACIÓN DEL JUEGO
// ==========================================

document.addEventListener('DOMContentLoaded', initializeGame);

async function initializeGame() {
    try {
        showLoadingState('Inicializando juego...');
        
        // Obtener parámetros de la URL
        const urlParams = extractUrlParams();
        if (!validateUrlParams(urlParams)) {
            return;
        }
        
        // Configurar estado inicial
        setupInitialGameState(urlParams);
        
        // Recuperar configuración guardada
        loadStoredGameConfig();
        
        // Configurar fondo del mapa
        setupMapBackground();
        
        // Cargar estado del juego desde el servidor
        await fetchGameState();
        
        // Iniciar bucle de actualizaciones
        startGameLoop();
        
        // Mostrar mensaje de bienvenida
        showAlert('¡Juego iniciado! Preparando primera ronda...', 'success');
        
        // Iniciar primera ronda con delay
        setTimeout(startNewRound, 2000);
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Error inicializando juego:', error);
        showError('Error al inicializar el juego: ' + error.message);
        setTimeout(() => redirectToLobby(), 3000);
    }
}

function extractUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        roomId: params.get('roomId'),
        playerId: params.get('playerId')
    };
}

function validateUrlParams(params) {
    if (!params.roomId || !params.playerId) {
        showError('Datos de juego inválidos. Redirigiendo al lobby...');
        setTimeout(redirectToLobby, 2000);
        return false;
    }
    return true;
}

function setupInitialGameState(params) {
    gameState.roomId = parseInt(params.roomId);
    gameState.playerId = parseInt(params.playerId);
}

function loadStoredGameConfig() {
    try {
        const gameConfig = JSON.parse(sessionStorage.getItem('gameConfig'));
        if (gameConfig) {
            gameState.players = gameConfig.players || [];
            gameState.selectedMap = gameConfig.selectedMap;
            gameState.playerName = gameConfig.playerName;
            
            console.log('Configuración cargada:', gameConfig);
        }
    } catch (error) {
        console.warn('Error cargando configuración guardada:', error);
    }
}

function setupMapBackground() {
    if (gameState.selectedMap?.image_url) {
        const body = document.body;
        body.style.backgroundImage = `url('${gameState.selectedMap.image_url}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundAttachment = 'fixed';
        body.style.backgroundRepeat = 'no-repeat';
    }
}

// ==========================================
// GESTIÓN DEL ESTADO DEL JUEGO
// ==========================================

async function fetchGameState() {
    try {
        const response = await fetch(`${API_ROOMS}?action=room_status&room_id=${gameState.roomId}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.room) {
            updateGameStateFromServer(data);
            updateGameUI(data);
        } else {
            throw new Error('No se pudo obtener el estado de la sala');
        }
        
    } catch (error) {
        console.error('Error obteniendo estado del juego:', error);
        handleConnectionError(error);
    }
}

function updateGameStateFromServer(data) {
    gameState.currentRound = data.room.current_round || 1;
    gameState.currentTurn = data.room.current_turn || 1;
    gameState.players = data.players || [];
    gameState.totalPlayers = gameState.players.length;
    gameState.gameFinished = data.room.status === 'finished' || gameState.currentRound > GAME_CONFIG.MAX_ROUNDS;
    
    // Determinar jugador actual del turno
    const currentPlayer = gameState.players.find(p => p.player_order === gameState.currentTurn);
    if (currentPlayer) {
        gameState.currentPlayerId = currentPlayer.id;
        gameState.currentPlayerName = currentPlayer.player_name;
    }
    
    gameState.lastUpdateTime = Date.now();
}

function handleConnectionError(error) {
    if (gameState.lastUpdateTime && (Date.now() - gameState.lastUpdateTime) > 30000) {
        showError('Conexión perdida con el servidor. Reintentando...');
        setTimeout(fetchGameState, 5000);
    }
}

// ==========================================
// GESTIÓN DE RONDAS
// ==========================================

async function startNewRound() {
    if (gameState.gameFinished) {
        showFinalResults();
        return;
    }
    
    try {
        showLoadingState('Iniciando nueva ronda...');
        
        const response = await fetch(`${API_ROOMS}?action=start_round`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_id: gameState.roomId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            gameState.currentAttribute = data.selected_attribute;
            gameState.roundInProgress = true;
            gameState.currentTurn = data.current_turn;
            
            // Actualizar UI
            updateRoundDisplay(data);
            
            // Mostrar animación de selección de atributo
            await showAttributeRouletteAnimation(data.selected_attribute, data.attribute_name);
            
            // Actualizar estado y preparar turno
            await fetchGameState();
            await prepareTurn();
            
        } else {
            throw new Error(data.error || 'Error al iniciar ronda');
        }
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Error iniciando ronda:', error);
        showError('Error al iniciar nueva ronda: ' + error.message);
        hideLoadingState();
    }
}

function updateRoundDisplay(data) {
    const elements = {
        currentRound: document.getElementById('currentRound'),
        selectedAttribute: document.getElementById('selectedAttribute'),
        turnIndicator: document.getElementById('turnIndicator'),
        turnIndicatorText: document.getElementById('turnIndicatorText')
    };
    
    if (elements.currentRound) {
        elements.currentRound.textContent = `Ronda: ${data.round_number}`;
    }
    
    if (elements.selectedAttribute) {
        elements.selectedAttribute.textContent = `${getAttributeIcon(data.selected_attribute)} ${data.attribute_name}`;
    }
    
    // Mostrar indicador de turno
    if (elements.turnIndicator && elements.turnIndicatorText) {
        elements.turnIndicatorText.textContent = `Ronda ${data.round_number} - Atributo: ${data.attribute_name}`;
        elements.turnIndicator.style.display = 'block';
    }
}

// ==========================================
// ANIMACIÓN DE RULETA DE ATRIBUTOS
// ==========================================

function showAttributeRouletteAnimation(selectedAttribute, attributeName) {
    return new Promise((resolve) => {
        const attributes = [
            { key: 'altura_mts', name: 'Altura', icon: '📏' },
            { key: 'fuerza', name: 'Fuerza', icon: '⚡' },
            { key: 'velocidad_percent', name: 'Velocidad', icon: '🏃' },
            { key: 'tecnica', name: 'Técnica', icon: '🧠' },
            { key: 'ki', name: 'Ki', icon: '💫' },
            { key: 'peleas_ganadas', name: 'Peleas Ganadas', icon: '🏆' }
        ];
        
        const modal = createRouletteModal(attributes, selectedAttribute, attributeName, resolve);
        document.body.appendChild(modal);
        
        // Iniciar animación después de un breve delay
        setTimeout(() => startRouletteAnimation(modal, attributes, selectedAttribute), 100);
    });
}

function createRouletteModal(attributes, selectedAttribute, attributeName, resolve) {
    const modal = document.createElement('div');
    modal.className = 'modal roulette-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="roulette-content" style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 700px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <h2 style="color: #333; margin-bottom: 30px; font-size: 2.2em;">
                🎲 Seleccionando Atributo
            </h2>
            <div id="roulette-wheel" style="
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin: 40px 0;
            ">
                ${attributes.map((attr, index) => `
                    <div class="attribute-option" data-attribute="${attr.key}" style="
                        padding: 25px;
                        border: 3px solid #ddd;
                        border-radius: 15px;
                        background: white;
                        transition: all 0.3s ease;
                        cursor: pointer;
                        transform: scale(1);
                    ">
                        <div style="font-size: 3em; margin-bottom: 10px;">${attr.icon}</div>
                        <div style="font-weight: bold; color: #333;">${attr.name}</div>
                    </div>
                `).join('')}
            </div>
            <div id="roulette-result" style="display: none; margin-top: 30px;">
                <h3 style="color: #4CAF50; margin-bottom: 20px;">¡Atributo Seleccionado!</h3>
                <div id="selected-attribute-display" style="font-size: 2.5em; margin: 20px 0;"></div>
                <button id="continue-game-btn" style="
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">¡Continuar Juego!</button>
            </div>
        </div>
    `;
    
    // Event listener para el botón continuar
    modal.querySelector('#continue-game-btn').onclick = () => {
        modal.remove();
        resolve();
    };
    
    return modal;
}

function startRouletteAnimation(modal, attributes, selectedAttribute) {
    const options = modal.querySelectorAll('.attribute-option');
    let currentIndex = 0;
    let iterations = 0;
    const maxIterations = 15;
    const baseSpeed = 200;
    
    const rouletteInterval = setInterval(() => {
        // Resetear estilos
        options.forEach(opt => {
            opt.style.border = '3px solid #ddd';
            opt.style.transform = 'scale(1)';
            opt.style.background = 'white';
            opt.style.boxShadow = 'none';
        });
        
        // Destacar opción actual
        const currentOption = options[currentIndex];
        currentOption.style.border = '3px solid #ff6b6b';
        currentOption.style.transform = 'scale(1.1)';
        currentOption.style.background = 'linear-gradient(135deg, #ffe6e6, #fff0f0)';
        currentOption.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4)';
        
        currentIndex = (currentIndex + 1) % attributes.length;
        iterations++;
        
        // Calcular velocidad (más lento hacia el final)
        const speed = baseSpeed + (iterations * 30);
        
        if (iterations >= maxIterations) {
            clearInterval(rouletteInterval);
            showRouletteResult(modal, selectedAttribute, attributes);
        } else {
            // Cambiar velocidad del interval
            clearInterval(rouletteInterval);
            setTimeout(() => startRouletteAnimation(modal, attributes, selectedAttribute), speed);
            return;
        }
    }, baseSpeed);
}

function showRouletteResult(modal, selectedAttribute, attributes) {
    const selectedAttr = attributes.find(attr => attr.key === selectedAttribute);
    const wheel = modal.querySelector('#roulette-wheel');
    const result = modal.querySelector('#roulette-result');
    const display = modal.querySelector('#selected-attribute-display');
    
    // Destacar atributo seleccionado
    const selectedOption = modal.querySelector(`[data-attribute="${selectedAttribute}"]`);
    if (selectedOption) {
        selectedOption.style.border = '4px solid #4CAF50';
        selectedOption.style.background = 'linear-gradient(135deg, #e8f5e8, #f0f8f0)';
        selectedOption.style.transform = 'scale(1.15)';
        selectedOption.style.boxShadow = '0 12px 35px rgba(76, 175, 80, 0.6)';
    }
    
    // Mostrar resultado
    display.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 15px;">${selectedAttr.icon}</div>
        <div style="font-size: 1.8em; color: #4CAF50; font-weight: bold;">${selectedAttr.name}</div>
    `;
    
    setTimeout(() => {
        wheel.style.opacity = '0.3';
        result.style.display = 'block';
        result.style.animation = 'slideUp 0.5s ease';
    }, 1000);
}

// ==========================================
// GESTIÓN DE TURNOS
// ==========================================

async function prepareTurn() {
    try {
        await fetchCurrentPlayerCards();
        updateTurnDisplay();
        
        // Verificar si es el turno del jugador actual del cliente
        const isMyTurn = gameState.currentPlayerId === gameState.playerId;
        
        if (isMyTurn) {
            showAlert(`¡Es tu turno! Selecciona una carta.`, 'success');
            enableCardSelection();
            highlightPlayerHand(true);
        } else {
            showAlert(`Turno de: ${gameState.currentPlayerName}`, 'info');
            disableCardSelection();
            highlightPlayerHand(false);
        }
        
    } catch (error) {
        console.error('Error preparando turno:', error);
        showError('Error preparando el turno');
    }
}

async function fetchCurrentPlayerCards() {
    try {
        // Obtener cartas del jugador actual de la sesión (no del turno)
        const response = await fetch(`${API_ROOMS}?action=player_cards&room_id=${gameState.roomId}&player_id=${gameState.playerId}`);
        const data = await response.json();
        
        if (data.cards) {
            gameState.playerCards = data.cards;
            renderPlayerCards();
        }
    } catch (error) {
        console.error('Error obteniendo cartas del jugador:', error);
    }
}

function updateTurnDisplay() {
    const elements = {
        currentTurn: document.getElementById('currentTurn'),
        currentPlayerDisplay: document.getElementById('currentPlayerDisplay'),
        turnInstructions: document.getElementById('turnInstructions'),
        roundStatus: document.getElementById('roundStatus')
    };
    
    if (elements.currentTurn) {
        elements.currentTurn.textContent = `Turno de: ${gameState.currentPlayerName}`;
    }
    
    if (elements.currentPlayerDisplay) {
        elements.currentPlayerDisplay.textContent = gameState.currentPlayerName;
    }
    
    if (elements.turnInstructions) {
        const isMyTurn = gameState.currentPlayerId === gameState.playerId;
        elements.turnInstructions.textContent = isMyTurn 
            ? '¡Es tu turno! Selecciona una carta para jugar'
            : `Esperando a que ${gameState.currentPlayerName} juegue su carta...`;
    }
    
    if (elements.roundStatus) {
        elements.roundStatus.innerHTML = `
            <p><strong>Ronda:</strong> ${gameState.currentRound} de ${GAME_CONFIG.MAX_ROUNDS}</p>
            <p><strong>Turno actual:</strong> ${gameState.currentPlayerName}</p>
            <p><strong>Atributo:</strong> ${getAttributeName(gameState.currentAttribute)}</p>
            <p><strong>Jugadores restantes esta ronda:</strong> ${getPlayersLeftInRound()}</p>
        `;
    }
}

function getPlayersLeftInRound() {
    const playersPlayed = gameState.totalPlayers - gameState.currentTurn + 1;
    return `${Math.max(0, gameState.totalPlayers - playersPlayed + 1)} de ${gameState.totalPlayers}`;
}

function highlightPlayerHand(highlight) {
    const handContainer = document.getElementById('playerHandContainer');
    if (handContainer) {
        if (highlight) {
            handContainer.classList.add('current-turn');
        } else {
            handContainer.classList.remove('current-turn');
        }
    }
}

// ==========================================
// GESTIÓN DE CARTAS
// ==========================================

function renderPlayerCards() {
    const cardsContainer = document.getElementById('playerCards');
    
    if (!cardsContainer) {
        console.warn('Contenedor de cartas no encontrado');
        return;
    }
    
    if (!gameState.playerCards || gameState.playerCards.length === 0) {
        cardsContainer.innerHTML = `
            <div style="text-align: center; color: #666; padding: 40px;">
                <div style="font-size: 3em; margin-bottom: 15px;">🃏</div>
                <p>No hay cartas disponibles</p>
            </div>
        `;
        return;
    }
    
    cardsContainer.innerHTML = gameState.playerCards.map(card => createCardHTML(card)).join('');
    
    // Actualizar contador de cartas
    updateCardsCounter();
}

function createCardHTML(card) {
    const attributeValue = gameState.currentAttribute ? card[gameState.currentAttribute] : 0;
    const attributeIcon = getAttributeIcon(gameState.currentAttribute);
    
    return `
        <div class="card" data-card-id="${card.id}" data-attribute-value="${attributeValue}">
            <div class="card-image">
                <img src="${card.image_url || '/placeholder-card.jpg'}" alt="${card.name}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="card-placeholder" style="display: none;">🃏</div>
            </div>
            <div class="card-content">
                <h4 class="card-name">${card.name}</h4>
                ${gameState.currentAttribute ? `
                    <div class="current-attribute-highlight">
                        <strong>${attributeIcon} ${getAttributeName(gameState.currentAttribute)}: ${attributeValue}</strong>
                    </div>
                ` : ''}
                <div class="card-stats">
                    <div class="stat ${gameState.currentAttribute === 'altura_mts' ? 'highlight' : ''}">
                        📏 ${card.altura_mts}m
                    </div>
                    <div class="stat ${gameState.currentAttribute === 'fuerza' ? 'highlight' : ''}">
                        ⚡ ${card.fuerza}
                    </div>
                    <div class="stat ${gameState.currentAttribute === 'velocidad_percent' ? 'highlight' : ''}">
                        🏃 ${card.velocidad_percent}%
                    </div>
                    <div class="stat ${gameState.currentAttribute === 'tecnica' ? 'highlight' : ''}">
                        🧠 ${card.tecnica}
                    </div>
                    <div class="stat ${gameState.currentAttribute === 'ki' ? 'highlight' : ''}">
                        💫 ${card.ki}
                    </div>
                    <div class="stat ${gameState.currentAttribute === 'peleas_ganadas' ? 'highlight' : ''}">
                        🏆 ${card.peleas_ganadas}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateCardsCounter() {
    const cardsLeftElement = document.getElementById('cardsLeft');
    if (cardsLeftElement) {
        cardsLeftElement.textContent = `Cartas restantes: ${gameState.playerCards.length}`;
    }
}

function enableCardSelection() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('selectable');
        card.style.cursor = 'pointer';
        card.onclick = function() {
            const cardId = this.dataset.cardId;
            const attributeValue = this.dataset.attributeValue;
            playCard(cardId, attributeValue);
        };
    });
}

function disableCardSelection() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.remove('selectable');
        card.style.cursor = 'not-allowed';
        card.onclick = null;
    });
}

// ==========================================
// JUGAR CARTA
// ==========================================

async function playCard(cardId, attributeValue) {
    if (!gameState.roundInProgress) {
        showAlert('No hay ronda activa', 'error');
        return;
    }
    
    // Verificar que es el turno del jugador
    if (gameState.currentPlayerId !== gameState.playerId) {
        showAlert('No es tu turno', 'error');
        return;
    }
    
    try {
        // Deshabilitar cartas inmediatamente
        disableCardSelection();
        showLoadingState('Jugando carta...');
        
        const response = await fetch(`${API_ROOMS}?action=play_card`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_id: gameState.roomId,
                player_id: gameState.playerId,
                card_id: parseInt(cardId)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Remover carta de la mano
            gameState.playerCards = gameState.playerCards.filter(card => card.id != cardId);
            renderPlayerCards();
            
            // Mostrar carta en área de juego
            addCardToPlayArea(cardId, data.attribute_value, gameState.playerName);
            
            showAlert(`¡Carta jugada! Valor: ${data.attribute_value}`, 'success');
            
            // Manejar resultado
            if (data.round_complete && data.round_result) {
                setTimeout(() => showRoundResult(data.round_result), 2000);
            } else {
                // Actualizar estado para siguiente turno
                setTimeout(async () => {
                    await fetchGameState();
                    await prepareTurn();
                }, 1500);
            }
            
        } else {
            throw new Error(data.error || 'Error al jugar carta');
        }
        
    } catch (error) {
        console.error('Error jugando carta:', error);
        showError('Error al jugar la carta: ' + error.message);
        enableCardSelection(); // Rehabilitar cartas en caso de error
    } finally {
        hideLoadingState();
    }
}

function addCardToPlayArea(cardId, attributeValue, playerName) {
    const playArea = document.getElementById('cardsInPlay');
    if (!playArea) return;
    
    // Limpiar mensaje inicial si existe
    const emptyMessage = playArea.querySelector('p');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    const card = gameState.playerCards.find(c => c.id == cardId);
    if (!card) return;
    
    const cardElement = document.createElement('div');
    cardElement.className = 'played-card';
    cardElement.innerHTML = `
        <div class="card-image">
            <img src="${card.image_url || '/placeholder-card.jpg'}" alt="${card.name}" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="card-placeholder" style="display: none;">🃏</div>
        </div>
        <div class="card-content">
            <h4>${card.name}</h4>
            <div class="player-label">${playerName}</div>
            <div class="attribute-value">
                ${getAttributeIcon(gameState.currentAttribute)} ${attributeValue}
            </div>
        </div>
    `;
    
    playArea.appendChild(cardElement);
    
    // Animación de entrada
    cardElement.style.transform = 'scale(0) rotate(180deg)';
    cardElement.style.opacity = '0';
    setTimeout(() => {
        cardElement.style.transition = 'all 0.5s ease';
        cardElement.style.transform = 'scale(1) rotate(0deg)';
        cardElement.style.opacity = '1';
    }, 100);
}

// ==========================================
// RESULTADOS DE RONDA
// ==========================================

function showRoundResult(roundResult) {
    gameState.roundInProgress = false;
    
    const modal = createRoundResultModal(roundResult);
    document.body.appendChild(modal);
    
    // Cargar comparación de cartas
    setTimeout(() => loadRoundComparison(modal), 500);
}

function createRoundResultModal(roundResult) {
    const modal = document.createElement('div');
    modal.className = 'modal round-result-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
            <h2 style="color: #333; margin-bottom: 30px;">
                🏆 Resultado de la Ronda ${gameState.currentRound}
            </h2>
            <div class="round-results">
                <div class="attribute-info" style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                ">
                    <h3 style="color: #666; margin-bottom: 10px;">
                        ${getAttributeIcon(gameState.currentAttribute)} Atributo: ${getAttributeName(gameState.currentAttribute)}
                    </h3>
                </div>
                <div class="winner-announcement" style="
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border-radius: 15px;
                    padding: 30px;
                    margin: 30px 0;
                    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
                ">
                    <h3 style="margin: 0 0 15px 0; font-size: 2em;">
                        🥇 ¡Ganador: ${roundResult.player_name}!
                    </h3>
                    <p style="margin: 10px 0; font-size: 1.2em;">
                        Carta: <strong>${roundResult.card_name}</strong>
                    </p>
                    <p style="margin: 10px 0; font-size: 1.4em;">
                        Valor: <strong>${roundResult.attribute_value}</strong>
                    </p>
                </div>
                <div class="cards-comparison" id="cardsComparison">
                    <div style="text-align: center; color: #666; padding: 20px;">
                        <div class="spinner" style="
                            width: 30px;
                            height: 30px;
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid #667eea;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 10px;
                        "></div>
                        Cargando comparación...
                    </div>
                </div>
            </div>
            <button onclick="nextRound()" style="
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 1.2em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 30px;
            ">Siguiente Ronda</button>
        </div>
    `;
    
    // Función global para siguiente ronda
    window.nextRound = function() {
        modal.remove();
        proceedToNextRound();
    };
    
    return modal;
}

async function loadRoundComparison(modal) {
    try {
        const response = await fetch(`${API_ROOMS}?action=round_result&room_id=${gameState.roomId}&round=${gameState.currentRound}`);
        const data = await response.json();
        
        const comparisonDiv = modal.querySelector('#cardsComparison');
        
        if (data.cards_played && data.cards_played.length > 0) {
            comparisonDiv.innerHTML = `
                <h4 style="color: #333; margin-bottom: 25px; font-size: 1.4em;">
                    📊 Comparación de Cartas
                </h4>
                <div class="played-cards-grid" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 25px 0;
                ">
                    ${data.cards_played.map((card, index) => `
                        <div class="comparison-card ${index === 0 ? 'winner' : ''}" style="
                            background: ${index === 0 ? 'linear-gradient(135deg, #e8f5e8, #f0f8f0)' : 'white'};
                            border: 3px solid ${index === 0 ? '#4CAF50' : '#ddd'};
                            border-radius: 15px;
                            padding: 20px;
                            text-align: center;
                            position: relative;
                            transform: ${index === 0 ? 'scale(1.05)' : 'scale(1)'};
                            box-shadow: ${index === 0 ? '0 8px 25px rgba(76, 175, 80, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)'};
                            transition: all 0.3s ease;
                        ">
                            ${index === 0 ? `
                                <div style="
                                    position: absolute;
                                    top: -15px;
                                    right: -15px;
                                    background: #4CAF50;
                                    color: white;
                                    border-radius: 50%;
                                    width: 40px;
                                    height: 40px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 20px;
                                    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
                                    animation: bounce 0.6s ease;
                                ">🥇</div>
                            ` : ''}
                            <div style="
                                font-weight: bold;
                                color: ${index === 0 ? '#2e7d32' : '#333'};
                                margin-bottom: 10px;
                                padding: 8px 12px;
                                background: ${index === 0 ? 'rgba(76, 175, 80, 0.2)' : '#f0f0f0'};
                                border-radius: 8px;
                                font-size: 1.1em;
                            ">${card.player_name}</div>
                            <div style="
                                font-size: 0.95em;
                                color: #666;
                                margin-bottom: 15px;
                                font-style: italic;
                            ">${card.card_name}</div>
                            <div style="
                                font-size: 1.8em;
                                font-weight: bold;
                                color: ${index === 0 ? '#2e7d32' : '#ff6b6b'};
                                padding: 15px;
                                background: ${index === 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 107, 107, 0.1)'};
                                border-radius: 10px;
                                border: 2px solid ${index === 0 ? '#4CAF50' : '#ff6b6b'};
                            ">
                                ${getAttributeIcon(gameState.currentAttribute)} ${card.attribute_value}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            comparisonDiv.innerHTML = `
                <div style="text-align: center; color: #666; padding: 40px;">
                    <div style="font-size: 3em; margin-bottom: 15px;">❌</div>
                    <p>No se pudieron cargar los datos de la comparación</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando comparación:', error);
        const comparisonDiv = modal.querySelector('#cardsComparison');
        comparisonDiv.innerHTML = `
            <div style="text-align: center; color: #ff6b6b; padding: 40px;">
                <div style="font-size: 3em; margin-bottom: 15px;">⚠️</div>
                <p>Error al cargar la comparación de cartas</p>
            </div>
        `;
    }
}

function proceedToNextRound() {
    gameState.currentRound++;
    
    // Limpiar área de juego
    const playArea = document.getElementById('cardsInPlay');
    if (playArea) {
        playArea.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Las cartas jugadas aparecerán aquí</p>';
    }
    
    // Verificar si el juego terminó
    if (gameState.currentRound > GAME_CONFIG.MAX_ROUNDS) {
        gameState.gameFinished = true;
        setTimeout(showFinalResults, 1000);
    } else {
        // Actualizar estado y continuar
        setTimeout(async () => {
            await fetchGameState();
            setTimeout(startNewRound, 1000);
        }, 500);
    }
}

// ==========================================
// RESULTADOS FINALES
// ==========================================

async function showFinalResults() {
    try {
        showLoadingState('Calculando resultados finales...');
        
        const response = await fetch(`${API_ROOMS}?action=final_results&room_id=${gameState.roomId}`);
        const data = await response.json();
        
        const modal = createFinalResultsModal(data);
        document.body.appendChild(modal);
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Error cargando resultados finales:', error);
        showError('Error al cargar resultados finales');
        hideLoadingState();
        
        // Mostrar modal básico de fin de juego
        const basicModal = createBasicEndGameModal();
        document.body.appendChild(basicModal);
    }
}

function createFinalResultsModal(data) {
    const modal = document.createElement('div');
    modal.className = 'modal final-results-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.5s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 25px;
            padding: 50px;
            max-width: 700px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            text-align: center;
            box-shadow: 0 25px 70px rgba(0,0,0,0.4);
            position: relative;
        ">
            <div style="
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 4em;
                background: linear-gradient(135deg, #FFD700, #FFA500);
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
            ">🏆</div>
            
            <h2 style="margin: 30px 0 40px 0; font-size: 2.5em; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                ¡Fin del Juego!
            </h2>
            
            <div class="champion-section" style="
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 30px;
                margin: 30px 0;
                backdrop-filter: blur(10px);
            ">
                <h3 style="margin: 0 0 20px 0; font-size: 2em;">
                    🥇 ¡Campeón: ${data.winner?.player_name || 'Desconocido'}!
                </h3>
                <p style="font-size: 1.3em; margin: 0;">
                    Puntuación Final: <strong>${data.winner?.score || 0} puntos</strong>
                </p>
            </div>
            
            <div class="final-standings" style="
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 30px;
                margin: 30px 0;
                backdrop-filter: blur(10px);
            ">
                <h4 style="margin: 0 0 25px 0; font-size: 1.5em;">📊 Clasificación Final</h4>
                <div class="standings-list">
                    ${(data.final_standings || []).map((player, index) => `
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 15px 20px;
                            margin: 10px 0;
                            background: ${index === 0 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.1)'};
                            border-radius: 15px;
                            border: 2px solid ${index === 0 ? '#FFD700' : 'rgba(255,255,255,0.2)'};
                            font-size: 1.1em;
                            transition: all 0.3s ease;
                        ">
                            <span style="display: flex; align-items: center; gap: 15px;">
                                <span style="
                                    font-size: 1.5em;
                                    min-width: 40px;
                                    height: 40px;
                                    background: ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#666'};
                                    color: ${index < 3 ? 'white' : '#fff'};
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-weight: bold;
                                ">${index + 1}</span>
                                <span style="font-weight: ${index === 0 ? 'bold' : 'normal'};">
                                    ${player.player_name}
                                </span>
                            </span>
                            <span style="
                                font-size: 1.2em;
                                font-weight: bold;
                                color: ${index === 0 ? '#FFD700' : '#fff'};
                            ">${player.score} pts</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="game-stats" style="
                background: rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 25px;
                margin: 30px 0;
                backdrop-filter: blur(10px);
            ">
                <h4 style="margin: 0 0 20px 0; font-size: 1.3em;">📈 Estadísticas del Juego</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 2em; margin-bottom: 5px;">🎮</div>
                        <div style="font-size: 1.5em; font-weight: bold;">${GAME_CONFIG.MAX_ROUNDS}</div>
                        <div style="font-size: 0.9em; opacity: 0.8;">Rondas Jugadas</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; margin-bottom: 5px;">👥</div>
                        <div style="font-size: 1.5em; font-weight: bold;">${gameState.totalPlayers}</div>
                        <div style="font-size: 0.9em; opacity: 0.8;">Jugadores</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2em; margin-bottom: 5px;">🃏</div>
                        <div style="font-size: 1.5em; font-weight: bold;">${gameState.totalPlayers * GAME_CONFIG.CARDS_PER_PLAYER}</div>
                        <div style="font-size: 0.9em; opacity: 0.8;">Cartas Jugadas</div>
                    </div>
                </div>
            </div>
            
            <div class="final-actions" style="margin-top: 40px;">
                <button onclick="returnToLobby()" style="
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    border-radius: 12px;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
                ">🏠 Volver al Lobby</button>
            </div>
        </div>
    `;
    
    // Función global para volver al lobby
    window.returnToLobby = function() {
        cleanupGame();
        redirectToLobby();
    };
    
    return modal;
}

function createBasicEndGameModal() {
    const modal = document.createElement('div');
    modal.className = 'modal basic-end-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 500px;
            width: 90%;
        ">
            <h2 style="color: #333; margin-bottom: 30px;">🎉 ¡Juego Terminado!</h2>
            <p style="color: #666; margin-bottom: 30px; font-size: 1.1em;">
                El juego ha finalizado después de ${GAME_CONFIG.MAX_ROUNDS} rondas emocionantes.
            </p>
            <button onclick="returnToLobby()" style="
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 10px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
            ">Volver al Lobby</button>
        </div>
    `;
    
    return modal;
}

// ==========================================
// GESTIÓN DE UI Y ALERTAS
// ==========================================

function updateGameUI(data) {
    updateRoundInfo(data);
    updateScoreboard(data.players);
    updateTurnIndicator();
    
    // Verificar si el juego terminó
    if (data.room.status === 'finished' || data.room.current_round > GAME_CONFIG.MAX_ROUNDS) {
        gameState.gameFinished = true;
        if (!document.querySelector('.final-results-modal')) {
            setTimeout(showFinalResults, 1000);
        }
    }
}

function updateRoundInfo(data) {
    const elements = {
        currentRound: document.getElementById('currentRound'),
        cardsLeft: document.getElementById('cardsLeft')
    };
    
    if (elements.currentRound) {
        elements.currentRound.textContent = `Ronda: ${data.room.current_round} de ${GAME_CONFIG.MAX_ROUNDS}`;
    }
    
    if (elements.cardsLeft) {
        const remainingCards = GAME_CONFIG.CARDS_PER_PLAYER - (data.room.current_round - 1);
        elements.cardsLeft.textContent = `Cartas restantes: ${Math.max(0, remainingCards)}`;
    }
}

function updateScoreboard(players) {
    const scoreboard = document.getElementById('playerScores');
    if (!scoreboard || !players) return;
    
    // Ordenar jugadores por puntuación
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    scoreboard.innerHTML = sortedPlayers.map((player, index) => `
        <div class="player-score ${player.id === gameState.currentPlayerId ? 'current-turn' : ''}" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            margin: 8px 0;
            background: ${player.id === gameState.currentPlayerId ? 'rgba(255, 215, 61, 0.2)' : 'rgba(255,255,255,0.9)'};
            border-radius: 10px;
            border-left: 4px solid ${index === 0 ? '#FFD700' : player.id === gameState.currentPlayerId ? '#ff6b6b' : '#ddd'};
            transition: all 0.3s ease;
            box-shadow: ${player.id === gameState.currentPlayerId ? '0 4px 15px rgba(255, 215, 0, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'};
        ">
            <span class="player-info" style="display: flex; align-items: center; gap: 10px;">
                <span style="
                    font-size: 1.2em;
                    min-width: 25px;
                    text-align: center;
                ">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}</span>
                <span class="player-name" style="
                    font-weight: ${index === 0 ? 'bold' : '600'};
                    color: ${index === 0 ? '#ff6b6b' : '#333'};
                ">${player.player_name}${player.id === gameState.currentPlayerId ? ' 👈' : ''}</span>
            </span>
            <span class="score" style="
                font-weight: bold;
                color: ${index === 0 ? '#ff6b6b' : '#666'};
                font-size: 1.1em;
            ">${player.score} pts</span>
        </div>
    `).join('');
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turnIndicator');
    const indicatorText = document.getElementById('turnIndicatorText');
    
    if (indicator && indicatorText && gameState.currentPlayerName) {
        const isMyTurn = gameState.currentPlayerId === gameState.playerId;
        
        indicator.style.display = 'block';
        indicatorText.textContent = isMyTurn 
            ? `¡Es tu turno! - Ronda ${gameState.currentRound}`
            : `Turno de: ${gameState.currentPlayerName} - Ronda ${gameState.currentRound}`;
        
        indicator.className = `current-turn-indicator ${isMyTurn ? 'my-turn' : 'other-turn'}`;
    }
}

function showLoadingState(message = 'Cargando...') {
    let loadingOverlay = document.getElementById('loadingOverlay');
    
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1500;
            color: white;
            font-size: 1.2em;
        `;
        document.body.appendChild(loadingOverlay);
    }
    
    loadingOverlay.innerHTML = `
        <div style="
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            backdrop-filter: blur(10px);
        ">
            <div style="
                width: 50px;
                height: 50px;
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid #fff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            "></div>
            <p style="margin: 0; font-weight: 600;">${message}</p>
        </div>
    `;
    
    loadingOverlay.style.display = 'flex';
}

function hideLoadingState() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showAlert(message, type = 'info') {
    // Remover alertas existentes
    const existingAlerts = document.querySelectorAll('.game-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `game-alert alert-${type}`;
    
    const colors = {
        'success': '#4CAF50',
        'error': '#f44336',
        'info': '#2196F3',
        'warning': '#ff9800'
    };
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️',
        'warning': '⚠️'
    };
    
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        max-width: 350px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
        background: ${colors[type] || colors.info};
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    alert.innerHTML = `
        <span style="font-size: 1.2em;">${icons[type] || icons.info}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remover después del tiempo configurado
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }
    }, GAME_CONFIG.ALERT_DURATION);
}

function showError(message) {
    showAlert(message, 'error');
}

// ==========================================
// BUCLE PRINCIPAL DEL JUEGO
// ==========================================

function startGameLoop() {
    // Limpiar bucle existente si existe
    if (gameState.gameLoopInterval) {
        clearInterval(gameState.gameLoopInterval);
    }
    
    // Iniciar nuevo bucle de actualizaciones
    gameState.gameLoopInterval = setInterval(async () => {
        if (!gameState.gameFinished && !document.querySelector('.roulette-modal')) {
            try {
                await fetchGameState();
            } catch (error) {
                console.warn('Error en bucle de juego:', error);
            }
        }
    }, GAME_CONFIG.UPDATE_INTERVAL);
}

function stopGameLoop() {
    if (gameState.gameLoopInterval) {
        clearInterval(gameState.gameLoopInterval);
        gameState.gameLoopInterval = null;
    }
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

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

function cleanupGame() {
    stopGameLoop();
    sessionStorage.removeItem('gameConfig');
    
    // Limpiar modales
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
    
    // Limpiar alertas
    const alerts = document.querySelectorAll('.game-alert');
    alerts.forEach(alert => alert.remove());
    
    // Limpiar overlay de carga
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

function redirectToLobby() {
    cleanupGame();
    window.location.href = 'lobby.html';
}

// ==========================================
// ESTILOS CSS DINÁMICOS
// ==========================================

function addGameStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .card {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .card:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .card.selectable {
            animation: pulse 2s infinite;
            border: 3px solid #ff6b6b;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
            cursor: pointer;
        }
        
        .card.selectable:hover {
            transform: translateY(-10px) scale(1.08);
            box-shadow: 0 15px 35px rgba(255, 107, 107, 0.7);
        }
        
        .card-stats .stat {
            transition: all 0.3s ease;
        }
        
        .card-stats .stat.highlight {
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            color: white;
            font-weight: bold;
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        
        .current-attribute-highlight {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            font-size: 1.1em;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }
        
        .played-card {
            transition: all 0.5s ease;
            margin: 10px;
            position: relative;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .played-card .player-label {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.9em;
            font-weight: 600;
            margin: 8px 0;
            text-align: center;
        }
        
        .played-card .attribute-value {
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            color: white;
            padding: 12px;
            border-radius: 10px;
            font-weight: bold;
            font-size: 1.3em;
            margin-top: 10px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
        
        .player-score.current-turn {
            background: rgba(255, 107, 107, 0.1) !important;
            border-left-color: #ff6b6b !important;
            border-left-width: 5px !important;
            transform: scale(1.02);
            font-weight: bold;
        }
        
        .current-turn-indicator {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 25px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 25px;
            box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        .current-turn-indicator.my-turn {
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }
        
        @keyframes glow {
            from { box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3); }
            to { box-shadow: 0 12px 35px rgba(76, 175, 80, 0.6); }
        }
        
        .player-hand.current-turn {
            border: 3px solid #ff6b6b;
            box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
            background: rgba(255, 107, 107, 0.05);
        }
        
        .player-hand.current-turn::before {
            content: "¡Tu turno! Selecciona una carta";
            position: absolute;
            top: -15px;
            left: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
            animation: pulse 2s infinite;
        }
        
        .comparison-card {
            transition: all 0.3s ease;
        }
        
        .comparison-card:hover {
            transform: translateY(-5px) scale(1.02);
        }
        
        .modal {
            backdrop-filter: blur(5px);
        }
        
        .roulette-content {
            animation: slideUp 0.5s ease;
        }
        
        .attribute-option:hover {
            transform: scale(1.05);
            border-color: #ff6b6b !important;
            background: #ffe6e6 !important;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .current-turn-indicator {
                padding: 12px 20px;
                font-size: 0.9em;
            }
            
            .game-alert {
                right: 10px;
                left: 10px;
                max-width: none;
            }
            
            .roulette-content {
                padding: 30px 20px;
            }
            
            #roulette-wheel {
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 15px;
            }
            
            .attribute-option {
                padding: 20px 15px;
            }
            
            .played-cards-grid {
                grid-template-columns: 1fr !important;
                gap: 15px;
            }
            
            .modal-content {
                padding: 30px 20px !important;
                margin: 20px;
            }
            
            .standings-list > div {
                font-size: 1em !important;
                padding: 12px 15px !important;
            }
        }
        
        @media (max-width: 480px) {
            .card {
                margin: 5px 0;
            }
            
            .current-turn-indicator {
                padding: 10px 15px;
                font-size: 0.85em;
            }
            
            .player-hand.current-turn::before {
                font-size: 0.8em;
                padding: 6px 15px;
            }
            
            .attribute-option {
                padding: 15px 10px;
            }
            
            .attribute-option > div:first-child {
                font-size: 2.5em !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Prevenir que el usuario salga accidentalmente
window.addEventListener('beforeunload', function(e) {
    if (gameState.roundInProgress && !gameState.gameFinished) {
        e.preventDefault();
        e.returnValue = '';
        return '¿Estás seguro de que quieres salir? El juego está en progreso.';
    }
});

// Manejar errores de ventana
window.addEventListener('error', function(e) {
    console.error('Error de JavaScript:', e.error);
    showError('Se produjo un error inesperado. El juego intentará continuar.');
});

// Manejar pérdida de conexión
window.addEventListener('offline', function() {
    showAlert('Conexión perdida. Reintentando...', 'warning');
});

window.addEventListener('online', function() {
    showAlert('Conexión restaurada', 'success');
    if (!gameState.gameFinished) {
        fetchGameState();
    }
});

// Atajos de teclado
document.addEventListener('keydown', function(e) {
    // ESC para cerrar modales
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.remove();
            }
        });
    }
    
    // F5 para actualizar estado del juego
    if (e.key === 'F5' && !gameState.gameFinished) {
        e.preventDefault();
        showAlert('Actualizando estado del juego...', 'info');
        fetchGameState();
    }
    
    // Números 1-8 para seleccionar cartas rápidamente (solo si es el turno del jugador)
    if (gameState.currentPlayerId === gameState.playerId && !gameState.gameFinished) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 8) {
            const cards = document.querySelectorAll('.card.selectable');
            if (cards[num - 1]) {
                cards[num - 1].click();
            }
        }
    }
});

// ==========================================
// INICIALIZACIÓN DE ESTILOS Y CLEANUP
// ==========================================

// Añadir estilos cuando se carga el script
addGameStyles();

// Limpiar al cerrar la ventana
window.addEventListener('unload', cleanupGame);

// Exponer funciones globales necesarias para HTML
window.startNewRound = startNewRound;
window.returnToLobby = () => {
    cleanupGame();
    redirectToLobby();
};

// Debug helpers (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.gameState = gameState;
    window.debugGame = {
        fetchGameState,
        showAlert,
        showError,
        cleanupGame,
        startGameLoop,
        stopGameLoop
    };
    
    console.log('🎮 Dragon Game Debug Mode Enabled');
    console.log('Accede a window.gameState para ver el estado del juego');
    console.log('Accede a window.debugGame para funciones de debug');
}