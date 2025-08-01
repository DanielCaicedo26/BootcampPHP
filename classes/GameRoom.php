<?php
// Clase para manejar las salas de juego
class GameRoom {
    private $conn;
    private $table_name = "game_rooms";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Función para crear una nueva sala de juego
    public function createRomm($maxPlayers = 7) {
        do{
            $roomCode = generateRoomCode();
        } while ($this->roomCodeExists($roomCode));

        $query = "INSERT INTO " . $this->table_name . " (room_code, max_players) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        if ($stmt->execute([$roomCode, $maxPlayers])) {
            return [
                "id" => $this->conn->lastInsertId(),
                "room_code" => $roomCode,
            ];
        }
        return false;
    }

    public function getRoomByCode($roomCode) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE room_code = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$roomCode]);
        return $stmt->fetch();
}

    public function roomExists($roomCode) {
     return $this->getRoomByCode($roomCode) !== false;
    }
    public function roomCodeExists($roomCode) {
        return $this->getRoomByCode($roomCode) !== false;
    }

    public function updateRoomStatus($roomId, $status) {
        $query = "UPDATE " . $this->table_name . " SET status = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$status, $roomId]);
    }
    public function setSelectedMap($roomId, $mapId) {
        $query = "UPDATE " . $this->table_name . " SET selected_map_id = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$mapId, $roomId]);
    }
    public function updateCurrentRound($roomId, $round, $attribute) {
        $query = "UPDATE " . $this->table_name . " SET current_round = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$round, $roomId]);
    }
}
?>
   


<?php
