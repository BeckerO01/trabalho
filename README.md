# 📡 Radar de Leads

Rastreador de leads para quem vende criação de sites: encontra **negócios locais sem site**, dá uma nota a cada um e acompanha o contato até a venda.

## Como usar
Abra o `index.html` por um servidor estático (ex.: `python3 -m http.server`) ou publique no GitHub Pages.

1. **Buscar** – cidade + nicho → lista negócios do OpenStreetMap sem site cadastrado.
2. **Pontuação (0–100)** – WhatsApp/telefone, redes sociais, e-mail, horário, endereço e valor do nicho. Quente ≥ 65, Morno ≥ 40.
3. **Funil Kanban** – Novo → Contatado → Negociando → Fechado/Perdido (arrastar e soltar).
4. **Mensagem de abordagem** – gerada pelo Claude (chave opcional em Configurações) ou por modelo pronto; abre direto no WhatsApp.
5. **Follow-ups** – ao marcar "Contatado", agenda retorno automático (padrão: 3 dias) e avisa quando vencer.

Dados ficam no `localStorage` do navegador; exporte em CSV quando quiser.

> Nem todo negócio sem site no OpenStreetMap realmente não tem site — use "Conferir no Google" antes de abordar.
