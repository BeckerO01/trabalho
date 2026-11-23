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
const filtro = { texto: "", etapa: "", categoria: "", semSite: true, wa: false, nota4: false, ocultarDesc: true, naoContatados: false, ordem: "score" };
function tabelaLeads(lista, idTabela) {
  const cats = [...new Set(lista.map((l) => l.categoria).filter(Boolean))].sort();
  const t = filtro.texto.toLowerCase();
  const vis = lista.filter((l) =>
    (!t || `${l.nome} ${l.endereco} ${l.telefone} ${l.categoria}`.toLowerCase().includes(t)) &&
    (!filtro.etapa || l.etapa === filtro.etapa) && (!filtro.categoria || l.categoria === filtro.categoria) &&
    (!filtro.semSite || l.siteTipo !== "proprio") && (!filtro.wa || l.whatsapp) && (!filtro.nota4 || l.nota >= 4) && (!filtro.naoContatados || l.etapa === "novo") &&
    (!filtro.ocultarDesc || !l.descartado))
    .sort((a, b) => filtro.ordem === "nota" ? (b.nota || 0) - (a.nota || 0) || (b.avaliacoes || 0) - (a.avaliacoes || 0) : b.score - a.score);
  const chip = (k, txt) => `<button class="chip" data-chip="${k}" aria-pressed="${filtro[k]}">${txt}</button>`;
  return `<div class="filtros">
      <input type="search" id="f-texto-${idTabela}" data-f="texto" placeholder="Filtrar por nome, bairro, telefone…" value="${esc(filtro.texto)}">
      <select data-f="etapa" aria-label="Etapa"><option value="">Todos os status</option>${ETAPAS.map(([v, n]) => `<option value="${v}" ${filtro.etapa === v ? "selected" : ""}>${n}</option>`).join("")}</select>
      <select data-f="categoria" aria-label="Categoria"><option value="">Todas as categorias</option>${cats.map((c) => `<option ${filtro.categoria === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
      ${chip("naoContatados", "Não contatados")} ${chip("semSite", "Sem site")} ${chip("wa", "Com WhatsApp")} ${chip("nota4", "★ 4+")} ${chip("ocultarDesc", "Ocultar descartados")}
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
        <div class="stat"><div class="k">Empresas</div><div class="v">${b.empresas}</div><div class="d">${b.novos} novas na base${b.ignorados ? ` · ${b.ignorados} com site próprio ignoradas` : ""}</div></div>
        <div class="stat"><div class="k">Com WhatsApp</div><div class="v">${b.comWhatsapp}</div><div class="d">${pctFmt(b.comWhatsapp, b.empresas)}</div></div>
        <div class="stat"><div class="k">Com e-mail</div><div class="v">${b.comEmail}</div><div class="d">${pctFmt(b.comEmail, b.empresas)}</div></div>
        <div class="stat destaque"><div class="k">Sem site</div><div class="v">${b.semSite}</div><div class="d">${lista.filter((l) => l.etapa !== "novo").length ? `${lista.filter((l) => l.etapa !== "novo").length} você já contatou` : "oportunidade para quem vende site"}</div></div>
      </div>
      ${lista.length || !ativa ? tabelaLeads(lista, "busca") : `<div class="card vazio"><h3>${esc(b.progresso?.fase || "Na fila")}</h3><p>As empresas aparecem aqui conforme são encontradas.</p></div>`}`];
  },

  leads() {
    const cont = S.leads.filter((l) => l.etapa !== "novo").length;
    return ["Prospecção / <b>Leads</b>", `<div class="page-h"><div><h1>Leads</h1><p>Todas as empresas encontradas, sem repetição.${cont ? ` ${cont} já contatados.` : ""}</p></div>
      <div class="acoes"><label class="btn" title="Arquivo gerado no Radar do Claude em Funil → Enviar status ao PC">Importar do Claude<input type="file" accept=".json,application/json" id="impStatus" hidden></label></div></div>${S.leads.length ? tabelaLeads(S.leads, "leads") : `<div class="card vazio"><h3>Nenhum lead ainda</h3><p>As empresas que suas buscas encontrarem aparecem aqui.</p><a class="btn primary" href="#nova">Nova busca</a></div>`}`];
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
        <div class="row2"><label class="f">Preço (entra na resposta "quanto custa?")<input name="preco" value="${esc(c.preco || "")}" placeholder="R$ 497, em até 12x"></label>
        <label class="f">Prazo de entrega<input name="prazo" value="${esc(c.prazo || "")}" placeholder="3 dias"></label></div>
        <label class="f">Link do seu portfólio (vai nas mensagens)<input name="portfolio" value="${esc(c.portfolio || "")}" placeholder="https://pedroprendim.com"></label>
        <label class="f">Seu Instagram (vai nas mensagens)<input name="instagram" value="${esc(c.instagram || "")}" placeholder="@pedroprendim"></label>
        <label class="f">Dias até o follow-up depois do primeiro contato<input name="diasFollowup" type="number" min="1" max="60" value="${c.diasFollowup || 3}"></label>
        <label class="f">Chave da API Claude (opcional)<input name="anthropicKey" type="password" autocomplete="off" placeholder="${c.temChave ? "Chave salva. Cole outra para trocar." : "sk-ant-…"}"></label>
        <p class="muted" style="margin:-6px 0 0;font-size:12px">${c.temChave ? "Mensagens escritas pelo Claude. " : "Sem chave, o app usa um modelo de mensagem pronto. "}A chave fica só neste computador, no banco de dados.</p>
        <h2 style="margin-top:8px">Hostinger (sites de demonstração)</h2>
        <label class="f">Domínio dos sites<input name="dominioSite" value="${esc(c.dominioSite || "pedroprendim.com")}" placeholder="pedroprendim.com"></label>
        <label class="f">Token da API da Hostinger<input name="hostingerToken" type="password" autocomplete="off" placeholder="${c.temHostinger ? "Token salvo. Cole outro para trocar." : "Crie em hPanel → Perfil → API"}"></label>
        <p class="muted" style="margin:-6px 0 0;font-size:12px">Cada site fica em <b>nomedocliente.${esc(c.dominioSite || "pedroprendim.com")}</b>. O token fica só neste computador, no banco de dados. ${c.temHostinger ? '<button class="btn sm" type="button" id="testHost">Testar conexão</button> <button class="btn sm ghost danger" type="button" id="rmHost">Remover token</button>' : ""}</p>
        <h2 style="margin-top:8px">Banco de dados</h2>
        <p class="muted" style="margin:-6px 0 0;font-size:13px">Seus leads ficam em <code>${esc(c.pastaDados || "RadarDeLeads")}</code> (radar.db), com backup automático todo dia na pasta <code>backups</code>. Atualizar o programa não apaga nada.</p>
        <div><a class="btn sm" href="/api/backup">Baixar backup agora</a></div>
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

// ---------- importar status do Radar no Claude ----------
document.addEventListener("change", async (e) => {
  if (e.target.id !== "impStatus" || !e.target.files[0]) return;
  try {
    const dados = JSON.parse(await e.target.files[0].text());
    const r = await api("POST", "status", dados);
    await atualizar(); render();
    toast(`${r.atualizados} atualizados${r.criados ? ` · ${r.criados} novos` : ""} · ${r.contatados} já contatados.`);
  } catch (err) { toast(err instanceof SyntaxError ? "Arquivo inválido." : err.message); }
  e.target.value = "";
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
    <div><p class="lbl">Em que pé está? Toque para mover</p><div class="etapas" id="dEtapas"></div></div>
    <select id="dEtapa" hidden>${ETAPAS.map(([v, n]) => `<option value="${v}" ${l.etapa === v ? "selected" : ""}>${n}</option>`).join("")}</select>
    <label class="f">Próximo follow-up<input type="date" id="dFollow" value="${esc(l.followup)}"></label>
    <label class="f">Anotações<textarea id="dNotas" rows="2">${esc(l.notas)}</textarea></label>
    <div class="bloco"><p class="lbl" id="dCenLbl">Mensagens prontas</p><div class="cenarios" id="dCenarios"></div><p class="hint-s" id="dDica"></p></div>
    <label class="f">Mensagem<textarea id="dMsg" rows="7">${esc(l.mensagem)}</textarea></label>
    <div class="acoes"><button class="btn" id="dGerar">✨ Escrever mensagem</button><button class="btn" id="dCopiar">Copiar</button>
      <a class="btn wa" id="dWhats" target="_blank" rel="noopener">Abrir no WhatsApp ↗</a></div>
    <div class="acoes"><button class="btn ghost" id="dDescartar">${l.descartado ? "Restaurar lead" : "Descartar lead"}</button><span class="spacer"></span><button class="btn primary" id="dSalvar">Salvar</button></div>`;
  d.hidden = false;
  const linkWa = () => { const n = l.whatsapp || l.telefone; const a = $("#dWhats"); a.href = n ? `https://wa.me/${n}?text=${encodeURIComponent($("#dMsg").value)}` : "#"; a.setAttribute("aria-disabled", String(!n)); };
  linkWa();
  $("#dMsg").addEventListener("input", linkWa);
  const coletar = () => ({ etapa: $("#dEtapa").value, followup: $("#dFollow").value, notas: $("#dNotas").value, mensagem: $("#dMsg").value });
  // mensagens prontas da etapa atual
  let MSG = null;
  const desenharEtapa = () => {
    const e = $("#dEtapa").value;
    $("#dEtapas").innerHTML = ETAPAS.map(([v, n]) => `<button type="button" class="etapa-b" data-et="${v}" aria-pressed="${v === e}">${n}</button>`).join("");
    if (!MSG) return;
    $("#dCenLbl").textContent = "Mensagens prontas · " + nomeEtapa(e);
    $("#dCenarios").innerHTML = (MSG.mensagens[e] || []).map((c, i) => `<button type="button" class="cen" data-cen="${i}">${esc(c.nome)}</button>`).join("");
    $("#dDica").textContent = MSG.dicas[e] || "";
  };
  const escolher = (i) => { const c = MSG?.mensagens[$("#dEtapa").value]?.[i]; if (c) { $("#dMsg").value = c.texto; linkWa(); document.querySelectorAll("#dCenarios .cen").forEach((b, k) => b.setAttribute("aria-pressed", String(k === i))); } };
  desenharEtapa();
  api("GET", `leads/${l.id}/mensagens`).then((m) => { MSG = m; desenharEtapa(); if (!$("#dMsg").value.trim()) escolher(0); }).catch(() => {});
  $("#dEtapas").addEventListener("click", async (ev) => {
    const b = ev.target.closest("[data-et]"); if (!b || b.dataset.et === $("#dEtapa").value) return;
    $("#dEtapa").value = b.dataset.et;
    const n = await salvarLead(l.id, { etapa: b.dataset.et }); if (n) { Object.assign(l, n); $("#dFollow").value = n.followup || ""; }
    desenharEtapa(); escolher(0); toast("Movido para " + nomeEtapa(b.dataset.et));
  });
  $("#dCenarios").addEventListener("click", (ev) => { const b = ev.target.closest("[data-cen]"); if (b) escolher(Number(b.dataset.cen)); });
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
// Uma pergunta por vez à esquerda, o site se atualizando ao vivo à direita,
// confirmação, página branca de espera com o nome no centro e a mensagem pronta no fim.
const AS = { lead: null, p: null, r: null, imgs: {}, i: 0, timer: null, previaT: null, inicioEspera: 0 };
const CORES = ["#0f7a5c", "#1d4ed8", "#b91c1c", "#c2410c", "#7c3aed", "#0e7490", "#be185d", "#111827"];
const ETAPAS_PUB = [
  ["gerando", (r) => `Montando as seções com a cara da <b>${esc(r.nome)}</b>`],
  ["conta", () => "Conectando à hospedagem"],
  ["subdominio", (r, p) => `Reservando <b>${esc(r.sub)}.${esc(p.dominio)}</b>`],
  ["arquivos", () => "Enviando o site para o ar"],
  ["conferindo", () => "Conferindo se está tudo certinho"],
];
const corAtual = () => AS.r?.cor || AS.p?.corPadrao || "#0f7a5c";

// ---- perguntas ----
const PASSOS = [
  { id: "inicio" },
  { id: "sub", t: (r) => `Qual vai ser o <em>endereço</em> do site?`, a: "Curto e fácil de digitar. Só letras minúsculas e números.",
    html: (r, p) => `<div class="st-sub"><input class="st-in" name="sub" value="${esc(r.sub)}" maxlength="40" autocomplete="off" spellcheck="false"><small>.${esc(p.dominio)}</small></div>`,
    ok: (f) => /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/.test(f.sub) || "Use só letras minúsculas e números, sem espaços nem acentos." },
  { id: "nome", t: () => `Como a empresa <em>aparece</em> no site?`, a: "O nome completo vai no título; a logo em texto aparece no topo quando não houver imagem.",
    html: (r) => `<label class="st-campo"><span>Nome da empresa</span><input class="st-in" name="nome" value="${esc(r.nome)}" maxlength="80"></label>
      <label class="st-campo"><span>Logo em texto</span><input class="st-in" name="marca" value="${esc(r.marca)}" maxlength="20"></label>`,
    ok: (f) => f.nome.trim().length > 1 || "Escreva o nome da empresa." },
  { id: "whatsapp", t: () => `Para qual <em>WhatsApp</em> vão os contatos do site?`, a: "Todos os botões do site abrem conversa com este número.",
    html: (r) => `<input class="st-in" name="whatsapp" value="${esc(tel(r.whatsapp))}" inputmode="tel" placeholder="(41) 99999-9999">`,
    ok: (f) => f.whatsapp.replace(/\D/g, "").length >= 10 || "Confira o número: precisa ter DDD." },
  { id: "servicos", t: () => `Quais <em>serviços</em> a empresa oferece?`, a: "Um por linha, até 6. Vieram do ramo: tire o que a empresa não faz.",
    html: (r) => `<textarea name="servicos" rows="6">${esc((r.servicos || []).join("\n"))}</textarea>`, area: true },
  { id: "horario", t: () => `Qual o <em>horário</em> de funcionamento?`, a: "Opcional. Em branco, o site diz \"horários sob consulta\".",
    html: (r) => `<textarea name="horario" rows="3" placeholder="Seg a sex · 9h às 19h&#10;Sáb · 9h às 13h">${esc(r.horario)}</textarea>`, area: true },
  { id: "cor", t: () => `Qual <em>cor</em> combina com a marca?`, a: "A primeira é a sugerida para o ramo. Veja o site mudar ao lado.",
    html: (r, p) => `<div class="st-cores">${[p.corPadrao, ...CORES.filter((c) => c !== p.corPadrao)].map((c, k) => `<button type="button" class="st-cor" data-cor="${c}" style="background:${c}" aria-label="Cor ${c}${k === 0 ? " (sugerida)" : ""}" aria-pressed="${corAtual().toLowerCase() === c.toLowerCase()}"></button>`).join("")}
      <label class="st-cor-livre"><input type="color" name="corLivre" value="${esc(corAtual())}"> outra</label></div>` },
  { id: "sobre", t: () => `Quer escrever o texto <em>"Quem somos"</em>?`, a: "Opcional. Em branco, o gerador escreve um texto a partir do ramo e do bairro.",
    html: (r) => `<textarea name="sobre" rows="4" maxlength="600" placeholder="Ex.: Há 10 anos cuidando...">${esc(r.sobre)}</textarea>`, area: true },
  { id: "fotos", t: () => `Tem <em>logo ou fotos</em> da empresa?`, a: "Opcional. Fotos reais (Instagram ou Google) deixam o site muito mais convincente.",
    html: () => `<div class="st-fotos">${["logo", "foto1", "foto2", "foto3", "foto4"].map((c) => `<label class="st-foto ${AS.imgs[c] ? "tem" : ""}" ${AS.imgs[c] ? `style="background-image:url('${AS.imgs[c]}')"` : ""}>${c === "logo" ? "Logo" : "Foto " + c.slice(-1)}<input type="file" accept="image/*" data-img="${c}"></label>`).join("")}</div>` },
  { id: "confirmar" },
];

async function abrirAssistente(id) {
  const l = S.leads.find((x) => x.id === id); if (!l) return;
  if (!S.config.temHostinger) { toast("Configure a Hostinger em Configurações antes de criar sites."); location.hash = "config"; return; }
  AS.lead = l; AS.imgs = {}; AS.i = 0;
  AS.p = await api("GET", `site/${id}/padrao`);
  AS.r = { sub: AS.p.sub, nome: AS.p.nome, marca: AS.p.marca, whatsapp: AS.p.whatsapp, servicos: AS.p.servicos, horario: AS.p.horario, cor: AS.p.cor, sobre: AS.p.sobre };
  const st = await api("GET", `site/${id}`).catch(() => null);
  montarStudio();
  if (st?.status === "publicando") return mostrarEspera();
  telaPasso();
  previa(true);
}

function montarStudio() {
  const s = $("#studio");
  s.innerHTML = `<div class="st-top"><div class="marca"><i></i>Criar site</div><div class="st-prog"><b id="stProg"></b></div><button class="st-x" data-st="fechar" aria-label="Fechar">✕</button></div>
    <div class="st-corpo"><div class="st-q" id="stQ"></div>
      <div class="st-tela"><div class="st-janela"><div class="st-barra"><i></i><i></i><i></i><span id="stUrl"></span></div>
        <div class="st-frame-wrap" id="stWrap"><iframe id="stFrame" title="Prévia do site" sandbox="allow-scripts"></iframe><div class="st-selo">Prévia ao vivo</div></div></div></div></div>`;
  s.hidden = false; requestAnimationFrame(() => s.classList.add("on"));
  aplicarCor(); ajustarFrame();
}
const fecharStudio = () => { clearInterval(AS.timer); const s = $("#studio"); s.classList.remove("on"); setTimeout(() => { s.hidden = true; s.innerHTML = ""; }, 300); $("#stEspera").hidden = true; };
function aplicarCor() { for (const el of [$("#studio"), $("#stEspera")]) el.style.setProperty("--st-cor", corAtual()); }
function ajustarFrame() {
  const w = $("#stWrap"), f = $("#stFrame"); if (!w || !f) return;
  const k = w.clientWidth / 1440; f.style.transform = `scale(${k})`; f.style.height = Math.ceil(w.clientHeight / k) + "px";
}
addEventListener("resize", ajustarFrame);

function telaPasso(direcao = 1) {
  const q = $("#stQ"), passo = PASSOS[AS.i], total = PASSOS.length - 2;
  $("#stProg").style.width = `${Math.round((AS.i / (PASSOS.length - 1)) * 100)}%`;
  $("#stUrl").textContent = `https://${AS.r.sub}.${AS.p.dominio}`;
  const old = q.querySelector(".st-card");
  const desenhar = () => {
    let html;
    if (passo.id === "inicio") {
      html = `<div class="st-card"><div class="st-num">${esc(AS.p.ramo)}</div>
        <h2>Vamos criar o site da <em>${esc(AS.r.nome)}</em>.</h2>
        <p class="ajuda">${AS.p.publicado ? `Já existe um site no ar (${esc(AS.p.publicado)}); publicar de novo substitui. ` : ""}Já montei tudo com os dados do lead: é o que você vê ao lado. Quer fazer alguma alteração antes de gerar?</p>
        <div class="st-escolhas">
          <button type="button" class="st-esc" data-st="direto"><kbd>1</kbd><span>Não, pode gerar assim<small>Vai direto para a confirmação.</small></span></button>
          <button type="button" class="st-esc" data-st="ajustar"><kbd>2</kbd><span>Sim, quero ajustar<small>8 perguntas rápidas, todas já preenchidas.</small></span></button>
        </div></div>`;
    } else if (passo.id === "confirmar") {
      const r = AS.r, url = `https://${r.sub}.${AS.p.dominio}`;
      html = `<form class="st-card" id="stForm"><div class="st-num">TUDO PRONTO</div><h2>Publicar o site <em>agora</em>?</h2>
        <p class="ajuda">Confira o resumo. O site fica fora do Google (é uma demonstração).</p>
        <dl class="st-resumo">
          <div><dt>Endereço</dt><dd><b>${esc(url)}</b></dd></div>
          <div><dt>Empresa</dt><dd>${esc(r.nome)}</dd></div>
          <div><dt>WhatsApp</dt><dd>${esc(tel(r.whatsapp))}</dd></div>
          <div><dt>Serviços</dt><dd>${esc((r.servicos || []).join(" · ") || "padrão do ramo")}</dd></div>
          <div><dt>Horário</dt><dd>${esc((r.horario || "").replace(/\n/g, " · ") || "sob consulta")}</dd></div>
          <div><dt>Cor</dt><dd><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${esc(corAtual())};vertical-align:-2px"></span> ${r.cor ? esc(r.cor) : "sugerida do ramo"}</dd></div>
          <div><dt>Imagens</dt><dd>${Object.keys(AS.imgs).length ? Object.keys(AS.imgs).length + " enviada(s)" : "nenhuma: visual da marca"}</dd></div>
        </dl>
        ${AS.p.publicado && AS.p.publicado.includes("//" + r.sub + ".") ? '<p class="st-aviso">A versão atual deste endereço será substituída.</p>' : ""}
        <div class="st-acoes"><button class="st-ok" type="submit"><span>Sim, publicar o site</span><i>→</i></button><button type="button" class="st-volta" data-st="voltar">← Alterar</button></div></form>`;
    } else {
      html = `<form class="st-card" id="stForm"><div class="st-num">${String(AS.i).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div>
        <h2>${passo.t(AS.r, AS.p)}</h2><p class="ajuda">${passo.a}</p>${passo.html(AS.r, AS.p)}
        <div class="st-acoes"><button class="st-ok" type="submit"><span>${AS.i === total ? "Revisar" : "OK"}</span><i>→</i></button>
          <button type="button" class="st-volta" data-st="voltar">← Voltar</button><span class="st-dica">${passo.area ? "Ctrl + Enter" : "Enter ↵"}</span></div></form>`;
    }
    q.innerHTML = html;
    const foco = q.querySelector("input:not([type=file]):not([type=color]), textarea");
    if (foco) { foco.focus(); if (foco.setSelectionRange && foco.type !== "tel") foco.setSelectionRange(foco.value.length, foco.value.length); }
  };
  if (old) { old.classList.add("sai"); setTimeout(desenhar, 260); } else desenhar();
}

function lerPasso() {
  const f = $("#stForm"); if (!f) return {};
  const d = Object.fromEntries(new FormData(f));
  const r = AS.r;
  if ("sub" in d) r.sub = String(d.sub).trim().toLowerCase();
  if ("nome" in d) r.nome = d.nome; if ("marca" in d) r.marca = d.marca;
  if ("whatsapp" in d) r.whatsapp = String(d.whatsapp).replace(/\D/g, "");
  if ("servicos" in d) r.servicos = String(d.servicos).split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 6);
  if ("horario" in d) r.horario = d.horario; if ("sobre" in d) r.sobre = d.sobre;
  return { ...d, sub: r.sub, nome: r.nome || "", whatsapp: r.whatsapp || "" };
}
const respostas = () => ({ ...AS.r });
const imagensEnvio = () => Object.entries(AS.imgs).map(([campo, dataUrl]) => ({ campo, dataUrl }));

async function previa(ja) {
  clearTimeout(AS.previaT);
  AS.previaT = setTimeout(async () => {
    const f = $("#stFrame"); if (!f) return;
    f.classList.add("carregando");
    try { const { html } = await api("POST", `site/${AS.lead.id}/previa`, { respostas: respostas(), imagens: imagensEnvio() }); f.srcdoc = html; f.onload = () => { f.classList.remove("carregando"); ajustarFrame(); }; }
    catch { f.classList.remove("carregando"); }
  }, ja ? 0 : 700);
}

function avancar() {
  const passo = PASSOS[AS.i];
  if (passo.ok) { const v = passo.ok(lerPasso()); if (v !== true) { toast(v); return; } } else lerPasso();
  AS.i = Math.min(AS.i + 1, PASSOS.length - 1); telaPasso(); previa();
}

// reduz a imagem no navegador (até 1600 px) para o site ficar leve
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

// ---- espera e resultado ----
function mostrarEspera() {
  const e = $("#stEspera"), nome = (AS.r.nome || AS.lead.nome).trim();
  aplicarCor();
  e.innerHTML = `<div class="halo" aria-hidden="true"></div><div class="meio" id="stMeio">
    <div class="eyebrow"><i></i>Criando o site</div>
    <h1 class="st-nome" aria-label="${esc(nome)}" style="font-size:${nome.length > 34 ? "clamp(30px,4.6vw,64px)" : nome.length > 20 ? "clamp(36px,6vw,84px)" : ""}">${(() => { let k = 0; return nome.split(/\s+/).map((w) => `<span style="white-space:nowrap;display:inline-block">${[...w].map((c) => `<span class="l" style="animation-delay:${(k++ * 0.035).toFixed(3)}s">${esc(c)}</span>`).join("")}</span>`).join(" "); })()}</h1>
    <p class="st-frase" id="stFrase"><span>Seu site está ficando pronto…</span></p>
    <div class="st-mini" aria-hidden="true">
      <div class="topo"><div class="bl" style="width:70px;height:10px;animation-delay:.2s"></div><div class="bl cor" style="width:54px;height:16px;border-radius:99px;animation-delay:.4s"></div></div>
      <div class="hero"><div style="display:grid;gap:8px"><div class="bl" style="height:18px;animation-delay:.6s"></div><div class="bl cor" style="height:18px;width:70%;animation-delay:.8s"></div><div class="bl" style="height:18px;width:85%;animation-delay:1s"></div><div class="bl" style="height:8px;width:60%;margin-top:6px;animation-delay:1.2s"></div></div><div class="orbe"></div></div>
      <div class="cards"><div class="bl" style="height:34px;animation-delay:1.4s"></div><div class="bl" style="height:34px;animation-delay:1.55s"></div><div class="bl" style="height:34px;animation-delay:1.7s"></div></div>
    </div>
    <div class="st-barra-prog"><b id="stBarra"></b></div>
  </div>`;
  e.hidden = false; AS.inicioEspera = Date.now();
  let ultima = "";
  clearInterval(AS.timer);
  const tick = async () => {
    const st = await api("GET", `site/${AS.lead.id}`).catch(() => null);
    if (!st) return;
    const i = Math.max(0, ETAPAS_PUB.findIndex(([k]) => k === st.etapa));
    if (st.etapa !== ultima && ETAPAS_PUB[i]) { ultima = st.etapa; $("#stFrase").innerHTML = `<span>${ETAPAS_PUB[i][1](AS.r, AS.p)}…</span>`; }
    $("#stBarra").style.width = st.status === "pronto" ? "100%" : `${Math.round(((i + 1) / (ETAPAS_PUB.length + 1)) * 100)}%`;
    if (st.status === "pronto") {
      clearInterval(AS.timer);
      // deixa a animação respirar pelo menos 5 s, mesmo quando a publicação é instantânea
      setTimeout(() => mostrarPronto(st), Math.max(800, 5000 - (Date.now() - AS.inicioEspera)));
      atualizar().then(render);
    }
    if (st.status === "erro") { clearInterval(AS.timer); mostrarErro(st.erro); }
  };
  tick(); AS.timer = setInterval(tick, 1200);
}

function mostrarPronto(st) {
  const l = AS.lead, nome = (AS.r.nome || l.nome).trim();
  let msg = `Olá, tudo bem? Criei um site de demonstração para a ${nome}: ${st.url}\n\nDá uma olhada e me diz o que achou!`;
  const n = AS.r.whatsapp || l.whatsapp || l.telefone;
  $("#stMeio").outerHTML = `<div class="st-pronto">
    <div class="st-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
    <h1 class="st-nome" style="font-size:clamp(34px,5vw,64px)">Site no ar!</h1>
    <a class="st-link" href="${esc(st.url)}" target="_blank" rel="noopener">${esc(st.url.replace(/\/$/, ""))} ↗</a>
    <textarea id="stMsg" rows="4" aria-label="Mensagem pronta">${esc(msg)}</textarea>
    <div class="st-acoes">
      <a class="st-wa" id="stWa" target="_blank" rel="noopener">Enviar no WhatsApp ↗</a>
      <button class="st-sec" data-st="copiar">Copiar mensagem</button>
      <a class="st-sec" href="${esc(st.url)}" target="_blank" rel="noopener">Abrir site</a>
      <button class="st-sec" data-st="fechar">Fechar</button>
    </div></div>`;
  const link = () => { $("#stWa").href = n ? `https://wa.me/${numeroWa(n)}?text=${encodeURIComponent($("#stMsg").value)}` : "#"; };
  link(); $("#stMsg").addEventListener("input", link);
  $("#stWa").addEventListener("click", () => setTimeout(() => salvarLead(l.id, { mensagem: $("#stMsg").value, ...(l.etapa === "novo" ? { etapa: "contatado" } : {}) }), 300));
  confete();
  // mensagem completa (apresentação + link + portfólio + oferta), a mesma das mensagens prontas
  api("GET", `leads/${l.id}/mensagens`).then((m) => { const t = m.mensagens.novo?.[0]; if (t?.texto?.includes(st.url.replace(/\/$/, ""))) { $("#stMsg").value = t.texto; $("#stMsg").dispatchEvent(new Event("input")); } }).catch(() => {});
}
const numeroWa = (n) => { let d = String(n).replace(/\D/g, ""); if (!d.startsWith("55") && d.length <= 11) d = "55" + d; return d; };
function confete() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const e = $("#stEspera"), cores = [corAtual(), "#101413", "#25D366", "#f5c542"];
  for (let k = 0; k < 60; k++) {
    const c = document.createElement("i"); c.className = "confete";
    c.style.cssText = `left:${Math.random() * 100}%;background:${cores[k % cores.length]};animation-delay:${Math.random() * 0.6}s;animation-duration:${2 + Math.random() * 1.6}s`;
    e.append(c); setTimeout(() => c.remove(), 4500);
  }
}
function mostrarErro(erro) {
  $("#stMeio").innerHTML = `<div class="eyebrow" style="color:#b91c1c"><i></i>Não deu certo</div>
    <h1 class="st-nome" style="font-size:clamp(30px,4vw,52px)">O site não foi publicado</h1>
    <p class="st-frase">${esc(erro || "Erro desconhecido.")}</p>
    <div class="st-acoes"><button class="st-ok" data-st="publicar"><span>Tentar de novo</span><i>↻</i></button><button class="st-sec" data-st="revisar">Voltar às perguntas</button></div>`;
}

