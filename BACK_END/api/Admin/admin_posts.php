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

$allowedSortColumns = ['id', 'title', 'author_id', 'created_at', 'status'];
if (!in_array($sortBy, $allowedSortColumns)) $sortBy = 'created_at';
if (!in_array(strtoupper($sortOrder), ['ASC', 'DESC'])) $sortOrder = 'DESC';

$sql = "SELECT p.id, p.title, p.status, u.full_name AS author_name, 
               DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at 
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id";

$params = [];
$types = '';

if (!empty($search)) {
    $sql .= " WHERE p.title LIKE ? OR u.full_name LIKE ?";
    $searchTerm = "%".$search."%";
    $params = [$searchTerm, $searchTerm];
    $types = 'ss';
}

$sql .= " ORDER BY {$sortBy} {$sortOrder}";

$stmt = $conn->prepare($sql);
if (!empty($params)) $stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$posts = [];
while ($row = $result->fetch_assoc()) $posts[] = $row;

header('Content-Type: application/json');
echo json_encode($posts);
?>