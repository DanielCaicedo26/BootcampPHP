<?php
class User {
    private $conn;
    private $table_name = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Función para registrar un nuevo usuario
    public function register($username, $password) {
        $query = "INSERT INTO " . $this->table_name . " (username, password) VALUES (?, ?)";
        $stmt = $this->conn->prepare($query);
        $hashed_password = hashPassword($password);
        
        if ($stmt->execute([$username, $hashed_password])) {
            return $this->conn->lastInsertId(); // Retornar ID del usuario creado
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
    }

    // Verifica si el usuario existe
    public function exists($username) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE username = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$username]);
        return $stmt->rowCount() > 0; // Retorna true si el usuario existe, false si no
    }

    // Obtener usuario por ID
    public function getUserById($userId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }

    // Actualizar perfil de usuario
    public function updateProfile($userId, $data) {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['username', 'email'])) { // Solo campos permitidos
                $fields[] = $key . " = ?";
                $values[] = $value;
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $userId;
        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute($values);
    }
}
?>