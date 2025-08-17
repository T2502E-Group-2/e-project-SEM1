<?php
// CORS headers
// if (isset($_SERVER['HTTP_ORIGIN'])) {
//     header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
// }
// header("Access-Control-Allow-Methods: *");
// header("Access-Control-Allow-Headers: *");
// header("Access-Control-Allow-Credentials: true");

// require_once("../../db/connect.php");

// $sql = "select * from categories";
// $rs = query($sql);
// $list = [];
// while($row = $rs->fetch_assoc()){
//     $list[] = $row;
// }
// $data = [
//     "status"=> true,
//     "message"=> "Success",
//     "data"=> $list
// ];
// echo json_encode($data);