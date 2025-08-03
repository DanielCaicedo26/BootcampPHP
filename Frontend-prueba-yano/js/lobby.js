// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================

const API_AUTH = '/BootcampPHP/api/auth.php';
const API_ROOMS = '/BootcampPHP/api/rooms.php';
const API_GAME = '/BootcampPHP/api/game.php';

let currentUser = null;
let currentRoom = null;
let currentPlayer = null;
let cards = [];
let maps = [];
let selectedMap = null;
let gameConfig = {
    players: [],
    playerCount: 7,
    selectedMapId: null
};

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadMaps();
    updatePlayerInputs();
});

// ==========================================
// FUNCIONES DE AUTENTICACIÓN
// ==========================================

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_AUTH}?action=status`);
        const data = await response.json();
        
        if (data.logged_in) {
            currentUser = {
                id: data.user_id,
                username: data.username
            };
            document.getElementById('headerUsername').textContent = data.username;
        } else {
            window.location.href = '../html/index.html';
        }
    } catch (error) {
        console.error('Error verificando estado:', error);
        window.location.href = '../html/index.html';
    }
}

async function logout() {
    try {
        const response = await fetch(`${API_AUTH}?action=logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Sesión cerrada correctamente', 'success');
            setTimeout(() => {
                window.location.href = '../html/index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Error en logout:', error);
        showAlert('Error al cerrar sesión', 'error');
    }
}

// ==========================================
// FUNCIONES DE NAVEGACIÓN
// ==========================================

function switchSection(section) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    
    document.getElementById(section + 'Btn').classList.add('active');
    document.getElementById(section + 'Section').classList.add('active');
    
    if (section === 'cards') {
        loadCards();
    }
}

// ==========================================
// FUNCIONES DE CONFIGURACIÓN DE JUEGO
// ==========================================

function updatePlayerInputs() {
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const playersNamesContainer = document.getElementById('playersNames');
    
    gameConfig.playerCount = playerCount;
    
    let playersHTML = '';
    for (let i = 1; i <= playerCount; i++) {
        playersHTML += `
            <div class="player-input">
                <span>Jugador ${i}:</span>
                <input type="text" id="player${i}" placeholder="Nombre del jugador ${i}" 
                       value="Jugador ${i}" onchange="updatePlayerName(${i}, this.value)">
            </div>
        `;
    }
    
    playersNamesContainer.innerHTML = playersHTML;
    
    gameConfig.players = [];
    for (let i = 1; i <= playerCount; i++) {
        gameConfig.players.push({
            id: i,
            name: `Jugador ${i}`,
            order: i
        });
    }
}

function updatePlayerName(playerId, name) {
    const player = gameConfig.players.find(p => p.id === playerId);
    if (player) {
        player.name = name.trim() || `Jugador ${playerId}`;
    }
}

async function loadMaps() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_ROOMS}?action=maps`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
            throw new Error('Respuesta inválida del servidor');
        }
        
        if (!Array.isArray(data.maps)) {
            throw new Error('Formato de datos inválido');
        }
        
        maps = data.maps;
        
        if (maps.length === 0) {
            showAlert('No hay mapas disponibles en este momento', 'warning');
        }
        
        renderMaps(maps);
        
        // Actualizar filtro de mapas
        const mapFilter = document.getElementById('mapFilter');
        if (mapFilter) {
            mapFilter.innerHTML = '<option value="">Todos los mapas</option>' +
                maps.map(map => `<option value="${map.id}">${map.name}</option>`).join('');
        }
        
    } catch (error) {
        console.error('Error en loadMaps:', error);
        showAlert('Error al cargar los mapas: ' + error.message, 'error');
        renderMaps([]);
    } finally {
        showLoading(false);
    }
}

function renderMaps(mapsToRender) {
    const mapsGrid = document.getElementById('mapsGrid');
    
    if (mapsToRender.length === 0) {
        mapsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🗺️</div>
                <h3>No hay mapas disponibles</h3>
                <p>No se pudieron cargar los mapas del juego.</p>
            </div>
        `;
        return;
    }
    
    mapsGrid.innerHTML = mapsToRender.map(map => `
        <div class="map-card" onclick="selectMap(${map.id})" id="map-${map.id}">
            <div class="map-icon">🗺️</div>
            <div class="map-name">${map.name}</div>
            <div class="map-description">${map.description || 'Mapa del juego Dragon Ball'}</div>
        </div>
    `).join('');
}

