<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once "config.php";

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? intval($_GET['id']) : 0;

/* ══════════════════════════════════════════════════════════════
   HELPER — regista receita financeira (evita duplicados)
══════════════════════════════════════════════════════════════ */
function registarEntradaFinanceira(PDO $pdo, int $id_pedido, float $total): void {
    $q = $pdo->prepare("SELECT COUNT(*) FROM financeiro WHERE observacao = ? AND tipo = 'ENTRADA'");
    $q->execute(["Pedido #$id_pedido"]);
    if ((int)$q->fetchColumn() > 0) return;

    $pdo->prepare("
        INSERT INTO financeiro
            (tipo, descricao, valor, categoria, forma_pagamento, status, observacao, data_movimento)
        VALUES ('ENTRADA', ?, ?, 'Venda Loja', 'DINHEIRO', 'CONFIRMADO', ?, NOW())
    ")->execute([
        "Venda realizada - Pedido #$id_pedido",
        round($total, 2),
        "Pedido #$id_pedido",
    ]);
}

/* ══════════════════════════════════════════════════════════════
   HELPER — reverte receita financeira
══════════════════════════════════════════════════════════════ */
function reverterEntradaFinanceira(PDO $pdo, int $id_pedido): void {
    $pdo->prepare("
        UPDATE financeiro
        SET status = 'CANCELADO',
            observacao = CONCAT(IFNULL(observacao,''), ' - CANCELADO')
        WHERE observacao = ? AND tipo = 'ENTRADA' AND status = 'CONFIRMADO'
    ")->execute(["Pedido #$id_pedido"]);
}

/* ══════════════════════════════════════════════════════════════
   HELPER — obtém limite VIP da configuração (padrão = 10)
══════════════════════════════════════════════════════════════ */
function getLimiteVip(PDO $pdo): int {
    try {
        $q = $pdo->query("SELECT compras_vip FROM configuracao_loja LIMIT 1");
        $v = $q ? (int)$q->fetchColumn() : 0;
        return $v > 0 ? $v : 10;
    } catch (Exception $e) { return 10; }
}

/* ══════════════════════════════════════════════════════════════
   HELPER — credita bónus no cartão.
   REGRA: SÓ executa se o cliente JÁ FOR verificado
          (cliente_verificado = 1) OU acabou de se tornar.
   Soma o bonus_saldo de cada produto nos itens do pedido.
   Retorna o valor creditado (0.0 se nada foi feito).
══════════════════════════════════════════════════════════════ */
function creditarBonus(PDO $pdo, int $id_pedido, int $id_cliente): float {
    /* Só credita se o cliente for verificado */
    $qv = $pdo->prepare("SELECT cliente_verificado FROM clientes WHERE id_cliente = ?");
    $qv->execute([$id_cliente]);
    if (!(bool)$qv->fetchColumn()) return 0.0;

    /* Soma bonus_saldo dos produtos do pedido */
    $qb = $pdo->prepare("
        SELECT COALESCE(SUM(pr.bonus_saldo), 0)
        FROM itens_pedido ip
        JOIN produtos pr ON pr.id_produto = ip.id_produto
        WHERE ip.id_pedido = ? AND pr.bonus_saldo > 0
    ");
    $qb->execute([$id_pedido]);
    $bonus = round((float)$qb->fetchColumn(), 2);
    if ($bonus <= 0) return 0.0;

    /* Garante cartão activo */
    $qC = $pdo->prepare("SELECT id_cartao FROM cartao WHERE id_cliente = ? AND ativo = 1 LIMIT 1");
    $qC->execute([$id_cliente]);
    $row = $qC->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        $id_cartao = (int)$row['id_cartao'];
        $pdo->prepare("UPDATE cartao SET saldo_bonus = saldo_bonus + ? WHERE id_cartao = ?")
            ->execute([$bonus, $id_cartao]);
    } else {
        $qr = "LOPOS-" . $id_cliente . "-" . bin2hex(random_bytes(6));
        $pdo->prepare("INSERT INTO cartao (id_cliente, saldo_bonus, qr_code, ativo, paleta_id) VALUES (?, ?, ?, 1, 'indigo')")
            ->execute([$id_cliente, $bonus, $qr]);
        $id_cartao = (int)$pdo->lastInsertId();
    }

    /* Actualiza saldo no cliente */
    $pdo->prepare("UPDATE clientes SET saldo_bonus = saldo_bonus + ? WHERE id_cliente = ?")
        ->execute([$bonus, $id_cliente]);

    /* Regista transacção */
    $pdo->prepare("INSERT INTO bonus_transacoes (id_cartao, valor, tipo, descricao) VALUES (?, ?, 'ganho', ?)")
        ->execute([$id_cartao, $bonus, "Bónus de compra — Pedido #$id_pedido"]);

    return $bonus;
}

/* ══════════════════════════════════════════════════════════════
   HELPER — actualiza histórico (seguro, ignora se não existir)
══════════════════════════════════════════════════════════════ */
function atualizarHistoricoStatus(PDO $pdo, int $id_pedido, string $status): void {
    foreach (['historico_vendas', 'historico_cliente'] as $t) {
        try {
            if ($pdo->query("SHOW TABLES LIKE '$t'")->fetch()) {
                $pdo->prepare("UPDATE $t SET status = ? WHERE id_pedido = ?")
                    ->execute([$status, $id_pedido]);
            }
        } catch (Exception $e) { /* ignora */ }
    }
}

/* ══════════════════════════════════════════════════════════════
   ROTAS
══════════════════════════════════════════════════════════════ */
try {

    /* ── GET ── */
    if ($method === 'GET') {
        if ($id) {
            $q = $pdo->prepare("
                SELECT p.*,
                       c.nome, c.email, c.telefone, c.cliente_verificado,
                       e.endereco AS end_entrega, e.detalhe_entrega, e.cidade,
                       e.distancia, e.preco_entrega, e.id_entregador
                FROM pedidos p
                LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
                LEFT JOIN entregas e ON e.id_pedido  = p.id_pedido
                WHERE p.id_pedido = ?
            ");
            $q->execute([$id]);
            $pedido = $q->fetch(PDO::FETCH_ASSOC);
            if ($pedido) {
                $qi = $pdo->prepare("
                    SELECT ip.*, pr.img1, pr.estoque,
                           pr.status AS produto_status, pr.bonus_saldo
                    FROM itens_pedido ip
                    LEFT JOIN produtos pr ON ip.id_produto = pr.id_produto
                    WHERE ip.id_pedido = ?
                ");
                $qi->execute([$id]);
                $pedido['itens'] = $qi->fetchAll(PDO::FETCH_ASSOC);
            }
            echo json_encode(["success" => true, "data" => $pedido]);
            exit;
        }

        $status = $_GET['status'] ?? '';
        $busca  = $_GET['busca']  ?? '';
        $sql    = "
            SELECT p.*,
                   c.nome, c.email, c.telefone, c.cliente_verificado,
                   e.endereco AS end_entrega, e.detalhe_entrega, e.cidade,
                   e.distancia, e.preco_entrega, e.id_entregador
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            LEFT JOIN entregas e ON e.id_pedido  = p.id_pedido
            WHERE 1=1";
        $params = [];
        if ($status && $status !== 'todos') { $sql .= " AND p.status = ?"; $params[] = $status; }
        if ($busca) {
            $like = "%$busca%";
            $sql .= " AND (c.nome LIKE ? OR c.email LIKE ? OR CAST(p.id_pedido AS CHAR) LIKE ?)";
            $params[] = $like; $params[] = $like; $params[] = $like;
        }
        $sql .= " ORDER BY c.cliente_verificado DESC, p.criado_em DESC";
        $q = $pdo->prepare($sql);
        $q->execute($params);
        $pedidos    = $q->fetchAll(PDO::FETCH_ASSOC);
        $contadores = [];
        foreach ($pdo->query("SELECT status, COUNT(*) n FROM pedidos GROUP BY status")->fetchAll(PDO::FETCH_ASSOC) as $r) {
            $contadores[$r['status']] = (int)$r['n'];
        }
        echo json_encode(["success" => true, "data" => $pedidos, "total" => count($pedidos), "contadores" => $contadores]);
        exit;
    }

    /* ── POST — criar pedido ── */
    if ($method === 'POST') {
        $d = json_decode(file_get_contents("php://input"), true);

        if (empty($d['id_cliente']) || !isset($d['total'])) {
            echo json_encode(["success" => false, "message" => "Dados incompletos."]); exit;
        }

        $pdo->beginTransaction();
        $itens = $d['itens'] ?? [];

        /* Valida stock */
        $erros = [];
        foreach ($itens as $item) {
            $id_prod = intval($item['id_produto'] ?? $item['id'] ?? 0);
            $qtd     = intval($item['quantidade'] ?? 1);
            if (!$id_prod) continue;
            $qs = $pdo->prepare("SELECT nome, estoque, status FROM produtos WHERE id_produto = ? FOR UPDATE");
            $qs->execute([$id_prod]);
            $p = $qs->fetch(PDO::FETCH_ASSOC);
            if (!$p)                                  $erros[] = "Produto #$id_prod não encontrado.";
            elseif ($p['status'] === 'descontinuado') $erros[] = "\"{$p['nome']}\" foi descontinuado.";
            elseif ((int)$p['estoque'] < $qtd)        $erros[] = "\"{$p['nome']}\": stock insuficiente (disponível: {$p['estoque']}, pedido: $qtd).";
        }
        if ($erros) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => implode(" | ", $erros), "erros" => $erros]); exit;
        }

        /* Confirma cliente */
        $qcli = $pdo->prepare("SELECT id_cliente FROM clientes WHERE id_cliente = ?");
        $qcli->execute([$d['id_cliente']]);
        if (!$qcli->fetch()) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => "Cliente não encontrado."]); exit;
        }

        /* Cria pedido */
        $pdo->prepare("
            INSERT INTO pedidos (id_cliente, total, desconto, taxa_entrega, endereco, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ")->execute([
            $d['id_cliente'], $d['total'],
            $d['desconto']     ?? 0,
            $d['taxa_entrega'] ?? 0,
            $d['endereco']     ?? '',
            $d['status']       ?? 'pendente',
        ]);
        $id_pedido = (int)$pdo->lastInsertId();

        /* Insere itens + desconta stock */
        foreach ($itens as $item) {
            $id_prod = intval($item['id_produto'] ?? $item['id'] ?? 0);
            $qtd     = intval($item['quantidade'] ?? 1);
            $preco   = floatval($item['preco'] ?? 0);
            if (!$id_prod) continue;

            $pdo->prepare("
                INSERT INTO itens_pedido (id_pedido, id_produto, nome_produto, quantidade, preco_unitario, subtotal)
                SELECT ?, id_produto, nome, ?, ?, ? FROM produtos WHERE id_produto = ?
            ")->execute([$id_pedido, $qtd, $preco, $qtd * $preco, $id_prod]);

            $pdo->prepare("
                UPDATE produtos SET
                    estoque = GREATEST(0, estoque - ?),
                    status  = CASE
                        WHEN status = 'descontinuado'                   THEN 'descontinuado'
                        WHEN GREATEST(0, estoque - ?) <= 0              THEN 'esgotado'
                        WHEN GREATEST(0, estoque - ?) <= estoque_minimo THEN 'esgotado'
                        ELSE 'disponivel'
                    END
                WHERE id_produto = ?
            ")->execute([$qtd, $qtd, $qtd, $id_prod]);
        }

        /*
         * IMPORTANTE: compras_realizadas, verificação VIP e bónus
         * SÓ são processados quando o pedido muda para 'entregue'.
         * Aqui apenas criamos o pedido.
         */

        $pdo->commit();
        echo json_encode([
            "success"   => true,
            "id_pedido" => $id_pedido,
            "id"        => $id_pedido,
            "message"   => "Pedido #$id_pedido criado. Bónus e verificação só activos após entrega.",
        ]);
        exit;
    }

    /* ── PUT — actualizar estado ── */
    if ($method === 'PUT') {
        $d          = json_decode(file_get_contents("php://input"), true);
        $id_pedido  = intval($d['id_pedido'] ?? $id);
        $novoStatus = trim($d['status'] ?? '');

        if (!$id_pedido || !$novoStatus) {
            echo json_encode(["success" => false, "message" => "id_pedido e status obrigatórios."]); exit;
        }

        $statusPermitidos = ['pendente','pago','reservado','enviado','entregue','cancelado'];
        if (!in_array($novoStatus, $statusPermitidos)) {
            echo json_encode(["success" => false, "message" => "Status inválido: $novoStatus"]); exit;
        }

        $pdo->beginTransaction();

        /* Lê estado actual */
        $qAtual = $pdo->prepare("
            SELECT p.status, p.id_cliente, p.total,
                   c.cliente_verificado, c.compras_realizadas
            FROM pedidos p
            JOIN clientes c ON c.id_cliente = p.id_cliente
            WHERE p.id_pedido = ?
        ");
        $qAtual->execute([$id_pedido]);
        $pedidoAtual = $qAtual->fetch(PDO::FETCH_ASSOC);

        if (!$pedidoAtual) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => "Pedido #$id_pedido não encontrado."]); exit;
        }

        $statusAtual   = $pedidoAtual['status'];
        $totalPedido   = (float)$pedidoAtual['total'];
        $id_cliente    = (int)$pedidoAtual['id_cliente'];
        $eraVerificado = (bool)$pedidoAtual['cliente_verificado'];

        $bonus_ganho = 0.0;
        $tornou_vip  = false;
        $msgExtra    = "";

        /* ══════════════════════════════════════════════════════
           ENTREGUE
           ─────────────────────────────────────────────────────
           1. Regista receita financeira
           2. Actualiza registo de entrega
           3. Incrementa compras_realizadas
           4. Verifica se atingiu limite VIP → eleva se necessário
           5. Credita bónus (só se for verificado após passo 4)
           6. Actualiza histórico
        ══════════════════════════════════════════════════════ */
        if ($novoStatus === 'entregue' && $statusAtual !== 'entregue') {

            /* 1 — Receita */
            registarEntradaFinanceira($pdo, $id_pedido, $totalPedido);

            /* 2 — Entrega */
            $pdo->prepare("UPDATE entregas SET status = 'entregue', data_entrega = NOW() WHERE id_pedido = ?")
                ->execute([$id_pedido]);

            /* 3 — Incrementa compras_realizadas */
            $pdo->prepare("UPDATE clientes SET compras_realizadas = compras_realizadas + 1 WHERE id_cliente = ?")
                ->execute([$id_cliente]);

            /* 4 — Verifica VIP
               Lê o novo valor de compras_realizadas (após incremento).
               Se ainda não era verificado E atingiu/ultrapassou limite → eleva. */
            $limiteVip = getLimiteVip($pdo);
            $qCompras  = $pdo->prepare("SELECT compras_realizadas FROM clientes WHERE id_cliente = ?");
            $qCompras->execute([$id_cliente]);
            $comprasAgora = (int)$qCompras->fetchColumn();

            if (!$eraVerificado && $comprasAgora >= $limiteVip) {
                $pdo->prepare("
                    UPDATE clientes
                    SET cliente_verificado = 1, data_verificacao = NOW()
                    WHERE id_cliente = ? AND cliente_verificado = 0
                ")->execute([$id_cliente]);
                $tornou_vip = true;
                $msgExtra  .= " Cliente atingiu $limiteVip entregas e tornou-se VERIFICADO LOPOS!";
            }

            /* 5 — Credita bónus
               O cliente já é verificado (eraVerificado) OU acabou de ser
               elevado (tornou_vip). Em ambos os casos creditamos bónus.
               A função creditarBonus() lê cliente_verificado da BD,
               portanto o UPDATE do passo 4 já está reflectido. */
            if ($eraVerificado || $tornou_vip) {
                $bonus_ganho = creditarBonus($pdo, $id_pedido, $id_cliente);
                if ($bonus_ganho > 0) {
                    $fmt       = number_format($bonus_ganho, 2, ',', '.');
                    $msgExtra .= " Bónus de {$fmt} AOA creditado no cartão.";
                }
            }

            $msgExtra .= " Receita de " . number_format($totalPedido, 2, ',', '.') . " AOA registada.";

            /* 6 — Histórico */
            atualizarHistoricoStatus($pdo, $id_pedido, 'entregue');
        }

        /* ══════════════════════════════════════════════════════
           CANCELADO
           ─────────────────────────────────────────────────────
           1. Devolve stock
           2. Se vinha de 'entregue': reverte receita, compras e bónus
           3. Actualiza entrega + histórico
        ══════════════════════════════════════════════════════ */
        if ($novoStatus === 'cancelado' && $statusAtual !== 'cancelado') {

            /* 1 — Devolve stock */
            $qi = $pdo->prepare("SELECT id_produto, quantidade FROM itens_pedido WHERE id_pedido = ?");
            $qi->execute([$id_pedido]);
            foreach ($qi->fetchAll(PDO::FETCH_ASSOC) as $item) {
                $pdo->prepare("
                    UPDATE produtos SET
                        estoque = estoque + ?,
                        status  = CASE
                            WHEN status = 'descontinuado' THEN 'descontinuado'
                            WHEN (estoque + ?) > 0        THEN 'disponivel'
                            ELSE status
                        END
                    WHERE id_produto = ?
                ")->execute([$item['quantidade'], $item['quantidade'], $item['id_produto']]);
            }

            /* 2 — Se vinha de 'entregue' → reverte tudo */
            if ($statusAtual === 'entregue') {
                reverterEntradaFinanceira($pdo, $id_pedido);

                /* Reverte compras_realizadas */
                $pdo->prepare("
                    UPDATE clientes
                    SET compras_realizadas = GREATEST(0, compras_realizadas - 1)
                    WHERE id_cliente = ?
                ")->execute([$id_cliente]);

                /* Reverte bónus se cliente era verificado */
                if ($eraVerificado) {
                    $qB = $pdo->prepare("
                        SELECT COALESCE(SUM(pr.bonus_saldo), 0)
                        FROM itens_pedido ip
                        JOIN produtos pr ON pr.id_produto = ip.id_produto
                        WHERE ip.id_pedido = ? AND pr.bonus_saldo > 0
                    ");
                    $qB->execute([$id_pedido]);
                    $bonusCreditado = round((float)$qB->fetchColumn(), 2);

                    if ($bonusCreditado > 0) {
                        $pdo->prepare("UPDATE clientes SET saldo_bonus = GREATEST(0, saldo_bonus - ?) WHERE id_cliente = ?")
                            ->execute([$bonusCreditado, $id_cliente]);
                        $pdo->prepare("UPDATE cartao SET saldo_bonus = GREATEST(0, saldo_bonus - ?) WHERE id_cliente = ? AND ativo = 1")
                            ->execute([$bonusCreditado, $id_cliente]);

                        $qCId = $pdo->prepare("SELECT id_cartao FROM cartao WHERE id_cliente = ? AND ativo = 1 LIMIT 1");
                        $qCId->execute([$id_cliente]);
                        $cId = $qCId->fetchColumn();
                        if ($cId) {
                            $pdo->prepare("INSERT INTO bonus_transacoes (id_cartao, valor, tipo, descricao) VALUES (?, ?, 'debito', ?)")
                                ->execute([$cId, $bonusCreditado, "Cancelamento — Pedido #$id_pedido"]);
                        }
                    }
                }
                $msgExtra = " Receita, compras e bónus revertidos.";
            } else {
                $msgExtra = " Stock devolvido.";
            }

            /* 3 — Entrega + histórico */
            $pdo->prepare("UPDATE entregas SET status = 'cancelado' WHERE id_pedido = ?")
                ->execute([$id_pedido]);
            atualizarHistoricoStatus($pdo, $id_pedido, 'cancelado');
        }

        /* ── ENVIADO ── */
        if ($novoStatus === 'enviado' && isset($d['id_entregador'])) {
            $pdo->prepare("UPDATE entregas SET status = 'enviado', id_entregador = ? WHERE id_pedido = ?")
                ->execute([$d['id_entregador'], $id_pedido]);
        }

        /* ── RESERVADO ── */
        if ($novoStatus === 'reservado' && isset($d['id_entregador'])) {
            $pdo->prepare("UPDATE entregas SET id_entregador = ? WHERE id_pedido = ?")
                ->execute([$d['id_entregador'], $id_pedido]);
        }

        /* Actualiza status do pedido */
        $pdo->prepare("UPDATE pedidos SET status = ? WHERE id_pedido = ?")
            ->execute([$novoStatus, $id_pedido]);

        $pdo->commit();

        echo json_encode([
            "success"     => true,
            "bonus_ganho" => $bonus_ganho,
            "tornou_vip"  => $tornou_vip,
            "message"     => "Estado actualizado para '$novoStatus'." . $msgExtra,
        ]);
        exit;
    }

    /* ── DELETE ── */
    if ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM pedidos WHERE id_pedido = ?")->execute([$id]);
        echo json_encode(["success" => true, "message" => "Pedido eliminado."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não suportado."]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>