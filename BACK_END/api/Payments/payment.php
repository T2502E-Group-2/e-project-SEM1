<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("../../db/connect.php");

// Get the POST data
$input_data = file_get_contents("php://input");
$data = json_decode($input_data, true);

// Check if data is valid
if (!$data || empty($data['paypalOrderId']) || empty($data['totalAmount']) || empty($data['cartItems']) || empty($data['userInfo'])) {
    http_response_code(400); // Bad Request
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
    // Start a transaction
    $conn->begin_transaction();

    // 1. Insert into 'orders' table
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

    // 2. Insert into 'order_items' table for each item in the cart
    $sql_item = "INSERT INTO order_items (order_id, product_id, product_type, quantity, price_at_time_of_purchase) VALUES (?, ?, ?, ?, ?)";
    $stmt_item = $conn->prepare($sql_item);
    if (!$stmt_item) {
        throw new Exception("Failed to prepare order_item statement: " . $conn->error);
    }

    foreach ($data['cartItems'] as $item) {
        $productId = $item['id'];
        $productType = $item['product_type'] ?? 'equipment';
        $quantity = $item['quantity'];

        $price_at_time_of_purchase = 0;
        $table_name = "";
        $id_column = "";
        $price_column = "price";
        
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

        $sql_price = "SELECT {$price_column} FROM {$table_name} WHERE {$id_column} = ?";
        $stmt_price = $conn->prepare($sql_price);
        $stmt_price->bind_param("i", $productId);
        $stmt_price->execute();
        $result_price = $stmt_price->get_result();

        if ($result_price->num_rows === 0) {
            throw new Exception("Product not found with ID: " . $productId . " in table " . $table_name);
        }
        
        $price_at_time_of_purchase = $result_price->fetch_assoc()[$price_column];
        $stmt_price->close();

        $stmt_item->bind_param("isdid", $order_id, $productId, $productType, $quantity, $price_at_time_of_purchase);
        $stmt_item->execute();
    }

    $stmt_item->close();
    $conn->commit();

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Order successfully created.", "order_id" => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    error_log("Payment processing error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "An error occurred: " . $e->getMessage()]);

} finally {
    $conn->close();
}
?>