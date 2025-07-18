<?php
function connect(): mysqli {
    $host = 'localhost';
    $user = 'root';
    $password = 'root';
    $database = 'e-project-1';
    $conn = new mysqli($host, $user, $password, $database);
    if($conn->connect_error){
        die("Connection failed!");
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}

function query($sql) {
    $conn = connect();
    $rs = $conn->query($sql);
    $conn->close();
    return $rs;
}

function insert($sql){
    $conn = connect();
    $conn->query($sql);
    $last_id = $conn->insert_id;
    $conn->close();
    return $last_id;
}