<?php
session_start();

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
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

require_once '../../db/connect.php';


if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Access Denied"]);
    exit();
}

$conn = connect();

// Lấy các tham số tìm kiếm và sắp xếp từ query string
$search = $_GET['search'] ?? '';
$sortBy = $_GET['sort_by'] ?? 'created_at';
$sortOrder = $_GET['sort_order'] ?? 'DESC';

// Whitelist các cột được phép sắp xếp để tránh SQL Injection
$allowedSortColumns = ['order_id', 'paypal_order_id', 'total_amount', 'full_name', 'created_at'];
if (!in_array($sortBy, $allowedSortColumns)) {
    $sortBy = 'created_at'; // Mặc định
}

// Whitelist thứ tự sắp xếp
$sortOrder = strtoupper($sortOrder);
if ($sortOrder !== 'ASC' && $sortOrder !== 'DESC') {
    $sortOrder = 'DESC'; // Mặc định
}

// Xây dựng câu truy vấn SQL
$sql = "
    SELECT
        o.id AS order_id,
        o.paypal_order_id,
        o.total_amount,
        o.full_name,
        o.address,
        o.phone,
        o.note,
        DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
        oi.product_id,
        oi.product_type,
        oi.quantity,
        oi.price_at_time_of_purchase
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
";

$params = [];
$types = '';

if (!empty($search)) {
    $sql .= " WHERE o.full_name LIKE ? OR o.paypal_order_id LIKE ? OR o.phone LIKE ? OR o.address LIKE ? OR o.id LIKE ?";
    $searchTerm = "%" . $search . "%";
    // Thêm các tham số vào mảng
    array_push($params, $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm);
    $types = 'sssss';
}

$sql .= " ORDER BY o.{$sortBy} {$sortOrder}";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare Error: " . $conn->error]);
    exit();
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}

header('Content-Type: application/json');
echo json_encode($orders);

$stmt->close();
$conn->close();
?>