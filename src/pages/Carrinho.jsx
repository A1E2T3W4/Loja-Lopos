import { useState, useCallback, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  enviarEmailCompra,
  enviarEmailVerificado,
} from "../services/emailService";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LOJA_COORDS = [-8.8368, 13.2343];
const TAXA_KM     = 50;

const API_ROUTES = {
  pedidos:   "https://lojalopos.infinityfreeapp.com/api/pedidos.php",
  pedidosQr: "https://lojalopos.infinityfreeapp.com/api/pedidos_qr.php",
  entregas:  "https://lojalopos.infinityfreeapp.com/api/entregas.php",
  historico: "https://lojalopos.infinityfreeapp.com/api/historico.php",
};

async function apiPost(url, body) {
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erro ${res.status}`);
  }
  return res.json();
}

async function geocodificar(endereco) {
  const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&countrycodes=ao&format=json&limit=1`;
  const res  = await fetch(url, { headers: { "Accept-Language": "pt" } });
  const data = await res.json();
  if (!data.length) throw new Error("Endereço não encontrado.");
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

async function buscarSugestoes(texto) {
  if (texto.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(texto)}&countrycodes=ao&format=json&limit=5`;
  const res = await fetch(url, { headers: { "Accept-Language": "pt" } });
  return res.json();
}

async function calcularRotaOSRM(origem, destino) {
  const url  = `https://router.project-osrm.org/route/v1/driving/${origem[1]},${origem[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`;
  const res  = await fetch(url);
  const data = await res.json();
  if (data.code !== "Ok") throw new Error("Rota não encontrada.");
  const distKm      = data.routes[0].distance / 1000;
  const coordenadas = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  return { distKm, coordenadas };
}

function useLeafletMap(mapaRef, visible) {
  const mapInstance       = useRef(null);
  const rotaLayer         = useRef(null);
  const marcadorDestino   = useRef(null);

  useEffect(() => {
    if (!visible || mapInstance.current) return;
    const map = L.map(mapaRef.current, { zoomControl: true }).setView(LOJA_COORDS, 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    const lojaIcon = L.divIcon({ html: `<div style="font-size:22px">🏪</div>`, className: "", iconAnchor: [11, 22] });
    L.marker(LOJA_COORDS, { icon: lojaIcon }).addTo(map).bindPopup("LOPOS – Loja");
    mapInstance.current = map;
  }, [visible, mapaRef]);

  const desenharRota = useCallback((destCoords, polyline) => {
    const map = mapInstance.current;
    if (!map) return;
    if (rotaLayer.current)       map.removeLayer(rotaLayer.current);
    if (marcadorDestino.current) map.removeLayer(marcadorDestino.current);
    rotaLayer.current = L.polyline(polyline, { color: "#e63e2c", weight: 4, opacity: 0.9 }).addTo(map);
    const destIcon = L.divIcon({ html: `<div style="font-size:22px">📍</div>`, className: "", iconAnchor: [11, 22] });
    marcadorDestino.current = L.marker(destCoords, { icon: destIcon }).addTo(map).bindPopup("Destino").openPopup();
    map.fitBounds(rotaLayer.current.getBounds(), { padding: [40, 40] });
  }, []);

  return { desenharRota };
}

/* ─────────────────────────────────────────────────────────
   Calcula o bónus do carrinho:
   Soma o bonus_saldo de cada produto distinto que tenha
   bonus_saldo > 0. NÃO multiplica pela quantidade.
   O valor é fixo por produto, definido na BD.
───────────────────────────────────────────────────────── */
function calcularBonusCarrinho(cart) {
  return cart.reduce((acc, item) => {
    const b = parseFloat(item.bonus_saldo ?? 0);
    return b > 0 ? acc + b : acc;
  }, 0);
}

const Carrinho = () => {
  const { cart, removeFromCart, updateQuantidade, total, clearCart } = useCart();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [endereco,         setEndereco]         = useState("");
  const [detalheEntrega,   setDetalheEntrega]   = useState("");
  const [cidade,           setCidade]           = useState("");
  const [sugestoes,        setSugestoes]        = useState([]);
  const [sugestoesAbertas, setSugestoesAbertas] = useState(false);
  const [distKm,           setDistKm]           = useState(0);
  const [taxaEntrega,      setTaxaEntrega]      = useState(0);
  const [mapaVisivel,      setMapaVisivel]      = useState(false);
  const [loadingRota,      setLoadingRota]      = useState(false);
  const [loadingFinalizar, setLoadingFinalizar] = useState(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);

  const mapaRef    = useRef(null);
  const debounceRef = useRef(null);
  const { desenharRota } = useLeafletMap(mapaRef, mapaVisivel);

  const fmt = (v) =>
    new Intl.NumberFormat("pt-AO", {
      style: "currency", currency: "AOA", minimumFractionDigits: 0,
    }).format(v);

  /* Bónus fixo calculado a partir dos produtos no carrinho */
  const bonusCarrinho = calcularBonusCarrinho(cart);

  const handleEnderecoChange = (e) => {
    const valor = e.target.value;
    setEndereco(valor);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (valor.length >= 3) {
        const lista = await buscarSugestoes(valor);
        setSugestoes(lista);
        setSugestoesAbertas(true);
      } else {
        setSugestoes([]);
        setSugestoesAbertas(false);
      }
    }, 400);
  };

  const escolherSugestao = (s) => {
    setEndereco(s.display_name);
    setCidade(s.address?.city || s.address?.town || s.address?.county || "");
    setSugestoes([]);
    setSugestoesAbertas(false);
  };

  const calcularRota = useCallback(async () => {
    if (!endereco.trim()) { alert("Introduza o seu endereço."); return; }
    setLoadingRota(true);
    setSugestoes([]);
    setSugestoesAbertas(false);
    try {
      const destCoords = await geocodificar(endereco);
      const { distKm: dist, coordenadas } = await calcularRotaOSRM(LOJA_COORDS, destCoords);
      const taxa = Math.ceil(dist * TAXA_KM);
      setDistKm(dist.toFixed(1));
      setTaxaEntrega(taxa);
      setMapaVisivel(true);
      setTimeout(() => desenharRota(destCoords, coordenadas), 200);
    } catch (err) {
      alert(err.message || "Não foi possível calcular a rota.");
    }
    setLoadingRota(false);
  }, [endereco, desenharRota]);

  const handleFinalizar = async () => {
    if (!endereco.trim())            { alert("Indique o endereço de entrega."); return; }
    if (!mapaVisivel)                { alert("Calcule a rota primeiro."); return; }
    if (!user?.id && !user?.id_cliente) { alert("Utilizador não autenticado."); return; }

    setLoadingFinalizar(true);
    try {
      const clienteId        = user.id || user.id_cliente;
      const totalFinal       = total + taxaEntrega;
      const enderecoCompleto = detalheEntrega ? `${endereco} — ${detalheEntrega}` : endereco;
      const dataEntrega      = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

      /* 1. Criar pedido
         O backend (pedidos.php) calcula o bónus real a partir do
         bonus_saldo de cada produto na BD — o frontend NÃO envia
         bonus_ganho, apenas os itens com id_produto e quantidade. */
      const pedido = await apiPost(API_ROUTES.pedidos, {
        id_cliente:  clienteId,
        total:       totalFinal,
        taxa_entrega: taxaEntrega,
        status:      "pendente",
        data_entrega: dataEntrega,
        itens: cart.map((i) => ({
          id_produto: i.id || i.id_produto,
          quantidade: i.quantidade,
          preco:      i.preco,
        })),
      });

      const id_pedido  = pedido.id_pedido || pedido.id;
      /* Bónus real vindo do backend (soma dos bonus_saldo dos produtos) */
      const bonus_ganho = pedido.bonus_ganho ?? 0;

      /* 2. QR Code do pedido */
      const qrData = JSON.stringify({
        pedido:   id_pedido,
        loja:     "LOPOS",
        cliente:  clienteId,
        total:    totalFinal,
        endereco: enderecoCompleto,
        distancia: distKm + " km",
        ts:       Date.now(),
      });

      await apiPost(API_ROUTES.pedidosQr, {
        id_pedido,
        qr_code: qrData,
        status:  "pendente",
      });

      /* 3. Entrega */
      await apiPost(API_ROUTES.entregas, {
        id_pedido,
        nome:           user.nome || user.name || "Cliente",
        status:         "pendente",
        distancia:      parseFloat(distKm),
        preco_entrega:  taxaEntrega,
        data_envio:     new Date().toISOString(),
        data_entrega:   dataEntrega,
        cidade:         cidade || "Luanda",
        endereco:       enderecoCompleto,
        detalhe_entrega: detalheEntrega || null,
      });

      /* 4. Histórico */
      const historicoRes = await apiPost(API_ROUTES.historico, {
        id_cliente:  clienteId,
        id_pedido,
        total:       totalFinal,
        bonus_ganho,
        status:      "concluído",
        data_compra: new Date().toISOString(),
      });

      /* 5. Actualiza localStorage */
      const clienteAnterior = JSON.parse(localStorage.getItem("luxe_cliente") || "{}");
      const eraVerificado   = !!clienteAnterior.cliente_verificado;

      if (historicoRes.cliente) {
        const atualizado = {
          ...clienteAnterior,
          compras_realizadas: historicoRes.cliente.compras_realizadas,
          cliente_verificado: historicoRes.cliente.cliente_verificado,
          saldo_bonus:        historicoRes.cliente.saldo_bonus,
        };
        localStorage.setItem("luxe_cliente", JSON.stringify(atualizado));
        window.dispatchEvent(new CustomEvent("clienteAtualizado"));

        if (!eraVerificado && !!historicoRes.cliente.cliente_verificado) {
          enviarEmailVerificado(
            user.nome || user.name || "Cliente",
            user.email,
            historicoRes.cliente.compras_realizadas,
          ).catch(() => {});
        }
      }

      /* 6. Email de confirmação */
      enviarEmailCompra(
        user.nome || user.name || "Cliente",
        user.email,
        id_pedido,
        fmt(totalFinal),
        enderecoCompleto,
        distKm + " km",
        fmt(taxaEntrega),
      ).catch(() => {});

      clearCart();
      setPedidoFinalizado({ id_pedido, qrData, total: totalFinal, endereco: enderecoCompleto, bonus_ganho });

    } catch (err) {
      alert("Erro ao finalizar: " + err.message);
    }
    setLoadingFinalizar(false);
  };

  const handleCancelar = () => {
    if (!window.confirm("Tens a certeza que queres cancelar o pedido?")) return;
    clearCart();
    navigate("/produtos");
  };

  /* ── CARRINHO VAZIO ── */
  if (cart.length === 0 && !pedidoFinalizado) {
    return (
      <div className="carr-page">
        <div className="empty-state">
          <div className="empty-icon">▣</div>
          <h2 className="empty-title">O seu carrinho está vazio</h2>
          <p className="empty-sub">Adicione produtos para continuar.</p>
          <button className="btn-primary" onClick={() => navigate("/produtos")}>Explorar produtos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="carr-page">
      <div className="carr-container">
        <p className="carr-eyebrow">A sua selecção</p>
        <h1 className="carr-titulo">Carrinho</h1>

        {/* ── LISTA DE PRODUTOS ── */}
        <div className="carr-produtos-card">
          <div className="carr-produtos-header">
            <h2>Produtos</h2>
            <span className="badge">{cart.length} {cart.length === 1 ? "item" : "itens"}</span>
          </div>
          <div className="carr-lista">
            {cart.map((item) => (
              <div key={item.id} className="carr-item">
                <img
                  className="carr-item-img"
                  src={item.imagem_url || item.imagem || "https://via.placeholder.com/72"}
                  alt={item.nome}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/72"; }}
                />
                <div className="carr-item-info">
                  <p className="carr-item-cat">{item.categoria}</p>
                  <h3 className="carr-item-nome">{item.nome}</h3>
                  {item.desconto > 0 && (
                    <p className="carr-item-desconto">{item.desconto}% desconto</p>
                  )}
                  {/* Mostra bónus do produto se existir */}
                  {parseFloat(item.bonus_saldo ?? 0) > 0 && (
                    <p style={{ fontSize: ".72rem", color: "var(--success)", fontWeight: "600", marginTop: "2px" }}>
                      +{fmt(item.bonus_saldo)} bónus
                    </p>
                  )}
                  <div className="carr-qty">
                    <button className="carr-qty-btn" onClick={() => updateQuantidade(item.id, -1)}>−</button>
                    <span className="carr-qty-num">{item.quantidade}</span>
                    <button className="carr-qty-btn" onClick={() => updateQuantidade(item.id, 1)}>+</button>
                    <button className="carr-qty-btn remove" onClick={() => removeFromCart(item.id)} title="Remover">✕</button>
                  </div>
                </div>
                <div className="carr-item-preco">{fmt(item.preco * item.quantidade)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAPA ── */}
        {mapaVisivel && (
          <div className="carr-mapa-card">
            <div ref={mapaRef} className="carr-mapa-inner" />
            <div className="carr-mapa-info">
              <span>📍 Distância: <strong>{distKm} km</strong></span>
              <span>🚗 Taxa de entrega: <span className="carr-mapa-accent">{fmt(taxaEntrega)}</span></span>
            </div>
          </div>
        )}

        {/* ── ENDEREÇO + RESUMO ── */}
        <div className="carr-bottom">

          {/* ENDEREÇO */}
          <div className="carr-panel">
            <h2>Endereço de entrega</h2>

            <div className="form-group">
              <label className="form-label">Rua / Bairro</label>
              <input
                type="text" className="form-input"
                placeholder="Ex: Kilamba, Talatona, Miramar…"
                value={endereco}
                onChange={handleEnderecoChange}
                onFocus={() => sugestoes.length > 0 && setSugestoesAbertas(true)}
                onBlur={() => setTimeout(() => setSugestoesAbertas(false), 200)}
                autoComplete="off"
              />
              {sugestoesAbertas && sugestoes.length > 0 && (
                <ul className="sugestoes-list">
                  {sugestoes.map((s) => (
                    <li key={s.place_id} onMouseDown={() => escolherSugestao(s)}>
                      📍 {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input type="text" className="form-input" placeholder="Ex: Luanda, Viana…"
                value={cidade} onChange={(e) => setCidade(e.target.value)}/>
            </div>

            <div className="form-group">
              <label className="form-label">Quarteirão / Edifício / Apartamento</label>
              <input type="text" className="form-input" placeholder="Ex: Q.14, Bloco B, Apto 32…"
                value={detalheEntrega} onChange={(e) => setDetalheEntrega(e.target.value)}/>
            </div>

            <button className="btn-rota" onClick={calcularRota} disabled={loadingRota}>
              {loadingRota ? "A calcular rota…" : mapaVisivel ? "🔄 Recalcular rota" : "📍 Calcular rota"}
            </button>
          </div>

          {/* RESUMO */}
          <div className="carr-panel">
            <h2>Resumo do pedido</h2>

            <div className="resumo-row">
              <span className="label">Subtotal</span>
              <span>{fmt(total)}</span>
            </div>

            <div className="resumo-row">
              <span className="label">
                Entrega
                {distKm > 0 && <small>{distKm} km × 50 Kz</small>}
              </span>
              <span>{taxaEntrega > 0 ? fmt(taxaEntrega) : "—"}</span>
            </div>

            {/*
              Bónus estimado — soma dos bonus_saldo fixos dos produtos
              (mesmo valor que o backend vai creditar no cartão).
              Só aparece se houver produtos com bónus E o utilizador
              for verificado (senão o backend não credita).
            */}
            {bonusCarrinho > 0 && (
              <div className="bonus-row">
                <span style={{ color: "var(--fg-muted)" }}>
                  Bónus estimado
                </span>
                <span className="success">+{fmt(bonusCarrinho)}</span>
              </div>
            )}

            {detalheEntrega && (
              <div style={{ fontSize: ".8rem", color: "var(--fg-muted)", padding: "6px 0" }}>
                📦 {detalheEntrega}
              </div>
            )}

            <div className="resumo-total">
              <span>Total</span>
              <span className="val">{fmt(total + taxaEntrega)}</span>
            </div>

            <button className="btn-finalizar" onClick={handleFinalizar} disabled={loadingFinalizar}>
              {loadingFinalizar
                ? <span>A processar…</span>
                : <><span>✓</span><span>Finalizar compra</span></>}
            </button>

            <button className="btn-cancelar" onClick={handleCancelar}>✕ Cancelar pedido</button>

            <p className="pagamento-label">🔒 Pagamento na entrega · Transacção segura</p>
          </div>
        </div>
      </div>

      {/* ── MODAL PEDIDO FINALIZADO ── */}
      {pedidoFinalizado && (
        <div className="carr-modal-overlay" onClick={() => { setPedidoFinalizado(null); navigate("/"); }}>
          <div className="carr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-topo">
              <div className="modal-check-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>Compra efectuada! 🎉</h2>
              <p>Pedido <strong>#{pedidoFinalizado.id_pedido}</strong> registado com sucesso</p>
            </div>

            <div className="modal-corpo">
              <div className="modal-info">
                <p className="modal-sec-label">Detalhes da encomenda</p>
                {[
                  { l: "Endereço",       v: pedidoFinalizado.endereco },
                  { l: "Distância",      v: `${distKm} km` },
                  { l: "Taxa de entrega",v: fmt(taxaEntrega) },
                  { l: "Total pago",     v: fmt(pedidoFinalizado.total) },
                ].map((r) => (
                  <div key={r.l} className="modal-detalhe">
                    <p className="dl">{r.l}</p>
                    <p className="dv">{r.v}</p>
                  </div>
                ))}

                {pedidoFinalizado.bonus_ganho > 0 && (
                  <div className="modal-bonus">
                    <p className="bl">Bónus ganho</p>
                    <p className="bv">{fmt(pedidoFinalizado.bonus_ganho)}</p>
                    <p className="bs">Creditado no seu cartão LOPOS</p>
                  </div>
                )}

                <div className="modal-email-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>Confirmação enviada por e-mail</span>
                </div>
              </div>

              <div className="modal-qr">
                <p className="modal-sec-label">QR Code do pedido</p>
                <div className="qr-box">
                  <QRCodeCanvas value={pedidoFinalizado.qrData} size={130} level="H" bgColor="#FFFFFF" fgColor="#1a1a2e"/>
                </div>
                <p className="qr-hint">Apresente ao entregador<br/>para confirmar a entrega</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-finalizar" style={{ marginTop: 0 }}
                onClick={() => { setPedidoFinalizado(null); navigate("/"); }}>
                Voltar à loja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carrinho;
