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
}
?>