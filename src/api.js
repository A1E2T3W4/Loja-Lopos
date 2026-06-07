 ═══════════════════════════════════════════════════════════
//  src/config/api.js
//  URL base do teu servidor InfinityFree
// ═══════════════════════════════════════════════════════════

const BASE_URL = "https://lojalopos.infinityfreeapp.com";
//                ↑ já está com o teu domínio real

export const API = {
  PRODUTOS:          `${BASE_URL}/api/produtos.php`,
  CLIENTES:          `${BASE_URL}/api/clientes.php`,
  ATUALIZAR_CLIENTE: `${BASE_URL}/api/atualizar_cliente.php`,
  VERIFICAR_CLIENTE: `${BASE_URL}/api/verificar_cliente.php`,
  AUTH:              `${BASE_URL}/api/auth.php`,
  LOGIN_OPERADOR:    `${BASE_URL}/api/login_operador.php`,
  VERIFICAR_EMAIL:   `${BASE_URL}/api/verificar_email.php`,
  PEDIDOS:           `${BASE_URL}/api/pedidos.php`,
  PEDIDOS_QR:        `${BASE_URL}/api/pedidos_qr.php`,
  PEDIDOS_ENTREGADOR:`${BASE_URL}/api/pedidos_entregador.php`,
  ENTREGAS:          `${BASE_URL}/api/entregas.php`,
  HISTORICO:         `${BASE_URL}/api/historico_cliente.php`,
  HISTORICO_PHP:     `${BASE_URL}/api/historico.php`,
  CARTAO:            `${BASE_URL}/api/cartao.php`,
  CARTAO_QR:         `${BASE_URL}/api/cartao_qr.php`,
  CONSULTAR_CARTAO:  `${BASE_URL}/api/consultar_cartao.php`,
  FAVORITOS:         `${BASE_URL}/api/favoritos.php`,
  FINANCEIRO:        `${BASE_URL}/api/financeiro.php`,
  RELATORIO:         `${BASE_URL}/api/relatorio.php`,
  CONFIGURACOES:     `${BASE_URL}/api/configuracoes.php`,
  VENDAS:            `${BASE_URL}/api/vendas.php`,
  RESET_SENHA:       `${BASE_URL}/api/reset_senha.php`,
  UPLOAD_IMAGEM:     `${BASE_URL}/api/upload_imagem.php`,
  VERIFICAR_CLIENTE: `${BASE_URL}/api/verificar_cliente.php`,
};

export default API;