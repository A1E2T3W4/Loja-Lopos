import { useState } from "react";

const API_LOGIN = "http://localhost/api/login_operador.php";
const API_CONSULTAR = "http://localhost/api/consultar_cartao.php";
const API_PAGAR = "http://localhost/api/pagar_cartao.php";

const Scanner = () => {
  const [autenticado, setAutenticado] = useState(false);
  const [operador, setOperador] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const [errLogin, setErrLogin] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [etapa, setEtapa] = useState("scan");
  const [qrInput, setQrInput] = useState("");
  const [valor, setValor] = useState("");
  const [metodo, setMetodo] = useState("dinheiro");
  const [clienteInfo, setClienteInfo] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const fmt = (v) =>
    new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    }).format(v);

  // ── Login operador via BD ────────────────────────────────────────────────
  const handleEntrar = async () => {
    if (!userInput || !senhaInput) {
      setErrLogin("Preencha todos os campos.");
      return;
    }
    setLoadingLogin(true);
    setErrLogin("");
    try {
      const res = await fetch(API_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: userInput, senha: senhaInput }),
      });
      const data = await res.json();
      if (data.success) {
        setOperador(data.operador);
        setAutenticado(true);
      } else {
        setErrLogin(data.message || "Credenciais incorrectas.");
      }
    } catch {
      setErrLogin("Erro de ligação ao servidor.");
    }
    setLoadingLogin(false);
  };

  // ── Consultar cartão pelo QR ─────────────────────────────────────────────
  const handleConsultar = async () => {
    if (!qrInput.trim()) {
      setErro("Introduza ou scanne o código QR.");
      return;
    }
    if (!valor || parseFloat(valor) <= 0) {
      setErro("Introduza um valor válido.");
      return;
    }
    setErro("");
    setLoading(true);

    try {
      let id_cliente = null;
      try {
        const parsed = JSON.parse(qrInput);
        id_cliente = parsed.id_cliente || parsed.cliente;
      } catch {
        id_cliente = qrInput.trim();
      }

      const res = await fetch(API_CONSULTAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cliente }),
      });
      const data = await res.json();

      if (data.success) {
        setClienteInfo(data);
        setEtapa("confirmar");
      } else {
        setErro(data.message || "Cartão inválido.");
      }
    } catch {
      setErro("Erro de ligação ao servidor.");
    }
    setLoading(false);
  };

  // ── Processar pagamento ──────────────────────────────────────────────────
  const handlePagar = async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(API_PAGAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cartao: clienteInfo.id_cartao,
          id_cliente: clienteInfo.id_cliente,
          valor_compra: parseFloat(valor),
          metodo_restante: metodo,
        }),
      });
      const data = await res.json();
      setResultado(data);
      setEtapa("resultado");
    } catch {
      setErro("Erro de ligação ao servidor.");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setQrInput("");
    setValor("");
    setMetodo("dinheiro");
    setClienteInfo(null);
    setResultado(null);
    setErro("");
    setEtapa("scan");
  };

  // ── Ícones ───────────────────────────────────────────────────────────────
  const IconQr = ({ size = 24, color = "var(--accent)" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
      <rect x="14" y="18" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </svg>
  );
  const IconLock = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="1.8"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
  const IconCheck = ({ color = "var(--success)", size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
  const IconX = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
        stroke="var(--danger)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
        stroke="var(--danger)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );

  const cardStyle = {
    maxWidth: "460px",
    width: "100%",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "40px 32px",
  };

  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    background: "var(--bg-body)",
  };

  // ════════════════════════════════════════════════════════════════════════
  // ECRÃ DE LOGIN
  // ════════════════════════════════════════════════════════════════════════
  if (!autenticado) {
    return (
      <div style={pageStyle}>
        <div style={{ ...cardStyle, maxWidth: "380px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "var(--r-md)",
                background: "var(--accent-bg)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <IconLock />
            </div>
            <p
              style={{
                fontSize: ".68rem",
                textTransform: "uppercase",
                letterSpacing: ".12em",
                color: "var(--secondary)",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              Acesso Restrito
            </p>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "6px",
              }}
            >
              Terminal LOPOS
            </h2>
            <p style={{ fontSize: ".82rem", color: "var(--fg-muted)" }}>
              Entre com as suas credenciais de operador
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label className="form-label">Utilizador ou e-mail</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Wanandumbo"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEntrar()}
              autoFocus
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={senhaInput}
              onChange={(e) => setSenhaInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEntrar()}
            />
          </div>

          {errLogin && (
            <div
              style={{
                background: "var(--danger-bg)",
                color: "var(--danger)",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: ".82rem",
                marginBottom: "16px",
              }}
            >
              {errLogin}
            </div>
          )}

          <button
            className="btn-primary btn-block"
            onClick={handleEntrar}
            disabled={loadingLogin}
          >
            {loadingLogin ? "A verificar..." : "Entrar no terminal"}
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // TERMINAL PRINCIPAL
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* CABEÇALHO */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--r-md)",
              background: "var(--accent-bg)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <IconQr />
          </div>
          <p
            style={{
              fontSize: ".68rem",
              textTransform: "uppercase",
              letterSpacing: ".12em",
              color: "var(--secondary)",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            Loja LOPOS
          </p>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            Terminal de Pagamento
          </h2>
          <p style={{ fontSize: ".75rem", color: "var(--fg-muted)" }}>
            Operador: <strong>{operador?.nome}</strong> —{" "}
            <span style={{ color: "var(--accent)" }}>{operador?.tipo}</span>
          </p>
        </div>

        {/* INDICADOR DE ETAPAS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "28px",
          }}
        >
          {["scan", "confirmar", "resultado"].map((e, i) => {
            const etapas = ["scan", "confirmar", "resultado"];
            const actual = etapas.indexOf(etapa);
            const passado = actual > i;
            const activo = etapa === e;
            return (
              <div
                key={e}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: activo
                      ? "var(--accent)"
                      : passado
                        ? "var(--success)"
                        : "var(--bg-alt)",
                    border: `1px solid ${activo ? "var(--accent)" : passado ? "var(--success)" : "var(--border)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: ".72rem",
                    fontWeight: "700",
                    color: activo || passado ? "white" : "var(--fg-muted)",
                    transition: "0.3s",
                  }}
                >
                  {passado ? <IconCheck size={13} color="white" /> : i + 1}
                </div>
                {i < 2 && (
                  <div
                    style={{
                      width: "24px",
                      height: "1px",
                      background: passado ? "var(--success)" : "var(--border)",
                      transition: "0.3s",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── ETAPA 1: SCAN ───────────────────────────────────────────── */}
        {etapa === "scan" && (
          <>
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">Código QR do cartão</label>
              <input
                type="text"
                className="form-input"
                placeholder="Scanne ou introduza o código"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                autoFocus
                style={{ fontFamily: "monospace", fontSize: ".82rem" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label className="form-label">Valor da compra (AOA)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ex: 15000"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConsultar()}
                min="1"
              />
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label">Método para valor restante</label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                }}
              >
                {[
                  { value: "dinheiro", label: "Dinheiro" },
                  { value: "cartao_credito", label: "Multicaixa" },
                  { value: "transferencia", label: "Transfer." },
                ].map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMetodo(m.value)}
                    style={{
                      padding: "10px 8px",
                      borderRadius: "var(--r-sm)",
                      border: `1px solid ${metodo === m.value ? "var(--accent)" : "var(--border)"}`,
                      background:
                        metodo === m.value
                          ? "var(--accent-bg)"
                          : "var(--bg-alt)",
                      color:
                        metodo === m.value
                          ? "var(--accent)"
                          : "var(--fg-muted)",
                      cursor: "pointer",
                      fontSize: ".78rem",
                      fontWeight: "600",
                      fontFamily: "var(--sans)",
                      transition: "0.2s",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {erro && (
              <div
                style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: ".82rem",
                  marginBottom: "16px",
                }}
              >
                {erro}
              </div>
            )}

            <button
              className="btn-primary btn-block"
              onClick={handleConsultar}
              disabled={loading}
            >
              {loading ? "A verificar cartão..." : "Verificar cartão"}
            </button>
          </>
        )}

        {/* ── ETAPA 2: CONFIRMAR ──────────────────────────────────────── */}
        {etapa === "confirmar" && clienteInfo && (
          <>
            <div
              style={{
                background: "var(--bg-alt)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--accent), var(--secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {clienteInfo.nome.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: "600", fontSize: ".95rem" }}>
                    {clienteInfo.nome}
                  </p>
                  <p style={{ fontSize: ".75rem", color: "var(--fg-muted)" }}>
                    {clienteInfo.email}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(29,161,242,.12)",
                    padding: "4px 10px",
                    borderRadius: "99px",
                    border: "1px solid rgba(29,161,242,.25)",
                    flexShrink: 0,
                  }}
                >
                  <IconCheck size={10} color="#1DA1F2" />
                  <span
                    style={{
                      fontSize: ".65rem",
                      fontWeight: "700",
                      color: "#1DA1F2",
                    }}
                  >
                    VERIFICADO
                  </span>
                </div>
              </div>

              <div
                style={{
                  height: "1px",
                  background: "var(--border)",
                  marginBottom: "14px",
                }}
              />

              {[
                {
                  label: "Saldo disponível",
                  value: fmt(clienteInfo.saldo),
                  cor: "var(--success)",
                },
                {
                  label: "Valor da compra",
                  value: fmt(parseFloat(valor)),
                  cor: "var(--fg)",
                },
              ].map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{ fontSize: ".82rem", color: "var(--fg-muted)" }}
                  >
                    {r.label}
                  </span>
                  <span
                    style={{
                      fontSize: ".9rem",
                      fontWeight: "700",
                      color: r.cor,
                    }}
                  >
                    {r.value}
                  </span>
                </div>
              ))}

              {(() => {
                const saldo = clienteInfo.saldo;
                const compra = parseFloat(valor);
                const pagCartao = Math.min(saldo, compra);
                const restante = Math.max(0, compra - saldo);
                return (
                  <>
                    <div
                      style={{
                        height: "1px",
                        background: "var(--border)",
                        margin: "12px 0",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{ fontSize: ".82rem", color: "var(--fg-muted)" }}
                      >
                        Pago pelo cartão
                      </span>
                      <span
                        style={{
                          fontSize: ".88rem",
                          fontWeight: "600",
                          color: "var(--accent)",
                        }}
                      >
                        − {fmt(pagCartao)}
                      </span>
                    </div>
                    {restante > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: ".82rem",
                            color: "var(--fg-muted)",
                          }}
                        >
                          Restante ({metodo})
                        </span>
                        <span
                          style={{
                            fontSize: ".88rem",
                            fontWeight: "600",
                            color: "var(--danger)",
                          }}
                        >
                          {fmt(restante)}
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {erro && (
              <div
                style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: ".82rem",
                  marginBottom: "16px",
                }}
              >
                {erro}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setEtapa("scan")}
                style={{
                  padding: "12px",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  cursor: "pointer",
                  fontSize: ".88rem",
                  fontFamily: "var(--sans)",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handlePagar}
                disabled={loading}
                style={{
                  padding: "12px",
                  borderRadius: "var(--r-sm)",
                  fontSize: ".88rem",
                }}
              >
                {loading ? "A processar..." : "Confirmar pagamento"}
              </button>
            </div>
          </>
        )}

        {/* ── ETAPA 3: RESULTADO ──────────────────────────────────────── */}
        {etapa === "resultado" && resultado && (
          <>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: resultado.success
                    ? "var(--success-bg)"
                    : "var(--danger-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                {resultado.success ? <IconCheck /> : <IconX />}
              </div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: resultado.success ? "var(--success)" : "var(--danger)",
                  marginBottom: "4px",
                }}
              >
                {resultado.success
                  ? "Pagamento efectuado!"
                  : "Pagamento recusado"}
              </h3>
              <p style={{ fontSize: ".82rem", color: "var(--fg-muted)" }}>
                {resultado.mensagem || resultado.message}
              </p>
            </div>

            {resultado.success && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "24px",
                }}
              >
                {[
                  {
                    label: "Valor da compra",
                    value: fmt(resultado.valor_compra),
                    cor: "var(--fg)",
                  },
                  {
                    label: "Pago pelo cartão",
                    value: fmt(resultado.pago_cartao),
                    cor: "var(--accent)",
                  },
                  {
                    label: `Pago por ${resultado.metodo_restante || "—"}`,
                    value: fmt(resultado.pago_restante),
                    cor:
                      resultado.pago_restante > 0
                        ? "var(--danger)"
                        : "var(--fg-muted)",
                  },
                  {
                    label: "Saldo anterior",
                    value: fmt(resultado.saldo_anterior),
                    cor: "var(--fg-muted)",
                  },
                  {
                    label: "Novo saldo",
                    value: fmt(resultado.saldo_novo),
                    cor: "var(--success)",
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: "var(--bg-alt)",
                      borderRadius: "var(--r-sm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{ fontSize: ".8rem", color: "var(--fg-muted)" }}
                    >
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontSize: ".88rem",
                        fontWeight: "700",
                        color: r.cor,
                      }}
                    >
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button className="btn-primary btn-block" onClick={handleReset}>
              Novo pagamento
            </button>

            <button
              onClick={() => setAutenticado(false)}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "11px",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)",
                color: "var(--fg-muted)",
                cursor: "pointer",
                fontSize: ".82rem",
                fontFamily: "var(--sans)",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--danger)";
                e.currentTarget.style.color = "var(--danger)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--fg-muted)";
              }}
            >
              Terminar sessão do operador
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Scanner;
