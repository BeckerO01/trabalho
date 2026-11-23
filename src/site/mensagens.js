// Mensagens prontas por etapa (mesmas do Radar no Claude: artifact/radar-de-leads.html).
import { nomeCurto, perfil, ondeFica } from "./gerador.js";
const hashN = (s, n) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % n; };
let cfg = {};
const CENARIOS = {
  novo: [
    ["Olá completo", (l) => msgOla(l, "completa")],
    ["Olá curto", (l) => msgOla(l, "curta")],
  ],
  contatado: [
    ["1º retorno", (l) => msgRetorno(l)],
    ["2º retorno: oferecer prévia", (l) => `Oi! ${cfg.nome ? "Aqui é " + cfg.nome + ". " : ""}Para ficar mais fácil de visualizar, posso montar uma prévia do site de ${nomeCurto(l)} e te mandar por aqui, sem custo. Se gostar, a gente conversa; se não, sem problema nenhum. Posso fazer?`],
    ["Última tentativa", (l) => `Olá! Como não consegui retorno, vou encerrar por aqui para não incomodar. Se em algum momento vocês quiserem um site para ${nomeCurto(l)} aparecer melhor no Google, é só me chamar neste número. Sucesso para vocês!`],
  ],
  respondeu: [
    ["Perguntou quem é / do que se trata", (l) => `Claro! ${cfg.nome ? "Sou " + cfg.nome + " e crio" : "Eu crio"} sites para negócios locais. ${l.siteTipo === "proprio" ? "Vi o site de vocês e tenho ideias para ele trazer mais contatos." : l.siteTipo === "rede_social" ? "Vi que vocês estão só nas redes sociais, sem site próprio." : "Procurei vocês no Google e não achei um site."} A ideia é simples: um site que faz ${nomeCurto(l)} aparecer quando alguém procura ${perfil(l).termo}${ondeFica(l).cidade ? " em " + ondeFica(l).cidade : ""} e leva a pessoa direto para o WhatsApp de vocês. Posso te mandar um exemplo?`],
    ["Perguntou o preço", () => `Boa pergunta! ${cfg.preco ? "O investimento é " + cfg.preco + "." : "O investimento é [VALOR]."} Inclui o site pronto, feito para celular, com botão de WhatsApp, mapa e avaliações do Google. Antes de fechar qualquer coisa, eu monto uma prévia para vocês verem como fica. Quer que eu prepare?`],
    ["Tem interesse", (l) => `Que bom! Vou montar uma prévia do site de ${nomeCurto(l)} e te mando por aqui. Para ficar com a cara de vocês, pode me enviar o logo e 3 ou 4 fotos do espaço ou do trabalho? Se tiver os horários de atendimento e a lista dos principais serviços, ajuda bastante.`],
    ["Disse que já tem Instagram", (l) => `Entendo, e o Instagram de vocês é importante mesmo. A diferença é que quem pesquisa "${perfil(l).termo}${ondeFica(l).cidade ? " em " + ondeFica(l).cidade : ""}" no Google não chega no Instagram: chega em quem tem site. Os dois se somam: o site traz quem está procurando agora, e o Instagram mantém o relacionamento. Posso te mostrar em 1 minuto como ficaria?`],
    ["Pediu para falar com outra pessoa", (l) => `Perfeito, obrigado! Qual o melhor número ou horário para eu falar com essa pessoa? Se preferir, pode encaminhar esta mensagem: é sobre um site para ${nomeCurto(l)} aparecer melhor no Google.`],
    ["Sem interesse agora", (l) => `Sem problema, obrigado por responder! Se mais para frente fizer sentido ter um site, é só me chamar neste número. Sucesso para ${nomeCurto(l)}!`],
  ],
  negociando: [
    ["Enviar proposta", (l) => `Segue a proposta para o site de ${nomeCurto(l)}:\n\n• Site de uma página, feito para celular\n• Botão de WhatsApp em todas as seções\n• Mapa, horários e avaliações do Google\n• Textos e fotos organizados por mim\n• Prazo: ${cfg.prazo || "[PRAZO]"}\n• Investimento: ${cfg.preco || "[VALOR]"}\n\nPara começar preciso só do seu ok e das fotos. Fechamos?`],
    ["Cobrar resposta da proposta", () => `Oi! Conseguiu ver a proposta do site? Se ficou alguma dúvida sobre valor, prazo ou o que está incluso, me fala que eu explico. Se precisar, ajusto a proposta para caber melhor no momento de vocês.`],
    ["Achou caro", () => `Entendo. Pensa assim: se o site trouxer um ou dois clientes novos por mês, ele já se paga, e continua trabalhando todos os dias sem anúncio. Posso dividir o valor em parcelas ou começar por uma versão mais simples. O que fica melhor para vocês?`],
    ["Disse que vai pensar", () => `Claro, sem pressa. Para ajudar na decisão, posso deixar a prévia no ar por alguns dias para vocês mostrarem para quem quiser. Que dia posso te chamar de novo para saber o que acharam?`],
  ],
  fechado: [
    ["Boas-vindas e próximos passos", () => `Fechado, obrigado pela confiança! Próximos passos:\n1. Você me envia logo, fotos, horários e lista de serviços.\n2. Eu te mando a primeira versão em ${cfg.prazo || "[PRAZO]"}.\n3. Você pede os ajustes e a gente publica.\n\nQualquer dúvida, é só chamar aqui.`],
    ["Entregar o site", (l) => `O site de ${nomeCurto(l)} está no ar: [LINK]. Dá uma olhada no celular e no computador e me diz se quer algum ajuste. Vale colocar o link na bio do Instagram e na ficha do Google.`],
    ["Pedir indicação", () => `Fico feliz que gostou do site! Se conhecer outro negócio que ainda não tem site, me indica? Atendo com o mesmo capricho.`],
  ],
  perdido: [
    ["Agradecer e deixar a porta aberta", (l) => `Sem problema, obrigado pelo retorno! Se mais para frente fizer sentido ter um site, é só me chamar neste número. Sucesso para ${nomeCurto(l)}!`],
    ["Retomar depois de um tempo", (l) => `Olá! ${cfg.nome ? "Aqui é " + cfg.nome + ". " : ""}Conversamos há um tempo sobre um site para ${nomeCurto(l)}. Estou com agenda aberta este mês e lembrei de vocês. Faz sentido retomar a conversa?`],
  ],
};
// mensagem do site de demonstração (o site é criado e publicado pelo programa do PC)
function msgSite(l) {
  const nota = l.nota && l.avaliacoes >= 10 ? ` (nota ${String(l.nota).replace(".", ",")} com ${l.avaliacoes} avaliações, parabéns!)` : "";
  const falta = l.siteTipo === "proprio" ? "e tive algumas ideias para deixar o site de vocês ainda melhor" : l.siteTipo === "rede_social" ? "e notei que vocês ainda não têm um site próprio, só as redes sociais" : "e notei que vocês ainda não têm um site";
  const oferta = cfg.preco ? `\n\nO site completo sai por ${cfg.preco}${cfg.prazo ? ", e fica pronto em " + cfg.prazo : ""}.` : "";
  return `Olá, tudo bem? ${apresentacao()}\n\nEncontrei a ${nomeCurto(l)} no Google${nota} ${falta}. Por isso montei uma demonstração de como ficaria, sem compromisso nenhum:\n👉 ${l.siteUrl}${portfolio()}${oferta}\n\nSe gostar, é só me responder aqui que eu ajusto com as fotos e as informações de vocês. 😊`;
}
function cenariosDe(etapa, l) {
  const base = CENARIOS[etapa] || [];
  if (!l?.siteUrl || ["fechado", "perdido"].includes(etapa)) return base;
  const site = [l.siteEnviado ? "Mandar o link do site de novo" : "Mandar o site pronto", msgSite];
  return l.siteEnviado ? [...base, site] : [site, ...base];
}
const DICA_ETAPA = { novo: "Ainda não recebeu mensagem.", contatado: "Você mandou mensagem e ainda não teve resposta.", respondeu: "O cliente respondeu. Escolha o que ele disse ou cole a resposta para a IA ajudar.",
  negociando: "Tem interesse: proposta e negociação.", fechado: "Cliente fechado.", perdido: "Não quis ou não respondeu depois de várias tentativas." };
