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

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            const mapsGrid = document.getElementById('mapsGrid');
            if (mapsGrid) {
                mapsGrid.innerHTML = `<div style="color:red;"><b>Error de backend:</b><br><pre>${text.slice(0, 500)}</pre></div>`;
            }
            throw new Error('Respuesta del servidor no es JSON. Recibido: ' + text.slice(0, 200));
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
    
    // Ajustar las URLs de las imágenes para que sean absolutas
    const mappedMaps = mapsToRender.map(map => ({
        ...map,
        image_url: map.image_url.startsWith('http') ? 
            map.image_url : 
            `/BootcampPHP/assets/images/maps/${map.image_url.split('/').pop()}`
    }));
    
    mapsGrid.innerHTML = mappedMaps.map(map => `
        <div class="map-card" onclick="selectMap('${map.id}')" id="map-${map.id}">
            <div class="map-image">
                ${map.image_url ? 
                    `<img src="${map.image_url}" alt="${map.name}" 
                         onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">` 
                    : ''}
                <div class="map-placeholder" ${map.image_url ? 'style="display:none;"' : ''}>
                    <span class="map-icon">🗺️</span>
                </div>
            </div>
            <div class="map-info">
                <div class="map-name">${map.name}</div>
                <div class="map-description">${map.description || 'Mapa del juego Dragon Ball'}</div>
            </div>
        </div>
    `).join('');
}

function selectMap(mapId) {
    try {
        // Asegurar que comparamos strings
        const stringMapId = mapId.toString();

        const selectedMapData = maps.find(m => m.id.toString() === stringMapId);

        if (!selectedMapData) {
            showAlert('Error: Mapa no encontrado', 'error');
            return;
        }

        // Si llegamos aquí, el mapa es válido
        document.querySelectorAll('.map-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const mapCard = document.getElementById(`map-${mapId}`);
        if (mapCard) {
            mapCard.classList.add('selected');
            selectedMap = selectedMapData;
            gameConfig.selectedMapId = mapId;
            
            // Actualizar indicador visual
            const indicator = document.getElementById('selectedMapIndicator');
            const mapName = document.getElementById('selectedMapName');
            if (indicator && mapName) {
                mapName.textContent = selectedMap.name;
                indicator.style.display = 'block';
            }
            
            // Habilitar botón de inicio
            const startButton = document.getElementById('startGameBtn');
            if (startButton) {
                startButton.disabled = false;
            }
            
            showAlert(`Mapa seleccionado: ${selectedMap.name}`, 'success');
        }
    } catch (error) {
        showAlert('Error al seleccionar el mapa', 'error');
    }
}

// ==========================================
// FUNCIONES DE SALA Y JUGADORES - CORREGIDAS
// ==========================================

async function createRoomAndStartGame() {
    try {
        showLoading(true);
        
        console.log('Iniciando creación de sala...');
        
        // 1. Crear sala
        const createResponse = await fetch(`${API_ROOMS}?action=create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                max_players: gameConfig.playerCount,
                is_private: true
            })
        });

        if (!createResponse.ok) {
            throw new Error(`Error HTTP al crear sala: ${createResponse.status}`);
        }
        
        const createData = await createResponse.json();
        console.log('Respuesta de creación de sala:', createData);
        
        if (!createData.success) {
            throw new Error(createData.error || 'Error al crear la sala');
        }
        
        currentRoom = createData.room;
        console.log('Sala creada:', currentRoom);
        
        // 2. Añadir jugadores uno por uno con mejor manejo de errores
        const addedPlayers = [];
        let failedCount = 0;
        
        for (let i = 0; i < gameConfig.players.length; i++) {
            const player = gameConfig.players[i];
            try {
                console.log(`Añadiendo jugador ${i + 1}: ${player.name}`);
                
                const joinResponse = await fetch(`${API_ROOMS}?action=join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        room_id: currentRoom.id,
                        player_name: player.name
                    })
                });

                
                if (!joinResponse.ok) {
                    const errorText = await joinResponse.text();
                    console.error(`Error HTTP al añadir jugador ${player.name}: Status ${joinResponse.status}`);
                    console.error('Detalle del error:', errorText);
                    failedCount++;
                    continue;
                }
                
                const joinData = await joinResponse.json();
                console.log(`Respuesta para jugador ${player.name}:`, joinData);
                
                if (joinData.success) {
                    addedPlayers.push({
                        ...player,
                        db_id: joinData.player_id,
                        room_id: joinData.room_id
                    });
                    
                    // El primer jugador añadido será el jugador principal
                    if (addedPlayers.length === 1) {
                        currentPlayer = addedPlayers[0];
                    }
                } else {
                    console.error(`Error al añadir jugador ${player.name}:`, joinData.error);
                    failedCount++;
                }
            } catch (error) {
                console.error(`Excepción añadiendo jugador ${player.name}:`, error);
                failedCount++;
            }
        }
        
        console.log(`Jugadores añadidos: ${addedPlayers.length}, Fallidos: ${failedCount}`);
        
        if (addedPlayers.length === 0) {
            throw new Error('No se pudo añadir ningún jugador a la sala');
        }
        
        // Actualizar configuración con jugadores añadidos exitosamente
        gameConfig.players = addedPlayers;
        
        // 3. Establecer el mapa seleccionado
        if (selectedMap && selectedMap.id) {
            console.log('Estableciendo mapa:', selectedMap.name);
            
            const setMapResponse = await fetch(`${API_ROOMS}?action=set_map`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: currentRoom.id,
                    map_id: selectedMap.id
                })
            });
            
            const setMapData = await setMapResponse.json();
            console.log('Respuesta de establecer mapa:', setMapData);
            
            if (!setMapData.success) {
                console.error('Error estableciendo mapa:', setMapData.error);
                // Continuar sin mapa si hay error
            }
        }
        
        // 4. Iniciar el juego y asignar cartas
        console.log('Iniciando juego...');
        
        const startResponse = await fetch(`${API_ROOMS}?action=start_game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_id: currentRoom.id
            })
        });
        
        const startData = await startResponse.json();
        console.log('Respuesta de iniciar juego:', startData);
        
        if (startData.success) {
            showAlert(`¡Sala creada exitosamente! Jugadores añadidos: ${addedPlayers.length}`, 'success');
            showGameStartModal();
        } else {
            throw new Error(startData.error || 'Error al iniciar el juego');
        }
        
    } catch (error) {
        console.error('Error detallado en createRoomAndStartGame:', error);
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
        if (input && input.value.trim()) {
            const player = gameConfig.players.find(p => p.id === i);
            if (player) {
                player.name = input.value.trim();
            }
        }
    }
    
    console.log('Configuración del juego:', gameConfig);
    
    // Crear sala y empezar proceso
    createRoomAndStartGame();
}

