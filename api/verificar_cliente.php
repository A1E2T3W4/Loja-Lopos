<?php
ob_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); ob_end_clean(); exit();
}
ob_end_clean();

require_once 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id_cliente = $data['id_cliente'];

        // Conta compras reais no histórico
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total FROM historico_vendas
            WHERE id_cliente = :id_cliente
        ");
        $stmt->execute([':id_cliente' => $id_cliente]);
        $row = $stmt->fetch();
        $total = (int)$row['total'];

        if ($total < 10) {
            echo json_encode([
                "success" => false,
                "message" => "Ainda não atingiu 10 compras.",
                "total"   => $total
            ]);
            exit();
        }

        // Marca como verificado na BD
        $stmt = $pdo->prepare("
            UPDATE clientes
            SET cliente_verificado  = 1,
                compras_realizadas  = :total,
                data_verificacao    = NOW()
            WHERE id_cliente = :id_cliente
        ");
        $stmt->execute([
            ':total'      => $total,
            ':id_cliente' => $id_cliente,
        ]);

        echo json_encode([
            "success"            => true,
            "cliente_verificado" => true,
            "compras_realizadas" => $total,
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}