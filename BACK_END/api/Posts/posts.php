<?php
// Môi trường development: Bật lỗi. Môi trường production: Tắt đi
ini_set('display_errors', 1); // Đổi thành 0 khi deploy
error_reporting(E_ALL);     // Đổi thành 0 khi deploy

// Cài đặt header
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Xử lý dứt điểm OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

require_once("../../db/connect.php");


$response = array();
$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    $response['status'] = false;
    $response['message'] = "Database connection failed: " . $conn->connect_error;
    echo json_encode($response);
    exit();
}

$current_user_id = $_SESSION['user_id'] ?? null;
$current_user_role = $_SESSION['user_role'] ?? null;

$sql = "SELECT 
            p.post_id, p.author_id, p.title, p.slug, p.thumbnail_url,
            SUBSTRING(p.content, 1, 200) AS excerpt,
            p.created_at, p.status,
            CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.user_id";

$whereClause = "";
$params = [];
$types = "";

if ($current_user_role === 'admin') {
    $whereClause = " WHERE 1=1";
} elseif ($current_user_id) {
    $whereClause = " WHERE p.status = ? OR (p.status = ? AND p.author_id = ?)";
    $params = [POST_STATUS_PUBLISHED, POST_STATUS_DRAFT, $current_user_id];
    $types = "ssi";
} else {
    $whereClause = " WHERE p.status = ?";
    $params = [POST_STATUS_PUBLISHED];
    $types = "s";
}

$sql .= $whereClause . " ORDER BY p.created_at DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    $response['status'] = false;
    $response['message'] = "Prepare failed: " . $conn->error;
    echo json_encode($response);
    exit();
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

if ($result) {
    $posts_arr = $result->fetch_all(MYSQLI_ASSOC);
    $response['status'] = true;
    $response['message'] = "Posts fetched successfully.";
    $response['data'] = $posts_arr;
    http_response_code(200);
} else {
    http_response_code(500);
    $response['status'] = false;
    $response['message'] = "Query execution failed: " . $stmt->error;
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>