// Gerado a partir do Radar do Claude (artifact/radar-de-leads.html): perfis de ramo e gerador de site.
// Fonte da verdade dos perfis: o artefato. Para atualizar, copie de lá os blocos equivalentes.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const AQUI = path.dirname(fileURLToPath(import.meta.url));
import { ehRestaurante, renderRestaurante, destaquesPadrao } from "./modelos/restaurante.js";
const BASE_REF = fs.readFileSync(path.join(AQUI, "molde-aurora.html"), "utf8");
const cfg = {};
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function numeroWhats(tel) {
  let d = String(tel || "").split(/[;,/]/)[0].replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("55") && d.length <= 11) d = "55" + d;
  return d.length >= 12 ? d : "";
}
const telBR = (t) => { const d = String(t || "").replace(/\D/g, "").replace(/^55/, ""); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : t || ""; };
const NICHOS = {
  barbearia: ["Barbearias", "barbearia", 10], salao: ["Salões de beleza", "salão de beleza", 12],
  restaurante: ["Restaurantes", "restaurante", 12], lanchonete: ["Lanchonetes e hamburguerias", "hamburgueria", 10],
  padaria: ["Padarias e confeitarias", "padaria", 8], oficina: ["Oficinas mecânicas", "oficina mecânica", 15],
  dentista: ["Dentistas", "dentista", 20], clinica: ["Clínicas e consultórios", "clínica", 20],
  estetica: ["Clínicas de estética", "clínica de estética", 18], academia: ["Academias e studios", "academia", 15],
  pet: ["Pet shops e veterinários", "pet shop", 12], roupas: ["Lojas de roupas", "loja de roupas", 10],
  advogado: ["Advogados", "advogado", 20], contador: ["Contadores", "contabilidade", 18],
  imobiliaria: ["Imobiliárias", "imobiliária", 18], eletricista: ["Eletricistas e reformas", "eletricista", 14],
};
const rotulo = (l) => l.categoria || NICHOS[l.nicho]?.[0] || "";
const semAcento = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const hashN = (s, n) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % n; };
const GENERICAS = /^(clinica|centro|consultorio|escritorio|studio|estudio|espaco|instituto|salao|loja|de|da|do|e|em|estetica|avancada|odontologica|odontologia|medica|beleza|saude|advocacia|contabilidade|facial|corporal|integrada|especializada)$/;
function nomeCurto(l) {
  const partes = String(l.nome || "").split(/\s[|–-]\s|\s*[|:]\s*/).map((x) => x.trim()).filter(Boolean);
  if (!partes.length) return String(l.nome || "");
  // se o primeiro trecho só tem palavras genéricas ("Clínica estética avançada"), junta o trecho que identifica a empresa
  const generico = semAcento(partes[0]).split(/\s+/).every((w) => GENERICAS.test(w));
  return (generico && partes[1] ? partes[0] + " " + partes[1] : partes[0]).slice(0, 70);
}
function ondeFica(l) {
  const m = String(l.endereco || "").match(/-\s*([^,\-]+),\s*([^,\-]+?)\s*-\s*([A-Z]{2})\b/);
  if (m) return { bairro: m[1].trim(), cidade: m[2].trim(), uf: m[3] };
  const c = String(l.cidade || "");
  return { bairro: "", cidade: c.split(/[,-]/)[0].trim(), uf: (c.match(/\b([A-Z]{2})\b/) || [])[1] || "" };
}

