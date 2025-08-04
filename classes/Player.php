<?php
class Player {
    private $conn;
    private $table_name = "room_players";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function addPlayerToRoom($roomId, $playerName, $userId = null) {
        // Verificar si la sala está llena
        $currentPlayers = $this->getPlayerCountInRoom($roomId);
        $room = new GameRoom($this->conn);
        $roomData = $room->getRoomByCode($this->getRoomCode($roomId));
        
        if ($currentPlayers >= $roomData['max_players']) {
            return false;
        }

        $playerOrder = $currentPlayers + 1;
        
        $query = "INSERT INTO " . $this->table_name . " (room_id, player_name, user_id, player_order) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        if ($stmt->execute([$roomId, $playerName, $userId, $playerOrder])) {
            // Actualizar contador de jugadores en la sala
            $this->updatePlayerCount($roomId);
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function getPlayersInRoom($roomId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE room_id = ? ORDER BY player_order";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$roomId]);
        return $stmt->fetchAll();
    }

    public function getPlayerCountInRoom($roomId) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE room_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$roomId]);
        $result = $stmt->fetch();
        return $result['count'];
    }

    private function updatePlayerCount($roomId) {
        $count = $this->getPlayerCountInRoom($roomId);
        $query = "UPDATE game_rooms SET current_players = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$count, $roomId]);
    }

    private function getRoomCode($roomId) {
        $query = "SELECT room_code FROM game_rooms WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$roomId]);
        $result = $stmt->fetch();
        return $result ? $result['room_code'] : null;
    }

    public function updatePlayerScore($playerId, $score) {
        $query = "UPDATE " . $this->table_name . " SET score = score + ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$score, $playerId]);
    }
}
    
?>
