import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "../i18n";


/* ══════════════════════════════════════════════════════════════
   GRelatorio.jsx — Relatórios Semanal / Mensal / Anual
   COM i18n COMPLETO
══════════════════════════════════════════════════════════════ */

const API = "https://lojalopos.infinityfreeapp.com/api/relatorio.php";

const fmt = (v) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  }).format(v || 0);

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-AO");
};

/* ══════════════════════════════════════════════════════════════
   ÍCONES SVG PREMIUM
══════════════════════════════════════════════════════════════ */
const IcoCalendar = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IcoDownload = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IcoRefresh = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const IcoAlertCircle = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IcoOrder = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

const IcoUsers = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IcoMoney = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IcoBox = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IcoWallet = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const IcoLock = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IcoStar = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IcoTruck = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <path d="M16 8h4l3 5v4h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const IcoFileText = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IcoArrowRight = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════ */
const GRelatorio = ({ G }) => {
  const { t } = useTranslation();
  const [periodo, setPeriodo] = useState("mensal");
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [hoverPeriodo, setHoverPeriodo] = useState(null);
  const [hoverExport, setHoverExport] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const printRef = useRef(null);

  // Monitorar mudanças de idioma
  useEffect(() => {
    console.log("📊 GRelatorio - Idioma atual:", G.idioma);
    if (dados) {
      buscarDados();
    }
  }, [G.idioma]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const resumoCols = isMobile ? 2 : isTablet ? 3 : 6;
  const mainGridCols = isMobile ? 1 : 2;

  /* ── Buscar dados ── */
  const buscarDados = async () => {
    setLoading(true);
    setErro("");
    setDados(null);
    try {
      const res = await fetch(`${API}?periodo=${periodo}`);
      const json = await res.json();
      if (json.success) {
        setDados(json);
      } else {
        setErro(json.message || t("erro_carregar"));
      }
    } catch {
      setErro(t("erro_ligacao"));
    }
    setLoading(false);
  };

  /* ══════════════════════════════════════════════════════════
     GERAÇÃO DO PDF via jsPDF
  ══════════════════════════════════════════════════════════ */
  const gerarPDF = async () => {
    if (!dados) return;
    setGerando(true);

    try {
      let jsPDF;
      if (window.jspdf) {
        jsPDF = window.jspdf.jsPDF;
      } else {
        await new Promise((resolve, reject) => {
          if (document.getElementById("jspdf-script")) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.id = "jspdf-script";
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        await new Promise((r) => setTimeout(r, 200));
        jsPDF = window.jspdf?.jsPDF;
      }

      if (!jsPDF) {
        gerarPDFPrint();
        setGerando(false);
        return;
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const PW = 210;
      const ML = 14;
      const MR = 196;
      let Y = 0;

      const cor = {
        accent: [0, 229, 255],
        bg: [8, 12, 16],
        card: [13, 21, 32],
        text: [232, 240, 254],
        muted: [107, 127, 163],
        success: [0, 196, 140],
        danger: [255, 107, 53],
        warning: [245, 166, 35],
        white: [255, 255, 255],
        line: [30, 40, 55],
      };

      const setFill = (rgb) => doc.setFillColor(...rgb);
      const setColor = (rgb) => doc.setTextColor(...rgb);
      const setDraw = (rgb) => doc.setDrawColor(...rgb);
      const bold = (s = 10) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(s);
      };
      const normal = (s = 9) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(s);
      };
      const nova_pagina = () => {
        doc.addPage();
        Y = 0;
        cabecalhoFundo();
      };
      const checkPage = (h = 20) => {
        if (Y + h > 275) nova_pagina();
      };

      const cabecalhoFundo = () => {
        setFill(cor.bg);
        doc.rect(0, 0, PW, 297, "F");
      };

      cabecalhoFundo();

      setFill(cor.card);
      doc.rect(0, 0, PW, 42, "F");
      setFill(cor.accent);
      doc.rect(0, 40, PW, 2, "F");

      bold(22);
      setColor(cor.white);
      doc.text("LO", ML, 22);
      setColor(cor.accent);
      doc.text("POS", ML + 18, 22);

      normal(9);
      setColor(cor.muted);
      doc.text(t("sistema_gestao") + " • " + t("relatorio_label"), ML, 32);

      const tipoLabel = {
        semanal: t("semanal_curto"),
        mensal: t("mensal_curto"),
        anual: t("anual_curto"),
      }[dados.periodo];
      bold(28);
      setColor(cor.accent);
      doc.text(`${t("relatorio_label")} ${tipoLabel}`, PW / 2, 80, { align: "center" });

      bold(13);
      setColor(cor.white);
      doc.text(dados.label, PW / 2, 93, { align: "center" });

      normal(9);
      setColor(cor.muted);
      doc.text(`${t("periodo")}: ${dados.inicio} — ${dados.fim}`, PW / 2, 102, {
        align: "center",
      });
      doc.text(`${t("gerado_em")}: ${dados.gerado_em}`, PW / 2, 109, {
        align: "center",
      });

      setDraw(cor.accent);
      doc.setLineWidth(0.4);
      doc.line(ML, 116, MR, 116);

      const cards = [
        { label: t("total_pedidos"), val: dados.pedidos?.total ?? 0, cor: cor.accent },
        { label: t("receita_gerada"), val: fmt(dados.pedidos?.receita_total), cor: cor.success },
        { label: t("novos_clientes"), val: dados.clientes?.novos ?? 0, cor: cor.warning },
        { label: t("entradas_label"), val: fmt(dados.financeiro?.entradas), cor: cor.success },
      ];

      const cardW = (PW - ML * 2 - 12) / 4;
      let cx = ML;
      cards.forEach((card) => {
        setFill(cor.card);
        doc.roundedRect(cx, 124, cardW, 28, 2, 2, "F");
        setFill(card.cor);
        doc.rect(cx, 124, cardW, 1.5, "F");
        normal(7);
        setColor(cor.muted);
        doc.text(card.label.toUpperCase(), cx + cardW / 2, 133, {
          align: "center",
        });
        bold(11);
        setColor(card.cor);
        doc.text(String(card.val), cx + cardW / 2, 142, { align: "center" });
        cx += cardW + 4;
      });

      normal(8);
      setColor(cor.muted);
      doc.text(t("nota_conf_titulo"), PW / 2, 270, { align: "center" });
      normal(7);
      doc.text(`LOPOS © ${new Date().getFullYear()} • Luanda, Angola`, PW / 2, 278, { align: "center" });

      const secTitulo = (titulo) => {
        checkPage(16);
        setFill(cor.card);
        doc.rect(ML - 2, Y, MR - ML + 4, 10, "F");
        setFill(cor.accent);
        doc.rect(ML - 2, Y, 2, 10, "F");
        bold(10);
        setColor(cor.accent);
        doc.text(titulo.toUpperCase(), ML + 4, Y + 7);
        Y += 14;
      };

      const linha = (esq, dir, cor1 = cor.text, cor2 = cor.accent, altBg = false) => {
        checkPage(8);
        if (altBg) {
          setFill([18, 26, 40]);
          doc.rect(ML - 2, Y, MR - ML + 4, 7, "F");
        }
        normal(8);
        setColor(cor1);
        doc.text(String(esq), ML + 2, Y + 5);
        bold(8);
        setColor(cor2);
        doc.text(String(dir), MR - 2, Y + 5, { align: "right" });
        Y += 8;
      };

      const divisor = () => {
        checkPage(5);
        setDraw(cor.line);
        doc.setLineWidth(0.2);
        doc.line(ML, Y, MR, Y);
        Y += 4;
      };

      const espaco = (n = 6) => {
        Y += n;
      };

      const rodape = (num) => {
        setColor(cor.muted);
        normal(7);
        doc.text(`LOPOS • ${t("relatorio_label")} ${tipoLabel} • ${dados.label}`, ML, 290);
        doc.text(`${t("pagina")} ${num}`, MR, 290, { align: "right" });
      };

      nova_pagina();
      Y = 14;
      rodape(2);

      secTitulo(t("sec_pedidos"));
      linha(t("total_pedidos"), dados.pedidos?.total ?? 0, cor.muted, cor.text);
      linha(t("status_pendente"), dados.pedidos?.pendentes ?? 0, cor.muted, cor.warning, true);
      linha(t("status_reservado"), dados.pedidos?.reservados ?? 0, cor.muted, cor.accent);
      linha(t("status_enviado"), dados.pedidos?.enviados ?? 0, cor.muted, cor.accent, true);
      linha(t("status_entregue"), dados.pedidos?.entregues ?? 0, cor.muted, cor.success);
      linha(t("status_cancelado"), dados.pedidos?.cancelados ?? 0, cor.muted, cor.danger, true);
      divisor();
      linha(t("receita_gerada"), fmt(dados.pedidos?.receita_total), cor.muted, cor.success);
      espaco();

      if (dados.top_pedidos?.length > 0) {
        checkPage(10);
        normal(8);
        setColor(cor.muted);
        doc.text(t("top5_pedidos"), ML + 2, Y);
        Y += 8;
        dados.top_pedidos.forEach((p, i) => {
          checkPage(8);
          const altBg = i % 2 === 0;
          if (altBg) {
            setFill([18, 26, 40]);
            doc.rect(ML - 2, Y, MR - ML + 4, 7, "F");
          }
          normal(8);
          setColor(cor.muted);
          doc.text(`#${p.id_pedido}  ${p.nome || "—"}`, ML + 2, Y + 5);
          doc.text(fmtDate(p.criado_em), ML + 90, Y + 5);
          bold(8);
          setColor(cor.success);
          doc.text(fmt(p.total), MR - 2, Y + 5, { align: "right" });
          Y += 8;
        });
        espaco();
      }

      secTitulo(t("sec_entregas"));
      linha(t("total_entregas"), dados.entregas?.total ?? 0, cor.muted, cor.text);
      linha(t("entregues_label"), dados.entregas?.entregues ?? 0, cor.muted, cor.success, true);
      linha(t("a_caminho"), dados.entregas?.enviados ?? 0, cor.muted, cor.accent);
      linha(t("canceladas_label"), dados.entregas?.canceladas ?? 0, cor.muted, cor.danger, true);
      linha(t("dist_media"), `${parseFloat(dados.entregas?.dist_media ?? 0).toFixed(1)} km`, cor.muted, cor.text);
      linha(t("receita_entregas"), fmt(dados.entregas?.receita_entregas), cor.muted, cor.success, true);

      nova_pagina();
      Y = 14;
      rodape(3);

      secTitulo(t("sec_financeiro"));
      linha(t("entradas_confirmadas_dia"), `${dados.financeiro?.num_entradas ?? 0} ${t("movimentos_label")}`, cor.muted, cor.muted);
      linha(t("total_entradas"), fmt(dados.financeiro?.entradas), cor.muted, cor.success, true);
      linha(t("saidas_confirmadas"), `${dados.financeiro?.num_saidas ?? 0} ${t("movimentos_label")}`, cor.muted, cor.muted);
      linha(t("total_saidas"), fmt(dados.financeiro?.saidas), cor.muted, cor.danger, true);
      divisor();
      linha(t("saldo_periodo"), fmt(dados.financeiro?.saldo), cor.white, parseFloat(dados.financeiro?.saldo ?? 0) >= 0 ? cor.success : cor.danger);
      espaco();

      if (dados.movimentos?.length > 0) {
        checkPage(12);
        normal(8);
        setColor(cor.muted);
        doc.text(t("ultimos_movimentos"), ML + 2, Y);
        Y += 8;
        setFill(cor.card);
        doc.rect(ML - 2, Y, MR - ML + 4, 7, "F");
        bold(7);
        setColor(cor.muted);
        doc.text(t("tipo_label"), ML + 2, Y + 5);
        doc.text(t("descricao"), ML + 22, Y + 5);
        doc.text(t("categoria"), ML + 90, Y + 5);
        doc.text(t("valor"), MR - 2, Y + 5, { align: "right" });
        Y += 8;
        dados.movimentos.forEach((m, i) => {
          checkPage(8);
          if (i % 2 === 0) {
            setFill([18, 26, 40]);
            doc.rect(ML - 2, Y, MR - ML + 4, 7, "F");
          }
          const corValor = m.tipo === "ENTRADA" ? cor.success : cor.danger;
          normal(7);
          setColor(m.tipo === "ENTRADA" ? cor.success : cor.danger);
          doc.text(m.tipo === "ENTRADA" ? t("entrada_fin") : t("saida_fin"), ML + 2, Y + 5);
          setColor(cor.text);
          const desc = (m.descricao || "").substring(0, 32);
          doc.text(desc, ML + 22, Y + 5);
          setColor(cor.muted);
          doc.text(m.categoria || "—", ML + 90, Y + 5);
          bold(7);
          setColor(corValor);
          const sinal = m.tipo === "ENTRADA" ? "+" : "-";
          doc.text(`${sinal}${fmt(m.valor)}`, MR - 2, Y + 5, { align: "right" });
          Y += 8;
        });
        espaco();
      }

      secTitulo(t("sec_bonus_vip"));
      linha(t("cartoes_activos"), dados.bonus?.cartoes_activos ?? 0, cor.muted, cor.accent);
      linha(t("saldo_total"), fmt(dados.bonus?.saldo_total), cor.muted, cor.accent, true);
      if (dados.bonus_movimentos) {
        linha(t("bonus_creditados"), fmt(dados.bonus_movimentos?.creditos), cor.muted, cor.success);
        linha(t("bonus_debitados"), fmt(dados.bonus_movimentos?.debitos), cor.muted, cor.danger, true);
      }

      nova_pagina();
      Y = 14;
      rodape(4);

      secTitulo(t("sec_clientes"));
      linha(t("novos_registos"), dados.clientes?.novos ?? 0, cor.muted, cor.accent);
      linha(t("novos_verificados"), dados.clientes?.verificados_novos ?? 0, cor.muted, cor.success, true);
      divisor();
      linha(t("total_plataforma"), dados.clientes?.total_geral ?? 0, cor.muted, cor.text);
      linha(t("clientes_verificados"), dados.clientes?.total_verificados ?? 0, cor.muted, cor.accent, true);
      const pctVerif = dados.clientes?.total_geral > 0 ? Math.round((dados.clientes.total_verificados / dados.clientes.total_geral) * 100) : 0;
      linha(t("taxa_verificacao"), `${pctVerif}%`, cor.muted, cor.accent);
      espaco();

      secTitulo(t("sec_produtos"));
      linha(t("criados_periodo"), dados.produtos?.criados ?? 0, cor.muted, cor.text);
      linha(t("prods_disponiveis"), dados.produtos?.disponiveis ?? 0, cor.muted, cor.success, true);
      linha(t("prods_esgotados"), dados.produtos?.esgotados ?? 0, cor.muted, cor.warning);
      linha(t("descontinuados_label"), dados.produtos?.descontinuados ?? 0, cor.muted, cor.danger, true);
      espaco();

      if (dados.stock_critico?.length > 0) {
        checkPage(12);
        normal(8);
        setColor(cor.muted);
        doc.text(t("prods_criticos"), ML + 2, Y);
        Y += 8;
        dados.stock_critico.forEach((p, i) => {
          checkPage(8);
          if (i % 2 === 0) {
            setFill([18, 26, 40]);
            doc.rect(ML - 2, Y, MR - ML + 4, 7, "F");
          }
          normal(7);
          setColor(cor.text);
          doc.text((p.nome || "").substring(0, 40), ML + 2, Y + 5);
          setColor(cor.muted);
          doc.text(p.categoria || "—", ML + 100, Y + 5);
          bold(7);
          setColor(p.estoque === 0 ? cor.danger : cor.warning);
          doc.text(`${p.estoque} ${t("unidades")}`, MR - 2, Y + 5, { align: "right" });
          Y += 8;
        });
        espaco();
      }

      nova_pagina();
      Y = 14;
      rodape(5);

      secTitulo(t("sec_acessos"));
      linha(t("total_logins_periodo"), dados.total_logins ?? 0, cor.muted, cor.accent);
      espaco(4);

      if (dados.logins?.length > 0) {
        setFill(cor.card);
        doc.rect(ML - 2, Y, MR - ML + 4, 7, "F");
        bold(7);
        setColor(cor.muted);
        doc.text(t("utilizador"), ML + 2, Y + 5);
        doc.text(t("email"), ML + 48, Y + 5);
        doc.text(t("tipo_acesso"), ML + 110, Y + 5);
        doc.text(t("ultimo_login"), MR - 2, Y + 5, { align: "right" });
        Y += 8;
        dados.logins.forEach((u, i) => {
          checkPage(8);
          if (i % 2 === 0) {
            setFill([18, 26, 40]);
            doc.rect(ML - 2, Y, MR - ML + 4, 7, "F");
          }
          normal(7);
          setColor(cor.text);
          doc.text((u.nome || "").substring(0, 20), ML + 2, Y + 5);
          setColor(cor.muted);
          doc.text((u.email || "").substring(0, 30), ML + 48, Y + 5);
          setColor(cor.accent);
          doc.text(u.tipo || "—", ML + 110, Y + 5);
          setColor(cor.muted);
          doc.text(fmtDate(u.ultimo_login || u.data_log), MR - 2, Y + 5, { align: "right" });
          Y += 8;
        });
      } else {
        normal(8);
        setColor(cor.muted);
        doc.text(t("sem_acessos"), ML + 2, Y + 6);
        Y += 12;
      }

      espaco(16);
      checkPage(30);
      setFill(cor.card);
      doc.roundedRect(ML - 2, Y, MR - ML + 4, 28, 3, 3, "F");
      setFill(cor.accent);
      doc.rect(ML - 2, Y, 2, 28, "F");
      bold(9);
      setColor(cor.accent);
      doc.text(t("nota_conf_titulo"), ML + 6, Y + 8);
      normal(8);
      setColor(cor.muted);
      doc.text(t("nota_conf_1"), ML + 6, Y + 15);
      doc.text(t("nota_conf_2"), ML + 6, Y + 22);

      const totalPags = doc.getNumberOfPages();
      for (let i = 1; i <= totalPags; i++) {
        doc.setPage(i);
        if (i > 1) {
          normal(7);
          setColor(cor.muted);
          doc.text(`LOPOS • ${t("relatorio_label")} ${tipoLabel} • ${dados.label}`, ML, 290);
          doc.text(`${t("pagina")} ${i} ${t("de")} ${totalPags}`, MR, 290, { align: "right" });
        }
      }

      const nomeArq = `LOPOS_${t("relatorio_label")}_${tipoLabel}_${dados.inicio}_${dados.fim}.pdf`;
      doc.save(nomeArq);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      gerarPDFPrint();
    }

    setGerando(false);
  };

  /* Fallback de impressão */
  const gerarPDFPrint = () => {
    const conteudo = printRef.current;
    if (!conteudo) return;
    const janela = window.open("", "_blank");
    janela.document.write(`
      <html><head><title>${t("relatorio_label")} LOPOS</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; color: #111; margin: 20px; }
        h1   { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 6px; }
        h2   { font-size: 13px; margin-top: 16px; }
        table{ width:100%; border-collapse:collapse; margin-top:8px; }
        th   { background:#e0e0e0; padding:4px 8px; text-align:left; font-size:10px; }
        td   { padding:4px 8px; border-bottom:1px solid #ddd; font-size:10px; }
        .val { text-align:right; font-weight:bold; }
        .success { color: green; } .danger { color: red; } .muted { color: #666; }
      </style>
      </head><body>
      ${conteudo.innerHTML}
      </body></html>
    `);
    janela.document.close();
    janela.print();
  };

  const corPeriodo = {
    semanal: "#f59e0b",
    mensal: "#1e73f0",
    anual: "#a855f7",
  };

  const secaoCard = (titulo, children, icon = null) => (
    <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
      <div style={{ fontSize: "12px", fontWeight: "700", color: G.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: "8px" }}>
        {icon && <span style={{ fontSize: "16px" }}>{icon}</span>}
        {titulo}
      </div>
      {children}
    </div>
  );

  const metricRow = (label, valor, cor = G.text, alt = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "10px", background: alt ? G.cardAlt : "transparent", marginBottom: "4px" }}>
      <span style={{ fontSize: "12px", color: G.muted }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: "700", color: cor, wordBreak: "break-word" }}>{valor}</span>
    </div>
  );

  const resumoCards = [
    { label: t("total_pedidos"), val: dados?.pedidos?.total ?? 0, cor: G.accent },
    { label: t("receita_gerada"), val: fmt(dados?.pedidos?.receita_total), cor: G.success },
    { label: t("novos_clientes"), val: dados?.clientes?.novos ?? 0, cor: "#f59e0b" },
    { label: t("entradas_label"), val: fmt(dados?.financeiro?.entradas), cor: G.success },
    { label: t("saidas_label"), val: fmt(dados?.financeiro?.saidas), cor: G.danger },
    { label: t("saldo"), val: fmt(dados?.financeiro?.saldo), cor: parseFloat(dados?.financeiro?.saldo ?? 0) >= 0 ? G.success : G.danger },
  ];

  return (
    <div style={{ padding: isMobile ? "16px" : "24px", maxWidth: "1400px", margin: "0 auto", minHeight: "100vh", color: G.text }}>
      {/* HEADER */}
      <div style={{ marginBottom: isMobile ? "24px" : "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ width: isMobile ? "44px" : "52px", height: isMobile ? "44px" : "52px", borderRadius: "16px", background: `linear-gradient(135deg, ${G.accent}25, ${G.accent}08)`, border: `1px solid ${G.accent}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcoFileText size={isMobile ? 22 : 24} color={G.accent} />
              </div>
              <div>
                <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: G.text, margin: 0, letterSpacing: "-0.5px" }}>{t("gestao_relatorios")}</h1>
                <p style={{ fontSize: "13px", color: G.muted, marginTop: "4px" }}>{t("sub_relatorios")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SELETOR DE PERÍODO */}
      <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "24px", padding: isMobile ? "20px" : "24px", marginBottom: "24px" }}>
        <div style={{ fontSize: "12px", color: G.muted, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
          <IcoCalendar size={14} color={G.accent} />
          {t("seleccionar_periodo")}
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
          {[
            { val: "semanal", label: t("semanal"), desc: t("semanal_dias"), color: "#f59e0b" },
            { val: "mensal", label: t("mensal"), desc: t("mensal_dias"), color: "#1e73f0" },
            { val: "anual", label: t("anual"), desc: t("anual_dias"), color: "#a855f7" },
          ].map((op) => {
            const sel = periodo === op.val;
            const isHover = hoverPeriodo === op.val;
            return (
              <button key={op.val} onClick={() => { setPeriodo(op.val); setDados(null); }} onMouseEnter={() => setHoverPeriodo(op.val)} onMouseLeave={() => setHoverPeriodo(null)}
                style={{ flex: isMobile ? "1 1 100%" : "1 1 120px", padding: isMobile ? "14px" : "16px", borderRadius: "16px", cursor: "pointer", border: `1px solid ${sel ? op.color : G.border}`, background: sel ? `${op.color}15` : G.cardAlt, color: sel ? op.color : G.muted, fontFamily: "inherit", transition: "all 0.2s", transform: isHover ? "translateY(-2px)" : "translateY(0)", textAlign: "center" }}>
                <div style={{ fontSize: isMobile ? "14px" : "13px", fontWeight: "700" }}>{op.label}</div>
                <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px" }}>{op.desc}</div>
              </button>
            );
          })}
        </div>

        <button onClick={buscarDados} disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: "16px", border: "none", background: loading ? G.cardAlt : G.accent, color: loading ? G.muted : "#fff", fontFamily: "inherit", fontSize: "14px", fontWeight: "700", cursor: loading ? "wait" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          {loading ? (<><div style={{ width: "16px", height: "16px", border: `2px solid rgba(255,255,255,0.3)`, borderTop: `2px solid #fff`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{t("a_carregar_dados")}</>) : (<><IcoRefresh size={14} />{t("carregar_relatorio")}</>)}
        </button>
      </div>

      {/* ERRO */}
      {erro && (
        <div style={{ background: `${G.danger}12`, border: `1px solid ${G.danger}30`, borderRadius: "14px", padding: "12px 16px", color: G.danger, fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <IcoAlertCircle size={16} color={G.danger} /> {erro}
        </div>
      )}

      {/* DADOS CARREGADOS */}
      {dados && (
        <>
          {/* Cabeçalho do relatório */}
          <div style={{ background: `linear-gradient(135deg, ${G.cardAlt}, ${G.card})`, border: `1px solid ${corPeriodo[dados.periodo]}44`, borderRadius: "24px", padding: isMobile ? "20px" : "24px 28px", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `${corPeriodo[dados.periodo]}15`, padding: "6px 16px", borderRadius: "40px", marginBottom: "12px" }}>
                <IcoCalendar size={12} color={corPeriodo[dados.periodo]} />
                <span style={{ fontSize: "11px", fontWeight: "700", color: corPeriodo[dados.periodo], textTransform: "uppercase" }}>{t("relatorio_label")} {t(dados.periodo)}</span>
              </div>
              <div style={{ fontSize: isMobile ? "20px" : "24px", fontWeight: "800", color: G.text, marginBottom: "8px", letterSpacing: "-0.5px", wordBreak: "break-word" }}>{dados.label}</div>
              <div style={{ fontSize: "12px", color: G.muted, display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span>{dados.inicio} — {dados.fim}</span>
                <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: G.muted }} />
                <span>{t("gerado_em")}: {dados.gerado_em}</span>
              </div>
            </div>

            <button onClick={gerarPDF} disabled={gerando} onMouseEnter={() => setHoverExport(true)} onMouseLeave={() => setHoverExport(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 28px", borderRadius: "40px", background: gerando ? G.cardAlt : `linear-gradient(135deg, #a855f7, #7c3aed)`, color: gerando ? G.muted : "white", border: "none", fontFamily: "inherit", fontSize: "14px", fontWeight: "700", cursor: gerando ? "wait" : "pointer", transition: "all 0.3s", whiteSpace: "nowrap", width: isMobile ? "100%" : "auto", justifyContent: "center", boxShadow: hoverExport && !gerando ? "0 8px 25px rgba(168,85,247,0.4)" : "0 4px 15px rgba(168,85,247,0.3)", transform: hoverExport && !gerando ? "translateY(-2px)" : "translateY(0)" }}>
              {gerando ? (<><div style={{ width: "18px", height: "18px", border: `2px solid rgba(255,255,255,0.3)`, borderTop: `2px solid white`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{t("a_gerar_pdf")}</>) : (<><IcoDownload size={18} color="white" />{t("baixar_pdf")}</>)}
            </button>
          </div>

          {/* CARDS RESUMO */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${resumoCols}, 1fr)`, gap: "14px", marginBottom: "28px" }}>
            {resumoCards.map((m) => (
              <div key={m.label} style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "18px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: G.muted, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>{m.label}</div>
                <div style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "800", color: m.cor, wordBreak: "break-word" }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* GRID PRINCIPAL */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${mainGridCols}, 1fr)`, gap: "20px", marginBottom: "28px" }}>
            {/* Pedidos */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: G.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: "8px" }}> {t("sec_pedidos")}</div>
              {metricRow(t("total_label"), dados.pedidos?.total ?? 0)}
              {metricRow(t("status_pendente"), dados.pedidos?.pendentes ?? 0, G.warning, true)}
              {metricRow(t("status_reservado"), dados.pedidos?.reservados ?? 0, G.accent)}
              {metricRow(t("status_enviado"), dados.pedidos?.enviados ?? 0, G.accent, true)}
              {metricRow(t("status_entregue"), dados.pedidos?.entregues ?? 0, G.success)}
              {metricRow(t("status_cancelado"), dados.pedidos?.cancelados ?? 0, G.danger, true)}
              <div style={{ height: "1px", background: G.border, margin: "8px 0" }} />
              {metricRow(t("receita_gerada"), fmt(dados.pedidos?.receita_total), G.success)}
            </div>

            {/* Clientes */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: G.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: "8px" }}> {t("sec_clientes")}</div>
              {metricRow(t("novos_periodo"), dados.clientes?.novos ?? 0, G.accent)}
              {metricRow(t("novos_verificados"), dados.clientes?.verificados_novos ?? 0, G.success, true)}
              <div style={{ height: "1px", background: G.border, margin: "8px 0" }} />
              {metricRow(t("total_plataforma"), dados.clientes?.total_geral ?? 0)}
              {metricRow(t("clientes_verificados"), dados.clientes?.total_verificados ?? 0, G.accent, true)}
            </div>

            {/* Financeiro */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: G.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: "8px" }}> {t("sec_financeiro")}</div>
              {metricRow(`${t("entradas_label")} (${dados.financeiro?.num_entradas ?? 0} ${t("movimentos_label")})`, fmt(dados.financeiro?.entradas), G.success)}
              {metricRow(`${t("saidas_label")} (${dados.financeiro?.num_saidas ?? 0} ${t("movimentos_label")})`, fmt(dados.financeiro?.saidas), G.danger, true)}
              <div style={{ height: "1px", background: G.border, margin: "8px 0" }} />
              {metricRow(t("saldo_periodo"), fmt(dados.financeiro?.saldo), parseFloat(dados.financeiro?.saldo ?? 0) >= 0 ? G.success : G.danger)}
            </div>

            {/* Produtos */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: G.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: "8px" }}> {t("sec_produtos")}</div>
              {metricRow(t("criados_periodo"), dados.produtos?.criados ?? 0)}
              {metricRow(t("prods_disponiveis"), dados.produtos?.disponiveis ?? 0, G.success, true)}
              {metricRow(t("prods_esgotados"), dados.produtos?.esgotados ?? 0, G.warning)}
              {metricRow(t("descontinuados_label"), dados.produtos?.descontinuados ?? 0, G.danger, true)}
            </div>

            {/* Entregas */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: G.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: "8px" }}> {t("sec_entregas")}</div>
              {metricRow(t("total_entregas"), dados.entregas?.total ?? 0)}
              {metricRow(t("entregues_label"), dados.entregas?.entregues ?? 0, G.success, true)}
              {metricRow(t("a_caminho"), dados.entregas?.enviados ?? 0, G.accent)}
              {metricRow(t("canceladas_label"), dados.entregas?.canceladas ?? 0, G.danger, true)}
              {metricRow(t("dist_media"), `${parseFloat(dados.entregas?.dist_media ?? 0).toFixed(1)} km`, G.muted)}
              {metricRow(t("receita_entregas"), fmt(dados.entregas?.receita_entregas), G.success, true)}
            </div>

            {/* Bónus */}
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: G.accent, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${G.border}`, display: "flex", alignItems: "center", gap: "8px" }}>✦ {t("sec_bonus_vip")}</div>
              {metricRow(t("cartoes_activos"), dados.bonus?.cartoes_activos ?? 0, G.accent)}
              {metricRow(t("saldo_total"), fmt(dados.bonus?.saldo_total), G.accent, true)}
              {dados.bonus_movimentos && (<>{metricRow(t("bonus_creditados"), fmt(dados.bonus_movimentos?.creditos), G.success)}{metricRow(t("bonus_debitados"), fmt(dados.bonus_movimentos?.debitos), G.danger, true)}</>)}
            </div>
          </div>

          {/* ACESSOS */}
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", paddingBottom: "12px", borderBottom: `1px solid ${G.border}` }}>
              <IcoLock size={16} color={G.accent} />
              <span style={{ fontWeight: "700", fontSize: "15px", color: G.text }}>{t("acessos_sistema")}</span>
              <span style={{ background: `${G.accent}15`, color: G.accent, fontSize: "11px", padding: "3px 12px", borderRadius: "30px", border: `1px solid ${G.accent}30` }}>{dados.total_logins} {t("acessos")}</span>
            </div>
            {dados.logins?.length === 0 ? (<div style={{ textAlign: "center", padding: "40px", color: G.muted }}>{t("sem_acessos")}</div>) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "550px" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${G.border}` }}>{[t("utilizador"), t("email"), t("tipo_acesso"), t("ultimo_login")].map((h) => (<th key={h} style={{ textAlign: "left", padding: "12px 14px", color: G.muted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", background: G.cardAlt, whiteSpace: "nowrap" }}>{h}</th>))}</tr></thead>
                  <tbody>{dados.logins.map((u, i) => (<tr key={i} style={{ borderBottom: `1px solid ${G.border}` }}><td style={{ padding: "12px 14px", color: G.text, fontWeight: "600" }}>{u.nome}</td><td style={{ padding: "12px 14px", color: G.muted }}>{u.email}</td><td style={{ padding: "12px 14px" }}><span style={{ background: `${G.accent}15`, color: G.accent, fontSize: "11px", padding: "3px 12px", borderRadius: "30px", border: `1px solid ${G.accent}30` }}>{u.tipo}</span></td><td style={{ padding: "12px 14px", color: G.muted }}>{fmtDate(u.ultimo_login || u.data_log)}</td></tr>))}</tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top pedidos */}
          {dados.top_pedidos?.length > 0 && (
            <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: "20px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", paddingBottom: "12px", borderBottom: `1px solid ${G.border}` }}>
                <IcoOrder size={16} color={G.accent} />
                <span style={{ fontWeight: "700", fontSize: "15px", color: G.text }}>{t("top5_pedidos")}</span>
              </div>
              {dados.top_pedidos.map((p, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", padding: "14px 0", borderBottom: i !== dados.top_pedidos.length - 1 ? `1px solid ${G.border}` : "none" }}><div><span style={{ color: G.accent, fontWeight: "700", fontSize: "13px", fontFamily: "monospace" }}>#{p.id_pedido}</span><span style={{ color: G.text, fontSize: "13px", marginLeft: "12px" }}>{p.nome || "—"}</span></div><div style={{ textAlign: "right" }}><div style={{ color: G.success, fontWeight: "700", fontSize: "14px", wordBreak: "break-word" }}>{fmt(p.total)}</div><div style={{ color: G.muted, fontSize: "11px" }}>{fmtDate(p.criado_em)}</div></div></div>))}
            </div>
          )}

          {/* Ref para fallback print */}
          <div ref={printRef} style={{ display: "none" }}>
            <h1>{t("relatorio_label")} LOPOS — {dados.label}</h1>
            <p>{t("periodo")}: {dados.inicio} — {dados.fim}</p>
            <p>{t("gerado_em")}: {dados.gerado_em}</p>
            <h2>{t("sec_pedidos")}</h2>
            <table><tbody><tr><th>{t("total_label")}</th><td>{dados.pedidos?.total}</td></tr><tr><th>{t("receita_gerada")}</th><td>{fmt(dados.pedidos?.receita_total)}</td></tr></tbody></table>
            <h2>{t("sec_financeiro")}</h2>
            <table><tbody><tr><th>{t("entradas_label")}</th><td>{fmt(dados.financeiro?.entradas)}</td></tr><tr><th>{t("saidas_label")}</th><td>{fmt(dados.financeiro?.saidas)}</td></tr><tr><th>{t("saldo")}</th><td>{fmt(dados.financeiro?.saldo)}</td></tr></tbody></table>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default GRelatorio;