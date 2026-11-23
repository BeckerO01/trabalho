// Banco de dados SQLite (arquivo radar.db), com backup automático diário.
// Fica fora da pasta do programa (em <sua pasta de usuário>/RadarDeLeads), para que
// baixar uma versão nova nunca apague leads, buscas ou configurações.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// o SQLite embutido do Node avisa que é "experimental": esconde só esse aviso
const emitir = process.emitWarning;
process.emitWarning = (w, ...r) => (String(w).includes("SQLite") ? undefined : emitir.call(process, w, ...r));
let DatabaseSync;
try {
  ({ DatabaseSync } = await import("node:sqlite"));
} catch {
  console.error("\n  Este programa precisa do Node.js 22.13 ou mais novo. Baixe a versão LTS em https://nodejs.org e abra de novo.\n");
  process.exit(1);
}

export const DIR = path.resolve(process.env.RADAR_DATA_DIR || path.join(os.homedir(), "RadarDeLeads"));
export const ARQUIVO = path.join(DIR, "radar.db");
const BACKUPS = path.join(DIR, "backups");
fs.mkdirSync(BACKUPS, { recursive: true });

// dados do Pedro: valem até ele mudar em Configurações
export const PADRAO = { nome: "Pedro Prendim", oferta: "Faço sites profissionais por R$ 497, em até 12x, e entrego em 3 dias.", preco: "R$ 497, em até 12x", prazo: "3 dias", portfolio: "https://pedroprendim.com", instagram: "@pedroprendim", apelido: "Becker" };

const con = new DatabaseSync(ARQUIVO);
con.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY, nome TEXT, etapa TEXT, site_tipo TEXT, telefone TEXT,
    dados TEXT NOT NULL, atualizado_em TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS leads_etapa ON leads(etapa);
  CREATE TABLE IF NOT EXISTS buscas (id TEXT PRIMARY KEY, dados TEXT NOT NULL, criado_em TEXT);
  CREATE TABLE IF NOT EXISTS config (chave TEXT PRIMARY KEY, valor TEXT);
`);

const db = { leads: {}, buscas: {}, config: { ...PADRAO, diasFollowup: 3, anthropicKey: "" } };

function carregar() {
  for (const r of con.prepare("SELECT dados FROM leads").all()) { const l = JSON.parse(r.dados); db.leads[l.id] = l; }
  for (const r of con.prepare("SELECT dados FROM buscas").all()) { const b = JSON.parse(r.dados); db.buscas[b.id] = b; }
  for (const r of con.prepare("SELECT chave, valor FROM config").all()) db.config[r.chave] = JSON.parse(r.valor);
}

// versões anteriores guardavam tudo num db.json: importa uma vez, se o banco estiver vazio
function migrarJson() {
  const vazio = con.prepare("SELECT (SELECT COUNT(*) FROM leads) + (SELECT COUNT(*) FROM buscas) + (SELECT COUNT(*) FROM config) AS n").get().n === 0;
  if (!vazio) return;
  const origem = [path.join(DIR, "db.json"), path.resolve("data", "db.json")].find((f) => fs.existsSync(f));
  if (!origem) return;
  try {
    const j = JSON.parse(fs.readFileSync(origem, "utf8"));
    Object.assign(db.leads, j.leads || {}); Object.assign(db.buscas, j.buscas || {}); Object.assign(db.config, j.config || {});
    salvarAgora();
    fs.renameSync(origem, origem + ".importado");
    console.log(`  Dados importados de ${origem} para o banco ${ARQUIVO}`);
  } catch (e) { console.error("  Não foi possível importar o db.json antigo:", e.message); }
}

const ins = {
  lead: con.prepare("INSERT INTO leads (id, nome, etapa, site_tipo, telefone, dados, atualizado_em) VALUES (?, ?, ?, ?, ?, ?, ?)"),
  busca: con.prepare("INSERT INTO buscas (id, dados, criado_em) VALUES (?, ?, ?)"),
  cfg: con.prepare("INSERT INTO config (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor"),
};

/** Grava o estado inteiro numa transação (simples e seguro para alguns milhares de leads). */
export function salvarAgora() {
  clearTimeout(timer);
  const agora = new Date().toISOString();
  con.exec("BEGIN");
  try {
    con.exec("DELETE FROM leads; DELETE FROM buscas;");
    for (const l of Object.values(db.leads)) ins.lead.run(l.id, l.nome || "", l.etapa || "novo", l.siteTipo || "", l.telefone || "", JSON.stringify(l), agora);
    for (const b of Object.values(db.buscas)) ins.busca.run(b.id, JSON.stringify(b), b.criadoEm || agora);
    for (const [k, v] of Object.entries(db.config)) ins.cfg.run(k, JSON.stringify(v ?? ""));
    con.exec("COMMIT");
  } catch (e) {
    con.exec("ROLLBACK");
    console.error("[banco] falha ao salvar:", e.message);
  }
}

let timer = null;
export function salvar() {
  clearTimeout(timer);
  timer = setTimeout(salvarAgora, 300);
}

/** Copia o banco para backups/radar-AAAA-MM-DD.db (uma vez por dia; guarda os últimos 14). */
export function backupDiario() {
  const nome = `radar-${new Date().toISOString().slice(0, 10)}.db`;
  const alvo = path.join(BACKUPS, nome);
  if (fs.existsSync(alvo)) return;
  try {
    con.exec(`VACUUM INTO '${alvo.replace(/'/g, "''")}'`);
    const antigos = fs.readdirSync(BACKUPS).filter((f) => /^radar-\d{4}-\d{2}-\d{2}\.db$/.test(f)).sort().reverse().slice(14);
    for (const f of antigos) fs.unlinkSync(path.join(BACKUPS, f));
  } catch (e) { console.error("[banco] backup falhou:", e.message); }
}

/** Cópia do banco agora, para o botão "Baixar backup". */
export function copiaDoBanco() {
  const tmp = path.join(BACKUPS, `download-${Date.now()}.db`);
  con.exec(`VACUUM INTO '${tmp.replace(/'/g, "''")}'`);
  const dados = fs.readFileSync(tmp);
  fs.unlinkSync(tmp);
  return dados;
}

carregar();
migrarJson();
for (const [k, v] of Object.entries(PADRAO)) if (!db.config[k]) db.config[k] = v;
backupDiario();
setInterval(backupDiario, 6 * 3600e3).unref();

export default db;
