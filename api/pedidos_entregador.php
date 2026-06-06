<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once "config.php";

$method = $_SERVER['REQUEST_METHOD'];

try {

    /* ════════════════════════════════════════════════════════════
       GET — listar pedidos
    ════════════════════════════════════════════════════════════ */
    if ($method === 'GET') {
        $tipo          = $_GET['tipo']          ?? 'pendentes';
        $id_entregador = $_GET['id_entregador'] ?? null;

        $selectBase = "
            SELECT p.id_pedido, p.total, p.desconto, p.taxa_entrega,
                   p.status, p.criado_em, p.qr_code,
                   c.nome, c.telefone, c.cliente_verificado,
                   e.endereco, e.detalhe_entrega, e.cidade,
                   e.distancia, e.preco_entrega, e.id_entregador,
                   GROUP_CONCAT(
                     JSON_OBJECT(
                       'nome_produto',   ip.nome_produto,
                       'quantidade',     ip.quantidade,
                       'subtotal',       ip.subtotal,
                       'preco_unitario', ip.preco_unitario
                     )
                     ORDER BY ip.id_item
                   ) AS itens_json
            FROM pedidos p
            LEFT JOIN clientes c      ON p.id_cliente  = c.id_cliente
            LEFT JOIN entregas e      ON p.id_pedido   = e.id_pedido
            LEFT JOIN itens_pedido ip ON p.id_pedido   = ip.id_pedido
        ";

        if ($tipo === 'reservas' && $id_entregador) {
            /*
             * Reservas deste entregador:
             * status = 'reservado' ou qualquer estado activo excepto entregue/cancelado
             * onde o entregador já está atribuído
             */
            $q = $pdo->prepare($selectBase . "
                WHERE e.id_entregador = ?
                  AND p.status NOT IN ('entregue', 'cancelado')
                GROUP BY p.id_pedido
                ORDER BY p.criado_em DESC
            ");
            $q->execute([$id_entregador]);

        } elseif ($tipo === 'entregues' && $id_entregador) {
            $q = $pdo->prepare($selectBase . "
                WHERE e.id_entregador = ?
                  AND p.status = 'entregue'
                GROUP BY p.id_pedido
                ORDER BY p.criado_em DESC
            ");
            $q->execute([$id_entregador]);

        } else {
            /*
             * Pendentes = sem entregador atribuído E status pendente/pago/processando
             * (status 'reservado' já tem entregador, não aparece aqui)
             */
            $q = $pdo->prepare($selectBase . "
                WHERE p.status IN ('pendente', 'pago', 'processando')
                  AND (e.id_entregador IS NULL OR e.id_entregador = 0)
                GROUP BY p.id_pedido
                ORDER BY c.cliente_verificado DESC, p.criado_em DESC
            ");
            $q->execute([]);
        }

        $rows = $q->fetchAll(PDO::FETCH_ASSOC);

        $result = array_map(function ($row) {
            $itens = [];
            if (!empty($row['itens_json'])) {
                $decoded = json_decode("[" . $row['itens_json'] . "]", true);
                if (is_array($decoded)) $itens = $decoded;
            }
            unset($row['itens_json']);
            $row['itens']              = $itens;
            $row['cliente_verificado'] = (bool)$row['cliente_verificado'];
            return $row;
        }, $rows);

        echo json_encode(["success" => true, "data" => $result]);
        exit;
    }

    /* ════════════════════════════════════════════════════════════
       PUT — acções sobre pedidos
    ════════════════════════════════════════════════════════════ */
    if ($method === 'PUT') {
        $d             = json_decode(file_get_contents("php://input"), true);
        $id_pedido     = $d['id_pedido']     ?? null;
        $id_entregador = $d['id_entregador'] ?? null;
        $acao          = $d['acao']          ?? null;

        if (!$id_pedido || !$acao) {
            echo json_encode(["success" => false, "message" => "Dados incompletos."]);
            exit;
        }

        $pdo->beginTransaction();

        /* ── RESERVAR ────────────────────────────────────────── */
        if ($acao === 'reservar') {
            if (!$id_entregador) {
                $pdo->rollBack();
                echo json_encode(["success" => false, "message" => "id_entregador obrigatório."]);
                exit;
            }

            /* Verifica se já foi reservado por outro entregador */
            $chk = $pdo->prepare("
                SELECT e.id_entregador, p.status
                FROM entregas e
                JOIN pedidos p ON p.id_pedido = e.id_pedido
                WHERE e.id_pedido = ?
                LIMIT 1
            ");
            $chk->execute([$id_pedido]);
            $atual = $chk->fetch(PDO::FETCH_ASSOC);

            if (
                $atual &&
                !empty($atual['id_entregador']) &&
                $atual['id_entregador'] != $id_entregador
            ) {
                $pdo->rollBack();
                echo json_encode([
                    "success" => false,
                    "message" => "Pedido já reservado por outro entregador.",
                ]);
                exit;
            }

            /* Verifica se o pedido já está num estado que não permite reserva */
            if ($atual && in_array($atual['status'], ['entregue', 'cancelado', 'reservado'])) {
                $pdo->rollBack();
                echo json_encode([
                    "success" => false,
                    "message" => "Pedido não disponível para reserva (estado: {$atual['status']}).",
                ]);
                exit;
            }

            /* 1. Atribui o entregador na tabela entregas */
            $pdo->prepare("
                UPDATE entregas
                SET id_entregador = ?
                WHERE id_pedido = ?
            ")->execute([$id_entregador, $id_pedido]);

            /* 2. Muda o status do pedido para 'reservado' */
            $pdo->prepare("
                UPDATE pedidos
                SET status = 'reservado'
                WHERE id_pedido = ?
            ")->execute([$id_pedido]);

            /* 3. Sincroniza historico_vendas se existir */
            $hvExiste = $pdo->query("SHOW TABLES LIKE 'historico_vendas'")->fetch();
            if ($hvExiste) {
                $pdo->prepare("
                    UPDATE historico_vendas
                    SET status = 'reservado'
                    WHERE id_pedido = ?
                ")->execute([$id_pedido]);
            }

            /* 4. Sincroniza historico_cliente se existir */
            $hcExiste = $pdo->query("SHOW TABLES LIKE 'historico_cliente'")->fetch();
            if ($hcExiste) {
                $pdo->prepare("
                    UPDATE historico_cliente
                    SET status = 'reservado'
                    WHERE id_pedido = ?
                ")->execute([$id_pedido]);
            }

            $pdo->commit();
            echo json_encode([
                "success" => true,
                "acao"    => "reservar",
                "message" => "Pedido reservado com sucesso.",
                "status"  => "reservado",
            ]);

        /* ── CANCELAR RESERVA ────────────────────────────────── */
        } elseif ($acao === 'cancelar') {

            /* Verifica se o pedido pertence a este entregador */
            if ($id_entregador) {
                $chk = $pdo->prepare("
                    SELECT id_entregador FROM entregas WHERE id_pedido = ? LIMIT 1
                ");
                $chk->execute([$id_pedido]);
                $ent = $chk->fetch(PDO::FETCH_ASSOC);
                if ($ent && $ent['id_entregador'] != $id_entregador) {
                    $pdo->rollBack();
                    echo json_encode([
                        "success" => false,
                        "message" => "Não tens permissão para cancelar esta reserva.",
                    ]);
                    exit;
                }
            }

            /* 1. Remove o entregador da entrega */
            $pdo->prepare("
                UPDATE entregas
                SET id_entregador = NULL
                WHERE id_pedido = ?
            ")->execute([$id_pedido]);

            /* 2. Volta o pedido ao estado anterior (processando) */
            $pdo->prepare("
                UPDATE pedidos
                SET status = 'processando'
                WHERE id_pedido = ? AND status = 'reservado'
            ")->execute([$id_pedido]);

            /* 3. Sincroniza historico_vendas */
            $hvExiste = $pdo->query("SHOW TABLES LIKE 'historico_vendas'")->fetch();
            if ($hvExiste) {
                $pdo->prepare("
                    UPDATE historico_vendas
                    SET status = 'processando'
                    WHERE id_pedido = ? AND status = 'reservado'
                ")->execute([$id_pedido]);
            }

            /* 4. Sincroniza historico_cliente */
            $hcExiste = $pdo->query("SHOW TABLES LIKE 'historico_cliente'")->fetch();
            if ($hcExiste) {
                $pdo->prepare("
                    UPDATE historico_cliente
                    SET status = 'processando'
                    WHERE id_pedido = ? AND status = 'reservado'
                ")->execute([$id_pedido]);
            }

            $pdo->commit();
            echo json_encode([
                "success" => true,
                "acao"    => "cancelar",
                "message" => "Reserva cancelada. Pedido devolvido à fila.",
                "status"  => "processando",
            ]);

        /* ── ENTREGAR ────────────────────────────────────────── */
        } elseif ($acao === 'entregar') {

            /* 1. Actualiza o pedido */
            $pdo->prepare("
                UPDATE pedidos
                SET status = 'entregue'
                WHERE id_pedido = ?
            ")->execute([$id_pedido]);

            /* 2. Actualiza a entrega */
            $pdo->prepare("
                UPDATE entregas
                SET status = 'entregue', data_entrega = NOW()
                WHERE id_pedido = ?
            ")->execute([$id_pedido]);

            /* 3. Actualiza historico_vendas — detecta colunas disponíveis */
            $hvExiste = $pdo->query("SHOW TABLES LIKE 'historico_vendas'")->fetch();
            if ($hvExiste) {
                $temIdEntregador = (bool)$pdo->query(
                    "SHOW COLUMNS FROM historico_vendas LIKE 'id_entregador'"
                )->fetch();
                $temDataEntrega = (bool)$pdo->query(
                    "SHOW COLUMNS FROM historico_vendas LIKE 'data_entrega'"
                )->fetch();

                if ($temIdEntregador && $temDataEntrega) {
                    $pdo->prepare("
                        UPDATE historico_vendas
                        SET status = 'entregue', id_entregador = ?, data_entrega = NOW()
                        WHERE id_pedido = ?
                    ")->execute([$id_entregador, $id_pedido]);
                } elseif ($temIdEntregador) {
                    $pdo->prepare("
                        UPDATE historico_vendas
                        SET status = 'entregue', id_entregador = ?
                        WHERE id_pedido = ?
                    ")->execute([$id_entregador, $id_pedido]);
                } else {
                    $pdo->prepare("
                        UPDATE historico_vendas
                        SET status = 'entregue'
                        WHERE id_pedido = ?
                    ")->execute([$id_pedido]);
                }
            }

            /* 4. Sincroniza historico_cliente */
            $hcExiste = $pdo->query("SHOW TABLES LIKE 'historico_cliente'")->fetch();
            if ($hcExiste) {
                $pdo->prepare("
                    UPDATE historico_cliente
                    SET status = 'entregue'
                    WHERE id_pedido = ?
                ")->execute([$id_pedido]);
            }

            $pdo->commit();
            echo json_encode([
                "success" => true,
                "acao"    => "entregar",
                "message" => "Pedido marcado como entregue.",
                "status"  => "entregue",
            ]);

        } else {
            $pdo->rollBack();
            echo json_encode([
                "success" => false,
                "message" => "Acção desconhecida: {$acao}",
            ]);
        }
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>