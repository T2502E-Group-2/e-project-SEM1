<?php
header("Content-Type: application/json");

$host = "localhost";
$dbname = "e-project-1";
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $dbname);

$data = json_decode(file_get_contents("php://input"), true);

$first_name = $conn->real_escape_string($data['first_name']);
$last_name = $conn->real_escape_string($data['last_name']);
$email = $conn->real_escape_string($data['email']);
$password = md5($data['password']); // Hash MD5 để tương thích DB hiện tại
$phone_number = isset($data['phone_number']) ? $conn->real_escape_string($data['phone_number']) : null;
$role = 'member';
$is_active = 1;
$check = $conn->query("SELECT user_id FROM users WHERE email='$email'");
if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already exists"]);
    exit;
}

$sql = "INSERT INTO users (first_name, last_name, email, password_hash, phone_number, role, is_active) 
        VALUES ('$first_name', '$last_name', '$email', '$password', '$phone_number', '$role', '$is_active')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Registration successful"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}

$conn->close();