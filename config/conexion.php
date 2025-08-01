<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "mi_base_de_datos";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>