function selectMap(mapId) {
    document.querySelectorAll('.map-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const mapCard = document.getElementById(`map-${mapId}`);
    if (mapCard) {
        mapCard.classList.add('selected');
        selectedMap = maps.find(m => m.id === mapId);
        gameConfig.selectedMapId = mapId;
    }
}

// ==========================================
// FUNCIONES DE SALA Y JUGADORES
// ==========================================

async function createRoomAndStartGame() {
    try {
        showLoading(true);
        
        // 1. Crear sala
        const createResponse = await fetch(`${API_ROOMS}?action=create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                max_players: gameConfig.playerCount,
                is_private: true
            })
        });
        
        const createData = await createResponse.json();
        
        if (!createData.success) {
            throw new Error(createData.error || 'Error al crear la sala');
        }
        
        currentRoom = createData.room;
        
        // 2. Añadir todos los jugadores a la sala
        const addedPlayers = [];
        for (let player of gameConfig.players) {
            try {
                const joinResponse = await fetch(`${API_ROOMS}?action=join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        room_code: currentRoom.room_code,
                        player_name: player.name
                    })
                });
                
                const joinData = await joinResponse.json();
                
                if (joinData.success) {
                    addedPlayers.push({
                        ...player,
                        db_id: joinData.player_id,
                        room_id: joinData.room_id
                    });
                    
                    // Guardar el primer jugador como el jugador actual del usuario
                    if (addedPlayers.length === 1) {
                        currentPlayer = addedPlayers[0];
                    }
                }
            } catch (error) {
                console.error(`Error añadiendo jugador ${player.name}:`, error);
            }
        }
        
        if (addedPlayers.length === 0) {
            throw new Error('No se pudo añadir ningún jugador a la sala');
        }
        
        gameConfig.players = addedPlayers;
        
        // 3. Establecer el mapa seleccionado directamente
        const setMapResponse = await fetch(`${API_ROOMS}?action=set_map`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_id: currentRoom.id,
                map_id: selectedMap.id
            })
        });
        
        const setMapData = await setMapResponse.json();
        
        if (!setMapData.success) {
            throw new Error('Error al establecer el mapa');
        }
        
        // 4. Iniciar el juego y asignar cartas
        const startResponse = await fetch(`${API_ROOMS}?action=start_game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_id: currentRoom.id
            })
        });
        
        const startData = await startResponse.json();
        
        if (startData.success) {
            showAlert(`¡Sala creada exitosamente! Código: ${currentRoom.room_code}`, 'success');
            showGameStartModal();
        } else {
            throw new Error(startData.error || 'Error al iniciar el juego');
        }
        
    } catch (error) {
        console.error('Error en createRoomAndStartGame:', error);
        showAlert(error.message || 'Error al crear la sala', 'error');
    } finally {
        showLoading(false);
    }
}

function startLocalGame() {
    if (!validateGameConfig()) {
        return;
    }
    
    // Actualizar nombres de jugadores desde los inputs
    for (let i = 1; i <= gameConfig.playerCount; i++) {
        const input = document.getElementById(`player${i}`);
        if (input) {
            gameConfig.players[i-1].name = input.value.trim() || `Jugador ${i}`;
        }
    }
    
    // Crear sala y empezar proceso
    createRoomAndStartGame();
}

function validateGameConfig() {
    // Verificar que se haya seleccionado un mapa
    if (!selectedMap) {
        showAlert('Por favor selecciona un mapa para jugar', 'error');
        return false;
    }
    
    // Verificar que todos los jugadores tengan nombre
    const playerInputs = document.querySelectorAll('#playersNames input');
    for (let input of playerInputs) {
        if (!input.value.trim()) {
            showAlert('Por favor completa los nombres de todos los jugadores', 'error');
            input.focus();
            return false;
        }
    }
    
    return true;
}

function showGameStartModal() {
    // Llenar resumen del juego
    document.getElementById('summaryPlayers').textContent = gameConfig.playerCount;
    document.getElementById('summaryMap').textContent = selectedMap ? selectedMap.name : 'No seleccionado';
    
    // Llenar lista de jugadores
    const playersListHTML = gameConfig.players.map(player => 
        `<span class="summary-player">${player.name}</span>`
    ).join('');
    document.getElementById('summaryPlayersList').innerHTML = playersListHTML;
    
    // Mostrar modal
    document.getElementById('gameStartModal').classList.add('active');
}

function hideGameStartModal() {
    document.getElementById('gameStartModal').classList.remove('active');
}

async function confirmStartGame() {
    try {
        showLoading(true);
        
        showAlert('¡Juego iniciado correctamente! Todos los jugadores tienen sus cartas asignadas.', 'success');
        
        // Aquí podrías redirigir a la pantalla de juego
        setTimeout(() => {
            showAlert(`¡El juego está listo en la sala ${currentRoom.room_code}!`, 'success');
            hideGameStartModal();
            
            // Opcional: Mostrar información adicional
            console.log('Sala creada:', currentRoom);
            console.log('Jugadores:', gameConfig.players);
            console.log('Mapa seleccionado:', selectedMap);
        }, 2000);
        
    } catch (error) {
        console.error('Error confirmando inicio:', error);
        showAlert('Error al confirmar el inicio del juego', 'error');
    } finally {
        showLoading(false);
    }
}

// ==========================================
// FUNCIONES DE CARTAS
// ==========================================

async function loadCards() {
    try {
        showLoading(true);
        
        const mockCards = [
            {
                id: 1, name: 'Goku', altura_mts: 1.75, tecnica: 9.5, fuerza: 95, 
                peleas_ganadas: 150, velocidad_percent: 90, ki: 98,
                description: 'El Saiyajin más poderoso de la Tierra'
            },
            {
                id: 2, name: 'Vegeta', altura_mts: 1.64, tecnica: 9.2, fuerza: 92, 
                peleas_ganadas: 140, velocidad_percent: 88, ki: 95,
                description: 'El Príncipe de los Saiyajin'
            },
            {
                id: 3, name: 'Piccolo', altura_mts: 2.26, tecnica: 8.8, fuerza: 80, 
                peleas_ganadas: 85, velocidad_percent: 75, ki: 90,
                description: 'El Namekiano guerrero'
            },
            {
                id: 4, name: 'Gohan', altura_mts: 1.76, tecnica: 8.8, fuerza: 88, 
                peleas_ganadas: 80, velocidad_percent: 85, ki: 92,
                description: 'El hijo de Goku con gran potencial'
            },
            {
                id: 5, name: 'Trunks', altura_mts: 1.70, tecnica: 8.7, fuerza: 85, 
                peleas_ganadas: 60, velocidad_percent: 92, ki: 88,
                description: 'El guerrero del futuro'
            },
            {
                id: 6, name: 'Cell', altura_mts: 2.13, tecnica: 9.3, fuerza: 94, 
                peleas_ganadas: 30, velocidad_percent: 86, ki: 96,
                description: 'El androide perfecto'
            },
            {
                id: 7, name: 'Frieza', altura_mts: 1.58, tecnica: 9.0, fuerza: 89, 
                peleas_ganadas: 100, velocidad_percent: 83, ki: 94,
                description: 'El emperador del universo'
            },
            {
                id: 8, name: 'Majin Buu', altura_mts: 1.69, tecnica: 7.5, fuerza: 96, 
                peleas_ganadas: 25, velocidad_percent: 70, ki: 98,
                description: 'La criatura mágica más poderosa'
            }
        ];
        
        cards = mockCards;
        renderCards(cards);
        
    } catch (error) {
        console.error('Error cargando cartas:', error);
        showAlert('Error al cargar las cartas', 'error');
    } finally {
        showLoading(false);
    }
}

function renderCards(cardsToRender) {
    const cardsGrid = document.getElementById('cardsGrid');
    
    if (cardsToRender.length === 0) {
        cardsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🃏</div>
                <h3>No se encontraron cartas</h3>
                <p>Intenta ajustar los filtros de búsqueda.</p>
            </div>
        `;
        return;
    }
    
    cardsGrid.innerHTML = cardsToRender.map(card => `
        <div class="card-item" onclick="showCardDetails(${card.id})">
            <div class="card-image">🃏</div>
            <div class="card-content">
                <div class="card-name">${card.name}</div>
                <div class="card-attributes">
                    <div class="card-attr"><span>⚡ Fuerza:</span><span>${card.fuerza}</span></div>
                    <div class="card-attr"><span>🏃 Velocidad:</span><span>${card.velocidad_percent}%</span></div>
                    <div class="card-attr"><span>🧠 Técnica:</span><span>${card.tecnica}</span></div>
                    <div class="card-attr"><span>💫 Ki:</span><span>${card.ki}</span></div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCards() {
    const searchTerm = document.getElementById('searchCards').value.toLowerCase();
    let filteredCards = cards;
    
    if (searchTerm) {
        filteredCards = filteredCards.filter(card => 
            card.name.toLowerCase().includes(searchTerm) ||
            (card.description && card.description.toLowerCase().includes(searchTerm))
        );
    }
    
    renderCards(filteredCards);
}

function showCardDetails(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    document.getElementById('cardTitle').textContent = `🃏 ${card.name}`;
    document.getElementById('cardName').textContent = card.name;
    document.getElementById('cardHeight').textContent = card.altura_mts + 'm';
    document.getElementById('cardPower').textContent = card.fuerza;
    document.getElementById('cardSpeed').textContent = card.velocidad_percent + '%';
    document.getElementById('cardTechnique').textContent = card.tecnica;
    document.getElementById('cardKi').textContent = card.ki;
    document.getElementById('cardWins').textContent = card.peleas_ganadas;
    document.getElementById('cardDescription').textContent = card.description || 'Personaje del universo Dragon Ball';
    
    showCardDetailsModal();
}

// ==========================================
// FUNCIONES DE MODALES
// ==========================================

function showCardDetailsModal() {
    document.getElementById('cardDetailsModal').classList.add('active');
}

function hideCardDetailsModal() {
    document.getElementById('cardDetailsModal').classList.remove('active');
}

// Cerrar modales al hacer click fuera
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        hideCardDetailsModal();
        hideGameStartModal();
    }
});

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

function showAlert(message, type) {
    const alertElement = document.getElementById('alertMessage');
    alertElement.textContent = message;
    alertElement.className = `alert ${type}`;
    alertElement.style.display = 'block';
    
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

function hideAlert() {
    document.getElementById('alertMessage').style.display = 'none';
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// ==========================================
// EVENT LISTENERS
// ==========================================

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hideCardDetailsModal();
        hideGameStartModal();
        hideAlert();
    }
});

// Actualizar nombres de jugadores en tiempo real
document.addEventListener('input', function(event) {
    if (event.target.id && event.target.id.startsWith('player')) {
        const playerId = parseInt(event.target.id.replace('player', ''));
        updatePlayerName(playerId, event.target.value);
    }
});