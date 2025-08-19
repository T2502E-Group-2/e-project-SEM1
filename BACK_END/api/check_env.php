<?php
header('Content-Type: text/html; charset=utf-8');
echo "<h1>CHECK PHP ENVIRONMENT</h1>";
echo "<hr>";

// 1. Check PHP version
echo "<h2>1. PHP version </h2>";
if (version_compare(PHP_VERSION, '5.5.0', '>=')) {
    echo "<p style='color:green; font-weight:bold;'>✅ OK: Current PHP version is " . PHP_VERSION . ", eligible.</p>";
} else {
    echo "<p style='color:red; font-weight:bold;'>❌ ERROR: Current PHP version is " . PHP_VERSION . ". You need PHP 5.5 or later for use `CURLFile`.</p>";
}

// 2. Check extension fileinfo
echo "<h2>2. Extension `fileinfo`</h2>";
if (extension_loaded('fileinfo')) {
    echo "<p style='color:green; font-weight:bold;'>✅ OK: Extension `fileinfo` is Enabled.</p>";
} else {
    echo "<p style='color:red; font-weight:bold;'>❌ Error: Extension `fileinfo` is not enabled. Please enable it in `php.ini` by remove the semicolon at the start of `extension=fileinfo` line. If `extension=fileinfo` does not exist, add it right after `extension=curl`.</p>";
}

// 3. Check CURLFile class
echo "<h2>3. `CURLFile` Class</h2>";
if (class_exists('CURLFile')) {
    echo "<p style='color:green; font-weight:bold;'>✅ OK: `CURLFile` exists.</p>";
} else {
    echo "<p style='color:red; font-weight:bold;'>❌ ERROR: `CURLFile` does not exist, it's not available in your PHP version. You need PHP 5.5 or later.</p>";
}
?>