<?php
class Game {
    private $database;
    
    // Constructor que recibe la conexión a la base de datos
    public function __construct($databaseConnection) {
        $this->database = $databaseConnection;
    }

    /**
     * Obtiene todos los mapas disponibles en el sistema
     * @return array Lista de mapas con sus propiedades
     */
    public function fetchAllMaps() {
        $query = "SELECT id, name, description, image_url FROM maps";
        $statement = $this->database->prepare($query);
        $statement->execute();
        
        $mapsList = $statement->fetchAll(PDO::FETCH_ASSOC);
        return $mapsList;
    }

    /**
     * Busca un mapa específico por su ID
     * @param int $mapIdentifier El ID del mapa a buscar
     * @return array|false Datos del mapa o false si no existe
     */
    public function findMapById($mapIdentifier) {
        $sql = "SELECT id, name, description, image_url FROM maps WHERE id = ?";
        $preparedStmt = $this->database->prepare($sql);
        $preparedStmt->execute(array($mapIdentifier));
        
        return $preparedStmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Recupera todas las cartas del juego ordenadas alfabéticamente
     * @return array Colección de cartas con sus estadísticas
     */
    public function retrieveAllCards() {
        $cardQuery = "SELECT id, name, altura_mts, tecnica, fuerza, ";
        $cardQuery .= "peleas_ganadas, velocidad_percent, ki, image_url ";
        $cardQuery .= "FROM cards ORDER BY name ASC";
        
        $stmt = $this->database->prepare($cardQuery);
        $stmt->execute();
        
        $cardsCollection = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $cardsCollection;
    }

    /**
     * Obtiene una carta específica mediante su identificador
     * @param int $cardIdentifier ID de la carta solicitada
     * @return array|false Información de la carta o false si no se encuentra
     */
    public function getSpecificCard($cardIdentifier) {
        $selectQuery = "SELECT id, name, altura_mts, tecnica, fuerza, peleas_ganadas, velocidad_percent, ki, image_url FROM cards WHERE id = ?";
        $preparedStatement = $this->database->prepare($selectQuery);
        
        // Ejecutar con el parámetro proporcionado
        $success = $preparedStatement->execute([$cardIdentifier]);
        
        if ($success) {
            return $preparedStatement->fetch(PDO::FETCH_ASSOC);
        }
        return false;
    }

    /**
     * Distribuye cartas a los jugadores de una sala específica
     * @param string $gameRoomId Identificador de la sala de juego
     * @return bool Resultado de la operación
     */
    public function distributeCardsToPlayers($gameRoomId) { 
        // TODO: Implementar la lógica de distribución de cartas
        // Por ahora retorna true como placeholder
        return true; 
    }
    
    /**
     * Procesa el juego de una carta por parte de un jugador
     * @param string $gameRoom ID de la sala
     * @param int $userId ID del jugador
     * @param int $selectedCard ID de la carta jugada  
     * @param int $currentRound Ronda actual del juego
     * @param mixed $attributeScore Valor del atributo seleccionado
     * @return bool Estado de la jugada
     */
    public function executeCardPlay($gameRoom, $userId, $selectedCard, $currentRound, $attributeScore) { 
        // Pendiente: Agregar lógica para procesar la jugada
        return true; 
    }
    
    /**
     * Consulta las cartas disponibles para un jugador en una sala
     * @param string $roomIdentifier ID de la sala de juego
     * @param int $playerIdentifier ID del jugador
     * @return array Lista de cartas del jugador
     */
    public function fetchPlayerCardCollection($roomIdentifier, $playerIdentifier) { 
        // TODO: Implementar consulta de cartas del jugador
        // Retorna array vacío temporalmente
        return array(); 
    }
}
?>