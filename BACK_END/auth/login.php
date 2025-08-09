<?php
session_start();
header("Content-Type: application/json");
require_once '../connect.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'];
$password = $data['password'];

$conn = connect();
$password_md5 = md5($password);

$stmt = $conn->prepare("SELECT * FROM users WHERE email=? AND password_hash=? AND is_active=1 LIMIT 1");
$stmt->bind_param("ss", $email, $password_md5);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $userData = $result->fetch_assoc();
    $_SESSION['user_id'] = $userData['user_id'];
    $_SESSION['first_name'] = $userData['first_name'];
    $_SESSION['last_name'] = $userData['last_name'];
    $_SESSION['role'] = $userData['role'];
    echo json_encode(["success" => true, "message" => "Login successful", "user" => $userData]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid email or password"]);
}
$conn->close();