const apresentacao = () => `Meu nome é ${cfg.nome || "[SEU NOME]"}, sou web designer e crio sites para negócios locais.`;
const portfolio = () => {
  const ig = cfg.instagram ? `https://instagram.com/${String(cfg.instagram).replace(/^@|^https?:\/\/(www\.)?instagram\.com\//g, "").replace(/\/.*$/, "")}` : "";
  if (cfg.portfolio && ig) return `\n\nAqui você conhece meu trabalho:\n• Portfólio: ${cfg.portfolio}\n• Instagram: ${ig}`;
  return cfg.portfolio || ig ? `\n\nAqui você conhece meu trabalho: ${cfg.portfolio || ig}` : "";
};
function msgOla(l, tipo = cfg.msgTipo || "completa") {
  const emp = nomeCurto(l), v = hashN(l.id || l.nome, 3), p = perfil(l), o = ondeFica(l);
  const eu = tipo === "curta" ? (cfg.nome ? `Aqui é ${cfg.nome}. ` : "") : apresentacao() + " ";
  const nota = l.nota ? String(l.nota).replace(".", ",") : "";
  const gancho = l.avaliacoes >= 30 && nota ? `Vi vocês no Google: nota ${nota} com ${l.avaliacoes} avaliações, parabéns!`
    : l.instagram ? `Vi o Instagram de vocês (${l.instagram}) e gostei do trabalho.` : "Encontrei vocês no Google Maps.";
  const oi = ["Olá! Tudo bem?", "Oi, tudo bem?", "Olá, tudo bem por aí?"][v];
  if (tipo === "curta") {
    const pergunta = ["Consigo falar rapidinho com quem cuida da divulgação?", "Quem é a pessoa responsável pelo marketing aí? Tenho uma ideia rápida para vocês.", "Posso falar com o responsável? É rápido, sobre como vocês aparecem no Google."][v];
    return `${oi} ${eu}Falo com ${emp}?\n\n${gancho} ${pergunta}`;
  }
  const oferta = cfg.oferta || "Eu crio sites rápidos e acessíveis para negócios locais.";
  const fecho = ["Posso te mostrar um exemplo de como ficaria o de vocês, sem compromisso?", "Quer que eu monte uma prévia gratuita para vocês verem?", "Posso mandar uma ideia de como ficaria? É sem compromisso."][v];
  if (l.siteTipo === "proprio") return `${oi} ${eu}Falo com ${emp}?\n\n${gancho} Dei uma olhada no site de vocês e tenho algumas ideias para ele trazer mais contatos pelo Google e pelo WhatsApp.\n\n${oferta} ${fecho}${portfolio()}`;
  const falta = l.siteTipo === "rede_social" ? "Mas notei que vocês ainda não têm um site próprio, só as redes sociais." : "Mas não encontrei um site de vocês.";
  return `${oi} ${eu}Falo com ${emp}?\n\n${gancho} ${falta}\n\nMuita gente pesquisa por ${p.termo}${o.cidade ? " em " + o.cidade : ""} no Google antes de escolher, e um site simples faz vocês aparecerem nessas buscas e passa mais confiança.\n\n${oferta} ${fecho}${portfolio()}`;
}
function msgRetorno(l) {
  const v = hashN(l.id || l.nome, 2);
  return [`Oi, tudo bem? ${cfg.nome ? "Aqui é " + cfg.nome + " de novo. " : ""}Mandei uma mensagem há alguns dias sobre o site de ${nomeCurto(l)}. Conseguiu ver? Se preferir, monto uma prévia para vocês avaliarem, sem compromisso.`,
    `Olá! ${cfg.nome ? "Aqui é " + cfg.nome + ". " : ""}Passando só para saber se você viu minha mensagem sobre o site de ${nomeCurto(l)}. Posso te mandar um exemplo pronto para dar uma olhada?`][v];
}
/** Todas as mensagens prontas de um lead, por etapa */
export function mensagensDoLead(l, config) {
  cfg = { msgTipo: "completa", ...(config || {}) };
  l = { ...l, siteUrl: l.siteDemo?.status === "pronto" ? l.siteDemo.url : l.siteUrl || "" };
  const out = {};
  for (const e of Object.keys(CENARIOS)) out[e] = cenariosDe(e, l).map(([nome, f]) => ({ nome, texto: f(l) }));
  return { mensagens: out, dicas: DICA_ETAPA };
}
