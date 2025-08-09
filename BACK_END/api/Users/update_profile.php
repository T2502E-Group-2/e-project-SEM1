<?php
// update_profile.php
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../../db/connect.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["success" => false, "message" => "Vui lòng đăng nhập để cập nhật thông tin."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$conn = connect();

if ($conn->connect_error) {
    http_response_code(503);
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu: " . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate input data
if (!isset($data['first_name']) || !isset($data['last_name']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Dữ liệu không hợp lệ. Vui lòng điền đầy đủ thông tin bắt buộc."]);
    $conn->close();
    exit;
}

// Sanitize and assign variables
$first_name = $data['first_name'];
$last_name = $data['last_name'];
$email = $data['email'];
$phone_number = $data['phone_number'] ?? null;
$address_line1 = $data['address_line1'] ?? null;
$address_line2 = $data['address_line2'] ?? null;
$city = $data['city'] ?? null;
$state_province = $data['state_province'] ?? null;
$zip_code = $data['zip_code'] ?? null;
$country = $data['country'] ?? null;

// Check if the new email already exists for another user
$check_stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
$check_stmt->bind_param("si", $email, $user_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows > 0) {
    http_response_code(409); // Conflict
    echo json_encode(["success" => false, "message" => "Email này đã được sử dụng bởi một tài khoản khác."]);
    $check_stmt->close();
    $conn->close();
    exit;
}
$check_stmt->close();

// Prepare update statement
$update_stmt = $conn->prepare("UPDATE users SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address_line1 = ?, address_line2 = ?, city = ?, state_province = ?, zip_code = ?, country = ? WHERE user_id = ?");
$update_stmt->bind_param("ssssssssssi", $first_name, $last_name, $email, $phone_number, $address_line1, $address_line2, $city, $state_province, $zip_code, $country, $user_id);

if ($update_stmt->execute()) {
    // Fetch the updated user data to return to the client
    $user_data_stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, role, phone_number, address_line1, address_line2, city, state_province, zip_code, country FROM users WHERE user_id = ?");
    $user_data_stmt->bind_param("i", $user_id);
    $user_data_stmt->execute();
    $updatedUser = $user_data_stmt->get_result()->fetch_assoc();
    $user_data_stmt->close();

    echo json_encode(["success" => true, "message" => "Cập nhật thông tin thành công.", "user" => $updatedUser]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi khi cập nhật thông tin: " . $conn->error]);
}

$update_stmt->close();
$conn->close();
?>