// ==========================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================

const API_AUTH = '/BootcampPHP/api/auth.php';
const API_ROOMS = '/BootcampPHP/api/rooms.php';
const API_GAME = '/BootcampPHP/api/game.php';

let currentUser = null;
let rooms = [];
let cards = [];
let maps = [];
let currentRoom = null;

// ==========================================
// INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadMaps();
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
            loadRooms();
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
    if (section === 'rooms') {
        loadRooms();
    } else if (section === 'cards') {
        loadCards();
    }
}

// ==========================================
// FUNCIONES DE SALAS
// ==========================================

async function loadRooms() {
    try {
        showLoading(true);
        
        // Aquí podrías hacer una llamada para obtener salas existentes
        // Por ahora simulamos salas vacías
        const roomsGrid = document.getElementById('roomsGrid');
        
        // Simular algunas salas de ejemplo
        const mockRooms = [
            {
                id: 1,
                room_code: 'ABC123',
                current_players: 3,
                max_players: 7,
                status: 'waiting',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                room_code: 'XYZ789',
                current_players: 5,
                max_players: 6,
                status: 'playing',
                created_at: new Date().toISOString()
            }
        ];
        
        if (mockRooms.length === 0) {
            roomsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎮</div>
                    <h3>No hay salas activas</h3>
                    <p>¡Crea una nueva sala para comenzar a jugar!</p>
                </div>
            `;
        } else {
            roomsGrid.innerHTML = mockRooms.map(room => `
                <div class="room-card" onclick="showRoomDetails('${room.room_code}')">
                    <div class="room-header">
                        <div class="room-code">${room.room_code}</div>
                        <div class="room-status ${room.status}">
                            ${getStatusText(room.status)}
                        </div>
                    </div>
                    <div class="room-info">
                        <span>👥 ${room.current_players}/${room.max_players}</span>
                        <span>🕐 ${formatTime(room.created_at)}</span>
                    </div>
                </div>
            `).join('');
        }
        
        rooms = mockRooms;
        
    } catch (error) {
        console.error('Error cargando salas:', error);
        showAlert('Error al cargar las salas', 'error');
    } finally {
        showLoading(false);
    }
}

async function createRoom(event) {
    event.preventDefault();
    
    const maxPlayers = parseInt(document.getElementById('maxPlayers').value);
    const isPrivate = document.getElementById('isPrivate').checked;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_ROOMS}?action=create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                max_players: maxPlayers,
                is_private: isPrivate
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('¡Sala creada exitosamente!', 'success');
            hideCreateRoomModal();
            loadRooms(); // Recargar la lista de salas
            
            // Mostrar detalles de la sala recién creada
            setTimeout(() => {
                showRoomDetails(data.room.room_code);
            }, 1000);
        } else {
            showAlert(data.error || 'Error al crear la sala', 'error');
        }
    } catch (error) {
        console.error('Error creando sala:', error);
        showAlert('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        showLoading(false);
    }
}

async function showRoomDetails(roomCode) {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_ROOMS}?action=info&room_code=${roomCode}`);
        const data = await response.json();
        
        if (data.room) {
            currentRoom = data.room;
            
            // Actualizar modal con información de la sala
            document.getElementById('roomTitle').textContent = `🏠 Sala: ${roomCode}`;
            document.getElementById('roomCodeDisplay').textContent = roomCode;
            document.getElementById('playersCount').textContent = 
                `${data.players.length}/${data.room.max_players}`;
            document.getElementById('roomStatus').textContent = getStatusText(data.room.status);
            
            // Mostrar lista de jugadores
            const playersList = document.getElementById('playersList');
            if (data.players.length === 0) {
                playersList.innerHTML = '<p style="color:#666; text-align:center;">No hay jugadores en la sala</p>';
            } else {
                playersList.innerHTML = data.players.map((player, index) => `
                    <div class="player-item">
                        <span>👤 ${player.player_name}</span>
                        <span style="color:#666;">#${index + 1}</span>
                    </div>
                `).join('');
            }
            
            // Mostrar/ocultar botón de iniciar juego según estado
            const startBtn = document.getElementById('startGameBtn');
            if (data.room.status === 'waiting' && data.players.length >= 2) {
                startBtn.style.display = 'block';
            } else {
                startBtn.style.display = 'none';
            }
            
            showRoomDetailsModal();
        } else {
            showAlert('Sala no encontrada', 'error');
        }
    } catch (error) {
        console.error('Error obteniendo detalles de sala:', error);
        showAlert('Error al cargar detalles de la sala', 'error');
    } finally {
        showLoading(false);
    }
}

// ==========================================
// FUNCIONES DE CARTAS
// ==========================================

