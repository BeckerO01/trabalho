// Interface do Radar de Leads (SPA sem dependências).
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ETAPAS = [["novo", "Novo"], ["contatado", "Sem resposta"], ["respondeu", "Respondeu"], ["negociando", "Negociando"], ["fechado", "Fechado"], ["perdido", "Perdido"]];
const nomeEtapa = (e) => ETAPAS.find((x) => x[0] === e)?.[1] || e;
const SUGESTOES = ["clínicas odontológicas", "clínicas de estética", "academias", "escritórios de advocacia", "escritórios de contabilidade",
  "imobiliárias", "pet shops", "salões de beleza", "barbearias", "restaurantes", "oficinas mecânicas", "lojas de material de construção",
  "psicólogos", "fisioterapia", "autoescolas", "escolas de idiomas", "óticas", "clínicas veterinárias", "nutricionistas", "hamburguerias"];
const TAMANHOS = [["rapida", "Rápida", "~20", "2 min"], ["padrao", "Padrão", "60", "5–10 min"], ["completa", "Completa", "até 120", "10–15 min"], ["cidade", "Cidade inteira", "até 400", "30–60 min"]];

let S = { leads: [], buscas: [], config: {}, hoje: "" };
const porId = () => Object.fromEntries(S.leads.map((l) => [l.id, l]));

// ---------- API ----------
async function api(metodo, url, body) {
  const r = await fetch("/api/" + url, { method: metodo, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401) { location.href = "/login"; throw new Error("Faça login."); }
  if (!r.ok) throw new Error(j.erro || "Erro " + r.status);
  return j;
}
async function atualizar() { S = await api("GET", "estado"); badges(); }

function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2600); }
const br = (iso) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");
const dataHora = (iso) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const tel = (d) => { d = String(d || "").replace(/^55/, ""); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d; };
const local = (end) => { const m = String(end || "").match(/-\s*([^,\-]+),\s*([^,\-]+?)\s*-\s*([A-Z]{2})/); return m ? [m[1].trim(), `${m[2]} - ${m[3]}`] : [end ? end.split(",").slice(-2, -1)[0]?.trim() || "" : "", ""]; };
const score = (l) => `<span class="score ${l.temperatura}" title="${esc((l.motivos || []).join("\n"))}">${l.score}</span>`;
const pendentes = () => S.leads.filter((l) => l.followup && l.followup <= S.hoje && !["fechado", "perdido"].includes(l.etapa) && !l.descartado);
const pctFmt = (a, b) => (b ? Math.round((a / b) * 100) + "%" : "–");

// ícones
const SVG = {
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  site: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
};
function canais(l) {
  const site = l.siteTipo === "proprio" ? ["on", "Site: " + l.site] : l.siteTipo === "rede_social" ? ["social", "Sem site próprio (só rede social)"] : ["sem", "Sem site"];
  return `<span class="canais">
    <span class="ic wa ${l.whatsapp ? "on" : ""}" title="${l.whatsapp ? "WhatsApp: " + tel(l.whatsapp) : "Sem WhatsApp"}">${SVG.wa}</span>
    <span class="ic mail ${l.email ? "on" : ""}" title="${esc(l.email || "Sem e-mail")}">${SVG.mail}</span>
    <span class="ic site ${site[0]}" title="${esc(site[1])}">${SVG.site}</span>
    <span class="ic ig ${l.instagram ? "on" : ""}" title="${esc(l.instagram || "Sem Instagram")}">${SVG.ig}</span></span>`;
}

function badges() {
  $("#bLeads").textContent = S.leads.length || "";
  $("#bBuscas").textContent = S.buscas.filter((b) => b.status === "rodando" || b.status === "fila").length || "";
  $("#bFollow").textContent = pendentes().length || "";
}

