<?php
// header('Content-Type: text/html; charset=utf-8');
// echo "<h1>Kiểm tra Môi trường PHP</h1>";
// echo "<hr>";

// // 1. Kiểm tra Phiên bản PHP
// echo "<h2>1. Phiên bản PHP</h2>";
// if (version_compare(PHP_VERSION, '5.5.0', '>=')) {
//     echo "<p style='color:green; font-weight:bold;'>✅ OK: Phiên bản PHP là " . PHP_VERSION . ", đủ điều kiện.</p>";
// } else {
//     echo "<p style='color:red; font-weight:bold;'>❌ LỖI: Phiên bản PHP là " . PHP_VERSION . ". Bạn cần PHP 5.5 trở lên để sử dụng `CURLFile`.</p>";
// }

// // 2. Kiểm tra extension fileinfo
// echo "<h2>2. Tiện ích `fileinfo`</h2>";
// if (extension_loaded('fileinfo')) {
//     echo "<p style='color:green; font-weight:bold;'>✅ OK: Tiện ích `fileinfo` đã được bật.</p>";
// } else {
//     echo "<p style='color:red; font-weight:bold;'>❌ LỖI: Tiện ích `fileinfo` CHƯA được bật. Đây là nguyên nhân có khả năng cao nhất! Bạn cần bật nó trong file `php.ini` bằng cách bỏ dấu chấm phẩy ở dòng `extension=fileinfo`.</p>";
// }

// // 3. Kiểm tra class CURLFile
// echo "<h2>3. Lớp `CURLFile`</h2>";
// if (class_exists('CURLFile')) {
//     echo "<p style='color:green; font-weight:bold;'>✅ OK: Lớp `CURLFile` tồn tại.</p>";
// } else {
//     echo "<p style='color:red; font-weight:bold;'>❌ LỖI: Lớp `CURLFile` không tồn tại, thường do phiên bản PHP của bạn quá cũ.</p>";
// }
?>