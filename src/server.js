// Servidor local: API + arquivos da interface. Rode com `npm start`.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import db, { salvar, salvarAgora } from "./db.js";
import { rodarBusca, TAMANHOS } from "./scraper.js";
import { pontuar, temperatura } from "./scoring.js";
import { mensagemIA, mensagemPronta } from "./ia.js";

const PORT = Number(process.env.PORT) || 8090;
const PUBLIC = path.resolve("public");
const ETAPAS = ["novo", "contatado", "negociando", "fechado", "perdido"];

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
  for await (const c of req) { s += c; if (s.length > 1e6) throw new Error("corpo grande demais"); }
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
const configPublica = () => ({ ...db.config, anthropicKey: undefined, temChave: Boolean(process.env.ANTHROPIC_API_KEY || db.config.anthropicKey) });
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
        if (["contatado", "negociando"].includes(b.etapa) && !("followup" in b)) lead.followup = somarDias(Number(db.config.diasFollowup) || 3);
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
      salvarAgora(); return json(res, 200, configPublica());
    }
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
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    return estatico(req, res, url);
  } catch (e) {
    console.error(e);
    json(res, 500, { erro: e.message });
  }
});

// só escuta no próprio computador
server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n  Radar de Leads rodando em http://localhost:${PORT}\n`);
  processarFila();
});
process.on("SIGINT", () => { salvarAgora(); process.exit(0); });
