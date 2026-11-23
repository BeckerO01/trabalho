// Busca no Google Maps com um navegador (Playwright) e visita os sites encontrados.
import { chromium } from "playwright";
import crypto from "node:crypto";
import { tipoDeSite, extrairContatos, normalizarTelefone, ehCelular, hostDe } from "./scoring.js";

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (min, max) => espera(min + Math.random() * (max - min));
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

export const TAMANHOS = { rapida: 20, padrao: 60, completa: 120, cidade: 400 };

async function aceitarCookies(page) {
  const btn = await page.$('form[action*="consent"] button, button[aria-label^="Aceitar"], button[aria-label^="Accept"]');
  if (btn) {
    await btn.click().catch(() => {});
    await espera(2000);
  }
}

/** Lista os links de empresas de uma busca no Maps */
async function listarLugares(page, consulta, limite, cancelado) {
  const url = `https://www.google.com/maps/search/${encodeURIComponent(consulta)}?hl=pt-BR`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await espera(3000);
  await aceitarCookies(page);

  // um único resultado abre direto a página do lugar
  if (page.url().includes("/maps/place/") && !(await page.$('div[role="feed"]'))) return [page.url()];

  const feed = await page.waitForSelector('div[role="feed"]', { timeout: 20000 }).catch(() => null);
  if (!feed) return [];
  let anterior = 0, parado = 0;
  while (!cancelado()) {
    const n = await page.$$eval('div[role="feed"] a[href*="/maps/place/"]', (a) => a.length);
    if (n >= limite) break;
    const fim = await page.$eval('div[role="feed"]', (f) => /chegou ao final|end of the list/i.test(f.innerText)).catch(() => false);
    if (fim) break;
    parado = n === anterior ? parado + 1 : 0;
    if (parado >= 6) break;
    anterior = n;
    await page.$eval('div[role="feed"]', (f) => f.scrollBy(0, f.scrollHeight));
    await jitter(1200, 2000);
  }
  const links = await page.$$eval('div[role="feed"] a[href*="/maps/place/"]', (as) => as.map((a) => a.href));
  return [...new Set(links)].slice(0, limite);
}

/** Lê os dados de uma página de lugar do Maps */
async function lerLugar(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForSelector("h1", { timeout: 15000 }).catch(() => {});
  await espera(1200);
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const label = (s) => (q(s)?.getAttribute("aria-label") || "").replace(/^[^:]+:\s*/, "").trim();
    const telEl = q('[data-item-id^="phone:tel:"]');
    const notaTxt = [...document.querySelectorAll('span[role="img"][aria-label]')]
      .map((e) => e.getAttribute("aria-label")).find((t) => /estrela|star/i.test(t)) || "";
    const avTxt = [...document.querySelectorAll("[aria-label]")]
      .map((e) => e.getAttribute("aria-label")).find((t) => /^[\d.]+\s+(avalia|comentário|review)/i.test(t || "")) || "";
    let avaliacoes = Number((avTxt.match(/^[\d.]+/) || [""])[0].replace(/\./g, "")) || null;
    if (!avaliacoes) {
      const m = (q("div.F7nice")?.innerText || "").match(/\(([\d.]+)\)/);
      if (m) avaliacoes = Number(m[1].replace(/\./g, ""));
    }
    return {
      nome: q("h1")?.textContent?.trim() || "",
      categoria: q('button[jsaction*="category"]')?.textContent?.trim() || "",
      endereco: label('[data-item-id="address"]'),
      telefone: telEl ? telEl.getAttribute("data-item-id").replace("phone:tel:", "") : "",
      site: q('a[data-item-id="authority"]')?.href || "",
      nota: Number((notaTxt.match(/[\d,]+/) || [""])[0].replace(",", ".")) || null,
      avaliacoes,
      fechado: /permanentemente fechado|permanently closed/i.test(document.body.innerText.slice(0, 4000)),
      foto: (q('button[aria-label^="Foto de"] img, button[jsaction*="heroHeaderImage"] img')?.src || "").replace(/=w\d+-h\d+[^&]*$/, "=w1800-h1200-k-no"),
    };
  });
}

