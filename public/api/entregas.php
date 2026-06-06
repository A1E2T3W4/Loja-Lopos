<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once "config.php";

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? intval($_GET['id']) : 0;

try {
    if ($method === 'GET') {
        $id_pedido    = $_GET['id_pedido']    ?? null;
        $id_entregador = $_GET['id_entregador'] ?? null;

        $sql    = "SELECT e.*, p.total, p.status AS pedido_status,
                          c.nome, c.telefone, c.cliente_verificado
                   FROM entregas e
                   LEFT JOIN pedidos p  ON e.id_pedido  = p.id_pedido
                   LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
                   WHERE 1=1";
        $params = [];

        if ($id_pedido) {
            $sql     .= " AND e.id_pedido = ?";
            $params[] = $id_pedido;
        }
        if ($id_entregador) {
            $sql     .= " AND e.id_entregador = ?";
            $params[] = $id_entregador;
        }
        $sql .= " ORDER BY e.data_envio DESC";

        $q = $pdo->prepare($sql);
        $q->execute($params);
        $data = $q->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $data]);

    } elseif ($method === 'POST') {
        $d = json_decode(file_get_contents("php://input"), true);

        if (empty($d['id_pedido'])) {
            echo json_encode(["success" => false, "message" => "id_pedido obrigatório."]);
            exit;
        }

        // Verifica se já existe entrega para este pedido
        $check = $pdo->prepare("SELECT id_entrega FROM entregas WHERE id_pedido = ?");
        $check->execute([$d['id_pedido']]);
        if ($check->fetch()) {
            // Actualiza em vez de inserir
            $q = $pdo->prepare("UPDATE entregas SET
                status          = ?,
                nome            = ?,
                cidade          = ?,
                endereco        = ?,
                detalhe_entrega = ?,
                distancia       = ?,
                preco_entrega   = ?,
                data_envio      = ?,
                data_entrega    = ?
                WHERE id_pedido = ?");
            $q->execute([
                $d['status']          ?? 'pendente',
                $d['nome']            ?? '',
                $d['cidade']          ?? 'Luanda',
                $d['endereco']        ?? '',
                $d['detalhe_entrega'] ?? null,
                $d['distancia']       ?? null,
                $d['preco_entrega']   ?? null,
                $d['data_envio']      ?? date('Y-m-d H:i:s'),
                $d['data_entrega']    ?? null,
                $d['id_pedido'],
            ]);
            echo json_encode(["success" => true, "actualizado" => true]);
            exit;
        }

        $q = $pdo->prepare("INSERT INTO entregas
            (id_pedido, status, nome, cidade, endereco, detalhe_entrega,
             distancia, preco_entrega, data_envio, data_entrega)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $q->execute([
            $d['id_pedido'],
            $d['status']          ?? 'pendente',
            $d['nome']            ?? '',
            $d['cidade']          ?? 'Luanda',
            $d['endereco']        ?? '',
            $d['detalhe_entrega'] ?? null,
            $d['distancia']       ?? null,
            $d['preco_entrega']   ?? null,
            $d['data_envio']      ?? date('Y-m-d H:i:s'),
            $d['data_entrega']    ?? null,
        ]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);

    } elseif ($method === 'PUT') {
        $d = json_decode(file_get_contents("php://input"), true);
        $id_pedido = $d['id_pedido'] ?? $id;

        $q = $pdo->prepare("UPDATE entregas SET status = ? WHERE id_pedido = ?");
        $q->execute([$d['status'], $id_pedido]);
        echo json_encode(["success" => true]);

    } elseif ($method === 'DELETE') {
        $pdo->prepare("DELETE FROM entregas WHERE id_entrega = ?")->execute([$id]);
        echo json_encode(["success" => true]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>