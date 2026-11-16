// Login por senha (só é ligado quando RADAR_SENHA está definida, para uso em servidor).
import crypto from "node:crypto";

export const SENHA = process.env.RADAR_SENHA || "";
export const ATIVO = Boolean(SENHA);
const DIAS = 30;
const chave = crypto.createHash("sha256").update("radar-sessao:" + SENHA).digest();
const assinar = (exp) => crypto.createHmac("sha256", chave).update(String(exp)).digest("hex");
const iguais = (a, b) => {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
};

export function validarConfig() {
  if (ATIVO && (SENHA.length < 8 || /troque/i.test(SENHA))) {
    console.error("RADAR_SENHA precisa ter pelo menos 8 caracteres e não pode ser a senha de exemplo.");
    process.exit(1);
  }
}

export function logado(req) {
  if (!ATIVO) return true;
  const m = (req.headers.cookie || "").match(/(?:^|;\s*)radar=(\d+)\.([a-f0-9]{64})/);
  if (!m) return false;
  return Number(m[1]) > Date.now() && iguais(m[2], assinar(m[1]));
}

// no máximo 10 tentativas erradas por IP a cada 15 minutos
const tentativas = new Map();
export function entrar(req, senha) {
  const ip = req.socket.remoteAddress || "?";
  const agora = Date.now();
  const t = tentativas.get(ip);
  if (t && agora - t.inicio < 15 * 60e3 && t.n >= 10) return { erro: "Muitas tentativas. Espere 15 minutos.", codigo: 429 };
  if (!iguais(senha || "", SENHA)) {
    if (!t || agora - t.inicio >= 15 * 60e3) tentativas.set(ip, { inicio: agora, n: 1 });
    else t.n++;
    return { erro: "Senha incorreta.", codigo: 401 };
  }
  tentativas.delete(ip);
  const exp = agora + DIAS * 864e5;
  return { cookie: `radar=${exp}.${assinar(exp)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${DIAS * 86400}` };
}

export const cookieSair = "radar=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
