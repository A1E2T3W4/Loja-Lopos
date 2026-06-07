import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { getProdutos } from "../data/produtos";

const CATEGORIAS = [
  { label: "Todos",         valor: "" },
  { label: "Computadores",  valor: "Computadores" },
  { label: "Impressoras",   valor: "Impressoras" },
  { label: "Rede",          valor: "Rede" },
  { label: "NoteBook",      valor: "NoteBook" },
  { label: "Periféricos",   valor: "Periféricos" },
  { label: "Armazenamento", valor: "Armazenamento" },
];

const LIMITE_INICIAL = 50;

const getImagens = (p) => {
  const lista = [p.imagem_url, p.img1, p.img2, p.img3, p.img4, p.img5];
  if (Array.isArray(p.imagens)) lista.push(...p.imagens);
  return [...new Set(lista.filter(Boolean))];
};

const fmt = (v) =>
  new Intl.NumberFormat("pt-AO", {
    style: "currency", currency: "AOA", minimumFractionDigits: 0,
  }).format(v);

const precoFinal = (p) => {
  const bp = parseFloat(p.bonus_percentual || 0);
  return bp > 0 ? p.preco * (1 - bp / 100) : p.preco;
};

/* ══════════════════════════════════════════════════════════════
   MODAL DE PRODUTO — idêntico ao Home.jsx
══════════════════════════════════════════════════════════════ */
function ModalProduto({ produto, todosProdutos, onClose, onOpenOutro, addToCart, navigate }) {
  const [imgAtiva, setImgAtiva] = useState(0);
  const [qty, setQty]           = useState(1);
  const [fadeImg, setFadeImg]   = useState(false);

  const imagens  = getImagens(produto);
  const pct      = parseFloat(produto.bonus_percentual || 0);
  const preco    = precoFinal(produto);
  const economia = pct > 0 ? produto.preco - preco : 0;

  const recomendados = todosProdutos
    .filter(p => p.categoria === produto.categoria && p.id_produto !== produto.id_produto)
    .slice(0, 12);

  const trocarImg = (i) => {
    setFadeImg(true);
    setTimeout(() => { setImgAtiva(i); setFadeImg(false); }, 180);
  };

  const navImg = (dir) => {
    const total = imagens.length;
    if (total <= 1) return;
    trocarImg((imgAtiva + dir + total) % total);
  };

  const handleAddCarrinho = () => {
    for (let i = 0; i < qty; i++) addToCart({ ...produto, id: produto.id_produto });
    onClose();
  };

  const handleComprarAgora = () => {
    for (let i = 0; i < qty; i++) addToCart({ ...produto, id: produto.id_produto });
    onClose();
    navigate("/carrinho");
  };

  /* Fechar com Escape */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  /* Bloqueia scroll do body */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="mp-overlay open" onClick={onClose}>
      <div
        className="mp-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={produto.nome}
      >
        {/* Botão fechar */}
        <button className="mp-close" onClick={onClose} aria-label="Fechar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6"  y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* ── BODY — 3 colunas ── */}
        <div className="mp-body">

          {/* COLUNA 1 — miniaturas verticais */}
          {imagens.length > 1 && (
            <div className="mp-thumbs-col">
              {imagens.map((img, i) => (
                <button
                  key={i}
                  className={`mp-thumb${imgAtiva === i ? " active" : ""}`}
                  onClick={() => trocarImg(i)}
                  aria-label={`Imagem ${i + 1}`}
                >
                  <img
                    src={img}
                    alt={`${produto.nome} — ângulo ${i + 1}`}
                    onError={e => e.target.src = "https://via.placeholder.com/80x80"}
                  />
                </button>
              ))}
            </div>
          )}

          {/* COLUNA 2 — imagem principal */}
          <div className="mp-img-col">
            {pct > 0 && (
              <span className="mp-discount-badge">-{Math.round(pct)}%</span>
            )}

            <img
              key={imgAtiva}
              className={`mp-img-main${fadeImg ? "" : " fade-in"}`}
              src={imagens[imgAtiva] || `https://via.placeholder.com/700x700?text=${encodeURIComponent(produto.nome)}`}
              alt={produto.nome}
              onError={e => e.target.src = `https://via.placeholder.com/700x700?text=${encodeURIComponent(produto.nome)}`}
            />

            {imagens.length > 1 && (
              <>
                <button className="mp-img-nav prev" onClick={() => navImg(-1)} aria-label="Imagem anterior">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <button className="mp-img-nav next" onClick={() => navImg(1)} aria-label="Próxima imagem">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
                <span className="mp-img-hint">{imgAtiva + 1} / {imagens.length}</span>
              </>
            )}
          </div>

          {/* COLUNA 3 — informações e compra */}
          <div className="mp-info-col">

            {/* Topo: categoria + stock */}
            <div className="mp-meta-top">
              <span className="mp-categoria">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                {produto.categoria}
              </span>
              <span className={`mp-stock-badge${produto.estoque > 0 ? " in" : " out"}`}>
                <span className="mp-stock-dot"/>
                {produto.estoque > 0
                  ? `${produto.estoque} un. disponív${produto.estoque > 1 ? "eis" : "el"}`
                  : "Sem stock"}
              </span>
            </div>

            {/* Marca */}
            {produto.marca && (
              <p className="mp-marca">Marca: <strong>{produto.marca}</strong></p>
            )}

            {/* Título */}
            <h2 className="mp-titulo">{produto.nome}</h2>

            {/* Rating */}
            <div className="mp-rating">
              <div className="mp-stars">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="mp-star" style={{ color: i <= 4 ? "#f59e0b" : "var(--border)" }}>★</span>
                ))}
              </div>
              <span className="mp-rating-num">4.0</span>
              <span className="mp-rating-sep">·</span>
              <span style={{ fontSize:"0.74rem", color:"var(--fg-faint)" }}>
                {produto.estoque > 0 ? "Em stock" : "Esgotado"}
              </span>
            </div>

            <div className="mp-divider"/>

            {/* Bloco de preço */}
            <div className="mp-preco-block">
              {pct > 0 && (
                <span className="mp-desconto-tag">-{Math.round(pct)}% OFF</span>
              )}
              <span className="mp-preco">{fmt(preco)}</span>
              {pct > 0 && (
                <div className="mp-preco-antigo-wrap">
                  <span className="mp-preco-antigo-label">Preço normal</span>
                  <span className="mp-preco-antigo">{fmt(produto.preco)}</span>
                </div>
              )}
            </div>

            {/* Economia */}
            {pct > 0 && (
              <div className="mp-economia">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Poupa {fmt(economia)} nesta compra
              </div>
            )}

            {/* Entrega */}
            <div className="mp-entrega">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"/>
                <path d="M16 8h4l3 5v4h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              Entrega em <strong>48h</strong> · Luanda e arredores
            </div>

            <div className="mp-divider"/>

            {/* Descrição */}
            {produto.descricao && (
              <p className="mp-descricao">{produto.descricao}</p>
            )}

            {/* Quantidade */}
            <div className="mp-qty-row">
              <span className="mp-qty-label">Qtd.</span>
              <div className="mp-qty-ctrl">
                <button className="mp-qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="mp-qty-num">{qty}</span>
                <button className="mp-qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              {qty > 1 && (
                <span style={{ fontSize:"0.76rem", color:"var(--fg-muted)" }}>
                  Total: {fmt(preco * qty)}
                </span>
              )}
            </div>

            {/* Botões */}
            <div className="mp-actions">
              <button
                className="mp-btn-cart"
                onClick={handleAddCarrinho}
                disabled={produto.estoque <= 0}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Adicionar ao carrinho
              </button>
              <button
                className="mp-btn-buy"
                onClick={handleComprarAgora}
                disabled={produto.estoque <= 0}
              >
                Comprar agora
              </button>
            </div>

            {/* Pagamento seguro */}
            <div className="mp-pagamento">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Pagamento na entrega · Transacção segura
            </div>
          </div>
        </div>

        {/* ── RELACIONADOS ── */}
        {recomendados.length > 0 && (
          <div className="mp-relacionados">
            <div className="mp-rel-header">
              <h3 className="mp-rel-titulo">
                Relacionados em <span>{produto.categoria}</span>
              </h3>
              <span className="mp-rel-count">
                {recomendados.length} produto{recomendados.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="mp-rel-scroll">
              {recomendados.map(p => {
                const pRel   = precoFinal(p);
                const pctRel = parseFloat(p.bonus_percentual || 0);
                return (
                  <div
                    key={p.id_produto}
                    className="mp-rel-card"
                    onClick={() => onOpenOutro(p)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === "Enter" && onOpenOutro(p)}
                  >
                    <div className="mp-rel-img">
                      <img
                        src={p.imagem_url}
                        alt={p.nome}
                        onError={e => e.target.src = "https://via.placeholder.com/160x160"}
                      />
                      {pctRel > 0 && (
                        <span className="mp-rel-badge">-{Math.round(pctRel)}%</span>
                      )}
                    </div>
                    <div className="mp-rel-info">
                      <p className="mp-rel-nome">{p.nome}</p>
                      <p className="mp-rel-preco">{fmt(pRel)}</p>
                      {pctRel > 0 && <p className="mp-rel-antigo">{fmt(p.preco)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PRODUTOS — página de catálogo completo
══════════════════════════════════════════════════════════════ */
export default function Produtos() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [todosProdutos,   setTodosProdutos]   = useState([]);
  const [produtos,        setProdutos]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [categoriaAtiva,  setCategoriaAtiva]  = useState("");
  const [busca,           setBusca]           = useState("");
  const [mostrarTodos,    setMostrarTodos]    = useState(false);
  const [modalProduto,    setModalProduto]    = useState(null);
  const [favs,            setFavs]            = useState(new Set());
  const [addedIds,        setAddedIds]        = useState(new Set());

  /* ── Favoritos ── */
  useEffect(() => {
    const c = localStorage.getItem("luxe_cliente");
    if (!c) return;
    const { id_cliente, id } = JSON.parse(c);
    fetch(`https://lojalopos.infinityfreeapp.com/api/favoritos.php?id_cliente=${id_cliente || id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setFavs(new Set(d.data.map(f => f.id_produto))); })
      .catch(() => {});
  }, []);

  const toggleFavorito = async (e, id_produto) => {
    e.stopPropagation();
    const c = localStorage.getItem("luxe_cliente");
    if (!c) { alert("Faz login para guardar favoritos."); return; }
    const { id_cliente, id } = JSON.parse(c);
    const cid   = id_cliente || id;
    const jaFav = favs.has(id_produto);
    if (jaFav) {
      await fetch(`https://lojalopos.infinityfreeapp.com/api/favoritos.php?id_cliente=${cid}&id_produto=${id_produto}`, { method: "DELETE" });
      setFavs(prev => { const s = new Set(prev); s.delete(id_produto); return s; });
    } else {
      await fetch("https://lojalopos.infinityfreeapp.com/api/favoritos.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cliente: cid, id_produto }),
      });
      setFavs(prev => new Set([...prev, id_produto]));
    }
  };

  /* ── Carregar produtos ── */
  useEffect(() => { carregarProdutos(); }, [categoriaAtiva]);

  const carregarProdutos = async () => {
    setLoading(true);
    const data = await getProdutos(categoriaAtiva);
    setTodosProdutos(data);
    setLoading(false);
  };

  /* ── Filtrar ── */
  useEffect(() => {
    const temFiltro = busca.trim() || categoriaAtiva;
    if (temFiltro) {
      const t = busca.trim().toLowerCase();
      const filtrados = t
        ? todosProdutos.filter(p =>
            p.nome?.toLowerCase().includes(t) ||
            p.categoria?.toLowerCase().includes(t) ||
            p.descricao?.toLowerCase().includes(t))
        : todosProdutos;
      setProdutos(filtrados);
    } else {
      setProdutos(mostrarTodos ? todosProdutos : todosProdutos.slice(0, LIMITE_INICIAL));
    }
  }, [busca, todosProdutos, mostrarTodos, categoriaAtiva]);

  /* ── Modal ── */
  const abrirModal  = (p) => setModalProduto(p);
  const fecharModal = ()  => setModalProduto(null);

  /* ── Adicionar rápido ── */
  const handleQuickAdd = (p, e) => {
    e.stopPropagation();
    addToCart({ ...p, id: p.id_produto });
    setAddedIds(prev => new Set([...prev, p.id_produto]));
    setTimeout(() => {
      setAddedIds(prev => { const s = new Set(prev); s.delete(p.id_produto); return s; });
    }, 1200);
  };

  const temFiltro     = !!(busca.trim() || categoriaAtiva);
  const totalRestante = todosProdutos.length - LIMITE_INICIAL;

  return (
    <>
      {/* ── MODAL ── */}
      {modalProduto && (
        <ModalProduto
          produto={modalProduto}
          todosProdutos={todosProdutos}
          onClose={fecharModal}
          onOpenOutro={(p) => { fecharModal(); setTimeout(() => abrirModal(p), 80); }}
          addToCart={addToCart}
          navigate={navigate}
        />
      )}

      {/* ── CATEGORIAS ── */}
      <section className="cats-bar">
        <div className="container">
          <div className="cats-scroll">
            {CATEGORIAS.map(cat => (
              <button
                key={cat.valor}
                className={`cat-btn${categoriaAtiva === cat.valor ? " active" : ""}`}
                onClick={() => { setCategoriaAtiva(cat.valor); setBusca(""); setMostrarTodos(false); }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── LISTAGEM ── */}
      <section className="section" style={{ paddingTop: "28px" }}>
        <div className="container">

          <div className="sec-header">
            <div>
              <p className="eyebrow">Catálogo completo</p>
              <h2 className="sec-title">
                {categoriaAtiva ? categoriaAtiva : "Todos os produtos"}
                {!temFiltro && !mostrarTodos && todosProdutos.length > LIMITE_INICIAL && (
                  <span className="produtos-count">
                    ({Math.min(LIMITE_INICIAL, todosProdutos.length)} de {todosProdutos.length})
                  </span>
                )}
              </h2>
            </div>
            <div className="search-wrapper">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={busca}
                onChange={e => { setBusca(e.target.value); setMostrarTodos(false); }}
                className="search-input"
              />
              {busca && <button onClick={() => setBusca("")} className="search-clear">×</button>}
            </div>
          </div>

          {/* Resultado da pesquisa */}
          {busca.trim() && (
            <div className="search-results-info">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {produtos.length} resultado{produtos.length !== 1 ? "s" : ""} para «{busca}»
              <button onClick={() => setBusca("")} className="clear-filter">Limpar</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid-produtos">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton"/>)}
            </div>
          ) : produtos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h2 className="empty-title">Nenhum produto encontrado</h2>
              <p className="empty-sub">Tenta outra categoria ou pesquisa.</p>
              <button
                onClick={() => { setCategoriaAtiva(""); setBusca(""); }}
                className="btn-primary"
              >
                Ver todos
              </button>
            </div>
          ) : (
            <>
              <div className="grid-produtos">
                {produtos.map((p, i) => {
                  const pct     = parseFloat(p.bonus_percentual || 0);
                  const preco   = precoFinal(p);
                  const isFav   = favs.has(p.id_produto);
                  const isAdded = addedIds.has(p.id_produto);

                  return (
                    <div
                      key={p.id_produto}
                      className="produto-card"
                      onClick={() => abrirModal(p)}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="produto-img-wrapper">
                        <img
                          src={p.imagem_url || `https://via.placeholder.com/400x400?text=${encodeURIComponent(p.nome)}`}
                          alt={p.nome}
                          className="produto-img"
                          onError={e => e.target.src = `https://via.placeholder.com/400x400?text=${encodeURIComponent(p.nome)}`}
                        />
                        {pct > 0 && <span className="produto-badge">-{Math.round(pct)}%</span>}

                        {/* Favorito */}
                        <button
                          onClick={e => toggleFavorito(e, p.id_produto)}
                          className={`fav-btn${isFav ? " active" : ""}`}
                          title={isFav ? "Remover" : "Favorito"}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24"
                            fill={isFav ? "currentColor" : "none"}
                            stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>

                        {/* Adicionar rápido */}
                        <button
                          className={`btn-add-quick${isAdded ? " added" : ""}`}
                          onClick={e => handleQuickAdd(p, e)}
                          title="Adicionar ao carrinho"
                        >
                          {isAdded ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M20 6L9 17L4 12"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <line x1="12" y1="5" x2="12" y2="19"/>
                              <line x1="5"  y1="12" x2="19" y2="12"/>
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="produto-info">
                        <p className="produto-cat">{p.categoria}</p>
                        <h3 className="produto-nome">{p.nome}</h3>
                        <div className="produto-precos">
                          <span className="preco-atual-sm">{fmt(preco)}</span>
                          {pct > 0 && <span className="preco-antigo-sm">{fmt(p.preco)}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ver mais */}
              {!temFiltro && !mostrarTodos && todosProdutos.length > LIMITE_INICIAL && (
                <div className="load-more-container">
                  <p className="load-more-info">
                    A mostrar <strong>{LIMITE_INICIAL}</strong> de <strong>{todosProdutos.length}</strong> produtos
                  </p>
                  <button onClick={() => setMostrarTodos(true)} className="load-more-btn">
                    Ver mais {totalRestante} produto{totalRestante !== 1 ? "s" : ""}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}