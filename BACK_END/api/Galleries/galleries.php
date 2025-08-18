<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// === DATABASE CONNECTION ===
require_once(__DIR__ . "/../../db/connect.php");
$conn = connect();

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 24; // Limit 24 photos/page
$offset = ($page - 1) * $limit;
$album_filter = isset($_GET['album']) ? trim($_GET['album']) : null;

try {
    $where_clause = "WHERE type = 'image'";
    $params = [];
    $types = "";
    if ($album_filter) {
        $where_clause .= " AND album = ?";
        $params[] = $album_filter;
        $types .= "s";
    }
     // === STEP 1: Count the total number of photos to calculate the number of pages ===
    $count_sql = "SELECT COUNT(media_id) as total FROM galleries " . $where_clause;
    $count_stmt = $conn->prepare($count_sql);
    if ($album_filter) {
        $count_stmt->bind_param($types, ...$params);
    }
    $count_stmt->execute();
    $total_images = $count_stmt->get_result()->fetch_assoc()['total'];
    $total_pages = ceil($total_images / $limit);
    $count_stmt->close();
    // === SQL QUERY ===
    $sql = "SELECT media_id, url, type, title, album, uploaded_at 
            FROM galleries " . $where_clause . " 
            ORDER BY uploaded_at DESC
            LIMIT ? OFFSET ?";
    
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
       
    if (!$stmt->execute()) {        
        throw new Exception("Query execution failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();

    // === DATA FETCHING ===    
    $galleries = [];
    while ($row = $result->fetch_assoc()) {
        $galleries[] = $row;
    }
    $stmt->close(); 

    // === SUCCESS RESPONSE ===
    echo json_encode([
        "status" => true,
        "message" => "Successfully fetched page {$page}.",
        "data" => [
            "images" => $galleries,
            "currentPage" => $page,
            "totalPages" => $total_pages
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // === ERROR HANDLING ===    
    http_response_code(500); // Set HTTP 500 (Internal Server Error)
    echo json_encode([
        "status" => false,
        "message" => "Error: " . $e->getMessage(),
        "data" => []
    ], JSON_UNESCAPED_UNICODE);
} finally { 
    
    if ($conn) {
        $conn->close();
    }
}