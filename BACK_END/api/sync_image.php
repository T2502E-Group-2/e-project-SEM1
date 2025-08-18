<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// -------------------------------------------------------------------
// BLOCK 1: CREATE AND CONFIGURE DATABASE CONNECTION
// -------------------------------------------------------------------

require '../vendor/autoload.php'; 
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException; 

$host = 'localhost';
$user = 'root';
$password = 'root';
$database = 'e-project-1';
$tableName = "galleries";
$columnName = "url";
$albumColumn = "album";

$conn = new mysqli($host, $user, $password, $database);

if($conn->connect_error){
    die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");
echo "Connection success!.<br><hr>";

// -------------------------------------------------------------------
// BLOCK 2: GET AND INSERT IMAGES FROM IMAGEKIT API
// -------------------------------------------------------------------

$imagekitPublicApiKey = "public_m7ROSYja839VP4dPBVH2SHpjdo4=";
$imagekitPrivateKey = "private_LyqnjbFtFFH5vP9+hpuKWvGmSsE=";
$apiBaseUrl = "https://api.imagekit.io/v1/files";
$guzzleClient = new Client(['verify' => false]);
$mediaType = 'image';

$folders = ['/images/aconcagua','/images/annapurna','/images/assiniboine','/images/atlas', '/images/ausangate', '/images/bennevis','/images/everest','/images/fansipan','/images/fuji','/images/grossglockner','/images/kangchenjunga','/images/kenya','/images/kilimanjaro','/images/lhotse','/images/matterhorn','/images/mckinley','/images/meru','/images/mont_blanc','/images/roraima','/images/simien','/images/zugspitze', '/images/banner'];

$total_inserted_count = 0;
$total_updated_count = 0;
$total_skipped_count = 0;

try {
    $sql = "INSERT INTO `$tableName` (`$columnName`, `type`, `$albumColumn`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `$columnName` = VALUES(`$columnName`), `$albumColumn` = VALUES(`$albumColumn`)";
    $stmt = $conn->prepare($sql);
    
    if ($stmt === false) {
        throw new Exception("SQL prepare failed: " . $conn->error);
    }

    $folderalbum = '';
    $fileUrl = '';
    
    $stmt->bind_param("sss", $fileUrl, $mediaType, $folderalbum);

    foreach ($folders as $folder) {
        echo "Processing folder: <b>" . htmlspecialchars($folder) . "</b><br>";        
       
        $folderalbum = basename($folder);

        $response = $guzzleClient->request('GET', $apiBaseUrl, [
            'query' => ['path' => $folder],
            'auth' => [$imagekitPrivateKey, ''],
        ]);

        $responseData = json_decode($response->getBody()->getContents());

        if ($response->getStatusCode() === 200) {
            $files = $responseData;
            $folder_inserted_count = 0;
            $folder_updated_count = 0;
            $folder_skipped_count = 0;

            foreach ($files as $file) {
                if (!isset($file->url) || !is_string($file->url)) {
                    echo "Warning: Skip an object has unexpected value.<br>";
                    continue;
                }
                
                $fileUrl = $file->url;
                
                if ($stmt->execute()) {
                    if ($stmt->affected_rows === 1) {
                        $folder_inserted_count++;
                        echo "Insert URL success: " . htmlspecialchars($fileUrl) . "<br>";
                    } else if ($stmt->affected_rows === 2) {
                        $folder_updated_count++;
                        echo "The URL already exists and has an updated description: " . htmlspecialchars($fileUrl) . "<br>";
                    } else {
                        $folder_skipped_count++;
                        echo "Skip existing URL (no changes): " . htmlspecialchars($fileUrl) . "<br>";
                    }
                } else {
                    echo "Error inserting/updating URL: " . htmlspecialchars($fileUrl) . " - Error: " . $stmt->error . "<br>";
                }
            }
            $total_inserted_count += $folder_inserted_count;
            $total_updated_count += $folder_updated_count;
            $total_skipped_count += $folder_skipped_count;
            echo "<br><b>==> Insert completed " . $folder_inserted_count . " new URLs from folder " . htmlspecialchars($folder) . ".</b><br>";
            echo "<b>==> Updated " . $folder_updated_count . " existing URLs.</b><br>";
            echo "<b>==> Skipped " . $folder_skipped_count . " existing URLs.</b><br><br>";
        } else {
            echo "Error retrieving files from ImageKit for folder " . htmlspecialchars($folder) . ": " . $response->getReasonPhrase() . "<br><br>";
        }
    }

    $stmt->close();

} catch (RequestException $e) {
    echo "Error connecting to Guzzle API: " . $e->getMessage() . "<br>";
} catch (Exception $e) {
    echo "Error occurred: " . $e->getMessage();
}

// -------------------------------------------------------------------
// FINALIZE AND CLOSE CONNECTION
// -------------------------------------------------------------------

echo "<hr><b>REPORT:</b> Insert success: <b>$total_inserted_count</b> URL, updated <b>$total_updated_count</b> URL and skipped <b>$total_skipped_count</b> existing URLs.";

$conn->close();
?>