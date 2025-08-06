<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("../../db/connect.php");

$response = array();

// Check if ID is provided
if (!isset($_GET["id"]) || empty($_GET["id"])) {
    http_response_code(400); // Bad Request
    $response['status'] = false;
    $response['message'] = "Post ID is required.";
    echo json_encode($response);
    exit();
}

$id = $_GET["id"];
$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    $response['status'] = false;
    $response['message'] = "Database connection failed: " . $conn->connect_error;
    echo json_encode($response);
    exit();
}

// Use prepared statements to prevent SQL injection
$sql = "SELECT 
            p.post_id, 
            p.title, 
            p.content,
            p.thumbnail_url,
            p.created_at,
            CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM 
            posts p
        LEFT JOIN 
            users u ON p.author_id = u.user_id
        WHERE p.post_id = ?";
$stmt = $conn->prepare($sql);

$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $response['status'] = true;
    $response['message'] = "Post fetched successfully.";
    $response['data'] = $result->fetch_assoc();
} else {
    http_response_code(404); // Not Found
    $response['status'] = false;
    $response['message'] = "Post not found with ID: " . $id;
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>