<?php
ob_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); ob_end_clean(); exit();
}
ob_end_clean();

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM configuracao_loja WHERE id = 1 LIMIT 1");
        $row  = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            $pdo->exec("INSERT INTO configuracao_loja (id, nome_loja) VALUES (1, 'LOPOS TEC')");
            $row = ['id' => 1, 'nome_loja' => 'LOPOS TEC'];
        }

        // Garante que todos os campos existem na resposta
        $defaults = [
            'nif'             => '',
            'telefone'        => '',
            'email'           => '',
            'endereco'        => '',
            'url_site'        => '',
            'api_base_url'    => '',
            'emailjs_service' => '',
            'emailjs_key'     => '',
            'iva'             => 0,
            'taxa_km'         => 0,
            'compras_vip'     => 0,
        ];
        foreach ($defaults as $campo => $padrao) {
            if (!array_key_exists($campo, $row)) {
                $row[$campo] = $padrao;
            }
        }

        echo json_encode(["success" => true, "data" => $row]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

// ── PUT ───────────────────────────────────────────────────────
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Dados inválidos."]);
        exit();
    }

    try {
        // Usa named parameters (:nome) em vez de ? para evitar HY093
        $camposPermitidos = [
            'nome_loja', 'nif', 'telefone', 'email', 'endereco',
            'url_site', 'api_base_url', 'emailjs_service', 'emailjs_key',
            'iva', 'taxa_km', 'compras_vip',
        ];

        // Verifica colunas que existem na BD
        $stmtCols  = $pdo->query("SHOW COLUMNS FROM configuracao_loja");
        $colunasBD = array_column($stmtCols->fetchAll(PDO::FETCH_ASSOC), 'Field');

        $sets   = [];
        $params = []; // named params

        foreach ($camposPermitidos as $campo) {
            if (in_array($campo, $colunasBD) && array_key_exists($campo, $data)) {
                $sets[]          = "$campo = :$campo";   // sem backticks, named param
                $params[":$campo"] = $data[$campo];
            }
        }

        if (empty($sets)) {
            echo json_encode([
                "success"    => false,
                "message"    => "Nenhum campo válido para actualizar.",
                "colunas_bd" => $colunasBD,
                "data_recebida" => array_keys($data),
            ]);
            exit();
        }

        $params[':id'] = 1;
        $sql  = "UPDATE configuracao_loja SET " . implode(", ", $sets) . " WHERE id = :id";

        // Debug — remove depois de confirmar
        // echo json_encode(["debug_sql" => $sql, "params" => $params]); exit();

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Devolve dados actualizados
        $stmt2 = $pdo->query("SELECT * FROM configuracao_loja WHERE id = 1 LIMIT 1");
        $row   = $stmt2->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success"       => true,
            "message"       => "Configurações guardadas com sucesso.",
            "data"          => $row,
            "campos_salvos" => count($sets),
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage(),
            "code"    => $e->getCode(),
        ]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Método não suportado."]);