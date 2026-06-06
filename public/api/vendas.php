<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

date_default_timezone_set('Africa/Luanda');

require_once "config.php";

try {
    $hoje_data = date("Y-m-d");

    $q = $pdo->prepare("SELECT COALESCE(SUM(valor),0) AS total FROM financeiro
                        WHERE tipo='ENTRADA' AND status='CONFIRMADO' 
                        AND DATE(data_movimento) = ?");
    $q->execute([$hoje_data]);
    $hoje = $q->fetchColumn();

    $ontem_data = date("Y-m-d", strtotime("-1 day"));
    $q = $pdo->prepare("SELECT COALESCE(SUM(valor),0) AS total FROM financeiro
                        WHERE tipo='ENTRADA' AND status='CONFIRMADO'
                        AND DATE(data_movimento) = ?");
    $q->execute([$ontem_data]);
    $ontem = $q->fetchColumn();

    $q = $pdo->query("SELECT DATE(data_movimento) AS dia, COALESCE(SUM(valor),0) AS total
                      FROM financeiro
                      WHERE tipo='ENTRADA' AND status='CONFIRMADO'
                      AND DATE(data_movimento) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
                      GROUP BY DATE(data_movimento) ORDER BY dia ASC");
    $rows = $q->fetchAll(PDO::FETCH_ASSOC);

    $ultimos7 = [];
    for ($i = 6; $i >= 0; $i--) {
        $data  = date("Y-m-d", strtotime("-$i days"));
        $valor = 0;
        foreach ($rows as $r) {
            if (substr($r['dia'], 0, 10) === $data) {
                $valor = (float)$r['total'];
                break;
            }
        }
        $ultimos7[] = $valor;
    }

    $q = $pdo->query("SELECT COALESCE(SUM(valor),0) FROM financeiro
                      WHERE tipo='ENTRADA' AND status='CONFIRMADO'
                      AND MONTH(data_movimento)=MONTH(CURDATE())
                      AND YEAR(data_movimento)=YEAR(CURDATE())");
    $receitaMes = $q->fetchColumn();

    $q = $pdo->query("SELECT COALESCE(SUM(valor),0) FROM financeiro
                      WHERE tipo='ENTRADA' AND status='CONFIRMADO'
                      AND MONTH(data_movimento)=MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                      AND YEAR(data_movimento)=YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))");
    $receitaMesAnt = $q->fetchColumn();

    echo json_encode([
        "success"         => true,
        "total"           => (float)$hoje,
        "total_ontem"     => (float)$ontem,
        "ultimos7"        => $ultimos7,
        "receita_mes"     => (float)$receitaMes,
        "receita_mes_ant" => (float)$receitaMesAnt,
        "debug_hoje"      => $hoje_data,
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success"         => false,
        "message"         => $e->getMessage(),
        "total"           => 0,
        "total_ontem"     => 0,
        "ultimos7"        => array_fill(0, 7, 0),
        "receita_mes"     => 0,
        "receita_mes_ant" => 0,
    ]);
}
?>