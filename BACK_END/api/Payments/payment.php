<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
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
    empty($data['type']) ||
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
    $type = (string)$data['type'];
    $user_info = $data['userInfo'];

    // Insert into orders
    $sql_order = "INSERT INTO orders (user_id, paypal_order_id, total_amount, status, full_name, address, phone, email, note)
              VALUES (?, ?, 0, 'pending', ?, ?, ?, ?, ?)";
$stmt_order = $conn->prepare($sql_order);
$customer_name   = $user_info['fullName'] ?? '';
$customer_address = $user_info['address'] ?? '';
$customer_phone   = $user_info['phone'] ?? '';
$customer_email   = $user_info['email'] ?? '';
$customer_note    = $user_info['note'] ?? '';
$stmt_order->bind_param("issssss", $user_id, $paypal_order_id, $customer_name, $customer_address, $customer_phone, $customer_email, $customer_note);
$stmt_order->execute();
$order_id = $conn->insert_id;
$stmt_order->close();

// 2) Chuẩn bị insert items - ĐÚNG cột và ĐÚNG kiểu
$sql_item = "INSERT INTO order_items (order_id, activity_id, equipment_id, quantity, price_at_time_of_purchase)
             VALUES (?, ?, ?, ?, ?)";
$stmt_item = $conn->prepare($sql_item);

// 3) Lặp items: kiểm XOR, tra giá server-side, tính tổng
$computed_full_total = 0.0;

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
        // Lấy giá và kiểm tra tồn kho
        $q = $conn->prepare("SELECT price, stock FROM equipments WHERE equipment_id=?");
        $q->bind_param("i", $equipment_id);
        $q->execute();
        $q->bind_result($unit_price, $current_stock);
        if (!$q->fetch()) {
            throw new Exception("Equipment with ID {$equipment_id} not found.");
        }
        $q->close();

        // Kiểm tra tồn kho
        if ($current_stock < $quantity) {
            throw new Exception("Not enough stock for equipment ID {$equipment_id}. Requested: {$quantity}, Available: {$current_stock}");
        }

        // Cập nhật tồn kho
        $update_stock_stmt = $conn->prepare("UPDATE equipments SET stock = stock - ? WHERE equipment_id = ?");
        $update_stock_stmt->bind_param("ii", $quantity, $equipment_id);
        $update_stock_stmt->execute();
        $update_stock_stmt->close();
    } else {
        // Lấy giá và kiểm tra số lượng người tham gia còn lại
        $q = $conn->prepare("SELECT price, max_participants FROM activities WHERE activity_id=?");
        $q->bind_param("i", $activity_id);
        $q->execute();
        $q->bind_result($unit_price, $current_slots);
        if (!$q->fetch()) {
            throw new Exception("Activity with ID {$activity_id} not found.");
        }
        $q->close();

        // Kiểm tra số lượng chỗ còn lại
        if ($current_slots < $quantity) {
            throw new Exception("Not enough slots for activity ID {$activity_id}. Requested: {$quantity}, Available: {$current_slots}");
        }

        // Cập nhật số lượng chỗ
        $update_slots_stmt = $conn->prepare("UPDATE activities SET max_participants = max_participants - ? WHERE activity_id = ?");
        $update_slots_stmt->bind_param("ii", $quantity, $activity_id);
        $update_slots_stmt->execute();
        $update_slots_stmt->close();
    }

    $line_price = (float)$unit_price;
    $computed_full_total += $line_price * $quantity;
    $stmt_item->bind_param("iiiid", $order_id, $activity_id, $equipment_id, $quantity, $line_price);
    $stmt_item->execute();
}
$stmt_item->close();

// 4) So khớp tổng và cập nhật đơn -> completed

$expected_payment = $computed_full_total;
if ($type === 'activity') {
    // For activities, the frontend sends a 30% deposit
    $expected_payment = round($computed_full_total * 0.3, 2);
}
if (abs($total_amount - $expected_payment) > 0.01) {
    throw new Exception("Total mismatch. Client paid: {$total_amount}, Server expected: {$expected_payment}");
}
$up = $conn->prepare("UPDATE orders SET total_amount=?, status='completed' WHERE id=?");
$up->bind_param("di", $total_amount, $order_id);
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