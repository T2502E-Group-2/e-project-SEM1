<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Credentials: true");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../../db/connect.php");
$conn = connect();

$data = json_decode(file_get_contents("php://input"), true);

// Basic validation
if (
    !$data ||
    empty($data['paypalOrderId']) ||
    empty($data['totalAmount']) ||
    !isset($data['cartItems']) || !is_array($data['cartItems']) || empty($data['cartItems']) ||
    !isset($data['userInfo']) || !is_array($data['userInfo'])
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided.']);
    exit;
}

$conn->begin_transaction();

try {
    // Lấy dữ liệu từ request
    $user_id = isset($data['user_id']) ? (int)$data['user_id'] : (isset($data['userId']) ? (int)$data['userId'] : null);
    $paypal_order_id = (string)$data['paypalOrderId'];
    $total_amount = (float)$data['totalAmount'];
    $user_info = $data['userInfo'];

    // Insert into orders
    $sql_order = "INSERT INTO orders (user_id, paypal_order_id, total_amount, status, full_name, address, phone, note)
              VALUES (?, ?, 0, 'pending', ?, ?, ?, ?)";
$stmt_order = $conn->prepare($sql_order);
$customer_name   = $user_info['fullName'] ?? '';
$customer_address = $user_info['address'] ?? '';
$customer_phone   = $user_info['phone'] ?? '';
$customer_note    = $user_info['note'] ?? '';
$stmt_order->bind_param("isssss", $user_id, $paypal_order_id, $customer_name, $customer_address, $customer_phone, $customer_note);
$stmt_order->execute();
$order_id = $conn->insert_id;
$stmt_order->close();

// 2) Chuẩn bị insert items - ĐÚNG cột và ĐÚNG kiểu
$sql_item = "INSERT INTO order_items (order_id, activity_id, equipment_id, quantity, price_at_time_of_purchase)
             VALUES (?, ?, ?, ?, ?)";
$stmt_item = $conn->prepare($sql_item);

// 3) Lặp items: kiểm XOR, tra giá server-side, tính tổng
$computed_total = 0.0;

foreach ($data['cartItems'] as $item) {
    $activity_id  = $item['activity_id'] ?? null;
    $equipment_id = $item['equipment_id'] ?? null;
    $quantity     = isset($item['quantity']) ? (int)$item['quantity'] : 0;

    $hasActivity  = !empty($activity_id);
    $hasEquipment = !empty($equipment_id);
    if ($hasActivity === $hasEquipment) {
        throw new Exception("Each item must be either activity OR equipment.");
    }
    if ($quantity <= 0) throw new Exception("Invalid quantity.");

    // Tra giá từ DB (không dùng giá client)
    if ($hasEquipment) {
        $q = $conn->prepare("SELECT price FROM equipments WHERE equipment_id=?");
        $q->bind_param("i", $equipment_id);
    } else {
        $q = $conn->prepare("SELECT price FROM activities WHERE activity_id=?");
        $q->bind_param("i", $activity_id);
    }
    $q->execute();
    $q->bind_result($unit_price);
    if (!$q->fetch()) throw new Exception("Item not found.");
    $q->close();

    $line_price = (float)$unit_price;
    $computed_total += $line_price * $quantity;

    // LƯU Ý: đúng chuỗi kiểu "iiiid"
    $stmt_item->bind_param("iiiid", $order_id, $activity_id, $equipment_id, $quantity, $line_price);
    $stmt_item->execute();
}
$stmt_item->close();

// 4) So khớp tổng và cập nhật đơn -> completed
if (abs(((float)$data['totalAmount']) - $computed_total) > 0.01) {
    throw new Exception("Total mismatch.");
}
$up = $conn->prepare("UPDATE orders SET total_amount=?, status='completed' WHERE id=?");
$up->bind_param("di", $computed_total, $order_id);
$up->execute();
$up->close();

    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Order placed successfully!', 'order_id' => $order_id]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();