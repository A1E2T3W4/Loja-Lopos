<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once "config.php";

$input   = json_decode(file_get_contents("php://input"), true) ?? [];
$method  = $_SERVER['REQUEST_METHOD'];

// ── GET — consulta por id_cliente (usado no Scanner da loja web) ──
if ($method === 'GET') {
    $id_cliente = intval($_GET['id_cliente'] ?? 0);
    if (!$id_cliente) {
        echo json_encode(["success" => false, "message" => "id_cliente em falta."]);
        exit;
    }
    try {
        $q = $pdo->prepare("
            SELECT ca.id_cartao, ca.id_cliente, ca.saldo_bonus, ca.qr_code,
                   ca.ativo, ca.paleta_id,
                   c.nome, c.email, c.telefone, c.cliente_verificado
            FROM cartao ca
            JOIN clientes c ON c.id_cliente = ca.id_cliente
            WHERE ca.id_cliente = ? AND ca.ativo = 1
            LIMIT 1
        ");
        $q->execute([$id_cliente]);
        $row = $q->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            // Cria cartão automaticamente
            $qr = "LOPOS-CARTAO-{$id_cliente}-" . bin2hex(random_bytes(8));
            $pdo->prepare("
                INSERT INTO cartao (id_cliente, saldo_bonus, qr_code, ativo, paleta_id)
                VALUES (?, 0, ?, 1, 'indigo')
            ")->execute([$id_cliente, $qr]);
            $row = [
                'id_cartao'          => $pdo->lastInsertId(),
                'id_cliente'         => $id_cliente,
                'saldo_bonus'        => 0,
                'qr_code'            => $qr,
                'ativo'              => 1,
                'paleta_id'          => 'indigo',
                'nome'               => '',
                'email'              => '',
                'cliente_verificado' => 0,
            ];
        }

        echo json_encode([
            "success"            => true,
            "id_cartao"          => (int)$row['id_cartao'],
            "id_cliente"         => (int)$row['id_cliente'],
            "nome"               => $row['nome'],
            "email"              => $row['email'],
            "saldo"              => (float)$row['saldo_bonus'],
            "cliente_verificado" => (bool)$row['cliente_verificado'],
            "qr_code"            => $row['qr_code'],
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// ── POST — consulta por qr_code (usado no Scanner da app mobile) ──
if ($method === 'POST') {
    $qr_code = trim($input['qr_code'] ?? '');

    if (!$qr_code) {
        echo json_encode(["success" => false, "message" => "qr_code em falta."]);
        exit;
    }

    try {
        $q = $pdo->prepare("
            SELECT ca.id_cartao, ca.id_cliente, ca.saldo_bonus, ca.qr_code,
                   ca.ativo, ca.paleta_id,
                   c.nome, c.email, c.telefone, c.cliente_verificado
            FROM cartao ca
            JOIN clientes c ON c.id_cliente = ca.id_cliente
            WHERE ca.qr_code = ? AND ca.ativo = 1
            LIMIT 1
        ");
        $q->execute([$qr_code]);
        $row = $q->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            echo json_encode(["success" => false, "message" => "Cartão inválido ou inactivo."]);
            exit;
        }

        if (!$row['cliente_verificado']) {
            echo json_encode([
                "success" => false,
                "message" => "Cartão só disponível para clientes verificados.",
            ]);
            exit;
        }

        echo json_encode([
            "success" => true,
            "cartao"  => [
                "id_cartao"          => (int)$row['id_cartao'],
                "id_cliente"         => (int)$row['id_cliente'],
                "nome_cliente"       => $row['nome'],
                "email"              => $row['email'],
                "saldo_bonus"        => (float)$row['saldo_bonus'],
                "cliente_verificado" => (bool)$row['cliente_verificado'],
                "qr_code"            => $row['qr_code'],
                "paleta_id"          => $row['paleta_id'] ?? 'indigo',
            ],
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método não suportado."]);
?>