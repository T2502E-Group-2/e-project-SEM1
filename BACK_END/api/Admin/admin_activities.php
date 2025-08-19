<?php
session_start();

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../db/connect.php';

// Limit user access to admins only
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["error" => "Access Denied"]);
    exit();
}

$conn = connect();

// Handle DELETE request
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $activityId = intval($_GET['id'] ?? 0);

    if ($activityId <= 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid activity ID"]);
        exit();
    }

    $stmt = $conn->prepare("DELETE FROM activities WHERE activity_id = ?");
    $stmt->bind_param("i", $activityId);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

// Handle POST request for updates
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['activity_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input, activity_id is required"]);
        exit();
    }

    $stmt = $conn->prepare("
        UPDATE activities
        SET title = ?, category_id = ?, description = ?, detail = ?, max_participants = ?, 
            price = ?, duration = ?, registration_deadline = ?, 
            start_date = ?, end_date = ?, status = ?, difficulty_level = ?, is_featured = ?, thumbnail_id = ?, updated_at = NOW()
        WHERE activity_id = ?
    ");

    $stmt->bind_param(
        "sissidsssssssii",
        $data['title'],
        $data['category_id'],
        $data['description'],
        $data['detail'],
        $data['max_participants'],
        $data['price'],
        $data['duration'],
        
        $data['registration_deadline'],
        $data['start_date'],
        $data['end_date'],
        $data['status'],
        $data['difficulty_level'],
        $data['is_featured'],
        $data['thumbnail_id'],
        $data['activity_id']
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Activity updated successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => $stmt->error]);
    }
    $stmt->close();
    $conn->close();
    exit();
}

// Handle GET request for searching and filtering
$search = $_GET['search'] ?? '';
$sortBy = $_GET['sort_by'] ?? 'created_at';
$sortOrder = $_GET['sort_order'] ?? 'DESC';
$startDate = $_GET['start_date'] ?? '';
$endDate = $_GET['end_date'] ?? '';

$allowedSortColumns = ['activity_id', 'title', 'created_at', 'updated_at', 'status', 'is_featured'];
if (!in_array($sortBy, $allowedSortColumns)) {
    $sortBy = 'created_at';
}
$sortOrder = strtoupper($sortOrder);
if (!in_array($sortOrder, ['ASC', 'DESC'])) {
    $sortOrder = 'DESC';
}

$sql = "
    SELECT 
        a.activity_id, a.title, c.category_name, a.description, a.detail, 
        a.max_participants, a.price, a.duration,
        a.registration_deadline, a.start_date, a.end_date, a.status, 
        a.difficulty_level, a.is_featured, g.url as thumbnail_url,
        DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(a.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
    FROM activities a
    LEFT JOIN categories c ON a.category_id = c.category_id
    LEFT JOIN galleries g ON a.thumbnail_id = g.media_id
";

$params = [];
$types = '';
$where = [];

if (!empty($search)) {
    $where[] = "(a.title LIKE ? OR a.description LIKE ? OR c.category_name LIKE ? OR l.name LIKE ?)";
    $searchTerm = "%" . $search . "%";
    array_push($params, $searchTerm, $searchTerm, $searchTerm, $searchTerm);
    $types .= 'ssss';
}

if (!empty($startDate) && !empty($endDate)) {
    $where[] = "DATE(a.created_at) BETWEEN ? AND ?";
    array_push($params, $startDate, $endDate);
    $types .= 'ss';
}

if (count($where) > 0) {
    $sql .= " WHERE " . implode(" AND ", $where);
}

$sql .= " ORDER BY {$sortBy} {$sortOrder}";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare Error: " . $conn->error]);
    exit();
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();
$activities = [];
while ($row = $result->fetch_assoc()) {
    $activities[] = $row;
}

header('Content-Type: application/json');
echo json_encode($activities);

$stmt->close();
$conn->close();
?>