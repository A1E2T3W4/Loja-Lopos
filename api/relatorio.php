<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
date_default_timezone_set('Africa/Luanda');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não suportado."]);
    exit;
}

require_once "config.php";

/* ══════════════════════════════════════════════════════════════
   PERÍODO — semanal | mensal | anual
══════════════════════════════════════════════════════════════ */
$periodo = strtolower(trim($_GET['periodo'] ?? 'mensal'));
$allowed = ['semanal', 'mensal', 'anual'];
if (!in_array($periodo, $allowed)) {
    echo json_encode(["success" => false, "message" => "Período inválido. Use: semanal, mensal ou anual."]);
    exit;
}

switch ($periodo) {
    case 'semanal':
        $inicio = date("Y-m-d", strtotime('monday this week'));
        $fim    = date("Y-m-d", strtotime('sunday this week'));
        $label  = "Semana " . date("W") . " — " . date("d/m/Y", strtotime($inicio)) . " a " . date("d/m/Y", strtotime($fim));
        break;
    case 'anual':
        $inicio = date("Y-01-01");
        $fim    = date("Y-12-31");
        $label  = "Ano de " . date("Y");
        break;
    default:
        $inicio = date("Y-m-01");
        $fim    = date("Y-m-t");
        $meses  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        $label  = $meses[(int)date("m") - 1] . " de " . date("Y");
        break;
}

$fimInclusive = $fim . " 23:59:59";