async function loadMaps() {
    try {
        const response = await fetch(`${API_ROOMS}?action=maps`);
        const data = await response.json();
        
        if (data.maps) {
            maps = data.maps;
            
            // Llenar filtro de mapas
            const mapFilter = document.getElementById('mapFilter');
            mapFilter.innerHTML = '<option value="">Todos los mapas</option>' +
                data.maps.map(map => `<option value="${map.id}">${map.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error cargando mapas:', error);
    }
}

async function loadCards() {
    try {
        showLoading(true);
        
        // Simular cartas de ejemplo ya que no tienes endpoint para obtener todas las cartas
        const mockCards = [
            {
                id: 1,
                name: 'Dragón de Fuego',
                power: 95,
                defense: 80,
                speed: 70,
                intelligence: 85,
                description: 'Un poderoso dragón que domina las llamas del inframundo.',
                image: null
            },
            {
                id: 2,
                name: 'Caballero Valiente',
                power: 75,
                defense: 90,
                speed: 60,
                intelligence: 70,
                description: 'Un noble caballero con armadura encantada.',
                image: null
            },
            {
                id: 3,
                name: 'Mago Ancestral',
                power: 85,
                defense: 50,
                speed: 65,
                intelligence: 98,
                description: 'Un sabio mago con conocimientos milenarios.',
                image: null
            },
            {
                id: 4,
                name: 'Arquera Élfica',
                power: 70,
                defense: 60,
                speed: 95,
                intelligence: 80,
                description: 'Una élfica con puntería infalible.',
                image: null
            },
            {
                id: 5,
                name: 'Troll de Montaña',
                power: 90,
                defense: 95,
                speed: 30,
                intelligence: 40,
                description: 'Una criatura gigante de las montañas.',
                image: null
            },
            {
                id: 6,
                name: 'Ninja Sombra',
                power: 80,
                defense: 65,
                speed: 98,
                intelligence: 85,
                description: 'Un maestro de las artes marciales y la invisibilidad.',
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
    
    // Aquí podrías filtrar por mapa si tuvieras esa información en las cartas
    // if (mapFilter) {
    //     filteredCards = filteredCards.filter(card => card.map_id == mapFilter);
    // }
    
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

function showCreateRoomModal() {
    document.getElementById('createRoomModal').classList.add('active');
}

function hideCreateRoomModal() {
    document.getElementById('createRoomModal').classList.remove('active');
    
    // Limpiar formulario
    document.getElementById('maxPlayers').value = '7';
    document.getElementById('isPrivate').checked = false;
}

function showRoomDetailsModal() {
    document.getElementById('roomDetailsModal').classList.add('active');
}

function hideRoomDetailsModal() {
    document.getElementById('roomDetailsModal').classList.remove('active');
    currentRoom = null;
}

function showCardDetailsModal() {
    document.getElementById('cardDetailsModal').classList.add('active');
}

function hideCardDetailsModal() {
    document.getElementById('cardDetailsModal').classList.remove('active');
}

// Cerrar modales al hacer click fuera
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        hideCreateRoomModal();
        hideRoomDetailsModal();
        hideCardDetailsModal();
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

function getStatusText(status) {
    const statusMap = {
        'waiting': 'Esperando',
        'voting': 'Votando',
        'playing': 'Jugando',
        'finished': 'Terminado'
    };
    return statusMap[status] || status;
}

function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
}

function copyRoomCode() {
    const roomCode = document.getElementById('roomCodeDisplay').textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(roomCode).then(() => {
            showAlert('¡Código copiado al portapapeles!', 'success');
        }).catch(() => {
            fallbackCopyTextToClipboard(roomCode);
        });
    } else {
        fallbackCopyTextToClipboard(roomCode);
    }
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showAlert('¡Código copiado al portapapeles!', 'success');
    } catch (err) {
        showAlert('No se pudo copiar el código', 'error');
    }
    
    document.body.removeChild(textArea);
}

async function deleteRoom() {
    if (!currentRoom) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta sala?')) {
        return;
    }
    
    try {
        showLoading(true);
        
        // Aquí harías la llamada para eliminar la sala
        // const response = await fetch(`${API_ROOMS}?action=delete`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ room_id: currentRoom.id })
        // });
        
        // Simular eliminación exitosa
        showAlert('Sala eliminada correctamente', 'success');
        hideRoomDetailsModal();
        loadRooms();
        
    } catch (error) {
        console.error('Error eliminando sala:', error);
        showAlert('Error al eliminar la sala', 'error');
    } finally {
        showLoading(false);
    }
}

async function startGame() {
    if (!currentRoom) return;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_ROOMS}?action=start_voting`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room_id: currentRoom.id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('¡Votación de mapa iniciada!', 'success');
            hideRoomDetailsModal();
            
            // Aquí podrías redirigir a la pantalla de votación o juego  
            // window.location.href = `game.html?room=${currentRoom.room_code}`;
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
// EVENT LISTENERS
// ==========================================

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hideCreateRoomModal();
        hideRoomDetailsModal();
        hideCardDetailsModal();
        hideAlert();
    }
});

// Auto-refresh de salas cada 30 segundos
setInterval(() => {
    if (document.querySelector('#roomsSection.active')) {
        loadRooms();
    }
}, 30000);