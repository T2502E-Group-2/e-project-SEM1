<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("../../db/connect.php");

session_start();

// Allow POST requests only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => false, "message" => "Invalid request method."]);
    exit;
}

// Check if the user has logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["status" => false, "message" => "You must be logged in to create a post."]);
    exit;
}

$conn = connect();

// Receive data from client
$data = json_decode(file_get_contents("php://input"), true);

// Fetch data
$title         = trim($data['title'] ?? '');
$content       = trim($data['content'] ?? '');
$author_id = intval($_SESSION['user_id']); 
$thumbnail_url = trim($data['thumbnail_url'] ?? '');
$post_category_id = intval($data['post_category_id'] ?? 0);

// Validate Required data
if ($title === '' || $content === '' || $author_id === 0) {
    http_response_code(400); // Bad Request
    echo json_encode(["status" => false, "message" => "Title and content are required."]);
    exit;
}

// Check if post category is valid
if ($post_category_id !== 0) {
    $category_stmt = $conn->prepare("SELECT category_id FROM categories WHERE category_id = ?");
    $category_stmt->bind_param("i", $post_category_id);
    $category_stmt->execute();
    $category_result = $category_stmt->get_result();
    if ($category_result->num_rows === 0) {
        http_response_code(400); // Bad Request
        echo json_encode(["status" => false, "message" => "Invalid category specified."]);
        $category_stmt->close();
        $conn->close();
        exit;
    }
    $category_stmt->close();
}

// Create Slug from Title
$slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
$slug = trim($slug, '-');
//Confirm slug is unique
$original_slug = $slug;
$counter = 1;
$check_stmt = $conn->prepare("SELECT post_id FROM posts WHERE slug = ?");

while (true) {
    $check_stmt->bind_param("s", $slug);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    if ($result->num_rows === 0) {
        break; // Slug is unique, can be used
    }
    // If slug already exists, append number to the end and try again
    $slug = $original_slug . '-' . $counter++;
    //$counter++;
}
$check_stmt->close();


// Default values
$status = "draft";
$is_featured = 0;

// Insert into DB
$stmt = $conn->prepare("
    INSERT INTO posts (title, slug, content, author_id, post_category_id, thumbnail_url, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
");
$stmt->bind_param("sssisss", $title, $slug, $content, $author_id, $post_category_id, $thumbnail_url, $status);

if ($stmt->execute()) {
    http_response_code(201); // Created
    echo json_encode([
        "status" => true,
        "message" => "The article has been successfully posted.",
        "data" => [
            "post_id" => $stmt->insert_id,
            "title" => $title,
            "slug" => $slug,
            "content" => $content,
            "author_id" => $author_id,
            "post_category_id" => $post_category_id,
            "status" => $status,
            "thumbnail_url" => $thumbnail_url,
            "is_featured" => $is_featured,
            "created_at" => date("Y-m-d H:i:s")
        ]
    ]);
} else {
    http_response_code(500); 
    echo json_encode(["status" => false, "message" => "Error when saving the article.", "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>