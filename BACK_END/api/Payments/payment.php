<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("../../db/connect.php");

// Get the POST data
$input_data = file_get_contents("php://input");
$data = json_decode($input_data, true);

// Validate data
if (!$data || empty($data['paypalOrderId']) || empty($data['totalAmount']) || empty($data['cartItems']) || empty($data['userInfo'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or incomplete data provided."]);
    exit();
}

$conn = connect();
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

try {
    $conn->begin_transaction();

    // 1. Insert into 'orders'
    $userId = $data['userId'] ?? NULL;
    $paypalOrderId = $data['paypalOrderId'];
    $totalAmount = $data['totalAmount'];
    $fullName = $data['userInfo']['fullName'];
    $address = $data['userInfo']['address'];
    $phone = $data['userInfo']['phone'];
    $note = $data['userInfo']['note'] ?? NULL;

    $sql_order = "INSERT INTO orders (user_id, paypal_order_id, total_amount, full_name, address, phone, note) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt_order = $conn->prepare($sql_order);
    if (!$stmt_order) {
        throw new Exception("Failed to prepare order statement: " . $conn->error);
    }
    $stmt_order->bind_param("isdssss", $userId, $paypalOrderId, $totalAmount, $fullName, $address, $phone, $note);
    $stmt_order->execute();
    $order_id = $conn->insert_id;
    $stmt_order->close();

    // 2. Insert into 'order_items'
    $sql_item = "INSERT INTO order_items (order_id, product_id, product_type, quantity, price_at_time_of_purchase) VALUES (?, ?, ?, ?, ?)";
    $stmt_item = $conn->prepare($sql_item);
    if (!$stmt_item) {
        throw new Exception("Failed to prepare order_item statement: " . $conn->error);
    }

    foreach ($data['cartItems'] as $item) {
        $productId = $item['id'];
        $productType = $item['product_type'] ?? 'equipment';
        $quantity = $item['quantity'];

        // Lấy giá hiện tại
        switch ($productType) {
            case 'equipment':
                $table_name = "equipments";
                $id_column = "equipment_id";
                break;
            case 'activity':
                $table_name = "activities";
                $id_column = "activity_id";
                break;
            default:
                throw new Exception("Invalid product type: " . $productType);
        }

        $stmt_price = $conn->prepare("SELECT price FROM {$table_name} WHERE {$id_column} = ?");
        $stmt_price->bind_param("i", $productId);
        $stmt_price->execute();
        $result_price = $stmt_price->get_result();
        if ($result_price->num_rows === 0) {
            throw new Exception("Product not found with ID: {$productId}");
        }
        $price_at_time_of_purchase = $result_price->fetch_assoc()['price'];
        $stmt_price->close();

        // Deduct stock if it's Equipment
        if ($productType === 'equipment') {
            $stmt_stock = $conn->prepare("SELECT stock FROM equipments WHERE equipment_id = ? FOR UPDATE");
            $stmt_stock->bind_param("i", $productId);
            $stmt_stock->execute();
            $result_stock = $stmt_stock->get_result();
            if ($result_stock->num_rows === 0) {
                throw new Exception("Equipment not found with ID: {$productId}");
            }
            $current_stock = (int)$result_stock->fetch_assoc()['stock'];
            $stmt_stock->close();

            if ($current_stock < $quantity) {
                throw new Exception("Insufficient stock for equipment ID: {$productId}");
            }

            $stmt_update = $conn->prepare("UPDATE equipments SET stock = stock - ? WHERE equipment_id = ?");
            $stmt_update->bind_param("ii", $quantity, $productId);
            $stmt_update->execute();
            $stmt_update->close();
        }
        // Deduct max_participants if it is Activity
        if ($productType === 'activity') {           
            $stmt_max = $conn->prepare("SELECT max_participants FROM activities WHERE activity_id = ? FOR UPDATE");
            $stmt_max->bind_param("i", $productId);
            $stmt_max->execute();
            $result_max = $stmt_max->get_result();
            if ($result_max->num_rows === 0) {
                throw new Exception("Activity not found with ID: {$productId}");
            }
            $current_max = (int)$result_max->fetch_assoc()['max_participants'];
            $stmt_max->close();
        
            if ($current_max < $quantity) {
                throw new Exception("Not enough spots available for activity ID: {$productId}");
            }
        
            $stmt_update = $conn->prepare("UPDATE activities SET max_participants = max_participants - ? WHERE activity_id = ?");
            $stmt_update->bind_param("ii", $quantity, $productId);
            $stmt_update->execute();
            $stmt_update->close();
        }

        $stmt_item->bind_param("iisid", $order_id, $productId, $productType, $quantity, $price_at_time_of_purchase);
        $stmt_item->execute();
    }

    $stmt_item->close();
    $conn->commit();

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Order successfully created.", "order_id" => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
} finally {
    $conn->close();
}
?>