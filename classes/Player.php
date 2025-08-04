<?php
class Player {
    private $conn;
    private $table_name = "room_players";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function addPlayerToRoom($roomId, $playerName, $userId = null) {
        try {
            // Verificar si la sala está llena
            $currentPlayers = $this->getPlayerCountInRoom($roomId);
            
            // Obtener información de la sala directamente
            $roomQuery = "SELECT max_players FROM game_rooms WHERE id = ?";
            $roomStmt = $this->conn->prepare($roomQuery);
            $roomStmt->execute([$roomId]);
            $roomData = $roomStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$roomData) {
                error_log("Sala no encontrada con ID: $roomId");
                return false;
            }
            
            if ($currentPlayers >= $roomData['max_players']) {
                error_log("Sala llena. Jugadores actuales: $currentPlayers, Máximo: {$roomData['max_players']}");
                return false;
            }

            $playerOrder = $currentPlayers + 1;
            
            $query = "INSERT INTO " . $this->table_name . " (room_id, player_name, user_id, player_order) VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            
            if ($stmt->execute([$roomId, $playerName, $userId, $playerOrder])) {
                // Actualizar contador de jugadores en la sala
                $this->updatePlayerCount($roomId);
                $playerId = $this->conn->lastInsertId();
                
                error_log("Jugador añadido exitosamente. ID: $playerId, Nombre: $playerName, Sala: $roomId");
                return $playerId;
            } else {
                error_log("Error ejecutando query de inserción: " . print_r($stmt->errorInfo(), true));
                return false;
            }
        } catch (Exception $e) {
            error_log("Excepción en addPlayerToRoom: " . $e->getMessage());
            return false;
        }
    }

    public function getPlayersInRoom($roomId) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE room_id = ? ORDER BY player_order";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$roomId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en getPlayersInRoom: " . $e->getMessage());
            return [];
        }
    }

    public function getPlayerCountInRoom($roomId) {
        try {
            $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE room_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$roomId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return intval($result['count']);
        } catch (Exception $e) {
            error_log("Error en getPlayerCountInRoom: " . $e->getMessage());
            return 0;
        }
    }

    private function updatePlayerCount($roomId) {
        try {
            $count = $this->getPlayerCountInRoom($roomId);
            $query = "UPDATE game_rooms SET current_players = ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$count, $roomId]);
        } catch (Exception $e) {
            error_log("Error en updatePlayerCount: " . $e->getMessage());
        }
    }

    public function updatePlayerScore($playerId, $score) {
        try {
            $query = "UPDATE " . $this->table_name . " SET score = score + ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            return $stmt->execute([$score, $playerId]);
        } catch (Exception $e) {
            error_log("Error en updatePlayerScore: " . $e->getMessage());
            return false;
        }
    }
    
    public function getPlayerById($playerId) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$playerId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error en getPlayerById: " . $e->getMessage());
            return false;
        }
    }
}
?>