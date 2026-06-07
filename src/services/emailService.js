import emailjs from "@emailjs/browser";

const SERVICE_1    = "service_dlsnty9";
const PUBLIC_KEY_1 = "7LgFz5fyfWj72WNse";

const SERVICE_2    = "service_lna5xhu";
const PUBLIC_KEY_2 = "_XXFAQKRl3SdbFenM";

const SERVICE_3    = "service_njfyzf5";
const PUBLIC_KEY_3 = "MBrMCfWzR_UdKR6d-";

// ── Helper com log de erro ───────────────────────────────
const enviar = async (service, template, params, publicKey) => {
  try {
    const res = await emailjs.send(service, template, params, publicKey);
    console.log(`✅ Email [${template}] enviado:`, res.status);
    return { success: true };
  } catch (err) {
    console.error(`❌ Erro EmailJS [${template}]:`, err?.text || err?.message || err);
    return { success: false, error: err?.text || err?.message || "Erro desconhecido" };
  }
};

const agora = () => ({
  data: new Date().toLocaleDateString("pt-AO"),
  hora: new Date().toLocaleTimeString("pt-AO"),
});

// ── Cadastro ─────────────────────────────────────────────
export const enviarEmailCadastro = (nome, email) =>
  enviar(SERVICE_1, "template_y48nyn7", {
    nome, email, ...agora(),
  }, PUBLIC_KEY_1);

// ── Login ────────────────────────────────────────────────
export const enviarEmailLogin = (nome, email) =>
  enviar(SERVICE_1, "template_llvsee4", {
    nome, email, ...agora(),
  }, PUBLIC_KEY_1);

// ── Compra ───────────────────────────────────────────────
export const enviarEmailCompra = (nome, email, idPedido, total, endereco, distancia, taxaEntrega) =>
  enviar(SERVICE_2, "template_compra", {
    nome, email,
    id_pedido:    idPedido,
    total,
    endereco,
    distancia,
    taxa_entrega: taxaEntrega,
    ...agora(),
  }, PUBLIC_KEY_2);

// ── Cliente verificado ───────────────────────────────────
export const enviarEmailVerificado = (nome, email, totalCompras) =>
  enviar(SERVICE_2, "template_verificado", {
    nome, email,
    total_compras: totalCompras,
    ...agora(),
  }, PUBLIC_KEY_2);

// ── Código de verificação no cadastro ────────────────────
// PHP devolve: { success, codigo }
// Chama assim: await enviarCodigoVerificacao(email, json.codigo)
export const enviarCodigoVerificacao = (email, codigo) =>
  enviar(SERVICE_3, "template_codigo_cadastro", {
    email, codigo, ...agora(),
  }, PUBLIC_KEY_3);

// ── Código de reset de senha ─────────────────────────────
// PHP devolve: { success, codigo, nome }
// Chama assim: await enviarCodigoReset(json.nome, email, json.codigo)
export const enviarCodigoReset = (nome, email, codigo) =>
  enviar(SERVICE_3, "template_codigo_reset", {
    nome, email, codigo, ...agora(),
  }, PUBLIC_KEY_3);
