import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, IDIOMAS } from "../i18n";
import GDashboard from "../gestao/GDashboard";
import GPedidos from "../gestao/GPedidos";
import GFinanceiro from "../gestao/GFinanceiro";
import GProdutos from "../gestao/GProdutos";
import GClientes from "../gestao/GClientes";
import GConfigs from "../gestao/GConfigs";
import GRelatorio from "../gestao/GRelatorio";
import GEntregas from "../gestao/GEntregas";

const API = "http://localhost/api/login_operador.php";

const MENUS_DEF = [
  { key: "dashboard", label: "dashboard",    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "pedidos",   label: "pedidos",      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key: "entregas",  label: "entregas",     icon: "M1 3h15v13H1zM16 8h4l3 5v4h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" },
  { key: "financeiro",label: "financeiro",   icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "produtos",  label: "produtos",     icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { key: "clientes",  label: "clientes",     icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "relatorio", label: "relatorios",   icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", destaque: true },
  { key: "configs",   label: "configuracoes",icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

const PAGINAS = {
  dashboard: GDashboard,
  pedidos:   GPedidos,
  entregas:  GEntregas,
  financeiro:GFinanceiro,
  produtos:  GProdutos,
  clientes:  GClientes,
  relatorio: GRelatorio,
  configs:   GConfigs,
};

const PERMISSOES = {
  admin:    ["dashboard","pedidos","entregas","financeiro","produtos","clientes","relatorio","configs","utilizadores"],
  gerente:  ["dashboard","pedidos","produtos","clientes","relatorio","configs"],
  operador: ["dashboard","pedidos","clientes"],
};

const TIPOS_USUARIO = [
  { valor: "admin",    label: "Admin",    cor: "#1e73f0", corBg: "rgba(30,115,240,0.12)" },
  { valor: "gerente",  label: "Gerente",  cor: "#f59e0b", corBg: "rgba(245,158,11,0.12)" },
  { valor: "operador", label: "Operador", cor: "#6b80a0", corBg: "rgba(107,128,160,0.12)" },
];

const TEMAS = {
  dark: {
    nome: "dark", bg: "#050608", bgAlt: "#0a0c10", card: "#0d1117", cardAlt: "#12171f",
    sidebar: "#0A192F", border: "rgba(30,80,180,0.18)", border2: "rgba(30,80,180,0.3)",
    accent: "#1e73f0", accentLt: "#3d8ef5", accentBg: "rgba(30,115,240,0.12)",
    text: "#e8edf5", textSec: "#9aaac0", muted: "#5a6a80", faint: "#2a3548",
    success: "#00c48c", danger: "#e8294a", rose: "#f0416c", warning: "#f59e0b", purple: "#7c3aed",
    shadow: "0 24px 60px rgba(0,0,0,0.7)",
  },
  light: {
    nome: "light", bg: "#f0f4fb", bgAlt: "#e8eef8", card: "#ffffff", cardAlt: "#f5f8ff",
    sidebar: "#000080", border: "rgba(100,140,210,0.2)", border2: "rgba(100,140,210,0.35)",
    accent: "#1a5fd6", accentLt: "#2e78f0", accentBg: "rgba(26,95,214,0.1)",
    text: "#0d1829", textSec: "#3a4f6a", muted: "#6b80a0", faint: "#c5d0e0",
    success: "#059669", danger: "#dc2626", rose: "#e91e63", warning: "#d97706", purple: "#7c3aed",
    shadow: "0 24px 60px rgba(0,30,80,0.15)",
  },
};

// ============================================================
// ÍCONES
// ============================================================
const Ico = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const IcoOlho = ({ visivel }) => visivel ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IcoFechar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IcoMais = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IcoCadeado = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IcoLixeira = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);
const IcoLoading = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" style={{ animation: "gSpin 0.8s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const IcoVoltar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IcoMenu = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IcoEscudo = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IcoSetaDireita = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IcoAlarm = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ============================================================
// HELPERS
// ============================================================
function getPermissoes(operador) {
  if (operador?.permissoes?.length) return operador.permissoes;
  const tipo = (operador?.tipo_norm || operador?.tipo || "").toLowerCase();
  return PERMISSOES[tipo] || PERMISSOES.operador;
}

function getTipoConfig(tipo) {
  const t = (tipo || "").toLowerCase();
  return TIPOS_USUARIO.find(x => x.valor === t) || TIPOS_USUARIO[2];
}

const InputSenha = ({ value, onChange, placeholder = "••••••••", style = {}, T }) => {
  const [vis, setVis] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input type={vis ? "text" : "password"} value={value} onChange={onChange}
        placeholder={placeholder} style={{ ...style, paddingRight: "42px" }} />
      <button type="button" onClick={() => setVis(v => !v)} tabIndex={-1}
        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: vis ? T.accent : T.muted, cursor: "pointer", padding: "2px", display: "flex" }}>
        <IcoOlho visivel={vis} />
      </button>
    </div>
  );
};

