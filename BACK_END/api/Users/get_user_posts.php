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

$conn = connect();
$current_user_id = intval($_SESSION['user_id']);

// Câu lệnh SQL để lấy tất cả bài viết của một author_id cụ thể
$sql = "SELECT 
            p.post_id, 
            p.author_id,
            p.title, 
            p.slug,
            p.thumbnail_url,
            p.status,
            SUBSTRING(p.content, 1, 200) AS excerpt,
            p.created_at,
            CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM 
            posts p
        LEFT JOIN 
            users u ON p.author_id = u.user_id
        WHERE 
            p.author_id = ? -- Chỉ lấy bài của người dùng hiện tại
        ORDER BY 
            p.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $current_user_id);
$stmt->execute();
$result = $stmt->get_result();

$posts_arr = [];
while ($row = $result->fetch_assoc()) {
    array_push($posts_arr, $row);
}

http_response_code(200);
echo json_encode([
    "status" => true,
    "message" => "Your posts fetched successfully.",
    "data" => $posts_arr
]);

$stmt->close();
$conn->close();
?>