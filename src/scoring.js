// Classificação de site, WhatsApp e pontuação (funções puras, testáveis).

const HOSTS_SOCIAIS = [
  "instagram.com", "facebook.com", "fb.com", "linktr.ee", "wa.me", "whatsapp.com", "api.whatsapp.com",
  "beacons.ai", "bio.link", "linkme.bio", "linkbio.co", "taplink.cc", "tiktok.com", "ifood.com.br",
  "goo.gl", "g.page", "business.site", "linkedin.com", "youtube.com", "twitter.com", "x.com",
  "booksy.com", "trinks.com", "agendor.com.br", "doctoralia.com.br",
];

export function hostDe(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/** "proprio" = site de verdade; "rede_social" = só Instagram/link na bio/agenda; "nenhum" */
export function tipoDeSite(url) {
  if (!url) return "nenhum";
  const h = hostDe(url);
  if (!h) return "nenhum";
  return HOSTS_SOCIAIS.some((s) => h === s || h.endsWith("." + s)) ? "rede_social" : "proprio";
}

/** Só dígitos, com 55 na frente */
export function normalizarTelefone(tel) {
  let d = String(tel || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("55") && (d.length === 10 || d.length === 11)) d = "55" + d;
  return d;
}

/** Celular brasileiro (55 + DDD + 9xxxx-xxxx) costuma ter WhatsApp */
export function ehCelular(tel) {
  const d = normalizarTelefone(tel);
  return d.length === 13 && d.startsWith("55") && d[4] === "9";
}

export function formatarTelefone(tel) {
  const d = normalizarTelefone(tel).replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel || "";
}

export function pontuar(l) {
  let score = 0;
  const motivos = [];
  const add = (p, t) => {
    score += p;
    motivos.push(`+${p} ${t}`);
  };
  if (l.siteTipo === "nenhum") add(35, "sem site");
  else if (l.siteTipo === "rede_social") add(30, "só tem rede social/link na bio");
  if (l.whatsapp) add(20, "tem WhatsApp");
  else if (l.telefone) add(10, "tem telefone");
  if (l.instagram || l.facebook) add(8, "ativo em rede social");
  if (l.email) add(5, "tem e-mail");
  const n = Number(l.avaliacoes) || 0;
  if (n >= 100) add(15, `${n} avaliações (movimentado)`);
  else if (n >= 30) add(10, `${n} avaliações`);
  else if (n >= 5) add(5, `${n} avaliações`);
  if (Number(l.nota) >= 4.5) add(5, `nota ${l.nota}`);
  if (l.siteTipo === "proprio") motivos.push("já tem site próprio");
  return { score: Math.min(100, score), motivos };
}

export function temperatura(score) {
  if (score >= 60) return "quente";
  if (score >= 40) return "morno";
  return "frio";
}

/** Extrai WhatsApp, e-mails e redes do HTML de um site */
export function extrairContatos(html) {
  const out = { whatsapp: "", emails: [], instagram: "", facebook: "" };
  if (!html) return out;
  const texto = html.replace(/&#64;|&commat;/g, "@").replace(/\\\//g, "/");

  const wa = texto.match(/(?:wa\.me\/|whatsapp\.com\/send\/?\?(?:[^"'\s]*?&(?:amp;)?)?phone=)\+?(\d{10,13})/i);
  if (wa) out.whatsapp = normalizarTelefone(wa[1]);

  const emails = new Set();
  for (const m of texto.matchAll(/(?:mailto:)?([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi)) {
    const e = m[1].toLowerCase();
    if (/\.(png|jpe?g|gif|webp|svg|css|js)$/.test(e)) continue;
    if (/(sentry|wixpress|example|exemplo|domain|seudominio|email\.com$|godaddy|@2x)/.test(e)) continue;
    emails.add(e);
  }
  out.emails = [...emails].slice(0, 3);

  const ig = [...texto.matchAll(/instagram\.com\/([a-z0-9_.]{2,30})/gi)]
    .map((m) => m[1].replace(/\.$/, ""))
    .find((u) => !/^(p|reel|reels|explore|accounts|stories|tv|direct|about|developer|legal)$/i.test(u));
  if (ig) out.instagram = "@" + ig;

  const fb = [...texto.matchAll(/facebook\.com\/([a-z0-9.\-]{3,60})/gi)]
    .map((m) => m[1])
    .find((u) => !/^(sharer|share|tr|plugins|dialog|login|policy|privacy|watch|groups|events|profile\.php|pages|help)/i.test(u));
  if (fb) out.facebook = "facebook.com/" + fb;
  return out;
}
