<?php
class User {
    private $conn;
    private $table_name = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    //  funcion para registrar un nuevo usuario
    public function register ($username, $password) {
     
        $query = "INSERT INTO " . $this->table_name . " (username, password) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        $hashed_password = hashPassword($password);
        if ($stmt ->execute([$username, $hashed_password])) {
            return $this
        }
        return false;
    }

    // Función para iniciar sesión
    
    public function login($username, $password) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE username = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$username]);
      
        if ($user = $stmt->fetch()) {
            if (password_verify($password, $user['password'])) {
                return $user; // Login exitoso, retorna los datos del usuario
            } else {
                return false; // Contraseña incorrecta
            }
        } else {
            return false; // Usuario no encontrado
            
        }

        // Verifica si el usuario existe y si la contraseña es correcta
        public function exists($username) {
            $query = "SELECT * FROM " . $this->table_name . " WHERE username = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$username]);
            return $stmt->rowCount() > 0; // Retorna true si el usuario existe, false si no
        }

        // estas funciones me permitiran actualizar y agregar nuevos datos a la base de datos 
           
    }

}
?>