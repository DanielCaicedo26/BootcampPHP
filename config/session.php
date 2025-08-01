<?php
session_start();
include 'config/conexion.php';

// funcion para generar codigo de sala unico
// se usa para que los jugadores puedan unirse a la sala de juego
function generateRoomCode() {
    $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $result = '';
    for ($i = 0; $i < 6; $i++) {
        $result .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $result;
}

// funcion para hashear la contraseña
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}
// funcion para respuesta Json
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}
?>