try {

    /* ── 1. PEDIDOS ────────────────────────────────────────── */
    $qPedidos = $pdo->prepare("
        SELECT
            COUNT(*)                                                          AS total,
            COUNT(CASE WHEN status = 'pendente'    THEN 1 END)               AS pendentes,
            COUNT(CASE WHEN status = 'reservado'   THEN 1 END)               AS reservados,
            COUNT(CASE WHEN status = 'enviado'     THEN 1 END)               AS enviados,
            COUNT(CASE WHEN status = 'entregue'    THEN 1 END)               AS entregues,
            COUNT(CASE WHEN status = 'cancelado'   THEN 1 END)               AS cancelados,
            COALESCE(SUM(CASE WHEN status <> 'cancelado' THEN total END), 0) AS receita_total
        FROM pedidos
        WHERE criado_em BETWEEN ? AND ?
    ");
    $qPedidos->execute([$inicio, $fimInclusive]);
    $pedidos = $qPedidos->fetch(PDO::FETCH_ASSOC);

    /* Top 5 pedidos de maior valor */
    $qTopPedidos = $pdo->prepare("
        SELECT p.id_pedido, c.nome, p.total, p.status, p.criado_em
        FROM pedidos p
        LEFT JOIN clientes c ON c.id_cliente = p.id_cliente
        WHERE p.criado_em BETWEEN ? AND ?
          AND p.status <> 'cancelado'
        ORDER BY p.total DESC
        LIMIT 5
    ");
    $qTopPedidos->execute([$inicio, $fimInclusive]);
    $topPedidos = $qTopPedidos->fetchAll(PDO::FETCH_ASSOC);

    /* ── 2. CLIENTES ───────────────────────────────────────── */
    $qClientes = $pdo->prepare("
        SELECT
            COUNT(*)                                              AS novos,
            COUNT(CASE WHEN cliente_verificado = 1 THEN 1 END)   AS verificados_novos
        FROM clientes
        WHERE criado_em BETWEEN ? AND ?
    ");
    $qClientes->execute([$inicio, $fimInclusive]);
    $clientesNovos = $qClientes->fetch(PDO::FETCH_ASSOC);

    $qTotalVerif    = $pdo->query("SELECT COUNT(*) FROM clientes WHERE cliente_verificado = 1");
    $totalVerificados = (int)$qTotalVerif->fetchColumn();

    $qTotalClientes = $pdo->query("SELECT COUNT(*) FROM clientes");
    $totalClientes  = (int)$qTotalClientes->fetchColumn();

    /* ── 3. PRODUTOS ───────────────────────────────────────── */
    $qProdutos = $pdo->prepare("
        SELECT
            COUNT(*)                                                 AS criados,
            COUNT(CASE WHEN status = 'disponivel'    THEN 1 END)    AS disponiveis,
            COUNT(CASE WHEN status = 'esgotado'      THEN 1 END)    AS esgotados,
            COUNT(CASE WHEN status = 'descontinuado' THEN 1 END)    AS descontinuados
        FROM produtos
        WHERE criado_em BETWEEN ? AND ?
    ");
    $qProdutos->execute([$inicio, $fimInclusive]);
    $produtosCriados = $qProdutos->fetch(PDO::FETCH_ASSOC);

    $qCriticos = $pdo->query("
        SELECT nome, estoque, estoque_minimo, categoria
        FROM produtos
        WHERE estoque <= estoque_minimo AND status = 'esgotado' AND ativo = 1
        ORDER BY estoque ASC
        LIMIT 8
    ");
    $stockCritico = $qCriticos->fetchAll(PDO::FETCH_ASSOC);

    /* ── 4. FINANCEIRO ─────────────────────────────────────── */
    $qFin = $pdo->prepare("
        SELECT
            COALESCE(SUM(CASE WHEN tipo = 'ENTRADA' AND status = 'CONFIRMADO' THEN valor END), 0) AS entradas,
            COALESCE(SUM(CASE WHEN tipo = 'SAIDA'   AND status = 'CONFIRMADO' THEN valor END), 0) AS saidas,
            COUNT(CASE WHEN tipo = 'ENTRADA' THEN 1 END) AS num_entradas,
            COUNT(CASE WHEN tipo = 'SAIDA'   THEN 1 END) AS num_saidas
        FROM financeiro
        WHERE data_movimento BETWEEN ? AND ?
    ");
    $qFin->execute([$inicio, $fimInclusive]);
    $financeiro = $qFin->fetch(PDO::FETCH_ASSOC);
    $financeiro['saldo'] = floatval($financeiro['entradas']) - floatval($financeiro['saidas']);

    $qMovimentos = $pdo->prepare("
        SELECT tipo, descricao, categoria, valor, forma_pagamento, data_movimento, status
        FROM financeiro
        WHERE data_movimento BETWEEN ? AND ?
          AND status = 'CONFIRMADO'
        ORDER BY data_movimento DESC
        LIMIT 10
    ");
    $qMovimentos->execute([$inicio, $fimInclusive]);
    $movimentos = $qMovimentos->fetchAll(PDO::FETCH_ASSOC);

    /* ── 5. ACESSOS — tabela login_logs ────────────────────── */
    /*
     * Colunas disponíveis em login_logs:
     *   id_log, id_usuario, user, nome, email, tipo,
     *   ip, user_agent, sucesso, motivo, data_log
     *
     * Mostra os últimos utilizadores que fizeram login
     * com sucesso no período, agrupados por utilizador,
     * com contagem de acessos e último login.
     */
    $qLogins = $pdo->prepare("
        SELECT
            COALESCE(nome, user, email)   AS nome,
            email,
            tipo,
            ip,
            COUNT(*)                      AS total_logins,
            MAX(data_log)                 AS ultimo_login,
            SUM(CASE WHEN sucesso = 0 THEN 1 ELSE 0 END) AS falhas
        FROM login_logs
        WHERE sucesso = 1
          AND data_log BETWEEN ? AND ?
        GROUP BY COALESCE(nome, user, email), email, tipo, ip
        ORDER BY ultimo_login DESC
        LIMIT 10
    ");
    $qLogins->execute([$inicio, $fimInclusive]);
    $logins = $qLogins->fetchAll(PDO::FETCH_ASSOC);

    /* Total de acessos com sucesso no período */
    $qTotalLogins = $pdo->prepare("
        SELECT COUNT(*) FROM login_logs
        WHERE sucesso = 1 AND data_log BETWEEN ? AND ?
    ");
    $qTotalLogins->execute([$inicio, $fimInclusive]);
    $totalLogins = (int)$qTotalLogins->fetchColumn();

    /* Total de tentativas falhadas no período */
    $qTotalFalhas = $pdo->prepare("
        SELECT COUNT(*) FROM login_logs
        WHERE sucesso = 0 AND data_log BETWEEN ? AND ?
    ");
    $qTotalFalhas->execute([$inicio, $fimInclusive]);
    $totalFalhas = (int)$qTotalFalhas->fetchColumn();

    /* ── 6. ENTREGAS ───────────────────────────────────────── */
    $qEntregas = $pdo->prepare("
        SELECT
            COUNT(*)                                             AS total,
            COUNT(CASE WHEN status = 'entregue'  THEN 1 END)    AS entregues,
            COUNT(CASE WHEN status = 'enviado'   THEN 1 END)    AS enviados,
            COUNT(CASE WHEN status = 'cancelado' THEN 1 END)    AS canceladas,
            COALESCE(AVG(distancia), 0)                         AS dist_media,
            COALESCE(SUM(preco_entrega), 0)                     AS receita_entregas
        FROM entregas
        WHERE data_envio BETWEEN ? AND ?
    ");
    $qEntregas->execute([$inicio, $fimInclusive]);
    $entregas = $qEntregas->fetch(PDO::FETCH_ASSOC);

    /* ── 7. BÓNUS / CARTÕES ────────────────────────────────── */
    $qBonus = $pdo->query("
        SELECT
            COUNT(DISTINCT id_cliente)    AS cartoes_ativos,
            COALESCE(SUM(saldo_bonus), 0) AS saldo_total
        FROM cartao
        WHERE ativo = 1
    ");
    $bonus = $qBonus->fetch(PDO::FETCH_ASSOC);

    $bonusMovimentos = ['creditos' => 0, 'debitos' => 0];
    $temBonusTransacoes = $pdo->query("SHOW TABLES LIKE 'bonus_transacoes'")->fetch();
    if ($temBonusTransacoes) {
        try {
            $qBt = $pdo->prepare("
                SELECT
                    COALESCE(SUM(CASE WHEN tipo = 'credito' THEN valor END), 0) AS creditos,
                    COALESCE(SUM(CASE WHEN tipo = 'debito'  THEN valor END), 0) AS debitos
                FROM bonus_transacoes
                WHERE criado_em BETWEEN ? AND ?
            ");
            $qBt->execute([$inicio, $fimInclusive]);
            $bonusMovimentos = $qBt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) { /* sem coluna criado_em */ }
    }

    /* ── RESPOSTA FINAL ────────────────────────────────────── */
    echo json_encode([
        "success"          => true,
        "periodo"          => $periodo,
        "label"            => $label,
        "inicio"           => $inicio,
        "fim"              => $fim,
        "gerado_em"        => date("d/m/Y H:i"),
        "pedidos"          => $pedidos,
        "top_pedidos"      => $topPedidos,
        "clientes"         => [
            "novos"             => (int)$clientesNovos['novos'],
            "verificados_novos" => (int)$clientesNovos['verificados_novos'],
            "total_verificados" => $totalVerificados,
            "total_geral"       => $totalClientes,
        ],
        "produtos"         => [
            "criados"        => (int)$produtosCriados['criados'],
            "disponiveis"    => (int)$produtosCriados['disponiveis'],
            "esgotados"      => (int)$produtosCriados['esgotados'],
            "descontinuados" => (int)$produtosCriados['descontinuados'],
        ],
        "stock_critico"    => $stockCritico,
        "financeiro"       => $financeiro,
        "movimentos"       => $movimentos,
        "entregas"         => $entregas,
        "logins"           => $logins,
        "total_logins"     => $totalLogins,
        "total_falhas"     => $totalFalhas,
        "bonus"            => $bonus,
        "bonus_movimentos" => $bonusMovimentos,
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>