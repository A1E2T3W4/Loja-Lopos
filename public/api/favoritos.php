<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }

require_once "config.php";

$method     = $_SERVER["REQUEST_METHOD"];
$id_cliente = isset($_GET["id_cliente"]) ? intval($_GET["id_cliente"]) : 0;

try {

    /* GET — lista favoritos do cliente com dados do produto */
    if ($method === "GET") {
        if (!$id_cliente) {
            echo json_encode(["success" => false, "message" => "id_cliente obrigatório."]);
            exit;
        }
        $q = $pdo->prepare("
            SELECT
                f.id_favorito, f.id_produto,
                p.nome, p.preco, p.preco_antigo,
                p.bonus_percentual, p.bonus_saldo,
                p.imagem_url, p.img1, p.estoque, p.categoria, p.ativo
            FROM favoritos f
            INNER JOIN produtos p ON p.id_produto = f.id_produto
            WHERE f.id_cliente = ?
            ORDER BY f.id_favorito DESC
        ");
        $q->execute([$id_cliente]);
        $rows = $q->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$p) {
            $p["imagem_url"] = $p["imagem_url"] ?: ($p["img1"] ?? "");
            unset($p["img1"]);
            $bp = floatval($p["bonus_percentual"] ?? 0);
            $p["preco_com_desconto"] = $bp > 0 ? round($p["preco"] * (1 - $bp / 100), 2) : null;
            $p["tem_oferta"] = $bp > 0;
        }
        unset($p);

        echo json_encode(["success" => true, "data" => $rows]);
        exit;
    }

    /* POST — adicionar favorito */
    if ($method === "POST") {
        $d          = json_decode(file_get_contents("php://input"), true);
        $id_cliente = intval($d["id_cliente"] ?? 0);
        $id_produto = intval($d["id_produto"] ?? 0);

        if (!$id_cliente || !$id_produto) {
            echo json_encode(["success" => false, "message" => "Dados incompletos."]);
            exit;
        }

        /* Evita duplicado */
        $check = $pdo->prepare("SELECT id_favorito FROM favoritos WHERE id_cliente = ? AND id_produto = ?");
        $check->execute([$id_cliente, $id_produto]);
        if ($check->fetch()) {
            echo json_encode(["success" => true, "message" => "Já está nos favoritos.", "ja_existe" => true]);
            exit;
        }

        $pdo->prepare("INSERT INTO favoritos (id_cliente, id_produto) VALUES (?, ?)")
            ->execute([$id_cliente, $id_produto]);

        echo json_encode(["success" => true, "message" => "Adicionado aos favoritos."]);
        exit;
    }

    /* DELETE — remover favorito */
    if ($method === "DELETE") {
        $id_cliente = intval($_GET["id_cliente"] ?? 0);
        $id_produto = intval($_GET["id_produto"] ?? 0);

        if (!$id_cliente || !$id_produto) {
            $body       = json_decode(file_get_contents("php://input"), true);
            $id_cliente = intval($body["id_cliente"] ?? $id_cliente);
            $id_produto = intval($body["id_produto"] ?? $id_produto);
        }

        $pdo->prepare("DELETE FROM favoritos WHERE id_cliente = ? AND id_produto = ?")
            ->execute([$id_cliente, $id_produto]);

        echo json_encode(["success" => true, "message" => "Removido dos favoritos."]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não suportado."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}