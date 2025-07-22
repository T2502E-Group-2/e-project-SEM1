<?php
function connect(): mysqli {
    $host = 'localhost';
    $user = 'root';
    $password = 'root';
    $database = 'e-project-1';

    $conn = new mysqli($host, $user, $password, $database);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $conn->set_charset("utf8mb4");
    return $conn;
}

function query($sql) {
    $conn = connect();
    $rs = $conn->query($sql);

    if (!$rs) {
        error_log("Query error: " . $conn->error);
        $conn->close();
        return false;
    }

    $conn->close();
    return $rs;
}

function insert($sql){
    $conn = connect();
    if (!$conn->query($sql)) {
        error_log("Insert error: " . $conn->error);
        $conn->close();
        return false;
    }

    $last_id = $conn->insert_id;
    $conn->close();
    return $last_id;
}