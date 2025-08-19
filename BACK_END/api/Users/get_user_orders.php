<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
  header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

require_once("../../db/connect.php");
$conn = connect();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
  exit;
}

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
$paypal_order_id = $_GET['paypal_order_id'] ?? null;
$email = $_GET['email'] ?? null;
$phone = $_GET['phone'] ?? null;

$orders = [];
$error_message = '';

try {
  if ($user_id) {
    $sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($order_row = $result->fetch_assoc()) {
      $order_row['items'] = [];
      
      $sql_items = "
        SELECT
          oi.*,
          a.title AS activity_name,
          e.name AS equipment_name
        FROM order_items oi
        LEFT JOIN activities a ON oi.activity_id = a.activity_id
        LEFT JOIN equipments e ON oi.equipment_id = e.equipment_id
        WHERE oi.order_id = ?
      ";
      
      $stmt_items = $conn->prepare($sql_items);
      $stmt_items->bind_param("i", $order_row['id']);
      $stmt_items->execute();
      $result_items = $stmt_items->get_result();
      
      while ($item_row = $result_items->fetch_assoc()) {
        if ($item_row['activity_id']) {
            $item_row['product_name'] = $item_row['activity_name'];
        } else if ($item_row['equipment_id']) {
            $item_row['product_name'] = $item_row['equipment_name'];
        } else {
            $item_row['product_name'] = 'Unknown Product';
        }

        unset($item_row['activity_name']);
        unset($item_row['equipment_name']);
        
        $order_row['items'][] = $item_row;
      }
      $stmt_items->close();
      $orders[] = $order_row;
    }
    $stmt->close();
    echo json_encode(['success' => true, 'data' => $orders]);

  } else {
    // Case 2: Visitors, look up a specific order
    if (!$paypal_order_id && (!$email || !$phone)) {
      http_response_code(400);
      echo json_encode(['success' => false, 'message' => 'Invalid request. Must provide user_id or PayPal Order ID or Email/Phone.']);
      exit;
    }

    // Order query according to Paypal Order ID or Email/Phone
    $sql = "SELECT * FROM orders WHERE paypal_order_id = ? OR (email = ? AND phone = ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $paypal_order_id, $email, $phone);
    $stmt->execute();
    $result = $stmt->get_result();
    $order = $result->fetch_assoc();
    $stmt->close();
    
    if ($order) {
      $order['items'] = [];      
      
      $sql_items = "
        SELECT
          oi.*,
          a.title AS activity_name,
          e.name AS equipment_name
        FROM order_items oi
        LEFT JOIN activities a ON oi.activity_id = a.activity_id
        LEFT JOIN equipments e ON oi.equipment_id = e.equipment_id
        WHERE oi.order_id = ?
      ";

      $stmt_items = $conn->prepare($sql_items);
      $stmt_items->bind_param("i", $order['id']);
      $stmt_items->execute();
      $result_items = $stmt_items->get_result();
      
      while ($item_row = $result_items->fetch_assoc()) {
        if ($item_row['activity_id']) {
          $item_row['product_name'] = $item_row['activity_name'];
        } else if ($item_row['equipment_id']) {
          $item_row['product_name'] = $item_row['equipment_name'];
        } else {
          $item_row['product_name'] = 'Unknown Product';
        }
        $order['items'][] = $item_row;
      }
      $stmt_items->close();
      
      echo json_encode(['success' => true, 'data' => [$order]]);
    } else {
      http_response_code(404);
      echo json_encode(['success' => false, 'message' => 'Order not found.']);
    }
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>