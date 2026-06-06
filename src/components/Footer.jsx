import { Link } from "react-router-dom";


const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <span className="nav-logo">LOPOS</span>
          <p>
            A sua loja de confiança, com produtos de qualidade e entrega rápida
            em Angola.
          </p>
          <div className="footer-sociais">
            {[
              {
                label: "Facebook",
                hoverColor: "#1877F2",
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                ),
              },
              {
                label: "Instagram",
                hoverColor: "#E1306C",
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                ),
              },
              {
                label: "WhatsApp",
                hoverColor: "#25D366",
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.214a.75.75 0 0 0 .93.899l5.554-1.95A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.211-1.433l-.374-.222-3.876 1.362 1.243-3.763-.245-.389A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                ),
              },
              {
                label: "TikTok",
                hoverColor: "#fff",
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                  </svg>
                ),
              },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="footer-social-btn"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = s.hoverColor)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--fg-muted)")
                }
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h4>Loja</h4>
          <a href="#destaques">Destaques</a>
          <a href="#todos">Catálogo</a>
          <a href="#ofertas">Ofertas</a>
        </div>
        <div className="footer-col">
          <h4>Conta</h4>
          <Link to="/login">Entrar</Link>
          <Link to="/cadastro">Criar conta</Link>
          <Link to="/perfil">O meu perfil</Link>
        </div>
        <div className="footer-col">
          <h4>Ajuda</h4>
          <a href="#">Contacto</a>
          <a href="#">Política de privacidade</a>
          <a href="https://a1e2t3w4.github.io/Empresa/">Empresa</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 LOPOS. Aposte na melhor qualidade de produto e Serviços.</p>
      </div>
    </div>
  </footer>
);

export default Footer;