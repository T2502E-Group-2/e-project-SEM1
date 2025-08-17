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

//========== LIMIT USER ACCESS TO ADMIN ONLY ==========
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Access Denied"]);
    exit();
}

$conn = connect();

// ========== HANDLE DELETE ==========
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $deleteData);
    $postId = intval($_GET['id'] ?? 0);

    if ($postId <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid post ID"]);
        exit();
    }

    $stmt = $conn->prepare("DELETE FROM posts WHERE post_id = ?");
    $stmt->bind_param("i", $postId);
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

    if (!$data || !isset($data['post_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit();
    }

    $stmt = $conn->prepare("
        UPDATE posts
    SET title = ?, slug = ?, content = ?, status = ?, thumbnail_url = ?, 
        is_featured = ?, post_category_id = ?, updated_at = NOW()
    WHERE post_id = ?
    ");

    $stmt->bind_param(
    "ssssssii",
    $data['title'],
    $data['slug'],
    $data['content'],
    $data['status'],
    $data['thumbnail_url'],
    $data['is_featured'],
    $data['post_category_id'], // <-- nhận từ dropdown
    $data['post_id']
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
$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : '';
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : '';

$allowedSortColumns = ['post_id','title','created_at','updated_at','published_at','status','is_featured'];
if (!in_array($sortBy, $allowedSortColumns)) {
    $sortBy = 'created_at';
}
$sortOrder = strtoupper($sortOrder);
if (!in_array($sortOrder, ['ASC','DESC'])) {
    $sortOrder = 'DESC';
}

$sql = "
    SELECT 
        p.post_id,
        p.title,
        p.slug,
        p.content,
        u.user_id AS author_id,
        CONCAT(u.first_name, ' ', u.last_name) AS author_name,
        c.category_id AS category_id,
        c.category_name AS category_name,
        p.published_at,
        p.status,
        p.thumbnail_url,
        p.is_featured,
        DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(p.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.user_id
    LEFT JOIN categories c ON p.post_category_id = c.category_id
";

$params = [];
$types = '';
$where = [];

// Search conditions
if (!empty($search)) {
    $where[] = "(CONCAT(u.first_name, ' ', u.last_name) LIKE ? 
              OR p.title LIKE ? 
              OR p.content LIKE ? 
              OR c.category_name LIKE ?)";
    $searchTerm = "%" . $search . "%";
    array_push($params, $searchTerm, $searchTerm, $searchTerm, $searchTerm);
    $types .= 'ssss';
}

//Date filtering conditions
if (!empty($start_date) && !empty($end_date)) {
    $where[] = "DATE(p.created_at) BETWEEN ? AND ?";
    array_push($params, $start_date, $end_date);
    $types .= 'ss';
} elseif (!empty($start_date)) {
    $where[] = "DATE(p.created_at) >= ?";
    array_push($params, $start_date);
    $types .= 's';
} elseif (!empty($end_date)) {
    $where[] = "DATE(p.created_at) <= ?";
    array_push($params, $end_date);
    $types .= 's';
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

$posts = [];
while ($row = $result->fetch_assoc()) {
    $posts[] = $row;
}

header('Content-Type: application/json');
echo json_encode($posts);

$stmt->close();
$conn->close();
?>