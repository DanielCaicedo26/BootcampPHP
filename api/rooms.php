<?php
require_once '../config/database.php';
require_once '../config/session.php';
require_once '../classes/GameRoom.php';
require_once '../classes/Player.php';
require_once '../classes/Game.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
?>