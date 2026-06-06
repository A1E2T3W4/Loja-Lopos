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

    // ── GET ────────────────────────────────────────────────
    if ($method === 'GET') {
        if ($id) {
            $q = $pdo->prepare("
                SELECT id_cliente, nome, email, telefone, foto_url,
                       saldo_bonus, endereco, cidade, pais,
                       compras_realizadas, cliente_verificado,
                       google_account, senha_manual,
                       ativo, criado_em
                FROM clientes WHERE id_cliente = ?
            ");
            $q->execute([$id]);
            $c = $q->fetch(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $c ?: null]);
        } else {
            $busca = $_GET['busca'] ?? '';
            if ($busca) {
                $q = $pdo->prepare("
                    SELECT id_cliente, nome, email, telefone, foto_url,
                           saldo_bonus, endereco, cidade, pais,
                           compras_realizadas, cliente_verificado,
                           google_account, senha_manual,
                           ativo, criado_em
                    FROM clientes
                    WHERE nome LIKE ? OR email LIKE ? OR telefone LIKE ?
                    ORDER BY criado_em DESC
                ");
                $like = "%$busca%";
                $q->execute([$like, $like, $like]);
            } else {
                $q = $pdo->query("
                    SELECT id_cliente, nome, email, telefone, foto_url,
                           saldo_bonus, endereco, cidade, pais,
                           compras_realizadas, cliente_verificado,
                           google_account, senha_manual,
                           ativo, criado_em
                    FROM clientes
                    ORDER BY criado_em DESC
                ");
            }
            $clientes = $q->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode([
                "success" => true,
                "data"    => $clientes,
                "total"   => count($clientes),
            ]);
        }
    }

    // ── POST — criar cliente ───────────────────────────────
    elseif ($method === 'POST') {
        $d = json_decode(file_get_contents("php://input"), true);

        // Acção de bloquear/desbloquear via POST com action
        $acao = $d['acao'] ?? '';

        if ($acao === 'bloquear' || $acao === 'desbloquear') {
            $id_cliente = intval($d['id_cliente'] ?? 0);
            if (!$id_cliente) {
                echo json_encode(["success" => false, "message" => "ID em falta."]);
                exit;
            }
            $novoEstado = ($acao === 'desbloquear') ? 1 : 0;
            $pdo->prepare("UPDATE clientes SET ativo = ? WHERE id_cliente = ?")
                ->execute([$novoEstado, $id_cliente]);

            echo json_encode([
                "success" => true,
                "message" => $acao === 'bloquear'
                    ? "Conta bloqueada com sucesso."
                    : "Conta desbloqueada com sucesso.",
                "ativo"   => $novoEstado,
            ]);
            exit;
        }

        // Criar novo cliente
        $q = $pdo->prepare("
            INSERT INTO clientes
              (nome, email, senha, telefone, endereco, cidade, pais, data_nascimento, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        $q->execute([
            $d['nome']            ?? '',
            $d['email']           ?? '',
            password_hash($d['senha'] ?? '123456', PASSWORD_DEFAULT),
            $d['telefone']        ?? '',
            $d['endereco']        ?? '',
            $d['cidade']          ?? 'Luanda',
            $d['pais']            ?? 'Angola',
            $d['data_nascimento'] ?? null,
        ]);
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    }

    // ── PUT — actualizar cliente ───────────────────────────
    elseif ($method === 'PUT') {
        $d  = json_decode(file_get_contents("php://input"), true);
        $id = intval($d['id_cliente'] ?? $id);

        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID em falta."]);
            exit;
        }

        // Suporte a bloquear/desbloquear via PUT
        if (isset($d['ativo'])) {
            $pdo->prepare("UPDATE clientes SET ativo = ? WHERE id_cliente = ?")
                ->execute([intval($d['ativo']), $id]);
            echo json_encode([
                "success" => true,
                "message" => $d['ativo'] ? "Conta desbloqueada." : "Conta bloqueada.",
                "ativo"   => intval($d['ativo']),
            ]);
            exit;
        }

        $q = $pdo->prepare("
            UPDATE clientes
            SET nome = ?, email = ?, telefone = ?,
                endereco = ?, cidade = ?, cliente_verificado = ?
            WHERE id_cliente = ?
        ");
        $q->execute([
            $d['nome']               ?? '',
            $d['email']              ?? '',
            $d['telefone']           ?? '',
            $d['endereco']           ?? '',
            $d['cidade']             ?? '',
            $d['cliente_verificado'] ?? 0,
            $id,
        ]);
        echo json_encode(["success" => true, "message" => "Cliente actualizado."]);
    }

    // ── DELETE ─────────────────────────────────────────────
    elseif ($method === 'DELETE') {
        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID em falta."]);
            exit;
        }
        $pdo->prepare("DELETE FROM clientes WHERE id_cliente = ?")
            ->execute([$id]);
        echo json_encode(["success" => true, "message" => "Cliente eliminado."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}