// ---------- tabela de leads (com filtros) ----------
const filtro = { texto: "", etapa: "", categoria: "", semSite: false, wa: false, nota4: false, ocultarDesc: true, ordem: "score" };
function tabelaLeads(lista, idTabela) {
  const cats = [...new Set(lista.map((l) => l.categoria).filter(Boolean))].sort();
  const t = filtro.texto.toLowerCase();
  const vis = lista.filter((l) =>
    (!t || `${l.nome} ${l.endereco} ${l.telefone} ${l.categoria}`.toLowerCase().includes(t)) &&
    (!filtro.etapa || l.etapa === filtro.etapa) && (!filtro.categoria || l.categoria === filtro.categoria) &&
    (!filtro.semSite || l.siteTipo !== "proprio") && (!filtro.wa || l.whatsapp) && (!filtro.nota4 || l.nota >= 4) &&
    (!filtro.ocultarDesc || !l.descartado))
    .sort((a, b) => filtro.ordem === "nota" ? (b.nota || 0) - (a.nota || 0) || (b.avaliacoes || 0) - (a.avaliacoes || 0) : b.score - a.score);
  const chip = (k, txt) => `<button class="chip" data-chip="${k}" aria-pressed="${filtro[k]}">${txt}</button>`;
  return `<div class="filtros">
      <input type="search" id="f-texto-${idTabela}" data-f="texto" placeholder="Filtrar por nome, bairro, telefone…" value="${esc(filtro.texto)}">
      <select data-f="etapa" aria-label="Etapa"><option value="">Todos os status</option>${ETAPAS.map(([v, n]) => `<option value="${v}" ${filtro.etapa === v ? "selected" : ""}>${n}</option>`).join("")}</select>
      <select data-f="categoria" aria-label="Categoria"><option value="">Todas as categorias</option>${cats.map((c) => `<option ${filtro.categoria === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
      ${chip("semSite", "Sem site")} ${chip("wa", "Com WhatsApp")} ${chip("nota4", "★ 4+")} ${chip("ocultarDesc", "Ocultar descartados")}
      <span class="spacer"></span><a class="btn sm" href="/api/export.csv?ids=${vis.map((l) => l.id).join(",")}">CSV</a>
      <button class="btn sm primary" data-enviar="${vis.filter((l) => !l.descartado).map((l) => l.id).join(",")}">Enviar ${vis.filter((l) => !l.descartado).length} ao Claude</button>
    </div>
    ${vis.length ? `<div class="table-wrap"><table>
      <thead><tr><th>Empresa</th><th>Local</th><th>Telefone</th><th>Canais</th><th><button data-ordem="nota">Nota ${filtro.ordem === "nota" ? "↓" : ""}</button></th><th><button data-ordem="score">Score ${filtro.ordem === "score" ? "↓" : ""}</button></th><th>Status</th></tr></thead>
      <tbody>${vis.map((l) => { const [bairro, cid] = local(l.endereco); return `<tr data-lead="${l.id}" class="${l.descartado ? "descartado" : ""}">
        <td><div class="nome">${esc(l.nome)}${l.siteDemo?.status === "pronto" ? ' <span class="site-pill">● site no ar</span>' : ""}</div><div class="sub">${esc(l.categoria)}${l.siteTipo !== "proprio" ? ` · <span class="tag-sem">${l.siteTipo === "rede_social" ? "só rede social" : "sem site"}</span>` : ""}</div></td>
        <td><div>${esc(bairro)}</div><div class="sub">${esc(cid)}</div></td>
        <td class="num">${esc(tel(l.telefone)) || "–"}</td><td>${canais(l)}</td>
        <td class="num">${l.nota ? `★ ${String(l.nota).replace(".", ",")} <span class="muted">(${(l.avaliacoes || 0).toLocaleString("pt-BR")})</span>` : "–"}</td>
        <td>${score(l)}</td><td>${l.descartado ? '<span class="muted">Descartado</span>' : nomeEtapa(l.etapa)}</td></tr>`; }).join("")}</tbody></table></div>`
      : `<div class="card vazio"><h3>Nenhum lead com esses filtros</h3><p>Tire algum filtro ou rode uma nova busca.</p></div>`}`;
}
document.addEventListener("input", (e) => { const k = e.target.dataset?.f; if (k) { filtro[k] = e.target.value; render(); } });
document.addEventListener("change", (e) => { const k = e.target.dataset?.f; if (k && e.target.tagName === "SELECT") { filtro[k] = e.target.value; render(); } });
document.addEventListener("click", (e) => {
  const c = e.target.closest("[data-chip]"); if (c) { filtro[c.dataset.chip] = !filtro[c.dataset.chip]; render(); return; }
  const o = e.target.closest("[data-ordem]"); if (o) { filtro.ordem = o.dataset.ordem; render(); return; }
  const r = e.target.closest("[data-lead]"); if (r) abrirLead(r.dataset.lead);
});

// ---------- views ----------
const views = {
  inicio() {
    const L = S.leads.filter((l) => !l.descartado);
    const h = new Date().getHours();
    const sauda = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    const semSite = L.filter((l) => l.siteTipo !== "proprio");
    const pend = pendentes();
    const max = Math.max(1, ...ETAPAS.map(([e]) => L.filter((l) => l.etapa === e).length));
    return ["Início", `<div class="page-h"><div><h1>${sauda}${S.config.nome ? ", " + esc(S.config.nome) : ""}!</h1><p>Seu resumo de prospecção.</p></div></div>
      <div class="stats">
        <div class="stat"><div class="k">Leads na base</div><div class="v">${L.length}</div><div class="d">${S.buscas.length} buscas</div></div>
        <div class="stat"><div class="k">Com WhatsApp</div><div class="v">${L.filter((l) => l.whatsapp).length}</div><div class="d">${pctFmt(L.filter((l) => l.whatsapp).length, L.length)} da base</div></div>
        <div class="stat destaque"><div class="k">Sem site</div><div class="v">${semSite.length}</div><div class="d">oportunidades para vender site</div></div>
        <div class="stat"><div class="k">Retornos para hoje</div><div class="v">${pend.length}</div><div class="d">follow-ups vencidos</div></div>
      </div>
      <div class="grid2">
        <div class="card"><h2>Funil de vendas</h2><div class="bars">${ETAPAS.map(([e, n]) => { const q = L.filter((l) => l.etapa === e).length; return `<div class="bar"><span>${n}</span><span class="tr"><i style="width:${(q / max) * 100}%"></i></span><span class="num">${q}</span></div>`; }).join("")}</div></div>
        <div class="card"><h2>Melhores leads sem site</h2><div class="lista">${semSite.filter((l) => l.etapa === "novo").sort((a, b) => b.score - a.score).slice(0, 6).map((l) => `<div class="it" data-lead="${l.id}" style="cursor:pointer"><span><b>${esc(l.nome)}</b><br><span class="muted">${esc(l.categoria)}</span></span>${score(l)}</div>`).join("") || '<p class="muted">Rode uma busca para ver oportunidades aqui.</p>'}</div></div>
      </div>
      <div class="card" style="margin-top:16px"><h2>Buscas recentes</h2><div class="lista">${S.buscas.slice(0, 5).map((b) => `<a href="#busca/${b.id}"><span><b>${esc(b.termos.join(", "))}</b><br><span class="muted">${esc(b.cidade)} · ${dataHora(b.criadoEm)}</span></span><span class="pill ${b.status}">${statusTxt(b)}</span></a>`).join("") || '<p class="muted">Nenhuma busca ainda. <a href="#nova">Faça a primeira.</a></p>'}</div></div>`];
  },

  nova() {
    const ultima = S.buscas[0];
    return ["Prospecção / <b>Nova busca</b>", `<div class="page-h"><div><h1>Nova busca</h1><p>Encontre empresas no Google Maps com telefone, WhatsApp, e-mail e redes sociais.</p></div></div>
      <div class="grid2"><form class="card form" id="formBusca">
        <label class="f">O que você procura?<input id="termos" name="termos" required placeholder="escritórios de advocacia, clínicas de estética"></label>
        <p class="muted" style="margin:-8px 0 0;font-size:12px">Pode colocar mais de um, separados por vírgula. Escreva do jeito que um cliente buscaria no Google.</p>
        <div class="chips">${SUGESTOES.map((s) => `<button type="button" class="chip" data-sug="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join("")}</div>
        <div class="row2"><label class="f">Cidade<input id="cidade" name="cidade" required placeholder="Curitiba - PR" value="${esc(ultima?.cidade || "")}"></label>
        <label class="f">Bairro <span class="muted" style="font-weight:400">(opcional)</span><input id="bairro" name="bairro" placeholder="ex.: Centro, Batel"></label></div>
        <div><p class="f" style="font-size:12px;font-weight:600;color:var(--muted);margin:0 0 6px">Tamanho da busca</p>
        <div class="tamanhos" role="radiogroup">${TAMANHOS.map(([v, n, q, t], i) => `<button type="button" class="tam" role="radio" data-tam="${v}" aria-checked="${i === 0}"><b>${n}</b><span>${q}</span><small>empresas · ${t}</small></button>`).join("")}</div></div>
        <div><button class="btn primary" type="submit">Buscar empresas</button></div>
      </form>
      <div class="card"><h2>Como funciona</h2><ol class="passos">
        <li><span class="n">1</span><span><b>Busca no Google Maps</b><span class="muted">Nome, telefone, endereço, nota e avaliações de cada empresa.</span></span></li>
        <li><span class="n">2</span><span><b>Visita os sites</b><span class="muted">Procura WhatsApp, e-mail e redes sociais, inclusive na página de contato.</span></span></li>
        <li><span class="n">3</span><span><b>Marca quem não tem site</b><span class="muted">Instagram ou link na bio no lugar do site também conta como "sem site próprio".</span></span></li>
        <li><span class="n">4</span><span><b>Organiza no seu funil</b><span class="muted">Leads repetidos não duplicam; seu histórico de contato é mantido.</span></span></li>
      </ol><p class="muted" style="margin:16px 0 0;font-size:12px">As buscas rodam uma de cada vez, em segundo plano. Você pode continuar usando o app enquanto isso.</p></div></div>`];
  },

  buscas() {
    return ["Prospecção / <b>Buscas</b>", `<div class="page-h"><div><h1>Buscas</h1><p>Histórico de todas as buscas, da mais recente para a mais antiga.</p></div><a class="btn primary" href="#nova">+ Nova busca</a></div>
      ${S.buscas.length ? `<div class="table-wrap"><table><thead><tr><th>Busca</th><th>Local</th><th>Tamanho</th><th>Quando</th><th>Situação</th><th>Empresas</th><th>WhatsApp</th><th>E-mail</th><th>Sem site</th></tr></thead><tbody>
      ${S.buscas.map((b) => `<tr data-busca="${b.id}"><td><div class="nome">${esc(b.termos.join(", "))}</div>${b.novos ? `<div class="sub">${b.novos} novos na base</div>` : ""}</td>
        <td>${esc([b.bairro, b.cidade].filter(Boolean).join(", "))}</td><td>${TAMANHOS.find((t) => t[0] === b.tamanho)?.[1]}</td><td class="num">${dataHora(b.criadoEm)}</td>
        <td>${statusCel(b)}</td><td class="num">${b.empresas || "–"}</td><td class="num">${b.empresas ? `${b.comWhatsapp} <span class="muted">${pctFmt(b.comWhatsapp, b.empresas)}</span>` : "–"}</td>
        <td class="num">${b.empresas ? `${b.comEmail} <span class="muted">${pctFmt(b.comEmail, b.empresas)}</span>` : "–"}</td><td class="num">${b.empresas ? b.semSite : "–"}</td></tr>`).join("")}
      </tbody></table></div>` : `<div class="card vazio"><h3>Nenhuma busca ainda</h3><p>Escolha um ramo e uma cidade para encontrar empresas no Google Maps.</p><a class="btn primary" href="#nova">Fazer a primeira busca</a></div>`}`];
  },

  busca(id) {
    const b = S.buscas.find((x) => x.id === id);
    if (!b) return ["Buscas", `<div class="card vazio"><h3>Busca não encontrada</h3><a class="btn" href="#buscas">Ver buscas</a></div>`];
    const mapa = porId();
    const lista = (views.busca.ids?.[id] || []).map((i) => mapa[i]).filter(Boolean);
    const ativa = b.status === "rodando" || b.status === "fila";
    return [`<a href="#buscas">Buscas</a> / <b>${esc(b.termos.join(", "))}</b>`, `<div class="page-h"><div>
        <p>${statusCel(b)} <span class="muted">${TAMANHOS.find((t) => t[0] === b.tamanho)?.[1]} · ${dataHora(b.criadoEm)}</span></p>
        <h1>${esc(b.termos.join(", "))}</h1><p>⌖ ${esc([b.bairro, b.cidade].filter(Boolean).join(", "))}</p></div>
        <div class="acoes"><a class="btn" href="/api/export.csv?ids=${lista.map((l) => l.id).join(",")}">Exportar</a>
        ${ativa ? `<button class="btn" data-acao-busca="cancelar">Cancelar</button>` : `<button class="btn" data-acao-busca="rodar">Rodar de novo</button>`}
        <button class="btn danger" data-acao-busca="excluir">Excluir</button></div></div>
      ${b.erro ? `<div class="card" style="border-color:var(--danger);color:var(--danger);margin-bottom:16px">${esc(b.erro)}</div>` : ""}
      <div class="stats">
        <div class="stat"><div class="k">Empresas</div><div class="v">${b.empresas}</div><div class="d">${b.novos} novas na base</div></div>
        <div class="stat"><div class="k">Com WhatsApp</div><div class="v">${b.comWhatsapp}</div><div class="d">${pctFmt(b.comWhatsapp, b.empresas)}</div></div>
        <div class="stat"><div class="k">Com e-mail</div><div class="v">${b.comEmail}</div><div class="d">${pctFmt(b.comEmail, b.empresas)}</div></div>
        <div class="stat destaque"><div class="k">Sem site</div><div class="v">${b.semSite}</div><div class="d">oportunidade para quem vende site</div></div>
      </div>
      ${lista.length || !ativa ? tabelaLeads(lista, "busca") : `<div class="card vazio"><h3>${esc(b.progresso?.fase || "Na fila")}</h3><p>As empresas aparecem aqui conforme são encontradas.</p></div>`}`];
  },

  leads() {
    return ["Prospecção / <b>Leads</b>", `<div class="page-h"><div><h1>Leads</h1><p>Todas as empresas encontradas, sem repetição.</p></div></div>${S.leads.length ? tabelaLeads(S.leads, "leads") : `<div class="card vazio"><h3>Nenhum lead ainda</h3><p>As empresas que suas buscas encontrarem aparecem aqui.</p><a class="btn primary" href="#nova">Nova busca</a></div>`}`];
  },

  funil() {
    const L = S.leads.filter((l) => !l.descartado);
    return ["Prospecção / <b>Funil de vendas</b>", `<div class="page-h"><div><h1>Funil de vendas</h1><p>Arraste os cards entre as etapas. Ao marcar Contatado, o retorno é agendado sozinho.</p></div></div>
      <div class="kanban" id="kanban">${ETAPAS.map(([e, n]) => { const it = L.filter((l) => l.etapa === e).sort((a, b) => b.score - a.score); const vis = e === "novo" ? it.slice(0, 60) : it; return `<div class="col" data-etapa="${e}"><div class="col-h"><span>${n}</span><span class="num">${it.length}</span></div>
        ${vis.map((l) => `<div class="kcard" draggable="true" data-lead="${l.id}"><span class="t">${esc(l.nome)}</span><span class="s">${score(l)} ${l.siteTipo !== "proprio" ? '<span class="tag-sem">sem site</span>' : ""} ${l.followup ? `<span class="${l.followup <= S.hoje ? "due" : ""}">⏰ ${br(l.followup)}</span>` : ""}</span></div>`).join("")}
        ${it.length > vis.length ? `<a class="muted" href="#leads" style="font-size:12px;padding:4px">+ ${it.length - vis.length} em Leads</a>` : ""}</div>`; }).join("")}</div>`];
  },

  followups() {
    const lista = S.leads.filter((l) => l.followup && !["fechado", "perdido"].includes(l.etapa) && !l.descartado).sort((a, b) => a.followup.localeCompare(b.followup));
    return ["<b>Follow-ups</b>", `<div class="page-h"><div><h1>Follow-ups</h1><p>Quem você precisa chamar de novo.</p></div></div>
      ${lista.length ? `<div class="card lista">${lista.map((l) => `<div class="it"><span><b>${esc(l.nome)}</b> <span class="muted">· ${nomeEtapa(l.etapa)}</span><br><span class="${l.followup <= S.hoje ? "due" : "muted"}">⏰ ${l.followup < S.hoje ? "Atrasado desde " + br(l.followup) : l.followup === S.hoje ? "Hoje" : br(l.followup)}</span></span>
        <span class="acoes"><button class="btn sm" data-adiar="${l.id}">Adiar 2 dias</button><button class="btn sm primary" data-lead="${l.id}">Abrir</button></span></div>`).join("")}</div>`
        : `<div class="card vazio"><h3>Nenhum retorno agendado</h3><p>Quando você marca um lead como Contatado, o retorno é agendado para daqui a ${S.config.diasFollowup || 3} dias.</p></div>`}`];
  },

  config() {
    const c = S.config;
    return ["Ajustes / <b>Configurações</b>", `<div class="page-h"><div><h1>Configurações</h1><p>Como suas mensagens de abordagem são escritas.</p></div></div>
      <form class="card form" id="formCfg" style="max-width:640px">
        <label class="f">Seu nome (assina a mensagem)<input name="nome" value="${esc(c.nome)}" placeholder="Pedro"></label>
        <label class="f">O que você oferece<textarea name="oferta" rows="2" placeholder="Sites profissionais a partir de R$ 497, prontos em 7 dias.">${esc(c.oferta)}</textarea></label>
        <label class="f">Dias até o follow-up depois do primeiro contato<input name="diasFollowup" type="number" min="1" max="60" value="${c.diasFollowup || 3}"></label>
        <label class="f">Chave da API Claude (opcional)<input name="anthropicKey" type="password" autocomplete="off" placeholder="${c.temChave ? "Chave salva. Cole outra para trocar." : "sk-ant-…"}"></label>
        <p class="muted" style="margin:-6px 0 0;font-size:12px">${c.temChave ? "Mensagens escritas pelo Claude. " : "Sem chave, o app usa um modelo de mensagem pronto. "}A chave fica só neste computador, em data/db.json.</p>
        <h2 style="margin-top:8px">Hostinger (sites de demonstração)</h2>
        <label class="f">Domínio dos sites<input name="dominioSite" value="${esc(c.dominioSite || "pedroprendim.com")}" placeholder="pedroprendim.com"></label>
        <label class="f">Token da API da Hostinger<input name="hostingerToken" type="password" autocomplete="off" placeholder="${c.temHostinger ? "Token salvo. Cole outro para trocar." : "Crie em hPanel → Perfil → API"}"></label>
        <p class="muted" style="margin:-6px 0 0;font-size:12px">Cada site fica em <b>nomedocliente.${esc(c.dominioSite || "pedroprendim.com")}</b>. O token fica só neste computador, em data/db.json. ${c.temHostinger ? '<button class="btn sm" type="button" id="testHost">Testar conexão</button> <button class="btn sm ghost danger" type="button" id="rmHost">Remover token</button>' : ""}</p>
        <div class="acoes"><button class="btn primary" type="submit">Salvar</button>${c.temChave ? '<button class="btn danger ghost" type="button" id="rmChave">Remover chave</button>' : ""}${c.login ? '<span class="spacer"></span><button class="btn ghost" type="button" id="btnSair">Sair</button>' : ""}</div>
      </form>`];
  },
};
views.busca.ids = {};
const statusTxt = (b) => ({ fila: "Na fila", rodando: "Rodando", concluida: "Concluída", erro: "Erro", cancelada: "Cancelada" }[b.status]);
function statusCel(b) {
  const p = b.progresso || {};
  return `<span class="pill ${b.status}">${statusTxt(b)}</span>${b.status === "rodando" ? `<div class="sub">${esc(p.fase || "")}${p.total ? ` ${p.feitos}/${p.total}` : ""}</div><div class="prog"><i style="width:${p.total ? (p.feitos / p.total) * 100 : 8}%"></i></div>` : ""}`;
}

// ---------- roteador ----------
function rota() { const [v, id] = (location.hash.slice(1) || "inicio").split("/"); return [views[v] ? v : "inicio", id]; }
function render() {
  const [v, id] = rota();
  const foco = document.activeElement, fid = foco?.id, pos = foco?.selectionStart;
  if ((v === "nova" || v === "config") && $("#view").dataset.v === v) return; // não apaga formulário em edição
  const [crumb, html] = views[v](id);
  $("#crumbs").innerHTML = crumb; $("#view").innerHTML = html; $("#view").dataset.v = v;
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("ativo", a.dataset.nav === (v === "busca" ? "buscas" : v)));
  if (fid && $("#" + CSS.escape(fid))) { const el = $("#" + CSS.escape(fid)); el.focus(); try { el.setSelectionRange(pos, pos); } catch {} }
}
async function navegar() {
  $("#view").dataset.v = ""; $("#side").classList.remove("aberto");
  const [v, id] = rota();
  if (v === "busca" && id) views.busca.ids[id] = await api("GET", `buscas/${id}/leads`).catch(() => []);
  render(); window.scrollTo(0, 0);
}
window.addEventListener("hashchange", navegar);
$("#btnMenu").addEventListener("click", () => $("#side").classList.toggle("aberto"));
$("#busca-global").addEventListener("keydown", (e) => { if (e.key === "Enter") { filtro.texto = e.target.value; e.target.value = ""; location.hash = "leads"; navegar(); } });

