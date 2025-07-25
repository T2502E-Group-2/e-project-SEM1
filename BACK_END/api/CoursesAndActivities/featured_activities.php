<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

require_once(__DIR__ ."/../../db/connect.php");

$sql = "SELECT c.*, g.url AS thumbnail_url
        FROM activities c
        LEFT JOIN galleries g ON c.thumbnail_id = g.media_id
        WHERE c.is_featured=1
        ORDER BY c.activity_id DESC
        LIMIT 5";
$rs = query($sql);

if (!$rs) {
    http_response_code(500);
    echo json_encode([
        "status" => false,
        "message" => "Query failed",
        "data" => []
    ]);
    exit;
}

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