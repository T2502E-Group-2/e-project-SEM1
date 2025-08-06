<?php
// Bật chế độ báo lỗi để hiển thị lỗi ra trình duyệt
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Cài đặt header cho phép truy cập từ mọi domain và trả về JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Sửa đường dẫn file kết nối
require_once("../../db/connect.php");

$response = array();

// Lấy kết nối từ hàm connect()
$conn = connect();

// Kiểm tra phương thức HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit();
}

// Đọc dữ liệu JSON từ request body
$data = json_decode(file_get_contents("php://input"), true);

// Kiểm tra dữ liệu đầu vào
if (empty($data['user_id']) || empty($data['item_type']) || empty($data['item_id']) || empty($data['amount'])) {
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => "Missing required data."]);
    exit();
}

$user_id = $data['user_id'];
$item_type = $data['item_type'];
$item_id = $data['item_id'];
$amount = $data['amount'];

// Chuẩn bị câu lệnh SQL để chèn dữ liệu vào bảng orders
$sql = "INSERT INTO orders (user_id, item_type, item_id, amount, status) VALUES (?, ?, ?, ?, 'completed')";

// Sử dụng Prepared Statement để ngăn chặn SQL Injection
$stmt = $conn->prepare($sql);
$stmt->bind_param("isid", $user_id, $item_type, $item_id, $amount);

if ($stmt->execute()) {
    $order_id = $stmt->insert_id;
    http_response_code(201); // Created
    $response['success'] = true;
    $response['message'] = "Payment successful and order created.";
    $response['order_id'] = $order_id;
} else {
    http_response_code(500); // Internal Server Error
    $response['success'] = false;
    $response['message'] = "Payment failed: " . $stmt->error;
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>