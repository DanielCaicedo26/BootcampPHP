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
            
            // Actualizar UI inmediatamente
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
        currentAttribute: document.getElementById('currentAttribute'),
        attributeIconBig: document.getElementById('attributeIconBig'),
        attributeNameBig: document.getElementById('attributeNameBig'),
        roundCounter: document.getElementById('roundCounter')
    };
    
    if (elements.currentRound) {
        elements.currentRound.textContent = `Ronda: ${data.round_number}/8`;
    }
    
    if (elements.currentAttribute) {
        elements.currentAttribute.textContent = `${getAttributeIcon(data.selected_attribute)} ${data.attribute_name}`;
    }
    
    if (elements.attributeIconBig) {
        elements.attributeIconBig.textContent = getAttributeIcon(data.selected_attribute);
    }
    
    if (elements.attributeNameBig) {
        elements.attributeNameBig.textContent = data.attribute_name;
    }
    
    if (elements.roundCounter) {
        elements.roundCounter.textContent = `Ronda ${data.round_number} de 8`;
    }
}

// ==========================================
// ANIMACIÓN DE RULETA DE ATRIBUTOS - CORREGIDA
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
        setTimeout(() => startRouletteAnimation(modal, attributes, selectedAttribute, resolve), 300);
    });
}

function createRouletteModal(attributes, selectedAttribute, attributeName, resolve) {
    const modal = document.createElement('div');
    modal.className = 'pokemon-modal roulette-modal active';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-container" style="max-width: 800px;">
            <div class="modal-header">
                <h2 class="modal-title">🎲 Seleccionando Atributo</h2>
            </div>
            <div class="modal-body">
                <div id="roulette-wheel" style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin: 30px 0;
                ">
                    ${attributes.map(attr => `
                        <div class="attribute-option" data-attribute="${attr.key}" style="
                            padding: 25px;
                            border: 3px solid var(--pokemon-blue);
                            border-radius: 15px;
                            background: white;
                            text-align: center;
                            transition: all 0.3s ease;
                            cursor: pointer;
                        ">
                            <div style="font-size: 3em; margin-bottom: 10px;">${attr.icon}</div>
                            <div style="font-weight: bold; color: var(--pokemon-blue);">${attr.name}</div>
                        </div>
                    `).join('')}
                </div>
                <div id="roulette-result" style="display: none; text-align: center; margin-top: 30px;">
                    <h3 style="color: var(--pokemon-green); margin-bottom: 20px;">¡Atributo Seleccionado!</h3>
                    <div id="selected-attribute-display" style="font-size: 2.5em; margin: 20px 0;"></div>
                </div>
            </div>
            <div class="modal-actions" id="modal-actions" style="display: none;">
                <button class="pokemon-btn primary" id="continue-game-btn">
                    <span>¡Continuar Juego!</span>
                    <span>🎮</span>
                </button>
            </div>
        </div>
    `;
    
    return modal;
}

function startRouletteAnimation(modal, attributes, selectedAttribute, resolve) {
    const options = modal.querySelectorAll('.attribute-option');
    const wheel = modal.querySelector('#roulette-wheel');
    const result = modal.querySelector('#roulette-result');
    const actions = modal.querySelector('#modal-actions');
    const continueBtn = modal.querySelector('#continue-game-btn');
    
    let currentIndex = 0;
    let iterations = 0;
    const maxIterations = 20; // Más iteraciones para mejor efecto
    let animationSpeed = 150; // Velocidad inicial
    
    console.log('Iniciando animación de ruleta, atributo objetivo:', selectedAttribute);
    
    function animateStep() {
        // Resetear todos los estilos
        options.forEach(option => {
            option.style.border = '3px solid var(--pokemon-blue)';
            option.style.background = 'white';
            option.style.transform = 'scale(1)';
            option.style.boxShadow = 'none';
        });
        
        // Destacar opción actual
        const currentOption = options[currentIndex];
        if (currentOption) {
            currentOption.style.border = '3px solid var(--pokemon-yellow)';
            currentOption.style.background = 'linear-gradient(135deg, rgba(255, 204, 0, 0.1), rgba(255, 204, 0, 0.2))';
            currentOption.style.transform = 'scale(1.1)';
            currentOption.style.boxShadow = '0 8px 25px rgba(255, 204, 0, 0.4)';
        }
        
        // Avanzar al siguiente índice
        currentIndex = (currentIndex + 1) % attributes.length;
        iterations++;
        
        // Incrementar velocidad gradualmente (hacer más lento)
        animationSpeed += 20;
        
        if (iterations >= maxIterations) {
            // Terminar animación y mostrar resultado
            showRouletteResult(modal, selectedAttribute, attributes, resolve);
        } else {
            // Continuar animación
            setTimeout(animateStep, animationSpeed);
        }
    }
    
    // Iniciar animación
    animateStep();
}

function showRouletteResult(modal, selectedAttribute, attributes, resolve) {
    const selectedAttr = attributes.find(attr => attr.key === selectedAttribute);
    const wheel = modal.querySelector('#roulette-wheel');
    const result = modal.querySelector('#roulette-result');
    const actions = modal.querySelector('#modal-actions');
    const display = modal.querySelector('#selected-attribute-display');
    const continueBtn = modal.querySelector('#continue-game-btn');
    
    console.log('Mostrando resultado:', selectedAttr);
    
    if (!selectedAttr) {
        console.error('Atributo seleccionado no encontrado:', selectedAttribute);
        resolve();
        modal.remove();
        return;
    }
    
    // Destacar la opción ganadora
    const selectedOption = modal.querySelector(`[data-attribute="${selectedAttribute}"]`);
    if (selectedOption) {
        selectedOption.style.border = '4px solid var(--pokemon-green)';
        selectedOption.style.background = 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.3))';
        selectedOption.style.transform = 'scale(1.2)';
        selectedOption.style.boxShadow = '0 12px 35px rgba(76, 175, 80, 0.6)';
    }
    
    // Mostrar el resultado
    display.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 15px;">${selectedAttr.icon}</div>
        <div style="font-size: 1.8em; color: var(--pokemon-green); font-weight: bold;">${selectedAttr.name}</div>
    `;
    
    // Configurar el botón para continuar
    continueBtn.onclick = () => {
        modal.remove();
        resolve();
    };
    
    // Mostrar resultado con una transición suave
    setTimeout(() => {
        wheel.style.opacity = '0.3';
        wheel.style.filter = 'blur(2px)';
        result.style.display = 'block';
        actions.style.display = 'flex';
        
        // Animación de entrada
        result.style.opacity = '0';
        result.style.transform = 'translateY(20px)';
        setTimeout(() => {
            result.style.transition = 'all 0.5s ease';
            result.style.opacity = '1';
            result.style.transform = 'translateY(0)';
        }, 100);
    }, 1500);
}

