<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'config.php';

$method     = $_SERVER['REQUEST_METHOD'];
$id_cliente = isset($_GET['id_cliente']) ? intval($_GET['id_cliente']) : 0;

/*
 * historico_cliente.php
 * ──────────────────────
 * Responsabilidade: leitura e gestão do histórico de compras.
 *
 * NÃO verifica clientes NEM credita bónus — essa lógica
 * está centralizada em pedidos.php (PUT → entregue).
 *
 * Retorna compras_validas = nº de pedidos com status 'entregue',
 * para o frontend mostrar a barra de progresso. A verificação
 * real acontece no backend quando um pedido muda para 'entregue'.
 */

try {

    /* ── GET — listar histórico ── */
    if ($method === 'GET') {
        if (!$id_cliente) {
            echo json_encode(["success" => false, "message" => "id_cliente obrigatório."]);
            exit;
        }

        $q = $pdo->prepare("
            SELECT
                hv.id_historico,
                hv.id_pedido,
                hv.id_cliente,
                hv.total,
                hv.data_compra,
                COALESCE(p.status, hv.status) AS status,
                p.qr_code,
                p.endereco,
                p.taxa_entrega,
                p.criado_em AS data_pedido
            FROM historico_vendas hv
            LEFT JOIN pedidos p ON p.id_pedido = hv.id_pedido
            WHERE hv.id_cliente = ?
            ORDER BY hv.data_compra DESC
        ");
        $q->execute([$id_cliente]);
        $historico = $q->fetchAll(PDO::FETCH_ASSOC);

        /*
         * compras_validas = pedidos com status 'entregue'.
         * Usado APENAS para a barra de progresso no frontend.
         * A verificação real já foi feita pelo pedidos.php.
         */
        $compras_validas = 0;
        foreach ($historico as $h) {
            if (strtolower($h['status']) === 'entregue') {
                $compras_validas++;
            }
        }

        /* Estado actual do cliente na BD */
        $qc = $pdo->prepare("SELECT cliente_verificado, saldo_bonus FROM clientes WHERE id_cliente = ?");
        $qc->execute([$id_cliente]);
        $dadosCliente = $qc->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success"            => true,
            "historico"          => $historico,
            "compras_validas"    => $compras_validas,
            "cliente_verificado" => $dadosCliente ? (bool)$dadosCliente['cliente_verificado'] : false,
            "saldo_bonus"        => $dadosCliente ? (float)$dadosCliente['saldo_bonus'] : 0.0,
        ]);
        exit;
    }

    /* ── PUT — cancelar pedido (só pendente ou pago) ── */
    if ($method === 'PUT') {
        $d          = json_decode(file_get_contents("php://input"), true);
        $id_pedido  = isset($d['id_pedido'])  ? intval($d['id_pedido'])  : 0;
        $id_cliente = isset($d['id_cliente']) ? intval($d['id_cliente']) : 0;
        $acao       = $d['acao'] ?? '';

        if (!$id_pedido || !$id_cliente || $acao !== 'cancelar') {
            echo json_encode(["success" => false, "message" => "Dados incompletos."]); exit;
        }

        $qCheck = $pdo->prepare("SELECT status FROM pedidos WHERE id_pedido = ? AND id_cliente = ?");
        $qCheck->execute([$id_pedido, $id_cliente]);
        $pedido = $qCheck->fetch(PDO::FETCH_ASSOC);

        if (!$pedido) {
            echo json_encode(["success" => false, "message" => "Pedido não encontrado."]); exit;
        }

        if (!in_array(strtolower($pedido['status']), ['pendente', 'pago'])) {
            echo json_encode([
                "success" => false,
                "message" => "Pedido com estado '{$pedido['status']}' não pode ser cancelado aqui. " .
                             "Contacte o administrador.",
            ]);
            exit;
        }

        $pdo->beginTransaction();

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

        $pdo->prepare("UPDATE pedidos          SET status = 'cancelado' WHERE id_pedido = ?")->execute([$id_pedido]);
        $pdo->prepare("UPDATE historico_vendas SET status = 'cancelado' WHERE id_pedido = ? AND id_cliente = ?")->execute([$id_pedido, $id_cliente]);
        $pdo->prepare("UPDATE entregas         SET status = 'cancelado' WHERE id_pedido = ?")->execute([$id_pedido]);

        $pdo->commit();
        echo json_encode(["success" => true, "message" => "Pedido cancelado com sucesso."]);
        exit;
    }

    /* ── DELETE — apagar registo do histórico ── */
    if ($method === 'DELETE') {
        $id_historico = isset($_GET['id_historico']) ? intval($_GET['id_historico']) : 0;
        $id_cliente   = isset($_GET['id_cliente'])   ? intval($_GET['id_cliente'])   : 0;

        if (!$id_historico || !$id_cliente) {
            $d            = json_decode(file_get_contents("php://input"), true);
            $id_historico = intval($d['id_historico'] ?? 0);
            $id_cliente   = intval($d['id_cliente']   ?? 0);
        }

        if (!$id_historico || !$id_cliente) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "id_historico e id_cliente são obrigatórios."]);
            exit;
        }

        $qCheck = $pdo->prepare("SELECT id_historico FROM historico_vendas WHERE id_historico = ? AND id_cliente = ?");
        $qCheck->execute([$id_historico, $id_cliente]);
        if (!$qCheck->fetch()) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Registo não encontrado."]);
            exit;
        }

        $pdo->prepare("DELETE FROM historico_vendas WHERE id_historico = ? AND id_cliente = ?")
            ->execute([$id_historico, $id_cliente]);

        echo json_encode(["success" => true, "message" => "Registo removido do histórico."]);
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