// ---------- perfis de ramo: público, cores, fontes, fotos, motion, seções ----------
// paleta: [fundo, superfície, texto, texto secundário, primária (botões), acento]
const PERFIS = [
  { id: "oficina", re: /oficina|mecanic|auto ?center|funilaria|autoeletric|auto pecas|lava ?(jato|car|rapido)|automotiv|borrachar|pneu/, termo: "oficina mecânica", schema: "AutoRepair",
    publico: "motoristas da região que precisam resolver um problema no carro sem medo de serem enganados", dor: "desconfiança de orçamento inflado e carro parado por muitos dias",
    promessa: "diagnóstico honesto, orçamento antes de mexer e prazo cumprido", tom: "direto, técnico sem jargão, transmite honestidade",
    paleta: ["#FFFFFF", "#F1F3F5", "#14181D", "#5A636E", "#C62828", "#1F2A37"], fontes: ["Barlow Condensed (600/700)", "Barlow (400/500)"],
    heads: ["Seu carro resolvido sem surpresa no orçamento", "Oficina de confiança em {cidade}"], cta: "Pedir orçamento", waMsg: "Olá! Vim pelo site e quero um orçamento para o meu carro.",
    servicos: ["Revisão completa", "Freios e suspensão", "Troca de óleo e filtros", "Injeção eletrônica e diagnóstico por scanner", "Ar-condicionado automotivo", "Embreagem e câmbio"],
    difs: ["Orçamento aprovado por WhatsApp antes de qualquer serviço", "Peças com garantia e nota fiscal", "Fotos e vídeo do problema enviados ao cliente", "Prazo combinado e cumprido"],
    extras: [["Como funciona", "4 passos em linha: 1) Você chama no WhatsApp 2) Diagnóstico 3) Orçamento aprovado por você 4) Carro pronto no prazo."], ["Marcas atendidas", "Faixa com nomes das montadoras atendidas em texto (sem usar logotipos oficiais)."]],
    fotos: [["Hero", "mecânico uniformizado de costas para um carro no elevador, oficina limpa e organizada, ferramentas alinhadas na parede", "4:5"], ["Serviços", "close de mãos com luva trocando pastilha de freio, disco em foco", "1:1"], ["Serviços", "scanner de diagnóstico conectado ao painel do carro, tela legível mas sem marca", "1:1"], ["Diferenciais", "mecânico mostrando a peça gasta ao cliente, os dois olhando a peça", "3:2"], ["Sobre", "equipe em frente à fachada da oficina, luz do dia, postura natural", "16:9"], ["Galeria", "box de serviço visto de frente, piso limpo, carro com capô aberto", "3:2"]],
    motion: "Assinatura: uma linha fina vermelha que 'liga' os 4 passos do Como funciona conforme a rolagem (stroke-dashoffset), como um medidor enchendo.",
    faq: ["Vocês fazem orçamento sem compromisso?", "Quanto tempo leva uma revisão?", "As peças têm garantia?", "Posso acompanhar o serviço por WhatsApp?", "Atendem quais marcas e modelos?"] },

  { id: "odonto", re: /odont|dentist|ortodont|implante|sorriso/, termo: "dentista", schema: "Dentist",
    publico: "adultos e famílias da região que adiam a ida ao dentista por medo, preço ou falta de indicação", dor: "medo de dor, insegurança sobre o valor e vergonha do sorriso",
    promessa: "atendimento acolhedor, explicação clara do tratamento e avaliação fácil de agendar", tom: "acolhedor, calmo e profissional; nunca infantil",
    paleta: ["#FFFFFF", "#F3F8FA", "#10242E", "#5A6F7A", "#0E7C9B", "#19B5A5"], fontes: ["Plus Jakarta Sans (600/700)", "Inter (400/500)"],
    heads: ["Cuidar do sorriso pode ser tranquilo", "Dentista em {cidade} com atendimento sem pressa"], cta: "Agendar avaliação", waMsg: "Olá! Vim pelo site e quero agendar uma avaliação.",
    servicos: ["Limpeza e prevenção", "Clareamento dental", "Aparelhos e alinhadores", "Implantes dentários", "Lentes e facetas", "Tratamento de canal"],
    difs: ["Avaliação com explicação completa do plano de tratamento", "Parcelamento facilitado", "Atendimento pontual, sem sala de espera cheia", "Biossegurança e materiais esterilizados a cada consulta"],
    extras: [["Primeira consulta", "Bloco que explica o que acontece na avaliação em 3 passos (conversa, exame, plano), para tirar o medo de quem nunca foi."]],
    fotos: [["Hero", "paciente adulta sorrindo de forma natural na cadeira, dentista ao lado fora de foco, consultório claro com luz de janela", "4:5"], ["Serviços", "close de sorriso real, dentes naturais, sem brancura artificial", "1:1"], ["Serviços", "alinhador transparente na mão sobre fundo claro", "1:1"], ["Estrutura", "consultório vazio, cadeira e equipamento alinhados, tons claros", "3:2"], ["Sobre", "retrato do(a) dentista responsável de jaleco, meio corpo, fundo neutro do consultório, olhar para a câmera", "4:5"], ["Recepção", "recepção com balcão e poltronas, planta, ninguém posando", "16:9"]],
    motion: "Assinatura: um arco suave (como a curva de um sorriso) desenhado em SVG sob o título do hero, traçado em 900 ms ao carregar.",
    faq: ["A avaliação é paga?", "Vocês parcelam o tratamento?", "Atendem convênio?", "Clareamento dói ou dá sensibilidade?", "Quanto tempo dura um tratamento com aparelho?"],
    regras: "Odontologia segue o Código de Ética do CFO: não prometer resultado, não anunciar preço ou desconto como chamariz, e só usar antes e depois dentro das regras do conselho e com autorização do paciente. Incluir nome e CRO do responsável técnico no rodapé." },

  { id: "barbearia", re: /barbe/, termo: "barbearia", schema: "HairSalon",
    publico: "homens de 18 a 45 anos da região que querem corte bem feito, horário marcado e ambiente bom", dor: "esperar em fila e sair com um corte diferente do pedido",
    promessa: "corte no capricho, com hora marcada e sem espera", tom: "confiante, descontraído, masculino sem clichê",
    paleta: ["#F7F5F2", "#FFFFFF", "#171514", "#6B645E", "#1F1B18", "#B8732E"], fontes: ["Oswald (500/600)", "Inter (400/500)"],
    heads: ["Corte no capricho, com hora marcada", "A sua barbearia em {cidade}"], cta: "Agendar horário", waMsg: "Olá! Vim pelo site e quero agendar um horário.",
    servicos: ["Corte masculino", "Barba completa com toalha quente", "Corte + barba", "Degradê / fade", "Sobrancelha", "Pigmentação e platinado"],
    difs: ["Agendamento pelo WhatsApp em 1 minuto", "Barbeiros especialistas em degradê", "Ambiente climatizado, com café ou cerveja", "Pontualidade: seu horário é seu"],
    extras: [["Tabela de serviços", "Lista simples em duas colunas (serviço e duração). Preços só se o cliente confirmar."], ["Equipe", "Cards dos barbeiros com foto, primeiro nome e especialidade."]],
    fotos: [["Hero", "barbeiro finalizando um degradê com máquina, cliente de perfil na cadeira, luz lateral quente", "4:5"], ["Serviços", "close de navalha fazendo o contorno da barba", "1:1"], ["Serviços", "nuca com degradê recém-feito, acabamento nítido", "1:1"], ["Ambiente", "cadeiras de barbeiro alinhadas e espelhos, sem pessoas", "16:9"], ["Equipe", "retratos dos barbeiros de avental, braços cruzados, fundo da barbearia", "4:5"], ["Detalhe", "bancada com pentes, tesouras e pincel organizados", "3:2"]],
    motion: "Assinatura: no hover dos cards de serviço, uma linha cor de cobre cresce da esquerda para a direita sob o nome (200 ms), como o passe de uma navalha.",
    faq: ["Preciso agendar ou posso chegar na hora?", "Quanto tempo dura corte e barba?", "Quais formas de pagamento?", "Atendem crianças?", "Tem estacionamento por perto?"] },

  { id: "pet", re: /\bpet\b|petshop|veterin|banho e tosa|animal|animais/, termo: "pet shop", schema: "PetStore",
    publico: "tutores de cães e gatos da região que tratam o pet como família", dor: "medo de maus-tratos, estresse do animal e falta de notícias durante o serviço",
    promessa: "cuidado com carinho, transparência e notícias do pet pelo WhatsApp", tom: "carinhoso, leve e responsável",
    paleta: ["#FFFDF8", "#F1F7F4", "#1D2B2A", "#617372", "#1F8A70", "#F2A541"], fontes: ["Baloo 2 (600/700)", "Nunito (400/600)"],
    heads: ["Seu pet cuidado como se fosse nosso", "Banho, tosa e carinho em {cidade}"], cta: "Agendar pelo WhatsApp", waMsg: "Olá! Vim pelo site e quero agendar um horário para o meu pet.",
    servicos: ["Banho e tosa", "Tosa higiênica e na tesoura", "Consulta veterinária", "Vacinas", "Hidratação e cuidados com a pelagem", "Táxi dog (leva e traz)"],
    difs: ["Fotos e vídeos do pet durante o atendimento", "Profissionais treinados em manejo sem estresse", "Produtos hipoalergênicos", "Ambiente higienizado a cada atendimento"],
    extras: [["Para cães e gatos", "Duas colunas com cuidados específicos de cada espécie."]],
    fotos: [["Hero", "cachorro de porte médio recém-tosado, feliz, olhando para a câmera, fundo claro do pet shop", "4:5"], ["Serviços", "banho em cão com espuma, mãos do profissional com cuidado visível", "1:1"], ["Serviços", "gato calmo sendo escovado sobre a mesa", "1:1"], ["Estrutura", "sala de banho limpa, banheiras e secadores organizados", "3:2"], ["Equipe", "profissional de uniforme abraçando um cão, sorriso natural", "4:5"], ["Galeria", "sequência de pets prontos com lacinho ou bandana", "1:1"]],
    motion: "Assinatura: pequenas patinhas (SVG) aparecem em sequência atrás do botão principal do hero uma única vez ao carregar (stagger de 120 ms, opacidade até 40%).",
    faq: ["Preciso agendar o banho?", "Vocês buscam e levam o pet?", "Quanto tempo dura o banho e tosa?", "Atendem gatos?", "Quais vacinas o pet precisa ter?"] },

  { id: "advocacia", re: /advoc|advog|juridic|direito/, termo: "advogado", schema: "LegalService",
    publico: "pessoas e pequenas empresas com um problema jurídico concreto, procurando alguém confiável para explicar o caminho", dor: "não entender o próprio problema e medo de custo e demora",
    promessa: "orientação clara, atendimento próximo e acompanhamento do caso", tom: "sóbrio, claro e humano; linguagem simples, sem juridiquês",
    paleta: ["#FFFFFF", "#F4F3F0", "#14202E", "#5E6875", "#14304F", "#A6844C"], fontes: ["Libre Baskerville (400/700)", "Source Sans 3 (400/600)"],
    heads: ["Orientação jurídica clara para o seu caso", "Advocacia em {cidade} com atendimento próximo"], cta: "Falar com um advogado", waMsg: "Olá! Vim pelo site e gostaria de falar sobre um caso.",
    servicos: ["Direito de Família e Sucessões", "Direito Trabalhista", "Direito Previdenciário", "Direito do Consumidor", "Direito Imobiliário", "Direito Empresarial"],
    difs: ["Primeiro atendimento com explicação do caminho possível", "Acompanhamento do processo com atualizações", "Atendimento presencial e online", "Sigilo profissional"],
    extras: [["Áreas de atuação", "Grade de cards, cada área com 2 linhas explicando em que situações procurar."], ["Como é o atendimento", "3 passos: contato, análise do caso, proposta de atuação."]],
    fotos: [["Hero", "advogado(a) em reunião, ouvindo um cliente de costas para a câmera, mesa limpa, luz de janela, roupas sóbrias", "4:5"], ["Sobre", "retrato profissional do(a) advogado(a) responsável, meio corpo, fundo neutro do escritório", "4:5"], ["Escritório", "sala de reunião vazia, mesa, cadeiras e estante discreta", "16:9"], ["Detalhe", "mãos assinando um documento, caneta em foco", "3:2"], ["Fachada", "entrada ou recepção do escritório com a placa", "3:2"]],
    motion: "Assinatura: nenhuma animação chamativa. Apenas um fio dourado de 1 px que se desenha sob os títulos de seção ao entrarem na tela (400 ms).",
    faq: ["Como funciona o primeiro atendimento?", "Vocês atendem online?", "Quais documentos preciso levar?", "Como são definidos os honorários?", "Quanto tempo leva um processo?"],
    regras: "Publicidade na advocacia segue o Provimento 205/2021 da OAB: caráter informativo e discreto. Proibido prometer resultado, citar valores ou gratuidade como chamariz, usar depoimentos de clientes sobre casos, expressões como 'o melhor' ou 'causa ganha', e captação agressiva. No lugar de depoimentos, usar só a nota do Google como dado. Incluir nome do advogado e número da OAB no rodapé." },

  { id: "contabilidade", re: /contab|contador|fiscal|tributar/, termo: "contabilidade", schema: "AccountingService",
    publico: "donos de pequenas empresas, MEIs e profissionais liberais que querem pagar menos imposto dentro da lei e parar de se preocupar com burocracia", dor: "medo de multa, contador que não responde e imposto alto",
    promessa: "contabilidade que responde rápido e explica em português claro", tom: "claro, seguro e prático",
    paleta: ["#FFFFFF", "#F1F5F9", "#0F1E33", "#58677C", "#1D4E89", "#2E9E6B"], fontes: ["Sora (600/700)", "Inter (400/500)"],
    heads: ["Contabilidade que responde e resolve", "Sua empresa em dia, sem dor de cabeça"], cta: "Falar com um contador", waMsg: "Olá! Vim pelo site e quero saber mais sobre os serviços de contabilidade.",
    servicos: ["Abertura de empresa", "Contabilidade mensal", "Troca de contador", "Imposto de Renda", "Folha de pagamento", "Planejamento tributário"],
    difs: ["Resposta no mesmo dia pelo WhatsApp", "Relatórios simples para entender os números", "Troca de contador sem burocracia para você", "Acompanhamento de prazos e obrigações"],
    extras: [["Para quem é", "3 cards: MEI, pequenas empresas, profissionais liberais; cada um com o que resolve."], ["Trocar de contador", "Bloco explicando em 3 passos que a troca é simples."]],
    fotos: [["Hero", "contador(a) explicando um relatório no notebook para um empresário, clima de conversa, escritório claro", "4:5"], ["Serviços", "tela de notebook com gráfico simples (genérico, sem marca), mão apontando", "3:2"], ["Sobre", "equipe do escritório reunida em pé, natural, fundo do escritório", "16:9"], ["Detalhe", "mesa organizada com calculadora, caderno e café", "1:1"], ["Fachada", "entrada do escritório com a placa", "3:2"]],
    motion: "Assinatura: nos números de destaque, contagem animada (0 até o valor em 1,2 s) e um mini gráfico de barras que sobe ao entrar na tela.",
    faq: ["Como funciona a troca de contador?", "Quanto custa abrir uma empresa?", "Vocês atendem MEI?", "O atendimento é online?", "Qual o melhor regime tributário para mim?"] },

  { id: "imobiliaria", re: /imobili|imoveis|corretor/, termo: "imobiliária", schema: "RealEstateAgent",
    publico: "pessoas que querem comprar, vender ou alugar um imóvel na região com segurança", dor: "medo de golpe, burocracia e perder tempo com imóveis que não servem",
    promessa: "imóveis selecionados e acompanhamento do primeiro contato à chave", tom: "confiável, próximo e objetivo",
    paleta: ["#FFFFFF", "#F3F5F4", "#14211C", "#5F6E68", "#17594A", "#C8973E"], fontes: ["Outfit (500/700)", "Inter (400/500)"],
    heads: ["O imóvel certo em {cidade}, sem complicação", "Compre, venda ou alugue com quem conhece a região"], cta: "Falar com um corretor", waMsg: "Olá! Vim pelo site e procuro um imóvel.",
    servicos: ["Venda de imóveis", "Locação residencial", "Locação comercial", "Avaliação de imóvel", "Administração de aluguéis", "Financiamento e documentação"],
    difs: ["Conhecimento dos bairros da região", "Documentação conferida antes da visita", "Atendimento por WhatsApp fora do horário comercial", "Acompanhamento até a entrega das chaves"],
    extras: [["Imóveis em destaque", "Grade de 6 cards (foto, bairro, tipo, quartos, metragem) com botão 'Tenho interesse' que abre o WhatsApp citando o imóvel. Usar imóveis reais enviados pelo cliente."], ["Quero vender ou alugar meu imóvel", "Faixa de captação com CTA próprio para proprietários."]],
    fotos: [["Hero", "sala de estar iluminada de um apartamento real, janela ampla, sem pessoas", "16:9"], ["Destaques", "fachadas e interiores dos imóveis reais do cliente, sempre horizontais e com luz do dia", "3:2"], ["Sobre", "corretor(a) entregando chaves a um casal, foco nas mãos e nas chaves", "3:2"], ["Equipe", "retratos dos corretores, meio corpo, fundo neutro", "4:5"], ["Região", "vista de uma rua ou praça conhecida do bairro", "16:9"]],
    motion: "Assinatura: nos cards de imóvel, a foto dá um zoom lento (1 para 1,05 em 600 ms) e a etiqueta do bairro desliza 4 px no hover.",
    faq: ["Como agendar uma visita?", "Quais documentos preciso para alugar?", "Vocês ajudam com financiamento?", "Quanto custa anunciar meu imóvel?", "Atendem quais bairros?"],
    regras: "Incluir o número do CRECI no rodapé." },

  { id: "academia", re: /academia|crossfit|pilates|fitness|muscula|funcional|studio|box\b|natacao|artes marciais|jiu/, termo: "academia", schema: "ExerciseGym",
    publico: "moradores da região que querem começar ou voltar a treinar e têm receio de não se adaptar", dor: "vergonha de começar, falta de acompanhamento e desistir no segundo mês",
    promessa: "acompanhamento de verdade e um ambiente onde dá vontade de voltar", tom: "energético e encorajador, sem culto ao corpo perfeito",
    paleta: ["#FFFFFF", "#F2F3F5", "#0F1115", "#5C6370", "#C93A0E", "#111827"], fontes: ["Archivo (700/800, largura condensada)", "Inter (400/500)"],
    heads: ["Comece hoje. A gente acompanha você", "Treino com acompanhamento em {cidade}"], cta: "Agendar aula experimental", waMsg: "Olá! Vim pelo site e quero agendar uma aula experimental.",
    servicos: ["Musculação", "Treino funcional", "Aulas coletivas", "Avaliação física", "Personal trainer", "Pilates ou alongamento"],
    difs: ["Aula experimental gratuita", "Professores no salão o tempo todo", "Treino montado para o seu objetivo", "Horários amplos, inclusive cedo e à noite"],
    extras: [["Planos", "3 cards de plano (mensal, trimestral, anual) sem preço se o cliente não autorizar; CTA 'Consultar valores' no WhatsApp."], ["Horários", "Tabela simples de funcionamento e grade de aulas."]],
    fotos: [["Hero", "aluna comum (não modelo fitness) fazendo agachamento com professor orientando ao lado, salão ao fundo", "4:5"], ["Estrutura", "salão de musculação amplo, aparelhos alinhados, sem pessoas", "16:9"], ["Aulas", "turma em aula coletiva, energia alta, rostos naturais", "3:2"], ["Detalhe", "mãos com magnésio segurando a barra", "1:1"], ["Equipe", "professores de uniforme lado a lado, sorrindo", "16:9"], ["Recepção", "entrada com catraca e balcão", "3:2"]],
    motion: "Assinatura: o título do hero entra palavra por palavra de baixo para cima com máscara (60 ms de intervalo), e uma barra de progresso laranja no topo acompanha a rolagem da página.",
    faq: ["Tem aula experimental?", "Quais os horários de funcionamento?", "Nunca treinei, posso começar?", "Tem estacionamento?", "Como funciona a avaliação física?"] },

  { id: "restaurante", re: /restaur|pizz|hamburg|lanch|\bcafe\b|cafeteria|padaria|confeit|\bbar\b|bistr|sushi|japon|churrasc|doceria|sorvet|acai|pastel|marmit|comida|gastro/, termo: "restaurante", schema: "Restaurant",
    publico: "moradores e trabalhadores da região decidindo onde comer hoje, quase sempre pelo celular", dor: "não saber o cardápio, o preço médio nem se entrega",
    promessa: "comida de verdade, cardápio na mão e pedido fácil pelo WhatsApp", tom: "apetitoso, caloroso e direto",
    paleta: ["#FFFCF7", "#F7EFE3", "#241A12", "#75675A", "#B5371F", "#E0A526"], fontes: ["DM Serif Display (400)", "DM Sans (400/500)"],
    heads: ["Feito na hora, do jeito que você gosta", "O sabor que {cidade} recomenda"], cta: "Fazer pedido", waMsg: "Olá! Vim pelo site e quero fazer um pedido.",
    servicos: ["Pratos da casa", "Almoço executivo", "Delivery e retirada", "Sobremesas", "Bebidas", "Encomendas e eventos"],
    difs: ["Ingredientes frescos, preparo na hora", "Pedido direto pelo WhatsApp, sem taxa de aplicativo", "Entrega rápida na região", "Ambiente para a família"],
    extras: [["Cardápio", "Seção principal: categorias em abas (ou âncoras) e itens com nome, descrição curta e preço real enviado pelo cliente. Cada item com botão 'Pedir' que abre o WhatsApp já com o nome do prato."], ["Mais pedidos", "Carrossel horizontal com 4 a 6 pratos campeões, fotos grandes."], ["Horário e entrega", "Dias, horários, bairros atendidos e formas de pagamento."]],
    fotos: [["Hero", "o prato mais vendido da casa visto em ângulo de 45 graus, fumaça leve, mesa de madeira, luz natural lateral", "4:5"], ["Mais pedidos", "cada prato campeão fotografado de cima (flat lay) no mesmo fundo, para a grade ficar uniforme", "1:1"], ["Bastidor", "mãos do cozinheiro finalizando o prato na cozinha", "3:2"], ["Ambiente", "salão com mesas postas, luz quente, sem clientes identificáveis", "16:9"], ["Equipe", "equipe de avental na frente do balcão, sorrindo", "16:9"], ["Fachada", "fachada à noite com o letreiro aceso", "3:2"]],
    motion: "Assinatura: as fotos dos pratos entram com leve rotação (de -2 graus para 0) e escala (0,96 para 1) em 500 ms; no carrossel, arrastar tem inércia e encaixe (scroll-snap).",
    faq: ["Vocês fazem entrega? Em quais bairros?", "Qual o horário de funcionamento?", "Aceitam quais formas de pagamento?", "Tem opção vegetariana?", "Fazem encomendas para eventos?"] },

  { id: "obras", re: /construc|reforma|eletricist|encanad|pintor|pintura|marcenar|moveis planejados|vidracar|serralh|material de constru|engenhar|arquitet|gesso|telhado|climatiza|ar.condicionado|dedetiz|limpeza|chaveiro|jardin|piscina/, termo: "empresa de reformas e serviços", schema: "HomeAndConstructionBusiness",
    publico: "moradores e pequenos comércios que precisam de um serviço bem feito em casa ou no ponto comercial", dor: "profissional que some, obra que atrasa e orçamento que muda no meio",
    promessa: "orçamento claro, prazo combinado e serviço limpo", tom: "prático, confiável e sem enrolação",
    paleta: ["#FFFFFF", "#F4F4F1", "#1B1D1F", "#62676C", "#1E3A5F", "#E08A1E"], fontes: ["Rubik (500/700)", "Rubik (400)"],
    heads: ["Serviço bem feito, no prazo combinado", "Orçamento rápido em {cidade}"], cta: "Pedir orçamento grátis", waMsg: "Olá! Vim pelo site e quero um orçamento.",
    servicos: ["Orçamento e visita técnica", "Instalação", "Manutenção e reparos", "Reformas completas", "Atendimento de emergência", "Serviços para empresas e condomínios"],
    difs: ["Orçamento por escrito antes de começar", "Equipe própria e identificada", "Limpeza do local ao terminar", "Garantia do serviço"],
    extras: [["Trabalhos realizados", "Galeria de antes e depois com controle deslizante (slider) em 3 ou 4 obras reais."], ["Como funciona", "4 passos: contato, visita ou fotos, orçamento, execução."], ["Região atendida", "Lista de bairros e cidades atendidas."]],
    fotos: [["Hero", "profissional uniformizado trabalhando com ferramenta na mão em um ambiente residencial claro, foco no cuidado", "4:5"], ["Antes e depois", "pares de fotos do mesmo ângulo antes e depois do serviço, mesma luz", "3:2"], ["Serviços", "close das mãos executando o serviço principal do ramo", "1:1"], ["Equipe", "equipe com uniforme e veículo da empresa ao fundo", "16:9"], ["Detalhe", "ferramentas organizadas na maleta", "1:1"]],
    motion: "Assinatura: o slider de antes e depois se move sozinho uma vez (de 50% para 65% e volta) quando entra na tela, para ensinar o gesto.",
    faq: ["O orçamento é gratuito?", "Em quanto tempo vocês atendem?", "O serviço tem garantia?", "Atendem quais bairros?", "Quais formas de pagamento?"] },

  { id: "educacao", re: /escola|curso|idioma|ingles|espanhol|autoescola|colegio|reforco|creche|bercario|musica|danca|ballet|informatica|treinamento/, termo: "escola", schema: "EducationalOrganization",
    publico: "alunos e pais da região comparando opções antes de fazer a matrícula", dor: "medo de pagar e não aprender, e falta de clareza sobre método, horários e valores",
    promessa: "método claro, turmas pequenas e aula experimental", tom: "motivador, claro e acolhedor",
    paleta: ["#FFFFFF", "#F2F5FF", "#131A33", "#5A6485", "#2F4BD8", "#F2B33D"], fontes: ["Lexend (500/700)", "Inter (400/500)"],
    heads: ["Aprenda de verdade, no seu ritmo", "Matrículas abertas em {cidade}"], cta: "Agendar aula experimental", waMsg: "Olá! Vim pelo site e quero agendar uma aula experimental.",
    servicos: ["Turmas regulares", "Aulas particulares", "Turmas para crianças", "Curso intensivo", "Aulas online", "Preparatório"],
    difs: ["Aula experimental gratuita", "Turmas pequenas", "Professores qualificados", "Horários flexíveis"],
    extras: [["Como funciona o método", "3 a 4 passos ilustrados com ícones."], ["Cursos e turmas", "Cards por nível ou idade com horários."]],
    fotos: [["Hero", "aluno(a) concentrado e sorrindo em sala clara, professor ao fundo fora de foco", "4:5"], ["Salas", "sala de aula vazia, organizada e iluminada", "16:9"], ["Aula", "turma pequena interagindo com o professor", "3:2"], ["Equipe", "professores em frente à escola", "16:9"], ["Fachada", "entrada da escola com a placa", "3:2"]],
    motion: "Assinatura: os passos do método acendem um a um (número ganha a cor primária) conforme a rolagem.",
    faq: ["Tem aula experimental?", "Quais os horários das turmas?", "Qual a duração do curso?", "Qual a idade mínima?", "Como funciona a matrícula?"] },

  { id: "bemestar", re: /psicolog|terap|nutri|fisioter|massag|quiropr|acupunt|yoga|fonoaud|osteop|\bspa\b/, termo: "consultório", schema: "MedicalBusiness",
    publico: "adultos da região que buscam cuidar da saúde física ou emocional com um profissional de confiança", dor: "insegurança em dar o primeiro passo e dúvida se o profissional é o certo",
    promessa: "atendimento individual, escuta e um plano feito para a pessoa", tom: "sereno, respeitoso e humano",
    paleta: ["#FBFAF6", "#EFF3EC", "#1F2A24", "#66736B", "#3F7A5E", "#D9A441"], fontes: ["Fraunces (500/600)", "Nunito Sans (400/600)"],
    heads: ["Um cuidado feito para você", "Atendimento individual em {cidade}"], cta: "Agendar consulta", waMsg: "Olá! Vim pelo site e gostaria de agendar uma consulta.",
    servicos: ["Primeira consulta e avaliação", "Atendimento individual", "Atendimento online", "Acompanhamento contínuo", "Atendimento para crianças e adolescentes", "Atendimento para casais ou grupos"],
    difs: ["Atendimento individual e sem pressa", "Consultas presenciais e online", "Sigilo e ética profissional", "Agendamento simples pelo WhatsApp"],
    extras: [["Como é a primeira consulta", "Texto curto e acolhedor explicando o primeiro encontro em 3 passos."], ["Para quem é", "Lista de situações em que o atendimento ajuda, escrita na voz do paciente."]],
    fotos: [["Hero", "consultório aconchegante com poltrona, planta e luz natural, sem pessoas", "4:5"], ["Sobre", "retrato do(a) profissional sentado(a), expressão acolhedora, tons neutros", "4:5"], ["Detalhe", "mãos segurando uma xícara ou anotando em um caderno", "1:1"], ["Ambiente", "sala de espera pequena e calma", "3:2"], ["Atendimento", "profissional de costas conversando com paciente não identificável", "3:2"]],
    motion: "Assinatura: tudo mais lento que o padrão (transições de 500 a 700 ms) e um círculo orgânico de fundo no hero que 'respira' (escala 1 para 1,04 em 6 s, em loop suave).",
    faq: ["Como funciona a primeira consulta?", "Atende online?", "Qual a duração de cada sessão?", "Aceita convênio ou emite recibo para reembolso?", "Com que frequência são os atendimentos?"],
    regras: "Profissões de saúde seguem o código de ética do respectivo conselho (CRP, CRN, CREFITO etc.): não prometer cura ou resultado, não usar depoimentos de pacientes como prova (psicologia proíbe) e incluir nome e número de registro do profissional no rodapé." },

  { id: "estetica", re: /estetic|harmoniza|depila|micropigment|sobrancelh|cilios|skin|laser|saude e beleza|rejuvenesc|botox|emagrec/, termo: "clínica de estética", schema: "BeautySalon",
    publico: "mulheres de 25 a 55 anos da região (e um público masculino crescente) que querem se cuidar com segurança e resultado natural", dor: "medo de resultado artificial e de profissional sem qualificação",
    promessa: "resultado natural, avaliação individual e profissionais habilitados", tom: "elegante, sereno e seguro; fala de bem-estar, não de defeitos",
    paleta: ["#FFFBF8", "#F6ECE6", "#2B211E", "#7A6A63", "#9C5B4A", "#C9A27E"], fontes: ["Cormorant Garamond (500/600)", "Jost (400/500)"],
    heads: ["Sua beleza, com resultado natural", "Estética avançada em {cidade}"], cta: "Agendar avaliação", waMsg: "Olá! Vim pelo site e quero agendar uma avaliação.",
    servicos: ["Limpeza de pele profunda", "Harmonização facial", "Toxina botulínica", "Preenchimento labial", "Tratamentos corporais", "Depilação a laser"],
    difs: ["Avaliação individual antes de qualquer procedimento", "Profissionais habilitados", "Produtos e equipamentos com registro na Anvisa", "Acompanhamento após o procedimento"],
    extras: [["Tratamentos faciais e corporais", "Duas abas ou dois blocos, cada um com cards de tratamento (nome, para quem é indicado, duração média)."], ["Resultados", "Galeria discreta de resultados reais, só se o conselho profissional permitir e com autorização."]],
    fotos: [["Hero", "mulher de cerca de 35 anos com pele natural e luminosa, perfil três quartos, luz suave de janela, fundo em tom nude; sem aparência de banco de imagens", "4:5"], ["Tratamentos", "close das mãos da profissional com luvas aplicando produto no rosto da cliente, olhos fechados, clima de calma", "1:1"], ["Tratamentos", "equipamento de estética em uso no corpo, enquadramento fechado e elegante", "1:1"], ["Estrutura", "sala de procedimento impecável, maca, toalhas dobradas, tons claros", "3:2"], ["Sobre", "retrato da profissional responsável de jaleco, meio corpo, fundo da clínica", "4:5"], ["Detalhe", "bancada com produtos alinhados e um ramo verde", "1:1"]],
    motion: "Assinatura: um brilho suave (gradiente claro) atravessa a foto do hero uma vez ao carregar (1,4 s), e as imagens revelam com máscara de baixo para cima (clip-path, 700 ms).",
    faq: ["Como funciona a avaliação?", "Os procedimentos doem?", "Em quanto tempo vejo o resultado?", "Quanto tempo dura o efeito?", "Quais as formas de pagamento?"],
    regras: "Estética e saúde: não prometer resultado, não usar termos como 'definitivo' ou 'sem riscos', e só publicar antes e depois conforme as regras do conselho do profissional responsável e com autorização por escrito. Incluir o nome e o registro do responsável técnico no rodapé." },

  { id: "salao", re: /salao|cabelei|beleza|manicure|nail|esmalter|hair|unhas|maquia|penteado/, termo: "salão de beleza", schema: "BeautySalon",
    publico: "mulheres da região que querem um salão de confiança para cabelo, unhas e produção", dor: "medo de estragar o cabelo e de atraso no atendimento",
    promessa: "profissionais especialistas, hora marcada e resultado como o combinado", tom: "caloroso, feminino e confiante",
    paleta: ["#FFF9F9", "#F9ECEE", "#2A1D22", "#7B6770", "#A8456B", "#D9A7B5"], fontes: ["Playfair Display (500/600)", "Poppins (400/500)"],
    heads: ["Saia do salão do jeito que você imaginou", "Seu salão de confiança em {cidade}"], cta: "Agendar horário", waMsg: "Olá! Vim pelo site e quero agendar um horário.",
    servicos: ["Corte e escova", "Coloração e mechas", "Tratamentos capilares", "Manicure e pedicure", "Design de sobrancelhas", "Penteado e maquiagem"],
    difs: ["Avaliação do cabelo antes de qualquer química", "Hora marcada e pontualidade", "Produtos profissionais", "Especialistas em loiros e mechas"],
    extras: [["Galeria de resultados", "Grade de 6 a 8 fotos reais de clientes (do Instagram do salão), todas no mesmo formato."], ["Dia da noiva", "Faixa opcional para pacotes de noivas e formandas, se o salão oferecer."]],
    fotos: [["Hero", "cliente de costas ou perfil mostrando o cabelo recém-finalizado com brilho, profissional ajeitando as pontas", "4:5"], ["Serviços", "close de mechas sendo feitas com papel alumínio", "1:1"], ["Serviços", "mãos com unhas recém-feitas, cor clássica, fundo claro", "1:1"], ["Ambiente", "bancadas e espelhos iluminados, sem pessoas", "16:9"], ["Equipe", "equipe do salão junta, uniforme, sorrisos naturais", "16:9"], ["Galeria", "resultados reais em fotos quadradas, mesmo enquadramento", "1:1"]],
    motion: "Assinatura: a galeria usa efeito de 'espelho': ao passar o cursor, a foto clareia 6% e ganha uma borda fina rosada que se desenha em 300 ms.",
    faq: ["Preciso agendar com antecedência?", "Fazem avaliação antes da coloração?", "Quais formas de pagamento?", "Atendem noivas e eventos?", "Quanto tempo dura um procedimento de mechas?"] },

  { id: "saude", re: /clinic|medic|consultorio|saude|laborator|oftalmo|dermat|pediatr|cardio|ortoped|ginec|exame|hospital/, termo: "clínica", schema: "MedicalClinic",
    publico: "pacientes e famílias da região que procuram atendimento médico confiável e fácil de agendar", dor: "demora para conseguir consulta e atendimento apressado",
    promessa: "consulta com tempo, agendamento simples e equipe atenciosa", tom: "seguro, claro e humano",
    paleta: ["#FFFFFF", "#F2F6FB", "#12233D", "#5B6B82", "#1F5FBF", "#2BB3A3"], fontes: ["Manrope (600/700)", "Inter (400/500)"],
    heads: ["Cuidado médico com tempo para ouvir você", "Agende sua consulta em {cidade}"], cta: "Agendar consulta", waMsg: "Olá! Vim pelo site e quero agendar uma consulta.",
    servicos: ["Consultas", "Exames", "Check-up", "Retornos e acompanhamento", "Atendimento infantil", "Telemedicina"],
    difs: ["Agendamento rápido pelo WhatsApp", "Consultas sem pressa", "Equipe qualificada", "Estrutura moderna e acessível"],
    extras: [["Especialidades", "Grade de cards com as especialidades reais da clínica."], ["Convênios", "Lista em texto dos convênios aceitos, só os confirmados pelo cliente."]],
    fotos: [["Hero", "médico(a) conversando com paciente sentado, ambos à vontade, consultório claro", "4:5"], ["Estrutura", "consultório ou sala de exame vazia e organizada", "3:2"], ["Recepção", "recepção com atendente sorrindo ao balcão", "16:9"], ["Equipe", "retratos dos profissionais de jaleco, fundo neutro", "4:5"], ["Fachada", "entrada da clínica com a placa", "3:2"]],
    motion: "Assinatura: uma linha de batimento (SVG) discreta se desenha uma única vez sob o título do hero (1 s) e depois fica estática.",
    faq: ["Como agendar uma consulta?", "Quais convênios são aceitos?", "Qual o horário de atendimento?", "Fazem atendimento online?", "O que levar na primeira consulta?"],
    regras: "Publicidade médica segue a Resolução CFM 2.336/2023: informar nome, CRM e RQE do diretor técnico, não prometer resultado e não usar sensacionalismo. Antes e depois só dentro das regras da resolução." },

  { id: "varejo", re: /loja|otica|farmac|boutique|moda|roupa|calcad|joalher|moveis|floricultura|papelaria|presentes|brecho|cosmet|perfum|celular|eletron|bicicle|mercado|emporio|adega/, termo: "loja", schema: "Store",
    publico: "moradores da região que preferem comprar perto de casa, com atendimento de verdade", dor: "não saber o que a loja tem, o preço e se vale a ida",
    promessa: "produtos selecionados e atendimento rápido pelo WhatsApp", tom: "próximo, simples e convidativo",
    paleta: ["#FFFFFF", "#F5F3F0", "#1C1A18", "#6C665F", "#2B2B2B", "#C2553B"], fontes: ["Bricolage Grotesque (600/700)", "Inter (400/500)"],
    heads: ["O que você procura, perto de você", "Sua loja em {cidade}, agora também no WhatsApp"], cta: "Chamar no WhatsApp", waMsg: "Olá! Vim pelo site e quero saber sobre um produto.",
    servicos: ["Novidades", "Mais vendidos", "Promoções", "Encomendas", "Entrega na região", "Atendimento personalizado"],
    difs: ["Atendimento rápido pelo WhatsApp", "Entrega ou retirada na loja", "Troca facilitada", "Parcelamento no cartão"],
    extras: [["Vitrine", "Grade de 8 produtos reais (foto, nome, preço opcional) com botão 'Quero este' que abre o WhatsApp citando o produto."], ["Categorias", "Faixa de categorias em chips ou cards com foto."]],
    fotos: [["Hero", "interior da loja com produtos bem expostos, luz clara, um atendente ao fundo", "16:9"], ["Vitrine", "produtos reais fotografados no mesmo fundo neutro, mesma luz, quadrados", "1:1"], ["Detalhe", "mãos embalando uma compra com capricho", "3:2"], ["Equipe", "equipe atrás do balcão", "16:9"], ["Fachada", "fachada com a vitrine iluminada", "3:2"]],
    motion: "Assinatura: nos cards da vitrine, o botão 'Quero este' sobe 8 px e aparece no hover (no celular fica sempre visível).",
    faq: ["Vocês entregam?", "Quais formas de pagamento?", "Como funciona a troca?", "Qual o horário da loja?", "Fazem encomenda de produtos?"] },

  { id: "generico", re: /.*/, termo: "empresa", schema: "LocalBusiness",
    publico: "moradores e empresas da região que procuram esse serviço no Google e comparam duas ou três opções", dor: "não saber em quem confiar e demora para conseguir resposta",
    promessa: "atendimento rápido, serviço bem feito e contato fácil", tom: "claro, profissional e próximo",
    paleta: ["#FFFFFF", "#F4F6F5", "#17201D", "#5F6B66", "#1F6F5C", "#D9903D"], fontes: ["Plus Jakarta Sans (600/700)", "Inter (400/500)"],
    heads: ["Atendimento de confiança em {cidade}", "Fale com a gente e resolva hoje"], cta: "Falar no WhatsApp", waMsg: "Olá! Vim pelo site e gostaria de mais informações.",
    servicos: ["Serviço principal 1", "Serviço principal 2", "Serviço principal 3", "Atendimento para empresas", "Orçamentos", "Suporte e acompanhamento"],
    difs: ["Resposta rápida pelo WhatsApp", "Atendimento personalizado", "Experiência no ramo", "Compromisso com prazo e qualidade"],
    extras: [["Como funciona", "3 passos: contato, proposta, entrega."]],
    fotos: [["Hero", "profissional da empresa em ação, atendendo um cliente no ambiente real do negócio", "4:5"], ["Serviços", "close do serviço ou produto principal sendo feito ou entregue", "1:1"], ["Ambiente", "espaço da empresa organizado, sem pessoas", "16:9"], ["Equipe", "equipe reunida, natural, com uniforme ou identidade da empresa", "16:9"], ["Fachada", "fachada com a placa", "3:2"]],
    motion: "Assinatura: um sublinhado na cor de acento que se desenha sob a palavra mais importante do título do hero (500 ms, depois da entrada do texto).",
    faq: ["Como peço um orçamento?", "Qual o horário de atendimento?", "Quais formas de pagamento?", "Atendem quais regiões?", "Em quanto tempo recebo retorno?"] },
];
function perfil(l) {
  const alvo = semAcento(`${l.categoria || ""} ${NICHOS[l.nicho]?.[0] || ""} ${l.nome || ""}`);
  return PERFIS.find((p) => p.re.test(alvo));
}

