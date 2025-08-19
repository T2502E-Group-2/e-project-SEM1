<?php
// Print error message
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../../db/connect.php';

$conn = connect();

if ($conn->connect_error) {
    http_response_code(503); // Service Unavailable
    echo json_encode(["success" => false, "message" => "DB Connection Error: " . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid Data"]);
    $conn->close();
    exit;
}

$email = $data['email'];
$password = $data['password'];

// Search for user with given email
$stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, password, role FROM users WHERE email=? AND is_active=1");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Prepare statement caught errors: " . $conn->error]);
    $conn->close();
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

// 2. Verify hashed password    
    if (password_verify($password, $user['password'])) {
        // Sign in successfully
        unset($user['password']);
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['user_role'] = $user['role'];

        echo json_encode([
            "success" => true,
            "message" => "Đăng nhập thành công.",
            "user" => $user
        ]);
    } else {
        // Wrong password
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Email or password incorrectly."]);
    }
} else {
    // No user found
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Email or password incorrectly."]);
}

$stmt->close();
$conn->close();
?>