async function publicar() {
  mostrarEspera();
  try { await api("POST", `site/${AS.lead.id}/publicar`, { respostas: respostas(), imagens: imagensEnvio() }); }
  catch (err) { clearInterval(AS.timer); mostrarErro(err.message); }
}

// ---- eventos ----
document.addEventListener("click", (e) => { const b = e.target.closest("[data-criar-site]"); if (b) { e.stopPropagation(); abrirAssistente(b.dataset.criarSite); } }, true);
for (const raiz of ["#studio", "#stEspera"]) $(raiz).addEventListener("click", async (e) => {
  const cor = e.target.closest("[data-cor]");
  if (cor) { AS.r.cor = cor.dataset.cor === AS.p.corPadrao ? "" : cor.dataset.cor; document.querySelectorAll(".st-cor").forEach((b) => b.setAttribute("aria-pressed", String(b === cor))); aplicarCor(); previa(); return; }
  const a = e.target.closest("[data-st]")?.dataset.st; if (!a) return;
  if (a === "fechar") fecharStudio();
  if (a === "direto") { AS.i = PASSOS.length - 1; telaPasso(); }
  if (a === "ajustar") { AS.i = 1; telaPasso(); }
  if (a === "voltar") { lerPasso(); AS.i = AS.i === PASSOS.length - 1 ? 1 : Math.max(0, AS.i - 1); telaPasso(-1); previa(); }
  if (a === "publicar") publicar();
  if (a === "revisar") { $("#stEspera").hidden = true; AS.i = 1; telaPasso(); }
  if (a === "copiar") { try { await navigator.clipboard.writeText($("#stMsg").value); toast("Mensagem copiada"); } catch { $("#stMsg").select(); } }
});
$("#studio").addEventListener("submit", (e) => { e.preventDefault(); if (PASSOS[AS.i].id === "confirmar") publicar(); else avancar(); });
$("#studio").addEventListener("input", (e) => {
  if (e.target.name === "corLivre") { AS.r.cor = e.target.value; document.querySelectorAll(".st-cor").forEach((b) => b.setAttribute("aria-pressed", "false")); aplicarCor(); }
  else if (e.target.closest("#stForm")) lerPasso();
  if (e.target.name === "sub") $("#stUrl").textContent = `https://${AS.r.sub}.${AS.p.dominio}`;
  previa();
});
$("#studio").addEventListener("change", async (e) => {
  const c = e.target.dataset?.img; if (!c || !e.target.files[0]) return;
  try { AS.imgs[c] = await reduzirImagem(e.target.files[0], c === "logo" ? 600 : 1600); const slot = e.target.closest(".st-foto"); slot.classList.add("tem"); slot.style.backgroundImage = `url('${AS.imgs[c]}')`; previa(); }
  catch (err) { toast(err.message); }
});
document.addEventListener("keydown", (e) => {
  if ($("#studio").hidden || !$("#stEspera").hidden) return;
  if (PASSOS[AS.i]?.id === "inicio" && (e.key === "1" || e.key === "2")) { $(`[data-st="${e.key === "1" ? "direto" : "ajustar"}"]`).click(); return; }
  if (e.key === "Enter" && e.target.tagName === "TEXTAREA" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); $("#stForm")?.requestSubmit(); }
  if (e.key === "Escape") fecharStudio();
});
