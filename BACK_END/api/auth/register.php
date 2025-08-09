<?php
// Bật chế độ hiển thị lỗi chi tiết để dễ debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Xử lý preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../../db/connect.php';

// Khởi tạo đối tượng kết nối
$conn = connect();

// Add a robust connection check
if ($conn->connect_error) {
    http_response_code(503); // Service Unavailable
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu: " . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate input data
if (
    !isset($data['first_name']) || !isset($data['last_name']) ||
    !isset($data['email']) || !isset($data['password'])
) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Dữ liệu không hợp lệ. Vui lòng điền đầy đủ thông tin."]);
    $conn->close();
    exit;
}

$first_name = $data['first_name'];
$last_name = $data['last_name'];
$email = $data['email'];
$password = $data['password'];
$phone_number = isset($data['phone_number']) ? $data['phone_number'] : null;

// Lấy dữ liệu địa chỉ (tùy chọn)
$address_line1 = $data['address_line1'] ?? null;
$address_line2 = $data['address_line2'] ?? null;
$city = $data['city'] ?? null;
$state_province = $data['state_province'] ?? null;
$zip_code = $data['zip_code'] ?? null;
$country = $data['country'] ?? null;
$role = 'member';
$is_active = 1;

// Băm mật khẩu để lưu trữ an toàn
// Loại bỏ hoàn toàn việc kiểm tra mật khẩu có phải là số hay không
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// 1. Kiểm tra email đã tồn tại bằng Prepared Statement để ngăn SQL Injection
$check_stmt = $conn->prepare("SELECT user_id FROM users WHERE email=?");
$check_stmt->bind_param("s", $email);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows > 0) {
    http_response_code(409); // 409 Conflict is more appropriate for existing resource
    echo json_encode(["success" => false, "message" => "Email đã tồn tại."]);
    $check_stmt->close();
    $conn->close();
    exit;
}
$check_stmt->close();

// 2. Thêm người dùng mới bằng Prepared Statement
// Thay đổi kiểu dữ liệu của password từ 'i' (integer) thành 's' (string)
$insert_stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password, phone_number, role, is_active, address_line1, address_line2, city, state_province, zip_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$insert_stmt->bind_param("ssssissssssss", $first_name, $last_name, $email, $hashed_password, $phone_number, $role, $is_active, $address_line1, $address_line2, $city, $state_province, $zip_code, $country);

if ($insert_stmt->execute()) {
    // Lấy thông tin người dùng vừa đăng ký để trả về cho frontend
    $last_id = $conn->insert_id;
    // Lấy thêm cả email để hiển thị trên trang profile
    $user_data_stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, role FROM users WHERE user_id = ?");
    $user_data_stmt->bind_param("i", $last_id);
    $user_data_stmt->execute();
    $result = $user_data_stmt->get_result();
    $userData = $result->fetch_assoc();
    $user_data_stmt->close();

    // Đăng nhập người dùng ngay sau khi đăng ký thành công
    $_SESSION['user_id'] = $userData['user_id'];
    $_SESSION['user_role'] = $userData['role'];

    http_response_code(201); // 201 Created
    echo json_encode(["success" => true, "message" => "Đăng ký thành công.", "user" => $userData]);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
}

$insert_stmt->close();
$conn->close();
?>