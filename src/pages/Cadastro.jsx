import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { enviarEmailCadastro, enviarCodigoVerificacao } from "../services/emailService";

/* ═══════════════════════════════════════════════════════
   PORTAL — renderiza directamente no document.body
   para não ser bloqueado por overflow/transform do pai
═══════════════════════════════════════════════════════ */
const Portal = ({ children }) => {
  const el = document.body;
  return createPortal(children, el);
};

/* ═══════════════════════════════════════════════════════
   HOOK — fecha modal com tecla Escape
═══════════════════════════════════════════════════════ */
const useEscClose = (onClose) => {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
};

/* ═══════════════════════════════════════════════════════
   MODAL TERMOS DE USO
═══════════════════════════════════════════════════════ */
const ModalTermos = ({ onClose }) => {
  useEscClose(onClose);

  /* bloqueia scroll do body enquanto o modal está aberto */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const sections = [
    { num: "01", icon: "🛒", titulo: "Uso da Plataforma",        texto: "A LOPOS é uma plataforma de comércio electrónico destinada à venda de produtos tecnológicos em Angola. Ao criar uma conta, o utilizador concorda em usar a plataforma de forma lícita e responsável, respeitando os direitos de terceiros e as leis angolanas em vigor." },
    { num: "02", icon: "🔐", titulo: "Conta e Responsabilidade",  texto: "Cada utilizador é responsável pela confidencialidade das suas credenciais de acesso. Em caso de uso não autorizado da conta, o utilizador deve notificar imediatamente a LOPOS. Não nos responsabilizamos por danos resultantes do uso indevido das credenciais." },
    { num: "03", icon: "📦", titulo: "Pedidos e Pagamentos",       texto: "Ao efectuar um pedido, o utilizador compromete-se a fornecer informações correctas de entrega e pagamento. A LOPOS reserva-se o direito de cancelar pedidos em caso de fraude, stock insuficiente ou dados incorrectos. Os preços são em Kwanzas (AOA) e incluem IVA quando aplicável." },
    { num: "04", icon: "🚚", titulo: "Entrega e Devolução",        texto: "As entregas são efectuadas em Luanda e províncias seleccionadas. O utilizador tem até 7 dias úteis após a recepção para solicitar devolução, desde que o produto esteja nas condições originais e com embalagem intacta." },
    { num: "05", icon: "⭐", titulo: "Programa de Bónus",          texto: "O programa de bónus LOPOS atribui créditos em cada compra realizada. Os créditos acumulados podem ser utilizados em compras futuras. A LOPOS reserva-se o direito de alterar as condições do programa mediante aviso prévio de 15 dias." },
    { num: "06", icon: "⚖️", titulo: "Legislação Aplicável",       texto: "Estes termos são regidos pela legislação angolana. Qualquer litígio será submetido aos tribunais competentes da República de Angola, com sede em Luanda. A LOPOS pode alterar estes termos a qualquer momento, notificando os utilizadores por e-mail." },
  ];

  return (
    <Portal>
      {/* overlay — z-index alto para ficar por cima de tudo */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(14px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
          animation: "cModalFadeIn .22s ease",
        }}
      >
        {/* caixa do modal — stopPropagation para não fechar ao clicar dentro */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: "640px", maxHeight: "92vh",
            borderRadius: "24px", overflow: "hidden",
            display: "flex", flexDirection: "column",
            background: "linear-gradient(135deg,#0d0d1a,#0a0f1e,#060a14)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.75)",
            animation: "cModalSlideUp .28s cubic-bezier(.23,1,.32,1)",
          }}
        >
          {/* HERO */}
          <div style={{ position:"relative", padding:"40px 32px 32px", background:"linear-gradient(135deg,#1a0a2e,#0d1a3a,#0a1628)", overflow:"hidden", flexShrink:0 }}>
            {/* orbs decorativos */}
            {[
              { top:"-40px", left:"-40px", size:180, color:"rgba(168,85,247,.25)", delay:"0s" },
              { bottom:"-20px", right:"-20px", size:140, color:"rgba(99,102,241,.2)", delay:"1.5s" },
            ].map((o, i) => (
              <div key={i} style={{
                position:"absolute", borderRadius:"50%",
                width:o.size, height:o.size,
                top:o.top, left:o.left, bottom:o.bottom, right:o.right,
                background:`radial-gradient(circle,${o.color},transparent 70%)`,
                animation:`cPulse 3s ease-in-out ${o.delay} infinite`,
                pointerEvents:"none",
              }}/>
            ))}

            {/* botão fechar */}
            <button
              onClick={onClose}
              style={{
                position:"absolute", top:14, right:14,
                width:36, height:36, borderRadius:"50%",
                background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)",
                color:"rgba(255,255,255,.7)", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, zIndex:2, transition:"all .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.18)"; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.08)"; e.currentTarget.style.color="rgba(255,255,255,.7)"; }}
              aria-label="Fechar"
            >✕</button>

            {/* ícone */}
            <div style={{ position:"relative", zIndex:2, textAlign:"center", marginBottom:20 }}>
              <div style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:80, height:80, borderRadius:24,
                background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
                boxShadow:"0 16px 40px rgba(124,58,237,.5)",
                fontSize:36, animation:"cFloat 3s ease-in-out infinite",
              }}>📋</div>
            </div>

            {/* título */}
            <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
              <div style={{ fontSize:11, letterSpacing:"0.18em", color:"rgba(168,85,247,.8)", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Documento Legal</div>
              <h2 style={{ fontSize:"clamp(1.4rem,4vw,1.9rem)", fontWeight:800, color:"#fff", margin:0, letterSpacing:"-0.02em" }}>Termos de Uso</h2>
              <p style={{ color:"rgba(255,255,255,.4)", fontSize:"0.82rem", marginTop:8 }}>Última actualização — Maio de 2026</p>
            </div>
          </div>

          {/* CONTEÚDO scrollável */}
          <div style={{ overflowY:"auto", padding:"28px 28px 32px", scrollbarWidth:"thin", scrollbarColor:"rgba(124,58,237,.3) transparent" }}>
            <p style={{ color:"rgba(255,255,255,.5)", fontSize:"0.84rem", lineHeight:1.7, marginBottom:24, paddingBottom:20, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
              Ao utilizar a plataforma LOPOS, aceita os seguintes termos e condições. Leia atentamente antes de prosseguir.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {sections.map((s, i) => (
                <div key={i} style={{
                  padding:"18px 20px", background:"rgba(255,255,255,.03)",
                  borderRadius:14, border:"1px solid rgba(255,255,255,.06)",
                  transition:"all .2s", cursor:"default",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(124,58,237,.08)"; e.currentTarget.style.borderColor="rgba(124,58,237,.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,.06)"; }}
                >
                  <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,rgba(124,58,237,.3),rgba(79,70,229,.3))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
                      <span style={{ fontSize:9, fontWeight:800, color:"rgba(168,85,247,.6)", fontFamily:"monospace" }}>{s.num}</span>
                    </div>
                    <div>
                      <h4 style={{ fontSize:"0.9rem", fontWeight:700, color:"#e2e8f0", marginBottom:6 }}>{s.titulo}</h4>
                      <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,.45)", lineHeight:1.65, margin:0 }}>{s.texto}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              style={{
                width:"100%", marginTop:24, padding:14,
                background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
                border:"none", borderRadius:12, color:"#fff",
                fontSize:"0.9rem", fontWeight:700, cursor:"pointer",
                fontFamily:"inherit", transition:"opacity .2s",
                boxShadow:"0 8px 24px rgba(124,58,237,.4)",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              Li e aceito os Termos de Uso ✓
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cModalFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes cModalSlideUp { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cPulse        { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.1);opacity:1} }
        @keyframes cFloat        { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </Portal>
  );
};

/* ═══════════════════════════════════════════════════════
   MODAL POLÍTICA DE PRIVACIDADE
═══════════════════════════════════════════════════════ */
const ModalPrivacidade = ({ onClose }) => {
  useEscClose(onClose);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const sections = [
    { num: "01", icon: "📋", titulo: "Dados que recolhemos",      texto: "Recolhemos informações fornecidas directamente: nome completo, e-mail, telefone, endereço de entrega e dados de pagamento. Automaticamente recolhemos IP, tipo de dispositivo, browser e padrões de navegação para melhorar a experiência." },
    { num: "02", icon: "🎯", titulo: "Finalidade do tratamento",  texto: "Os seus dados são utilizados exclusivamente para: processar e entregar pedidos, personalizar a experiência, comunicar actualizações sobre encomendas, e melhorar continuamente os nossos serviços. Nunca utilizamos dados para fins não relacionados com a LOPOS." },
    { num: "03", icon: "🤝", titulo: "Partilha de dados",         texto: "Nunca vendemos, alugamos ou partilhamos os seus dados com terceiros para fins comerciais. Partilhamos apenas com parceiros de logística para viabilizar entregas, e com autoridades competentes quando exigido por lei angolana." },
    { num: "04", icon: "🔒", titulo: "Segurança e retenção",      texto: "Implementamos encriptação SSL, hashing de senhas e monitorização contínua. Os dados pessoais são retidos pelo período mínimo necessário ao cumprimento das finalidades ou conforme exigido por lei." },
    { num: "05", icon: "✅", titulo: "Os seus direitos",           texto: "Tem o direito de aceder, rectificar, eliminar ou exportar os seus dados pessoais a qualquer momento. Para exercer estes direitos, contacte-nos através do e-mail de suporte indicado na plataforma." },
    { num: "06", icon: "🍪", titulo: "Cookies e rastreamento",    texto: "Utilizamos apenas cookies essenciais ao funcionamento da plataforma. Não utilizamos cookies de rastreamento de terceiros, publicidade comportamental ou analytics invasivos sem o seu consentimento explícito." },
  ];

  return (
    <Portal>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(14px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
          animation: "cModalFadeIn .22s ease",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: "640px", maxHeight: "92vh",
            borderRadius: "24px", overflow: "hidden",
            display: "flex", flexDirection: "column",
            background: "linear-gradient(135deg,#050d1a,#081420,#030a12)",
            border: "1px solid rgba(0,200,140,0.12)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.75)",
            animation: "cModalSlideUp .28s cubic-bezier(.23,1,.32,1)",
          }}
        >
          {/* HERO privacidade */}
          <div style={{ position:"relative", padding:"40px 32px 32px", background:"linear-gradient(135deg,#020d14,#041420,#030e18)", overflow:"hidden", flexShrink:0 }}>
            {[
              { top:"-30px", left:"-30px", size:160, color:"rgba(0,196,140,.2)", delay:"0s"   },
              { bottom:"-20px", right:"-20px", size:130, color:"rgba(0,150,100,.15)", delay:"1.5s" },
            ].map((o, i) => (
              <div key={i} style={{
                position:"absolute", borderRadius:"50%",
                width:o.size, height:o.size,
                top:o.top, left:o.left, bottom:o.bottom, right:o.right,
                background:`radial-gradient(circle,${o.color},transparent 70%)`,
                animation:`cPulse 3s ease-in-out ${o.delay} infinite`,
                pointerEvents:"none",
              }}/>
            ))}

            <button
              onClick={onClose}
              style={{
                position:"absolute", top:14, right:14,
                width:36, height:36, borderRadius:"50%",
                background:"rgba(0,196,140,.12)", border:"1px solid rgba(0,196,140,.25)",
                color:"rgba(0,196,140,.8)", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, zIndex:2, transition:"all .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(0,196,140,.25)"; e.currentTarget.style.color="#00c48c"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(0,196,140,.12)"; e.currentTarget.style.color="rgba(0,196,140,.8)"; }}
              aria-label="Fechar"
            >✕</button>

            {/* ícone escudo */}
            <div style={{ position:"relative", zIndex:2, textAlign:"center", marginBottom:20 }}>
              <div style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:80, height:80, borderRadius:24,
                background:"linear-gradient(135deg,#006644,#009966)",
                boxShadow:"0 16px 40px rgba(0,196,140,.4)",
                fontSize:36, animation:"cFloat 3s ease-in-out infinite",
              }}>🛡️</div>
            </div>

            <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
              <div style={{ fontSize:11, letterSpacing:"0.18em", color:"rgba(0,196,140,.8)", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Documento Legal</div>
              <h2 style={{ fontSize:"clamp(1.4rem,4vw,1.9rem)", fontWeight:800, color:"#fff", margin:0, letterSpacing:"-0.02em" }}>Política de Privacidade</h2>
              <p style={{ color:"rgba(255,255,255,.4)", fontSize:"0.82rem", marginTop:8 }}>Última actualização — Maio de 2026</p>
            </div>
          </div>

          {/* CONTEÚDO */}
          <div style={{ overflowY:"auto", padding:"28px 28px 32px", scrollbarWidth:"thin", scrollbarColor:"rgba(0,196,140,.3) transparent" }}>
            <p style={{ color:"rgba(255,255,255,.5)", fontSize:"0.84rem", lineHeight:1.7, marginBottom:24, paddingBottom:20, borderBottom:"1px solid rgba(0,196,140,.08)" }}>
              A LOPOS compromete-se a proteger a privacidade dos seus utilizadores. Este documento explica como recolhemos, usamos e protegemos os seus dados.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {sections.map((s, i) => (
                <div key={i} style={{
                  padding:"18px 20px", background:"rgba(0,196,140,.03)",
                  borderRadius:14, border:"1px solid rgba(0,196,140,.08)",
                  transition:"all .2s", cursor:"default",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background="rgba(0,196,140,.08)"; e.currentTarget.style.borderColor="rgba(0,196,140,.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="rgba(0,196,140,.03)"; e.currentTarget.style.borderColor="rgba(0,196,140,.08)"; }}
                >
                  <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,rgba(0,196,140,.3),rgba(0,150,100,.3))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
                      <span style={{ fontSize:9, fontWeight:800, color:"rgba(0,196,140,.6)", fontFamily:"monospace" }}>{s.num}</span>
                    </div>
                    <div>
                      <h4 style={{ fontSize:"0.9rem", fontWeight:700, color:"#e2e8f0", marginBottom:6 }}>{s.titulo}</h4>
                      <p style={{ fontSize:"0.8rem", color:"rgba(255,255,255,.45)", lineHeight:1.65, margin:0 }}>{s.texto}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:20, padding:"12px 16px", background:"rgba(0,196,140,.06)", borderRadius:10, border:"1px solid rgba(0,196,140,.12)", fontSize:"0.78rem", color:"rgba(255,255,255,.4)" }}>
              <span>Última actualização</span>
              <span style={{ color:"rgba(0,196,140,.7)", fontWeight:600 }}>Maio de 2026</span>
            </div>

            <button
              onClick={onClose}
              style={{
                width:"100%", marginTop:16, padding:14,
                background:"linear-gradient(135deg,#006644,#009966)",
                border:"none", borderRadius:12, color:"#fff",
                fontSize:"0.9rem", fontWeight:700, cursor:"pointer",
                fontFamily:"inherit", transition:"opacity .2s",
                boxShadow:"0 8px 24px rgba(0,196,140,.35)",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              Entendido — Fechar ✓
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cModalFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes cModalSlideUp { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cPulse        { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.1);opacity:1} }
        @keyframes cFloat        { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </Portal>
  );
};

/* ═══════════════════════════════════════════════════════
   INPUT DE SENHA COM OLHO
═══════════════════════════════════════════════════════ */
const PasswordInput = ({ value, onChange, placeholder, label, name, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          name={name}
          type={show ? "text" : "password"}
          className={`form-input ${error ? "error" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          style={{ paddingRight: "46px" }}
        />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:4, display:"flex", alignItems:"center", color:"var(--fg-muted)", transition:"color .2s" }}
          onMouseEnter={e => e.currentTarget.style.color="var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.color="var(--fg-muted)"}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      {error && <span className="form-error show">{error}</span>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   CADASTRO PRINCIPAL
═══════════════════════════════════════════════════════ */
const Cadastro = () => {
  const [step,          setStep]          = useState(1);
  const [form,          setForm]          = useState({ nome:"", email:"", telefone:"", senha:"", senha2:"" });
  const [codigoInput,   setCodigoInput]   = useState(["","","","","",""]);
  const [erros,         setErros]         = useState({});
  const [termos,        setTermos]        = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [loadingCodigo, setLoadingCodigo] = useState(false);
  const [errGeral,      setErrGeral]      = useState("");
  const [errCodigo,     setErrCodigo]     = useState("");
  const [reenvioTimer,  setReenvioTimer]  = useState(0);
  const [showTermos,    setShowTermos]    = useState(false);
  const [showPriv,      setShowPriv]      = useState(false);
  const [codigoGerado,  setCodigoGerado]  = useState("");

  const navigate = useNavigate();

  const validarEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const salvarSessao = (token, cliente) => {
    localStorage.setItem("luxe_token", token);
    localStorage.setItem("luxe_cliente", JSON.stringify(cliente));
    window.dispatchEvent(new CustomEvent("clienteAtualizado"));
  };

  const iniciarTimer = () => {
    setReenvioTimer(60);
    const iv = setInterval(() => {
      setReenvioTimer(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; });
    }, 1000);
  };

  /* ── Google OAuth ── */
  const googleLogin = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        const ui = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const decoded = await ui.json();
        const res = await fetch("https://lojalopos.infinityfreeapp.com/api/auth.php?action=google", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ email:decoded.email, nome:decoded.name, foto_url:decoded.picture }),
        });
        const json = await res.json();
        if (json.success) {
          salvarSessao(json.token, json.cliente);
          enviarEmailCadastro(decoded.name, decoded.email).catch(() => {});
          navigate("/");
        } else setErrGeral(json.message || "Erro ao registar com Google.");
      } catch { setErrGeral("Erro ao processar registo com Google."); }
    },
    onError: () => setErrGeral("Erro ao registar com Google."),
  });

  /* ── Passo 1: Enviar código ── */
  const handleEnviarCodigo = async () => {
    const e = {};
    if (!form.nome)                  e.nome     = "Nome obrigatório.";
    if (!validarEmail(form.email))   e.email    = "E-mail inválido.";
    if (!form.telefone)              e.telefone = "Telefone obrigatório.";
    if (form.senha.length < 8)       e.senha    = "Mínimo de 8 caracteres.";
    if (form.senha !== form.senha2)  e.senha2   = "As senhas não coincidem.";
    if (!termos)                     e.termos   = "Deve aceitar os termos.";
    setErros(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true); setErrGeral("");
    try {
      const res  = await fetch("https://lojalopos.infinityfreeapp.com/api/verificar_email.php", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action:"enviar", email:form.email }) });
      const json = await res.json();
      if (!json.success) { setErrGeral(json.message || "Erro ao gerar código."); setLoading(false); return; }
      const codigo = json.codigo;
      setCodigoGerado(codigo);
      const emailRes = await enviarCodigoVerificacao(form.email, codigo);
      if (!emailRes.success) {
        console.warn("EmailJS falhou:", emailRes.error);
        setErrGeral("⚠ Código gerado mas o e-mail pode ter falhado. Verifique a caixa de entrada ou tente reenviar.");
      }
      setStep(2); iniciarTimer();
    } catch (err) { console.error(err); setErrGeral("Erro de ligação ao servidor."); }
    setLoading(false);
  };

  /* ── Passo 2: Confirmar código ── */
  const handleConfirmarCodigo = async () => {
    const codigo = codigoInput.join("");
    if (codigo.length < 6) { setErrCodigo("Introduza o código completo de 6 dígitos."); return; }
    setLoadingCodigo(true); setErrCodigo("");
    try {
      const resConf = await fetch("https://lojalopos.infinityfreeapp.com/api/verificar_email.php", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action:"confirmar", email:form.email, codigo }) });
      const jsonConf = await resConf.json();
      if (!jsonConf.success) { setErrCodigo(jsonConf.message || "Código inválido ou expirado."); setLoadingCodigo(false); return; }
      const resCad = await fetch("https://lojalopos.infinityfreeapp.com/api/auth.php?action=cadastro", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ nome:form.nome, email:form.email, telefone:form.telefone, senha:form.senha }) });
      const jsonCad = await resCad.json();
      if (jsonCad.success) { salvarSessao(jsonCad.token, jsonCad.cliente); enviarEmailCadastro(form.nome, form.email).catch(() => {}); setStep(3); }
      else setErrCodigo(jsonCad.message || "Erro ao criar conta.");
    } catch { setErrCodigo("Erro de ligação ao servidor."); }
    setLoadingCodigo(false);
  };

  /* ── Reenviar código ── */
  const handleReenviar = async () => {
    if (reenvioTimer > 0) return;
    setErrCodigo("");
    try {
      let codigo = codigoGerado;
      if (!codigo) {
        const res  = await fetch("https://lojalopos.infinityfreeapp.com/api/verificar_email.php", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action:"enviar", email:form.email }) });
        const json = await res.json();
        if (!json.success) { setErrCodigo(json.message || "Erro ao reenviar código."); return; }
        codigo = json.codigo; setCodigoGerado(codigo);
      }
      const emailRes = await enviarCodigoVerificacao(form.email, codigo);
      if (!emailRes.success) { setErrCodigo("⚠ Não foi possível reenviar o e-mail."); return; }
      setCodigoInput(["","","","","",""]); iniciarTimer();
    } catch { setErrCodigo("Erro de ligação ao servidor."); }
  };

  /* ── Inputs de código ── */
  const handleDigito = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const novo = [...codigoInput]; novo[index] = value; setCodigoInput(novo);
    if (value && index < 5) document.getElementById(`dig-${index + 1}`)?.focus();
  };
  const handleDigitoKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codigoInput[index] && index > 0) document.getElementById(`dig-${index - 1}`)?.focus();
  };

  const GoogleSvg = () => (
    <svg width="19" height="19" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  /* Spinner reutilizável */
  const Spin = () => (
    <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"cSpin .7s linear infinite", display:"inline-block" }}/>
  );

  return (
    <>
      {/* ── Modais renderizados via Portal (sempre fora do DOM de overflow) ── */}
      {showTermos && <ModalTermos onClose={() => setShowTermos(false)} />}
      {showPriv   && <ModalPrivacidade onClose={() => setShowPriv(false)} />}

      <div className="page-wrap page-animate-in">
        <div className="page-inner">

          {/* ═══ STEP 1 — Formulário ═══ */}
          {step === 1 && (
            <>
              <p className="eyebrow" style={{ marginBottom:10 }}>Junte-se a nós</p>
              <h1 className="page-title">Criar a sua conta</h1>
              <p className="page-sub">
                Já tem conta?{" "}
                <a href="/login" style={{ color:"var(--accent)", fontWeight:600 }}>Entrar aqui</a>
              </p>

              <button onClick={() => googleLogin()} className="google-btn">
                <GoogleSvg /> Registar com Google
              </button>

              <div className="divider">
                <div className="divider-line"/>
                <span className="divider-text">ou</span>
                <div className="divider-line"/>
              </div>

              {errGeral && <div className="error-message">{errGeral}</div>}

              <div className="form-group">
                <label className="form-label">Nome completo</label>
                <input name="nome" type="text" className={`form-input ${erros.nome?"error":""}`} placeholder="O seu nome" value={form.nome} onChange={handleChange}/>
                {erros.nome && <span className="form-error show">{erros.nome}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input name="email" type="email" className={`form-input ${erros.email?"error":""}`} placeholder="o.seu@gmail.com" value={form.email} onChange={handleChange} inputMode="email" autoComplete="email"/>
                {erros.email && <span className="form-error show">{erros.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input name="telefone" type="tel" className={`form-input ${erros.telefone?"error":""}`} placeholder="+244 " value={form.telefone} onChange={handleChange} inputMode="tel" autoComplete="tel"/>
                {erros.telefone && <span className="form-error show">{erros.telefone}</span>}
              </div>

              <PasswordInput name="senha"  label="Senha"          placeholder="Mínimo 8 caracteres" value={form.senha}  onChange={handleChange} error={erros.senha}/>
              <PasswordInput name="senha2" label="Confirmar senha" placeholder="Repetir senha"       value={form.senha2} onChange={handleChange} error={erros.senha2}/>

              {/* Checkbox de termos */}
              <label className="terms-checkbox">
                <input type="checkbox" checked={termos} onChange={e => setTermos(e.target.checked)}/>
                <span>
                  Aceito os{" "}
                  {/* type="button" e e.preventDefault() para não submeter qualquer form pai */}
                  <button type="button" className="terms-link"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setShowTermos(true); }}>
                    Termos de Uso
                  </button>{" "}
                  e a{" "}
                  <button type="button" className="terms-link"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setShowPriv(true); }}>
                    Política de Privacidade
                  </button>
                </span>
              </label>
              {erros.termos && <span className="form-error show" style={{ display:"block", marginBottom:10 }}>{erros.termos}</span>}

              <button className="btn-primary btn-block" onClick={handleEnviarCodigo} disabled={loading}>
                {loading ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Spin/> A enviar código...</span> : "Continuar"}
              </button>
            </>
          )}

          {/* ═══ STEP 2 — Verificação ═══ */}
          {step === 2 && (
            <>
              <div className="verification-header">
                <div className="verification-icon">✉️</div>
                <h1 className="verification-title">Verifique o seu e-mail</h1>
                <p className="verification-sub">
                  Enviámos um código de 6 dígitos para<br/>
                  <strong className="verification-email">{form.email}</strong>
                </p>
                <p style={{ fontSize:".78rem", color:"var(--fg-muted)", marginTop:6 }}>
                  O código expira em 15 minutos. Verifique também o spam.
                </p>
              </div>

              <div className="code-container">
                {codigoInput.map((d, i) => (
                  <input key={i} id={`dig-${i}`} type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleDigito(i, e.target.value)}
                    onKeyDown={e => handleDigitoKeyDown(i, e)}
                    className="code-digit"
                    onFocus={e => e.target.style.borderColor="var(--accent)"}
                    onBlur={e  => e.target.style.borderColor=d?"var(--accent)":"var(--border)"}
                    autoFocus={i===0}/>
                ))}
              </div>

              {errCodigo && <div className="error-message" style={{ textAlign:"center" }}>{errCodigo}</div>}

              <button className="btn-primary btn-block" onClick={handleConfirmarCodigo}
                disabled={loadingCodigo || codigoInput.join("").length < 6} style={{ marginBottom:14 }}>
                {loadingCodigo ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><Spin/> A verificar...</span> : "Confirmar e criar conta"}
              </button>

              <div className="resend-container">
                Não recebeu?{" "}
                {reenvioTimer > 0
                  ? <span className="resend-timer">Reenviar em {reenvioTimer}s</span>
                  : <button onClick={handleReenviar} className="resend-btn">Reenviar código</button>}
              </div>

              <button onClick={() => { setStep(1); setErrGeral(""); setErrCodigo(""); setCodigoGerado(""); }} className="back-btn">
                ← Voltar e corrigir dados
              </button>
            </>
          )}

          {/* ═══ STEP 3 — Sucesso ═══ */}
          {step === 3 && (
            <div className="success-step">
              <div className="success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="success-title">Conta criada!</h1>
              <p className="success-sub">
                Bem-vindo à LOPOS, <strong>{form.nome}</strong>!<br/>
                A sua conta está pronta a usar.
              </p>
              <button className="btn-primary btn-block" onClick={() => navigate("/")}>
                Ir para a loja
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes cSpin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default Cadastro;
