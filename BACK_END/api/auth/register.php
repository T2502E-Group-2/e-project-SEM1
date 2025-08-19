<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
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

// Add a robust connection check
if ($conn->connect_error) {
    http_response_code(503); // Service Unavailable
    echo json_encode(["success" => false, "message" => "Database connection error: " . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate input data
if (
    !isset($data['first_name']) || !isset($data['last_name']) ||
    !isset($data['email']) || !isset($data['password'])
) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid input data. Please provide all required fields."]);
    $conn->close();
    exit;
}

$first_name = $data['first_name'];
$last_name = $data['last_name'];
$email = $data['email'];
$password = $data['password'];
$phone_number = isset($data['phone_number']) ? $data['phone_number'] : null;

// Fetch address details from the request
$address_line1 = $data['address_line1'] ?? null;
$address_line2 = $data['address_line2'] ?? null;
$city = $data['city'] ?? null;
$state_province = $data['state_province'] ?? null;
$zip_code = $data['zip_code'] ?? null;
$country = $data['country'] ?? null;
$role = 'member';
$is_active = 1;

// Hash the password before storing it
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// 1. Verify if the email is already exists in DB with Prepared Statement to prevent SQL Injection
$check_stmt = $conn->prepare("SELECT user_id FROM users WHERE email=?");
$check_stmt->bind_param("s", $email);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["success" => false, "message" => "Email exists."]);
    $check_stmt->close();
    $conn->close();
    exit;
}
$check_stmt->close();

// 2. Add new users with Prepared Statement
$insert_stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password, phone_number, role, is_active, address_line1, address_line2, city, state_province, zip_code, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$insert_stmt->bind_param("ssssissssssss", $first_name, $last_name, $email, $hashed_password, $phone_number, $role, $is_active, $address_line1, $address_line2, $city, $state_province, $zip_code, $country);

if ($insert_stmt->execute()) {
    $last_id = $conn->insert_id;
    $user_data_stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, role FROM users WHERE user_id = ?");
    $user_data_stmt->bind_param("i", $last_id);
    $user_data_stmt->execute();
    $result = $user_data_stmt->get_result();
    $userData = $result->fetch_assoc();
    $user_data_stmt->close();

    $_SESSION['user_id'] = $userData['user_id'];
    $_SESSION['user_role'] = $userData['role'];

    http_response_code(201); // 201 Created
    echo json_encode(["success" => true, "message" => "Registration Successfully!", "user" => $userData]);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(["success" => false, "message" => "Error:" . $conn->error]);
}

$insert_stmt->close();
$conn->close();
?>