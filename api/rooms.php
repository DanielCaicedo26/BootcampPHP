<?php
require_once '../config/database.php';
require_once '../config/session.php';
require_once '../config/utils.php';
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
                $roomCode = sanitizeInput($input['room_code'] ?? '');
                $playerName = sanitizeInput($input['player_name'] ?? '');
                $userId = $_SESSION['user_id'] ?? null;
                
                if (empty($roomCode) || empty($playerName)) {
                    jsonResponse(['error' => 'Código de sala y nombre de jugador son requeridos'], 400);
                }
                
                $room = $gameRoom->getRoomByCode($roomCode);
                if (!$room) {
                    jsonResponse(['error' => 'Sala no encontrada'], 404);
                }
                
                if ($room['status'] !== 'waiting') {
                    jsonResponse(['error' => 'La sala no está disponible para nuevos jugadores'], 400);
                }
                
                $playerId = $player->addPlayerToRoom($room['id'], $playerName, $userId);
                if ($playerId) {
                    $_SESSION['current_room_id'] = $room['id'];
                    $_SESSION['current_player_id'] = $playerId;
                    jsonResponse(['success' => true, 'player_id' => $playerId, 'room_id' => $room['id']]);
                } else {
                    jsonResponse(['error' => 'No se pudo unir a la sala (puede estar llena)'], 400);
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
                $roomId = intval($input['room_id'] ?? 0);
                
                if (!$roomId) {
                    jsonResponse(['error' => 'ID de sala requerido'], 400);
                }
                
                // Verificar que la sala tenga un mapa seleccionado
                $room = $gameRoom->getRoomById($roomId);
                if (!$room || !$room['selected_map_id']) {
                    jsonResponse(['error' => 'La sala debe tener un mapa seleccionado'], 400);
                }
                
                // Asignar cartas a jugadores
                $cardsAssigned = $game->assignCardsToPlayers($roomId);
                if (!$cardsAssigned) {
                    jsonResponse(['error' => 'Error al asignar cartas'], 500);
                }
                
                // Cambiar estado a jugando
                $gameRoom->updateRoomStatus($roomId, 'playing');
                
                // Obtener información del mapa seleccionado
                $selectedMap = $game->getMapById($room['selected_map_id']);
                
                jsonResponse(['success' => true, 'selected_map' => $selectedMap]);
                break;
                
            case 'play_card':
                $roomId = intval($input['room_id'] ?? 0);
                $playerId = intval($input['player_id'] ?? 0);
                $cardId = intval($input['card_id'] ?? 0);
                $roundId = intval($input['round_id'] ?? 0);
                $attributeValue = intval($input['attribute_value'] ?? 0);
                
                if (!$roomId || !$playerId || !$cardId || !$roundId || !$attributeValue) {
                    jsonResponse(['error' => 'Datos incompletos'], 400);
                }
                
                $success = $game->playCard($roomId, $playerId, $cardId, $roundId, $attributeValue);
                if ($success) {
                    jsonResponse(['success' => true]);
                } else {
                    jsonResponse(['error' => 'Error al jugar carta'], 500);
                }
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
                $maps = $game->getAllMaps();
                jsonResponse(['maps' => $maps]);
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
                $players = $player->getPlayersInRoom($roomId);
                
                $selectedMap = null;
                if ($room['selected_map_id']) {
                    $selectedMap = $game->getMapById($room['selected_map_id']);
                }
                
                jsonResponse([
                    'room' => $room,
                    'players' => $players,
                    'selected_map' => $selectedMap
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