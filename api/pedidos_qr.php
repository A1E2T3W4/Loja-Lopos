<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean();
    exit();
}
ob_end_clean();

require_once 'config.php';

$data   = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        if (empty($data['id_pedido']) || empty($data['qr_code'])) {
            echo json_encode(["success" => false, "message" => "id_pedido e qr_code são obrigatórios."]);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE pedidos
            SET qr_code = :qr_code,
                status  = :status
            WHERE id_pedido = :id_pedido
        ");
        $stmt->execute([
            ':id_pedido' => intval($data['id_pedido']),
            ':qr_code'   => $data['qr_code'],
            ':status'    => $data['status'] ?? 'pendente',
        ]);

        echo json_encode(["success" => true]);

    } else {
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Método não suportado."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}