<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_clean();
    exit();
}
ob_end_clean();

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? '';

// ── Helper — busca cliente completo com saldo do cartão ──────
function getClienteCompleto(PDO $pdo, int $id): array|false {
    $stmt = $pdo->prepare("
        SELECT
            c.id_cliente,
            c.nome,
            c.email,
            c.telefone,
            c.foto_url,
            c.cliente_verificado,
            c.compras_realizadas,
            c.google_account,
            c.senha_manual,
            c.ativo,
            COALESCE(ca.saldo_bonus, 0) AS saldo_bonus
        FROM clientes c
        LEFT JOIN cartao ca ON ca.id_cliente = c.id_cliente
        WHERE c.id_cliente = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// ── Helper — monta o objecto cliente para o frontend ─────────
function montarCliente(array $c, string $fotoFallback = ''): array {
    return [
        "id_cliente"         => (int)$c['id_cliente'],
        "nome"               => $c['nome'],
        "email"              => $c['email'],
        "telefone"           => $c['telefone']  ?? '',
        "foto_url"           => $c['foto_url']  ?: $fotoFallback,
        "google_account"     => (bool)$c['google_account'],
        "senha_manual"       => (bool)$c['senha_manual'],
        "cliente_verificado" => (bool)$c['cliente_verificado'],
        "compras_realizadas" => (int)$c['compras_realizadas'],
        "saldo_bonus"        => (float)$c['saldo_bonus'],
        "ativo"              => (int)$c['ativo'],
    ];
}

// ── Helper — verifica se conta está bloqueada ─────────────────
function verificarBloqueio(array $cliente): bool {
    return isset($cliente['ativo']) && (int)$cliente['ativo'] === 0;
}

try {

    // ════════════════════════════════════════════════════════
    // CADASTRO MANUAL
    // ════════════════════════════════════════════════════════
    if ($method === 'POST' && $action === 'cadastro') {
        $nome     = trim($input['nome']     ?? '');
        $email    = trim($input['email']    ?? '');
        $telefone = trim($input['telefone'] ?? '');
        $senha    = $input['senha']         ?? '';

        // Validações
        if (!$nome || !$email || !$senha) {
            echo json_encode(["success" => false, "message" => "Preencha todos os campos."]);
            exit();
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["success" => false, "message" => "E-mail inválido."]);
            exit();
        }
        if (strlen($senha) < 8) {
            echo json_encode(["success" => false, "message" => "A senha deve ter pelo menos 8 caracteres."]);
            exit();
        }

        // Verifica se email já existe
        $stmt = $pdo->prepare("
            SELECT id_cliente, google_account, ativo
            FROM clientes WHERE email = :email LIMIT 1
        ");
        $stmt->execute([':email' => $email]);
        $existente = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existente) {
            $msg = $existente['google_account']
                ? "Este e-mail já está associado a uma conta Google. Use o botão 'Registar com Google'."
                : "Este e-mail já está registado. Faça login ou recupere a senha.";
            echo json_encode(["success" => false, "message" => $msg]);
            exit();
        }

        // Verifica se o código foi confirmado
        $stmt = $pdo->prepare("
            SELECT id FROM codigos_verificacao
            WHERE email = :email AND tipo = 'cadastro' AND usado = 1
            ORDER BY criado_em DESC LIMIT 1
        ");
        $stmt->execute([':email' => $email]);
        if (!$stmt->fetch()) {
            echo json_encode([
                "success" => false,
                "message" => "E-mail não verificado. Confirme o código enviado primeiro.",
            ]);
            exit();
        }

        // Cria conta
        $senhaHash = password_hash($senha, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("
            INSERT INTO clientes
              (nome, email, telefone, senha, google_account, senha_manual, ativo)
            VALUES (:nome, :email, :telefone, :senha, 0, 1, 1)
        ");
        $stmt->execute([
            ':nome'     => $nome,
            ':email'    => $email,
            ':telefone' => $telefone,
            ':senha'    => $senhaHash,
        ]);

        $id    = (int)$pdo->lastInsertId();
        $token = bin2hex(random_bytes(32));
        $c     = getClienteCompleto($pdo, $id);

        echo json_encode([
            "success" => true,
            "token"   => $token,
            "cliente" => montarCliente($c),
        ]);
        exit();
    }

    // ════════════════════════════════════════════════════════
    // LOGIN MANUAL
    // ════════════════════════════════════════════════════════
    if ($method === 'POST' && $action === 'login') {
        $email = trim($input['email'] ?? '');
        $senha = $input['senha']      ?? '';

        if (!$email || !$senha) {
            echo json_encode(["success" => false, "message" => "Preencha todos os campos."]);
            exit();
        }

        $stmt = $pdo->prepare("
            SELECT * FROM clientes WHERE email = :email LIMIT 1
        ");
        $stmt->execute([':email' => $email]);
        $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cliente) {
            echo json_encode(["success" => false, "message" => "E-mail ou senha incorrectos."]);
            exit();
        }

        // ✅ Conta bloqueada
        if (verificarBloqueio($cliente)) {
            echo json_encode([
                "success"   => false,
                "bloqueado" => true,
                "message"   => "A sua conta foi suspensa. Contacte o suporte para mais informações.",
            ]);
            exit();
        }

        // Conta Google sem senha manual
        if ($cliente['google_account'] && !$cliente['senha_manual']) {
            echo json_encode([
                "success" => false,
                "message" => "Esta conta foi criada com Google. Use o botão 'Entrar com Google'.",
            ]);
            exit();
        }

        // Verifica senha
        if (!password_verify($senha, $cliente['senha'])) {
            echo json_encode(["success" => false, "message" => "E-mail ou senha incorrectos."]);
            exit();
        }

        $token = bin2hex(random_bytes(32));
        $c     = getClienteCompleto($pdo, $cliente['id_cliente']);

        echo json_encode([
            "success" => true,
            "token"   => $token,
            "cliente" => montarCliente($c),
        ]);
        exit();
    }

    // ════════════════════════════════════════════════════════
    // LOGIN / CADASTRO COM GOOGLE
    // ════════════════════════════════════════════════════════
    if ($method === 'POST' && $action === 'google') {
        $email    = trim($input['email']    ?? '');
        $nome     = trim($input['nome']     ?? '');
        $foto_url = trim($input['foto_url'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(["success" => false, "message" => "E-mail inválido."]);
            exit();
        }

        $stmt = $pdo->prepare("
            SELECT * FROM clientes WHERE email = :email LIMIT 1
        ");
        $stmt->execute([':email' => $email]);
        $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cliente) {
            // ✅ Conta bloqueada — bloqueia também login Google
            if (verificarBloqueio($cliente)) {
                echo json_encode([
                    "success"   => false,
                    "bloqueado" => true,
                    "message"   => "A sua conta foi suspensa. Contacte o suporte para mais informações.",
                ]);
                exit();
            }

            // Actualiza foto se estiver vazia
            if (empty($cliente['foto_url']) && $foto_url) {
                $pdo->prepare("
                    UPDATE clientes SET foto_url = :foto WHERE id_cliente = :id
                ")->execute([':foto' => $foto_url, ':id' => $cliente['id_cliente']]);
            }

            // Marca como conta Google se ainda não estiver
            if (!$cliente['google_account']) {
                $pdo->prepare("
                    UPDATE clientes SET google_account = 1 WHERE id_cliente = :id
                ")->execute([':id' => $cliente['id_cliente']]);
            }

            $id = (int)$cliente['id_cliente'];

        } else {
            // Cria conta nova via Google
            $senhaAleatoria = password_hash(bin2hex(random_bytes(32)), PASSWORD_BCRYPT);

            $stmt = $pdo->prepare("
                INSERT INTO clientes
                  (nome, email, foto_url, senha, google_account, senha_manual, ativo)
                VALUES (:nome, :email, :foto, :senha, 1, 0, 1)
            ");
            $stmt->execute([
                ':nome'  => $nome,
                ':email' => $email,
                ':foto'  => $foto_url,
                ':senha' => $senhaAleatoria,
            ]);
            $id = (int)$pdo->lastInsertId();
        }

        $token = bin2hex(random_bytes(32));
        $c     = getClienteCompleto($pdo, $id);

        echo json_encode([
            "success" => true,
            "token"   => $token,
            "cliente" => montarCliente($c, $foto_url),
        ]);
        exit();
    }

    // ════════════════════════════════════════════════════════
    // ACÇÃO INVÁLIDA
    // ════════════════════════════════════════════════════════
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Acção inválida."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
