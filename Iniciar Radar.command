#!/bin/bash
# Mac / Linux: dois cliques (Mac) ou  bash "Iniciar Radar.command"
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null; then
  echo "O Node.js não está instalado. Baixe em https://nodejs.org (botão LTS), instale e abra este arquivo de novo."
  read -r -p "Aperte Enter para fechar."; exit 1
fi
if [ ! -d node_modules/playwright ]; then
  echo "Primeira vez: instalando o programa. Leva alguns minutos..."
  npm install --no-audit --no-fund && npx playwright install chromium || { echo "A instalação falhou. Confira sua internet e tente de novo."; read -r -p "Enter para fechar."; exit 1; }
fi
echo "Radar de Leads ligado em http://localhost:8090 (deixe esta janela aberta; Ctrl+C desliga)"
(sleep 3; (open http://localhost:8090 || xdg-open http://localhost:8090) >/dev/null 2>&1) &
node src/server.js
