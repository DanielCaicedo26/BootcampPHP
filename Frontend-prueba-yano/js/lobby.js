// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================

const API_AUTH = '/BootcampPHP/api/auth.php';
const API_ROOMS = '/BootcampPHP/api/rooms.php';
const API_GAME = '/BootcampPHP/api/game.php';

let currentUser = null;
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
            // Redirigir al login si no está autenticado
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
    // Remover clase active de todos los botones y secciones
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    
    // Activar el botón y sección seleccionados
    document.getElementById(section + 'Btn').classList.add('active');
    document.getElementById(section + 'Section').classList.add('active');
    
    // Cargar contenido específico
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
    
    // Generar campos de entrada para nombres
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
    
    // Inicializar array de jugadores
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
        const data = await response.json();
        
        if (data.maps && data.maps.length > 0) {
            maps = data.maps;
            renderMaps(maps);
            
            // Llenar filtro de mapas para la sección de cartas
            const mapFilter = document.getElementById('mapFilter');
            mapFilter.innerHTML = '<option value="">Todos los mapas</option>' +
                data.maps.map(map => `<option value="${map.id}">${map.name}</option>`).join('');
        } else {
            showAlert('No se encontraron mapas disponibles', 'info');
            renderMaps([]);
        }
        
    } catch (error) {
        console.error('Error cargando mapas:', error);
        showAlert('Error al cargar los mapas', 'error');
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
            <div class="map-icon">${map.icon || '🗺️'}</div>
            <div class="map-name">${map.name}</div>
            <div class="map-description">${map.description || 'Descripción no disponible'}</div>
        </div>
    `).join('');
}

function selectMap(mapId) {
    // Remover selección anterior
    document.querySelectorAll('.map-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Seleccionar nuevo mapa
    const mapCard = document.getElementById(`map-${mapId}`);
    if (mapCard) {
        mapCard.classList.add('selected');
        selectedMap = maps.find(m => m.id === mapId);
        gameConfig.selectedMapId = mapId;
    }
}

function startLocalGame() {
    // Validar que todos los campos estén completos
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
    
    // Mostrar modal de confirmación
    showGameStartModal();
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
    document.getElementById('summaryMap').textContent = selectedMap.name;
    
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
        
        // Crear sala temporal para el juego local
        const response = await fetch(`${API_ROOMS}?action=create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                max_players: gameConfig.playerCount,
                is_private: true
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const roomId = data.room.id;
            
            // Añadir todos los jugadores a la sala
            for (let player of gameConfig.players) {
                await fetch(`${API_ROOMS}?action=join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        room_code: data.room.room_code,
                        player_name: player.name
                    })
                });
            }
            
            // Asignar cartas a jugadores
            await fetch(`${API_ROOMS}?action=start_game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: roomId
                })
            });
            
            showAlert('¡Juego iniciado correctamente!', 'success');
            
            // Aquí redirigirías a la pantalla de juego
            setTimeout(() => {
                // window.location.href = `game.html?room=${data.room.room_code}`;
                showAlert('¡El juego está listo! (Redirección a pantalla de juego pendiente)', 'success');
                hideGameStartModal();
            }, 2000);
            
        } else {
            showAlert(data.error || 'Error al iniciar el juego', 'error');
        }
    } catch (error) {
        console.error('Error iniciando juego:', error);
        showAlert('Error al iniciar el juego', 'error');
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
        
        // Simular cartas de ejemplo ya que no hay endpoint específico
        const mockCards = [
            {
                id: 1,
                name: 'Dragón de Fuego',
                power: 95,
                defense: 80,
                speed: 70,
                intelligence: 85,
                description: 'Un poderoso dragón que domina las llamas del inframundo. Su aliento puede derretir el acero más fuerte.',
                image: null
            },
            {
                id: 2,
                name: 'Caballero Valiente',
                power: 75,
                defense: 90,
                speed: 60,
                intelligence: 70,
                description: 'Un noble caballero con armadura encantada. Su honor y valentía son legendarios en todo el reino.',
                image: null
            },
            {
                id: 3,
                name: 'Mago Ancestral',
                power: 85,
                defense: 50,
                speed: 65,
                intelligence: 98,
                description: 'Un sabio mago con conocimientos milenarios. Maestro de todas las escuelas de magia arcana.',
                image: null
            },
            {
                id: 4,
                name: 'Arquera Élfica',
                power: 70,
                defense: 60,
                speed: 95,
                intelligence: 80,
                description: 'Una élfica con puntería infalible. Sus flechas nunca fallan su objetivo.',
                image: null
            },
            {
                id: 5,
                name: 'Troll de Montaña',
                power: 90,
                defense: 95,
                speed: 30,
                intelligence: 40,
                description: 'Una criatura gigante de las montañas. Su piel es dura como la roca.',
                image: null
            },
            {
                id: 6,
                name: 'Ninja Sombra',
                power: 80,
                defense: 65,
                speed: 98,
                intelligence: 85,
                description: 'Un maestro de las artes marciales y la invisibilidad. Se mueve como el viento nocturno.',
                image: null
            },
            {
                id: 7,
                name: 'Hechicera del Hielo',
                power: 88,
                defense: 70,
                speed: 75,
                intelligence: 92,
                description: 'Domina los elementos del frío y la nieve. Puede congelar a sus enemigos con una mirada.',
                image: null
            },
            {
                id: 8,
                name: 'Guerrero Bárbaro',
                power: 92,
                defense: 85,
                speed: 55,
                intelligence: 45,
                description: 'Un feroz guerrero de las tierras salvajes. Su furia en batalla es incontrolable.',
                image: null
            },
            {
                id: 9,
                name: 'Sacerdotisa de Luz',
                power: 65,
                defense: 75,
                speed: 70,
                intelligence: 88,
                description: 'Una devota sacerdotisa con poderes curativos. Su luz puede purificar cualquier maldad.',
                image: null
            },
            {
                id: 10,
                name: 'Demonio de las Sombras',
                power: 93,
                defense: 60,
                speed: 85,
                intelligence: 75,
                description: 'Una criatura de pesadilla que emerge de las sombras. Su sola presencia aterroriza a los valientes.',
                image: null
            },
            {
                id: 11,
                name: 'Unicornio Místico',
                power: 70,
                defense: 80,
                speed: 90,
                intelligence: 95,
                description: 'Una criatura pura y mágica. Su cuerno tiene poderes curativos extraordinarios.',
                image: null
            },
            {
                id: 12,
                name: 'Golem de Piedra',
                power: 85,
                defense: 98,
                speed: 25,
                intelligence: 30,
                description: 'Un guardián creado con magia antigua. Su cuerpo de piedra es prácticamente indestructible.',
                image: null
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
            <div class="card-image">
                ${card.image ? `<img src="${card.image}" alt="${card.name}">` : '🃏'}
            </div>
            <div class="card-content">
                <div class="card-name">${card.name}</div>
                <div class="card-attributes">
                    <div class="card-attr">
                        <span>⚡ Poder:</span>
                        <span>${card.power}</span>
                    </div>
                    <div class="card-attr">
                        <span>🛡️ Defensa:</span>
                        <span>${card.defense}</span>
                    </div>
                    <div class="card-attr">
                        <span>🏃 Velocidad:</span>
                        <span>${card.speed}</span>
                    </div>
                    <div class="card-attr">
                        <span>🧠 Inteligencia:</span>
                        <span>${card.intelligence}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCards() {
    const mapFilter = document.getElementById('mapFilter').value;
    const searchTerm = document.getElementById('searchCards').value.toLowerCase();
    
    let filteredCards = cards;
    
    // Filtrar por búsqueda de texto
    if (searchTerm) {
        filteredCards = filteredCards.filter(card => 
            card.name.toLowerCase().includes(searchTerm) ||
            card.description.toLowerCase().includes(searchTerm)
        );
    }
    
    renderCards(filteredCards);
}

function showCardDetails(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    
    // Llenar modal con detalles de la carta
    document.getElementById('cardTitle').textContent = `🃏 ${card.name}`;
    document.getElementById('cardName').textContent = card.name;
    document.getElementById('cardPower').textContent = card.power;
    document.getElementById('cardDefense').textContent = card.defense;
    document.getElementById('cardSpeed').textContent = card.speed;
    document.getElementById('cardIntelligence').textContent = card.intelligence;
    document.getElementById('cardDescription').textContent = card.description;
    
    const cardImage = document.getElementById('cardImage');
    if (card.image) {
        cardImage.src = card.image;
        cardImage.alt = card.name;
        cardImage.style.display = 'block';
    } else {
        cardImage.style.display = 'none';
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