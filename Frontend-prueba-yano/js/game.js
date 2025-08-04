const API_AUTH = '/BootcampPHP/api/auth.php';
const API_ROOMS = '/BootcampPHP/api/rooms.php';
const API_GAME = '/BootcampPHP/api/game.php';

let gameState = {
    roomId: null,
    playerId: null,
    players: [],
    currentRound: 1,
    selectedMap: null,
    playerCards: []
};

// Inicializar juego desde datos del lobby
async function initializeGame() {
    // Obtener parámetros de URL
    const params = new URLSearchParams(window.location.search);
    gameState.roomId = params.get('roomId');
    gameState.playerId = params.get('playerId');

    if (!gameState.roomId || !gameState.playerId) {
        window.location.href = 'lobby.html';
        return;
    }

    // Recuperar configuración del juego
    const gameConfig = JSON.parse(sessionStorage.getItem('gameConfig'));
    if (gameConfig) {
        gameState.players = gameConfig.players;
        gameState.selectedMap = gameConfig.selectedMap;
    }

    try {
        // Cargar estado actual del juego
        await fetchGameState();
        // Cargar cartas del jugador
        await fetchPlayerCards();
        // Iniciar actualizaciones periódicas
        startGameLoop();
    } catch (error) {
        console.error('Error inicializando juego:', error);
        showError('Error al inicializar el juego');
    }
}

async function fetchGameState() {
    const response = await fetch(`${API_ROOMS}?action=room_status&room_id=${gameState.roomId}`);
    const data = await response.json();
    updateGameState(data);
}

async function fetchPlayerCards() {
    const response = await fetch(`${API_ROOMS}?action=player_cards&room_id=${gameState.roomId}&player_id=${gameState.playerId}`);
    const data = await response.json();
    if (data.cards) {
        gameState.playerCards = data.cards;
        renderPlayerCards();
    }
}

function startGameLoop() {
    setInterval(fetchGameState, 3000);
}

function updateGameState(data) {
    // Actualizar UI con nuevo estado
    document.getElementById('currentRound').textContent = `Ronda: ${data.room.current_round}`;
    document.getElementById('currentTurn').textContent = `Turno de: ${getCurrentPlayerName(data)}`;
    updateScoreboard(data.players);
}

// Función para mostrar errores
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeGame);
