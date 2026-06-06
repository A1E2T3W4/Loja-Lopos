import { useState, useEffect } from "react";
import { useTranslation } from "../i18n";



const ESTADOS = [
  "pendente",
  "pago",
  "reservado",
  "enviado",
  "entregue",
  "cancelado",
];

/* ── ÍCONES SVG PREMIUM ── */
const IcoSearch = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IcoRefresh = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
  </svg>
);

const IcoClose = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IcoPackage = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IcoUser = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IcoStar = ({ size = 14, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="1.8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IcoMapPin = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IcoPhone = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IcoCheck = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IcoAlert = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IcoTrendingUp = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IcoEye = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IcoFilter = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
  </svg>
);

const IcoGrid = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const IcoList = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   GPedidos - COM i18n COMPLETO
═══════════════════════════════════════════════════════════ */
const GPedidos = ({ G }) => {
  const { t } = useTranslation();
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [detalhe, setDetalhe] = useState(null);
  const [novoEstado, setNovoEstado] = useState("");
  const [atualizando, setAtualizando] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [hoverMetric, setHoverMetric] = useState(null);
  const [hoverRow, setHoverRow] = useState(null);

  const fmt = (v) =>
    new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(v || 0);

  const carregarPedidos = () => {
    setLoading(true);
    fetch("http://localhost/api/pedidos.php")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPedidos(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  const abrirDetalhe = (p) => {
    setDetalhe(p);
    setNovoEstado(p.status || "pendente");
    setMsgSucesso("");
  };

  const atualizarEstado = async () => {
    if (!detalhe || !novoEstado) return;
    setAtualizando(true);
    setMsgSucesso("");
    try {
      const res = await fetch("http://localhost/api/pedidos.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pedido: detalhe.id_pedido,
          status: novoEstado,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPedidos((prev) =>
          prev.map((p) =>
            p.id_pedido === detalhe.id_pedido
              ? { ...p, status: novoEstado }
              : p,
          ),
        );
        setDetalhe((prev) => ({ ...prev, status: novoEstado }));
        setMsgSucesso("✅ " + t("estado_actualizado"));
        setTimeout(() => setMsgSucesso(""), 3000);
      } else {
        setMsgSucesso("❌ " + (data.message || t("erro_actualizar")));
      }
    } catch {
      setMsgSucesso("❌ " + t("erro_ligacao"));
    }
    setAtualizando(false);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pendente: { color: G.warning, bg: `${G.warning}12`, icon: <IcoAlert size={12} />, label: t("status_pendente") },
      pago: { color: G.accent, bg: `${G.accent}12`, icon: <IcoCheck size={12} />, label: t("status_pago") },
      reservado: { color: "#a78bfa", bg: "#a78bfa12", icon: <IcoPackage size={12} />, label: t("status_reservado") },
      enviado: { color: "#4da6ff", bg: "#4da6ff12", icon: <IcoPackage size={12} />, label: t("status_enviado") },
      entregue: { color: G.success, bg: `${G.success}12`, icon: <IcoCheck size={12} />, label: t("status_entregue") },
      cancelado: { color: G.danger, bg: `${G.danger}12`, icon: <IcoClose size={12} />, label: t("status_cancelado") },
    };
    return configs[status?.toLowerCase()] || configs.pendente;
  };

  const filtrados = pedidos.filter((p) => {
    const matchF = filtro === "todos" || p.status?.toLowerCase() === filtro;
    const matchB =
      !busca ||
      p.id_pedido?.toString().includes(busca) ||
      p.nome?.toLowerCase().includes(busca.toLowerCase());
    return matchF && matchB;
  });

  const contagem = (s) =>
    pedidos.filter((p) => p.status?.toLowerCase() === s).length;

  const metrics = [
    { label: t("total_pedidos"), value: pedidos.length, color: G.text, filter: "todos", icon: <IcoPackage size={22} />, trend: "+12%", trendUp: true },
    { label: t("aguardando"), value: contagem("pendente"), color: G.warning, filter: "pendente", icon: <IcoAlert size={18} />, trend: "+3%", trendUp: true },
    { label: t("confirmados"), value: contagem("pago"), color: G.accent, filter: "pago", icon: <IcoCheck size={18} />, trend: "+8%", trendUp: true },
    { label: t("finalizados"), value: contagem("entregue"), color: G.success, filter: "entregue", icon: <IcoTrendingUp size={18} />, trend: "+15%", trendUp: true },
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1440px", margin: "0 auto", minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -8, left: -12, width: "60px", height: "60px", background: `radial-gradient(circle, ${G.accent}20, transparent)`, borderRadius: "50%", filter: "blur(20px)", zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "32px", fontWeight: "800", color: G.text, letterSpacing: "-0.5px" }}>
                {t("gestao_pedidos")}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px", fontSize: "13px", color: G.muted }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <IcoPackage size={12} color={G.muted} />
                  {pedidos.length} {t("total_pedidos")}
                </span>
                {filtro !== "todos" && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "20px", background: getStatusConfig(filtro).bg, color: getStatusConfig(filtro).color, fontSize: "11px" }}>
                    <IcoFilter size={10} />
                    {t("filtrar_por")} {filtro}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: G.muted, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcoSearch size={16} />
              </div>
              <input type="text" placeholder={t("buscar_pedido")} value={busca} onChange={(e) => setBusca(e.target.value)}
                style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "14px", padding: "12px 18px 12px 46px", color: G.text, fontSize: "13px", width: "280px", outline: "none", fontFamily: "inherit", transition: "all 0.2s ease", boxSizing: "border-box" }}
                onFocus={(e) => { e.target.style.borderColor = G.accent; e.target.style.boxShadow = `0 0 0 4px ${G.accent}15`; }}
                onBlur={(e) => { e.target.style.borderColor = G.border; e.target.style.boxShadow = "none"; }} />
            </div>
            <button onClick={carregarPedidos} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "14px", padding: "12px 16px", color: G.muted, cursor: "pointer", fontSize: "13px", fontFamily: "inherit", transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "8px" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.color = G.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; e.currentTarget.style.transform = "translateY(0)"; }}>
              <IcoRefresh size={14} /><span>{t("actualizar")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "36px" }}>
        {metrics.map((m, idx) => {
          const isActive = filtro === m.filter;
          const isHover = hoverMetric === idx;
          return (
            <div key={m.label} onClick={() => setFiltro(m.filter)} onMouseEnter={() => setHoverMetric(idx)} onMouseLeave={() => setHoverMetric(null)}
              style={{ background: G.card, border: `1px solid ${isActive ? m.color : G.border}`, borderRadius: "24px", padding: "20px", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", transform: isHover ? "translateY(-6px)" : "translateY(0)", boxShadow: isHover ? `0 20px 40px rgba(0,0,0,0.2)` : "none", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${m.color}, ${m.color}80)` }} />
              {isHover && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${m.color}, transparent)`, animation: "slideGlow 1.5s ease-in-out infinite" }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: G.muted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "1.5px" }}>{m.label}</div>
                <div style={{ width: "44px", height: "44px", borderRadius: "16px", background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: m.color, transition: "transform 0.3s", transform: isHover ? "scale(1.1)" : "scale(1)" }}>{m.icon}</div>
              </div>
              <div style={{ fontSize: "36px", fontWeight: "800", color: loading ? G.muted : m.color, marginBottom: "8px" }}>{loading ? "—" : m.value}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: G.muted }}>
                <span style={{ color: m.trendUp ? G.success : G.danger, fontWeight: "600" }}>{m.trend}</span>
                <span>{t("vs_mes_anterior")}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTROS RÁPIDOS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center", padding: "4px 0" }}>
        <span style={{ fontSize: "12px", color: G.muted, fontWeight: "500", marginRight: "4px" }}>{t("filtrar_por")}:</span>
        <button onClick={() => setFiltro("todos")} style={{ padding: "8px 20px", borderRadius: "40px", border: filtro === "todos" ? "none" : `1px solid ${G.border}`, background: filtro === "todos" ? G.accent : "transparent", color: filtro === "todos" ? "#fff" : G.muted, cursor: "pointer", fontSize: "12px", fontWeight: "600", fontFamily: "inherit", transition: "all 0.2s", boxShadow: filtro === "todos" ? `0 4px 12px ${G.accent}40` : "none" }}>{t("todos_pedidos")}</button>
        {ESTADOS.map((s) => {
          const cfg = getStatusConfig(s);
          const isActive = filtro === s;
          return (
            <button key={s} onClick={() => setFiltro(s)} style={{ padding: "8px 20px", borderRadius: "40px", border: isActive ? "none" : `1px solid ${G.border}`, background: isActive ? cfg.color : "transparent", color: isActive ? "#fff" : G.muted, cursor: "pointer", fontSize: "12px", fontWeight: isActive ? "600" : "500", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", boxShadow: isActive ? `0 4px 12px ${cfg.color}40` : "none" }}>
              {cfg.icon} {cfg.label} ({contagem(s)})
            </button>
          );
        })}
      </div>

      {/* MAIN CARD */}
      <div style={{ background: G.card, borderRadius: "28px", border: `1px solid ${G.border}`, overflow: "hidden", boxShadow: `0 8px 32px rgba(0,0,0,0.08)` }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${G.border}`, background: G.cardAlt, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <IcoPackage size={18} color={G.accent} />
            <div><span style={{ fontWeight: "700", fontSize: "15px", color: G.text }}>{t("lista_pedidos")}</span><span style={{ marginLeft: "10px", fontSize: "12px", color: G.muted }}>{filtrados.length} {t("resultados")}</span></div>
          </div>
          <div style={{ display: "flex", gap: "6px", background: G.card, borderRadius: "14px", padding: "4px" }}>
            <button onClick={() => setViewMode("table")} style={{ padding: "8px 16px", borderRadius: "12px", border: "none", background: viewMode === "table" ? G.accent : "transparent", color: viewMode === "table" ? "#fff" : G.muted, cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}><IcoList size={14} />{t("lista")}</button>
            <button onClick={() => setViewMode("grid")} style={{ padding: "8px 16px", borderRadius: "12px", border: "none", background: viewMode === "grid" ? G.accent : "transparent", color: viewMode === "grid" ? "#fff" : G.muted, cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}><IcoGrid size={14} />{t("cards")}</button>
          </div>
        </div>

        <div style={{ maxHeight: "560px", overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px", color: G.muted }}><div style={{ width: "48px", height: "48px", border: `3px solid ${G.border}`, borderTop: `3px solid ${G.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} /><span style={{ fontSize: "14px" }}>{t("a_carregar")}</span></div>
          ) : filtrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px", color: G.muted }}><IcoPackage size={52} color={G.muted} style={{ marginBottom: "16px", opacity: 0.4 }} /><div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: G.text }}>{t("sem_pedidos_encontrados")}</div><div style={{ fontSize: "13px" }}>{t("tenta_outro_filtro")}</div></div>
          ) : viewMode === "table" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, background: G.card, zIndex: 1 }}>
                <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                  {[t("pedido"), t("cliente"), t("total_label"), t("data_envio"), t("hora"), t("status_actual"), ""].map((h) => (<th key={h} style={{ textAlign: "left", padding: "16px 20px", color: G.muted, fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" }}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const cfg = getStatusConfig(p.status);
                  const isHover = hoverRow === p.id_pedido;
                  return (
                    <tr key={p.id_pedido} onClick={() => abrirDetalhe(p)} onMouseEnter={() => setHoverRow(p.id_pedido)} onMouseLeave={() => setHoverRow(null)} style={{ borderBottom: `1px solid ${G.border}`, cursor: "pointer", transition: "all 0.2s", background: isHover ? G.cardAlt : "transparent" }}>
                      <td style={{ padding: "16px 20px", fontWeight: "700", color: G.accent, fontFamily: "monospace", fontSize: "13px" }}>#{p.id_pedido}</td>
                      <td style={{ padding: "16px 20px" }}><div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "34px", height: "34px", borderRadius: "12px", background: `${G.accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}><IcoUser size={14} color={G.accent} /></div><div><div style={{ fontSize: "14px", fontWeight: "600", color: G.text }}>{p.nome || "—"}</div>{p.cliente_verificado && <IcoStar size={10} filled />}</div></div></td>
                      <td style={{ padding: "16px 20px", fontWeight: "700", color: cfg.color, fontSize: "14px" }}>{fmt(p.total)}</td>
                      <td style={{ padding: "16px 20px", color: G.muted, fontSize: "12px" }}>{formatDate(p.criado_em)}</td>
                      <td style={{ padding: "16px 20px", color: G.muted, fontSize: "12px", fontFamily: "monospace" }}>{formatTime(p.criado_em)}</td>
                      <td style={{ padding: "16px 20px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "30px", background: cfg.bg, color: cfg.color, fontSize: "11px", fontWeight: "700" }}>{cfg.icon} {cfg.label}</span></td>
                      <td style={{ padding: "16px 20px" }}><div style={{ width: "32px", height: "32px", borderRadius: "10px", background: isHover ? `${G.accent}15` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}><IcoEye size={14} color={G.muted} /></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px", padding: "24px" }}>
              {filtrados.map((p) => {
                const cfg = getStatusConfig(p.status);
                return (
                  <div key={p.id_pedido} onClick={() => abrirDetalhe(p)} style={{ background: G.cardAlt, borderRadius: "24px", padding: "20px", border: `1px solid ${G.border}`, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.2)`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = G.border; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}><div><div style={{ fontSize: "11px", color: G.muted, marginBottom: "4px", letterSpacing: "1px" }}>{t("pedido")}</div><div style={{ fontSize: "18px", fontWeight: "700", color: G.accent, fontFamily: "monospace" }}>#{p.id_pedido}</div></div><span style={{ padding: "4px 12px", borderRadius: "30px", background: cfg.bg, color: cfg.color, fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>{cfg.icon} {cfg.label}</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", padding: "12px", background: G.card, borderRadius: "16px" }}><div style={{ width: "44px", height: "44px", borderRadius: "14px", background: `${G.accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}><IcoUser size={18} color={G.accent} /></div><div style={{ flex: 1 }}><div style={{ fontSize: "15px", fontWeight: "700", color: G.text }}>{p.nome || "—"}</div><div style={{ fontSize: "11px", color: G.muted, display: "flex", alignItems: "center", gap: "6px" }}><IcoPhone size={10} /> {p.telefone || t("sem_telefone")}</div></div>{p.cliente_verificado && <IcoStar size={14} filled />}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: `1px solid ${G.border}` }}>
                      <div><div style={{ fontSize: "10px", color: G.muted, textTransform: "uppercase", letterSpacing: "1px" }}>{t("total_label")}</div><div style={{ fontSize: "20px", fontWeight: "800", color: cfg.color }}>{fmt(p.total)}</div></div>
                      <div style={{ textAlign: "right" }}><div style={{ fontSize: "10px", color: G.muted, textTransform: "uppercase", letterSpacing: "1px" }}>{t("data_envio")}</div><div style={{ fontSize: "12px", fontWeight: "500", color: G.text }}>{formatDate(p.criado_em)}</div><div style={{ fontSize: "10px", color: G.muted, fontFamily: "monospace" }}>{formatTime(p.criado_em)}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && filtrados.length > 0 && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${G.border}`, background: G.cardAlt, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ color: G.muted }}>{t("mostrando")} <strong style={{ color: G.accent }}>{filtrados.length}</strong> {t("de")} <strong>{pedidos.length}</strong> {t("pedidos_label")}</span>
            <span style={{ color: G.muted }}>{t("total_label")}: <strong style={{ color: G.accent, fontSize: "14px" }}>{fmt(filtrados.reduce((a, p) => a + parseFloat(p.total || 0), 0))}</strong></span>
          </div>
        )}
      </div>

      {/* MODAL PREMIUM */}
      {detalhe && (
        <div onClick={() => setDetalhe(null)} style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(16px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", animation: "fadeIn 0.2s ease" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: G.card, borderRadius: "36px", maxWidth: "580px", width: "100%", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)", boxShadow: `0 32px 64px rgba(0,0,0,0.5)`, border: `1px solid ${G.border2}` }}>
            <div style={{ padding: "28px 32px 24px", borderBottom: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: `linear-gradient(135deg, ${G.cardAlt}, ${G.card})`, borderRadius: "36px 36px 0 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}><div style={{ width: "56px", height: "56px", borderRadius: "20px", background: `${G.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><IcoPackage size={26} color={G.accent} /></div><div><div style={{ fontSize: "22px", fontWeight: "800", color: G.accent, fontFamily: "monospace" }}>#{detalhe.id_pedido}</div><div style={{ fontSize: "13px", color: G.muted }}>{t("detalhes_pedido")}</div></div></div>
              <button onClick={() => setDetalhe(null)} style={{ width: "40px", height: "40px", borderRadius: "14px", background: G.cardAlt, border: `1px solid ${G.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${G.danger}15`; e.currentTarget.style.borderColor = G.danger; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = G.cardAlt; e.currentTarget.style.borderColor = G.border; }}><IcoClose size={18} /></button>
            </div>

            <div style={{ padding: "28px 32px" }}>
              <div style={{ marginBottom: "28px", display: "flex", justifyContent: "center" }}><div style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "12px 24px", borderRadius: "60px", background: getStatusConfig(detalhe.status).bg, border: `1px solid ${getStatusConfig(detalhe.status).color}30`, boxShadow: `0 4px 12px ${getStatusConfig(detalhe.status).color}20` }}>{getStatusConfig(detalhe.status).icon}<span style={{ fontWeight: "700", color: getStatusConfig(detalhe.status).color, textTransform: "capitalize", fontSize: "14px" }}>{getStatusConfig(detalhe.status).label}</span></div></div>

              <div style={{ marginBottom: "28px" }}><div style={{ fontSize: "11px", color: G.muted, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "14px" }}>{t("info_cliente")}</div>
                <div style={{ background: G.cardAlt, borderRadius: "24px", padding: "20px", border: `1px solid ${G.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}><div style={{ width: "54px", height: "54px", borderRadius: "18px", background: `${G.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><IcoUser size={22} color={G.accent} /></div><div style={{ flex: 1 }}><div style={{ fontSize: "16px", fontWeight: "700", color: G.text }}>{detalhe.nome || "—"}</div><div style={{ fontSize: "12px", color: G.muted, display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}><IcoPhone size={12} /> {detalhe.telefone || t("sem_telefone")}</div></div>{detalhe.cliente_verificado && <IcoStar size={16} filled />}</div>
                  <div style={{ display: "flex", gap: "12px", paddingTop: "12px", borderTop: `1px solid ${G.border}` }}><IcoMapPin size={14} color={G.muted} /><span style={{ fontSize: "13px", color: G.text, flex: 1 }}>{detalhe.endereco || t("sem_morada")}</span></div>
                </div>
              </div>

              <div style={{ marginBottom: "28px" }}><div style={{ fontSize: "11px", color: G.muted, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "14px" }}>{t("resumo_financeiro")}</div>
                <div style={{ background: G.cardAlt, borderRadius: "24px", padding: "20px", border: `1px solid ${G.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}><span style={{ fontSize: "13px", color: G.muted }}>{t("subtotal")}</span><span style={{ fontSize: "14px", fontWeight: "500", color: G.text }}>{fmt((detalhe.total || 0) - (detalhe.taxa_entrega || 0) + (detalhe.desconto || 0))}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}><span style={{ fontSize: "13px", color: G.muted }}>{t("desconto")}</span><span style={{ fontSize: "14px", fontWeight: "500", color: G.danger }}>- {fmt(detalhe.desconto || 0)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}><span style={{ fontSize: "13px", color: G.muted }}>{t("taxa_entrega")}</span><span style={{ fontSize: "14px", fontWeight: "500", color: G.text }}>+ {fmt(detalhe.taxa_entrega || 0)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "16px", borderTop: `1px solid ${G.border}` }}><span style={{ fontSize: "15px", fontWeight: "700", color: G.text }}>{t("total_label")}</span><span style={{ fontSize: "22px", fontWeight: "800", color: G.accent }}>{fmt(detalhe.total)}</span></div>
                </div>
              </div>

              {detalhe.itens?.length > 0 && (<div style={{ marginBottom: "28px" }}><div style={{ fontSize: "11px", color: G.muted, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "14px" }}>{t("itens_pedido")} ({detalhe.itens.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>{detalhe.itens.map((item, i) => (<div key={i} style={{ background: G.cardAlt, borderRadius: "16px", padding: "14px 18px", border: `1px solid ${G.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: "14px", fontWeight: "600", color: G.text }}>{item.nome_produto || item.nome}</div><div style={{ fontSize: "11px", color: G.muted }}>{t("quantidade")}: {item.quantidade}</div></div><div style={{ fontSize: "15px", fontWeight: "700", color: G.accent }}>{fmt(item.subtotal || item.preco_unitario * item.quantidade)}</div></div>))}</div></div>)}

              <div><div style={{ fontSize: "11px", color: G.muted, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "14px" }}>{t("alterar_estado")}</div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>{ESTADOS.map((s) => { const isSelected = novoEstado === s; const cfg = getStatusConfig(s); return (<button key={s} onClick={() => setNovoEstado(s)} style={{ padding: "8px 18px", borderRadius: "40px", border: `1px solid ${isSelected ? cfg.color : G.border}`, background: isSelected ? cfg.bg : "transparent", color: isSelected ? cfg.color : G.muted, cursor: "pointer", fontSize: "12px", fontWeight: isSelected ? "700" : "500", fontFamily: "inherit", textTransform: "capitalize", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px" }}>{cfg.icon} {cfg.label}</button>); })}</div>

                {msgSucesso && (<div style={{ padding: "14px 18px", borderRadius: "18px", marginBottom: "20px", background: msgSucesso.includes("✅") ? `${G.success}12` : `${G.danger}12`, color: msgSucesso.includes("✅") ? G.success : G.danger, border: `1px solid ${msgSucesso.includes("✅") ? G.success : G.danger}30`, fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "10px" }}>{msgSucesso}</div>)}

                <div style={{ display: "flex", gap: "14px" }}>
                  <button onClick={() => setDetalhe(null)} style={{ flex: 1, padding: "14px", borderRadius: "18px", border: `1px solid ${G.border}`, background: "transparent", color: G.muted, cursor: "pointer", fontSize: "14px", fontWeight: "600", fontFamily: "inherit", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.danger; e.currentTarget.style.color = G.danger; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; }}>{t("fechar")}</button>
                  <button onClick={atualizarEstado} disabled={atualizando || novoEstado === detalhe.status} style={{ flex: 2, padding: "14px", borderRadius: "18px", border: "none", background: atualizando || novoEstado === detalhe.status ? G.cardAlt : getStatusConfig(novoEstado).color, color: atualizando || novoEstado === detalhe.status ? G.muted : "#fff", cursor: atualizando || novoEstado === detalhe.status ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "700", fontFamily: "inherit", transition: "all 0.2s", boxShadow: atualizando || novoEstado === detalhe.status ? "none" : `0 4px 14px ${getStatusConfig(novoEstado).color}50` }}>
                    {atualizando ? t("a_processar") : `✓ ${t("actualizar_para")} ${novoEstado}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideGlow { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
};

export default GPedidos;