function validateGameConfig() {
    // Verificar que se haya seleccionado un mapa
    if (!selectedMap || !gameConfig.selectedMapId) {
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
    document.getElementById('summaryPlayers').textContent = gameConfig.players.length;
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
        if (!validateGameConfig()) {
            return;
        }

        showLoading(true);
        
        if (!currentRoom || !currentPlayer || !selectedMap) {
            throw new Error('Faltan datos necesarios para iniciar el juego');
        }
        
        // Guardar datos del juego en sessionStorage
        const gameData = {
            roomId: currentRoom.id,
            roomCode: currentRoom.room_code,
            playerId: currentPlayer.db_id,
            playerName: currentPlayer.name,
            players: gameConfig.players,
            selectedMap: selectedMap
        };
        
        sessionStorage.setItem('gameConfig', JSON.stringify(gameData));
        
        console.log('Datos del juego guardados:', gameData);
        
        // Redirigir al juego
        window.location.href = 'game.html?roomId=' + currentRoom.id + '&playerId=' + currentPlayer.db_id;
        
    } catch (error) {
        console.error('Error iniciando juego:', error);
        showAlert('Error al iniciar el juego: ' + error.message, 'error');
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
        
        const response = await fetch(`${API_ROOMS}?action=cards`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.cards && Array.isArray(data.cards)) {
            cards = data.cards;
            renderCards(cards);
        } else {
            throw new Error('No se pudieron cargar las cartas desde la base de datos');
        }
        
    } catch (error) {
        console.error('Error cargando cartas:', error);
        showAlert('Error al cargar las cartas: ' + error.message, 'error');
        renderCards([]);
    } finally {
        showLoading(false);
    }
}

function renderCards(cardsToRender) {
    const cardsGrid = document.getElementById('cardsGrid');
    
    if (!cardsToRender || cardsToRender.length === 0) {
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
            <div class="card-image">
                ${card.image_url ? 
                    `<img src="${card.image_url}" 
                         alt="${card.name}" 
                         onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">` 
                    : ''}
                <div class="card-placeholder" style="font-size: 3em; ${card.image_url ? 'display: none;' : ''}">🃏</div>
            </div>
            <div class="card-content">
                <div class="card-name">${card.name || 'Sin nombre'}</div>
                <div class="card-attributes">
                    <div class="card-attr"><span>⚡ Fuerza:</span><span>${card.fuerza || 0}</span></div>
                    <div class="card-attr"><span>🏃 Velocidad:</span><span>${card.velocidad_percent || 0}%</span></div>
                    <div class="card-attr"><span>🧠 Técnica:</span><span>${card.tecnica || 0}</span></div>
                    <div class="card-attr"><span>💫 Ki:</span><span>${card.ki || 0}</span></div>
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
            card.name.toLowerCase().includes(searchTerm)
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
    
    // Actualizar imagen si existe
    const cardImage = document.getElementById('cardImage');
    if (card.image_url) {
        cardImage.src = card.image_url;
        cardImage.style.display = 'block';
        cardImage.nextElementSibling.style.display = 'none';
    } else {
        cardImage.style.display = 'none';
        cardImage.nextElementSibling.style.display = 'flex';
    }
    
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