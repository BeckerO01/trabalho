import {
  NICHOS, elementoParaLead, temperatura, numeroWhatsApp, queryOverpass,
  mensagemModelo, hojeISO, somarDias,
} from "./scoring.js";

const ETAPAS = [
  { id: "novo", label: "Novo" },
  { id: "contatado", label: "Contatado" },
  { id: "negociando", label: "Negociando" },
  { id: "fechado", label: "Fechado ✅" },
  { id: "perdido", label: "Perdido" },
];
const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- estado (localStorage) ----------
const store = {
  get(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem storage */ } },
};
let leads = store.get("radar.leads", []);
let cfg = store.get("radar.cfg", { nome: "", oferta: "", dias: 3, key: "" });
let resultados = [];
const salvar = () => { store.set("radar.leads", leads); renderContadores(); };

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

// ---------- navegação ----------
function mostrar(view) {
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
  if (view === "funil") renderKanban();
  if (view === "followups") renderFollowups();
}
document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => mostrar(b.dataset.view)));

// ---------- busca ----------
$("#nicho").innerHTML = Object.entries(NICHOS).map(([k, n]) => `<option value="${k}">${n.label}</option>`).join("");
$("#cidade").value = store.get("radar.ultimaCidade", "");

async function geocodificar(cidade) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(cidade)}`;
  const r = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
  if (!r.ok) throw new Error("Falha ao localizar a cidade.");
  const [hit] = await r.json();
  if (!hit) throw new Error("Cidade não encontrada. Tente \"Cidade, UF\".");
  const [s, n, w, e] = hit.boundingbox.map(Number);
  return { bbox: [s, w, n, e], nome: hit.display_name.split(",")[0] };
}

async function overpass(query) {
  let ultimoErro;
  for (const url of OVERPASS) {
    try {
      const r = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(query) });
      if (r.ok) return (await r.json()).elements || [];
      ultimoErro = new Error(`Servidor de mapas respondeu ${r.status}.`);
    } catch (e) { ultimoErro = e; }
  }
  throw ultimoErro || new Error("Servidor de mapas indisponível.");
}

$("#formBusca").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const cidade = $("#cidade").value.trim();
  const nicho = $("#nicho").value;
  store.set("radar.ultimaCidade", cidade);
  const st = $("#statusBusca");
  const btn = ev.submitter; btn.disabled = true;
  $("#resultados").innerHTML = ""; $("#resultsHead").classList.add("hidden");
  try {
    st.textContent = "📍 Localizando cidade…";
    const geo = await geocodificar(cidade);
    st.textContent = `🗺️ Procurando ${NICHOS[nicho].label.toLowerCase()} sem site em ${geo.nome}…`;
    const els = await overpass(queryOverpass(nicho, geo.bbox));
    resultados = els.filter((e) => e.tags?.name).map((e) => elementoParaLead(e, nicho, geo.nome))
      .sort((a, b) => b.score - a.score);
    st.textContent = resultados.length ? "" : "Nenhum negócio sem site encontrado. Tente outro nicho ou cidade.";
    renderResultados();
  } catch (e) {
    st.textContent = "⚠️ " + e.message;
  } finally { btn.disabled = false; }
});
$("#soContato").addEventListener("change", renderResultados);

function cardResultado(l) {
  const temp = temperatura(l.score);
  const noFunil = leads.some((x) => x.id === l.id);
  return `<article class="lead">
    <div class="head"><h4>${esc(l.nome)}</h4><span class="score ${temp.cls}" title="${esc(l.motivos.join("\n"))}">${l.score} · ${temp.label}</span></div>
    <div class="meta">${l.endereco ? "📍 " + esc(l.endereco) + "<br>" : ""}
      ${l.telefone ? "📞 " + esc(l.telefone) + "<br>" : ""}
      ${l.instagram ? "📸 " + esc(l.instagram) + "<br>" : ""}
      ${l.horario ? "🕒 " + esc(l.horario) : ""}</div>
    <div class="why">${esc(l.motivos.slice(0, 3).join(" · "))}</div>
    <div class="foot">
      <a class="btn ghost" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(l.nome + " " + l.cidade)}">Conferir no Google ↗</a>
      <button class="btn ${noFunil ? "" : "primary"}" data-add="${esc(l.id)}" ${noFunil ? "disabled" : ""}>${noFunil ? "No funil" : "+ Funil"}</button>
    </div></article>`;
}

function filtrados() {
  return $("#soContato").checked ? resultados.filter((l) => l.telefone || l.whatsapp) : resultados;
}

function renderResultados() {
  const lista = filtrados();
  $("#resultsHead").classList.toggle("hidden", !resultados.length);
  $("#resultsInfo").textContent = `${lista.length} de ${resultados.length} negócios sem site`;
  $("#resultados").innerHTML = lista.map(cardResultado).join("");
}

function adicionar(l) {
  if (leads.some((x) => x.id === l.id)) return false;
  leads.push({ ...l, etapa: "novo", notas: "", mensagem: "", followup: "", criadoEm: hojeISO() });
  return true;
}
$("#resultados").addEventListener("click", (ev) => {
  const id = ev.target.closest("[data-add]")?.dataset.add;
  if (!id) return;
  adicionar(resultados.find((r) => r.id === id)); salvar(); renderResultados(); toast("Lead adicionado ao funil");
});
$("#addTodos").addEventListener("click", () => {
  const n = filtrados().filter((l) => l.score >= 65).filter(adicionar).length;
  salvar(); renderResultados(); toast(n ? `${n} leads quentes adicionados` : "Nenhum lead quente novo");
});

// ---------- funil (kanban) ----------
function renderKanban() {
  const f = $("#filtroFunil").value.toLowerCase();
  const hoje = hojeISO();
  const vis = leads.filter((l) => !f || `${l.nome} ${l.cidade}`.toLowerCase().includes(f));
  $("#kanban").innerHTML = ETAPAS.map((et) => {
    const items = vis.filter((l) => l.etapa === et.id).sort((a, b) => b.score - a.score);
    return `<div class="col" data-etapa="${et.id}"><h3>${et.label}<span class="pill">${items.length}</span></h3>
      ${items.map((l) => {
        const temp = temperatura(l.score);
        const atrasado = l.followup && l.followup <= hoje && !["fechado", "perdido"].includes(l.etapa);
        return `<div class="kcard" draggable="true" data-id="${esc(l.id)}">
          <div class="t">${esc(l.nome)}</div>
          <div class="s"><span class="score ${temp.cls}">${l.score}</span>${esc(NICHOS[l.nicho]?.label || "")} · ${esc(l.cidade)}
          ${l.followup ? `<span class="${atrasado ? "due" : ""}">⏰ ${l.followup.split("-").reverse().join("/")}</span>` : ""}</div></div>`;
      }).join("")}</div>`;
  }).join("");
}
$("#filtroFunil").addEventListener("input", renderKanban);

let arrastando = null;
$("#kanban").addEventListener("dragstart", (e) => { arrastando = e.target.closest(".kcard")?.dataset.id; });
$("#kanban").addEventListener("dragover", (e) => { const c = e.target.closest(".col"); if (c) { e.preventDefault(); c.classList.add("over"); } });
$("#kanban").addEventListener("dragleave", (e) => e.target.closest(".col")?.classList.remove("over"));
$("#kanban").addEventListener("drop", (e) => {
  const col = e.target.closest(".col"); if (!col || !arrastando) return;
  e.preventDefault(); moverEtapa(leads.find((l) => l.id === arrastando), col.dataset.etapa);
  arrastando = null; salvar(); renderKanban();
});
$("#kanban").addEventListener("click", (e) => { const id = e.target.closest(".kcard")?.dataset.id; if (id) abrirLead(id); });

/** Regras automáticas de follow-up ao mudar de etapa */
function moverEtapa(lead, etapa) {
  if (!lead || lead.etapa === etapa) return;
  lead.etapa = etapa;
  if (etapa === "contatado" || etapa === "negociando") lead.followup = somarDias(hojeISO(), Number(cfg.dias) || 3);
  if (etapa === "fechado" || etapa === "perdido") lead.followup = "";
}

$("#novoManual").addEventListener("click", () => {
  const nome = prompt("Nome do negócio:"); if (!nome) return;
  const telefone = prompt("Telefone/WhatsApp (opcional):") || "";
  const l = { id: "man-" + Date.now(), nome, telefone, whatsapp: "", email: "", instagram: "", facebook: "", horario: "",
    endereco: "", nicho: $("#nicho").value, cidade: $("#cidade").value || "", score: telefone ? 50 : 25, motivos: ["cadastro manual"] };
  adicionar(l); salvar(); renderKanban(); abrirLead(l.id);
});

$("#exportCsv").addEventListener("click", () => {
  const cols = ["nome", "nicho", "cidade", "telefone", "email", "instagram", "endereco", "score", "etapa", "followup", "notas"];
  const csv = [cols.join(";"), ...leads.map((l) => cols.map((c) => `"${String(l[c] ?? "").replace(/"/g, '""')}"`).join(";"))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
  a.download = `leads-${hojeISO()}.csv`; a.click();
});

