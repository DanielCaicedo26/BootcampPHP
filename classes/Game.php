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

    // Métodos básicos para que no falle el backend
    public function assignCardsToPlayers($roomId) { return true; }
    public function playCard($roomId, $playerId, $cardId, $roundId, $attributeValue) { return true; }
    public function getPlayerCards($roomId, $playerId) { return []; }
}