// ==========================================
// GESTIÓN DE TURNOS
// ==========================================

async function prepareTurn() {
    try {
        await fetchCurrentPlayerCards();
        updateTurnDisplay();
        updatePokemonUI();
        
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

function updatePokemonUI() {
    // Actualizar elementos específicos del diseño Pokémon
    const elements = {
        currentAttributeDisplay: document.getElementById('currentAttributeDisplay'),
        totalPlayersDisplay: document.getElementById('totalPlayersDisplay'),
        gameProgress: document.getElementById('gameProgress'),
        gameTimeDisplay: document.getElementById('gameTimeDisplay')
    };
    
    if (elements.currentAttributeDisplay) {
        elements.currentAttributeDisplay.textContent = getAttributeName(gameState.currentAttribute) || '-';
    }
    
    if (elements.totalPlayersDisplay) {
        elements.totalPlayersDisplay.textContent = gameState.totalPlayers;
    }
    
    if (elements.gameProgress) {
        const progressPercent = (gameState.currentRound / GAME_CONFIG.MAX_ROUNDS) * 100;
        elements.gameProgress.style.width = `${progressPercent}%`;
    }
    
    // Actualizar posiciones de jugadores en el tablero circular
    updatePlayerPositions();
}

function updatePlayerPositions() {
    // Actualizar las posiciones de batalla en el círculo
    gameState.players.forEach((player, index) => {
        const position = document.querySelector(`.battle-position.pos-${index + 1}`);
        if (position) {
            const slot = position.querySelector('.position-slot');
            const content = position.querySelector('.slot-content .player-slot-name');
            
            if (content) {
                content.textContent = player.player_name;
            }
            
            // Destacar si es el turno del jugador
            if (player.id === gameState.currentPlayerId) {
                slot.classList.add('has-card');
                slot.style.borderColor = 'var(--pokemon-yellow)';
                slot.style.background = 'rgba(255, 204, 0, 0.2)';
            } else {
                slot.classList.remove('has-card');
                slot.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                slot.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        }
    });
    
    // Actualizar información en las zonas de jugadores
    updatePlayerZones();
}

function updatePlayerZones() {
    gameState.players.forEach((player, index) => {
        const playerZone = document.getElementById(`playerZone${index + 1}`);
        if (playerZone) {
            const nameElement = playerZone.querySelector('.player-name');
            const scoreElement = playerZone.querySelector(`#player${index + 1}Score`);
            const cardsElement = playerZone.querySelector(`#player${index + 1}Cards`);
            const avatarRing = playerZone.querySelector('.avatar-ring');
            const turnIndicator = playerZone.querySelector('.turn-indicator');
            
            if (nameElement) {
                nameElement.textContent = player.player_name;
            }
            
            if (scoreElement) {
                scoreElement.textContent = player.score;
            }
            
            if (cardsElement) {
                const remainingCards = GAME_CONFIG.CARDS_PER_PLAYER - (gameState.currentRound - 1);
                cardsElement.textContent = Math.max(0, remainingCards);
            }
            
            // Destacar jugador activo
            if (player.id === gameState.currentPlayerId) {
                avatarRing?.classList.add('active');
                if (turnIndicator) {
                    turnIndicator.style.display = 'flex';
                }
            } else {
                avatarRing?.classList.remove('active');
                if (turnIndicator) {
                    turnIndicator.style.display = 'none';
                }
            }
        }
    });
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
        turnText: document.getElementById('turnText'),
        handTitle: document.getElementById('handTitle'),
        turnArrow: document.getElementById('turnArrow'),
        cardsRemaining: document.getElementById('cardsRemaining'),
        totalCards: document.getElementById('totalCards')
    };
    
    if (elements.turnText) {
        elements.turnText.textContent = `Turno de ${gameState.currentPlayerName}`;
    }
    
    if (elements.handTitle) {
        const isMyTurn = gameState.currentPlayerId === gameState.playerId;
        elements.handTitle.textContent = isMyTurn 
            ? '🎯 ¡Tu Turno! - Selecciona una Carta'
            : `🎮 Turno de ${gameState.currentPlayerName}`;
    }
    
    if (elements.cardsRemaining) {
        elements.cardsRemaining.textContent = gameState.playerCards?.length || 0;
    }
    
    if (elements.totalCards) {
        elements.totalCards.textContent = GAME_CONFIG.CARDS_PER_PLAYER;
    }
}

function highlightPlayerHand(highlight) {
    const handSection = document.querySelector('.player-hand-section');
    if (handSection) {
        if (highlight) {
            handSection.classList.add('current-turn');
        } else {
            handSection.classList.remove('current-turn');
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
            <div class="no-cards-message">
                <div class="no-cards-icon">🃏</div>
                <div class="no-cards-text">No hay cartas disponibles</div>
            </div>
        `;
        return;
    }
    
    cardsContainer.innerHTML = gameState.playerCards.map(card => createCardHTML(card)).join('');
}

function createCardHTML(card) {
    const attributeValue = gameState.currentAttribute ? card[gameState.currentAttribute] : 0;
    const attributeIcon = getAttributeIcon(gameState.currentAttribute);
    const isCurrentAttribute = (attr) => gameState.currentAttribute === attr;
    
    return `
        <div class="hand-card" data-card-id="${card.id}" data-attribute-value="${attributeValue}">
            <div class="card-image">
                <img src="${card.image_url || '/placeholder-card.jpg'}" alt="${card.name}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="card-placeholder" style="display: none;">🃏</div>
            </div>
            <div class="card-info">
                <div class="card-name">${card.name}</div>
                ${gameState.currentAttribute ? `
                    <div style="
                        background: linear-gradient(135deg, var(--pokemon-green), var(--pokemon-blue));
                        color: white;
                        padding: 8px;
                        border-radius: 8px;
                        margin: 8px 0;
                        font-weight: bold;
                        text-align: center;
                    ">
                        ${attributeIcon} ${getAttributeName(gameState.currentAttribute)}: ${attributeValue}
                    </div>
                ` : ''}
                <div class="card-attributes">
                    <div class="card-attr ${isCurrentAttribute('altura_mts') ? 'highlight' : ''}">
                        📏 ${card.altura_mts}m
                    </div>
                    <div class="card-attr ${isCurrentAttribute('fuerza') ? 'highlight' : ''}">
                        ⚡ ${card.fuerza}
                    </div>
                    <div class="card-attr ${isCurrentAttribute('velocidad_percent') ? 'highlight' : ''}">
                        🏃 ${card.velocidad_percent}%
                    </div>
                    <div class="card-attr ${isCurrentAttribute('tecnica') ? 'highlight' : ''}">
                        🧠 ${card.tecnica}
                    </div>
                    <div class="card-attr ${isCurrentAttribute('ki') ? 'highlight' : ''}">
                        💫 ${card.ki}
                    </div>
                    <div class="card-attr ${isCurrentAttribute('peleas_ganadas') ? 'highlight' : ''}">
                        🏆 ${card.peleas_ganadas}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function enableCardSelection() {
    const cards = document.querySelectorAll('.hand-card');
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
    const cards = document.querySelectorAll('.hand-card');
    cards.forEach(card => {
        card.classList.remove('selectable');
        card.classList.add('disabled');
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
            addCardToBattlePosition(cardId, data.attribute_value, gameState.playerName);
            
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

function addCardToBattlePosition(cardId, attributeValue, playerName) {
    // Encontrar la posición del jugador actual
    const playerIndex = gameState.players.findIndex(p => p.player_name === playerName);
    if (playerIndex === -1) return;
    
    const position = document.querySelector(`.battle-position.pos-${playerIndex + 1}`);
    if (!position) return;
    
    const slot = position.querySelector('.position-slot');
    const card = gameState.playerCards.find(c => c.id == cardId);
    
    if (slot && card) {
        slot.innerHTML = `
            <div style="
                background: white;
                border-radius: 10px;
                padding: 8px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                transform: scale(0.8);
            ">
                <div style="font-size: 0.8em; font-weight: bold; color: var(--pokemon-blue); margin-bottom: 5px;">
                    ${card.name}
                </div>
                <div style="
                    background: linear-gradient(135deg, var(--pokemon-green), var(--pokemon-blue));
                    color: white;
                    padding: 6px;
                    border-radius: 6px;
                    font-weight: bold;
                    font-size: 1.2em;
                ">
                    ${getAttributeIcon(gameState.currentAttribute)} ${attributeValue}
                </div>
                <div style="font-size: 0.7em; color: #666; margin-top: 3px;">
                    ${playerName}
                </div>
            </div>
        `;
        
        slot.classList.add('has-card');
        slot.style.borderColor = 'var(--pokemon-green)';
        slot.style.background = 'rgba(76, 175, 80, 0.2)';
        
        // Animación de entrada
        const cardElement = slot.querySelector('div');
        if (cardElement) {
            cardElement.style.transform = 'scale(0) rotate(180deg)';
            cardElement.style.opacity = '0';
            setTimeout(() => {
                cardElement.style.transition = 'all 0.5s ease';
                cardElement.style.transform = 'scale(0.8) rotate(0deg)';
                cardElement.style.opacity = '1';
            }, 100);
        }
    }
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
    modal.className = 'pokemon-modal active';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-container" style="max-width: 900px;">
            <div class="modal-header">
                <h2 class="modal-title">🏆 Resultado de la Ronda ${gameState.currentRound}</h2>
            </div>
            <div class="modal-body">
                <div style="
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 15px;
                    margin-bottom: 30px;
                    text-align: center;
                ">
                    <h3 style="color: #666; margin-bottom: 10px;">
                        ${getAttributeIcon(gameState.currentAttribute)} Atributo: ${getAttributeName(gameState.currentAttribute)}
                    </h3>
                </div>
                <div style="
                    background: linear-gradient(135deg, var(--pokemon-green), #45a049);
                    color: white;
                    border-radius: 15px;
                    padding: 30px;
                    margin: 30px 0;
                    text-align: center;
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
                        <div style="
                            width: 30px;
                            height: 30px;
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid var(--pokemon-blue);
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 10px;
                        "></div>
                        Cargando comparación...
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="pokemon-btn primary" onclick="nextRound()">
                    <span>Siguiente Ronda</span>
                    <span>➡️</span>
                </button>
            </div>
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
                <h4 style="color: #333; margin-bottom: 25px; font-size: 1.4em; text-align: center;">
                    📊 Comparación de Cartas
                </h4>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 25px 0;
                ">
                    ${data.cards_played.map((card, index) => `
                        <div style="
                            background: ${index === 0 ? 'linear-gradient(135deg, #e8f5e8, #f0f8f0)' : 'white'};
                            border: 3px solid ${index === 0 ? 'var(--pokemon-green)' : '#ddd'};
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
                                    background: var(--pokemon-green);
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
                                color: ${index === 0 ? '#2e7d32' : 'var(--pokemon-red)'};
                                padding: 15px;
                                background: ${index === 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(220, 20, 60, 0.1)'};
                                border-radius: 10px;
                                border: 2px solid ${index === 0 ? 'var(--pokemon-green)' : 'var(--pokemon-red)'};
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
            <div style="text-align: center; color: var(--pokemon-red); padding: 40px;">
                <div style="font-size: 3em; margin-bottom: 15px;">⚠️</div>
                <p>Error al cargar la comparación de cartas</p>
            </div>
        `;
    }
}

function proceedToNextRound() {
    gameState.currentRound++;
    
    // Limpiar posiciones de batalla
    document.querySelectorAll('.position-slot').forEach(slot => {
        slot.classList.remove('has-card');
        slot.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        slot.style.background = 'rgba(255, 255, 255, 0.1)';
        slot.innerHTML = `
            <div class="slot-glow"></div>
            <div class="slot-content">
                <span class="player-slot-name">${slot.closest('.battle-position').dataset.player ? 'Jugador ' + slot.closest('.battle-position').dataset.player : ''}</span>
            </div>
        `;
    });
    
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
    modal.className = 'pokemon-modal active';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-container" style="max-width: 800px;">
            <div class="modal-header">
                <h2 class="modal-title">🎉 ¡Fin del Juego!</h2>
            </div>
            <div class="modal-body">
                <div style="
                    background: linear-gradient(135deg, var(--pokemon-blue), var(--pokemon-purple));
                    color: white;
                    border-radius: 20px;
                    padding: 30px;
                    margin: 30px 0;
                    text-align: center;
                    position: relative;
                ">
                    <div style="
                        position: absolute;
                        top: -20px;
                        left: 50%;
                        transform: translateX(-50%);
                        font-size: 4em;
                        background: linear-gradient(135deg, var(--pokemon-yellow), var(--pokemon-orange));
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 10px 30px rgba(255, 204, 0, 0.4);
                    ">🏆</div>
                    
                    <h3 style="margin: 30px 0 20px 0; font-size: 2em;">
                        🥇 ¡Campeón: ${data.winner?.player_name || 'Desconocido'}!
                    </h3>
                    <p style="font-size: 1.3em; margin: 0;">
                        Puntuación Final: <strong>${data.winner?.score || 0} puntos</strong>
                    </p>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.95);
                    border-radius: 15px;
                    padding: 25px;
                    margin: 25px 0;
                ">
                    <h4 style="margin: 0 0 20px 0; font-size: 1.4em; text-align: center; color: var(--pokemon-blue);">
                        📊 Clasificación Final
                    </h4>
                    <div>
                        ${(data.final_standings || []).map((player, index) => `
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                padding: 15px 20px;
                                margin: 10px 0;
                                background: ${index === 0 ? 'linear-gradient(135deg, rgba(255, 204, 0, 0.2), rgba(255, 204, 0, 0.1))' : 'rgba(255,255,255,0.8)'};
                                border-radius: 15px;
                                border: 2px solid ${index === 0 ? 'var(--pokemon-yellow)' : '#e0e0e0'};
                                font-size: 1.1em;
                                transition: all 0.3s ease;
                            ">
                                <span style="display: flex; align-items: center; gap: 15px;">
                                    <span style="
                                        font-size: 1.5em;
                                        min-width: 40px;
                                        height: 40px;
                                        background: ${index === 0 ? 'var(--pokemon-yellow)' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#666'};
                                        color: white;
                                        border-radius: 50%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-weight: bold;
                                    ">${index + 1}</span>
                                    <span style="font-weight: ${index === 0 ? 'bold' : 'normal'}; color: var(--pokemon-blue);">
                                        ${player.player_name}
                                    </span>
                                </span>
                                <span style="
                                    font-size: 1.2em;
                                    font-weight: bold;
                                    color: ${index === 0 ? 'var(--pokemon-yellow)' : 'var(--pokemon-blue)'};
                                ">${player.score} pts</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="
                    background: rgba(255,255,255,0.95);
                    border-radius: 15px;
                    padding: 25px;
                    margin: 25px 0;
                ">
                    <h4 style="margin: 0 0 20px 0; font-size: 1.2em; text-align: center; color: var(--pokemon-blue);">
                        📈 Estadísticas del Juego
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px;">
                        <div style="text-align: center;">
                            <div style="font-size: 2em; margin-bottom: 5px;">🎮</div>
                            <div style="font-size: 1.5em; font-weight: bold; color: var(--pokemon-blue);">${GAME_CONFIG.MAX_ROUNDS}</div>
                            <div style="font-size: 0.9em; color: #666;">Rondas</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2em; margin-bottom: 5px;">👥</div>
                            <div style="font-size: 1.5em; font-weight: bold; color: var(--pokemon-blue);">${gameState.totalPlayers}</div>
                            <div style="font-size: 0.9em; color: #666;">Jugadores</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2em; margin-bottom: 5px;">🃏</div>
                            <div style="font-size: 1.5em; font-weight: bold; color: var(--pokemon-blue);">${gameState.totalPlayers * GAME_CONFIG.CARDS_PER_PLAYER}</div>
                            <div style="font-size: 0.9em; color: #666;">Cartas Jugadas</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="pokemon-btn primary" onclick="returnToLobby()">
                    <span>🏠 Volver al Lobby</span>
                </button>
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
    modal.className = 'pokemon-modal active';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-container small">
            <div class="modal-header">
                <h3 class="modal-title">🎉 ¡Juego Terminado!</h3>
            </div>
            <div class="modal-body">
                <p style="text-align: center; color: var(--pokemon-blue); margin-bottom: 30px; font-size: 1.1em;">
                    El juego ha finalizado después de ${GAME_CONFIG.MAX_ROUNDS} rondas emocionantes.
                </p>
            </div>
            <div class="modal-actions">
                <button class="pokemon-btn primary" onclick="returnToLobby()">
                    <span>Volver al Lobby</span>
                </button>
            </div>
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
    updatePokemonUI();
    
    // Verificar si el juego terminó
    if (data.room.status === 'finished' || data.room.current_round > GAME_CONFIG.MAX_ROUNDS) {
        gameState.gameFinished = true;
        if (!document.querySelector('.pokemon-modal.active')) {
            setTimeout(showFinalResults, 1000);
        }
    }
}

function updateRoundInfo(data) {
    const elements = {
        currentRound: document.getElementById('currentRound'),
        roundCounter: document.getElementById('roundCounter'),
        progressText: document.querySelector('.progress-text')
    };
    
    if (elements.currentRound) {
        elements.currentRound.textContent = `Ronda: ${data.room.current_round}/8`;
    }
    
    if (elements.roundCounter) {
        elements.roundCounter.textContent = `Ronda ${data.room.current_round} de 8`;
    }
    
    if (elements.progressText) {
        elements.progressText.textContent = `Ronda ${data.room.current_round}/8`;
    }
}

function updateScoreboard(players) {
    // Esta función se puede usar para actualizar un marcador si existe en tu HTML
    console.log('Actualizando marcador:', players);
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
            background: rgba(0,0,0,0.8);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2500;
            color: white;
            font-size: 1.2em;
        `;
        document.body.appendChild(loadingOverlay);
    }
    
    loadingOverlay.innerHTML = `
        <div style="
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255,255,255,0.2);
        ">
            <div style="
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255,255,255,0.3);
                border-top: 4px solid var(--pokemon-yellow);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 25px;
            "></div>
            <p style="margin: 0; font-weight: 600; font-size: 1.1em;">${message}</p>
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
    const existingAlerts = document.querySelectorAll('.pokemon-alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertsContainer = document.getElementById('alertsContainer') || createAlertsContainer();
    
    const alert = document.createElement('div');
    alert.className = `pokemon-alert ${type}`;
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️',
        'warning': '⚠️'
    };
    
    alert.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2em;">${icons[type] || icons.info}</span>
            <span>${message}</span>
        </div>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Auto-remover después del tiempo configurado
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => alert.remove(), 300);
        }
    }, GAME_CONFIG.ALERT_DURATION);
}

function createAlertsContainer() {
    const container = document.createElement('div');
    container.id = 'alertsContainer';
    container.className = 'pokemon-alerts';
    document.body.appendChild(container);
    return container;
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
    const modals = document.querySelectorAll('.pokemon-modal');
    modals.forEach(modal => modal.remove());
    
    // Limpiar alertas
    const alerts = document.querySelectorAll('.pokemon-alert');
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
// FUNCIONES GLOBALES PARA HTML
// ==========================================

// Funciones para el menú del juego
window.toggleGameMenu = function() {
    const modal = document.getElementById('gameMenuModal');
    if (modal) {
        modal.classList.toggle('active');
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
};

window.toggleSound = function() {
    // Implementar lógica de sonido
    showAlert('Función de sonido no implementada', 'info');
};

window.showGameRules = function() {
    // Implementar modal de reglas
    showAlert('Reglas: Cada jugador juega una carta por ronda. Gana quien tenga el valor más alto del atributo seleccionado.', 'info');
};

window.playAgain = function() {
    cleanupGame();
    redirectToLobby();
};

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
            const cards = document.querySelectorAll('.hand-card.selectable');
            if (cards[num - 1]) {
                cards[num - 1].click();
            }
        }
    }
});

// Cerrar modales al hacer click en el backdrop
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-backdrop')) {
        const modal = e.target.closest('.pokemon-modal');
        if (modal && !modal.classList.contains('roulette-modal')) {
            modal.classList.remove('active');
        }
    }
});

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
        
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
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
        
        /* Cartas en la mano */
        .hand-card {
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
        }
        
        .hand-card:hover {
            transform: translateY(-10px) scale(1.05);
        }
        
        .hand-card.selectable {
            animation: pulse 2s infinite;
            border-color: var(--pokemon-yellow);
            box-shadow: 0 0 20px rgba(255, 204, 0, 0.5);
        }
        
        .hand-card.selectable:hover {
            transform: translateY(-15px) scale(1.1);
            box-shadow: 0 15px 40px rgba(255, 204, 0, 0.7);
        }
        
        .hand-card.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
            filter: grayscale(50%);
        }
        
        /* Atributos destacados */
        .card-attr.highlight {
            background: linear-gradient(135deg, var(--pokemon-yellow), var(--pokemon-orange));
            color: white;
            font-weight: bold;
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(255, 204, 0, 0.4);
            border: 2px solid var(--pokemon-yellow);
        }
        
        /* Sección de mano del jugador */
        .player-hand-section.current-turn {
            background: linear-gradient(180deg, transparent 0%, rgba(255, 204, 0, 0.1) 20%, rgba(255, 204, 0, 0.2) 100%);
            border-top-color: var(--pokemon-yellow);
            box-shadow: 0 -4px 20px rgba(255, 204, 0, 0.3);
        }
        
        .player-hand-section.current-turn::before {
            content: "";
            position: absolute;
            top: -3px;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--pokemon-yellow), var(--pokemon-orange), var(--pokemon-yellow));
            animation: pulse 2s ease-in-out infinite;
        }
        
        /* Posiciones de batalla */
        .position-slot.has-card {
            border-color: var(--pokemon-green) !important;
            background: rgba(76, 175, 80, 0.2) !important;
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
        }
        
        .position-slot:hover .slot-glow {
            opacity: 1;
            animation: slotPulse 1s ease-in-out infinite;
        }
        
        @keyframes slotPulse {
            0%, 100% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.05); opacity: 0.3; }
        }
        
        /* Modales Pokemon */
        .pokemon-modal.active {
            display: flex !important;
            animation: fadeIn 0.3s ease;
        }
        
        .pokemon-modal .modal-container {
            animation: slideUp 0.3s ease;
        }
        
        /* Alertas Pokemon */
        .pokemon-alerts {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1100;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        }
        
        .pokemon-alert {
            padding: 15px 20px;
            border-radius: 15px;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        /* Efectos de los avatares */
        .avatar-ring.active {
            animation: avatarPulse 2s ease-in-out infinite;
        }
        
        @keyframes avatarPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        /* Efectos del orbe central */
        .center-orb {
            animation: orbPulse 3s ease-in-out infinite;
        }
        
        @keyframes orbPulse {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 0 30px rgba(255, 204, 0, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.3);
            }
            50% { 
                transform: scale(1.1);
                box-shadow: 0 0 50px rgba(255, 204, 0, 1), inset 0 0 30px rgba(255, 255, 255, 0.5);
            }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .pokemon-alerts {
                right: 10px;
                left: 10px;
                max-width: none;
            }
            
            .modal-container {
                width: 95% !important;
                margin: 10px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .hand-card {
                min-width: 120px;
                width: 120px;
            }
            
            .cards-comparison > div {
                grid-template-columns: 1fr !important;
            }
            
            .battle-position {
                width: 80px;
                height: 90px;
            }
            
            .central-battlefield {
                width: 400px;
                height: 400px;
            }
        }
        
        @media (max-width: 480px) {
            .hand-card {
                min-width: 100px;
                width: 100px;
                height: 140px;
            }
            
            .modal-container {
                width: 98% !important;
                margin: 5px;
            }
            
            .pokemon-alert {
                padding: 12px 15px;
                font-size: 0.9em;
            }
            
            .central-battlefield {
                width: 320px;
                height: 320px;
            }
            
            .battle-circle {
                width: 250px;
                height: 250px;
            }
        }
        
        /* Animaciones personalizadas para la ruleta */
        .roulette-modal .attribute-option {
            transition: all 0.2s ease !important;
        }
        
        .roulette-modal .attribute-option:hover {
            transform: scale(1.05);
            border-color: var(--pokemon-yellow) !important;
            background: rgba(255, 204, 0, 0.1) !important;
        }
        
        /* Efectos de partículas de fondo */
        .particles-bg {
            animation: particlesFloat 20s ease-in-out infinite;
        }
        
        @keyframes particlesFloat {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(10px, -10px) rotate(120deg); }
            66% { transform: translate(-5px, 15px) rotate(240deg); }
        }
        
        /* Efectos del dragón central */
        .dragon-logo {
            animation: dragonBreath 4s ease-in-out infinite;
        }
        
        @keyframes dragonBreath {
            0%, 100% { transform: scale(1); filter: hue-rotate(0deg); }
            50% { transform: scale(1.1); filter: hue-rotate(20deg); }
        }
        
        /* Efectos de las estrellas */
        .stars {
            animation: starsRotate 5s linear infinite;
        }
        
        @keyframes starsRotate {
            from { transform: translateX(-50%) rotate(0deg); }
            to { transform: translateX(-50%) rotate(360deg); }
        }
    `;
    
    document.head.appendChild(style);
}

// ==========================================
// INICIALIZACIÓN FINAL
// ==========================================

// Añadir estilos cuando se carga el script
addGameStyles();

// Limpiar al cerrar la ventana
window.addEventListener('unload', cleanupGame);

// Exponer funciones globales necesarias
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
        stopGameLoop,
        showAttributeRouletteAnimation: (attr, name) => showAttributeRouletteAnimation(attr, name)
    };
    
    console.log('🎮 Dragon Game Debug Mode Enabled');
    console.log('Accede a window.gameState para ver el estado del juego');
    console.log('Accede a window.debugGame para funciones de debug');
    console.log('Ejemplo: window.debugGame.showAttributeRouletteAnimation("fuerza", "Fuerza")');
}

console.log('🐉 Dragon Game JavaScript Cargado Correctamente');