// ---------- follow-ups ----------
function pendentes() {
  const hoje = hojeISO();
  return leads.filter((l) => l.followup && l.followup <= hoje && !["fechado", "perdido"].includes(l.etapa));
}
function renderFollowups() {
  const hoje = hojeISO();
  const ativos = leads.filter((l) => l.followup && !["fechado", "perdido"].includes(l.etapa))
    .sort((a, b) => a.followup.localeCompare(b.followup));
  $("#listaFollow").innerHTML = ativos.length ? ativos.map((l) => `
    <div class="follow-item">
      <div><strong>${esc(l.nome)}</strong> <span class="muted">· ${esc(ETAPAS.find((e) => e.id === l.etapa)?.label)}</span><br>
      <span class="${l.followup <= hoje ? "due" : "muted"}">⏰ ${l.followup < hoje ? "Atrasado desde" : l.followup === hoje ? "Hoje" : "Em"} ${l.followup.split("-").reverse().join("/")}</span></div>
      <div class="actions"><button class="btn" data-adiar="${esc(l.id)}">Adiar 2 dias</button><button class="btn primary" data-abrir="${esc(l.id)}">Abrir</button></div>
    </div>`).join("") : `<p class="muted">Nenhum follow-up agendado. Mova leads para "Contatado" para agendar automaticamente.</p>`;
}
$("#listaFollow").addEventListener("click", (e) => {
  const ab = e.target.dataset.abrir, ad = e.target.dataset.adiar;
  if (ab) abrirLead(ab);
  if (ad) { const l = leads.find((x) => x.id === ad); l.followup = somarDias(hojeISO(), 2); salvar(); renderFollowups(); }
});