// ações das views
document.addEventListener("click", async (e) => {
  const sug = e.target.closest("[data-sug]");
  if (sug) { const inp = $("#termos"); const atuais = inp.value.split(",").map((s) => s.trim()).filter(Boolean); const i = atuais.indexOf(sug.dataset.sug);
    i >= 0 ? atuais.splice(i, 1) : atuais.push(sug.dataset.sug); inp.value = atuais.join(", "); sug.setAttribute("aria-pressed", String(i < 0)); return; }
  const tam = e.target.closest("[data-tam]");
  if (tam) { document.querySelectorAll("[data-tam]").forEach((t) => t.setAttribute("aria-checked", String(t === tam))); return; }
  const linhaBusca = e.target.closest("[data-busca]"); if (linhaBusca) { location.hash = "busca/" + linhaBusca.dataset.busca; return; }
  const ab = e.target.closest("[data-acao-busca]");
  if (ab) {
    const id = rota()[1], a = ab.dataset.acaoBusca;
    if (a === "excluir" && !ab.dataset.conf) { ab.dataset.conf = 1; ab.textContent = "Clique de novo para excluir"; return; }
    try {
      if (a === "excluir") { await api("DELETE", `buscas/${id}`); toast("Busca excluída (os leads continuam na base)"); location.hash = "buscas"; }
      else { await api("POST", `buscas/${id}/${a}`); toast(a === "rodar" ? "Busca na fila" : "Cancelando…"); }
      await atualizar(); navegar(); iniciarPolling();
    } catch (err) { toast(err.message); }
    return;
  }
  const env = e.target.closest("[data-enviar]");
  if (env) { enviarAoClaude(env.dataset.enviar); return; }
  const ad = e.target.closest("[data-adiar]");
  if (ad) { const d = new Date(Date.now() + 2 * 864e5); await salvarLead(ad.dataset.adiar, { followup: d.toISOString().slice(0, 10) }); toast("Adiado 2 dias"); }
  if (e.target.id === "btnSair") { await api("POST", "logout").catch(() => {}); location.href = "/login"; return; }
  if (e.target.id === "testHost") { try { const r = await api("POST", "hostinger/testar"); toast(`Conectado à Hostinger (conta ${r.conta}, ${r.subdominios} subdomínios).`); } catch (err) { toast(err.message); } return; }
  if (e.target.id === "rmHost") { S.config = await api("PUT", "config", { removerHostinger: true }); $("#view").dataset.v = ""; render(); toast("Token removido"); return; }
  if (e.target.id === "rmChave") { S.config = await api("PUT", "config", { removerChave: true }); $("#view").dataset.v = ""; render(); toast("Chave removida"); }
});
document.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (e.target.id === "formBusca") {
    const f = new FormData(e.target);
    const tamanho = $("[data-tam][aria-checked=true]")?.dataset.tam || "rapida";
    try { const b = await api("POST", "buscas", { termos: f.get("termos"), cidade: f.get("cidade"), bairro: f.get("bairro"), tamanho });
      await atualizar(); toast("Busca iniciada"); location.hash = "busca/" + b.id; iniciarPolling(); }
    catch (err) { toast(err.message); }
  }
  if (e.target.id === "formCfg") {
    const f = Object.fromEntries(new FormData(e.target));
    if (!f.anthropicKey) delete f.anthropicKey;
    if (!f.hostingerToken) delete f.hostingerToken;
    S.config = await api("PUT", "config", f); $("#view").dataset.v = ""; render(); toast("Configurações salvas");
  }
});

