const BASE = "https://lojalopos.infinityfreeapp.com/api/produtos.php";

/**
 * Loja — só produtos disponíveis com stock > 0
 */
export const getProdutos = async (categoria = "", busca = "") => {
  try {
    let url = `${BASE}?loja=1`;
    if (categoria) url += `&categoria=${encodeURIComponent(categoria)}`;
    if (busca)     url += `&busca=${encodeURIComponent(busca)}`;
    const res  = await fetch(url);
    const json = await res.json();
    return json.success ? json.data.filter(p => p.nome) : [];
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    return [];
  }
};

/**
 * Painel de gestão — todos os produtos incluindo esgotados
 */
export const getProdutosAdmin = async (categoria = "", busca = "", status = "") => {
  try {
    let url = BASE;
    const params = [];
    if (categoria) params.push(`categoria=${encodeURIComponent(categoria)}`);
    if (busca)     params.push(`busca=${encodeURIComponent(busca)}`);
    if (status)    params.push(`status=${encodeURIComponent(status)}`);
    if (params.length) url += "?" + params.join("&");
    const res  = await fetch(url);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Erro ao carregar produtos (admin):", err);
    return [];
  }
};
