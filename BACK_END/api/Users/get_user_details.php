<?php
// get_user_details.php
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../../db/connect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["success" => false, "message" => "Vui lòng đăng nhập để xem thông tin."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$conn = connect();

if ($conn->connect_error) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu: " . $conn->connect_error]);
    exit;
}

// Select all user data except the password
$stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, phone_number, role, address_line1, address_line2, city, state_province, zip_code, country FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    echo json_encode(["success" => true, "user" => $user]);
} else {
    http_response_code(404); // Not Found
    echo json_encode(["success" => false, "message" => "Không tìm thấy người dùng."]);
}

$stmt->close();
$conn->close();
?>