<?php
header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json; charset=UTF-8");


$host = 'localhost'; 
$db   = 'e-project-1'; 
$user = 'root'; 
$pass = 'root'; 
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {    
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed.']);
    exit;
}


if (!isset($_GET['category_id']) || !filter_var($_GET['category_id'], FILTER_VALIDATE_INT)) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => 'A valid integer category_id is required.']);
    exit;
}

$categoryId = (int)$_GET['category_id'];

try {
    
    $sql = "SELECT id, title, thumbnail_url, price, description, duration, max_participants, difficulty_level FROM activities WHERE category_id = :category_id AND is_active = 1";
    $stmt = $pdo->prepare($sql);

    
    $stmt->execute(['category_id' => $categoryId]);

    $activities = $stmt->fetchAll();

    
    http_response_code(200);
    echo json_encode(['status' => 'success', 'data' => $activities]);
} catch (\PDOException $e) {
    
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Query failed: ' . $e->getMessage()]);
}