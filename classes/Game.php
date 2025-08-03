<?php
class Game {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllMaps() {
        $query = "SELECT * FROM maps ORDER BY name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    public function assignCardsToPlayers($roomId) {
        $players = new Player($this->conn);
        $playersInRoom = $players->getPlayersInRoom($roomId);
        
        // Obtener todas las cartas disponibles
        $query = "SELECT * FROM cards ORDER BY RAND()";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $allCards = $stmt->fetchAll();
        
        // Asignar 8 cartas a cada jugador
        $cardIndex = 0;
        foreach ($playersInRoom as $player) {
            for ($i = 0; $i < 8; $i++) {
                if ($cardIndex >= count($allCards)) {
                    // Si no hay suficientes cartas, reiniciar desde el principio
                    $cardIndex = 0;
                }
                
                $query = "INSERT INTO player_cards (room_id, player_id, card_id) VALUES (?, ?, ?)";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$roomId, $player['id'], $allCards[$cardIndex]['id']]);
                
                $cardIndex++;
            }
        }
        return true;
    }

    public function getPlayerCards($roomId, $playerId, $includeUsed = false) {
        $usedCondition = $includeUsed ? "" : "AND pc.is_used = FALSE";
        
        $query = "SELECT c.*, pc.is_used 
                 FROM player_cards pc 
                 JOIN cards c ON pc.card_id = c.id 
                 WHERE pc.room_id = ? AND pc.player_id = ? $usedCondition 
                 ORDER BY c.name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$roomId, $playerId]);
        return $stmt->fetchAll();
    }

    public function playCard($roomId, $playerId, $cardId, $roundId, $attributeValue) {
        // Marcar carta como usada
        $query = "UPDATE player_cards SET is_used = TRUE WHERE room_id = ? AND player_id = ? AND card_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$roomId, $playerId, $cardId]);
        
        // Registrar carta jugada en la ronda
        $query = "INSERT INTO round_cards (round_id, player_id, card_id, attribute_value) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$roundId, $playerId, $cardId, $attributeValue]);
    }

    public function createRound($roomId, $roundNumber, $selectedAttribute) {
        $query = "INSERT INTO game_rounds (room_id, round_number, selected_attribute) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        if ($stmt->execute([$roomId, $roundNumber, $selectedAttribute])) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function getRoundCards($roundId) {
        $query = "SELECT rc.*, rp.player_name, c.name as card_name 
                 FROM round_cards rc 
                 JOIN room_players rp ON rc.player_id = rp.id 
                 JOIN cards c ON rc.card_id = c.id 
                 WHERE rc.round_id = ? 
                 ORDER BY rc.attribute_value DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$roundId]);
        return $stmt->fetchAll();
    }

    public function setRoundWinner($roundId, $winnerId) {
        $query = "UPDATE game_rounds SET winner_player_id = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$winnerId, $roundId]);
    }

    public function getGameResults($roomId) {
        $query = "SELECT rp.player_name, rp.score, u.username 
                 FROM room_players rp 
                 LEFT JOIN users u ON rp.user_id = u.id 
                 WHERE rp.room_id = ? 
                 ORDER BY rp.score DESC, rp.player_name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$roomId]);
        return $stmt->fetchAll();
    }
}
?>