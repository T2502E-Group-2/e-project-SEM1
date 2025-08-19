<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-control-allow-headers: *");
header("Access-Control-Allow-Credentials: true");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("../../db/connect.php");

$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

try {
    // 1. Get all the main categories from the categories table
    
    $main_categories_sql = "SELECT category_id, category_name FROM categories WHERE type = 'Equipment' ORDER BY category_name ASC";
    $main_categories_stmt = $conn->prepare($main_categories_sql);
    $main_categories_stmt->execute();
    $main_categories_result = $main_categories_stmt->get_result();

    $categories_data = [];
    while ($row = $main_categories_result->fetch_assoc()) {
        $categories_data[$row['category_id']] = [
            'category_id' => $row['category_id'],
            'category_name' => $row['category_name'],
            'equipment_count' => 0, 
            'children' => [] 
        ];
    }
    $main_categories_stmt->close();

    // 2. Take and group sub_categories from the Equipments table
    
    $sub_categories_sql = "SELECT equipment_category_id as category_id, sub_category, COUNT(*) AS equipment_count FROM equipments WHERE sub_category IS NOT NULL AND sub_category != '' GROUP BY equipment_category_id, sub_category ORDER BY sub_category ASC";
    $sub_categories_stmt = $conn->prepare($sub_categories_sql);
    $sub_categories_stmt->execute();
    $sub_categories_result = $sub_categories_stmt->get_result();

    while ($row = $sub_categories_result->fetch_assoc()) {
        if (isset($categories_data[$row['category_id']])) {
            // Add sub_category to the corresponding main portfolio
            $categories_data[$row['category_id']]['children'][] = [
                'name' => $row['sub_category'],
                'equipment_count' => (int)$row['equipment_count']
            ];
            
            $categories_data[$row['category_id']]['equipment_count'] += (int)$row['equipment_count'];
        }
    }
    $sub_categories_stmt->close();

    // 3. Convert data into arrays to return and eliminate categories without products
    $response_data = array_values(array_filter($categories_data, fn($category) => $category['equipment_count'] > 0));

    http_response_code(200);
    echo json_encode([
        "status" => true,
        "message" => "Get categories successfully",
        "data" => $response_data
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>