function renderContadores() {
  $("#countFunil").textContent = leads.length;
  const n = pendentes().length;
  $("#countFollow").textContent = n || "";
  $("#countFollow").toggleAttribute("data-zero", !n);
}

// ---------- modal do lead ----------
let atual = null;
$("#mEtapa").innerHTML = ETAPAS.map((e) => `<option value="${e.id}">${e.label}</option>`).join("");

function abrirLead(id) {
  atual = leads.find((l) => l.id === id); if (!atual) return;
  const temp = temperatura(atual.score);
  $("#mNome").textContent = atual.nome;
  $("#mInfo").innerHTML = `<span><span class="score ${temp.cls}">${atual.score} · ${temp.label}</span> ${esc(NICHOS[atual.nicho]?.label || "")} · ${esc(atual.cidade)}</span>
    ${atual.telefone ? `<span>📞 ${esc(atual.telefone)}</span>` : ""}${atual.email ? `<span>✉️ ${esc(atual.email)}</span>` : ""}
    ${atual.instagram ? `<span>📸 ${esc(atual.instagram)}</span>` : ""}${atual.endereco ? `<span>📍 ${esc(atual.endereco)}</span>` : ""}
    <span class="why">${esc((atual.motivos || []).join(" · "))}</span>`;
  $("#mEtapa").value = atual.etapa;
  $("#mFollow").value = atual.followup || "";
  $("#mNotas").value = atual.notas || "";
  $("#mMsg").value = atual.mensagem || "";
  atualizarWhats();
  $("#modal").showModal();
}
function atualizarWhats() {
  const num = numeroWhatsApp(atual?.whatsapp || atual?.telefone);
  const a = $("#mWhats");
  a.classList.toggle("disabled", !num);
  a.href = num ? `https://wa.me/${num}?text=${encodeURIComponent($("#mMsg").value)}` : "#";
}
$("#mMsg").addEventListener("input", atualizarWhats);
$("#mEtapa").addEventListener("change", () => {
  const antes = atual.followup; moverEtapa(atual, $("#mEtapa").value);
  if (atual.followup !== antes) $("#mFollow").value = atual.followup;
});
$("#mSalvar").addEventListener("click", () => {
  Object.assign(atual, { etapa: $("#mEtapa").value, followup: $("#mFollow").value, notas: $("#mNotas").value, mensagem: $("#mMsg").value });
  salvar(); $("#modal").close(); renderKanban(); renderFollowups(); toast("Lead salvo");
});
$("#mExcluir").addEventListener("click", () => {
  if (!confirm(`Excluir ${atual.nome}?`)) return;
  leads = leads.filter((l) => l !== atual); salvar(); $("#modal").close(); renderKanban(); renderFollowups();
});
$("#mCopiar").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText($("#mMsg").value); toast("Mensagem copiada"); } catch { toast("Não foi possível copiar"); }
});
// Ao abrir o WhatsApp, marca como contatado e agenda follow-up
$("#mWhats").addEventListener("click", () => {
  if (atual.etapa === "novo") { $("#mEtapa").value = "contatado"; moverEtapa(atual, "contatado"); $("#mFollow").value = atual.followup; }
  atual.mensagem = $("#mMsg").value; salvar();
});

