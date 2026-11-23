#!/bin/bash
# Faz o Radar de Leads ligar sozinho quando o Mac inicia (sem janela) e abre no navegador.
cd "$(dirname "$0")" || exit 1
NODE="$(command -v node)"
if [ -z "$NODE" ] || ! node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)"; then
  echo "Instale o Node.js 22.13 ou mais novo (versão LTS) em https://nodejs.org e abra de novo."; read -r -p "Enter para fechar."; exit 1
fi
[ -d node_modules/playwright ] || { npm install --no-audit --no-fund && npx playwright install chromium; } || { echo "A instalação falhou."; exit 1; }
PLIST="$HOME/Library/LaunchAgents/com.radardeleads.servidor.plist"
mkdir -p "$HOME/Library/LaunchAgents" "$HOME/RadarDeLeads"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.radardeleads.servidor</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>src/server.js</string></array>
  <key>WorkingDirectory</key><string>$(pwd)</string>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$HOME/RadarDeLeads/servidor.log</string>
  <key>StandardErrorPath</key><string>$HOME/RadarDeLeads/servidor.log</string>
</dict></plist>
PL
launchctl unload "$PLIST" 2>/dev/null; launchctl load "$PLIST"
sleep 3; open http://localhost:8090
echo "Pronto! O Radar de Leads agora liga sozinho com o Mac. Para parar: launchctl unload \"$PLIST\" && rm \"$PLIST\""
