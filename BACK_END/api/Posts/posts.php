<?php
/**
 * API Endpoint để lấy danh sách bài viết.
 * Hỗ trợ lọc theo danh mục và phân quyền xem bài viết (admin, thành viên, khách).
 */

// Môi trường development: Bật lỗi. Môi trường production: Tắt đi
ini_set('display_errors', 1); // Đổi thành 0 khi deploy
error_reporting(E_ALL);     // Đổi thành 0 khi deploy

// --- 1. Cài đặt Headers (CORS & Content Type) ---
header("Content-Type: application/json; charset=UTF-8");
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Xử lý dứt điểm OPTIONS request (pre-flight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- 2. Khởi tạo và kết nối ---
session_start();
require_once("../../db/connect.php");
require_once("../../db/constants.php"); // Yêu cầu file chứa hằng số status

$response = []; // Khởi tạo response mặc định
$conn = connect();

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => false, 
        "message" => "Database connection failed: " . $conn->connect_error,
        "data" => []
    ]);
    exit();
}

try {
    // --- 3. Lấy các tham số từ URL và Session ---
    $current_user_id = $_SESSION['user_id'] ?? null;
    $current_user_role = $_SESSION['user_role'] ?? null;
    $category_id = isset($_GET['category']) ? intval($_GET['category']) : null;
    
    $category_info = null;

    // --- 4. Xây dựng câu lệnh SQL ---
    $sql = "SELECT 
                p.post_id, p.author_id, p.title, p.slug, p.thumbnail_url,
                p.post_category_id,
                SUBSTRING(p.content, 1, 200) AS excerpt,
                p.created_at, p.status,
                CONCAT(u.first_name, ' ', u.last_name) AS author_name
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.user_id";

    $whereConditions = [];
    $params = [];
    $types = "";

    // -- Xử lý lọc theo Category --
    if ($category_id) {
        $whereConditions[] = "p.post_category_id = ?";
        $params[] = $category_id;
        $types .= "i";

        // Lấy thông tin category để trả về cho frontend
        $cat_stmt = $conn->prepare("SELECT category_name FROM categories WHERE category_id = ?");
        $cat_stmt->bind_param("i", $category_id);
        $cat_stmt->execute();
        $cat_result = $cat_stmt->get_result();
        $category_info = $cat_result->fetch_assoc();
        $cat_stmt->close();

        // **Cải tiến**: Nếu category_id được cung cấp nhưng không tồn tại, trả về lỗi 404
        if (!$category_info) {
            throw new Exception("Category not found.", 404);
        }
    }

    // -- Xử lý lọc theo Status & Quyền người dùng --
    if ($current_user_role === 'admin') {
        // Admin có quyền xem tất cả, không cần thêm điều kiện status
    } elseif ($current_user_id) {
        $whereConditions[] = "(p.status = ? OR (p.status = ? AND p.author_id = ?))";
        $params = array_merge($params, [POST_STATUS_PUBLISHED, POST_STATUS_DRAFT, $current_user_id]);
        $types .= "ssi";
    } else {
        $whereConditions[] = "p.status = ?";
        $params[] = POST_STATUS_PUBLISHED;
        $types .= "s";
    }

    // -- Ghép các điều kiện và sắp xếp --
    if (!empty($whereConditions)) {
        $sql .= " WHERE " . implode(" AND ", $whereConditions);
    }
    $sql .= " ORDER BY p.created_at DESC";

    // --- 5. Thực thi truy vấn ---
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("SQL statement preparation failed: " . $conn->error);
    }
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $posts_arr = $result->fetch_all(MYSQLI_ASSOC);
    
    // --- 6. Chuẩn bị và trả về Response thành công ---
    http_response_code(200);
    $response['status'] = true;
    $response['message'] = "Posts fetched successfully.";
    if ($category_info) {
        $response['category_info'] = $category_info;
    }
    $response['data'] = $posts_arr;

} catch (Exception $e) {
    // --- 7. Xử lý Lỗi tập trung ---
    $errorCode = $e->getCode() ?: 500; // Lấy mã lỗi từ Exception, mặc định là 500
    http_response_code($errorCode);
    $response['status'] = false;
    $response['message'] = $e->getMessage();
    $response['data'] = []; // Đảm bảo key 'data' luôn tồn tại

} finally {
    // --- 8. Dọn dẹp ---
    if (isset($stmt)) $stmt->close();
    $conn->close();
}

// Trả về kết quả dưới dạng JSON, hỗ trợ ký tự Unicode (tiếng Việt)
echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>