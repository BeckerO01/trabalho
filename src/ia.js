// Mensagem de abordagem: Claude (se houver chave) ou modelo pronto.
import Anthropic from "@anthropic-ai/sdk";

export function mensagemPronta(lead, cfg) {
  const quem = cfg.nome ? `Aqui é ${cfg.nome}.` : "Tudo bem?";
  const gancho =
    lead.avaliacoes >= 30 ? `Vi que vocês têm ${lead.avaliacoes} avaliações no Google, parabéns! Mas`
    : lead.instagram ? "Vi o Instagram de vocês, mas"
    : "Procurei vocês no Google e";
  const falta = lead.siteTipo === "rede_social" ? "não encontrei um site próprio, só as redes sociais." : "não encontrei um site.";
  const tipo = (lead.categoria || "o seu ramo").toLowerCase();
  const nome = lead.nome.split(/\s[|–-]\s/)[0].trim();
  return `Olá, ${nome}! ${quem} ${gancho} ${falta}\n\n` +
    `Quem procura ${tipo} costuma pesquisar no Google antes de escolher, e um site simples ajuda a aparecer nessas buscas e passa mais confiança.\n\n` +
    `${cfg.oferta || "Eu crio sites rápidos e acessíveis para negócios locais."} Posso te mostrar um exemplo de como ficaria o de vocês, sem compromisso?`;
}

export async function mensagemIA(lead, cfg) {
  const apiKey = process.env.ANTHROPIC_API_KEY || cfg.anthropicKey;
  if (!apiKey) return { texto: mensagemPronta(lead, cfg), fonte: "modelo" };
  const client = new Anthropic({ apiKey });
  const dados = {
    negocio: lead.nome, categoria: lead.categoria || null, endereco: lead.endereco || null,
    situacao_site: lead.siteTipo === "rede_social" ? "só tem rede social / link na bio" : lead.siteTipo === "nenhum" ? "não tem site" : "tem site próprio",
    instagram: lead.instagram || null, nota_google: lead.nota, avaliacoes_google: lead.avaliacoes, anotacoes: lead.notas || null,
  };
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system:
      "Você escreve a primeira mensagem de WhatsApp de um profissional que cria sites para um negócio local brasileiro. " +
      "Português do Brasil, tom cordial e direto, no máximo 80 palavras, no máximo um emoji, sem promessas exageradas. " +
      "Use um detalhe real dos dados (avaliações, Instagram, bairro ou ramo), mostre um benefício concreto e termine com uma pergunta simples. " +
      "Responda apenas com o texto da mensagem.",
    messages: [{
      role: "user",
      content: `Remetente: ${cfg.nome || "(sem nome; não assine)"}\nOferta: ${cfg.oferta || "criação de sites para negócios locais"}\nDados: ${JSON.stringify(dados)}`,
    }],
  });
  if (response.stop_reason === "refusal") return { texto: mensagemPronta(lead, cfg), fonte: "modelo" };
  const texto = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  return texto ? { texto, fonte: "ia" } : { texto: mensagemPronta(lead, cfg), fonte: "modelo" };
}
