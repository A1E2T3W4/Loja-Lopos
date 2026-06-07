import { useState, useEffect, useRef } from "react";
import { useTranslation, IDIOMAS } from "../i18n";


/* ══════════════════════════════════════════════════════════════
   GConfigs.jsx — Configurações do sistema
   COM i18n COMPLETO
══════════════════════════════════════════════════════════════ */

const Svg = ({ ch, s=16, c="currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {ch}
  </svg>
);

const IcoStore   = ({s=18,c="currentColor"}) => <Svg s={s} c={c} ch={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}/>;
const IcoGlobe   = ({s=18,c="currentColor"}) => <Svg s={s} c={c} ch={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>}/>;
const IcoTax     = ({s=18,c="currentColor"}) => <Svg s={s} c={c} ch={<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>}/>;
const IcoUser    = ({s=18,c="currentColor"}) => <Svg s={s} c={c} ch={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}/>;
const IcoSave    = ({s=15,c="currentColor"}) => <Svg s={s} c={c} ch={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>}/>;
const IcoCheck   = ({s=13,c="currentColor"}) => <Svg s={s} c={c} ch={<polyline points="20 6 9 17 4 12"/>}/>;
const IcoAlert   = ({s=13,c="currentColor"}) => <Svg s={s} c={c} ch={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>;
const IcoRefresh = ({s=13,c="currentColor"}) => <Svg s={s} c={c} ch={<><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>}/>;
const IcoMail    = ({s=13,c="currentColor"}) => <Svg s={s} c={c} ch={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}/>;
const IcoPhone   = ({s=13,c="currentColor"}) => <Svg s={s} c={c} ch={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.53 2 2 0 0 1 3.59 1.37h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>}/>;
const IcoPin     = ({s=13,c="currentColor"}) => <Svg s={s} c={c} ch={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}/>;
const IcoLang    = ({s=18,c="currentColor"}) => <Svg s={s} c={c} ch={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>}/>;
const IcoLink    = ({s=13,c="currentColor"}) => <Svg s={s} c={c} ch={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>}/>;
const IcoSun     = ({s=18,c="currentColor"}) => <Svg s={s} c={c} ch={<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>}/>;
const IcoMoon    = ({s=18,c="currentColor"}) => <Svg s={s} c={c} ch={<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}/>;
const IcoPaint   = ({s=18,c="currentColor"}) => <Svg s={s} c={c} ch={<><circle cx="13.5" cy="6.5" r=".5" fill={c} stroke="none"/><circle cx="17.5" cy="10.5" r=".5" fill={c} stroke="none"/><circle cx="8.5" cy="7.5" r=".5" fill={c} stroke="none"/><circle cx="6.5" cy="12.5" r=".5" fill={c} stroke="none"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></>}/>;
const IcoSettings = ({s=22,c="currentColor"}) => <Svg s={s} c={c} ch={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>}/>;
const IcoLock2   = ({s=14,c="currentColor"}) => <Svg s={s} c={c} ch={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}/>;

/* ══════════════════════════════════════════════════════════════
   CARD WRAPPER
══════════════════════════════════════════════════════════════ */
const Card = ({ icon: Icon, title, children, accent, G, locked, lockMsg }) => (
  <div style={{ background:G.card, border:`1px solid ${locked?`${G.danger}30`:G.border}`, borderRadius:"18px", overflow:"hidden", position:"relative" }}>
    <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"16px 20px", borderBottom:`1px solid ${G.border}`, background:G.cardAlt }}>
      <div style={{ width:"34px", height:"34px", borderRadius:"10px", background:`${accent||G.accent}18`, border:`1px solid ${accent||G.accent}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon s={17} c={locked?G.danger:accent||G.accent}/>
      </div>
      <h3 style={{ fontSize:"14px", fontWeight:"700", color:locked?G.danger:G.text, margin:0, flex:1 }}>{title}</h3>
      {locked && (
        <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"10px", color:G.danger, fontWeight:"600", background:`${G.danger}12`, padding:"3px 8px", borderRadius:"99px", border:`1px solid ${G.danger}30` }}>
          <IcoLock2 s={11} c={G.danger}/> {lockMsg.split(" ")[0]}
        </div>
      )}
    </div>
    <div style={{ padding:"20px", position:"relative" }}>
      {locked && (
        <div style={{ position:"absolute", inset:0, background:`${G.bg}cc`, backdropFilter:"blur(3px)", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"10px", borderRadius:"0 0 18px 18px" }}>
          <IcoLock2 s={28} c={G.danger}/>
          <p style={{ fontSize:"13px", color:G.danger, fontWeight:"600", textAlign:"center", margin:0, padding:"0 20px" }}>{lockMsg}</p>
        </div>
      )}
      {children}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
const GConfigs = ({ operador, G }) => {
  const { t, idioma, setIdioma } = useTranslation();

  /* Detectar se é Gerente */
  const tipoNorm = (operador?.tipo_norm || operador?.tipo || "").toLowerCase();
  const isGerente = tipoNorm === "gerente";

  /* Estado do formulário num único objecto — evita re-render ao escrever */
  const [nome_loja,       setNomeLoja]      = useState("");
  const [nif,             setNif]           = useState("");
  const [telefone,        setTelefone]      = useState("");
  const [email,           setEmail]         = useState("");
  const [endereco,        setEndereco]      = useState("");
  const [url_site,        setUrlSite]       = useState("");
  const [api_base_url,    setApiBaseUrl]    = useState("");
  const [emailjs_service, setEmailjsService] = useState("");
  const [emailjs_key,     setEmailjsKey]   = useState("");
  const [iva,             setIva]           = useState(14);
  const [taxa_km,         setTaxaKm]        = useState(100);
  const [compras_vip,     setComprasVip]    = useState(10);

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);
  const [testApi, setTestApi] = useState(null);

  /* Tema — usa G.toggleTema e G.temaAtual passados pelo Gestao.jsx */
  const temaAtual   = G?.temaAtual || G?.nome || "dark";
  const toggleTema  = G?.toggleTema;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch("https://lojalopos.infinityfreeapp.com/api/configuracoes.php");
        const json = await res.json();
        const d = json.data || {};
        setNomeLoja(d.nome_loja || "");
        setNif(d.nif || "");
        setTelefone(d.telefone || "");
        setEmail(d.email || "");
        setEndereco(d.endereco || "");
        setUrlSite(d.url_site || "");
        setApiBaseUrl(d.api_base_url || "https://lojalopos.infinityfreeapp.com/api/");
        setEmailjsService(d.emailjs_service || "");
        setEmailjsKey(d.emailjs_key || "");
        setIva(d.iva ?? 14);
        setTaxaKm(d.taxa_km ?? 100);
        setComprasVip(d.compras_vip ?? 10);
      } catch { /* usa defaults */ }
      setLoading(false);
    })();
  }, []);

  const guardar = async () => {
    if (isGerente) return; /* Gerente não pode guardar configs globais */
    setSaving(true); setMsg(null);
    const form = { nome_loja, nif, telefone, email, endereco, url_site, api_base_url, emailjs_service, emailjs_key, iva, taxa_km, compras_vip };
    try {
      const res  = await fetch("https://lojalopos.infinityfreeapp.com/api/configuracoes.php", {
        method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
      });
      const json = await res.json();
      setMsg(json.success
        ? { tipo:"ok",  texto:t("configs_ok") }
        : { tipo:"err", texto:json.message || t("configs_erro") });
    } catch { setMsg({ tipo:"err", texto:t("erro_ligacao") }); }
    setSaving(false);
    setTimeout(() => setMsg(null), 4000);
  };

  const testarApi = async () => {
    setTestApi("loading");
    try {
      const url = api_base_url.replace(/\/$/, "") + "/produtos.php";
      const res = await fetch(url, { signal:AbortSignal.timeout(5000) });
      const d   = await res.json();
      setTestApi(d.success !== false ? "ok" : "err");
    } catch { setTestApi("err"); }
    setTimeout(() => setTestApi(null), 4000);
  };

  /* Estilos base */
  const inputStyle = {
    width:"100%", padding:"11px 12px", background:G.cardAlt,
    border:`1px solid ${G.border}`, borderRadius:"10px", color:G.text,
    fontSize:"13px", outline:"none", fontFamily:"inherit",
    transition:"border-color .2s", boxSizing:"border-box",
  };
  const withIcon = { ...inputStyle, paddingLeft:"36px" };
  const labelStyle = {
    fontSize:"10px", color:G.muted, textTransform:"uppercase",
    letterSpacing:"1.2px", fontWeight:"700", display:"block", marginBottom:"6px",
  };
  const fieldWrap  = { marginBottom:"14px" };
  const iconWrap   = { position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:G.muted, pointerEvents:"none" };

  const onFocus = e => e.target.style.borderColor = G.accent;
  const onBlur  = e => e.target.style.borderColor = G.border;

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"80px", gap:"12px", color:G.muted }}>
      <div style={{ width:"24px", height:"24px", border:`3px solid ${G.border}`, borderTop:`3px solid ${G.accent}`, borderRadius:"50%", animation:"cfgSpin .8s linear infinite" }}/>
      <span style={{ fontSize:"14px" }}>{t("a_carregar_configs")}</span>
      <style>{`@keyframes cfgSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ padding:"clamp(16px,3vw,26px)", maxWidth:"1400px", margin:"0 auto" }}>
      <style>{`
        @keyframes cfgSpin    { to{transform:rotate(360deg)} }
        @keyframes cfgSlideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        input[type=number]::-webkit-inner-spin-button { opacity:.5 }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"14px", marginBottom:"22px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
          <div style={{ width:"46px", height:"46px", borderRadius:"14px", background:`${G.accent}15`, border:`1px solid ${G.accent}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IcoSettings s={22} c={G.accent}/>
          </div>
          <div>
            <h1 style={{ fontSize:"clamp(17px,3vw,22px)", fontWeight:"800", color:G.text, margin:0, letterSpacing:"-0.5px" }}>{t("configuracoes_titulo")}</h1>
            <p style={{ fontSize:"12px", color:G.muted, margin:"3px 0 0" }}>
              {isGerente
                ? <span style={{ color:G.warning }}>⚠ {t("acesso_limitado")} — {t("banner_gerente").split("—")[1] || "algumas configurações são só de leitura"}</span>
                : t("configuracoes_sub")}
            </p>
          </div>
        </div>

        {/* Botão Guardar — oculto para Gerente pois não pode guardar configs globais */}
        {!isGerente && (
          <button onClick={guardar} disabled={saving}
            style={{ background:saving?G.cardAlt:G.accent, border:"none", borderRadius:"11px", padding:"10px 20px", color:saving?G.muted:"#fff", cursor:saving?"not-allowed":"pointer", fontSize:"13px", fontWeight:"700", display:"flex", alignItems:"center", gap:"8px", transition:"all .2s", opacity:saving?.7:1, fontFamily:"inherit", boxShadow:saving?"none":`0 4px 16px ${G.accent}40` }}>
            {saving
              ? <><div style={{ width:"13px",height:"13px",border:"2px solid rgba(0,0,0,.2)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"cfgSpin .8s linear infinite" }}/>{t("a_guardar")}</>
              : <><IcoSave s={14} c="#fff"/>{t("guardar_configs")}</>}
          </button>
        )}
      </div>

      {/* Feedback */}
      {msg && (
        <div style={{ padding:"12px 15px", borderRadius:"11px", marginBottom:"18px", background:msg.tipo==="ok"?`${G.success}12`:`${G.danger}12`, border:`1px solid ${msg.tipo==="ok"?G.success:G.danger}30`, color:msg.tipo==="ok"?G.success:G.danger, fontSize:"13px", fontWeight:"600", display:"flex", alignItems:"center", gap:"8px", animation:"cfgSlideUp .3s ease" }}>
          {msg.tipo==="ok" ? <IcoCheck s={13} c={G.success}/> : <IcoAlert s={13} c={G.danger}/>}
          {msg.texto}
        </div>
      )}

      {/* ═══ GRID ═══ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"16px" }}>

        {/* ─── CARD 1: Dados da Loja (bloqueado para Gerente) ─── */}
        <Card G={G} icon={IcoStore} title={t("dados_loja")} accent={G.accent}
          locked={isGerente} lockMsg={t("acesso_negado_msg") || "Apenas administradores podem alterar os dados da loja."}>

          <div style={fieldWrap}>
            <label style={labelStyle}>{t("nome_loja")}</label>
            <div style={{ position:"relative" }}>
              <span style={iconWrap}><IcoStore s={13} c={G.muted}/></span>
              <input style={withIcon} value={nome_loja} placeholder="LOPOS TEC"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e=>setNomeLoja(e.target.value)}/>
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>{t("nif")}</label>
            <input style={inputStyle} value={nif} placeholder="5000123456"
              onFocus={onFocus} onBlur={onBlur}
              onChange={e=>setNif(e.target.value)}/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"14px" }}>
            <div>
              <label style={labelStyle}>{t("telefone")}</label>
              <div style={{ position:"relative" }}>
                <span style={iconWrap}><IcoPhone s={13} c={G.muted}/></span>
                <input style={withIcon} value={telefone} placeholder="+244 9xx xxx xxx"
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={e=>setTelefone(e.target.value)}/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t("email")}</label>
              <div style={{ position:"relative" }}>
                <span style={iconWrap}><IcoMail s={13} c={G.muted}/></span>
                <input type="email" style={withIcon} value={email} placeholder="loja@lopos.ao"
                  onFocus={onFocus} onBlur={onBlur}
                  onChange={e=>setEmail(e.target.value)}/>
              </div>
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>{t("endereco")}</label>
            <div style={{ position:"relative" }}>
              <span style={iconWrap}><IcoPin s={13} c={G.muted}/></span>
              <input style={withIcon} value={endereco} placeholder="Rua, Bairro, Luanda"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e=>setEndereco(e.target.value)}/>
            </div>
          </div>
        </Card>

        {/* ─── CARD 2: Integração Online (bloqueado para Gerente) ─── */}
        <Card G={G} icon={IcoGlobe} title={t("integracao_online")} accent="#a855f7"
          locked={isGerente} lockMsg={t("acesso_negado_msg") || "Apenas administradores podem alterar as configurações de integração."}>

          <div style={fieldWrap}>
            <label style={labelStyle}>{t("url_site")}</label>
            <div style={{ position:"relative" }}>
              <span style={iconWrap}><IcoGlobe s={13} c={G.muted}/></span>
              <input style={withIcon} value={url_site} placeholder="http://localhost:5173"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e=>setUrlSite(e.target.value)}/>
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>{t("api_base_url")}</label>
            <div style={{ position:"relative" }}>
              <span style={iconWrap}><IcoLink s={13} c={G.muted}/></span>
              <input style={withIcon} value={api_base_url} placeholder="https://lojalopos.infinityfreeapp.com/api/"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e=>setApiBaseUrl(e.target.value)}/>
            </div>
          </div>

          {/* Testar API */}
          <button onClick={testarApi} disabled={testApi==="loading"||!api_base_url}
            style={{ width:"100%", padding:"10px", borderRadius:"10px", border:`1px solid ${testApi==="ok"?G.success:testApi==="err"?G.danger:G.accent}40`, background:"transparent", color:testApi==="ok"?G.success:testApi==="err"?G.danger:G.accent, cursor:testApi==="loading"?"wait":"pointer", fontSize:"12px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"18px", transition:"all .2s", fontFamily:"inherit" }}>
            {testApi==="loading" ? <><div style={{ width:"11px",height:"11px",border:`1.5px solid ${G.accent}30`,borderTop:`1.5px solid ${G.accent}`,borderRadius:"50%",animation:"cfgSpin .8s linear infinite" }}/>{t("a_testar")}</>
             : testApi==="ok"    ? <><IcoCheck s={12} c={G.success}/>{t("api_ok")}</>
             : testApi==="err"   ? <><IcoAlert s={12} c={G.danger}/>{t("api_erro")}</>
             : <><IcoRefresh s={12}/>{t("testar_api")}</>}
          </button>

          <div style={{ borderTop:`1px solid ${G.border}`, paddingTop:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"12px" }}>
              <IcoMail s={13} c={G.accent}/>
              <span style={{ fontSize:"10px", color:G.accent, fontWeight:"700", textTransform:"uppercase", letterSpacing:"1.2px" }}>{t("emailjs")}</span>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>{t("service_id")}</label>
              <input style={inputStyle} value={emailjs_service} placeholder="service_xxxxxx"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e=>setEmailjsService(e.target.value)}/>
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>{t("public_key")}</label>
              <input style={inputStyle} value={emailjs_key} placeholder="xxxxxxxxxxxx"
                onFocus={onFocus} onBlur={onBlur}
                onChange={e=>setEmailjsKey(e.target.value)}/>
            </div>
          </div>
        </Card>

        {/* ─── CARD 3: Impostos e Taxas (Gerente pode alterar) ─── */}
        <Card G={G} icon={IcoTax} title={t("impostos_taxas")} accent={G.success}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
            <div>
              <label style={labelStyle}>{t("iva")}</label>
              <input type="number" min="0" max="100" step="0.5"
                style={inputStyle} value={iva}
                onFocus={e=>{e.target.style.borderColor=G.success}}
                onBlur={e=>{e.target.style.borderColor=G.border}}
                onChange={e=>setIva(parseFloat(e.target.value)||0)}/>
            </div>
            <div>
              <label style={labelStyle}>{t("taxa_km")}</label>
              <input type="number" min="0" step="10"
                style={inputStyle} value={taxa_km}
                onFocus={e=>{e.target.style.borderColor=G.success}}
                onBlur={e=>{e.target.style.borderColor=G.border}}
                onChange={e=>setTaxaKm(parseFloat(e.target.value)||0)}/>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={labelStyle}>{t("compras_vip")}</label>
              <input type="number" min="1" step="1"
                style={inputStyle} value={compras_vip}
                onFocus={e=>{e.target.style.borderColor=G.success}}
                onBlur={e=>{e.target.style.borderColor=G.border}}
                onChange={e=>setComprasVip(parseInt(e.target.value)||1)}/>
              <p style={{ fontSize:"10px", color:G.muted, marginTop:"5px" }}>
                {t("compras_vip_desc") || "Número de compras para alcançar o estatuto VIP"}
              </p>
            </div>
          </div>

          {/* Preview entregas */}
          <div style={{ background:G.cardAlt, borderRadius:"12px", padding:"14px 16px", border:`1px solid ${G.border}` }}>
            <div style={{ fontSize:"10px", color:G.muted, textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:"12px", fontWeight:"700" }}>
              {t("preview_entregas")}
            </div>
            {[5, 10, 25, 50].map((km,i,arr) => (
              <div key={km} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:i!==arr.length-1?`1px solid ${G.border}`:"none" }}>
                <span style={{ fontSize:"12px", color:G.muted }}>{t("entrega_km")} {km} km</span>
                <span style={{ fontSize:"13px", fontWeight:"800", color:G.success }}>
                  {(km*(taxa_km||0)).toLocaleString("pt-AO")} Kz
                </span>
              </div>
            ))}
          </div>

          {/* Botão guardar só impostos para Gerente */}
          {isGerente && (
            <button onClick={guardar} disabled={saving}
              style={{ width:"100%", marginTop:"14px", padding:"10px", background:saving?G.cardAlt:G.success, border:"none", borderRadius:"10px", color:saving?G.muted:"#fff", cursor:saving?"not-allowed":"pointer", fontSize:"12px", fontWeight:"700", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", fontFamily:"inherit" }}>
              {saving ? t("a_guardar") : <><IcoSave s={13} c="#fff"/> {t("guardar") || "Guardar taxas"}</>}
            </button>
          )}
        </Card>

        {/* ─── CARD 4: Idioma ─── */}
        <Card G={G} icon={IcoLang} title={t("idioma")} accent={G.warning}>
          <p style={{ fontSize:"12px", color:G.muted, marginBottom:"16px", lineHeight:"1.6" }}>
            {t("seleccionar_idioma")}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
            {IDIOMAS.map(lang => {
              const sel = idioma === lang.code;
              return (
                <button key={lang.code} onClick={() => setIdioma(lang.code)}
                  style={{ padding:"13px 12px", borderRadius:"12px", border:`2px solid ${sel?G.accent:G.border}`, background:sel?`${G.accent}14`:G.cardAlt, cursor:"pointer", display:"flex", alignItems:"center", gap:"10px", transition:"all .2s", fontFamily:"inherit", position:"relative", overflow:"hidden", textAlign:"left" }}
                  onMouseEnter={e=>{ if(!sel){e.currentTarget.style.borderColor=`${G.accent}55`;e.currentTarget.style.background=`${G.accent}08`;} }}
                  onMouseLeave={e=>{ if(!sel){e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=G.cardAlt;} }}>
                  {sel && <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:G.accent }}/>}
                  <span style={{ fontSize:"22px", flexShrink:0 }}>{lang.flag}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"13px", fontWeight:sel?"700":"500", color:sel?G.accent:G.text }}>{lang.nome}</div>
                    <div style={{ fontSize:"10px", color:G.muted }}>{lang.code.toUpperCase()}</div>
                  </div>
                  {sel && (
                    <div style={{ width:"18px", height:"18px", borderRadius:"50%", background:G.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <IcoCheck s={10} c="#fff"/>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {/* Preview ao vivo */}
          <div style={{ background:G.cardAlt, borderRadius:"12px", padding:"14px 16px", border:`1px solid ${G.border}` }}>
            <div style={{ fontSize:"10px", color:G.muted, textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:"10px", fontWeight:"700" }}>
              Preview — {IDIOMAS.find(l=>l.code===idioma)?.nome}
            </div>
            {[
              { k:"dashboard", e:"" }, { k:"pedidos", e:"" },
              { k:"clientes",  e:"" }, { k:"guardar", e:"" },
              { k:"terminar_sessao", e:"" },
            ].map(({ k, e }) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0" }}>
                <span style={{ fontSize:"11px", color:G.muted }}>{e} <code style={{ fontSize:"10px", opacity:.7 }}>{k}</code></span>
                <span style={{ fontSize:"12px", fontWeight:"700", color:G.accent }}>{t(k)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ─── CARD 5: Operador Actual ─── */}
        <Card G={G} icon={IcoUser} title={t("operador_actual")} accent={G.muted}>
          {[
            { l:t("nome"),    v:operador?.nome  || "—", c:G.text   },
            { l:t("cargo"),   v:operador?.tipo  || "—", c:G.accent },
            { l:"Username",   v:operador?.user  || "—", c:G.text   },
            { l:t("email"),   v:operador?.email || "—", c:G.text   },
          ].map((item,i,arr) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:i!==arr.length-1?`1px solid ${G.border}`:"none" }}>
              <span style={{ fontSize:"12px", color:G.muted }}>{item.l}</span>
              <span style={{ fontSize:"12px", fontWeight:"600", color:item.c, maxWidth:"55%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textAlign:"right" }}>{item.v}</span>
            </div>
          ))}
          {operador?.super_admin == 1 && (
            <div style={{ marginTop:"14px", padding:"10px", borderRadius:"10px", background:`${G.accent}12`, border:`1px solid ${G.accent}30`, display:"flex", alignItems:"center", justifyContent:"center", gap:"7px" }}>
              <IcoCheck s={12} c={G.accent}/>
              <span style={{ fontSize:"12px", fontWeight:"700", color:G.accent }}>{t("super_admin")}</span>
            </div>
          )}
          {isGerente && (
            <div style={{ marginTop:"12px", padding:"10px 12px", borderRadius:"10px", background:`${G.warning}12`, border:`1px solid ${G.warning}30`, fontSize:"11px", color:G.warning, display:"flex", gap:"7px" }}>
              <IcoLock2 s={13} c={G.warning}/>
              <span>{t("banner_gerente")?.split("—")[0] || "Gerente — acesso limitado às configurações"}</span>
            </div>
          )}
        </Card>

        {/* ─── CARD 6: Aparência / Tema ─── */}
        <Card G={G} icon={IcoPaint} title={t("aparencia") || "Aparência"} accent={G.rose||"#f0416c"}>
          <p style={{ fontSize:"12px", color:G.muted, marginBottom:"18px", lineHeight:"1.6" }}>
            {t("tema_descricao") || "Escolha o tema visual do sistema. A preferência é guardada automaticamente."}
          </p>

          {/* Toggle visual grande */}
          <button onClick={toggleTema}
            style={{ width:"100%", padding:"18px", borderRadius:"14px", border:`1px solid ${G.border}`, background:G.cardAlt, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", display:"flex", alignItems:"center", gap:"16px", marginBottom:"16px" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=G.rose||"#f0416c";e.currentTarget.style.background=`${G.rose||"#f0416c"}10`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=G.cardAlt;}}>
            <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:temaAtual==="dark"?`${G.accent}18`:`${G.warning}18`, border:`1px solid ${temaAtual==="dark"?G.accent:G.warning}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {temaAtual==="dark" ? <IcoSun s={22} c={G.accent}/> : <IcoMoon s={22} c={G.warning}/>}
            </div>
            <div style={{ flex:1, textAlign:"left" }}>
              <div style={{ fontSize:"15px", fontWeight:"700", color:G.text }}>
                {temaAtual==="dark" ? (t("modo_claro")||"Mudar para Modo Claro") : (t("modo_escuro")||"Mudar para Modo Escuro")}
              </div>
              <div style={{ fontSize:"11px", color:G.muted, marginTop:"3px" }}>
                {t("tema_atual") || "Tema actual"}: {temaAtual==="dark" ? " Escuro" : " Claro"}
              </div>
            </div>
            {/* Switch visual */}
            <div style={{ width:"48px", height:"26px", borderRadius:"99px", background:temaAtual==="light"?G.accent:G.border, position:"relative", transition:"all .3s", flexShrink:0 }}>
              <div style={{ position:"absolute", top:"3px", left:temaAtual==="light"?"23px":"3px", width:"20px", height:"20px", borderRadius:"50%", background:"#fff", transition:"all .3s", boxShadow:"0 1px 4px rgba(0,0,0,.35)" }}/>
            </div>
          </button>

          {/* Cards de preview do tema */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            {[
              { id:"dark",  label:t("modo_escuro")||" Escuro",  bg:"#050608", card:"#0d1117", accent:"#1e73f0" },
              { id:"light", label:t("modo_claro")||" Claro",   bg:"#f0f4fb", card:"#ffffff", accent:"#1a5fd6" },
            ].map(tema => {
              const sel = temaAtual === tema.id;
              return (
                <button key={tema.id} onClick={()=>{ if(!sel && toggleTema) toggleTema(); }}
                  style={{ padding:"12px", borderRadius:"12px", border:`2px solid ${sel?G.accent:G.border}`, background:sel?`${G.accent}12`:G.cardAlt, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", textAlign:"left", position:"relative", overflow:"hidden" }}>
                  {sel && <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:G.accent }}/>}
                  {/* Mini preview */}
                  <div style={{ background:tema.bg, borderRadius:"6px", padding:"7px", marginBottom:"8px", border:`1px solid rgba(255,255,255,0.05)` }}>
                    <div style={{ background:tema.card, borderRadius:"4px", padding:"5px 7px", marginBottom:"4px" }}>
                      <div style={{ width:"40%", height:"5px", background:tema.accent, borderRadius:"99px", marginBottom:"3px" }}/>
                      <div style={{ width:"70%", height:"3px", background:"rgba(128,128,128,0.3)", borderRadius:"99px" }}/>
                    </div>
                    <div style={{ display:"flex", gap:"4px" }}>
                      {[30,50,40].map((w,i) => (
                        <div key={i} style={{ flex:1, height:"20px", background:tema.card, borderRadius:"3px", opacity:0.8 }}/>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:"12px", fontWeight:sel?"700":"500", color:sel?G.accent:G.text }}>{tema.label}</span>
                    {sel && <IcoCheck s={13} c={G.accent}/>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default GConfigs;