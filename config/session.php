<?php
session_start();

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