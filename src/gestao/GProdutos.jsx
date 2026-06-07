import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "../i18n";



const CATS = [
  "Computadores",
  "Impressoras",
  "Rede",
  "NoteBook",
  "Periféricos",
  "Armazenamento",
];
const API = "https://lojalopos.infinityfreeapp.com/api/produtos.php";
const UPLOAD = "https://lojalopos.infinityfreeapp.com/api/upload_imagem.php";

const fmt = (v) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  }).format(v || 0);

/* ═══════════════════════════════════════════════════════════
   EXPORTAÇÃO PARA EXCEL
═══════════════════════════════════════════════════════════ */
const carregarSheetJS = () =>
  new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    s.onerror = reject;
    document.head.appendChild(s);
  });

const exportarProdutosExcel = async (produtos, nomeFicheiro = "catalogo_produtos", t) => {
  const XLSX = await carregarSheetJS();
  const wsData = [
    [
      "ID",
      t("nome_produto"),
      t("marca"),
      t("categoria"),
      t("preco_normal") + " (AOA)",
      t("preco_com_desconto"),
      t("qtd_stock"),
      t("stock_minimo"),
      t("status"),
      t("bonus_cartao"),
      t("desconto_pct"),
      t("custo"),
    ],
  ];
  produtos.forEach((p) => {
    wsData.push([
      p.id_produto || "—",
      p.nome || "—",
      p.marca || "—",
      p.categoria || "—",
      p.preco || 0,
      p.preco_com_desconto || p.preco || 0,
      p.estoque || 0,
      p.estoque_minimo || 5,
      p.status || "disponivel",
      p.bonus_saldo || 0,
      p.bonus_percentual || 0,
      p.custo || 0,
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [
    { wch: 8 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
    { wch: 12 }, { wch: 12 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produtos");
  const dataStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${nomeFicheiro}_${dataStr}.xlsx`);
};

/* ═══════════════════════════════════════════════════════════
   ÍCONES SVG
═══════════════════════════════════════════════════════════ */
const IcoPlus = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IcoEdit = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IcoTrash = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const IcoSearch = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IcoUpload = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const IcoCheck = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IcoAlertCircle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IcoPackage = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IcoImage = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const IcoStock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const IcoRefresh = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IcoExcel = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="10" y1="9" x2="10" y2="9" />
  </svg>
);

const IcoClose = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IcoGrid = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const IcoList = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   COMPONENTE STATUS BADGE
═══════════════════════════════════════════════════════════ */
const StatusBadge = ({ status, G, t }) => {
  const config = {
    disponivel: { label: t("status_disponivel"), color: G.success, bg: `${G.success}12` },
    esgotado: { label: t("status_esgotado"), color: G.danger, bg: `${G.danger}12` },
    descontinuado: { label: t("status_descontinuado"), color: G.muted, bg: `${G.muted}12` },
  };
  const c = config[status] || config.disponivel;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: "10px", fontWeight: "700", padding: "5px 12px", borderRadius: "30px", color: c.color, background: c.bg, border: `1px solid ${c.color}25` }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.color, marginRight: "5px" }} />
      {c.label}
    </span>
  );
};

/* ═══════════════════════════════════════════════════════════
   COMPONENTE MULTI IMAGENS
═══════════════════════════════════════════════════════════ */
const MultiImagens = ({ imagens, onChange, G, t }) => {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const remover = (i) => onChange(imagens.filter((_, idx) => idx !== i));
  const moverEsq = (i) => {
    if (!i) return;
    const n = [...imagens];
    [n[i - 1], n[i]] = [n[i], n[i - 1]];
    onChange(n);
  };
  const moverDir = (i) => {
    if (i === imagens.length - 1) return;
    const n = [...imagens];
    [n[i], n[i + 1]] = [n[i + 1], n[i]];
    onChange(n);
  };
  const addUrl = () => {
    const u = urlInput.trim();
    if (!u || imagens.length >= 5) return;
    onChange([...imagens, u]);
    setUrlInput("");
  };
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const slots = 5 - imagens.length;
    if (slots <= 0) return;
    setUploading(true);
    for (const f of files.slice(0, slots)) {
      const fd = new FormData();
      fd.append("imagem", f);
      try {
        const r = await fetch(UPLOAD, { method: "POST", body: fd });
        const d = await r.json();
        if (d.success) onChange((prev) => [...prev, d.url]);
      } catch {}
    }
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(75px, 1fr))", gap: "10px", marginBottom: "12px" }}>
        {imagens.map((url, i) => (
          <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: "12px", overflow: "hidden", border: `2px solid ${i === 0 ? G.accent : G.border}`, background: G.cardAlt }}>
            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.target.src = "https://via.placeholder.com/75?text=!")} />
            {i === 0 && (<div style={{ position: "absolute", top: "4px", left: "4px", background: G.accent, color: "#000", fontSize: "7px", fontWeight: "800", padding: "2px 6px", borderRadius: "5px" }}>PRINCIPAL</div>)}
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", opacity: 0, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}>
              <button onClick={() => moverEsq(i)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "5px", color: "#fff", cursor: "pointer", padding: "5px 7px", fontSize: "11px" }}>◀</button>
              <button onClick={() => remover(i)} style={{ background: "rgba(255,70,70,0.9)", border: "none", borderRadius: "5px", color: "#fff", cursor: "pointer", padding: "5px 7px", fontSize: "11px" }}>✕</button>
              <button onClick={() => moverDir(i)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "5px", color: "#fff", cursor: "pointer", padding: "5px 7px", fontSize: "11px" }}>▶</button>
            </div>
          </div>
        ))}
        {imagens.length < 5 && (
          <div onClick={() => fileRef.current?.click()} style={{ aspectRatio: "1", borderRadius: "12px", border: `2px dashed ${G.border}`, background: G.cardAlt, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "5px", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.background = `${G.accent}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.background = G.cardAlt; }}>
            {uploading ? (<span>⏳</span>) : (<><IcoUpload /><span style={{ fontSize: "9px", color: G.muted }}>{imagens.length === 0 ? "Adicionar" : `+ (${imagens.length}/5)`}</span></>)}
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
      {imagens.length < 5 && (
        <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
          <input style={{ flex: 1, minWidth: "150px", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "10px", padding: "10px 14px", color: G.text, fontSize: "12px", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = G.accent)}
            onBlur={(e) => (e.target.style.borderColor = G.border)}
            value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Ou cole a URL da imagem..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }} />
          <button onClick={addUrl} style={{ background: G.accent, border: "none", borderRadius: "10px", padding: "0 18px", color: "#000", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}>Adicionar</button>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MODAL PRODUTO COMPLETO
═══════════════════════════════════════════════════════════ */
const ProdutoModal = ({ isOpen, onClose, produto, onSave, G, t }) => {
  const empty = {
    nome: "", descricao: "", marca: "", preco: "", preco_antigo: "", custo: "",
    estoque: "", estoque_minimo: "5", bonus_percentual: "", bonus_saldo: "",
    categoria: "Computadores", ativo: true, status: "disponivel", imagens: [],
  };
  const [form, setForm] = useState(empty);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState("basico");

  useEffect(() => {
    if (!isOpen) return;
    setFeedback(null);
    setSalvando(false);
    setActiveTab("basico");
    if (produto) {
      setForm({
        nome: produto.nome || "",
        descricao: produto.descricao || "",
        marca: produto.marca || "",
        preco: produto.preco || "",
        preco_antigo: produto.preco_antigo || "",
        custo: produto.custo || "",
        estoque: produto.estoque || "",
        estoque_minimo: produto.estoque_minimo || "5",
        bonus_percentual: produto.bonus_percentual || "",
        bonus_saldo: produto.bonus_saldo && produto.bonus_saldo !== 0 ? String(produto.bonus_saldo) : "",
        categoria: produto.categoria || "Computadores",
        ativo: produto.ativo === 1,
        status: produto.status || "disponivel",
        imagens: produto.imagens?.length ? produto.imagens : produto.imagem_url ? [produto.imagem_url] : [],
      });
    } else {
      setForm(empty);
    }
  }, [isOpen, produto]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nome.trim() || !form.preco) {
      setFeedback({ ok: false, msg: t("campos_obrigatorios") });
      return;
    }
    setSalvando(true);
    setFeedback(null);
    const estoqueVal = parseInt(form.estoque) || 0;
    const estoqueMin = parseInt(form.estoque_minimo) || 5;
    const statusFinal = form.status === "descontinuado" ? "descontinuado" : estoqueVal <= estoqueMin ? "esgotado" : "disponivel";
    try {
      const body = {
        nome: form.nome.trim(),
        descricao: form.descricao,
        marca: form.marca,
        preco: parseFloat(form.preco) || 0,
        preco_antigo: parseFloat(form.preco_antigo) || 0,
        custo: parseFloat(form.custo) || 0,
        estoque: estoqueVal,
        estoque_minimo: estoqueMin,
        bonus_percentual: parseFloat(form.bonus_percentual) || 0,
        bonus_saldo: form.bonus_saldo !== "" ? parseFloat(form.bonus_saldo) : 0,
        categoria: form.categoria,
        ativo: form.ativo,
        status: statusFinal,
        imagens: form.imagens,
      };
      if (produto) body.id_produto = produto.id_produto;
      const res = await fetch(API, { method: produto ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { onSave(data.message); onClose(); }
      else setFeedback({ ok: false, msg: data.message || t("erro") });
    } catch (e) { setFeedback({ ok: false, msg: t("erro_ligacao") }); }
    setSalvando(false);
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "16px", animation: "fadeInModal 0.2s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: G.card, border: `1px solid ${G.border2 || G.border}`, borderRadius: "24px", width: "100%", maxWidth: "750px", maxHeight: "90vh", overflowY: "auto", animation: "slideUpModal 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${G.border}`, background: `linear-gradient(135deg, ${G.cardAlt}, ${G.card})`, borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 2, flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "45px", height: "45px", borderRadius: "14px", background: `linear-gradient(135deg, ${G.accent}25, ${G.accent}08)`, border: `1px solid ${G.accent}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>{produto ? <IcoEdit /> : <IcoPlus />}</div>
            <div><h2 style={{ fontSize: "20px", fontWeight: "700", color: G.text, margin: 0 }}>{produto ? t("editar") : t("novo_produto")}</h2><p style={{ fontSize: "12px", color: G.muted, margin: "2px 0 0" }}>{produto ? `#${produto.id_produto}` : t("product_fill_data")}</p></div>
          </div>
          <button onClick={onClose} style={{ width: "38px", height: "38px", borderRadius: "12px", background: G.cardAlt, border: `1px solid ${G.border}`, color: G.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.danger; e.currentTarget.style.color = G.danger; e.currentTarget.style.transform = "rotate(90deg)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; e.currentTarget.style.transform = "rotate(0deg)"; }}><IcoClose /></button>
        </div>

        <div style={{ display: "flex", gap: "4px", padding: "12px 20px 0 20px", borderBottom: `1px solid ${G.border}`, background: G.card, flexWrap: "wrap" }}>
          {[{ id: "basico", label: t("tab_info") }, { id: "precos", label: t("tab_precos") }, { id: "stock", label: t("tab_stock") }, { id: "imagens", label: t("tab_imagens") }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "8px 16px", borderRadius: "40px", border: "none", background: activeTab === tab.id ? `linear-gradient(135deg, ${G.accent}20, ${G.accent}08)` : "transparent", color: activeTab === tab.id ? G.accent : G.muted, cursor: "pointer", fontSize: "12px", fontWeight: activeTab === tab.id ? "600" : "500", transition: "all 0.2s", marginBottom: "-1px", borderBottom: activeTab === tab.id ? `2px solid ${G.accent}` : "none" }}>{tab.label}</button>
          ))}
        </div>

        <div style={{ padding: "20px" }}>
          {activeTab === "basico" && (
            <>
              <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("nome_produto")} *</label>
                <input style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none", transition: "all 0.2s" }}
                  onFocus={(e) => (e.target.style.borderColor = G.accent)}
                  onBlur={(e) => (e.target.style.borderColor = G.border)}
                  value={form.nome} onChange={(e) => setField("nome", e.target.value)} placeholder="Ex: Notebook HP Pavilion" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("marca")}</label>
                  <input style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = G.accent)}
                    onBlur={(e) => (e.target.style.borderColor = G.border)}
                    value={form.marca} onChange={(e) => setField("marca", e.target.value)} placeholder="Ex: HP, Dell" />
                </div>
                <div><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("categoria")}</label>
                  <select style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = G.accent)}
                    onBlur={(e) => (e.target.style.borderColor = G.border)}
                    value={form.categoria} onChange={(e) => setField("categoria", e.target.value)}>
                    {CATS.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
              </div>
              <div><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("descricao")}</label>
                <textarea style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none", resize: "vertical", minHeight: "90px" }}
                  onFocus={(e) => (e.target.style.borderColor = G.accent)}
                  onBlur={(e) => (e.target.style.borderColor = G.border)}
                  value={form.descricao} onChange={(e) => setField("descricao", e.target.value)} placeholder={t("product_description_placeholder")} />
              </div>
            </>
          )}

          {activeTab === "precos" && (
            <>
              <div style={{ marginBottom: "16px" }}><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("preco_normal")} *</label>
                <input type="number" style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none" }}
                  onFocus={(e) => (e.target.style.borderColor = G.accent)}
                  onBlur={(e) => (e.target.style.borderColor = G.border)}
                  value={form.preco} onChange={(e) => setField("preco", e.target.value)} placeholder="0" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("preco_antigo")}</label>
                  <input type="number" style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = G.accent)}
                    onBlur={(e) => (e.target.style.borderColor = G.border)}
                    value={form.preco_antigo} onChange={(e) => setField("preco_antigo", e.target.value)} placeholder="0" />
                </div>
                <div><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("custo")}</label>
                  <input type="number" style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = G.accent)}
                    onBlur={(e) => (e.target.style.borderColor = G.border)}
                    value={form.custo} onChange={(e) => setField("custo", e.target.value)} placeholder="0" />
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: "16px", marginTop: "8px" }}>
                <div style={{ fontSize: "12px", color: G.accent, fontWeight: "600", marginBottom: "14px" }}>{t("promocoes_bonus")}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("desconto_pct")}</label>
                    <input type="number" style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none" }}
                      onFocus={(e) => (e.target.style.borderColor = G.accent)}
                      onBlur={(e) => (e.target.style.borderColor = G.border)}
                      value={form.bonus_percentual} onChange={(e) => setField("bonus_percentual", e.target.value)} placeholder="Ex: 10" />
                  </div>
                  <div><label style={{ fontSize: "12px", color: G.success, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("bonus_cartao")}</label>
                    <input type="number" style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none" }}
                      onFocus={(e) => (e.target.style.borderColor = G.accent)}
                      onBlur={(e) => (e.target.style.borderColor = G.border)}
                      value={form.bonus_saldo} onChange={(e) => setField("bonus_saldo", e.target.value)} placeholder="Ex: 500" />
                  </div>
                </div>
                {parseFloat(form.bonus_percentual) > 0 && (<div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "10px", background: `${G.warning}12`, border: `1px solid ${G.warning}25`, fontSize: "11px", color: G.warning, display: "flex", alignItems: "center", gap: "8px" }}>
                  <IcoAlertCircle size={14} /> {t("preco_com_desconto")} <strong>{fmt((parseFloat(form.preco) * (1 - parseFloat(form.bonus_percentual) / 100)).toFixed(2))}</strong>
                </div>)}
              </div>
            </>
          )}

          {activeTab === "stock" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                <div><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("qtd_stock")}</label>
                  <input type="number" style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = G.accent)}
                    onBlur={(e) => (e.target.style.borderColor = G.border)}
                    value={form.estoque} onChange={(e) => setField("estoque", e.target.value)} placeholder="0" />
                </div>
                <div><label style={{ fontSize: "12px", color: G.muted, marginBottom: "6px", display: "block", fontWeight: "600" }}>{t("stock_minimo")}</label>
                  <input type="number" style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "12px 14px", color: G.text, fontSize: "14px", outline: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = G.accent)}
                    onBlur={(e) => (e.target.style.borderColor = G.border)}
                    value={form.estoque_minimo} onChange={(e) => setField("estoque_minimo", e.target.value)} placeholder="5" />
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "12px", background: G.cardAlt, borderRadius: "12px", marginBottom: "14px" }}>
                <input type="checkbox" checked={form.ativo} onChange={(e) => setField("ativo", e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                <span style={{ fontSize: "13px", color: G.text }}>{t("produto_activo")}</span>
              </label>
              {parseInt(form.estoque) <= parseInt(form.estoque_minimo) && parseInt(form.estoque) > 0 && (
                <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "10px", background: `${G.warning}12`, border: `1px solid ${G.warning}25`, fontSize: "11px", color: G.warning, display: "flex", alignItems: "center", gap: "8px" }}>
                  <IcoAlertCircle size={14} /> {t("stock_critico_aviso")} ({form.estoque} ≤ {form.estoque_minimo})
                </div>
              )}
              {parseInt(form.estoque) === 0 && (
                <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "10px", background: `${G.danger}12`, border: `1px solid ${G.danger}25`, fontSize: "11px", color: G.danger, display: "flex", alignItems: "center", gap: "8px" }}>
                  <IcoAlertCircle size={14} /> {t("esgotado_aviso")}
                </div>
              )}
            </>
          )}

          {activeTab === "imagens" && (<><label style={{ fontSize: "12px", color: G.muted, marginBottom: "10px", display: "block", fontWeight: "600" }}>{t("imagens_produto")}</label><MultiImagens imagens={form.imagens} onChange={(v) => setField("imagens", v)} G={G} t={t} /></>)}

          {feedback && (<div style={{ marginTop: "16px", padding: "12px 16px", borderRadius: "12px", background: feedback.ok ? `${G.success}12` : `${G.danger}12`, border: `1px solid ${feedback.ok ? G.success : G.danger}30`, color: feedback.ok ? G.success : G.danger, fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            {feedback.ok ? <IcoCheck /> : <IcoAlertCircle />} {feedback.msg}
          </div>)}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${G.border}` }}>
            <button onClick={onClose} style={{ padding: "12px", borderRadius: "10px", border: `1px solid ${G.border}`, background: "transparent", color: G.muted, cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.danger; e.currentTarget.style.color = G.danger; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; }}>{t("cancelar")}</button>
            <button onClick={handleSubmit} disabled={salvando} style={{ padding: "12px", borderRadius: "10px", border: "none", background: `linear-gradient(135deg, ${G.accent}, ${G.accent}80)`, color: "#000", cursor: salvando ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}
              onMouseEnter={(e) => { if (!salvando) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { if (!salvando) e.currentTarget.style.transform = "translateY(0)"; }}>
              {salvando ? (<><div style={{ width: "14px", height: "14px", border: `2px solid rgba(0,0,0,0.2)`, borderTop: `2px solid #000`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> {t("a_processar")}</>) : produto ? (<><IcoCheck /> {t("guardar")}</>) : (<><IcoPlus /> {t("criar_utilizador")}</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MODAL CONTROLO DE STOCK
═══════════════════════════════════════════════════════════ */
const StockModal = ({ isOpen, onClose, G, t }) => {
  const [movimentos, setMovimentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => { if (isOpen) carregar(); }, [isOpen]);

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (data.success) {
        const movs = [];
        (data.data || []).forEach((p) => {
          const stock = parseInt(p.estoque || 0);
          const stMin = parseInt(p.estoque_minimo || 5);
          const criado = p.criado_em ? new Date(p.criado_em).toLocaleDateString("pt-AO") : "—";
          const atual = p.atualizado_em ? new Date(p.atualizado_em).toLocaleDateString("pt-AO") : "—";
          movs.push({ id: p.id_produto, produto: p.nome, categoria: p.categoria, tipo: "entrada", quantidade: stock, stock_atual: stock, stock_min: stMin, data: criado, descricao: "Stock inicial", status: p.status, imagem: p.imagens?.[0] || p.imagem_url || "" });
          if (p.atualizado_em && p.atualizado_em !== p.criado_em) {
            movs.push({ id: `${p.id_produto}_upd`, produto: p.nome, categoria: p.categoria, tipo: stock <= stMin ? "saida" : "atualizacao", quantidade: stock, stock_atual: stock, stock_min: stMin, data: atual, descricao: stock <= stMin ? "Stock crítico" : "Actualização de stock", status: p.status, imagem: p.imagens?.[0] || p.imagem_url || "" });
          }
        });
        movs.sort((a, b) => new Date(b.data) - new Date(a.data));
        setMovimentos(movs);
      }
    } catch {}
    setLoading(false);
  };

  const filtrados = movimentos.filter((m) => {
    const okT = filtroTipo === "todos" || m.tipo === filtroTipo;
    const okB = !filtroBusca || m.produto.toLowerCase().includes(filtroBusca.toLowerCase()) || m.categoria?.toLowerCase().includes(filtroBusca.toLowerCase());
    return okT && okB;
  });

  const totalEntradas = movimentos.filter((m) => m.tipo === "entrada").length;
  const totalSaidas = movimentos.filter((m) => m.tipo === "saida").length;
  const totalCriticos = movimentos.filter((m) => m.stock_atual <= m.stock_min && m.stock_atual > 0).length;
  const totalEsgotados = movimentos.filter((m) => m.stock_atual === 0).length;

  const tipoInfo = {
    entrada: { cor: G.success, label: "Entrada", icon: "↓" },
    saida: { cor: G.danger, label: "Saída", icon: "↑" },
    atualizacao: { cor: G.accent, label: "Actualização", icon: "⟳" },
  };

  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "16px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: G.card, border: `1px solid ${G.border2 || G.border}`, borderRadius: "24px", width: "100%", maxWidth: "1000px", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${G.border}`, background: `linear-gradient(135deg, ${G.cardAlt}, ${G.card})`, borderRadius: "24px 24px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "45px", height: "45px", borderRadius: "14px", background: `linear-gradient(135deg, ${G.accent}25, ${G.accent}08)`, border: `1px solid ${G.accent}35`, display: "flex", alignItems: "center", justifyContent: "center" }}><IcoStock /></div>
            <div><h2 style={{ fontSize: "20px", fontWeight: "700", color: G.text, margin: 0 }}>{t("controlo_stock")}</h2><p style={{ fontSize: "12px", color: G.muted, margin: "2px 0 0" }}>{t("monitorize_stock")}</p></div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={carregar} style={{ background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "10px", padding: "8px 16px", color: G.muted, cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = G.accent)}><IcoRefresh /> {t("actualizar")}</button>
            <button onClick={onClose} style={{ width: "38px", height: "38px", borderRadius: "10px", background: G.cardAlt, border: `1px solid ${G.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = G.danger)}><IcoClose /></button>
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", marginBottom: "24px" }}>
            {[{ label: "Entradas", val: totalEntradas, color: G.success }, { label: "Saídas", val: totalSaidas, color: G.danger }, { label: "Stock Crítico", val: totalCriticos, color: G.warning }, { label: "Esgotados", val: totalEsgotados, color: G.danger }].map((s) => (
              <div key={s.label} style={{ background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "14px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", fontWeight: "800", color: s.color }}>{s.val}</div>
                <div style={{ fontSize: "10px", color: G.muted, textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1", minWidth: "180px" }}><span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: G.muted }}><IcoSearch /></span>
              <input style={{ width: "100%", background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "12px", padding: "10px 12px 10px 38px", color: G.text, fontSize: "13px", outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = G.accent)}
                onBlur={(e) => (e.target.style.borderColor = G.border)}
                placeholder={t("pesquisar")} value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[{ key: "todos", label: "Todos" }, { key: "entrada", label: "Entradas" }, { key: "saida", label: "Saídas" }, { key: "atualizacao", label: "Actualizações" }].map((f) => (
                <button key={f.key} onClick={() => setFiltroTipo(f.key)} style={{ padding: "6px 16px", borderRadius: "30px", border: `1px solid ${filtroTipo === f.key ? G.accent : G.border}`, background: filtroTipo === f.key ? `${G.accent}12` : "transparent", color: filtroTipo === f.key ? G.accent : G.muted, cursor: "pointer", fontSize: "11px", fontWeight: filtroTipo === f.key ? "600" : "500" }}>{f.label}</button>
              ))}
            </div>
          </div>

          <div style={{ background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto" }} className="stock-scroll">
              {loading ? (<div style={{ textAlign: "center", padding: "60px", color: G.muted }}><div style={{ width: "36px", height: "36px", border: `3px solid ${G.border}`, borderTop: `3px solid ${G.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} /><span>{t("a_carregar")}</span></div>
              ) : filtrados.length === 0 ? (<div style={{ textAlign: "center", padding: "60px", color: G.muted }}><IcoPackage /><p style={{ marginTop: "12px", fontSize: "13px" }}>{t("sem_movimentos")}</p></div>
              ) : (<table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead style={{ position: "sticky", top: 0, background: G.cardAlt, zIndex: 1 }}>
                    <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                      {["Produto", "Categoria", "Tipo", "Qtd", "Stock Atual", "Data", "Status"].map((h) => (<th key={h} style={{ textAlign: "left", padding: "12px 14px", color: G.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>{h}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((m, idx) => {
                      const ti = tipoInfo[m.tipo] || tipoInfo.atualizacao;
                      const corS = m.stock_atual === 0 ? "danger" : m.stock_atual <= m.stock_min ? "warning" : "success";
                      const colorMap = { success: G.success, warning: G.warning, danger: G.danger };
                      return (
                        <tr key={idx} style={{ borderBottom: `1px solid ${G.border}` }}>
                          <td style={{ padding: "10px 14px" }}><div style={{ display: "flex", alignItems: "center", gap: "8px" }}>{m.imagem ? (<img src={m.imagem} alt={m.produto} style={{ width: "30px", height: "30px", borderRadius: "8px", objectFit: "cover" }} />) : (<div style={{ width: "30px", height: "30px", borderRadius: "8px", background: G.card, display: "flex", alignItems: "center", justifyContent: "center" }}><IcoImage /></div>)}<span style={{ fontWeight: "500", color: G.text, fontSize: "12px" }}>{m.produto}</span></div></td>
                          <td style={{ padding: "10px 14px", color: G.muted, fontSize: "11px" }}>{m.categoria}</td>
                          <td style={{ padding: "10px 14px" }}><span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "30px", color: ti.cor, background: `${ti.cor}12`, border: `1px solid ${ti.cor}30` }}>{ti.icon} {ti.label}</span></td>
                          <td style={{ padding: "10px 14px", fontWeight: "600", color: ti.cor, fontSize: "12px" }}>{m.quantidade}</td>
                          <td style={{ padding: "10px 14px" }}><span style={{ padding: "3px 10px", borderRadius: "30px", fontSize: "10px", fontWeight: "600", color: colorMap[corS], background: `${colorMap[corS]}12`, border: `1px solid ${colorMap[corS]}25` }}>{m.stock_atual} {t("unidades")}</span></td>
                          <td style={{ padding: "10px 14px", color: G.muted, fontSize: "11px" }}>{m.data}</td>
                          <td style={{ padding: "10px 14px" }}><StatusBadge status={m.status} G={G} t={t} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>)}
            </div>
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${G.border}`, background: G.cardAlt, display: "flex", justifyContent: "space-between", fontSize: "11px", color: G.muted, flexWrap: "wrap", gap: "8px" }}>
              <span>{t("total_label")} <strong style={{ color: G.accent }}>{filtrados.length}</strong> {t("movimentos_label")}</span>
              <span>{t("ultima_actualizacao")} {new Date().toLocaleString("pt-AO")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL GProdutos
═══════════════════════════════════════════════════════════ */
const GProdutos = ({ G }) => {
  const { t } = useTranslation();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCat, setFiltroCat] = useState("Todas");
  const [filtroSt, setFiltroSt] = useState("todos");
  const [feedback, setFeedback] = useState(null);
  const [modal, setModal] = useState({ tipo: null, produto: null });
  const [exportando, setExportando] = useState(false);
  const [viewMode, setViewMode] = useState("cards");
  const [hoverCard, setHoverCard] = useState(null);

  const abrirNovo = useCallback(() => setModal({ tipo: "produto", produto: null }), []);
  const abrirEditar = useCallback((p) => setModal({ tipo: "produto", produto: p }), []);
  const abrirStock = useCallback(() => setModal({ tipo: "stock", produto: null }), []);
  const fecharModal = useCallback(() => setModal({ tipo: null, produto: null }), []);

  const carregar = useCallback(() => {
    setLoading(true);
    fetch(API).then((r) => r.json()).then((d) => { if (d.success) setProdutos(d.data || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const handleSave = useCallback((msg) => { carregar(); setFeedback({ ok: true, msg: msg || t("produto_guardado") }); setTimeout(() => setFeedback(null), 4000); }, [carregar, t]);

  const eliminar = async (id, nome) => {
    if (!confirm(t("confirmar_eliminar").replace("{nome}", nome))) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setFeedback({ ok: true, msg: data.message || t("produto_eliminado") }); carregar(); setTimeout(() => setFeedback(null), 3000); }
      else { setFeedback({ ok: false, msg: data.message || t("erro") }); }
    } catch { setFeedback({ ok: false, msg: t("erro_ligacao") }); }
  };

  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      await exportarProdutosExcel(filtrados, "catalogo_produtos_lopos", t);
      setFeedback({ ok: true, msg: "Exportado com sucesso!" });
      setTimeout(() => setFeedback(null), 3000);
    } catch { setFeedback({ ok: false, msg: "Erro ao exportar." }); }
    setExportando(false);
  };

  const filtrados = produtos.filter((p) => {
    const okB = !busca || p.nome?.toLowerCase().includes(busca.toLowerCase()) || p.marca?.toLowerCase().includes(busca.toLowerCase());
    const okC = filtroCat === "Todas" || p.categoria === filtroCat;
    const okS = filtroSt === "todos" || p.status === filtroSt;
    return okB && okC && okS;
  });

  const nDisp = produtos.filter((p) => p.status === "disponivel").length;
  const nEsg = produtos.filter((p) => p.status === "esgotado").length;
  const nOfer = produtos.filter((p) => parseFloat(p.bonus_percentual || 0) > 0).length;
  const nBon = produtos.filter((p) => parseFloat(p.bonus_saldo || 0) > 0).length;

  return (
    <div style={{ padding: "20px", maxWidth: "1440px", margin: "0 auto", minHeight: "100vh" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInModal { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpModal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .produtos-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .produtos-scroll::-webkit-scrollbar-track { background: ${G.border}; border-radius: 8px; }
        .produtos-scroll::-webkit-scrollbar-thumb { background: ${G.accent}40; border-radius: 8px; }
        .produtos-scroll::-webkit-scrollbar-thumb:hover { background: ${G.accent}; }
        .stock-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .stock-scroll::-webkit-scrollbar-track { background: ${G.border}; border-radius: 8px; }
        .stock-scroll::-webkit-scrollbar-thumb { background: ${G.accent}40; border-radius: 8px; }
      `}</style>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: `linear-gradient(135deg, ${G.accent}25, ${G.accent}08)`, border: `1px solid ${G.accent}35`, display: "flex", alignItems: "center", justifyContent: "center" }}><IcoPackage size={28} /></div>
              <div><h1 style={{ fontSize: "24px", fontWeight: "800", color: G.text, margin: 0, letterSpacing: "-0.5px" }}>{t("gestao_produtos")}</h1><p style={{ fontSize: "12px", color: G.muted, margin: "2px 0 0" }}>{t("sub_produtos")}</p></div>
            </div>
            <div style={{ display: "flex", gap: "16px", marginLeft: "60px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: G.muted }}>{t("total_label")}: <strong style={{ color: G.text }}>{produtos.length}</strong></span>
              {nEsg > 0 && <span style={{ fontSize: "11px", color: G.danger }}>{t("esgotados_label")}: {nEsg}</span>}
              {nOfer > 0 && <span style={{ fontSize: "11px", color: G.warning }}>{t("ofertas")}: {nOfer}</span>}
              {nBon > 0 && <span style={{ fontSize: "11px", color: G.success }}>{t("bonus")}: {nBon}</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: "200px", flex: "1" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: G.muted }}><IcoSearch size={14} /></span>
              <input style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "10px", padding: "10px 12px 10px 38px", color: G.text, fontSize: "13px", width: "100%", outline: "none", transition: "all 0.2s", boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.borderColor = G.accent)}
                onBlur={(e) => (e.target.style.borderColor = G.border)}
                placeholder={t("buscar_produto")} value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>

            <div style={{ display: "flex", gap: "6px", background: G.cardAlt, borderRadius: "10px", padding: "4px" }}>
              <button onClick={() => setViewMode("cards")} style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: viewMode === "cards" ? G.accent : "transparent", color: viewMode === "cards" ? "#000" : G.muted, cursor: "pointer", fontSize: "11px", fontWeight: viewMode === "cards" ? "600" : "500", display: "flex", alignItems: "center", gap: "5px" }}><IcoGrid size={14} /> {t("cards")}</button>
              <button onClick={() => setViewMode("list")} style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: viewMode === "list" ? G.accent : "transparent", color: viewMode === "list" ? "#000" : G.muted, cursor: "pointer", fontSize: "11px", fontWeight: viewMode === "list" ? "600" : "500", display: "flex", alignItems: "center", gap: "5px" }}><IcoList size={14} /> {t("lista")}</button>
            </div>

            <button onClick={abrirStock} style={{ background: G.cardAlt, border: `1px solid ${G.border}`, borderRadius: "10px", padding: "8px 14px", color: G.muted, cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = G.accent)}><IcoStock size={14} /> {t("stock")}</button>
            <button onClick={handleExportarExcel} disabled={exportando || filtrados.length === 0} style={{ background: "#1a7431", border: "none", borderRadius: "10px", padding: "8px 14px", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", opacity: exportando ? 0.7 : 1, whiteSpace: "nowrap" }}><IcoExcel size={14} /> {exportando ? "..." : "Excel"}</button>
            <button onClick={abrirNovo} style={{ background: `linear-gradient(135deg, ${G.accent}, ${G.accent}80)`, border: "none", borderRadius: "10px", padding: "8px 16px", color: "#000", cursor: "pointer", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}><IcoPlus size={14} /> {t("novo")}</button>
          </div>
        </div>
      </div>

      {feedback && (<div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 10000, padding: "10px 16px", borderRadius: "10px", background: feedback.ok ? G.success : G.danger, color: "#fff", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", animation: "slideUpModal 0.3s ease", fontSize: "12px" }}>{feedback.ok ? <IcoCheck size={14} /> : <IcoAlertCircle size={14} />} {feedback.msg}</div>)}

      <div style={{ display: "flex", gap: "8px", overflowX: "auto", marginBottom: "16px", paddingBottom: "6px", WebkitOverflowScrolling: "touch" }}>
        {["Todas", ...CATS].map((c) => (<button key={c} onClick={() => setFiltroCat(c)} style={{ padding: "6px 18px", borderRadius: "10px", border: `1px solid ${filtroCat === c ? G.accent : G.border}`, background: filtroCat === c ? `linear-gradient(135deg, ${G.accent}20, ${G.accent}08)` : "transparent", color: filtroCat === c ? G.accent : G.muted, cursor: "pointer", fontSize: "12px", fontWeight: filtroCat === c ? "600" : "500", whiteSpace: "nowrap", transition: "all 0.2s" }}>{c}</button>))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[{ key: "todos", label: `${t("todos")} (${produtos.length})`, color: G.accent }, { key: "disponivel", label: `${t("disponivel_label")} (${nDisp})`, color: G.success }, { key: "esgotado", label: `${t("esgotados_label")} (${nEsg})`, color: G.danger }].map((f) => (<button key={f.key} onClick={() => setFiltroSt(f.key)} style={{ padding: "6px 18px", borderRadius: "10px", border: `1px solid ${filtroSt === f.key ? f.color : G.border}`, background: filtroSt === f.key ? `${f.color}12` : "transparent", color: filtroSt === f.key ? f.color : G.muted, cursor: "pointer", fontSize: "12px", fontWeight: filtroSt === f.key ? "600" : "500", transition: "all 0.2s" }}>{f.label}</button>))}
      </div>

      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ maxHeight: "calc(100vh - 320px)", overflowY: "auto", overflowX: "auto" }} className="produtos-scroll">
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: G.muted }}>
              <div style={{ width: "40px", height: "40px", border: `3px solid ${G.border}`, borderTop: `3px solid ${G.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <span>{t("a_carregar")}</span>
            </div>
          ) : filtrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: G.muted }}>
              <IcoPackage size={40} />
              <p style={{ fontSize: "14px", fontWeight: "500", marginTop: "12px", color: G.text }}>{t("sem_produtos")}</p>
              <p style={{ fontSize: "12px", marginBottom: "16px" }}>{t("adicionar_primeiro")}</p>
              <button onClick={abrirNovo} style={{ background: `linear-gradient(135deg, ${G.accent}, ${G.accent}80)`, border: "none", borderRadius: "10px", padding: "8px 20px", color: "#000", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px" }}><IcoPlus size={14} /> {t("novo_produto")}</button>
            </div>
          ) : viewMode === "cards" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", padding: "16px" }}>
              {filtrados.map((p) => {
                const stock = parseInt(p.estoque || 0);
                const stMin = parseInt(p.estoque_minimo || 5);
                const corS = stock === 0 ? "danger" : stock <= stMin ? "warning" : "success";
                const colorMap = { success: G.success, warning: G.warning, danger: G.danger };
                const imgSrc = p.imagens?.[0] || p.imagem_url || "";
                const desconto = parseFloat(p.bonus_percentual || 0);
                const bSaldo = parseFloat(p.bonus_saldo || 0);
                const isHover = hoverCard === p.id_produto;
                return (
                  <div key={p.id_produto} style={{ background: G.cardAlt, borderRadius: "14px", border: `1px solid ${isHover ? G.accent : G.border}`, transition: "all 0.2s", overflow: "hidden", transform: isHover ? "translateY(-2px)" : "translateY(0)" }} onMouseEnter={() => setHoverCard(p.id_produto)} onMouseLeave={() => setHoverCard(null)}>
                    <div style={{ display: "flex", padding: "12px", gap: "12px" }}>
                      <div style={{ width: "65px", height: "65px", borderRadius: "10px", overflow: "hidden", background: G.card, flexShrink: 0 }}>
                        {imgSrc ? (<img src={imgSrc} alt={p.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} />) : (<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: G.muted }}><IcoImage size={24} /></div>)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: "700", color: G.text, fontSize: "13px", marginBottom: "2px" }}>{p.nome}</div>
                            <div style={{ fontSize: "10px", color: G.muted }}>{p.marca && `${p.marca} · `}{p.categoria}</div>
                          </div>
                          {desconto > 0 && (<span style={{ fontSize: "9px", fontWeight: "700", color: G.warning, background: `${G.warning}12`, padding: "2px 6px", borderRadius: "16px" }}>-{desconto}%</span>)}
                        </div>
                        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <div><span style={{ fontSize: "9px", color: G.muted }}>{t("preco")}</span><div style={{ fontWeight: "800", color: G.accent, fontSize: "13px" }}>{fmt(p.preco_com_desconto || p.preco)}</div></div>
                          <div><span style={{ fontSize: "9px", color: G.muted }}>{t("stock")}</span><div style={{ fontWeight: "600", color: colorMap[corS], fontSize: "12px" }}>{stock} {stock <= stMin && stock > 0 ? "⚠" : stock === 0 ? "✕" : ""}</div></div>
                          {bSaldo > 0 && (<div><span style={{ fontSize: "9px", color: G.muted }}>{t("bonus")}</span><div style={{ fontWeight: "600", color: G.success, fontSize: "11px" }}>+{fmt(bSaldo)}</div></div>)}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "8px 12px", background: G.card, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${G.border}`, flexWrap: "wrap", gap: "6px" }}>
                      <StatusBadge status={p.status} G={G} t={t} />
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => abrirEditar(p)} style={{ background: "transparent", border: `1px solid ${G.border}`, borderRadius: "8px", padding: "4px 10px", color: G.muted, cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.color = G.accent; }}><IcoEdit size={12} /> {t("editar")}</button>
                        <button onClick={() => eliminar(p.id_produto, p.nome)} style={{ background: "transparent", border: `1px solid ${G.border}`, borderRadius: "8px", padding: "4px 10px", color: G.muted, cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.danger; e.currentTarget.style.color = G.danger; }}><IcoTrash size={12} /> {t("eliminar")}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "550px" }}>
              <thead style={{ position: "sticky", top: 0, background: G.card, zIndex: 1 }}>
                <tr style={{ borderBottom: `1px solid ${G.border}` }}>
                  <th style={{ textAlign: "left", padding: "12px 14px", color: G.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>{t("produto")}</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", color: G.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>{t("preco")}</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", color: G.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>{t("stock")}</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", color: G.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>{t("status")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const stock = parseInt(p.estoque || 0);
                  const stMin = parseInt(p.estoque_minimo || 5);
                  const corS = stock === 0 ? "danger" : stock <= stMin ? "warning" : "success";
                  const colorMap = { success: G.success, warning: G.warning, danger: G.danger };
                  const imgSrc = p.imagens?.[0] || p.imagem_url || "";
                  const desconto = parseFloat(p.bonus_percentual || 0);
                  const bSaldo = parseFloat(p.bonus_saldo || 0);
                  return (
                    <tr key={p.id_produto} style={{ borderBottom: `1px solid ${G.border}`, transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = G.cardAlt)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {imgSrc ? (<img src={imgSrc} alt={p.nome} style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }} />) : (<div style={{ width: "36px", height: "36px", borderRadius: "8px", background: G.cardAlt, display: "flex", alignItems: "center", justifyContent: "center", color: G.muted }}><IcoImage size={16} /></div>)}
                          <div>
                            <div style={{ fontWeight: "700", color: G.text, fontSize: "13px" }}>{p.nome}</div>
                            <div style={{ fontSize: "10px", color: G.muted }}>{p.marca && `${p.marca} · `}{p.categoria}</div>
                          </div>
                        </div>
                       </td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontWeight: "800", color: G.accent, fontSize: "13px" }}>{fmt(p.preco_com_desconto || p.preco)}</div>
                        {desconto > 0 && (<div style={{ fontSize: "9px", color: G.muted, textDecoration: "line-through" }}>{fmt(p.preco)}</div>)}
                       </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "30px", fontSize: "10px", fontWeight: "600", color: colorMap[corS], background: `${colorMap[corS]}12`, border: `1px solid ${colorMap[corS]}25` }}>{stock}</span>
                        {bSaldo > 0 && (<span style={{ fontSize: "10px", color: G.success, marginLeft: "6px" }}>+{fmt(bSaldo)}</span>)}
                       </td>
                      <td style={{ padding: "10px 14px" }}><StatusBadge status={p.status} G={G} t={t} /></td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => abrirEditar(p)} style={{ background: "transparent", border: `1px solid ${G.border}`, borderRadius: "8px", padding: "4px 10px", color: G.muted, cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.accent; e.currentTarget.style.color = G.accent; }}><IcoEdit size={12} /> {t("editar")}</button>
                          <button onClick={() => eliminar(p.id_produto, p.nome)} style={{ background: "transparent", border: `1px solid ${G.border}`, borderRadius: "8px", padding: "4px 10px", color: G.muted, cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = G.danger; e.currentTarget.style.color = G.danger; }}><IcoTrash size={12} /> {t("eliminar")}</button>
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
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${G.border}`, background: G.cardAlt, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: G.muted, flexWrap: "wrap", gap: "8px" }}>
            <span>{t("mostrando")} <strong style={{ color: G.accent }}>{filtrados.length}</strong> {t("de")} <strong>{produtos.length}</strong> {t("produtos")}</span>
            <span>{t("total_label")}: <strong style={{ color: G.accent }}>{fmt(filtrados.reduce((acc, p) => acc + parseFloat(p.preco_com_desconto || p.preco) * parseInt(p.estoque || 0), 0))}</strong></span>
          </div>
        )}
      </div>

      <ProdutoModal isOpen={modal.tipo === "produto"} produto={modal.produto} onClose={fecharModal} onSave={handleSave} G={G} t={t} />
      <StockModal isOpen={modal.tipo === "stock"} onClose={fecharModal} G={G} t={t} />
    </div>
  );
};

export default GProdutos;
