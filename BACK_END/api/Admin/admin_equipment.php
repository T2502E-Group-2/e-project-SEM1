<?php
session_start();
require_once '../../db/connect.php';

if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Access Denied"]);
    exit();
}

$conn = connect();

$search = $_GET['search'] ?? '';
$sortBy = $_GET['sort_by'] ?? 'created_at';
$sortOrder = $_GET['sort_order'] ?? 'DESC';

$allowedSortColumns = ['id', 'name', 'price', 'created_at'];
if (!in_array($sortBy, $allowedSortColumns)) $sortBy = 'created_at';
if (!in_array(strtoupper($sortOrder), ['ASC', 'DESC'])) $sortOrder = 'DESC';

$sql = "SELECT id, name, description, price, stock_quantity, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at 
        FROM equipments";

$params = [];
$types = '';

if (!empty($search)) {
    $sql .= " WHERE name LIKE ?";
    $searchTerm = "%".$search."%";
    $params = [$searchTerm];
    $types = 's';
}

$sql .= " ORDER BY {$sortBy} {$sortOrder}";

$stmt = $conn->prepare($sql);
if (!empty($params)) $stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$equipments = [];
while ($row = $result->fetch_assoc()) $equipments[] = $row;

header('Content-Type: application/json');
echo json_encode($equipments);
?>