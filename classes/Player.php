<?php
class Player {
    private $conn;
    private $table_name = "room_players";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function addPlayerToRoom($roomId, $playerName, $userId = null) {
    try {
        error_log("addPlayerToRoom llamado - Room ID: $roomId, Player: $playerName, User ID: " . ($userId ?? 'null'));
        
        // Verificar que la conexión a la base de datos esté activa
        if (!$this->conn) {
            error_log("Error: Conexión a la base de datos no disponible");
            return false;
        }

        // Verificar parámetros
        if (!$roomId || empty(trim($playerName))) {
            error_log("Error: Parámetros inválidos - Room ID: $roomId, Player Name: '$playerName'");
            return false;
        }

        // Limpiar el nombre del jugador
        $playerName = trim($playerName);
        
        // Verificar si la sala existe y obtener información
        $roomQuery = "SELECT id, max_players, status FROM game_rooms WHERE id = ?";
        $roomStmt = $this->conn->prepare($roomQuery);
        
        if (!$roomStmt) {
            error_log("Error preparando query de sala: " . implode(' ', $this->conn->errorInfo()));
            return false;
        }
        
        if (!$roomStmt->execute([$roomId])) {
            error_log("Error ejecutando query de sala: " . implode(' ', $roomStmt->errorInfo()));
            return false;
        }
        
        $roomData = $roomStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$roomData) {
            error_log("Sala no encontrada con ID: $roomId");
            return false;
        }

        error_log("Datos de sala: " . json_encode($roomData));

        // Verificar estado de la sala
        if ($roomData['status'] !== 'waiting') {
            error_log("Sala no está esperando jugadores - Estado: " . $roomData['status']);
            return false;
        }

        // Obtener conteo actual de jugadores
        $currentPlayers = $this->getPlayerCountInRoom($roomId);
        error_log("Jugadores actuales: $currentPlayers, Máximo: {$roomData['max_players']}");
        
        // Verificar si hay espacio
        if ($currentPlayers >= $roomData['max_players']) {
            error_log("Sala llena. Jugadores actuales: $currentPlayers, Máximo: {$roomData['max_players']}");
            return false;
        }

        // Verificar si el jugador ya existe en esta sala
        $checkQuery = "SELECT id FROM " . $this->table_name . " WHERE room_id = ? AND player_name = ?";
        $checkStmt = $this->conn->prepare($checkQuery);
        
        if (!$checkStmt) {
            error_log("Error preparando query de verificación: " . implode(' ', $this->conn->errorInfo()));
            return false;
        }

        $checkStmt->execute([$roomId, $playerName]);
        if ($checkStmt->fetch()) {
            error_log("Jugador ya existe en la sala: $playerName");
            return false;
        }

        // Calcular el orden del jugador
        $playerOrder = $currentPlayers + 1;
        
        // Insertar nuevo jugador
        $query = "INSERT INTO " . $this->table_name . " (room_id, player_name, user_id, player_order, score) VALUES (?, ?, ?, ?, 0)";
        $stmt = $this->conn->prepare($query);
        
        if (!$stmt) {
            error_log("Error preparando query de inserción: " . implode(' ', $this->conn->errorInfo()));
            return false;
        }
        
        error_log("Ejecutando query de inserción con valores: [$roomId, '$playerName', " . ($userId ?? 'NULL') . ", $playerOrder]");
        
        if ($stmt->execute([$roomId, $playerName, $userId, $playerOrder])) {
            $playerId = $this->conn->lastInsertId();
            error_log("Jugador insertado exitosamente - ID: $playerId");
            
            // Actualizar contador de jugadores en la sala
            $this->updatePlayerCount($roomId);
            
            // Verificar que el jugador fue realmente insertado
            $verifyQuery = "SELECT id, player_name FROM " . $this->table_name . " WHERE id = ?";
            $verifyStmt = $this->conn->prepare($verifyQuery);
            $verifyStmt->execute([$playerId]);
            $insertedPlayer = $verifyStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($insertedPlayer) {
                error_log("Jugador verificado en BD: " . json_encode($insertedPlayer));
                return $playerId;
            } else {
                error_log("Error: Jugador no se pudo verificar después de la inserción");
                return false;
            }
        } else {
            $errorInfo = $stmt->errorInfo();
            error_log("Error ejecutando query de inserción: " . implode(' ', $errorInfo));
            error_log("SQL Error Code: " . $errorInfo[0] . ", Driver Error Code: " . $errorInfo[1] . ", Message: " . $errorInfo[2]);
            return false;
        }
        
    } catch (Exception $e) {
        error_log("Excepción en addPlayerToRoom: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
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


// En classes/Player.php, reemplaza el método getPlayerCountInRoom:

public function getPlayerCountInRoom($roomId) {
    try {
        if (!$this->conn) {
            error_log("Error: Conexión a la base de datos no disponible en getPlayerCountInRoom");
            return 0;
        }

        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE room_id = ?";
        $stmt = $this->conn->prepare($query);
        
        if (!$stmt) {
            error_log("Error preparando query en getPlayerCountInRoom: " . implode(' ', $this->conn->errorInfo()));
            return 0;
        }
        
        if (!$stmt->execute([$roomId])) {
            error_log("Error ejecutando query en getPlayerCountInRoom: " . implode(' ', $stmt->errorInfo()));
            return 0;
        }
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $count = intval($result['count'] ?? 0);
        
        error_log("getPlayerCountInRoom - Room ID: $roomId, Count: $count");
        return $count;
        
    } catch (Exception $e) {
        error_log("Excepción en getPlayerCountInRoom: " . $e->getMessage());
        return 0;
    }
}

// También mejora el método updatePlayerCount:

   private function updatePlayerCount($roomId) {
    try {
        if (!$this->conn) {
            error_log("Error: Conexión a la base de datos no disponible en updatePlayerCount");
            return false;
        }

        $count = $this->getPlayerCountInRoom($roomId);
        $query = "UPDATE game_rooms SET current_players = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        if (!$stmt) {
            error_log("Error preparando query en updatePlayerCount: " . implode(' ', $this->conn->errorInfo()));
            return false;
        }
        
        if ($stmt->execute([$count, $roomId])) {
            error_log("Player count actualizado - Room ID: $roomId, Count: $count");
            return true;
        } else {
            error_log("Error ejecutando updatePlayerCount: " . implode(' ', $stmt->errorInfo()));
            return false;
        }
        
    } catch (Exception $e) {
        error_log("Excepción en updatePlayerCount: " . $e->getMessage());
        return false;
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