<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once "config.php";

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? intval($_GET['id']) : 0;

/* ════════════════════════════════════════════════════════════════════
   HELPER — regista entrada financeira quando pedido é entregue
════════════════════════════════════════════════════════════════════ */
function registarEntradaFinanceira(PDO $pdo, int $id_pedido, float $total): void {
    $qCheck = $pdo->prepare("
        SELECT COUNT(*) FROM financeiro
        WHERE observacao = ? AND tipo = 'ENTRADA'
    ");
    $qCheck->execute(["Pedido #$id_pedido"]);
    if ((int)$qCheck->fetchColumn() > 0) return;

    $stmt = $pdo->prepare("
        INSERT INTO financeiro
            (tipo, descricao, valor, categoria, forma_pagamento,
             status, observacao, data_movimento)
        VALUES
            ('ENTRADA', ?, ?, 'Venda Loja', 'DINHEIRO',
             'CONFIRMADO', ?, NOW())
    ");
    $descricao  = "Venda realizada - Pedido #$id_pedido";
    $observacao = "Pedido #$id_pedido - Entregue com sucesso";
    $stmt->execute([$descricao, round($total, 2), $observacao]);
}

/* ════════════════════════════════════════════════════════════════════
   HELPER — reverte entrada financeira quando pedido é cancelado
════════════════════════════════════════════════════════════════════ */
function reverterEntradaFinanceira(PDO $pdo, int $id_pedido): void {
    $pdo->prepare("
        UPDATE financeiro
        SET status = 'CANCELADO', observacao = CONCAT(observacao, ' - CANCELADO')
        WHERE observacao = ? AND tipo = 'ENTRADA' AND status = 'CONFIRMADO'
    ")->execute(["Pedido #$id_pedido"]);
}

/* ════════════════════════════════════════════════════════════════════
   HELPER — credita bónus no cartão do cliente verificado
   Soma o bonus_saldo de cada produto distinto nos itens do pedido.
   Só é chamado quando o pedido fica com status = 'entregue'.
════════════════════════════════════════════════════════════════════ */
function creditarBonus(PDO $pdo, int $id_pedido, int $id_cliente): float {
    /* Verifica se o cliente é verificado AGORA */
    $qv = $pdo->prepare("SELECT cliente_verificado FROM clientes WHERE id_cliente = ?");
    $qv->execute([$id_cliente]);
    $verificado = (bool)$qv->fetchColumn();
    if (!$verificado) return 0.0;

    /* Soma os bonus_saldo distintos dos produtos comprados */
    $qb = $pdo->prepare("
        SELECT COALESCE(SUM(pr.bonus_saldo), 0)
        FROM itens_pedido ip
        JOIN produtos pr ON pr.id_produto = ip.id_produto
        WHERE ip.id_pedido = ?
          AND pr.bonus_saldo > 0
    ");
    $qb->execute([$id_pedido]);
    $bonus_ganho = round(floatval($qb->fetchColumn()), 2);
    if ($bonus_ganho <= 0) return 0.0;

    /* Garante/cria cartão */
    $qCartao = $pdo->prepare("SELECT id_cartao FROM cartao WHERE id_cliente = ? AND ativo = 1 LIMIT 1");
    $qCartao->execute([$id_cliente]);
    $cartaoRow = $qCartao->fetch(PDO::FETCH_ASSOC);

    if ($cartaoRow) {
        $id_cartao = $cartaoRow['id_cartao'];
        $pdo->prepare("UPDATE cartao SET saldo_bonus = saldo_bonus + ? WHERE id_cartao = ?")
            ->execute([$bonus_ganho, $id_cartao]);
    } else {
        $qr = "LOPOS-CARTAO-{$id_cliente}-" . bin2hex(random_bytes(8));
        $pdo->prepare("INSERT INTO cartao (id_cliente, saldo_bonus, qr_code, ativo, paleta_id) VALUES (?, ?, ?, 1, 'indigo')")
            ->execute([$id_cliente, $bonus_ganho, $qr]);
        $id_cartao = (int)$pdo->lastInsertId();
    }

    $pdo->prepare("UPDATE clientes SET saldo_bonus = saldo_bonus + ? WHERE id_cliente = ?")
        ->execute([$bonus_ganho, $id_cliente]);

    $temTabela = $pdo->query("SHOW TABLES LIKE 'bonus_transacoes'")->fetch();
    if ($temTabela) {
        $pdo->prepare("INSERT INTO bonus_transacoes (id_cartao, valor, tipo, descricao) VALUES (?, ?, 'ganho', ?)")
            ->execute([$id_cartao, $bonus_ganho, "Bónus de compra — Pedido #$id_pedido"]);
    }

    return $bonus_ganho;
}

try {

    /* ════════════════════════════════════════════════
       GET
    ════════════════════════════════════════════════ */
    if ($method === 'GET') {
        if ($id) {
            $q = $pdo->prepare("
                SELECT p.*,
                       c.nome, c.email, c.telefone, c.cliente_verificado,
                       e.endereco, e.detalhe_entrega, e.cidade,
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
                    SELECT ip.id_item, ip.id_produto, ip.nome_produto,
                           ip.quantidade, ip.preco_unitario, ip.subtotal,
                           pr.img1, pr.estoque,
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
                   e.endereco, e.detalhe_entrega, e.cidade,
                   e.distancia, e.preco_entrega, e.id_entregador
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            LEFT JOIN entregas e ON e.id_pedido  = p.id_pedido
            WHERE 1=1";
        $params = [];

        if ($status && $status !== 'todos') {
            $sql     .= " AND p.status = ?";
            $params[] = $status;
        }
        if ($busca) {
            $sql     .= " AND (c.nome LIKE ? OR c.email LIKE ? OR CAST(p.id_pedido AS CHAR) LIKE ?)";
            $like     = "%$busca%";
            $params[] = $like; $params[] = $like; $params[] = $like;
        }
        $sql .= " ORDER BY c.cliente_verificado DESC, p.criado_em DESC";

        $q = $pdo->prepare($sql);
        $q->execute($params);
        $pedidos = $q->fetchAll(PDO::FETCH_ASSOC);

        $contadores = [];
        $qc = $pdo->query("SELECT status, COUNT(*) AS n FROM pedidos GROUP BY status");
        foreach ($qc->fetchAll(PDO::FETCH_ASSOC) as $r) {
            $contadores[$r['status']] = (int)$r['n'];
        }

        echo json_encode([
            "success"    => true,
            "data"       => $pedidos,
            "total"      => count($pedidos),
            "contadores" => $contadores,
        ]);
        exit;
    }

    /* ════════════════════════════════════════════════
       POST — criar pedido
       NOTA: O bónus SÓ é creditado quando o pedido
       ficar com status 'entregue' (via PUT abaixo).
       Aqui apenas criamos o pedido e descontamos stock.
       NÃO se credita bónus nem se incrementa
       compras_realizadas neste momento.
    ════════════════════════════════════════════════ */
    if ($method === 'POST') {
        $d = json_decode(file_get_contents("php://input"), true);

        if (!isset($d['id_cliente']) || !isset($d['total'])) {
            echo json_encode(["success" => false, "message" => "Dados incompletos."]);
            exit;
        }

        $pdo->beginTransaction();
        $itens = $d['itens'] ?? [];

        /* ── 1. Valida stock ── */
        $errosStock = [];
        foreach ($itens as $item) {
            $id_prod = intval($item['id_produto'] ?? $item['id'] ?? 0);
            $qtd     = intval($item['quantidade'] ?? 1);
            if (!$id_prod) continue;

            $qs = $pdo->prepare("
                SELECT nome, estoque, estoque_minimo, status
                FROM produtos WHERE id_produto = ? FOR UPDATE
            ");
            $qs->execute([$id_prod]);
            $prod = $qs->fetch(PDO::FETCH_ASSOC);

            if (!$prod) {
                $errosStock[] = "Produto #$id_prod não encontrado.";
            } elseif ($prod['status'] === 'descontinuado') {
                $errosStock[] = "\"{$prod['nome']}\" foi descontinuado.";
            } elseif ($prod['status'] === 'esgotado' || intval($prod['estoque']) < $qtd) {
                $errosStock[] = "\"{$prod['nome']}\": stock insuficiente (disponível: {$prod['estoque']}, pedido: $qtd).";
            }
        }

        if (!empty($errosStock)) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => implode(" | ", $errosStock), "erros" => $errosStock]);
            exit;
        }

        /* ── 2. Verifica que o cliente existe ── */
        $qCliente = $pdo->prepare("SELECT id_cliente FROM clientes WHERE id_cliente = ?");
        $qCliente->execute([$d['id_cliente']]);
        if (!$qCliente->fetch()) {
            $pdo->rollBack();
            echo json_encode(["success" => false, "message" => "Cliente não encontrado."]);
            exit;
        }

        /* ── 3. Cria o pedido ── */
        $pdo->prepare("
            INSERT INTO pedidos (id_cliente, total, desconto, taxa_entrega, endereco, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ")->execute([
            $d['id_cliente'],
            $d['total'],
            $d['desconto']     ?? 0,
            $d['taxa_entrega'] ?? 0,
            $d['endereco']     ?? '',
            $d['status']       ?? 'pendente',
        ]);
        $id_pedido = (int)$pdo->lastInsertId();

        /* ── 4. Insere itens + desconta stock ── */
        foreach ($itens as $item) {
            $id_prod  = intval($item['id_produto'] ?? $item['id'] ?? 0);
            $qtd      = intval($item['quantidade'] ?? 1);
            $preco    = floatval($item['preco'] ?? 0);
            $subtotal = $qtd * $preco;
            if (!$id_prod) continue;

            $pdo->prepare("
                INSERT INTO itens_pedido
                    (id_pedido, id_produto, nome_produto, quantidade, preco_unitario, subtotal)
                SELECT ?, id_produto, nome, ?, ?, ?
                FROM produtos WHERE id_produto = ?
            ")->execute([$id_pedido, $qtd, $preco, $subtotal, $id_prod]);

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
         * ── IMPORTANTE ──
         * NÃO incrementamos compras_realizadas aqui.
         * NÃO creditamos bónus aqui.
         * Tudo isso acontece apenas quando o status mudar para 'entregue'.
         */

        $pdo->commit();

        echo json_encode([
            "success"   => true,
            "id_pedido" => $id_pedido,
            "id"        => $id_pedido,
            "bonus_ganho" => 0,  /* bónus só é creditado na entrega */
            "message"   => "Pedido criado. O bónus e a contagem de compras serão registados após a confirmação de entrega.",
        ]);
        exit;
    }

    /* ════════════════════════════════════════════════
       PUT — actualizar estado
    ════════════════════════════════════════════════ */
    if ($method === 'PUT') {
        $d          = json_decode(file_get_contents("php://input"), true);
        $id_pedido  = intval($d['id_pedido'] ?? $id);
        $novoStatus = $d['status'] ?? null;

        if (!$id_pedido || !$novoStatus) {
            echo json_encode(["success" => false, "message" => "id_pedido e status obrigatórios."]);
            exit;
        }

        $statusPermitidos = ['pendente','pago','reservado','enviado','entregue','cancelado'];
        if (!in_array($novoStatus, $statusPermitidos)) {
            echo json_encode(["success" => false, "message" => "Status inválido: $novoStatus"]);
            exit;
        }

        $pdo->beginTransaction();

        $qAtual = $pdo->prepare("
            SELECT p.status, p.id_cliente, p.total, c.cliente_verificado
            FROM pedidos p
            JOIN clientes c ON c.id_cliente = p.id_cliente
            WHERE p.id_pedido = ?
        ");
        $qAtual->execute([$id_pedido]);
        $pedidoAtual = $qAtual->fetch(PDO::FETCH_ASSOC);
        $statusAtual = $pedidoAtual['status'] ?? null;
        $totalPedido = floatval($pedidoAtual['total'] ?? 0);
        $id_cliente  = intval($pedidoAtual['id_cliente'] ?? 0);

        $bonus_ganho = 0.0;
        $msgExtra    = "";

        /* ── ENTREGUE ── */
        if ($novoStatus === 'entregue' && $statusAtual !== 'entregue') {

            /* 1. Regista receita financeira */
            registarEntradaFinanceira($pdo, $id_pedido, $totalPedido);

            /* 2. Actualiza entrega */
            $pdo->prepare("
                UPDATE entregas SET status = 'entregue', data_entrega = NOW()
                WHERE id_pedido = ?
            ")->execute([$id_pedido]);

            /* 3. Incrementa compras_realizadas */
            $pdo->prepare("
                UPDATE clientes SET compras_realizadas = compras_realizadas + 1
                WHERE id_cliente = ?
            ")->execute([$id_cliente]);

            /* 4. Verifica se atinge o limite VIP */
            $limiteVip = 10;
            $qLimite   = $pdo->query("SELECT compras_vip FROM configuracao_loja LIMIT 1");
            if ($qLimite) {
                $lv = $qLimite->fetchColumn();
                if ($lv !== false && intval($lv) > 0) $limiteVip = intval($lv);
            }

            $qCompras = $pdo->prepare("SELECT compras_realizadas, cliente_verificado FROM clientes WHERE id_cliente = ?");
            $qCompras->execute([$id_cliente]);
            $clienteInfo = $qCompras->fetch(PDO::FETCH_ASSOC);

            $eraVerificado = (bool)$clienteInfo['cliente_verificado'];

            if (!$eraVerificado && intval($clienteInfo['compras_realizadas']) >= $limiteVip) {
                $pdo->prepare("
                    UPDATE clientes SET cliente_verificado = 1, data_verificacao = NOW()
                    WHERE id_cliente = ? AND cliente_verificado = 0
                ")->execute([$id_cliente]);
                /* Agora o cliente é verificado — credita bónus desta entrega */
                $bonus_ganho = creditarBonus($pdo, $id_pedido, $id_cliente);
                $msgExtra = " Cliente tornou-se Verificado LOPOS! Bónus de " . number_format($bonus_ganho, 2, ',', '.') . " AOA creditado.";
            } else {
                /* Já era verificado — credita bónus normalmente */
                $bonus_ganho = creditarBonus($pdo, $id_pedido, $id_cliente);
                if ($bonus_ganho > 0) {
                    $msgExtra = " Bónus de " . number_format($bonus_ganho, 2, ',', '.') . " AOA creditado no cartão.";
                }
                $msgExtra .= " Receita de " . number_format($totalPedido, 2, ',', '.') . " AOA registada.";
            }

            /* 5. Histórico de compras (historico_cliente) */
            $hcExiste = $pdo->query("SHOW TABLES LIKE 'historico_cliente'")->fetch();
            if ($hcExiste) {
                $pdo->prepare("
                    UPDATE historico_cliente SET status = 'entregue'
                    WHERE id_pedido = ?
                ")->execute([$id_pedido]);
            }

            /* 6. historico_vendas */
            $hvExiste = $pdo->query("SHOW TABLES LIKE 'historico_vendas'")->fetch();
            if ($hvExiste) {
                $pdo->prepare("
                    UPDATE historico_vendas SET status = 'entregue'
                    WHERE id_pedido = ?
                ")->execute([$id_pedido]);
            }
        }

        /* ── CANCELADO ── */
        if ($novoStatus === 'cancelado' && $statusAtual !== 'cancelado') {

            /* Devolve stock */
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

            /* Reverte receita se já estava entregue */
            if ($statusAtual === 'entregue') {
                reverterEntradaFinanceira($pdo, $id_pedido);

                /* Reverte compras_realizadas */
                $pdo->prepare("
                    UPDATE clientes SET compras_realizadas = GREATEST(0, compras_realizadas - 1)
                    WHERE id_cliente = ?
                ")->execute([$id_cliente]);

                /* Reverte bónus creditado (se cliente verificado) */
                if ($pedidoAtual && $pedidoAtual['cliente_verificado']) {
                    $qBonus = $pdo->prepare("
                        SELECT COALESCE(SUM(pr.bonus_saldo), 0)
                        FROM itens_pedido ip
                        JOIN produtos pr ON pr.id_produto = ip.id_produto
                        WHERE ip.id_pedido = ? AND pr.bonus_saldo > 0
                    ");
                    $qBonus->execute([$id_pedido]);
                    $bonusCreditado = round(floatval($qBonus->fetchColumn()), 2);

                    if ($bonusCreditado > 0) {
                        $pdo->prepare("
                            UPDATE clientes SET saldo_bonus = GREATEST(0, saldo_bonus - ?)
                            WHERE id_cliente = ?
                        ")->execute([$bonusCreditado, $id_cliente]);

                        $pdo->prepare("
                            UPDATE cartao SET saldo_bonus = GREATEST(0, saldo_bonus - ?)
                            WHERE id_cliente = ? AND ativo = 1
                        ")->execute([$bonusCreditado, $id_cliente]);

                        $temTab = $pdo->query("SHOW TABLES LIKE 'bonus_transacoes'")->fetch();
                        if ($temTab) {
                            $qCId = $pdo->prepare("SELECT id_cartao FROM cartao WHERE id_cliente = ? AND ativo = 1 LIMIT 1");
                            $qCId->execute([$id_cliente]);
                            $cId = $qCId->fetchColumn();
                            if ($cId) {
                                $pdo->prepare("INSERT INTO bonus_transacoes (id_cartao, valor, tipo, descricao) VALUES (?, ?, 'debito', ?)")
                                    ->execute([$cId, $bonusCreditado, "Cancelamento — Pedido #$id_pedido"]);
                            }
                        }
                    }
                }
                $msgExtra = " Stock, compras e bónus revertidos.";
            } else {
                $msgExtra = " Stock revertido.";
            }

            $pdo->prepare("UPDATE entregas SET status = 'cancelado' WHERE id_pedido = ?")
                ->execute([$id_pedido]);

            $hcExiste = $pdo->query("SHOW TABLES LIKE 'historico_cliente'")->fetch();
            if ($hcExiste) {
                $pdo->prepare("UPDATE historico_cliente SET status = 'cancelado' WHERE id_pedido = ?")
                    ->execute([$id_pedido]);
            }
        }

        /* ── ENVIADO ── */
        if ($novoStatus === 'enviado' && isset($d['id_entregador'])) {
            $pdo->prepare("
                UPDATE entregas SET status = 'enviado', id_entregador = ?
                WHERE id_pedido = ?
            ")->execute([$d['id_entregador'], $id_pedido]);
        }

        /* ── RESERVADO ── */
        if ($novoStatus === 'reservado' && isset($d['id_entregador'])) {
            $pdo->prepare("UPDATE entregas SET id_entregador = ? WHERE id_pedido = ?")
                ->execute([$d['id_entregador'], $id_pedido]);
        }

        $pdo->prepare("UPDATE pedidos SET status = ? WHERE id_pedido = ?")
            ->execute([$novoStatus, $id_pedido]);

        $pdo->commit();

        echo json_encode([
            "success"     => true,
            "bonus_ganho" => $bonus_ganho,
            "message"     => "Estado actualizado para '$novoStatus'." . $msgExtra,
        ]);
        exit;
    }

    /* ════════════════════════════════════════════════
       DELETE
    ════════════════════════════════════════════════ */
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