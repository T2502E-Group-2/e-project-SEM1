<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Credentials: true");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("../../db/connect.php");

$response = array();

if (!isset($_GET["id"]) || empty($_GET["id"])) {
    http_response_code(400);
    $response['status'] = false;
    $response['message'] = "Post ID is required.";
    echo json_encode($response);
    exit();
}

$id = (int) $_GET["id"];
$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    $response['status'] = false;
    $response['message'] = "Database connection failed: " . $conn->connect_error;
    echo json_encode($response);
    exit();
}

$sql = "SELECT 
            p.post_id,
            p.author_id,
            p.title,
            p.slug,
            p.status,
            p.content,
            p.thumbnail_url,
            p.created_at,
            CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM 
            posts p
        LEFT JOIN 
            users u ON p.author_id = u.user_id
        WHERE p.post_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    $response['status'] = false;
    $response['message'] = "Post not found with ID: " . $id;
    echo json_encode($response);
    exit();
}

$post = $result->fetch_assoc();

// Previous post query
$sqlPrev = "SELECT post_id, slug, title 
            FROM posts 
            WHERE post_id < ? AND status = 'posted'
            ORDER BY post_id DESC 
            LIMIT 1";
$stmtPrev = $conn->prepare($sqlPrev);
$stmtPrev->bind_param("i", $id);
$stmtPrev->execute();
$prevResult = $stmtPrev->get_result();
$prevPost = $prevResult->fetch_assoc();

// Next post query
$sqlNext = "SELECT post_id, slug, title 
            FROM posts 
            WHERE post_id > ? AND status = 'posted'
            ORDER BY post_id ASC 
            LIMIT 1";
$stmtNext = $conn->prepare($sqlNext);
$stmtNext->bind_param("i", $id);
$stmtNext->execute();
$nextResult = $stmtNext->get_result();
$nextPost = $nextResult->fetch_assoc();

// Hook to response data
$post['prev_post'] = $prevPost ?: null;
$post['next_post'] = $nextPost ?: null;

$response['status'] = true;
$response['message'] = "Post fetched successfully.";
$response['data'] = $post;

$stmt->close();
$stmtPrev->close();
$stmtNext->close();
$conn->close();

echo json_encode($response);
?>