// ---------- enviar ao Radar no Claude ----------
const URL_CLAUDE = "https://claude.ai/artifact/ERs5tuq5h5d897HRbZSsLp";
async function enviarAoClaude(ids) {
  if (!ids) { toast("Nenhum lead para enviar"); return; }
  const pacote = await api("GET", "export.json?ids=" + ids);
  const texto = JSON.stringify(pacote);
  let copiado = false;
  try { await navigator.clipboard.writeText(texto); copiado = true; } catch {}
  // também baixa o arquivo, para quem preferir importar por arquivo (ou pelo celular)
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
  a.download = `radar-leads-${S.hoje}.json`; a.click(); URL.revokeObjectURL(a.href);
  toast(copiado ? `${pacote.leads.length} leads copiados. No Radar do Claude, cole em Importar do PC.` : `${pacote.leads.length} leads salvos em arquivo. No Radar do Claude, use "Escolher arquivo .json".`);
  window.open(URL_CLAUDE, "_blank", "noopener");
}

// funil: arrastar e soltar
let arrastando = null;
document.addEventListener("dragstart", (e) => { arrastando = e.target.closest?.(".kcard")?.dataset.lead; });
document.addEventListener("dragover", (e) => { const c = e.target.closest?.(".col"); if (c && arrastando) { e.preventDefault(); c.classList.add("over"); } });
document.addEventListener("dragleave", (e) => e.target.closest?.(".col")?.classList.remove("over"));
document.addEventListener("drop", async (e) => {
  const c = e.target.closest?.(".col"); if (!c || !arrastando) return; e.preventDefault();
  const id = arrastando; arrastando = null; await salvarLead(id, { etapa: c.dataset.etapa });
});

