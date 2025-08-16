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

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../db/connect.php';

if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Access Denied"]);
    exit();
}

$conn = connect();

// ========== HANDLE DELETE ==========
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $deleteData);
    $userId = intval($_GET['id'] ?? 0);

    if ($userId <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid user ID"]);
        exit();
    }

    $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
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

// ========== HANDLE UPDATE ==========
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['user_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit();
    }

    $stmt = $conn->prepare("
        UPDATE users
        SET first_name = ?, last_name = ?, email = ?, phone_number = ?, role = ?, is_active = ?, updated_at = NOW()
        WHERE user_id = ?
    ");

    $stmt->bind_param(
        "sssssii",
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $data['phone_number'],
        $data['role'],
        $data['is_active'],
        $data['user_id']
    );

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

// ========== HANDLE SEARCH ==========
$search = $_GET['search'] ?? '';
$sortBy = $_GET['sort_by'] ?? 'created_at';
$sortOrder = $_GET['sort_order'] ?? 'DESC';

$allowedSortColumns = ['user_id', 'full_name', 'created_at', 'updated_at', 'role', 'is_active'];
if (!in_array($sortBy, $allowedSortColumns)) {
    $sortBy = 'created_at';
}

$sortOrder = strtoupper($sortOrder);
if (!in_array($sortOrder, ['ASC', 'DESC'])) {
    $sortOrder = 'DESC';
}

$sql = "
    SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        u.phone_number,
        CONCAT_WS(', ', u.address_line1, u.address_line2, u.city, u.state_province, u.zip_code, u.country) AS address,
        u.role,
        u.is_active as status,
        CASE 
            WHEN u.is_active = 1 THEN 'Active'
            ELSE 'Inactive'
        END AS is_active,
        DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(u.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
    FROM users u
";

$params = [];
$types = '';

if (!empty($search)) {
    $sql .= " WHERE CONCAT(u.first_name, ' ', u.last_name) LIKE ? 
              OR u.email LIKE ? 
              OR u.phone_number LIKE ? 
              OR u.role LIKE ? 
              OR CONCAT_WS(', ', u.address_line1, u.address_line2, u.city, u.state_province, u.zip_code, u.country) LIKE ?";
    $searchTerm = "%" . $search . "%";
    array_push($params, $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm);
    $types = 'sssss';
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

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

header('Content-Type: application/json');
echo json_encode($users);

$stmt->close();
$conn->close();
?>