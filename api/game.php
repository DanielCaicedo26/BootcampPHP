<?php
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
            case 'create_round':
                $roomId = intval($input['room_id'] ?? 0);
                $roundNumber = intval($input['round_number'] ?? 0);
                $selectedAttribute = intval($input['selected_attribute'] ?? 0);
                
                if (!$roomId || !$roundNumber || !$selectedAttribute) {
                    jsonResponse(['error' => 'Datos incompletos'], 400);
                }
                
                $roundId = $game->createRound($roomId, $roundNumber, $selectedAttribute);
                if ($roundId) {
                    // Actualizar sala con ronda actual
                    $gameRoom->updateCurrentRound($roomId, $roundNumber, $selectedAttribute);
                    jsonResponse(['success' => true, 'round_id' => $roundId]);
                } else {
                    jsonResponse(['error' => 'Error al crear ronda'], 500);
                }
                break;
                
            case 'finish_round':
                $roundId = intval($input['round_id'] ?? 0);
                
                if (!$roundId) {
                    jsonResponse(['error' => 'ID de ronda requerido'], 400);
                }
                
                $roundCards = $game->getRoundCards($roundId);
                if (empty($roundCards)) {
                    jsonResponse(['error' => 'No hay cartas en la ronda'], 400);
                }
                
                // El primer elemento ya está ordenado por valor más alto
                $winner = $roundCards[0];
                
                // Establecer ganador de la ronda
                $game->setRoundWinner($roundId, $winner['player_id']);
                
                // Actualizar puntaje del jugador
                $player->updatePlayerScore($winner['player_id'], 1);
                
                jsonResponse([
                    'success' => true,
                    'winner' => $winner,
                    'round_results' => $roundCards
                ]);
                break;
                
            case 'finish_game':
                $roomId = intval($input['room_id'] ?? 0);
                
                if (!$roomId) {
                    jsonResponse(['error' => 'ID de sala requerido'], 400);
                }
                
                // Cambiar estado de la sala
                $gameRoom->updateRoomStatus($roomId, 'finished');
                
                // Obtener resultados finales
                $results = $game->getGameResults($roomId);
                
                jsonResponse([
                    'success' => true,
                    'results' => $results
                ]);
                break;
                
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'round_cards':
                $roundId = intval($_GET['round_id'] ?? 0);
                
                if (!$roundId) {
                    jsonResponse(['error' => 'ID de ronda requerido'], 400);
                }
                
                $cards = $game->getRoundCards($roundId);
                jsonResponse(['cards' => $cards]);
                break;
                
            case 'results':
                $roomId = intval($_GET['room_id'] ?? 0);
                
                if (!$roomId) {
                    jsonResponse(['error' => 'ID de sala requerido'], 400);
                }
                
                $results = $game->getGameResults($roomId);
                jsonResponse(['results' => $results]);
                break;
                
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}
?>