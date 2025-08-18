<?php
session_start();

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../db/connect.php';

// Limit user access to admins only
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Access Denied"]);
    exit();
}

$conn = connect();

// Handle DELETE request
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $equipmentId = intval($_GET['id'] ?? 0);

    if ($equipmentId <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid equipment ID"]);
        exit();
    }

    $stmt = $conn->prepare("DELETE FROM equipments WHERE equipment_id = ?");
    $stmt->bind_param("i", $equipmentId);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

// Handle POST request for updates
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['equipment_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input, equipment_id is required"]);
        exit();
    }

    $stmt = $conn->prepare("
        UPDATE equipments
        SET name = ?, description = ?, equipment_category_id = ?, sub_category = ?, 
            image_url = ?, brand = ?, model = ?, price = ?, stock = ?, is_featured = ?
        WHERE equipment_id = ?
    ");

    $stmt->bind_param(
        "ssissssdiii",
        $data['name'],
        $data['description'],
        $data['equipment_category_id'],
        $data['sub_category'],
        $data['image_url'],
        $data['brand'],
        $data['model'],
        $data['price'],
        $data['stock'],
        $data['is_featured'],
        $data['equipment_id']
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Equipment updated successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

// Handle GET request for searching and filtering
$search = $_GET['search'] ?? '';
$sortBy = $_GET['sort_by'] ?? 'equipment_id';
$sortOrder = $_GET['sort_order'] ?? 'DESC';

$allowedSortColumns = ['equipment_id', 'name', 'brand', 'price', 'stock', 'is_featured'];
if (!in_array($sortBy, $allowedSortColumns)) {
    $sortBy = 'equipment_id';
}
$sortOrder = strtoupper($sortOrder);
if (!in_array($sortOrder, ['ASC', 'DESC'])) {
    $sortOrder = 'DESC';
}

$sql = "
    SELECT 
        e.equipment_id, e.name, e.description, c.category_name as category, e.sub_category, 
        e.image_url, e.brand, e.model, e.price, e.stock, e.is_featured
    FROM equipments e
    LEFT JOIN categories c ON e.equipment_category_id = c.category_id
";

$params = [];
$types = '';
$where = [];

if (!empty($search)) {
    $where[] = "(e.name LIKE ? OR e.description LIKE ? OR c.category_name LIKE ? OR e.brand LIKE ?)";
    $searchTerm = "%" . $search . "%";
    array_push($params, $searchTerm, $searchTerm, $searchTerm, $searchTerm);
    $types .= 'ssss';
}

if (count($where) > 0) {
    $sql .= " WHERE " . implode(" AND ", $where);
}

$sql .= " ORDER BY {$sortBy} {$sortOrder}";

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
$equipments = [];
while ($row = $result->fetch_assoc()) {
    $equipments[] = $row;
}

header('Content-Type: application/json');
echo json_encode($equipments);

$stmt->close();
$conn->close();
?>