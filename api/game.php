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

     public function getAllMaps() {
        $stmt = $this->db->prepare("SELECT id, name, description, image_url FROM maps");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function getMapById($id) { return null; }
    public function assignCardsToPlayers($roomId) { return true; }
    public function playCard($roomId, $playerId, $cardId, $roundId, $attributeValue) { return true; }
    public function getPlayerCards($roomId, $playerId) { return []; }

    public function getMapById($mapId) {
        $query = "SELECT * FROM maps WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$mapId]);
        return $stmt->fetch();
    }

    public function assignCardsToPlayers($roomId) {
        $players = new Player($this->conn);
        $playersInRoom = $players->getPlayersInRoom($roomId);
        
        // Crear cartas Dragon Ball si no existen
        $this->createDragonBallCards();
        
        // Obtener todas las cartas disponibles
        $query = "SELECT * FROM cards ORDER BY RAND()";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $allCards = $stmt->fetchAll();
        
        if (empty($allCards)) {
            return false;
        }
        
        // Limpiar cartas previamente asignadas para esta sala
        $query = "DELETE FROM player_cards WHERE room_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$roomId]);
        
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

    private function createDragonBallCards() {
        // Verificar si ya existen cartas
        $query = "SELECT COUNT(*) as count FROM cards";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            return; // Ya existen cartas
        }
        
        // Crear cartas de Dragon Ball
        $dragonBallCards = [
            ['Goku', 1.75, 9.5, 95, 150, 90, 98],
            ['Vegeta', 1.64, 9.2, 92, 140, 88, 95],
            ['Gohan', 1.76, 8.8, 88, 80, 85, 92],
            ['Piccolo', 2.26, 8.5, 80, 85, 75, 90],
            ['Trunks', 1.70, 8.7, 85, 60, 92, 88],
            ['Goten', 1.23, 7.8, 75, 40, 88, 85],
            ['Krillin', 1.53, 8.0, 70, 90, 80, 75],
            ['Yamcha', 1.83, 7.2, 65, 70, 82, 70],
            ['Tien', 1.87, 8.3, 75, 85, 78, 80],
            ['Android 18', 1.69, 8.9, 90, 45, 87, 85],
            ['Android 17', 1.80, 8.8, 88, 50, 89, 83],
            ['Cell', 2.13, 9.3, 94, 30, 86, 96],
            ['Majin Buu', 1.69, 7.5, 96, 25, 70, 98],
            ['Frieza', 1.58, 9.0, 89, 100, 83, 94],
            ['Broly', 2.30, 8.0, 98, 20, 75, 90],
            ['Bardock', 1.78, 8.6, 82, 120, 84, 78],
            ['Raditz', 1.85, 7.8, 78, 15, 86, 72],
            ['Nappa', 2.02, 7.0, 85, 25, 68, 65],
            ['Ginyu', 1.89, 8.4, 80, 60, 79, 82],
            ['Recoome', 2.41, 6.8, 88, 30, 65, 60],
            ['Burter', 2.05, 7.9, 75, 35, 95, 70],
            ['Jeice', 1.69, 7.7, 73, 40, 91, 68],
            ['Guldo', 1.19, 8.2, 50, 20, 45, 85],
            ['Dodoria', 2.13, 6.5, 83, 50, 60, 55],
            ['Zarbon', 1.84, 8.1, 78, 45, 81, 76],
            ['Super Saiyan Goku', 1.75, 9.7, 98, 80, 93, 99],
            ['Super Saiyan Vegeta', 1.64, 9.5, 96, 75, 91, 97],
            ['Perfect Cell', 2.13, 9.6, 97, 15, 89, 98],
            ['Kid Buu', 1.50, 8.0, 94, 12, 95, 99],
            ['Gogeta', 1.70, 9.8, 99, 5, 95, 99],
            ['Vegito', 1.70, 9.9, 99, 3, 96, 99],
            ['Master Roshi', 1.65, 9.0, 65, 200, 60, 85],
            ['Mr. Satan', 1.88, 6.0, 50, 500, 70, 35],
            ['Gotenks', 1.35, 8.5, 88, 10, 93, 90],
            ['Bills', 1.75, 9.9, 100, 100, 98, 100]
        ];
        
        $query = "INSERT INTO cards (name, altura_mts, tecnica, fuerza, peleas_ganadas, velocidad_percent, ki) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        
        foreach ($dragonBallCards as $card) {
            $stmt->execute($card);
        }
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

    public function getAllCards() {
        $query = "SELECT * FROM cards ORDER BY name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // Función para obtener estadísticas de una carta por ID
    public function getCardById($cardId) {
        $query = "SELECT * FROM cards WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$cardId]);
        return $stmt->fetch();
    }

    // Función para obtener todas las cartas de un jugador en una sala
    public function getAllPlayerCards($roomId, $playerId) {
        return $this->getPlayerCards($roomId, $playerId, true);
    }
}
?>