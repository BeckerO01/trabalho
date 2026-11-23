// Servidor local: API + arquivos da interface. Rode com `npm start`.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import db, { salvar, salvarAgora } from "./db.js";
import { rodarBusca, TAMANHOS } from "./scraper.js";
import { pontuar, temperatura } from "./scoring.js";
import { mensagemIA, mensagemPronta } from "./ia.js";
import * as auth from "./auth.js";
import { gerarSite, perfil, nomeCurto, palavraMarca, slug, semAcento, RAMO_W, GENERICAS } from "./site/gerador.js";
import * as hostinger from "./hostinger.js";

auth.validarConfig();

const PORT = Number(process.env.PORT) || 8090;
const PUBLIC = path.resolve("public");
const ETAPAS = ["novo", "contatado", "respondeu", "negociando", "fechado", "perdido"];

const hoje = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const somarDias = (n) => new Date(Date.now() + n * 864e5 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);

// ---------- fila de buscas (uma por vez) ----------
let rodando = null;
const cancelar = new Set();

function pontuarLead(l) {
  const { score, motivos } = pontuar(l);
  l.score = score; l.motivos = motivos; l.temperatura = temperatura(score);
  return l;
}

function guardarLead(novo, busca) {
  const antigo = db.leads[novo.id];
  if (antigo) {
    // atualiza dados do Maps/site, preserva o trabalho de vendas
    const { etapa, followup, notas, mensagem, descartado, criadoEm, buscas } = antigo;
    db.leads[novo.id] = pontuarLead({ ...antigo, ...novo, etapa, followup, notas, mensagem, descartado, criadoEm, buscas });
  } else {
    db.leads[novo.id] = pontuarLead({ ...novo, etapa: "novo", followup: "", notas: "", mensagem: "", descartado: false, criadoEm: new Date().toISOString(), buscas: [] });
    busca.novos++;
  }
  const l = db.leads[novo.id];
  if (!l.buscas.includes(busca.id)) l.buscas.push(busca.id);
  if (!busca.leadIds.includes(l.id)) busca.leadIds.push(l.id);
  salvar();
}

async function processarFila() {
  if (rodando) return;
  const prox = Object.values(db.buscas).filter((b) => b.status === "fila").sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))[0];
  if (!prox) return;
  rodando = prox;
  Object.assign(prox, { status: "rodando", iniciadoEm: new Date().toISOString(), erro: "" });
  salvar();
  try {
    await rodarBusca(prox, (p) => { prox.progresso = p; }, (lead) => guardarLead(lead, prox), () => cancelar.has(prox.id));
    prox.status = cancelar.has(prox.id) ? "cancelada" : "concluida";
  } catch (e) {
    console.error("[busca]", e);
    prox.status = "erro";
    prox.erro = /Executable doesn't exist|browserType.launch/i.test(e.message)
      ? "Navegador não instalado. Rode: npx playwright install chromium"
      : e.message.split("\n")[0];
  } finally {
    cancelar.delete(prox.id);
    prox.terminadoEm = new Date().toISOString();
    rodando = null;
    salvarAgora();
    processarFila();
  }
}

// buscas interrompidas quando o servidor caiu voltam para a fila
for (const b of Object.values(db.buscas)) if (b.status === "rodando") b.status = "fila";

