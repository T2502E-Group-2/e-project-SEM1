<?php
// Bật chế độ báo lỗi để hiển thị lỗi ra trình duyệt
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Cài đặt header để cho phép truy cập từ mọi domain và trả về JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

// Sửa đường dẫn file kết nối
require_once("../../db/connect.php");

// Khởi tạo mảng dữ liệu trả về
$response = array();

// Lấy kết nối từ hàm connect()
$conn = connect();

// Kiểm tra kết nối
if ($conn->connect_error) {
    $response['status'] = false;
    $response['message'] = "Connection failed: " . $conn->connect_error;
    echo json_encode($response);
    exit();
}

// Câu lệnh SQL với JOIN và SUBSTRING để lấy đoạn trích
$sql = "SELECT 
            p.post_id, 
            p.title, 
            p.thumbnail_url,
            SUBSTRING(p.content, 1, 200) AS excerpt,
            p.created_at,
            CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM 
            posts p
        LEFT JOIN 
            users u ON p.author_id = u.user_id
        ORDER BY 
            p.created_at DESC";

$result = $conn->query($sql);

if ($result) {
    if ($result->num_rows > 0) {
        $posts_arr = array();
        while($row = $result->fetch_assoc()) {
            array_push($posts_arr, $row);
        }
        $response['status'] = true;
        $response['message'] = "Posts fetched successfully.";
        $response['data'] = $posts_arr;
        http_response_code(200);
    } else {
        $response['status'] = true; // Vẫn là thành công, chỉ là không có dữ liệu
        $response['message'] = "No posts found.";
        $response['data'] = [];
        http_response_code(200);
    }
} else {
    $response['status'] = false;
    $response['message'] = "Query failed: " . $conn->error;
    http_response_code(500);
}

// Đóng kết nối
$conn->close();

echo json_encode($response);
?>