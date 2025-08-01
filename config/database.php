<?php
// Configuración de la base de datos
class Database {
    private $host = "localhost";
    private $user = "root";
    private $password = "";
    private $dbname = "dragon";
    private $conn;

    public function getConnection() {
        if ($this->conn == null) {
            try {
                $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->dbname . ";charset=utf8mb4", 
                                     $this->user, $this->password);
                
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                
            } catch(PDOException $e) {
                die("❌ Error de conexión: " . $e->getMessage());
            }
        }
        
        return $this->conn;
    }
}
?>
