import { useState, useEffect, useRef } from "react";
import { useTranslation } from "../i18n";



const BASE_API = "http://localhost/api";
const AI_URL = `${BASE_API}/ai.php`;

/* ══════════════════════════════════════════════════════════
   APIS REAIS do projecto (para estado/badges apenas)
══════════════════════════════════════════════════════════ */
const APIS_NOMES = ["pedidos", "produtos", "clientes", "financeiro", "entregas"];

const fmt = v =>
  new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(v || 0);

/* ══════════════════════════════════════════════════════════
   ÍCONES SVG (TODOS MANTIDOS DO ORIGINAL)
══════════════════════════════════════════════════════════ */
const Ico = ({ d, s = 16, c = "currentColor", fill = "none" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill}
    stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IcoAI = ({ s = 18, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="6" width="16" height="13" rx="3"/>
    <circle cx="9" cy="12" r="1.2" fill={c} stroke="none"/>
    <circle cx="15" cy="12" r="1.2" fill={c} stroke="none"/>
    <path d="M9 16 Q12 18 15 16"/>
    <path d="M12 6 V3"/>
    <circle cx="12" cy="2.5" r="0.8" fill={c} stroke="none"/>
    <path d="M4 10 H2 M20 10 H22"/>
  </svg>
);

const IcoSend = ({ s = 16, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" fill={c} stroke={c} />
  </svg>
);

const IcoChart = ({ s = 15, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IcoStock = ({ s = 15, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IcoAlarm = ({ s = 15, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IcoReport = ({ s = 15, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const IcoStar = ({ s = 15, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IcoUsers = ({ s = 15, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IcoMoney = ({ s = 15, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IcoTruck = ({ s = 15, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <path d="M16 8h4l3 5v4h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IcoRefresh = ({ s = 14, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IcoX = ({ s = 13, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IcoCopy = ({ s = 13, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IcoCheck = ({ s = 13, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IcoDb = ({ s = 13, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

/* ══════════════════════════════════════════════════════════
   SUGESTÕES RÁPIDAS (com ícones mantidos e traduções)
══════════════════════════════════════════════════════════ */
const getSugestoes = (t) => [
  { icon: <IcoChart s={12} />, label: t("ia_vendas"), prompt: `📊 ${t("prompt_sales")}` },
  { icon: <IcoStock s={12} />, label: t("ia_stock"), prompt: `📦 ${t("prompt_stock")}` },
  { icon: <IcoAlarm s={12} />, label: t("ia_alertas"), prompt: `⚠️ ${t("prompt_alerts")}` },
  { icon: <IcoReport s={12} />, label: t("ia_relatorio"), prompt: `📄 ${t("prompt_report")}` },
  { icon: <IcoStar s={12} />, label: t("ia_recomendacoes"), prompt: `⭐ ${t("prompt_recommendations")}` },
  { icon: <IcoUsers s={12} />, label: t("ia_clientes"), prompt: `👥 ${t("prompt_customers")}` },
  { icon: <IcoMoney s={12} />, label: t("ia_financeiro"), prompt: `💰 ${t("prompt_finance")}` },
  { icon: <IcoTruck s={12} />, label: t("ia_entregas"), prompt: `🚚 ${t("prompt_deliveries")}` },
];

/* ══════════════════════════════════════════════════════════
   FORMATA MARKDOWN → HTML
══════════════════════════════════════════════════════════ */
const md2html = txt =>
  txt
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^### (.*$)/gm, "<h4 style='margin:12px 0 5px;font-size:12.5px;font-weight:700;opacity:.85'>$1</h4>")
    .replace(/^## (.*$)/gm, "<h3 style='margin:14px 0 7px;font-size:14px;font-weight:800'>$1</h3>")
    .replace(/^# (.*$)/gm, "<h2 style='margin:0 0 9px;font-size:15px;font-weight:900'>$1</h2>")
    .replace(/^[-•] (.*$)/gm, "<li style='margin:3px 0;padding-left:2px'>$1</li>")
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, "<ul style='margin:7px 0;padding-left:18px;list-style:disc'>$&</ul>")
    .replace(/^\d+\. (.*$)/gm, "<li style='margin:3px 0'>$1</li>")
    .replace(/`(.*?)`/g, "<code style='background:rgba(255,255,255,.1);padding:1px 5px;border-radius:4px;font-size:11px;font-family:monospace'>$1</code>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");

/* ══════════════════════════════════════════════════════════
   COMPONENTE MENSAGEM
══════════════════════════════════════════════════════════ */
const Mensagem = ({ msg, G, t }) => {
  const [copiado, setCopiado] = useState(false);
  const isIA = msg.papel === "assistant";

  const copiar = () => {
    navigator.clipboard?.writeText(msg.texto)
      .then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2200); });
  };

  return (
    <div style={{
      display: "flex", gap: "9px", alignItems: "flex-start",
      justifyContent: isIA ? "flex-start" : "flex-end",
      marginBottom: "16px",
      animation: "gaiIn .22s ease",
    }}>
      {/* Avatar IA */}
      {isIA && (
        <div style={{
          width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
          background: `linear-gradient(135deg,${G.accent},${G.rose || "#c084fc"})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginTop: "2px", boxShadow: `0 2px 10px ${G.accent}45`,
        }}>
          <IcoAI s={16} c="#fff" />
        </div>
      )}

      <div style={{ maxWidth: "86%", minWidth: "60px" }}>
        {/* Label IA */}
        {isIA && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: G.accent, letterSpacing: ".02em" }}>LOPOS IA</span>
            <span style={{
              fontSize: "9px", color: "#c084fc",
              background: "rgba(192,132,252,.12)", padding: "1px 6px",
              borderRadius: "99px", border: "1px solid rgba(192,132,252,.25)",
              fontWeight: "700",
            }}>{t("ia_powered")}</span>
          </div>
        )}

        {/* Balão */}
        <div style={{
          padding: isIA ? "13px 15px" : "10px 14px",
          borderRadius: isIA ? "3px 14px 14px 14px" : "14px 3px 14px 14px",
          background: isIA
            ? G.cardAlt
            : `linear-gradient(135deg,${G.accent}dd,${G.accent})`,
          border: isIA ? `1px solid ${G.border}` : "none",
          color: isIA ? G.text : "#fff",
          fontSize: "13px", lineHeight: "1.75",
          boxShadow: isIA
            ? "none"
            : `0 3px 14px ${G.accent}40`,
        }}>
          {msg.loading ? (
            <div style={{ display: "flex", gap: "4px", alignItems: "center", padding: "4px 2px" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: G.accent,
                  animation: `gaiBounce .9s ease-in-out ${i * .18}s infinite`,
                }} />
              ))}
            </div>
          ) : isIA ? (
            <div dangerouslySetInnerHTML={{ __html: md2html(msg.texto) }} style={{ lineHeight: "1.8" }} />
          ) : (
            <span>{msg.texto}</span>
          )}
        </div>

        {/* Footer mensagem */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          marginTop: "4px",
          justifyContent: isIA ? "flex-start" : "flex-end",
        }}>
          <span style={{ fontSize: "10px", color: G.muted }}>{msg.hora}</span>
          {isIA && !msg.loading && (
            <button onClick={copiar}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: copiado ? G.success : G.muted,
                display: "flex", alignItems: "center", gap: "3px",
                fontSize: "10px", padding: "2px 5px", borderRadius: "5px",
                transition: "all .15s", fontFamily: "inherit",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${G.accent}12`}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              {copiado
                ? <><IcoCheck s={11} c={G.success} /> {t("ia_copiado")}</>
                : <><IcoCopy s={11} /> {t("ia_copiar")}</>}
            </button>
          )}
        </div>
      </div>

      {/* Avatar utilizador */}
      {!isIA && (
        <div style={{
          width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0,
          background: G.cardAlt, border: `1px solid ${G.border}`,
          display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={G.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════ */
const GAI = ({ G, operador }) => {
  const { t } = useTranslation();
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [apiEstado, setApiEstado] = useState("idle");

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const historicoRef = useRef([]);

  const SUGESTOES = getSugestoes(t);

  const hora = () => new Date().toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" });

  /* Scroll automático */
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensagens]);

  /* Mensagem de boas-vindas traduzida */
  useEffect(() => {
    const nomeUsuario = operador?.nome ? `, **${operador.nome.split(" ")[0]}**` : "";
    setMensagens([{
      id: 1, papel: "assistant", hora: hora(),
      texto: `${t("ola")}${nomeUsuario}! 👋\n\n${t("ia_analise_completa")}\n\n✅ ${t("ia_ligada")}\n\n💡 ${t("ia_sugestoes_rapidas")}`,
    }]);
    verificarAPI();
  }, [t, operador]);

  /* Verifica se ai.php responde */
  const verificarAPI = async () => {
    setApiEstado("loading");
    try {
      const resposta = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: "user", content: "ping" }] }),
      });
      const dados = await resposta.json();
      setApiEstado(dados.success !== false ? "ok" : "erro");
    } catch {
      setApiEstado("erro");
    }
  };

  /* ── ENVIAR MENSAGEM ── */
  const enviar = async (textoOverride) => {
    const texto = (textoOverride || input).trim();
    if (!texto || carregando) return;
    setInput("");
    
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const uid = Date.now();
    const msgUser = { id: uid, papel: "user", hora: hora(), texto };
    const msgLoading = { id: uid + 1, papel: "assistant", hora: hora(), texto: "", loading: true };
    setMensagens(prev => [...prev, msgUser, msgLoading]);
    setCarregando(true);

    /* Actualiza histórico */
    historicoRef.current = [
      ...historicoRef.current,
      { role: "user", content: texto },
    ].slice(-14);

    try {
      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historicoRef.current,
          system: "Você é o assistente LOPOS IA especialista em gestão de negócios. Responda em português de Angola.",
        }),
      });

      if (!res.ok) {
        const errTxt = await res.text();
        throw new Error(`HTTP ${res.status}: ${errTxt.slice(0, 200)}`);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || t("erro_ligacao"));
      }

      const textoResp = data.texto || t("erro");

      historicoRef.current = [
        ...historicoRef.current,
        { role: "assistant", content: textoResp },
      ].slice(-14);

      setApiEstado("ok");
      setMensagens(prev => prev.map(m =>
        m.loading
          ? { ...m, loading: false, texto: textoResp, hora: hora() }
          : m
      ));

    } catch (e) {
      console.error("GAI erro:", e);

      let msgErro = `❌ **${t("erro_ligacao")}**\n\n`;
      if (e.message?.includes("Failed to fetch") || e.message?.includes("NetworkError")) {
        msgErro += t("erro_ligacao");
      } else if (e.message?.includes("API key") || e.message?.includes("authentication")) {
        msgErro += t("erro_ligacao");
      } else if (e.message?.includes("404")) {
        msgErro += t("erro_ligacao");
      } else {
        msgErro += `${t("erro")}: \`${e.message}\``;
      }

      setApiEstado("erro");
      setMensagens(prev => prev.map(m =>
        m.loading
          ? { ...m, loading: false, texto: msgErro, hora: hora() }
          : m
      ));
    }

    setCarregando(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const limparChat = () => {
    historicoRef.current = [];
    setMensagens([{
      id: Date.now(), papel: "assistant", hora: hora(),
      texto: t("ia_limpar"),
    }]);
  };

  const analisarTudo = () =>
    enviar(t("ia_analise_completa"));

  /* Badge estado traduzido */
  const badgeCfg = {
    idle: { cor: G.muted, txt: t("ia_a_iniciar"), dot: false },
    loading: { cor: G.muted, txt: t("ia_a_ligar"), dot: true },
    ok: { cor: G.success, txt: t("ia_ligada"), dot: true },
    erro: { cor: G.danger, txt: t("ia_sem_ligacao"), dot: false },
  }[apiEstado] || { cor: G.muted, txt: "...", dot: false };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @keyframes gaiIn     { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gaiBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes gaiSpin   { to{transform:rotate(360deg)} }
        .gai-scroll::-webkit-scrollbar{width:4px}
        .gai-scroll::-webkit-scrollbar-thumb{background:${G.border};border-radius:99px}
        .gai-sug{transition:all .17s;cursor:pointer}
        .gai-sug:hover{transform:translateY(-2px);border-color:${G.accent}!important;color:${G.accent}!important;background:${G.accent}10!important}
        .gai-textarea::-webkit-scrollbar{display:none}
      `}</style>

      {/* ══ HEADER ══ */}
      <div style={{
        padding: "15px 18px 12px",
        background: G.cardAlt,
        borderBottom: `1px solid ${G.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", gap: "10px", flexWrap: "wrap" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              position: "relative", width: "42px", height: "42px", borderRadius: "13px",
              background: `linear-gradient(135deg,${G.accent},${G.rose || "#c084fc"})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 18px ${G.accent}45`,
              flexShrink: 0,
            }}>
              <IcoAI s={20} c="#fff" />
              <div style={{
                position: "absolute", top: "-3px", right: "-3px",
                width: "10px", height: "10px", borderRadius: "50%",
                background: badgeCfg.cor,
                border: `2px solid ${G.card || "#000"}`,
              }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ fontSize: "16px", fontWeight: "900", color: G.text }}>
                  LOPOS <span style={{ color: G.accent }}>IA</span>
                </span>
                <span style={{
                  fontSize: "9px", background: `linear-gradient(135deg,${G.accent},${G.rose || "#c084fc"})`,
                  color: "#fff", padding: "2px 7px", borderRadius: "99px", fontWeight: "800",
                }}>BETA</span>
              </div>
              <div style={{ fontSize: "11px", color: G.muted, marginTop: "2px" }}>
                {t("ia_powered")}
              </div>
            </div>
          </div>

          {/* Controlos */}
          <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
            {/* Badge BD */}
            <div style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 10px", borderRadius: "99px",
              background: `${badgeCfg.cor}12`, border: `1px solid ${badgeCfg.cor}30`,
              fontSize: "10px", color: badgeCfg.cor, fontWeight: "700",
            }}>
              {badgeCfg.dot
                ? <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: badgeCfg.cor }} />
                : <IcoDb s={11} c={badgeCfg.cor} />}
              {badgeCfg.txt}
            </div>

            {/* Actualizar */}
            <button onClick={verificarAPI} title={t("ia_actualizar")}
              style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${G.accent}12`, border: `1px solid ${G.border}`, color: G.accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "rotate(180deg)"; e.currentTarget.style.borderColor = G.accent; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "rotate(0)"; e.currentTarget.style.borderColor = G.border; }}>
              <IcoRefresh s={12} c={G.accent} />
            </button>

            {/* Limpar */}
            <button onClick={limparChat} title={t("ia_limpar")}
              style={{ width: "30px", height: "30px", borderRadius: "8px", background: `${G.danger}10`, border: `1px solid ${G.danger}25`, color: G.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = `${G.danger}20`}
              onMouseLeave={e => e.currentTarget.style.background = `${G.danger}10`}>
              <IcoX s={12} c={G.danger} />
            </button>
          </div>
        </div>

        {/* Botão análise completa */}
        <button
          onClick={analisarTudo}
          disabled={carregando}
          style={{
            width: "100%", padding: "10px 16px", borderRadius: "11px",
            border: "none",
            background: carregando
              ? G.cardAlt
              : `linear-gradient(135deg,${G.accent},${G.rose || "#c084fc"})`,
            color: carregando ? G.muted : "#fff",
            cursor: carregando ? "wait" : "pointer",
            fontFamily: "inherit", fontSize: "13px", fontWeight: "700",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            transition: "all .2s",
            boxShadow: carregando ? "none" : `0 3px 18px ${G.accent}38`,
          }}
          onMouseEnter={e => { if (!carregando) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 24px ${G.accent}50`; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = carregando ? "none" : `0 3px 18px ${G.accent}38`; }}
        >
          {carregando
            ? <>
              <div style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "gaiSpin .8s linear infinite" }} />
              {t("ia_a_analisar")}
            </>
            : <><IcoChart s={14} c="#fff" /> {t("ia_analise_completa")}</>}
        </button>
      </div>

      {/* ══ SUGESTÕES ══ */}
      <div style={{
        padding: "9px 18px 8px",
        borderBottom: `1px solid ${G.border}`,
        flexShrink: 0,
      }}>
        <p style={{ fontSize: "10px", color: G.muted, textTransform: "uppercase", letterSpacing: "1.2px", fontWeight: "700", marginBottom: "7px" }}>
          {t("ia_sugestoes_rapidas")}
        </p>
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "3px", scrollbarWidth: "none" }}>
          {SUGESTOES.map((sg, i) => (
            <button
              key={i}
              onClick={() => enviar(sg.prompt)}
              disabled={carregando}
              className="gai-sug"
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "6px 11px", borderRadius: "99px",
                border: `1px solid ${G.border}`, background: G.cardAlt,
                color: G.muted, fontFamily: "inherit", fontSize: "11px",
                fontWeight: "600", whiteSpace: "nowrap", flexShrink: 0,
                opacity: carregando ? .55 : 1,
                cursor: carregando ? "not-allowed" : "pointer",
              }}
            >
              <span style={{ color: G.accent, display: "flex" }}>{sg.icon}</span>
              {sg.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ CHAT ══ */}
      <div
        ref={scrollRef}
        className="gai-scroll"
        style={{
          flex: 1, overflowY: "auto", padding: "18px 18px 8px",
          display: "flex", flexDirection: "column",
          scrollbarWidth: "thin", scrollbarColor: `${G.border} transparent`,
        }}
      >
        {mensagens.map(msg => (
          <Mensagem key={msg.id} msg={msg} G={G} t={t} />
        ))}
      </div>

      {/* ══ INPUT ══ */}
      <div style={{ padding: "10px 16px 14px", background: G.card, borderTop: `1px solid ${G.border}`, flexShrink: 0 }}>
        <div style={{
          display: "flex", gap: "9px", alignItems: "flex-end",
          background: G.cardAlt, border: `1px solid ${G.border}`,
          borderRadius: "13px", padding: "9px 11px",
          transition: "border-color .2s",
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = G.accent}
          onBlurCapture={e => e.currentTarget.style.borderColor = G.border}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
            placeholder={t("ia_placeholder")}
            rows={1}
            className="gai-textarea"
            style={{
              flex: 1, background: "none", border: "none",
              color: G.text, fontSize: "13px", resize: "none",
              fontFamily: "inherit", lineHeight: "1.55",
              maxHeight: "90px", overflowY: "auto", outline: "none",
              scrollbarWidth: "none",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 90) + "px";
            }}
          />
          <button
            onClick={() => enviar()}
            disabled={!input.trim() || carregando}
            style={{
              width: "34px", height: "34px", borderRadius: "9px",
              background: (!input.trim() || carregando)
                ? G.border
                : `linear-gradient(135deg,${G.accent},${G.rose || "#c084fc"})`,
              border: "none",
              cursor: (!input.trim() || carregando) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all .2s",
            }}
            onMouseEnter={e => { if (input.trim() && !carregando) { e.currentTarget.style.transform = "scale(1.08)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <IcoSend s={13} c={(!input.trim() || carregando) ? G.muted : "#fff"} />
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px", paddingLeft: "1px" }}>
          <span style={{ fontSize: "10px", color: G.muted }}>{t("ia_enter_hint")}</span>
          <span style={{ fontSize: "10px", color: G.muted }}>
            <span style={{ color: G.accent, fontWeight: "600" }}>Gemini Pro</span> · ai.php
          </span>
        </div>
      </div>
    </div>
  );
};

export default GAI;