// ---------- painel do lead ----------
async function salvarLead(id, dados) {
  try { const l = await api("PATCH", `leads/${id}`, dados); S.leads = S.leads.map((x) => (x.id === id ? l : x)); badges(); render(); return l; }
  catch (err) { toast(err.message); }
}
function abrirLead(id) {
  const l = S.leads.find((x) => x.id === id); if (!l) return;
  const d = $("#drawer");
  const siteBox = l.siteTipo === "nenhum" ? `<div class="alerta-site sem">Sem site. Ótima oportunidade para oferecer um.</div>`
    : l.siteTipo === "rede_social" ? `<div class="alerta-site social">Sem site próprio: no Google aparece só <a href="${esc(l.site)}" target="_blank" rel="noopener">${esc(l.site.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40))}</a>.</div>`
    : `<div class="alerta-site tem">Já tem site: <a href="${esc(l.site)}" target="_blank" rel="noopener">${esc(l.site.replace(/^https?:\/\/(www\.)?/, "").slice(0, 50))}</a>${l.siteAcessivel === false ? " (fora do ar ou bloqueado)" : ""}</div>`;
  const waFonte = { site: "link no site", celular: "celular (provável)", link: "link na bio" }[l.whatsappFonte] || "";
  d.innerHTML = `<div class="d-h"><div><h2>${esc(l.nome)}</h2><p class="muted" style="margin:4px 0 0">${esc(l.categoria)}</p></div><button class="btn ghost" id="dFechar" aria-label="Fechar">✕</button></div>
    ${siteBox}
    ${l.siteDemo?.status === "pronto" ? `<div class="alerta-site tem">Site de demonstração: <a href="${esc(l.siteDemo.url)}" target="_blank" rel="noopener">${esc(l.siteDemo.url)}</a></div>` : ""}
    <div class="acoes"><button class="btn primary" data-criar-site="${l.id}">${l.siteDemo?.status === "pronto" ? "Refazer o site de demonstração" : "Criar site de demonstração"}</button></div>
    <dl class="info">
      <dt>Score</dt><dd>${score(l)} <span class="muted" style="font-size:12px">${esc((l.motivos || []).join(" · "))}</span></dd>
      <dt>Telefone</dt><dd class="num">${esc(tel(l.telefone)) || "–"}</dd>
      <dt>WhatsApp</dt><dd>${l.whatsapp ? `<span class="num">${esc(tel(l.whatsapp))}</span> <span class="muted">· ${waFonte}</span>` : "–"}</dd>
      <dt>E-mail</dt><dd>${l.email ? `<a href="mailto:${esc(l.email)}">${esc(l.email)}</a>` : "–"}</dd>
      <dt>Instagram</dt><dd>${l.instagram ? `<a href="https://instagram.com/${esc(l.instagram.replace("@", ""))}" target="_blank" rel="noopener">${esc(l.instagram)}</a>` : "–"}</dd>
      ${l.facebook ? `<dt>Facebook</dt><dd><a href="https://${esc(l.facebook)}" target="_blank" rel="noopener">${esc(l.facebook)}</a></dd>` : ""}
      <dt>Endereço</dt><dd>${esc(l.endereco) || "–"}</dd>
      <dt>Google</dt><dd>${l.nota ? `★ ${String(l.nota).replace(".", ",")} (${(l.avaliacoes || 0).toLocaleString("pt-BR")} avaliações) · ` : ""}<a href="${esc(l.mapsUrl)}" target="_blank" rel="noopener">Ver no Maps ↗</a></dd>
    </dl>
    <div class="row2"><label class="f">Etapa<select id="dEtapa">${ETAPAS.map(([v, n]) => `<option value="${v}" ${l.etapa === v ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      <label class="f">Próximo follow-up<input type="date" id="dFollow" value="${esc(l.followup)}"></label></div>
    <label class="f">Anotações<textarea id="dNotas" rows="2">${esc(l.notas)}</textarea></label>
    <label class="f">Mensagem de abordagem<textarea id="dMsg" rows="7" placeholder="Clique em Escrever mensagem">${esc(l.mensagem)}</textarea></label>
    <div class="acoes"><button class="btn" id="dGerar">✨ Escrever mensagem</button><button class="btn" id="dCopiar">Copiar</button>
      <a class="btn wa" id="dWhats" target="_blank" rel="noopener">Abrir no WhatsApp ↗</a></div>
    <div class="acoes"><button class="btn ghost" id="dDescartar">${l.descartado ? "Restaurar lead" : "Descartar lead"}</button><span class="spacer"></span><button class="btn primary" id="dSalvar">Salvar</button></div>`;
  d.hidden = false;
  const linkWa = () => { const n = l.whatsapp || l.telefone; const a = $("#dWhats"); a.href = n ? `https://wa.me/${n}?text=${encodeURIComponent($("#dMsg").value)}` : "#"; a.setAttribute("aria-disabled", String(!n)); };
  linkWa();
  $("#dMsg").addEventListener("input", linkWa);
  const coletar = () => ({ etapa: $("#dEtapa").value, followup: $("#dFollow").value, notas: $("#dNotas").value, mensagem: $("#dMsg").value });
  $("#dEtapa").addEventListener("change", async () => { const n = await salvarLead(l.id, { etapa: $("#dEtapa").value }); if (n) $("#dFollow").value = n.followup || ""; });
  $("#dFechar").addEventListener("click", () => { d.hidden = true; });
  $("#dSalvar").addEventListener("click", async () => { const { etapa, ...resto } = coletar(); await salvarLead(l.id, { ...resto, etapa }); d.hidden = true; toast("Lead salvo"); });
  $("#dDescartar").addEventListener("click", async () => { await salvarLead(l.id, { descartado: !l.descartado }); d.hidden = true; toast(l.descartado ? "Lead restaurado" : "Lead descartado"); });
  $("#dCopiar").addEventListener("click", async () => { try { await navigator.clipboard.writeText($("#dMsg").value); toast("Mensagem copiada"); } catch { $("#dMsg").select(); } });
  $("#dGerar").addEventListener("click", async (ev) => {
    const b = ev.currentTarget; b.disabled = true; b.textContent = "Escrevendo…";
    try { await salvarLead(l.id, { notas: $("#dNotas").value }); const r = await api("POST", `leads/${l.id}/mensagem`); $("#dMsg").value = r.texto; linkWa();
      if (r.aviso) toast(r.aviso); else if (r.fonte === "modelo") toast("Modelo pronto. Coloque a chave Claude nas Configurações para usar IA."); }
    catch (err) { toast(err.message); } finally { b.disabled = false; b.textContent = "✨ Escrever mensagem"; }
  });
  $("#dWhats").addEventListener("click", () => {
    const dados = coletar();
    if (dados.etapa === "novo") { dados.etapa = "contatado"; delete dados.followup; toast("Marcado como Contatado. Retorno agendado."); }
    setTimeout(() => salvarLead(l.id, dados), 0);
  });
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#drawer").hidden = true; });

// ---------- atualização automática enquanto há busca rodando ----------
let polling = null;
function iniciarPolling() {
  if (polling) return;
  polling = setInterval(async () => {
    await atualizar().catch(() => {});
    const [v, id] = rota();
    if (v === "busca" && id) views.busca.ids[id] = await api("GET", `buscas/${id}/leads`).catch(() => views.busca.ids[id]);
    if (["inicio", "buscas", "busca", "leads"].includes(v)) render();
    if (!S.buscas.some((b) => b.status === "rodando" || b.status === "fila")) { clearInterval(polling); polling = null; render(); }
  }, 2500);
}

(async () => {
  try { await atualizar(); } catch { $("#view").innerHTML = '<div class="card vazio"><h3>Servidor desligado</h3><p>Rode <code>npm start</code> na pasta do projeto.</p></div>'; return; }
  await navegar();
  if (S.buscas.some((b) => b.status === "rodando" || b.status === "fila")) iniciarPolling();
  if (pendentes().length) toast(`⏰ ${pendentes().length} lead(s) esperando retorno`);
})();

// ================= ASSISTENTE: CRIAR SITE DE DEMONSTRAÇÃO =================
const AS = { lead: null, padrao: null, resp: null, imgs: {}, passo: 1, timer: null };
const ETAPAS_PUB = [["gerando", "Montando o site com os dados da empresa"], ["conta", "Conectando à Hostinger"], ["subdominio", "Criando o endereço"], ["arquivos", "Enviando o site"], ["conferindo", "Conferindo se está no ar"]];
const passosAs = (n) => `<div class="passos-as">${["Perguntas", "Confirmar", "Publicando", "Pronto"].map((t, i) => `<span class="${i + 1 === n ? "on" : ""}">${i + 1}. ${t}</span>`).join("")}</div>`;
const fecharAs = () => { clearInterval(AS.timer); $("#siteDlg").close(); };

async function abrirAssistente(id) {
  const l = S.leads.find((x) => x.id === id); if (!l) return;
  if (!S.config.temHostinger) { toast("Configure a Hostinger em Configurações antes de criar sites."); location.hash = "config"; return; }
  AS.lead = l; AS.imgs = {}; AS.resp = null;
  $("#siteCorpo").innerHTML = `<div class="espera"><div class="radar-g"></div><p>Carregando os dados de ${esc(l.nome)}…</p></div>`;
  $("#siteDlg").showModal();
  AS.padrao = await api("GET", `site/${id}/padrao`);
  // se já está publicando, vai direto para a espera
  const st = await api("GET", `site/${id}`).catch(() => null);
  if (st?.status === "publicando") return telaEspera();
  telaPerguntas();
}

function telaPerguntas() {
  const p = AS.padrao, r = AS.resp || p, l = AS.lead;
  $("#siteCorpo").innerHTML = `<form class="as" id="asForm">
    <div class="as-h"><div><h2>Criar site · ${esc(l.nome)}</h2><p>Tudo já vem preenchido com os dados do lead. Mude só o que quiser.</p></div><button type="button" class="btn ghost" data-as="fechar" aria-label="Fechar">✕</button></div>
    ${passosAs(1)}
    ${p.publicado ? `<div class="alerta-site tem">Este lead já tem site no ar: <a href="${esc(p.publicado)}" target="_blank" rel="noopener">${esc(p.publicado)}</a>. Publicar de novo substitui a versão atual.</div>` : ""}
    <label class="pergunta"><b>Quer fazer alguma alteração antes de gerar?</b><small>Se não, é só seguir: o site sai no padrão do ramo (${esc(p.ramo)}).</small></label>
    <label class="pergunta"><b>Endereço do site</b>
      <div class="sub-row"><span>https://</span><input name="sub" value="${esc(r.sub || p.sub)}" maxlength="40" required autocomplete="off"><span>.${esc(p.dominio)}</span></div></label>
    <div class="row2">
      <label class="pergunta"><b>Nome da empresa no site</b><input name="nome" value="${esc(r.nome)}" maxlength="80" required></label>
      <label class="pergunta"><b>Logo em texto (se não tiver imagem)</b><input name="marca" value="${esc(r.marca)}" maxlength="20"></label>
    </div>
    <label class="pergunta"><b>WhatsApp que recebe os contatos do site</b><input name="whatsapp" value="${esc(tel(r.whatsapp))}" inputmode="tel" required></label>
    <label class="pergunta"><b>Serviços que aparecem no site</b><small>Um por linha, até 6. Vieram do ramo: confira se a empresa faz mesmo.</small><textarea name="servicos" rows="6">${esc((r.servicos || []).join("\n"))}</textarea></label>
    <label class="pergunta"><b>Horário de funcionamento</b><small>Opcional. Ex.: "Seg a sex · 9h às 19h" (uma linha por dia ou faixa).</small><textarea name="horario" rows="2" placeholder="Em branco: &quot;horários sob consulta&quot;">${esc(r.horario)}</textarea></label>
    <div class="pergunta"><b>Cor principal</b>
      <div class="cor-row"><input type="color" name="cor" value="${esc(r.cor || p.corPadrao)}"><label class="chip" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" name="corPadrao" ${r.cor ? "" : "checked"} style="width:auto"> Usar a cor padrão do ramo</label></div></div>
    <label class="pergunta"><b>Texto "Quem somos"</b><small>Opcional. Em branco, o gerador escreve um texto a partir do ramo e do bairro.</small><textarea name="sobre" rows="3" maxlength="600">${esc(r.sobre)}</textarea></label>
    <div class="pergunta"><b>Logo e fotos</b><small>Opcional. A logo substitui o nome no topo; as fotos entram nos cartões "Por que a gente". Use fotos reais da empresa (Instagram ou Google).</small>
      <div class="fotos-row">${["logo", "foto1", "foto2", "foto3", "foto4"].map((c) => `<label class="foto-slot ${AS.imgs[c] ? "tem" : ""}" ${AS.imgs[c] ? `style="background-image:url('${AS.imgs[c]}')"` : ""}>${c === "logo" ? "Logo" : "Foto " + c.slice(-1)}<input type="file" accept="image/*" data-img="${c}"></label>`).join("")}</div></div>
    <div class="acoes"><button type="button" class="btn" data-as="previa">Ver prévia</button><span class="spacer"></span><button class="btn primary" type="submit">Continuar →</button></div>
    <iframe class="previa-frame" id="asPrevia" hidden title="Prévia do site" sandbox="allow-scripts"></iframe>
  </form>`;
}

function lerRespostas() {
  const f = new FormData($("#asForm"));
  return { sub: String(f.get("sub") || "").trim().toLowerCase(), nome: f.get("nome"), marca: f.get("marca"), whatsapp: String(f.get("whatsapp") || "").replace(/\D/g, ""),
    servicos: String(f.get("servicos") || "").split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 6), horario: f.get("horario"),
    cor: f.get("corPadrao") ? "" : f.get("cor"), sobre: f.get("sobre") };
}
const imagensEnvio = () => Object.entries(AS.imgs).map(([campo, dataUrl]) => ({ campo, dataUrl }));

// reduz a imagem no navegador (até 1600 px, JPEG) para o site ficar leve
function reduzirImagem(arquivo, max = 1600) {
  return new Promise((ok, erro) => {
    const img = new Image(), url = URL.createObjectURL(arquivo);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      ok(arquivo.type === "image/png" && max <= 600 ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => erro(new Error("Não foi possível ler a imagem."));
    img.src = url;
  });
}

function telaConfirmar() {
  const r = AS.resp, p = AS.padrao, url = `https://${r.sub}.${p.dominio}`;
  $("#siteCorpo").innerHTML = `<div class="as">
    <div class="as-h"><div><h2>Confirmar publicação</h2><p>Confira antes de colocar no ar.</p></div><button type="button" class="btn ghost" data-as="fechar" aria-label="Fechar">✕</button></div>
    ${passosAs(2)}
    <div class="resumo">
      <div>Endereço: <a>${esc(url)}</a></div>
      <div>Empresa: <b>${esc(r.nome)}</b> · WhatsApp ${esc(tel(r.whatsapp))}</div>
      <div>Serviços: ${esc(r.servicos.join(", ") || "padrão do ramo")}</div>
      <div>Horário: ${esc(r.horario || "sob consulta")} · Cor: ${r.cor ? `<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${esc(r.cor)};vertical-align:-1px"></span> ${esc(r.cor)}` : "padrão do ramo"}</div>
      <div>Logo e fotos: ${Object.keys(AS.imgs).length ? Object.keys(AS.imgs).length + " imagem(ns)" : "nenhuma (visual da marca)"}</div>
    </div>
    ${p.publicado && p.publicado.includes(r.sub + ".") ? `<p class="muted">O site atual deste endereço será substituído.</p>` : ""}
    <p><b>Quer mesmo publicar o site agora?</b> Ele fica fora do Google (marcado como prévia).</p>
    <div class="acoes"><button class="btn" data-as="voltar">← Voltar e alterar</button><span class="spacer"></span><button class="btn primary" data-as="publicar">Sim, publicar site</button></div>
  </div>`;
}

function telaEspera() {
  const nome = AS.lead.nome;
  $("#siteCorpo").innerHTML = `<div class="as">${passosAs(3)}<div class="espera">
    <div class="radar-g" aria-hidden="true"></div>
    <div><h2>Criando o site de ${esc(nome)}</h2><p class="muted">Leva menos de um minuto. Pode deixar esta janela aberta.</p></div>
    <ol class="etapas-lista" id="asEtapas">${ETAPAS_PUB.map(([k, t]) => `<li data-e="${k}">${t}</li>`).join("")}</ol>
  </div></div>`;
  clearInterval(AS.timer);
  const tick = async () => {
    const st = await api("GET", `site/${AS.lead.id}`).catch(() => null);
    if (!st) return;
    const i = ETAPAS_PUB.findIndex(([k]) => k === st.etapa);
    document.querySelectorAll("#asEtapas li").forEach((li, j) => { li.className = st.status === "pronto" || j < i ? "feito" : j === i ? "atual" : ""; });
    if (st.status === "pronto") { clearInterval(AS.timer); setTimeout(() => telaPronto(st), 600); atualizar().then(render); }
    if (st.status === "erro") { clearInterval(AS.timer); telaErro(st.erro); }
  };
  tick(); AS.timer = setInterval(tick, 1500);
}

function telaPronto(st) {
  const l = AS.lead, nome = (AS.resp?.nome || l.nome).trim();
  const msg = `Olá, tudo bem? Criei um site de demonstração para a ${nome}: ${st.url}\n\nDá uma olhada e me diz o que achou!`;
  const n = l.whatsapp || l.telefone;
  $("#siteCorpo").innerHTML = `<div class="as">
    <div class="as-h"><div><h2>Site no ar! 🎉</h2><p>Pronto para mandar para ${esc(l.nome)}.</p></div><button type="button" class="btn ghost" data-as="fechar" aria-label="Fechar">✕</button></div>
    ${passosAs(4)}
    <a class="pronto-link" href="${esc(st.url)}" target="_blank" rel="noopener">${esc(st.url)} ↗</a>
    <label class="pergunta"><b>Mensagem pronta</b><textarea id="asMsg" rows="5">${esc(msg)}</textarea></label>
    <div class="acoes">
      <a class="btn wa" id="asWa" target="_blank" rel="noopener" ${n ? "" : 'aria-disabled="true"'}>Enviar no WhatsApp ↗</a>
      <button class="btn" data-as="copiar">Copiar mensagem</button>
      <a class="btn" href="${esc(st.url)}" target="_blank" rel="noopener">Abrir site</a>
      <span class="spacer"></span><button class="btn ghost" data-as="fechar">Fechar</button>
    </div>
  </div>`;
  const link = () => { $("#asWa").href = n ? `https://wa.me/${n}?text=${encodeURIComponent($("#asMsg").value)}` : "#"; };
  link(); $("#asMsg").addEventListener("input", link);
  $("#asWa").addEventListener("click", () => setTimeout(() => salvarLead(l.id, { mensagem: $("#asMsg").value, ...(l.etapa === "novo" ? { etapa: "contatado" } : {}) }), 300));
}

function telaErro(erro) {
  $("#siteCorpo").innerHTML = `<div class="as"><div class="as-h"><div><h2>Não deu para publicar</h2><p>${esc(erro || "Erro desconhecido.")}</p></div><button type="button" class="btn ghost" data-as="fechar" aria-label="Fechar">✕</button></div>
    <div class="acoes"><button class="btn" data-as="voltar">← Voltar</button><span class="spacer"></span><button class="btn primary" data-as="publicar">Tentar de novo</button></div></div>`;
}

$("#siteDlg").addEventListener("change", async (e) => {
  const c = e.target.dataset?.img; if (!c || !e.target.files[0]) return;
  try { AS.imgs[c] = await reduzirImagem(e.target.files[0], c === "logo" ? 600 : 1600); const slot = e.target.closest(".foto-slot"); slot.classList.add("tem"); slot.style.backgroundImage = `url('${AS.imgs[c]}')`; }
  catch (err) { toast(err.message); }
});
$("#siteDlg").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!e.target.reportValidity()) return;
  AS.resp = lerRespostas();
  if (AS.resp.whatsapp.length < 10) { toast("Confira o WhatsApp: precisa ter DDD."); return; }
  if (!/^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/.test(AS.resp.sub)) { toast("Endereço: use só letras minúsculas e números, sem espaços nem acentos."); return; }
  telaConfirmar();
});
$("#siteDlg").addEventListener("click", async (e) => {
  const a = e.target.closest("[data-as]")?.dataset.as; if (!a) return;
  if (a === "fechar") fecharAs();
  if (a === "voltar") telaPerguntas();
  if (a === "copiar") { try { await navigator.clipboard.writeText($("#asMsg").value); toast("Mensagem copiada"); } catch { $("#asMsg").select(); } }
  if (a === "previa") {
    const fr = $("#asPrevia"); fr.hidden = false; fr.srcdoc = '<p style="font:14px system-ui;padding:20px">Gerando prévia…</p>';
    const { html } = await api("POST", `site/${AS.lead.id}/previa`, { respostas: lerRespostas(), imagens: imagensEnvio() });
    fr.srcdoc = html; fr.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  if (a === "publicar") {
    telaEspera();
    try { await api("POST", `site/${AS.lead.id}/publicar`, { respostas: { ...AS.resp, whatsapp: AS.resp.whatsapp }, imagens: imagensEnvio() }); }
    catch (err) { clearInterval(AS.timer); telaErro(err.message); }
  }
});
$("#siteDlg").addEventListener("close", () => clearInterval(AS.timer));
document.addEventListener("click", (e) => { const b = e.target.closest("[data-criar-site]"); if (b) { e.stopPropagation(); abrirAssistente(b.dataset.criarSite); } }, true);
