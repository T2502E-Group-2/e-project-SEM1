<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once("../../db/connect.php");

$sql = "select *, equipment_id as id from equipments where featured = 1"; // Lấy các thiết bị nổi bật
$rs = query($sql);

if ($rs) {
    $list = [];
    while($row = $rs->fetch_assoc()){
        $list[] = $row;
    }
    $data = [
        "status"=> true,
        "message"=> "Success",
        "data"=> $list
    ];
} else {
    http_response_code(500); // Internal Server Error
    $data = [
        "status" => false,
        "message" => "Failed to execute query. Please check the database connection and the 'featured' column in the 'equipments' table."
    ];
}
echo json_encode($data);