const TipoBadge = ({ tipo, T, t }) => {
  const cfg = getTipoConfig(tipo);
  return (
    <span style={{ fontSize: "10px", fontWeight: "600", padding: "3px 8px", borderRadius: "99px", background: cfg.corBg, color: cfg.cor, border: `1px solid ${cfg.cor}25`, display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {t ? t(cfg.valor) : cfg.label}
    </span>
  );
};

const SelectTipo = ({ value, onChange, T }) => (
  <div style={{ position: "relative" }}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", appearance: "none", WebkitAppearance: "none",
        background: T.cardAlt, border: `1px solid ${T.border2}`, borderRadius: "8px",
        padding: "9px 36px 9px 28px", color: T.text, fontSize: "13px",
        fontWeight: "600", cursor: "pointer", outline: "none", fontFamily: "inherit",
      }}
    >
      <option value="operador">Operador</option>
      <option value="gerente">Gerente</option>
      <option value="admin">Admin</option>
    </select>
    <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
    </div>
    <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "8px", height: "8px", borderRadius: "50%", background: getTipoConfig(value).cor, pointerEvents: "none" }} />
  </div>
);

// ============================================================
// BANNER GERENTE
// ============================================================
const BannerGerente = ({ T, t }) => (
  <div style={{ background: `rgba(245,158,11,0.12)`, border: `1px solid rgba(245,158,11,0.3)`, borderRadius: "10px", padding: "10px 16px", margin: "10px", display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: T.warning, flexShrink: 0 }}>
    <IcoAlarm size={14} color={T.warning} />
    <span><strong>{t("acesso_limitado")}</strong> — {t("banner_gerente")}</span>
  </div>
);

