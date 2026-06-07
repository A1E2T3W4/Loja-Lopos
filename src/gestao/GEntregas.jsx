import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "../i18n";



/* ══════════════════════════════════════════════════════════════
   CONFIGURAÇÃO — URL correcta da API
══════════════════════════════════════════════════════════════ */
const API = "https://lojalopos.infinityfreeapp.com/api/entregas.php";

/* Coordenadas da loja — ajusta conforme a localização real */
const COORD_LOJA = { lat: -8.8368, lng: 13.2343 };

/* ── Formatadores ── */
const fmt = (v) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 0,
  }).format(v || 0);

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("pt-AO");
  } catch {
    return d;
  }
};

const fmtDT = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("pt-AO");
  } catch {
    return d;
  }
};

/* ── Carregador dinâmico de scripts/links ── */
const loadScript = (id, src) =>
  new Promise((res, rej) => {
    if (document.getElementById(id)) {
      res();
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });

const loadLink = (id, href) => {
  if (document.getElementById(id)) return;
  const l = document.createElement("link");
  l.id = id;
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
};

/* ══════════════════════════════════════════════════════════════
   ÍCONES SVG
══════════════════════════════════════════════════════════════ */
const Svg = ({ ch, size = 16, color = "currentColor", vb = "0 0 24 24" }) => (
  <svg
    width={size}
    height={size}
    viewBox={vb}
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {ch}
  </svg>
);

const IcoTruck = ({ s = 16, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <rect x="1" y="3" width="15" height="13" />
        <path d="M16 8h4l3 5v4h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </>
    }
  />
);
const IcoUser = ({ s = 16, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    }
  />
);
const IcoMap = ({ s = 16, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </>
    }
  />
);
const IcoSearch = ({ s = 15, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    }
  />
);
const IcoX = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    }
  />
);
const IcoEye = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    }
  />
);
const IcoTrash = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
      </>
    }
  />
);
const IcoRefresh = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </>
    }
  />
);
const IcoFilter = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />}
  />
);
const IcoChart = ({ s = 16, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </>
    }
  />
);
const IcoCheck = ({ s = 13, c = "currentColor" }) => (
  <Svg size={s} color={c} ch={<polyline points="20 6 9 17 4 12" />} />
);
const IcoClock = ({ s = 13, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    }
  />
);
const IcoPhone = ({ s = 13, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.53 2 2 0 0 1 3.59 1.37h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    }
  />
);
const IcoMail = ({ s = 13, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </>
    }
  />
);
const IcoPin = ({ s = 13, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    }
  />
);
const IcoPrint = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </>
    }
  />
);
const IcoExcel = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="12" x2="15" y2="18" />
        <line x1="15" y1="12" x2="9" y2="18" />
      </>
    }
  />
);
const IcoArrow = ({ s = 12, c = "currentColor" }) => (
  <Svg size={s} color={c} ch={<polyline points="9 18 15 12 9 6" />} />
);
const IcoArrowL = ({ s = 12, c = "currentColor" }) => (
  <Svg size={s} color={c} ch={<polyline points="15 18 9 12 15 6" />} />
);
const IcoDown = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    }
  />
);
const IcoTable = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="9" x2="9" y2="21" />
      </>
    }
  />
);
const IcoReport = ({ s = 14, c = "currentColor" }) => (
  <Svg
    size={s}
    color={c}
    ch={
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    }
  />
);
const IcoSpin = ({ s = 20, c = "currentColor" }) => (
  <div
    style={{
      width: `${s}px`,
      height: `${s}px`,
      border: `3px solid ${c}22`,
      borderTop: `3px solid ${c}`,
      borderRadius: "50%",
      animation: "spin .8s linear infinite",
    }}
  />
);

/* ══════════════════════════════════════════════════════════════
   CONSTANTES COM TRADUÇÕES
══════════════════════════════════════════════════════════════ */
const COR_ESTADO = (G, s, t) => {
  const estadoLower = (s || "").toLowerCase();
  const labels = {
    pendente: t("status_pendente"),
    enviado: t("status_enviado"),
    entregue: t("status_entregue"),
    cancelado: t("status_cancelado"),
    reservado: t("status_reservado"),
  };
  return {
    pendente: { bg: `${G.warning}18`, cor: G.warning, label: labels.pendente },
    enviado: { bg: `${G.accent}18`, cor: G.accent, label: labels.enviado },
    entregue: { bg: `${G.success}18`, cor: G.success, label: labels.entregue },
    cancelado: { bg: `${G.danger}18`, cor: G.danger, label: labels.cancelado },
    reservado: {
      bg: "rgba(168,85,247,0.12)",
      cor: "#a855f7",
      label: labels.reservado,
    },
  }[estadoLower] || {
    bg: `${G.muted}18`,
    cor: G.muted,
    label: s || "—",
  };
};

