// Pontuação de leads (0–100) e utilitários puros — sem dependência do DOM.

export const NICHOS = {
  barbearia:   { label: "Barbearias",          tags: ['shop="hairdresser"'], valor: 10 },
  salao:       { label: "Salões de beleza",    tags: ['shop="beauty"'], valor: 12 },
  restaurante: { label: "Restaurantes",        tags: ['amenity="restaurant"'], valor: 12 },
  cafe:        { label: "Cafeterias",          tags: ['amenity="cafe"'], valor: 8 },
  padaria:     { label: "Padarias",            tags: ['shop="bakery"'], valor: 8 },
  oficina:     { label: "Oficinas mecânicas",  tags: ['shop="car_repair"'], valor: 15 },
  dentista:    { label: "Dentistas",           tags: ['amenity="dentist"', 'healthcare="dentist"'], valor: 20 },
  clinica:     { label: "Clínicas",            tags: ['amenity="clinic"', 'amenity="doctors"'], valor: 20 },
  academia:    { label: "Academias",           tags: ['leisure="fitness_centre"'], valor: 15 },
  pet:         { label: "Pet shops",           tags: ['shop="pet"'], valor: 12 },
  roupas:      { label: "Lojas de roupas",     tags: ['shop="clothes"'], valor: 10 },
  advogado:    { label: "Advogados",           tags: ['office="lawyer"'], valor: 20 },
  contador:    { label: "Contadores",          tags: ['office="accountant"'], valor: 18 },
  imobiliaria: { label: "Imobiliárias",        tags: ['office="estate_agent"'], valor: 18 },
};

const SITE_TAGS = ["website", "contact:website", "url", "brand:website"];

/** true se o elemento do OSM NÃO tem site cadastrado */
export function semSite(tags = {}) {
  return !SITE_TAGS.some((k) => tags[k]);
}

/** Converte um elemento do Overpass em lead */
export function elementoParaLead(el, nicho, cidade) {
  const t = el.tags || {};
  const rua = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(", ");
  const endereco = [rua, t["addr:suburb"]].filter(Boolean).join(" – ");
  const lead = {
    id: `osm-${el.type}-${el.id}`,
    nome: t.name || "(sem nome)",
    nicho,
    cidade,
    telefone: t.phone || t["contact:phone"] || t["contact:mobile"] || t.mobile || "",
    whatsapp: t["contact:whatsapp"] || "",
    email: t.email || t["contact:email"] || "",
    instagram: t["contact:instagram"] || t.instagram || "",
    facebook: t["contact:facebook"] || t.facebook || "",
    horario: t.opening_hours || "",
    endereco,
    lat: el.lat ?? el.center?.lat,
    lon: el.lon ?? el.center?.lon,
  };
  const { score, motivos } = pontuar(lead);
  return { ...lead, score, motivos };
}

/** Nota 0–100: quanto maior, mais fácil e valioso abordar. */
export function pontuar(lead) {
  let score = 0;
  const motivos = [];
  const add = (pts, txt) => { score += pts; motivos.push(`+${pts} ${txt}`); };

  if (lead.whatsapp) add(30, "tem WhatsApp");
  else if (lead.telefone) add(25, "tem telefone");
  if (lead.instagram || lead.facebook) add(15, "ativo em rede social, mas sem site");
  if (lead.email) add(10, "tem e-mail");
  if (lead.horario) add(10, "horário cadastrado (negócio ativo)");
  if (lead.endereco) add(10, "endereço completo");
  const valor = NICHOS[lead.nicho]?.valor ?? 10;
  add(valor, "valor do nicho");
  if (lead.nome && lead.nome !== "(sem nome)") add(5, "nome identificado");

  score = Math.min(100, score);
  return { score, motivos };
}

export function temperatura(score) {
  if (score >= 65) return { label: "Quente", cls: "hot" };
  if (score >= 40) return { label: "Morno", cls: "warm" };
  return { label: "Frio", cls: "cold" };
}

/** Normaliza telefone brasileiro para link wa.me */
export function numeroWhatsApp(tel) {
  let d = String(tel || "").split(/[;,/]/)[0].replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("55") && d.length <= 11) d = "55" + d;
  return d;
}

/** Monta a query Overpass: negócios do nicho, na bbox, sem site */
export function queryOverpass(nicho, bbox) {
  const [s, w, n, e] = bbox;
  const area = `(${s},${w},${n},${e})`;
  const filtroSemSite = SITE_TAGS.map((k) => `[!"${k}"]`).join("");
  const partes = NICHOS[nicho].tags
    .map((tag) => `nwr[${tag}]["name"]${filtroSemSite}${area};`)
    .join("\n  ");
  return `[out:json][timeout:60];\n(\n  ${partes}\n);\nout center tags 300;`;
}

/** Mensagem de abordagem sem IA (fallback) */
export function mensagemModelo(lead, cfg = {}) {
  const nicho = NICHOS[lead.nicho]?.label.toLowerCase() || "negócios";
  const quem = cfg.nome ? `Aqui é ${cfg.nome}.` : "Tudo bem?";
  const social = lead.instagram || lead.facebook
    ? "Vi que vocês já estão nas redes sociais, mas"
    : "Procurei vocês no Google e";
  return `Olá, ${lead.nome}! ${quem} ${social} não encontrei um site de vocês.\n\n` +
    `Hoje muitos clientes de ${nicho} em ${lead.cidade} pesquisam no Google antes de escolher, ` +
    `e um site simples ajuda a aparecer nessas buscas e passar mais confiança.\n\n` +
    `${cfg.oferta || "Eu crio sites rápidos e acessíveis para negócios locais."} ` +
    `Posso te mostrar um exemplo de como ficaria o de vocês, sem compromisso?`;
}

export function hojeISO(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

export function somarDias(iso, dias) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + dias);
  return hojeISO(d);
}
