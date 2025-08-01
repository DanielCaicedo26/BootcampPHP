<?php
require_once '../config/database.php';
require_once '../config/session.php';
require_once '../classes/User.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        switch ($action) {
            case 'register':
                $username = sanitizeInput($input['username'] ?? '');
                $password = $input['password'] ?? '';
                
                if (empty($username) || empty($password)) {
                    jsonResponse(['error' => 'Usuario y contraseña son requeridos'], 400);
                }
                
                if ($user->exists($username)) {
                    jsonResponse(['error' => 'El usuario ya existe'], 409);
                }
                
                $userId = $user->register($username, $password);
                if ($userId) {
                    $_SESSION['user_id'] = $userId;
                    $_SESSION['username'] = $username;
                    jsonResponse(['success' => true, 'user_id' => $userId, 'username' => $username]);
                } else {
                    jsonResponse(['error' => 'Error al registrar usuario'], 500);
                }
                break;
                
            case 'login':
                $username = sanitizeInput($input['username'] ?? '');
                $password = $input['password'] ?? '';
                
                if (empty($username) || empty($password)) {
                    jsonResponse(['error' => 'Usuario y contraseña son requeridos'], 400);
                }
                
                $userData = $user->login($username, $password);
                if ($userData) {
                    $_SESSION['user_id'] = $userData['id'];
                    $_SESSION['username'] = $userData['username'];
                    jsonResponse(['success' => true, 'user_id' => $userData['id'], 'username' => $userData['username']]);
                } else {
                    jsonResponse(['error' => 'Credenciales inválidas'], 401);
                }
                break;
                
            case 'logout':
                session_destroy();
                jsonResponse(['success' => true]);
                break;
                
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;

    case 'GET':
        switch ($action) {
            case 'status':
                $loggedIn = isset($_SESSION['user_id']);
                jsonResponse([
                    'logged_in' => $loggedIn,
                    'user_id' => $_SESSION['user_id'] ?? null,
                    'username' => $_SESSION['username'] ?? null
                ]);
                break;
                
            default:
                jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}
?>