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

// ── PASSO 1: GERAR E GUARDAR CÓDIGO ──────────────────────────
if ($action === 'enviar') {
    $email = trim($input['email'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "E-mail inválido."]);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT id_cliente, nome, google_account, senha_manual
        FROM clientes WHERE email = :email LIMIT 1
    ");
    $stmt->execute([':email' => $email]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        // Por segurança não revela se existe ou não
        echo json_encode([
            "success" => true,
            "codigo"  => null,
            "nome"    => null,
            "message" => "Se este e-mail estiver registado, receberá um código.",
        ]);
        exit();
    }

    if ($cliente['google_account'] == 1 && $cliente['senha_manual'] == 0) {
        echo json_encode([
            "success" => false,
            "message" => "Esta conta usa o Google para autenticação. Não é possível redefinir a senha aqui.",
        ]);
        exit();
    }

    // Apaga códigos antigos não usados
    $pdo->prepare("
        DELETE FROM codigos_verificacao
        WHERE email = :email AND tipo = 'reset' AND usado = 0
    ")->execute([':email' => $email]);

    // Gera código de 6 dígitos
    $codigo = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expira = date('Y-m-d H:i:s', strtotime('+15 minutes'));

    $pdo->prepare("
        INSERT INTO codigos_verificacao
          (email, codigo, tipo, usado, expira_em, criado_em)
        VALUES (:email, :codigo, 'reset', 0, :expira, NOW())
    ")->execute([
        ':email'  => $email,
        ':codigo' => $codigo,
        ':expira' => $expira,
    ]);

    // Devolve código + nome → frontend envia email via EmailJS
    echo json_encode([
        "success" => true,
        "codigo"  => $codigo,
        "nome"    => $cliente['nome'],
        "message" => "Código gerado com sucesso.",
    ]);
    exit();
}

// ── PASSO 2: VERIFICAR CÓDIGO ─────────────────────────────────
if ($action === 'verificar') {
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
          AND tipo      = 'reset'
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

    echo json_encode(["success" => true, "message" => "Código válido."]);
    exit();
}

// ── PASSO 3: REDEFINIR SENHA ──────────────────────────────────
if ($action === 'redefinir') {
    $email     = trim($input['email']     ?? '');
    $codigo    = trim($input['codigo']    ?? '');
    $novaSenha =      $input['nova_senha'] ?? '';

    if (!$email || strlen($codigo) !== 6) {
        echo json_encode(["success" => false, "message" => "Dados inválidos."]);
        exit();
    }

    if (strlen($novaSenha) < 8) {
        echo json_encode(["success" => false, "message" => "A senha deve ter pelo menos 8 caracteres."]);
        exit();
    }

    // Verifica código uma última vez
    $stmt = $pdo->prepare("
        SELECT id FROM codigos_verificacao
        WHERE email     = :email
          AND codigo    = :codigo
          AND tipo      = 'reset'
          AND usado     = 0
          AND expira_em > NOW()
        ORDER BY criado_em DESC LIMIT 1
    ");
    $stmt->execute([':email' => $email, ':codigo' => $codigo]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(["success" => false, "message" => "Sessão expirada. Recomece o processo."]);
        exit();
    }

    // Actualiza senha
    $hash = password_hash($novaSenha, PASSWORD_BCRYPT);
    $pdo->prepare("
        UPDATE clientes
        SET senha        = :senha,
            senha_manual = 1
        WHERE email = :email
    ")->execute([':senha' => $hash, ':email' => $email]);

    // Marca código como usado
    $pdo->prepare("UPDATE codigos_verificacao SET usado = 1 WHERE id = :id")
        ->execute([':id' => $row['id']]);

    echo json_encode([
        "success" => true,
        "message" => "Senha redefinida com sucesso. Pode fazer login.",
    ]);
    exit();
}

echo json_encode(["success" => false, "message" => "Acção inválida."]);