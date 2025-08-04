<?php
// Clase para manejar las salas de juego
class GameRoom {
    private $conn;
    private $table_name = "game_rooms";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Función para crear una nueva sala de juego
    public function createRoom($maxPlayers = 7) {
        try {
            // Generar código único para la sala
            do {
                $roomCode = generateRoomCode();
            } while ($this->roomCodeExists($roomCode));

            $query = "INSERT INTO " . $this->table_name . " (room_code, max_players, status) VALUES (?, ?, 'waiting')";
            $stmt = $this->conn->prepare($query);
            
            if ($stmt->execute([$roomCode, $maxPlayers])) {
                $roomId = $this->conn->lastInsertId();
                
                // Devolver información completa de la sala
                return [
                    "id" => $roomId,
                    "room_code" => $roomCode,
                    "max_players" => $maxPlayers,
                    "current_players" => 0,
                    "status" => "waiting"
                ];
            }
            return false;
        } catch (Exception $e) {
            error_log("Error creando sala: " . $e->getMessage());
            return false;
        }
    }

    public function getRoomByCode($roomCode) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE room_code = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$roomCode]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error obteniendo sala por código: " . $e->getMessage());
            return false;
        }
    }

    // Método para obtener sala por ID
    public function getRoomById($roomId) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$roomId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error obteniendo sala por ID: " . $e->getMessage());
            return false;
        }
    }

    public function roomExists($roomCode) {
        return $this->getRoomByCode($roomCode) !== false;
    }
    
    public function roomCodeExists($roomCode) {
        return $this->getRoomByCode($roomCode) !== false;
    }

    public function updateRoomStatus($roomId, $status) {
        try {
            $validStatuses = ['waiting', 'voting', 'playing', 'finished'];
            if (!in_array($status, $validStatuses)) {
                throw new Exception("Estado inválido: $status");
            }
            
            $query = "UPDATE " . $this->table_name . " SET status = ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            return $stmt->execute([$status, $roomId]);
        } catch (Exception $e) {
            error_log("Error actualizando estado de sala: " . $e->getMessage());
            return false;
        }
    }
    
    public function setSelectedMap($roomId, $mapId) {
        try {
            $query = "UPDATE " . $this->table_name . " SET selected_map_id = ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            return $stmt->execute([$mapId, $roomId]);
        } catch (Exception $e) {
            error_log("Error estableciendo mapa: " . $e->getMessage());
            return false;
        }
    }
    
    public function updateCurrentRound($roomId, $round) {
        try {
            $query = "UPDATE " . $this->table_name . " SET current_round = ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            return $stmt->execute([$round, $roomId]);
        } catch (Exception $e) {
            error_log("Error actualizando ronda: " . $e->getMessage());
            return false;
        }
    }

    // Obtener todas las salas activas
    public function getActiveRooms() {
        try {
            $query = "SELECT gr.*, COUNT(rp.id) as player_count 
                     FROM " . $this->table_name . " gr 
                     LEFT JOIN room_players rp ON gr.id = rp.room_id 
                     WHERE gr.status IN ('waiting', 'playing') 
                     GROUP BY gr.id 
                     ORDER BY gr.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error obteniendo salas activas: " . $e->getMessage());
            return [];
        }
    }

    // Limpiar salas antiguas (más de 24 horas)
    public function cleanOldRooms() {
        try {
            $query = "DELETE FROM " . $this->table_name . " 
                     WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR) 
                     AND status IN ('waiting', 'finished')";
            $stmt = $this->conn->prepare($query);
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Error limpiando salas antiguas: " . $e->getMessage());
            return false;
        }
    }

    // Verificar si una sala está llena
    public function isRoomFull($roomId) {
        try {
            $room = $this->getRoomById($roomId);
            if (!$room) return true;
            
            $query = "SELECT COUNT(*) as current_players FROM room_players WHERE room_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$roomId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['current_players'] >= $room['max_players'];
        } catch (Exception $e) {
            error_log("Error verificando si sala está llena: " . $e->getMessage());
            return true;
        }
    }
}

// Función auxiliar para generar códigos de sala únicos
function generateRoomCode($length = 6) {
    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = '';
    $charactersLength = strlen($characters);
    
    for ($i = 0; $i < $length; $i++) {
        $code .= $characters[rand(0, $charactersLength - 1)];
    }
    
    return $code;
}
?>