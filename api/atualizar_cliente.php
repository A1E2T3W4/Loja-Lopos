<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Método não suportado."]);
    exit;
}

try {
    $d          = json_decode(file_get_contents("php://input"), true);
    $id_cliente = isset($d['id_cliente']) ? intval($d['id_cliente']) : 0;

    if (!$id_cliente) {
        echo json_encode(["success" => false, "message" => "id_cliente obrigatório."]);
        exit;
    }

    $sets   = [];
    $params = [];

    /* Nome */
    if (!empty(trim($d['nome'] ?? ''))) {
        $sets[]   = "nome = ?";
        $params[] = trim($d['nome']);
    }

    /* Telefone (pode ser vazio para limpar) */
    if (isset($d['telefone'])) {
        $sets[]   = "telefone = ?";
        $params[] = trim($d['telefone']);
    }

    /* Senha — só actualiza se enviada e válida */
    if (!empty(trim($d['senha'] ?? ''))) {
        if (strlen(trim($d['senha'])) < 8) {
            echo json_encode(["success" => false, "message" => "A senha deve ter pelo menos 8 caracteres."]);
            exit;
        }
        $sets[]   = "senha = ?";
        $params[] = password_hash(trim($d['senha']), PASSWORD_BCRYPT);
        $sets[]   = "senha_manual = 1";
    }

    if (empty($sets)) {
        echo json_encode(["success" => false, "message" => "Nenhum dado para actualizar."]);
        exit;
    }

    $params[] = $id_cliente;

    $sql = "UPDATE clientes SET " . implode(", ", $sets) . " WHERE id_cliente = ?";
    $pdo->prepare($sql)->execute($params);

    /* Devolve os dados actualizados para o frontend atualizar o localStorage */
    $qc = $pdo->prepare("
        SELECT id_cliente, nome, email, telefone, foto_url,
               saldo_bonus, compras_realizadas, cliente_verificado
        FROM clientes WHERE id_cliente = ?
    ");
    $qc->execute([$id_cliente]);
    $cliente = $qc->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "message" => "Dados actualizados com sucesso.",
        "cliente" => $cliente,
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>