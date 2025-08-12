<?php

// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once(__DIR__ ."/../../db/connect.php");
$conn = connect();

// Get the activity ID from the request
$activity_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($activity_id <= 0) {
    http_response_code(400); // Bad Request
    echo json_encode([
        "status" => false,
        "message" => "Invalid activity ID.",
        "data" => null
    ]);
    exit;
}

if (!$conn || $conn->connect_error) {
    die(json_encode([
        "status" => false,
        "message" => "Database connection not established"
    ]));
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Prepare SQL query to fetch a single activity by ID
$sql = "SELECT c.*, g.url AS thumbnail_url
        FROM activities c
        LEFT JOIN galleries g ON c.thumbnail_id = g.media_id
        WHERE c.activity_id = ?";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $activity_id);
mysqli_stmt_execute($stmt);
$rs = mysqli_stmt_get_result($stmt);

if (!$rs) {
    http_response_code(500); // Internal Server Error
    echo json_encode([
        "status" => false,
        "message" => "Query failed.",
        "data" => null
    ]);
    exit;
}

$activity = mysqli_fetch_assoc($rs);

if ($activity) {
    $data = [
        "status" => true,
        "message" => "Success",
        "data" => $activity
    ];
} else {
    http_response_code(404); // Not Found
    $data = [
        "status" => false,
        "message" => "Activity not found.",
        "data" => null
    ];
}

echo json_encode($data);
mysqli_close($conn);