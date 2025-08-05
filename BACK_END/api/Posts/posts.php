<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-control-allow-headers: *");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("../../db/connect.php");

$conn = connect();

// Kiểm tra kết nối
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

$sql = "SELECT * FROM posts ORDER BY created_at DESC";
$result = $conn->query($sql);

$posts = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $posts[] = $row;
    }
    echo json_encode(["success" => true, "data" => $posts]);
} else {
    echo json_encode(["success" => false, "message" => "No posts found."]);
}

$conn->close();
?>