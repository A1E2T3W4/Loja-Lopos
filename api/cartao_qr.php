<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean();
    exit();
}
ob_end_clean();

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents("php://input"), true);

/* ── GET — buscar cartão + personalização ── */
if ($method === 'GET') {
    $id_cliente = $_GET['id_cliente'] ?? null;
    if (!$id_cliente) {
        echo json_encode(["success" => false, "message" => "id_cliente em falta."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM cartao WHERE id_cliente = :id LIMIT 1");
        $stmt->execute([':id' => $id_cliente]);
        $cartao = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cartao) {
            // Criar cartão se não existir
            $qr_code = "LOPOS-CARTAO-" . $id_cliente . "-" . bin2hex(random_bytes(8));
            $pdo->prepare("
                INSERT INTO cartao (id_cliente, saldo_bonus, qr_code, ativo, paleta_id, imagem_bg)
                VALUES (:id, 0, :qr, 1, 'indigo', NULL)
            ")->execute([':id' => $id_cliente, ':qr' => $qr_code]);

            $cartao = [
                'id_cartao'   => $pdo->lastInsertId(),
                'id_cliente'  => $id_cliente,
                'saldo_bonus' => 0,
                'qr_code'     => $qr_code,
                'ativo'       => 1,
                'paleta_id'   => 'indigo',
                'imagem_bg'   => null,
            ];
        }

        echo json_encode([
            "success"   => true,
            "cartao"    => $cartao,
            "paleta_id" => $cartao['paleta_id'] ?? 'indigo',
            "imagem_bg" => $cartao['imagem_bg'] ?? null,
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

/* ── PUT — actualizar personalização do cartão ── */
if ($method === 'PUT') {
    $id_cliente = $input['id_cliente'] ?? null;

    if (!$id_cliente) {
        echo json_encode(["success" => false, "message" => "id_cliente em falta."]);
        exit();
    }

    try {
        // Verifica se cartão existe
        $stmt = $pdo->prepare("SELECT id_cartao FROM cartao WHERE id_cliente = :id LIMIT 1");
        $stmt->execute([':id' => $id_cliente]);
        $cartao = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cartao) {
            // Cria cartão se não existir
            $qr_code = "LOPOS-CARTAO-" . $id_cliente . "-" . bin2hex(random_bytes(8));
            $pdo->prepare("
                INSERT INTO cartao (id_cliente, saldo_bonus, qr_code, ativo, paleta_id, imagem_bg)
                VALUES (:id, 0, :qr, 1, 'indigo', NULL)
            ")->execute([':id' => $id_cliente, ':qr' => $qr_code]);
        }

        // Constrói UPDATE dinâmico só com campos enviados
        $sets   = [];
        $params = [':id' => $id_cliente];

        if (array_key_exists('paleta_id', $input)) {
            $sets[]              = "paleta_id = :paleta_id";
            $params[':paleta_id'] = $input['paleta_id'] ?? 'indigo';
        }

        if (array_key_exists('imagem_bg', $input)) {
            $sets[]              = "imagem_bg = :imagem_bg";
            $params[':imagem_bg'] = $input['imagem_bg']; // pode ser null ou base64
        }

        if (empty($sets)) {
            echo json_encode(["success" => true, "message" => "Nada para actualizar."]);
            exit();
        }

        $sql = "UPDATE cartao SET " . implode(", ", $sets) . " WHERE id_cliente = :id";
        $pdo->prepare($sql)->execute($params);

        echo json_encode(["success" => true, "message" => "Cartão actualizado."]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

/* ── POST — débito de saldo (Scanner) ── */
if ($method === 'POST') {
    $qr_code = $input['qr_code'] ?? null;
    $valor   = $input['valor']   ?? null;

    if (!$qr_code || $valor === null) {
        echo json_encode(["success" => false, "message" => "Dados em falta."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            SELECT ca.*, c.nome, c.email
            FROM cartao ca
            JOIN clientes c ON c.id_cliente = ca.id_cliente
            WHERE ca.qr_code = :qr AND ca.ativo = 1
            LIMIT 1
        ");
        $stmt->execute([':qr' => $qr_code]);
        $cartao = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cartao) {
            echo json_encode(["success" => false, "message" => "Cartão inválido ou inactivo."]);
            exit();
        }

        $saldo_actual  = floatval($cartao['saldo_bonus']);
        $valor_debitar = min(floatval($valor), $saldo_actual);

        if ($valor_debitar <= 0) {
            echo json_encode(["success" => false, "message" => "Saldo insuficiente.", "saldo" => $saldo_actual]);
            exit();
        }

        $pdo->beginTransaction();

        $pdo->prepare("UPDATE cartao SET saldo_bonus = saldo_bonus - :v WHERE qr_code = :qr")
            ->execute([':v' => $valor_debitar, ':qr' => $qr_code]);

        $pdo->prepare("UPDATE clientes SET saldo_bonus = saldo_bonus - :v WHERE id_cliente = :id")
            ->execute([':v' => $valor_debitar, ':id' => $cartao['id_cliente']]);

        // Regista transacção se tabela existir
        $temTabela = $pdo->query("SHOW TABLES LIKE 'bonus_transacoes'")->fetch();
        if ($temTabela) {
            $pdo->prepare("
                INSERT INTO bonus_transacoes (id_cartao, valor, tipo, descricao)
                VALUES (?, ?, 'DEBITO', 'Pagamento na entrega')
            ")->execute([$cartao['id_cartao'], $valor_debitar]);
        }

        $pdo->commit();

        $novo = $pdo->prepare("SELECT saldo_bonus FROM cartao WHERE qr_code = :qr");
        $novo->execute([':qr' => $qr_code]);
        $saldo_novo = floatval($novo->fetchColumn());

        echo json_encode([
            "success"        => true,
            "message"        => "Pagamento efectuado.",
            "nome_cliente"   => $cartao['nome'],
            "valor_pago"     => $valor_debitar,
            "saldo_anterior" => $saldo_actual,
            "saldo_restante" => $saldo_novo,
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método não suportado."]);
?>