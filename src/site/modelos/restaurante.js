// Modelo de site para restaurantes: foto grande de comida, cardápio, "Pedir no WhatsApp".
// Animação leve (entrada suave e zoom lento na foto). Cada subtipo tem cores, fonte, fotos e cardápio próprios.
const U = (id, w = 1600) => `https://images.unsplash.com/${id}?w=${w}&q=78&auto=format&fit=crop`;
const F = {
  burger1: "photo-1568901346375-23c9450c58cd", burger2: "photo-1550547660-d9450f859349", pizza1: "photo-1513104890138-7c749659a591",
  pizza2: "photo-1565299624946-b28f40a0ae38", batata: "photo-1573080496219-bb080dd4f877", salao1: "photo-1517248135467-4c7edcad34c4",
  sushi: "photo-1579871494447-9811cf80d66c", pao: "photo-1509440159596-0249088772ff", drinks: "photo-1551024709-8f23befc6f87",
  shake: "photo-1572490122747-3968b75cc699", burger3: "photo-1594212699903-ec8a3eca50f5", burger4: "photo-1561758033-d89a9ad46330",
  jantar: "photo-1414235077428-338989a2e8c0", prato: "photo-1504674900247-0877df9cc836", salao2: "photo-1555396273-367ea4eb4db5",
  bowl: "photo-1546069901-ba9599a7e63c", pizza3: "photo-1590947132387-155cc02f3212", burger5: "photo-1571091718767-18b5b1457add",
  pizza4: "photo-1585238342024-78d387f4a707", carne: "photo-1600891964092-4316c288032e",
};

