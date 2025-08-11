<?php
// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Access-Control-Allow-Methods: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Credentials: true");

require_once("../../db/connect.php");
if ($activity_id) {
    $sql = "select * from activities where activity_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $activity_id);
    $stmt->execute();
    $rs = $stmt->get_result();
    $activity = $rs->fetch_assoc();

    if ($activity) {
        $data = [
            "status" => true,
            "message" => "Success",
            "data" => $activity
        ];
    } else {
        $data = [
            "status" => false,
            "message" => "Activity not found",
            "data" => null
        ];
    }
} else {
    $data = [
        "status" => false,
        "message" => "Activity ID is missing",
        "data" => null
    ];
}

header('Content-Type: application/json');
echo json_encode($data);
?>