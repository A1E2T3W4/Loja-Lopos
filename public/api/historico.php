<?php
ob_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
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

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo->beginTransaction();

        // 1. Inserir no histórico
        $stmt = $pdo->prepare("
            INSERT INTO historico_vendas
                (id_cliente, id_pedido, total, status, data_compra)
            VALUES
                (:id_cliente, :id_pedido, :total, :status, :data_compra)
        ");
        $stmt->execute([
            ':id_cliente'  => $data['id_cliente'],
            ':id_pedido'   => $data['id_pedido'],
            ':total'       => $data['total'],
            ':status'      => $data['status'] ?? 'concluído',
            ':data_compra' => $data['data_compra'],
        ]);

        $id_historico = $pdo->lastInsertId();

        // 2. Incrementar compras_realizadas na tabela clientes
        $pdo->prepare("
            UPDATE clientes 
            SET compras_realizadas = compras_realizadas + 1
            WHERE id_cliente = :id
        ")->execute([':id' => $data['id_cliente']]);

        // 3. Verificar se atingiu 10 compras para verificar cliente e dar bónus extra
        $stmt = $pdo->prepare("SELECT compras_realizadas FROM clientes WHERE id_cliente = :id");
        $stmt->execute([':id' => $data['id_cliente']]);
        $row = $stmt->fetch();

        if ($row && $row['compras_realizadas'] >= 10) {
            $pdo->prepare("UPDATE clientes SET cliente_verificado = 1 WHERE id_cliente = :id")
                ->execute([':id' => $data['id_cliente']]);

            // Gerir Cartão de Bónus
            $stmtCartao = $pdo->prepare("SELECT id_cartao FROM cartao WHERE id_cliente = :id");
            $stmtCartao->execute([':id' => $data['id_cliente']]);
            
            if (!$stmtCartao->fetch()) {
                $pdo->prepare("INSERT INTO cartao (id_cliente, saldo_bonus, ativo, criado_em) VALUES (:id, 0, 1, NOW())")
                    ->execute([':id' => $data['id_cliente']]);
            } else {
                // Bónus de fidelidade (Ex: 5000 KZ)
                $pdo->prepare("UPDATE cartao SET saldo_bonus = saldo_bonus + 5000, ativo = 1 WHERE id_cliente = :id")
                    ->execute([':id' => $data['id_cliente']]);
            }
        }

        // 4. Buscar dados actualizados (Sem tentar aceder a saldo_bonus na tabela clientes)
        $stmt = $pdo->prepare("
            SELECT 
                c.id_cliente, c.nome, c.email, c.telefone, c.foto_url,
                c.cliente_verificado, c.compras_realizadas,
                ca.id_cartao, ca.saldo_bonus, ca.qr_code, 
                ca.ativo AS cartao_ativo, ca.criado_em
            FROM clientes c
            LEFT JOIN cartao ca ON ca.id_cliente = c.id_cliente
            WHERE c.id_cliente = :id
        ");
        $stmt->execute([':id' => $data['id_cliente']]);
        $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

        $cliente['cartoes_cliente'] = [
            'id_cartao' => $cliente['id_cartao'] ?? null,
            'saldo_bonus' => (float)($cliente['saldo_bonus'] ?? 0),
            'qr_code' => $cliente['qr_code'] ?? null,
            'ativo' => (bool)($cliente['cartao_ativo'] ?? 0),
            'criado_em' => $cliente['criado_em'] ?? null
        ];
        
        unset($cliente['id_cartao'], $cliente['cartao_ativo'], $cliente['criado_em']);

        $pdo->commit();
        echo json_encode(["success" => true, "id_historico" => $id_historico, "cliente" => $cliente]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
?>