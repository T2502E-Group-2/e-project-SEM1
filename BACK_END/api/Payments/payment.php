<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once(__DIR__ . "/../../db/connect.php");
$conn = connect();

$data = json_decode(file_get_contents("php://input"), true);

// Basic validation
if (
    !$data ||
    !isset($data['paypalOrderId']) ||
    !isset($data['totalAmount']) ||
    !isset($data['cartItems']) ||
    !is_array($data['cartItems']) ||
    !isset($data['userInfo'])
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data provided.']);
    exit;
}

$conn->begin_transaction();

try {
    // Fix: accept both user_id and userId from frontend
    $user_id = $data['user_id'] ?? $data['userId'] ?? null;

    $paypal_order_id = $data['paypalOrderId'];
    $total_amount = $data['totalAmount'];
    $user_info = $data['userInfo'];

    // Insert into orders
    $sql_order = "INSERT INTO orders (user_id, paypal_order_id, total_amount, status, customer_name, customer_address, customer_phone, customer_note) VALUES (?, ?, ?, 'completed', ?, ?, ?, ?)";
    $stmt_order = $conn->prepare($sql_order);
    if (!$stmt_order) {
        throw new Exception("Order prepare failed: " . $conn->error);
    }

    $customer_name = $user_info['fullName'] ?? '';
    $customer_address = $user_info['address'] ?? '';
    $customer_phone = $user_info['phone'] ?? '';
    $customer_note = $user_info['note'] ?? '';

    $stmt_order->bind_param("isdssss", $user_id, $paypal_order_id, $total_amount, $customer_name, $customer_address, $customer_phone, $customer_note);
    $stmt_order->execute();
    $order_id = $conn->insert_id;
    $stmt_order->close();

    // Insert into order_items
    $sql_item = "INSERT INTO order_items (order_id, activity_id, equipment_id, quantity, price) VALUES (?, ?, ?, ?, ?)";
    $stmt_item = $conn->prepare($sql_item);
    if (!$stmt_item) {
        throw new Exception("Order item prepare failed: " . $conn->error);
    }

    foreach ($data['cartItems'] as $item) {
        $activity_id = $item['activity_id'] ?? null;
        $equipment_id = $item['equipment_id'] ?? null;
        $quantity = $item['quantity'];
        $price = $item['price'];

        if ($activity_id === null && $equipment_id === null) {
            continue;
        }

        $stmt_item->bind_param("iiidd", $order_id, $activity_id, $equipment_id, $quantity, $price);
        $stmt_item->execute();
    }
    $stmt_item->close();

    $conn->commit();

    echo json_encode(['success' => true, 'message' => 'Order placed successfully!', 'order_id' => $order_id]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();