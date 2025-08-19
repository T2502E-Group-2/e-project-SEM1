<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

// --- CORS Headers ---
header("Content-Type: application/json; charset=UTF-8");
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
require_once("../../db/connect.php");
require_once("../../db/constants.php");

$response = [];
$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => false, 
        "message" => "Database connection failed: " . $conn->connect_error,
        "data" => []
    ]);
    exit();
}

try {
    $current_user_id = $_SESSION['user_id'] ?? null;
    $current_user_role = $_SESSION['user_role'] ?? null;
    $category_id = isset($_GET['category']) ? intval($_GET['category']) : null;
    
    $category_info = null;

    $sql = "SELECT 
                p.post_id, p.author_id, p.title, p.slug, p.thumbnail_url,
                p.post_category_id,
                SUBSTRING(p.content, 1, 200) AS excerpt,
                p.created_at, p.status,
                CONCAT(u.first_name, ' ', u.last_name) AS author_name
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.user_id";

    $whereConditions = [];
    $params = [];
    $types = "";

    if ($category_id) {
        $whereConditions[] = "p.post_category_id = ?";
        $params[] = $category_id;
        $types .= "i";

        $cat_stmt = $conn->prepare("SELECT category_name FROM categories WHERE category_id = ?");
        $cat_stmt->bind_param("i", $category_id);
        $cat_stmt->execute();
        $cat_result = $cat_stmt->get_result();
        $category_info = $cat_result->fetch_assoc();
        $cat_stmt->close();

        if (!$category_info) {
            throw new Exception("Category not found.", 404);
        }
    }

    // -- Filter by Status & Users accessibility --
    if ($current_user_role === 'admin') {
    } elseif ($current_user_id) {
        $whereConditions[] = "(p.status = ? OR (p.status = ? AND p.author_id = ?))";
        $params = array_merge($params, [POST_STATUS_PUBLISHED, POST_STATUS_DRAFT, $current_user_id]);
        $types .= "ssi";
    } else {
        $whereConditions[] = "p.status = ?";
        $params[] = POST_STATUS_PUBLISHED;
        $types .= "s";
    }

    if (!empty($whereConditions)) {
        $sql .= " WHERE " . implode(" AND ", $whereConditions);
    }
    $sql .= " ORDER BY p.created_at DESC";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("SQL statement preparation failed: " . $conn->error);
    }
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $posts_arr = $result->fetch_all(MYSQLI_ASSOC);

    http_response_code(200);
    $response['status'] = true;
    $response['message'] = "Posts fetched successfully.";
    if ($category_info) {
        $response['category_info'] = $category_info;
    }
    $response['data'] = $posts_arr;

} catch (Exception $e) {
    $errorCode = $e->getCode() ?: 500;
    http_response_code($errorCode);
    $response['status'] = false;
    $response['message'] = $e->getMessage();
    $response['data'] = [];

} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>