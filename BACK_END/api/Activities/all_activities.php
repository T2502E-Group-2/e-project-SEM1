<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Credentials: true");

require_once(__DIR__ . "/../../db/connect.php");
$conn = connect();

$category_id = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;

try {
    if ($category_id) {
        // Lọc theo category_id
        $sql = "SELECT c.*, g.url AS thumbnail_url
                FROM activities c
                LEFT JOIN galleries g ON c.thumbnail_id = g.media_id
                WHERE c.category_id = ?
                ORDER BY c.activity_id DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $category_id);
    } else {
        // Lấy tất cả
        $sql = "SELECT c.*, g.url AS thumbnail_url
                FROM activities c
                LEFT JOIN galleries g ON c.thumbnail_id = g.media_id
                ORDER BY c.activity_id DESC";
        $stmt = $conn->prepare($sql);
    }

    if (!$stmt->execute()) {
        throw new Exception("Query execution failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $list = [];
    while ($row = $result->fetch_assoc()) {
        $list[] = $row;
    }
    $stmt->close();

    echo json_encode([
        "status" => true,
        "message" => "Success",
        "data" => $list
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Error: " . $e->getMessage(),
        "data" => []
    ], JSON_UNESCAPED_UNICODE);
}

$conn->close();