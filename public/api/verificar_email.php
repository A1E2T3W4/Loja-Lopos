<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); ob_end_clean(); exit();
}
ob_end_clean();

require_once 'config.php';

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? '';

// ── ENVIAR CÓDIGO DE CADASTRO ─────────────────────────────────
if ($action === 'enviar') {
    $email = trim($input['email'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "E-mail inválido."]);
        exit();
    }

    // Verifica se já existe conta
    $stmt = $pdo->prepare("
        SELECT id_cliente, nome, google_account
        FROM clientes WHERE email = :email LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $existente = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existente) {
        $msg = $existente['google_account']
            ? "Este e-mail já está associado a uma conta Google."
            : "Este e-mail já está registado. Faça login ou recupere a senha.";
        echo json_encode(["success" => false, "message" => $msg]);
        exit();
    }

    // Apaga códigos antigos não usados deste email
    $pdo->prepare("
        DELETE FROM codigos_verificacao
        WHERE email = :email AND tipo = 'cadastro' AND usado = 0
    ")->execute([':email' => $email]);

    // Gera código de 6 dígitos
    $codigo = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expira = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    $pdo->prepare("
        INSERT INTO codigos_verificacao
          (email, codigo, tipo, usado, expira_em, criado_em)
        VALUES (:email, :codigo, 'cadastro', 0, :expira, NOW())
    ")->execute([
        ':email'  => $email,
        ':codigo' => $codigo,
        ':expira' => $expira,
    ]);

    // Devolve o código para o frontend enviar via EmailJS
    echo json_encode([
        "success" => true,
        "codigo"  => $codigo,
        "message" => "Código gerado. O frontend deve enviar o email via EmailJS.",
    ]);
    exit();
}

// ── CONFIRMAR CÓDIGO DE CADASTRO ──────────────────────────────
if ($action === 'confirmar') {
    $email  = trim($input['email']  ?? '');
    $codigo = trim($input['codigo'] ?? '');

    if (!$email || strlen($codigo) !== 6) {
        echo json_encode(["success" => false, "message" => "Dados inválidos."]);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT id FROM codigos_verificacao
        WHERE email     = :email
          AND codigo    = :codigo
          AND tipo      = 'cadastro'
          AND usado     = 0
          AND expira_em > NOW()
        ORDER BY criado_em DESC LIMIT 1
    ");
    $stmt->execute([':email' => $email, ':codigo' => $codigo]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["success" => false, "message" => "Código inválido ou expirado."]);
        exit();
    }

    // Marca como usado
    $pdo->prepare("UPDATE codigos_verificacao SET usado = 1 WHERE id = :id")
        ->execute([':id' => $row['id']]);

    echo json_encode(["success" => true, "message" => "E-mail verificado com sucesso."]);
    exit();
}

echo json_encode(["success" => false, "message" => "Acção inválida."]);