export const TIPOS = {
  burger: {
    re: /hamburg|burger|lanch|smash|sanduich/, nome: "hamburgueria",
    cores: { bg: "#121010", sup: "#1c1917", txt: "#fff7ed", mut: "#c9bfb4", a1: "#ffb800", a2: "#e23b1e" }, fonte: ["Anton", "DM Sans"], caixaAlta: true,
    titulo: (n, b) => [`O burger que ${b} não esquece.`, `Smash na chapa, queijo derretendo.`], fotos: [F.burger1, F.burger5, F.burger4, F.batata, F.shake, F.burger2, F.burger3, F.drinks],
    faixa: ["smash na chapa", "pão brioche", "cheddar cremoso", "bacon crocante", "batata frita na hora", "milkshake"],
    destaques: [["Clássico da casa", "Blend na chapa, queijo, alface, tomate e molho especial no pão brioche."], ["Cheddar & Bacon", "Dois blends, cheddar cremoso e bacon crocante. Para quem não tem medo de fome."], ["Batata da casa", "Crocante por fora, macia por dentro, com o tempero da casa."], ["Milkshake", "Cremoso, gelado e do tamanho da vontade."]],
    cardapio: [["Burgers", [["Clássico", "Blend 150 g, queijo, alface, tomate, molho da casa"], ["Cheddar Bacon", "Blend, cheddar cremoso, bacon crocante, cebola caramelizada"], ["Smash duplo", "Dois smash, queijo prato duplo, picles e molho especial"], ["Chicken", "Frango empanado crocante, maionese temperada e alface"]]], ["Acompanhamentos", [["Batata frita", "Porção individual ou para dividir"], ["Batata com cheddar e bacon", "Coberta e gratinada"], ["Onion rings", "Anéis de cebola empanados"]]], ["Bebidas e doces", [["Milkshake", "Chocolate, morango ou ovomaltine"], ["Refrigerantes", "Lata ou 600 ml"], ["Sucos naturais", "Laranja, limão ou maracujá"]]]],
    pedir: "Pedir meu burger",
  },
  pizza: {
    re: /pizz|forno a lenha|italian|massa|cantina/, nome: "pizzaria",
    cores: { bg: "#fbf5ea", sup: "#f2e8d8", txt: "#1f1a17", mut: "#6f6259", a1: "#c8102e", a2: "#2e6b3f" }, fonte: ["Playfair Display", "DM Sans"], caixaAlta: false,
    titulo: (n, b) => [`Pizza de verdade, do forno para a sua mesa.`, `A pizza que ${b} pede de novo.`], fotos: [F.pizza1, F.pizza3, F.pizza4, F.pizza2, F.drinks, F.salao2, F.jantar, F.prato],
    faixa: ["massa de fermentação lenta", "molho de tomate da casa", "muçarela de verdade", "borda recheada", "entrega quentinha"],
    destaques: [["Margherita", "Molho de tomate, muçarela, tomate e manjericão fresco."], ["Calabresa", "A clássica que nunca sai do pedido: calabresa fatiada e cebola."], ["Quatro queijos", "Muçarela, provolone, parmesão e gorgonzola."], ["Doce de chocolate", "Para fechar a noite com chave de ouro."]],
    cardapio: [["Tradicionais", [["Margherita", "Molho, muçarela, tomate, manjericão"], ["Calabresa", "Calabresa, cebola, azeitonas"], ["Portuguesa", "Presunto, ovos, cebola, ervilha, azeitonas"], ["Frango com catupiry", "Frango desfiado e catupiry"]]], ["Especiais", [["Quatro queijos", "Muçarela, provolone, parmesão, gorgonzola"], ["Pepperoni", "Pepperoni e muçarela"], ["Da casa", "Pergunte a especial do dia"]]], ["Doces e bebidas", [["Chocolate", "Chocolate ao leite e granulado"], ["Romeu e Julieta", "Goiabada e muçarela"], ["Refrigerantes e sucos", "Lata, 2 litros ou natural"]]]],
    pedir: "Pedir minha pizza",
  },
  japones: {
    re: /japon|sushi|temaki|oriental|poke|asian|yakisoba/, nome: "restaurante japonês",
    cores: { bg: "#0e0e0e", sup: "#191717", txt: "#f6f1ea", mut: "#b3aaa1", a1: "#d7263d", a2: "#f2c14e" }, fonte: ["Shippori Mincho", "DM Sans"], caixaAlta: false,
    titulo: (n, b) => [`Sushi fresco, feito na hora.`, `O japonês favorito de ${b}.`], fotos: [F.sushi, F.bowl, F.drinks, F.jantar, F.salao1, F.prato, F.salao2, F.sushi],
    faixa: ["peixe fresco", "sushiman na hora", "combinados", "temakis", "hot rolls", "delivery"],
    destaques: [["Combinado da casa", "Sushis, sashimis e uramakis para dividir (ou não)."], ["Temaki", "Salmão, cream cheese e cebolinha no cone crocante."], ["Hot roll", "Empanado, crocante e com tarê."], ["Poke", "Arroz, salmão, legumes frescos e molho especial."]],
    cardapio: [["Combinados", [["Combinado 20 peças", "Variado de sushis e sashimis"], ["Combinado 40 peças", "Para dividir"], ["Combinado salmão", "Só salmão, do jeito que você gosta"]]], ["Temakis e rolls", [["Temaki salmão", "Salmão, cream cheese, cebolinha"], ["Hot roll", "Empanado com tarê"], ["Uramaki filadélfia", "Salmão e cream cheese"]]], ["Pratos quentes", [["Yakisoba", "Legumes, carne ou frango"], ["Guioza", "Pastel japonês grelhado"], ["Bebidas", "Refrigerantes, sucos e chás"]]]],
    pedir: "Pedir agora",
  },
  padaria: {
    re: /padar|confeit|panific|cafe|cafeteria|doceria|bolo|brigadeir/, nome: "padaria",
    cores: { bg: "#fbf6ee", sup: "#f1e6d6", txt: "#2a1d14", mut: "#7a6656", a1: "#8b5e34", a2: "#d98e04" }, fonte: ["Fraunces", "DM Sans"], caixaAlta: false,
    titulo: (n, b) => [`Pão quentinho e café passado na hora.`, `O cheirinho de pão de ${b}.`], fotos: [F.pao, F.drinks, F.salao2, F.bowl, F.prato, F.salao1, F.jantar, F.pao],
    faixa: ["pão saindo do forno", "café passado", "bolos caseiros", "salgados", "encomendas"],
    destaques: [["Pão francês", "Crocante por fora, macio por dentro, saindo várias vezes ao dia."], ["Café da manhã", "Café, pão na chapa, frutas e tudo o que o dia pede."], ["Bolos caseiros", "Fatias e bolos inteiros para levar para casa."], ["Salgados", "Assados e fritos, para o lanche ou para festa."]],
    cardapio: [["Pães", [["Pão francês", "Fornadas ao longo do dia"], ["Pães especiais", "Integral, australiano, de fermentação natural"], ["Pão de queijo", "Quentinho"]]], ["Café e lanches", [["Café passado", "Coado na hora"], ["Pão na chapa", "Com manteiga"], ["Misto quente", "Presunto e queijo"]]], ["Doces e encomendas", [["Bolos", "Fatia ou inteiro"], ["Doces finos", "Para festas e eventos"], ["Salgados para festa", "Cento sob encomenda"]]]],
    pedir: "Fazer meu pedido",
  },
  geral: {
    re: /.*/, nome: "restaurante",
    cores: { bg: "#fff8ef", sup: "#f6eadb", txt: "#241a12", mut: "#75675a", a1: "#c2410c", a2: "#6b8e23" }, fonte: ["Bricolage Grotesque", "DM Sans"], caixaAlta: false,
    titulo: (n, b) => [`Comida feita na hora, com gosto de casa.`, `O sabor que ${b} recomenda.`], fotos: [F.carne, F.prato, F.bowl, F.jantar, F.salao2, F.drinks, F.salao1, F.batata],
    faixa: ["comida de verdade", "feito na hora", "almoço e jantar", "delivery e retirada", "ingredientes frescos"],
    destaques: [["Prato executivo", "Arroz, feijão, guarnição e a proteína do dia. Rápido e caprichado."], ["Grelhados", "Carnes e frangos no ponto certo, com acompanhamentos."], ["Saladas e bowls", "Leves, coloridos e cheios de sabor."], ["Sobremesas", "Para fechar a refeição do jeito certo."]],
    cardapio: [["Pratos", [["Prato executivo", "Arroz, feijão, salada e proteína do dia"], ["Filé grelhado", "Com arroz, fritas e salada"], ["Frango à parmegiana", "Com arroz e fritas"]]], ["Leves", [["Salada da casa", "Folhas, legumes e proteína"], ["Bowl", "Grãos, legumes e molho especial"], ["Sopa do dia", "Pergunte o sabor"]]], ["Bebidas e sobremesas", [["Sucos naturais", "Frutas da estação"], ["Refrigerantes", "Lata ou 600 ml"], ["Sobremesa do dia", "Pergunte as opções"]]]],
    pedir: "Fazer meu pedido",
  },
};

