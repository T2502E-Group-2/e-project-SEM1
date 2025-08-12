<?php
session_start();

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} else {
    header("Access-Control-Allow-Origin: *"); // chỉ dùng * khi không có credentials
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once(__DIR__ ."/../../db/connect.php");


if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Access Denied"]);
    exit();
}

$conn = connect();

// ... phần còn lại giữ nguyên


$sql = "
    SELECT 
        o.id AS order_id,
        o.paypal_order_id,
        o.total_amount,
        o.full_name,
        o.address,
        o.phone,
        o.note,
        o.created_at,
        oi.product_id,
        oi.product_type,
        oi.quantity,
        oi.price_at_time_of_purchase
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    ORDER BY o.created_at DESC
";

$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Query Error: " . $conn->error]);
    exit();
}

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}

header('Content-Type: application/json');
echo json_encode($orders);

$conn->close();
?>