// ---------- mensagens prontas ----------
const VIVO = {
  oficina: { a: "Seu carro", w: ["revisado", "seguro", "no prazo", "sem surpresa"], b: "de verdade.", mq: ["orçamento antes de mexer", "peça com garantia", "prazo cumprido"] },
  odonto: { a: "Seu sorriso", w: ["cuidado", "tranquilo", "confiante", "renovado"], b: "sem pressa.", mq: ["consulta sem medo", "explicação clara", "sorriso natural"] },
  barbearia: { a: "Corte", w: ["no capricho", "na régua", "com hora marcada", "do seu jeito"], b: "toda vez.", mq: ["navalha afiada", "hora marcada", "degradê na régua"] },
  pet: { a: "Seu pet", w: ["cheiroso", "feliz", "bem cuidado", "em boas mãos"], b: "sempre.", mq: ["carinho de verdade", "notícias pelo WhatsApp", "manejo sem estresse"] },
  advocacia: { a: "Seu caso", w: ["ouvido", "explicado", "acompanhado", "bem conduzido"], b: "do início ao fim.", mq: ["orientação clara", "atendimento próximo", "sigilo profissional"] },
  contabilidade: { a: "Sua empresa", w: ["em dia", "organizada", "tranquila", "crescendo"], b: "o ano todo.", mq: ["resposta no mesmo dia", "números que você entende", "imposto sem susto"] },
  imobiliaria: { a: "O imóvel", w: ["certo", "seguro", "do seu jeito", "dos seus planos"], b: "está aqui.", mq: ["documentação conferida", "quem conhece o bairro", "da visita à chave"] },
  academia: { a: "Treino que", w: ["motiva", "acompanha", "desafia", "transforma"], b: "você.", mq: ["professor por perto", "comece hoje", "treino sob medida"] },
  restaurante: { a: "Comida", w: ["feita na hora", "de verdade", "com afeto", "que abraça"], b: "todo dia.", mq: ["ingrediente fresco", "pedido pelo WhatsApp", "sabor da casa"] },
  obras: { a: "Serviço", w: ["bem feito", "no prazo", "limpo", "garantido"], b: "na sua casa.", mq: ["orçamento por escrito", "equipe identificada", "obra sem dor de cabeça"] },
  educacao: { a: "Aprender", w: ["de verdade", "no seu ritmo", "com gosto", "para a vida"], b: "começa aqui.", mq: ["turmas pequenas", "aula experimental", "método claro"] },
  bemestar: { a: "Um cuidado que", w: ["escuta", "acolhe", "respeita", "acompanha"], b: "você.", mq: ["atendimento sem pressa", "escuta de verdade", "um plano só seu"] },
  estetica: { a: "Beleza que", w: ["realça", "respeita", "cuida", "renova"], b: "você.", mq: ["resultado natural", "avaliação individual", "cuidado sem pressa"] },
  salao: { a: "Seu cabelo", w: ["do seu jeito", "com brilho", "bem cuidado", "renovado"], b: "todo dia.", mq: ["hora marcada", "loiros perfeitos", "produto profissional"] },
  saude: { a: "Saúde que", w: ["escuta", "acolhe", "explica", "acompanha"], b: "você.", mq: ["consulta sem pressa", "ciência com afeto", "agendamento simples"] },
  varejo: { a: "O que você procura", w: ["perto", "com carinho", "sem demora", "no capricho"], b: "está aqui.", mq: ["atendimento de verdade", "entrega na região", "escolhido a dedo"] },
  generico: { a: "Atendimento", w: ["rápido", "próximo", "de confiança", "sem enrolação"], b: "de verdade.", mq: ["resposta rápida", "serviço bem feito", "contato fácil"] },
};
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
const RAMO_W = /^(oficina|mecanica|auto|center|centro|barbearia|barber|shop|pet|petshop|restaurante|pizzaria|hamburgueria|lanchonete|padaria|confeitaria|academia|studio|clinica|consultorio|escritorio|loja|salao|espaco|instituto|odontologia|odonto|estetica|advocacia|advogados|contabilidade|imobiliaria|escola|cursos?|bar|cafe|cafeteria|lavacar|lava|jato|funilaria|eletrica|materiais|construcao|veterinaria|veterinario|farmacia|otica|moda|beleza|saude|bem|estar|e|de|da|do|das|dos|em|the|and)$/;
function palavraMarca(l) {
  const ramo = new Set(semAcento(`${l.categoria || ""} ${perfil(l).termo}`).split(/[^a-z]+/));
  const ws = nomeCurto(l).split(/\s+/).filter((w) => /^[\p{L}'&]+$/u.test(w) && !RAMO_W.test(semAcento(w)) && !GENERICAS.test(semAcento(w)) && !ramo.has(semAcento(w)));
  if (!ws.length) return (nomeCurto(l).split(/\s+/).pop() || "marca").toLowerCase();
  const m = ws[0].length <= 4 && ws[1] ? ws[0] + " " + ws[1] : ws[0];
  return m.toLowerCase().slice(0, 18);
}

const hexRgb = (h) => { const n = parseInt(h.replace("#", ""), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const rgbHex = (r) => "#" + r.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => rgbHex(hexRgb(a).map((x, i) => x + (hexRgb(b)[i] - x) * t));
const vec3 = (h) => "vec3(" + hexRgb(h).map((x) => (x / 255).toFixed(3)).join(",") + ")";
const rgbStr = (h) => hexRgb(h).join(",");
const fam = (f) => String(f).replace(/\s*\(.*$/, "").trim();
const slug = (l) => semAcento(nomeCurto(l)).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "site";
const H = (s) => esc(s);

function gerarSite(l, r = {}) {
  l = { ...l, ...(r.whatsapp ? { whatsapp: r.whatsapp } : {}) };
  if (ehRestaurante(l)) {
    const o = ondeFica(l), wa = numeroWhats(l.whatsapp || l.telefone);
    const d = { nome: (r.nome || "").trim() || nomeCurto(l), marca: (r.marca || "").trim() || palavraMarca(l), cidade: o.cidade || "sua cidade", bairro: o.bairro,
      endereco: l.endereco || "", telefone: telBR(l.telefone), telefoneNum: numeroWhats(l.telefone), instagram: l.instagram || "", mapsUrl: l.mapsUrl || "",
      nota: l.nota, avaliacoes: l.avaliacoes, horario: r.horario || "", sobre: (r.sobre || "").trim(), cor: /^#[0-9a-f]{6}$/i.test(r.cor || "") ? r.cor : "",
      logo: r.logo || "", fotos: (r.fotos || []).filter(Boolean), fotoReal: l.foto || "", servicos: (r.servicos || []).filter(Boolean),
      waL: (msg) => wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : "#onde" };
    return { html: renderRestaurante(l, d), faltou: [], arquivo: slug(l), modelo: "restaurante" };
  }
  const p = perfil(l), v = VIVO[p.id] || VIVO.generico, ia = l.siteIA || null, o = ondeFica(l);
  const emp = (r.nome || "").trim() || nomeCurto(l), marca = (r.marca || "").trim().toLowerCase() || palavraMarca(l), cidade = o.cidade || "sua cidade", ramo = rotulo(l) || p.termo;
  const onde = o.bairro ? `${o.bairro}, ${cidade}` : cidade;
  const wa = numeroWhats(l.whatsapp || l.telefone);
  const waL = (msg) => wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : "#contato";
  const temNota = l.nota && l.avaliacoes >= 5, nota = l.nota ? String(l.nota).replace(".", ",") : "";
  const [, claro, ink, muted, primary, accent] = p.paleta;
  const acc = /^#[0-9a-f]{6}$/i.test(r.cor || "") ? r.cor : lum(primary) < 0.12 ? accent : primary, acc2 = acc === primary ? accent : primary;
  const bg = mix(claro, "#ffffff", 0.35), soft = mix(acc, bg, 0.78), accLight = mix(acc, "#ffffff", 0.38);
  const tFont = fam(p.fontes[0]), bFont = fam(p.fontes[1]);
  const cta = p.cta, ctaMsg = p.waMsg;
  const servs = (Array.isArray(r.servicos) && r.servicos.filter(Boolean).length ? r.servicos.filter(Boolean).map((n) => [n, null]) : ia?.servicos?.length ? ia.servicos.map((s) => [s.nome, s.descricao]) : p.servicos.map((s) => [s, null])).slice(0, 6);
  const genS = ["Do jeito certo, do começo ao fim.", "Com atenção de verdade em cada detalhe.", "Feito por quem entende do assunto.", "Caprichado, do jeito que foi combinado.", "Tire suas dúvidas direto no WhatsApp.", "Sem complicação para você."];
  while (servs.length < 6) servs.push(["Atendimento pelo WhatsApp", null]);
  const difs = (ia?.diferenciais?.length ? ia.diferenciais.map((d) => [d.titulo, d.texto]) : p.difs.map((d) => [d, null])).slice(0, 4);
  const genD = ["É assim desde o primeiro contato.", "Porque confiança se constrói nos detalhes.", "Para você ficar tranquilo do começo ao fim.", "Do jeito que a gente gostaria de ser atendido."];
  while (difs.length < 4) difs.push(["Atendimento próximo", null]);
  const sobre = (r.sobre || "").trim() ? H(r.sobre.trim()) : ia?.sobre ? H(ia.sobre).replace(/\[CONFIRMAR[^\]]*\]/g, "")
    : `Somos ${H(emp)}, ${H(ramo.toLowerCase())} ${o.bairro ? "no bairro " + H(o.bairro) : "em " + H(cidade)}. A gente acredita em <em>${H(v.mq[0])}</em> e em ${H(v.mq[1])}. Aqui você encontra ${H(p.promessa)}, do jeito que faz cada cliente <em>voltar</em>.`;
  let s = BASE_REF, faltou = [];
  const R = (de, para, todas) => { if (!s.includes(de)) { faltou.push(de.slice(0, 50)); return; } s = todas ? s.split(de).join(para) : s.replace(de, () => para); };

  // ---- cabeçalho, cores, fontes ----
  R("<title>Aurora — Clínica Integrada</title>", `<title>${H(emp)} | ${H(ramo)} em ${H(cidade)}</title>\n<meta name="robots" content="noindex">`);
  R('content="Clínica Aurora — saúde que se move com você."', `content="${H(emp)}: ${H(p.promessa)}. ${H(onde)}. ${H(cta)} pelo WhatsApp."`);
  R("family=Instrument+Serif:ital@0;1&family=Manrope:wght@300;400;500;600", `family=${encodeURIComponent(tFont).replace(/%20/g, "+")}&family=${encodeURIComponent(bFont).replace(/%20/g, "+")}:wght@400;500;600`);
  R("--bg:#f3f7f7; --ink:#0a2a33; --mute:#5c737a; --acc:#0e9c96; --sage:#cfe5e3;", `--bg:${bg}; --ink:${ink}; --mute:${muted}; --acc:${acc}; --sage:${soft};`);
  R('--serif:"Instrument Serif","Cormorant Garamond",Georgia,serif;', `--serif:"${tFont}",Georgia,serif;`);
  R('--sans:"Manrope",system-ui', `--sans:"${bFont}",system-ui`);
  R("rgba(243,247,247,", `rgba(${rgbStr(bg)},`, true);
  R("rgba(10,42,51,", `rgba(${rgbStr(ink)},`, true);
  R(".w{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .07em .16em;margin:0 -.07em -.16em}", ".w{display:inline-block;overflow:hidden;vertical-align:top;padding:.18em .07em .16em;margin:-.18em -.07em -.16em}");
  R(".hs,.works,.contact{--acc:#58d2c4}", `.hs,.works,.contact{--acc:${accLight}}`);
  R(".card{--acc:#0e9c96}", `.card{--acc:${acc}}`);
  R("#2bb3aa 0,#a8dcd8 60%", `${acc} 0,${mix(acc, bg, 0.6)} 60%`);
  R("#dff1f2,#a9d9dd 55%", `${mix(soft, "#ffffff", 0.5)},${mix(acc, bg, 0.55)} 55%`);
  R("vec3 bone=vec3(.953,.969,.969),sage=vec3(.72,.88,.87),peach=vec3(.7,.85,.94),lil=vec3(.86,.91,.98);",
    `vec3 bone=${vec3(bg)},sage=${vec3(mix(acc, bg, 0.7))},peach=${vec3(mix(acc2, bg, 0.6))},lil=${vec3(mix(acc, bg, 0.85))};`);
  R("col=mix(col,vec3(.45,.82,.8),.38", `col=mix(col,${vec3(mix(acc, "#ffffff", 0.3))},.38`);
  R("vec3 oc=mix(vec3(.03,.5,.52),vec3(.6,.9,.87)", `vec3 oc=mix(${vec3(mix(acc, "#000000", 0.25))},${vec3(mix(acc, "#ffffff", 0.55))}`);
  R("oc=mix(oc,vec3(.26,.56,.86)", `oc=mix(oc,${vec3(acc2)}`);
  R("oc=oc*(.6+.52*df)+sp*.75+fr*vec3(.93,1.,1.)*.7;", `oc=oc*(.6+.52*df)+sp*.75+fr*${vec3(mix(bg, "#ffffff", 0.5))}*.7;`);
  const gfs = Math.min(29, Math.round((29 * 6) / Math.max(marca.length, 6)));
  R("font-size:clamp(5rem,29vw,34rem)", `font-size:clamp(3rem,${gfs}vw,34rem)`);

  // ---- preloader, navegação ----
  R("<span>Aurora — respirando</span>", `<span>${H(emp)} · carregando</span>`);
  R('aurora<sup>®</sup>', r.logo ? `<img src="${H(r.logo)}" alt="${H(emp)}" style="height:38px;width:auto;display:block">` : H(marca));
  R('<span>Quem somos</span><span>Quem somos</span>', "<span>Sobre</span><span>Sobre</span>");
  R('<span>Especialidades</span><span>Especialidades</span>', "<span>Serviços</span><span>Serviços</span>");
  R('<span>Trabalhos</span><span>Trabalhos</span>', "<span>Por que a gente</span><span>Por que a gente</span>");
  R('<a href="#contato" class="pill magnet">Agendar →</a>', `<a href="${waL(ctaMsg)}" target="_blank" rel="noopener" class="pill magnet">${H(cta)} →</a>`);

  // ---- hero ----
  R('<div class="chip c1" data-depth="22"><div><i class="dot"></i>Aberto agora <span>· até 21h</span></div></div>',
    `<div class="chip c1" data-depth="22"><div><i class="dot"></i>Atendimento <span>· ${(r.horario || "").trim() ? H(r.horario.trim().split("\n")[0]) : "pelo WhatsApp"}</span></div></div>`);
  R('<div class="chip c2" data-depth="-34"><div><b>4,9</b><span>★★★★★<br>1.284 avaliações</span></div></div>',
    temNota ? `<div class="chip c2" data-depth="-34"><div><b>${nota}</b><span>★★★★★<br>${Number(l.avaliacoes).toLocaleString("pt-BR")} avaliações no Google</span></div></div>`
      : `<div class="chip c2" data-depth="-34"><div><span>${H(ramo)}<br>${H(cidade)}</span></div></div>`);
  R('<a href="#contato" class="badge magnet" data-cursor="agendar" aria-label="Agendar consulta">',
    `<a href="${waL(ctaMsg)}" target="_blank" rel="noopener" class="badge magnet" data-cursor="${H(cta.split(" ")[0].toLowerCase())}" aria-label="${H(cta)}">`);
  R("agende sua consulta ✳ agende sua consulta ✳ ", `${H(cta.toLowerCase())} ✳ ${H(cta.toLowerCase())} ✳ `);
  R('<span class="row" data-split>Saúde que</span>', `<span class="row" data-split>${H(v.a)}</span>`);
  R("<i>respira</i><i>escuta</i><i>acolhe</i><i>se move</i>", v.w.map((w) => `<i>${H(w)}</i>`).join(""));
  R('<span class="row" data-split>com você.</span>', `<span class="row" data-split>${H(v.b)}</span>`);
  R('<div class="chip c3" data-depth="16"><div><span>Próximo horário</span><b>hoje, 16:40</b></div></div>',
    `<div class="chip c3" data-depth="16"><div><span>Onde estamos</span><b>${H(o.bairro || cidade)}</b></div></div>`);
  R("Texto de exemplo só para ocupar o espaço: uma clínica integrada onde ciência, calma e um bom café convivem no mesmo corredor.",
    H(ia?.subheadline || `${p.promessa.charAt(0).toUpperCase() + p.promessa.slice(1)}. ${o.bairro ? "No bairro " + o.bairro + ", " + cidade : "Em " + cidade}.`));
  R('<a href="#contato" class="send ink magnet"><span>Agendar consulta</span><i>→</i></a><a href="#servicos" class="link">Ver especialidades</a>',
    `<a href="${waL(ctaMsg)}" target="_blank" rel="noopener" class="send ink magnet" data-evento="whatsapp_hero"><span>${H(cta)}</span><i>→</i></a><a href="#servicos" class="link">Ver serviços</a>`);

  // ---- marquee ----
  R("<span>cuidado sem pressa</span><span>ciência com afeto</span><span>corpo em movimento</span><span>mente em silêncio</span>",
    [...new Set(v.mq.concat([p.promessa.split(",")[0]]).map((x) => x.toLowerCase()))].map((x) => `<span>${H(x)}</span>`).join(""));
  R("<span>clínica geral</span><span>dermatologia</span><span>fisioterapia</span><span>nutrição</span><span>psicologia</span>",
    servs.slice(0, 5).map(([n]) => `<span>${H(n.toLowerCase())}</span>`).join(""));

  // ---- sobre e números ----
  R(s.slice(s.indexOf('<p class="scrub" id="scrub">'), s.indexOf("</p>", s.indexOf('<p class="scrub" id="scrub">')) + 4), `<p class="scrub" id="scrub">${sobre}</p>`);
  const stats = [];
  if (temNota) stats.push([String(l.nota).replace(".", ","), "nota no Google", null], [l.avaliacoes, "avaliações no Google", l.avaliacoes]);
  const ini = s.indexOf('<div class="stats">'), fim = s.indexOf("</div>\n\n<!-- COM O QUE TRABALHAMOS -->");
  if (ini > 0 && fim > ini) s = s.slice(0, ini) + (stats.length ? `<div class="stats" style="grid-template-columns:repeat(${stats.length},1fr)">\n${stats.map(([t, r, c]) => `  <div class="stat"><b${c ? ` data-count="${c}"` : ""}>${c ? 0 : H(t)}</b><span>${H(r)}</span></div>`).join("\n")}\n` : `<div class="stats" hidden>\n`) + s.slice(fim);
  else faltou.push("stats");

  // ---- serviços (rolagem horizontal) ----
  const svgs = [...BASE_REF.matchAll(/<svg viewBox="0 0 100 100"[^>]*>[\s\S]*?<\/svg>/g)].map((m) => m[0]).filter((x) => !x.includes("textPath")).slice(0, 6);
  const tIni = s.indexOf('<div class="track" id="track">'), tFim = s.indexOf('<div class="hs-bar">');
  const jeito = p.id === "restaurante" ? "matar a sua <em>fome</em>" : p.id === "oficina" ? "cuidar do seu <em>carro</em>" : p.id === "pet" ? "cuidar do seu <em>pet</em>" : ["contabilidade", "advocacia", "obras"].includes(p.id) ? "resolver para <em>você</em>" : "cuidar de <em>você</em>";
  if (tIni > 0 && tFim > tIni) s = s.slice(0, tIni) + `<div class="track" id="track">
      <div class="panel intro">
        <div class="eyebrow" style="color:rgba(${rgbStr(bg)},.6)">O que a gente faz</div>
        <h2>Seis jeitos de ${jeito}.</h2>
        <p>Continue rolando: a página anda de lado. Toque em um serviço para chamar no WhatsApp.</p>
      </div>
${servs.map(([n, d], i) => `      <article class="panel" data-cursor="chamar" data-wa="${H(waL(`Olá! Vim pelo site e quero saber sobre ${n}.`))}" role="link" tabindex="0">
        <span class="num">0${i + 1}</span>
        ${svgs[i] || ""}
        <div><h3>${H(n)}</h3><p>${H(d || genS[i])}</p><div class="tags"><i>whatsapp</i><i>${H((o.bairro || cidade).toLowerCase())}</i></div></div>
      </article>`).join("\n")}
    </div>
    ` + s.slice(tFim);
  else faltou.push("track");

  // ---- por que a gente (cartões) ----
  R('<div><div class="eyebrow">Nossos trabalhos feitos</div><h2 data-split>Histórias que <em>deram certo.</em></h2></div>',
    `<div><div class="eyebrow">Por que ${H(emp)}</div><h2 data-split>Motivos para <em>${p.id === "restaurante" ? "voltar sempre." : "confiar."}</em></h2></div>`);
  R('<p class="fade">Casos inventados para preencher o layout. Passe o mouse — os cartões têm vida própria.</p>',
    `<p class="fade">${H(p.promessa.charAt(0).toUpperCase() + p.promessa.slice(1))}. Role para ver.</p>`);
  const cores = [
    `--i:0;--c1:${soft};--c2:${mix(soft, "#ffffff", 0.6)};--o1:${acc};--o2:${acc2}`,
    `--i:1;--c1:${mix(acc2, bg, 0.75)};--c2:${mix(acc2, "#ffffff", 0.85)};--o1:${acc2};--o2:${mix(acc, "#ffffff", 0.3)}`,
    `--i:2;--c1:${mix(ink, acc, 0.18)};--ct:${bg};--c2:${mix(ink, "#000000", 0.25)};--o1:${accLight};--o2:${acc2};--cn:${bg};--bm:normal`,
    `--i:3;--c1:${mix(acc2, bg, 0.82)};--c2:${bg};--o1:${acc};--o2:${mix(acc2, "#ffffff", 0.3)}`];
  const cIni = s.indexOf('  <article class="card"'), cFim = s.indexOf("</section>", cIni);
  if (cIni > 0) s = s.slice(0, cIni) + difs.map(([t, d], i) => `  <article class="card" style="${cores[i]}" data-cursor="chamar">
    <div class="card-in">
      <div class="card-info"><small>Motivo ${i + 1} de 4</small><div><h3>${H(t)}</h3><p>${H(d || genD[i])}</p></div><dl><div><dt>0${i + 1}</dt><dd>de 04</dd></div><div><dt>${H((o.bairro || cidade).split(" ")[0])}</dt><dd>${H(cidade)}</dd></div></dl></div>
      <div class="art"${r.fotos?.[i] ? ` style="background:center/cover url('${H(r.fotos[i])}')"` : ""}>${r.fotos?.[i] ? "" : "<u></u><u></u>"}<b>0${i + 1}</b><span>${H(emp)}</span></div>
    </div>
  </article>`).join("\n") + "\n" + s.slice(cFim);
  else faltou.push("cards");

  // ---- contato ----
  R('<div class="field"><input id="f2" type="tel" placeholder=" " required autocomplete="tel"><label for="f2">WhatsApp</label></div>', "");
  R('<span id="sendtxt">Quero agendar</span>', `<span id="sendtxt">${H(cta)}</span>`);
  const info = [["Endereço", H(l.endereco || onde)], ["Horários", (r.horario || "").trim() ? H(r.horario.trim()).replace(/\n/g, "<br>") : "Pelo WhatsApp<br>Horários sob consulta"]];
  if (l.telefone) info.push(["Telefone", `<a href="tel:+${numeroWhats(l.telefone)}">${H(telBR(l.telefone))}</a>`]);
  if (l.email) info.push(["E-mail", `<a href="mailto:${H(l.email)}">${H(l.email)}</a>`]);
  else if (l.instagram) info.push(["Instagram", `<a href="https://instagram.com/${H(l.instagram.replace("@", ""))}" target="_blank" rel="noopener">${H(l.instagram)}</a>`]);
  const iIni = s.indexOf('<div class="info fade">'), iFim = s.indexOf("</div>\n    </div>\n    <div class=\"map-wrap\">");
  if (iIni > 0 && iFim > iIni) s = s.slice(0, iIni) + `<div class="info fade">\n${info.map(([k, val]) => `        <div><small>${k}</small>${val}</div>`).join("\n")}\n      ` + s.slice(iFim);
  else faltou.push("info");
  R('title="Mapa — Clínica Aurora"', `title="Mapa — ${H(emp)}"`);
  R("https://www.google.com/maps?q=Avenida+Paulista+1000+S%C3%A3o+Paulo&z=15&output=embed", `https://www.google.com/maps?q=${encodeURIComponent(l.endereco || l.nome + " " + cidade)}&z=15&output=embed`);
  R('<span class="map-tag">−23.5647, −46.6527</span>', `<span class="map-tag">${H(onde)}</span>`);

  // ---- rodapé ----
  R("<p>Um lugar calmo no meio da avenida mais barulhenta da cidade.</p>", `<p>${H(p.promessa.charAt(0).toUpperCase() + p.promessa.slice(1))}.</p>`);
  R('<a href="#sobre">Quem somos</a><a href="#servicos">Especialidades</a><a href="#trabalhos">Trabalhos</a>', '<a href="#sobre">Sobre</a><a href="#servicos">Serviços</a><a href="#trabalhos">Por que a gente</a>');
  R('<a href="#">Instagram</a><a href="#">LinkedIn</a><a href="#">YouTube</a>',
    (l.instagram ? `<a href="https://instagram.com/${H(l.instagram.replace("@", ""))}" target="_blank" rel="noopener">Instagram</a>` : "") + (wa ? `<a href="${waL(ctaMsg)}" target="_blank" rel="noopener">WhatsApp</a>` : "") + (l.mapsUrl ? `<a href="${H(l.mapsUrl)}" target="_blank" rel="noopener">Google Maps</a>` : ""));
  R("<small>Agora em São Paulo</small>", `<small>Agora em ${H(cidade)}</small>`);
  R('aria-label="aurora"', `aria-label="${H(marca)}"`);
  R("'aurora'.split('')", `${JSON.stringify(marca)}.split('')`);
  R("© 2026 Clínica Aurora · site demonstrativo, textos fictícios", `© ${new Date().getFullYear()} ${H(l.nome)}`);

  // ---- comportamento: formulário e serviços abrem o WhatsApp; botão flutuante ----
  R("e.preventDefault(); $('#sendtxt').textContent = 'Recebido — já te chamamos ✓'; e.target.reset();",
    `e.preventDefault(); const nome = $('#f1').value.trim(), msg = $('#f3').value.trim();
  window.open(${JSON.stringify(wa ? "https://wa.me/" + wa + "?text=" : "#")} + encodeURIComponent('Olá! Sou ' + nome + '. ' + msg + ' (vim pelo site)'), '_blank', 'noopener');`);
  R("$('#top').addEventListener", `$$('[data-wa]').forEach(el => { const go = () => window.open(el.dataset.wa, '_blank', 'noopener'); el.addEventListener('click', go); el.addEventListener('keydown', e => e.key === 'Enter' && go()); });
$('#top').addEventListener`);
  R("@media (prefers-reduced-motion:reduce){", `.wa-float{position:fixed;right:20px;bottom:20px;z-index:85;width:58px;height:58px;border-radius:50%;background:#25D366;display:grid;place-items:center;box-shadow:0 12px 30px -10px rgba(0,0,0,.45);transform:scale(.6);opacity:0;transition:transform .3s var(--ease),opacity .3s}
body:not(.loading) .wa-float{transform:none;opacity:1;transition-delay:1.8s}
.wa-float svg{width:30px;height:30px;fill:#fff}
@media (prefers-reduced-motion:reduce){`);
  R("</body>", `${wa ? `<a class="wa-float magnet" href="${waL(ctaMsg)}" target="_blank" rel="noopener" aria-label="Chamar no WhatsApp" data-evento="whatsapp_flutuante"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg></a>\n` : ""}</body>`);
  if (faltou.length) console.warn("gerarSite: trechos do molde não encontrados", faltou);
  return { html: s, faltou, arquivo: slug(l) };
}

export { ehRestaurante, destaquesPadrao };
export { gerarSite, perfil, nomeCurto, palavraMarca, ondeFica, slug, numeroWhats, PERFIS, VIVO, semAcento, RAMO_W, GENERICAS };
