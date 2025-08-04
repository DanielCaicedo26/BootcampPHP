<?php
class Game {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    public function getAllMaps() {
        $stmt = $this->db->prepare("SELECT id, name, description, image_url FROM maps");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getMapById($mapId) {
        $stmt = $this->db->prepare("SELECT id, name, description, image_url FROM maps WHERE id = ?");
        $stmt->execute([$mapId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAllCards() {
        $stmt = $this->db->prepare("SELECT id, name, altura_mts, tecnica, fuerza, peleas_ganadas, velocidad_percent, ki, image_url FROM cards ORDER BY name");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCardById($cardId) {
        $stmt = $this->db->prepare("SELECT id, name, altura_mts, tecnica, fuerza, peleas_ganadas, velocidad_percent, ki, image_url FROM cards WHERE id = ?");
        $stmt->execute([$cardId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function assignCardsToPlayers($roomId) { 
        return true; 
    }
    
    public function playCard($roomId, $playerId, $cardId, $roundId, $attributeValue) { 
        return true; 
    }
    
    public function getPlayerCards($roomId, $playerId) { 
        return []; 
    }

    public function initializeGameState($roomId) {
        $stmt = $this->db->prepare("
            UPDATE game_rooms 
            SET current_round = 1,
                game_state = 'active',
                started_at = NOW()
            WHERE id = ?
        ");
        return $stmt->execute([$roomId]);
    }

    public function getGameState($roomId) {
        $stmt = $this->db->prepare("
            SELECT gr.*, 
                   GROUP_CONCAT(rp.player_name, ':', rp.score) as player_scores
            FROM game_rooms gr
            LEFT JOIN room_players rp ON gr.id = rp.room_id
            WHERE gr.id = ?
            GROUP BY gr.id
        ");
        $stmt->execute([$roomId]);
        $gameState = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($gameState) {
            $gameState['players'] = [];
            $scores = explode(',', $gameState['player_scores']);
            foreach ($scores as $score) {
                list($name, $points) = explode(':', $score);
                $gameState['players'][] = [
                    'name' => $name,
                    'score' => (int)$points
                ];
            }
        }
        
        return $gameState;
    }
}
?>