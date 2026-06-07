import { useState, useEffect } from "react";
import { useTranslation } from "../i18n";



/* ═══════════════════════════════════════════════════════════
   ÍCONES SVG PREMIUM
═══════════════════════════════════════════════════════════ */
const Icons = {
  Search: ({ size = 16, color = "currentColor" }) => (
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  User: ({ size = 16, color = "currentColor" }) => (
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Star: ({ size = 14, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke="none"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Lock: ({ size = 14, color = "currentColor" }) => (
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: ({ size = 14, color = "currentColor" }) => (
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Check: ({ size = 14, color = "currentColor" }) => (
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
  Eye: ({ size = 14, color = "currentColor" }) => (
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Close: ({ size = 16, color = "currentColor" }) => (
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Phone: ({ size = 12, color = "currentColor" }) => (
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Mail: ({ size = 12, color = "currentColor" }) => (
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
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Calendar: ({ size = 12, color = "currentColor" }) => (
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  ShoppingBag: ({ size = 12, color = "currentColor" }) => (
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
  Wallet: ({ size = 12, color = "currentColor" }) => (
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
};

/* ═══════════════════════════════════════════════════════════
   GCLIENTES - COM i18n COMPLETO (CORRIGIDO)
═══════════════════════════════════════════════════════════ */
const GClientes = ({ G }) => {
  const { t } = useTranslation();
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [detalhe, setDetalhe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accionando, setAccionando] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [hoverRow, setHoverRow] = useState(null);
  const [hoverMetric, setHoverMetric] = useState(null);

  const fmt = (v) =>
    new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(v || 0);

  const carregar = () => {
    setLoading(true);
    fetch("https://lojalopos.infinityfreeapp.com/api/clientes.php")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setClientes(d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleToggleBloqueio = async (cliente) => {
    const acao = cliente.ativo == 1 ? "bloquear" : "desbloquear";
    const nomeAcao = acao === "bloquear" ? t("bloquear") : t("desbloquear");

    if (
      !window.confirm(
        `${nomeAcao} ${t("conta_de")} "${cliente.nome}"?\n\n` +
          (acao === "bloquear"
            ? t("confirmar_bloquear")
            : t("confirmar_desbloquear")),
      )
    )
      return;

    setAccionando(cliente.id_cliente);
    try {
      const res = await fetch("https://lojalopos.infinityfreeapp.com/api/clientes.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cliente: cliente.id_cliente,
          ativo: cliente.ativo == 1 ? 0 : 1,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setClientes((prev) =>
          prev.map((c) =>
            c.id_cliente === cliente.id_cliente
              ? { ...c, ativo: cliente.ativo == 1 ? 0 : 1 }
              : c,
          ),
        );
        if (detalhe?.id_cliente === cliente.id_cliente) {
          setDetalhe((prev) => ({
            ...prev,
            ativo: cliente.ativo == 1 ? 0 : 1,
          }));
        }
      }
    } catch {
      alert(t("erro_ligacao"));
    }
    setAccionando(null);
  };

  const filtrados = clientes.filter((c) => {
    const okBusca =
      !busca ||
      c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      c.email?.toLowerCase().includes(busca.toLowerCase());
    const okFiltro =
      filtro === "todos"
        ? true
        : filtro === "activos"
          ? c.ativo != 0
          : filtro === "bloqueados"
            ? c.ativo == 0
            : true;
    return okBusca && okFiltro;
  });

  const verificados = clientes.filter((c) => c.cliente_verificado).length;
  const bloqueados = clientes.filter((c) => c.ativo == 0).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const totalCompras = filtrados.reduce(
    (acc, c) => acc + (c.compras_realizadas || 0),
    0,
  );

  const getAvatarLetter = (nome) => {
    if (!nome || nome === "") return "?";
    return nome.charAt(0).toUpperCase();
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
        minHeight: "100vh",
        color: G.text,
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        .clientes-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .clientes-scroll::-webkit-scrollbar-track {
          background: ${G.border};
          border-radius: 8px;
        }
        .clientes-scroll::-webkit-scrollbar-thumb {
          background: ${G.accent}40;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .clientes-scroll::-webkit-scrollbar-thumb:hover {
          background: ${G.accent};
        }
        
        @media (max-width: 768px) {
          .clientes-scroll {
            max-height: calc(100vh - 300px);
          }
        }
      `}</style>

      {/* HEADER */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${G.accent}25, ${G.accent}08)`,
                  border: `1px solid ${G.accent}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icons.User size={24} color={G.accent} />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: "800",
                    color: G.text,
                    margin: 0,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {t("gestao_clientes")}
                </h1>
                <p
                  style={{
                    fontSize: "12px",
                    color: G.muted,
                    margin: "2px 0 0",
                  }}
                >
                  {t("sub_clientes")}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginLeft: "60px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "11px", color: G.muted }}>
                {t("total_label")}:{" "}
                <strong style={{ color: G.text }}>{clientes.length}</strong>
              </span>
              {bloqueados > 0 && (
                <span style={{ fontSize: "11px", color: G.danger }}>
                  {t("bloqueados")}: {bloqueados}
                </span>
              )}
              <span style={{ fontSize: "11px", color: G.success }}>
                {t("verificados")}: {verificados}
              </span>
            </div>
          </div>
          <div style={{ position: "relative", minWidth: "220px" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: G.muted,
              }}
            >
              <Icons.Search size={14} />
            </span>
            <input
              placeholder={t("pesquisar_cliente")}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 38px",
                background: G.card,
                border: `1px solid ${G.border}`,
                borderRadius: "10px",
                color: G.text,
                fontSize: "13px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = G.accent)}
              onBlur={(e) => (e.target.style.borderColor = G.border)}
            />
          </div>
        </div>
      </div>

      {/* MÉTRICAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            id: "total",
            label: t("total_label"),
            value: clientes.length,
            color: G.text,
            icon: <Icons.User size={18} color={G.text} />,
          },
          {
            id: "verificados",
            label: t("verificados"),
            value: verificados,
            color: G.success,
            icon: <Icons.Star size={16} color={G.success} />,
          },
          {
            id: "normais",
            label: t("normal"),
            value: clientes.length - verificados,
            color: G.muted,
            icon: <Icons.User size={16} color={G.muted} />,
          },
          {
            id: "bloqueados",
            label: t("bloqueados"),
            value: bloqueados,
            color: G.danger,
            icon: <Icons.Lock size={14} color={G.danger} />,
          },
        ].map((m) => (
          <div
            key={m.id}
            onMouseEnter={() => setHoverMetric(m.id)}
            onMouseLeave={() => setHoverMetric(null)}
            style={{
              background: G.card,
              border: `1px solid ${hoverMetric === m.id ? m.color : G.border}`,
              borderRadius: "16px",
              padding: "16px",
              transition: "all 0.2s",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  color: G.muted,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: "600",
                }}
              >
                {m.label}
              </div>
              <div style={{ color: m.color, opacity: 0.8 }}>{m.icon}</div>
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: loading ? G.muted : m.color,
              }}
            >
              {loading ? "—" : m.value}
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "todos", label: t("todos"), color: G.accent },
          { key: "activos", label: t("activo"), color: G.success },
          { key: "bloqueados", label: t("bloqueado"), color: G.danger },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              padding: "6px 18px",
              borderRadius: "10px",
              border: `1px solid ${filtro === f.key ? f.color : G.border}`,
              background: filtro === f.key ? `${f.color}12` : "transparent",
              color: filtro === f.key ? f.color : G.muted,
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: filtro === f.key ? "600" : "500",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {f.label}
            {f.key === "bloqueados" && bloqueados > 0 && (
              <span
                style={{
                  background: G.danger,
                  color: "#fff",
                  borderRadius: "20px",
                  padding: "1px 6px",
                  fontSize: "9px",
                  fontWeight: "700",
                }}
              >
                {bloqueados}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TABELA DE CLIENTES */}
      <div
        style={{
          background: G.card,
          border: `1px solid ${G.border}`,
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            overflowX: "auto",
            maxHeight: "calc(100vh - 380px)",
            overflowY: "auto",
          }}
          className="clientes-scroll"
        >
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "60px", color: G.muted }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  border: `3px solid ${G.border}`,
                  borderTop: `3px solid ${G.accent}`,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 12px",
                }}
              />
              <span>{t("a_carregar")}</span>
            </div>
          ) : filtrados.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: "60px", color: G.muted }}
            >
              <Icons.User
                size={40}
                color={G.muted}
                style={{ marginBottom: "12px", opacity: 0.4 }}
              />
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "4px",
                  color: G.text,
                }}
              >
                {t("sem_clientes")}
              </p>
              <p style={{ fontSize: "12px" }}>
                {t("tenta_outro_filtro")}
              </p>
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: G.card,
                  zIndex: 1,
                }}
              >
                <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: G.muted,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "600",
                    }}
                  >
                    {t("cliente")}
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: G.muted,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "600",
                    }}
                  >
                    {t("email")}
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: G.muted,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "600",
                    }}
                  >
                    {t("telefone")}
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: G.muted,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "600",
                    }}
                  >
                    {t("compras")}
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: G.muted,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "600",
                    }}
                  >
                    {t("saldo_bonus")}
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: G.muted,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "600",
                    }}
                  >
                    {t("perfil")}
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: G.muted,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "600",
                    }}
                  >
                    {t("estado_conta")}
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      color: G.muted,
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontWeight: "600",
                    }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => {
                  const bloqueado = c.ativo == 0;
                  const emAccao = accionando === c.id_cliente;
                  const isHover = hoverRow === c.id_cliente;
                  const vip = c.cliente_verificado;
                  const avatarLetter = getAvatarLetter(c.nome);
                  const avatarBg = bloqueado
                    ? `linear-gradient(135deg, ${G.danger}, ${G.danger}80)`
                    : `linear-gradient(135deg, ${G.accent}, ${G.accent}80)`;

                  return (
                    <tr
                      key={c.id_cliente}
                      onMouseEnter={() => setHoverRow(c.id_cliente)}
                      onMouseLeave={() => setHoverRow(null)}
                      style={{
                        borderBottom: `1px solid ${G.border}`,
                        transition: "background 0.2s",
                        background: isHover ? G.cardAlt : "transparent",
                        opacity: bloqueado ? 0.7 : 1,
                      }}
                    >
                      <td style={{ padding: "12px 16px", width: "220px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flexWrap: "nowrap",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              minWidth: "40px",
                              borderRadius: "50%",
                              background: avatarBg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              fontWeight: "700",
                              color: "#fff",
                              textTransform: "uppercase",
                              flexShrink: 0,
                            }}
                          >
                            {avatarLetter}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "600",
                                color: G.text,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {c.nome}
                            </div>
                            {bloqueado && (
                              <div
                                style={{
                                  fontSize: "9px",
                                  color: G.danger,
                                  fontWeight: "700",
                                  marginTop: "2px",
                                }}
                              >
                                {t("conta_bloqueada")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: G.muted,
                          fontSize: "12px",
                        }}
                      >
                        {c.email}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: G.muted,
                          fontSize: "12px",
                        }}
                      >
                        {c.telefone || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: "600",
                          color: G.accent,
                        }}
                      >
                        {c.compras_realizadas || 0}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontWeight: "600",
                          color: G.success,
                        }}
                      >
                        {fmt(c.saldo_bonus || 0)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {vip ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 10px",
                              borderRadius: "30px",
                              fontSize: "10px",
                              fontWeight: "700",
                              background: `${G.accent}12`,
                              color: G.accent,
                              border: `1px solid ${G.accent}30`,
                            }}
                          >
                            <Icons.Star size={10} color={G.accent} /> {t("vip")}
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "30px",
                              fontSize: "10px",
                              fontWeight: "600",
                              background: `${G.muted}12`,
                              color: G.muted,
                              border: `1px solid ${G.muted}25`,
                            }}
                          >
                            {t("normal")}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {bloqueado ? (
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "30px",
                              fontSize: "10px",
                              fontWeight: "700",
                              background: `${G.danger}12`,
                              color: G.danger,
                              border: `1px solid ${G.danger}30`,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Icons.Lock size={10} /> {t("bloqueado")}
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "30px",
                              fontSize: "10px",
                              fontWeight: "700",
                              background: `${G.success}12`,
                              color: G.success,
                              border: `1px solid ${G.success}30`,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Icons.Check size={10} /> {t("activo")}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => setDetalhe(c)}
                            style={{
                              background: "transparent",
                              border: `1px solid ${G.border}`,
                              borderRadius: "8px",
                              padding: "5px 12px",
                              color: G.muted,
                              cursor: "pointer",
                              fontSize: "10px",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
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
                            <Icons.Eye size={12} /> {t("ver")}
                          </button>
                          <button
                            onClick={() => handleToggleBloqueio(c)}
                            disabled={emAccao}
                            style={{
                              background: "transparent",
                              borderRadius: "8px",
                              padding: "5px 12px",
                              cursor: emAccao ? "not-allowed" : "pointer",
                              fontSize: "10px",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s",
                              border: `1px solid ${bloqueado ? G.success : G.danger}40`,
                              color: bloqueado ? G.success : G.danger,
                            }}
                            onMouseEnter={(e) => {
                              if (!emAccao)
                                e.currentTarget.style.background = `${bloqueado ? G.success : G.danger}10`;
                            }}
                            onMouseLeave={(e) => {
                              if (!emAccao)
                                e.currentTarget.style.background =
                                  "transparent";
                            }}
                          >
                            {emAccao ? (
                              "..."
                            ) : bloqueado ? (
                              <Icons.Unlock size={12} />
                            ) : (
                              <Icons.Lock size={12} />
                            )}
                            {emAccao
                              ? "..."
                              : bloqueado
                                ? t("desbloquear")
                                : t("bloquear")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && filtrados.length > 0 && (
          <div
            style={{
              padding: "12px 16px",
              borderTop: `1px solid ${G.border}`,
              background: G.cardAlt,
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              color: G.muted,
            }}
          >
            <span>
              {t("mostrando")}{" "}
              <strong style={{ color: G.accent }}>{filtrados.length}</strong> {t("de")}{" "}
              <strong>{clientes.length}</strong> {t("clientes_label")}
            </span>
            <span>
              {t("total_compras")}:{" "}
              <strong style={{ color: G.accent }}>{totalCompras}</strong>
            </span>
          </div>
        )}
      </div>

      {/* MODAL DETALHE */}
      {detalhe && (
        <div
          onClick={() => setDetalhe(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(12px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: G.card,
              borderRadius: "24px",
              maxWidth: "480px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              animation: "slideUp 0.3s",
              border: `1px solid ${detalhe.ativo == 0 ? G.danger : G.accent}30`,
            }}
          >
            <div
              style={{
                padding: "24px",
                borderBottom: `1px solid ${G.border}`,
                background: `linear-gradient(135deg, ${G.cardAlt}, ${G.card})`,
                borderRadius: "24px 24px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    background:
                      detalhe.ativo == 0
                        ? `linear-gradient(135deg, ${G.danger}, ${G.danger}80)`
                        : `linear-gradient(135deg, ${G.accent}, ${G.accent}80)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#fff",
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  {getAvatarLetter(detalhe.nome)}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: G.text,
                    }}
                  >
                    {detalhe.nome}
                  </div>
                  {detalhe.ativo == 0 && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: G.danger,
                        fontWeight: "700",
                        marginTop: "2px",
                      }}
                    >
                      {t("conta_bloqueada")}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDetalhe(null)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: G.cardAlt,
                  border: `1px solid ${G.border}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: G.muted,
                  transition: "all 0.2s",
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
                <Icons.Close size={16} />
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              {[
                {
                  label: t("email"),
                  value: detalhe.email,
                  icon: <Icons.Mail size={12} />,
                },
                {
                  label: t("telefone"),
                  value: detalhe.telefone || "—",
                  icon: <Icons.Phone size={12} />,
                },
                {
                  label: t("compras_realizadas"),
                  value: detalhe.compras_realizadas || 0,
                  color: G.accent,
                  icon: <Icons.ShoppingBag size={12} />,
                },
                {
                  label: t("saldo_bonus"),
                  value: fmt(detalhe.saldo_bonus || 0),
                  color: G.success,
                  icon: <Icons.Wallet size={12} />,
                },
                {
                  label: t("perfil"),
                  value: detalhe.cliente_verificado
                    ? t("vip_verificado")
                    : t("normal"),
                  color: detalhe.cliente_verificado ? G.accent : G.muted,
                  icon: detalhe.cliente_verificado ? (
                    <Icons.Star size={10} />
                  ) : (
                    <Icons.User size={12} />
                  ),
                },
                {
                  label: t("estado_conta"),
                  value: detalhe.ativo == 0 ? t("bloqueada") : t("activa"),
                  color: detalhe.ativo == 0 ? G.danger : G.success,
                  icon:
                    detalhe.ativo == 0 ? (
                      <Icons.Lock size={10} />
                    ) : (
                      <Icons.Check size={10} />
                    ),
                },
                {
                  label: t("membro_desde"),
                  value: formatDate(detalhe.criado_em),
                  icon: <Icons.Calendar size={12} />,
                },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: idx !== 6 ? `1px solid ${G.border}` : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: G.muted,
                      fontSize: "12px",
                    }}
                  >
                    {item.icon} <span>{item.label}</span>
                  </div>
                  <span
                    style={{
                      fontWeight: "600",
                      color: item.color || G.text,
                      fontSize: "13px",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{ padding: "20px", borderTop: `1px solid ${G.border}` }}
            >
              <button
                onClick={() => handleToggleBloqueio(detalhe)}
                disabled={accionando === detalhe.id_cliente}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: `1px solid ${detalhe.ativo == 0 ? G.success : G.danger}40`,
                  background: `${detalhe.ativo == 0 ? G.success : G.danger}10`,
                  color: detalhe.ativo == 0 ? G.success : G.danger,
                  cursor:
                    accionando === detalhe.id_cliente
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "13px",
                  fontWeight: "700",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  if (accionando !== detalhe.id_cliente)
                    e.currentTarget.style.opacity = "0.8";
                }}
                onMouseLeave={(e) => {
                  if (accionando !== detalhe.id_cliente)
                    e.currentTarget.style.opacity = "1";
                }}
              >
                {accionando === detalhe.id_cliente ? (
                  t("a_processar")
                ) : detalhe.ativo == 0 ? (
                  <>
                    <Icons.Unlock size={14} /> {t("desbloquear_conta")}
                  </>
                ) : (
                  <>
                    <Icons.Lock size={14} /> {t("bloquear_conta")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GClientes;