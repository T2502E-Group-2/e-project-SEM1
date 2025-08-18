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

require_once("../db/connect.php");
$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Failure connection: " . $conn->connect_error]);
    exit();
}

$query = isset($_GET['q']) ? $_GET['q'] : '';

if (empty(trim($query))) {
    http_response_code(400);
    echo json_encode(['message' => 'Search query cannot be empty.']);
    exit();
}

$searchTerm = "%" . $query . "%";
$results = [];

try {
    // 1. Search in the 'Activities' table
    $stmt = $conn->prepare("
    SELECT 
        a.activity_id as id, 
        a.title, 
        a.description, 
        g.url as image_url, 
        'activity' as type 
    FROM 
        activities a 
    LEFT JOIN 
        galleries g ON a.thumbnail_id = g.media_id 
    WHERE 
        a.title LIKE ? OR a.description LIKE ?
        ");
        $stmt->bind_param("ss", $searchTerm, $searchTerm);
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $results[] = $row;
        }
        $stmt->close();

    // 2. Search in the 'Equipments' table
    $stmt = $conn->prepare("SELECT equipment_id as id, name as title, description, image_url, 'equipment' as type FROM equipments WHERE name LIKE ? OR description LIKE ? OR brand LIKE ?");
    $stmt->bind_param("sss", $searchTerm, $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
    }
    $stmt->close();

    // 3. Search in the 'Posts' table
    $stmt = $conn->prepare("SELECT post_id as id, title, content as description, thumbnail_url as image_url, 'post' as type FROM posts WHERE title LIKE ? OR content LIKE ?");
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
    }
    $stmt->close();

    //4. Search in the 'galleries' table
    $stmt = $conn->prepare("
        SELECT 
            media_id as id,
            COALESCE(title, album) as title,
            album as description,
            url as image_url,
            'gallery' as type
        FROM 
            galleries
        WHERE 
            (title LIKE ? OR album LIKE ?) AND type = 'image'
    ");
    $stmt->bind_param("ss", $searchTerm, $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
    }
    $stmt->close();
    
    // // 5. Search in the 'locations' table
    // $stmt = $conn->prepare("SELECT location_id as id, name as title, description, 'location' as type FROM locations WHERE name LIKE ? OR description LIKE ?");
    // $stmt->bind_param("ss", $searchTerm, $searchTerm);
    // $stmt->execute();
    // $result = $stmt->get_result();
    // while ($row = $result->fetch_assoc()) {
    //     $results[] = $row;
    // }
    // $stmt->close();

    // // 6. Tìm kiếm trong bảng 'categories'
    // $stmt = $conn->prepare("SELECT category_id as id, category_name as title, type as description, 'category' as type FROM categories WHERE category_name LIKE ?");
    // $stmt->bind_param("s", $searchTerm);
    // $stmt->execute();
    // $result = $stmt->get_result();
    // while ($row = $result->fetch_assoc()) {
    //     $results[] = $row;
    // }
    // $stmt->close();

    echo json_encode($results);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to perform search.', 'error' => $e->getMessage()]);
}

$conn->close();