<?php
// Configuración de la base de datos
$host = "localhost";
$user = "root";
$password = "";
$dbname = "dragon";

try {
    // Crear conexión PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    
    // Configurar PDO para que lance excepciones en caso de errores
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Configurar el modo de fetch por defecto
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Opcional: Mostrar mensaje de éxito (solo para debugging)
    // echo "✅ Conexión PDO exitosa a la base de datos: $dbname";
    
} catch(PDOException $e) {
    // En caso de error, mostrar mensaje y terminar el script
    die("❌ Error de conexión PDO: " . $e->getMessage());
}

// Mantener también la conexión MySQLi si otros archivos la necesitan
try {
    $conn = new mysqli($host, $user, $password, $dbname);
    
    // Verificar conexión MySQLi
    if ($conn->connect_error) {
        throw new Exception("Conexión MySQLi fallida: " . $conn->connect_error);
    }
    
    // Configurar charset para MySQLi
    $conn->set_charset("utf8mb4");
    
} catch(Exception $e) {
    // En caso de error con MySQLi
    die("❌ Error de conexión MySQLi: " . $e->getMessage());
}
?>