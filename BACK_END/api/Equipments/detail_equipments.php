<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Credentials: true");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);


require_once("../../db/connect.php");

// Check if ID is provided
if (!isset($_GET["id"]) || empty($_GET["id"])) {
    http_response_code(400); // Bad Request
    echo json_encode([
        "status" => false,
        "message" => "Equipment ID is required."
    ]);
    exit();
}

$id = $_GET["id"];
$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Use prepared statements to prevent SQL injection
$sql = "SELECT *, equipment_id as id FROM equipments WHERE equipment_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Failed to prepare statement: " . $conn->error]);
    $conn->close();
    exit();
}

$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $equipment = $result->fetch_assoc();
    http_response_code(200);
    echo json_encode([
         "status" => true,
    "message" => "Success",
    "data" => [
        "id" => $equipment["equipment_id"],
        "name" => $equipment["name"],
        "brand" => $equipment["brand"],
        "description" => $equipment["description"],
        "price" => $equipment["price"],
        "stock" => $equipment["stock"],
        "image_url" => $equipment["image_url"],
    ]
    ]);
} else {
    http_response_code(404); // Not Found
    echo json_encode([
        "status" => false,
        "message" => "Equipment not found with ID: " . $id,
        "data" => null
    ]);
}

$stmt->close();
$conn->close();