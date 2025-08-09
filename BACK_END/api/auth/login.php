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

$conn = connect();

// Add a robust connection check
if ($conn->connect_error) {
    http_response_code(503); // Service Unavailable
    echo json_encode(["success" => false, "message" => "Lỗi kết nối cơ sở dữ liệu: " . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Dữ liệu không hợp lệ."]);
    $conn->close();
    exit;
}

$email = $data['email'];
$password = $data['password'];

// 1. Tìm người dùng bằng email
$stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, password, role FROM users WHERE email=? AND is_active=1");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi prepare statement: " . $conn->error]);
    $conn->close();
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // 2. Xác thực mật khẩu đã được băm
    if (password_verify($password, $user['password'])) {
        // Đăng nhập thành công
        unset($user['password']); // Không trả về mật khẩu cho client
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['user_role'] = $user['role'];

        echo json_encode([
            "success" => true,
            "message" => "Đăng nhập thành công.",
            "user" => $user
        ]);
    } else {
        // Sai mật khẩu
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Email hoặc mật khẩu không đúng."]);
    }
} else {
    // Không tìm thấy người dùng
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Email hoặc mật khẩu không đúng."]);
}

$stmt->close();
$conn->close();
?>