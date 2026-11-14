// Banco simples em arquivo JSON (data/db.json), salvo de forma atômica.
import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(process.env.RADAR_DATA_DIR || "data");
const FILE = path.join(DIR, "db.json");

const vazio = () => ({
  leads: {},
  buscas: {},
  config: { nome: "", oferta: "", diasFollowup: 3, anthropicKey: "" },
});

let db = vazio();
try {
  db = { ...vazio(), ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
} catch {
  /* primeira execução */
}

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
