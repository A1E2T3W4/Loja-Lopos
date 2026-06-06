import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { enviarEmailLogin, enviarCodigoReset } from "../services/emailService";


const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errEmail, setErrEmail] = useState(false);
  const [errSenha, setErrSenha] = useState(false);
  const [errGeral, setErrGeral] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [modalReset, setModalReset] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetNome, setResetNome] = useState("");
  const [resetCodigo, setResetCodigo] = useState(["", "", "", "", "", ""]);
  const [resetCodigoGuardado, setResetCodigoGuardado] = useState("");
  const [resetSenha, setResetSenha] = useState("");
  const [resetSenha2, setResetSenha2] = useState("");
  const [resetErro, setResetErro] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [reenvioTimer, setReenvioTimer] = useState(0);

  const validarEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const salvarSessao = (token, cliente) => {
    localStorage.setItem("luxe_token", token);
    localStorage.setItem("luxe_cliente", JSON.stringify(cliente));
    window.dispatchEvent(new CustomEvent("clienteAtualizado"));
  };

  const iniciarTimer = () => {
    setReenvioTimer(60);
    const iv = setInterval(() => {
      setReenvioTimer((t) => {
        if (t <= 1) {
          clearInterval(iv);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // ── Login normal ─────────────────────────────────────────────
  const handleLogin = async () => {
    setErrEmail(false);
    setErrSenha(false);
    setErrGeral("");
    if (!validarEmail(email)) {
      setErrEmail(true);
      return;
    }
    if (!senha) {
      setErrSenha(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost/api/auth.php?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const json = await res.json();
      if (json.success) {
        salvarSessao(json.token, json.cliente);
        enviarEmailLogin(json.cliente.nome, json.cliente.email).catch(() => {});
        navigate("/");
      } else {
        setErrGeral(json.message || "E-mail ou senha incorrectos.");
      }
    } catch {
      setErrGeral("Erro de ligação ao servidor.");
    }
    setLoading(false);
  };

  // ── Login Google ─────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const userInfo = await userInfoRes.json();
        const res = await fetch("http://localhost/api/auth.php?action=google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userInfo.email,
            nome: userInfo.name,
            foto_url: userInfo.picture,
          }),
        });
        const json = await res.json();
        if (json.success) {
          salvarSessao(json.token, json.cliente);
          enviarEmailLogin(userInfo.name, userInfo.email).catch(() => {});
          navigate("/");
        } else {
          setErrGeral(json.message || "Erro ao entrar com Google.");
        }
      } catch {
        setErrGeral("Erro ao processar login com Google.");
      }
    },
    onError: () => setErrGeral("Erro ao entrar com Google."),
    flow: "implicit",
  });

  // ── Reset — Passo 1: pedir código ────────────────────────────
  const handleResetEnviar = async () => {
    setResetErro("");
    if (!validarEmail(resetEmail)) {
      setResetErro("Introduza um e-mail válido.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch("http://localhost/api/reset_senha.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enviar", email: resetEmail }),
      });
      const json = await res.json();

      if (json.success) {
        setResetNome(json.nome || "");
        setResetCodigoGuardado(json.codigo || "");

        try {
          await enviarCodigoReset(json.nome || "", resetEmail, json.codigo);
        } catch (emailErr) {
          console.error("Erro ao enviar email de reset:", emailErr);
        }

        setResetStep(2);
        iniciarTimer();
      } else {
        setResetErro(json.message || "Erro ao enviar código.");
      }
    } catch {
      setResetErro("Erro de ligação ao servidor.");
    }
    setResetLoading(false);
  };

  // ── Reset — Passo 2: verificar código ────────────────────────
  const handleResetVerificar = async () => {
    const codigo = resetCodigo.join("");
    if (codigo.length < 6) {
      setResetErro("Introduza o código completo.");
      return;
    }
    setResetErro("");
    setResetLoading(true);
    try {
      const res = await fetch("http://localhost/api/reset_senha.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verificar",
          email: resetEmail,
          codigo,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResetStep(3);
      } else {
        setResetErro(json.message || "Código inválido.");
      }
    } catch {
      setResetErro("Erro de ligação ao servidor.");
    }
    setResetLoading(false);
  };

  // ── Reset — Passo 3: nova senha ──────────────────────────────
  const handleResetRedefinir = async () => {
    setResetErro("");
    if (resetSenha.length < 8) {
      setResetErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (resetSenha !== resetSenha2) {
      setResetErro("As senhas não coincidem.");
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch("http://localhost/api/reset_senha.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "redefinir",
          email: resetEmail,
          codigo: resetCodigo.join(""),
          nova_senha: resetSenha,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResetStep(4);
      } else {
        setResetErro(json.message || "Erro ao redefinir senha.");
      }
    } catch {
      setResetErro("Erro de ligação ao servidor.");
    }
    setResetLoading(false);
  };

  // ── Reset — reenviar código ──────────────────────────────────
  const handleReenviarReset = async () => {
    if (reenvioTimer > 0) return;
    setResetErro("");
    setResetLoading(true);
    try {
      const res = await fetch("http://localhost/api/reset_senha.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enviar", email: resetEmail }),
      });
      const json = await res.json();
      if (json.success) {
        setResetNome(json.nome || "");
        setResetCodigoGuardado(json.codigo || "");

        try {
          await enviarCodigoReset(json.nome || "", resetEmail, json.codigo);
        } catch (emailErr) {
          console.error("Erro ao reenviar email:", emailErr);
        }

        iniciarTimer();
        setResetCodigo(["", "", "", "", "", ""]);
      } else {
        setResetErro(json.message || "Erro ao reenviar.");
      }
    } catch {
      setResetErro("Erro de ligação ao servidor.");
    }
    setResetLoading(false);
  };

  // ── Fechar modal ─────────────────────────────────────────────
  const fecharModal = () => {
    setModalReset(false);
    setResetStep(1);
    setResetEmail("");
    setResetNome("");
    setResetCodigoGuardado("");
    setResetSenha("");
    setResetSenha2("");
    setResetCodigo(["", "", "", "", "", ""]);
    setResetErro("");
    setReenvioTimer(0);
  };

  // ── Inputs de código (6 dígitos) ─────────────────────────────
  const handleDigito = (arr, setArr, prefix, index, value) => {
    if (!/^\d?$/.test(value)) return;
    const novo = [...arr];
    novo[index] = value;
    setArr(novo);
    if (value && index < 5)
      document.getElementById(`${prefix}${index + 1}`)?.focus();
  };

  const handleDigitoKeyDown = (arr, prefix, index, e) => {
    if (e.key === "Backspace" && !arr[index] && index > 0)
      document.getElementById(`${prefix}${index - 1}`)?.focus();
  };

  const getPasswordStrength = (senha) => {
    if (senha.length >= 12 && /[A-Z]/.test(senha) && /[0-9]/.test(senha) && /[^a-zA-Z0-9]/.test(senha)) return 4;
    if (senha.length >= 10 && /[A-Z]/.test(senha) && /[0-9]/.test(senha)) return 3;
    if (senha.length >= 8) return 2;
    return 1;
  };

  const getStrengthText = (strength) => {
    if (strength === 1) return "Muito fraca";
    if (strength === 2) return "Fraca";
    if (strength === 3) return "Média";
    return "Forte";
  };

  const GoogleSvg = () => (
    <svg width="19" height="19" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <>
      <div className="page-wrap">
        <div className="page-inner">
          <p className="eyebrow" style={{ marginBottom: "10px" }}>
            Bem-vindo de volta
          </p>
          <h1 className="page-title">Entrar na sua conta</h1>
          <p className="page-sub">
            Ainda não tem conta?{" "}
            <a
              href="/cadastro"
              style={{ color: "var(--accent)", fontWeight: "600" }}
            >
              Criar uma agora
            </a>
          </p>

          {/* Google */}
          <button onClick={googleLogin} className="google-btn">
            <GoogleSvg /> Entrar com Google
          </button>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">ou</span>
            <div className="divider-line" />
          </div>

          {errGeral && (
            <div className="error-message">
              {errGeral}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className={`form-input ${errEmail ? "error" : ""}`}
              placeholder="o.seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              inputMode="email"
              autoComplete="email"
            />
            {errEmail && (
              <span className="form-error show">E-mail inválido.</span>
            )}
          </div>

          <div className="form-group">
            <div className="password-header">
              <label className="form-label password-label">Senha</label>
              <button
                onClick={() => {
                  setModalReset(true);
                  setResetStep(1);
                }}
                className="forgot-link"
              >
                Esqueci a senha
              </button>
            </div>
            <input
              type="password"
              className={`form-input ${errSenha ? "error" : ""}`}
              placeholder="A sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="current-password"
            />
            {errSenha && (
              <span className="form-error show">Senha incorrecta.</span>
            )}
          </div>

          <button
            className="btn-primary btn-block"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginBottom: "16px" }}
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </div>
      </div>

      {/* ── MODAL RESET ─────────────────────────────────────── */}
      {modalReset && (
        <div className="reset-modal-overlay" onClick={fecharModal}>
          <div className="reset-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="reset-modal-close" onClick={fecharModal}>✕</button>

            {/* Indicador de passos */}
            {resetStep < 4 && (
              <div className="steps-indicator">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`step-dot ${s === resetStep ? 'active' : 'inactive'}`}
                  />
                ))}
              </div>
            )}

            {/* ── PASSO 1: Email ── */}
            {resetStep === 1 && (
              <>
                <div className="reset-header">
                  <div className="reset-icon">🔑</div>
                  <h2 className="reset-title">Recuperar senha</h2>
                  <p className="reset-sub">
                    Introduza o e-mail da sua conta e enviamos um código.
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail da conta</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="o.seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleResetEnviar()}
                    inputMode="email"
                    autoFocus
                  />
                </div>
                {resetErro && (
                  <div className="error-message">
                    {resetErro}
                  </div>
                )}
                <button
                  className="btn-primary btn-block"
                  onClick={handleResetEnviar}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <span className="spinner">
                      <span className="spinner-icon" />
                      A enviar...
                    </span>
                  ) : (
                    "Enviar código"
                  )}
                </button>
              </>
            )}

            {/* ── PASSO 2: Código ── */}
            {resetStep === 2 && (
              <>
                <div className="reset-header">
                  <div className="reset-icon">✉️</div>
                  <h2 className="reset-title">Código enviado</h2>
                  <p className="reset-email-display">
                    Verifique{" "}
                    <strong className="reset-email-display strong">{resetEmail}</strong>
                  </p>
                  <p className="reset-hint">
                    O código expira em 15 minutos.
                  </p>
                </div>

                <div className="code-container">
                  {resetCodigo.map((d, i) => (
                    <input
                      key={i}
                      id={`rd-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) =>
                        handleDigito(
                          resetCodigo,
                          setResetCodigo,
                          "rd-",
                          i,
                          e.target.value,
                        )
                      }
                      onKeyDown={(e) =>
                        handleDigitoKeyDown(resetCodigo, "rd-", i, e)
                      }
                      className="code-digit"
                      style={{
                        borderColor: d ? "var(--accent)" : "var(--border)"
                      }}
                    />
                  ))}
                </div>

                {resetErro && (
                  <div className="error-message" style={{ textAlign: "center" }}>
                    {resetErro}
                  </div>
                )}

                <button
                  className="btn-primary btn-block"
                  onClick={handleResetVerificar}
                  disabled={resetLoading}
                  style={{ marginBottom: "12px" }}
                >
                  {resetLoading ? "A verificar..." : "Verificar código"}
                </button>

                <div className="resend-container">
                  {reenvioTimer > 0 ? (
                    <span className="resend-timer">
                      Reenviar em {reenvioTimer}s
                    </span>
                  ) : (
                    <button
                      onClick={handleReenviarReset}
                      disabled={resetLoading}
                      className="resend-btn"
                    >
                      Reenviar código
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ── PASSO 3: Nova senha ── */}
            {resetStep === 3 && (
              <>
                <div className="reset-header">
                  <div className="reset-icon">🔒</div>
                  <h2 className="reset-title">Nova senha</h2>
                  <p className="reset-sub">
                    Defina a sua nova senha de acesso.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Nova senha</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Mínimo 8 caracteres"
                    value={resetSenha}
                    onChange={(e) => setResetSenha(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar nova senha</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Repetir a senha"
                    value={resetSenha2}
                    onChange={(e) => setResetSenha2(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleResetRedefinir()}
                    autoComplete="new-password"
                  />
                </div>

                {/* Indicador de força da senha */}
                {resetSenha.length > 0 && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((n) => {
                        const strength = getPasswordStrength(resetSenha);
                        const isActive = n <= strength;
                        const getBarClass = () => {
                          if (!isActive) return "strength-bar-inactive";
                          if (strength >= 3) return "strength-bar-strong";
                          if (strength === 2) return "strength-bar-medium";
                          return "strength-bar-weak";
                        };
                        return (
                          <div
                            key={n}
                            className={`strength-bar ${getBarClass()}`}
                          />
                        );
                      })}
                    </div>
                    <div className="strength-text">
                      {getStrengthText(getPasswordStrength(resetSenha))}
                    </div>
                  </div>
                )}

                {resetErro && (
                  <div className="error-message">
                    {resetErro}
                  </div>
                )}
                <button
                  className="btn-primary btn-block"
                  onClick={handleResetRedefinir}
                  disabled={resetLoading}
                >
                  {resetLoading ? "A guardar..." : "Guardar nova senha"}
                </button>
              </>
            )}

            {/* ── PASSO 4: Sucesso ── */}
            {resetStep === 4 && (
              <div className="success-container">
                <div className="success-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="var(--success)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="success-title">Senha redefinida!</h2>
                <p className="success-sub">
                  A sua senha foi alterada com sucesso.
                  <br />
                  Pode entrar agora com a nova senha.
                </p>
                <button className="btn-primary btn-block" onClick={fecharModal}>
                  Ir para o login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Login;