<?php
// ═══════════════════════════════════════════════════════
//  LOPOS — Configuração Central (InfinityFree)
//  Ficheiro: /htdocs/api/config.php
//  TODOS os outros PHP fazem: require_once 'config.php';
// ═══════════════════════════════════════════════════════

// ── CORS — GitHub Pages + InfinityFree ──────────────────
$allowed_origins = [
    "https://lojalopos.infinityfreeapp.com",
    "http://lojalopos.infinityfreeapp.com",
];

// Detecta o URL do GitHub Pages automaticamente
// Se o teu GitHub Pages for outro URL, adiciona aqui:
// ex: "https://seuuser.github.io"
// ex: "https://seuuser.github.io/lopos"

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Permite qualquer origem durante os primeiros testes
    // Após confirmar que funciona, substitui por um URL específico
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Responde imediatamente ao preflight OPTIONS (evita erro CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── Credenciais MySQL (InfinityFree) ────────────────────
$host     = "sql211.infinityfree.com";
$db       = "if0_42118477_loja";
$user     = "if0_42118477";
$password = "BcWw8YXQoYSm3q";  // senha do teu painel

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erro de ligação à base de dados.",
        "debug"   => $e->getMessage() // Remove esta linha em produção final
    ]);
    exit();
}