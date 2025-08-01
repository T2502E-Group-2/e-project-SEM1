<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");

require_once("../../db/connect.php");

$sql = "select * from locations";
$rs = query($sql);
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