<?php
ob_clean();
require_once '../config/database.php';
require_once '../config/session.php';
require_once '../classes/GameRoom.php';
require_once '../classes/Player.php';
require_once '../classes/Game.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$database = new Database();
$db = $database->getConnection();
$gameRoom = new GameRoom($db);
$player = new Player($db);
$game = new Game($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($action) {
            case 'create':
                $maxPlayers = intval($input['max_players'] ?? 7);
                $room = $gameRoom->createRoom($maxPlayers);
                if ($room) {
                    jsonResponse(['success' => true, 'room' => $room]);
                } else {
                    jsonResponse(['error' => 'Error al crear la sala'], 500);
                }
                break;
                
            case 'join':
                try {
                    $roomId = intval($input['room_id'] ?? 0);
                    $playerName = sanitizeInput($input['player_name'] ?? '');

                    if (!$roomId || empty($playerName)) {
                        jsonResponse([
                            'error' => 'ID de sala y nombre de jugador son requeridos',
                            'received' => [
                                'room_id' => $roomId,
                                'player_name' => $playerName
                            ]
                        ], 400);
                    }

                    $room = $gameRoom->getRoomById($roomId);
                    if (!$room) {
                        jsonResponse(['error' => 'Sala no encontrada', 'room_id' => $roomId], 404);
                    }

                    // Verificar estado de sala
                    if ($room['status'] !== 'waiting') {
                        jsonResponse(['error' => 'La sala no está disponible', 'status' => $room['status']], 400);
                    }
                    
                    // Verificar si la sala está llena
                    if ($gameRoom->isRoomFull($room['id'])) {
                        jsonResponse(['error' => 'La sala está llena'], 400);
                    }
        
                    // Añadir jugador
                    $playerId = $player->addPlayerToRoom($room['id'], $playerName);
                    if ($playerId) {
                        jsonResponse([
                            'success' => true,
                            'player_id' => $playerId,
                            'room_id' => $room['id']
                        ]);
                    } else {
                        $jsonLastError = json_last_error_msg();
                        jsonResponse([
                            'error' => 'Error al añadir jugador',
                            'player_name' => $playerName,
                            'room_id' => $room['id'],
                            'details' => $jsonLastError
                        ], 500);
                    }
                } catch (Exception $e) {
                    error_log("Error en join: " . $e->getMessage());
                    jsonResponse(['error' => 'Error al añadir jugador: ' . $e->getMessage()], 500);
                }
                break;
                
            case 'set_map':
                $roomId = intval($input['room_id'] ?? 0);
                $mapId = intval($input['map_id'] ?? 0);
                
                if (!$roomId || !$mapId) {
                    jsonResponse(['error' => 'Datos incompletos'], 400);
                }
                
                $success = $gameRoom->setSelectedMap($roomId, $mapId);
                if ($success) {
                    jsonResponse(['success' => true]);
                } else {
                    jsonResponse(['error' => 'Error al establecer mapa'], 500);
                }
                break;
                
            case 'start_game':
                try {
                    $roomId = intval($input['room_id'] ?? 0);
                    
                    if (!$roomId) {
                        jsonResponse(['error' => 'ID de sala requerido'], 400);
                    }
                    
                    $room = $gameRoom->getRoomById($roomId);
                    if (!$room) {
                        jsonResponse(['error' => 'Sala no encontrada'], 404);
                    }
                    
                    // Inicializar estado del juego
                    if (!$game->initializeGameState($roomId)) {
                        jsonResponse(['error' => 'Error al inicializar el juego'], 500);
                    }
                    
                    // Asignar cartas a jugadores
                    $cardsAssigned = $game->assignCardsToPlayers($roomId);
                    if (!$cardsAssigned) {
                        jsonResponse(['error' => 'Error al asignar cartas'], 500);
                    }
                    
                    // Obtener estado inicial del juego
                    $gameState = $game->getGameState($roomId);
                    
                    jsonResponse([
                        'success' => true,
                        'game_state' => $gameState,
                        'selected_map' => $room['selected_map_id'] ? $game->getMapById($room['selected_map_id']) : null
                    ]);
                } catch (Exception $e) {
                    error_log("Error en start_game: " . $e->getMessage());
                    jsonResponse(['error' => 'Error al iniciar juego: ' . $e->getMessage()], 500);
                }
                break;
                
            case 'start_round':
                $roomId = intval($input['room_id'] ?? 0);
                
                if (!$roomId) {
                    jsonResponse(['error' => 'ID de sala requerido'], 400);
                }
                
                $result = $game->startNewRound($roomId);
                jsonResponse($result);
                break;
                
            case 'play_card':
                $roomId = intval($input['room_id'] ?? 0);
                $playerId = intval($input['player_id'] ?? 0);
                $cardId = intval($input['card_id'] ?? 0);
                
                if (!$roomId || !$playerId || !$cardId) {
                    jsonResponse(['error' => 'Datos incompletos'], 400);
                }
                
                $result = $game->playCard($roomId, $playerId, $cardId);
                jsonResponse($result);
                break;
                
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'info':
                $roomCode = $_GET['room_code'] ?? '';
                
                if (empty($roomCode)) {
                    jsonResponse(['error' => 'Código de sala requerido'], 400);
                }
                
                $room = $gameRoom->getRoomByCode($roomCode);
                if (!$room) {
                    jsonResponse(['error' => 'Sala no encontrada'], 404);
                }
                
                $players = $player->getPlayersInRoom($room['id']);
                
                jsonResponse([
                    'room' => $room,
                    'players' => $players
                ]);
                break;
                
            case 'maps':
                try {
                    $maps = $game->getAllMaps();
                    jsonResponse(['maps' => $maps]);
                } catch (Exception $e) {
                    jsonResponse(['error' => 'Error al cargar mapas: ' . $e->getMessage()], 500);
                }
                break;
                
            case 'cards':
                try {
                    $cards = $game->getAllCards();
                    jsonResponse(['cards' => $cards]);
                } catch (Exception $e) {
                    jsonResponse(['error' => 'Error al cargar cartas: ' . $e->getMessage()], 500);
                }
                break;
                
            case 'player_cards':
                $roomId = intval($_GET['room_id'] ?? 0);
                $playerId = intval($_GET['player_id'] ?? 0);
                
                if (!$roomId || !$playerId) {
                    jsonResponse(['error' => 'Datos incompletos'], 400);
                }
                
                $cards = $game->getPlayerCards($roomId, $playerId);
                jsonResponse(['cards' => $cards]);
                break;
                
            case 'room_status':
                $roomId = intval($_GET['room_id'] ?? 0);
                
                if (!$roomId) {
                    jsonResponse(['error' => 'ID de sala requerido'], 400);
                }
                
                $room = $gameRoom->getRoomById($roomId);
                if (!$room) {
                    jsonResponse(['error' => 'Sala no encontrada'], 404);
                }
                
                $players = $player->getPlayersInRoom($roomId);
                
                $selectedMap = null;
                if ($room['selected_map_id']) {
                    $selectedMap = $game->getMapById($room['selected_map_id']);
                }
                
                // Obtener el jugador del turno actual
                $currentPlayer = null;
                if ($room['current_turn'] > 0) {
                    $currentPlayer = $game->getCurrentTurnPlayer($roomId);
                }
                
                jsonResponse([
                    'room' => $room,
                    'players' => $players,
                    'selected_map' => $selectedMap,
                    'current_player' => $currentPlayer
                ]);
                break;
                
            case 'round_result':
                $roomId = intval($_GET['room_id'] ?? 0);
                $roundNumber = intval($_GET['round'] ?? 0);
                
                if (!$roomId || !$roundNumber) {
                    jsonResponse(['error' => 'Datos incompletos'], 400);
                }
                
                $result = $game->getRoundResult($roomId, $roundNumber);
                jsonResponse($result);
                break;
                
            case 'final_results':
                $roomId = intval($_GET['room_id'] ?? 0);
                
                if (!$roomId) {
                    jsonResponse(['error' => 'ID de sala requerido'], 400);
                }
                
                $results = $game->getFinalResults($roomId);
                jsonResponse($results);
                break;
                
            case 'game_state':
                $roomId = intval($_GET['room_id'] ?? 0);
                
                if (!$roomId) {
                    jsonResponse(['error' => 'ID de sala requerido'], 400);
                }
                
                $gameState = $game->getGameState($roomId);
                $isFinished = $game->isGameFinished($roomId);
                
                jsonResponse([
                    'game_state' => $gameState,
                    'is_finished' => $isFinished
                ]);
                break;
                
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}
?>