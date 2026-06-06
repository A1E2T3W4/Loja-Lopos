<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }

require_once "config.php";

$method = $_SERVER["REQUEST_METHOD"];
$id     = isset($_GET["id"]) ? intval($_GET["id"]) : 0;

/* ── Monta imagens a partir das colunas ── */
function montarImagens(array &$p): void {
    $imagens = [];
    foreach (["imagem_url","img1","img2","img3","img4","img5"] as $campo) {
        if (!empty($p[$campo])) $imagens[] = $p[$campo];
        unset($p[$campo]);
    }
    if (!empty($p["imagens_extras"])) {
        $extras = json_decode($p["imagens_extras"], true);
        if (is_array($extras)) $imagens = array_merge($imagens, array_filter($extras));
    }
    unset($p["imagens_extras"]);
    $p["imagens"]    = array_values(array_unique($imagens));
    $p["imagem_url"] = $imagens[0] ?? "";
}

/* ── Calcula status com base no stock ── */
function calcularStatus(int $estoque, int $estoqueMinimo, string $statusActual): string {
    if ($statusActual === 'descontinuado') return 'descontinuado';
    return $estoque <= $estoqueMinimo ? 'esgotado' : 'disponivel';
}

try {

    /* ════════════════════════════════════════════════════════
       GET
    ════════════════════════════════════════════════════════ */
    if ($method === "GET") {
        $categoria = $_GET["categoria"] ?? "";
        $busca     = $_GET["busca"]     ?? "";
        $soAtivos  = isset($_GET["loja"]);
        $ofertas   = isset($_GET["ofertas"]);

        $sql = "SELECT
                    id_produto, sku, nome, descricao, marca,
                    img1, img2, img3, img4, img5, 
                    preco, preco_antigo, custo,
                    estoque, estoque_minimo,
                    bonus_percentual, bonus_saldo,
                    ativo, status, categoria,
                    criado_em, atualizado_em
                FROM produtos WHERE 1=1";
        $params = [];

        if ($soAtivos) {
            $sql .= " AND ativo = 1 AND status = 'disponivel'";
        }
        if ($id)        { $sql .= " AND id_produto = ?"; $params[] = $id; }
        if ($categoria) { $sql .= " AND categoria = ?";  $params[] = $categoria; }
        if ($ofertas)   { $sql .= " AND bonus_percentual > 0 AND ativo = 1 AND status = 'disponivel'"; }
        if ($busca) {
            $sql .= " AND (nome LIKE ? OR descricao LIKE ? OR marca LIKE ?)";
            $like = "%$busca%";
            $params[] = $like; $params[] = $like; $params[] = $like;
        }
        $sql .= " ORDER BY id_produto DESC";

        $q = $pdo->prepare($sql);
        $q->execute($params);
        $rows = $q->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$p) {
            montarImagens($p);
            $p["ativo"]           = (int)$p["ativo"];
            $p["status"]          = $p["status"] ?? "disponivel";
            $p["bonus_saldo"]     = (float)($p["bonus_saldo"] ?? 0);
            $p["bonus_percentual"]= (float)($p["bonus_percentual"] ?? 0);

            $bp = $p["bonus_percentual"];
            $p["preco_com_desconto"] = $bp > 0
                ? round($p["preco"] * (1 - $bp / 100), 2)
                : null;
            $p["tem_oferta"]    = $bp > 0;
            $p["esta_esgotado"] = $p["status"] === "esgotado";
        }
        unset($p);

        echo json_encode(["success" => true, "data" => $rows, "total" => count($rows)]);
        exit;
    }

    /* ════════════════════════════════════════════════════════
       POST — criar
    ════════════════════════════════════════════════════════ */
    if ($method === "POST") {
        $d = json_decode(file_get_contents("php://input"), true);

        if (empty($d["nome"]) || !isset($d["preco"])) {
            echo json_encode(["success" => false, "message" => "Nome e preço são obrigatórios."]);
            exit;
        }

        /* Imagens */
        $imagens = $d["imagens"] ?? [];
        if (empty($imagens) && !empty($d["imagem_url"])) $imagens = [$d["imagem_url"]];
        $img1 = $imagens[0] ?? null; $img2 = $imagens[1] ?? null;
        $img3 = $imagens[2] ?? null; $img4 = $imagens[3] ?? null;
        $img5 = $imagens[4] ?? null;
        $extras         = array_slice($imagens, 5);
        $imagens_extras = count($extras) ? json_encode($extras) : null;

        /* Stock e status */
        $estoque    = intval($d["estoque"]        ?? 0);
        $estoqueMin = intval($d["estoque_minimo"] ?? 5);
        $status     = calcularStatus($estoque, $estoqueMin, 'disponivel');

        /* ── CAMPOS NUMÉRICOS — sem ?: null para não converter 0 em NULL ── */
        $preco           = floatval($d["preco"]            ?? 0);
        $preco_antigo    = isset($d["preco_antigo"])    && $d["preco_antigo"] !== "" && $d["preco_antigo"] !== null
                            ? floatval($d["preco_antigo"]) : null;
        $custo           = isset($d["custo"])           && $d["custo"]        !== "" && $d["custo"]        !== null
                            ? floatval($d["custo"])        : null;
        $bonus_percentual= floatval($d["bonus_percentual"] ?? 0);
        $bonus_saldo     = floatval($d["bonus_saldo"]      ?? 0); // ← 0 é válido, não vira null

        $q = $pdo->prepare("
            INSERT INTO produtos
              (nome, descricao, marca, preco, preco_antigo, custo,
               estoque, estoque_minimo,
               bonus_percentual, bonus_saldo,
               ativo, status, categoria,
               img1, img2, img3, img4, img5, imagens_extras)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ");
        $q->execute([
            trim($d["nome"]),
            trim($d["descricao"]  ?? ""),
            trim($d["marca"]      ?? ""),
            $preco,
            $preco_antigo,
            $custo,
            $estoque,
            $estoqueMin,
            $bonus_percentual,
            $bonus_saldo,
            ($d["ativo"] ?? true) ? 1 : 0,
            $status,
            $d["categoria"] ?? "Computadores",
            $img1, $img2, $img3, $img4, $img5,
            $imagens_extras,
        ]);

        $novoId = (int)$pdo->lastInsertId();

        echo json_encode([
            "success"    => true,
            "id_produto" => $novoId,
            "status"     => $status,
            "bonus_saldo"=> $bonus_saldo,
            "message"    => $status === 'esgotado'
                ? "Produto criado mas marcado como ESGOTADO (stock ≤ mínimo). Não aparece na loja."
                : "Produto criado com sucesso.",
        ]);
        exit;
    }

    /* ════════════════════════════════════════════════════════
       PUT — actualizar
    ════════════════════════════════════════════════════════ */
    if ($method === "PUT") {
        $d  = json_decode(file_get_contents("php://input"), true);
        $id = intval($d["id_produto"] ?? $id);

        if (!$id) {
            echo json_encode(["success" => false, "message" => "ID em falta."]);
            exit;
        }

        /* Imagens */
        $imagens = $d["imagens"] ?? [];
        if (empty($imagens) && !empty($d["imagem_url"])) $imagens = [$d["imagem_url"]];
        $img1 = $imagens[0] ?? null; $img2 = $imagens[1] ?? null;
        $img3 = $imagens[2] ?? null; $img4 = $imagens[3] ?? null;
        $img5 = $imagens[4] ?? null;
        $extras         = array_slice($imagens, 5);
        $imagens_extras = count($extras) ? json_encode($extras) : null;

        /* Stock e status */
        $estoque    = intval($d["estoque"]        ?? 0);
        $estoqueMin = intval($d["estoque_minimo"] ?? 5);
        $statusManual = $d["status"] ?? null;
        $status = ($statusManual === 'descontinuado')
            ? 'descontinuado'
            : calcularStatus($estoque, $estoqueMin, $statusManual ?? 'disponivel');

        /* ── CAMPOS NUMÉRICOS — sem ?: null ── */
        $preco           = floatval($d["preco"]            ?? 0);
        $preco_antigo    = isset($d["preco_antigo"])    && $d["preco_antigo"] !== "" && $d["preco_antigo"] !== null
                            ? floatval($d["preco_antigo"]) : null;
        $custo           = isset($d["custo"])           && $d["custo"]        !== "" && $d["custo"]        !== null
                            ? floatval($d["custo"])        : null;
        $bonus_percentual= floatval($d["bonus_percentual"] ?? 0);
        $bonus_saldo     = floatval($d["bonus_saldo"]      ?? 0); // ← correcção principal

        $q = $pdo->prepare("
            UPDATE produtos SET
                nome              = ?,
                descricao         = ?,
                marca             = ?,
                preco             = ?,
                preco_antigo      = ?,
                custo             = ?,
                estoque           = ?,
                estoque_minimo    = ?,
                bonus_percentual  = ?,
                bonus_saldo       = ?,
                ativo             = ?,
                status            = ?,
                categoria         = ?,
                img1 = ?, img2 = ?, img3 = ?, img4 = ?, img5 = ?,
                imagens_extras    = ?
            WHERE id_produto = ?
        ");
        $q->execute([
            trim($d["nome"]),
            trim($d["descricao"]  ?? ""),
            trim($d["marca"]      ?? ""),
            $preco,
            $preco_antigo,
            $custo,
            $estoque,
            $estoqueMin,
            $bonus_percentual,
            $bonus_saldo,
            ($d["ativo"] ?? true) ? 1 : 0,
            $status,
            $d["categoria"] ?? "Computadores",
            $img1, $img2, $img3, $img4, $img5,
            $imagens_extras,
            $id,
        ]);

        echo json_encode([
            "success"     => true,
            "status"      => $status,
            "bonus_saldo" => $bonus_saldo,
            "message"     => match($status) {
                'esgotado'      => "Produto actualizado. Stock ≤ mínimo — removido da loja automaticamente.",
                'descontinuado' => "Produto marcado como descontinuado.",
                default         => "Produto actualizado com sucesso.",
            },
        ]);
        exit;
    }

    /* ════════════════════════════════════════════════════════
       DELETE
    ════════════════════════════════════════════════════════ */
    if ($method === "DELETE") {
        $id = intval($_GET["id"] ?? 0);
        if (!$id) {
            $body = json_decode(file_get_contents("php://input"), true);
            $id   = intval($body["id_produto"] ?? $body["id"] ?? 0);
        }
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID em falta."]);
            exit;
        }

        $check = $pdo->prepare("SELECT nome FROM produtos WHERE id_produto = ?");
        $check->execute([$id]);
        $produto = $check->fetch(PDO::FETCH_ASSOC);
        if (!$produto) {
            echo json_encode(["success" => false, "message" => "Produto não encontrado."]);
            exit;
        }

        $pdo->prepare("DELETE FROM itens_pedido WHERE id_produto = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM favoritos    WHERE id_produto = ?")->execute([$id]);
        $pdo->prepare("DELETE FROM produtos     WHERE id_produto = ?")->execute([$id]);

        echo json_encode([
            "success" => true,
            "message" => "Produto \"{$produto['nome']}\" eliminado com sucesso.",
        ]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não suportado."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}