<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../../db/connect.php");

$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

try {
    // Câu lệnh SQL để lấy các danh mục có type = 'Post'
    // và chỉ lấy những danh mục có bài viết (post_count > 0)
    $sql = "
        SELECT 
            c.category_id, 
            c.category_name, 
            COUNT(p.post_id) AS post_count
        FROM categories c
        LEFT JOIN posts p ON p.post_category_id = c.category_id
        WHERE c.type = 'Post'
        GROUP BY c.category_id, c.category_name
        HAVING post_count > 0
        ORDER BY c.category_name ASC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $post_categories_data = [];
    while ($row = $result->fetch_assoc()) {
        $post_categories_data[] = [
            'category_id' => $row['category_id'],
            'category_name' => $row['category_name']
        ];
    }
    $stmt->close();

    http_response_code(200);
    echo json_encode([
        "status" => true,
        "message" => "Post categories fetched successfully",
        "data" => $post_categories_data
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>