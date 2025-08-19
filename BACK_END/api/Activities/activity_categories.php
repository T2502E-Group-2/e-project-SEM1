<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Credentials: true");

require_once("../../db/connect.php");

$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Kết nối thất bại: " . $conn->connect_error]);
    exit();
}

try {
    // 1. Get all the main categories for Activities
    $main_categories_sql = "
        SELECT c.category_id, c.category_name, COUNT(a.activity_id) AS activity_count
        FROM categories c
        LEFT JOIN activities a ON a.category_id = c.category_id
        WHERE c.type = 'Activity'
        GROUP BY c.category_id, c.category_name
        HAVING activity_count > 0
        ORDER BY c.category_name ASC
    ";
    
    $stmt = $conn->prepare($main_categories_sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $categories_data = [];
    while ($row = $result->fetch_assoc()) {
        $categories_data[] = [
            'category_id' => $row['category_id'],
            'category_name' => $row['category_name'],
            'activity_count' => (int)$row['activity_count']
        ];
    }
    $stmt->close();

    http_response_code(200);
    echo json_encode([
        "status" => true,
        "message" => "Lấy danh mục hoạt động thành công",
        "data" => $categories_data
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Lỗi: " . $e->getMessage()]);
}

$conn->close();
?>