// ---------- helpers HTTP ----------
function json(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}
async function corpo(req) {
  let s = "";
  for await (const c of req) { s += c; if (s.length > 25e6) throw new Error("corpo grande demais"); }
  return s ? JSON.parse(s) : {};
}
const resumoBusca = (b) => {
  const ls = b.leadIds.map((id) => db.leads[id]).filter(Boolean);
  return {
    ...b, leadIds: undefined,
    empresas: ls.length,
    comWhatsapp: ls.filter((l) => l.whatsapp).length,
    comEmail: ls.filter((l) => l.email).length,
    semSite: ls.filter((l) => l.siteTipo !== "proprio").length,
  };
};
const configPublica = () => ({ ...db.config, anthropicKey: undefined, hostingerToken: undefined, temHostinger: Boolean(db.config.hostingerToken), dominioSite: db.config.dominioSite || "pedroprendim.com", login: auth.ATIVO, temChave: Boolean(process.env.ANTHROPIC_API_KEY || db.config.anthropicKey) });
// ---------- site de demonstração ----------
// endereço curto: só as palavras que identificam a empresa (sem "clínica", "estética", "de"...)
function subPadrao(lead) {
  const ws = semAcento(nomeCurto(lead)).split(/[^a-z0-9]+/).filter((w) => w && !RAMO_W.test(w) && !GENERICAS.test(w));
  const s = (ws.length ? ws.join("") : slug(lead).replace(/-/g, "")).slice(0, 24);
  return s || "site" + Date.now().toString(36);
}
const cfgHost = () => ({ token: db.config.hostingerToken, dominio: db.config.dominioSite || "pedroprendim.com" });
const publicando = new Set();
function padraoSite(lead) {
  const p = perfil(lead);
  const ant = lead.siteDemo?.respostas || {};
  return {
    dominio: cfgHost().dominio,
    sub: lead.siteDemo?.sub || subPadrao(lead),
    nome: ant.nome || nomeCurto(lead), marca: ant.marca || palavraMarca(lead),
    whatsapp: ant.whatsapp || lead.whatsapp || lead.telefone || "",
    servicos: ant.servicos || p.servicos.slice(0, 6),
    horario: ant.horario || "", sobre: ant.sobre || "",
    cor: ant.cor || "", corPadrao: (() => { const [, , , , pr, ac] = p.paleta; const l = (h) => { const n = parseInt(h.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; }; return l(pr) < 0.12 ? ac : pr; })(),
    ramo: p.termo, publicado: lead.siteDemo?.status === "pronto" ? lead.siteDemo.url : "",
  };
}
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg" };
function decodificarImagens(imagens) {
  // [{campo: "logo"|"foto1".."foto4", dataUrl}] -> arquivos
  return (Array.isArray(imagens) ? imagens : []).slice(0, 5).map((i) => {
    const m = String(i?.dataUrl || "").match(/^data:(image\/(?:jpeg|png|webp|svg\+xml));base64,(.+)$/);
    if (!m || !/^(logo|foto[1-4])$/.test(i.campo)) return null;
    const dados = Buffer.from(m[2], "base64");
    if (dados.length > 4 * 1024 * 1024) return null;
    return { campo: i.campo, caminho: `${i.campo}.${EXT[m[1]]}`, dados, dataUrl: i.dataUrl };
  }).filter(Boolean);
}
function limparRespostas(r = {}, imagens = [], paraPublicar = false) {
  const t = (v, n) => String(v ?? "").slice(0, n);
  const imgs = decodificarImagens(imagens);
  const src = (campo) => { const i = imgs.find((x) => x.campo === campo); return i ? (paraPublicar ? i.caminho : i.dataUrl) : ""; };
  return {
    nome: t(r.nome, 80), marca: t(r.marca, 20), whatsapp: t(r.whatsapp, 20).replace(/\D/g, ""),
    servicos: (Array.isArray(r.servicos) ? r.servicos : String(r.servicos || "").split("\n")).map((x) => t(x, 60).trim()).filter(Boolean).slice(0, 6),
    horario: t(r.horario, 200), sobre: t(r.sobre, 600), cor: /^#[0-9a-f]{6}$/i.test(r.cor || "") ? r.cor : "",
    logo: src("logo"), fotos: ["foto1", "foto2", "foto3", "foto4"].map(src),
  };
}
async function publicarDemo(lead, sub, respostas, imagens) {
  publicando.add(lead.id);
  const r = limparRespostas(respostas, imagens, true);
  lead.siteDemo = { status: "publicando", etapa: "gerando", sub, url: `https://${sub}.${cfgHost().dominio}/`, respostas: { ...r, logo: "", fotos: [] }, inicio: new Date().toISOString() };
  salvar();
  try {
    const { html } = gerarSite(lead, r);
    const arquivos = [{ caminho: "index.html", dados: Buffer.from(html) }, ...decodificarImagens(imagens).map(({ caminho, dados }) => ({ caminho, dados }))];
    const url = await hostinger.publicarSite(cfgHost(), sub, arquivos, (etapa) => { lead.siteDemo.etapa = etapa; });
    Object.assign(lead.siteDemo, { status: "pronto", etapa: "pronto", url, publicadoEm: new Date().toISOString() });
  } catch (e) {
    console.error("[site]", e);
    Object.assign(lead.siteDemo, { status: "erro", erro: e.message });
  } finally {
    publicando.delete(lead.id); salvarAgora();
  }
}
const csvCampo = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

// ---------- rotas ----------
async function api(req, res, url) {
  const [, , recurso, id, acao] = url.pathname.split("/");
  const m = req.method;

  if (recurso === "estado" && m === "GET") {
    return json(res, 200, {
      leads: Object.values(db.leads),
      buscas: Object.values(db.buscas).map(resumoBusca).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
      config: configPublica(), hoje: hoje(),
    });
  }

  if (recurso === "buscas") {
    if (!id && m === "POST") {
      const b = await corpo(req);
      const termos = String(b.termos || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8);
      if (!termos.length || !String(b.cidade || "").trim()) return json(res, 400, { erro: "Informe o que procura e a cidade." });
      const busca = {
        id: crypto.randomUUID().slice(0, 12), termos, cidade: b.cidade.trim(), bairro: String(b.bairro || "").trim(),
        tamanho: TAMANHOS[b.tamanho] ? b.tamanho : "rapida", status: "fila", criadoEm: new Date().toISOString(),
        progresso: { fase: "Na fila", feitos: 0, total: 0 }, leadIds: [], novos: 0,
      };
      db.buscas[busca.id] = busca; salvarAgora(); processarFila();
      return json(res, 201, resumoBusca(busca));
    }
    const busca = db.buscas[id];
    if (!busca) return json(res, 404, { erro: "Busca não encontrada." });
    if (acao === "rodar" && m === "POST") {
      Object.assign(busca, { status: "fila", criadoEm: new Date().toISOString(), novos: 0, progresso: { fase: "Na fila", feitos: 0, total: 0 } });
      salvarAgora(); processarFila(); return json(res, 200, resumoBusca(busca));
    }
    if (acao === "cancelar" && m === "POST") {
      if (busca.status === "fila") busca.status = "cancelada"; else if (busca.status === "rodando") cancelar.add(busca.id);
      salvarAgora(); return json(res, 200, resumoBusca(busca));
    }
    if (acao === "leads" && m === "GET") return json(res, 200, busca.leadIds);
    if (!acao && m === "DELETE") {
      if (busca.status === "rodando") cancelar.add(busca.id);
      for (const l of Object.values(db.leads)) l.buscas = l.buscas.filter((x) => x !== id);
      delete db.buscas[id]; salvarAgora(); return json(res, 200, { ok: true });
    }
  }

  if (recurso === "leads" && id) {
    const lead = db.leads[id];
    if (!lead) return json(res, 404, { erro: "Lead não encontrado." });
    if (!acao && m === "PATCH") {
      const b = await corpo(req);
      if (b.etapa && ETAPAS.includes(b.etapa) && b.etapa !== lead.etapa) {
        lead.etapa = b.etapa;
        if (["contatado", "respondeu", "negociando"].includes(b.etapa) && !("followup" in b)) lead.followup = somarDias(Number(db.config.diasFollowup) || 3);
        if (["fechado", "perdido"].includes(b.etapa)) lead.followup = "";
      }
      for (const k of ["followup", "notas", "mensagem", "descartado", "telefone", "whatsapp", "email", "instagram"]) if (k in b) lead[k] = b[k];
      pontuarLead(lead); salvar(); return json(res, 200, lead);
    }
    if (!acao && m === "DELETE") { delete db.leads[id]; salvar(); return json(res, 200, { ok: true }); }
    if (acao === "mensagem" && m === "POST") {
      try { return json(res, 200, await mensagemIA(lead, db.config)); }
      catch (e) { console.warn("[ia]", e.message); return json(res, 200, { texto: mensagemPronta(lead, db.config), fonte: "modelo", aviso: "IA indisponível: " + (e.status || e.message) }); }
    }
  }

  if (recurso === "config") {
    if (m === "GET") return json(res, 200, configPublica());
    if (m === "PUT") {
      const b = await corpo(req);
      for (const k of ["nome", "oferta"]) if (k in b) db.config[k] = String(b[k]).slice(0, 500);
      if ("diasFollowup" in b) db.config.diasFollowup = Math.min(60, Math.max(1, Number(b.diasFollowup) || 3));
      if (b.anthropicKey) db.config.anthropicKey = String(b.anthropicKey).trim();
      if (b.removerChave) db.config.anthropicKey = "";
      if (b.hostingerToken) db.config.hostingerToken = String(b.hostingerToken).trim();
      if (b.removerHostinger) db.config.hostingerToken = "";
      if ("dominioSite" in b) db.config.dominioSite = String(b.dominioSite).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "") || "pedroprendim.com";
      salvarAgora(); return json(res, 200, configPublica());
    }
  }

  if (recurso === "hostinger" && id === "testar" && m === "POST") {
    if (!db.config.hostingerToken) return json(res, 400, { erro: "Cole o token da Hostinger primeiro." });
    try { return json(res, 200, await hostinger.testarConexao(cfgHost())); }
    catch (e) { return json(res, 400, { erro: e.message }); }
  }

  if (recurso === "site" && id) {
    const lead = db.leads[id];
    if (!lead) return json(res, 404, { erro: "Lead não encontrado." });
    if (acao === "padrao" && m === "GET") return json(res, 200, padraoSite(lead));
    if (acao === "previa" && m === "POST") {
      const b = await corpo(req);
      return json(res, 200, { html: gerarSite(lead, limparRespostas(b.respostas, b.imagens)).html });
    }
    if (acao === "publicar" && m === "POST") {
      if (!db.config.hostingerToken) return json(res, 400, { erro: "Configure o token da Hostinger em Configurações." });
      if (publicando.has(id)) return json(res, 409, { erro: "Este site já está sendo publicado." });
      const b = await corpo(req);
      const sub = String(b.respostas?.sub || "").toLowerCase();
      if (!/^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/.test(sub)) return json(res, 400, { erro: "Endereço inválido: use só letras minúsculas e números." });
      publicarDemo(lead, sub, b.respostas || {}, b.imagens || []);
      return json(res, 202, lead.siteDemo);
    }
    if (!acao && m === "GET") return json(res, 200, lead.siteDemo || null);
  }

  if (recurso === "export.json" && m === "GET") {
    // pacote para importar no Radar de Leads do Claude
    const ids = url.searchParams.get("ids");
    const lista = (ids ? ids.split(",").map((i) => db.leads[i]) : Object.values(db.leads)).filter((l) => l && !l.descartado).slice(0, 500);
    const campos = ["id", "nome", "categoria", "endereco", "telefone", "whatsapp", "whatsappFonte", "email", "instagram", "facebook", "site", "siteTipo", "nota", "avaliacoes", "mapsUrl", "score", "motivos", "etapa", "followup", "notas"];
    const cidadeDe = (l) => (String(l.endereco).match(/,\s*([^,\-]+?)\s*-\s*[A-Z]{2}\b/) || [])[1] || "";
    return json(res, 200, {
      formato: "radar-leads", versao: 1, exportadoEm: new Date().toISOString(),
      leads: lista.map((l) => ({ ...Object.fromEntries(campos.map((c) => [c, l[c] ?? null])), cidade: cidadeDe(l) })),
    });
  }

  if (recurso === "export.csv" && m === "GET") {
    const ids = url.searchParams.get("ids");
    const lista = ids ? ids.split(",").map((i) => db.leads[i]).filter(Boolean) : Object.values(db.leads);
    const cols = ["nome", "categoria", "endereco", "telefone", "whatsapp", "email", "instagram", "facebook", "site", "siteTipo", "nota", "avaliacoes", "score", "etapa", "followup", "notas", "mapsUrl"];
    const csv = "﻿" + [cols.join(";"), ...lista.map((l) => cols.map((c) => csvCampo(l[c])).join(";"))].join("\n");
    res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="leads-${hoje()}.csv"` });
    return res.end(csv);
  }

  json(res, 404, { erro: "Rota não encontrada." });
}

const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };
function estatico(req, res, url) {
  const alvo = path.join(PUBLIC, url.pathname === "/" ? "index.html" : path.normalize(url.pathname));
  if (!alvo.startsWith(PUBLIC) || !fs.existsSync(alvo) || fs.statSync(alvo).isDirectory()) { res.writeHead(404); return res.end("Não encontrado"); }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(alvo)] || "application/octet-stream" });
  fs.createReadStream(alvo).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (auth.ATIVO) {
      if (url.pathname === "/api/login" && req.method === "POST") {
        const r = auth.entrar(req, (await corpo(req)).senha);
        if (r.erro) return json(res, r.codigo, { erro: r.erro });
        res.setHeader("Set-Cookie", r.cookie);
        return json(res, 200, { ok: true });
      }
      if (url.pathname === "/api/logout" && req.method === "POST") {
        res.setHeader("Set-Cookie", auth.cookieSair);
        return json(res, 200, { ok: true });
      }
      if (url.pathname === "/login") { url.pathname = "/login.html"; return estatico(req, res, url); }
      if (!auth.logado(req)) {
        if (url.pathname.startsWith("/api/")) return json(res, 401, { erro: "Faça login." });
        res.writeHead(302, { Location: "/login" });
        return res.end();
      }
    }
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    return estatico(req, res, url);
  } catch (e) {
    console.error(e);
    json(res, 500, { erro: e.message });
  }
});

// sem senha: só o próprio computador acessa. Com RADAR_SENHA: aceita acesso de fora, com login.
server.listen(PORT, auth.ATIVO ? "0.0.0.0" : "127.0.0.1", () => {
  console.log(`\n  Radar de Leads rodando em http://localhost:${PORT}${auth.ATIVO ? " (acesso externo com senha)" : ""}\n`);
  processarFila();
});
process.on("SIGINT", () => { salvarAgora(); process.exit(0); });