/** Baixa o HTML de uma página com timeout */
async function baixar(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "pt-BR" }, signal: AbortSignal.timeout(10000), redirect: "follow" });
    if (!r.ok || !/html/i.test(r.headers.get("content-type") || "")) return "";
    return (await r.text()).slice(0, 1_500_000);
  } catch {
    return "";
  }
}

/** Visita o site (home + página de contato) e junta os contatos */
export async function visitarSite(url) {
  const home = await baixar(url);
  let html = home;
  const contato = home.match(/href=["']([^"']*(?:contato|contact|fale-conosco|atendimento)[^"']*)["']/i);
  if (contato) {
    try {
      const u = new URL(contato[1], url);
      if (hostDe(u.href) === hostDe(url)) html += await baixar(u.href);
    } catch {}
  }
  return { ...extrairContatos(html), acessivel: Boolean(home) };
}

/** Junta dados do Maps + site num lead */
export async function montarLead(base, mapsUrl) {
  const siteTipo = tipoDeSite(base.site);
  const lead = {
    id: "g" + crypto.createHash("sha1").update((mapsUrl.match(/!1s([^!]+)/)?.[1]) || base.nome + base.endereco).digest("hex").slice(0, 16),
    nome: base.nome, categoria: base.categoria, endereco: base.endereco,
    telefone: normalizarTelefone(base.telefone), whatsapp: "", whatsappFonte: "",
    email: "", instagram: "", facebook: "",
    site: base.site, siteTipo, siteAcessivel: null,
    nota: base.nota, avaliacoes: base.avaliacoes, mapsUrl: mapsUrl.split("?")[0],
    foto: /^https:\/\/lh\d\.googleusercontent\.com\//.test(base.foto || "") ? base.foto : "",
  };
  if (siteTipo === "rede_social") {
    const c = extrairContatos(base.site);
    Object.assign(lead, { instagram: c.instagram, facebook: c.facebook });
    if (c.whatsapp) Object.assign(lead, { whatsapp: c.whatsapp, whatsappFonte: "link" });
  } else if (siteTipo === "proprio") {
    return lead; // já tem site próprio: fora do foco, não vale visitar
  }
  if (!lead.whatsapp && ehCelular(lead.telefone)) Object.assign(lead, { whatsapp: lead.telefone, whatsappFonte: "celular" });
  return lead;
}

/**
 * Roda uma busca completa.
 * @param {{termos: string[], cidade: string, bairro?: string, tamanho: string}} busca
 * @param {(p: object) => void} progresso
 * @param {(lead: object) => void} aoEncontrar
 * @param {() => boolean} cancelado
 */
export async function rodarBusca(busca, progresso, aoEncontrar, cancelado = () => false) {
  const total = TAMANHOS[busca.tamanho] || TAMANHOS.rapida;
  const porTermo = Math.max(5, Math.ceil(total / busca.termos.length));
  const browser = await chromium.launch({ headless: process.env.RADAR_HEADFUL !== "1" });
  try {
    const ctx = await browser.newContext({ locale: "pt-BR", userAgent: UA, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const links = [];
    for (const termo of busca.termos) {
      if (cancelado()) return;
      const onde = [busca.bairro, busca.cidade].filter(Boolean).join(", ");
      progresso({ fase: `Buscando "${termo}" no Google Maps…`, feitos: 0, total: 0 });
      const achados = await listarLugares(page, `${termo} em ${onde}`, porTermo, cancelado);
      for (const u of achados) if (!links.some((x) => x.u === u)) links.push({ u, termo });
    }
    let feitos = 0;
    for (const { u } of links) {
      if (cancelado()) return;
      progresso({ fase: "Lendo empresas e visitando sites…", feitos, total: links.length });
      try {
        const base = await lerLugar(page, u);
        if (base.nome && !base.fechado) aoEncontrar(await montarLead(base, u));
      } catch (e) {
        console.warn("[busca] falhou em", u.slice(0, 80), e.message);
      }
      feitos++;
      await jitter(600, 1400);
    }
    progresso({ fase: "Concluída", feitos, total: links.length });
  } finally {
    await browser.close();
  }
}
