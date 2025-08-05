<?php
// Incluir dependencias necesarias
include_once '../config/database.php';
include_once '../config/session.php';
include_once '../classes/User.php';

// Configurar headers para la API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar peticiones preflight de CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inicializar conexión a base de datos
$dbInstance = new Database();
$connection = $dbInstance->getConnection();
$userManager = new User($connection);

// Obtener método HTTP y acción solicitada
$httpMethod = $_SERVER['REQUEST_METHOD'];
$requestedAction = isset($_GET['action']) ? $_GET['action'] : '';

// Procesar según el método HTTP
if ($httpMethod === 'POST') {
    // Leer datos del cuerpo de la petición
    $requestData = json_decode(file_get_contents('php://input'), true);
    
    if ($requestedAction === 'register') {
        // Proceso de registro de usuario
        $inputUsername = sanitizeInput($requestData['username'] ?? '');
        $inputPassword = $requestData['password'] ?? '';
        
        // Validar que los campos no estén vacíos
        if (strlen($inputUsername) === 0 || strlen($inputPassword) === 0) {
            jsonResponse(['error' => 'Se requieren usuario y contraseña para continuar'], 400);
        }
        
        // Verificar si el usuario ya está registrado
        if ($userManager->exists($inputUsername)) {
            jsonResponse(['error' => 'Este nombre de usuario ya está en uso'], 409);
        }
        
        // Intentar crear el nuevo usuario
        $newUserId = $userManager->register($inputUsername, $inputPassword);
        if ($newUserId !== false) {
            // Establecer sesión para el usuario recién registrado
            $_SESSION['user_id'] = $newUserId;
            $_SESSION['username'] = $inputUsername;
            jsonResponse([
                'success' => true, 
                'user_id' => $newUserId, 
                'username' => $inputUsername,
                'message' => 'Usuario registrado exitosamente'
            ]);
        } else {
            jsonResponse(['error' => 'No se pudo completar el registro. Intenta nuevamente'], 500);
        }
        
    } elseif ($requestedAction === 'login') {
        // Proceso de inicio de sesión
        $loginUsername = sanitizeInput($requestData['username'] ?? '');
        $loginPassword = $requestData['password'] ?? '';
        
        // Validar campos requeridos
        if (empty($loginUsername) || empty($loginPassword)) {
            jsonResponse(['error' => 'Debes proporcionar usuario y contraseña'], 400);
        }
        
        // Verificar credenciales
        $authenticatedUser = $userManager->login($loginUsername, $loginPassword);
        if ($authenticatedUser !== false) {
            // Iniciar sesión exitosa
            $_SESSION['user_id'] = $authenticatedUser['id'];
            $_SESSION['username'] = $authenticatedUser['username'];
            jsonResponse([
                'success' => true, 
                'user_id' => $authenticatedUser['id'], 
                'username' => $authenticatedUser['username'],
                'message' => 'Inicio de sesión exitoso'
            ]);
        } else {
            jsonResponse(['error' => 'Usuario o contraseña incorrectos'], 401);
        }
        
    } elseif ($requestedAction === 'logout') {
        // Cerrar sesión del usuario
        session_destroy();
        jsonResponse(['success' => true, 'message' => 'Sesión cerrada correctamente']);
        
    } else {
        // Acción POST no reconocida
        jsonResponse(['error' => 'La acción solicitada no es válida'], 400);
    }
    
} elseif ($httpMethod === 'GET') {
    
    if ($requestedAction === 'status') {
        // Verificar estado de la sesión actual
        $isUserLoggedIn = array_key_exists('user_id', $_SESSION) && !empty($_SESSION['user_id']);
        
        $statusResponse = [
            'logged_in' => $isUserLoggedIn,
            'user_id' => $isUserLoggedIn ? $_SESSION['user_id'] : null,
            'username' => $isUserLoggedIn ? $_SESSION['username'] : null
        ];
        
        jsonResponse($statusResponse);
        
    } else {
        // Acción GET no válida
        jsonResponse(['error' => 'Operación no soportada'], 400);
    }
    
} else {
    // Método HTTP no permitido
    jsonResponse(['error' => 'Método HTTP no soportado'], 405);
}
?>