<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); ob_end_clean(); exit();
}
ob_end_clean();

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents("php://input"), true) ?? [];

// ── Helper — cria cartão se não existir ─────────────────────
function criarCartao(PDO $pdo, int $id_cliente, float $saldo = 0): array {
    $qr = "LOPOS-CARTAO-{$id_cliente}-" . bin2hex(random_bytes(8));
    $pdo->prepare("
        INSERT INTO cartao (id_cliente, saldo_bonus, qr_code, ativo, paleta_id, imagem_bg)
        VALUES (?, ?, ?, 1, 'indigo', NULL)
    ")->execute([$id_cliente, $saldo, $qr]);

    return [
        'id_cartao'  => (int)$pdo->lastInsertId(),
        'saldo_bonus'=> $saldo,
        'qr_code'    => $qr,
        'paleta_id'  => 'indigo',
        'imagem_bg'  => null,
    ];
}

try {

    // ════════════════════════════════════════════════════
    // GET — busca cartão + dados do cliente
    // ════════════════════════════════════════════════════
    if ($method === 'GET') {
        $id_cliente = intval($_GET['id_cliente'] ?? 0);

        if (!$id_cliente) {
            echo json_encode(["success" => false, "message" => "id_cliente em falta."]);
            exit;
        }

        $q = $pdo->prepare("
            SELECT
                c.id_cliente, c.nome, c.email, c.telefone,
                c.saldo_bonus         AS saldo_cliente,
                c.cliente_verificado,
                ca.id_cartao,
                ca.saldo_bonus        AS saldo_cartao,
                ca.qr_code,
                ca.ativo,
                ca.paleta_id,
                ca.imagem_bg
            FROM clientes c
            LEFT JOIN cartao ca
                   ON ca.id_cliente = c.id_cliente
                  AND ca.ativo = 1
            WHERE c.id_cliente = ?
            LIMIT 1
        ");
        $q->execute([$id_cliente]);
        $row = $q->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            echo json_encode(["success" => false, "message" => "Cliente não encontrado."]);
            exit;
        }

        // Cria cartão se não existir
        if (!$row['id_cartao']) {
            $novo = criarCartao($pdo, $id_cliente, (float)$row['saldo_cliente']);
            $row  = array_merge($row, $novo);
        }

        echo json_encode([
            "success"            => true,
            "id_cliente"         => (int)$row['id_cliente'],
            "id_cartao"          => (int)$row['id_cartao'],
            "nome"               => $row['nome'],
            "email"              => $row['email'],
            "telefone"           => $row['telefone'] ?? '',
            "saldo"              => (float)($row['saldo_cartao'] ?? 0),
            "cliente_verificado" => (bool)$row['cliente_verificado'],
            "cartao" => [
                "paleta_id" => $row['paleta_id'] ?? 'indigo',
                "imagem_bg" => $row['imagem_bg'] ?? null,
                "qr_code"   => $row['qr_code']   ?? null,
            ],
        ]);
        exit;
    }

    // ════════════════════════════════════════════════════
    // PUT — actualiza personalização (paleta + imagem)
    // ════════════════════════════════════════════════════
    if ($method === 'PUT') {
        $id_cliente = intval($input['id_cliente'] ?? 0);

        if (!$id_cliente) {
            echo json_encode(["success" => false, "message" => "id_cliente obrigatório."]);
            exit;
        }

        // Garante que o cartão existe
        $q = $pdo->prepare("
            SELECT id_cartao FROM cartao
            WHERE id_cliente = ? AND ativo = 1 LIMIT 1
        ");
        $q->execute([$id_cliente]);
        if (!$q->fetch()) {
            criarCartao($pdo, $id_cliente);
        }

        $sets   = [];
        $params = [];

        if (array_key_exists('paleta_id', $input)) {
            $paleta_id = trim($input['paleta_id'] ?? 'indigo');
            $validas   = ['indigo','ocean','forest','sunset','rose','midnight','aurora','cosmic'];
            if (!in_array($paleta_id, $validas)) $paleta_id = 'indigo';
            $sets[]              = "paleta_id = :paleta_id";
            $params[':paleta_id'] = $paleta_id;
        }

        if (array_key_exists('imagem_bg', $input)) {
            $sets[]              = "imagem_bg = :imagem_bg";
            $params[':imagem_bg'] = $input['imagem_bg'];
        }

        if (empty($sets)) {
            echo json_encode(["success" => true, "message" => "Nada para actualizar."]);
            exit;
        }

        $params[':id_cliente'] = $id_cliente;
        $pdo->prepare("
            UPDATE cartao
            SET " . implode(", ", $sets) . "
            WHERE id_cliente = :id_cliente AND ativo = 1
        ")->execute($params);

        $q = $pdo->prepare("
            SELECT paleta_id, imagem_bg, qr_code
            FROM cartao WHERE id_cliente = ? AND ativo = 1 LIMIT 1
        ");
        $q->execute([$id_cliente]);
        $cartao = $q->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "message" => "Cartão actualizado.",
            "cartao"  => [
                "paleta_id" => $cartao['paleta_id'] ?? 'indigo',
                "imagem_bg" => $cartao['imagem_bg'] ?? null,
                "qr_code"   => $cartao['qr_code']   ?? null,
            ],
        ]);
        exit;
    }

    // ════════════════════════════════════════════════════
    // POST — ✅ DÉBITO DE SALDO (Scanner / App Entregador)
    // ════════════════════════════════════════════════════
    if ($method === 'POST') {
        $qr_code = trim($input['qr_code'] ?? '');
        $valor   = floatval($input['valor'] ?? 0);

        if (!$qr_code || $valor <= 0) {
            echo json_encode([
                "success" => false,
                "message" => "qr_code e valor são obrigatórios.",
            ]);
            exit;
        }

        $pdo->beginTransaction();

        // ✅ Busca o cartão com LOCK para evitar race condition
        $q = $pdo->prepare("
            SELECT
                ca.id_cartao,
                ca.id_cliente,
                ca.saldo_bonus,
                c.nome,
                c.email,
                c.cliente_verificado
            FROM cartao ca
            JOIN clientes c ON c.id_cliente = ca.id_cliente
            WHERE ca.qr_code = ?
              AND ca.ativo = 1
            LIMIT 1
            FOR UPDATE
        ");
        $q->execute([$qr_code]);
        $cartao = $q->fetch(PDO::FETCH_ASSOC);

        if (!$cartao) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => "Cartão inválido ou inactivo."]);
            exit;
        }

        // ✅ Só clientes verificados podem usar o cartão de bónus
        if (!$cartao['cliente_verificado']) {
            $pdo->rollBack();
            echo json_encode([
                "success" => false,
                "message" => "Este cartão só está disponível para clientes verificados.",
            ]);
            exit;
        }

        $saldo_actual  = floatval($cartao['saldo_bonus']);
        $valor_debitar = min($valor, $saldo_actual);

        if ($valor_debitar <= 0) {
            $pdo->rollBack();
            echo json_encode([
                "success" => false,
                "message" => "Saldo insuficiente.",
                "saldo"   => $saldo_actual,
            ]);
            exit;
        }

        // ✅ Debita do cartão
        $stmt = $pdo->prepare("
            UPDATE cartao
            SET saldo_bonus = saldo_bonus - ?
            WHERE id_cartao = ?
        ");
        $stmt->execute([$valor_debitar, $cartao['id_cartao']]);

        // ✅ Verifica que o UPDATE afectou a linha
        if ($stmt->rowCount() === 0) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => "Erro ao debitar o cartão."]);
            exit;
        }

        // ✅ Sincroniza com a tabela clientes
        $pdo->prepare("
            UPDATE clientes
            SET saldo_bonus = GREATEST(0, saldo_bonus - ?)
            WHERE id_cliente = ?
        ")->execute([$valor_debitar, $cartao['id_cliente']]);

        // Regista transacção se tabela existir
        $temTabela = $pdo->query("SHOW TABLES LIKE 'bonus_transacoes'")->fetch();
        if ($temTabela) {
            $pdo->prepare("
                INSERT INTO bonus_transacoes
                    (id_cartao, valor, tipo, descricao)
                VALUES (?, ?, 'debito', 'Pagamento com Cartão de Benefícios')
            ")->execute([$cartao['id_cartao'], $valor_debitar]);
        }

        $pdo->commit();

        // ✅ Busca saldo actualizado directamente da BD
        $qSaldo = $pdo->prepare("
            SELECT saldo_bonus FROM cartao WHERE id_cartao = ?
        ");
        $qSaldo->execute([$cartao['id_cartao']]);
        $saldo_novo = (float)$qSaldo->fetchColumn();

        echo json_encode([
            "success"        => true,
            "message"        => "Pagamento efectuado com sucesso.",
            "nome_cliente"   => $cartao['nome'],
            "email"          => $cartao['email'],
            "valor_pago"     => $valor_debitar,
            "saldo_anterior" => $saldo_actual,
            "saldo_restante" => $saldo_novo,
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não suportado."]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}