<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once(__DIR__ . "/../../db/connect.php");

$categoryId = filter_input(INPUT_GET, 'category_id', FILTER_VALIDATE_INT);
if ($categoryId === false || $categoryId === null) {
    http_response_code(400);
    echo json_encode([
        "status" => false,
        "message" => "A valid integer category_id is required.",
        "data" => []
    ]);
    exit;
}

$conn = connect();
$stmt = $conn->prepare("SELECT * FROM activities WHERE category_id = ? ORDER BY activity_id DESC LIMIT 8");
if ($stmt === false) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Failed to prepare statement.",
        "data" => []
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $categoryId);
$stmt->execute();
$result = $stmt->get_result();

$list = [];
while ($row = $result->fetch_assoc()) {
    $list[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode([
    "status" => true,
    "message" => "Success",
    "data" => $list
]);