$("#mGerar").addEventListener("click", async () => {
  const btn = $("#mGerar"); btn.disabled = true; btn.textContent = "✨ Gerando…";
  try {
    $("#mMsg").value = cfg.key ? await mensagemIA(atual) : mensagemModelo(atual, cfg);
    if (!cfg.key) toast("Modelo pronto usado — adicione a chave Claude nas Configurações para IA");
  } catch (e) {
    console.error(e);
    $("#mMsg").value = mensagemModelo(atual, cfg);
    toast("IA indisponível (" + (e.status || e.message) + "). Usei o modelo pronto.");
  } finally { btn.disabled = false; btn.textContent = "✨ Gerar mensagem"; atualizarWhats(); }
});

// ---------- IA (Claude) ----------
let clientePromise = null;
async function cliente() {
  if (!clientePromise || clientePromise.key !== cfg.key) {
    const p = import("https://esm.sh/@anthropic-ai/sdk@1.2.0").then(({ default: Anthropic }) =>
      new Anthropic({ apiKey: cfg.key, dangerouslyAllowBrowser: true }));
    p.key = cfg.key; clientePromise = p;
  }
  return clientePromise;
}

async function mensagemIA(lead) {
  const client = await cliente();
  const dados = {
    negocio: lead.nome, nicho: NICHOS[lead.nicho]?.label, cidade: lead.cidade,
    tem_instagram_ou_facebook: Boolean(lead.instagram || lead.facebook),
    horario: lead.horario || null, bairro_endereco: lead.endereco || null, anotacoes: lead.notas || null,
  };
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system:
      "Você escreve a primeira mensagem de WhatsApp de um profissional que cria sites para um negócio local brasileiro que ainda não tem site. " +
      "Escreva em português do Brasil, tom cordial e direto, no máximo 90 palavras, sem emojis em excesso, sem prometer resultados exagerados. " +
      "Personalize com o nicho e a cidade, mostre um benefício concreto para esse tipo de negócio e termine com uma pergunta simples. " +
      "Responda apenas com o texto da mensagem.",
    messages: [{
      role: "user",
      content: `Remetente: ${cfg.nome || "(sem nome)"}\nOferta: ${cfg.oferta || "criação de sites para negócios locais"}\nDados do negócio: ${JSON.stringify(dados)}`,
    }],
  });
  if (response.stop_reason === "refusal") throw new Error("pedido recusado");
  const texto = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  if (!texto) throw new Error("resposta vazia");
  return texto;
}

// ---------- configurações ----------
$("#cfgNome").value = cfg.nome; $("#cfgOferta").value = cfg.oferta; $("#cfgDias").value = cfg.dias; $("#cfgKey").value = cfg.key;
$("#formConfig").addEventListener("submit", (e) => {
  e.preventDefault();
  cfg = { nome: $("#cfgNome").value.trim(), oferta: $("#cfgOferta").value.trim(), dias: Number($("#cfgDias").value) || 3, key: $("#cfgKey").value.trim() };
  store.set("radar.cfg", cfg); toast("Configurações salvas");
});

// ---------- lembretes ----------
renderContadores();
const p = pendentes();
if (p.length) {
  toast(`⏰ ${p.length} follow-up(s) para hoje`);
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Radar de Leads", { body: `${p.length} lead(s) aguardando retorno hoje.` });
  }
}
if ("Notification" in window && Notification.permission === "default") {
  document.addEventListener("click", () => Notification.requestPermission().catch(() => {}), { once: true });
}
