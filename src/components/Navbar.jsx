import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { cart } = useCart();
  const totalItens = cart.reduce((acc, item) => acc + item.quantidade, 0);
  const [tema, setTema] = useState(() => localStorage.getItem("luxe_tema") || "dark");
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tema);
    localStorage.setItem("luxe_tema", tema);
  }, [tema]);

  useEffect(() => {
    const c = localStorage.getItem("luxe_cliente");
    setCliente(c ? JSON.parse(c) : null);
    setDrawerAberto(false);
  }, [location]);

  useEffect(() => {
    const handler = () => {
      const c = localStorage.getItem("luxe_cliente");
      setCliente(c ? JSON.parse(c) : null);
    };
    window.addEventListener("clienteAtualizado", handler);
    return () => window.removeEventListener("clienteAtualizado", handler);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 860) setDrawerAberto(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerAberto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerAberto]);

  const inicial = cliente ? (cliente.nome || "?").charAt(0).toUpperCase() : null;

  /* ── Ícones SVG ── */
  const IcoHome = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
  const IcoBox = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
  const IcoCart = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
  const IcoLock = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
  const IcoInfo = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
  const IcoMoon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
  const IcoSun = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
  const IcoChevron = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );

  const navItems = [
    { to: "/",        label: "Início",   Icon: IcoHome, badge: 0 },
    { to: "/produtos",label: "Produtos", Icon: IcoBox,  badge: 0 },
    { to: "/carrinho",label: "Carrinho", Icon: IcoCart, badge: totalItens },
    { to: "/gestao",  label: "Gestão",   Icon: IcoLock, accent: true },
    { to: "https://a1e2t3w4.github.io/Empresa/", label: "Sobre", Icon: IcoInfo, external: true },
  ];

  return (
    <>
      <header className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">LOPOS</Link>

          <nav className="nav-links">
            <Link to="/"         className={`nav-link${location.pathname === "/"         ? " active" : ""}`}>Início</Link>
            <Link to="/produtos" className={`nav-link${location.pathname === "/produtos" ? " active" : ""}`}>Produtos</Link>
            <a href="https://a1e2t3w4.github.io/Empresa/" target="_blank" rel="noopener noreferrer" className="nav-link">Sobre</a>
          </nav>

          <div className="nav-actions">
            {/* Gestão — desktop */}
            <Link to="/gestao" className="btn-gestao">
              <IcoLock />
              <span>Gestão</span>
            </Link>

            {/* Tema — círculo igual ao carrinho */}
            <button
              className="btn-theme"
              onClick={() => setTema(t => t === "dark" ? "light" : "dark")}
              aria-label="Alternar tema"
            >
              <span className="icon-sun"><IcoSun /></span>
              <span className="icon-moon"><IcoMoon /></span>
            </button>

            {/* Carrinho — círculo */}
            <Link to="/carrinho" className="btn-cart" aria-label="Carrinho">
              <IcoCart />
              {totalItens > 0 && <span className="cart-badge">{totalItens}</span>}
            </Link>

            {/* Avatar / Login */}
            {cliente ? (
              <Link to="/perfil" className="nav-avatar" title={cliente.nome}>
                {cliente.foto_url ? <img src={cliente.foto_url} alt={cliente.nome} /> : inicial}
              </Link>
            ) : (
              <Link to="/login" className="btn-login">Entrar</Link>
            )}

            {/* Hamburger */}
            <button
              className="hamburger"
              onClick={() => setDrawerAberto(d => !d)}
              aria-label="Menu"
              aria-expanded={drawerAberto}
            >
              <span className={drawerAberto ? "ham-open" : ""} />
              <span className={drawerAberto ? "ham-open" : ""} />
              <span className={drawerAberto ? "ham-open" : ""} />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {drawerAberto && (
        <div className="mobile-overlay" onClick={() => setDrawerAberto(false)} />
      )}

      {/* Drawer */}
      <aside className={`mobile-drawer${drawerAberto ? " open" : ""}`} aria-hidden={!drawerAberto}>
        <div className="drawer-header">
          <span className="drawer-logo">LOPOS</span>
          <button onClick={() => setDrawerAberto(false)} className="drawer-close" aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Perfil no drawer */}
        {cliente ? (
          <Link to="/perfil" onClick={() => setDrawerAberto(false)} className="drawer-profile">
            <div className="drawer-avatar">
              {cliente.foto_url ? <img src={cliente.foto_url} alt={cliente.nome} /> : inicial}
            </div>
            <div className="drawer-profile-info">
              <div className="drawer-profile-name">{cliente.nome}</div>
              <div className="drawer-profile-email">{cliente.email}</div>
            </div>
            <IcoChevron />
          </Link>
        ) : (
          <div style={{ padding: "12px 14px 4px" }}>
            <Link to="/login" onClick={() => setDrawerAberto(false)} className="drawer-login-btn">
              Entrar na conta
            </Link>
          </div>
        )}

        {/* Links de navegação — com ícones circulares */}
        <nav className="drawer-nav">
          {navItems.map(({ to, label, Icon, badge, accent, external }) => {
            const isActive = !external && location.pathname === to;
            const El = external ? "a" : Link;
            const elProps = external
              ? { href: to, target: "_blank", rel: "noopener noreferrer" }
              : { to };

            return (
              <El
                key={label}
                {...elProps}
                onClick={() => setDrawerAberto(false)}
                className={`drawer-nav-link${isActive ? " active" : ""}${accent ? " accent" : ""}`}
              >
                {/* Ícone circular — mesmo estilo btn-theme / btn-cart */}
                <span className="drawer-nav-icon-wrap">
                  <Icon />
                </span>
                <span className="drawer-nav-label">{label}</span>
                {badge > 0 && <span className="drawer-nav-badge">{badge}</span>}
                <IcoChevron />
              </El>
            );
          })}
        </nav>

        {/* Rodapé — tema */}
        <div className="drawer-footer">
          <div
            className="drawer-theme-toggle"
            onClick={() => setTema(t => t === "dark" ? "light" : "dark")}
          >
            {/* Ícone circular igual à navbar */}
            <div className="drawer-theme-icon">
              {tema === "dark" ? <IcoMoon /> : <IcoSun />}
            </div>
            <span className="drawer-theme-label">
              {tema === "dark" ? "Tema escuro" : "Tema claro"}
            </span>
            <div className="drawer-theme-switch">
              <span className={`drawer-theme-knob${tema === "dark" ? " on" : ""}`} />
            </div>
          </div>
          <div className="drawer-copyright">LOPOS © 2026 · Angola 🇦🇴</div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