const sa = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const ehRestaurante = (l) => /restaur|pizz|hamburg|burger|lanch|sushi|japon|temaki|padar|confeit|cafe|cafeteria|doceria|bar\b|bistr|churrasc|marmit|comida|gastro|acai|sorvet|pastel|poke|cantina|food/.test(sa(`${l.categoria} ${l.nome}`));
export const destaquesPadrao = (l) => TIPOS[tipoRestaurante(l)].destaques.map(([n]) => n);
export function tipoRestaurante(l) {
  const alvo = sa(`${l.categoria} ${l.nome}`);
  for (const [id, t] of Object.entries(TIPOS)) if (id !== "geral" && t.re.test(alvo)) return id;
  return "geral";
}

/**
 * @param {object} d dados prontos: {nome, marca, ramo, cidade, bairro, endereco, wa, waL(msg), telefone, instagram, mapsUrl, nota, avaliacoes, horario, sobre, cor, logo, fotos[], fotoReal, servicos[]}
 */
export function renderRestaurante(l, d) {
  const H = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const t = TIPOS[tipoRestaurante(l)];
  const c = { ...t.cores, ...(d.cor ? { a1: d.cor } : {}) };
  const local = d.bairro || d.cidade || "a cidade";
  const fotos = [...t.fotos];
  const fotoHero = d.fotos?.[0] || U(fotos[0], 2000);  // topo sempre com comida; a foto real do Google vai para "Sobre"
  const foto = (i, w) => d.fotos?.[i] || U(fotos[i % fotos.length], w);
  const [titulo, alt] = t.titulo(d.nome, local);
  const destaques = (d.servicos?.length ? d.servicos.map((s, i) => [s, t.destaques[i]?.[1] || "Feito na hora, do jeito da casa."]) : t.destaques).slice(0, 4);
  const pedir = (item) => d.waL(item ? `Olá! Vim pelo site e quero pedir: ${item}.` : `Olá! Vim pelo site e quero fazer um pedido.`);
  const nota = d.nota ? String(d.nota).replace(".", ",") : "";
  const temNota = d.nota && d.avaliacoes >= 5;
  const horario = (d.horario || "").trim();
  const mapa = `https://www.google.com/maps?q=${encodeURIComponent(d.endereco || `${d.nome} ${d.cidade}`)}&z=16&output=embed`;
  const fontes = `family=${t.fonte[0].replace(/ /g, "+")}:wght@400;700&family=${t.fonte[1].replace(/ /g, "+")}:wght@400;500;700`;
  const tt = (s) => (t.caixaAlta ? H(s).toUpperCase() : H(s));
  const WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>';
  const escuro = parseInt(c.bg.slice(1, 3), 16) < 80;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${H(d.nome)} | ${H(t.nome.charAt(0).toUpperCase() + t.nome.slice(1))} em ${H(d.cidade)}</title>
<meta name="description" content="${H(d.nome)}: ${H(t.nome)} ${d.bairro ? "no bairro " + H(d.bairro) : "em " + H(d.cidade)}. ${H(t.pedir)} pelo WhatsApp.">
<meta property="og:image" content="${H(fotoHero)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${fontes}&display=swap" rel="stylesheet">
<style>
:root{--bg:${c.bg};--sup:${c.sup};--txt:${c.txt};--mut:${c.mut};--a1:${c.a1};--a2:${c.a2};--tit:"${t.fonte[0]}",Georgia,serif;--cor:"${t.fonte[1]}",system-ui,sans-serif;--ease:cubic-bezier(.2,.8,.2,1);--pad:clamp(18px,5vw,64px)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
html,body{overflow-x:clip}
body{background:var(--bg);color:var(--txt);font:400 16px/1.6 var(--cor);-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
.tit{font-family:var(--tit);font-weight:${t.caixaAlta ? 400 : 700};letter-spacing:${t.caixaAlta ? ".01em" : "-.02em"};line-height:${t.caixaAlta ? 1 : 1.05}}
.btn{display:inline-flex;align-items:center;gap:10px;border-radius:99px;padding:15px 26px;font-weight:700;font-size:15px;transition:transform .25s var(--ease),box-shadow .25s,background .25s;cursor:pointer;border:0}
.btn svg{width:20px;height:20px}
.btn-1{background:var(--a1);color:${parseInt(c.a1.slice(1, 3), 16) > 200 && parseInt(c.a1.slice(3, 5), 16) > 150 ? "#121010" : "#fff"};box-shadow:0 14px 30px -12px var(--a1)}
.btn-1:hover{transform:translateY(-2px);box-shadow:0 20px 40px -14px var(--a1)}
.btn-2{background:rgba(255,255,255,.12);color:#fff;border:1.5px solid rgba(255,255,255,.4);backdrop-filter:blur(8px)}
.btn-2:hover{background:rgba(255,255,255,.22)}
.eyebrow{font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--a1)}
.rev{opacity:0;transform:translateY(26px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.rev.in{opacity:1;transform:none}
/* topo */
.topo{position:fixed;inset:0 0 auto;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px var(--pad);color:#fff;transition:background .3s,padding .3s,color .3s}
.topo.solido{background:${escuro ? "rgba(18,16,16,.92)" : "rgba(255,250,242,.95)"};color:var(--txt);padding-block:10px;backdrop-filter:blur(10px);box-shadow:0 1px 0 rgba(0,0,0,.06)}
.logo{font-family:var(--tit);font-size:${t.caixaAlta ? 30 : 24}px;font-weight:700;${t.caixaAlta ? "text-transform:uppercase;" : ""}display:flex;align-items:center;gap:10px}
.logo img{height:42px;width:auto;border-radius:8px}
.menu{display:flex;gap:28px;font-weight:500;font-size:15px}
.menu a{opacity:.85}.menu a:hover{opacity:1}
@media(max-width:860px){.menu{display:none}}
.topo .btn{padding:11px 18px;font-size:14px}
/* hero */
.hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;color:#fff;overflow:hidden}
.hero .foto{position:absolute;inset:0;background:url("${H(fotoHero)}") center/cover;transform:scale(1.08);animation:zoom 16s ease-out forwards}
@keyframes zoom{to{transform:scale(1)}}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45) 0,rgba(0,0,0,.05) 30%,rgba(0,0,0,.25) 55%,rgba(0,0,0,.85) 100%)}
.hero-in{position:relative;z-index:2;padding:0 var(--pad) clamp(40px,9vh,90px);max-width:1100px}
.selo{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(10px);border-radius:99px;padding:8px 16px;font-size:14px;margin-bottom:22px}
.selo b{color:#ffcc33;letter-spacing:2px}
.hero h1{font-size:clamp(${t.caixaAlta ? "52px,9vw,128px" : "44px,7.4vw,104px"});max-width:14ch;text-shadow:0 4px 30px rgba(0,0,0,.35)}
.hero h1 em{font-style:${t.caixaAlta ? "normal" : "italic"};color:var(--a1)}
.hero p.sub{font-size:clamp(17px,2vw,21px);max-width:44ch;margin:20px 0 30px;opacity:.92}
.acoes{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
.infos{display:flex;flex-wrap:wrap;gap:10px 26px;margin-top:30px;font-size:14px;opacity:.9}
.infos span{display:flex;align-items:center;gap:8px}
.infos i{width:8px;height:8px;border-radius:50%;background:#3ddc84;box-shadow:0 0 0 4px rgba(61,220,132,.25)}
/* faixa */
.faixa{width:calc(100% + 20px);background:var(--a1);color:${parseInt(c.a1.slice(1, 3), 16) > 200 && parseInt(c.a1.slice(3, 5), 16) > 150 ? "#121010" : "#fff"};overflow:hidden;padding:16px 0;transform:rotate(-1.2deg);margin:-14px -10px 0;position:relative;z-index:3}
.faixa div{display:flex;gap:40px;white-space:nowrap;width:max-content;animation:corre 32s linear infinite;font-family:var(--tit);font-size:${t.caixaAlta ? 30 : 24}px;${t.caixaAlta ? "text-transform:uppercase;" : "font-style:italic;"}}
.faixa span::after{content:"✦";margin-left:40px;opacity:.6}
@keyframes corre{to{transform:translateX(-50%)}}
section{padding:clamp(70px,11vh,130px) var(--pad)}
.cab{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;margin-bottom:clamp(30px,5vh,54px)}
.cab h2{font-size:clamp(36px,5.4vw,72px);max-width:16ch}
.cab p{color:var(--mut);max-width:40ch}
/* destaques */
.grade{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
@media(max-width:1000px){.grade{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.grade{grid-template-columns:1fr}}
.prato{background:var(--sup);border-radius:22px;overflow:hidden;display:flex;flex-direction:column;transition:transform .35s var(--ease),box-shadow .35s}
.prato:hover{transform:translateY(-6px);box-shadow:0 30px 50px -30px rgba(0,0,0,.5)}
.prato .img{aspect-ratio:4/3;overflow:hidden}
.prato .img img{width:100%;height:100%;object-fit:cover;transition:transform .8s var(--ease)}
.prato:hover .img img{transform:scale(1.07)}
.prato .txt{padding:20px 20px 22px;display:flex;flex-direction:column;gap:8px;flex:1}
.prato h3{font-size:${t.caixaAlta ? 26 : 23}px}
.prato p{color:var(--mut);font-size:15px;flex:1}
.prato a{align-self:flex-start;font-weight:700;color:var(--a1);font-size:15px;margin-top:6px}
.prato a:hover{text-decoration:underline}
/* cardápio */
.cardapio{background:var(--sup)}
.abas{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:30px}
.aba{border:1.5px solid ${escuro ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.12)"};background:none;color:var(--txt);border-radius:99px;padding:10px 20px;font:600 15px var(--cor);cursor:pointer;transition:.2s}
.aba[aria-selected="true"]{background:var(--txt);color:var(--bg);border-color:var(--txt)}
.lista{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 48px}
@media(max-width:760px){.lista{grid-template-columns:1fr}}
.lista[hidden]{display:none}
.item{display:flex;justify-content:space-between;gap:18px;align-items:center;padding:20px 0;border-bottom:1px dashed ${escuro ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.14)"}}
.item h4{font-size:19px;font-weight:700}
.item p{color:var(--mut);font-size:14px}
.item a{flex:none;width:42px;height:42px;border-radius:50%;background:var(--a1);color:${parseInt(c.a1.slice(1, 3), 16) > 200 && parseInt(c.a1.slice(3, 5), 16) > 150 ? "#121010" : "#fff"};display:grid;place-items:center;font-size:22px;font-weight:700;transition:transform .2s}
.item a:hover{transform:scale(1.12) rotate(90deg)}
/* sobre */
.sobre{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(30px,6vw,90px);align-items:center}
@media(max-width:860px){.sobre{grid-template-columns:1fr}}
.sobre .fotos{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sobre .fotos img{border-radius:20px;width:100%;aspect-ratio:3/4;object-fit:cover}
.sobre .fotos img:nth-child(2){margin-top:50px}
.sobre h2{font-size:clamp(34px,4.6vw,60px);margin:14px 0 20px}
.sobre p{color:var(--mut);font-size:18px;max-width:46ch}
.nota{display:flex;align-items:center;gap:18px;margin-top:30px;padding:20px 24px;border-radius:18px;background:var(--sup);width:fit-content}
.nota b{font-family:var(--tit);font-size:46px;line-height:1}
.nota span{color:var(--mut);font-size:14px}
.nota span strong{display:block;color:#f5b301;letter-spacing:3px;font-size:16px}
/* como pedir */
.passos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;counter-reset:p}
@media(max-width:760px){.passos{grid-template-columns:1fr}}
.passo{border:1.5px solid ${escuro ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)"};border-radius:22px;padding:28px;counter-increment:p}
.passo::before{content:counter(p);display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:var(--a1);color:${parseInt(c.a1.slice(1, 3), 16) > 200 && parseInt(c.a1.slice(3, 5), 16) > 150 ? "#121010" : "#fff"};font:700 20px var(--tit);margin-bottom:18px}
.passo h3{font-size:22px;margin-bottom:6px}
.passo p{color:var(--mut)}
/* faixa de foto + chamada */
.chamada{position:relative;color:#fff;text-align:center;padding:clamp(90px,16vh,170px) var(--pad);overflow:hidden}
.chamada::before{content:"";position:absolute;inset:0;background:url("${H(foto(1, 1800))}") center/cover;transform:scale(1.05)}
.chamada::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.6)}
.chamada>*{position:relative;z-index:1}
.chamada h2{font-size:clamp(40px,6.4vw,92px);max-width:14ch;margin:0 auto 26px}
/* onde */
.onde{display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(30px,5vw,70px);align-items:stretch}
@media(max-width:860px){.onde{grid-template-columns:1fr}}
.onde h2{font-size:clamp(34px,4.6vw,60px);margin:12px 0 26px}
.dado{padding:18px 0;border-bottom:1px solid ${escuro ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)"}}
.dado small{display:block;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--mut);margin-bottom:4px}
.dado div{white-space:pre-line}
.mapa{border-radius:24px;overflow:hidden;min-height:380px;background:var(--sup)}
.mapa iframe{width:100%;height:100%;min-height:380px;border:0;${escuro ? "filter:grayscale(.3) contrast(1.05)" : ""}}
footer{padding:40px var(--pad) 110px;color:var(--mut);font-size:14px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;border-top:1px solid ${escuro ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)"}}
footer .logo{color:var(--txt);font-size:22px}
/* whatsapp */
.wa{position:fixed;right:20px;bottom:20px;z-index:60;width:62px;height:62px;border-radius:50%;background:#25d366;color:#fff;display:grid;place-items:center;box-shadow:0 14px 30px -10px rgba(0,0,0,.5);animation:pula 2.8s ease-in-out 3s infinite}
.wa svg{width:32px;height:32px}
@keyframes pula{0%,100%{transform:none}8%{transform:translateY(-8px)}16%{transform:none}}
.barra{display:none}
@media(max-width:640px){.wa{display:none}.barra{display:flex;position:fixed;left:12px;right:12px;bottom:12px;z-index:60;justify-content:center;gap:10px;background:#25d366;color:#fff;border-radius:99px;padding:15px;font-weight:700;box-shadow:0 14px 30px -10px rgba(0,0,0,.5)}.barra svg{width:22px;height:22px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.rev{opacity:1;transform:none}}
</style>
</head>
<body>
<header class="topo" id="topo">
  <a href="#inicio" class="logo">${d.logo ? `<img src="${H(d.logo)}" alt="${H(d.nome)}">` : tt(d.marca || d.nome)}</a>
  <nav class="menu"><a href="#destaques">Destaques</a><a href="#cardapio">Cardápio</a><a href="#sobre">Sobre</a><a href="#onde">Onde estamos</a></nav>
  <a class="btn btn-1" href="${H(pedir())}" target="_blank" rel="noopener">${WA} Pedir</a>
</header>

<main id="inicio">
<section class="hero" style="padding:0">
  <div class="foto" role="img" aria-label="Foto de ${H(d.nome)}"></div>
  <div class="hero-in">
    ${temNota ? `<div class="selo"><b>★★★★★</b> ${nota} no Google · ${Number(d.avaliacoes).toLocaleString("pt-BR")} avaliações</div>` : `<div class="selo">${H(t.nome.charAt(0).toUpperCase() + t.nome.slice(1))} · ${H(local)}</div>`}
    <h1 class="tit">${tt(titulo).replace(/^(\S+\s+\S+)/, "<em>$1</em>")}</h1>
    <p class="sub">${H(d.nome)}${d.bairro ? `, no ${H(d.bairro)}` : ""}. ${H(alt)}</p>
    <div class="acoes">
      <a class="btn btn-1" href="${H(pedir())}" target="_blank" rel="noopener">${WA} ${H(t.pedir)}</a>
      <a class="btn btn-2" href="#cardapio">Ver cardápio</a>
    </div>
    <div class="infos"><span><i></i>Pedidos pelo WhatsApp</span><span>Delivery e retirada</span>${horario ? `<span>🕒 ${H(horario.split("\n")[0])}</span>` : ""}</div>
  </div>
</section>
<div class="faixa" aria-hidden="true"><div>${[...t.faixa, ...t.faixa].map((x) => `<span>${H(x)}</span>`).join("")}</div></div>

<section id="destaques">
  <div class="cab rev"><div><div class="eyebrow">Os mais pedidos</div><h2 class="tit">${t.caixaAlta ? "DÁ FOME SÓ DE OLHAR." : "Dá fome só de olhar."}</h2></div><p>Escolha o seu e peça direto pelo WhatsApp. A gente prepara na hora.</p></div>
  <div class="grade">
  ${destaques.map(([n, desc], i) => `<article class="prato rev" style="transition-delay:${i * 90}ms"><div class="img"><img src="${H(foto(i + 1, 900))}" alt="${H(n)}" loading="lazy"></div><div class="txt"><h3 class="tit">${tt(n)}</h3><p>${H(desc)}</p><a href="${H(pedir(n))}" target="_blank" rel="noopener">Quero esse →</a></div></article>`).join("\n  ")}
  </div>
</section>

<section class="cardapio" id="cardapio">
  <div class="cab rev"><div><div class="eyebrow">Cardápio</div><h2 class="tit">${t.caixaAlta ? "ESCOLHA O SEU." : "Escolha o seu."}</h2></div><p>Toque no + para pedir o item pelo WhatsApp.</p></div>
  <div class="abas" role="tablist">${t.cardapio.map(([cat], i) => `<button class="aba" role="tab" data-aba="${i}" aria-selected="${i === 0}">${H(cat)}</button>`).join("")}</div>
  ${t.cardapio.map(([, itens], i) => `<div class="lista" data-lista="${i}" ${i ? "hidden" : ""}>${itens.map(([n, desc]) => `<div class="item"><div><h4>${H(n)}</h4><p>${H(desc)}</p></div><a href="${H(pedir(n))}" target="_blank" rel="noopener" aria-label="Pedir ${H(n)}">+</a></div>`).join("")}</div>`).join("\n  ")}
</section>

<section id="sobre">
  <div class="sobre">
    <div class="fotos rev"><img src="${H(d.fotoReal || foto(5, 900))}" alt="${d.fotoReal ? "Foto de " + H(d.nome) + " no Google" : "Ambiente de " + H(d.nome)}" loading="lazy"><img src="${H(foto(6, 900))}" alt="Prato de ${H(d.nome)}" loading="lazy"></div>
    <div class="rev">
      <div class="eyebrow">Sobre a gente</div>
      <h2 class="tit">${t.caixaAlta ? tt(d.marca || d.nome) : H(d.nome)}</h2>
      <p>${H(d.sobre || `${d.nome} é ${t.nome === "restaurante" ? "um restaurante" : "uma " + t.nome} ${d.bairro ? "no bairro " + d.bairro + ", em " + d.cidade : "em " + d.cidade}. Tudo é preparado na hora, com ingredientes escolhidos a dedo, para chegar até você do jeito que a gente gosta de comer.`)}</p>
      ${temNota ? `<div class="nota"><b>${nota}</b><span><strong>★★★★★</strong>${Number(d.avaliacoes).toLocaleString("pt-BR")} avaliações no Google</span></div>` : ""}
    </div>
  </div>
</section>

<section>
  <div class="cab rev"><div><div class="eyebrow">Como pedir</div><h2 class="tit">${t.caixaAlta ? "SIMPLES ASSIM." : "Simples assim."}</h2></div></div>
  <div class="passos">
    <div class="passo rev"><h3 class="tit">${tt("Escolha")}</h3><p>Veja os destaques e o cardápio e escolha o que deu vontade.</p></div>
    <div class="passo rev" style="transition-delay:90ms"><h3 class="tit">${tt("Chame no WhatsApp")}</h3><p>Toque em pedir: a mensagem já vai pronta para a gente.</p></div>
    <div class="passo rev" style="transition-delay:180ms"><h3 class="tit">${tt("Receba ou retire")}</h3><p>Preparamos na hora. Você retira aqui ou recebe em casa.</p></div>
  </div>
</section>

<section class="chamada">
  <h2 class="tit rev">${t.caixaAlta ? "BATEU A FOME?" : "Bateu a fome?"}</h2>
  <a class="btn btn-1 rev" href="${H(pedir())}" target="_blank" rel="noopener">${WA} ${H(t.pedir)}</a>
</section>

<section id="onde">
  <div class="onde">
    <div class="rev">
      <div class="eyebrow">Onde estamos</div>
      <h2 class="tit">${t.caixaAlta ? "VEM PRA CÁ." : "Vem pra cá."}</h2>
      ${d.endereco ? `<div class="dado"><small>Endereço</small><div>${H(d.endereco)}</div></div>` : ""}
      <div class="dado"><small>Horário</small><div>${H(horario || "Consulte pelo WhatsApp")}</div></div>
      ${d.telefone ? `<div class="dado"><small>Telefone</small><div><a href="tel:+${H(d.telefoneNum)}">${H(d.telefone)}</a></div></div>` : ""}
      ${d.instagram ? `<div class="dado"><small>Instagram</small><div><a href="https://instagram.com/${H(d.instagram.replace("@", ""))}" target="_blank" rel="noopener">${H(d.instagram)}</a></div></div>` : ""}
      <div class="acoes" style="margin-top:26px">${d.mapsUrl ? `<a class="btn btn-1" href="${H(d.mapsUrl)}" target="_blank" rel="noopener">Como chegar</a>` : ""}<a class="btn" style="border:1.5px solid currentColor" href="${H(pedir())}" target="_blank" rel="noopener">${WA} WhatsApp</a></div>
    </div>
    <div class="mapa rev"><iframe title="Mapa de ${H(d.nome)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${H(mapa)}"></iframe></div>
  </div>
</section>
</main>

<footer><span class="logo tit">${tt(d.marca || d.nome)}</span><span>© ${new Date().getFullYear()} ${H(d.nome)}</span></footer>
<a class="wa" href="${H(pedir())}" target="_blank" rel="noopener" aria-label="Pedir pelo WhatsApp">${WA}</a>
<a class="barra" href="${H(pedir())}" target="_blank" rel="noopener">${WA} ${H(t.pedir)}</a>
<script>
const topo=document.getElementById("topo");
const rolar=()=>topo.classList.toggle("solido",scrollY>40);addEventListener("scroll",rolar,{passive:true});rolar();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll(".rev").forEach(el=>io.observe(el));
document.querySelectorAll(".aba").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".aba").forEach(x=>x.setAttribute("aria-selected",String(x===b)));document.querySelectorAll("[data-lista]").forEach(l=>l.hidden=l.dataset.lista!==b.dataset.aba)}));
</script>
</body>
</html>`;
}
