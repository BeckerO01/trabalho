// Banco simples em arquivo JSON (data/db.json), salvo de forma atômica.
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(process.env.RADAR_DATA_DIR || "data");
const FILE = path.join(DIR, "db.json");

// dados do Pedro: valem até ele mudar em Configurações
export const PADRAO = { nome: "Pedro Prendim", oferta: "Faço sites profissionais por R$ 497, em até 12x, e entrego em 3 dias.", preco: "R$ 497, em até 12x", prazo: "3 dias" };

const vazio = () => ({
  leads: {},
  buscas: {},
  config: { ...PADRAO, diasFollowup: 3, anthropicKey: "" },
});

let db = vazio();
try {
  db = { ...vazio(), ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
} catch {
  /* primeira execução */
}
for (const [k, v] of Object.entries(PADRAO)) if (!db.config[k]) db.config[k] = v;

let timer = null;
export function salvar() {
  clearTimeout(timer);
  timer = setTimeout(salvarAgora, 200);
}
export function salvarAgora() {
  clearTimeout(timer);
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
  fs.renameSync(tmp, FILE);
}

export default db;
