// Modelos premium com objeto 3D: academia, dentista, clínica e restaurante.
// Página branca ou escura conforme o ramo, objeto 3D no topo, animações de entrada, cartões com inclinação,
// números que contam, galeria com paralaxe, seção fixa "por que nós", FAQ e contato.
import { MOTOR_3D } from "./motor3d.js";
import { TIPOS as TIPOS_REST, tipoRestaurante } from "./restaurante.js";

const U = (id, w = 1400) => `https://images.unsplash.com/${id}?w=${w}&q=78&auto=format&fit=crop`;
const FOTOS = {
  academia: ["photo-1534438327276-14e5300c3a48", "photo-1571019614242-c5c5dee9f50b", "photo-1517836357463-d25dfeac3438", "photo-1540497077202-7c8a3999166f", "photo-1583454110551-21f2fa2afe61", "photo-1599058917212-d750089bc07e", "photo-1574680096145-d05b474e2155", "photo-1581009146145-b5ef050c2e1e"],
  dentista: ["photo-1629909613654-28e377c37b09", "photo-1606811841689-23dfddce3e95", "photo-1598256989800-fe5f95da9787", "photo-1609840114035-3c981b782dfe", "photo-1588776814546-1ffcf47267a5", "photo-1606811971618-4486d14f3f99"],
  clinica: ["photo-1570172619644-dfd03ed5d881", "photo-1560750588-73207b1ef5b8", "photo-1612817288484-6f916006741a", "photo-1616394584738-fc6e612e71b9", "photo-1519823551278-64ac92734fb1", "photo-1576091160550-2173dba999ef"],
};

const TIPOS = {
  academia: {
    objeto: "haltere", escuro: true, rotulo: "academia",
    cores: { bg: "#0b0c0f", sup: "#15171c", txt: "#f4f6f8", mut: "#9aa3ad", a1: "#d7ff3a", a2: "#ffffff" },
    fontes: ["Archivo Black", "Inter"], fontesUrl: "family=Archivo+Black&family=Inter:wght@400;500;600;700", caixaAlta: true,
    titulo: ["Treine com", "quem leva", "você a sério."], destaque: 1,
    sub: (d) => `Acompanhamento de verdade, estrutura completa e um ambiente que dá vontade de voltar. ${d.bairro ? "No " + d.bairro + ", " + d.cidade : "Em " + d.cidade}.`,
    faixa: ["musculação", "funcional", "professor no salão", "aula experimental", "sem desculpas", "resultado de verdade"],
    passos: [["Aula experimental", "Agende pelo WhatsApp e conheça a academia sem compromisso."], ["Avaliação e treino", "Um professor monta o treino certo para o seu objetivo."], ["Evolua de verdade", "Acompanhamento no salão e ajustes conforme você avança."]],
    planos: [["Mensal", "Para começar agora", ["Musculação completa", "Avaliação física", "Treino montado"]], ["Trimestral", "O mais escolhido", ["Tudo do mensal", "Reavaliação a cada mês", "Melhor custo por mês"]], ["Anual", "Para quem é de verdade", ["Tudo do trimestral", "Menor valor por mês", "Prioridade nas aulas"]]],
  },
  dentista: {
    objeto: "dente", escuro: false, rotulo: "clínica odontológica",
    cores: { bg: "#ffffff", sup: "#f1f7fb", txt: "#0d2230", mut: "#5d7180", a1: "#1497c4", a2: "#e8f8ff" },
    fontes: ["Plus Jakarta Sans", "Inter"], fontesUrl: "family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600", caixaAlta: false,
    titulo: ["Seu sorriso", "merece", "cuidado de verdade."], destaque: 2,
    sub: (d) => `Atendimento sem pressa, explicação clara do tratamento e tecnologia para cuidar de você ${d.bairro ? "no " + d.bairro : "em " + d.cidade}.`,
    faixa: ["sorriso saudável", "atendimento sem dor", "explicação clara", "parcelamento facilitado", "tecnologia", "biossegurança"],
    passos: [["Agende a avaliação", "Pelo WhatsApp, no horário que fica melhor para você."], ["Exame e conversa", "Examinamos com calma e explicamos tudo, sem pressa."], ["Plano de tratamento", "Você recebe o plano e as opções antes de começar."]],
  },
  clinica: {
    objeto: "forma", escuro: false, rotulo: "clínica",
    cores: { bg: "#fffaf7", sup: "#f6ece6", txt: "#2a1e1a", mut: "#7a6a63", a1: "#b9785f", a2: "#fff3ee" },
    fontes: ["Cormorant Garamond", "Jost"], fontesUrl: "family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500;600", caixaAlta: false,
    titulo: ["Beleza que", "realça", "quem você é."], destaque: 1,
    sub: (d) => `Resultado natural, avaliação individual e profissionais habilitados ${d.bairro ? "no " + d.bairro : "em " + d.cidade}.`,
    faixa: ["resultado natural", "avaliação individual", "cuidado sem pressa", "profissionais habilitados", "bem-estar"],
    passos: [["Agende sua avaliação", "Pelo WhatsApp, em poucos minutos."], ["Conversa e diagnóstico", "Entendemos o que você quer e indicamos o melhor caminho."], ["Tratamento sob medida", "Acompanhamento antes, durante e depois."]],
  },
};
const OBJ_REST = { burger: "burger", pizza: "pizza", padaria: "xicara", japones: "tigela", geral: "tigela" };

