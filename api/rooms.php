<?php
// Limpiar buffer de salida para evitar problemas con JSON
ob_clean();

// Cargar las dependencias necesarias del sistema
include_once '../config/database.php';
include_once '../config/session.php';
include_once '../classes/GameRoom.php';
include_once '../classes/Player.php';
include_once '../classes/Game.php';

// Configurar headers para respuestas JSON y CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar solicitudes preflight de CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inicializar conexiones y objetos principales
$dbInstance = new Database();
$connection = $dbInstance->getConnection();
$roomManager = new GameRoom($connection);
$playerHandler = new Player($connection);
$gameController = new Game($connection);

// Obtener método HTTP y acción solicitada
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestAction = isset($_GET['action']) ? $_GET['action'] : '';

// Procesar según el método HTTP recibido
switch ($requestMethod) {
    case 'POST':
        // Decodificar datos JSON del cuerpo de la petición
        $inputData = json_decode(file_get_contents('php://input'), true);
        
        switch ($requestAction) {
            case 'create':
                // Crear nueva sala de juego
                $maxPlayersAllowed = intval($inputData['max_players'] ?? 7);
                $newRoom = $roomManager->createRoom($maxPlayersAllowed);
                
                if ($newRoom !== false) {
                    jsonResponse(['success' => true, 'room' => $newRoom]);
                } else {
                    jsonResponse(['error' => 'No se pudo crear la sala de juego'], 500);
                }
                break;
                
            case 'join':
                try {
                    // Procesar solicitud de unirse a sala
                    $targetRoomId = intval($inputData['room_id'] ?? 0);
                    $playerNickname = sanitizeInput($inputData['player_name'] ?? '');

                    // Validar datos de entrada
                    if ($targetRoomId <= 0 || strlen($playerNickname) === 0) {
                        jsonResponse([
                            'error' => 'Se requiere ID de sala válido y nombre de jugador',
                            'received_data' => [
                                'room_id' => $targetRoomId,
                                'player_name' => $playerNickname
                            ]
                        ], 400);
                    }

                    // Buscar la sala solicitada
                    $targetRoom = $roomManager->getRoomById($targetRoomId);
                    if (!$targetRoom) {
                        jsonResponse(['error' => 'La sala solicitada no existe', 'room_id' => $targetRoomId], 404);
                    }

                    // Verificar disponibilidad de la sala
                    if ($targetRoom['status'] != 'waiting') {
                        jsonResponse(['error' => 'Esta sala ya no acepta nuevos jugadores', 'current_status' => $targetRoom['status']], 400);
                    }
                    
                    // Comprobar si hay espacio disponible
                    if ($roomManager->isRoomFull($targetRoom['id'])) {
                        jsonResponse(['error' => 'No hay espacios disponibles en esta sala'], 400);
                    }
        
                    // Intentar agregar el jugador a la sala
                    $newPlayerId = $playerHandler->addPlayerToRoom($targetRoom['id'], $playerNickname);
                    if ($newPlayerId) {
                        jsonResponse([
                            'success' => true,
                            'player_id' => $newPlayerId,
                            'room_id' => $targetRoom['id'],
                            'message' => 'Te has unido exitosamente a la sala'
                        ]);
                    } else {
                        $jsonError = json_last_error_msg();
                        jsonResponse([
                            'error' => 'Error al procesar tu ingreso a la sala',
                            'player_name' => $playerNickname,
                            'room_id' => $targetRoom['id'],
                            'technical_details' => $jsonError
                        ], 500);
                    }
                } catch (Exception $exception) {
                    error_log("Error al unirse a sala: " . $exception->getMessage());
                    jsonResponse(['error' => 'Problema al unirse a la sala: ' . $exception->getMessage()], 500);
                }
                break;
                
            case 'set_map':
                // Establecer mapa seleccionado para la sala
                $gameRoomId = intval($inputData['room_id'] ?? 0);
                $selectedMapId = intval($inputData['map_id'] ?? 0);
                
                if ($gameRoomId <= 0 || $selectedMapId <= 0) {
                    jsonResponse(['error' => 'Información incompleta para establecer el mapa'], 400);
                }
                
                $mapSetSuccessfully = $roomManager->setSelectedMap($gameRoomId, $selectedMapId);
                if ($mapSetSuccessfully) {
                    jsonResponse(['success' => true, 'message' => 'Mapa configurado correctamente']);
                } else {
                    jsonResponse(['error' => 'No se pudo configurar el mapa seleccionado'], 500);
                }
                break;
                
            case 'start_game':
                try {
                    // Iniciar partida en la sala especificada
                    $gameRoomId = intval($inputData['room_id'] ?? 0);
                    
                    if ($gameRoomId <= 0) {
                        jsonResponse(['error' => 'Se necesita un ID de sala válido'], 400);
                    }
                    
                    // Verificar que la sala existe
                    $gameRoom = $roomManager->getRoomById($gameRoomId);
                    if (!$gameRoom) {
                        jsonResponse(['error' => 'La sala especificada no fue encontrada'], 404);
                    }
                    
                    // Preparar el estado inicial del juego
                    $gameInitialized = $gameController->initializeGameState($gameRoomId);
                    if (!$gameInitialized) {
                        jsonResponse(['error' => 'Fallo al preparar el estado inicial del juego'], 500);
                    }
                    
                    // Distribuir cartas entre los participantes
                    $cardsDistributed = $gameController->assignCardsToPlayers($gameRoomId);
                    if (!$cardsDistributed) {
                        jsonResponse(['error' => 'Error en la distribución de cartas'], 500);
                    }
                    
                    // Obtener información del estado actual
                    $currentGameState = $gameController->getGameState($gameRoomId);
                    
                    // Preparar respuesta con información del juego
                    $responseData = [
                        'success' => true,
                        'game_state' => $currentGameState,
                        'message' => 'Juego iniciado correctamente'
                    ];
                    
                    // Incluir información del mapa si está disponible
                    if ($gameRoom['selected_map_id']) {
                        $responseData['selected_map'] = $gameController->getMapById($gameRoom['selected_map_id']);
                    } else {
                        $responseData['selected_map'] = null;
                    }
                    
                    jsonResponse($responseData);
                } catch (Exception $ex) {
                    error_log("Error iniciando juego: " . $ex->getMessage());
                    jsonResponse(['error' => 'Problema al iniciar la partida: ' . $ex->getMessage()], 500);
                }
                break;
                
            case 'start_round':
                // Comenzar nueva ronda de juego
                $roomIdentifier = intval($inputData['room_id'] ?? 0);
                
                if ($roomIdentifier <= 0) {
                    jsonResponse(['error' => 'ID de sala requerido para iniciar ronda'], 400);
                }
                
                $roundResult = $gameController->startNewRound($roomIdentifier);
                jsonResponse($roundResult);
                break;
                
            // NUEVA ACCIÓN: Seleccionar atributo para la ronda
            case 'select_attribute':
                try {
                    $roomId = intval($inputData['room_id'] ?? 0);
                    $selectedAttribute = $inputData['selected_attribute'] ?? '';
                    
                    if ($roomId <= 0 || empty($selectedAttribute)) {
                        jsonResponse(['error' => 'Se requiere ID de sala y atributo seleccionado'], 400);
                    }
                    
                    $result = $gameController->selectAttributeForRound($roomId, $selectedAttribute);
                    jsonResponse($result);
                } catch (Exception $e) {
                    error_log("Error seleccionando atributo: " . $e->getMessage());
                    jsonResponse(['error' => 'Error al seleccionar atributo: ' . $e->getMessage()], 500);
                }
                break;
                
            case 'play_card':
                // Procesar jugada de carta
                $roomId = intval($inputData['room_id'] ?? 0);
                $playerId = intval($inputData['player_id'] ?? 0);
                $cardId = intval($inputData['card_id'] ?? 0);
                
                if ($roomId <= 0 || $playerId <= 0 || $cardId <= 0) {
                    jsonResponse(['error' => 'Faltan datos necesarios para procesar la jugada'], 400);
                }
                
                $playResult = $gameController->playCard($roomId, $playerId, $cardId);
                jsonResponse($playResult);
                break;
                
            default:
                jsonResponse(['error' => 'La acción solicitada no está disponible'], 400);
        }
        break;
        
    case 'GET':
        switch ($requestAction) {
            case 'info':
                // Obtener información de sala por código
                $roomCode = $_GET['room_code'] ?? '';
                
                if (empty($roomCode)) {
                    jsonResponse(['error' => 'Se necesita proporcionar el código de sala'], 400);
                }
                
                $roomInfo = $roomManager->getRoomByCode($roomCode);
                if (!$roomInfo) {
                    jsonResponse(['error' => 'No se encontró sala con ese código'], 404);
                }
                
                $participantsList = $playerHandler->getPlayersInRoom($roomInfo['id']);
                
                jsonResponse([
                    'room' => $roomInfo,
                    'players' => $participantsList
                ]);
                break;
                
            case 'maps':
                try {
                    // Recuperar todos los mapas disponibles
                    $availableMaps = $gameController->getAllMaps();
                    jsonResponse(['maps' => $availableMaps]);
                } catch (Exception $e) {
                    jsonResponse(['error' => 'Fallo al obtener mapas disponibles: ' . $e->getMessage()], 500);
                }
                break;
                
            case 'cards':
                try {
                    // Obtener colección completa de cartas
                    $gameCards = $gameController->getAllCards();
                    jsonResponse(['cards' => $gameCards]);
                } catch (Exception $e) {
                    jsonResponse(['error' => 'Error cargando las cartas del juego: ' . $e->getMessage()], 500);
                }
                break;
                
            case 'player_cards':
                // Consultar cartas de un jugador específico
                $roomId = intval($_GET['room_id'] ?? 0);
                $playerId = intval($_GET['player_id'] ?? 0);
                
                if ($roomId <= 0 || $playerId <= 0) {
                    jsonResponse(['error' => 'Se requieren ID de sala y jugador válidos'], 400);
                }
                
                $playerCards = $gameController->getPlayerCards($roomId, $playerId);
                jsonResponse(['cards' => $playerCards]);
                break;
                
            case 'room_status':
                // Verificar estado actual de una sala
                $roomIdentifier = intval($_GET['room_id'] ?? 0);
                
                if ($roomIdentifier <= 0) {
                    jsonResponse(['error' => 'ID de sala necesario para consultar estado'], 400);
                }
                
                $roomData = $roomManager->getRoomById($roomIdentifier);
                if ($roomData === false) {
                    jsonResponse(['error' => 'Sala no localizada'], 404);
                }
                
                $roomPlayers = $playerHandler->getPlayersInRoom($roomIdentifier);
                
                // Obtener información del mapa si existe
                $mapInfo = null;
                if (!empty($roomData['selected_map_id'])) {
                    $mapInfo = $gameController->getMapById($roomData['selected_map_id']);
                }
                
                // Determinar jugador del turno actual
                $activePlayer = null;
                if ($roomData['current_turn'] > 0) {
                    $activePlayer = $gameController->getCurrentTurnPlayer($roomIdentifier);
                }
                
                // NUEVO: Verificar si necesita selección de atributo
                $needsAttributeSelection = $gameController->needsAttributeSelection($roomIdentifier);
                
                jsonResponse([
                    'room' => $roomData,
                    'players' => $roomPlayers,
                    'selected_map' => $mapInfo,
                    'current_player' => $activePlayer,
                    'needs_attribute_selection' => $needsAttributeSelection
                ]);
                break;
                
            // NUEVA ACCIÓN: Verificar si necesita selección de atributo
            case 'needs_attribute_selection':
                $roomId = intval($_GET['room_id'] ?? 0);
                
                if ($roomId <= 0) {
                    jsonResponse(['error' => 'ID de sala requerido'], 400);
                }
                
                $needsSelection = $gameController->needsAttributeSelection($roomId);
                jsonResponse(['needs_selection' => $needsSelection]);
                break;
                
            case 'round_result':
                // Obtener resultado de ronda específica
                $roomId = intval($_GET['room_id'] ?? 0);
                $roundNum = intval($_GET['round'] ?? 0);
                
                if ($roomId <= 0 || $roundNum <= 0) {
                    jsonResponse(['error' => 'Se necesitan ID de sala y número de ronda'], 400);
                }
                
                $roundResult = $gameController->getRoundResult($roomId, $roundNum);
                jsonResponse($roundResult);
                break;
                
            case 'final_results':
                // Consultar resultados finales del juego
                $gameRoomId = intval($_GET['room_id'] ?? 0);
                
                if ($gameRoomId <= 0) {
                    jsonResponse(['error' => 'ID de sala requerido para resultados finales'], 400);
                }
                
                $finalResults = $gameController->getFinalResults($gameRoomId);
                jsonResponse($finalResults);
                break;
                
            case 'game_state':
                // Obtener estado completo del juego
                $roomId = intval($_GET['room_id'] ?? 0);
                
                if ($roomId <= 0) {
                    jsonResponse(['error' => 'ID de sala necesario'], 400);
                }
                
                $currentState = $gameController->getGameState($roomId);
                $gameCompleted = $gameController->isGameFinished($roomId);
                
                jsonResponse([
                    'game_state' => $currentState,
                    'is_finished' => $gameCompleted
                ]);
                break;
                
            default:
                jsonResponse(['error' => 'Operación no reconocida'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Método HTTP no soportado'], 405);
}
?>