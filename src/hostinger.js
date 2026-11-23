// Publicação na Hostinger pela API oficial (token criado em hPanel → Perfil → API).
// Fluxo por site: descobre a conta do domínio base → cria o subdomínio → envia os arquivos (TUS) → confere no ar.
const BASE = "https://developers.hostinger.com";

async function api(token, metodo, caminho, corpo) {
  const r = await fetch(BASE + caminho, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: corpo ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const texto = await r.text();
  let j = {}; try { j = texto ? JSON.parse(texto) : {}; } catch { j = { message: texto.slice(0, 200) }; }
  if (!r.ok) {
    const msg = j.message || j.error || `erro ${r.status}`;
    const e = new Error(r.status === 401 ? "Token da Hostinger inválido ou expirado. Gere outro em hPanel → Perfil → API." : `Hostinger: ${msg}`);
    e.status = r.status; e.dados = j; throw e;
  }
  return j;
}

/** Acha a conta (username) dona do domínio base, ex.: pedroprendim.com */
export async function descobrirConta(token, dominio) {
  const j = await api(token, "GET", `/api/hosting/v1/websites?domain=${encodeURIComponent(dominio)}&per_page=50`);
  const site = (j.data || []).find((w) => w.domain === dominio);
  if (!site) throw new Error(`O domínio ${dominio} não aparece nesta conta da Hostinger.`);
  return site.username;
}

export async function listarSubdominios(token, conta, dominio) {
  const j = await api(token, "GET", `/api/hosting/v1/accounts/${conta}/websites/${dominio}/subdomains`);
  return Array.isArray(j) ? j : j.data || [];
}

/** Cria o subdomínio se ainda não existir. A pasta fica em public_html/<sub>. */
export async function garantirSubdominio(token, conta, dominio, sub) {
  const existe = (await listarSubdominios(token, conta, dominio)).some((s) => s.subdomain === sub);
  if (!existe) await api(token, "POST", `/api/hosting/v1/accounts/${conta}/websites/${dominio}/subdomains`, { subdomain: sub });
  // a criação é assíncrona: espera aparecer na lista
  for (let i = 0; i < 20; i++) {
    if ((await listarSubdominios(token, conta, dominio)).some((s) => s.subdomain === sub)) return existe ? "existia" : "criado";
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("A Hostinger não confirmou o subdomínio a tempo. Tente de novo em alguns minutos.");
}

async function urlEnvio(token, conta, dominio) {
  return api(token, "POST", "/api/hosting/v1/files/upload-urls", { username: conta, domain: dominio });
}

/** Envia um arquivo (Buffer) para public_html/<destino> pelo protocolo TUS */
async function enviarArquivo(chaves, destino, dados) {
  const alvo = `${chaves.url}/${destino.split("/").map(encodeURIComponent).join("/")}?override=true`;
  const h = { "X-Auth": chaves.auth_key, "X-Auth-Rest": chaves.rest_auth_key, "Tus-Resumable": "1.0.0" };
  const c = await fetch(alvo, { method: "POST", headers: { ...h, "Upload-Length": String(dados.length), "Upload-Offset": "0" }, signal: AbortSignal.timeout(30000) });
  if (c.status !== 201) throw new Error(`Falha ao preparar o envio de ${destino} (${c.status}).`);
  const p = await fetch(alvo, { method: "PATCH", headers: { ...h, "Content-Type": "application/offset+octet-stream", "Upload-Offset": "0" }, body: dados, signal: AbortSignal.timeout(120000) });
  if (p.status !== 204 || p.headers.get("upload-offset") !== String(dados.length)) throw new Error(`Envio incompleto de ${destino}.`);
}

/**
 * Publica um site inteiro.
 * @param {{token, dominio}} cfg
 * @param {string} sub subdomínio (só letras e números)
 * @param {{caminho: string, dados: Buffer}[]} arquivos caminhos relativos à pasta do site
 * @param {(etapa: string) => void} etapa
 */
export async function publicarSite({ token, dominio }, sub, arquivos, etapa = () => {}) {
  etapa("conta");
  const conta = await descobrirConta(token, dominio);
  etapa("subdominio");
  await garantirSubdominio(token, conta, dominio, sub);
  etapa("arquivos");
  const chaves = await urlEnvio(token, conta, dominio);
  // index.html por último, para o site só aparecer completo
  const ordem = [...arquivos].sort((a, b) => (a.caminho === "index.html") - (b.caminho === "index.html"));
  for (const a of ordem) await enviarArquivo(chaves, `${sub}/${a.caminho}`, a.dados);
  etapa("conferindo");
  const url = `https://${sub}.${dominio}/`;
  for (let i = 0; i < 12; i++) {
    try { const r = await fetch(url + "?v=" + Date.now(), { signal: AbortSignal.timeout(15000) }); if (r.ok) return url; } catch {}
    await new Promise((r) => setTimeout(r, 5000));
  }
  return url; // publicado; o endereço pode levar alguns minutos para responder
}

export async function testarConexao({ token, dominio }) {
  const conta = await descobrirConta(token, dominio);
  const subs = await listarSubdominios(token, conta, dominio);
  return { conta, subdominios: subs.length };
}

/** Visitas registradas pelo contador.php do site ({v: aberturas, w: cliques no WhatsApp, dias, primeira, ultima}). */
export async function lerVisitas(url, chave) {
  const r = await fetch(`${url.replace(/\/?$/, "/")}contador.php?ler=${encodeURIComponent(chave)}&t=${Date.now()}`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) throw new Error(`contador respondeu ${r.status}`);
  return r.json();
}

/** Apaga o site: a pasta public_html/<sub> (pelo serviço de arquivos) e o subdomínio. */
export async function removerSite({ token, dominio }, sub) {
  if (!/^[a-z0-9-]+$/.test(sub)) throw new Error("subdomínio inválido");
  const conta = await descobrirConta(token, dominio);
  const chaves = await urlEnvio(token, conta, dominio);
  const base = chaves.url.replace(/\/api\/tus\/public_html\/?$/, "/api/resources/public_html");
  const r = await fetch(`${base}/${sub}`, { method: "DELETE", headers: { "X-Auth": chaves.auth_key, "X-Auth-Rest": chaves.rest_auth_key }, signal: AbortSignal.timeout(30000) });
  if (!r.ok && r.status !== 404) throw new Error(`não consegui apagar os arquivos (${r.status})`);
  try { await api(token, "DELETE", `/api/hosting/v1/accounts/${conta}/websites/${dominio}/subdomains/${sub}`); }
  catch (e) { if (e.status !== 404) throw e; }
}