const BadgeEstado = ({ estado, G, t }) => {
  const { bg, cor, label } = COR_ESTADO(G, estado, t);
  return (
    <span
      style={{
        background: bg,
        color: cor,
        border: `1px solid ${cor}33`,
        fontSize: "10px",
        fontWeight: "700",
        padding: "3px 9px",
        borderRadius: "99px",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: cor,
        }}
      />
      {label}
    </span>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAPA LEAFLET
══════════════════════════════════════════════════════════════ */
const MapaLeaflet = ({ endereco, cidade, G, t }) => {
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const [est, setEst] = useState("idle");

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setEst("loading");
      try {
        loadLink(
          "leaflet-css",
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
        );
        await loadScript(
          "leaflet-js",
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
        );
        const query = encodeURIComponent(
          `${endereco || ""} ${cidade || ""} Angola`,
        );
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        );
        const gd = await geo.json();
        if (!gd.length || cancelled) {
          setEst("erro");
          return;
        }
        const destLat = parseFloat(gd[0].lat);
        const destLng = parseFloat(gd[0].lon);
        const L = window.L;
        if (mapInst.current) {
          mapInst.current.remove();
          mapInst.current = null;
        }
        if (!mapRef.current || cancelled) return;
        const map = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: false,
        });
        mapInst.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(map);
        const icoLoja = L.divIcon({
          html: `<div style="width:28px;height:28px;border-radius:50%;background:#1e73f0;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;">🏪</div>`,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        const icoDest = L.divIcon({
          html: `<div style="width:28px;height:28px;border-radius:50%;background:#e8294a;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;">📦</div>`,
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        L.marker([COORD_LOJA.lat, COORD_LOJA.lng], { icon: icoLoja })
          .addTo(map)
          .bindPopup("<b>LOPOS</b><br>Loja");
        L.marker([destLat, destLng], { icon: icoDest })
          .addTo(map)
          .bindPopup(`<b>Destino</b><br>${endereco || cidade || ""}`);
        try {
          const rota = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${COORD_LOJA.lng},${COORD_LOJA.lat};${destLng},${destLat}?overview=full&geometries=geojson`,
          );
          const rd = await rota.json();
          if (rd.routes?.[0]) {
            L.geoJSON(rd.routes[0].geometry, {
              style: {
                color: "#1e73f0",
                weight: 4,
                opacity: 0.8,
                dashArray: "8,4",
              },
            }).addTo(map);
            const dist = (rd.routes[0].distance / 1000).toFixed(1);
            const dur = Math.round(rd.routes[0].duration / 60);
            const mid =
              rd.routes[0].geometry.coordinates[
                Math.floor(rd.routes[0].geometry.coordinates.length / 2)
              ];
            L.popup()
              .setLatLng([mid[1], mid[0]])
              .setContent(
                `<b style="color:#1e73f0">🚗 ${dist} km · ${dur} min</b>`,
              )
              .addTo(map);
          }
        } catch {
          L.polyline(
            [
              [COORD_LOJA.lat, COORD_LOJA.lng],
              [destLat, destLng],
            ],
            { color: "#1e73f0", weight: 3, dashArray: "6,4" },
          ).addTo(map);
        }
        map.fitBounds(
          [
            [COORD_LOJA.lat, COORD_LOJA.lng],
            [destLat, destLng],
          ],
          { padding: [40, 40] },
        );
        if (!cancelled) setEst("ok");
      } catch {
        if (!cancelled) setEst("erro");
      }
    };
    init();
    return () => {
      cancelled = true;
      if (mapInst.current) {
        mapInst.current.remove();
        mapInst.current = null;
      }
    };
  }, [endereco, cidade, t]);

  return (
    <div
      style={{
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid rgba(30,115,240,0.2)`,
        position: "relative",
      }}
    >
      {est === "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background: "rgba(13,17,23,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <IcoSpin s={28} c="#1e73f0" />
          <span style={{ fontSize: "12px", color: "#6b7fa3" }}>
            {t("geocoding_address")}
          </span>
        </div>
      )}
      {est === "erro" && (
        <div
          style={{
            height: "220px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <IcoMap s={28} c="#6b7fa3" />
          <span style={{ fontSize: "12px", color: "#6b7fa3" }}>
            {t("geocoding_error")}
          </span>
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          height: "280px",
          width: "100%",
          display: est === "erro" ? "none" : "block",
        }}
      />
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODAL DE DETALHE
══════════════════════════════════════════════════════════════ */
const ModalDetalhe = ({ entrega, G, onClose, onActualizar, onEliminar, t }) => {
  const [novoEstado, setNovoEstado] = useState(entrega.status || "pendente");
  const [salvando, setSalvando] = useState(false);
  const [aba, setAba] = useState("info");
  const [msgOk, setMsgOk] = useState("");
  const [msgErr, setMsgErr] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", h);
    };
  }, [onClose]);

  const guardarEstado = async () => {
    if (novoEstado === entrega.status) return;
    setSalvando(true);
    setMsgOk("");
    setMsgErr("");
    try {
      const res = await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_pedido: entrega.id_pedido,
          status: novoEstado,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setMsgOk(t("estado_actualizado"));
        onActualizar();
        setTimeout(() => {
          setMsgOk("");
          onClose();
        }, 1400);
      } else {
        setMsgErr(d.message || t("erro_actualizar"));
      }
    } catch {
      setMsgErr(t("erro_ligacao"));
    }
    setSalvando(false);
  };

  const imprimirComprovativo = () => {
    const cod = `ENT${String(entrega.id_entrega).padStart(3, "0")}`;
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>${t("delivery_receipt")} ${cod}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;color:#111}
        .logo{font-size:32px;font-weight:900;color:#0d47a1}.logo span{color:#1e73f0}
        h1{font-size:18px;border-bottom:3px solid #1e73f0;padding-bottom:8px}
        .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee}
        .l{color:#666;font-size:12px}.v{font-weight:600;font-size:12px;text-align:right;max-width:60%}
        .badge{background:#e3f0ff;color:#0d47a1;padding:3px 12px;border-radius:99px;font-size:11px;font-weight:700}
        .footer{margin-top:30px;text-align:center;font-size:10px;color:#999}
      </style></head><body>
      <div class="logo">LO<span>POS</span></div>
      <p style="color:#666;font-size:12px;margin:0 0 20px">${t("sistema_gestao")} · Luanda, Angola</p>
      <h1>${t("delivery_receipt")}</h1>
      <div class="row"><span class="l">${t("codigo")}</span><span class="v">${cod}</span></div>
      <div class="row"><span class="l">${t("pedido")}</span><span class="v">#${entrega.id_pedido || "—"}</span></div>
      <div class="row"><span class="l">${t("cliente")}</span><span class="v">${entrega.nome || "—"}</span></div>
      <div class="row"><span class="l">${t("telefone")}</span><span class="v">${entrega.telefone || "—"}</span></div>
      <div class="row"><span class="l">${t("endereco")}</span><span class="v">${entrega.endereco || "—"}</span></div>
      <div class="row"><span class="l">${t("cidade")}</span><span class="v">${entrega.cidade || "—"}</span></div>
      <div class="row"><span class="l">${t("detalhe_entrega")}</span><span class="v">${entrega.detalhe_entrega || "—"}</span></div>
      <div class="row"><span class="l">${t("distancia")}</span><span class="v">${entrega.distancia ? entrega.distancia + " km" : "—"}</span></div>
      <div class="row"><span class="l">${t("taxa_entrega")}</span><span class="v">${fmt(entrega.preco_entrega)}</span></div>
      <div class="row"><span class="l">${t("data_envio")}</span><span class="v">${fmtDate(entrega.data_envio)}</span></div>
      <div class="row"><span class="l">${t("data_entrega")}</span><span class="v">${fmtDate(entrega.data_entrega)}</span></div>
      <div class="row"><span class="l">${t("entregador")}</span><span class="v">${entrega.nome_entregador || (entrega.id_entregador ? `#${entrega.id_entregador}` : "—")}</span></div>
      <div class="row"><span class="l">${t("status")}</span><span class="badge">${(entrega.status || "—").toUpperCase()}</span></div>
      <div class="footer">LOPOS &copy; ${new Date().getFullYear()} · ${t("gerado_em")} ${new Date().toLocaleString("pt-AO")}</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const Info = ({ icon, label, value }) =>
    value ? (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          padding: "10px 0",
          borderBottom: `1px solid ${G.border}`,
        }}
      >
        <div style={{ color: G.accent, flexShrink: 0, marginTop: "1px" }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "10px",
              color: G.muted,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: "3px",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: G.text,
              fontWeight: "500",
              wordBreak: "break-word",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    ) : null;

  const cod = `ENT${String(entrega.id_entrega).padStart(3, "0")}`;

  const estadoOptions = [
    "pendente",
    "enviado",
    "entregue",
    "cancelado",
    "reservado",
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: G.card,
          border: `1px solid rgba(30,115,240,0.2)`,
          borderRadius: "20px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "slideUp .25s cubic-bezier(.23,1,.32,1)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "18px 22px 0",
            background: `linear-gradient(135deg,${G.cardAlt},${G.card})`,
            borderBottom: `1px solid ${G.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: `${G.accent}18`,
                  border: `1px solid ${G.accent}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IcoTruck s={20} c={G.accent} />
              </div>
              <div>
                <div
                  style={{ fontSize: "16px", fontWeight: "800", color: G.text }}
                >
                  {cod}
                </div>
                <div
                  style={{ fontSize: "11px", color: G.muted, marginTop: "2px" }}
                >
                  {t("pedido")} #{entrega.id_pedido || "—"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BadgeEstado estado={entrega.status} G={G} t={t} />
              <button
                onClick={onClose}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: G.cardAlt,
                  border: `1px solid ${G.border}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: G.muted,
                  transition: "all .2s",
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
                <IcoX s={13} />
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            {[
              { id: "info", label: t("tab_info_ent") },
              { id: "mapa", label: t("tab_mapa") },
              { id: "estado", label: t("tab_estado") },
              { id: "acoes", label: t("tab_accoes") },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "9px 14px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  fontWeight: aba === a.id ? "700" : "500",
                  color: aba === a.id ? G.accent : G.muted,
                  borderBottom: `2px solid ${aba === a.id ? G.accent : "transparent"}`,
                  transition: "all .15s",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTEÚDO */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 22px",
            scrollbarWidth: "thin",
            scrollbarColor: `${G.border} transparent`,
          }}
        >
          {/* ── INFORMAÇÕES ── */}
          {aba === "info" && (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: G.accent,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "12px",
                }}
              >
                {t("dados_cliente")}
              </div>
              <Info
                icon={<IcoUser s={13} c={G.accent} />}
                label={t("nome")}
                value={entrega.nome}
              />
              <Info
                icon={<IcoPhone s={13} c={G.accent} />}
                label={t("telefone")}
                value={entrega.telefone}
              />
              <Info
                icon={<IcoMail s={13} c={G.accent} />}
                label={t("email")}
                value={entrega.email}
              />
              <Info
                icon={<IcoPin s={13} c={G.accent} />}
                label={t("endereco")}
                value={[entrega.endereco, entrega.cidade]
                  .filter(Boolean)
                  .join(", ")}
              />
              <Info
                icon={<IcoPin s={13} c={G.muted} />}
                label={t("detalhe_entrega")}
                value={entrega.detalhe_entrega}
              />

              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: G.accent,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  margin: "18px 0 12px",
                }}
              >
                {t("logistica")}
              </div>
              <Info
                icon={<IcoMap s={13} c={G.accent} />}
                label={t("distancia")}
                value={entrega.distancia ? `${entrega.distancia} km` : null}
              />
              <Info
                icon={<IcoTruck s={13} c={G.accent} />}
                label={t("taxa_entrega")}
                value={fmt(entrega.preco_entrega)}
              />
              <Info
                icon={<IcoClock s={13} c={G.accent} />}
                label={t("data_envio")}
                value={fmtDate(entrega.data_envio)}
              />
              <Info
                icon={<IcoCheck s={13} c={G.success} />}
                label={t("data_entrega")}
                value={fmtDate(entrega.data_entrega)}
              />
              <Info
                icon={<IcoUser s={13} c={G.accent} />}
                label={t("entregador")}
                value={
                  entrega.nome_entregador ||
                  (entrega.id_entregador
                    ? `${t("entregador_id")} #${entrega.id_entregador}`
                    : null)
                }
              />

              {/* Sumário financeiro */}
              <div
                style={{
                  marginTop: "18px",
                  background: G.cardAlt,
                  border: `1px solid ${G.border}`,
                  borderRadius: "12px",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: G.muted,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "10px",
                  }}
                >
                  {t("sumario")}
                </div>
                {[
                  { l: t("codigo_entrega"), v: cod },
                  { l: t("pedido"), v: `#${entrega.id_pedido || "—"}` },
                  {
                    l: t("taxa_entrega"),
                    v: fmt(entrega.preco_entrega),
                    c: G.success,
                  },
                  {
                    l: t("distancia"),
                    v: entrega.distancia ? `${entrega.distancia} km` : "—",
                  },
                  { l: t("estado_actual"), v: entrega.status, badge: true },
                ].map((r) => (
                  <div
                    key={r.l}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 0",
                      borderBottom: `1px solid ${G.border}`,
                    }}
                  >
                    <span style={{ fontSize: "12px", color: G.muted }}>
                      {r.l}
                    </span>
                    {r.badge ? (
                      <BadgeEstado estado={r.v} G={G} t={t} />
                    ) : (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: r.c || G.text,
                        }}
                      >
                        {r.v || "—"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MAPA ── */}
          {aba === "mapa" && (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: G.accent,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "14px",
                }}
              >
                {t("rota_loja")}
              </div>
              {entrega.endereco || entrega.cidade ? (
                <>
                  <MapaLeaflet
                    endereco={entrega.endereco}
                    cidade={entrega.cidade}
                    G={G}
                    t={t}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "14px",
                      marginTop: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        fontSize: "11px",
                        color: G.muted,
                      }}
                    >
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: G.accent,
                        }}
                      />
                      {t("loja_lopos")}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        fontSize: "11px",
                        color: G.muted,
                      }}
                    >
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: G.danger,
                        }}
                      />
                      {entrega.cidade || entrega.endereco}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "9px 12px",
                      background: G.cardAlt,
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: G.muted,
                    }}
                  >
                    {t("nota_rota")}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    background: G.cardAlt,
                    borderRadius: "12px",
                    color: G.muted,
                  }}
                >
                  <IcoMap s={32} c={G.muted} />
                  <div style={{ marginTop: "12px", fontSize: "13px" }}>
                    {t("morada_indisponivel")}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ESTADO ── */}
          {aba === "estado" && (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: G.accent,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "16px",
                }}
              >
                {t("actualizar_estado")}
              </div>

              {/* Estado actual */}
              <div
                style={{
                  background: G.cardAlt,
                  border: `1px solid ${G.border}`,
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "12px", color: G.muted }}>
                  {t("estado_actual")}
                </span>
                <BadgeEstado estado={entrega.status} G={G} t={t} />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                {estadoOptions.map((st) => {
                  const { cor, label } = COR_ESTADO(G, st, t);
                  const sel = novoEstado === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setNovoEstado(st)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: `1px solid ${sel ? cor : G.border}`,
                        background: sel ? `${cor}14` : G.cardAlt,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: `2px solid ${cor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {sel && (
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: cor,
                            }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: sel ? "700" : "500",
                          color: sel ? cor : G.muted,
                        }}
                      >
                        {label}
                      </span>
                      {st === entrega.status && (
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "10px",
                            color: G.muted,
                            fontStyle: "italic",
                          }}
                        >
                          {t("actual")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {msgOk && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "9px",
                    marginBottom: "12px",
                    background: `${G.success}15`,
                    color: G.success,
                    border: `1px solid ${G.success}33`,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ✓ {msgOk}
                </div>
              )}
              {msgErr && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "9px",
                    marginBottom: "12px",
                    background: `${G.danger}12`,
                    color: G.danger,
                    border: `1px solid ${G.danger}33`,
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  ✕ {msgErr}
                </div>
              )}

              <button
                onClick={guardarEstado}
                disabled={salvando || novoEstado === entrega.status}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "12px",
                  border: "none",
                  background:
                    salvando || novoEstado === entrega.status
                      ? G.cardAlt
                      : G.accent,
                  color:
                    salvando || novoEstado === entrega.status
                      ? G.muted
                      : "#000",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor:
                    salvando || novoEstado === entrega.status
                      ? "not-allowed"
                      : "pointer",
                  transition: "all .2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {salvando ? (
                  <>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(0,0,0,0.2)",
                        borderTop: "2px solid #000",
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                      }}
                    />
                    {t("a_guardar")}
                  </>
                ) : novoEstado === entrega.status ? (
                  t("estado_actualizado")
                ) : (
                  <>
                    <IcoCheck s={14} /> {t("guardar_estado")}
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── ACÇÕES ── */}
          {aba === "acoes" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: G.accent,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "4px",
                }}
              >
                {t("accoes_disponiveis")}
              </div>

              <button
                onClick={imprimirComprovativo}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${G.border}`,
                  background: G.cardAlt,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = G.accent;
                  e.currentTarget.style.background = `${G.accent}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = G.border;
                  e.currentTarget.style.background = G.cardAlt;
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${G.accent}18`,
                    border: `1px solid ${G.accent}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: G.accent,
                    flexShrink: 0,
                  }}
                >
                  <IcoPrint s={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: G.text,
                    }}
                  >
                    {t("imprimir_comprovativo")}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: G.muted,
                      marginTop: "2px",
                    }}
                  >
                    {t("opens_print_window")}
                  </div>
                </div>
                <IcoArrow s={14} c={G.muted} />
              </button>

              {/* Histórico */}
              <div
                style={{
                  background: G.cardAlt,
                  border: `1px solid ${G.border}`,
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: G.accent,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: "14px",
                  }}
                >
                  {t("historico_ent")}
                </div>
                <div style={{ position: "relative", paddingLeft: "20px" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "6px",
                      top: "8px",
                      bottom: "8px",
                      width: "2px",
                      background: `${G.accent}25`,
                    }}
                  />
                  {[
                    {
                      dt: entrega.criado_em || entrega.data_envio,
                      ev: t("entrega_criada"),
                    },
                    { dt: entrega.data_envio, ev: t("produto_enviado") },
                    {
                      dt:
                        entrega.data_entrega && entrega.status === "entregue"
                          ? entrega.data_entrega
                          : null,
                      ev: t("entrega_concluida"),
                    },
                    {
                      dt:
                        entrega.data_entrega && entrega.status === "cancelado"
                          ? entrega.data_entrega
                          : null,
                      ev: t("entrega_cancelada_hist"),
                    },
                  ]
                    .filter((h) => h.dt)
                    .map((h, i, arr) => (
                      <div
                        key={i}
                        style={{
                          position: "relative",
                          paddingBottom: "14px",
                          paddingLeft: "16px",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: "-14px",
                            top: "3px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background:
                              i === arr.length - 1 ? G.accent : G.success,
                            border: `2px solid ${G.card}`,
                          }}
                        />
                        <div
                          style={{
                            fontSize: "10px",
                            color: G.muted,
                            marginBottom: "2px",
                          }}
                        >
                          {fmtDT(h.dt)}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: G.text,
                            fontWeight: "600",
                          }}
                        >
                          {h.ev}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div style={{ height: "1px", background: G.border }} />

              <button
                onClick={() => onEliminar(entrega.id_entrega)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${G.border}`,
                  background: G.cardAlt,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .15s",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = G.danger;
                  e.currentTarget.style.background = `${G.danger}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = G.border;
                  e.currentTarget.style.background = G.cardAlt;
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: `${G.danger}15`,
                    border: `1px solid ${G.danger}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: G.danger,
                    flexShrink: 0,
                  }}
                >
                  <IcoTrash s={15} c={G.danger} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: G.danger,
                    }}
                  >
                    {t("eliminar_entrega")}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: G.muted,
                      marginTop: "2px",
                    }}
                  >
                    {t("accao_irreversivel")}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .leaflet-container { font-family:inherit !important; border-radius:12px; }
        .leaflet-popup-content-wrapper { border-radius:8px !important; }
      `}</style>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   GRÁFICO DE BARRAS SVG
══════════════════════════════════════════════════════════════ */
const GraficoBarras = ({ dados, G, t }) => {
  if (!dados?.length) return null;
  const max = Math.max(...dados.map((d) => d.v), 1);
  const W = 280,
    H = 80,
    PT = 8,
    PB = 24,
    PL = 8,
    PR = 8;
  const bW = (W - PL - PR) / dados.length - 4;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {dados.map((d, i) => {
        const h = Math.max(4, (d.v / max) * (H - PT - PB));
        const x = PL + i * ((W - PL - PR) / dados.length) + 2;
        const y = H - PB - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={bW}
              height={h}
              rx="3"
              fill={`${G.accent}70`}
            />
            <text
              x={x + bW / 2}
              y={H - 4}
              textAnchor="middle"
              fontSize="8"
              fill={G.muted}
              fontFamily="inherit"
            >
              {d.l}
            </text>
            {d.v > 0 && (
              <text
                x={x + bW / 2}
                y={y - 3}
                textAnchor="middle"
                fontSize="8"
                fill={G.accent}
                fontWeight="700"
                fontFamily="inherit"
              >
                {d.v}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

/* ══════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — GEntregas COM i18n
══════════════════════════════════════════════════════════════ */
const GEntregas = ({ G, operador }) => {
  const { t } = useTranslation();
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState({
    busca: "",
    estado: "todos",
    entregador: "",
    data: "",
  });
  const [detalhe, setDetalhe] = useState(null);
  const [vista, setVista] = useState("tabela");
  const [feedback, setFeedback] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [gerandoXLS, setGerandoXLS] = useState(false);
  const POR_PAGINA = 15;

  /* ── Carregar entregas ── */
  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (data.success) {
        setEntregas(data.data || []);
      } else {
        setErro(data.message || t("erro_ligacao"));
      }
    } catch (e) {
      setErro(t("erro_ligacao"));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const eliminar = async (id) => {
    if (!window.confirm(t("confirmar_eliminar_ent"))) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedback({ ok: true, msg: t("entrega_eliminada") });
        setDetalhe(null);
        carregar();
      } else {
        setFeedback({ ok: false, msg: data.message || t("erro_eliminar") });
      }
    } catch {
      setFeedback({ ok: false, msg: t("erro_ligacao") });
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  /* ── Filtragem ── */
  const filtradas = entregas.filter((e) => {
    const b = filtro.busca.toLowerCase();
    const okB =
      !b ||
      (e.nome || "").toLowerCase().includes(b) ||
      String(e.id_entrega || "").includes(b) ||
      String(e.id_pedido || "").includes(b) ||
      (e.endereco || "").toLowerCase().includes(b) ||
      (e.cidade || "").toLowerCase().includes(b) ||
      (e.nome_entregador || "").toLowerCase().includes(b);
    const okE = filtro.estado === "todos" || (e.status || "") === filtro.estado;
    const okD =
      !filtro.entregador ||
      String(e.id_entregador || "").includes(filtro.entregador) ||
      (e.nome_entregador || "")
        .toLowerCase()
        .includes(filtro.entregador.toLowerCase());
    const okF = !filtro.data || (e.data_envio || "").startsWith(filtro.data);
    return okB && okE && okD && okF;
  });

  const totalPaginas = Math.ceil(filtradas.length / POR_PAGINA);
  const paginadas = filtradas.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  /* ── Métricas ── */
  const total = entregas.length;
  const pendentes = entregas.filter((e) => e.status === "pendente").length;
  const enviados = entregas.filter((e) => e.status === "enviado").length;
  const entregues = entregas.filter((e) => e.status === "entregue").length;
  const cancelados = entregas.filter((e) => e.status === "cancelado").length;
  const reservados = entregas.filter((e) => e.status === "reservado").length;
  const taxaSucesso = total > 0 ? Math.round((entregues / total) * 100) : 0;
  const receitaTotal = entregas.reduce(
    (a, e) => a + parseFloat(e.preco_entrega || 0),
    0,
  );
  const distTotal = entregas.reduce(
    (a, e) => a + parseFloat(e.distancia || 0),
    0,
  );

  /* Gráfico por dia */
  const diasSemana = [t("dom"), t("seg"), t("ter"), t("qua"), t("qui"), t("sex"), t("sab")];
  const porDia = (() => {
    const cnt = Array(7).fill(0);
    entregas.forEach((e) => {
      if (e.data_envio) {
        const d = new Date(e.data_envio);
        if (!isNaN(d)) cnt[d.getDay()]++;
      }
    });
    return diasSemana.map((l, i) => ({ l, v: cnt[i] }));
  })();

  /* ── Exportar Excel ── */
  const exportarExcel = async () => {
    setGerandoXLS(true);
    try {
      await loadScript(
        "xlsx-ent",
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
      );
      await new Promise((r) => setTimeout(r, 200));
      const XLSX = window.XLSX;
      const rows = [
        [
          t("codigo"),
          t("pedido"),
          t("cliente"),
          t("telefone"),
          t("status"),
          t("cidade"),
          t("endereco"),
          t("detalhe_entrega"),
          t("distancia"),
          t("taxa_entrega"),
          t("entregador"),
          t("data_envio"),
          t("data_entrega"),
        ],
        ...filtradas.map((e) => [
          `ENT${String(e.id_entrega).padStart(3, "0")}`,
          e.id_pedido || "—",
          e.nome || "—",
          e.telefone || "—",
          e.status || "—",
          e.cidade || "—",
          e.endereco || "—",
          e.detalhe_entrega || "—",
          parseFloat(e.distancia || 0),
          parseFloat(e.preco_entrega || 0),
          e.nome_entregador || (e.id_entregador ? `#${e.id_entregador}` : "—"),
          fmtDate(e.data_envio),
          fmtDate(e.data_entrega),
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [12, 10, 22, 13, 12, 15, 30, 25, 13, 16, 18, 12, 12].map(
        (w) => ({ wch: w }),
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Entregas");
      XLSX.writeFile(
        wb,
        `LOPOS_${t("entregas")}_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (e) {
      console.error("Erro Excel:", e);
    }
    setGerandoXLS(false);
  };

  /* ── Input helper ── */
  const Inp = ({ val, ph, onChange, tipo = "text", icon }) => (
    <div style={{ position: "relative", flex: "1 1 160px", minWidth: "140px" }}>
      {icon && (
        <div
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: G.muted,
            pointerEvents: "none",
          }}
        >
          {icon}
        </div>
      )}
      <input
        type={tipo}
        value={val}
        onChange={onChange}
        placeholder={ph}
        style={{
          width: "100%",
          background: G.cardAlt,
          border: `1px solid ${G.border}`,
          borderRadius: "9px",
          padding: icon ? "9px 12px 9px 33px" : "9px 12px",
          color: G.text,
          fontSize: "12px",
          outline: "none",
          fontFamily: "inherit",
          boxSizing: "border-box",
          transition: "border-color .2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = G.accent)}
        onBlur={(e) => (e.target.style.borderColor = G.border)}
      />
    </div>
  );

  /* ── Card de métrica ── */
  const MetCard = ({ label, value, sub, color, icon }) => (
    <div
      style={{
        background: G.card,
        border: `1px solid ${G.border}`,
        borderRadius: "14px",
        padding: "14px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg,${color},transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "8px",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "10px",
              color: G.muted,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "6px",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: "clamp(18px,3.5vw,24px)",
              fontWeight: "800",
              color,
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          {sub && (
            <div
              style={{
                fontSize: "10px",
                color,
                marginTop: "5px",
                opacity: 0.8,
              }}
            >
              {sub}
            </div>
          )}
        </div>
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  /* ── Botão de vista ── */
  const BtnVista = ({ id, label, icon }) => (
    <button
      onClick={() => setVista(id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 14px",
        borderRadius: "9px",
        border: `1px solid ${vista === id ? G.accent : G.border}`,
        background: vista === id ? `${G.accent}18` : "transparent",
        color: vista === id ? G.accent : G.muted,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "12px",
        fontWeight: vista === id ? "700" : "500",
        transition: "all .18s",
      }}
    >
      {icon}
      {label}
    </button>
  );

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div style={{ padding: "clamp(12px,3vw,24px)", color: G.text }}>
      {/* Modal */}
      {detalhe && (
        <ModalDetalhe
          entrega={detalhe}
          G={G}
          onClose={() => setDetalhe(null)}
          onActualizar={carregar}
          onEliminar={(id) => {
            setDetalhe(null);
            eliminar(id);
          }}
          t={t}
        />
      )}

      {/* Toast de feedback */}
      {feedback && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 3000,
            background: feedback.ok ? `${G.success}18` : `${G.danger}18`,
            border: `1px solid ${feedback.ok ? G.success : G.danger}44`,
            borderRadius: "12px",
            padding: "12px 18px",
            color: feedback.ok ? G.success : G.danger,
            fontSize: "13px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            animation: "slideUp .25s ease",
          }}
        >
          {feedback.ok ? (
            <IcoCheck s={14} c={G.success} />
          ) : (
            <IcoX s={14} c={G.danger} />
          )}
          {feedback.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "14px",
                background: `${G.accent}18`,
                border: `1px solid ${G.accent}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IcoTruck s={22} c={G.accent} />
            </div>
            <div>
              <div
                style={{ fontSize: "clamp(16px,4vw,22px)", fontWeight: "800" }}
              >
                {t("gestao_entregas")}
              </div>
              <div
                style={{ fontSize: "11px", color: G.muted, marginTop: "2px" }}
              >
                {loading
                  ? t("a_carregar")
                  : `${total} ${t("registos")} · ${taxaSucesso}% ${t("taxa_sucesso")}`}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                gap: "6px",
                background: G.card,
                border: `1px solid ${G.border}`,
                borderRadius: "10px",
                padding: "6px 8px",
              }}
            >
              <BtnVista
                id="tabela"
                label={t("tabela")}
                icon={
                  <IcoTable
                    s={13}
                    c={vista === "tabela" ? G.accent : G.muted}
                  />
                }
              />
              <BtnVista
                id="relatorio"
                label={t("relatorio_view")}
                icon={
                  <IcoReport
                    s={13}
                    c={vista === "relatorio" ? G.accent : G.muted}
                  />
                }
              />
            </div>
            <button
              onClick={carregar}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "10px",
                border: `1px solid ${G.border}`,
                background: G.card,
                color: G.muted,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                transition: "all .18s",
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
              <IcoRefresh s={13} /> {t("actualizar")}
            </button>
          </div>
        </div>
      </div>

      {/* ── ERRO ── */}
      {erro && (
        <div
          style={{
            background: `${G.danger}12`,
            border: `1px solid ${G.danger}33`,
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <IcoX s={16} c={G.danger} />
          <div>
            <div
              style={{
                fontWeight: "700",
                color: G.danger,
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              {t("erro_ligacao")}
            </div>
            <div style={{ fontSize: "12px", color: G.muted }}>{erro}</div>
            <button
              onClick={carregar}
              style={{
                marginTop: "10px",
                padding: "6px 14px",
                borderRadius: "7px",
                border: `1px solid ${G.danger}44`,
                background: `${G.danger}12`,
                color: G.danger,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {t("tentar_outra_conta")}
            </button>
          </div>
        </div>
      )}

      {/* ── MÉTRICAS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <MetCard
          label={t("total_entregas")}
          value={total}
          sub={`${receitaTotal > 0 ? fmt(receitaTotal) : ""}`}
          color={G.accent}
          icon={<IcoTruck s={15} c={G.accent} />}
        />
        <MetCard
          label={t("pendentes_label")}
          value={pendentes}
          sub={t("a_sair")}
          color={G.warning}
          icon={<IcoClock s={15} c={G.warning} />}
        />
        <MetCard
          label={t("enviadas_label")}
          value={enviados}
          sub={t("a_caminho")}
          color={G.accent}
          icon={<IcoDown s={15} c={G.accent} />}
        />
        <MetCard
          label={t("entregues_label")}
          value={entregues}
          sub={`${taxaSucesso}% ${t("taxa_sucesso")}`}
          color={G.success}
          icon={<IcoCheck s={15} c={G.success} />}
        />
        <MetCard
          label={t("canceladas_label")}
          value={cancelados}
          sub={t("sem_entrega")}
          color={G.danger}
          icon={<IcoX s={15} c={G.danger} />}
        />
        {reservados > 0 && (
          <MetCard
            label={t("reservados")}
            value={reservados}
            sub={t("reservados")}
            color="#a855f7"
            icon={<IcoTruck s={15} c="#a855f7" />}
          />
        )}
      </div>

      {/* ══════════════════════════════════════
          VISTA TABELA
      ══════════════════════════════════════ */}
      {vista === "tabela" && (
        <>
          {/* FILTROS */}
          <div
            style={{
              background: G.card,
              border: `1px solid ${G.border}`,
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                marginBottom: "12px",
                fontSize: "11px",
                color: G.muted,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              <IcoFilter s={12} c={G.muted} /> {t("filtros")}
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Inp
                val={filtro.busca}
                ph={t("buscar_entrega")}
                onChange={(e) => {
                  setFiltro((f) => ({ ...f, busca: e.target.value }));
                  setPagina(1);
                }}
                icon={<IcoSearch s={13} />}
              />
              <div style={{ flex: "1 1 140px", minWidth: "130px" }}>
                <select
                  value={filtro.estado}
                  onChange={(e) => {
                    setFiltro((f) => ({ ...f, estado: e.target.value }));
                    setPagina(1);
                  }}
                  style={{
                    width: "100%",
                    background: G.cardAlt,
                    border: `1px solid ${G.border}`,
                    borderRadius: "9px",
                    padding: "9px 12px",
                    color: G.text,
                    fontSize: "12px",
                    outline: "none",
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <option value="todos">{t("todos_estados")}</option>
                  <option value="pendente">{t("status_pendente")}</option>
                  <option value="enviado">{t("status_enviado")}</option>
                  <option value="entregue">{t("status_entregue")}</option>
                  <option value="cancelado">{t("status_cancelado")}</option>
                  <option value="reservado">{t("status_reservado")}</option>
                </select>
              </div>
              <Inp
                val={filtro.entregador}
                ph={t("entregador")}
                onChange={(e) => {
                  setFiltro((f) => ({ ...f, entregador: e.target.value }));
                  setPagina(1);
                }}
                icon={<IcoUser s={13} />}
              />
              <Inp
                val={filtro.data}
                ph={t("data_envio")}
                onChange={(e) => {
                  setFiltro((f) => ({ ...f, data: e.target.value }));
                  setPagina(1);
                }}
                tipo="date"
              />
              {(filtro.busca ||
                filtro.estado !== "todos" ||
                filtro.entregador ||
                filtro.data) && (
                <button
                  onClick={() => {
                    setFiltro({
                      busca: "",
                      estado: "todos",
                      entregador: "",
                      data: "",
                    });
                    setPagina(1);
                  }}
                  style={{
                    padding: "9px 13px",
                    borderRadius: "9px",
                    border: `1px solid ${G.danger}44`,
                    background: `${G.danger}10`,
                    color: G.danger,
                    cursor: "pointer",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <IcoX s={12} c={G.danger} /> {t("limpar_filtros")}
                </button>
              )}
            </div>
          </div>

          {/* Barra de exportação */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={exportarExcel}
              disabled={gerandoXLS}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 14px",
                borderRadius: "99px",
                border: "1px solid #4caf5044",
                background: "#4caf5010",
                color: "#4caf50",
                cursor: gerandoXLS ? "wait" : "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all .15s",
              }}
            >
              {gerandoXLS ? (
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    border: "2px solid #4caf5030",
                    borderTop: "2px solid #4caf50",
                    borderRadius: "50%",
                    animation: "spin .8s linear infinite",
                  }}
                />
              ) : (
                <IcoExcel s={13} c="#4caf50" />
              )}
              {t("exportar_excel")}
            </button>
            <span style={{ fontSize: "12px", color: G.muted }}>
              {filtradas.length} {t("resultados")} {t("de")} {total}
            </span>
          </div>

          {/* TABELA */}
          <div
            style={{
              background: G.card,
              border: `1px solid ${G.border}`,
              borderRadius: "14px",
              overflow: "hidden",
              marginBottom: "14px",
            }}
          >
            {loading ? (
              <div
                style={{ padding: "56px", textAlign: "center", color: G.muted }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "14px",
                  }}
                >
                  <IcoSpin s={32} c={G.accent} />
                </div>
                <div style={{ fontSize: "13px" }}>
                  {t("carregando_entregas")}
                </div>
              </div>
            ) : filtradas.length === 0 ? (
              <div
                style={{ padding: "56px", textAlign: "center", color: G.muted }}
              >
                <div style={{ marginBottom: "12px", opacity: 0.4 }}>
                  <IcoTruck s={40} c={G.muted} />
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  {t("sem_entregas")}
                </div>
                <div style={{ fontSize: "12px" }}>
                  {total === 0
                    ? t("sem_entregas_bd")
                    : t("sem_resultados_filtros")}
                </div>
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: "calc(100vh - 460px)",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${G.border} transparent`,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                    minWidth: "720px",
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        t("codigo"),
                        t("cliente"),
                        t("pedido"),
                        t("localizacao"),
                        t("distancia"),
                        t("taxa"),
                        t("entregador"),
                        t("data_envio"),
                        t("status_actual"),
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "10px 12px",
                            color: G.muted,
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            background: G.cardAlt,
                            borderBottom: `1px solid ${G.border}`,
                            whiteSpace: "nowrap",
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginadas.map((e, i) => (
                      <tr
                        key={e.id_entrega}
                        style={{
                          borderBottom: `1px solid ${G.border}`,
                          cursor: "pointer",
                          transition: "background .12s",
                        }}
                        onMouseEnter={(el) =>
                          (el.currentTarget.style.background = `${G.accent}06`)
                        }
                        onMouseLeave={(el) =>
                          (el.currentTarget.style.background = "transparent")
                        }
                      >
                        <td
                          style={{ padding: "11px 12px", whiteSpace: "nowrap" }}
                        >
                          <span
                            style={{
                              color: G.accent,
                              fontWeight: "800",
                              fontFamily: "monospace",
                              fontSize: "11px",
                            }}
                          >
                            ENT{String(e.id_entrega).padStart(3, "0")}
                          </span>
                        </td>
                        <td style={{ padding: "11px 12px" }}>
                          <div
                            style={{
                              fontWeight: "600",
                              color: G.text,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "150px",
                            }}
                          >
                            {e.nome || "—"}
                          </div>
                          {e.telefone && (
                            <div
                              style={{
                                fontSize: "10px",
                                color: G.muted,
                                marginTop: "2px",
                              }}
                            >
                              {e.telefone}
                            </div>
                          )}
                        </td>
                        <td
                          style={{ padding: "11px 12px", whiteSpace: "nowrap" }}
                        >
                          <span style={{ color: G.muted, fontSize: "11px" }}>
                            #{e.id_pedido || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "11px 12px" }}>
                          <div
                            style={{
                              fontSize: "12px",
                              color: G.text,
                              maxWidth: "160px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {e.cidade || "—"}
                          </div>
                          {e.endereco && (
                            <div
                              style={{
                                fontSize: "10px",
                                color: G.muted,
                                maxWidth: "160px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {e.endereco}
                            </div>
                          )}
                        </td>
                        <td
                          style={{ padding: "11px 12px", whiteSpace: "nowrap" }}
                        >
                          <span style={{ color: G.muted, fontSize: "11px" }}>
                            {e.distancia ? `${e.distancia} km` : "—"}
                          </span>
                        </td>
                        <td
                          style={{ padding: "11px 12px", whiteSpace: "nowrap" }}
                        >
                          <span
                            style={{
                              color: G.success,
                              fontWeight: "600",
                              fontSize: "11px",
                            }}
                          >
                            {e.preco_entrega ? fmt(e.preco_entrega) : "—"}
                          </span>
                        </td>
                        <td
                          style={{ padding: "11px 12px", whiteSpace: "nowrap" }}
                        >
                          <span style={{ color: G.muted, fontSize: "11px" }}>
                            {e.nome_entregador ||
                              (e.id_entregador ? `#${e.id_entregador}` : "—")}
                          </span>
                        </td>
                        <td
                          style={{ padding: "11px 12px", whiteSpace: "nowrap" }}
                        >
                          <span style={{ fontSize: "11px", color: G.muted }}>
                            {fmtDate(e.data_envio)}
                          </span>
                        </td>
                        <td
                          style={{ padding: "11px 12px", whiteSpace: "nowrap" }}
                        >
                          <BadgeEstado estado={e.status} G={G} t={t} />
                        </td>
                        <td
                          style={{ padding: "11px 12px", whiteSpace: "nowrap" }}
                        >
                          <button
                            onClick={() => setDetalhe(e)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "5px 12px",
                              borderRadius: "7px",
                              border: `1px solid ${G.border}`,
                              background: "transparent",
                              color: G.accent,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              fontSize: "11px",
                              fontWeight: "600",
                              transition: "all .15s",
                            }}
                            onMouseEnter={(el) => {
                              el.currentTarget.style.background = `${G.accent}14`;
                              el.currentTarget.style.borderColor = G.accent;
                            }}
                            onMouseLeave={(el) => {
                              el.currentTarget.style.background = "transparent";
                              el.currentTarget.style.borderColor = G.border;
                            }}
                          >
                            <IcoEye s={12} /> {t("ver")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rodapé da tabela */}
            {!loading && filtradas.length > 0 && (
              <div
                style={{
                  padding: "9px 16px",
                  borderTop: `1px solid ${G.border}`,
                  background: G.cardAlt,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "11px",
                  color: G.muted,
                }}
              >
                <span>
                  {t("mostrando")}{" "}
                  <strong style={{ color: G.text }}>{paginadas.length}</strong>{" "}
                  {t("de")}{" "}
                  <strong style={{ color: G.text }}>{filtradas.length}</strong>
                </span>
                {filtro.estado !== "todos" && (
                  <button
                    onClick={() =>
                      setFiltro((f) => ({ ...f, estado: "todos" }))
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: G.accent,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {t("ver_todos")} →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* PAGINAÇÃO */}
          {totalPaginas > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: `1px solid ${G.border}`,
                  background: "transparent",
                  color: pagina === 1 ? G.muted : G.accent,
                  cursor: pagina === 1 ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontSize: "12px",
                }}
              >
                <IcoArrowL s={12} c={pagina === 1 ? G.muted : G.accent} />{" "}
                {t("anterior")}
              </button>
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const pg =
                  Math.max(1, Math.min(pagina - 2, totalPaginas - 4)) + i;
                return pg > 0 && pg <= totalPaginas ? (
                  <button
                    key={pg}
                    onClick={() => setPagina(pg)}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      border: `1px solid ${pagina === pg ? G.accent : G.border}`,
                      background:
                        pagina === pg ? `${G.accent}18` : "transparent",
                      color: pagina === pg ? G.accent : G.muted,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {pg}
                  </button>
                ) : null;
              })}
              <button
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: `1px solid ${G.border}`,
                  background: "transparent",
                  color: pagina === totalPaginas ? G.muted : G.accent,
                  cursor: pagina === totalPaginas ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontSize: "12px",
                }}
              >
                {t("seguinte")}{" "}
                <IcoArrow
                  s={12}
                  c={pagina === totalPaginas ? G.muted : G.accent}
                />
              </button>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════
          VISTA RELATÓRIO
      ══════════════════════════════════════ */}
      {vista === "relatorio" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "14px",
          }}
        >
          {/* Por estado */}
          <div
            style={{
              background: G.card,
              border: `1px solid ${G.border}`,
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: `1px solid ${G.border}`,
              }}
            >
              <IcoChart s={16} c={G.accent} />
              <span style={{ fontWeight: "700", fontSize: "14px" }}>
                {t("by_status")}
              </span>
            </div>
            {[
              { label: t("status_pendente"), value: pendentes, color: G.warning },
              { label: t("status_enviado"), value: enviados, color: G.accent },
              { label: t("status_entregue"), value: entregues, color: G.success },
              { label: t("status_cancelado"), value: cancelados, color: G.danger },
              { label: t("status_reservado"), value: reservados, color: "#a855f7" },
            ].map((item) => {
              const pct =
                total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.label} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: G.muted }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: item.color,
                      }}
                    >
                      {item.value}{" "}
                      <span style={{ color: G.muted, fontWeight: "400" }}>
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      background: G.cardAlt,
                      borderRadius: "99px",
                      height: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: item.color,
                        borderRadius: "99px",
                        transition: "width .5s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Por dia da semana */}
          <div
            style={{
              background: G.card,
              border: `1px solid ${G.border}`,
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: `1px solid ${G.border}`,
              }}
            >
              <IcoChart s={16} c={G.accent} />
              <span style={{ fontWeight: "700", fontSize: "14px" }}>
                {t("by_day")}
              </span>
            </div>
            <GraficoBarras dados={porDia} G={G} t={t} />
          </div>

          {/* Taxa de sucesso */}
          <div
            style={{
              background: G.card,
              border: `1px solid ${G.border}`,
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: `1px solid ${G.border}`,
              }}
            >
              <IcoCheck s={16} c={G.success} />
              <span style={{ fontWeight: "700", fontSize: "14px" }}>
                {t("taxa_sucesso")}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              {(() => {
                const R = 38,
                  C = 2 * Math.PI * R,
                  pct = taxaSucesso / 100;
                return (
                  <div
                    style={{
                      position: "relative",
                      width: "90px",
                      height: "90px",
                    }}
                  >
                    <svg width="90" height="90" viewBox="0 0 90 90">
                      <circle
                        cx="45"
                        cy="45"
                        r={R}
                        fill="none"
                        stroke={G.cardAlt}
                        strokeWidth="7"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r={R}
                        fill="none"
                        stroke={G.success}
                        strokeWidth="7"
                        strokeDasharray={`${pct * C} ${C}`}
                        strokeLinecap="round"
                        transform="rotate(-90 45 45)"
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "17px",
                        fontWeight: "800",
                        color: G.success,
                      }}
                    >
                      {taxaSucesso}%
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: G.success,
                  }}
                >
                  {entregues}
                </div>
                <div style={{ fontSize: "10px", color: G.muted }}>
                  {t("entregues_label")}
                </div>
              </div>
              <div style={{ width: "1px", background: G.border }} />
              <div style={{ textAlign: "center" }}>
                <div
                  style={{ fontSize: "20px", fontWeight: "700", color: G.text }}
                >
                  {total}
                </div>
                <div style={{ fontSize: "10px", color: G.muted }}>
                  {t("total_label")}
                </div>
              </div>
            </div>
          </div>

          {/* Métricas gerais */}
          <div
            style={{
              background: G.card,
              border: `1px solid ${G.border}`,
              borderRadius: "16px",
              padding: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: `1px solid ${G.border}`,
              }}
            >
              <IcoTruck s={16} c={G.accent} />
              <span style={{ fontWeight: "700", fontSize: "14px" }}>
                {t("general_metrics")}
              </span>
            </div>
            {[
              { l: t("total_entregas"), v: total, c: G.text },
              { l: t("total_revenue"), v: fmt(receitaTotal), c: G.success },
              {
                l: t("total_distance"),
                v: `${distTotal.toFixed(1)} km`,
                c: G.accent,
              },
              {
                l: t("avg_distance"),
                v: `${total > 0 ? (distTotal / total).toFixed(1) : 0} km`,
                c: G.muted,
              },
              {
                l: t("active_deliveries"),
                v: pendentes + enviados,
                c: G.warning,
              },
              {
                l: t("cancelled_deliveries_short"),
                v: cancelados,
                c: G.danger,
              },
            ].map(({ l, v, c }) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: `1px solid ${G.border}`,
                }}
              >
                <span style={{ fontSize: "12px", color: G.muted }}>{l}</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: c }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .leaflet-container { font-family:inherit !important; border-radius:12px; }
        .leaflet-popup-content-wrapper { border-radius:8px !important; box-shadow:0 4px 16px rgba(0,0,0,0.3) !important; }
      `}</style>
    </div>
  );
};

export default GEntregas;