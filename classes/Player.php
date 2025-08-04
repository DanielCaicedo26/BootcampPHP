<?php
class Player {
    private $db;
    private $table_name = "room_players";

    public function __construct($db) {
        $this->db = $db;
    }

    public function addPlayerToRoom($roomId, $playerName, $userId = null) {
        try {
            // 1. Verificar si la sala está llena
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as player_count, max_players 
                FROM room_players rp 
                JOIN game_rooms gr ON rp.room_id = gr.id 
                WHERE gr.id = ?
                GROUP BY gr.max_players
            ");
            $stmt->execute([$roomId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && $result['player_count'] >= $result['max_players']) {
                return false; // Sala llena
            }

            // 2. Obtener el siguiente orden del jugador
            $stmt = $this->db->prepare("
                SELECT COALESCE(MAX(player_order), 0) + 1 as next_order 
                FROM room_players 
                WHERE room_id = ?
            ");
            $stmt->execute([$roomId]);
            $nextOrder = $stmt->fetchColumn();

            // 3. Insertar el jugador
            $stmt = $this->db->prepare("
                INSERT INTO room_players 
                (room_id, player_name, user_id, player_order, score, created_at) 
                VALUES (?, ?, ?, ?, 0, NOW())
            ");
            
            if ($stmt->execute([$roomId, $playerName, $userId, $nextOrder])) {
                return $this->db->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Error en addPlayerToRoom: " . $e->getMessage());
            return false;
        }
    }

    public function getPlayersInRoom($roomId) {
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM room_players 
                WHERE room_id = ? 
                ORDER BY player_order
            ");
            $stmt->execute([$roomId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Error en getPlayersInRoom: " . $e->getMessage());
            return [];
        }
    }
}
?>
?>
