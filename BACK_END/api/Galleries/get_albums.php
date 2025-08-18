<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// === DATABASE CONNECTION ===
require_once(__DIR__ . "/../../db/connect.php");
$conn = connect();

try {    
    $sql = "SELECT DISTINCT album 
            FROM galleries 
            WHERE album IS NOT NULL AND album != '' 
            ORDER BY album ASC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $albums = [];
    while ($row = $result->fetch_assoc()) {
        $albums[] = $row;
    }
    
    $stmt->close();

    echo json_encode([
        "status" => true,
        "message" => "Successfully fetched albums.",
        "data" => $albums
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Error: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
} finally {
    if ($conn) {
        $conn->close();
    }
}