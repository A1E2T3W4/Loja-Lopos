<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); ob_end_clean(); exit(); }
ob_end_clean();

require_once 'config.php';

/*
 * verificar_cliente.php
 * ─────────────────────
 * APENAS consulta se o cliente JÁ foi marcado como verificado
 * na base de dados (pelo pedidos.php quando um pedido ficou
 * com status 'entregue').
 *
 * NÃO faz contagem, NÃO actualiza, NÃO credita bónus.
 * Toda essa lógica está centralizada em pedidos.php (PUT → entregue).
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não suportado."]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$id_cliente = intval($data['id_cliente'] ?? 0);

if (!$id_cliente) {
    echo json_encode(["success" => false, "message" => "id_cliente obrigatório."]);
    exit;
}

try {
    $q = $pdo->prepare("
        SELECT id_cliente, nome, email, cliente_verificado,
               compras_realizadas, saldo_bonus
        FROM clientes
        WHERE id_cliente = ?
    ");
    $q->execute([$id_cliente]);
    $cliente = $q->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        echo json_encode(["success" => false, "message" => "Cliente não encontrado."]);
        exit;
    }

    $verificado = (bool)$cliente['cliente_verificado'];

    echo json_encode([
        "success"            => true,
        "cliente_verificado" => $verificado,
        "compras_realizadas" => (int)$cliente['compras_realizadas'],
        "saldo_bonus"        => (float)$cliente['saldo_bonus'],
        /* Mensagem informativa para o frontend */
        "message" => $verificado
            ? "Cliente já verificado."
            : "Cliente ainda não verificado. A verificação ocorre automaticamente quando o " .
              "décimo pedido (ou seguintes) tiver o estado 'entregue'.",
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>