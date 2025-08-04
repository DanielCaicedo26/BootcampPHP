<?php
class Game {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    // Obtener todos los mapas
    public function getAllMaps() {
        try {
            ob_clean(); // Limpiar buffer de salida
            $stmt = $this->db->prepare("SELECT id, name, description, image_url FROM maps");
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en getAllMaps: " . $e->getMessage());
            return [];
        }
    }

    // Obtener mapa por ID
    public function getMapById($mapId) {
        $stmt = $this->db->prepare("SELECT id, name, description, image_url FROM maps WHERE id = ?");
        $stmt->execute([$mapId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Obtener todas las cartas
    public function getAllCards() {
        $stmt = $this->db->prepare("SELECT id, name, altura_mts, tecnica, fuerza, peleas_ganadas, velocidad_percent, ki, image_url FROM cards ORDER BY name");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Obtener carta por ID
    public function getCardById($cardId) {
        $stmt = $this->db->prepare("SELECT id, name, altura_mts, tecnica, fuerza, peleas_ganadas, velocidad_percent, ki, image_url FROM cards WHERE id = ?");
        $stmt->execute([$cardId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Inicializar estado del juego
    public function initializeGameState($roomId) {
        $stmt = $this->db->prepare("
            UPDATE game_rooms 
            SET current_round = 1,
                status = 'playing',
                started_at = NOW()
            WHERE id = ?
        ");
        return $stmt->execute([$roomId]);
    }

    // Asignar 8 cartas aleatorias a cada jugador de la sala
    public function assignCardsToPlayers($roomId) {
        try {
            $this->db->beginTransaction();
            
            // Obtener todos los jugadores de la sala
            $stmt = $this->db->prepare("SELECT id FROM room_players WHERE room_id = ? ORDER BY player_order");
            $stmt->execute([$roomId]);
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Obtener todas las cartas disponibles
            $stmt = $this->db->prepare("SELECT id FROM cards");
            $stmt->execute();
            $allCards = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Mezclar las cartas
            shuffle($allCards);
            
            // Asignar 8 cartas a cada jugador
            $cardIndex = 0;
            foreach ($players as $player) {
                for ($i = 0; $i < 8; $i++) {
                    if ($cardIndex >= count($allCards)) {
                        // Si se agotan las cartas, volver a mezclar
                        shuffle($allCards);
                        $cardIndex = 0;
                    }
                    
                    $stmt = $this->db->prepare("
                        INSERT INTO player_cards (room_id, player_id, card_id) 
                        VALUES (?, ?, ?)
                    ");
                    $stmt->execute([$roomId, $player['id'], $allCards[$cardIndex]]);
                    $cardIndex++;
                }
            }
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error asignando cartas: " . $e->getMessage());
            return false;
        }
    }

    // Obtener cartas de un jugador
    public function getPlayerCards($roomId, $playerId) {
        $stmt = $this->db->prepare("
            SELECT c.id, c.name, c.altura_mts, c.tecnica, c.fuerza, 
                   c.peleas_ganadas, c.velocidad_percent, c.ki, c.image_url
            FROM player_cards pc
            JOIN cards c ON pc.card_id = c.id
            WHERE pc.room_id = ? AND pc.player_id = ? AND pc.is_used = 0
            ORDER BY c.name
        ");
        $stmt->execute([$roomId, $playerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Obtener estado completo del juego
    public function getGameState($roomId) {
        // Obtener información de la sala
        $stmt = $this->db->prepare("
            SELECT gr.*, m.name as map_name, m.image_url as map_image
            FROM game_rooms gr
            LEFT JOIN maps m ON gr.selected_map_id = m.id
            WHERE gr.id = ?
        ");
        $stmt->execute([$roomId]);
        $room = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Obtener jugadores con sus puntajes
        $stmt = $this->db->prepare("
            SELECT id, player_name, score, player_order
            FROM room_players 
            WHERE room_id = ? 
            ORDER BY player_order
        ");
        $stmt->execute([$roomId]);
        $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Obtener la ronda actual si existe
        $currentRound = null;
        if ($room['current_round'] > 0) {
            $stmt = $this->db->prepare("
                SELECT * FROM game_rounds 
                WHERE room_id = ? AND round_number = ?
            ");
            $stmt->execute([$roomId, $room['current_round']]);
            $currentRound = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        return [
            'room' => $room,
            'players' => $players,
            'current_round' => $currentRound,
            'current_turn' => $this->getCurrentTurn($roomId)
        ];
    }

    // Obtener turno actual (jugador que debe elegir atributo)
    private function getCurrentTurn($roomId) {
        $stmt = $this->db->prepare("
            SELECT current_round, current_turn FROM game_rooms WHERE id = ?
        ");
        $stmt->execute([$roomId]);
        $room = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$room) return null;
        
        // El turno rota entre jugadores por ronda
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as player_count FROM room_players WHERE room_id = ?
        ");
        $stmt->execute([$roomId]);
        $playerCount = $stmt->fetchColumn();
        
        $currentTurnIndex = ($room['current_round'] - 1) % $playerCount;
        
        $stmt = $this->db->prepare("
            SELECT id, player_name FROM room_players 
            WHERE room_id = ? 
            ORDER BY player_order 
            LIMIT 1 OFFSET ?
        ");
        $stmt->execute([$roomId, $currentTurnIndex]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Iniciar nueva ronda con atributo aleatorio
    public function startNewRound($roomId) {
        try {
            $this->db->beginTransaction();
            
            // Obtener número de ronda actual
            $stmt = $this->db->prepare("SELECT current_round FROM game_rooms WHERE id = ?");
            $stmt->execute([$roomId]);
            $currentRound = $stmt->fetchColumn();
            
            if ($currentRound > 8) {
                $this->db->rollback();
                return ['error' => 'El juego ya ha terminado'];
            }
            
            // Verificar si ya existe una ronda activa
            $stmt = $this->db->prepare("
                SELECT id FROM game_rounds 
                WHERE room_id = ? AND round_number = ? AND winner_player_id IS NULL
            ");
            $stmt->execute([$roomId, $currentRound]);
            $existingRound = $stmt->fetch();
            
            if ($existingRound) {
                // Ya hay una ronda activa, devolver su información
                $stmt = $this->db->prepare("
                    SELECT selected_attribute FROM game_rounds 
                    WHERE id = ?
                ");
                $stmt->execute([$existingRound['id']]);
                $selectedAttribute = $stmt->fetchColumn();
                
                $this->db->commit();
                return [
                    'success' => true,
                    'round_id' => $existingRound['id'],
                    'round_number' => $currentRound,
                    'selected_attribute' => $selectedAttribute,
                    'attribute_name' => $this->getAttributeName($selectedAttribute)
                ];
            }
            
            // Seleccionar atributo aleatorio
            $attributes = ['altura_mts', 'tecnica', 'fuerza', 'peleas_ganadas', 'velocidad_percent', 'ki'];
            $selectedAttribute = $attributes[array_rand($attributes)];
            
            // Crear nueva ronda
            $stmt = $this->db->prepare("
                INSERT INTO game_rounds (room_id, round_number, selected_attribute)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$roomId, $currentRound, $selectedAttribute]);
            $roundId = $this->db->lastInsertId();
            
            $this->db->commit();
            
            return [
                'success' => true,
                'round_id' => $roundId,
                'round_number' => $currentRound,
                'selected_attribute' => $selectedAttribute,
                'attribute_name' => $this->getAttributeName($selectedAttribute)
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error iniciando ronda: " . $e->getMessage());
            return ['error' => 'Error al iniciar la ronda'];
        }
    }

    // Jugar una carta en la ronda actual
    public function playCard($roomId, $playerId, $cardId) {
        try {
            $this->db->beginTransaction();
            
            // Verificar que la carta pertenece al jugador
            $stmt = $this->db->prepare("
                SELECT pc.id, c.* FROM player_cards pc
                JOIN cards c ON pc.card_id = c.id
                WHERE pc.room_id = ? AND pc.player_id = ? AND pc.card_id = ? AND pc.is_used = 0
            ");
            $stmt->execute([$roomId, $playerId, $cardId]);
            $playerCard = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$playerCard) {
                $this->db->rollback();
                return ['error' => 'Carta no válida o ya utilizada'];
            }
            
            // Obtener ronda actual
            $stmt = $this->db->prepare("
                SELECT gr.*, r.selected_attribute 
                FROM game_rooms gr
                JOIN game_rounds r ON gr.id = r.room_id AND gr.current_round = r.round_number
                WHERE gr.id = ?
            ");
            $stmt->execute([$roomId]);
            $gameData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$gameData) {
                $this->db->rollback();
                return ['error' => 'No hay ronda activa'];
            }
            
            // Verificar si el jugador ya jugó en esta ronda
            $stmt = $this->db->prepare("
                SELECT id FROM round_cards 
                WHERE round_id = (SELECT id FROM game_rounds WHERE room_id = ? AND round_number = ?) 
                AND player_id = ?
            ");
            $stmt->execute([$roomId, $gameData['current_round'], $playerId]);
            if ($stmt->fetch()) {
                $this->db->rollback();
                return ['error' => 'Ya jugaste una carta en esta ronda'];
            }
            
            // Obtener valor del atributo seleccionado
            $attributeValue = $playerCard[$gameData['selected_attribute']];
            
            // Registrar la carta jugada
            $stmt = $this->db->prepare("
                INSERT INTO round_cards (round_id, player_id, card_id, attribute_value)
                SELECT id, ?, ?, ? FROM game_rounds 
                WHERE room_id = ? AND round_number = ?
            ");
            $stmt->execute([$playerId, $cardId, $attributeValue, $roomId, $gameData['current_round']]);
            
            // Marcar carta como usada
            $stmt = $this->db->prepare("
                UPDATE player_cards SET is_used = 1 
                WHERE room_id = ? AND player_id = ? AND card_id = ?
            ");
            $stmt->execute([$roomId, $playerId, $cardId]);
            
            $this->db->commit();
            
            // Verificar si todos los jugadores han jugado
            $roundResult = $this->checkRoundCompletion($roomId);
            
            return [
                'success' => true,
                'attribute_value' => $attributeValue,
                'round_complete' => $roundResult !== null,
                'round_result' => $roundResult
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error jugando carta: " . $e->getMessage());
            return ['error' => 'Error al jugar la carta'];
        }
    }

    // Verificar si la ronda está completa y calcular ganador
    private function checkRoundCompletion($roomId) {
        // Obtener número total de jugadores
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM room_players WHERE room_id = ?");
        $stmt->execute([$roomId]);
        $totalPlayers = $stmt->fetchColumn();
        
        // Obtener ronda actual
        $stmt = $this->db->prepare("SELECT current_round FROM game_rooms WHERE id = ?");
        $stmt->execute([$roomId]);
        $currentRound = $stmt->fetchColumn();
        
        // Contar cartas jugadas en la ronda actual
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM round_cards rc
            JOIN game_rounds r ON rc.round_id = r.id
            WHERE r.room_id = ? AND r.round_number = ?
        ");
        $stmt->execute([$roomId, $currentRound]);
        $cardsPlayed = $stmt->fetchColumn();
        
        if ($cardsPlayed < $totalPlayers) {
            return null; // Ronda aún no completa
        }
        
        // Encontrar el ganador (mayor valor de atributo)
        $stmt = $this->db->prepare("
            SELECT rc.player_id, rc.attribute_value, rp.player_name, c.name as card_name
            FROM round_cards rc
            JOIN game_rounds r ON rc.round_id = r.id
            JOIN room_players rp ON rc.player_id = rp.id
            JOIN cards c ON rc.card_id = c.id
            WHERE r.room_id = ? AND r.round_number = ?
            ORDER BY rc.attribute_value DESC
            LIMIT 1
        ");
        $stmt->execute([$roomId, $currentRound]);
        $winner = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($winner) {
            // Actualizar puntaje del ganador
            $stmt = $this->db->prepare("
                UPDATE room_players SET score = score + 1 WHERE id = ?
            ");
            $stmt->execute([$winner['player_id']]);
            
            // Marcar ganador en la ronda
            $stmt = $this->db->prepare("
                UPDATE game_rounds SET winner_player_id = ? 
                WHERE room_id = ? AND round_number = ?
            ");
            $stmt->execute([$winner['player_id'], $roomId, $currentRound]);
            
            // Avanzar a la siguiente ronda o terminar juego
            if ($currentRound < 8) {
                $stmt = $this->db->prepare("
                    UPDATE game_rooms SET current_round = current_round + 1 
                    WHERE id = ?
                ");
                $stmt->execute([$roomId]);
            } else {
                // Juego terminado
                $stmt = $this->db->prepare("
                    UPDATE game_rooms SET status = 'finished' WHERE id = ?
                ");
                $stmt->execute([$roomId]);
            }
        }
        
        return $winner;
    }

    // Obtener resultado de la ronda actual
    public function getRoundResult($roomId, $roundNumber) {
        $stmt = $this->db->prepare("
            SELECT rc.player_id, rc.attribute_value, rp.player_name, c.name as card_name,
                   r.selected_attribute, r.winner_player_id
            FROM round_cards rc
            JOIN game_rounds r ON rc.round_id = r.id
            JOIN room_players rp ON rc.player_id = rp.id
            JOIN cards c ON rc.card_id = c.id
            WHERE r.room_id = ? AND r.round_number = ?
            ORDER BY rc.attribute_value DESC
        ");
        $stmt->execute([$roomId, $roundNumber]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'cards_played' => $results,
            'winner' => $results[0] ?? null,
            'attribute' => $results[0]['selected_attribute'] ?? null,
            'attribute_name' => $this->getAttributeName($results[0]['selected_attribute'] ?? '')
        ];
    }

    // Obtener nombre legible del atributo
    private function getAttributeName($attribute) {
        $names = [
            'altura_mts' => 'Altura',
            'tecnica' => 'Técnica', 
            'fuerza' => 'Fuerza',
            'peleas_ganadas' => 'Peleas Ganadas',
            'velocidad_percent' => 'Velocidad',
            'ki' => 'Ki'
        ];
        return $names[$attribute] ?? $attribute;
    }

    // Obtener resultado final del juego
    public function getFinalResults($roomId) {
        $stmt = $this->db->prepare("
            SELECT player_name, score 
            FROM room_players 
            WHERE room_id = ? 
            ORDER BY score DESC, player_order ASC
        ");
        $stmt->execute([$roomId]);
        $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'final_standings' => $players,
            'winner' => $players[0] ?? null
        ];
    }

    // Verificar si el juego ha terminado
    public function isGameFinished($roomId) {
        $stmt = $this->db->prepare("SELECT status, current_round FROM game_rooms WHERE id = ?");
        $stmt->execute([$roomId]);
        $room = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $room['status'] === 'finished' || $room['current_round'] > 8;
    }
}