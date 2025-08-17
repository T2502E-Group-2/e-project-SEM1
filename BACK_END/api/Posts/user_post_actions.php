<?php
session_start();

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../db/connect.php';

// (1) BẢO MẬT: KIỂM TRA NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP CHƯA
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized. Please log in."]);
    exit();
}

$conn = connect();
$current_user_id = intval($_SESSION['user_id']);

// (2) PHÂN LUỒNG DỰA TRÊN PHƯƠNG THỨC HTTP
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Dùng để lấy dữ liệu của một bài viết cụ thể để chỉnh sửa
        $postId = intval($_GET['id'] ?? 0);
        if ($postId <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid post ID"]);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM posts WHERE post_id = ? AND author_id = ?");
        $stmt->bind_param("ii", $postId, $current_user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($post = $result->fetch_assoc()) {
            echo json_encode($post);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Post not found or you do not have permission to edit it."]);
        }
        $stmt->close();
        break;

    case 'POST':
        // Xử lý cập nhật (Update) bài viết
        $data = json_decode(file_get_contents("php://input"), true);
        $postId = intval($data['post_id'] ?? 0);

        if ($postId <= 0 || empty($data['title']) || empty($data['content'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input."]);
            exit();
        }

        // (3) BẢO MẬT CỐT LÕI: Luôn kiểm tra author_id trong mệnh đề WHERE!!!
        $stmt = $conn->prepare("
            UPDATE posts 
            SET title = ?, content = ?, thumbnail_url = ?, post_category_id = ?, updated_at = NOW()
            WHERE post_id = ? AND author_id = ?
        ");
        $stmt->bind_param(
            "sssiii",
            $data['title'],
            $data['content'],
            $data['thumbnail_url'],
            $data['post_category_id'],
            $postId,
            $current_user_id // Chỉ cho phép update nếu author_id khớp
        );

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true, "message" => "Post updated successfully."]);
            } else {
                http_response_code(403);
                echo json_encode(["error" => "No changes were made or you do not have permission."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        // Xử lý xóa bài viết
        $postId = intval($_GET['id'] ?? 0);
        if ($postId <= 0) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid post ID"]);
            exit();
        }

        // (3) Core security: Check author_id when deleted
        $stmt = $conn->prepare("DELETE FROM posts WHERE post_id = ? AND author_id = ?");
        $stmt->bind_param("ii", $postId, $current_user_id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true, "message" => "Post deleted successfully."]);
            } else {
                http_response_code(403);
                echo json_encode(["error" => "Post not found or you do not have permission to delete it."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => $stmt->error]);
        }
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}

$conn->close();
?>