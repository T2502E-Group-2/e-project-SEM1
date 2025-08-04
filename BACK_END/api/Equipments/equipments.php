<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("../../db/connect.php");

// Get Page and Limited parameters from Query String, with the default value
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
// Make sure page and limit are positive numbers
$page = max(1, $page);
$limit = max(1, $limit);

// Calculate offset
$offset = ($page - 1) * $limit;
$conn = connect();

// --- Xây dựng câu truy vấn với các bộ lọc (filters) ---
$where_clauses = [];
$params = [];
$param_types = "";

// Thêm logic lọc theo category_id
if (!empty($_GET['category_id'])) {
    $category_ids = explode(",", $_GET['category_id']);
    $category_placeholders = implode(",", array_fill(0, count($category_ids), "?"));
    $where_clauses[] = "equipment_category_id IN ($category_placeholders)";
    foreach ($category_ids as $id) {
        $params[] = $id;
        $param_types .= "i";
    }
}

// Thêm logic lọc theo sub_category
if (!empty($_GET['sub_category'])) {
    $sub_categories = explode(",", $_GET['sub_category']);
    $sub_placeholders = implode(",", array_fill(0, count($sub_categories), "?"));
    $where_clauses[] = "sub_category IN ($sub_placeholders)";
    foreach ($sub_categories as $sub) {
        $params[] = $sub;
        $param_types .= "s";
    }
}

// Ví dụ: Lọc theo khoảng giá
if (!empty($_GET['min_price'])) {
    $where_clauses[] = "price >= ?";
    $params[] = (float)$_GET['min_price'];
    $param_types .= "d";
}
if (!empty($_GET['max_price'])) {
    $where_clauses[] = "price <= ?";
    $params[] = (float)$_GET['max_price'];
    $param_types .= "d";
}

// Ví dụ: Tìm kiếm theo tên
if (!empty($_GET['search'])) {
    $where_clauses[] = "name LIKE ?";
    $params[] = "%" . $_GET['search'] . "%";
    $param_types .= "s";
}

// Ghép các điều kiện WHERE lại
$where_sql = "";
if (count($where_clauses) > 0) {
    $where_sql = " WHERE " . implode(" AND ", $where_clauses);
}

// 1. Lấy tổng số bản ghi (đã áp dụng filter) để tính tổng số trang
$count_sql = "SELECT COUNT(*) as total FROM equipments" . $where_sql;
$count_stmt = $conn->prepare($count_sql);
if ($count_stmt) {
    if (!empty($param_types)) {
        $count_stmt->bind_param($param_types, ...$params);
    }
    $count_stmt->execute();
    $total_records_result = $count_stmt->get_result();
    $total_records = $total_records_result->fetch_assoc()['total'];
    $totalPages = ceil($total_records / $limit);
    $count_stmt->close();
} else {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Failed to prepare count query: " . $conn->error]);
    $conn->close();
    exit();
}

// 2. Lấy dữ liệu đã được phân trang và lọc
$data_sql = "SELECT *, equipment_id as id FROM equipments" . $where_sql . " ORDER BY equipment_id ASC LIMIT ? OFFSET ?";
$stmt = $conn->prepare($data_sql);

// Thêm limit và offset vào danh sách params để bind
$all_params = $params;
$all_params[] = $limit;
$all_params[] = $offset;
$all_param_types = $param_types . "ii";

$stmt->bind_param($all_param_types, ...$all_params);
$stmt->execute();
$rs = $stmt->get_result();

$list = [];
if ($rs) {
    while ($row = $rs->fetch_assoc()) {
        $list[] = $row;
    }
}

$data = [
    "status" => true,
    "message" => "Success",
    "data" => $list,
    "totalPages" => (int)$totalPages,
    "currentPage" => $page
];

$stmt->close();
$conn->close();

echo json_encode($data);