// ============================================================
// MODAL PERFIL
// ============================================================
const ModalPerfil = ({ operador, T, onClose, onUpdate, toggleTema, temaAtual, t }) => {
  const [tab,        setTab]        = useState("perfil");
  const [fotoPreview,setFotoPreview]= useState(operador.foto_url || null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [nome,       setNome]       = useState(operador.nome  || "");
  const [email,      setEmail]      = useState(operador.email || "");
  const [user,       setUser]       = useState(operador.user  || "");
  const [senha,      setSenha]      = useState("");
  const [senha2,     setSenha2]     = useState("");
  const [salvando,   setSalvando]   = useState(false);
  const [msg,        setMsg]        = useState("");
  const [usuarios,   setUsuarios]   = useState([]);
  const [loadingU,   setLoadingU]   = useState(false);
  const [showCad,    setShowCad]    = useState(false);
  const [nuNome,     setNuNome]     = useState("");
  const [nuUser,     setNuUser]     = useState("");
  const [nuEmail,    setNuEmail]    = useState("");
  const [nuSenha,    setNuSenha]    = useState("");
  const [nuTipo,     setNuTipo]     = useState("operador");
  const [nuMsg,      setNuMsg]      = useState("");
  const [nuLoad,     setNuLoad]     = useState(false);

  const fotoRef = useRef();

  const tipoNorm        = (operador?.tipo_norm || operador?.tipo || "").toLowerCase();
  const isAdmin         = tipoNorm === "admin";
  const isSuperAdmin    = !!operador.super_admin;
  const podeVerUsuarios = isAdmin || isSuperAdmin;
  const userIdAtual     = operador.id_usuario;
  const inicial         = (operador.nome || "?").charAt(0).toUpperCase();

  useEffect(() => { if (tab === "usuarios" && podeVerUsuarios) carregarU(); }, [tab]);

  const carregarU = async () => {
    setLoadingU(true);
    try {
      const r = await fetch(`${API}?solicitante_id=${operador.id_usuario}`);
      const d = await r.json();
      if (d.success) setUsuarios(d.data || []);
    } catch { }
    setLoadingU(false);
  };

  const handleFoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = ev => { setFotoPreview(ev.target.result); setFotoBase64(ev.target.result); };
    rd.readAsDataURL(f);
    e.target.value = "";
  };

  const handleSalvar = async () => {
    if (senha && senha !== senha2) { setMsg(t("senhas_nao_coinc")); return; }
    if (senha && senha.length < 6) { setMsg(t("senha_min")); return; }
    setSalvando(true); setMsg("");
    try {
      const r = await fetch(API, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "actualizar_perfil", id_usuario: operador.id_usuario, nome, email, user, senha: senha || undefined, foto_base64: fotoBase64 || undefined })
      });
      const d = await r.json();
      if (d.success) {
        setMsg("✓ " + t("perfil_guardado"));
        setSenha(""); setSenha2("");
        if (onUpdate) onUpdate(d.operador);
        setTimeout(() => setMsg(""), 3000);
      } else setMsg(t("erro") + " " + (d.message || ""));
    } catch { setMsg(t("erro_ligacao")); }
    setSalvando(false);
  };

  const handleCriar = async () => {
    if (!nuNome || !nuUser || !nuSenha) { setNuMsg(t("preencher_campos")); return; }
    if (nuSenha.length < 4) { setNuMsg("Senha mínimo 4 caracteres."); return; }
    setNuLoad(true); setNuMsg("");
    try {
      const r = await fetch(API, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "criar_usuario", solicitante_id: operador.id_usuario, nome: nuNome, user: nuUser, email: nuEmail, senha: nuSenha, tipo: nuTipo })
      });
      const d = await r.json();
      if (d.success) {
        setNuMsg("✓ " + (d.message || t("perfil_guardado")));
        setNuNome(""); setNuUser(""); setNuEmail(""); setNuSenha(""); setNuTipo("operador");
        carregarU();
        setTimeout(() => { setNuMsg(""); setShowCad(false); }, 2500);
      } else setNuMsg(t("erro") + ": " + (d.message || ""));
    } catch { setNuMsg(t("erro_ligacao")); }
    setNuLoad(false);
  };

  const toggleAtivo = async (id, ativo) => {
    if (id === userIdAtual) return;
    try {
      await fetch(API, { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitante_id: operador.id_usuario, id_usuario: id, ativo: !ativo }) });
      carregarU();
    } catch { }
  };

  const remover = async (id) => {
    if (id === userIdAtual) return;
    if (!window.confirm(t("remover_confirmacao"))) return;
    try {
      await fetch(`${API}?solicitante_id=${operador.id_usuario}&id_usuario=${id}`, { method: "DELETE" });
      carregarU();
    } catch { }
  };

  const inp = { width: "100%", background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: "8px", padding: "8px 12px", color: T.text, fontSize: "13px", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: "10px", color: T.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px", fontWeight: "600" };

  const ToggleTemaButton = () => (
    <button onClick={toggleTema}
      style={{ width: "100%", padding: "10px", borderRadius: "10px", background: T.accentBg, border: `1px solid ${T.border2}`, color: T.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "12px", fontWeight: "600", fontFamily: "inherit" }}>
      {temaAtual === "dark" ? (
        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg><span>{t("modo_claro")}</span></>
      ) : (
        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><span>{t("modo_escuro")}</span></>
      )}
    </button>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", animation: "gFadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, border: `1px solid ${T.border2}`, borderRadius: "24px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: T.shadow, animation: "gSlideUp 0.28s cubic-bezier(0.23,1,0.32,1)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 0", background: `linear-gradient(135deg, ${T.cardAlt}, ${T.card})`, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div onClick={() => fotoRef.current?.click()} style={{ width: "56px", height: "56px", borderRadius: "50%", background: `linear-gradient(135deg, ${T.accent}, ${T.rose})`, padding: "2px", cursor: "pointer" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", background: T.cardAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {fotoPreview ? <img src={fotoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "20px", fontWeight: "900", color: T.accent }}>{inicial}</span>}
                </div>
              </div>
              <input ref={fotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />
              <div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: T.text }}>{operador.nome}</div>
                <div style={{ fontSize: "11px", color: T.muted }}>@{operador.user}</div>
                <div style={{ marginTop: "4px" }}><TipoBadge tipo={operador.tipo} T={T} t={t} /></div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IcoFechar size={12} /></button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "6px" }}>
            {["perfil", podeVerUsuarios ? "usuarios" : null].filter(Boolean).map(k => (
              <button key={k} onClick={() => setTab(k)}
                style={{ padding: "8px 14px", fontSize: "12px", fontWeight: tab === k ? "700" : "500", color: tab === k ? T.accent : T.muted, borderBottom: `2px solid ${tab === k ? T.accent : "transparent"}`, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                {k === "perfil" ? t("meu_perfil") : t("utilizadores")}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* ── TAB PERFIL ── */}
          {tab === "perfil" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div><label style={lbl}>{t("nome_completo")}</label><input value={nome} onChange={e => setNome(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>{t("nome_utilizador")}</label><input value={user} onChange={e => setUser(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>{t("email")}</label><input value={email} onChange={e => setEmail(e.target.value)} style={inp} /></div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "6px 0" }}>
                <div style={{ flex: 1, height: "1px", background: T.border }} />
                <span style={{ fontSize: "9px", color: T.muted }}>{t("redefinir_senha")}</span>
                <div style={{ flex: 1, height: "1px", background: T.border }} />
              </div>
              <div><label style={lbl}>{t("nova_senha")}</label><InputSenha value={senha} onChange={e => setSenha(e.target.value)} T={T} style={inp} /></div>
              {senha && <div><label style={lbl}>{t("confirmar_senha")}</label><InputSenha value={senha2} onChange={e => setSenha2(e.target.value)} T={T} style={{ ...inp, borderColor: senha2 && senha !== senha2 ? T.danger : T.border }} /></div>}
              {msg && <div style={{ padding: "10px", borderRadius: "8px", background: msg.includes("✓") ? `${T.success}12` : `${T.danger}12`, color: msg.includes("✓") ? T.success : T.danger, fontSize: "12px" }}>{msg}</div>}
              <button onClick={handleSalvar} disabled={salvando}
                style={{ padding: "10px", background: salvando ? T.cardAlt : T.accent, color: salvando ? T.muted : "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: salvando ? "wait" : "pointer", fontFamily: "inherit" }}>
                {salvando ? t("a_guardar") : t("guardar")}
              </button>
              <ToggleTemaButton />
            </div>
          )}

          {/* ── TAB UTILIZADORES ── */}
          {tab === "usuarios" && podeVerUsuarios && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: T.text }}>{t("utilizadores_sistema")}</div>
                  <div style={{ fontSize: "11px", color: T.muted }}>{usuarios.length} {t("registados")}</div>
                </div>
                <button onClick={() => setShowCad(!showCad)}
                  style={{ padding: "6px 12px", borderRadius: "8px", background: showCad ? `${T.rose}12` : T.accentBg, border: `1px solid ${showCad ? T.rose : T.accent}30`, color: showCad ? T.rose : T.accent, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontFamily: "inherit" }}>
                  <IcoMais size={10} />
                  {showCad ? t("cancelar") : t("novo_utilizador")}
                </button>
              </div>

              {/* Formulário criar utilizador */}
              {showCad && (
                <div style={{ background: T.cardAlt, borderRadius: "12px", padding: "16px", marginBottom: "16px", border: `1px solid ${T.border}` }}>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <div><label style={lbl}>{t("nome_completo")}</label><input placeholder="Nome completo" value={nuNome} onChange={e => setNuNome(e.target.value)} style={inp} /></div>
                    <div><label style={lbl}>{t("nome_utilizador")}</label><input placeholder="nome_utilizador" value={nuUser} onChange={e => setNuUser(e.target.value)} style={inp} /></div>
                    <div><label style={lbl}>{t("email")}</label><input placeholder="email@exemplo.com" value={nuEmail} onChange={e => setNuEmail(e.target.value)} style={inp} /></div>
                    <div><label style={lbl}>{t("senha")}</label><InputSenha value={nuSenha} onChange={e => setNuSenha(e.target.value)} T={T} style={inp} /></div>
                    <div>
                      <label style={lbl}>Tipo de acesso</label>
                      <SelectTipo value={nuTipo} onChange={setNuTipo} T={T} />
                      <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: T.muted }}>
                        <span>Permissões:</span>
                        <TipoBadge tipo={nuTipo} T={T} />
                        <span style={{ color: getTipoConfig(nuTipo).cor }}>
                          {nuTipo === "admin"    && "Acesso total ao painel"}
                          {nuTipo === "gerente"  && "Acesso parcial ao painel"}
                          {nuTipo === "operador" && "Pedidos e clientes apenas"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {nuMsg && (
                    <div style={{ marginTop: "12px", padding: "10px", borderRadius: "8px", background: nuMsg.includes("✓") ? `${T.success}12` : `${T.danger}12`, color: nuMsg.includes("✓") ? T.success : T.danger, fontSize: "12px" }}>
                      {nuMsg}
                    </div>
                  )}
                  <button onClick={handleCriar} disabled={nuLoad}
                    style={{ width: "100%", marginTop: "14px", padding: "10px", background: nuLoad ? T.cardAlt : `linear-gradient(135deg, ${T.rose}, ${T.accent})`, color: nuLoad ? T.muted : "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: nuLoad ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "inherit" }}>
                    {nuLoad ? <><IcoLoading size={12} /> A criar…</> : <><IcoMais size={12} /> Criar utilizador</>}
                  </button>
                </div>
              )}

              {/* Lista de utilizadores */}
              {loadingU ? (
                <div style={{ textAlign: "center", padding: "30px" }}><IcoLoading size={20} color={T.accent} /></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {usuarios.map(u => {
                    const isCurrentUser = u.id_usuario === userIdAtual;
                    return (
                      <div key={u.id_usuario} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "10px", background: isCurrentUser ? `${T.accent}06` : "transparent", border: `1px solid ${isCurrentUser ? T.accent : T.border}` }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
                            <strong style={{ color: isCurrentUser ? T.accent : T.text, fontSize: "13px" }}>{u.nome}</strong>
                            {isCurrentUser && <span style={{ fontSize: "8px", padding: "2px 6px", borderRadius: "99px", background: `${T.accent}15`, color: T.accent, fontWeight: "600" }}>Tu</span>}
                            {!u.ativo && <span style={{ fontSize: "8px", padding: "2px 6px", borderRadius: "99px", background: `${T.danger}15`, color: T.danger, fontWeight: "600" }}>Bloqueado</span>}
                          </div>
                          <div style={{ fontSize: "11px", color: T.muted, marginBottom: "4px" }}>@{u.user} · {u.email}</div>
                          <TipoBadge tipo={u.tipo} T={T} t={t} />
                        </div>
                        {!isCurrentUser && (
                          <div style={{ display: "flex", gap: "6px", marginLeft: "10px" }}>
                            <button onClick={() => toggleAtivo(u.id_usuario, u.ativo)}
                              style={{ padding: "5px 8px", borderRadius: "7px", border: `1px solid ${u.ativo ? T.warning : T.success}`, background: u.ativo ? `${T.warning}10` : `${T.success}10`, color: u.ativo ? T.warning : T.success, cursor: "pointer", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px", fontFamily: "inherit" }}>
                              <IcoCadeado size={10} />
                              {u.ativo ? "Bloquear" : "Activar"}
                            </button>
                            <button onClick={() => remover(u.id_usuario)}
                              style={{ padding: "5px 8px", borderRadius: "7px", border: `1px solid ${T.danger}`, background: `${T.danger}10`, color: T.danger, cursor: "pointer", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px", fontFamily: "inherit" }}>
                              <IcoLixeira size={10} />
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes gFadeIn{from{opacity:0}to{opacity:1}} @keyframes gSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes gSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const Gestao = () => {
  const [tema,        setTema]        = useState(() => localStorage.getItem("lopos-tema") || "dark");
  const [autenticado, setAutenticado] = useState(false);
  const [operador,    setOperador]    = useState(null);
  const [permissoes,  setPermissoes]  = useState([]);
  const [username,    setUsername]    = useState("");
  const [senha,       setSenha]       = useState("");
  const [verSenha,    setVerSenha]    = useState(false);
  const [erro,        setErro]        = useState("");
  const [loading,     setLoading]     = useState(false);
  const [paginaAtiva, setPaginaAtiva] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenu,  setMobileMenu]  = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);
  const navigate = useNavigate();

  const { t, idioma, setIdioma } = useTranslation();
  const T = TEMAS[tema];

  const toggleTema = useCallback(() => {
    const novo = tema === "dark" ? "light" : "dark";
    setTema(novo);
    localStorage.setItem("lopos-tema", novo);
  }, [tema]);

  const mudarIdioma = useCallback((lang) => setIdioma(lang), [setIdioma]);

  const G = useMemo(() => ({
    ...T, nome: tema, toggleTema, temaAtual: tema,
    idioma, mudarIdioma, idiomas: IDIOMAS, t,
  }), [tema, idioma, T, toggleTema, mudarIdioma, t]);

  const MENUS = MENUS_DEF.filter(m => permissoes.includes(m.key));
  const isGerente = (operador?.tipo_norm || operador?.tipo || "").toLowerCase() === "gerente";

  const SB = { hover: "rgba(255,255,255,0.08)", activeBdr: "rgba(255,255,255,0.3)", textMut: "rgba(255,255,255,0.6)" };

  /* ── LOGIN ── */
  const handleLogin = async () => {
    if (!username || !senha) { setErro(t("preencher_campos")); return; }
    setLoading(true); setErro("");
    try {
      const res  = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acao: "login", user: username, senha }) });
      const data = await res.json();
      if (data.success) {
        setOperador(data.operador);
        const perms = getPermissoes(data.operador);
        setPermissoes(perms);
        setPaginaAtiva(perms.includes("dashboard") ? "dashboard" : perms[0] || "dashboard");
        setAutenticado(true);
      } else {
        setErro(data.message || t("credenciais_erradas"));
      }
    } catch { setErro(t("erro_ligacao")); }
    setLoading(false);
  };

  const handleSair = () => {
    setAutenticado(false); setOperador(null); setPermissoes([]);
    setUsername(""); setSenha(""); setErro("");
    setPaginaAtiva("dashboard"); setMobileMenu(false); setModalPerfil(false);
  };

  const mudarPagina = useCallback((k) => {
    if (!permissoes.includes(k)) return;
    setPaginaAtiva(k); setMobileMenu(false);
  }, [permissoes]);

  /* ── Botão Perfil ── */
  const BotaoPerfil = ({ collapsed = false }) => (
    <button onClick={() => setModalPerfil(true)}
      style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", padding: collapsed ? "8px" : "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", transition: "all 0.2s", fontFamily: "inherit" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,rgba(255,255,255,0.25),rgba(255,255,255,0.1))", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flex: "0 0 36px" }}>
        {operador?.foto_url ? <img src={operador.foto_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "14px", fontWeight: "900", color: "#fff" }}>{(operador?.nome || "?").charAt(0).toUpperCase()}</span>}
      </div>
      {!collapsed && (
        <>
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{operador?.nome?.split(" ")[0]}</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)", marginTop: "1px" }}>{(operador?.tipo_norm || operador?.tipo || "").toLowerCase()}</div>
          </div>
          <IcoSetaDireita size={12} color="rgba(255,255,255,0.5)" />
        </>
      )}
    </button>
  );

  const BtnLogout = ({ collapsed = false }) => (
    <button onClick={handleSair}
      style={{ width: collapsed ? "36px" : "100%", height: collapsed ? "36px" : "auto", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: collapsed ? "" : "8px 12px", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", fontWeight: "600", transition: "all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.background = `rgba(232,41,74,0.18)`; e.currentTarget.style.color = T.danger; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      {!collapsed && t("terminar_sessao")}
    </button>
  );

  const NavItem = ({ m, collapsed }) => {
    const activo = paginaAtiva === m.key;
    return (
      <div onClick={() => mudarPagina(m.key)}
        style={{ display: "flex", alignItems: "center", gap: "10px", padding: collapsed ? "8px" : "10px 10px", borderRadius: "10px", fontSize: "12px", cursor: "pointer", marginBottom: "4px", transition: "all 0.15s", color: activo ? "#fff" : SB.textMut, background: activo ? "rgba(255,255,255,0.12)" : "transparent", border: `1px solid ${activo ? SB.activeBdr : "transparent"}`, justifyContent: collapsed ? "center" : "flex-start" }}
        onMouseEnter={e => { if (!activo) e.currentTarget.style.background = SB.hover; }}
        onMouseLeave={e => { if (!activo) e.currentTarget.style.background = "transparent"; }}>
        <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: activo ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ico d={m.icon} size={14} />
        </span>
        {!collapsed && <span style={{ flex: 1, fontWeight: activo ? "700" : "500" }}>{t(m.label)}</span>}
        {!collapsed && m.destaque && <span style={{ fontSize: "8px", fontWeight: "800", padding: "2px 6px", borderRadius: "99px", background: T.rose, color: "#fff" }}>PDF</span>}
      </div>
    );
  };

  /* ── TELA DE LOGIN ── */
  if (!autenticado) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, padding: "16px" }}>
        <div style={{ position: "absolute", top: "20px", right: "20px" }}>
          <button onClick={toggleTema} style={{ width: "36px", height: "36px", borderRadius: "10px", background: T.accentBg, border: `1px solid ${T.border2}`, color: T.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {tema === "dark"
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
          </button>
        </div>
        <div style={{ background: T.card, borderRadius: "24px", padding: "40px 36px", width: "100%", maxWidth: "420px", boxShadow: T.shadow }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "32px", fontWeight: "900", color: T.text }}>LO<span style={{ color: T.accent }}>POS</span></div>
            <div style={{ fontSize: "11px", color: T.muted }}>{t("sistema_gestao")}</div>
          </div>
          <div style={{ background: T.accentBg, borderRadius: "10px", padding: "8px 14px", marginBottom: "20px", fontSize: "11px", color: T.accent, display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.accent }} />{t("acesso_restrito")}
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "10px", color: T.muted }}>{t("utilizador")}</label>
            <input type="text" placeholder={t("utilizador_ph")} value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", background: T.cardAlt, border: `1px solid ${T.border2}`, borderRadius: "10px", padding: "12px 14px", color: T.text, fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "10px", color: T.muted }}>{t("senha")}</label>
            <div style={{ position: "relative" }}>
              <input type={verSenha ? "text" : "password"} placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ width: "100%", background: T.cardAlt, border: `1px solid ${T.border2}`, borderRadius: "10px", padding: "12px 42px 12px 14px", color: T.text, fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <button onClick={() => setVerSenha(!verSenha)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted }}>
                <IcoOlho visivel={verSenha} />
              </button>
            </div>
          </div>
          {erro && <div style={{ background: `${T.danger}10`, color: T.danger, borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px" }}>{erro}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", padding: "12px", background: loading ? T.cardAlt : T.accent, color: loading ? T.muted : "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "13px", cursor: loading ? "wait" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {loading ? <><IcoLoading size={12} /> {t("a_verificar")}</> : t("entrar")}
          </button>
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "11px" }}>
              <IcoVoltar size={10} /> {t("voltar_loja")}
            </span>
          </div>
        </div>
        <style>{`@keyframes gSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ── LAYOUT PRINCIPAL ── */
  const PaginaAtual = PAGINAS[paginaAtiva] || GDashboard;
  const menuAtivo   = MENUS_DEF.find(m => m.key === paginaAtiva);

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden" }}>
      <style>{`
        @keyframes gFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes gSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes gSpin{to{transform:rotate(360deg)}}
        .g-sb-scroll::-webkit-scrollbar{width:3px}
        .g-sb-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:99px}
        .g-main-scroll::-webkit-scrollbar{width:4px}
        .g-main-scroll::-webkit-scrollbar-thumb{background:${T.border2};border-radius:99px}
        @media(min-width:768px){.g-topbar{display:none!important}}
        @media(max-width:767px){.g-sidebar{display:none!important}}
      `}</style>

      {modalPerfil && (
        <ModalPerfil operador={operador} T={T} onClose={() => setModalPerfil(false)}
          onUpdate={novoOp => { setOperador(prev => ({ ...prev, ...novoOp })); setPermissoes(getPermissoes({ ...operador, ...novoOp })); }}
          toggleTema={toggleTema} temaAtual={tema} t={t} />
      )}
      {mobileMenu && <div onClick={() => setMobileMenu(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 199 }} />}

      {/* Sidebar Desktop */}
      <aside className="g-sidebar" style={{ width: sidebarOpen ? "260px" : "64px", background: `linear-gradient(180deg,${T.sidebar},${T.sidebar}ee)`, borderRight: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", transition: "width 0.25s", position: "relative", zIndex: 10, boxShadow: "4px 0 24px rgba(0,0,0,0.4)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,${T.rose},${T.accent},${T.rose})` }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 14px" }}>
          {sidebarOpen && <span style={{ fontSize: "20px", fontWeight: "900", color: "#fff" }}>LO<span style={{ color: T.rose }}>POS</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">{sidebarOpen ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}</svg>
          </button>
        </div>
        <div style={{ height: "1px", background: "rgba(255,255,255,0.1)" }} />
        {sidebarOpen && isGerente && <BannerGerente T={T} t={t} />}
        <nav className="g-sb-scroll" style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {MENUS.map(m => <NavItem key={m.key} m={m} collapsed={!sidebarOpen} />)}
        </nav>
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {sidebarOpen ? (
            <>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: "99px", marginBottom: "10px", fontSize: "9px" }}>
                <IcoEscudo size={8} />{(operador?.tipo_norm || operador?.tipo || "").toLowerCase()}
              </div>
              <BotaoPerfil collapsed={false} />
              <div style={{ marginTop: "6px" }}><BtnLogout collapsed={false} /></div>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <BotaoPerfil collapsed={true} />
              <BtnLogout collapsed={true} />
            </div>
          )}
        </div>
      </aside>

      {/* Drawer Mobile */}
      <aside style={{ position: "fixed", top: 0, left: 0, width: "260px", height: "100vh", background: `linear-gradient(180deg,${T.sidebar},${T.sidebar}ee)`, borderRight: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", zIndex: 200, transform: mobileMenu ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontSize: "20px", fontWeight: "900", color: "#fff" }}>LO<span style={{ color: T.rose }}>POS</span></span>
          <button onClick={() => setMobileMenu(false)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><IcoFechar size={12} /></button>
        </div>
        {isGerente && <BannerGerente T={T} t={t} />}
        <nav style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
          {MENUS.map(m => <NavItem key={m.key} m={m} collapsed={false} />)}
        </nav>
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <BotaoPerfil collapsed={false} />
          <div style={{ marginTop: "6px" }}><BtnLogout collapsed={false} /></div>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", fontSize: "10px" }}>
              <IcoVoltar size={10} /> {t("voltar_loja")}
            </span>
          </div>
        </div>
      </aside>

      {/* Área Principal */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header className="g-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", height: "48px", background: T.card, borderBottom: `1px solid ${T.border}` }}>
          <button onClick={() => setMobileMenu(true)} style={{ background: "none", border: "none", cursor: "pointer" }}><IcoMenu size={16} /></button>
          <span style={{ fontSize: "18px", fontWeight: "900", color: T.text }}>LO<span style={{ color: T.accent }}>POS</span></span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", color: T.muted }}>{t(menuAtivo?.label || "")}</span>
            <button onClick={() => setModalPerfil(true)} style={{ width: "32px", height: "32px", borderRadius: "10px", background: `linear-gradient(135deg,${T.accent}30,${T.rose}20)`, border: `1px solid ${T.border2}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {operador?.foto_url ? <img src={operador.foto_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "12px", fontWeight: "800", color: T.accent }}>{(operador?.nome || "?").charAt(0).toUpperCase()}</span>}
            </button>
          </div>
        </header>
        <main className="g-main-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", background: T.bg }}>
          <PaginaAtual key={`${paginaAtiva}-${G.idioma}`} operador={operador} G={G} />
        </main>
      </div>
    </div>
  );
};

export default Gestao;