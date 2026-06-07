import { useState, useEffect } from "react";
import { useTranslation } from "../i18n";



const API = "https://lojalopos.infinityfreeapp.com/api/financeiro.php";

const CATEGORIAS = [
  "Venda Loja",
  "Despesa",
  "Salário",
  "Fornecedor",
  "Rendimento",
  "Outro",
];
const FORMAS_PAG = ["DINHEIRO", "MULTICAIXA", "TRANSFERENCIA", "OUTRO"];

/* ══ ÍCONES ══ */
const Icons = {
  ArrowUp: ({ size = 20, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  ArrowDown: ({ size = 20, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  ),
  Wallet: ({ size = 20, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  ),
  ShopBag: ({ size = 24, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Plus: ({ size = 18, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Trash: ({ size = 14, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  ),
  Refresh: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Check: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Calendar: ({ size = 14, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Empty: ({ size = 48, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  ),
  TrendingUp: ({ size = 20, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  TrendingDown: ({ size = 20, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
};

const fmt = (v) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  }).format(v || 0);
const fmtDate = (d) => {
  if (!d) return "—";
  const x = new Date(d);
  return `${String(x.getDate()).padStart(2, "0")}/${String(x.getMonth() + 1).padStart(2, "0")}`;
};

const GFinanceiro = ({ G }) => {
  const { t } = useTranslation();

  /* ── Estado ── */
  const [movimentos, setMovimentos] = useState([]);
  const [receitaMes, setReceitaMes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [eliminando, setEliminando] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [feedback, setFeedback] = useState(null);
  const [activeMetric, setActiveMetric] = useState(null);
  const [hoverRow, setHoverRow] = useState(null);

  /* ── Formulário — só SAÍDA ── */
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Despesa");
  const [formaPag, setFormaPag] = useState("DINHEIRO");
  const [observacao, setObservacao] = useState("");

  /* ── Carrega dados ── */
  const carregar = async () => {
    setLoading(true);
    try {
      const [rMov, rDash] = await Promise.all([
        fetch(`${API}?tipo=movimentos`)
          .then((r) => r.json())
          .catch(() => ({})),
        fetch(API)
          .then((r) => r.json())
          .catch(() => ({})),
      ]);
      if (rMov.success) setMovimentos(rMov.data || []);
      setReceitaMes(parseFloat(rDash.receita_mes || 0));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const limpar = () => {
    setDescricao("");
    setValor("");
    setCategoria("Despesa");
    setFormaPag("DINHEIRO");
    setObservacao("");
    setFeedback(null);
  };

  /* ── Registar SAÍDA ── */
  const guardar = async () => {
    if (!descricao.trim() || !valor) {
      setFeedback({
        ok: false,
        msg: t("preencher_campos") || "Preencha descrição e valor.",
      });
      return;
    }
    setSalvando(true);
    setFeedback(null);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "SAIDA",
          descricao,
          valor: parseFloat(valor),
          categoria,
          forma_pagamento: formaPag,
          observacao,
          status: "CONFIRMADO",
        }),
      });
      const data = await res.json();
      if (data.success) {
        carregar();
        limpar();
        setFeedback({
          ok: true,
          msg: t("sucesso") || "Saída registada com sucesso!",
        });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({
          ok: false,
          msg: data.message || t("erro") || "Erro ao guardar.",
        });
      }
    } catch {
      setFeedback({ ok: false, msg: t("erro_ligacao") || "Erro de ligação." });
    }
    setSalvando(false);
  };

  const eliminar = async (id) => {
    if (!window.confirm(t("remover_confirmacao") || "Eliminar este movimento?"))
      return;
    setEliminando(id);
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success)
        setMovimentos((prev) => prev.filter((m) => m.id_financeiro != id));
    } catch {}
    setEliminando(null);
  };

  /* ── Cálculos ── */
  const saidas = movimentos
    .filter((m) => m.tipo === "SAIDA" && m.status === "CONFIRMADO")
    .reduce((a, m) => a + parseFloat(m.valor || 0), 0);
  const saldo = receitaMes - saidas;

  const filtrados = movimentos.filter(
    (m) => filtroTipo === "todos" || m.tipo === filtroTipo,
  );

  /* ── Métricas ─────────────────────────────────────────────
     Card 1 → Receita do Mês  (entradas via historico_vendas)
     Card 2 → Saídas          (apenas SAIDA confirmada)
     Card 3 → Saldo Líquido
  ───────────────────────────────────────────────────────── */
  const metrics = [
    {
      id: "receita",
      label: t("receita_mes") || "Receita do Mês",
      value: receitaMes,
      color: G.success,
      icon: <Icons.ShopBag size={24} color={G.success} />,
      bgColor: `${G.success}12`,
      sub: t("vendas_mes") || "vendas do mês",
    },
    {
      id: "saidas",
      label: t("saidas_label") || "Saídas",
      value: saidas,
      color: G.danger,
      icon: <Icons.TrendingDown size={24} color={G.danger} />,
      bgColor: `${G.danger}12`,
      sub: `${movimentos.filter((m) => m.tipo === "SAIDA").length} ${t("movimentos_label") || "movimentos"}`,
    },
    {
      id: "saldo",
      label: t("saldo_liquido") || "Saldo Líquido",
      value: saldo,
      color: saldo >= 0 ? G.accent : G.danger,
      icon: <Icons.Wallet size={24} color={saldo >= 0 ? G.accent : G.danger} />,
      bgColor: saldo >= 0 ? `${G.accent}12` : `${G.danger}12`,
      sub: t("actual") || "actual",
    },
  ];

  /* ── helpers i18n ── */
  const catKey = (c) =>
    ({
      "Venda Loja": "cat_venda_loja",
      Despesa: "cat_despesa",
      Salário: "cat_salario",
      Fornecedor: "cat_fornecedor",
      Rendimento: "cat_rendimento",
      Outro: "cat_outro",
    })[c] || c;
  const pagKey = (f) =>
    ({
      DINHEIRO: "pag_dinheiro",
      MULTICAIXA: "pag_multicaixa",
      TRANSFERENCIA: "pag_transferencia",
      OUTRO: "pag_outro",
    })[f] || f;

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
        minHeight: "100vh",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: `linear-gradient(135deg,${G.accent}25,${G.accent}08)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${G.accent}30`,
              }}
            >
              <Icons.Wallet size={26} color={G.accent} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "26px",
                  fontWeight: "700",
                  color: G.text,
                  margin: 0,
                  letterSpacing: "-0.5px",
                }}
              >
                {t("gestao_financeira") || "Gestão Financeira"}
              </h1>
              <p
                style={{ fontSize: "12px", color: G.muted, margin: "4px 0 0" }}
              >
                {t("sub_financeiro") ||
                  "Controle de receitas e saídas do sistema"}
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginLeft: "66px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: G.cardAlt,
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              <Icons.Calendar size={12} color={G.accent} />
              <span style={{ fontSize: "11px", color: G.muted }}>
                {new Date().toLocaleDateString("pt-AO", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: G.cardAlt,
                padding: "4px 12px",
                borderRadius: "20px",
              }}
            >
              <Icons.Check size={10} color={G.success} />
              <span style={{ fontSize: "11px", color: G.muted }}>
                {movimentos.length} {t("movimentos_label") || "movimentos"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={carregar}
          style={{
            background: G.card,
            border: `1px solid ${G.border}`,
            borderRadius: "12px",
            padding: "10px 18px",
            color: G.muted,
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = G.accent;
            e.currentTarget.style.color = G.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = G.border;
            e.currentTarget.style.color = G.muted;
          }}
        >
          <Icons.Refresh size={14} /> {t("actualizar") || "Actualizar"}
        </button>
      </div>

      {/* ── CARDS MÉTRICA ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.id}
            onMouseEnter={() => setActiveMetric(m.id)}
            onMouseLeave={() => setActiveMetric(null)}
            style={{
              background: G.card,
              borderRadius: "20px",
              padding: "20px",
              border: `1px solid ${activeMetric === m.id ? m.color : G.border}`,
              transition: "all 0.3s",
              transform:
                activeMetric === m.id ? "translateY(-3px)" : "translateY(0)",
              boxShadow:
                activeMetric === m.id ? "0 12px 28px rgba(0,0,0,0.15)" : "none",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Barra topo */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: `linear-gradient(90deg,${m.color},${m.color}60)`,
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: G.muted,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "6px",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: loading ? G.muted : m.color,
                  }}
                >
                  {loading ? "—" : fmt(m.value)}
                </div>
              </div>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "14px",
                  background: m.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.3s",
                  transform:
                    activeMetric === m.id
                      ? "scale(1.05) rotate(3deg)"
                      : "scale(1)",
                }}
              >
                {m.icon}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "10px",
                borderTop: `1px solid ${G.border}`,
              }}
            >
              <span style={{ fontSize: "11px", color: G.muted }}>{m.sub}</span>
              <span
                style={{ fontSize: "11px", color: m.color, fontWeight: "600" }}
              >
                {m.id === "saldo"
                  ? saldo >= 0
                    ? "▲"
                    : "▼"
                  : m.id === "receita"
                    ? "↑"
                    : "↓"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))",
          gap: "20px",
        }}
      >
        {/* FORMULÁRIO — REGISTO DE SAÍDAS */}
        <div
          style={{
            background: G.card,
            borderRadius: "20px",
            border: `1px solid ${G.border}`,
            overflow: "hidden",
          }}
        >
          {/* Header do form */}
          <div
            style={{
              padding: "20px",
              borderBottom: `1px solid ${G.border}`,
              background: G.cardAlt,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: `${G.danger}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icons.ArrowDown size={18} color={G.danger} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: G.text,
                    margin: 0,
                  }}
                >
                  {t("registar_saida") || "Registar Saída"}
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: G.muted,
                    margin: "2px 0 0",
                  }}
                >
                  {t("registe_mov") || "Registe despesas e saídas financeiras"}
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: "20px" }}>
            {/* Descrição */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: G.muted,
                  marginBottom: "6px",
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {t("descricao") || "Descrição"}
              </label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder={t("descricao_ph") || "Ex: Pagamento de fornecedor"}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  background: G.cardAlt,
                  border: `1px solid ${G.border}`,
                  borderRadius: "10px",
                  color: G.text,
                  fontSize: "13px",
                  outline: "none",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => (e.target.style.borderColor = G.danger)}
                onBlur={(e) => (e.target.style.borderColor = G.border)}
              />
            </div>

            {/* Valor + Categoria */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginBottom: "14px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: G.muted,
                    marginBottom: "6px",
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {t("valor") || "Valor"} (AOA)
                </label>
                <input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: G.cardAlt,
                    border: `1px solid ${G.border}`,
                    borderRadius: "10px",
                    color: G.text,
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = G.danger)}
                  onBlur={(e) => (e.target.style.borderColor = G.border)}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: G.muted,
                    marginBottom: "6px",
                    display: "block",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {t("categoria") || "Categoria"}
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: G.cardAlt,
                    border: `1px solid ${G.border}`,
                    borderRadius: "10px",
                    color: G.text,
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                >
                  {["Despesa", "Salário", "Fornecedor", "Outro"].map((c) => (
                    <option key={c} value={c}>
                      {t(catKey(c)) || c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: G.muted,
                  marginBottom: "6px",
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {t("forma_pagamento") || "Forma de Pagamento"}
              </label>
              <select
                value={formaPag}
                onChange={(e) => setFormaPag(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  background: G.cardAlt,
                  border: `1px solid ${G.border}`,
                  borderRadius: "10px",
                  color: G.text,
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              >
                {FORMAS_PAG.map((f) => (
                  <option key={f} value={f}>
                    {t(pagKey(f)) || f}
                  </option>
                ))}
              </select>
            </div>

            {/* Observação */}
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: G.muted,
                  marginBottom: "6px",
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {t("observacao") || "Observação"} ({t("opcional") || "opcional"}
                )
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder={t("observacao_ph") || "Notas adicionais..."}
                rows="2"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  background: G.cardAlt,
                  border: `1px solid ${G.border}`,
                  borderRadius: "10px",
                  color: G.text,
                  fontSize: "13px",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = G.danger)}
                onBlur={(e) => (e.target.style.borderColor = G.border)}
              />
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  marginBottom: "18px",
                  background: feedback.ok ? `${G.success}10` : `${G.danger}10`,
                  border: `1px solid ${feedback.ok ? G.success : G.danger}25`,
                  color: feedback.ok ? G.success : G.danger,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Icons.Check size={12} /> {feedback.msg}
              </div>
            )}

            {/* Botões */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={limpar}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: `1px solid ${G.border}`,
                  background: "transparent",
                  color: G.muted,
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = G.danger;
                  e.currentTarget.style.color = G.danger;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = G.border;
                  e.currentTarget.style.color = G.muted;
                }}
              >
                {t("limpar") || "Limpar"}
              </button>
              <button
                onClick={guardar}
                disabled={salvando}
                style={{
                  flex: 2,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "none",
                  background: salvando ? G.cardAlt : G.danger,
                  color: salvando ? G.muted : "#fff",
                  cursor: salvando ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "700",
                  transition: "all 0.2s",
                  opacity: salvando ? 0.75 : 1,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {salvando ? (
                  <>
                    <div
                      style={{
                        width: "13px",
                        height: "13px",
                        border: "2px solid rgba(255,255,255,.3)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        animation: "finSpin .8s linear infinite",
                      }}
                    />
                    {t("a_processar") || "A processar..."}
                  </>
                ) : (
                  <>
                    <Icons.ArrowDown size={14} color="#fff" />
                    {t("registar_saida") || "Registar Saída"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* LISTA DE MOVIMENTOS */}
        <div
          style={{
            background: G.card,
            borderRadius: "20px",
            border: `1px solid ${G.border}`,
            overflow: "hidden",
          }}
        >
          {/* Header lista */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${G.border}`,
              background: G.cardAlt,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: "600",
                  color: G.text,
                  margin: 0,
                }}
              >
                {t("movimentos_recentes") || "Movimentos Recentes"}
              </h3>
              <p
                style={{ fontSize: "11px", color: G.muted, margin: "2px 0 0" }}
              >
                {t("historico_transaccoes") || "Histórico de transacções"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
            
               
                { key: "SAIDA", label: t("saidas_label") || "Saídas" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFiltroTipo(f.key)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "20px",
                    border: `1px solid ${filtroTipo === f.key ? G.accent : G.border}`,
                    background:
                      filtroTipo === f.key ? `${G.accent}10` : "transparent",
                    color: filtroTipo === f.key ? G.accent : G.muted,
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: filtroTipo === f.key ? "600" : "400",
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scroll da lista */}
          <div
            style={{ maxHeight: "450px", overflowY: "auto" }}
            className="financeiro-scroll"
          >
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 20px",
                  color: G.muted,
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    border: `3px solid ${G.border}`,
                    borderTop: `3px solid ${G.accent}`,
                    borderRadius: "50%",
                    animation: "finSpin .8s linear infinite",
                    margin: "0 auto 12px",
                  }}
                />
                <p style={{ fontSize: "12px" }}>
                  {t("carregando_mov") || "A carregar movimentos..."}
                </p>
              </div>
            ) : filtrados.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 20px",
                  color: G.muted,
                }}
              >
                <Icons.Empty size={40} color={G.muted} />
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: "500",
                    marginBottom: "4px",
                    color: G.text,
                    marginTop: "12px",
                  }}
                >
                  {t("sem_movimentos_fin") || "Nenhum movimento"}
                </p>
                <p style={{ fontSize: "11px" }}>
                  {t("registe_primeiro") ||
                    "Registe o primeiro movimento no formulário"}
                </p>
              </div>
            ) : (
              filtrados.map((m, idx) => {
                const isEntry = m.tipo === "ENTRADA";
                const color = isEntry ? G.success : G.danger;
                const isDeleting = eliminando === m.id_financeiro;
                const isHover = hoverRow === m.id_financeiro;
                return (
                  <div
                    key={m.id_financeiro}
                    onMouseEnter={() => setHoverRow(m.id_financeiro)}
                    onMouseLeave={() => setHoverRow(null)}
                    style={{
                      padding: "14px 20px",
                      borderBottom:
                        idx !== filtrados.length - 1
                          ? `1px solid ${G.border}`
                          : "none",
                      background: isHover ? G.cardAlt : "transparent",
                      transition: "all 0.2s",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "12px",
                          background: isEntry
                            ? `${G.success}08`
                            : `${G.danger}08`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isEntry ? (
                          <Icons.ArrowUp size={18} color={G.success} />
                        ) : (
                          <Icons.ArrowDown size={18} color={G.danger} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: G.text,
                            marginBottom: "4px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.descricao}
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: G.muted,
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span>
                            {t(catKey(m.categoria || "Outro")) || m.categoria}
                          </span>
                          <span>·</span>
                          <span>
                            {t(pagKey(m.forma_pagamento || "OUTRO")) ||
                              m.forma_pagamento}
                          </span>
                          <span>·</span>
                          <span>{fmtDate(m.data_movimento)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color,
                          marginBottom: "6px",
                        }}
                      >
                        {isEntry ? "+" : "-"} {fmt(m.valor)}
                      </div>
                      <button
                        onClick={() => eliminar(m.id_financeiro)}
                        disabled={isDeleting}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: G.muted,
                          cursor: isDeleting ? "not-allowed" : "pointer",
                          fontSize: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginLeft: "auto",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          transition: "all 0.2s",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          if (!isDeleting) {
                            e.currentTarget.style.background = `${G.danger}15`;
                            e.currentTarget.style.color = G.danger;
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = G.muted;
                        }}
                      >
                        <Icons.Trash size={12} />{" "}
                        {isDeleting ? "..." : t("eliminar") || "Eliminar"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {!loading && filtrados.length > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderTop: `1px solid ${G.border}`,
                background: G.cardAlt,
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: G.muted,
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span>
                {filtrados.length} {t("movimentos_label") || "movimentos"}
              </span>
              <span>
                Total:{" "}
                <strong style={{ color: G.accent }}>
                  {fmt(
                    filtrados.reduce((a, m) => a + parseFloat(m.valor || 0), 0),
                  )}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes finSpin { to{transform:rotate(360deg)} }
        .financeiro-scroll::-webkit-scrollbar{width:5px}
        .financeiro-scroll::-webkit-scrollbar-track{background:${G.border};border-radius:8px}
        .financeiro-scroll::-webkit-scrollbar-thumb{background:${G.accent}40;border-radius:8px}
        .financeiro-scroll::-webkit-scrollbar-thumb:hover{background:${G.accent}}
        @media(max-width:768px){.financeiro-scroll{max-height:350px}}
      `}</style>
    </div>
  );
};

export default GFinanceiro;
