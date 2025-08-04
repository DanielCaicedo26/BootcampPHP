<?php
// Definir constante de modo debug
define('DEBUG_MODE', true);

// Habilitar reporte de errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Configurar zona horaria
date_default_timezone_set('America/Bogota');

// Headers adicionales para debugging
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Función para logging detallado
function debugLog($message, $data = null) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";
    
    if ($data !== null) {
        $logMessage .= " | Data: " . json_encode($data);
    }
    
    error_log($logMessage);
    
    // También mostrar en respuesta si estamos en modo debug
    if (defined('DEBUG_MODE') && DEBUG_MODE) {
        echo "<!-- DEBUG: $logMessage -->\n";
    }
}

// Función mejorada para respuestas JSON
function jsonResponse($data, $status = 200) {
    // Limpiar cualquier output previo
    if (ob_get_length()) {
        ob_clean();
    }
    
    http_response_code($status);
    
    // Headers para JSON
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
    
    // Log de la respuesta para debugging
    debugLog("JSON Response", ['status' => $status, 'data' => $data]);
    
    // Encode y enviar
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
    if ($json === false) {
        $error = json_last_error_msg();
        debugLog("JSON Encode Error: $error");
        
        http_response_code(500);
        echo json_encode(['error' => 'Error interno del servidor al generar JSON']);
        exit;
    }
    
    echo $json;
    exit;
}

// Función para validar entrada JSON
function getJsonInput() {
    $input = file_get_contents('php://input');
    
    if (empty($input)) {
        debugLog("Input vacío recibido");
        return [];
    }
    
    $decoded = json_decode($input, true);
    
    if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
        $error = json_last_error_msg();
        debugLog("Error decodificando JSON", ['error' => $error, 'input' => $input]);
        jsonResponse(['error' => 'JSON inválido: ' . $error], 400);
    }
    
    debugLog("JSON Input recibido", $decoded);
    return $decoded;
}

// Función para verificar sesión
function requireAuth() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        debugLog("Acceso denegado - no hay sesión activa");
        jsonResponse(['error' => 'Sesión requerida', 'logged_in' => false], 401);
    }
    
    debugLog("Usuario autenticado", ['user_id' => $_SESSION['user_id'], 'username' => $_SESSION['username'] ?? 'N/A']);
    return $_SESSION['user_id'];
}

// Función para manejo de excepciones
function handleException($e) {
    debugLog("Excepción capturada", [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    
    jsonResponse([
        'error' => 'Error interno del servidor',
        'debug_message' => $e->getMessage(),
        'debug_file' => basename($e->getFile()),
        'debug_line' => $e->getLine()
    ], 500);
}

// Configurar manejo global de excepciones
set_exception_handler('handleException');

// Función para validar parámetros requeridos
function validateRequired($data, $required_fields) {
    $missing = [];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        debugLog("Campos requeridos faltantes", ['missing' => $missing, 'received' => array_keys($data)]);
        jsonResponse(['error' => 'Campos requeridos faltantes: ' . implode(', ', $missing)], 400);
    }
    
    return true;
}

// Función para sanitizar entrada
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// Función para hashear contraseñas
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Debug: Mostrar información de la petición
debugLog("Nueva petición", [
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'query' => $_GET,
    'session_active' => session_status() === PHP_SESSION_ACTIVE,
    'user_logged' => isset($_SESSION['user_id'])
]);
?>