<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$uploadDir = __DIR__ . "/../uploads/produtos/";
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

if (!isset($_FILES["imagem"]) || $_FILES["imagem"]["error"] !== 0) {
    echo json_encode(["success" => false, "message" => "Nenhum ficheiro recebido."]);
    exit;
}

$file     = $_FILES["imagem"];
$ext      = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
$allowed  = ["jpg","jpeg","png","webp","gif"];

if (!in_array($ext, $allowed)) {
    echo json_encode(["success" => false, "message" => "Formato não suportado."]);
    exit;
}

if ($file["size"] > 5 * 1024 * 1024) {
    echo json_encode(["success" => false, "message" => "Ficheiro demasiado grande (máx 5MB)."]);
    exit;
}

$nome    = uniqid("prod_", true) . "." . $ext;
$destino = $uploadDir . $nome;

if (move_uploaded_file($file["tmp_name"], $destino)) {
   $url = "https://lojalopos.infinityfreeapp.com/uploads/produtos/" . $nome;
    echo json_encode(["success" => true, "url" => $url, "nome" => $nome]);
} else {
    echo json_encode(["success" => false, "message" => "Erro ao guardar ficheiro."]);
}