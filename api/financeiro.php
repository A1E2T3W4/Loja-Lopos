<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
date_default_timezone_set('Africa/Luanda');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once "config.php";

$method = $_SERVER['REQUEST_METHOD'];

/* ══════════════════════════════════════════════════════════════
   GET — lista de movimentos ou dashboard
══════════════════════════════════════════════════════════════ */
if ($method === 'GET') {

    /* ── Lista de movimentos ── */
    if (isset($_GET['tipo']) && $_GET['tipo'] === 'movimentos') {
        try {
            $stmt = $pdo->query("
                SELECT id_financeiro, tipo, descricao, categoria,
                       valor, forma_pagamento, data_movimento,
                       status, observacao
                FROM financeiro
                ORDER BY data_movimento DESC
            ");
            echo json_encode([
                "success" => true,
                "data"    => $stmt->fetchAll(PDO::FETCH_ASSOC),
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
        exit;
    }

    /* ── Dashboard financeiro ── */
    try {
        $hoje_data  = date("Y-m-d");
        $ontem_data = date("Y-m-d", strtotime("-1 day"));

        // Vendas de hoje
        $q = $pdo->prepare("
            SELECT COALESCE(SUM(total), 0) FROM historico_vendas
            WHERE DATE(data_compra) = ? AND status NOT IN ('cancelado')
        ");
        $q->execute([$hoje_data]);
        $hoje = (float)$q->fetchColumn();

        // Vendas de ontem
        $q = $pdo->prepare("
            SELECT COALESCE(SUM(total), 0) FROM historico_vendas
            WHERE DATE(data_compra) = ? AND status NOT IN ('cancelado')
        ");
        $q->execute([$ontem_data]);
        $ontem = (float)$q->fetchColumn();

        // Últimos 7 dias
        $q = $pdo->query("
            SELECT DATE(data_compra) AS dia, COALESCE(SUM(total), 0) AS total
            FROM historico_vendas
            WHERE DATE(data_compra) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
              AND status NOT IN ('cancelado')
            GROUP BY DATE(data_compra)
        ");
        $porDia = [];
        foreach ($q->fetchAll(PDO::FETCH_ASSOC) as $r) {
            $porDia[$r['dia']] = (float)$r['total'];
        }
        $ultimos7 = [];
        for ($i = 6; $i >= 0; $i--) {
            $data       = date("Y-m-d", strtotime("-$i days"));
            $ultimos7[] = $porDia[$data] ?? 0;
        }

        // Receita do mês
        $q = $pdo->query("
            SELECT COALESCE(SUM(total), 0) FROM historico_vendas
            WHERE status NOT IN ('cancelado')
              AND MONTH(data_compra) = MONTH(CURDATE())
              AND YEAR(data_compra)  = YEAR(CURDATE())
        ");
        $receitaMes = (float)$q->fetchColumn();

        // Receita mês anterior
        $q = $pdo->query("
            SELECT COALESCE(SUM(total), 0) FROM historico_vendas
            WHERE status NOT IN ('cancelado')
              AND MONTH(data_compra) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
              AND YEAR(data_compra)  = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
        ");
        $receitaMesAnt = (float)$q->fetchColumn();

        // Totais entradas/saídas da tabela financeiro
        $q = $pdo->query("
            SELECT
                COALESCE(SUM(CASE WHEN tipo='ENTRADA' AND status='CONFIRMADO' THEN valor ELSE 0 END), 0) AS entradas,
                COALESCE(SUM(CASE WHEN tipo='SAIDA'   AND status='CONFIRMADO' THEN valor ELSE 0 END), 0) AS saidas
            FROM financeiro
        ");
        $totais   = $q->fetch(PDO::FETCH_ASSOC);
        $entradas = (float)($totais['entradas'] ?? 0);
        $saidas   = (float)($totais['saidas']   ?? 0);

        echo json_encode([
            "success"         => true,
            "total"           => $hoje,
            "total_ontem"     => $ontem,
            "ultimos7"        => $ultimos7,
            "receita_mes"     => $receitaMes,
            "receita_mes_ant" => $receitaMesAnt,
            "entradas_total"  => $entradas,
            "saidas_total"    => $saidas,
            "saldo"           => $entradas - $saidas,
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success"         => false,
            "message"         => $e->getMessage(),
            "total"           => 0, "total_ontem" => 0,
            "ultimos7"        => array_fill(0, 7, 0),
            "receita_mes"     => 0, "receita_mes_ant" => 0,
            "entradas_total"  => 0, "saidas_total" => 0, "saldo" => 0,
        ]);
    }
    exit;
}

/* ══════════════════════════════════════════════════════════════
   POST — criar movimento
══════════════════════════════════════════════════════════════ */
if ($method === 'POST') {
    $d = json_decode(file_get_contents("php://input"), true);

    $tipo          = $d['tipo']           ?? 'ENTRADA';
    $descricao     = $d['descricao']      ?? '';
    $valor         = floatval($d['valor'] ?? 0);
    $categoria     = $d['categoria']      ?? 'Outro';
    $forma_pag     = $d['forma_pagamento'] ?? 'DINHEIRO';
    $observacao    = $d['observacao']     ?? '';
    $status        = $d['status']         ?? 'CONFIRMADO';

    if (!$descricao || !$valor) {
        echo json_encode(["success" => false, "message" => "Descrição e valor são obrigatórios."]);
        exit;
    }

    try {
        $pdo->prepare("
            INSERT INTO financeiro
              (tipo, descricao, valor, categoria, forma_pagamento, observacao, status, data_movimento)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ")->execute([$tipo, $descricao, $valor, $categoria, $forma_pag, $observacao, $status]);

        $id = $pdo->lastInsertId();

        echo json_encode([
            "success"    => true,
            "message"    => "Movimento registado com sucesso.",
            "id"         => $id,
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

/* ══════════════════════════════════════════════════════════════
   PUT — actualizar movimento
══════════════════════════════════════════════════════════════ */
if ($method === 'PUT') {
    $d  = json_decode(file_get_contents("php://input"), true);
    $id = intval($d['id_financeiro'] ?? 0);

    if (!$id) {
        echo json_encode(["success" => false, "message" => "ID em falta."]);
        exit;
    }

    try {
        $pdo->prepare("
            UPDATE financeiro
            SET tipo = ?, descricao = ?, valor = ?, categoria = ?,
                forma_pagamento = ?, observacao = ?, status = ?
            WHERE id_financeiro = ?
        ")->execute([
            $d['tipo']            ?? 'ENTRADA',
            $d['descricao']       ?? '',
            floatval($d['valor']  ?? 0),
            $d['categoria']       ?? 'Outro',
            $d['forma_pagamento'] ?? 'DINHEIRO',
            $d['observacao']      ?? '',
            $d['status']          ?? 'CONFIRMADO',
            $id,
        ]);

        echo json_encode(["success" => true, "message" => "Movimento actualizado."]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

/* ══════════════════════════════════════════════════════════════
   DELETE — eliminar movimento
══════════════════════════════════════════════════════════════ */
if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);

    if (!$id) {
        echo json_encode(["success" => false, "message" => "ID em falta."]);
        exit;
    }

    try {
        $pdo->prepare("DELETE FROM financeiro WHERE id_financeiro = ?")->execute([$id]);
        echo json_encode(["success" => true, "message" => "Movimento eliminado."]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método não suportado."]);
?>