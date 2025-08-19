<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle pre-flight OPTIONS request from the browser
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Helper function to send a structured JSON error and exit.
function send_json_error($message, $statusCode = 400, $details = null) {
    http_response_code($statusCode);
    $response = ["error" => ["message" => $message]];
    if ($details !== null && getenv('APP_ENV') !== 'production') {
        $response['error']['details'] = $details;
    }
    echo json_encode($response);
    exit;
}

try {
    // --- 1. Validate File Upload ---    
    if (
        !isset($_FILES['file']) ||
        !isset($_FILES['file']['tmp_name']) ||
        !is_uploaded_file($_FILES['file']['tmp_name'])
    ) {
        send_json_error("No file uploaded or invalid upload mechanism.", 400);
    }

    if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $errorMessages = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload limit (upload_max_filesize).',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds form upload limit.',
            UPLOAD_ERR_PARTIAL    => 'The file was only partially uploaded.',
            UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server is missing a temporary folder.',
            UPLOAD_ERR_CANT_WRITE => 'Server failed to write file to disk.',
            UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the file upload.',
        ];
        $errorMessage = $errorMessages[$_FILES['file']['error']] ?? 'Unknown upload error.';
        send_json_error($errorMessage, 400);
    }

    // --- 2. Get File Info ---
    $tmpFilePath = $_FILES['file']['tmp_name'];
    $fileName = basename($_FILES['file']['name']);

    if (!file_exists($tmpFilePath)) {
        send_json_error("Temporary file does not exist.", 500, $tmpFilePath);
    }

    // Use finfo for reliable MIME type detection
    if (!extension_loaded('fileinfo')) {
        send_json_error("PHP 'fileinfo' extension is not enabled on the server.", 500);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($tmpFilePath);
    
    // --- 3. Prepare for ImageKit Upload ---
    $privateKey = "private_LyqnjbFtFFH5vP9+hpuKWvGmSsE=";
    $endpoint = "https://upload.imagekit.io/api/v1/files/upload";
    $folder = isset($_POST['folder']) ? $_POST['folder'] : "/posts";

    $postData = [
        "file" => new CURLFile($tmpFilePath, $mimeType, $fileName),
        "fileName" => $fileName,
        "folder" => $folder
    ];

    // --- 4. Execute cURL Request ---
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Basic " . base64_encode($privateKey . ":"),
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $responseBody = curl_exec($ch);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {        
        send_json_error("cURL Error during upload.", 500, $curlError);    }

    
    // --- 5. Process ImageKit Response ---
    $data = json_decode($responseBody, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        send_json_error("Failed to parse ImageKit response.", 500, $responseBody);
    }

    if (isset($data['url'])) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "url" => $data['url']
        ]);
    } else {
        $errorMessage = $data['message'] ?? "Unknown error from ImageKit.";
        send_json_error("ImageKit upload failed.", 400, $errorMessage);
    }

} catch (Throwable $e) {
    send_json_error("An unexpected server error occurred.", 500, $e->getMessage());
}