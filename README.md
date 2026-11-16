# 📡 Radar de Leads

Encontra empresas no **Google Maps**, visita os sites delas para achar **WhatsApp, e-mail e Instagram**, e destaca quem **não tem site** (ou só tem Instagram/link na bio): os melhores clientes para quem vende criação de sites.

## Como usar no seu computador
1. Instale o [Node.js](https://nodejs.org) (botão LTS). Só na primeira vez.
2. Baixe o projeto (botão verde **Code** → **Download ZIP**) e descompacte.
3. Dê dois cliques em **Iniciar Radar.bat** (Windows) ou **Iniciar Radar.command** (Mac).

Na primeira vez ele instala tudo sozinho (alguns minutos). Depois abre o navegador em **http://localhost:8090**.
Deixe a janela preta aberta enquanto usa; para desligar, feche a janela.

Pelo terminal, se preferir: `npm run setup` (uma vez) e `npm start`.

1. **Nova busca**: escolha o que procura (ex.: `clínicas de estética, academias`), cidade e tamanho (Rápida ~20, Padrão 60, Completa 120, Cidade inteira até 400).
2. A busca roda em segundo plano: lê nome, telefone, endereço, nota e avaliações no Maps e visita cada site (home + página de contato).
3. Na tabela, os **Canais** mostram WhatsApp, e-mail, site e Instagram. Círculo tracejado vermelho = **sem site**; amarelo = **só rede social**.
4. Clique num lead: veja os detalhes, gere a mensagem de abordagem e abra direto no WhatsApp. O lead vai para "Contatado" e o retorno é agendado.
5. **Funil de vendas** (Kanban), **Follow-ups** e exportação em **CSV**.

### Pontuação (0–100)
Sem site +35 · só rede social +30 · WhatsApp +20 (ou telefone +10) · rede social +8 · e-mail +5 · avaliações até +15 · nota ≥ 4,5 +5.
Quente ≥ 60, morno ≥ 40.

### Mensagens com IA (opcional)
Cole sua chave da API Claude em **Configurações** (ou defina `ANTHROPIC_API_KEY`). Sem chave, o app usa um modelo de mensagem pronto.

### Dados
Tudo fica em `data/db.json`, só no seu computador. O servidor só aceita conexões do próprio computador.

### Observações
- A leitura do Google Maps depende da página do Google: se ele mudar o layout, a busca pode parar de achar campos.
- Ler o Maps automaticamente vai contra os termos de uso do Google. Use com moderação (o app já espera entre uma empresa e outra) e por sua conta.
- `RADAR_HEADFUL=1 npm start` mostra o navegador trabalhando.

## Enviar para o Claude (usar no celular)
1. No programa, filtre os leads e clique em **Enviar ao Claude**: os leads são copiados e um arquivo `radar-leads-AAAA-MM-DD.json` é baixado.
2. O Radar no Claude abre (https://claude.ai/artifact/ERs5tuq5h5d897HRbZSsLp). Em **Importar do PC**, cole (Ctrl+V) ou escolha o arquivo.
3. Os leads ficam salvos na sua conta Claude: abra o mesmo link no celular, gere a mensagem com IA (sem chave de API) e mande pelo WhatsApp.

Importar de novo atualiza os dados (telefone, site, nota) sem apagar etapa, anotações e mensagens.
O código do artefato está em `artifact/radar-de-leads.html`.
