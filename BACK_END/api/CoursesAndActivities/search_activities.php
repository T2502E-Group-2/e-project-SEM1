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

$search = isset($_GET['search']) ? trim($_GET['search']) : '';

$conn = connect();
$sql = "SELECT * FROM activities WHERE title LIKE ? ORDER BY activity_id DESC LIMIT 8";
$stmt = $conn->prepare($sql);
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

$like = "%" . $search . "%";
$stmt->bind_param("s", $like);
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