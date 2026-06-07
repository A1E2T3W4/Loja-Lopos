import { useState, useEffect } from "react";
import { useTranslation } from "../i18n";

/* ═══════════════════════════════════════════════════════════
   ÍCONES SVG PREMIUM
═══════════════════════════════════════════════════════════ */
const IcoBox = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IcoUsers = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IcoAlert = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IcoStar = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IcoTrendUp = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IcoTrendDown = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const IcoWallet = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const IcoCheck = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IcoOrder = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const IcoCalendar = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IcoClock = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IcoArrowRight = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL - GDASHBOARD
═══════════════════════════════════════════════════════════ */
const GDashboard = ({ operador, G }) => {
  const { t } = useTranslation();
  const [hora, setHora] = useState(new Date().toLocaleTimeString("pt-AO"));
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverMetric, setHoverMetric] = useState(null);
  const [hoverChart, setHoverChart] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fmt = (v) =>
    new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(v || 0);

  const fmtCompact = (v) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
    if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
    return String(v || 0);
  };

  useEffect(() => {
    const timer = setInterval(
      () => setHora(new Date().toLocaleTimeString("pt-AO")),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const buscar = async () => {
      setLoading(true);
      try {
        const [rP, rC, rPr, rFin, rFinMov] = await Promise.all([
          fetch("https://lojalopos.infinityfreeapp.com/api/pedidos.php").then((r) => r.json()).catch(() => ({})),
          fetch("https://lojalopos.infinityfreeapp.com/api/clientes.php").then((r) => r.json()).catch(() => ({})),
          fetch("https://lojalopos.infinityfreeapp.com/api/produtos.php").then((r) => r.json()).catch(() => ({})),
          fetch("https://lojalopos.infinityfreeapp.com/api/financeiro.php").then((r) => r.json()).catch(() => ({})),
          fetch("https://lojalopos.infinityfreeapp.com/api/financeiro.php?tipo=movimentos").then((r) => r.json()).catch(() => ({})),
        ]);

        const pedidos  = rP?.data  || [];
        const clientes = rC?.data  || [];
        const produtos = rPr?.data || [];

        const ultimos7    = rFin?.ultimos7      || Array(7).fill(0);
        const receitaMes  = rFin?.receita_mes   || 0;
        // ── receita do mês anterior para calcular tendência ──
        const receitaMesAnt = rFin?.receita_mes_ant || 0;
        const vendasHoje  = rFin?.total         || 0;

        // ── tendência receita mês vs mês anterior ──
        const tendenciaReceita = receitaMesAnt > 0
          ? Math.round(((receitaMes - receitaMesAnt) / receitaMesAnt) * 100)
          : null;

        const movimentos = rFinMov?.data || [];
        const saidas = movimentos
          .filter((m) => m.tipo === "SAIDA" && m.status === "CONFIRMADO")
          .reduce((a, m) => a + parseFloat(m.valor || 0), 0);

        const pendentes      = pedidos.filter((p) => p.status === "pendente").length;
        const ultimosPedidos = [...pedidos]
          .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
          .slice(0, 5);

        const hoje      = new Date().toDateString();
        const novosHoje = clientes.filter(
          (c) => c.criado_em && new Date(c.criado_em).toDateString() === hoje,
        ).length;
        const verificados = clientes.filter((c) => c.cliente_verificado == 1).length;

        const criticos = produtos
          .filter((p) => parseInt(p.estoque ?? 0) < 5 && p.ativo == 1)
          .sort((a, b) => parseInt(a.estoque ?? 0) - parseInt(b.estoque ?? 0))
          .slice(0, 5);

        setDados({
          pendentes,
          ultimosPedidos,
          novosHoje,
          verificados,
          criticos,
          // ── card Entradas agora usa receita do mês ──
          receitaMes,
          receitaMesAnt,
          tendenciaReceita,
          saidas,
          saldo: receitaMes - saidas,
          vendasHoje,
          ultimos7,
          totalPedidos:  pedidos.length,
          totalClientes: clientes.length,
          totalCriticos: criticos.length,
        });
      } catch (e) {
        console.error("Dashboard:", e);
      }
      setLoading(false);
    };
    buscar();
    const iv = setInterval(buscar, 60000);
    return () => clearInterval(iv);
  }, []);

  const corStatus = (s) =>
    ({
      pendente:    G.warning,
      pago:        G.success,
      processando: G.accent,
      enviado:     G.accent,
      entregue:    G.success,
      cancelado:   G.danger,
    })[s?.toLowerCase()] || G.muted;

  const Badge = ({ label }) => {
    const cor = corStatus(label);
    const labelTraduzida = t(`status_${label}`) || label;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "30px", fontSize: "10px", fontWeight: "700", background: cor + "12", color: cor, border: `1px solid ${cor}25`, textTransform: "capitalize" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cor }} />
        {labelTraduzida}
      </span>
    );
  };

  const MetricCard = ({ label, value, sub, color, icon: Icon, trend, trendUp }) => (
    <div
      onMouseEnter={() => setHoverMetric(label)}
      onMouseLeave={() => setHoverMetric(null)}
      style={{
        background: G.card,
        border: `1px solid ${hoverMetric === label ? color : G.border}`,
        borderRadius: "20px",
        padding: windowWidth < 480 ? "16px" : "20px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hoverMetric === label ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hoverMetric === label ? `0 16px 32px rgba(0,0,0,0.2)` : "none",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: G.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", fontWeight: "600" }}>{label}</div>
          <div style={{ fontSize: windowWidth < 480 ? "22px" : "26px", fontWeight: "800", color: loading ? G.muted : color, letterSpacing: "-0.5px", wordBreak: "break-word" }}>
            {loading ? "—" : value}
          </div>
          <div style={{ fontSize: "11px", color: color, marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ opacity: 0.8 }}>{sub}</span>
            {trend != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: "600", color: trendUp ? G.success : G.danger, background: trendUp ? `${G.success}12` : `${G.danger}12`, padding: "2px 6px", borderRadius: "16px" }}>
                {trendUp ? <IcoTrendUp size={9} /> : <IcoTrendDown size={9} />}
                {trend}
              </span>
            )}
          </div>
        </div>
        <div style={{ width: windowWidth < 480 ? "40px" : "48px", height: windowWidth < 480 ? "40px" : "48px", borderRadius: "16px", background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", transform: hoverMetric === label ? "scale(1.05) rotate(3deg)" : "scale(1)", flexShrink: 0 }}>
          <Icon size={windowWidth < 480 ? 18 : 22} color={color} />
        </div>
      </div>
    </div>
  );

  const GraficoVendas = () => {
    const W = 500, H = 110;
    const PAD = { top: 16, right: 14, bottom: 28, left: 45 };
    const vals   = dados?.ultimos7 || Array(7).fill(0);
    const max    = Math.max(...vals, 1);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const step   = innerW / (vals.length - 1);
    const DIAS   = [t("dom"), t("seg"), t("ter"), t("qua"), t("qui"), t("sex"), t("sab")];
    const labels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return DIAS[d.getDay()];
    });
    const datas = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
    const pts = vals.map((v, i) => ({
      x: PAD.left + i * step,
      y: PAD.top + innerH - Math.round((v / max) * innerH),
      v,
    }));
    const pathD = pts.map((p, i) => {
      if (i === 0) return `M${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `C${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
    }).join(" ");
    const areaD = pathD + ` L${pts[pts.length - 1].x} ${PAD.top + innerH} L${pts[0].x} ${PAD.top + innerH}Z`;
    const guides = [0, 0.5, 1].map((r) => ({
      y:   PAD.top + innerH - Math.round(r * innerH),
      val: Math.round(r * max),
    }));

    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={G.accent} stopOpacity="0.15" />
            <stop offset="100%" stopColor={G.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {guides.map((g, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={g.y} x2={W - PAD.right} y2={g.y} stroke={G.border} strokeWidth="1" strokeDasharray="3 3" />
            <text x={PAD.left - 5} y={g.y + 4} textAnchor="end" fontSize="8" fill={G.muted}>{fmtCompact(g.val)}</text>
          </g>
        ))}
        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke={G.accent} strokeWidth="2" strokeLinecap="round" />
        {pts.map((p, i) => {
          const isHoje  = i === 6;
          const isHover = hoverChart === i;
          return (
            <g key={i}>
              <text x={p.x} y={H - 3} textAnchor="middle" fontSize="8" fill={isHoje ? G.accent : G.muted} fontWeight={isHoje ? "600" : "400"}>
                {labels[i]}
              </text>
              <circle cx={p.x} cy={p.y} r={isHover ? 5 : isHoje ? 4 : 3} fill={G.accent} stroke={G.card} strokeWidth="2"
                style={{ cursor: "pointer", transition: "r 0.2s" }}
                onMouseEnter={() => setHoverChart(i)}
                onMouseLeave={() => setHoverChart(null)}
              />
              {isHover && (
                <g>
                  <rect x={p.x - 40} y={p.y - 32} width={80} height={26} rx={6} fill={G.card} stroke={`${G.accent}30`} strokeWidth="1" />
                  <text x={p.x} y={p.y - 20} textAnchor="middle" fontSize="7" fill={G.muted}>{datas[i]}</text>
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fontWeight="700" fill={G.accent}>{fmt(p.v)}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const getGridCols    = (defaultCols) => { if (windowWidth < 640) return 2; if (windowWidth < 1024) return 2; return defaultCols; };
  const mainGridCols   = getGridCols(4);
  const financeGridCols = getGridCols(3);
  const listGridCols   = windowWidth < 768 ? 1 : 2;
  const footerGridCols = windowWidth < 768 ? 1 : 2;

  // ── label de tendência da receita mensal ──
  const tendenciaLabel = dados?.tendenciaReceita != null
    ? `${dados.tendenciaReceita >= 0 ? "+" : ""}${dados.tendenciaReceita}% vs mês ant.`
    : null;
  const tendenciaUp = (dados?.tendenciaReceita ?? 0) >= 0;

  // ── mês actual formatado ──
  const mesAtual = new Date().toLocaleDateString("pt-AO", { month: "long" });

  return (
    <div style={{ padding: windowWidth < 640 ? "16px" : "24px", maxWidth: "1400px", margin: "0 auto", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: windowWidth < 480 ? "40px" : "48px", height: windowWidth < 480 ? "40px" : "48px", borderRadius: "16px", background: `linear-gradient(135deg, ${G.accent}25, ${G.accent}08)`, border: `1px solid ${G.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcoBox size={windowWidth < 480 ? 20 : 24} color={G.accent} />
              </div>
              <div>
                <h1 style={{ fontSize: windowWidth < 480 ? "20px" : "24px", fontWeight: "800", color: G.text, margin: 0, letterSpacing: "-0.5px" }}>{t("dashboard")}</h1>
                <p style={{ fontSize: "12px", color: G.muted, margin: "4px 0 0" }}>{t("visao_geral")}</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: windowWidth < 480 ? "52px" : "60px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: G.cardAlt, padding: "5px 12px", borderRadius: "30px" }}>
                <IcoCalendar size={12} color={G.accent} />
                <span style={{ fontSize: "12px", color: G.muted }}>
                  {new Date().toLocaleDateString("pt-AO", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: G.accentBg, padding: "5px 12px", borderRadius: "30px", border: `1px solid ${G.accent}20` }}>
                <IcoClock size={12} color={G.accent} />
                <span style={{ fontSize: "12px", color: G.accent, fontWeight: "500" }}>{hora}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {!loading && dados?.totalCriticos > 0 && (
              <div style={{ background: `${G.danger}12`, border: `1px solid ${G.danger}30`, borderRadius: "30px", padding: "8px 16px", fontSize: "12px", color: G.danger, display: "flex", alignItems: "center", gap: "8px" }}>
                <IcoAlert size={12} color={G.danger} /> {dados.totalCriticos} {t("alertas")}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "40px", padding: "4px 16px 4px 8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${G.accent}, ${G.rose})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: "600" }}>
                {operador?.nome?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: "13px", color: G.text }}>
                {t("ola")}, <strong>{operador?.nome?.split(" ")[0]}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${mainGridCols}, 1fr)`, gap: windowWidth < 640 ? "12px" : "16px", marginBottom: "24px" }}>
        <MetricCard
          label={t("pedidos_label")}
          value={dados?.totalPedidos ?? 0}
          sub={`${dados?.pendentes ?? 0} ${t("pendentes")}`}
          color={G.warning}
          icon={IcoBox}
          trend="+12%"
          trendUp
        />
        <MetricCard
          label={t("clientes_label")}
          value={dados?.totalClientes ?? 0}
          sub={`+${dados?.novosHoje ?? 0} ${t("hoje")}`}
          color={G.accent}
          icon={IcoUsers}
          trend="+8%"
          trendUp
        />
        <MetricCard
          label={t("stock_critico")}
          value={dados?.totalCriticos ?? 0}
          sub={dados?.totalCriticos > 0 ? t("abaixo_minimo") : t("tudo_ok")}
          color={dados?.totalCriticos > 0 ? G.danger : G.success}
          icon={IcoAlert}
          trend={dados?.totalCriticos > 0 ? "-5%" : "+2%"}
          trendUp={dados?.totalCriticos <= 0}
        />
        <MetricCard
          label={t("verificados")}
          value={dados?.verificados ?? 0}
          sub={`${Math.round(((dados?.verificados || 0) / (dados?.totalClientes || 1)) * 100)}% ${t("pct_total")}`}
          color={G.accent}
          icon={IcoStar}
          trend="+15%"
          trendUp
        />
      </div>

      {/* FINANCE METRICS
          ── Card 1: Receita do Mês (antes eram as Entradas genéricas)
          ── Card 2: Saídas confirmadas
          ── Card 3: Saldo (Receita Mês - Saídas)
      */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${financeGridCols}, 1fr)`, gap: "16px", marginBottom: "24px" }}>
        <MetricCard
          label={`${t("entradas_label")} — ${mesAtual}`}
          value={fmt(dados?.receitaMes)}
          sub={t("receita_mes_label") || "Receita do mês"}
          color={G.success}
          icon={IcoTrendUp}
          trend={tendenciaLabel}
          trendUp={tendenciaUp}
        />
        <MetricCard
          label={t("saidas_label")}
          value={fmt(dados?.saidas)}
          sub={t("confirmadas")}
          color={G.danger}
          icon={IcoTrendDown}
          trend="+5%"
          trendUp={false}
        />
        <MetricCard
          label={t("saldo")}
          value={fmt(dados?.saldo)}
          sub={t("disponivel")}
          color={(dados?.saldo ?? 0) >= 0 ? G.accent : G.danger}
          icon={IcoWallet}
          trend={(dados?.saldo ?? 0) >= 0 ? "+3%" : "-2%"}
          trendUp={(dados?.saldo ?? 0) >= 0}
        />
      </div>

      {/* CHART */}
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px", marginBottom: "24px", overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: G.text }}>{t("vendas_7dias")}</div>
            <div style={{ fontSize: "11px", color: G.muted, marginTop: "2px" }}>{t("entradas_confirmadas_dia")}</div>
          </div>
          {!loading && (
            <div style={{ textAlign: "right", background: G.accentBg, padding: "8px 14px", borderRadius: "12px" }}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: G.accent }}>{fmt(dados?.vendasHoje)}</div>
              <div style={{ fontSize: "9px", color: G.muted }}>{t("hoje")}</div>
            </div>
          )}
        </div>
        {loading ? (
          <div style={{ height: "140px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", border: `3px solid ${G.border}`, borderTop: `3px solid ${G.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: G.muted, fontSize: "12px" }}>{t("a_carregar")}</span>
          </div>
        ) : (
          <div style={{ minWidth: "450px" }}><GraficoVendas /></div>
        )}
      </div>

      {/* LISTS */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${listGridCols}, 1fr)`, gap: "20px", marginBottom: "24px" }}>

        {/* Últimos pedidos */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: G.accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcoOrder size={14} color={G.accent} />
              </div>
              <span style={{ fontWeight: "600", fontSize: "14px", color: G.text }}>{t("ultimos_pedidos")}</span>
            </div>
            <span style={{ fontSize: "11px", color: G.accent, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
              {t("ver_todos")} <IcoArrowRight size={10} />
            </span>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px", color: G.muted }}>{t("a_carregar")}</div>
          ) : !dados?.ultimosPedidos?.length ? (
            <div style={{ textAlign: "center", padding: "20px", color: G.muted }}>{t("sem_pedidos")}</div>
          ) : (
            dados.ultimosPedidos.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i !== dados.ultimosPedidos.length - 1 ? `1px solid ${G.border}` : "none", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: G.text }}>{p.nome || t("cliente")}</div>
                  <div style={{ fontSize: "10px", color: G.muted, fontFamily: "monospace" }}>#{p.id_pedido}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: G.accent }}>{fmt(p.total)}</div>
                  <Badge label={p.status} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stock crítico */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: dados?.totalCriticos > 0 ? G.danger : G.success, boxShadow: dados?.totalCriticos > 0 ? `0 0 6px ${G.danger}` : `0 0 6px ${G.success}` }} />
            <span style={{ fontWeight: "600", fontSize: "14px", color: G.text }}>{t("stock_critico_label")}</span>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px", color: G.muted }}>{t("a_carregar")}</div>
          ) : !dados?.criticos?.length ? (
            <div style={{ textAlign: "center", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap", color: G.success }}>
              <IcoCheck size={16} color={G.success} /> {t("stock_suficiente")}
            </div>
          ) : (
            dados.criticos.map((p, i) => {
              const qtd     = parseInt(p.estoque ?? 0);
              const percent = Math.min(100, Math.round((qtd / 5) * 100));
              return (
                <div key={i} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: G.text }}>{p.nome}</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: qtd === 0 ? G.danger : G.warning }}>{qtd} {t("unidades")}</span>
                  </div>
                  <div style={{ background: G.cardAlt, borderRadius: "6px", height: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${percent}%`, height: "100%", borderRadius: "6px", background: qtd === 0 ? G.danger : G.warning, transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${footerGridCols}, 1fr)`, gap: "20px" }}>

        {/* Resumo mensal */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: `${G.success}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IcoWallet size={14} color={G.success} />
            </div>
            <span style={{ fontWeight: "600", fontSize: "14px", color: G.text }}>{t("receita_mensal")}</span>
          </div>
          <div style={{ fontSize: windowWidth < 480 ? "24px" : "28px", fontWeight: "700", color: G.success, marginBottom: "4px", wordBreak: "break-word" }}>
            {fmt(dados?.receitaMes)}
          </div>
          <div style={{ fontSize: "11px", color: G.muted, marginBottom: "16px" }}>
            {new Date().toLocaleDateString("pt-AO", { month: "long", year: "numeric" })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", paddingTop: "12px", borderTop: `1px solid ${G.border}`, flexWrap: "wrap", gap: "8px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: G.accent }}>{dados?.totalPedidos ?? 0}</div>
              <div style={{ fontSize: "10px", color: G.muted }}>{t("pedidos_label")}</div>
            </div>
            <div style={{ width: "1px", background: G.border }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "700", color: G.warning }}>{dados?.pendentes ?? 0}</div>
              <div style={{ fontSize: "10px", color: G.muted }}>{t("pendentes")}</div>
            </div>
          </div>
        </div>

        {/* Clientes verificados */}
        <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: G.accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IcoStar size={14} color={G.accent} />
            </div>
            <span style={{ fontWeight: "600", fontSize: "14px", color: G.text }}>{t("clientes_verificados")}</span>
          </div>
          {!loading && (() => {
            const total = dados?.totalClientes || 0;
            const verif = dados?.verificados   || 0;
            const pct   = total > 0 ? (verif / total) * 100 : 0;
            const radius       = 38;
            const circumference = 2 * Math.PI * radius;
            const offset        = circumference - (pct / 100) * circumference;
            return (
              <div style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 16px" }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="none" stroke={G.cardAlt} strokeWidth="8" />
                    <circle cx="50" cy="50" r={radius} fill="none" stroke={G.accent} strokeWidth="8"
                      strokeDasharray={circumference} strokeDashoffset={offset}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: G.accent }}>{Math.round(pct)}%</span>
                    <span style={{ fontSize: "8px", color: G.muted }}>{t("pct_total")}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: G.accent }}>{verif}</div>
                    <div style={{ fontSize: "10px", color: G.muted }}>{t("verificados")}</div>
                  </div>
                  <div style={{ width: "1px", background: G.border }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: G.text }}>{total}</div>
                    <div style={{ fontSize: "10px", color: G.muted }}>{t("total_label")}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes glowSlide { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
};

export default GDashboard;