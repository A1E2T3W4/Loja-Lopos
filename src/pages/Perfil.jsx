import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useAuth } from "../context/AuthContext";

const API_HISTORICO = "https://lojalopos.infinityfreeapp.com/api/historico_cliente.php";
const API_ATUALIZAR = "https://lojalopos.infinityfreeapp.com/api/atualizar_cliente.php";
const API_FAVORITOS = "https://lojalopos.infinityfreeapp.com/api/favoritos.php";
const API_CARTAO    = "https://lojalopos.infinityfreeapp.com/api/cartao.php";
const WHATSAPP_NUM  = "244946244290";

const PALETA_CARTAO = [
  { id:"indigo",   label:"Índigo",     bg:"linear-gradient(135deg,#0f0c29,#302b63,#24243e)", accent:"#6366f1" },
  { id:"ocean",    label:"Oceano",     bg:"linear-gradient(135deg,#0a192f,#0d3b6e,#0099cc)", accent:"#00e5ff" },
  { id:"forest",   label:"Floresta",   bg:"linear-gradient(135deg,#0a2e0a,#1a5c1a,#2d8a2d)", accent:"#00c48c" },
  { id:"sunset",   label:"Pôr do Sol", bg:"linear-gradient(135deg,#1a0a00,#7c2d12,#92400e)", accent:"#f59e0b" },
  { id:"rose",     label:"Rosa",       bg:"linear-gradient(135deg,#1a0010,#6d1a3a,#9d174d)", accent:"#f43f5e" },
  { id:"midnight", label:"Meia-noite", bg:"linear-gradient(135deg,#000000,#1a1a1a,#2d2d2d)", accent:"#a855f7" },
  { id:"aurora",   label:"Aurora",     bg:"linear-gradient(135deg,#001a2e,#0d4a6e,#0d3d2a)", accent:"#10b981" },
  { id:"cosmic",   label:"Cósmico",    bg:"linear-gradient(135deg,#0d0221,#1a0533,#0f3460)", accent:"#a78bfa" },
];

const STATUS_CFG = {
  pendente:    { cor:"#f59e0b", bg:"rgba(245,158,11,0.12)",  label:"Pendente"    },
  pago:        { cor:"#6366f1", bg:"rgba(99,102,241,0.12)",  label:"Pago"        },
  processando: { cor:"#8b5cf6", bg:"rgba(139,92,246,0.12)",  label:"Processando" },
  enviado:     { cor:"#06b6d4", bg:"rgba(6,182,212,0.12)",   label:"Enviado"     },
  entregue:    { cor:"#10b981", bg:"rgba(16,185,129,0.12)",  label:"Entregue"    },
  cancelado:   { cor:"#f43f5e", bg:"rgba(244,63,94,0.12)",   label:"Cancelado"   },
  "concluído": { cor:"#10b981", bg:"rgba(16,185,129,0.12)",  label:"Concluído"   },
};

const defaultCartao = { paletaId:"indigo", imagemBg:null };

// ── Ícones ────────────────────────────────────────────────
const IcoX       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoQr      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg>;
const IcoTrash   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoHistory = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoEdit    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoPrivacy = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoStar    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoPalette = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="14" r="1" fill="currentColor"/></svg>;
const IcoChevron = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoLogout  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoDiscount= () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcoHeadset = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>;
const IcoGift    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
const IcoImage   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

