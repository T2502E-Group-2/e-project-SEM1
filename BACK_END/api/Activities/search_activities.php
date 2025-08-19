<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Credentials: true");

require_once __DIR__ . "/../../db/connect.php";

$conn = connect();

$searchQuery = $_GET["search"] ?? '';

if (empty($searchQuery)) {
    echo json_encode(["status" => true, "message" => "Success", "data" => []]);
    exit;
}

$sql = "SELECT * FROM activities WHERE title LIKE ? ORDER BY activity_id DESC LIMIT 8";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => false, "message" => "Prepare statement failed: " . $conn->error]);
    exit;
}

$searchTerm = "%" . $searchQuery . "%";
$stmt->bind_param("s", $searchTerm);
$stmt->execute();
$rs = $stmt->get_result();

$list = [];
while($row = $rs->fetch_assoc()){
    $list[] = $row;
}

$data = [
    "status"=> true,
    "message"=> "Success",
    "data"=> $list
];
echo json_encode($data);

$stmt->close();
$conn->close();