<?php
// get_user_details.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// ✅ Kiểm tra đăng nhập
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Chưa đăng nhập"]);
    exit;
}

require_once '../../db/connect.php';
$conn = connect();

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, phone_number, role, address_line1, address_line2, city, state_province, zip_code, country FROM users WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    echo json_encode(["success" => true, "user" => $user]);
} else {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Không tìm thấy người dùng"]);
}

$stmt->close();
$conn->close();
?>