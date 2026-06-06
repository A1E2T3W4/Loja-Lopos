<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); ob_end_clean(); exit();
}
ob_end_clean();

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

/* ── Log de tentativas de login ── */
function registarLogin(
    PDO $pdo, ?int $id_usuario, string $user,
    string $nome, string $email, string $tipo,
    string $ip, string $user_agent,
    bool $sucesso, string $motivo = ''
): void {
    try {
        $pdo->prepare("
            INSERT INTO login_logs
                (id_usuario,user,nome,email,tipo,ip,user_agent,sucesso,motivo,data_log)
            VALUES (?,?,?,?,?,?,?,?,?,NOW())
        ")->execute([
            $id_usuario, $user, $nome, $email, $tipo,
            $ip, $user_agent, $sucesso ? 1 : 0, $motivo
        ]);
    } catch (Exception $e) { /* ignora */ }
}

$ip         = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

/* ══════════════════════════════════════════════════════════════
   HELPER — normaliza tipo para comparação
══════════════════════════════════════════════════════════════ */
function normalizarTipo(string $tipo): string {
    $t = strtolower(trim($tipo));
    if ($t === 'gerente') return 'gerente';
    if ($t === 'admin')   return 'admin';
    return 'operador';
}

/* ══════════════════════════════════════════════════════════════
   POST
══════════════════════════════════════════════════════════════ */
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    $acao = trim($data['acao'] ?? 'login');

    /* ── LOGIN ─────────────────────────────────────────────── */
    if ($acao === 'login') {
        $user  = trim($data['user']  ?? '');
        $senha = trim($data['senha'] ?? '');

        if (!$user || !$senha) {
            echo json_encode(["success" => false, "message" => "Utilizador e senha são obrigatórios."]);
            exit();
        }

        try {
            $stmt = $pdo->prepare("
                SELECT id_usuario, nome, user, email, senha, tipo,
                       ativo, super_admin, foto, ultimo_login
                FROM usuarios
                WHERE user = :u1 OR email = :u2 OR nome = :u3
                LIMIT 1
            ");
            $stmt->execute([':u1' => $user, ':u2' => $user, ':u3' => $user]);
            $operador = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$operador) {
                registarLogin($pdo, null, $user, '', '', '', $ip, $user_agent, false, 'Utilizador não encontrado');
                echo json_encode(["success" => false, "message" => "Utilizador não encontrado."]);
                exit();
            }

            if (!$operador['ativo']) {
                registarLogin($pdo, (int)$operador['id_usuario'], $user, $operador['nome'], $operador['email'], $operador['tipo'], $ip, $user_agent, false, 'Conta inactiva');
                echo json_encode(["success" => false, "message" => "Conta inactiva. Contacte o administrador."]);
                exit();
            }

            $senhaOk = password_verify($senha, $operador['senha']) || ($senha === $operador['senha']);
            if (!$senhaOk) {
                registarLogin($pdo, (int)$operador['id_usuario'], $user, $operador['nome'], $operador['email'], $operador['tipo'], $ip, $user_agent, false, 'Senha incorrecta');
                echo json_encode(["success" => false, "message" => "Senha incorrecta."]);
                exit();
            }

            $tipoNorm        = normalizarTipo($operador['tipo']);
            $tiposPermitidos = ['admin', 'gerente', 'operador'];

            if (!in_array($tipoNorm, $tiposPermitidos)) {
                registarLogin($pdo, (int)$operador['id_usuario'], $user, $operador['nome'], $operador['email'], $operador['tipo'], $ip, $user_agent, false, "Tipo sem permissão: {$operador['tipo']}");
                echo json_encode([
                    "success" => false,
                    "message" => "Acesso negado. Contacte o administrador.",
                    "tipo"    => $operador['tipo'],
                ]);
                exit();
            }

            registarLogin($pdo, (int)$operador['id_usuario'], $user, $operador['nome'], $operador['email'], $operador['tipo'], $ip, $user_agent, true, 'Login com sucesso');
            $pdo->prepare("UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?")->execute([$operador['id_usuario']]);

            $fotoBase64 = null;
            if (!empty($operador['foto'])) {
                $fotoBase64 = "data:image/jpeg;base64," . base64_encode($operador['foto']);
            }

            unset($operador['senha'], $operador['foto']);
            $operador['id_usuario']  = (int)$operador['id_usuario'];
            $operador['super_admin'] = (bool)$operador['super_admin'];
            $operador['ativo']       = (bool)$operador['ativo'];
            $operador['foto_url']    = $fotoBase64;
            $operador['tipo_norm']   = $tipoNorm;

            echo json_encode(["success" => true, "operador" => $operador]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
        exit();
    }

    /* ── ACTUALIZAR PERFIL ─────────────────────────────────── */
    if ($acao === 'actualizar_perfil') {
        $id    = intval($data['id_usuario'] ?? 0);
        $nome  = trim($data['nome']  ?? '');
        $email = trim($data['email'] ?? '');
        $user  = trim($data['user']  ?? '');
        $senha = trim($data['senha'] ?? '');
        $foto  = $data['foto_base64'] ?? null;

        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID em falta."]);
            exit();
        }

        try {
            $sets = []; $params = [];
            if ($nome)  { $sets[] = "nome=?";  $params[] = $nome;  }
            if ($email) { $sets[] = "email=?"; $params[] = $email; }
            if ($user)  { $sets[] = "user=?";  $params[] = $user;  }
            if ($senha && strlen($senha) >= 6) {
                $sets[] = "senha=?";
                $params[] = password_hash($senha, PASSWORD_DEFAULT);
            }
            if ($foto) {
                $fotoData = preg_replace('#^data:image/\w+;base64,#', '', $foto);
                $sets[] = "foto=?";
                $params[] = base64_decode($fotoData);
            }

            if (empty($sets)) {
                echo json_encode(["success" => false, "message" => "Nada para actualizar."]);
                exit();
            }

            $params[] = $id;
            $pdo->prepare("UPDATE usuarios SET " . implode(",", $sets) . " WHERE id_usuario=?")->execute($params);

            $q = $pdo->prepare("SELECT id_usuario,nome,user,email,tipo,super_admin,foto FROM usuarios WHERE id_usuario=?");
            $q->execute([$id]);
            $op = $q->fetch(PDO::FETCH_ASSOC);

            $fotoBase64 = null;
            if (!empty($op['foto'])) $fotoBase64 = "data:image/jpeg;base64," . base64_encode($op['foto']);
            unset($op['foto']);
            $op['foto_url']    = (string)$fotoBase64;
            $op['id_usuario']  = (int)$op['id_usuario'];
            $op['super_admin'] = (bool)$op['super_admin'];
            $op['tipo_norm']   = normalizarTipo($op['tipo']);

            echo json_encode(["success" => true, "operador" => $op]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
        exit();
    }

    /* ── CRIAR UTILIZADOR ──────────────────────────────────── */
    /* Permitido a: admin (super_admin=1 OU tipo=admin) */
    if ($acao === 'criar_usuario') {
        $sid = intval($data['solicitante_id'] ?? 0);

        $qsa = $pdo->prepare("SELECT super_admin, tipo FROM usuarios WHERE id_usuario=? AND ativo=1");
        $qsa->execute([$sid]);
        $sa = $qsa->fetch(PDO::FETCH_ASSOC);

        $temPermissao = $sa && ($sa['super_admin'] || normalizarTipo($sa['tipo']) === 'admin');

        if (!$temPermissao) {
            echo json_encode(["success" => false, "message" => "Sem permissão para criar utilizadores."]);
            exit();
        }

        $nome  = trim($data['nome']  ?? '');
        $user  = trim($data['user']  ?? '');
        $email = trim($data['email'] ?? '');
        $senha = trim($data['senha'] ?? '');
        $tipo  = trim($data['tipo']  ?? 'operador');

        if (!$nome || !$user || strlen($senha) < 4) {
            echo json_encode(["success" => false, "message" => "Preencha todos os campos. Senha mínimo 4 caracteres."]);
            exit();
        }

        /* Normaliza o tipo recebido do frontend (minúsculas) para o
           formato guardado na BD — admin, gerente, operador */
        $tipoNorm = normalizarTipo($tipo);
        /* Guarda com a capitalização correcta */
        $tipoGuardar = match($tipoNorm) {
            'admin'   => 'admin',
            'gerente' => 'gerente',
            default   => 'operador',
        };

        try {
            $qdup = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE user=? OR email=?");
            $qdup->execute([$user, $email]);
            if ($qdup->fetch()) {
                echo json_encode(["success" => false, "message" => "Utilizador ou e-mail já existe."]);
                exit();
            }

            $pdo->prepare("
                INSERT INTO usuarios (nome, user, email, senha, tipo, ativo, super_admin)
                VALUES (?, ?, ?, ?, ?, 1, 0)
            ")->execute([$nome, $user, $email, password_hash($senha, PASSWORD_DEFAULT), $tipoGuardar]);

            echo json_encode([
                "success" => true,
                "id"      => (int)$pdo->lastInsertId(),
                "tipo"    => $tipoGuardar,
                "message" => "Utilizador '$nome' criado com sucesso como $tipoGuardar.",
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
        exit();
    }

    echo json_encode(["success" => false, "message" => "Acção desconhecida."]);
    exit();
}

/* ══════════════════════════════════════════════════════════════
   GET — Listar utilizadores (admin ou super_admin)
══════════════════════════════════════════════════════════════ */
if ($method === 'GET') {
    $sid = intval($_GET['solicitante_id'] ?? 0);

    $qsa = $pdo->prepare("SELECT super_admin, tipo FROM usuarios WHERE id_usuario=? AND ativo=1");
    $qsa->execute([$sid]);
    $sa = $qsa->fetch(PDO::FETCH_ASSOC);

    $temPermissao = $sa && ($sa['super_admin'] || normalizarTipo($sa['tipo']) === 'admin');

    if (!$temPermissao) {
        echo json_encode(["success" => false, "message" => "Sem permissão."]);
        exit();
    }

    try {
        $q = $pdo->query("
            SELECT id_usuario, nome, user, email, tipo, ativo, super_admin, ultimo_login, criado_em
            FROM usuarios
            ORDER BY criado_em DESC
        ");
        $lista = $q->fetchAll(PDO::FETCH_ASSOC);
        foreach ($lista as &$u) {
            $u['id_usuario']  = (int)$u['id_usuario'];
            $u['super_admin'] = (bool)$u['super_admin'];
            $u['ativo']       = (bool)$u['ativo'];
            $u['tipo_norm']   = normalizarTipo($u['tipo']);
        }
        echo json_encode(["success" => true, "data" => $lista]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

/* ══════════════════════════════════════════════════════════════
   PUT — Bloquear / Desbloquear / Alterar tipo
══════════════════════════════════════════════════════════════ */
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true) ?? [];
    $sid  = intval($data['solicitante_id'] ?? 0);
    $alvo = intval($data['id_usuario']     ?? 0);

    $qsa = $pdo->prepare("SELECT super_admin, tipo FROM usuarios WHERE id_usuario=? AND ativo=1");
    $qsa->execute([$sid]);
    $sa = $qsa->fetch(PDO::FETCH_ASSOC);

    $temPermissao = $sa && ($sa['super_admin'] || normalizarTipo($sa['tipo']) === 'admin');

    if (!$temPermissao) {
        echo json_encode(["success" => false, "message" => "Sem permissão."]);
        exit();
    }
    if ($alvo === $sid) {
        echo json_encode(["success" => false, "message" => "Não pode alterar a sua própria conta aqui."]);
        exit();
    }

    try {
        $sets = []; $params = [];
        if (isset($data['ativo'])) {
            $sets[]   = "ativo=?";
            $params[] = $data['ativo'] ? 1 : 0;
        }
        if (isset($data['tipo'])) {
            $tipoGuardar = match(normalizarTipo($data['tipo'])) {
                'admin'   => 'admin',
                'gerente' => 'gerente',
                default   => 'operador',
            };
            $sets[]   = "tipo=?";
            $params[] = $tipoGuardar;
        }

        if (empty($sets)) {
            echo json_encode(["success" => false, "message" => "Nada para alterar."]);
            exit();
        }

        $params[] = $alvo;
        $pdo->prepare("UPDATE usuarios SET " . implode(",", $sets) . " WHERE id_usuario=?")->execute($params);
        echo json_encode(["success" => true, "message" => "Utilizador actualizado."]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

/* ══════════════════════════════════════════════════════════════
   DELETE — Remover utilizador
══════════════════════════════════════════════════════════════ */
if ($method === 'DELETE') {
    $sid  = intval($_GET['solicitante_id'] ?? 0);
    $alvo = intval($_GET['id_usuario']     ?? 0);

    $qsa = $pdo->prepare("SELECT super_admin, tipo FROM usuarios WHERE id_usuario=? AND ativo=1");
    $qsa->execute([$sid]);
    $sa = $qsa->fetch(PDO::FETCH_ASSOC);

    $temPermissao = $sa && ($sa['super_admin'] || normalizarTipo($sa['tipo']) === 'admin');

    if (!$temPermissao) {
        echo json_encode(["success" => false, "message" => "Sem permissão."]);
        exit();
    }
    if ($alvo === $sid) {
        echo json_encode(["success" => false, "message" => "Não pode apagar a sua própria conta."]);
        exit();
    }

    try {
        $pdo->prepare("DELETE FROM usuarios WHERE id_usuario=?")->execute([$alvo]);
        echo json_encode(["success" => true, "message" => "Utilizador removido."]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método não suportado."]);
?>