export default function Perfil() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [cliente,          setCliente]          = useState(null);
  const [form,             setForm]             = useState({ nome:"", telefone:"", senha:"" });
  const [loading,          setLoading]          = useState(false);
  const [saveMsg,          setSaveMsg]          = useState("");
  const [fotoPreview,      setFotoPreview]      = useState(null);
  const [drawerOpen,       setDrawerOpen]       = useState(null);
  const [historico,        setHistorico]        = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [buscaHistorico,   setBuscaHistorico]   = useState("");
  const [qrAberto,         setQrAberto]         = useState(null);
  const [qrModal,          setQrModal]          = useState(null);
  const [cancelando,       setCancelando]       = useState(null);
  const [apagando,         setApagando]         = useState(null);
  const [favoritos,        setFavoritos]        = useState([]);
  const [loadingFavs,      setLoadingFavs]      = useState(false);
  const [cartaoCfg,        setCartaoCfg]        = useState(defaultCartao);
  const [savingCartao,     setSavingCartao]     = useState(false);
  const [qrCodeCartao,     setQrCodeCartao]     = useState(null);
  const [comprasValidas,   setComprasValidas]   = useState(0);
  // notificação de novo VIP vinda da resposta do histórico
  const [novoVip,          setNovoVip]          = useState(false);

  const fotoRef = useRef();
  const bgRef   = useRef();

  const paleta = PALETA_CARTAO.find(p => p.id === cartaoCfg.paletaId) || PALETA_CARTAO[0];
  const temImg = !!cartaoCfg.imagemBg;

  const fmt = v => new Intl.NumberFormat("pt-AO", {
    style:"currency", currency:"AOA", minimumFractionDigits:0,
  }).format(v || 0);

  const openQrCartao = value => setQrModal({ value, tipo:"cartao" });
  const openQrPedido = value => setQrModal({ value, tipo:"pedido" });
  const closeQrModal = ()    => setQrModal(null);

  // ── Cartão ────────────────────────────────────────────────
  const carregarCartao = async cid => {
    try {
      const res  = await fetch(`${API_CARTAO}?id_cliente=${cid}`);
      const data = await res.json();
      if (data.success && data.cartao) {
        setCartaoCfg({ paletaId: data.cartao.paleta_id || "indigo", imagemBg: data.cartao.imagem_bg || null });
        setQrCodeCartao(data.cartao.qr_code || null);
      }
    } catch {}
  };

  const actualizarCartao = async novaCfg => {
    const cfg     = { ...cartaoCfg, ...novaCfg };
    setCartaoCfg(cfg);
    setSavingCartao(true);
    const stored  = localStorage.getItem("luxe_cliente");
    if (!stored)  { setSavingCartao(false); return; }
    const cid     = JSON.parse(stored)?.id_cliente || JSON.parse(stored)?.id;
    const payload = { id_cliente: cid };
    if (novaCfg.paletaId !== undefined) payload.paleta_id = novaCfg.paletaId;
    if (novaCfg.imagemBg !== undefined) payload.imagem_bg = novaCfg.imagemBg;
    try {
      await fetch(API_CARTAO, { method:"PUT", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) });
    } catch {}
    setSavingCartao(false);
  };

  const handleBgImage = e => {
    const file = e.target.files[0]; if (!file) return;
    const img  = new Image();
    img.onload = () => {
      const MAX = 900;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else       { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      actualizarCartao({ imagemBg: canvas.toDataURL("image/jpeg", 0.85) });
    };
    img.src = URL.createObjectURL(file);
    e.target.value = "";
  };

  // ── Init ──────────────────────────────────────────────────
  useEffect(() => {
    const c = localStorage.getItem("luxe_cliente");
    if (!c) { navigate("/login"); return; }
    const dados = JSON.parse(c);
    setCliente(dados);
    setForm({ nome:dados.nome||"", telefone:dados.telefone||"", senha:"" });
    const cid = dados.id_cliente || dados.id;
    carregarHistorico(cid);
    carregarFavoritos(cid);
    carregarCartao(cid);
  }, []);

  useEffect(() => {
    const sync = () => {
      const c = localStorage.getItem("luxe_cliente");
      if (c) setCliente(JSON.parse(c)); else navigate("/login");
    };
    window.addEventListener("clienteAtualizado", sync);
    return () => window.removeEventListener("clienteAtualizado", sync);
  }, []);

  // ── Histórico ─────────────────────────────────────────────
  /*
   * O frontend apenas lê o estado que o backend já actualizou.
   * Não decide nem activa verificações — isso é feito em
   * pedidos.php quando um pedido muda para 'entregue'.
   */
  const carregarHistorico = async cid => {
    setLoadingHistorico(true);
    try {
      const res  = await fetch(`${API_HISTORICO}?id_cliente=${cid}`);
      const data = await res.json();
      if (data.success) {
        setHistorico(data.historico || []);
        setComprasValidas(data.compras_validas ?? 0);

        const ca = JSON.parse(localStorage.getItem("luxe_cliente") || "{}");

        /* Se o backend indica que o cliente JÁ é verificado mas o
           localStorage ainda não reflecte isso → actualiza e notifica */
        const foiVerificadoAgora = !ca.cliente_verificado && data.cliente_verificado;

        const atualizado = {
          ...ca,
          compras_realizadas: data.compras_validas ?? ca.compras_realizadas,
          cliente_verificado: data.cliente_verificado ?? ca.cliente_verificado,
          saldo_bonus:        data.saldo_bonus        ?? ca.saldo_bonus,
        };
        localStorage.setItem("luxe_cliente", JSON.stringify(atualizado));
        setCliente(atualizado);

        if (foiVerificadoAgora) {
          setNovoVip(true);
          setTimeout(() => setNovoVip(false), 5000);
          window.dispatchEvent(new CustomEvent("clienteAtualizado"));
        }
      }
    } catch {}
    setLoadingHistorico(false);
  };

  const cancelarPedido = async id_pedido => {
    if (!window.confirm(`Cancelar o pedido #${id_pedido}?`)) return;
    setCancelando(id_pedido);
    try {
      const res  = await fetch(API_HISTORICO, {
        method:"PUT", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ id_pedido, id_cliente: cliente.id_cliente||cliente.id, acao:"cancelar" }),
      });
      const data = await res.json();
      if (data.success) setHistorico(prev => prev.map(c => c.id_pedido===id_pedido ? {...c,status:"cancelado"} : c));
      else alert(data.message || "Não foi possível cancelar.");
    } catch { alert("Erro de ligação."); }
    setCancelando(null);
  };

  const apagarHistorico = async id_historico => {
    if (!window.confirm("Remover este registo do histórico?")) return;
    setApagando(id_historico);
    try {
      const cid  = cliente.id_cliente || cliente.id;
      const res  = await fetch(`${API_HISTORICO}?id_historico=${id_historico}&id_cliente=${cid}`, { method:"DELETE" });
      const data = await res.json();
      if (data.success) setHistorico(prev => prev.filter(c => c.id_historico !== id_historico));
      else alert(data.message || "Erro ao remover.");
    } catch { alert("Erro de ligação."); }
    setApagando(null);
  };

  // ── Favoritos ─────────────────────────────────────────────
  const carregarFavoritos = async cid => {
    setLoadingFavs(true);
    try {
      const res  = await fetch(`${API_FAVORITOS}?id_cliente=${cid}`);
      const data = await res.json();
      if (data.success) setFavoritos(data.data || []);
    } catch {}
    setLoadingFavs(false);
  };

  const removerFavorito = async id_produto => {
    const cid = cliente.id_cliente || cliente.id;
    try {
      await fetch(`${API_FAVORITOS}?id_cliente=${cid}&id_produto=${id_produto}`, { method:"DELETE" });
      setFavoritos(prev => prev.filter(f => f.id_produto !== id_produto));
    } catch {}
  };

  // ── Guardar dados ─────────────────────────────────────────
  const handleSalvarDados = async () => {
    setLoading(true); setSaveMsg("");
    try {
      const res  = await fetch(API_ATUALIZAR, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          id_cliente: cliente.id_cliente||cliente.id,
          nome: form.nome, telefone: form.telefone,
          senha: form.senha || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const ca = JSON.parse(localStorage.getItem("luxe_cliente") || "{}");
        const a  = { ...ca, ...data.cliente };
        localStorage.setItem("luxe_cliente", JSON.stringify(a));
        setCliente(a);
        window.dispatchEvent(new CustomEvent("clienteAtualizado"));
        setSaveMsg("✓ Dados guardados com sucesso!");
        setForm(f => ({ ...f, senha:"" }));
        setTimeout(() => { setSaveMsg(""); setDrawerOpen(null); }, 2000);
      } else setSaveMsg("✕ " + (data.message || "Erro ao guardar."));
    } catch { setSaveMsg("✕ Erro de ligação."); }
    setLoading(false);
  };

  const handleSair   = () => { logout(); navigate("/login"); };
  const fecharDrawer = () => { setDrawerOpen(null); setSaveMsg(""); };
  const handleFoto   = e  => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setFotoPreview(ev.target.result);
    r.readAsDataURL(f);
  };
  const abrirChat = () => {
    const m = encodeURIComponent("Olá! Tenho interesse em comprar produtos LOPOS. Podem ajudar-me?");
    window.open(`https://wa.me/${WHATSAPP_NUM}?text=${m}`, "_blank");
  };

  if (!cliente) return null;

  const inicial    = (cliente.nome || "?").charAt(0).toUpperCase();
  const verificado = !!cliente.cliente_verificado;
  const saldo      = cliente.saldo_bonus || 0;
  const limiteVip  = 10;
  const pct        = Math.min(100, (comprasValidas / limiteVip) * 100);

  const qrDataCartao = qrCodeCartao || JSON.stringify({
    tipo:"cartao_lopos",
    id_cliente: cliente.id_cliente || cliente.id,
    nome:  cliente.nome,
    email: cliente.email,
    saldo,
    verificado: true,
  });

  const StatusBadge = ({ status }) => {
    const s = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.pendente;
    return (
      <span style={{ fontSize:".7rem", fontWeight:"700", color:s.cor, background:s.bg, padding:"3px 9px", borderRadius:"99px", border:`1px solid ${s.cor}33`, whiteSpace:"nowrap" }}>
        {s.label}
      </span>
    );
  };

  // ── Cartão VIP ────────────────────────────────────────────
  const CartaoVIP = ({ preview = false }) => {
    const qrSz = preview ? 48 : 72;
    return (
      <div style={{ width:"100%", borderRadius:preview?"14px":"20px", overflow:"hidden", position:"relative",
        boxShadow: preview ? `0 6px 20px ${paleta.accent}33` : `0 14px 36px ${paleta.accent}44, inset 0 1px 0 rgba(255,255,255,0.07)`,
        transition:"transform .3s, box-shadow .3s", marginBottom: preview ? 0 : "16px" }}
        onMouseEnter={e => { if(!preview){ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 20px 48px ${paleta.accent}55`; }}}
        onMouseLeave={e => { if(!preview){ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 14px 36px ${paleta.accent}44`; }}}>
        {temImg
          ? <img src={cartaoCfg.imagemBg} alt="fundo" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block" }}/>
          : <div style={{ position:"absolute", inset:0, background:paleta.bg }}/>}
        {temImg && <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.42) 60%,rgba(0,0,0,0.62) 100%)" }}/>}
        {!temImg && (<>
          <div style={{ position:"absolute", top:"-30%", right:"-8%", width:"55%", height:"55%", borderRadius:"50%", background:`radial-gradient(circle,${paleta.accent}28,transparent 70%)`, pointerEvents:"none" }}/>
          <div style={{ position:"absolute", bottom:"-20%", left:"-5%", width:"45%", height:"45%", borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%)", pointerEvents:"none" }}/>
        </>)}
        <div style={{ position:"relative", zIndex:2, padding:preview?"14px 15px 12px":"18px 18px 14px", display:"flex", flexDirection:"column", gap:preview?"10px":"14px", minHeight:preview?"120px":"160px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"8px" }}>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:"10px", letterSpacing:".18em", color:"rgba(255,255,255,0.55)", textTransform:"uppercase", fontWeight:"700", margin:0, lineHeight:1.2 }}>LOPOS</p>
              <p style={{ fontSize:"8px", letterSpacing:".08em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", margin:0, lineHeight:1.4 }}>Cartão de Benefícios</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"5px", flexShrink:0 }}>
              {!preview && (
                <button onClick={() => setDrawerOpen("cartao")}
                  style={{ background:"rgba(255,255,255,0.13)", border:"1px solid rgba(255,255,255,0.22)", borderRadius:"6px", padding:"3px 7px", cursor:"pointer", display:"flex", alignItems:"center", gap:"3px", color:"rgba(255,255,255,0.88)", fontSize:"10px", fontWeight:"600", fontFamily:"inherit", transition:"0.2s", whiteSpace:"nowrap" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.13)"}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93a10 10 0 0 0 14.14 14.14"/>
                  </svg>
                  Personalizar
                </button>
              )}
              <div style={{ background:`${paleta.accent}30`, padding:"3px 7px", borderRadius:"99px", border:`1px solid ${paleta.accent}88`, display:"flex", alignItems:"center", gap:"3px", flexShrink:0 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke={paleta.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize:"8px", fontWeight:"700", color:paleta.accent, whiteSpace:"nowrap" }}>VERIFICADO</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:"8px", flex:1 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:"8px", color:"rgba(255,255,255,0.42)", letterSpacing:".08em", textTransform:"uppercase", margin:"0 0 3px" }}>SALDO BÓNUS</p>
              <p style={{ fontSize:"clamp(1.1rem,5vw,1.65rem)", fontWeight:"800", color:"white", letterSpacing:"-0.02em", lineHeight:1, margin:"0 0 2px", whiteSpace:"nowrap" }}>
                {new Intl.NumberFormat("pt-AO").format(saldo)}
                <span style={{ fontSize:"clamp(.55rem,2vw,.65rem)", fontWeight:"400", color:"rgba(255,255,255,0.4)", marginLeft:"3px" }}>AOA</span>
              </p>
              {!preview && (
                <div style={{ marginTop:"10px" }}>
                  <p style={{ fontSize:"8px", color:"rgba(255,255,255,0.4)", letterSpacing:".07em", textTransform:"uppercase", margin:"0 0 2px" }}>TITULAR</p>
                  <p style={{ fontSize:"clamp(.7rem,2.5vw,.82rem)", fontWeight:"600", color:"rgba(255,255,255,0.88)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"170px" }}>{cliente.nome}</p>
                </div>
              )}
            </div>
            {!preview ? (
              <div onClick={() => openQrCartao(qrDataCartao)}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", cursor:"pointer", flexShrink:0, transition:"transform .2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                <div style={{ background:"rgba(255,255,255,0.1)", padding:"clamp(6px,2vw,9px)", borderRadius:"clamp(8px,2.5vw,13px)", border:"1px solid rgba(255,255,255,0.15)" }}>
                  <QRCodeCanvas value={qrDataCartao} size={qrSz} level="H" bgColor="transparent" fgColor="rgba(255,255,255,0.88)"/>
                </div>
                <p style={{ fontSize:"7px", color:"rgba(255,255,255,0.38)", marginTop:"4px", letterSpacing:".04em", textAlign:"center" }}>CLIQUE PARA AMPLIAR</p>
              </div>
            ) : (
              <div style={{ background:"rgba(255,255,255,0.1)", padding:"7px", borderRadius:"9px", border:"1px solid rgba(255,255,255,0.15)", opacity:0.8, flexShrink:0 }}>
                <QRCodeCanvas value={qrDataCartao} size={qrSz} level="H" bgColor="transparent" fgColor="rgba(255,255,255,0.88)"/>
              </div>
            )}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:"8px", borderTop:"1px solid rgba(255,255,255,0.1)", fontSize:"7px", color:"rgba(255,255,255,0.3)", letterSpacing:".07em", textTransform:"uppercase" }}>
            <span>Cartão Digital</span>
            <div style={{ display:"flex", gap:"3px", color:"#f59e0b" }}><span>✦</span><span>✦</span><span>✦</span></div>
            <span>Válido</span>
          </div>
        </div>
      </div>
    );
  };

  // ── Drawers ───────────────────────────────────────────────
  const histoFiltrado = historico.filter(c => {
    if (!buscaHistorico.trim()) return true;
    const b = buscaHistorico.toLowerCase();
    return String(c.id_pedido).includes(b)
      || fmt(c.total).toLowerCase().includes(b)
      || (c.status || "").toLowerCase().includes(b)
      || new Date(c.data_compra).toLocaleDateString("pt-AO").includes(b);
  });

  const historyContent = (
    <div style={{ padding:"22px 20px" }}>
      <p style={{ fontSize:".68rem", textTransform:"uppercase", letterSpacing:".12em", color:"var(--secondary)", fontWeight:"600", marginBottom:"4px" }}>Actividade</p>
      <h3 style={{ fontSize:"1.25rem", fontWeight:"700", marginBottom:"12px" }}>Histórico de compras</h3>
      <div style={{ position:"relative", marginBottom:"13px" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--fg-muted)" strokeWidth="2" style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Pesquisar pedido, valor, estado..." value={buscaHistorico}
          onChange={e => setBuscaHistorico(e.target.value)}
          style={{ width:"100%", padding:"8px 34px 8px 30px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--fg)", fontSize:".8rem", outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}
          onFocus={e => e.target.style.borderColor = "var(--accent)"}
          onBlur={e  => e.target.style.borderColor = "var(--border)"}/>
        {buscaHistorico && (
          <button onClick={() => setBuscaHistorico("")}
            style={{ position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"var(--fg-muted)", cursor:"pointer", display:"flex", alignItems:"center", padding:"2px" }}>
            <IcoX/>
          </button>
        )}
      </div>

      {loadingHistorico ? (
        [1,2,3].map(i => <div key={i} style={{ height:"75px", background:"var(--bg-alt)", borderRadius:"var(--r-sm)", marginBottom:"9px" }}/>)
      ) : histoFiltrado.length === 0 ? (
        <div style={{ textAlign:"center", padding:"32px 16px", color:"var(--fg-muted)" }}>
          <div style={{ fontSize:"1.8rem", marginBottom:"8px" }}>🛍️</div>
          <p style={{ fontSize:".84rem", fontWeight:"600", marginBottom:"4px" }}>
            {buscaHistorico ? "Nenhum resultado" : "Nenhuma compra encontrada."}
          </p>
        </div>
      ) : histoFiltrado.map(compra => {
        const st         = compra.status?.toLowerCase() || "pendente";
        const podeCancel = ["pendente","pago"].includes(st);
        const eApag      = apagando === compra.id_historico;
        return (
          <div key={compra.id_historico} style={{ background:"var(--bg-alt)", borderRadius:"var(--r-sm)", border:"1px solid var(--border)", overflow:"hidden", marginBottom:"9px" }}>
            <div style={{ padding:"12px 14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px", gap:"6px" }}>
                <span style={{ fontWeight:"600", fontSize:".86rem", flexShrink:0 }}>Pedido #{compra.id_pedido}</span>
                <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                  <span style={{ fontSize:".7rem", color:"var(--fg-muted)", background:"var(--bg-card)", padding:"2px 8px", borderRadius:"99px", border:"1px solid var(--border)", whiteSpace:"nowrap" }}>
                    {new Date(compra.data_compra).toLocaleDateString("pt-AO")}
                  </span>
                  <button onClick={() => apagarHistorico(compra.id_historico)} disabled={eApag}
                    style={{ width:"26px", height:"26px", border:"1px solid var(--border)", borderRadius:"6px", background:"transparent", color:eApag?"var(--fg-faint)":"var(--danger)", cursor:eApag?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"0.15s" }}
                    onMouseEnter={e => { if(!eApag){ e.currentTarget.style.background="rgba(244,63,94,0.1)"; e.currentTarget.style.borderColor="var(--danger)"; }}}
                    onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="var(--border)"; }}>
                    {eApag ? <span style={{ fontSize:"9px" }}>⏳</span> : <IcoTrash/>}
                  </button>
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:".84rem", fontWeight:"700", color:"var(--accent)" }}>{fmt(compra.total)}</span>
                <StatusBadge status={st}/>
              </div>
            </div>
            <div style={{ borderTop:"1px solid var(--border)", display:"flex" }}>
              {compra.qr_code && (
                <button onClick={() => setQrAberto(qrAberto===compra.id_historico ? null : compra.id_historico)}
                  style={{ flex:1, padding:"9px 12px", background:"transparent", border:"none", color:"var(--fg-muted)", cursor:"pointer", fontSize:".75rem", fontWeight:"500", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", fontFamily:"inherit", borderRight:podeCancel?"1px solid var(--border)":"none" }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--fg-muted)"}>
                  <IcoQr/> {qrAberto===compra.id_historico ? "Fechar QR" : "Ver QR"}
                </button>
              )}
              {podeCancel && (
                <button onClick={() => cancelarPedido(compra.id_pedido)} disabled={cancelando===compra.id_pedido}
                  style={{ flex:1, padding:"9px 12px", background:"transparent", border:"none", color:cancelando===compra.id_pedido?"var(--fg-muted)":"var(--danger)", cursor:cancelando===compra.id_pedido?"not-allowed":"pointer", fontSize:".75rem", fontWeight:"600", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", fontFamily:"inherit" }}
                  onMouseEnter={e => { if(cancelando!==compra.id_pedido) e.currentTarget.style.background="rgba(244,63,94,0.06)"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <IcoX/> {cancelando===compra.id_pedido ? "A cancelar..." : "Cancelar"}
                </button>
              )}
            </div>
            {qrAberto===compra.id_historico && (
              <div style={{ padding:"13px", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", background:"var(--bg-card)", borderTop:"1px solid var(--border)" }}>
                <div style={{ background:"white", padding:"10px", borderRadius:"10px", cursor:"pointer" }}
                  onClick={() => openQrPedido(compra.qr_code)}>
                  <QRCodeCanvas value={compra.qr_code} size={130} level="H" bgColor="#ffffff" fgColor="#1a1a2e"/>
                </div>
                <p style={{ fontSize:".68rem", color:"var(--fg-faint)" }}>Clique para ampliar</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const favoritosContent = (
    <div style={{ padding:"22px 20px" }}>
      <p style={{ fontSize:".68rem", textTransform:"uppercase", letterSpacing:".12em", color:"var(--secondary)", fontWeight:"600", marginBottom:"4px" }}>Guardados</p>
      <h3 style={{ fontSize:"1.25rem", fontWeight:"700", marginBottom:"16px" }}>Os meus favoritos</h3>
      {loadingFavs ? (
        [1,2,3].map(i => <div key={i} style={{ height:"75px", background:"var(--bg-alt)", borderRadius:"var(--r-sm)", marginBottom:"9px" }}/>)
      ) : favoritos.length===0 ? (
        <div style={{ textAlign:"center", padding:"32px", color:"var(--fg-muted)" }}>
          <div style={{ fontSize:"2rem", marginBottom:"9px" }}>⭐</div>
          <p style={{ fontSize:".84rem", fontWeight:"600", marginBottom:"4px" }}>Nenhum favorito ainda</p>
        </div>
      ) : favoritos.map(p => (
        <div key={p.id_favorito} style={{ background:"var(--bg-alt)", borderRadius:"var(--r-sm)", border:"1px solid var(--border)", padding:"10px 12px", display:"flex", gap:"10px", alignItems:"center", marginBottom:"8px" }}>
          <img src={p.imagem_url||"https://via.placeholder.com/52"} alt={p.nome}
            style={{ width:"52px", height:"52px", borderRadius:"7px", objectFit:"cover", flexShrink:0 }}
            onError={e => e.target.src="https://via.placeholder.com/52"}/>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontWeight:"600", fontSize:".84rem", marginBottom:"2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nome}</p>
            <p style={{ fontSize:".68rem", color:"var(--fg-muted)", marginBottom:"3px" }}>{p.categoria}</p>
            <span style={{ fontWeight:"700", color:"var(--accent)", fontSize:".84rem" }}>{fmt(p.preco)}</span>
          </div>
          <button onClick={() => removerFavorito(p.id_produto)}
            style={{ background:"none", border:"1px solid var(--border)", borderRadius:"7px", padding:"5px 8px", color:"var(--danger)", cursor:"pointer", fontSize:".72rem", flexShrink:0, transition:"0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(244,63,94,0.08)"; e.currentTarget.style.borderColor="var(--danger)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.borderColor="var(--border)"; }}>✕</button>
        </div>
      ))}
    </div>
  );

  const editContent = (
    <div style={{ padding:"22px 20px" }}>
      <p style={{ fontSize:".68rem", textTransform:"uppercase", letterSpacing:".12em", color:"var(--secondary)", fontWeight:"600", marginBottom:"4px" }}>Conta</p>
      <h3 style={{ fontSize:"1.25rem", fontWeight:"700", marginBottom:"16px" }}>Alterar dados</h3>
      <div className="form-group">
        <label className="form-label">Nome completo</label>
        <input type="text" className="form-input" value={form.nome} onChange={e => setForm({...form,nome:e.target.value})}/>
      </div>
      <div className="form-group">
        <label className="form-label">Telefone</label>
        <input type="tel" className="form-input" placeholder="+244 9xx xxx xxx" value={form.telefone} onChange={e => setForm({...form,telefone:e.target.value})}/>
      </div>
      <div className="form-group">
        <label className="form-label">Nova senha</label>
        <input type="password" className="form-input" placeholder="Deixar vazio para manter" value={form.senha} onChange={e => setForm({...form,senha:e.target.value})}/>
        <span style={{ fontSize:".68rem", color:"var(--fg-faint)", marginTop:"3px", display:"block" }}>Mínimo 8 caracteres</span>
      </div>
      {saveMsg && (
        <div style={{ padding:"9px 12px", borderRadius:"7px", fontSize:".8rem", marginBottom:"11px", background:saveMsg.startsWith("✓")?"var(--success-bg)":"var(--danger-bg)", color:saveMsg.startsWith("✓")?"var(--success)":"var(--danger)" }}>
          {saveMsg}
        </div>
      )}
      <button className="btn-primary btn-block" onClick={handleSalvarDados} disabled={loading} style={{ marginTop:"6px" }}>
        {loading ? "A guardar..." : "Guardar alterações"}
      </button>
    </div>
  );

  const cartaoContent = (
    <div style={{ padding:"22px 20px" }}>
      <p style={{ fontSize:".68rem", textTransform:"uppercase", letterSpacing:".12em", color:"var(--secondary)", fontWeight:"600", marginBottom:"4px" }}>Personalização</p>
      <h3 style={{ fontSize:"1.25rem", fontWeight:"700", marginBottom:"16px" }}>Personalizar cartão</h3>
      {savingCartao && (
        <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"7px 12px", background:"var(--accent-bg)", borderRadius:"8px", marginBottom:"14px", fontSize:".75rem", color:"var(--accent)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation:"spin 1s linear infinite", flexShrink:0 }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          A guardar...
        </div>
      )}
      <div style={{ marginBottom:"20px" }}>
        <p style={{ fontSize:".68rem", textTransform:"uppercase", letterSpacing:".1em", color:"var(--fg-muted)", fontWeight:"600", marginBottom:"9px" }}>Pré-visualização</p>
        <CartaoVIP preview={true}/>
      </div>
      <div style={{ marginBottom:"20px" }}>
        <p style={{ fontSize:".68rem", textTransform:"uppercase", letterSpacing:".1em", color:"var(--fg-muted)", fontWeight:"600", marginBottom:"11px" }}>Tema de cor</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
          {PALETA_CARTAO.map(p => (
            <button key={p.id} onClick={() => actualizarCartao({ paletaId:p.id })} title={p.label}
              style={{ height:"46px", borderRadius:"9px", background:p.bg, border:cartaoCfg.paletaId===p.id?`2px solid ${p.accent}`:"2px solid transparent", cursor:"pointer", transition:"0.18s", position:"relative", overflow:"hidden" }}>
              {cartaoCfg.paletaId===p.id && (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.28)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
              <span style={{ position:"absolute", bottom:"2px", left:0, right:0, textAlign:"center", fontSize:"6.5px", color:"rgba(255,255,255,0.8)", fontWeight:"700", textTransform:"uppercase" }}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:"18px" }}>
        <p style={{ fontSize:".68rem", textTransform:"uppercase", letterSpacing:".1em", color:"var(--fg-muted)", fontWeight:"600", marginBottom:"11px" }}>Imagem de fundo</p>
        <input ref={bgRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleBgImage}/>
        {temImg ? (
          <div style={{ display:"flex", gap:"7px" }}>
            <button onClick={() => bgRef.current?.click()}
              style={{ flex:1, padding:"9px", borderRadius:"8px", background:"var(--bg-alt)", border:"1px solid var(--border)", color:"var(--fg-muted)", cursor:"pointer", fontSize:".78rem", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
              <IcoImage/> Substituir
            </button>
            <button onClick={() => actualizarCartao({ imagemBg:null })}
              style={{ padding:"9px 12px", borderRadius:"8px", background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.3)", color:"var(--danger)", cursor:"pointer", fontSize:".78rem", fontFamily:"inherit", display:"flex", alignItems:"center", gap:"5px" }}>
              <IcoX/> Remover
            </button>
          </div>
        ) : (
          <button onClick={() => bgRef.current?.click()}
            style={{ width:"100%", padding:"16px", borderRadius:"11px", background:"var(--bg-alt)", border:"2px dashed var(--border)", color:"var(--fg-muted)", cursor:"pointer", fontSize:".82rem", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:"9px" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:"var(--bg-card)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}><IcoImage/></div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontWeight:"600", marginBottom:"2px" }}>Escolher imagem de fundo</p>
              <p style={{ fontSize:".7rem", opacity:0.7 }}>JPG, PNG, WebP</p>
            </div>
          </button>
        )}
      </div>
      <button onClick={() => actualizarCartao(defaultCartao)}
        style={{ width:"100%", padding:"10px", borderRadius:"9px", background:"transparent", border:"1px solid var(--border)", color:"var(--fg-muted)", cursor:"pointer", fontSize:".8rem", fontFamily:"inherit" }}>
        Repor predefinições
      </button>
    </div>
  );

  const privacyContent = (
    <div style={{ padding:"22px 20px" }}>
      <p style={{ fontSize:".68rem", textTransform:"uppercase", letterSpacing:".12em", color:"var(--secondary)", fontWeight:"600", marginBottom:"4px" }}>Documento Legal</p>
      <h3 style={{ fontSize:"1.25rem", fontWeight:"700", marginBottom:"16px" }}>Política de Privacidade</h3>
      {[
        { n:"01", t:"Dados que recolhemos",     c:"Nome, e-mail, telefone, endereço e dados de pagamento fornecidos por si." },
        { n:"02", t:"Finalidade",               c:"Usados exclusivamente para processar pedidos e comunicar sobre encomendas." },
        { n:"03", t:"Partilha de dados",        c:"Nunca vendemos os seus dados. Partilhamos apenas com parceiros de logística." },
        { n:"04", t:"Segurança e retenção",     c:"Medidas de segurança profissionais. Dados retidos pelo período mínimo necessário." },
        { n:"05", t:"Os seus direitos",         c:"Pode aceder, rectificar, eliminar ou exportar os seus dados a qualquer momento." },
        { n:"06", t:"Cookies",                  c:"Apenas cookies essenciais, sem rastreamento de terceiros sem o seu consentimento." },
      ].map(s => (
        <div key={s.n} style={{ marginBottom:"9px", padding:"12px 14px", background:"var(--bg-alt)", borderRadius:"var(--r-sm)", border:"1px solid var(--border)" }}>
          <div style={{ display:"flex", gap:"11px" }}>
            <span style={{ fontSize:".65rem", fontWeight:"700", color:"var(--accent)", fontFamily:"monospace", minWidth:"20px" }}>{s.n}</span>
            <div>
              <h4 style={{ fontSize:".84rem", fontWeight:"600", marginBottom:"3px" }}>{s.t}</h4>
              <p style={{ fontSize:".76rem", color:"var(--fg-muted)", lineHeight:"1.6" }}>{s.c}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const getDrawerContent = () => {
    switch(drawerOpen) {
      case "history":   return historyContent;
      case "favoritos": return favoritosContent;
      case "edit":      return editContent;
      case "cartao":    return cartaoContent;
      case "privacy":   return privacyContent;
      default:          return null;
    }
  };

  const drawerLabels = {
    history:"Histórico", favoritos:"Favoritos",
    edit:"Editar perfil", cartao:"Personalizar cartão", privacy:"Privacidade",
  };

  const menuItens = [
    { key:"history",   label:"Histórico de compras",    Icon:IcoHistory },
    { key:"favoritos", label:"Os meus favoritos",       Icon:IcoStar    },
    { key:"edit",      label:"Alterar dados pessoais",  Icon:IcoEdit    },
    ...(verificado ? [{ key:"cartao", label:"Personalizar cartão", Icon:IcoPalette }] : []),
    { key:"privacy",   label:"Política de privacidade", Icon:IcoPrivacy },
  ];

  const renderQrDecoded = qrStr => {
    const linhas = (() => {
      try {
        const p = JSON.parse(qrStr);
        return [
          { label:"Nome",       valor:p.nome  || cliente?.nome,                           cor:"white"    },
          { label:"E-mail",     valor:p.email || cliente?.email,                          cor:"white"    },
          { label:"ID Cliente", valor:p.id_cliente||(cliente?.id_cliente||cliente?.id),   cor:"white"    },
          { label:"Saldo",      valor:fmt(p.saldo ?? saldo),                              cor:"#f59e0b"  },
          { label:"Estado",     valor:verificado?"VERIFICADO":"PENDENTE",                 cor:verificado?"#10b981":"#f59e0b" },
        ];
      } catch {
        return [
          { label:"Nome",       valor:cliente?.nome,                     cor:"white"    },
          { label:"E-mail",     valor:cliente?.email,                    cor:"white"    },
          { label:"ID Cliente", valor:cliente?.id_cliente||cliente?.id,  cor:"white"    },
          { label:"Saldo",      valor:fmt(saldo),                        cor:"#f59e0b"  },
          { label:"Estado",     valor:verificado?"VERIFICADO":"PENDENTE",cor:verificado?"#10b981":"#f59e0b" },
        ];
      }
    })();
    return (
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:"9px 14px", fontSize:".78rem" }}>
        {linhas.map(({ label, valor, cor }) => (
          <>
            <span key={label+"l"} style={{ color:"rgba(255,255,255,0.42)", fontWeight:"500", whiteSpace:"nowrap" }}>{label}</span>
            <span key={label+"v"} style={{ color:cor, fontWeight:"600", wordBreak:"break-all" }}>{valor ?? "—"}</span>
          </>
        ))}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════
  return (
    <>
      {/* MODAL QR */}
      {qrModal && (
        <div onClick={closeQrModal}
          style={{ position:"fixed", inset:0, zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.92)", backdropFilter:"blur(10px)", padding:"16px" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ position:"relative", borderRadius:"24px", overflow:"hidden", width:"90%", maxWidth:"360px", boxShadow:"0 28px 56px rgba(0,0,0,0.7)" }}>
            {qrModal.tipo === "cartao" ? (
              temImg
                ? <img src={cartaoCfg.imagemBg} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
                : <div style={{ position:"absolute", inset:0, background:paleta.bg }}/>
            ) : (
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#0f0c29,#1a1060,#24243e)" }}/>
            )}
            {qrModal.tipo === "cartao" && temImg && <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.55)" }}/>}
            <div style={{ position:"relative", zIndex:2, padding:"24px 20px" }}>
              <button onClick={closeQrModal}
                style={{ position:"absolute", top:"12px", right:"12px", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"50%", width:"30px", height:"30px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>
                <IcoX/>
              </button>
              <div style={{ textAlign:"center", marginBottom:"18px" }}>
                <p style={{ fontSize:"9px", letterSpacing:".15em", color:"rgba(255,255,255,0.38)", textTransform:"uppercase", marginBottom:"4px" }}>
                  LOPOS • {qrModal.tipo === "cartao" ? "CARTÃO DE BENEFÍCIOS" : "QR DO PEDIDO"}
                </p>
                <h3 style={{ fontSize:"1.05rem", fontWeight:"700", color:"white" }}>
                  {qrModal.tipo === "cartao" ? "Cartão de Benefícios" : "QR Code do Pedido"}
                </h3>
              </div>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:"18px" }}>
                <div style={{ background:"white", padding:"14px", borderRadius:"16px", boxShadow:"0 6px 20px rgba(0,0,0,0.3)" }}>
                  <QRCodeCanvas value={qrModal.value} size={Math.min(190, window.innerWidth - 120)} level="H" bgColor="#FFFFFF" fgColor="#1a1a2e"/>
                </div>
              </div>
              {qrModal.tipo === "cartao" && (
                <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"14px 16px" }}>
                  {renderQrDecoded(qrModal.value)}
                </div>
              )}
              {qrModal.tipo === "pedido" && (
                <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", padding:"14px 16px", textAlign:"center" }}>
                  <p style={{ fontSize:".75rem", color:"rgba(255,255,255,0.5)", marginBottom:"4px" }}>
                    Apresente este QR ao entregador para confirmar a entrega
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO VIP */}
      {novoVip && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.86)", backdropFilter:"blur(12px)", padding:"16px" }}>
          <div style={{ background:paleta.bg, border:`1px solid ${paleta.accent}44`, borderRadius:"24px", padding:"clamp(28px,7vw,50px) clamp(20px,6vw,42px)", textAlign:"center", maxWidth:"400px", width:"100%" }}>
            <div style={{ fontSize:"clamp(2.2rem,8vw,3.5rem)", marginBottom:"16px" }}>✦</div>
            <h2 style={{ color:"#f59e0b", fontSize:"clamp(1.3rem,5vw,1.9rem)", fontWeight:"800", marginBottom:"9px" }}>Parabéns!</h2>
            <p style={{ color:"rgba(255,255,255,0.85)", marginBottom:"7px", fontSize:"clamp(.88rem,3vw,1rem)" }}>
              É agora um <strong style={{ color:"#f59e0b" }}>Cliente Verificado LOPOS</strong>
            </p>
            <p style={{ color:"rgba(255,255,255,0.42)", fontSize:".82rem", marginBottom:"26px", lineHeight:"1.6" }}>
              O seu perfil foi actualizado. O cartão de bónus já está disponível.
            </p>
            <button onClick={() => setNovoVip(false)} className="btn-primary" style={{ padding:"11px 28px" }}>
              Ver o meu perfil ✦
            </button>
          </div>
        </div>
      )}

      {drawerOpen && <div onClick={fecharDrawer} style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", zIndex:1000 }}/>}

      <div style={{
        position:"fixed", top:0, right:0, width:"min(480px,100vw)", height:"100vh",
        backgroundColor:"var(--bg-card)", boxShadow:"-8px 0 40px rgba(0,0,0,0.25)",
        transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        transition:"transform 0.33s cubic-bezier(0.2,0.9,0.4,1.1)",
        zIndex:1100, display:"flex", flexDirection:"column", overflow:"hidden", borderLeft:"1px solid var(--border)",
      }}>
        <div style={{ padding:"13px 17px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <span style={{ fontSize:".76rem", fontWeight:"600", color:"var(--fg-muted)", textTransform:"uppercase", letterSpacing:".08em" }}>{drawerLabels[drawerOpen]||""}</span>
          <button onClick={fecharDrawer} style={{ background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"50%", width:"31px", height:"31px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--fg)" }}><IcoX/></button>
        </div>
        <div style={{ flex:1, overflowY:"auto", scrollbarWidth:"thin" }}>{getDrawerContent()}</div>
      </div>

      <div className="page-wrap" style={{ alignItems:"flex-start", paddingTop:"clamp(16px,4vw,36px)" }}>
        <div className="perfil-wrap">

          <div className="perfil-header">
            <div style={{ position:"relative", display:"inline-block" }}>
              <div className="perfil-avatar" onClick={() => fotoRef.current?.click()} title="Alterar foto">
                {fotoPreview || cliente.foto_url
                  ? <img src={fotoPreview || cliente.foto_url} alt={cliente.nome}/>
                  : inicial}
              </div>
              {verificado && (
                <div style={{ position:"absolute", bottom:"3px", right:"3px", width:"24px", height:"24px", borderRadius:"50%", background:paleta.accent, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid var(--bg-card)", boxShadow:`0 2px 7px ${paleta.accent}88` }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </div>
            <input ref={fotoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFoto}/>
            <input ref={bgRef}   type="file" accept="image/*" style={{ display:"none" }} onChange={handleBgImage}/>
            <div className="perfil-nome-wrap">
              <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                <h2 style={{ margin:0 }}>{cliente.nome}</h2>
                {verificado && (
                  <span style={{ fontSize:".66rem", fontWeight:"700", color:paleta.accent, background:`${paleta.accent}22`, padding:"2px 9px", borderRadius:"99px", border:`1px solid ${paleta.accent}55` }}>VERIFICADO</span>
                )}
              </div>
              <p className="perfil-email">{cliente.email}</p>
            </div>
          </div>

          {verificado && <CartaoVIP preview={false}/>}

          {/* Barra de progresso — só visível para não verificados */}
          {!verificado && (
            <div style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:"var(--r-md)", padding:"16px 18px", marginBottom:"18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <div>
                  <p style={{ fontSize:".66rem", textTransform:"uppercase", letterSpacing:".1em", color:"var(--fg-muted)", marginBottom:"2px" }}>Progresso</p>
                  <p style={{ fontSize:".9rem", fontWeight:"600" }}>Caminho para Verificado</p>
                </div>
                <span style={{ fontSize:"1rem", fontWeight:"700", color:"var(--accent)" }}>
                  {comprasValidas}<span style={{ fontSize:".7rem", color:"var(--fg-muted)", fontWeight:"400" }}>/{limiteVip}</span>
                </span>
              </div>
              <div style={{ background:"var(--bg-alt)", borderRadius:"99px", height:"6px", overflow:"hidden", marginBottom:"7px" }}>
                <div style={{ height:"100%", background:"linear-gradient(90deg,#6366f1,#06b6d4)", borderRadius:"99px", width:`${pct}%`, transition:"width .6s cubic-bezier(0.4,0,0.2,1)" }}/>
              </div>
              <p style={{ fontSize:".7rem", color:"var(--fg-faint)" }}>
                {limiteVip - comprasValidas > 0
                  ? `Faltam ${limiteVip-comprasValidas} entrega${limiteVip-comprasValidas>1?"s":""} concluída${limiteVip-comprasValidas>1?"s":""} para desbloquear benefícios`
                  : "Parabéns! Já é elegível — será verificado na próxima entrega."}
              </p>
              <p style={{ fontSize:".65rem", color:"var(--fg-faint)", marginTop:"2px", fontStyle:"italic" }}>
                * Apenas pedidos com estado <strong>entregue</strong> contam.
              </p>
            </div>
          )}

          <div className="perfil-section">
            <p style={{ fontSize:".64rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--fg-faint)", marginBottom:"7px", paddingLeft:"3px" }}>A minha conta</p>
            {menuItens.map(({ key, label, Icon }) => (
              <div key={key} onClick={() => setDrawerOpen(key)}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 10px", borderRadius:"var(--r-sm)", cursor:"pointer", transition:"0.18s", marginBottom:"2px" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display:"flex", alignItems:"center", gap:"11px" }}>
                  <div style={{ width:"33px", height:"33px", borderRadius:"var(--r-sm)", background:key==="cartao"?`${paleta.accent}22`:"var(--bg-alt)", border:`1px solid ${key==="cartao"?paleta.accent+"55":"var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center", color:key==="cartao"?paleta.accent:"var(--fg-muted)", flexShrink:0 }}>
                    <Icon/>
                  </div>
                  <span style={{ fontSize:".84rem", fontWeight:"500" }}>{label}</span>
                </div>
                <span style={{ color:"var(--fg-faint)", flexShrink:0 }}><IcoChevron/></span>
              </div>
            ))}
          </div>

          {verificado && (
            <div className="perfil-section">
              <p style={{ fontSize:".64rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--fg-faint)", marginBottom:"7px", paddingLeft:"3px" }}>Benefícios exclusivos</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:"8px" }}>
                {[
                  { Icon:IcoDiscount, t:"Descontos especiais", s:"Cupons mensais exclusivos" },
                  { Icon:IcoStar,     t:"Acesso antecipado",   s:"Novos produtos primeiro"   },
                  { Icon:IcoHeadset,  t:"Suporte prioritário", s:"Atendimento VIP 24h"       },
                  { Icon:IcoGift,     t:"Ofertas exclusivas",  s:"Só para verificados"       },
                ].map(b => (
                  <div key={b.t}
                    style={{ background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", padding:"13px", transition:"0.18s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=paleta.accent; e.currentTarget.style.background=`${paleta.accent}18`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--bg-alt)"; }}>
                    <div style={{ color:paleta.accent, marginBottom:"8px" }}><b.Icon/></div>
                    <p style={{ fontSize:".78rem", fontWeight:"600", marginBottom:"2px" }}>{b.t}</p>
                    <p style={{ fontSize:".68rem", color:"var(--fg-muted)" }}>{b.s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="perfil-section">
            <p style={{ fontSize:".64rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--fg-faint)", marginBottom:"7px", paddingLeft:"3px" }}>Suporte</p>
            <button onClick={abrirChat}
              style={{ width:"100%", padding:"12px 14px", background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.3)", borderRadius:"var(--r-sm)", fontFamily:"inherit", fontSize:".84rem", color:"#25D366", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"9px", transition:"0.18s", fontWeight:"600" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(37,211,102,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(37,211,102,0.08)"}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.214a.75.75 0 0 0 .93.899l5.554-1.95A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.211-1.433l-.374-.222-3.876 1.362 1.243-3.763-.245-.389A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Falar com a LOPOS no WhatsApp
            </button>
          </div>

          <div className="perfil-section">
            <button onClick={handleSair}
              style={{ width:"100%", padding:"11px", background:"transparent", border:"1px solid var(--border)", borderRadius:"var(--r-sm)", fontFamily:"inherit", fontSize:".84rem", color:"var(--danger)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"7px", transition:"0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(244,63,94,.08)"; e.currentTarget.style.borderColor="var(--danger)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="var(--border)"; }}>
              <IcoLogout/> Terminar sessão
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
      `}</style>
    </>
  );
}