/** Tipo premium do lead (ou null) */
export function tipoPremium(perfilId, ehRest) {
  if (ehRest) return "restaurante";
  if (perfilId === "odonto") return "dentista";
  if (perfilId === "academia") return "academia";
  if (["estetica", "saude", "bemestar", "salao"].includes(perfilId)) return "clinica";
  return null;
}

export function renderPremium(l, d, tipoId) {
  const H = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let t, fotos;
  if (tipoId === "restaurante") {
    const sub = tipoRestaurante(l), r = TIPOS_REST[sub];
    t = { objeto: OBJ_REST[sub] || "tigela", escuro: true, rotulo: r.nome, cores: { ...r.cores, bg: "#100d0b", sup: "#1b1612" }, fontes: r.fonte,
      fontesUrl: `family=${r.fonte[0].replace(/ /g, "+")}:wght@400;700&family=${r.fonte[1].replace(/ /g, "+")}:wght@400;500;700`, caixaAlta: r.caixaAlta,
      titulo: r.titulo(d.nome, d.bairro || d.cidade)[0].replace(/\.$/, "").split(" ").reduce((a, w, i, arr) => { const k = Math.min(2, Math.floor(i / Math.ceil(arr.length / 3))); (a[k] = a[k] || []).push(w); return a; }, []).map((x, i, all) => x.join(" ") + (i === all.length - 1 ? "." : "")), destaque: 1,
      sub: () => `${d.nome}${d.bairro ? ", no " + d.bairro : ""}. ${r.titulo(d.nome, d.bairro || d.cidade)[1]}`, faixa: r.faixa, cardapio: r.cardapio,
      passos: [["Escolha", "Veja o cardápio e escolha o que deu vontade."], ["Chame no WhatsApp", "Toque em pedir: a mensagem já vai pronta."], ["Receba ou retire", "Preparamos na hora. Retire aqui ou receba em casa."]] };
    fotos = r.fotos.map((id) => U(id));
    d = { ...d, difs: d.difs?.length ? d.difs : r.destaques.map(([n, x]) => n + ": " + x), servicos: d.servicos?.length ? d.servicos : r.destaques.map(([n]) => n), servDesc: Object.fromEntries(r.destaques), cta: r.pedir, waMsg: "Olá! Vim pelo site e quero fazer um pedido." };
  } else {
    t = TIPOS[tipoId];
    fotos = FOTOS[tipoId].map((id) => U(id));
  }
  const c = { ...t.cores, ...(d.cor ? { a1: d.cor } : {}) };
  if (d.fotos?.length) fotos = [...d.fotos, ...fotos];
  const foto = (i) => fotos[i % fotos.length];
  const pedir = (item) => d.waL(item ? `Olá! Vim pelo site e quero saber sobre: ${item}.` : d.waMsg || "Olá! Vim pelo site e gostaria de mais informações.");
  const nota = d.nota ? String(d.nota).replace(".", ",") : "";
  const temNota = d.nota && d.avaliacoes >= 5;
  const tt = (s) => (t.caixaAlta ? H(s).toUpperCase() : H(s));
  const tinta = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 160 ? "#0b0c0f" : "#ffffff"; };
  const sobreA1 = tinta(c.a1);
  const linha = t.escuro ? "rgba(255,255,255,.12)" : "rgba(10,30,40,.1)";
  const WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>';
  const servicos = (d.servicos || []).slice(0, 6);
  const descServ = (n, i) => d.servDesc?.[n] || ["Feito com cuidado, do começo ao fim.", "Atenção de verdade em cada detalhe.", "Com quem entende do assunto.", "Do jeito que foi combinado.", "Tire suas dúvidas pelo WhatsApp.", "Sem complicação para você."][i % 6];
  const difs = (d.difs || []).slice(0, 4);
  const faq = (d.faq || []).slice(0, 5);
  const mapa = `https://www.google.com/maps?q=${encodeURIComponent(d.endereco || `${d.nome} ${d.cidade}`)}&z=16&output=embed`;
  const horario = (d.horario || "").trim();
  const sobre = d.sobre || `${d.nome} é ${t.rotulo === "academia" ? "uma academia" : "um" + (/^[aeiou]/.test(t.rotulo) ? "a " : " ") + t.rotulo} ${d.bairro ? "no bairro " + d.bairro + ", em " + d.cidade : "em " + d.cidade}. A gente acredita que atendimento bom é atendimento próximo: cada pessoa recebe atenção, explicação clara e um cuidado feito para ela.`;
  const cfg3d = JSON.stringify({ objeto: t.objeto, a1: c.a1, a2: c.a2 }).replace(/</g, "\\u003c");
  const ICONES = ["M4 12h16M12 4v16", "M5 12l4 4L19 6", "M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z", "M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 7v5l3 2", "M4 20V10l8-6 8 6v10H4z", "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"];

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${H(d.nome)} | ${H(t.rotulo.charAt(0).toUpperCase() + t.rotulo.slice(1))} em ${H(d.cidade)}</title>
<meta name="description" content="${H(d.nome)}: ${H(t.rotulo)} ${d.bairro ? "no bairro " + H(d.bairro) : "em " + H(d.cidade)}. ${H(d.cta)} pelo WhatsApp.">
<meta property="og:image" content="${H(foto(0))}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${t.fontesUrl}&display=swap" rel="stylesheet">
<style>
:root{--bg:${c.bg};--sup:${c.sup};--txt:${c.txt};--mut:${c.mut};--a1:${c.a1};--a2:${c.a2};--on:${sobreA1};--linha:${linha};--tit:"${t.fontes[0]}",Georgia,sans-serif;--cor:"${t.fontes[1]}",system-ui,sans-serif;--ease:cubic-bezier(.2,.8,.2,1);--pad:clamp(18px,5vw,72px)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{overflow-x:clip}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--txt);font:400 16px/1.65 var(--cor);-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none} img{display:block;max-width:100%}
.tit{font-family:var(--tit);font-weight:${t.caixaAlta ? 400 : 700};letter-spacing:${t.caixaAlta ? "0" : "-.025em"};line-height:${t.caixaAlta ? 1 : 1.04}}
.olho{display:inline-flex;align-items:center;gap:10px;font-size:12px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--a1)}
.olho::before{content:"";width:28px;height:1.5px;background:currentColor}
.btn{position:relative;display:inline-flex;align-items:center;gap:10px;border-radius:99px;padding:16px 28px;font-weight:700;font-size:15px;border:0;cursor:pointer;overflow:hidden;transition:transform .3s var(--ease),box-shadow .3s}
.btn svg{width:20px;height:20px;position:relative}
.btn span{position:relative}
.btn-1{background:var(--a1);color:var(--on);box-shadow:0 18px 40px -18px var(--a1)}
.btn-1::before{content:"";position:absolute;inset:0;background:var(--txt);transform:translateY(101%);transition:transform .45s var(--ease)}
.btn-1:hover::before{transform:none}.btn-1:hover{color:var(--bg)}
.btn-2{border:1.5px solid var(--linha);color:var(--txt)}
.btn-2:hover{border-color:var(--txt)}
/* carregamento */
.carga{position:fixed;inset:0;z-index:100;background:var(--bg);display:grid;place-items:center;transition:clip-path .9s cubic-bezier(.76,0,.24,1)}
.carga.fora{clip-path:inset(0 0 100% 0)}
.carga b{font:400 clamp(30px,6vw,70px) var(--tit);${t.caixaAlta ? "text-transform:uppercase;" : ""}overflow:hidden;display:block}
.carga b span{display:inline-block;transform:translateY(110%);animation:sobeL .7s var(--ease) forwards}
.carga i{position:absolute;bottom:0;left:0;height:3px;background:var(--a1);animation:barra 1.2s var(--ease) forwards}
@keyframes sobeL{to{transform:none}}@keyframes barra{from{width:0}to{width:100%}}
/* progresso e topo */
.prog{position:fixed;top:0;left:0;height:3px;background:var(--a1);z-index:90;width:0}
.topo{position:fixed;inset:0 0 auto;z-index:80;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px var(--pad);transition:padding .3s,background .3s,transform .4s var(--ease)}
.topo.solido{padding-block:12px;background:${t.escuro ? "rgba(11,12,15,.8)" : "rgba(255,255,255,.85)"};backdrop-filter:blur(14px);box-shadow:0 1px 0 var(--linha)}
.topo.some{transform:translateY(-110%)}
.logo{font:${t.caixaAlta ? 400 : 700} 22px var(--tit);${t.caixaAlta ? "text-transform:uppercase;" : ""}display:flex;align-items:center;gap:10px}
.logo img{height:40px;width:auto;border-radius:8px}
.logo i{width:10px;height:10px;border-radius:50%;background:var(--a1);box-shadow:0 0 0 6px color-mix(in srgb,var(--a1) 25%,transparent)}
.menu{display:flex;gap:30px;font-size:15px;font-weight:500}
.menu a{position:relative}.menu a::after{content:"";position:absolute;left:0;right:0;bottom:-4px;height:1.5px;background:var(--a1);transform:scaleX(0);transform-origin:right;transition:transform .4s var(--ease)}
.menu a:hover::after{transform:scaleX(1);transform-origin:left}
@media(max-width:900px){.menu{display:none}}
.topo .btn{padding:12px 20px;font-size:14px}
/* hero */
.hero{position:relative;min-height:100svh;display:grid;grid-template-columns:1.05fr 1fr;align-items:center;gap:20px;padding:120px var(--pad) 60px;overflow:hidden}
.hero::before{content:"";position:absolute;width:70vmax;height:70vmax;right:-25vmax;top:-20vmax;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--a1) ${t.escuro ? 22 : 18}%,transparent),transparent 65%);pointer-events:none}
.hero h1{font-size:clamp(${t.caixaAlta ? "40px,5.4vw,88px" : "42px,6vw,96px"});margin:22px 0 24px}
.hero h1 .ln{display:block;overflow:hidden;padding:.14em 0 .06em;margin-top:-.14em}
.hero h1 .ln>span{display:inline-block;transform:translateY(105%);transition:transform 1.1s var(--ease)}
.pronto .hero h1 .ln>span{transform:none}
.hero h1 .ln:nth-child(2)>span{transition-delay:.1s}.hero h1 .ln:nth-child(3)>span{transition-delay:.2s}
.hero h1 em{font-style:${t.caixaAlta ? "normal" : "italic"};color:var(--a1)}
.hero p.sub{font-size:clamp(17px,1.6vw,20px);color:var(--mut);max-width:44ch;margin-bottom:34px}
.hero .acoes{display:flex;gap:12px;flex-wrap:wrap}
.selo{display:inline-flex;align-items:center;gap:12px;margin-top:34px;padding:10px 18px 10px 10px;border-radius:99px;border:1px solid var(--linha);font-size:14px;color:var(--mut)}
.selo b{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--a1);color:var(--on);font:700 15px var(--tit)}
.selo strong{color:#f5b301;letter-spacing:2px;display:block;font-size:13px}
.fade{opacity:0;transform:translateY(24px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
.pronto .hero .fade{opacity:1;transform:none}
.pronto .hero .fade:nth-of-type(1){transition-delay:.35s}.pronto .hero .acoes.fade{transition-delay:.5s}.pronto .hero .selo.fade{transition-delay:.65s}
.palco{position:relative;height:min(78svh,720px);min-height:380px}
.palco canvas{position:absolute;inset:-10%;width:120%;height:120%;opacity:0;transition:opacity 1.2s .3s}
.com3d .palco canvas{opacity:1}
.palco .reserva{position:absolute;inset:8%;border-radius:40% 60% 55% 45%/50% 45% 55% 50%;background:url("${H(foto(0))}") center/cover;display:none}
.sem3d .palco .reserva{display:block}
.palco .chip{position:absolute;z-index:2;padding:12px 16px;border-radius:16px;font-size:13px;background:${t.escuro ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.75)"};border:1px solid var(--linha);backdrop-filter:blur(12px);box-shadow:0 20px 40px -24px rgba(0,0,0,.4);animation:boia 5s ease-in-out infinite}
.palco .chip b{display:block;font:700 18px var(--tit);color:var(--txt)}
.palco .c1{left:2%;top:18%}.palco .c2{right:4%;bottom:16%;animation-delay:-2.5s}
@keyframes boia{50%{transform:translateY(-10px)}}
.rolar{position:absolute;left:var(--pad);bottom:26px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--mut);display:flex;gap:10px;align-items:center}
.rolar::after{content:"";width:1px;height:40px;background:var(--mut);animation:pinga 2s var(--ease) infinite;transform-origin:top}
@keyframes pinga{0%{transform:scaleY(0)}50%{transform:scaleY(1);transform-origin:top}51%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
@media(max-width:900px){.hero{grid-template-columns:1fr;padding-top:100px;text-align:left}.palco{order:-1;height:46svh;min-height:300px}.rolar{display:none}.palco .chip{display:none}}
/* faixa */
.faixa{border-block:1px solid var(--linha);overflow:hidden;padding:22px 0;background:var(--sup)}
.faixa div{display:flex;gap:50px;width:max-content;animation:corre 30s linear infinite;font:400 clamp(26px,3.4vw,44px) var(--tit);${t.caixaAlta ? "text-transform:uppercase;" : "font-style:italic;"}white-space:nowrap}
.faixa span::after{content:"✦";color:var(--a1);margin-left:50px;font-style:normal}
@keyframes corre{to{transform:translateX(-50%)}}
section{padding:clamp(80px,12vh,140px) var(--pad);position:relative}
.cab{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:clamp(34px,6vh,64px)}
.cab h2{font-size:clamp(36px,5.2vw,76px);max-width:15ch;margin-top:14px}
.cab p{color:var(--mut);max-width:40ch}
.rev{opacity:0;transform:translateY(40px);transition:opacity 1s var(--ease),transform 1s var(--ease)}
.rev.in{opacity:1;transform:none}
/* números */
.nums{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--linha)}
.num{padding:34px 24px 10px 0;border-right:1px solid var(--linha)}.num:last-child{border:0}.num:not(:first-child){padding-left:24px}
.num b{display:block;font:400 clamp(44px,6vw,86px)/1 var(--tit);color:var(--txt)}
.num span{color:var(--mut);font-size:14px}
@media(max-width:700px){.nums{grid-template-columns:1fr}.num{border-right:0;border-bottom:1px solid var(--linha);padding-left:0!important}}
/* serviços */
.servs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;perspective:1200px}
@media(max-width:1000px){.servs{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.servs{grid-template-columns:1fr}}
.serv{position:relative;border:1px solid var(--linha);border-radius:24px;padding:30px;background:var(--sup);transform-style:preserve-3d;transition:transform .5s var(--ease),border-color .3s,box-shadow .4s;min-height:250px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden}
.serv::after{content:"";position:absolute;inset:0;background:radial-gradient(400px circle at var(--mx,50%) var(--my,50%),color-mix(in srgb,var(--a1) 18%,transparent),transparent 45%);opacity:0;transition:opacity .4s;pointer-events:none}
.serv:hover{border-color:var(--a1);box-shadow:0 30px 60px -36px rgba(0,0,0,.5)}.serv:hover::after{opacity:1}
.serv .ic{width:52px;height:52px;border-radius:16px;background:color-mix(in srgb,var(--a1) 16%,transparent);display:grid;place-items:center;color:var(--a1);transform:translateZ(30px)}
.serv .ic svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.serv h3{font-size:${t.caixaAlta ? 26 : 24}px;margin:26px 0 8px;transform:translateZ(20px)}
.serv p{color:var(--mut);font-size:15px}
.serv a{margin-top:18px;font-weight:700;color:var(--a1);font-size:15px;display:inline-flex;gap:8px;align-items:center}
.serv a::after{content:"→";transition:transform .3s}.serv:hover a::after{transform:translateX(6px)}
/* porque (fixo) */
.porque{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,6vw,100px)}
.porque .fixo{position:sticky;top:120px;align-self:start}
.porque .fixo h2{font-size:clamp(38px,5vw,72px);margin:14px 0 26px}
.porque .fixo .img{border-radius:28px;overflow:hidden;aspect-ratio:4/3}
.porque .fixo .img img{width:100%;height:120%;object-fit:cover}
.motivo{padding:44px 0;border-bottom:1px solid var(--linha);opacity:.28;transition:opacity .5s}
.motivo.on{opacity:1}
.motivo small{font:700 13px var(--cor);color:var(--a1);letter-spacing:.1em}
.motivo h3{font-size:clamp(26px,2.8vw,40px);margin:10px 0}
.motivo p{color:var(--mut);max-width:42ch}
@media(max-width:900px){.porque{grid-template-columns:1fr}.porque .fixo{position:static}.motivo{opacity:1}}
/* galeria */
.galeria{display:grid;grid-template-columns:1.3fr 1fr 1fr;grid-template-rows:280px 280px;gap:16px}
.galeria figure{border-radius:24px;overflow:hidden;position:relative}
.galeria figure:first-child{grid-row:span 2}
.galeria img{width:100%;height:115%;object-fit:cover;transition:transform .9s var(--ease)}
.galeria figure:hover img{transform:scale(1.06)}
@media(max-width:800px){.galeria{grid-template-columns:1fr 1fr;grid-template-rows:200px 200px 200px}.galeria figure:first-child{grid-column:span 2;grid-row:auto}}
/* passos e planos */
.passos{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;counter-reset:p}
@media(max-width:800px){.passos{grid-template-columns:1fr}}
.passo{border-top:2px solid var(--a1);padding-top:26px;counter-increment:p}
.passo::before{content:"0" counter(p);font:400 54px/1 var(--tit);color:var(--a1);display:block;margin-bottom:16px}
.passo h3{font-size:24px;margin-bottom:8px}.passo p{color:var(--mut)}
.planos{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:40px}
@media(max-width:900px){.planos{grid-template-columns:1fr}}
.plano{border:1px solid var(--linha);border-radius:26px;padding:34px;background:var(--sup);display:flex;flex-direction:column;gap:14px;transition:transform .4s var(--ease)}
.plano:hover{transform:translateY(-8px)}
.plano.dest{background:var(--a1);color:var(--on);border-color:var(--a1)}
.plano.dest p,.plano.dest li{color:var(--on);opacity:.85}
.plano h3{font-size:30px}.plano p{color:var(--mut)}
.plano ul{list-style:none;display:grid;gap:10px;margin:8px 0 18px;flex:1}
.plano li{color:var(--mut)}.plano li::before{content:"✓  ";color:var(--a1);font-weight:700}.plano.dest li::before{color:var(--on)}
.plano .btn{justify-content:center}
.plano.dest .btn-1{background:var(--on);color:var(--a1)}
/* cardápio */
.abas{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:26px}
.aba{border:1.5px solid var(--linha);background:none;color:var(--txt);border-radius:99px;padding:10px 20px;font:600 15px var(--cor);cursor:pointer}
.aba[aria-selected="true"]{background:var(--a1);border-color:var(--a1);color:var(--on)}
.lista{display:grid;grid-template-columns:repeat(2,1fr);gap:0 48px}.lista[hidden]{display:none}
@media(max-width:760px){.lista{grid-template-columns:1fr}}
.item{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:20px 0;border-bottom:1px dashed var(--linha)}
.item h4{font-size:19px}.item p{color:var(--mut);font-size:14px}
.item a{flex:none;width:44px;height:44px;border-radius:50%;background:var(--a1);color:var(--on);display:grid;place-items:center;font-size:22px;font-weight:700;transition:transform .3s}
.item a:hover{transform:rotate(90deg) scale(1.1)}
/* faq */
.faq{max-width:900px}
.faq details{border-bottom:1px solid var(--linha)}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:20px;padding:26px 0;font:600 clamp(18px,2vw,22px) var(--cor)}
.faq summary::after{content:"+";font-size:28px;line-height:1;color:var(--a1);transition:transform .4s var(--ease)}
.faq details[open] summary::after{transform:rotate(45deg)}
.faq details p{color:var(--mut);padding:0 0 26px;max-width:62ch}
/* chamada */
.chamada{text-align:center;overflow:hidden}
.chamada h2{font-size:clamp(46px,8vw,130px);max-width:14ch;margin:0 auto 34px}
.chamada::before{content:"";position:absolute;inset:auto -10% -60% -10%;height:120%;background:radial-gradient(ellipse at center,color-mix(in srgb,var(--a1) 25%,transparent),transparent 60%);pointer-events:none}
/* contato */
.contato{display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(30px,5vw,80px)}
@media(max-width:900px){.contato{grid-template-columns:1fr}}
.dado{padding:18px 0;border-bottom:1px solid var(--linha)}
.dado small{display:block;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--mut);margin-bottom:4px}
.dado div{white-space:pre-line}
.mapa{border-radius:28px;overflow:hidden;min-height:400px;background:var(--sup)}
.mapa iframe{width:100%;height:100%;min-height:400px;border:0;${t.escuro ? "filter:grayscale(.4) invert(.9) hue-rotate(180deg)" : ""}}
footer{padding:50px var(--pad) 120px;border-top:1px solid var(--linha);display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;color:var(--mut);font-size:14px}
footer .logo{color:var(--txt)}
.gigante{font:400 clamp(60px,17vw,260px)/.85 var(--tit);${t.caixaAlta ? "text-transform:uppercase;" : ""}letter-spacing:-.04em;padding:0 var(--pad);color:transparent;-webkit-text-stroke:1px var(--linha);white-space:nowrap;overflow:hidden}
.wa{position:fixed;right:22px;bottom:22px;z-index:70;width:62px;height:62px;border-radius:50%;background:#25d366;color:#fff;display:grid;place-items:center;box-shadow:0 16px 34px -12px rgba(0,0,0,.5);transform:scale(0);transition:transform .5s cubic-bezier(.2,1.6,.3,1)}
.wa svg{width:32px;height:32px}.pronto .wa{transform:none;transition-delay:1.6s}
.wa::before{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid #25d366;animation:anel 2.4s ease-out 3s infinite}
@keyframes anel{to{transform:scale(1.8);opacity:0}}
.barra{display:none}
@media(max-width:640px){.wa{display:none}.barra{display:flex;position:fixed;left:12px;right:12px;bottom:12px;z-index:70;justify-content:center;gap:10px;background:#25d366;color:#fff;border-radius:99px;padding:15px;font-weight:700;box-shadow:0 14px 30px -10px rgba(0,0,0,.5)}.barra svg{width:22px;height:22px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.rev,.fade{opacity:1;transform:none}.hero h1 .ln>span{transform:none}.carga{display:none}}
</style>
<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
</head>
<body>
<div class="carga" id="carga" aria-hidden="true"><b>${[...(d.marca || d.nome)].map((ch, i) => `<span style="animation-delay:${(i * 0.035).toFixed(3)}s">${ch === " " ? "&nbsp;" : tt(ch)}</span>`).join("")}</b><i></i></div>
<div class="prog" id="prog"></div>
<header class="topo" id="topo">
  <a href="#inicio" class="logo">${d.logo ? `<img src="${H(d.logo)}" alt="${H(d.nome)}">` : `<i></i>${tt(d.marca || d.nome)}`}</a>
  <nav class="menu"><a href="#servicos">${t.cardapio ? "Destaques" : "Serviços"}</a><a href="#porque">Sobre</a>${t.cardapio ? '<a href="#cardapio">Cardápio</a>' : faq.length ? '<a href="#duvidas">Dúvidas</a>' : ""}<a href="#contato">Contato</a></nav>
  <a class="btn btn-1 magnet" href="${H(pedir())}" target="_blank" rel="noopener">${WA}<span>${H(d.cta)}</span></a>
</header>
<main id="inicio">
<section class="hero">
  <div>
    <span class="olho fade">${H(t.rotulo)} · ${H(d.bairro || d.cidade)}</span>
    <h1 class="tit">${t.titulo.map((ln, i) => `<span class="ln"><span>${i === t.destaque ? `<em>${tt(ln)}</em>` : tt(ln)}</span></span>`).join("")}</h1>
    <p class="sub fade">${H(t.sub(d))}</p>
    <div class="acoes fade"><a class="btn btn-1 magnet" href="${H(pedir())}" target="_blank" rel="noopener">${WA}<span>${H(d.cta)}</span></a><a class="btn btn-2 magnet" href="#servicos"><span>${t.cardapio ? "Ver destaques" : "Conhecer"}</span></a></div>
    ${temNota ? `<div class="selo fade"><b>${nota}</b><span><strong>★★★★★</strong>${Number(d.avaliacoes).toLocaleString("pt-BR")} avaliações no Google</span></div>` : ""}
  </div>
  <div class="palco" aria-hidden="true">
    <canvas id="o3d"></canvas><div class="reserva"></div>
    <div class="chip c1"><b>${temNota ? nota + " ★" : "WhatsApp"}</b>${temNota ? "no Google" : "resposta rápida"}</div>
    <div class="chip c2"><b>${H(d.bairro || d.cidade)}</b>${H(d.cidade)}</div>
  </div>
  <span class="rolar">role</span>
</section>
<div class="faixa" aria-hidden="true"><div>${[...t.faixa, ...t.faixa].map((x) => `<span>${H(x)}</span>`).join("")}</div></div>

${temNota ? `<section style="padding-bottom:0"><div class="nums rev">
  <div class="num"><b data-n="${d.nota}" data-dec="1">0</b><span>nota no Google</span></div>
  <div class="num"><b data-n="${d.avaliacoes}">0</b><span>avaliações de clientes</span></div>
  <div class="num"><b>${H(d.bairro || d.cidade)}</b><span>${H(d.cidade)}</span></div>
</div></section>` : ""}

<section id="servicos">
  <div class="cab rev"><div><span class="olho">${t.cardapio ? "Os mais pedidos" : "O que fazemos"}</span><h2 class="tit">${t.cardapio ? tt("Dá fome só de olhar.") : tt("Tudo o que você precisa.")}</h2></div><p>Toque em um ${t.cardapio ? "prato" : "serviço"} para chamar no WhatsApp. A gente responde rápido.</p></div>
  <div class="servs">
  ${servicos.map((s, i) => `<article class="serv rev tilt" style="transition-delay:${(i % 3) * 90}ms"><div><div class="ic"><svg viewBox="0 0 24 24"><path d="${ICONES[i % ICONES.length]}"/></svg></div><h3 class="tit">${tt(s)}</h3><p>${H(descServ(s, i))}</p></div><a href="${H(pedir(s))}" target="_blank" rel="noopener">${t.cardapio ? "Quero esse" : "Quero saber mais"}</a></article>`).join("\n  ")}
  </div>
</section>

<section id="porque" style="padding-top:0">
  <div class="porque">
    <div class="fixo rev"><span class="olho">Por que ${H(d.marca || d.nome)}</span><h2 class="tit">${t.caixaAlta ? tt("Motivos para escolher a gente.") : "Motivos para <em style='color:var(--a1)'>escolher</em> a gente."}</h2><div class="img"><img src="${H(d.fotoReal || foto(1))}" alt="${H(d.nome)}" data-par="0.12" loading="lazy"></div></div>
    <div>
      ${difs.map((x, i) => { const [a, b] = String(x).split(/:\s(.+)/); return `<div class="motivo"><small>0${i + 1}</small><h3 class="tit">${tt(a)}</h3><p>${H(b || ["Faz diferença no dia a dia de quem escolhe a gente.", "É assim do primeiro contato até o resultado.", "Um detalhe do qual a gente não abre mão.", "Para você ficar tranquilo do começo ao fim."][i % 4])}</p></div>`; }).join("\n      ")}
      <div class="motivo"><small>0${difs.length + 1}</small><h3 class="tit">${tt("Sobre a gente")}</h3><p>${H(sobre)}</p></div>
    </div>
  </div>
</section>

<section style="padding-top:0"><div class="galeria rev">${[2, 3, 4, 5, 6].map((i, k) => `<figure><img src="${H(foto(i))}" alt="${H(d.nome)} ${k + 1}" data-par="0.08" loading="lazy"></figure>`).join("")}</div></section>

${t.cardapio ? `<section id="cardapio" style="background:var(--sup)">
  <div class="cab rev"><div><span class="olho">Cardápio</span><h2 class="tit">${tt("Escolha o seu.")}</h2></div><p>Toque no + para pedir pelo WhatsApp.</p></div>
  <div class="abas" role="tablist">${t.cardapio.map(([cat], i) => `<button class="aba" role="tab" data-aba="${i}" aria-selected="${i === 0}">${H(cat)}</button>`).join("")}</div>
  ${t.cardapio.map(([, itens], i) => `<div class="lista" data-lista="${i}" ${i ? "hidden" : ""}>${itens.map(([n, x]) => `<div class="item"><div><h4>${H(n)}</h4><p>${H(x)}</p></div><a href="${H(pedir(n))}" target="_blank" rel="noopener" aria-label="Pedir ${H(n)}">+</a></div>`).join("")}</div>`).join("\n  ")}
</section>` : ""}

<section>
  <div class="cab rev"><div><span class="olho">Como funciona</span><h2 class="tit">${tt("Simples assim.")}</h2></div></div>
  <div class="passos">${t.passos.map(([a, b], i) => `<div class="passo rev" style="transition-delay:${i * 100}ms"><h3 class="tit">${tt(a)}</h3><p>${H(b)}</p></div>`).join("")}</div>
  ${t.planos ? `<div class="planos">${t.planos.map(([n, s, itens], i) => `<div class="plano rev ${i === 1 ? "dest" : ""}" style="transition-delay:${i * 100}ms"><p>${H(s)}</p><h3 class="tit">${tt(n)}</h3><ul>${itens.map((x) => `<li>${H(x)}</li>`).join("")}</ul><a class="btn btn-1" href="${H(pedir("plano " + n.toLowerCase()))}" target="_blank" rel="noopener"><span>Consultar valor</span></a></div>`).join("")}</div>` : ""}
</section>

${faq.length ? `<section id="duvidas" style="padding-top:0"><div class="cab rev"><div><span class="olho">Dúvidas</span><h2 class="tit">${tt("Antes que você pergunte.")}</h2></div></div>
  <div class="faq rev">${faq.map(([q, a], i) => `<details ${i ? "" : "open"}><summary>${H(q)}</summary><p>${H(a || "Chame a gente no WhatsApp que explicamos tudo, sem compromisso.")}</p></details>`).join("")}</div></section>` : ""}

<section class="chamada"><h2 class="tit rev">${t.cardapio ? tt("Bateu a fome?") : tt("Vamos começar?")}</h2><a class="btn btn-1 magnet rev" href="${H(pedir())}" target="_blank" rel="noopener">${WA}<span>${H(d.cta)}</span></a></section>

<section id="contato" style="padding-top:0">
  <div class="contato">
    <div class="rev"><span class="olho">Onde estamos</span><h2 class="tit" style="font-size:clamp(36px,4.6vw,64px);margin:14px 0 24px">${tt("Vem pra cá.")}</h2>
      ${d.endereco ? `<div class="dado"><small>Endereço</small><div>${H(d.endereco)}</div></div>` : ""}
      <div class="dado"><small>Horário</small><div>${H(horario || "Consulte pelo WhatsApp")}</div></div>
      ${d.telefone ? `<div class="dado"><small>Telefone</small><div><a href="tel:+${H(d.telefoneNum)}">${H(d.telefone)}</a></div></div>` : ""}
      ${d.instagram ? `<div class="dado"><small>Instagram</small><div><a href="https://instagram.com/${H(d.instagram.replace("@", ""))}" target="_blank" rel="noopener">${H(d.instagram)}</a></div></div>` : ""}
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:26px">${d.mapsUrl ? `<a class="btn btn-1" href="${H(d.mapsUrl)}" target="_blank" rel="noopener"><span>Como chegar</span></a>` : ""}<a class="btn btn-2" href="${H(pedir())}" target="_blank" rel="noopener">${WA}<span>WhatsApp</span></a></div>
    </div>
    <div class="mapa rev"><iframe title="Mapa de ${H(d.nome)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${H(mapa)}"></iframe></div>
  </div>
</section>
</main>
<div class="gigante" aria-hidden="true">${tt(d.marca || d.nome)}</div>
<footer><a href="#inicio" class="logo"><i></i>${tt(d.marca || d.nome)}</a><span>© ${new Date().getFullYear()} ${H(d.nome)}</span></footer>
<a class="wa magnet" href="${H(pedir())}" target="_blank" rel="noopener" aria-label="Chamar no WhatsApp">${WA}</a>
<a class="barra" href="${H(pedir())}" target="_blank" rel="noopener">${WA} ${H(d.cta)}</a>
<script type="application/json" id="cfg3d">${cfg3d}</script>
<script>${INTERACOES}</script>
<script type="module">${MOTOR_3D}</script>
</body>
</html>`;
}

// interações da página (sem crases nem ${ } aqui dentro)
const INTERACOES = String.raw`
(function(){
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduz=matchMedia("(prefers-reduced-motion: reduce)").matches,fino=matchMedia("(hover:hover) and (pointer:fine)").matches;
function abrir(){var c=$("#carga");if(c)c.classList.add("fora");document.documentElement.classList.add("pronto")}
if(reduz)abrir();else setTimeout(abrir,1250);
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;e.target.classList.add("in");io.unobserve(e.target);
  $$("[data-n]",e.target).forEach(function(el){var fim=parseFloat(el.dataset.n),dec=el.dataset.dec?1:0,t0=performance.now();
    (function anda(t){var p=Math.min(1,(t-t0)/1600),v=fim*(1-Math.pow(1-p,4));el.textContent=dec?v.toFixed(1).replace(".",","):Math.round(v).toLocaleString("pt-BR");if(p<1)requestAnimationFrame(anda)})(t0)})})},{threshold:.18});
$$(".rev").forEach(function(el){io.observe(el)});
var mot=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle("on",e.isIntersecting)})},{rootMargin:"-40% 0px -40% 0px"});
$$(".motivo").forEach(function(el){mot.observe(el)});
var topo=$("#topo"),prog=$("#prog"),ultimo=0,par=$$("[data-par]");
function rolar(){var y=scrollY,h=document.documentElement.scrollHeight-innerHeight;prog.style.width=(h>0?y/h*100:0)+"%";
  topo.classList.toggle("solido",y>40);topo.classList.toggle("some",y>ultimo&&y>500);ultimo=y;
  if(!reduz)par.forEach(function(img){var r=img.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var k=parseFloat(img.dataset.par);img.style.transform="translateY("+((r.top+r.height/2-innerHeight/2)*-k)+"px)"})}
addEventListener("scroll",rolar,{passive:true});rolar();
if(fino&&!reduz){
  $$(".tilt").forEach(function(c){c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.transform="rotateY("+((x-.5)*12)+"deg) rotateX("+((.5-y)*10)+"deg)";c.style.setProperty("--mx",x*100+"%");c.style.setProperty("--my",y*100+"%")});c.addEventListener("pointerleave",function(){c.style.transform=""})});
  $$(".magnet").forEach(function(b){b.addEventListener("pointermove",function(e){var r=b.getBoundingClientRect();b.style.transform="translate("+((e.clientX-r.left-r.width/2)*.25)+"px,"+((e.clientY-r.top-r.height/2)*.3)+"px)"});b.addEventListener("pointerleave",function(){b.style.transform=""})});
}
$$(".aba").forEach(function(b){b.addEventListener("click",function(){$$(".aba").forEach(function(x){x.setAttribute("aria-selected",String(x===b))});$$("[data-lista]").forEach(function(l){l.hidden=l.dataset.lista!==b.dataset.aba})})});
})();
`;
