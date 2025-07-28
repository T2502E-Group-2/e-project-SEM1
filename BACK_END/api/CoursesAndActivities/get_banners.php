<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

require_once("../../db/connect.php");

$sql = "SELECT url, title, description FROM galleries WHERE type = 'image' ORDER BY media_id DESC LIMIT 5";
        
$rs = query($sql);

if (!$rs) {
    http_response_code(500); 
    echo json_encode([
        "status" => false,
        "message" => "Query failed: " . mysqli_error($conn), 
        "data" => []
    ]);
    exit;
}

$banners = [];
while ($row = $rs->fetch_assoc()) {
    $banners[] = [
        "image" => $row['url'],
        "title" => $row['title'] ?? 'Default Title', 
        "subtitle" => $row['description'] ?? 'Default Subtitle', 
        "buttonText" => "More info", 
        "buttonLink" => "#" 
    ];
}

$data = [
    "status" => true,
    "message" => "Success",
    "data" => $banners
];

echo json_encode($data);