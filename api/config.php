<?php
$host     = "localhost";   // ou 127.0.0.1
$db       = "loja";
$user     = "root";
$password = "";            // XAMPP por padrão não tem senha

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    header("Content-Type: application/json");
    echo json_encode(["success" => false, "message" => "Erro BD: " . $e->getMessage()]);
    exit();
}